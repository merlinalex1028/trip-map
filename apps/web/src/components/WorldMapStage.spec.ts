import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, nextTick, shallowRef } from 'vue'

import WorldMapStage from './WorldMapStage.vue'
import { getBoundaryByCityId } from '../services/city-boundaries'
import { useMapPointsStore } from '../stores/map-points'
import type { GeoCoordinates, GeoDetectionResult } from '../types/geo'

const popupAnchoringMock = vi.hoisted(() => ({
  cleanup: vi.fn()
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
  usePopupAnchoring: () => ({
    floatingStyles: computed(() => ({
      left: '24px',
      top: '32px'
    })),
    placement: shallowRef('top-start'),
    collisionState: computed(() => 'stable' as const),
    availableHeight: computed(() => 320),
    updatePosition: vi.fn(),
    cleanup: popupAnchoringMock.cleanup
  })
}))

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
}

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
    installStorageMock()
    lookupCountryRegionByCoordinates.mockReset()
    lookupCountryRegionByCoordinates.mockImplementation((geo: GeoCoordinates) =>
      createDetectionResult({
        lat: geo.lat,
        lng: geo.lng
      })
    )
    isLowConfidenceBoundaryHit.mockReset()
    isLowConfidenceBoundaryHit.mockReturnValue(false)
    popupAnchoringMock.cleanup.mockReset()
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 0
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('opens the candidate-select summary flow instead of immediately creating a draft', async () => {
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
    expect(mapPointsStore.pendingCitySelection?.cityCandidates).toHaveLength(2)
    expect(wrapper.get('[data-region="point-summary-card"]').attributes('data-summary-mode')).toBe('candidate-select')
  })

  it('renders saved and selected city boundaries with the selected city on the stronger layer', () => {
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

    expect(wrapper.find('.world-map-stage__boundary-layer').exists()).toBe(true)
    expect(wrapper.findAll('.world-map-stage__boundary--saved')).toHaveLength(2)
    expect(wrapper.get('.world-map-stage__boundary--selected').attributes('data-boundary-id')).toBe(tokyoBoundary?.boundaryId ?? '')
    expect(
      wrapper.get(`[data-highlight-state="saved"][data-boundary-id="${lisbonBoundary?.boundaryId ?? ''}"]`).classes()
    ).toContain('world-map-stage__boundary--saved')
  })

  it('renders the deep drawer inside the stage surface after the drawer handoff', async () => {
    const mapPointsStore = useMapPointsStore()

    mapPointsStore.startDraftFromDetection(createCityDraft('jp-kyoto'))
    mapPointsStore.saveDraftAsPoint()
    mapPointsStore.openDrawerView()

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    await nextTick()

    expect(wrapper.find('.world-map-stage__surface [data-region="point-preview-drawer"]').exists()).toBe(true)
    expect(wrapper.get('.world-map-stage__boundary--selected').attributes('data-boundary-id')).toBe(
      getBoundaryByCityId('jp-kyoto')?.boundaryId ?? ''
    )
  })
})
