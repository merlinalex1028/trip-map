import { createPinia, setActivePinia } from 'pinia'

import { useMapPointsStore } from './map-points'

describe('map-points store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

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
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function createDraft(id: string, name: string) {
    return {
      id,
      name,
      countryName: name,
      countryCode: 'JP',
      lat: 35,
      lng: 135,
      x: 0.7,
      y: 0.45,
      source: 'detected' as const,
      isFeatured: false,
      description: 'draft description',
      coordinatesLabel: '35.0000°N, 135.0000°E'
    }
  }

  it('creates and replaces a draft point from detected results', () => {
    const store = useMapPointsStore()

    store.bootstrapPoints()
    store.startDraftFromDetection(createDraft('detected-jp-1', 'Japan'))

    expect(store.draftPoint?.id).toBe('detected-jp-1')
    expect(store.selectedPointId).toBe('detected-jp-1')
    expect(store.displayPoints.some((point) => point.id === 'detected-jp-1')).toBe(true)

    store.replaceDraftFromDetection(createDraft('detected-jp-2', 'Tokyo'))

    expect(store.draftPoint?.id).toBe('detected-jp-2')
    expect(store.selectedPointId).toBe('detected-jp-2')
    expect(store.displayPoints.some((point) => point.id === 'detected-jp-1')).toBe(false)
  })

  it('converts a draft to a saved user point', () => {
    const store = useMapPointsStore()

    store.startDraftFromDetection(createDraft('detected-jp-1', 'Japan'))
    const savedPoint = store.saveDraftAsPoint()

    expect(savedPoint?.id.startsWith('saved-')).toBe(true)
    expect(store.draftPoint).toBeNull()
    expect(store.userPoints).toHaveLength(1)
    expect(store.activePoint?.source).toBe('saved')
  })

  it('hides a seed point from the merged display points', () => {
    const store = useMapPointsStore()

    store.bootstrapPoints()
    store.hideSeedPoint('seed-kyoto')

    expect(store.deletedSeedIds).toContain('seed-kyoto')
    expect(store.displayPoints.some((point) => point.id === 'seed-kyoto')).toBe(false)
  })
})
