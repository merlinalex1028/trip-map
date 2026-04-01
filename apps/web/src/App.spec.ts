import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, nextTick, shallowRef } from 'vue'

import App from './App.vue'

vi.mock('./composables/usePopupAnchoring', () => ({
  usePopupAnchoring: () => ({
    floatingStyles: computed(() => ({
      left: '24px',
      top: '32px'
    })),
    placement: shallowRef('top-start'),
    collisionState: computed(() => 'stable' as const),
    availableHeight: computed(() => 320),
    updatePosition: vi.fn(),
    cleanup: vi.fn()
  })
}))

vi.mock('./composables/useLeafletMap', () => ({
  useLeafletMap: () => ({
    map: shallowRef(null),
    isReady: shallowRef(false),
  }),
}))

vi.mock('./composables/useGeoJsonLayers', () => ({
  useGeoJsonLayers: () => ({
    addFeatures: vi.fn(),
    refreshStyles: vi.fn(),
    cnLayer: {},
    overseasLayer: {},
  }),
}))

const fakeVirtualElement = {
  getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) }),
}

vi.mock('./composables/useLeafletPopupAnchor', () => ({
  useLeafletPopupAnchor: () => ({
    virtualElement: computed(() => fakeVirtualElement),
  }),
}))

function installFetchMock() {
  const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
    const url = String(input)

    if (url.endsWith('/api/health')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          status: 'ok',
          service: 'server',
          contractsVersion: 'phase11-v1',
          database: 'up'
        })
      })
    }

    return Promise.reject(new Error(`Unexpected fetch request: ${url}`))
  })

  vi.stubGlobal('fetch', fetchMock)
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    value: fetchMock
  })
}

describe('App shell', () => {
  beforeEach(() => {
    installFetchMock()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the poster shell from the package-local app entry', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.find('.poster-shell').exists()).toBe(true)
    expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(true)
    expect(wrapper.find('.poster-title-block__ribbon').exists()).toBe(true)
    expect(wrapper.text()).toContain('旅行世界地图')
  })
})
