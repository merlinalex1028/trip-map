import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearLegacyPointStorageSnapshot,
  loadLegacyPointStorageSnapshot,
  POINT_STORAGE_KEY,
} from './legacy-point-storage'

function makeLegacyUserPoint(overrides: Record<string, unknown> = {}) {
  return {
    source: 'saved',
    placeKind: 'CN_ADMIN',
    placeId: 'cn-admin-beijing',
    boundaryId: 'cn-admin-beijing-boundary',
    datasetVersion: 'cn-admin-2024-r1',
    displayName: '北京市',
    regionSystem: 'CN',
    adminType: 'MUNICIPALITY',
    typeLabel: '直辖市',
    parentLabel: '中国',
    subtitle: '直辖市 · 中国',
    ...overrides,
  }
}

beforeEach(() => {
  clearLegacyPointStorageSnapshot()
  window.localStorage.clear()
})

describe('loadLegacyPointStorageSnapshot', () => {
  it('normalizes legacy user points with startDate and endDate as null (D-08)', () => {
    window.localStorage.setItem(
      POINT_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        userPoints: [makeLegacyUserPoint()],
        seedOverrides: [],
        deletedSeedIds: [],
      }),
    )

    const result = loadLegacyPointStorageSnapshot()

    expect(result.status).toBe('ready')
    expect(result.records).toHaveLength(1)
    expect(result.records[0]).toMatchObject({
      placeId: 'cn-admin-beijing',
      startDate: null,
      endDate: null,
    })
  })

  it('does not fabricate dates from createdAt on legacy records (D-08)', () => {
    window.localStorage.setItem(
      POINT_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        userPoints: [makeLegacyUserPoint({ createdAt: '2024-06-01T00:00:00.000Z' })],
        seedOverrides: [],
        deletedSeedIds: [],
      }),
    )

    const result = loadLegacyPointStorageSnapshot()

    expect(result.status).toBe('ready')
    expect(result.records[0]?.startDate).toBeNull()
    expect(result.records[0]?.endDate).toBeNull()
  })

  it('rejects malformed legacy user points without fabricating dates', () => {
    window.localStorage.setItem(
      POINT_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        userPoints: [{ ...makeLegacyUserPoint(), source: 'detected' }],
        seedOverrides: [],
        deletedSeedIds: [],
      }),
    )

    const result = loadLegacyPointStorageSnapshot()

    expect(result.status).toBe('ready')
    expect(result.records).toHaveLength(0)
  })

  it('returns empty for missing snapshot', () => {
    const result = loadLegacyPointStorageSnapshot()

    expect(result.status).toBe('empty')
    expect(result.records).toEqual([])
  })
})
