import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearLegacyPointStorageSnapshot,
  loadLegacyPointStorageSnapshot,
  POINT_STORAGE_KEY,
} from './legacy-point-storage'

function makeSnapshot(overrides: Record<string, unknown> = {}) {
  return {
    version: 2,
    userPoints: [
      {
        id: 'saved-cn-beijing',
        name: '北京市',
        countryName: '中国',
        countryCode: 'CN',
        precision: 'city-high',
        cityId: null,
        cityName: '北京市',
        cityContextLabel: '中国 · 直辖市',
        placeId: 'cn-beijing',
        placeKind: 'CN_ADMIN',
        datasetVersion: 'v3.0-test',
        typeLabel: '直辖市',
        parentLabel: '中国',
        subtitle: '中国 · 直辖市',
        boundaryId: 'cn-beijing',
        boundaryDatasetVersion: 'v3.0-test',
        fallbackNotice: null,
        x: 0,
        y: 0,
        lat: 39.9042,
        lng: 116.4074,
        clickLat: 39.9042,
        clickLng: 116.4074,
        source: 'saved',
        isFeatured: false,
        description: '',
        coordinatesLabel: '39.9042°N, 116.4074°E',
        createdAt: '2026-04-12T00:00:00.000Z',
        updatedAt: '2026-04-12T00:00:00.000Z',
      },
    ],
    seedOverrides: [],
    deletedSeedIds: [],
    ...overrides,
  }
}

describe('legacy-point-storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns empty when no legacy key exists', () => {
    expect(loadLegacyPointStorageSnapshot()).toEqual({
      status: 'empty',
      snapshot: null,
      records: [],
    })
  })

  it('returns corrupt when the stored JSON is invalid', () => {
    window.localStorage.setItem(POINT_STORAGE_KEY, '{not-json')

    expect(loadLegacyPointStorageSnapshot()).toEqual({
      status: 'corrupt',
      snapshot: null,
      records: [],
    })
  })

  it('returns incompatible when the snapshot version is not 2', () => {
    window.localStorage.setItem(
      POINT_STORAGE_KEY,
      JSON.stringify(makeSnapshot({ version: 1 })),
    )

    expect(loadLegacyPointStorageSnapshot()).toEqual({
      status: 'incompatible',
      snapshot: null,
      records: [],
    })
  })

  it('returns ready and normalizes importable canonical records', () => {
    window.localStorage.setItem(POINT_STORAGE_KEY, JSON.stringify(makeSnapshot()))

    const result = loadLegacyPointStorageSnapshot()

    expect(result.status).toBe('ready')
    if (result.status !== 'ready') {
      throw new Error('Expected ready legacy snapshot')
    }

    expect(result.records).toEqual([
      {
        placeId: 'cn-beijing',
        boundaryId: 'cn-beijing',
        placeKind: 'CN_ADMIN',
        datasetVersion: 'v3.0-test',
        displayName: '北京市',
        regionSystem: 'CN',
        adminType: 'MUNICIPALITY',
        typeLabel: '直辖市',
        parentLabel: '中国',
        subtitle: '中国 · 直辖市',
      },
    ])
  })

  it('clearLegacyPointStorageSnapshot removes the legacy key', () => {
    window.localStorage.setItem(POINT_STORAGE_KEY, JSON.stringify(makeSnapshot()))

    clearLegacyPointStorageSnapshot()

    expect(window.localStorage.getItem(POINT_STORAGE_KEY)).toBeNull()
  })
})
