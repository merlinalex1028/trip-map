import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import type { DraftMapPoint, MapPointDisplay, SummarySurfaceState } from '../../types/map-point'
import MobilePeekSheet from './MobilePeekSheet.vue'

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

describe('MobilePeekSheet', () => {
  it('renders the mobile peek shell with a visible close action and safe-area sizing contract', () => {
    const wrapper = mount(MobilePeekSheet, {
      props: {
        surface: {
          mode: 'candidate-select',
          fallbackPoint: createDraftPoint({
            id: 'detected-jp-fallback',
            name: 'Japan',
            cityId: null,
            cityName: null,
            cityContextLabel: 'Japan'
          }),
          cityCandidates: [
            {
              cityId: 'jp-kyoto',
              cityName: 'Kyoto',
              contextLabel: 'Japan · Kansai',
              matchLevel: 'high',
              distanceKm: 1.2,
              statusHint: '更接近点击位置'
            }
          ]
        } satisfies SummarySurfaceState
      }
    })

    const sheet = wrapper.get('.mobile-peek-sheet')

    expect(sheet.attributes('role')).toBe('dialog')
    expect(sheet.attributes('style')).toContain('env(safe-area-inset-bottom)')
    expect(sheet.attributes('style')).toContain('min(32rem, calc(100vh - 8.5rem))')
    expect(wrapper.text()).toContain('关闭')
    expect(wrapper.text()).toContain('确认城市')
  })

  it('emits close when the close affordance is pressed', async () => {
    const wrapper = mount(MobilePeekSheet, {
      props: {
        surface: {
          mode: 'view',
          point: createViewPoint(),
          boundarySupportState: 'supported'
        } satisfies SummarySurfaceState
      }
    })

    await wrapper.get('.mobile-peek-sheet__close').trigger('click')
    await nextTick()

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('keeps the stable footer outside the middle scroll region inside the peek body', () => {
    const wrapper = mount(MobilePeekSheet, {
      props: {
        surface: {
          mode: 'view',
          point: createViewPoint({
            description: LONG_TEXT
          }),
          boundarySupportState: 'supported'
        } satisfies SummarySurfaceState
      }
    })

    const body = wrapper.get('.mobile-peek-sheet__body')
    const scrollRegion = wrapper.get('.point-summary-card__scroll-region')
    const footer = wrapper.get('.point-summary-card__footer')

    expect(body.find('.point-summary-card').exists()).toBe(true)
    expect(scrollRegion.text()).toContain('long text paragraph 1')
    expect(scrollRegion.text()).not.toContain('查看详情')
    expect(footer.text()).toContain('查看详情')
    expect(wrapper.get('.mobile-peek-sheet__close').text()).toBe('关闭')
  })
})
