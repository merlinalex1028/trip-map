import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, nextTick, shallowRef } from 'vue'

import App from './App.vue'
import { useMapUiStore } from './stores/map-ui'

vi.mock('./composables/usePopupAnchoring', () => ({
  usePopupAnchoring: () => ({
    floatingStyles: computed(() => ({
      left: '24px',
      top: '32px',
    })),
    placement: shallowRef('top-start'),
    collisionState: computed(() => 'stable' as const),
    availableHeight: computed(() => 320),
    updatePosition: vi.fn(),
    cleanup: vi.fn(),
  }),
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
  getBoundingClientRect: () => ({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }),
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
          database: 'up',
        }),
      })
    }

    if (url.endsWith('/geo/country-regions.geo.json')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ type: 'FeatureCollection', features: [] }),
      })
    }

    return Promise.reject(new Error(`Unexpected fetch request: ${url}`))
  })

  vi.stubGlobal('fetch', fetchMock)
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    value: fetchMock,
  })
}

function mountApp() {
  const pinia = createPinia()
  setActivePinia(pinia)

  return mount(App, {
    global: {
      plugins: [pinia],
    },
  })
}

describe('App kawaii shell contracts', () => {
  beforeEach(() => {
    installFetchMock()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps the topbar as a thin shell with roomy app spacing', () => {
    const wrapper = mountApp()
    const topbar = wrapper.get('[data-region="topbar"]')
    const mainShell = wrapper.get('main')

    expect(topbar.attributes('data-kawaii-shell')).toBe('thin')
    expect(topbar.attributes('class')).toContain('h-14')
    expect(topbar.attributes('class')).toContain('md:h-16')
    expect(mainShell.attributes('class')).toContain(
      'gap-4 px-4 pb-4 pt-[4.5rem] md:px-8 md:pb-8 md:pt-[5rem]',
    )
  })

  it('renders the interaction notice as a pill capsule with text interpolation only', async () => {
    const wrapper = mountApp()
    const mapUiStore = useMapUiStore()

    mapUiStore.setInteractionNotice({
      tone: 'info',
      message: 'notice contract',
    })
    await nextTick()

    const notice = wrapper.get('[role="status"]')
    const source = readFileSync(resolve(process.cwd(), 'src/App.vue'), 'utf8')

    expect(notice.attributes('data-kawaii-notice')).toBe('pill')
    expect(notice.attributes('class')).toContain(
      'rounded-full border border-white/80 bg-white/82 px-4 py-3',
    )
    expect(notice.attributes('class')).toContain('text-sm')
    expect(notice.attributes('class')).toContain('shadow-[var(--shadow-float)]')
    expect(notice.text()).toContain('notice contract')
    expect(source).toContain('{{ interactionNotice.message }}')
    expect(source).not.toContain('v-html')
  })

  it('keeps the map shell roomy without leaking transform utilities onto the map host', () => {
    const wrapper = mountApp()
    const mapShell = wrapper.get('[data-region="map-shell"]')
    const mapStage = wrapper.get('[data-region="map-stage"]')
    const mapStageClasses = mapStage.attributes('class')

    expect(mapShell.attributes('class')).toContain(
      'rounded-[32px] border border-white/80 bg-white/65 p-4 md:p-6',
    )
    expect(mapShell.attributes('class')).toContain('gap-4')
    expect(mapStageClasses).not.toMatch(/scale|translate|rotate|skew|perspective|filter/)
  })
})
