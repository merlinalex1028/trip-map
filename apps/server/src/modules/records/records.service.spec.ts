import { BadRequestException } from '@nestjs/common'
import type { UserTravelRecord } from '@prisma/client'
import { describe, expect, it, vi } from 'vitest'

import type { CreateTravelRecordDto } from './dto/create-travel-record.dto.js'
import { RecordsService } from './records.service.js'

function createRepositoryMock() {
  return {
    createSmokeRecord: vi.fn(),
    findAllTravelRecords: vi.fn(),
    createTravelRecord: vi.fn(),
    importTravelRecords: vi.fn(),
    deleteTravelRecordByPlaceId: vi.fn(),
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
})
