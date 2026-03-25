import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

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
      name: 'Kyoto',
      countryName: 'Japan',
      countryCode: 'JP',
      precision: 'city-high',
      cityId: 'jp-kyoto',
      cityName: 'Kyoto',
      cityContextLabel: 'Japan · Kansai',
      fallbackNotice: null,
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
    expect(secondStore.userPoints[0].name).toBe('Kyoto')
    expect(secondStore.userPoints[0].cityId).toBe('jp-kyoto')
    expect(secondStore.userPoints[0].cityName).toBe('Kyoto')
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

  it('shows the same recovery path for incompatible snapshots', async () => {
    window.localStorage.setItem(
      POINT_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        userPoints: [],
        seedOverrides: [],
        deletedSeedIds: []
      })
    )

    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.text()).toContain('清空本地存档')

    await wrapper.get('.app-shell__storage-action').trigger('click')

    expect(window.localStorage.getItem(POINT_STORAGE_KEY)).toBeNull()
  })

  it('keeps long text inside the drawer layout hooks when a point is active', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    const store = useMapPointsStore()
    store.startDraftFromDetection({
      id: 'detected-kyoto',
      name: 'Kyoto',
      countryName: 'Japan',
      countryCode: 'JP',
      precision: 'city-high',
      cityId: 'jp-kyoto',
      cityName: 'Kyoto',
      cityContextLabel: 'Japan · Kansai',
      fallbackNotice: '未能可靠确认城市，已提供国家/地区继续记录',
      lat: 35.0116,
      lng: 135.7681,
      x: 0.68,
      y: 0.42,
      source: 'detected',
      isFeatured: false,
      description: 'long text '.repeat(80),
      coordinatesLabel: '35.0116°N, 135.7681°E'
    })
    store.saveDraftAsPoint()
    await nextTick()

    expect(wrapper.get('.poster-shell__experience').classes()).toContain('poster-shell__experience--drawer-open')
    expect(wrapper.get('[data-scroll-region="true"]').text()).toContain('long text')
    expect(wrapper.text()).toContain('未能可靠确认城市，已提供国家/地区继续记录')

    store.enterEditMode()
    await nextTick()

    expect(wrapper.get('.poster-shell__experience').classes()).toContain('poster-shell__experience--drawer-edit')
  })

  it('keeps legacy saved points without city identity viewable and editable', async () => {
    window.localStorage.setItem(
      POINT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        userPoints: [
          {
            id: 'legacy-kyoto',
            name: 'Kyoto legacy',
            countryName: 'Japan',
            countryCode: 'JP',
            precision: 'city-high',
            fallbackNotice: null,
            x: 0.68,
            y: 0.42,
            lat: 35.0116,
            lng: 135.7681,
            source: 'saved',
            isFeatured: false,
            description: 'legacy point',
            coordinatesLabel: '35.0116°N, 135.7681°E',
            createdAt: '2026-03-25T00:00:00.000Z',
            updatedAt: '2026-03-25T00:00:00.000Z'
          }
        ],
        seedOverrides: [],
        deletedSeedIds: []
      })
    )

    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(App, {
      global: {
        plugins: [pinia]
      }
    })

    const store = useMapPointsStore()
    store.selectPointById('legacy-kyoto')
    await nextTick()

    expect(wrapper.text()).toContain('Kyoto legacy')
    expect(wrapper.text()).toContain('编辑')

    store.enterEditMode()
    await nextTick()

    expect(wrapper.get('.poster-shell__experience').classes()).toContain('poster-shell__experience--drawer-edit')
  })
})
