import { PHASE12_RESOLVED_BEIJING } from '@trip-map/contracts'

import { seedPoints } from '../data/seed-points'
import type { PersistedMapPoint } from '../types/map-point'
import {
  clearPointStorageSnapshot,
  loadPointStorageSnapshot,
  mergeSeedAndLocalPoints,
  POINT_STORAGE_KEY,
  savePointStorageSnapshot,
} from './point-storage'

function installStorageMock() {
  const storage = new Map<string, string>()
  const localStorageMock = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
    clear: () => {
      storage.clear()
    },
  }

  vi.stubGlobal('localStorage', localStorageMock)
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: localStorageMock,
  })
}

function createSavedPoint(): PersistedMapPoint {
  return {
    id: 'saved-beijing',
    name: PHASE12_RESOLVED_BEIJING.displayName,
    countryName: '中国',
    countryCode: 'CN',
    precision: 'city-high',
    cityId: null,
    cityName: PHASE12_RESOLVED_BEIJING.displayName,
    cityContextLabel: PHASE12_RESOLVED_BEIJING.subtitle,
    placeId: PHASE12_RESOLVED_BEIJING.placeId,
    placeKind: PHASE12_RESOLVED_BEIJING.placeKind,
    datasetVersion: PHASE12_RESOLVED_BEIJING.datasetVersion,
    typeLabel: PHASE12_RESOLVED_BEIJING.typeLabel,
    parentLabel: PHASE12_RESOLVED_BEIJING.parentLabel,
    subtitle: PHASE12_RESOLVED_BEIJING.subtitle,
    boundaryId: PHASE12_RESOLVED_BEIJING.boundaryId,
    boundaryDatasetVersion: PHASE12_RESOLVED_BEIJING.datasetVersion,
    fallbackNotice: null,
    lat: 39.9042,
    lng: 116.4074,
    clickLat: 39.9042,
    clickLng: 116.4074,
    x: 0.74,
    y: 0.31,
    source: 'saved',
    isFeatured: true,
    description: 'canonical saved point',
    coordinatesLabel: '39.9042°N, 116.4074°E',
    createdAt: '2026-03-30T00:00:00.000Z',
    updatedAt: '2026-03-30T00:00:00.000Z',
  }
}

describe('point-storage service', () => {
  beforeEach(() => {
    installStorageMock()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('persists canonical summary identity and raw click coordinates in a v2 snapshot', () => {
    const snapshot = {
      version: 2 as const,
      userPoints: [createSavedPoint()],
      seedOverrides: [],
      deletedSeedIds: [],
    }

    savePointStorageSnapshot(snapshot)

    expect(POINT_STORAGE_KEY).toBe('trip-map:point-state:v2')
    expect(loadPointStorageSnapshot()).toEqual({
      status: 'ready',
      snapshot,
    })
  })

  it('marks legacy version-1 snapshots as incompatible instead of migrating them', () => {
    window.localStorage.setItem(
      POINT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        userPoints: [createSavedPoint()],
        seedOverrides: [],
        deletedSeedIds: [],
      }),
    )

    expect(loadPointStorageSnapshot()).toEqual({
      status: 'incompatible',
      snapshot: null,
    })
  })

  it('preserves canonical fields when saving and loading user points', () => {
    savePointStorageSnapshot({
      version: 2,
      userPoints: [createSavedPoint()],
      seedOverrides: [],
      deletedSeedIds: [],
    })

    const result = loadPointStorageSnapshot()

    expect(result.status).toBe('ready')
    expect(result.snapshot?.userPoints[0]).toEqual(
      expect.objectContaining({
        placeId: PHASE12_RESOLVED_BEIJING.placeId,
        placeKind: PHASE12_RESOLVED_BEIJING.placeKind,
        boundaryId: PHASE12_RESOLVED_BEIJING.boundaryId,
        datasetVersion: PHASE12_RESOLVED_BEIJING.datasetVersion,
        clickLat: 39.9042,
        clickLng: 116.4074,
        typeLabel: '直辖市',
        parentLabel: '中国',
        subtitle: '中国 · 直辖市',
      }),
    )
  })

  it('applies seed overrides and deletedSeedIds when merging display points', () => {
    const merged = mergeSeedAndLocalPoints(
      seedPoints,
      [createSavedPoint()],
      [
        {
          id: 'seed-kyoto',
          name: 'Kyoto Updated',
          description: 'updated description',
          isFeatured: true,
          updatedAt: '2026-03-24T00:00:00.000Z',
        },
      ],
      ['seed-cairo'],
    )

    expect(merged.some((point) => point.id === 'seed-cairo')).toBe(false)
    expect(merged.find((point) => point.id === 'seed-kyoto')?.name).toBe('Kyoto Updated')
    expect(merged.find((point) => point.id === 'saved-beijing')?.placeId).toBe(
      PHASE12_RESOLVED_BEIJING.placeId,
    )
  })

  it('marks corrupt JSON as corrupt', () => {
    window.localStorage.setItem(POINT_STORAGE_KEY, '{not-valid-json')

    expect(loadPointStorageSnapshot()).toEqual({
      status: 'corrupt',
      snapshot: null,
    })
  })

  it('clears the snapshot from localStorage', () => {
    savePointStorageSnapshot({
      version: 2,
      userPoints: [createSavedPoint()],
      seedOverrides: [],
      deletedSeedIds: [],
    })

    clearPointStorageSnapshot()

    expect(window.localStorage.getItem(POINT_STORAGE_KEY)).toBeNull()
  })
})
