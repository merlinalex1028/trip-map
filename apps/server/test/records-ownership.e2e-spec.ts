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

const TEST_EMAIL_PREFIX = `records-ownership-${Date.now()}`
const TEST_PASSWORD = 'Passw0rd!123'
const SHARED_PLACE_ID = `same-placeId-${Date.now()}`
const B_ONLY_PLACE_ID = `different-user-place-${Date.now()}`

const sharedRecordPayload = {
  placeId: SHARED_PLACE_ID,
  boundaryId: 'boundary-shared-001',
  placeKind: 'CN_ADMIN',
  datasetVersion: 'v5.0-test',
  displayName: '共享地点',
  regionSystem: 'CN',
  adminType: 'MUNICIPALITY',
  typeLabel: '直辖市',
  parentLabel: '中国',
  subtitle: '中国 · 直辖市',
}

const bOnlyRecordPayload = {
  placeId: B_ONLY_PLACE_ID,
  boundaryId: 'boundary-user-b-001',
  placeKind: 'CN_ADMIN',
  datasetVersion: 'v5.0-test',
  displayName: '用户 B 私有地点',
  regionSystem: 'CN',
  adminType: 'MUNICIPALITY',
  typeLabel: '直辖市',
  parentLabel: '中国',
  subtitle: '中国 · 直辖市',
}

function createRegisterPayload(suffix: string) {
  return {
    username: `ownership-user-${suffix}`,
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

describe('Records ownership API', () => {
  let app: NestFastifyApplication
  const prisma = new PrismaClient()

  beforeAll(async () => {
    app = await createApp()
    await app.init()
    await app.getHttpAdapter().getInstance().ready()

    await prisma.userTravelRecord.deleteMany({
      where: {
        OR: [
          { placeId: { in: [SHARED_PLACE_ID, B_ONLY_PLACE_ID] } },
          {
            user: {
              email: {
                startsWith: TEST_EMAIL_PREFIX,
              },
            },
          },
        ],
      },
    })
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
    await prisma.userTravelRecord.deleteMany({
      where: {
        user: {
          email: {
            startsWith: TEST_EMAIL_PREFIX,
          },
        },
      },
    })
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

  it('returns 401 for anonymous GET /records, POST /records, and DELETE /records/:placeId', async () => {
    const getResponse = await app.inject({
      method: 'GET',
      url: '/records',
    })
    const postResponse = await app.inject({
      method: 'POST',
      url: '/records',
      payload: sharedRecordPayload,
    })
    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/records/${SHARED_PLACE_ID}`,
    })

    expect(getResponse.statusCode).toBe(401)
    expect(postResponse.statusCode).toBe(401)
    expect(deleteResponse.statusCode).toBe(401)
  })

  it('binds owner from session userId, allows same placeId for different user accounts, and preserves isolation on delete', async () => {
    const userARegisterResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: createRegisterPayload('user-a'),
    })
    const userBRegisterResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: createRegisterPayload('user-b'),
    })

    expect(userARegisterResponse.statusCode).toBe(201)
    expect(userBRegisterResponse.statusCode).toBe(201)

    const userA = userARegisterResponse.json().user as { id: string; email: string }
    const userB = userBRegisterResponse.json().user as { id: string; email: string }
    const userACookie = extractSidCookie(readSetCookie(userARegisterResponse))
    const userBCookie = extractSidCookie(readSetCookie(userBRegisterResponse))

    expect(userACookie).toBeTruthy()
    expect(userBCookie).toBeTruthy()

    const userACreateSharedResponse = await app.inject({
      method: 'POST',
      url: '/records',
      headers: {
        cookie: userACookie!,
      },
      payload: sharedRecordPayload,
    })
    const userBCreateSharedResponse = await app.inject({
      method: 'POST',
      url: '/records',
      headers: {
        cookie: userBCookie!,
      },
      payload: sharedRecordPayload,
    })
    const userBCreatePrivateResponse = await app.inject({
      method: 'POST',
      url: '/records',
      headers: {
        cookie: userBCookie!,
      },
      payload: bOnlyRecordPayload,
    })

    expect(userACreateSharedResponse.statusCode).toBe(201)
    expect(userBCreateSharedResponse.statusCode).toBe(201)
    expect(userBCreatePrivateResponse.statusCode).toBe(201)

    const sharedRecords = await prisma.userTravelRecord.findMany({
      where: {
        placeId: SHARED_PLACE_ID,
      },
      orderBy: {
        userId: 'asc',
      },
    })

    expect(sharedRecords).toHaveLength(2)
    expect(sharedRecords.map((record) => record.userId)).toEqual([userA.id, userB.id].sort())

    const userAPersistedRecord = await prisma.userTravelRecord.findUnique({
      where: {
        userId_placeId: {
          userId: userA.id,
          placeId: SHARED_PLACE_ID,
        },
      },
    })
    const userBPersistedRecord = await prisma.userTravelRecord.findUnique({
      where: {
        userId_placeId: {
          userId: userB.id,
          placeId: SHARED_PLACE_ID,
        },
      },
    })

    expect(userAPersistedRecord?.userId).toBe(userA.id)
    expect(userBPersistedRecord?.userId).toBe(userB.id)

    const userAGetResponse = await app.inject({
      method: 'GET',
      url: '/records',
      headers: {
        cookie: userACookie!,
      },
    })
    const userBGetResponse = await app.inject({
      method: 'GET',
      url: '/records',
      headers: {
        cookie: userBCookie!,
      },
    })

    expect(userAGetResponse.statusCode).toBe(200)
    expect(userBGetResponse.statusCode).toBe(200)
    expect(userAGetResponse.json()).toEqual([
      expect.objectContaining({
        placeId: SHARED_PLACE_ID,
      }),
    ])
    expect(userBGetResponse.json()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        placeId: SHARED_PLACE_ID,
      }),
      expect.objectContaining({
        placeId: B_ONLY_PLACE_ID,
      }),
    ]))
    expect(userAGetResponse.json()).not.toEqual(expect.arrayContaining([
      expect.objectContaining({
        placeId: B_ONLY_PLACE_ID,
      }),
    ]))

    const userADeleteResponse = await app.inject({
      method: 'DELETE',
      url: `/records/${SHARED_PLACE_ID}`,
      headers: {
        cookie: userACookie!,
      },
    })

    expect(userADeleteResponse.statusCode).toBe(204)

    const remainingSharedRecords = await prisma.userTravelRecord.findMany({
      where: {
        placeId: SHARED_PLACE_ID,
      },
    })

    expect(remainingSharedRecords).toHaveLength(1)
    expect(remainingSharedRecords[0]?.userId).toBe(userB.id)

    const userAAfterDeleteGetResponse = await app.inject({
      method: 'GET',
      url: '/records',
      headers: {
        cookie: userACookie!,
      },
    })
    const userBAfterDeleteGetResponse = await app.inject({
      method: 'GET',
      url: '/records',
      headers: {
        cookie: userBCookie!,
      },
    })

    expect(userAAfterDeleteGetResponse.json()).toEqual([])
    expect(userBAfterDeleteGetResponse.json()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        placeId: SHARED_PLACE_ID,
      }),
      expect.objectContaining({
        placeId: B_ONLY_PLACE_ID,
      }),
    ]))
  })
})
