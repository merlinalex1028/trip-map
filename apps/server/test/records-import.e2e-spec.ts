import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { PrismaClient } from '@prisma/client'
import type { CreateTravelRecordRequest } from '@trip-map/contracts'
import { fileURLToPath } from 'node:url'

import { getCanonicalPlaceSummaryById } from '../src/modules/canonical-places/place-metadata-catalog.js'
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

const TEST_EMAIL_PREFIX = `records-import-${Date.now()}`
const TEST_PASSWORD = 'Passw0rd!123'
const DUPLICATE_PLACE_ID = `test-import-duplicate-${Date.now()}`
const AUTHORITATIVE_PLACE_ID = `test-import-authoritative-${Date.now()}`
const IDEMPOTENT_PLACE_ID = `test-import-idempotent-${Date.now()}`
const AUTHORITATIVE_OVERSEAS_PLACE_ID = 'jp-tokyo'

const baseRecord: Omit<CreateTravelRecordRequest, 'placeId'> = {
  boundaryId: 'boundary-test-001',
  placeKind: 'CN_ADMIN',
  datasetVersion: 'v3.0-test',
  displayName: '测试地点',
  regionSystem: 'CN',
  adminType: 'MUNICIPALITY',
  typeLabel: '直辖市',
  parentLabel: '中国',
  subtitle: '中国 · 直辖市',
}

function createRegisterPayload(suffix: string) {
  return {
    username: `records-import-user-${suffix}`,
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

function createImportRecord(
  placeId: string,
  overrides: Partial<CreateTravelRecordRequest> = {},
): CreateTravelRecordRequest {
  return {
    placeId,
    ...baseRecord,
    ...overrides,
  }
}

function createAuthoritativeOverseasImportRecord(
  overrides: Partial<CreateTravelRecordRequest> = {},
): CreateTravelRecordRequest {
  const canonicalSummary = getCanonicalPlaceSummaryById(AUTHORITATIVE_OVERSEAS_PLACE_ID)

  if (!canonicalSummary) {
    throw new Error(`Missing canonical summary for ${AUTHORITATIVE_OVERSEAS_PLACE_ID}.`)
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
    ...overrides,
  }
}

describe('POST /records/import', () => {
  let app: NestFastifyApplication
  const prisma = new PrismaClient()
  let currentUserId: string
  let sidCookie: string

  beforeAll(async () => {
    app = await createApp()
    await app.init()
    await app.getHttpAdapter().getInstance().ready()

    await prisma.userTravelRecord.deleteMany({
      where: {
        OR: [
          { placeId: { in: [DUPLICATE_PLACE_ID, AUTHORITATIVE_PLACE_ID, IDEMPOTENT_PLACE_ID] } },
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

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: createRegisterPayload('primary'),
    })

    expect(registerResponse.statusCode).toBe(201)
    currentUserId = registerResponse.json().user.id
    sidCookie = extractSidCookie(readSetCookie(registerResponse))!
    expect(sidCookie).toBeTruthy()

    await prisma.userTravelRecord.deleteMany({
      where: { userId: currentUserId },
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

  it('returns 401 for anonymous POST /records/import requests', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/records/import',
      payload: {
        records: [createImportRecord(DUPLICATE_PLACE_ID)],
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('collapses duplicate placeId inputs and counts mergedDuplicateCount once', async () => {
    await prisma.userTravelRecord.deleteMany({
      where: { userId: currentUserId, placeId: DUPLICATE_PLACE_ID },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/records/import',
      headers: {
        cookie: sidCookie,
      },
      payload: {
        records: [
          createImportRecord(DUPLICATE_PLACE_ID, { displayName: '第一条测试地点' }),
          createImportRecord(DUPLICATE_PLACE_ID, { displayName: '第二条重复地点' }),
        ],
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      importedCount: 1,
      mergedDuplicateCount: 1,
      finalCount: 1,
    })
    expect(response.json().records).toHaveLength(1)
    expect(response.json().records[0]).toMatchObject({
      placeId: DUPLICATE_PLACE_ID,
      displayName: '第一条测试地点',
    })
  })

  it('keeps the cloud record authoritative when the user already has the same placeId', async () => {
    await prisma.userTravelRecord.upsert({
      where: {
        userId_placeId: {
          userId: currentUserId,
          placeId: AUTHORITATIVE_PLACE_ID,
        },
      },
      update: {
        displayName: '云端权威地点',
        subtitle: '云端权威副标题',
      },
      create: {
        userId: currentUserId,
        placeId: AUTHORITATIVE_PLACE_ID,
        boundaryId: 'boundary-cloud-authoritative',
        placeKind: 'CN_ADMIN',
        datasetVersion: 'v3.0-test',
        displayName: '云端权威地点',
        regionSystem: 'CN',
        adminType: 'MUNICIPALITY',
        typeLabel: '直辖市',
        parentLabel: '中国',
        subtitle: '云端权威副标题',
      },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/records/import',
      headers: {
        cookie: sidCookie,
      },
      payload: {
        records: [
          createImportRecord(AUTHORITATIVE_PLACE_ID, {
            boundaryId: 'boundary-local-override',
            displayName: '本地想覆盖的地点',
            subtitle: '本地覆盖副标题',
          }),
        ],
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      importedCount: 0,
      mergedDuplicateCount: 1,
      finalCount: 2,
    })

    const authoritativeRecord = response
      .json()
      .records
      .find((record: { placeId: string }) => record.placeId === AUTHORITATIVE_PLACE_ID)
    expect(authoritativeRecord).toMatchObject({
      placeId: AUTHORITATIVE_PLACE_ID,
      boundaryId: 'boundary-cloud-authoritative',
      displayName: '云端权威地点',
      subtitle: '云端权威副标题',
    })
  })

  it('is idempotent for the same current user and payload', async () => {
    await prisma.userTravelRecord.deleteMany({
      where: { userId: currentUserId, placeId: IDEMPOTENT_PLACE_ID },
    })

    const payload = {
      records: [createImportRecord(IDEMPOTENT_PLACE_ID, { displayName: '幂等测试地点' })],
    }

    const firstResponse = await app.inject({
      method: 'POST',
      url: '/records/import',
      headers: {
        cookie: sidCookie,
      },
      payload,
    })

    expect(firstResponse.statusCode).toBe(201)
    expect(firstResponse.json()).toMatchObject({
      importedCount: 1,
      mergedDuplicateCount: 0,
      finalCount: 3,
    })

    const secondResponse = await app.inject({
      method: 'POST',
      url: '/records/import',
      headers: {
        cookie: sidCookie,
      },
      payload,
    })

    expect(secondResponse.statusCode).toBe(201)
    expect(secondResponse.json()).toMatchObject({
      importedCount: 0,
      mergedDuplicateCount: 1,
      finalCount: 3,
    })

    const importedRecords = secondResponse
      .json()
      .records
      .filter((record: { placeId: string }) => record.placeId === IDEMPOTENT_PLACE_ID)
    expect(importedRecords).toHaveLength(1)
  })

  it('rejects /records/import payloads when overseas authoritative metadata is forged', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/records/import',
      headers: {
        cookie: sidCookie,
      },
      payload: {
        records: [
          createAuthoritativeOverseasImportRecord({
            subtitle: 'Forged subtitle',
          }),
        ],
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({
      message: 'Overseas travel record metadata must match authoritative catalog: subtitle.',
    })
  })
})
