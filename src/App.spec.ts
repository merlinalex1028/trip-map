import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import { useMapPointsStore } from './stores/map-points'
import { POINT_STORAGE_KEY } from './services/point-storage'
import App from './App.vue'

describe('App shell', () => {
  beforeEach(() => {
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
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the poster shell root', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.find('.poster-shell').exists()).toBe(true)
    expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('旅行世界地图')
  })

  it('rehydrates saved points from localStorage after remount', () => {
    let pinia = createPinia()
    setActivePinia(pinia)

    const firstWrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })
    const firstStore = useMapPointsStore()

    firstStore.startDraftFromDetection({
      id: 'detected-japan',
      name: 'Japan',
      countryName: 'Japan',
      countryCode: 'JP',
      lat: 35,
      lng: 135,
      x: 0.7,
      y: 0.45,
      source: 'detected',
      isFeatured: true,
      description: 'saved from app spec',
      coordinatesLabel: '35.0000°N, 135.0000°E'
    })
    firstStore.saveDraftAsPoint()
    firstWrapper.unmount()

    pinia = createPinia()
    setActivePinia(pinia)

    mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    const secondStore = useMapPointsStore()

    expect(secondStore.userPoints).toHaveLength(1)
    expect(secondStore.userPoints[0].name).toBe('Japan')
  })

  it('shows a corrupted-storage warning and clears it on demand', async () => {
    window.localStorage.setItem(POINT_STORAGE_KEY, '{broken-json')

    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.text()).toContain('检测到本地存档异常，请清空本地存档后继续使用。')

    await wrapper.get('.app-shell__storage-action').trigger('click')

    expect(window.localStorage.getItem(POINT_STORAGE_KEY)).toBeNull()
    expect(wrapper.text()).not.toContain('检测到本地存档异常，请清空本地存档后继续使用。')
  })
})
