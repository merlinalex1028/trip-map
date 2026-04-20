import type { UserTravelRecord } from '@prisma/client'
import { describe, expect, it, vi } from 'vitest'

import type { CreateTravelRecordDto } from './dto/create-travel-record.dto.js'
import { RecordsRepository } from './records.repository.js'

function createPrismaMock() {
  return {
    userTravelRecord: {
      create: vi.fn(),
      findMany: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
      upsert: vi.fn(),
    },
    smokeRecord: {
      create: vi.fn(),
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

describe('RecordsRepository', () => {
  it('createTravelRecord calls prisma.userTravelRecord.create instead of upsert and includes date fields', async () => {
    const prisma = createPrismaMock()
    const repository = new RecordsRepository(prisma as never)
    const input = baseInput({ startDate: '2025-10-01', endDate: '2025-10-07' })
    const created = baseRecord({ startDate: '2025-10-01', endDate: '2025-10-07' })

    prisma.userTravelRecord.create.mockResolvedValueOnce(created)

    await expect(repository.createTravelRecord('user-1', input)).resolves.toEqual(created)

    expect(prisma.userTravelRecord.create).toHaveBeenCalledTimes(1)
    expect(prisma.userTravelRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        startDate: '2025-10-01',
        endDate: '2025-10-07',
      }),
    })
    expect(prisma.userTravelRecord.upsert).not.toHaveBeenCalled()
  })

  it('createTravelRecord normalizes undefined startDate/endDate to null', async () => {
    const prisma = createPrismaMock()
    const repository = new RecordsRepository(prisma as never)
    const input = baseInput({ startDate: undefined, endDate: undefined })

    prisma.userTravelRecord.create.mockResolvedValueOnce(baseRecord())

    await repository.createTravelRecord('user-1', input)

    expect(prisma.userTravelRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        startDate: null,
        endDate: null,
      }),
    })
  })

  it('importTravelRecords de-duplicates by placeId plus startDate plus endDate', async () => {
    const prisma = createPrismaMock()
    const repository = new RecordsRepository(prisma as never)
    const inputs = [
      baseInput({ placeId: 'x', startDate: null, endDate: null }),
      baseInput({ placeId: 'x', startDate: '2025-10-01', endDate: null }),
    ]

    prisma.userTravelRecord.findMany
      .mockResolvedValueOnce([{ placeId: 'x', startDate: null, endDate: null }])
      .mockResolvedValueOnce([
        baseRecord({ placeId: 'x', startDate: null, endDate: null }),
        baseRecord({ id: 'rec-2', placeId: 'x', startDate: '2025-10-01', endDate: null }),
      ])
    prisma.userTravelRecord.createMany.mockResolvedValueOnce({ count: 1 })

    const result = await repository.importTravelRecords('user-1', inputs)

    expect(prisma.userTravelRecord.createMany).toHaveBeenCalledTimes(1)
    expect(prisma.userTravelRecord.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          placeId: 'x',
          startDate: '2025-10-01',
          endDate: null,
        }),
      ],
      skipDuplicates: true,
    })
    expect(result.importedCount).toBe(1)
    expect(result.finalCount).toBe(2)
  })

  it('importTravelRecords short-circuits on empty input', async () => {
    const prisma = createPrismaMock()
    const repository = new RecordsRepository(prisma as never)
    const existing = [baseRecord()]

    prisma.userTravelRecord.findMany.mockResolvedValueOnce(existing)

    const result = await repository.importTravelRecords('user-1', [])

    expect(prisma.userTravelRecord.createMany).not.toHaveBeenCalled()
    expect(result).toEqual({
      importedCount: 0,
      mergedDuplicateCount: 0,
      finalCount: existing.length,
      records: existing,
    })
  })
})
