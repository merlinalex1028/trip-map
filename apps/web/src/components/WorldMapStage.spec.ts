import {
  PHASE12_AMBIGUOUS_RESOLVE,
  PHASE12_FAILED_RESOLVE,
  PHASE12_RESOLVED_BEIJING,
  PHASE12_RESOLVED_CALIFORNIA,
} from '@trip-map/contracts'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, nextTick, shallowRef } from 'vue'

import WorldMapStage from './WorldMapStage.vue'
import { getBoundaryByCityId } from '../services/city-boundaries'
import { useMapPointsStore } from '../stores/map-points'
import type { DraftMapPoint } from '../types/map-point'

const popupAnchoringMock = vi.hoisted(() => ({
  cleanup: vi.fn(),
}))

const canonicalPlacesMock = vi.hoisted(() => ({
  resolveCanonicalPlace: vi.fn(),
  confirmCanonicalPlace: vi.fn(),
}))

vi.mock('../services/api/canonical-places', () => ({
  resolveCanonicalPlace: canonicalPlacesMock.resolveCanonicalPlace,
  confirmCanonicalPlace: canonicalPlacesMock.confirmCanonicalPlace,
}))

vi.mock('../composables/usePopupAnchoring', () => ({
  usePopupAnchoring: () => ({
    floatingStyles: computed(() => ({
      left: '24px',
      top: '32px',
    })),
    placement: shallowRef('top-start'),
    collisionState: computed(() => 'stable' as const),
    availableHeight: computed(() => 320),
    updatePosition: vi.fn(),
    cleanup: popupAnchoringMock.cleanup,
  }),
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
    },
  }

  vi.stubGlobal('localStorage', localStorageMock)
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: localStorageMock,
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
      toJSON: () => ({}),
    }),
  })
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
    placeId: cityId,
    placeKind: 'OVERSEAS_ADMIN1' as const,
    datasetVersion: boundary.datasetVersion,
    typeLabel: '一级行政区',
    parentLabel: isPortugal ? 'Portugal' : 'Japan',
    subtitle: isPortugal ? 'Portugal · 一级行政区' : 'Japan · 一级行政区',
    boundaryId: boundary.boundaryId,
    boundaryDatasetVersion: boundary.datasetVersion,
    fallbackNotice: null,
    lat: isPortugal ? 38.7223 : 35.0116,
    lng: isPortugal ? -9.1393 : 135.7681,
    clickLat: isPortugal ? 38.7223 : 35.0116,
    clickLng: isPortugal ? -9.1393 : 135.7681,
    x: isPortugal ? 0.47 : 0.68,
    y: isPortugal ? 0.37 : 0.42,
    source: 'detected' as const,
    isFeatured: false,
    description: 'saved point',
    coordinatesLabel: isPortugal ? '38.7223°N, 9.1393°W' : '35.0116°N, 135.7681°E',
    ...overrides,
  }
}

function createCanonicalDraft(
  place = PHASE12_RESOLVED_BEIJING,
  overrides: Partial<DraftMapPoint> = {},
): DraftMapPoint {
  const isCalifornia = place.placeId === PHASE12_RESOLVED_CALIFORNIA.placeId

  return {
    id: `detected-${place.placeId}`,
    name: place.displayName,
    countryName: place.parentLabel,
    countryCode: place.regionSystem === 'CN' ? 'CN' : '__canonical__',
    precision: 'city-high',
    cityId: null,
    cityName: place.displayName,
    cityContextLabel: place.subtitle,
    placeId: place.placeId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
    boundaryId: place.boundaryId,
    boundaryDatasetVersion: place.datasetVersion,
    fallbackNotice: null,
    lat: isCalifornia ? 36.7783 : 39.9042,
    lng: isCalifornia ? -119.4179 : 116.4074,
    clickLat: isCalifornia ? 36.7783 : 39.9042,
    clickLng: isCalifornia ? -119.4179 : 116.4074,
    x: isCalifornia ? 0.15 : 0.74,
    y: isCalifornia ? 0.44 : 0.31,
    source: 'detected',
    isFeatured: false,
    description: 'canonical draft',
    coordinatesLabel: isCalifornia ? '36.7783°N, 119.4179°W' : '39.9042°N, 116.4074°E',
    ...overrides,
  }
}

describe('WorldMapStage', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    installStorageMock()
    popupAnchoringMock.cleanup.mockReset()
    canonicalPlacesMock.resolveCanonicalPlace.mockReset()
    canonicalPlacesMock.confirmCanonicalPlace.mockReset()
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 0
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls /places/resolve and creates a canonical draft for resolved responses', async () => {
    canonicalPlacesMock.resolveCanonicalPlace.mockResolvedValue({
      status: 'resolved',
      click: { lat: 39.9042, lng: 116.4074 },
      place: PHASE12_RESOLVED_BEIJING,
    })

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia],
      },
    })

    const surface = wrapper.get('.world-map-stage__surface').element as HTMLDivElement
    installFrame(surface)

    await wrapper.get('.world-map-stage__surface').trigger('click', {
      clientX: 1180,
      clientY: 360,
    })
    await flushPromises()

    const mapPointsStore = useMapPointsStore()

    expect(canonicalPlacesMock.resolveCanonicalPlace).toHaveBeenCalledTimes(1)
    expect(mapPointsStore.summaryMode).toBe('detected-preview')
    expect(mapPointsStore.draftPoint).toEqual(
      expect.objectContaining({
        placeId: PHASE12_RESOLVED_BEIJING.placeId,
        boundaryId: PHASE12_RESOLVED_BEIJING.boundaryId,
        placeKind: PHASE12_RESOLVED_BEIJING.placeKind,
        datasetVersion: PHASE12_RESOLVED_BEIJING.datasetVersion,
      }),
    )
  })

  it('renders server ambiguous candidates and confirms them through /places/confirm', async () => {
    if (PHASE12_AMBIGUOUS_RESOLVE.status !== 'ambiguous') {
      throw new Error('Expected ambiguous resolve fixture')
    }

    canonicalPlacesMock.resolveCanonicalPlace.mockResolvedValue(PHASE12_AMBIGUOUS_RESOLVE)
    canonicalPlacesMock.confirmCanonicalPlace.mockResolvedValue({
      status: 'resolved',
      click: PHASE12_AMBIGUOUS_RESOLVE.click,
      place: PHASE12_AMBIGUOUS_RESOLVE.candidates[0],
    })

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia],
      },
    })

    const surface = wrapper.get('.world-map-stage__surface').element as HTMLDivElement
    installFrame(surface)

    await wrapper.get('.world-map-stage__surface').trigger('click', {
      clientX: 1180,
      clientY: 360,
    })
    await flushPromises()

    const mapPointsStore = useMapPointsStore()

    expect(mapPointsStore.summaryMode).toBe('candidate-select')
    expect(mapPointsStore.draftPoint).toBeNull()
    expect(mapPointsStore.pendingCanonicalSelection?.candidates).toHaveLength(3)

    await wrapper.get('.point-summary-card__candidate-action').trigger('click')
    await flushPromises()

    expect(canonicalPlacesMock.confirmCanonicalPlace).toHaveBeenCalledWith({
      lat: PHASE12_AMBIGUOUS_RESOLVE.click.lat,
      lng: PHASE12_AMBIGUOUS_RESOLVE.click.lng,
      candidatePlaceId: PHASE12_AMBIGUOUS_RESOLVE.candidates[0]?.placeId,
    })
    expect(mapPointsStore.summaryMode).toBe('detected-preview')
    expect(mapPointsStore.activePoint).toEqual(
      expect.objectContaining({
        placeId: PHASE12_AMBIGUOUS_RESOLVE.candidates[0]?.placeId,
      }),
    )
  })

  it('shows failed notices without creating a draft or fallback record', async () => {
    canonicalPlacesMock.resolveCanonicalPlace.mockResolvedValue(PHASE12_FAILED_RESOLVE)

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia],
      },
    })

    const surface = wrapper.get('.world-map-stage__surface').element as HTMLDivElement
    installFrame(surface)

    await wrapper.get('.world-map-stage__surface').trigger('click', {
      clientX: 1180,
      clientY: 360,
    })
    await flushPromises()

    const mapPointsStore = useMapPointsStore()

    expect(canonicalPlacesMock.resolveCanonicalPlace).toHaveBeenCalledTimes(1)
    expect(mapPointsStore.draftPoint).toBeNull()
    expect(mapPointsStore.pendingCanonicalSelection).toBeNull()
    expect(wrapper.find('[data-region="point-summary-card"]').exists()).toBe(false)
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
        clickLat: 35.6762,
        clickLng: 139.6503,
        x: 0.69,
        y: 0.41,
        coordinatesLabel: '35.6762°N, 139.6503°E',
      }),
    )
    const tokyoPoint = mapPointsStore.saveDraftAsPoint()

    mapPointsStore.startDraftFromDetection(createCityDraft('pt-lisbon'))
    mapPointsStore.saveDraftAsPoint()
    mapPointsStore.selectPointById(tokyoPoint!.id)

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.find('.world-map-stage__boundary-layer').exists()).toBe(true)
    expect(wrapper.findAll('.world-map-stage__boundary--saved')).toHaveLength(2)
    expect(wrapper.get('.world-map-stage__boundary--selected').attributes('data-boundary-id')).toBe(
      tokyoBoundary?.boundaryId ?? '',
    )
    expect(
      wrapper
        .get(`[data-highlight-state="saved"][data-boundary-id="${lisbonBoundary?.boundaryId ?? ''}"]`)
        .classes(),
    ).toContain('world-map-stage__boundary--saved')
  })

  it('renders the deep drawer inside the stage surface after the drawer handoff', async () => {
    const mapPointsStore = useMapPointsStore()

    mapPointsStore.startDraftFromDetection(createCityDraft('jp-kyoto'))
    mapPointsStore.saveDraftAsPoint()
    mapPointsStore.openDrawerView()

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia],
      },
    })

    await nextTick()

    expect(wrapper.find('.world-map-stage__surface [data-region="point-preview-drawer"]').exists()).toBe(
      true,
    )
    expect(wrapper.get('.world-map-stage__boundary--selected').attributes('data-boundary-id')).toBe(
      getBoundaryByCityId('jp-kyoto')?.boundaryId ?? '',
    )
  })

  it('restores the same renderable canonical boundary after save, close, and reopen for Beijing', async () => {
    const mapPointsStore = useMapPointsStore()

    mapPointsStore.startDraftFromDetection(createCanonicalDraft(PHASE12_RESOLVED_BEIJING))
    const savedPoint = mapPointsStore.saveDraftAsPoint()

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.get('.world-map-stage__boundary--selected').attributes('data-boundary-id')).toBe(
      'cn-beijing-municipality',
    )

    mapPointsStore.clearActivePoint()
    await nextTick()
    expect(wrapper.find('.world-map-stage__boundary--selected').exists()).toBe(false)

    mapPointsStore.selectPointById(savedPoint!.id)
    await nextTick()

    expect(wrapper.get('.world-map-stage__boundary--selected').attributes('data-boundary-id')).toBe(
      'cn-beijing-municipality',
    )
  })

  it('keeps unsupported canonical California points out of the selected boundary layer', () => {
    const mapPointsStore = useMapPointsStore()

    mapPointsStore.startDraftFromDetection(createCanonicalDraft(PHASE12_RESOLVED_CALIFORNIA))
    mapPointsStore.saveDraftAsPoint()

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.find('.world-map-stage__boundary--selected').exists()).toBe(false)
    expect(mapPointsStore.activeBoundaryCoverageState).toBe('missing')
    expect(mapPointsStore.summarySurfaceState).toEqual(
      expect.objectContaining({
        mode: 'view',
        boundarySupportState: 'missing',
      }),
    )
  })
})
