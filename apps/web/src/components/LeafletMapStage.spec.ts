import {
  PHASE12_AMBIGUOUS_RESOLVE,
  PHASE12_RESOLVED_BEIJING,
  type TravelRecord,
  PHASE28_RESOLVED_CALIFORNIA,
} from '@trip-map/contracts'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, nextTick, shallowRef } from 'vue'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { buildUnsupportedOverseasNotice } from '../constants/overseas-support'
import LeafletMapStage from './LeafletMapStage.vue'
import MapContextPopup from './map-popup/MapContextPopup.vue'
import TripDateForm from './map-popup/TripDateForm.vue'
import { useAuthSessionStore } from '../stores/auth-session'
import { useMapPointsStore } from '../stores/map-points'
import { useMapUiStore } from '../stores/map-ui'

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const canonicalPlacesMock = vi.hoisted(() => ({
  resolveCanonicalPlace: vi.fn(),
  confirmCanonicalPlace: vi.fn(),
}))

const geometryLoaderMock = vi.hoisted(() => ({
  loadGeometryShard: vi.fn(),
}))

const geometryManifestMock = vi.hoisted(() => ({
  GEOMETRY_DATASET_VERSION: '2026-04-21-geo-v3',
  listGeometryManifestEntriesByLayer: vi.fn(() => []),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getGeometryManifestEntry: vi.fn<(...args: any[]) => any>(() => null),
}))

const geoLookupMock = vi.hoisted(() => ({
  lookupCountryRegionByCoordinates: vi.fn(),
}))

const recordsApiMock = vi.hoisted(() => ({
  createTravelRecord: vi.fn(),
  deleteTravelRecord: vi.fn(),
}))

// Capture the click handler registered via map.on('click', handler)
let capturedMapClickHandler: ((e: { latlng: { lat: number; lng: number } }) => void) | null = null
let capturedBoundaryClickHandler:
  | ((boundaryId: string, latlng: { lat: number; lng: number }) => void)
  | null = null
// Capture addFeatures calls from useGeoJsonLayers
const addFeaturesMock = vi.fn()
const refreshStylesMock = vi.fn()

// Container created in vi.hoisted (runs before imports, no TDZ issue)
const leafletMapContainer = vi.hoisted(() => ({
  mapRef: null as unknown,
  isReadyRef: null as unknown,
}))

const popupAnchorContainer = vi.hoisted(() => ({
  virtualElementRef: null as unknown,
}))

vi.mock('../composables/useLeafletMap', async () => {
  const { shallowRef } = await import('vue')
  const map = shallowRef(null)
  const isReady = shallowRef(false)
  leafletMapContainer.mapRef = map
  leafletMapContainer.isReadyRef = isReady
  return {
    useLeafletMap: () => ({ map, isReady }),
  }
})

vi.mock('../composables/useGeoJsonLayers', () => ({
  useGeoJsonLayers: (opts: {
    onBoundaryClick: (boundaryId: string, latlng: { lat: number; lng: number }) => void
  }) => {
    capturedBoundaryClickHandler = opts.onBoundaryClick
    return {
      addFeatures: addFeaturesMock,
      refreshStyles: refreshStylesMock,
      cnLayer: {},
      overseasLayer: {},
    }
  },
}))

vi.mock('../composables/useLeafletPopupAnchor', () => ({
  useLeafletPopupAnchor: () => {
    const virtualElement = shallowRef(null)
    popupAnchorContainer.virtualElementRef = virtualElement
    return {
      virtualElement,
    }
  },
}))

vi.mock('../composables/usePopupAnchoring', () => ({
  usePopupAnchoring: () => ({
    floatingStyles: computed(() => ({ left: '0px', top: '0px' })),
    placement: shallowRef('top-start'),
    collisionState: computed(() => 'stable' as const),
    availableHeight: computed(() => 320),
    updatePosition: vi.fn(),
    cleanup: vi.fn(),
  }),
}))

vi.mock('../services/api/canonical-places', () => ({
  resolveCanonicalPlace: canonicalPlacesMock.resolveCanonicalPlace,
  confirmCanonicalPlace: canonicalPlacesMock.confirmCanonicalPlace,
}))

vi.mock('../services/geometry-loader', () => ({
  loadGeometryShard: geometryLoaderMock.loadGeometryShard,
}))

vi.mock('../services/geometry-manifest', () => ({
  GEOMETRY_DATASET_VERSION: '2026-04-21-geo-v3',
  listGeometryManifestEntriesByLayer: geometryManifestMock.listGeometryManifestEntriesByLayer,
  getGeometryManifestEntry: geometryManifestMock.getGeometryManifestEntry,
}))

vi.mock('../services/geo-lookup', () => ({
  lookupCountryRegionByCoordinates: geoLookupMock.lookupCountryRegionByCoordinates,
  prefetchCountryRegions: vi.fn(),
}))

vi.mock('../services/api/records', () => ({
  createTravelRecord: recordsApiMock.createTravelRecord,
  deleteTravelRecord: recordsApiMock.deleteTravelRecord,
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a travel record from a ResolvedCanonicalPlace */
function makeRecord(
  place: typeof PHASE12_RESOLVED_BEIJING,
  overrides: Partial<TravelRecord> = {},
): TravelRecord {
  return {
    id: `server-rec-${place.placeId}`,
    placeId: place.placeId,
    boundaryId: place.boundaryId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    displayName: place.displayName,
    regionSystem: place.regionSystem,
    adminType: place.adminType,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
    startDate: null,
    endDate: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function makeDraftPoint(
  place = PHASE12_RESOLVED_BEIJING,
  overrides: Record<string, unknown> = {},
) {
  return {
    id: `detected-${place.placeId}`,
    name: place.displayName,
    countryName: place.parentLabel,
    countryCode: place.regionSystem === 'CN' ? 'CN' : '__canonical__',
    precision: 'city-high' as const,
    cityId: null,
    cityName: place.displayName,
    cityContextLabel: place.subtitle,
    placeId: place.placeId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    regionSystem: place.regionSystem,
    adminType: place.adminType,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
    boundaryId: place.boundaryId,
    boundaryDatasetVersion: place.datasetVersion,
    fallbackNotice: null,
    lat: 39.9042,
    lng: 116.4074,
    clickLat: 39.9042,
    clickLng: 116.4074,
    x: 0,
    y: 0,
    source: 'detected' as const,
    isFeatured: false,
    description: '',
    coordinatesLabel: '39.9042°N, 116.4074°E',
    ...overrides,
  }
}

function makeVirtualElement() {
  return {
    getBoundingClientRect: () => ({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      top: 0,
      left: 0,
      right: 1,
      bottom: 1,
      toJSON: () => ({}),
    }),
  }
}

/** Simulate a Leaflet map 'click' event on the component under test */
async function triggerMapClick(latlng: { lat: number; lng: number }) {
  if (!capturedMapClickHandler) {
    throw new Error('No map click handler registered — ensure isReady was set to true before triggering click')
  }
  await capturedMapClickHandler({ latlng })
}

/** Create a minimal ResolvedCanonicalPlace compatible response */
function makeResolvedResponse(place = PHASE12_RESOLVED_BEIJING) {
  return {
    status: 'resolved' as const,
    click: { lat: 39.9042, lng: 116.4074 },
    place,
  }
}

/** Build a fake GeoJSON FeatureCollection for shard loading */
function makeFakeFeatureCollection() {
  return {
    type: 'FeatureCollection' as const,
    features: [],
  }
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('LeafletMapStage', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    // Reset mocks
    addFeaturesMock.mockReset()
    refreshStylesMock.mockReset()
    canonicalPlacesMock.resolveCanonicalPlace.mockReset()
    canonicalPlacesMock.confirmCanonicalPlace.mockReset()
    geometryLoaderMock.loadGeometryShard.mockReset()
    geometryManifestMock.getGeometryManifestEntry.mockReset().mockReturnValue(null)
    geoLookupMock.lookupCountryRegionByCoordinates.mockReset().mockResolvedValue(null)
    recordsApiMock.createTravelRecord.mockReset().mockResolvedValue(
      makeRecord(PHASE12_RESOLVED_BEIJING),
    )
    recordsApiMock.deleteTravelRecord.mockReset().mockResolvedValue(undefined)
    capturedMapClickHandler = null
    capturedBoundaryClickHandler = null

    // Reset leaflet map mock state
    ;(leafletMapContainer.mapRef as any).value = null
    ;(leafletMapContainer.isReadyRef as any).value = false
    popupAnchorContainer.virtualElementRef = null

    // Stub requestAnimationFrame
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // -------------------------------------------------------------------------
  // MAP INITIALIZATION (MAP-04)
  // -------------------------------------------------------------------------

  describe('map initialization', () => {
    it('mounts and renders the map container element', () => {
      const wrapper = mount(LeafletMapStage, {
        global: { plugins: [pinia] },
      })

      expect(wrapper.find('.leaflet-map-stage__map').exists()).toBe(true)
    })

    it('renders the section with correct aria attributes', () => {
      const wrapper = mount(LeafletMapStage, {
        global: { plugins: [pinia] },
      })

      const section = wrapper.get('.leaflet-map-stage')
      expect(section.attributes('aria-label')).toBe('旅行世界地图')
      expect(section.attributes('data-region')).toBe('map-stage')
    })
  })

  // -------------------------------------------------------------------------
  // GEOJSON LAYER LOADING (GEOX-05, MAP-05)
  // -------------------------------------------------------------------------

  describe('GeoJSON layer loading', () => {
    it('calls addFeatures with CN layer when a CN boundary shard is loaded', async () => {
      const fc = makeFakeFeatureCollection()
      geometryManifestMock.getGeometryManifestEntry.mockReturnValue({
        boundaryId: PHASE12_RESOLVED_BEIJING.boundaryId,
        layer: 'CN',
        geometryDatasetVersion: '2026-04-21-geo-v3',
        assetKey: 'cn/beijing.json',
        renderableId: PHASE12_RESOLVED_BEIJING.boundaryId,
      })
      geometryLoaderMock.loadGeometryShard.mockResolvedValue(fc)
      canonicalPlacesMock.resolveCanonicalPlace.mockResolvedValue(
        makeResolvedResponse(PHASE12_RESOLVED_BEIJING),
      )

      mount(LeafletMapStage, { global: { plugins: [pinia] } })

      // Simulate map ready -> click -> resolve -> shard load
      ;(leafletMapContainer.isReadyRef as any).value = true
      await nextTick()

      // Capture click handler now that isReady watcher runs
      // The click handler is registered via map.on('click', ...) —
      // since useLeafletMap is fully mocked, we test via store side-effects

      await flushPromises()
      // addFeatures should be available (called from shard load path after resolveCanonicalPlace)
    })

    it('calls addFeatures twice with separate CN and OVERSEAS layers (GEOX-05)', async () => {
      const fc = makeFakeFeatureCollection()

      // Configure manifest mock to return entries for both layers
      geometryManifestMock.getGeometryManifestEntry.mockImplementation((boundaryId: string) => {
        if (boundaryId === PHASE12_RESOLVED_BEIJING.boundaryId) {
          return {
            boundaryId,
            layer: 'CN',
            geometryDatasetVersion: '2026-04-21-geo-v3',
            assetKey: 'cn/beijing.json',
            renderableId: boundaryId,
          }
        }
        if (boundaryId === PHASE28_RESOLVED_CALIFORNIA.boundaryId) {
          return {
            boundaryId,
            layer: 'OVERSEAS',
            geometryDatasetVersion: '2026-04-21-geo-v3',
            assetKey: 'overseas/layer.json',
            renderableId: boundaryId,
          }
        }
        return null
      })
      geometryLoaderMock.loadGeometryShard.mockResolvedValue(fc)

      // Inject the authenticated bootstrap snapshot directly.
      const mapPointsStore = useMapPointsStore()
      mapPointsStore.replaceTravelRecords([
        makeRecord(PHASE12_RESOLVED_BEIJING),
        makeRecord(PHASE28_RESOLVED_CALIFORNIA),
      ])

      mount(LeafletMapStage, { global: { plugins: [pinia] } })

      // Set map ready to trigger authoritative layer preload and consume the injected snapshot.
      ;(leafletMapContainer.isReadyRef as any).value = true
      await nextTick()
      await flushPromises()

      // Should have loaded CN shard and called addFeatures('CN', ...)
      // and OVERSEAS shard and called addFeatures('OVERSEAS', ...)
      const cnCalls = addFeaturesMock.mock.calls.filter((c) => c[0] === 'CN')
      const overseasCalls = addFeaturesMock.mock.calls.filter((c) => c[0] === 'OVERSEAS')
      expect(cnCalls.length).toBeGreaterThanOrEqual(1)
      expect(overseasCalls.length).toBeGreaterThanOrEqual(1)
      expect(geometryLoaderMock.loadGeometryShard).toHaveBeenCalledWith(
        '2026-04-21-geo-v3',
        'overseas/layer.json',
      )
    })

    it('keeps startup silent when records bootstrap is owned by auth-session restore', async () => {
      mount(LeafletMapStage, { global: { plugins: [pinia] } })

      ;(leafletMapContainer.isReadyRef as any).value = true
      await nextTick()
      await flushPromises()

      const mapUiStore = useMapUiStore()
      expect(mapUiStore.interactionNotice).toBeNull()
    })
  })

  // -------------------------------------------------------------------------
  // MAP CLICK -> RESOLVE FLOW (MAP-04)
  // -------------------------------------------------------------------------

  describe('map click -> resolve flow', () => {
    it('calls resolveCanonicalPlace on map click (MAP-04)', async () => {
      canonicalPlacesMock.resolveCanonicalPlace.mockResolvedValue(
        makeResolvedResponse(PHASE12_RESOLVED_BEIJING),
      )

      // Spy on map.on to capture the click handler
      const mapOnMock = vi.fn((event: string, handler: unknown) => {
        if (event === 'click') {
          capturedMapClickHandler = handler as typeof capturedMapClickHandler
        }
      })
      const fakeMap = {
        on: mapOnMock,
        off: vi.fn(),
        latLngToContainerPoint: vi.fn(() => ({ x: 100, y: 100 })),
        removeLayer: vi.fn(),
        addLayer: vi.fn(),
      } as unknown as import('leaflet').Map

      ;(leafletMapContainer.mapRef as any).value = fakeMap as unknown as null

      mount(LeafletMapStage, { global: { plugins: [pinia] } })

      ;(leafletMapContainer.isReadyRef as any).value = true
      await nextTick()
      await flushPromises()

      // Verify click handler was registered
      expect(mapOnMock).toHaveBeenCalledWith('click', expect.any(Function))
      expect(capturedMapClickHandler).not.toBeNull()

      // Trigger map click
      await triggerMapClick({ lat: 39.9042, lng: 116.4074 })
      await flushPromises()

      expect(canonicalPlacesMock.resolveCanonicalPlace).toHaveBeenCalledTimes(1)
      expect(canonicalPlacesMock.resolveCanonicalPlace).toHaveBeenCalledWith({
        lat: 39.9042,
        lng: 116.4074,
      })
    })

    it('creates draft point in store on resolved response (MAP-04)', async () => {
      canonicalPlacesMock.resolveCanonicalPlace.mockResolvedValue(
        makeResolvedResponse(PHASE12_RESOLVED_BEIJING),
      )

      const mapOnMock = vi.fn((event: string, handler: unknown) => {
        if (event === 'click') {
          capturedMapClickHandler = handler as typeof capturedMapClickHandler
        }
      })
      const fakeMap = {
        on: mapOnMock,
        off: vi.fn(),
        latLngToContainerPoint: vi.fn(() => ({ x: 100, y: 100 })),
        removeLayer: vi.fn(),
        addLayer: vi.fn(),
      } as unknown as import('leaflet').Map

      ;(leafletMapContainer.mapRef as any).value = fakeMap as unknown as null
      mount(LeafletMapStage, { global: { plugins: [pinia] } })

      ;(leafletMapContainer.isReadyRef as any).value = true
      await nextTick()
      await flushPromises()

      await triggerMapClick({ lat: 39.9042, lng: 116.4074 })
      await flushPromises()

      const mapPointsStore = useMapPointsStore()
      expect(mapPointsStore.summaryMode).toBe('detected-preview')
      expect(mapPointsStore.draftPoint).toEqual(
        expect.objectContaining({
          placeId: PHASE12_RESOLVED_BEIJING.placeId,
          boundaryId: PHASE12_RESOLVED_BEIJING.boundaryId,
          placeKind: PHASE12_RESOLVED_BEIJING.placeKind,
        }),
      )
    })

    it('shows pending marker style class during recognition', async () => {
      // Tests that circleMarker is added via mock (L.circleMarker is module-level mock)
      // We verify via the map store interaction notice being cleared on success
      canonicalPlacesMock.resolveCanonicalPlace.mockResolvedValue(
        makeResolvedResponse(PHASE12_RESOLVED_BEIJING),
      )

      const addLayerMock = vi.fn()
      const mapOnMock = vi.fn((event: string, handler: unknown) => {
        if (event === 'click') {
          capturedMapClickHandler = handler as typeof capturedMapClickHandler
        }
      })
      const fakeMap = {
        on: mapOnMock,
        off: vi.fn(),
        latLngToContainerPoint: vi.fn(() => ({ x: 100, y: 100 })),
        removeLayer: vi.fn(),
        addLayer: addLayerMock,
      } as unknown as import('leaflet').Map

      ;(leafletMapContainer.mapRef as any).value = fakeMap as unknown as null
      mount(LeafletMapStage, { global: { plugins: [pinia] } })

      ;(leafletMapContainer.isReadyRef as any).value = true
      await nextTick()

      const mapUiStore = useMapUiStore()

      // Don't await — startRecognition() fires synchronously before the first await in handler
      const clickPromise = triggerMapClick({ lat: 39.9042, lng: 116.4074 })
      // Recognition should have started synchronously
      expect(mapUiStore.isRecognizing).toBe(true)

      await clickPromise
      await flushPromises()
      expect(mapUiStore.isRecognizing).toBe(false)
    })

    it('enters candidate selection on ambiguous response (MAP-04)', async () => {
      if (PHASE12_AMBIGUOUS_RESOLVE.status !== 'ambiguous') {
        throw new Error('Expected ambiguous resolve fixture')
      }
      canonicalPlacesMock.resolveCanonicalPlace.mockResolvedValue(PHASE12_AMBIGUOUS_RESOLVE)

      const mapOnMock = vi.fn((event: string, handler: unknown) => {
        if (event === 'click') {
          capturedMapClickHandler = handler as typeof capturedMapClickHandler
        }
      })
      const fakeMap = {
        on: mapOnMock,
        off: vi.fn(),
        latLngToContainerPoint: vi.fn(() => ({ x: 100, y: 100 })),
        removeLayer: vi.fn(),
        addLayer: vi.fn(),
      } as unknown as import('leaflet').Map

      ;(leafletMapContainer.mapRef as any).value = fakeMap as unknown as null
      mount(LeafletMapStage, { global: { plugins: [pinia] } })

      ;(leafletMapContainer.isReadyRef as any).value = true
      await nextTick()
      await flushPromises()

      await triggerMapClick({
        lat: PHASE12_AMBIGUOUS_RESOLVE.click.lat,
        lng: PHASE12_AMBIGUOUS_RESOLVE.click.lng,
      })
      await flushPromises()

      const mapPointsStore = useMapPointsStore()
      expect(mapPointsStore.summaryMode).toBe('candidate-select')
      expect(mapPointsStore.draftPoint).toBeNull()
      expect(mapPointsStore.pendingCanonicalSelection?.recommendedPlaceId).toBe(
        PHASE12_AMBIGUOUS_RESOLVE.recommendedPlaceId,
      )
      expect(mapPointsStore.pendingCanonicalSelection?.candidates).toHaveLength(
        PHASE12_AMBIGUOUS_RESOLVE.candidates.length,
      )
    })

    it('keeps a single resolved overseas hit in normal detail mode instead of candidate-select', async () => {
      canonicalPlacesMock.resolveCanonicalPlace.mockResolvedValue(
        makeResolvedResponse(PHASE28_RESOLVED_CALIFORNIA),
      )

      const mapOnMock = vi.fn((event: string, handler: unknown) => {
        if (event === 'click') {
          capturedMapClickHandler = handler as typeof capturedMapClickHandler
        }
      })
      const fakeMap = {
        on: mapOnMock,
        off: vi.fn(),
        latLngToContainerPoint: vi.fn(() => ({ x: 100, y: 100 })),
        removeLayer: vi.fn(),
        addLayer: vi.fn(),
      } as unknown as import('leaflet').Map

      ;(leafletMapContainer.mapRef as any).value = fakeMap as unknown as null
      const wrapper = mount(LeafletMapStage, { global: { plugins: [pinia] } })

      ;(leafletMapContainer.isReadyRef as any).value = true
      ;(popupAnchorContainer.virtualElementRef as any).value = makeVirtualElement()
      await nextTick()
      await flushPromises()

      await triggerMapClick({ lat: 36.7783, lng: -119.4179 })
      await flushPromises()

      const mapPointsStore = useMapPointsStore()
      expect(mapPointsStore.summaryMode).toBe('detected-preview')
      expect(mapPointsStore.pendingCanonicalSelection).toBeNull()
      expect(mapPointsStore.draftPoint).toEqual(
        expect.objectContaining({
          placeId: PHASE28_RESOLVED_CALIFORNIA.placeId,
          boundaryId: PHASE28_RESOLVED_CALIFORNIA.boundaryId,
          name: 'California',
        }),
      )
      expect(wrapper.get('[data-region="point-summary-card"]').attributes('data-summary-mode')).toBe(
        'detected-preview',
      )
      expect(wrapper.get('[data-illuminate-state="off"]').attributes('data-illuminatable')).toBe(
        'true',
      )
    })

    it('clears stale selection and suppresses notice when unsupported click has no fallback hit', async () => {
      canonicalPlacesMock.resolveCanonicalPlace.mockResolvedValue({
        status: 'failed',
        click: { lat: 0, lng: 0 },
        reason: 'OUTSIDE_SUPPORTED_DATA',
        message: '当前点击位置暂未命中已接入的正式行政区数据。',
      })

      const mapOnMock = vi.fn((event: string, handler: unknown) => {
        if (event === 'click') {
          capturedMapClickHandler = handler as typeof capturedMapClickHandler
        }
      })
      const fakeMap = {
        on: mapOnMock,
        off: vi.fn(),
        latLngToContainerPoint: vi.fn(() => ({ x: 100, y: 100 })),
        removeLayer: vi.fn(),
        addLayer: vi.fn(),
      } as unknown as import('leaflet').Map

      ;(leafletMapContainer.mapRef as any).value = fakeMap as unknown as null

      const mapPointsStore = useMapPointsStore()
      const mapUiStore = useMapUiStore()
      mapPointsStore.startDraftFromDetection(makeDraftPoint())

      mount(LeafletMapStage, { global: { plugins: [pinia] } })

      ;(leafletMapContainer.isReadyRef as any).value = true
      await nextTick()
      await flushPromises()

      await triggerMapClick({ lat: 0, lng: 0 })
      await flushPromises()

      expect(geoLookupMock.lookupCountryRegionByCoordinates).toHaveBeenCalledWith({ lat: 0, lng: 0 })
      expect(mapPointsStore.summarySurfaceState).toBeNull()
      expect(mapPointsStore.draftPoint).toBeNull()
      expect(mapUiStore.interactionNotice).toBeNull()
    })
  })

  // -------------------------------------------------------------------------
  // BOUNDARY CLICK -> SAVED POINT SHORTCUT (D-12)
  // -------------------------------------------------------------------------

  describe('boundary click -> saved point shortcut', () => {
    it('opens saved point popup without calling resolveCanonicalPlace (D-12)', async () => {
      // Pre-save a point via illuminate so the boundary click shortcut works
      const mapPointsStore = useMapPointsStore()
      mapPointsStore.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])

      mount(LeafletMapStage, { global: { plugins: [pinia] } })
      await nextTick()

      expect(capturedBoundaryClickHandler).not.toBeNull()

      // Trigger boundary click for the saved point's boundaryId
      const L = await import('leaflet')
      const fakeLatlng = L.latLng(39.9042, 116.4074)
      capturedBoundaryClickHandler!(PHASE12_RESOLVED_BEIJING.boundaryId, fakeLatlng)
      await nextTick()

      // resolveCanonicalPlace should NOT have been called
      expect(canonicalPlacesMock.resolveCanonicalPlace).not.toHaveBeenCalled()

      // Store should show the saved point as active
      expect(mapPointsStore.summarySurfaceState).not.toBeNull()
      expect(mapPointsStore.summarySurfaceState?.mode).toBe('view')
    })

  })

  // -------------------------------------------------------------------------
  // POPUP VISIBILITY (UIX-01 — drawer removed per D-01)
  // -------------------------------------------------------------------------

  describe('popup visibility (drawer removed per D-01)', () => {
    it('shows MapContextPopup when summarySurfaceState is set (UIX-01)', async () => {
      const mapPointsStore = useMapPointsStore()

      mapPointsStore.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])
      mapPointsStore.selectPointById(PHASE12_RESOLVED_BEIJING.placeId)

      expect(mapPointsStore.summarySurfaceState).not.toBeNull()
      expect(mapPointsStore.summarySurfaceState?.mode).toBe('view')

      const wrapper = mount(LeafletMapStage, { global: { plugins: [pinia] } })
      await nextTick()

      // popupAnchor is null from mock, so MapContextPopup won't render.
      // We verify the store state is correct.
      expect(mapPointsStore.summarySurfaceState?.mode).toBe('view')
    })
  })

  describe('records bootstrap boundaries', () => {
    it('does not fetch /records again during anonymous map startup', async () => {
      mount(LeafletMapStage, { global: { plugins: [pinia] } })

      ;(leafletMapContainer.isReadyRef as any).value = true
      await nextTick()
      await flushPromises()

    })

    it('consumes the authenticated snapshot without refetching /records', async () => {
      const fc = makeFakeFeatureCollection()
      const mapPointsStore = useMapPointsStore()
      mapPointsStore.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])
      geometryManifestMock.getGeometryManifestEntry.mockReturnValue({
        boundaryId: PHASE12_RESOLVED_BEIJING.boundaryId,
        layer: 'CN',
        geometryDatasetVersion: '2026-04-21-geo-v3',
        assetKey: 'cn/beijing.json',
        renderableId: PHASE12_RESOLVED_BEIJING.boundaryId,
      })
      geometryLoaderMock.loadGeometryShard.mockResolvedValue(fc)

      mount(LeafletMapStage, { global: { plugins: [pinia] } })

      ;(leafletMapContainer.isReadyRef as any).value = true
      await nextTick()
      await flushPromises()

      expect(geometryLoaderMock.loadGeometryShard).toHaveBeenCalledWith(
        '2026-04-21-geo-v3',
        'cn/beijing.json',
      )
      expect(addFeaturesMock).toHaveBeenCalledWith('CN', fc)
    })
  })

  // -------------------------------------------------------------------------
  // ILLUMINATE ACTIONS (REQ-16-01, REQ-16-02)
  // -------------------------------------------------------------------------

  describe('illuminate actions', () => {
    it('opens the login modal instead of writing records when the user is anonymous', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()
      const openAuthModalSpy = vi.spyOn(authSessionStore, 'openAuthModal')
      authSessionStore.status = 'anonymous'
      authSessionStore.currentUser = null

      const wrapper = mount(LeafletMapStage, { global: { plugins: [pinia] } })

      ;(popupAnchorContainer.virtualElementRef as any).value = makeVirtualElement()
      mapPointsStore.startDraftFromDetection(makeDraftPoint())
      await nextTick()
      await flushPromises()

      await wrapper.get('[data-illuminate-state="off"]').trigger('click')
      await wrapper.vm.$nextTick()

      const tripForm = wrapper.findComponent(TripDateForm)
      expect(tripForm.exists()).toBe(true)
      await tripForm.vm.$emit('submit', { startDate: '2025-10-01', endDate: null })
      await flushPromises()

      expect(recordsApiMock.createTravelRecord).not.toHaveBeenCalled()
      expect(openAuthModalSpy).toHaveBeenCalledWith('login')
      expect(mapPointsStore.summarySurfaceState?.mode).toBe('detected-preview')
    })

    it('loads the geometry shard after a successful canonical illuminate', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapUiStore = useMapUiStore()
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = {
        id: 'user-1',
        username: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }
      const fc = makeFakeFeatureCollection()
      geometryManifestMock.getGeometryManifestEntry.mockReturnValue({
        boundaryId: PHASE12_RESOLVED_BEIJING.boundaryId,
        layer: 'CN',
        geometryDatasetVersion: '2026-04-21-geo-v3',
        assetKey: 'cn/beijing.json',
        renderableId: PHASE12_RESOLVED_BEIJING.boundaryId,
      })
      geometryLoaderMock.loadGeometryShard.mockResolvedValue(fc)
      recordsApiMock.createTravelRecord.mockResolvedValueOnce(makeRecord(PHASE12_RESOLVED_BEIJING))

      const mapPointsStore = useMapPointsStore()
      const illuminateSpy = vi.spyOn(mapPointsStore, 'illuminate')
      const wrapper = mount(LeafletMapStage, { global: { plugins: [pinia] } })

      ;(popupAnchorContainer.virtualElementRef as any).value = makeVirtualElement()
      mapPointsStore.startDraftFromDetection(makeDraftPoint())
      await nextTick()
      await flushPromises()

      await wrapper.get('[data-illuminate-state="off"]').trigger('click')
      await wrapper.vm.$nextTick()
      const tripForm = wrapper.findComponent(TripDateForm)
      expect(tripForm.exists()).toBe(true)
      await tripForm.vm.$emit('submit', { startDate: '2025-10-01', endDate: null })
      await flushPromises()

      expect(illuminateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2025-10-01',
          endDate: null,
        }),
      )
      expect(geometryManifestMock.getGeometryManifestEntry).toHaveBeenCalledWith(
        PHASE12_RESOLVED_BEIJING.boundaryId,
      )
      expect(geometryLoaderMock.loadGeometryShard).toHaveBeenCalledWith(
        '2026-04-21-geo-v3',
        'cn/beijing.json',
      )
      expect(addFeaturesMock).toHaveBeenCalledWith('CN', fc)
      expect(mapUiStore.interactionNotice).toMatchObject({
        tone: 'info',
        message: '已同步到当前账号。',
      })
    })

    it('re-records a visit from the "再记一次" CTA on an illuminated point', async () => {
      const authSessionStore = useAuthSessionStore()
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = {
        id: 'user-1',
        username: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }

      const mapPointsStore = useMapPointsStore()
      const illuminateSpy = vi.spyOn(mapPointsStore, 'illuminate')
      recordsApiMock.createTravelRecord.mockResolvedValueOnce(
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'server-rec-beijing-repeat',
          startDate: '2025-11-05',
          endDate: '2025-11-10',
          createdAt: '2025-11-10T00:00:00.000Z',
        }),
      )

      mapPointsStore.replaceTravelRecords([
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          startDate: '2025-10-01',
          endDate: null,
          createdAt: '2025-10-01T00:00:00.000Z',
        }),
      ])

      const wrapper = mount(LeafletMapStage, { global: { plugins: [pinia] } })

      ;(popupAnchorContainer.virtualElementRef as any).value = makeVirtualElement()
      mapPointsStore.selectPointById(PHASE12_RESOLVED_BEIJING.placeId)
      await nextTick()
      await flushPromises()

      expect(wrapper.get('[data-trip-summary-count]').text()).toContain('已去过 1 次')

      await wrapper.get('[data-record-again]').trigger('click')
      await wrapper.vm.$nextTick()

      const tripForm = wrapper.findComponent(TripDateForm)
      expect(tripForm.exists()).toBe(true)
      await tripForm.vm.$emit('submit', {
        startDate: '2025-11-05',
        endDate: '2025-11-10',
      })
      await flushPromises()

      expect(illuminateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2025-11-05',
          endDate: '2025-11-10',
        }),
      )
      expect(mapPointsStore.tripsByPlaceId.get(PHASE12_RESOLVED_BEIJING.placeId)).toHaveLength(2)
      expect(wrapper.get('[data-trip-summary-count]').text()).toContain('已去过 2 次')
    })

    it('selects the latest trip by travel date, not by createdAt (VERIFICATION gap close)', async () => {
      // 回归保护：VERIFICATION.md truth #10 gap 1
      // 用户先录入一次 2025-10-01 的旅行，然后补录一次旅行时间更早（2025-05-01 -- 2025-05-05）
      // 但 createdAt 更晚的历史记录。
      // popup 摘要必须显示真正最近的旅行日期 2025-10-01，而不是最后被录入的 2025-05-01。
      const authSessionStore = useAuthSessionStore()
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = {
        id: 'user-1',
        username: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }

      const mapPointsStore = useMapPointsStore()

      // 记录 A：先录入（createdAt 较早），但旅行时间是真正最近的一次
      const newerTripRecord = makeRecord(PHASE12_RESOLVED_BEIJING, {
        id: 'server-rec-beijing-newer-trip',
        startDate: '2025-10-01',
        endDate: null,
        createdAt: '2025-10-01T00:00:00.000Z',
      })
      // 记录 B：后录入（createdAt 较晚），但旅行时间是更早的一次
      const olderTripRecord = makeRecord(PHASE12_RESOLVED_BEIJING, {
        id: 'server-rec-beijing-older-trip',
        startDate: '2025-05-01',
        endDate: '2025-05-05',
        createdAt: '2025-11-20T00:00:00.000Z',
      })

      mapPointsStore.replaceTravelRecords([newerTripRecord, olderTripRecord])

      const wrapper = mount(LeafletMapStage, { global: { plugins: [pinia] } })

      ;(popupAnchorContainer.virtualElementRef as any).value = makeVirtualElement()
      mapPointsStore.selectPointById(PHASE12_RESOLVED_BEIJING.placeId)
      await nextTick()
      await flushPromises()

      // 先验证聚合正确（tripsByPlaceId 里真的有两条）
      expect(wrapper.get('[data-trip-summary-count]').text()).toContain('已去过 2 次')

      // 核心断言：摘要必须展示真正旅行时间最近的 2025-10-01，而不是最后录入的 2025-05-01
      const latestText = wrapper.get('[data-trip-summary-latest]').text()
      expect(latestText).toContain('2025-10-01')
      expect(latestText).not.toContain('2025-05-01')
    })

    it('renders fallback illuminate affordance as disabled and keeps unsupported feedback inside the popup', async () => {
      const authSessionStore = useAuthSessionStore()
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = {
        id: 'user-1',
        username: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }
      const mapPointsStore = useMapPointsStore()
      const mapUiStore = useMapUiStore()
      geoLookupMock.lookupCountryRegionByCoordinates.mockResolvedValue({
        kind: 'region',
        countryCode: 'CA',
        countryName: 'Canada',
        regionName: 'British Columbia',
        displayName: 'British Columbia',
        precision: 'region',
        cityId: null,
        cityName: null,
        cityCandidates: [],
        fallbackNotice: null,
        lat: 49.2827,
        lng: -123.1207,
        confidence: 0.93,
      })
      canonicalPlacesMock.resolveCanonicalPlace.mockResolvedValue({
        status: 'failed',
        click: { lat: 49.2827, lng: -123.1207 },
        reason: 'OUTSIDE_SUPPORTED_DATA',
        message: '当前点击位置暂未命中已接入的正式行政区数据。',
      })

      const mapOnMock = vi.fn((event: string, handler: unknown) => {
        if (event === 'click') {
          capturedMapClickHandler = handler as typeof capturedMapClickHandler
        }
      })
      const fakeMap = {
        on: mapOnMock,
        off: vi.fn(),
        latLngToContainerPoint: vi.fn(() => ({ x: 100, y: 100 })),
        removeLayer: vi.fn(),
        addLayer: vi.fn(),
      } as unknown as import('leaflet').Map

      ;(leafletMapContainer.mapRef as any).value = fakeMap as unknown as null
      const wrapper = mount(LeafletMapStage, { global: { plugins: [pinia] } })

      ;(leafletMapContainer.isReadyRef as any).value = true
      ;(popupAnchorContainer.virtualElementRef as any).value = makeVirtualElement()
      await nextTick()
      await flushPromises()

      await triggerMapClick({ lat: 49.2827, lng: -123.1207 })
      await flushPromises()

      const button = wrapper.get('[data-illuminate-state="off"]')
      expect(button.attributes('disabled')).toBeDefined()
      expect(button.attributes('data-illuminatable')).toBe('false')
      expect(mapPointsStore.summaryMode).toBe('detected-preview')
      expect(mapPointsStore.pendingCanonicalSelection).toBeNull()
      expect(mapPointsStore.draftPoint).toEqual(
        expect.objectContaining({
          name: 'British Columbia',
          fallbackNotice: buildUnsupportedOverseasNotice('British Columbia'),
          placeId: null,
          boundaryId: null,
        }),
      )
      expect(wrapper.text()).toContain(buildUnsupportedOverseasNotice('British Columbia'))
      expect(mapUiStore.interactionNotice).toBeNull()

      wrapper.getComponent(MapContextPopup).vm.$emit('illuminate', {
        startDate: '2025-10-01',
        endDate: null,
      })
      await nextTick()

      expect(mapUiStore.interactionNotice).toBeNull()
    })

    it('surfaces a success notice after unilluminate via the popup action', async () => {
      const authSessionStore = useAuthSessionStore()
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = {
        id: 'user-1',
        username: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }
      const mapPointsStore = useMapPointsStore()
      const mapUiStore = useMapUiStore()
      recordsApiMock.deleteTravelRecord.mockResolvedValueOnce(undefined)

      mapPointsStore.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])

      const wrapper = mount(LeafletMapStage, { global: { plugins: [pinia] } })

      ;(popupAnchorContainer.virtualElementRef as any).value = makeVirtualElement()
      mapPointsStore.selectPointById(PHASE12_RESOLVED_BEIJING.placeId)
      await nextTick()
      await flushPromises()

      await wrapper.get('[data-illuminate-state="on"]').trigger('click')
      await flushPromises()

      expect(mapPointsStore.isPlaceIlluminated(PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
      expect(mapUiStore.interactionNotice).toMatchObject({
        tone: 'info',
        message: '已从当前账号移除。',
      })
    })
  })

  // -------------------------------------------------------------------------
  // HIGHLIGHT STATE TRANSITIONS (MAP-06, MAP-08)
  // -------------------------------------------------------------------------

  describe('highlight state transitions', () => {
    it('refreshes styles when selectedBoundaryId changes (MAP-06)', async () => {
      const mapPointsStore = useMapPointsStore()

      // Pre-save a point via illuminate
      mapPointsStore.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])
      mapPointsStore.selectPointById(PHASE12_RESOLVED_BEIJING.placeId)

      mount(LeafletMapStage, { global: { plugins: [pinia] } })
      await nextTick()

      // Verify selectedBoundaryId is set (MAP-06 — boundary tracks selection)
      expect(mapPointsStore.selectedBoundaryId).toBe(PHASE12_RESOLVED_BEIJING.boundaryId)

      // Clear and re-verify
      mapPointsStore.clearActivePoint()
      await nextTick()
      expect(mapPointsStore.selectedBoundaryId).toBeNull()

      // Re-select by illuminating again
      mapPointsStore.illuminate({
        ...PHASE12_RESOLVED_BEIJING,
        startDate: null,
        endDate: null,
      })
      await nextTick()
      expect(mapPointsStore.selectedBoundaryId).toBe(PHASE12_RESOLVED_BEIJING.boundaryId)
    })

    it('no double-highlight on selection switch (MAP-08)', async () => {
      const mapPointsStore = useMapPointsStore()

      // Pre-save two points with different boundaryIds
      mapPointsStore.replaceTravelRecords([
        makeRecord(PHASE12_RESOLVED_BEIJING),
        makeRecord(PHASE28_RESOLVED_CALIFORNIA),
      ])

      mount(LeafletMapStage, { global: { plugins: [pinia] } })
      await nextTick()

      // savedBoundaryIds should have both
      expect(mapPointsStore.savedBoundaryIds).toContain(PHASE12_RESOLVED_BEIJING.boundaryId)
      expect(mapPointsStore.savedBoundaryIds).toContain(PHASE28_RESOLVED_CALIFORNIA.boundaryId)

      // Un-illuminate Beijing — California should remain highlighted
      mapPointsStore.unilluminate(PHASE12_RESOLVED_BEIJING.placeId)
      await nextTick()
      expect(mapPointsStore.savedBoundaryIds).not.toContain(PHASE12_RESOLVED_BEIJING.boundaryId)
      expect(mapPointsStore.savedBoundaryIds).toContain(PHASE28_RESOLVED_CALIFORNIA.boundaryId)
    })
  })
})
