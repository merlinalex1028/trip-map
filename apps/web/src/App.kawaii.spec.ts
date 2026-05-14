import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, nextTick, shallowRef } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from './App.vue'
import { useAuthSessionStore } from './stores/auth-session'
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

async function mountApp() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const authSessionStore = useAuthSessionStore()
  authSessionStore.status = 'authenticated'
  authSessionStore.currentUser = {
    id: 'user-1',
    username: 'Alice',
    email: 'alice@example.com',
    createdAt: '2026-04-12T00:00:00.000Z',
  }
  vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        name: 'landing',
        component: {
          template: '<div data-route-view="landing">Landing</div>',
        },
      },
      {
        path: '/map',
        name: 'world-footprints',
        meta: { requiresAuth: true },
        component: {
          template: '<section data-region="map-shell" data-route-view="map"><div class="min-h-0 flex-1" data-region="map-stage">Map</div></section>',
        },
      },
      {
        path: '/:pathMatch(.*)*',
        redirect: '/',
      },
    ],
  })

  const wrapper = mount(App, {
    global: {
      plugins: [pinia, router],
    },
  })

  await router.push('/map')
  await router.isReady()

  return wrapper
}

describe('App kawaii shell contracts', () => {
  beforeEach(() => {
    installFetchMock()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the authenticated shell instead of the thin topbar contract', async () => {
    const wrapper = await mountApp()

    expect(wrapper.find('[data-app-shell]').exists()).toBe(true)
    expect(wrapper.find('[data-shell-sidebar]').exists()).toBe(true)
    expect(wrapper.find('[data-region="topbar"]').exists()).toBe(false)
  })

  it('renders the interaction notice as a pill capsule with text interpolation only', async () => {
    const wrapper = await mountApp()
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
    expect(notice.text()).toContain('notice contract')
    expect(source).toContain('{{ interactionNotice.message }}')
    expect(source).not.toContain('v-html')
  })

  it('keeps the authenticated shell contract free of old topbar markup and transform leakage', async () => {
    const wrapper = await mountApp()
    const appShell = wrapper.get('[data-app-shell]')
    const mapStage = wrapper.get('[data-region="map-stage"]')
    const source = readFileSync(resolve(process.cwd(), 'src/App.vue'), 'utf8')

    expect(appShell.attributes('style')).toContain('--sidebar-width: 260px')
    expect(wrapper.find('[data-region="topbar"]').exists()).toBe(false)
    expect(source).not.toContain('data-region="topbar"')
    expect(source).not.toContain('data-kawaii-shell="thin"')
    expect(mapStage.attributes('class')).not.toMatch(/scale|translate|rotate|skew|perspective|filter/)
  })
})
