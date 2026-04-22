import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
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

function createAuthoritativeOverseasRecord(placeId: string) {
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
          startDate: null,
          endDate: null,
          createdAt: expect.any(String),
        },
      ],
    })
  })

  it('GET /auth/bootstrap replays all Phase 28 overseas text fields without recomputing them', async () => {
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

    await prisma.userTravelRecord.createMany({
      data: PHASE28_NEW_COUNTRY_CASES.map(({ expectedPlaceId }) => ({
        userId: user!.id,
        ...createAuthoritativeOverseasRecord(expectedPlaceId),
      })),
    })

    const response = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
      headers: {
        cookie: sidCookie!,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().authenticated).toBe(true)
    expect(response.json().records).toHaveLength(13)

    for (const phase28Case of PHASE28_NEW_COUNTRY_CASES) {
      const canonicalSummary = getCanonicalPlaceSummaryById(phase28Case.expectedPlaceId)

      expect(canonicalSummary).toBeTruthy()
      expect(response.json().records).toEqual(
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

  it('GET /auth/bootstrap replays upgraded Phase 28 metadata after backfilling legacy overseas userTravelRecord rows', async () => {
    const payload = createRegisterPayload('legacy-migrate')
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

    await prisma.userTravelRecord.createMany({
      data: PHASE28_LEGACY_OVERSEAS_USER_TRAVEL_ROWS.map(record => ({
        userId: user!.id,
        ...record,
      })),
    })

    const legacyRowsBeforeBackfill = await prisma.userTravelRecord.findMany({
      where: { userId: user!.id },
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

    const response = await app.inject({
      method: 'GET',
      url: '/auth/bootstrap',
      headers: {
        cookie: sidCookie!,
      },
    })

    expect(response.statusCode).toBe(200)

    const responseBody = response.json()

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
  }, 30000)
})
