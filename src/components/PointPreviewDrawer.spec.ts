import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import { useMapPointsStore } from '../stores/map-points'
import PointPreviewDrawer from './PointPreviewDrawer.vue'

function createDraft(id = 'detected-jp-1', name = 'Japan') {
  return {
    id,
    name,
    countryName: name,
    countryCode: 'JP',
    lat: 35,
    lng: 135,
    x: 0.7,
    y: 0.45,
    source: 'detected' as const,
    isFeatured: false,
    description: '识别成功，下一阶段可补充地点内容。',
    coordinatesLabel: '35.0000°N, 135.0000°E'
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
    vi.unstubAllGlobals()
  })

  it('renders detected-preview mode with the save action', () => {
    const store = useMapPointsStore()

    store.startDraftFromDetection(createDraft())

    const wrapper = mount(PointPreviewDrawer, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.text()).toContain('识别结果')
    expect(wrapper.text()).toContain('保存为地点')
    expect(wrapper.text()).toContain('关闭')
  })

  it('shows saved points in view mode first and exposes the exact edit fields', async () => {
    const store = useMapPointsStore()

    store.startDraftFromDetection(createDraft())
    store.saveDraftAsPoint()

    const wrapper = mount(PointPreviewDrawer, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.text()).toContain('查看地点')
    expect(wrapper.text()).toContain('编辑')
    expect(wrapper.text()).toContain('删除')

    await wrapper.get('.point-preview-drawer__action--primary').trigger('click')

    expect(wrapper.text()).toContain('名称')
    expect(wrapper.text()).toContain('简介')
    expect(wrapper.text()).toContain('点亮状态')
  })

  it('shows the hide action for seed points instead of delete', () => {
    const store = useMapPointsStore()

    store.bootstrapPoints()
    store.selectPointById('seed-kyoto')

    const wrapper = mount(PointPreviewDrawer, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.text()).toContain('隐藏')
    expect(wrapper.text()).not.toContain('删除')
  })

  it('confirms before closing with unsaved edits and keeps the drawer open when rejected', async () => {
    const store = useMapPointsStore()

    store.startDraftFromDetection(createDraft())
    store.saveDraftAsPoint()

    const confirmSpy = vi.fn(() => false)
    vi.stubGlobal('confirm', confirmSpy)
    window.confirm = confirmSpy as typeof window.confirm
    Object.defineProperty(window, 'confirm', {
      configurable: true,
      value: confirmSpy
    })

    const wrapper = mount(PointPreviewDrawer, {
      global: {
        plugins: [pinia]
      }
    })

    await wrapper.get('.point-preview-drawer__action--primary').trigger('click')
    await wrapper.get('.point-preview-drawer__input').setValue('Kyoto')
    await wrapper.get('.point-preview-drawer__close').trigger('click')

    expect(confirmSpy).toHaveBeenCalledWith('你有未保存的更改，确定关闭吗？')
    expect(store.activePoint).not.toBeNull()
  })

  it('cancels edit mode back to the last saved content', async () => {
    const store = useMapPointsStore()

    store.startDraftFromDetection(createDraft())
    store.saveDraftAsPoint()

    const wrapper = mount(PointPreviewDrawer, {
      global: {
        plugins: [pinia]
      }
    })

    await wrapper.get('.point-preview-drawer__action--primary').trigger('click')
    await wrapper.get('.point-preview-drawer__input').setValue('Kyoto')
    await wrapper.findAll('.point-preview-drawer__action')[1].trigger('click')

    expect(store.drawerMode).toBe('view')
    expect(wrapper.text()).toContain('Japan')
    expect(wrapper.find('.point-preview-drawer__input').exists()).toBe(false)
  })

  it('confirms deletion and hiding actions before applying them', async () => {
    const confirmSpy = vi.fn(() => true)
    vi.stubGlobal('confirm', confirmSpy)
    window.confirm = confirmSpy as typeof window.confirm
    Object.defineProperty(window, 'confirm', {
      configurable: true,
      value: confirmSpy
    })

    const savedStore = useMapPointsStore()
    savedStore.startDraftFromDetection(createDraft())
    savedStore.saveDraftAsPoint()

    const savedWrapper = mount(PointPreviewDrawer, {
      global: {
        plugins: [pinia]
      }
    })

    await savedWrapper.findAll('.point-preview-drawer__action')[1].trigger('click')

    expect(confirmSpy).toHaveBeenCalledWith('确定删除这个地点吗？')
    expect(savedStore.userPoints).toHaveLength(0)

    pinia = createPinia()
    setActivePinia(pinia)
    installStorageMock()

    const seedStore = useMapPointsStore()
    seedStore.bootstrapPoints()
    seedStore.selectPointById('seed-kyoto')

    const seedWrapper = mount(PointPreviewDrawer, {
      global: {
        plugins: [pinia]
      }
    })

    await seedWrapper.findAll('.point-preview-drawer__action')[1].trigger('click')

    expect(confirmSpy).toHaveBeenCalledWith('确定隐藏这个预置地点吗？')
    expect(seedStore.deletedSeedIds).toContain('seed-kyoto')
  })
})
