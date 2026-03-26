import { createPinia, setActivePinia } from 'pinia'

import { getBoundaryByCityId } from '../services/city-boundaries'
import { useMapUiStore } from './map-ui'
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
      boundaryId: null,
      boundaryDatasetVersion: null,
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

  function createCandidate(overrides: Record<string, unknown> = {}) {
    return {
      cityId: 'jp-kyoto',
      cityName: 'Kyoto',
      contextLabel: 'Japan · Kansai',
      matchLevel: 'high' as const,
      distanceKm: 2.4,
      statusHint: '更接近点击位置' as const,
      ...overrides
    }
  }

  function createCityDraft(cityId: string, overrides: Record<string, unknown> = {}) {
    const boundary = getBoundaryByCityId(cityId)

    if (!boundary) {
      throw new Error(`Missing boundary fixture for ${cityId}`)
    }

    return {
      ...createDraft(`detected-${cityId}`, boundary.cityName),
      countryCode: cityId.startsWith('pt-') ? 'PT' : 'JP',
      name: boundary.cityName,
      cityId,
      cityName: boundary.cityName,
      cityContextLabel: cityId.startsWith('pt-') ? 'Portugal' : 'Japan · Kansai',
      boundaryId: boundary.boundaryId,
      boundaryDatasetVersion: boundary.datasetVersion,
      ...overrides
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
      fallbackNotice: '未能可靠确认城市，已提供国家/地区继续记录'
    })
    store.saveDraftAsPoint()

    setActivePinia(createPinia())

    const rehydratedStore = useMapPointsStore()
    rehydratedStore.bootstrapPoints()

    expect(rehydratedStore.userPoints[0].cityName).toBe('Kyoto')
    expect(rehydratedStore.userPoints[0].fallbackNotice).toBe('未能可靠确认城市，已提供国家/地区继续记录')
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
    const mapUiStore = useMapUiStore()

    store.startDraftFromDetection(createDraft('detected-jp-1', 'Kyoto'))
    const savedPoint = store.saveDraftAsPoint()
    store.startPendingCitySelection(createDraft('detected-jp-2', 'Japan retry'), [createCandidate()])

    const decision = store.confirmPendingCitySelection(createCandidate())

    expect(decision?.type).toBe('reused')
    expect(decision?.point.id).toBe(savedPoint?.id)
    expect(store.draftPoint).toBeNull()
    expect(store.pendingCitySelection).toBeNull()
    expect(store.selectedPointId).toBe(savedPoint?.id ?? null)
    expect(store.userPoints).toHaveLength(1)
    expect(mapUiStore.interactionNotice?.message).toBe('已打开你记录过的Kyoto')
  })

  it('starts a new draft from the selected city candidate when no saved city exists', () => {
    const store = useMapPointsStore()

    store.startPendingCitySelection(createDraft('detected-jp-1', 'Japan'), [createCandidate()])
    const decision = store.confirmPendingCitySelection(createCandidate())

    expect(decision?.type).toBe('created-draft')
    expect(store.drawerMode).toBe('detected-preview')
    expect(store.activePoint?.name).toBe('Kyoto')
    expect(store.activePoint?.cityId).toBe('jp-kyoto')
    expect(store.activePoint?.cityContextLabel).toBe('Japan · Kansai')
    expect(store.activePoint?.fallbackNotice).toBeNull()
  })

  it('attaches exact boundary identity when confirming a concrete city candidate', () => {
    const store = useMapPointsStore()
    const boundary = getBoundaryByCityId('jp-kyoto')

    expect(boundary).not.toBeNull()

    store.startPendingCitySelection(
      {
        ...createDraft('detected-jp-fallback', 'Japan'),
        name: 'Japan',
        cityId: null,
        cityName: null,
        cityContextLabel: 'Japan',
        precision: 'country',
        fallbackNotice: '未能可靠确认城市，已提供国家/地区继续记录'
      },
      [createCandidate()]
    )

    const decision = store.confirmPendingCitySelection(createCandidate())

    expect(decision?.type).toBe('created-draft')
    expect(store.draftPoint?.boundaryId).toBe(boundary?.boundaryId ?? null)
    expect(store.draftPoint?.boundaryDatasetVersion).toBe(boundary?.datasetVersion ?? null)
    expect(store.selectedBoundaryId).toBe(boundary?.boundaryId ?? null)
    expect(store.savedBoundaryIds).toEqual([])
  })

  it('continues with the fallback country draft from pending city selection', () => {
    const store = useMapPointsStore()

    store.startPendingCitySelection(
      {
        ...createDraft('detected-pt-1', 'Portugal'),
        countryCode: 'PT',
        cityId: null,
        cityName: null,
        cityContextLabel: 'Portugal',
        precision: 'country',
        fallbackNotice: '未能可靠确认城市，已提供国家/地区继续记录'
      },
      [createCandidate({ cityId: 'pt-lisbon', cityName: 'Lisbon', contextLabel: 'Portugal' })]
    )

    const fallbackPoint = store.continuePendingWithFallback()

    expect(fallbackPoint?.name).toBe('Portugal')
    expect(store.pendingCitySelection).toBeNull()
    expect(store.drawerMode).toBe('detected-preview')
    expect(store.activePoint?.fallbackNotice).toBe('未能可靠确认城市，已提供国家/地区继续记录')
  })

  it('derives saved weak-highlight ids and selected strong-highlight id from point state', () => {
    const store = useMapPointsStore()

    store.startDraftFromDetection(createCityDraft('jp-kyoto'))
    const kyotoPoint = store.saveDraftAsPoint()

    store.startDraftFromDetection(
      createCityDraft('pt-lisbon', {
        countryName: 'Portugal',
        countryCode: 'PT',
        lat: 38.7223,
        lng: -9.1393,
        x: 0.47,
        y: 0.37,
        coordinatesLabel: '38.7223°N, 9.1393°W'
      })
    )
    const lisbonPoint = store.saveDraftAsPoint()

    expect(kyotoPoint).not.toBeNull()
    expect(lisbonPoint).not.toBeNull()

    store.selectPointById(kyotoPoint!.id)

    expect(store.selectedBoundaryId).toBe(getBoundaryByCityId('jp-kyoto')?.boundaryId ?? null)
    expect(store.savedBoundaryIds).toEqual([
      getBoundaryByCityId('jp-kyoto')?.boundaryId,
      getBoundaryByCityId('pt-lisbon')?.boundaryId
    ])
  })

  it('fails closed for fallback and legacy points that have no boundary identity', () => {
    const store = useMapPointsStore()

    store.startDraftFromDetection({
      ...createDraft('detected-legacy-country', 'Japan'),
      name: 'Japan',
      precision: 'country',
      cityId: null,
      cityName: null,
      cityContextLabel: 'Japan',
      boundaryId: null,
      boundaryDatasetVersion: null
    })
    const legacyPoint = store.saveDraftAsPoint()

    store.selectPointById(legacyPoint!.id)

    expect(store.selectedBoundaryId).toBeNull()
    expect(store.savedBoundaryIds).toEqual([])

    store.startPendingCitySelection(
      {
        ...createDraft('detected-pt-fallback', 'Portugal'),
        countryName: 'Portugal',
        countryCode: 'PT',
        cityId: null,
        cityName: null,
        cityContextLabel: 'Portugal',
        precision: 'country',
        fallbackNotice: '未能可靠确认城市，已提供国家/地区继续记录'
      },
      [createCandidate({ cityId: 'pt-lisbon', cityName: 'Lisbon', contextLabel: 'Portugal' })]
    )

    store.continuePendingWithFallback()

    expect(store.selectedBoundaryId).toBeNull()
    expect(store.savedBoundaryIds).toEqual([])
  })

  it('hides a seed point from the merged display points', () => {
    const store = useMapPointsStore()

    store.bootstrapPoints()
    store.hideSeedPoint('seed-kyoto')

    expect(store.deletedSeedIds).toContain('seed-kyoto')
    expect(store.displayPoints.some((point) => point.id === 'seed-kyoto')).toBe(false)
  })
})
