import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import MapContextPopup from './MapContextPopup.vue'
import type { DraftMapPoint, MapPointDisplay, SummarySurfaceState } from '../../types/map-point'

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

    expect(wrapper.get('.map-context-popup').attributes('role')).toBe('dialog')
    expect(wrapper.get('.map-context-popup').attributes('aria-modal')).toBe('false')
    expect(wrapper.get('.map-context-popup').attributes('data-popup-anchor-source')).toBe('marker')
    expect(wrapper.find('.map-context-popup__arrow').exists()).toBe(true)
  })

  it('moves focus to the popup title when opened', async () => {
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
