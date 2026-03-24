import { seedPoints } from '../data/seed-points'
import type { PersistedMapPoint } from '../types/map-point'
import {
  clearPointStorageSnapshot,
  loadPointStorageSnapshot,
  mergeSeedAndLocalPoints,
  POINT_STORAGE_KEY,
  savePointStorageSnapshot
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
    }
  }

  vi.stubGlobal('localStorage', localStorageMock)
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: localStorageMock
  })

  return localStorageMock
}

function createSavedPoint(): PersistedMapPoint {
  return {
    id: 'saved-japan',
    name: 'Japan',
    countryName: 'Japan',
    countryCode: 'JP',
    precision: 'city-high',
    cityName: 'Kyoto',
    fallbackNotice: null,
    lat: 35,
    lng: 135,
    x: 0.7,
    y: 0.45,
    source: 'saved',
    isFeatured: true,
    description: 'saved point',
    coordinatesLabel: '35.0000°N, 135.0000°E',
    createdAt: '2026-03-24T00:00:00.000Z',
    updatedAt: '2026-03-24T00:00:00.000Z'
  }
}

describe('point-storage service', () => {
  beforeEach(() => {
    installStorageMock()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('saves and loads a ready snapshot', () => {
    const snapshot = {
      version: 1 as const,
      userPoints: [createSavedPoint()],
      seedOverrides: [],
      deletedSeedIds: []
    }

    savePointStorageSnapshot(snapshot)

    expect(loadPointStorageSnapshot()).toEqual({
      status: 'ready',
      snapshot
    })
  })

  it('loads legacy version-1 snapshots that are missing new city fields', () => {
    window.localStorage.setItem(
      POINT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        userPoints: [
          {
            id: 'saved-legacy',
            name: 'Portugal',
            countryName: 'Portugal',
            countryCode: 'PT',
            lat: 38.7223,
            lng: -9.1393,
            x: 0.34,
            y: 0.28,
            source: 'saved',
            isFeatured: false,
            description: 'legacy',
            coordinatesLabel: '38.7223°N, 9.1393°W',
            createdAt: '2026-03-24T00:00:00.000Z',
            updatedAt: '2026-03-24T00:00:00.000Z'
          }
        ],
        seedOverrides: [],
        deletedSeedIds: []
      })
    )

    expect(loadPointStorageSnapshot()).toEqual({
      status: 'ready',
      snapshot: {
        version: 1,
        userPoints: [
          {
            id: 'saved-legacy',
            name: 'Portugal',
            countryName: 'Portugal',
            countryCode: 'PT',
            precision: 'country',
            cityName: null,
            fallbackNotice: null,
            lat: 38.7223,
            lng: -9.1393,
            x: 0.34,
            y: 0.28,
            source: 'saved',
            isFeatured: false,
            description: 'legacy',
            coordinatesLabel: '38.7223°N, 9.1393°W',
            createdAt: '2026-03-24T00:00:00.000Z',
            updatedAt: '2026-03-24T00:00:00.000Z'
          }
        ],
        seedOverrides: [],
        deletedSeedIds: []
      }
    })
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
          updatedAt: '2026-03-24T00:00:00.000Z'
        }
      ],
      ['seed-cairo']
    )

    expect(merged.some((point) => point.id === 'seed-cairo')).toBe(false)
    expect(merged.find((point) => point.id === 'seed-kyoto')?.name).toBe('Kyoto Updated')
    expect(merged.find((point) => point.id === 'saved-japan')?.name).toBe('Japan')
  })

  it('marks corrupt JSON as corrupt', () => {
    window.localStorage.setItem(POINT_STORAGE_KEY, '{not-valid-json')

    expect(loadPointStorageSnapshot()).toEqual({
      status: 'corrupt',
      snapshot: null
    })
  })

  it('marks wrong version snapshots as incompatible', () => {
    window.localStorage.setItem(
      POINT_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        userPoints: [],
        seedOverrides: [],
        deletedSeedIds: []
      })
    )

    expect(loadPointStorageSnapshot()).toEqual({
      status: 'incompatible',
      snapshot: null
    })
  })

  it('clears the snapshot from localStorage', () => {
    savePointStorageSnapshot({
      version: 1,
      userPoints: [createSavedPoint()],
      seedOverrides: [],
      deletedSeedIds: []
    })

    clearPointStorageSnapshot()

    expect(window.localStorage.getItem(POINT_STORAGE_KEY)).toBeNull()
  })
})
