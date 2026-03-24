import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

import { useMapPointsStore } from '../stores/map-points'
import PointPreviewDrawer from './PointPreviewDrawer.vue'

function createDraft(overrides: Record<string, unknown> = {}) {
  return {
    id: 'detected-jp-1',
    name: 'Japan',
    countryName: 'Japan',
    countryCode: 'JP',
    precision: 'country' as const,
    cityName: null,
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

  it('renders detected-preview mode as an accessible dialog', async () => {
    const store = useMapPointsStore()
    store.startDraftFromDetection(createDraft())

    const wrapper = mount(PointPreviewDrawer, {
      attachTo: document.body,
      global: {
        plugins: [pinia]
      }
    })

    await nextTick()

    expect(wrapper.attributes('role')).toBe('dialog')
    expect(wrapper.text()).toContain('识别结果')
    expect(wrapper.text()).toContain('保存为地点')
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
    store.startDraftFromDetection(createDraft())

    const wrapper = mount(PointPreviewDrawer, {
      attachTo: document.body,
      global: {
        plugins: [pinia]
      }
    })

    await wrapper.get('.point-preview-drawer').trigger('keydown', { key: 'Escape' })

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(store.activePoint).toBeNull()
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

  it('renders long text inside a dedicated scroll region while actions stay visible', async () => {
    const store = useMapPointsStore()
    store.startDraftFromDetection(
      createDraft({
        fallbackNotice: '未识别到更精确城市，已回退到国家/地区',
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
    expect(wrapper.text()).toContain('未识别到更精确城市，已回退到国家/地区')
    expect(wrapper.find('.point-preview-drawer__actions').exists()).toBe(true)
    expect(wrapper.find('.point-preview-drawer__close').exists()).toBe(true)
  })
})
