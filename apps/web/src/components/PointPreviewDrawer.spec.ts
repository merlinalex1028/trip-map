import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

import PointPreviewDrawer from './PointPreviewDrawer.vue'
import { getBoundaryByCityId } from '../services/city-boundaries'
import { useMapPointsStore } from '../stores/map-points'

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

function createCityDraft(cityId: string, overrides: Record<string, unknown> = {}) {
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
    description: '识别成功，下一阶段可补充地点内容。',
    coordinatesLabel: isPortugal ? '38.7223°N, 9.1393°W' : '35.0116°N, 135.7681°E',
    ...overrides
  }
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

  it('stays hidden for summary-only state and renders only after the drawer handoff', async () => {
    const store = useMapPointsStore()
    store.startDraftFromDetection(createCityDraft('jp-kyoto'))
    store.saveDraftAsPoint()

    const wrapper = mount(PointPreviewDrawer, {
      attachTo: document.body,
      global: {
        plugins: [pinia]
      }
    })

    await nextTick()
    expect(wrapper.find('.point-preview-drawer').exists()).toBe(false)

    store.openDrawerView()
    await nextTick()

    expect(wrapper.find('.point-preview-drawer').exists()).toBe(true)
    expect(wrapper.text()).toContain('Kyoto')
    expect(wrapper.text()).toContain('编辑地点')
    expect(wrapper.get('.point-preview-drawer').attributes('data-drawer-mode')).toBe('view')
  })

  it('accepts anchored popup styles when rendered as a map popup shell', async () => {
    const store = useMapPointsStore()
    store.startDraftFromDetection(createCityDraft('jp-kyoto'))
    store.saveDraftAsPoint()
    store.openDrawerView()

    const wrapper = mount(PointPreviewDrawer, {
      attachTo: document.body,
      props: {
        anchorSource: 'boundary',
        floatingStyles: {
          left: '24px',
          top: '32px'
        }
      },
      global: {
        plugins: [pinia]
      }
    })

    await nextTick()

    expect(wrapper.get('.point-preview-drawer').attributes('data-popup-anchor-source')).toBe('boundary')
    expect(wrapper.get('.point-preview-drawer').attributes('style')).toContain('left: 24px')
    expect(wrapper.get('.point-preview-drawer').attributes('style')).toContain('top: 32px')
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
})
