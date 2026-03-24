import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import { useMapUiStore } from '../stores/map-ui'
import WorldMapStage from './WorldMapStage.vue'

vi.mock('../services/geo-lookup', () => ({
  lookupCountryRegionByCoordinates: vi.fn((geo: { lat: number; lng: number }) => ({
    kind: 'country',
    countryCode: 'JP',
    countryName: 'Japan',
    regionName: null,
    displayName: 'Japan',
    lat: geo.lat,
    lng: geo.lng,
    confidence: 0.99
  })),
  isLowConfidenceBoundaryHit: vi.fn(() => false)
}))

describe('WorldMapStage', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)

      return 0
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps the detected marker aligned to the clicked position', async () => {
    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    const mapImage = wrapper.get('.world-map-stage__map').element as HTMLImageElement

    Object.defineProperty(mapImage, 'getBoundingClientRect', {
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

    await wrapper.get('.world-map-stage__surface').trigger('click', {
      clientX: 1180,
      clientY: 360
    })
    await flushPromises()

    const mapUiStore = useMapUiStore()
    const detectedMarker = wrapper.get('[data-detected-marker="true"]')

    expect(mapUiStore.selectedPoint?.countryCode).toBe('JP')
    expect(mapUiStore.selectedPoint?.x).toBeCloseTo(1180 / 1600, 4)
    expect(mapUiStore.selectedPoint?.y).toBeCloseTo(360 / 800, 4)
    expect(detectedMarker.attributes('transform')).toBe('translate(1180 360)')
  })
})
