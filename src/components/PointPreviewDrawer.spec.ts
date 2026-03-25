import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

import { useMapPointsStore } from '../stores/map-points'
import { useMapUiStore } from '../stores/map-ui'
import PointPreviewDrawer from './PointPreviewDrawer.vue'

function createDraft(overrides: Record<string, unknown> = {}) {
  return {
    id: 'detected-jp-1',
    name: 'Japan',
    countryName: 'Japan',
    countryCode: 'JP',
    precision: 'country' as const,
    cityId: null,
    cityName: null,
    cityContextLabel: 'Japan',
    fallbackNotice: null,
    lat: 35,
    lng: 135,
    x: 0.7,
    y: 0.45,
    source: 'detected' as const,
    isFeatured: false,
    description: '识别成功，下一阶段可补充地点内容。',
    coordinatesLabel: '35.0000°N, 135.0000°E',
    ...overrides
  }
}

function createCandidate(overrides: Record<string, unknown> = {}) {
  return {
    cityId: 'jp-kyoto',
    cityName: 'Kyoto',
    contextLabel: 'Japan · Kansai',
    matchLevel: 'high' as const,
    distanceKm: 1.5,
    statusHint: '更接近点击位置' as const,
    ...overrides
  }
}

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

describe('PointPreviewDrawer', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    installStorageMock()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  it('renders candidate-select mode with search and at most three candidates', async () => {
    const store = useMapPointsStore()
    store.startDraftFromDetection(
      createDraft({
        id: 'saved-jp-kyoto',
        name: 'Kyoto',
        precision: 'city-high',
        cityId: 'jp-kyoto',
        cityName: 'Kyoto',
        cityContextLabel: 'Japan · Kansai'
      })
    )
    store.saveDraftAsPoint()
    store.startPendingCitySelection(createDraft(), [
      createCandidate(),
      createCandidate({
        cityId: 'jp-osaka',
        cityName: 'Osaka',
        contextLabel: 'Japan · Kansai',
        matchLevel: 'possible',
        statusHint: '可能位置，需要确认'
      }),
      createCandidate({
        cityId: 'jp-kobe',
        cityName: 'Kobe',
        contextLabel: 'Japan · Kansai'
      }),
      createCandidate({
        cityId: 'jp-nara',
        cityName: 'Nara',
        contextLabel: 'Japan · Kansai'
      })
    ])

    const wrapper = mount(PointPreviewDrawer, {
      attachTo: document.body,
      global: {
        plugins: [pinia]
      }
    })

    await nextTick()

    expect(wrapper.attributes('role')).toBe('dialog')
    expect(wrapper.text()).toContain('确认城市')
    expect(wrapper.find('input[placeholder="搜索城市"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('已存在记录')
    expect(wrapper.text()).toContain('可能位置，需要确认')
    expect(wrapper.findAll('.point-preview-drawer__candidate')).toHaveLength(3)
    expect(wrapper.text()).not.toContain('Nara')
    expect(document.activeElement).toBe(wrapper.get('.point-preview-drawer__name').element)
  })

  it('keeps Tab focus trap inside the drawer', async () => {
    const store = useMapPointsStore()
    store.startDraftFromDetection(createDraft())
    store.saveDraftAsPoint()

    const wrapper = mount(PointPreviewDrawer, {
      attachTo: document.body,
      global: {
        plugins: [pinia]
      }
    })

    await nextTick()

    const closeButton = wrapper.get('.point-preview-drawer__close')
    const lastAction = wrapper.findAll('.point-preview-drawer__action')[1]

    ;(lastAction.element as HTMLButtonElement).focus()
    await lastAction.trigger('keydown', { key: 'Tab' })

    expect(document.activeElement).toBe(closeButton.element)

    ;(closeButton.element as HTMLButtonElement).focus()
    await closeButton.trigger('keydown', { key: 'Tab', shiftKey: true })

    expect(document.activeElement).toBe(lastAction.element)
  })

  it('closes immediately on Escape when there are no unsaved edits', async () => {
    const confirmSpy = vi.fn(() => true)
    vi.stubGlobal('confirm', confirmSpy)
    window.confirm = confirmSpy as typeof window.confirm

    const store = useMapPointsStore()
    store.startPendingCitySelection(createDraft(), [createCandidate()])

    const wrapper = mount(PointPreviewDrawer, {
      attachTo: document.body,
      global: {
        plugins: [pinia]
      }
    })

    await wrapper.get('.point-preview-drawer').trigger('keydown', { key: 'Escape' })

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(store.activePoint).toBeNull()
    expect(store.pendingCitySelection).toBeNull()
  })

  it('guards Escape close when dirty edits exist', async () => {
    const store = useMapPointsStore()
    store.startDraftFromDetection(createDraft())
    store.saveDraftAsPoint()

    const confirmSpy = vi.fn(() => false)
    vi.stubGlobal('confirm', confirmSpy)
    window.confirm = confirmSpy as typeof window.confirm

    const wrapper = mount(PointPreviewDrawer, {
      attachTo: document.body,
      global: {
        plugins: [pinia]
      }
    })

    await wrapper.get('.point-preview-drawer__action--primary').trigger('click')
    await wrapper.get('.point-preview-drawer__input').setValue('Kyoto')
    await wrapper.get('.point-preview-drawer__input').trigger('keydown', { key: 'Escape' })

    expect(confirmSpy).toHaveBeenCalledWith('你有未保存的更改，确定关闭吗？')
    expect(store.activePoint).not.toBeNull()
  })

  it('does not leave a draft behind after switching to an existing point and closing', async () => {
    const store = useMapPointsStore()
    store.bootstrapPoints()
    store.startDraftFromDetection(createDraft())
    store.selectPointById('seed-kyoto')

    const wrapper = mount(PointPreviewDrawer, {
      attachTo: document.body,
      global: {
        plugins: [pinia]
      }
    })

    await nextTick()
    await wrapper.get('.point-preview-drawer__close').trigger('click')

    expect(store.activePoint).toBeNull()
    expect(store.draftPoint).toBeNull()
  })

  it('uses the same selection path for default candidates and search results', async () => {
    const store = useMapPointsStore()
    store.startPendingCitySelection(createDraft(), [
      createCandidate(),
      createCandidate({
        cityId: 'jp-osaka',
        cityName: 'Osaka',
        contextLabel: 'Japan · Kansai',
        matchLevel: 'possible',
        statusHint: '可能位置，需要确认'
      })
    ])

    const wrapper = mount(PointPreviewDrawer, {
      attachTo: document.body,
      global: {
        plugins: [pinia]
      }
    })

    await wrapper.get('input[placeholder="搜索城市"]').setValue('osaka')
    await wrapper.get('.point-preview-drawer__candidate').trigger('click')

    expect(store.drawerMode).toBe('detected-preview')
    expect(store.activePoint?.name).toBe('Osaka')
    expect(store.activePoint?.cityId).toBe('jp-osaka')
  })

  it('shows the fallback CTA and explanatory copy for country continuation', async () => {
    const store = useMapPointsStore()
    const mapUiStore = useMapUiStore()
    store.startPendingCitySelection(
      createDraft({
        id: 'detected-pt-1',
        name: 'Portugal',
        countryName: 'Portugal',
        countryCode: 'PT',
        cityContextLabel: 'Portugal',
        fallbackNotice: '未能可靠确认城市，已提供国家/地区继续记录'
      }),
      [createCandidate({ cityId: 'pt-lisbon', cityName: 'Lisbon', contextLabel: 'Portugal' })]
    )
    mapUiStore.setInteractionNotice({
      tone: 'info',
      message: 'temporary'
    })

    const wrapper = mount(PointPreviewDrawer, {
      attachTo: document.body,
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.text()).toContain('未能可靠确认城市，已提供国家/地区继续记录')
    expect(wrapper.text()).toContain('按国家/地区继续记录')

    await wrapper.get('.point-preview-drawer__action').trigger('click')

    expect(store.drawerMode).toBe('detected-preview')
    expect(store.activePoint?.name).toBe('Portugal')
    expect(mapUiStore.interactionNotice).toBeNull()
  })

  it('renders long text inside a dedicated scroll region while actions stay visible', async () => {
    const store = useMapPointsStore()
    store.startDraftFromDetection(
      createDraft({
        fallbackNotice: '未能可靠确认城市，已提供国家/地区继续记录',
        description: 'long text '.repeat(80)
      })
    )
    store.saveDraftAsPoint()

    const wrapper = mount(PointPreviewDrawer, {
      attachTo: document.body,
      global: {
        plugins: [pinia]
      }
    })

    await nextTick()

    expect(wrapper.get('[data-scroll-region="true"]').text()).toContain('long text')
    expect(wrapper.text()).toContain('未能可靠确认城市，已提供国家/地区继续记录')
    expect(wrapper.find('.point-preview-drawer__actions').exists()).toBe(true)
    expect(wrapper.find('.point-preview-drawer__close').exists()).toBe(true)
  })
})
