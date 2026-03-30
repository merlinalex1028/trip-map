import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, nextTick, shallowRef } from 'vue'

import App from './App.vue'
import { getBoundaryByCityId } from './services/city-boundaries'
import { POINT_STORAGE_KEY } from './services/point-storage'
import { useMapPointsStore } from './stores/map-points'

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

function createBoundaryAwareDraft(cityId: string) {
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
    description: 'boundary-aware point',
    coordinatesLabel: isPortugal ? '38.7223°N, 9.1393°W' : '35.0116°N, 135.7681°E'
  }
}

describe('App shell', () => {
  beforeEach(() => {
    installStorageMock()
    installFetchMock()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the poster shell from the package-local app entry', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.find('.poster-shell').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'BackendBaselinePanel' }).exists()).toBe(true)
    expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(true)
    expect(wrapper.find('.poster-title-block__ribbon').exists()).toBe(true)
    expect(wrapper.text()).toContain('旅行世界地图')
    expect(wrapper.text()).toContain('创建 smoke record')
  })

  it('shows the storage recovery warning and clears it on demand', async () => {
    window.localStorage.setItem(POINT_STORAGE_KEY, '{broken-json')

    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.find('.app-shell__storage-warning').exists()).toBe(true)
    expect(wrapper.text()).toContain('检测到本地存档异常，请清空本地存档后继续使用。')

    await wrapper.get('.app-shell__storage-action').trigger('click')

    expect(window.localStorage.getItem(POINT_STORAGE_KEY)).toBeNull()
    expect(wrapper.find('.app-shell__storage-warning').exists()).toBe(false)
  })

  it('renders the deep drawer inside the map stage after the saved-point handoff', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    const store = useMapPointsStore()
    store.startDraftFromDetection(createBoundaryAwareDraft('jp-kyoto'))
    store.saveDraftAsPoint()
    await nextTick()

    expect(wrapper.find('[data-region="point-preview-drawer"]').exists()).toBe(false)

    store.openDrawerView()
    await nextTick()
    await nextTick()

    expect(wrapper.find('.world-map-stage__surface [data-region="point-preview-drawer"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Kyoto')
    expect(wrapper.text()).toContain('编辑地点')
  })
})
