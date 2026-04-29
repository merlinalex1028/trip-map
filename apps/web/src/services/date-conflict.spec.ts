import { describe, expect, it } from 'vitest'
import type { TravelRecord } from '@trip-map/contracts'
import { checkDateConflict } from './date-conflict'

function makeTravelRecord(overrides: Partial<TravelRecord> = {}): TravelRecord {
  return {
    id: 'record-1',
    placeId: 'place-1',
    boundaryId: 'boundary-1',
    placeKind: 'CN_ADMIN',
    datasetVersion: 'v1',
    displayName: '北京',
    regionSystem: 'CN',
    adminType: 'MUNICIPALITY',
    typeLabel: '市',
    parentLabel: '中国',
    subtitle: '',
    startDate: '2025-01-15',
    endDate: null,
    createdAt: '2025-01-16T00:00:00.000Z',
    updatedAt: '2025-01-16T00:00:00.000Z',
    notes: null,
    tags: [],
    ...overrides,
  }
}

describe('checkDateConflict', () => {
  it('returns empty array when no siblings exist', () => {
    const map = new Map<string, TravelRecord[]>()
    expect(checkDateConflict('p1', 'r1', '2025-01-01', '2025-01-05', map)).toEqual([])
  })

  it('returns empty array when only current record exists', () => {
    const record = makeTravelRecord({ id: 'r1', placeId: 'p1' })
    const map = new Map<string, TravelRecord[]>([['p1', [record]]])
    expect(checkDateConflict('p1', 'r1', '2025-01-01', '2025-01-05', map)).toEqual([])
  })

  it('detects overlapping date range', () => {
    const other = makeTravelRecord({ id: 'r2', placeId: 'p1', startDate: '2025-01-03', endDate: '2025-01-07' })
    const map = new Map<string, TravelRecord[]>([['p1', [other]]])
    expect(checkDateConflict('p1', 'r1', '2025-01-01', '2025-01-04', map)).toEqual(['2025-01-03 ~ 2025-01-07'])
  })

  it('returns empty array when dates do not overlap', () => {
    const other = makeTravelRecord({ id: 'r2', placeId: 'p1', startDate: '2025-01-10', endDate: '2025-01-15' })
    const map = new Map<string, TravelRecord[]>([['p1', [other]]])
    expect(checkDateConflict('p1', 'r1', '2025-01-01', '2025-01-05', map)).toEqual([])
  })

  it('returns empty array when newStart is null', () => {
    const other = makeTravelRecord({ id: 'r2', placeId: 'p1', startDate: '2025-01-03', endDate: '2025-01-07' })
    const map = new Map<string, TravelRecord[]>([['p1', [other]]])
    expect(checkDateConflict('p1', 'r1', null, '2025-01-04', map)).toEqual([])
  })

  it('returns empty array when other.startDate is null', () => {
    const other = makeTravelRecord({ id: 'r2', placeId: 'p1', startDate: null, endDate: null })
    const map = new Map<string, TravelRecord[]>([['p1', [other]]])
    expect(checkDateConflict('p1', 'r1', '2025-01-01', '2025-01-05', map)).toEqual([])
  })

  it('uses other.startDate as otherEnd when other.endDate is null', () => {
    const other = makeTravelRecord({ id: 'r2', placeId: 'p1', startDate: '2025-01-03', endDate: null })
    const map = new Map<string, TravelRecord[]>([['p1', [other]]])
    expect(checkDateConflict('p1', 'r1', '2025-01-01', '2025-01-04', map)).toEqual(['2025-01-03 ~ 2025-01-03'])
  })

  it('uses newStart as effectiveNewEnd when newEnd is null', () => {
    const other = makeTravelRecord({ id: 'r2', placeId: 'p1', startDate: '2025-01-03', endDate: '2025-01-07' })
    const map = new Map<string, TravelRecord[]>([['p1', [other]]])
    expect(checkDateConflict('p1', 'r1', '2025-01-05', null, map)).toEqual(['2025-01-03 ~ 2025-01-07'])
  })

  it('detects multiple conflicts', () => {
    const other1 = makeTravelRecord({ id: 'r2', placeId: 'p1', startDate: '2025-01-03', endDate: '2025-01-07' })
    const other2 = makeTravelRecord({ id: 'r3', placeId: 'p1', startDate: '2025-01-06', endDate: '2025-01-10' })
    const map = new Map<string, TravelRecord[]>([['p1', [other1, other2]]])
    expect(checkDateConflict('p1', 'r1', '2025-01-01', '2025-01-08', map)).toEqual([
      '2025-01-03 ~ 2025-01-07',
      '2025-01-06 ~ 2025-01-10',
    ])
  })
})
