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
const TEST_EMAIL_PREFIX = `auth-session-${Date.now()}`
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

describe('Auth session API', () => {
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
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: TEST_EMAIL_PREFIX,
        },
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
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: TEST_EMAIL_PREFIX,
        },
      },
    })
    await prisma.$disconnect()
    await app.close()
  })

  it('POST /auth/register returns 201 with user summary and Set-Cookie: sid', async () => {
    const payload = createRegisterPayload('register-success')
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload,
    })

    expect(response.statusCode).toBe(201)
    expect(readSetCookie(response)).toContain('sid=')
    expect(response.json()).toEqual({
      user: {
        id: expect.any(String),
        username: payload.username,
        email: payload.email,
        createdAt: expect.any(String),
      },
    })
    expect(response.json()).not.toHaveProperty('passwordHash')
    expect(response.json().user).not.toHaveProperty('passwordHash')
  })

  it('POST /auth/register rejects fields outside username/email/password', async () => {
    const payload = createRegisterPayload('register-extra-field')
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        ...payload,
        rememberMe: true,
      },
    })

    expect(response.statusCode).toBe(400)
  })

  it('POST /auth/register returns 409 for duplicate email', async () => {
    const payload = createRegisterPayload('duplicate-email')

    const firstResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload,
    })

    expect(firstResponse.statusCode).toBe(201)

    const secondResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload,
    })

    expect(secondResponse.statusCode).toBe(409)
  })

  it('POST /auth/register returns 400 when username is blank after trim', async () => {
    const payload = createRegisterPayload('blank-username')
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        ...payload,
        username: '   ',
      },
    })

    expect(response.statusCode).toBe(400)
  })

  it('POST /auth/register trims username before persisting and returning it', async () => {
    const payload = createRegisterPayload('trimmed-username')
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        ...payload,
        username: '  traveler-trimmed  ',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual({
      user: {
        id: expect.any(String),
        username: 'traveler-trimmed',
        email: payload.email,
        createdAt: expect.any(String),
      },
    })

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    expect(user?.username).toBe('traveler-trimmed')
  })

  it('POST /auth/register returns 400 when username exceeds 32 characters after trim', async () => {
    const payload = createRegisterPayload('username-too-long')
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        ...payload,
        username: `  ${'a'.repeat(33)}  `,
      },
    })

    expect(response.statusCode).toBe(400)
  })

  it('POST /auth/login returns 200 with a new current-device sid without affecting other sessions', async () => {
    const payload = createRegisterPayload('login-multi-device')

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload,
    })

    expect(registerResponse.statusCode).toBe(201)
    const firstSidCookie = extractSidCookie(readSetCookie(registerResponse))
    expect(firstSidCookie).toBeTruthy()

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    expect(user).toBeTruthy()

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: payload.email,
        password: payload.password,
      },
    })

    expect(loginResponse.statusCode).toBe(200)
    expect(loginResponse.json()).toEqual({
      user: {
        id: expect.any(String),
        username: payload.username,
        email: payload.email,
        createdAt: expect.any(String),
      },
    })
    const secondSidCookie = extractSidCookie(readSetCookie(loginResponse))
    expect(secondSidCookie).toBeTruthy()
    expect(secondSidCookie).not.toBe(firstSidCookie)

    const sessions = await prisma.authSession.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: 'asc' },
    })

    expect(sessions).toHaveLength(2)
  })

  it('POST /auth/login returns 401 for wrong password', async () => {
    const payload = createRegisterPayload('wrong-password')

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload,
    })

    expect(registerResponse.statusCode).toBe(201)

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: payload.email,
        password: 'wrong-password',
      },
    })

    expect(loginResponse.statusCode).toBe(401)
  })

  it('POST /auth/logout returns 204, clears sid, and only deletes the current device session', async () => {
    const payload = createRegisterPayload('logout-current-device')

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

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    expect(user).toBeTruthy()

    const beforeLogoutSessions = await prisma.authSession.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: 'asc' },
    })

    expect(beforeLogoutSessions).toHaveLength(2)

    const logoutResponse = await app.inject({
      method: 'POST',
      url: '/auth/logout',
      headers: {
        cookie: firstSidCookie!,
      },
    })

    expect(logoutResponse.statusCode).toBe(204)
    expect(readSetCookie(logoutResponse)).toContain('sid=')
    expect(readSetCookie(logoutResponse)).toContain('Max-Age=0')

    const afterLogoutSessions = await prisma.authSession.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: 'asc' },
    })

    expect(afterLogoutSessions).toHaveLength(1)
    expect(afterLogoutSessions[0]?.id).toBe(beforeLogoutSessions[1]?.id)
    expect(afterLogoutSessions[0]?.id).not.toBe(beforeLogoutSessions[0]?.id)
  })
})
