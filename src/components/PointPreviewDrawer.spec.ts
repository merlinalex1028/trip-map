import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

import { getBoundaryByCityId } from '../services/city-boundaries'
import { useMapPointsStore } from '../stores/map-points'
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
    boundaryId: null,
    boundaryDatasetVersion: null,
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

function createCityDraft(cityId: string, overrides: Record<string, unknown> = {}) {
  const boundary = getBoundaryByCityId(cityId)

  if (!boundary) {
    throw new Error(`Missing boundary fixture for ${cityId}`)
  }

  const isPortugal = cityId.startsWith('pt-')

  return createDraft({
    id: `detected-${cityId}`,
    name: boundary.cityName,
    countryName: isPortugal ? 'Portugal' : 'Japan',
    countryCode: isPortugal ? 'PT' : 'JP',
    precision: 'city-high',
    cityId,
    cityName: boundary.cityName,
    cityContextLabel: isPortugal ? 'Portugal' : 'Japan · Kansai',
    boundaryId: boundary.boundaryId,
    boundaryDatasetVersion: boundary.datasetVersion,
    fallbackNotice: null,
    ...overrides
  })
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

  it('stays hidden for summary-only states and only renders deep view content after drawer handoff', async () => {
    const store = useMapPointsStore()
    store.startDraftFromDetection(createCityDraft('jp-kyoto'))
    const savedPoint = store.saveDraftAsPoint()

    const wrapper = mount(PointPreviewDrawer, {
      attachTo: document.body,
      global: {
        plugins: [pinia]
      }
    })

    await nextTick()

    expect(savedPoint?.id).toBeTruthy()
    expect(store.summaryMode).toBe('view')
    expect(store.drawerMode).toBeNull()
    expect(wrapper.find('.point-preview-drawer').exists()).toBe(false)

    store.openDrawerView()
    await nextTick()

    expect(wrapper.find('.point-preview-drawer').exists()).toBe(true)
    expect(wrapper.text()).toContain('Kyoto')
    expect(wrapper.text()).toContain('编辑地点')
    expect(wrapper.text()).not.toContain('查看详情')
    expect(wrapper.find('input[placeholder="搜索城市"]').exists()).toBe(false)
  })

  it('keeps Tab focus trapped inside the deep drawer', async () => {
    const store = useMapPointsStore()
    store.startDraftFromDetection(createCityDraft('pt-lisbon'))
    store.saveDraftAsPoint()
    store.openDrawerView()

    const wrapper = mount(PointPreviewDrawer, {
      attachTo: document.body,
      global: {
        plugins: [pinia]
      }
    })

    await nextTick()

    const closeButton = wrapper.get('.point-preview-drawer__close')
    const actions = wrapper.findAll('.point-preview-drawer__action')
    const lastAction = actions[actions.length - 1]

    expect(lastAction).toBeTruthy()

    ;(lastAction!.element as HTMLButtonElement).focus()
    await lastAction!.trigger('keydown', { key: 'Tab' })

    expect(document.activeElement).toBe(closeButton.element)

    ;(closeButton.element as HTMLButtonElement).focus()
    await closeButton.trigger('keydown', { key: 'Tab', shiftKey: true })

    expect(document.activeElement).toBe(lastAction!.element)
  })

  it('closes the deep drawer on Escape when there are no unsaved edits', async () => {
    const store = useMapPointsStore()
    store.startDraftFromDetection(createCityDraft('jp-kyoto'))
    store.saveDraftAsPoint()
    store.openDrawerView()

    const wrapper = mount(PointPreviewDrawer, {
      attachTo: document.body,
      global: {
        plugins: [pinia]
      }
    })

    await wrapper.get('.point-preview-drawer').trigger('keydown', { key: 'Escape' })

    expect(store.drawerMode).toBeNull()
    expect(store.summaryMode).toBe('view')
    expect(store.activePoint?.cityId).toBe('jp-kyoto')
  })

  it('shows 放弃编辑 and keeps the unsaved-change guard before leaving edit mode', async () => {
    const store = useMapPointsStore()
    store.startDraftFromDetection(createCityDraft('jp-kyoto'))
    store.saveDraftAsPoint()
    store.openDrawerView()

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

    expect(store.drawerMode).toBe('edit')
    expect(wrapper.text()).toContain('放弃编辑')

    await wrapper.get('.point-preview-drawer__input').setValue('Kyoto updated')
    await wrapper.get('.point-preview-drawer__action').trigger('click')

    expect(confirmSpy).toHaveBeenCalledWith('你有未保存的更改，确定关闭吗？')
    expect(store.drawerMode).toBe('edit')

    confirmSpy.mockReturnValue(true)

    await wrapper.get('.point-preview-drawer__action').trigger('click')

    expect(store.drawerMode).toBe('view')
    expect(wrapper.text()).not.toContain('放弃编辑')
  })
})
