import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'node:url'

const { canonicalSummaries } = vi.hoisted(() => {
  const buildOverseasSummary = (
    placeId: string,
    boundaryId: string,
    displayName: string,
    parentLabel: string,
    typeLabel: string,
  ) => ({
    placeId,
    boundaryId,
    placeKind: 'OVERSEAS_ADMIN1' as const,
    datasetVersion: 'canonical-authoritative-2026-04-21',
    displayName,
    regionSystem: 'OVERSEAS' as const,
    adminType: 'ADMIN1' as const,
    typeLabel,
    parentLabel,
    subtitle: `${parentLabel} · ${typeLabel}`,
  })

  return {
    canonicalSummaries: [
      buildOverseasSummary('jp-tokyo', 'ne-admin1-jp-tokyo', 'Tokyo', 'Japan', 'Prefecture'),
      buildOverseasSummary('us-california', 'ne-admin1-us-california', 'California', 'United States', 'State'),
      buildOverseasSummary('us-washington-state', 'ne-admin1-us-washington-state', 'Washington', 'United States', 'State'),
      buildOverseasSummary('us-district-of-columbia', 'ne-admin1-us-district-of-columbia', 'Washington', 'United States', 'State'),
      buildOverseasSummary('in-west-bengal', 'ne-admin1-in-west-bengal', 'West Bengal', 'India', 'State'),
      buildOverseasSummary('id-east-java', 'ne-admin1-id-east-java', 'East Java', 'Indonesia', 'Province'),
      buildOverseasSummary('sa-eastern', 'ne-admin1-sa-eastern', 'Eastern', 'Saudi Arabia', 'Region'),
      buildOverseasSummary('pg-morobe', 'ne-admin1-pg-morobe', 'Morobe', 'Papua New Guinea', 'Province'),
      buildOverseasSummary('ca-british-columbia', 'ne-admin1-ca-british-columbia', 'British Columbia', 'Canada', 'Province'),
      buildOverseasSummary('br-rio-grande-do-sul', 'ne-admin1-br-rio-grande-do-sul', 'Rio Grande do Sul', 'Brazil', 'State'),
      buildOverseasSummary('ar-buenos-aires-province', 'ne-admin1-ar-buenos-aires-province', 'Buenos Aires', 'Argentina', 'Province'),
      buildOverseasSummary('ar-buenos-aires-city', 'ne-admin1-ar-buenos-aires-city', 'Buenos Aires', 'Argentina', 'Province'),
      buildOverseasSummary('ar-entre-rios', 'ne-admin1-ar-entre-rios', 'Entre Ríos', 'Argentina', 'Province'),
      buildOverseasSummary('de-bavaria', 'ne-admin1-de-bavaria', 'Bavaria', 'Germany', 'State'),
      buildOverseasSummary('pl-silesian-voivodeship', 'ne-admin1-pl-silesian-voivodeship', 'Silesian Voivodeship', 'Poland', 'Province'),
      buildOverseasSummary('cz-usti-nad-labem', 'ne-admin1-cz-usti-nad-labem', 'Ústí nad Labem', 'Czech Republic', 'Region'),
      buildOverseasSummary('eg-aswan', 'ne-admin1-eg-aswan', 'Aswan', 'Egypt', 'Governorate'),
      buildOverseasSummary('ma-tangier-tetouan', 'ne-admin1-ma-tangier-tetouan', 'Tangier-Tetouan', 'Morocco', 'Region'),
      buildOverseasSummary('za-western-cape', 'ne-admin1-za-western-cape', 'Western Cape', 'South Africa', 'Province'),
    ],
  }
})

vi.mock('../src/modules/canonical-places/place-metadata-catalog.js', () => {
  const byPlaceId = new Map(canonicalSummaries.map(summary => [summary.placeId, summary]))
  const byBoundaryId = new Map(canonicalSummaries.map(summary => [summary.boundaryId, summary]))

  return {
    buildCanonicalMetadataLookup: () => ({
      byPlaceId: new Map(byPlaceId),
      byBoundaryId: new Map(byBoundaryId),
    }),
    getCanonicalPlaceSummaryById: (placeId: string) => byPlaceId.get(placeId) ?? null,
    getCanonicalPlaceSummaryByBoundaryId: (boundaryId: string) => byBoundaryId.get(boundaryId) ?? null,
  }
})

vi.mock('../src/modules/canonical-places/canonical-places.module.js', async () => {
  const { Module } = await import('@nestjs/common')

  @Module({})
  class CanonicalPlacesModule {}

  return { CanonicalPlacesModule }
})

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

    const summary = await backfillRecordMetadata(prisma)

    expect(summary.matchedUserTravelRows).toBeGreaterThanOrEqual(2)
    expect(summary.unmatchedUserTravelRows).not.toContain('jp-tokyo')
    expect(summary.unmatchedUserTravelRows).not.toContain('us-california')
    expect(
      summary.skippedUserTravelRows.filter(
        row => row.placeId === 'jp-tokyo' || row.placeId === 'us-california',
      ),
    ).toEqual([])

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
  }, 30000)

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
