import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'node:url'

import { createApp } from '../src/main.js'

try {
  process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)))
}
catch {
  // The test runner may inject envs directly.
}

function normalizeDatabaseUrl(value: string | undefined): string | undefined {
  if (!value) {
    return value
  }

  try {
    new URL(value)
    return value
  }
  catch {
    const match = value.match(/^(postgres(?:ql)?):\/\/([^:]+):([^@]+)@(.*)$/)

    if (!match) {
      return value
    }

    const [, protocol, user, password, rest] = match
    return `${protocol}://${user}:${encodeURIComponent(password)}@${rest}`
  }
}

process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL)
process.env.DIRECT_URL = normalizeDatabaseUrl(process.env.DIRECT_URL)
process.env.SHADOW_DATABASE_URL = normalizeDatabaseUrl(process.env.SHADOW_DATABASE_URL)

const prisma = new PrismaClient()
const TEST_EMAIL_PREFIX = `auth-bootstrap-${Date.now()}`
const TEST_PASSWORD = 'Passw0rd!123'

function createRegisterPayload(suffix: string) {
  return {
    username: `traveler-${suffix}`,
    email: `${TEST_EMAIL_PREFIX}-${suffix}@example.com`,
    password: TEST_PASSWORD,
  }
}

function readSetCookie(response: { headers: Record<string, string | string[] | number | undefined> }) {
  const header = response.headers['set-cookie']

  if (Array.isArray(header)) {
    return header[0] ?? null
  }

  return typeof header === 'string' ? header : null
}

function extractSidCookie(setCookieHeader: string | null) {
  const match = setCookieHeader?.match(/sid=[^;]*/)
  return match?.[0] ?? null
}

const currentUserRecord = {
  placeId: `auth-bootstrap-place-${Date.now()}`,
  boundaryId: 'boundary-auth-bootstrap-001',
  placeKind: 'CN_ADMIN',
  datasetVersion: 'v5.0-test',
  displayName: '引导恢复地点',
  regionSystem: 'CN',
  adminType: 'MUNICIPALITY',
  typeLabel: '直辖市',
  parentLabel: '中国',
  subtitle: '中国 · 直辖市',
} as const

const overseasCurrentUserRecord = {
  placeId: 'jp-tokyo',
  boundaryId: 'ne-admin1-jp-tokyo',
  placeKind: 'OVERSEAS_ADMIN1',
  datasetVersion: '2026-04-02-geo-v2',
  displayName: 'Tokyo',
  regionSystem: 'OVERSEAS',
  adminType: 'ADMIN1',
  typeLabel: '一级行政区',
  parentLabel: 'Japan',
  subtitle: 'Japan · 一级行政区',
} as const

describe('Auth bootstrap API', () => {
  let app: NestFastifyApplication

  beforeAll(async () => {
    app = await createApp()
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await prisma.authSession.deleteMany({
      where: {
        user: {
          email: {
            startsWith: TEST_EMAIL_PREFIX,
          },
        },
      },
    })
    await prisma.userTravelRecord.deleteMany({
      where: {
        user: {
          email: {
            startsWith: TEST_EMAIL_PREFIX,
          },
        },
      },
    })
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: TEST_EMAIL_PREFIX,
        },
      },
    })
    await prisma.travelRecord.deleteMany({
      where: {
        placeId: currentUserRecord.placeId,
      },
    })
  })

  afterAll(async () => {
    await prisma.authSession.deleteMany({
      where: {
        user: {
          email: {
            startsWith: TEST_EMAIL_PREFIX,
          },
        },
      },
    })
    await prisma.userTravelRecord.deleteMany({
      where: {
        user: {
          email: {
            startsWith: TEST_EMAIL_PREFIX,
          },
        },
      },
    })
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: TEST_EMAIL_PREFIX,
        },
      },
    })
    await prisma.travelRecord.deleteMany({
      where: {
        placeId: currentUserRecord.placeId,
      },
    })
    await prisma.$disconnect()
    await app.close()
  })

  it('GET /auth/bootstrap returns 200 authenticated: false when sid cookie is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ authenticated: false })
  })

  it('GET /auth/bootstrap returns 200 authenticated: true with current user records', async () => {
    const payload = createRegisterPayload('valid-sid')
    const registerResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload,
    })

    expect(registerResponse.statusCode).toBe(201)
    const sidCookie = extractSidCookie(readSetCookie(registerResponse))
    expect(sidCookie).toBeTruthy()

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    expect(user).toBeTruthy()

    await prisma.userTravelRecord.create({
      data: {
        userId: user!.id,
        ...currentUserRecord,
      },
    })

    await prisma.travelRecord.create({
      data: {
        ...currentUserRecord,
      },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
      headers: {
        cookie: sidCookie!,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      authenticated: true,
      user: {
        id: expect.any(String),
        username: payload.username,
        email: payload.email,
        createdAt: expect.any(String),
      },
      records: [
        {
          id: expect.any(String),
          ...currentUserRecord,
          createdAt: expect.any(String),
        },
      ],
    })
  })

  it('GET /auth/bootstrap replays persisted overseas text fields without recomputing them', async () => {
    const payload = createRegisterPayload('overseas-record')
    const registerResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload,
    })

    expect(registerResponse.statusCode).toBe(201)
    const sidCookie = extractSidCookie(readSetCookie(registerResponse))
    expect(sidCookie).toBeTruthy()

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    expect(user).toBeTruthy()

    await prisma.userTravelRecord.create({
      data: {
        userId: user!.id,
        ...overseasCurrentUserRecord,
      },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
      headers: {
        cookie: sidCookie!,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      authenticated: true,
      records: [
        expect.objectContaining({
          placeId: 'jp-tokyo',
          displayName: 'Tokyo',
          typeLabel: '一级行政区',
          subtitle: 'Japan · 一级行政区',
        }),
      ],
    })
  })

  it('GET /auth/bootstrap clear invalid sid cookie and returns authenticated: false for expired or missing session', async () => {
    const payload = createRegisterPayload('expired-sid')
    const registerResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload,
    })

    expect(registerResponse.statusCode).toBe(201)

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    expect(user).toBeTruthy()

    const expiredSession = await prisma.authSession.create({
      data: {
        userId: user!.id,
        expiresAt: new Date(Date.now() - 60_000),
      },
    })

    const expiredResponse = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
      headers: {
        cookie: `sid=${expiredSession.id}`,
      },
    })

    expect(expiredResponse.statusCode).toBe(200)
    expect(expiredResponse.json()).toEqual({ authenticated: false })
    expect(readSetCookie(expiredResponse)).toContain('sid=')
    expect(readSetCookie(expiredResponse)).toContain('Max-Age=0')

    const missingResponse = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
      headers: {
        cookie: 'sid=missing-bootstrap-session',
      },
    })

    expect(missingResponse.statusCode).toBe(200)
    expect(missingResponse.json()).toEqual({ authenticated: false })
    expect(readSetCookie(missingResponse)).toContain('sid=')
    expect(readSetCookie(missingResponse)).toContain('Max-Age=0')
  })

  it('GET /auth/bootstrap supports multiple session recovery and logout only clears the current device session', async () => {
    const payload = createRegisterPayload('multiple-session')
    const registerResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload,
    })

    expect(registerResponse.statusCode).toBe(201)
    const firstSidCookie = extractSidCookie(readSetCookie(registerResponse))
    expect(firstSidCookie).toBeTruthy()

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: payload.email,
        password: payload.password,
      },
    })

    expect(loginResponse.statusCode).toBe(200)
    const secondSidCookie = extractSidCookie(readSetCookie(loginResponse))
    expect(secondSidCookie).toBeTruthy()
    expect(secondSidCookie).not.toBe(firstSidCookie)

    const firstBootstrapResponse = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
      headers: {
        cookie: firstSidCookie!,
      },
    })

    const secondBootstrapResponse = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
      headers: {
        cookie: secondSidCookie!,
      },
    })

    expect(firstBootstrapResponse.statusCode).toBe(200)
    expect(firstBootstrapResponse.json()).toMatchObject({
      authenticated: true,
      user: {
        email: payload.email,
      },
      records: [],
    })
    expect(secondBootstrapResponse.statusCode).toBe(200)
    expect(secondBootstrapResponse.json()).toMatchObject({
      authenticated: true,
      user: {
        email: payload.email,
      },
      records: [],
    })

    const logoutResponse = await app.inject({
      method: 'POST',
      url: '/auth/logout',
      headers: {
        cookie: firstSidCookie!,
      },
    })

    expect(logoutResponse.statusCode).toBe(204)

    const loggedOutBootstrapResponse = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
      headers: {
        cookie: firstSidCookie!,
      },
    })

    expect(loggedOutBootstrapResponse.statusCode).toBe(200)
    expect(loggedOutBootstrapResponse.json()).toEqual({ authenticated: false })

    const otherDeviceBootstrapResponse = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
      headers: {
        cookie: secondSidCookie!,
      },
    })

    expect(otherDeviceBootstrapResponse.statusCode).toBe(200)
    expect(otherDeviceBootstrapResponse.json()).toMatchObject({
      authenticated: true,
      user: {
        email: payload.email,
      },
      records: [],
    })
  })
})
