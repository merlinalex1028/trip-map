import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, nextTick, shallowRef } from 'vue'

import { getBoundaryByCityId } from '../services/city-boundaries'
import { useMapPointsStore } from '../stores/map-points'
import { useMapUiStore } from '../stores/map-ui'
import type { GeoCoordinates, GeoDetectionResult } from '../types/geo'
import WorldMapStage from './WorldMapStage.vue'

const popupAnchoringMock = vi.hoisted(() => ({
  cleanup: vi.fn(),
  lastOptions: null as
    | {
        reference: () => Element | null
      }
    | null
}))

const lookupCountryRegionByCoordinates = vi.fn<
  (geo: GeoCoordinates) => GeoDetectionResult | null
>()
const isLowConfidenceBoundaryHit = vi.fn<
  (geo: GeoCoordinates, result: GeoDetectionResult | null) => boolean
>(() => false)

vi.mock('../services/geo-lookup', () => ({
  lookupCountryRegionByCoordinates,
  isLowConfidenceBoundaryHit
}))

vi.mock('../composables/usePopupAnchoring', () => ({
  usePopupAnchoring: (options: { reference: () => Element | null }) => {
    popupAnchoringMock.lastOptions = options

    return {
      floatingStyles: computed(() => ({
        left: '24px',
        top: '32px'
      })),
      placement: shallowRef('top-start'),
      collisionState: shallowRef('stable'),
      availableHeight: shallowRef(320),
      updatePosition: vi.fn(),
      cleanup: popupAnchoringMock.cleanup
    }
  }
}))

function installFrame(surface: HTMLDivElement) {
  Object.defineProperty(surface, 'getBoundingClientRect', {
    value: () => ({
      left: 0,
      top: 0,
      width: 1600,
      height: 800,
      right: 1600,
      bottom: 800,
      x: 0,
      y: 0,
      toJSON: () => ({})
    })
  })
}

function clickPointFromGeo(lat: number, lng: number, offsetX = 0, offsetY = 0) {
  return {
    clientX: 160 + ((lng + 180) / 360) * 1280 + offsetX,
    clientY: 80 + ((90 - lat) / 180) * 640 + offsetY
  }
}

function createDetectionResult(overrides: Partial<GeoDetectionResult> = {}): GeoDetectionResult {
  return {
    kind: 'country',
    countryCode: 'JP',
    countryName: 'Japan',
    regionName: null,
    displayName: 'Japan',
    precision: 'city-high',
    cityId: 'jp-kyoto',
    cityName: 'Kyoto',
    cityCandidates: [
      {
        cityId: 'jp-kyoto',
        cityName: 'Kyoto',
        contextLabel: 'Japan · Kansai',
        matchLevel: 'high',
        distanceKm: 2.2,
        statusHint: '更接近点击位置'
      },
      {
        cityId: 'jp-osaka',
        cityName: 'Osaka',
        contextLabel: 'Japan · Kansai',
        matchLevel: 'possible',
        distanceKm: 18.5,
        statusHint: '可能位置，需要确认'
      },
      {
        cityId: 'jp-kobe',
        cityName: 'Kobe',
        contextLabel: 'Japan · Kansai',
        matchLevel: 'possible',
        distanceKm: 31.4,
        statusHint: '可能位置，需要确认'
      },
      {
        cityId: 'jp-nara',
        cityName: 'Nara',
        contextLabel: 'Japan · Kansai',
        matchLevel: 'possible',
        distanceKm: 33.1,
        statusHint: '可能位置，需要确认'
      }
    ],
    fallbackNotice: null,
    lat: 35.0116,
    lng: 135.7681,
    confidence: 0.99,
    ...overrides
  }
}

function createCityDraft(cityId: string, overrides: Record<string, unknown> = {}) {
  const boundary = getBoundaryByCityId(cityId)

  if (!boundary) {
    throw new Error(`Missing boundary fixture for ${cityId}`)
  }

  const isPortugal = cityId.startsWith('pt-')

  return {
    id: `detected-${cityId}`,
    name: boundary.cityName,
    countryName: isPortugal ? 'Portugal' : 'Japan',
    countryCode: isPortugal ? 'PT' : 'JP',
    precision: 'city-high' as const,
    cityId,
    cityName: boundary.cityName,
    cityContextLabel: isPortugal ? 'Portugal' : 'Japan · Kansai',
    boundaryId: boundary.boundaryId,
    boundaryDatasetVersion: boundary.datasetVersion,
    fallbackNotice: null,
    lat: isPortugal ? 38.7223 : 35.0116,
    lng: isPortugal ? -9.1393 : 135.7681,
    x: isPortugal ? 0.47 : 0.68,
    y: isPortugal ? 0.37 : 0.42,
    source: 'detected' as const,
    isFeatured: false,
    description: 'saved point',
    coordinatesLabel: isPortugal ? '38.7223°N, 9.1393°W' : '35.0116°N, 135.7681°E',
    ...overrides
  }
}

describe('WorldMapStage', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
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
    lookupCountryRegionByCoordinates.mockReset()
    lookupCountryRegionByCoordinates.mockImplementation((geo: { lat: number; lng: number }) =>
      createDetectionResult({
        lat: geo.lat,
        lng: geo.lng
      })
    )
    isLowConfidenceBoundaryHit.mockReset()
    isLowConfidenceBoundaryHit.mockReturnValue(false)
    popupAnchoringMock.lastOptions = null
    popupAnchoringMock.cleanup.mockReset()

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)

      return 0
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('opens a candidate-first confirmation state instead of immediately creating a draft', async () => {
    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    const surface = wrapper.get('.world-map-stage__surface').element as HTMLDivElement
    installFrame(surface)

    await wrapper.get('.world-map-stage__surface').trigger('click', {
      clientX: 1180,
      clientY: 360
    })
    await flushPromises()

    const mapPointsStore = useMapPointsStore()

    expect(mapPointsStore.summaryMode).toBe('candidate-select')
    expect(mapPointsStore.drawerMode).toBeNull()
    expect(mapPointsStore.draftPoint).toBeNull()
    expect(mapPointsStore.activePoint).toBeNull()
    expect(mapPointsStore.pendingCitySelection?.cityCandidates).toHaveLength(4)
  })

  it('keeps the fallback country path and copy inside pending candidate selection', async () => {
    lookupCountryRegionByCoordinates.mockImplementationOnce((geo: { lat: number; lng: number }) =>
      createDetectionResult({
        countryCode: 'PT',
        countryName: 'Portugal',
        displayName: 'Portugal',
        precision: 'city-possible',
        cityId: null,
        cityName: null,
        cityCandidates: [
          {
            cityId: 'pt-lisbon',
            cityName: 'Lisbon',
            contextLabel: 'Portugal',
            matchLevel: 'possible',
            distanceKm: 24,
            statusHint: '可能位置，需要确认'
          }
        ],
        fallbackNotice: '未能可靠确认城市，已提供国家/地区继续记录',
        lat: geo.lat,
        lng: geo.lng,
        confidence: 0.95
      })
    )

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    const surface = wrapper.get('.world-map-stage__surface').element as HTMLDivElement
    installFrame(surface)

    await wrapper.get('.world-map-stage__surface').trigger('click', {
      clientX: 420,
      clientY: 280
    })
    await flushPromises()

    const mapPointsStore = useMapPointsStore()

    expect(mapPointsStore.summaryMode).toBe('candidate-select')
    expect(mapPointsStore.drawerMode).toBeNull()
    expect(mapPointsStore.pendingCitySelection?.fallbackPoint.name).toBe('Portugal')
    expect(mapPointsStore.pendingCitySelection?.fallbackPoint.fallbackNotice).toBe(
      '未能可靠确认城市，已提供国家/地区继续记录'
    )
  })

  it('represents a realistic near-city click through the actual candidate flow', async () => {
    const actualGeoLookup = await vi.importActual<typeof import('../services/geo-lookup')>(
      '../services/geo-lookup'
    )
    lookupCountryRegionByCoordinates.mockImplementation(actualGeoLookup.lookupCountryRegionByCoordinates)
    isLowConfidenceBoundaryHit.mockImplementation(actualGeoLookup.isLowConfidenceBoundaryHit)

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    const surface = wrapper.get('.world-map-stage__surface').element as HTMLDivElement
    installFrame(surface)

    await wrapper.get('.world-map-stage__surface').trigger('click', clickPointFromGeo(35.0116, 135.7681, 3, -2))
    await flushPromises()

    const mapPointsStore = useMapPointsStore()

    expect(mapPointsStore.summaryMode).toBe('candidate-select')
    expect(mapPointsStore.drawerMode).toBeNull()
    expect(mapPointsStore.pendingCitySelection?.cityCandidates[0]?.cityName).toBe('Kyoto')
    expect(mapPointsStore.pendingCitySelection?.cityCandidates[0]?.statusHint).toBe('更接近点击位置')
  }, 15000)

  it('shows candidates for a realistic non-demo Paris click', async () => {
    const actualGeoLookup = await vi.importActual<typeof import('../services/geo-lookup')>(
      '../services/geo-lookup'
    )
    lookupCountryRegionByCoordinates.mockImplementation(actualGeoLookup.lookupCountryRegionByCoordinates)
    isLowConfidenceBoundaryHit.mockImplementation(actualGeoLookup.isLowConfidenceBoundaryHit)

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    const surface = wrapper.get('.world-map-stage__surface').element as HTMLDivElement
    installFrame(surface)

    await wrapper.get('.world-map-stage__surface').trigger('click', clickPointFromGeo(48.8566, 2.3522, 2, -2))
    await flushPromises()

    const mapPointsStore = useMapPointsStore()

    expect(mapPointsStore.summaryMode).toBe('candidate-select')
    expect(mapPointsStore.drawerMode).toBeNull()
    expect(mapPointsStore.pendingCitySelection?.cityCandidates[0]).toEqual(
      expect.objectContaining({
        cityId: 'fr-paris',
        cityName: 'Paris'
      })
    )
  }, 15000)

  it('shows candidates for a realistic sparse-country Budapest click', async () => {
    const actualGeoLookup = await vi.importActual<typeof import('../services/geo-lookup')>(
      '../services/geo-lookup'
    )
    lookupCountryRegionByCoordinates.mockImplementation(actualGeoLookup.lookupCountryRegionByCoordinates)
    isLowConfidenceBoundaryHit.mockImplementation(actualGeoLookup.isLowConfidenceBoundaryHit)

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    const surface = wrapper.get('.world-map-stage__surface').element as HTMLDivElement
    installFrame(surface)

    await wrapper.get('.world-map-stage__surface').trigger('click', clickPointFromGeo(47.4979, 19.0402, 1, -1))
    await flushPromises()

    const mapPointsStore = useMapPointsStore()

    expect(mapPointsStore.summaryMode).toBe('candidate-select')
    expect(mapPointsStore.drawerMode).toBeNull()
    expect(mapPointsStore.pendingCitySelection?.cityCandidates[0]).toEqual(
      expect.objectContaining({
        cityId: 'hu-budapest',
        cityName: 'Budapest'
      })
    )
  }, 15000)

  it('reuses an existing saved city and emits the light notice prefix', async () => {
    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    const surface = wrapper.get('.world-map-stage__surface').element as HTMLDivElement
    installFrame(surface)

    const mapPointsStore = useMapPointsStore()
    const mapUiStore = useMapUiStore()
    mapPointsStore.startDraftFromDetection({
      id: 'detected-jp-1',
      name: 'Kyoto',
      countryName: 'Japan',
      countryCode: 'JP',
      precision: 'city-high',
      cityId: 'jp-kyoto',
      cityName: 'Kyoto',
      cityContextLabel: 'Japan · Kansai',
      boundaryId: null,
      boundaryDatasetVersion: null,
      fallbackNotice: null,
      lat: 35.0116,
      lng: 135.7681,
      x: 0.68,
      y: 0.42,
      source: 'detected',
      isFeatured: false,
      description: 'saved point',
      coordinatesLabel: '35.0116°N, 135.7681°E'
    })
    mapPointsStore.saveDraftAsPoint()

    await wrapper.get('.world-map-stage__surface').trigger('click', {
      clientX: 1180,
      clientY: 360
    })
    await flushPromises()

    const existingCandidate = mapPointsStore.pendingCitySelection?.cityCandidates[0]

    expect(existingCandidate).toBeDefined()
    expect(mapPointsStore.findSavedPointByCityId(existingCandidate!.cityId)?.name ? '已存在记录' : '').toBe(
      '已存在记录'
    )

    mapPointsStore.confirmPendingCitySelection(existingCandidate!)

    expect(mapPointsStore.draftPoint).toBeNull()
    expect(mapPointsStore.activePoint?.name).toBe('Kyoto')
    expect(mapUiStore.interactionNotice?.message).toBe('已打开你记录过的Kyoto')
  })

  it('renders saved and selected city boundaries with the selected city on a stronger layer', () => {
    const mapPointsStore = useMapPointsStore()
    const tokyoBoundary = getBoundaryByCityId('jp-tokyo')
    const lisbonBoundary = getBoundaryByCityId('pt-lisbon')

    mapPointsStore.startDraftFromDetection(
      createCityDraft('jp-tokyo', {
        name: 'Tokyo',
        cityName: 'Tokyo',
        cityContextLabel: 'Japan · Kanto',
        lat: 35.6762,
        lng: 139.6503,
        x: 0.69,
        y: 0.41,
        coordinatesLabel: '35.6762°N, 139.6503°E'
      })
    )
    const tokyoPoint = mapPointsStore.saveDraftAsPoint()

    mapPointsStore.startDraftFromDetection(createCityDraft('pt-lisbon'))
    mapPointsStore.saveDraftAsPoint()
    mapPointsStore.selectPointById(tokyoPoint!.id)

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    const savedBoundaries = wrapper.findAll('.world-map-stage__boundary--saved')
    const selectedBoundary = wrapper.get('.world-map-stage__boundary--selected')

    expect(wrapper.find('.world-map-stage__boundary-layer').exists()).toBe(true)
    expect(savedBoundaries).toHaveLength(2)
    expect(
      wrapper
        .find(`[data-boundary-id="${lisbonBoundary?.boundaryId ?? ''}"].world-map-stage__boundary--saved`)
        .exists()
    ).toBe(true)
    expect(selectedBoundary.attributes('data-boundary-id')).toBe(tokyoBoundary?.boundaryId ?? '')
    expect(selectedBoundary.findAll('path')).toHaveLength(tokyoBoundary?.polygons.length ?? 0)
  })

  it('renders a reopened Budapest point with its selected city boundary highlight', () => {
    const mapPointsStore = useMapPointsStore()
    const budapestBoundary = getBoundaryByCityId('hu-budapest')

    mapPointsStore.startPendingCitySelection(
      {
        id: 'detected-hu-fallback',
        name: 'Hungary',
        countryName: 'Hungary',
        countryCode: 'HU',
        precision: 'country',
        cityId: null,
        cityName: null,
        cityContextLabel: 'Hungary',
        boundaryId: null,
        boundaryDatasetVersion: null,
        fallbackNotice: null,
        lat: 47.4979,
        lng: 19.0402,
        x: 0.55,
        y: 0.28,
        source: 'detected',
        isFeatured: false,
        description: 'saved point',
        coordinatesLabel: '47.4979°N, 19.0402°E'
      },
      [
        {
          cityId: 'hu-budapest',
          cityName: 'Budapest',
          contextLabel: 'Hungary · Budapest',
          matchLevel: 'high',
          distanceKm: 1.8,
          statusHint: '更接近点击位置'
        }
      ]
    )

    mapPointsStore.confirmPendingCitySelection({
      cityId: 'hu-budapest',
      cityName: 'Budapest',
      contextLabel: 'Hungary · Budapest',
      matchLevel: 'high',
      distanceKm: 1.8,
      statusHint: '更接近点击位置'
    })

    const savedPoint = mapPointsStore.saveDraftAsPoint()
    mapPointsStore.clearActivePoint()
    mapPointsStore.selectPointById(savedPoint!.id)

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.get('.world-map-stage__boundary--selected').attributes('data-boundary-id')).toBe(
      budapestBoundary?.boundaryId ?? ''
    )
    expect(wrapper.findAll('.world-map-stage__boundary--saved')).toHaveLength(1)
  })

  it('switches the strong boundary highlight to the newly selected saved city without leaving residue', async () => {
    const mapPointsStore = useMapPointsStore()
    const kyotoBoundary = getBoundaryByCityId('jp-kyoto')
    const lisbonBoundary = getBoundaryByCityId('pt-lisbon')

    mapPointsStore.startDraftFromDetection(
      createCityDraft('jp-kyoto', {
        name: 'Kyoto',
        cityName: 'Kyoto'
      })
    )
    const kyotoPoint = mapPointsStore.saveDraftAsPoint()
    mapPointsStore.startDraftFromDetection(createCityDraft('pt-lisbon'))
    const lisbonPoint = mapPointsStore.saveDraftAsPoint()
    mapPointsStore.selectPointById(kyotoPoint!.id)

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.get('.world-map-stage__boundary--selected').attributes('data-boundary-id')).toBe(
      kyotoBoundary?.boundaryId ?? ''
    )

    mapPointsStore.selectPointById(lisbonPoint!.id)
    await nextTick()

    const selectedBoundary = wrapper.get('.world-map-stage__boundary--selected')

    expect(selectedBoundary.attributes('data-boundary-id')).toBe(lisbonBoundary?.boundaryId ?? '')
    expect(wrapper.find(`[data-highlight-state="selected"][data-boundary-id="${kyotoBoundary?.boundaryId ?? ''}"]`).exists()).toBe(false)
    expect(wrapper.findAll('.world-map-stage__boundary--saved')).toHaveLength(2)
  })

  it('does not render a city boundary layer for fallback-only state', () => {
    const mapPointsStore = useMapPointsStore()

    mapPointsStore.startDraftFromDetection({
      id: 'detected-fallback-pt',
      name: 'Portugal',
      countryName: 'Portugal',
      countryCode: 'PT',
      precision: 'country',
      cityId: null,
      cityName: null,
      cityContextLabel: 'Portugal',
      boundaryId: null,
      boundaryDatasetVersion: null,
      fallbackNotice: '未能可靠确认城市，已提供国家/地区继续记录',
      lat: 38.7223,
      lng: -9.1393,
      x: 0.47,
      y: 0.37,
      source: 'detected',
      isFeatured: false,
      description: 'fallback point',
      coordinatesLabel: '38.7223°N, 9.1393°W'
    })

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.find('.world-map-stage__boundary-layer').exists()).toBe(false)
  })

  it('renders candidate-select popup inside the map stage with a pending anchor source', async () => {
    const mapPointsStore = useMapPointsStore()
    const mapUiStore = useMapUiStore()

    mapUiStore.setPendingGeoHit({
      x: 0.68,
      y: 0.42,
      lat: 35.0116,
      lng: 135.7681
    })
    mapPointsStore.startPendingCitySelection(
      createCityDraft('jp-kyoto', {
        id: 'detected-jp-fallback',
        name: 'Japan',
        cityId: null,
        cityName: null,
        cityContextLabel: 'Japan',
        boundaryId: null,
        boundaryDatasetVersion: null,
        fallbackNotice: '未能可靠确认城市，已提供国家/地区继续记录'
      }),
      [
        {
          cityId: 'jp-kyoto',
          cityName: 'Kyoto',
          contextLabel: 'Japan · Kansai',
          matchLevel: 'high',
          distanceKm: 2.2,
          statusHint: '更接近点击位置'
        }
      ]
    )

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    await nextTick()

    const popup = wrapper.get('.world-map-stage__surface .map-context-popup')
    const anchor = popupAnchoringMock.lastOptions?.reference()

    expect(popup.attributes('data-popup-anchor-source')).toBe('pending')
    expect(wrapper.text()).toContain('Japan')
    expect(anchor).toBeInstanceOf(SVGElement)
    expect(anchor?.getAttribute('data-pending-marker')).toBe('true')
  })

  it('renders selected view popup inside the map stage and keeps boundary highlight identity in sync', async () => {
    const mapPointsStore = useMapPointsStore()
    const kyotoBoundary = getBoundaryByCityId('jp-kyoto')

    mapPointsStore.startDraftFromDetection(
      createCityDraft('jp-kyoto', {
        name: 'Kyoto',
        cityName: 'Kyoto'
      })
    )
    const savedPoint = mapPointsStore.saveDraftAsPoint()

    if (!savedPoint) {
      throw new Error('Expected saved point fixture')
    }

    mapPointsStore.selectPointById(savedPoint.id)

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    await nextTick()

    const popup = wrapper.get('.world-map-stage__surface .map-context-popup')
    const anchor = popupAnchoringMock.lastOptions?.reference()

    expect(popup.attributes('data-popup-anchor-source')).toBe('marker')
    expect(wrapper.text()).toContain('Kyoto')
    expect(anchor).toBeInstanceOf(HTMLElement)
    expect((anchor as HTMLElement | null)?.getAttribute('data-point-id')).toBe(savedPoint.id)
    expect(wrapper.get('.world-map-stage__boundary--selected').attributes('data-boundary-id')).toBe(
      kyotoBoundary?.boundaryId ?? ''
    )
  })

  it('continues to expose fallback copy for realistic near-but-not-on city clicks', async () => {
    const actualGeoLookup = await vi.importActual<typeof import('../services/geo-lookup')>(
      '../services/geo-lookup'
    )
    lookupCountryRegionByCoordinates.mockImplementation(actualGeoLookup.lookupCountryRegionByCoordinates)
    isLowConfidenceBoundaryHit.mockImplementation(actualGeoLookup.isLowConfidenceBoundaryHit)

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    const surface = wrapper.get('.world-map-stage__surface').element as HTMLDivElement
    installFrame(surface)

    await wrapper.get('.world-map-stage__surface').trigger('click', clickPointFromGeo(35.0116, 135.7681, -12, 0))
    await flushPromises()

    const mapPointsStore = useMapPointsStore()

    expect(mapPointsStore.summaryMode).toBe('candidate-select')
    expect(mapPointsStore.drawerMode).toBeNull()
    expect(mapPointsStore.pendingCitySelection?.fallbackPoint.name).toBe('Japan')
    expect(mapPointsStore.pendingCitySelection?.fallbackPoint.fallbackNotice).toBe(
      '未能可靠确认城市，已提供国家/地区继续记录'
    )
  }, 15000)

  it('falls back to a boundary anchor when the stage cannot resolve a marker element', async () => {
    const boundaryPinia = createPinia()
    setActivePinia(boundaryPinia)
    const boundaryStore = useMapPointsStore()

    boundaryStore.startDraftFromDetection(createCityDraft('pt-lisbon'))
    const savedPoint = boundaryStore.saveDraftAsPoint()

    if (!savedPoint) {
      throw new Error('Expected boundary fallback fixture')
    }

    boundaryStore.selectPointById(savedPoint.id)

    const boundaryWrapper = mount(WorldMapStage, {
      global: {
        plugins: [boundaryPinia],
        stubs: {
          SeedMarkerLayer: {
            template: '<div class="seed-marker-layer-stub"></div>'
          }
        }
      }
    })

    await nextTick()

    const popup = boundaryWrapper.get('.map-context-popup')
    const anchor = popupAnchoringMock.lastOptions?.reference()

    expect(popup.attributes('data-popup-anchor-source')).toBe('boundary')
    expect(anchor).not.toBeNull()
    expect(anchor).not.toBeInstanceOf(Element)
  })
})
