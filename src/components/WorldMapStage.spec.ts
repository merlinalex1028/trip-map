import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import { useMapPointsStore } from '../stores/map-points'
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

  it('creates a draft point aligned to the clicked position', async () => {
    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    const surface = wrapper.get('.world-map-stage__surface').element as HTMLDivElement

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

    await wrapper.get('.world-map-stage__surface').trigger('click', {
      clientX: 1180,
      clientY: 360
    })
    await flushPromises()

    const mapPointsStore = useMapPointsStore()
    const draftMarker = wrapper.get('.seed-marker--draft')

    expect(mapPointsStore.activePoint?.countryCode).toBe('JP')
    expect(mapPointsStore.activePoint?.x).toBeCloseTo(1180 / 1600, 4)
    expect(mapPointsStore.activePoint?.y).toBeCloseTo(360 / 800, 4)
    expect(draftMarker.attributes('style')).toContain('left: 73.75%')
    expect(draftMarker.attributes('style')).toContain('top: 45%')
  })

  it('replaces an existing draft when the user clicks a new valid location', async () => {
    const wrapper = mount(WorldMapStage, {
      global: {
        plugins: [pinia]
      }
    })

    const surface = wrapper.get('.world-map-stage__surface').element as HTMLDivElement

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

    await wrapper.get('.world-map-stage__surface').trigger('click', {
      clientX: 1180,
      clientY: 360
    })
    await flushPromises()

    await wrapper.get('.world-map-stage__surface').trigger('click', {
      clientX: 920,
      clientY: 280
    })
    await flushPromises()

    const mapPointsStore = useMapPointsStore()
    const mapUiStore = useMapUiStore()

    expect(mapPointsStore.draftPoint?.x).toBeCloseTo(920 / 1600, 4)
    expect(mapPointsStore.draftPoint?.y).toBeCloseTo(280 / 800, 4)
    expect(mapUiStore.interactionNotice?.message).toBe('当前未保存地点将被丢弃，并切换到新位置')
  })
})
