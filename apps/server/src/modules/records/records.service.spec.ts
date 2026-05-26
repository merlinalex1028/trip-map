import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { BadRequestException } from '@nestjs/common'
import type { UserTravelRecord } from '@prisma/client'
import { describe, expect, it, vi } from 'vitest'
import { GEOMETRY_DATASET_VERSION } from '@trip-map/contracts'

import { TOTAL_SUPPORTED_TRAVEL_COUNTRIES } from '../canonical-places/place-metadata-catalog.js'
import type { CreateTravelRecordDto } from './dto/create-travel-record.dto.js'
import { RecordsRepository } from './records.repository.js'
import { RecordsService } from './records.service.js'

function createRepositoryMock() {
  return {
    createSmokeRecord: vi.fn(),
    findAllTravelRecords: vi.fn(),
    createTravelRecord: vi.fn(),
    importTravelRecords: vi.fn(),
    deleteTravelRecordByPlaceId: vi.fn(),
    getTravelStats: vi.fn(),
  }
}

function createPrismaMock() {
  return {
    smokeRecord: {
      create: vi.fn(),
    },
    userTravelRecord: {
      count: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  }
}

function baseInput(overrides: Partial<CreateTravelRecordDto> = {}): CreateTravelRecordDto {
  return {
    placeId: 'cn-admin-beijing',
    boundaryId: 'cn-admin-beijing-boundary',
    placeKind: 'CN_ADMIN',
    datasetVersion: 'cn-admin-2024-r1',
    displayName: '北京市',
    regionSystem: 'CN',
    adminType: 'MUNICIPALITY',
    typeLabel: '直辖市',
    parentLabel: '中国',
    subtitle: '直辖市 · 中国',
    startDate: null,
    endDate: null,
    ...overrides,
  } as CreateTravelRecordDto
}

function baseRecord(overrides: Partial<UserTravelRecord> = {}): UserTravelRecord {
  return {
    id: 'rec-1',
    userId: 'user-1',
    placeId: 'cn-admin-beijing',
    boundaryId: 'cn-admin-beijing-boundary',
    placeKind: 'CN_ADMIN',
    datasetVersion: 'cn-admin-2024-r1',
    displayName: '北京市',
    regionSystem: 'CN',
    adminType: 'MUNICIPALITY',
    typeLabel: '直辖市',
    parentLabel: '中国',
    subtitle: '直辖市 · 中国',
    startDate: null,
    endDate: null,
    notes: null,
    tags: [],
    createdAt: new Date('2026-04-20T00:00:00.000Z'),
    updatedAt: new Date('2026-04-20T00:00:00.000Z'),
    ...overrides,
  } as UserTravelRecord
}

function emptyMemories() {
  return {
    monthlyTrend: [],
    yearlyTrend: [],
    countryDistribution: [],
    profile: [],
    popularFootprints: [],
    postcards: [],
  }
}

const REPO_ROOT = fileURLToPath(new URL('../../../../..', import.meta.url))

function readAuthoritativeOverseasCountries() {
  const rawLayer = readFileSync(
    resolve(REPO_ROOT, 'apps/web/public/geo', GEOMETRY_DATASET_VERSION, 'overseas/layer.json'),
    'utf8',
  )
  const layer = JSON.parse(rawLayer) as {
    features: Array<{ properties?: { parentLabel?: string } }>
  }

  return new Set(
    layer.features
      .map((feature) => {
        const parentLabel = feature.properties?.parentLabel ?? ''
        const separatorIndex = parentLabel.indexOf(' · ')
        return separatorIndex === -1 ? parentLabel : parentLabel.slice(0, separatorIndex)
      })
      .filter(Boolean),
  )
}

describe('RecordsService', () => {
  it('createTravel accepts null startDate/endDate and passes them to the repository', async () => {
    const repository = createRepositoryMock()
    const service = new RecordsService(repository as never)
    const input = baseInput()

    repository.createTravelRecord.mockResolvedValueOnce(baseRecord())

    const result = await service.createTravel('user-1', input)

    expect(repository.createTravelRecord).toHaveBeenCalledTimes(1)
    expect(repository.createTravelRecord).toHaveBeenCalledWith('user-1', expect.objectContaining({
      startDate: null,
      endDate: null,
    }))
    expect(result).toEqual(expect.objectContaining({
      startDate: null,
      endDate: null,
    }))
  })

  it('createTravel accepts valid dates and passes them to the repository', async () => {
    const repository = createRepositoryMock()
    const service = new RecordsService(repository as never)
    const input = baseInput({ startDate: '2025-10-01', endDate: '2025-10-07' })

    repository.createTravelRecord.mockResolvedValueOnce(baseRecord({
      startDate: '2025-10-01',
      endDate: '2025-10-07',
    }))

    const result = await service.createTravel('user-1', input)

    expect(repository.createTravelRecord).toHaveBeenCalledTimes(1)
    expect(repository.createTravelRecord).toHaveBeenCalledWith('user-1', expect.objectContaining({
      startDate: '2025-10-01',
      endDate: '2025-10-07',
    }))
    expect(result).toEqual(expect.objectContaining({
      startDate: '2025-10-01',
      endDate: '2025-10-07',
    }))
  })

  it('createTravel throws BadRequestException when endDate is before startDate', async () => {
    const repository = createRepositoryMock()
    const service = new RecordsService(repository as never)

    await expect(service.createTravel('user-1', baseInput({
      startDate: '2025-10-07',
      endDate: '2025-10-01',
    }))).rejects.toThrow('endDate must be >= startDate')
    await expect(service.createTravel('user-1', baseInput({
      startDate: '2025-10-07',
      endDate: '2025-10-01',
    }))).rejects.toBeInstanceOf(BadRequestException)
    expect(repository.createTravelRecord).not.toHaveBeenCalled()
  })

  it('createTravel treats missing endDate as a single-day trip', async () => {
    const repository = createRepositoryMock()
    const service = new RecordsService(repository as never)
    const input = baseInput({ startDate: '2025-10-01', endDate: null })

    repository.createTravelRecord.mockResolvedValueOnce(baseRecord({
      startDate: '2025-10-01',
      endDate: null,
    }))

    await expect(service.createTravel('user-1', input)).resolves.toEqual(expect.objectContaining({
      startDate: '2025-10-01',
      endDate: null,
    }))
    expect(repository.createTravelRecord).toHaveBeenCalledTimes(1)
  })

  it('createTravel allows same-day trips when startDate equals endDate', async () => {
    const repository = createRepositoryMock()
    const service = new RecordsService(repository as never)
    const input = baseInput({ startDate: '2025-10-05', endDate: '2025-10-05' })

    repository.createTravelRecord.mockResolvedValueOnce(baseRecord({
      startDate: '2025-10-05',
      endDate: '2025-10-05',
    }))

    await expect(service.createTravel('user-1', input)).resolves.toEqual(expect.objectContaining({
      startDate: '2025-10-05',
      endDate: '2025-10-05',
    }))
    expect(repository.createTravelRecord).toHaveBeenCalledTimes(1)
  })

  it('importTravel rejects records with endDate before startDate', async () => {
    const repository = createRepositoryMock()
    const service = new RecordsService(repository as never)

    const validRecord = baseInput({ startDate: '2025-10-01', endDate: '2025-10-07' })
    const invalidRecord = baseInput({
      placeId: 'cn-admin-shanghai',
      boundaryId: 'cn-admin-shanghai-boundary',
      displayName: '上海市',
      startDate: '2025-11-01',
      endDate: '2025-10-05',
    })

    await expect(
      service.importTravel('user-1', { records: [validRecord, invalidRecord] }),
    ).rejects.toBeInstanceOf(BadRequestException)
    await expect(
      service.importTravel('user-1', { records: [validRecord, invalidRecord] }),
    ).rejects.toThrow('endDate must be >= startDate')

    expect(repository.importTravelRecords).not.toHaveBeenCalled()
  })

  it('importTravel accepts records with valid date ranges and null dates', async () => {
    const repository = createRepositoryMock()
    const service = new RecordsService(repository as never)

    const records = [
      baseInput({ startDate: '2025-10-01', endDate: '2025-10-07' }),
      baseInput({
        placeId: 'cn-admin-shanghai',
        boundaryId: 'cn-admin-shanghai-boundary',
        displayName: '上海市',
        startDate: null,
        endDate: null,
      }),
    ]

    repository.importTravelRecords.mockResolvedValueOnce({
      importedCount: 2,
      mergedDuplicateCount: 0,
      finalCount: 2,
      records: [
        baseRecord({ startDate: '2025-10-01', endDate: '2025-10-07' }),
        baseRecord({
          placeId: 'cn-admin-shanghai',
          displayName: '上海市',
          startDate: null,
          endDate: null,
        }),
      ],
    })

    const result = await service.importTravel('user-1', { records })

    expect(repository.importTravelRecords).toHaveBeenCalledTimes(1)
    expect(result.importedCount).toBe(2)
  })

  it('CreateTravelRecordDto implements the shared CreateTravelRecordRequest contract', () => {
    const sampleDto: import('./dto/create-travel-record.dto.js').CreateTravelRecordDto = {
      placeId: 'cn-admin-beijing',
      boundaryId: 'cn-admin-beijing-boundary',
      placeKind: 'CN_ADMIN',
      datasetVersion: 'cn-admin-2024-r1',
      displayName: '北京市',
      regionSystem: 'CN',
      adminType: 'MUNICIPALITY',
      typeLabel: '直辖市',
      parentLabel: '中国',
      subtitle: '直辖市 · 中国',
      startDate: null,
      endDate: null,
    } as const satisfies import('@trip-map/contracts').CreateTravelRecordRequest

    expect(sampleDto.startDate).toBeNull()
    expect(sampleDto.endDate).toBeNull()
  })

  describe('RecordsService.getStats', () => {
    it('delegates to repository and returns stats as-is', async () => {
      const repository = createRepositoryMock()
      const service = new RecordsService(repository as never)

      repository.getTravelStats.mockResolvedValueOnce({
        totalTrips: 3,
        uniquePlaces: 2,
        visitedAdministrativeAreas: 2,
        visitedCountries: 2,
        totalSupportedCountries: TOTAL_SUPPORTED_TRAVEL_COUNTRIES,
        memories: emptyMemories(),
      })

      const result = await service.getStats('user-1')

      expect(repository.getTravelStats).toHaveBeenCalledWith('user-1')
      expect(result).toEqual({
        totalTrips: 3,
        uniquePlaces: 2,
        visitedAdministrativeAreas: 2,
        visitedCountries: 2,
        totalSupportedCountries: TOTAL_SUPPORTED_TRAVEL_COUNTRIES,
        memories: emptyMemories(),
      })
    })

    it('correctly distinguishes totalTrips from uniquePlaces for multi-visit same place', async () => {
      const repository = createRepositoryMock()
      const service = new RecordsService(repository as never)

      repository.getTravelStats.mockResolvedValueOnce({
        totalTrips: 3,
        uniquePlaces: 1,
        visitedAdministrativeAreas: 1,
        visitedCountries: 1,
        totalSupportedCountries: TOTAL_SUPPORTED_TRAVEL_COUNTRIES,
        memories: emptyMemories(),
      })

      const result = await service.getStats('user-1')

      expect(result.totalTrips).toBe(3)
      expect(result.uniquePlaces).toBe(1)
      expect(result.visitedAdministrativeAreas).toBe(1)
      expect(result.visitedCountries).toBe(1)
      expect(result.totalSupportedCountries).toBe(TOTAL_SUPPORTED_TRAVEL_COUNTRIES)
    })
  })

  describe('RecordsRepository.getTravelStats', () => {
    it('keeps totalSupportedCountries aligned with authoritative overseas geometry coverage', () => {
      const authoritativeOverseasCountries = readAuthoritativeOverseasCountries()

      expect(authoritativeOverseasCountries.size).toBe(20)
      expect(TOTAL_SUPPORTED_TRAVEL_COUNTRIES).toBe(authoritativeOverseasCountries.size + 1)
    })

    it('returns empty dashboard memories for an account with no travel rows', async () => {
      const prisma = createPrismaMock()
      const repository = new RecordsRepository(prisma as never)

      prisma.userTravelRecord.findMany.mockResolvedValueOnce([])

      const result = await repository.getTravelStats('user-1')

      expect(result).toEqual({
        totalTrips: 0,
        uniquePlaces: 0,
        visitedAdministrativeAreas: 0,
        visitedCountries: 0,
        totalSupportedCountries: TOTAL_SUPPORTED_TRAVEL_COUNTRIES,
        memories: emptyMemories(),
      })
      expect(prisma.userTravelRecord.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        select: {
          id: true,
          placeId: true,
          boundaryId: true,
          displayName: true,
          parentLabel: true,
          startDate: true,
          notes: true,
          tags: true,
        },
      })
    })

    it('derives dashboard aggregates from current-user travel rows', async () => {
      const prisma = createPrismaMock()
      const repository = new RecordsRepository(prisma as never)

      prisma.userTravelRecord.findMany.mockResolvedValueOnce([
        {
          id: 'rec-beijing-1',
          placeId: 'cn-admin-beijing',
          boundaryId: 'cn-admin-beijing-boundary',
          displayName: '北京市',
          parentLabel: '中国',
          startDate: '2025-10-01',
          notes: '第一次到北京',
          tags: [],
        },
        {
          id: 'rec-beijing-2',
          placeId: 'cn-admin-beijing',
          boundaryId: 'cn-admin-beijing-boundary',
          displayName: '北京市',
          parentLabel: '中国',
          startDate: '2026-01-02',
          notes: null,
          tags: ['冬天'],
        },
        {
          id: 'rec-tokyo',
          placeId: 'jp-pref-tokyo',
          boundaryId: 'jp-pref-tokyo-boundary',
          displayName: '东京都',
          parentLabel: '日本',
          startDate: '2026-01-01',
          notes: '跨年',
          tags: [],
        },
        {
          id: 'rec-osaka',
          placeId: 'jp-pref-osaka',
          boundaryId: 'jp-pref-osaka-boundary',
          displayName: '大阪府',
          parentLabel: '日本',
          startDate: null,
          notes: '无日期也保留非时间聚合',
          tags: [],
        },
        {
          id: 'rec-california',
          placeId: 'us-state-california',
          boundaryId: 'us-state-california-boundary',
          displayName: '加利福尼亚州',
          parentLabel: '美国',
          startDate: 'invalid-date',
          notes: null,
          tags: [],
        },
        {
          id: 'rec-shanghai',
          placeId: 'cn-admin-shanghai',
          boundaryId: 'cn-admin-shanghai-boundary',
          displayName: '上海市',
          parentLabel: '中国 · 上海',
          startDate: '2026-02-03',
          notes: ' ',
          tags: [],
        },
      ])

      const result = await repository.getTravelStats('user-1')

      expect(result.totalTrips).toBe(6)
      expect(result.uniquePlaces).toBe(5)
      expect(result.visitedAdministrativeAreas).toBe(5)
      expect(result.visitedCountries).toBe(3)
      expect(result.memories.monthlyTrend).toEqual([
        { period: '2025-10', tripCount: 1 },
        { period: '2026-01', tripCount: 2 },
        { period: '2026-02', tripCount: 1 },
      ])
      expect(result.memories.yearlyTrend).toEqual([
        { period: '2025', tripCount: 1 },
        { period: '2026', tripCount: 3 },
      ])
      expect(result.memories.countryDistribution).toEqual([
        { countryLabel: '中国', tripCount: 3 },
        { countryLabel: '日本', tripCount: 2 },
        { countryLabel: '美国', tripCount: 1 },
      ])
      expect(result.memories.popularFootprints).toEqual([
        {
          placeId: 'cn-admin-beijing',
          displayName: '北京市',
          parentLabel: '中国',
          visitCount: 2,
          latestVisitDate: '2026-01-02',
        },
        {
          placeId: 'cn-admin-shanghai',
          displayName: '上海市',
          parentLabel: '中国 · 上海',
          visitCount: 1,
          latestVisitDate: '2026-02-03',
        },
        {
          placeId: 'jp-pref-tokyo',
          displayName: '东京都',
          parentLabel: '日本',
          visitCount: 1,
          latestVisitDate: '2026-01-01',
        },
        {
          placeId: 'jp-pref-osaka',
          displayName: '大阪府',
          parentLabel: '日本',
          visitCount: 1,
          latestVisitDate: null,
        },
        {
          placeId: 'us-state-california',
          displayName: '加利福尼亚州',
          parentLabel: '美国',
          visitCount: 1,
          latestVisitDate: null,
        },
      ])
      expect(result.memories.postcards).toEqual([
        {
          recordId: 'rec-shanghai',
          placeId: 'cn-admin-shanghai',
          displayName: '上海市',
          parentLabel: '中国 · 上海',
          startDate: '2026-02-03',
        },
        {
          recordId: 'rec-beijing-2',
          placeId: 'cn-admin-beijing',
          displayName: '北京市',
          parentLabel: '中国',
          startDate: '2026-01-02',
        },
        {
          recordId: 'rec-tokyo',
          placeId: 'jp-pref-tokyo',
          displayName: '东京都',
          parentLabel: '日本',
          startDate: '2026-01-01',
        },
        {
          recordId: 'rec-beijing-1',
          placeId: 'cn-admin-beijing',
          displayName: '北京市',
          parentLabel: '中国',
          startDate: '2025-10-01',
        },
      ])
      expect(result.memories.profile).toEqual([
        expect.objectContaining({ key: 'place-exploration', label: '地点探索', value: 83, max: 100 }),
        expect.objectContaining({ key: 'country-range', label: '国家跨度', value: 14, max: 100 }),
        expect.objectContaining({ key: 'repeat-visits', label: '重访温度', value: 33, max: 100 }),
        expect.objectContaining({ key: 'dated-memories', label: '日期完整度', value: 67, max: 100 }),
        expect.objectContaining({ key: 'story-detail', label: '摘记细节', value: 67, max: 100 }),
      ])
      expect(prisma.userTravelRecord.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'user-1' },
      }))
    })

    it('excludes unknown countries and impossible dates from coverage and trend aggregates', async () => {
      const prisma = createPrismaMock()
      const repository = new RecordsRepository(prisma as never)

      prisma.userTravelRecord.findMany.mockResolvedValueOnce([
        {
          id: 'rec-beijing',
          placeId: 'cn-admin-beijing',
          boundaryId: 'cn-admin-beijing-boundary',
          displayName: '北京市',
          parentLabel: '中国',
          startDate: '2026-01-02',
          notes: null,
          tags: [],
        },
        {
          id: 'rec-unknown-parent',
          placeId: 'unknown-parent',
          boundaryId: 'unknown-parent-boundary',
          displayName: '未知地点',
          parentLabel: null,
          startDate: '2026-02-30',
          notes: null,
          tags: [],
        },
        {
          id: 'rec-empty-parent',
          placeId: 'empty-parent',
          boundaryId: 'empty-parent-boundary',
          displayName: '空归属地点',
          parentLabel: '   ',
          startDate: '2026-99-99',
          notes: null,
          tags: [],
        },
      ])

      const result = await repository.getTravelStats('user-1')

      expect(result.totalTrips).toBe(3)
      expect(result.uniquePlaces).toBe(3)
      expect(result.visitedAdministrativeAreas).toBe(3)
      expect(result.visitedCountries).toBe(1)
      expect(result.memories.monthlyTrend).toEqual([
        { period: '2026-01', tripCount: 1 },
      ])
      expect(result.memories.yearlyTrend).toEqual([
        { period: '2026', tripCount: 1 },
      ])
      expect(result.memories.countryDistribution).toEqual([
        { countryLabel: '未知', tripCount: 2 },
        { countryLabel: '中国', tripCount: 1 },
      ])
      expect(result.memories.postcards).toEqual([
        {
          recordId: 'rec-beijing',
          placeId: 'cn-admin-beijing',
          displayName: '北京市',
          parentLabel: '中国',
          startDate: '2026-01-02',
        },
      ])
      expect(result.memories.profile).toEqual(expect.arrayContaining([
        expect.objectContaining({ key: 'country-range', value: 5 }),
        expect.objectContaining({ key: 'dated-memories', value: 33 }),
      ]))
    })
  })
})
