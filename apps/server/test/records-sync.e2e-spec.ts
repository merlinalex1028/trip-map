import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'node:url'

import { backfillRecordMetadata } from '../scripts/backfill-record-metadata.ts'
import { getCanonicalPlaceSummaryById } from '../src/modules/canonical-places/place-metadata-catalog.js'
import { createApp } from '../src/main.js'
import {
  PHASE28_LEGACY_OVERSEAS_USER_TRAVEL_ROWS,
  PHASE28_NEW_COUNTRY_CASES,
} from './phase28-overseas-cases.ts'

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

const TEST_EMAIL_PREFIX = `records-sync-${Date.now()}`
const TEST_PASSWORD = 'Passw0rd!123'
const TEST_PLACE_ID = `records-sync-place-${Date.now()}`

function createRegisterPayload(suffix: string) {
  return {
    username: `records-sync-${suffix}`,
    email: `${TEST_EMAIL_PREFIX}-${suffix}@example.com`,
    password: TEST_PASSWORD,
  }
}

function createTravelPayload(placeId = TEST_PLACE_ID) {
  return {
    placeId,
    boundaryId: `boundary-${placeId}`,
    placeKind: 'CN_ADMIN',
    datasetVersion: 'v3.0-test',
    displayName: '同步测试地点',
    regionSystem: 'CN',
    adminType: 'MUNICIPALITY',
    typeLabel: '直辖市',
    parentLabel: '中国',
    subtitle: '中国 · 直辖市',
  }
}

function createOverseasTravelPayload(placeId: string) {
  const canonicalSummary = getCanonicalPlaceSummaryById(placeId)

  if (!canonicalSummary) {
    throw new Error(`Missing canonical summary for ${placeId}.`)
  }

  return {
    placeId: canonicalSummary.placeId,
    boundaryId: canonicalSummary.boundaryId,
    placeKind: canonicalSummary.placeKind,
    datasetVersion: canonicalSummary.datasetVersion,
    displayName: canonicalSummary.displayName,
    regionSystem: canonicalSummary.regionSystem,
    adminType: canonicalSummary.adminType,
    typeLabel: canonicalSummary.typeLabel,
    parentLabel: canonicalSummary.parentLabel,
    subtitle: canonicalSummary.subtitle,
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

describe('Records sync semantics', () => {
  let app: NestFastifyApplication
  const prisma = new PrismaClient()
  let sessionACookie: string
  let sessionBCookie: string
  let userId: string

  beforeAll(async () => {
    app = await createApp()
    await app.init()
    await app.getHttpAdapter().getInstance().ready()

    await prisma.userTravelRecord.deleteMany({
      where: {
        OR: [
          { placeId: TEST_PLACE_ID },
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

    const payload = createRegisterPayload('primary')
    const registerResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload,
    })

    expect(registerResponse.statusCode).toBe(201)
    sessionACookie = extractSidCookie(readSetCookie(registerResponse))!
    expect(sessionACookie).toBeTruthy()

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: payload.email,
        password: payload.password,
      },
    })

    expect(loginResponse.statusCode).toBe(200)
    sessionBCookie = extractSidCookie(readSetCookie(loginResponse))!
    expect(sessionBCookie).toBeTruthy()

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      select: { id: true },
    })

    expect(user).toBeTruthy()
    userId = user!.id
  })

  beforeEach(async () => {
    await prisma.userTravelRecord.deleteMany({
      where: {
        user: {
          email: {
            startsWith: TEST_EMAIL_PREFIX,
          },
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

  it('lets session B see records created by session A after /auth/bootstrap', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/records',
      headers: {
        cookie: sessionACookie,
      },
      payload: createTravelPayload(),
    })

    expect(createResponse.statusCode).toBe(201)

    const bootstrapResponse = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
      headers: {
        cookie: sessionBCookie,
      },
    })

    expect(bootstrapResponse.statusCode).toBe(200)
    expect(bootstrapResponse.json()).toMatchObject({
      authenticated: true,
      records: [
        expect.objectContaining({
          placeId: TEST_PLACE_ID,
        }),
      ],
    })
  })

  it('keeps overseas text fields identical across same-user multi-session bootstrap replay', async () => {
    for (const phase28Case of PHASE28_NEW_COUNTRY_CASES) {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/records',
        headers: {
          cookie: sessionACookie,
        },
        payload: createOverseasTravelPayload(phase28Case.expectedPlaceId),
      })

      expect(createResponse.statusCode).toBe(201)
    }

    const bootstrapResponse = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
      headers: {
        cookie: sessionBCookie,
      },
    })

    expect(bootstrapResponse.statusCode).toBe(200)
    expect(bootstrapResponse.json().authenticated).toBe(true)
    expect(bootstrapResponse.json().records).toHaveLength(13)

    for (const phase28Case of PHASE28_NEW_COUNTRY_CASES) {
      const canonicalSummary = getCanonicalPlaceSummaryById(phase28Case.expectedPlaceId)

      expect(canonicalSummary).toBeTruthy()
      expect(bootstrapResponse.json().records).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            placeId: phase28Case.expectedPlaceId,
            boundaryId: phase28Case.expectedBoundaryId,
            datasetVersion: canonicalSummary!.datasetVersion,
            displayName: canonicalSummary!.displayName,
            typeLabel: canonicalSummary!.typeLabel,
            parentLabel: canonicalSummary!.parentLabel,
            subtitle: canonicalSummary!.subtitle,
          }),
        ]),
      )
    }
  })

  it('replays backfilled Phase 28 metadata to session B for legacy overseas userTravelRecord rows', async () => {
    await prisma.userTravelRecord.createMany({
      data: PHASE28_LEGACY_OVERSEAS_USER_TRAVEL_ROWS.map(record => ({
        userId,
        ...record,
      })),
    })

    const legacyRowsBeforeBackfill = await prisma.userTravelRecord.findMany({
      where: { userId },
      select: {
        placeId: true,
        datasetVersion: true,
        subtitle: true,
      },
      orderBy: { placeId: 'asc' },
    })

    expect(legacyRowsBeforeBackfill).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          placeId: 'jp-tokyo',
          datasetVersion: '2026-04-02-geo-v2',
          subtitle: 'Japan · 一级行政区',
        }),
        expect.objectContaining({
          placeId: 'us-california',
          datasetVersion: '2026-04-02-geo-v2',
          subtitle: 'United States · 一级行政区',
        }),
      ]),
    )

    await backfillRecordMetadata(prisma)

    const bootstrapResponse = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
      headers: {
        cookie: sessionBCookie,
      },
    })

    expect(bootstrapResponse.statusCode).toBe(200)

    const responseBody = bootstrapResponse.json()

    expect(responseBody.authenticated).toBe(true)
    expect(responseBody.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          placeId: 'jp-tokyo',
          boundaryId: 'ne-admin1-jp-tokyo',
          datasetVersion: 'canonical-authoritative-2026-04-21',
          typeLabel: 'Prefecture',
          parentLabel: 'Japan',
          subtitle: 'Japan · Prefecture',
        }),
        expect.objectContaining({
          placeId: 'us-california',
          boundaryId: 'ne-admin1-us-california',
          datasetVersion: 'canonical-authoritative-2026-04-21',
          typeLabel: 'State',
          parentLabel: 'United States',
          subtitle: 'United States · State',
        }),
      ]),
    )
    expect(
      responseBody.records.some((record: { subtitle: string, typeLabel: string }) =>
        record.subtitle.includes('一级行政区') || record.typeLabel.includes('一级行政区')
      ),
    ).toBe(false)
  })

  it('lets session B observe that a record was removed by session A after /auth/bootstrap', async () => {
    await app.inject({
      method: 'POST',
      url: '/records',
      headers: {
        cookie: sessionACookie,
      },
      payload: createTravelPayload(),
    })

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/records/${TEST_PLACE_ID}`,
      headers: {
        cookie: sessionACookie,
      },
    })

    expect(deleteResponse.statusCode).toBe(204)

    const bootstrapResponse = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
      headers: {
        cookie: sessionBCookie,
      },
    })

    expect(bootstrapResponse.statusCode).toBe(200)
    expect(bootstrapResponse.json()).toMatchObject({
      authenticated: true,
      records: [],
    })
  })

  it('treats stale session deletes as idempotent success for the same user', async () => {
    await app.inject({
      method: 'POST',
      url: '/records',
      headers: {
        cookie: sessionACookie,
      },
      payload: createTravelPayload(),
    })

    const staleBootstrapResponse = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
      headers: {
        cookie: sessionBCookie,
      },
    })

    expect(staleBootstrapResponse.statusCode).toBe(200)
    expect(staleBootstrapResponse.json()).toMatchObject({
      authenticated: true,
      records: [
        expect.objectContaining({
          placeId: TEST_PLACE_ID,
        }),
      ],
    })

    const firstDeleteResponse = await app.inject({
      method: 'DELETE',
      url: `/records/${TEST_PLACE_ID}`,
      headers: {
        cookie: sessionACookie,
      },
    })

    expect(firstDeleteResponse.statusCode).toBe(204)

    const staleDeleteResponse = await app.inject({
      method: 'DELETE',
      url: `/records/${TEST_PLACE_ID}`,
      headers: {
        cookie: sessionBCookie,
      },
    })

    expect(staleDeleteResponse.statusCode).toBe(204)

    const finalBootstrapResponse = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
      headers: {
        cookie: sessionBCookie,
      },
    })

    expect(finalBootstrapResponse.statusCode).toBe(200)
    expect(finalBootstrapResponse.json()).toMatchObject({
      authenticated: true,
      records: [],
    })
  })
})
