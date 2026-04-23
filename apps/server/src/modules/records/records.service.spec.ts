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
    createdAt: new Date('2026-04-20T00:00:00.000Z'),
    updatedAt: new Date('2026-04-20T00:00:00.000Z'),
    ...overrides,
  } as UserTravelRecord
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
        visitedCountries: 2,
        totalSupportedCountries: 21,
      })

      const result = await service.getStats('user-1')

      expect(repository.getTravelStats).toHaveBeenCalledWith('user-1')
      expect(result).toEqual({
        totalTrips: 3,
        uniquePlaces: 2,
        visitedCountries: 2,
        totalSupportedCountries: 21,
      })
    })

    it('correctly distinguishes totalTrips from uniquePlaces for multi-visit same place', async () => {
      const repository = createRepositoryMock()
      const service = new RecordsService(repository as never)

      repository.getTravelStats.mockResolvedValueOnce({
        totalTrips: 3,
        uniquePlaces: 1,
        visitedCountries: 1,
        totalSupportedCountries: 21,
      })

      const result = await service.getStats('user-1')

      expect(result.totalTrips).toBe(3)
      expect(result.uniquePlaces).toBe(1)
      expect(result.visitedCountries).toBe(1)
      expect(result.totalSupportedCountries).toBe(21)
    })
  })

  describe('RecordsRepository.getTravelStats', () => {
    it('keeps totalSupportedCountries aligned with authoritative overseas geometry coverage', () => {
      const authoritativeOverseasCountries = readAuthoritativeOverseasCountries()

      expect(authoritativeOverseasCountries.size).toBe(20)
      expect(TOTAL_SUPPORTED_TRAVEL_COUNTRIES).toBe(authoritativeOverseasCountries.size + 1)
    })

    it('returns visitedCountries based on distinct parentLabel country extraction', async () => {
      const prisma = createPrismaMock()
      const repository = new RecordsRepository(prisma as never)

      prisma.userTravelRecord.count.mockResolvedValueOnce(3)
      prisma.userTravelRecord.findMany
        .mockResolvedValueOnce([
          { placeId: 'cn-admin-beijing' },
          { placeId: 'jp-pref-tokyo' },
          { placeId: 'us-state-california' },
        ])
        .mockResolvedValueOnce([
          { parentLabel: '中国' },
          { parentLabel: '日本' },
          { parentLabel: '美国' },
        ])

      const result = await repository.getTravelStats('user-1')

      expect(result).toEqual({
        totalTrips: 3,
        uniquePlaces: 3,
        visitedCountries: 3,
        totalSupportedCountries: TOTAL_SUPPORTED_TRAVEL_COUNTRIES,
      })
      expect(prisma.userTravelRecord.findMany).toHaveBeenNthCalledWith(1, {
        where: { userId: 'user-1' },
        select: { placeId: true },
        distinct: ['placeId'],
      })
      expect(prisma.userTravelRecord.findMany).toHaveBeenNthCalledWith(2, {
        where: { userId: 'user-1' },
        select: { parentLabel: true },
        distinct: ['parentLabel'],
      })
    })

    it('does not inflate visitedCountries when same country has multiple admin1 places', async () => {
      const prisma = createPrismaMock()
      const repository = new RecordsRepository(prisma as never)

      prisma.userTravelRecord.count.mockResolvedValueOnce(3)
      prisma.userTravelRecord.findMany
        .mockResolvedValueOnce([
          { placeId: 'cn-admin-beijing' },
          { placeId: 'cn-admin-shanghai' },
          { placeId: 'jp-pref-tokyo' },
        ])
        .mockResolvedValueOnce([
          { parentLabel: '中国 · 北京' },
          { parentLabel: '中国 · 上海' },
          { parentLabel: '日本' },
        ])

      const result = await repository.getTravelStats('user-1')

      expect(result.totalTrips).toBe(3)
      expect(result.uniquePlaces).toBe(3)
      expect(result.visitedCountries).toBe(2)
    })

    it('does not inflate visitedCountries for multi-visit same place', async () => {
      const prisma = createPrismaMock()
      const repository = new RecordsRepository(prisma as never)

      prisma.userTravelRecord.count.mockResolvedValueOnce(3)
      prisma.userTravelRecord.findMany
        .mockResolvedValueOnce([{ placeId: 'cn-admin-beijing' }])
        .mockResolvedValueOnce([{ parentLabel: '中国' }])

      const result = await repository.getTravelStats('user-1')

      expect(result.totalTrips).toBe(3)
      expect(result.uniquePlaces).toBe(1)
      expect(result.visitedCountries).toBe(1)
    })
  })
})
