import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import type { DraftMapPoint, MapPointDisplay, SummarySurfaceState } from '../../types/map-point'
import MapContextPopup from './MapContextPopup.vue'

const LONG_TEXT = Array.from({ length: 24 }, (_, index) => `long text paragraph ${index + 1}`).join(' ')

function createDraftPoint(overrides: Partial<DraftMapPoint> = {}): DraftMapPoint {
  return {
    id: 'detected-jp-1',
    name: 'Kyoto',
    countryName: 'Japan',
    countryCode: 'JP',
    precision: 'city-high',
    cityId: 'jp-kyoto',
    cityName: 'Kyoto',
    cityContextLabel: 'Japan · Kansai',
    boundaryId: 'jp-kyoto-boundary',
    boundaryDatasetVersion: 'test-v1',
    fallbackNotice: null,
    x: 0.7,
    y: 0.45,
    lat: 35.0116,
    lng: 135.7681,
    source: 'detected',
    isFeatured: false,
    description: '识别成功，下一阶段可补充地点内容。',
    coordinatesLabel: '35.0116°N, 135.7681°E',
    ...overrides
  }
}

function createViewPoint(overrides: Partial<MapPointDisplay> = {}): MapPointDisplay {
  return {
    ...createDraftPoint({
      id: 'saved-jp-kyoto',
      source: 'detected'
    }),
    source: 'saved',
    ...overrides
  }
}

describe('MapContextPopup', () => {
  it('renders desktop popup shell with dialog semantics and arrow affordance', () => {
    const wrapper = mount(MapContextPopup, {
      attachTo: document.body,
      props: {
        surface: {
          mode: 'detected-preview',
          point: createDraftPoint(),
          boundarySupportState: 'supported'
        } satisfies SummarySurfaceState,
        anchorSource: 'marker'
      }
    })

    const popup = wrapper.get('.map-context-popup')

    expect(popup.attributes('role')).toBe('dialog')
    expect(popup.attributes('aria-modal')).toBe('false')
    expect(popup.attributes('data-popup-anchor-source')).toBe('marker')
    expect(wrapper.find('.map-context-popup__arrow').exists()).toBe(true)
    expect(popup.attributes('style')).toContain('--map-context-popup-min-width: 280px')
    expect(popup.attributes('style')).toContain('--map-context-popup-max-width: 360px')
  })

  it('keeps the stable footer outside the middle scroll region inside the popup body', () => {
    const wrapper = mount(MapContextPopup, {
      attachTo: document.body,
      props: {
        surface: {
          mode: 'view',
          point: createViewPoint({
            description: LONG_TEXT
          }),
          boundarySupportState: 'supported'
        } satisfies SummarySurfaceState,
        anchorSource: 'marker'
      }
    })

    const body = wrapper.get('.map-context-popup__body')
    const header = wrapper.get('[data-popup-section="header"]')
    const content = wrapper.get('[data-popup-section="content"]')
    const scrollRegion = wrapper.get('.point-summary-card__scroll-region')
    const footer = wrapper.get('.point-summary-card__footer')

    expect(body.find('.point-summary-card').exists()).toBe(true)
    expect(header.text()).toContain('Kyoto')
    expect(content.find('.point-summary-card__scroll-region').exists()).toBe(true)
    expect(scrollRegion.text()).toContain('long text paragraph 1')
    expect(scrollRegion.text()).not.toContain('查看详情')
    expect(footer.text()).toContain('查看详情')
    expect(wrapper.find('.map-context-popup__arrow').exists()).toBe(true)
  })

  it('moves focus to the title when opened', async () => {
    const wrapper = mount(MapContextPopup, {
      attachTo: document.body,
      props: {
        surface: {
          mode: 'view',
          point: createViewPoint(),
          boundarySupportState: 'supported'
        } satisfies SummarySurfaceState,
        anchorSource: 'boundary'
      }
    })

    await nextTick()

    expect(document.activeElement).toBe(wrapper.get('.map-context-popup__title').element)
  })
})
