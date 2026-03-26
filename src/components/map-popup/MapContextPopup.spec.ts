import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import type { DraftMapPoint, SummarySurfaceState } from '../../types/map-point'
import MapContextPopup from './MapContextPopup.vue'

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

  it('moves focus to the title when opened', async () => {
    const wrapper = mount(MapContextPopup, {
      attachTo: document.body,
      props: {
        surface: {
          mode: 'view',
          point: createDraftPoint({
            id: 'saved-jp-kyoto',
            source: 'saved'
          }),
          boundarySupportState: 'supported'
        } satisfies SummarySurfaceState,
        anchorSource: 'boundary'
      }
    })

    await nextTick()

    expect(document.activeElement).toBe(wrapper.get('.map-context-popup__title').element)
  })
})
