import {
  PHASE12_RESOLVED_BEIJING,
  PHASE12_RESOLVED_CALIFORNIA,
  PHASE12_RESOLVED_HONG_KONG,
} from '@trip-map/contracts'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

import PointPreviewDrawer from './PointPreviewDrawer.vue'
import PointSummaryCard from './map-popup/PointSummaryCard.vue'
import { useMapPointsStore } from '../stores/map-points'
import type { DraftMapPoint, MapPointDisplay, SummarySurfaceState } from '../types/map-point'

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

function createCanonicalDraft(
  place:
    | typeof PHASE12_RESOLVED_BEIJING
    | typeof PHASE12_RESOLVED_HONG_KONG
    | typeof PHASE12_RESOLVED_CALIFORNIA = PHASE12_RESOLVED_BEIJING,
  overrides: Partial<DraftMapPoint> = {}
): DraftMapPoint {
  const isCalifornia = place.placeId === PHASE12_RESOLVED_CALIFORNIA.placeId

  return {
    id: `detected-${place.placeId}`,
    name: place.displayName,
    countryName: place.parentLabel,
    countryCode: place.regionSystem === 'CN' ? 'CN' : '__canonical__',
    precision: 'city-high' as const,
    cityId: null,
    cityName: place.displayName,
    cityContextLabel: place.subtitle,
    placeId: place.placeId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
    boundaryId: place.boundaryId,
    boundaryDatasetVersion: place.datasetVersion,
    fallbackNotice: null,
    lat: isCalifornia ? 36.7783 : 39.9042,
    lng: isCalifornia ? -119.4179 : 116.4074,
    x: isCalifornia ? 0.15 : 0.74,
    y: isCalifornia ? 0.44 : 0.31,
    source: 'detected' as const,
    isFeatured: false,
    description: '识别成功，下一阶段可补充地点内容。',
    coordinatesLabel: isCalifornia ? '36.7783°N, 119.4179°W' : '39.9042°N, 116.4074°E',
    ...overrides
  }
}

function mountDrawerForCanonicalPlace(
  place:
    | typeof PHASE12_RESOLVED_BEIJING
    | typeof PHASE12_RESOLVED_HONG_KONG
    | typeof PHASE12_RESOLVED_CALIFORNIA
) {
  const localPinia = createPinia()
  setActivePinia(localPinia)
  const store = useMapPointsStore()

  store.startDraftFromDetection(createCanonicalDraft(place))
  store.saveDraftAsPoint()
  store.openDrawerView()

  return mount(PointPreviewDrawer, {
    attachTo: document.body,
    global: {
      plugins: [localPinia]
    }
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

  it('stays hidden for summary-only state and renders canonical type label plus subtitle after the drawer handoff', async () => {
    const store = useMapPointsStore()
    store.startDraftFromDetection(createCanonicalDraft())
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
    expect(wrapper.text()).toContain('北京')
    expect(wrapper.text()).toContain('直辖市')
    expect(wrapper.text()).toContain('中国 · 直辖市')
    expect(wrapper.text()).toContain('编辑地点')
    expect(wrapper.get('.point-preview-drawer').attributes('data-drawer-mode')).toBe('view')
  })

  it('accepts anchored popup styles when rendered as a map popup shell', async () => {
    const store = useMapPointsStore()
    store.startDraftFromDetection(createCanonicalDraft(PHASE12_RESOLVED_HONG_KONG))
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
    store.startDraftFromDetection(createCanonicalDraft(PHASE12_RESOLVED_HONG_KONG))
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
    expect(store.activePoint?.placeId).toBe(PHASE12_RESOLVED_HONG_KONG.placeId)
  })

  it('renders real admin labels and subtitles for Beijing, Hong Kong, and California in the drawer', async () => {
    const beijingWrapper = mountDrawerForCanonicalPlace(PHASE12_RESOLVED_BEIJING)
    const hongKongWrapper = mountDrawerForCanonicalPlace(PHASE12_RESOLVED_HONG_KONG)
    const californiaWrapper = mountDrawerForCanonicalPlace(PHASE12_RESOLVED_CALIFORNIA)

    await nextTick()

    expect(beijingWrapper.text()).toContain('北京')
    expect(beijingWrapper.text()).toContain('直辖市')
    expect(beijingWrapper.text()).toContain('中国 · 直辖市')
    expect(hongKongWrapper.text()).toContain('香港')
    expect(hongKongWrapper.text()).toContain('特别行政区')
    expect(hongKongWrapper.text()).toContain('中国 · 特别行政区')
    expect(californiaWrapper.text()).toContain('California')
    expect(californiaWrapper.text()).toContain('一级行政区')
    expect(californiaWrapper.text()).toContain('United States · 一级行政区')
  })

  it('renders the same canonical title, type label, and subtitle in popup and drawer for one point', async () => {
    const store = useMapPointsStore()

    store.startDraftFromDetection(createCanonicalDraft(PHASE12_RESOLVED_BEIJING))
    store.saveDraftAsPoint()
    store.openDrawerView()

    const drawerWrapper = mount(PointPreviewDrawer, {
      attachTo: document.body,
      global: {
        plugins: [pinia]
      }
    })
    const popupWrapper = mount(PointSummaryCard, {
      props: {
        surface: {
          mode: 'view',
          point: store.activePoint as MapPointDisplay,
          boundarySupportState: 'supported'
        } satisfies SummarySurfaceState
      }
    })

    await nextTick()

    expect(popupWrapper.get('.point-summary-card__title').text()).toBe(
      drawerWrapper.get('.point-preview-drawer__name').text()
    )
    expect(popupWrapper.get('[data-place-type-label="true"]').text()).toBe(
      drawerWrapper.get('[data-place-type-label="true"]').text()
    )
    expect(popupWrapper.get('[data-place-subtitle="true"]').text()).toBe(
      drawerWrapper.get('[data-place-subtitle="true"]').text()
    )
    expect(drawerWrapper.get('[data-place-subtitle="true"]').text()).toBe('中国 · 直辖市')
  })
})
