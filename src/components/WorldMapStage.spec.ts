import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import { useMapPointsStore } from '../stores/map-points'
import { useMapUiStore } from '../stores/map-ui'
import type { GeoCoordinates, GeoDetectionResult } from '../types/geo'
import WorldMapStage from './WorldMapStage.vue'

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

describe('WorldMapStage', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    lookupCountryRegionByCoordinates.mockReset()
    lookupCountryRegionByCoordinates.mockImplementation((geo: { lat: number; lng: number }) => ({
      kind: 'country',
      countryCode: 'JP',
      countryName: 'Japan',
      regionName: null,
      displayName: 'Kyoto',
      precision: 'city-high',
      cityName: 'Kyoto',
      fallbackNotice: null,
      lat: geo.lat,
      lng: geo.lng,
      confidence: 0.99
    }))
    isLowConfidenceBoundaryHit.mockReset()
    isLowConfidenceBoundaryHit.mockReturnValue(false)

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)

      return 0
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('creates a draft point with high-confidence city metadata', async () => {
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

    expect(mapPointsStore.activePoint?.name).toBe('Kyoto')
    expect(mapPointsStore.activePoint?.precision).toBe('city-high')
    expect(mapPointsStore.activePoint?.cityName).toBe('Kyoto')
    expect(mapPointsStore.activePoint?.countryName).toBe('Japan')
  })

  it('keeps the fallback country path and copy when city enrichment fails', async () => {
    lookupCountryRegionByCoordinates.mockImplementationOnce((geo: { lat: number; lng: number }) => ({
      kind: 'country',
      countryCode: 'PT',
      countryName: 'Portugal',
      regionName: null,
      displayName: 'Portugal',
      precision: 'country',
      cityName: null,
      fallbackNotice: '未识别到更精确城市，已回退到国家/地区',
      lat: geo.lat,
      lng: geo.lng,
      confidence: 0.95
    }))

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

    expect(mapPointsStore.activePoint?.name).toBe('Portugal')
    expect(mapPointsStore.activePoint?.fallbackNotice).toBe('未识别到更精确城市，已回退到国家/地区')
  })

  it('keeps edge-position fallback markers inside the map surface', async () => {
    lookupCountryRegionByCoordinates.mockImplementationOnce(() => ({
      kind: 'country',
      countryCode: 'JP',
      countryName: 'Japan',
      regionName: null,
      displayName: 'Japan',
      precision: 'country',
      cityName: null,
      fallbackNotice: '未识别到更精确城市，已回退到国家/地区',
      lat: 88,
      lng: 179,
      confidence: 0.94
    }))

    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    const surface = wrapper.get('.world-map-stage__surface').element as HTMLDivElement
    installFrame(surface)

    await wrapper.get('.world-map-stage__surface').trigger('click', {
      clientX: 1588,
      clientY: 84
    })
    await flushPromises()

    const markerStyle = wrapper.get('.seed-marker--draft').attributes('style') ?? ''
    const leftValue = Number(markerStyle.match(/left: ([0-9.]+)%/)?.[1] ?? 0)
    const topValue = Number(markerStyle.match(/top: ([0-9.]+)%/)?.[1] ?? 0)
    const mapUiStore = useMapUiStore()

    expect(leftValue).toBeGreaterThanOrEqual(0)
    expect(leftValue).toBeLessThanOrEqual(100)
    expect(topValue).toBeGreaterThanOrEqual(0)
    expect(topValue).toBeLessThanOrEqual(100)
    expect(mapUiStore.interactionNotice).toBeNull()
  })

  it('represents a realistic near-city click through the actual draft flow', async () => {
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

    expect(mapPointsStore.activePoint?.precision).toBe('city-high')
    expect(mapPointsStore.activePoint?.name).toBe('Kyoto')
    expect(mapPointsStore.activePoint?.countryName).toBe('Japan')
  })

  it('removes the old draft when selecting an existing point', async () => {
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

    expect(wrapper.find('.seed-marker--draft').exists()).toBe(true)

    const seedKyotoMarker = wrapper
      .findAll('.seed-marker__button')
      .find((marker) => {
        const ariaLabel = marker.attributes('aria-label') ?? ''

        return ariaLabel.includes('Kyoto，Japan') && !ariaLabel.includes('未保存地点')
      })

    expect(seedKyotoMarker).toBeDefined()

    await seedKyotoMarker!.trigger('click')
    await flushPromises()

    const mapPointsStore = useMapPointsStore()

    expect(mapPointsStore.draftPoint).toBeNull()
    expect(mapPointsStore.activePoint?.id).toBe('seed-kyoto')
    expect(wrapper.find('.seed-marker--draft').exists()).toBe(false)
  })

  it('represents a realistic near-but-not-on city click through the fallback flow', async () => {
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

    expect(mapPointsStore.activePoint?.name).toBe('Japan')
    expect(mapPointsStore.activePoint?.precision).toBe('country')
    expect(mapPointsStore.activePoint?.fallbackNotice).toBe('未识别到更精确城市，已回退到国家/地区')
  })
})
