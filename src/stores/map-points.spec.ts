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
      precision: 'city-high' as const,
      cityId: 'jp-kyoto',
      cityName: 'Kyoto',
      cityContextLabel: 'Japan · Kansai',
      fallbackNotice: null,
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

  it('clears an existing draft when selecting a saved or seed point', () => {
    const store = useMapPointsStore()

    store.bootstrapPoints()
    store.startDraftFromDetection(createDraft('detected-jp-1', 'Japan'))

    store.selectPointById('seed-kyoto')

    expect(store.draftPoint).toBeNull()
    expect(store.selectedPointId).toBe('seed-kyoto')
    expect(store.activePoint?.id).toBe('seed-kyoto')
    expect(store.displayPoints.some((point) => point.id === 'detected-jp-1')).toBe(false)
  })

  it('discards the active draft when clearing the active point', () => {
    const store = useMapPointsStore()

    store.startDraftFromDetection(createDraft('detected-jp-1', 'Japan'))

    store.clearActivePoint()

    expect(store.draftPoint).toBeNull()
    expect(store.selectedPointId).toBeNull()
    expect(store.drawerMode).toBeNull()
    expect(store.displayPoints.some((point) => point.id === 'detected-jp-1')).toBe(false)
  })

  it('converts a draft to a saved user point', () => {
    const store = useMapPointsStore()

    store.startDraftFromDetection(createDraft('detected-jp-1', 'Japan'))
    const savedPoint = store.saveDraftAsPoint()

    expect(savedPoint?.id.startsWith('saved-')).toBe(true)
    expect(savedPoint?.cityId).toBe('jp-kyoto')
    expect(savedPoint?.cityName).toBe('Kyoto')
    expect(savedPoint?.cityContextLabel).toBe('Japan · Kansai')
    expect(store.draftPoint).toBeNull()
    expect(store.userPoints).toHaveLength(1)
    expect(store.activePoint?.source).toBe('saved')
  })

  it('keeps city metadata and fallbackNotice after save and bootstrap', () => {
    const store = useMapPointsStore()

    store.startDraftFromDetection({
      ...createDraft('detected-jp-3', 'Kyoto'),
      fallbackNotice: '未识别到更精确城市，已回退到国家/地区'
    })
    store.saveDraftAsPoint()

    setActivePinia(createPinia())

    const rehydratedStore = useMapPointsStore()
    rehydratedStore.bootstrapPoints()

    expect(rehydratedStore.userPoints[0].cityName).toBe('Kyoto')
    expect(rehydratedStore.userPoints[0].fallbackNotice).toBe('未识别到更精确城市，已回退到国家/地区')
  })

  it('finds a saved point by exact cityId', () => {
    const store = useMapPointsStore()

    store.startDraftFromDetection(createDraft('detected-jp-1', 'Kyoto'))
    const savedPoint = store.saveDraftAsPoint()

    expect(savedPoint).not.toBeNull()
    expect(store.findSavedPointByCityId('jp-kyoto')?.id).toBe(savedPoint?.id)
    expect(store.findSavedPointByCityId('jp-osaka')).toBeNull()
  })

  it('reuses an existing saved point by cityId before creating a duplicate draft', () => {
    const store = useMapPointsStore()

    store.startDraftFromDetection(createDraft('detected-jp-1', 'Kyoto'))
    const savedPoint = store.saveDraftAsPoint()

    const decision = store.openSavedPointForCityOrStartDraft(createDraft('detected-jp-2', 'Kyoto retry'))

    expect(decision.type).toBe('reused')
    expect(decision.point.id).toBe(savedPoint?.id)
    expect(store.draftPoint).toBeNull()
    expect(store.selectedPointId).toBe(savedPoint?.id ?? null)
    expect(store.userPoints).toHaveLength(1)
  })

  it('hides a seed point from the merged display points', () => {
    const store = useMapPointsStore()

    store.bootstrapPoints()
    store.hideSeedPoint('seed-kyoto')

    expect(store.deletedSeedIds).toContain('seed-kyoto')
    expect(store.displayPoints.some((point) => point.id === 'seed-kyoto')).toBe(false)
  })
})
