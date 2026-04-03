import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'node:url'

import { backfillRecordMetadata } from '../scripts/backfill-record-metadata.ts'
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

const TEST_PLACE_ID = `test-travel-place-${Date.now()}`
const TEST_PLACE_ID_2 = `test-travel-place-2-${Date.now()}`
const LEGACY_PLACE_ID = 'cn-beijing'

const validRecord = {
  placeId: TEST_PLACE_ID,
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

describe('TravelRecord CRUD API', () => {
  let app: NestFastifyApplication
  const prisma = new PrismaClient()

  beforeAll(async () => {
    app = await createApp()
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await prisma.travelRecord.deleteMany({
      where: { placeId: { in: [TEST_PLACE_ID, TEST_PLACE_ID_2, LEGACY_PLACE_ID] } },
    })
  })

  afterAll(async () => {
    await prisma.travelRecord.deleteMany({
      where: { placeId: { in: [TEST_PLACE_ID, TEST_PLACE_ID_2, LEGACY_PLACE_ID] } },
    })
    await prisma.$disconnect()
    await app.close()
  })

  it('GET /records returns 200 with empty array initially', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/records',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(Array.isArray(body)).toBe(true)
  })

  it('POST /records with valid body returns 201 with TravelRecord', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/records',
      payload: validRecord,
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body).toMatchObject({
      placeId: TEST_PLACE_ID,
      boundaryId: 'boundary-test-001',
      placeKind: 'CN_ADMIN',
      datasetVersion: 'v3.0-test',
      displayName: '测试地点',
      regionSystem: 'CN',
      adminType: 'MUNICIPALITY',
      typeLabel: '直辖市',
      parentLabel: '中国',
      subtitle: '中国 · 直辖市',
    })
    expect(typeof body.id).toBe('string')
    expect(typeof body.createdAt).toBe('string')
  })

  it('POST /records with duplicate placeId returns 409', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/records',
      payload: validRecord,
    })

    expect(response.statusCode).toBe(409)
  })

  it('POST /records with missing placeId returns 400', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/records',
      payload: {
        boundaryId: 'boundary-test-001',
        placeKind: 'CN_ADMIN',
        datasetVersion: 'v3.0-test',
        displayName: '测试地点',
        regionSystem: 'CN',
        adminType: 'MUNICIPALITY',
        typeLabel: '直辖市',
        parentLabel: '中国',
        subtitle: '中国 · 直辖市',
      },
    })

    expect(response.statusCode).toBe(400)
  })

  it('GET /records after POST returns array with the created record', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/records',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json() as Array<Record<string, string>>
    const found = body.find((r) => r.placeId === TEST_PLACE_ID)
    expect(found).toBeDefined()
    expect(found).toMatchObject({
      placeId: TEST_PLACE_ID,
      regionSystem: 'CN',
      adminType: 'MUNICIPALITY',
      typeLabel: '直辖市',
      parentLabel: '中国',
      subtitle: '中国 · 直辖市',
    })

    const storedRecord = await prisma.travelRecord.findUnique({
      where: { placeId: TEST_PLACE_ID },
    })

    expect(storedRecord).toMatchObject({
      placeId: TEST_PLACE_ID,
      regionSystem: 'CN',
      adminType: 'MUNICIPALITY',
      typeLabel: '直辖市',
      parentLabel: '中国',
      subtitle: '中国 · 直辖市',
    })
  })

  it('DELETE /records/:placeId with existing placeId returns 204', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/records/${TEST_PLACE_ID}`,
    })

    expect(response.statusCode).toBe(204)
  })

  it('GET /records after DELETE does not contain the deleted record', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/records',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json() as Array<{ placeId: string }>
    const found = body.find((r) => r.placeId === TEST_PLACE_ID)
    expect(found).toBeUndefined()
  })

  it('DELETE /records/:placeId with non-existent placeId returns 404', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/records/non-existent-place-id-${Date.now()}`,
    })

    expect(response.statusCode).toBe(404)
  })

  it('backfills legacy travel rows by placeId and restores canonical metadata for reopen surfaces', async () => {
    await prisma.travelRecord.deleteMany({
      where: { placeId: LEGACY_PLACE_ID },
    })

    await prisma.travelRecord.create({
      data: {
        placeId: LEGACY_PLACE_ID,
        boundaryId: 'datav-cn-beijing',
        placeKind: 'CN_ADMIN',
        datasetVersion: 'phase12-canonical-fixture-v1',
        displayName: '北京',
        regionSystem: null,
        adminType: null,
        typeLabel: null,
        parentLabel: null,
        subtitle: '',
      },
    })

    const summary = await backfillRecordMetadata(prisma)

    expect(summary.matchedTravelRows).toBeGreaterThan(0)
    expect(summary.unmatchedTravelRows).not.toContain(LEGACY_PLACE_ID)

    const dbRecord = await prisma.travelRecord.findUnique({
      where: { placeId: LEGACY_PLACE_ID },
    })

    expect(dbRecord).toMatchObject({
      placeId: LEGACY_PLACE_ID,
      regionSystem: 'CN',
      adminType: 'MUNICIPALITY',
      typeLabel: '直辖市',
      parentLabel: '中国',
      subtitle: '中国 · 直辖市',
    })

    const response = await app.inject({
      method: 'GET',
      url: '/records',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json() as Array<Record<string, string>>
    const found = body.find((record) => record.placeId === LEGACY_PLACE_ID)
    expect(found).toMatchObject({
      placeId: LEGACY_PLACE_ID,
      regionSystem: 'CN',
      adminType: 'MUNICIPALITY',
      typeLabel: '直辖市',
      parentLabel: '中国',
      subtitle: '中国 · 直辖市',
    })
  })
})
