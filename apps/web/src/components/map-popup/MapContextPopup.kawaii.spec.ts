import { mount } from '@vue/test-utils'

import type { DraftMapPoint, MapPointDisplay, SummarySurfaceState } from '../../types/map-point'
import MapContextPopup from './MapContextPopup.vue'
import PointSummaryCard from './PointSummaryCard.vue'

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
    ...overrides,
  }
}

function createViewPoint(overrides: Partial<MapPointDisplay> = {}): MapPointDisplay {
  return {
    ...createDraftPoint({
      id: 'saved-jp-kyoto',
      source: 'detected',
    }),
    source: 'saved',
    ...overrides,
  }
}

describe('MapContextPopup kawaii shell contracts', () => {
  it('renders a light outer shell with the required kawaii contract classes', () => {
    const wrapper = mount(MapContextPopup, {
      props: {
        surface: {
          mode: 'detected-preview',
          point: createDraftPoint(),
          boundarySupportState: 'supported',
        } satisfies SummarySurfaceState,
        anchorSource: 'marker',
      },
    })

    const shell = wrapper.get('[data-kawaii-shell="light"]')
    const shellClassName = shell.attributes('class')

    expect(shellClassName).toContain('rounded-[32px]')
    expect(shellClassName).toContain('border')
    expect(shellClassName).toContain('border-white/70')
    expect(shellClassName).toContain('bg-white/75')
    expect(shellClassName).toContain('p-1')
    expect(shellClassName).toContain('shadow-[0_16px_34px_rgba(155,116,160,0.12)]')
    expect(shellClassName).toContain('backdrop-blur-xl')
  })

  it('keeps the arrow pointer-safe and the anchored shell free from heavy chrome transforms', () => {
    const wrapper = mount(MapContextPopup, {
      props: {
        surface: {
          mode: 'view',
          point: createViewPoint(),
          boundarySupportState: 'supported',
        } satisfies SummarySurfaceState,
        anchorSource: 'boundary',
      },
    })

    const shellClassName = wrapper.get('[data-kawaii-shell="light"]').attributes('class')
    const arrow = wrapper.get('[data-kawaii-arrow="light"]')
    const arrowClassName = arrow.attributes('class')

    expect(arrowClassName).toContain('pointer-events-none')
    expect(shellClassName).not.toContain('border-4')
    expect(shellClassName).not.toContain('hover:scale')
    expect(shellClassName).not.toContain('active:scale')
  })

  it('preserves the inner card slot and renders PointSummaryCard directly', () => {
    const wrapper = mount(MapContextPopup, {
      props: {
        surface: {
          mode: 'candidate-select',
          fallbackPoint: createDraftPoint(),
          cityCandidates: [],
          canonicalCandidates: [],
          recommendedPlaceId: null,
        } satisfies SummarySurfaceState,
        anchorSource: 'pending',
      },
    })

    const body = wrapper.get('[data-kawaii-body="card-slot"]')

    expect(body.attributes('class')).toContain('rounded-[28px]')
    expect(body.attributes('class')).toContain('overflow-hidden')
    expect(wrapper.findComponent(PointSummaryCard).exists()).toBe(true)
  })

  it('keeps aria-labelledby wired to escaped title text interpolation', () => {
    const wrapper = mount(MapContextPopup, {
      props: {
        surface: {
          mode: 'view',
          point: createViewPoint({
            name: '<strong>Kyoto</strong>',
          }),
          boundarySupportState: 'supported',
        } satisfies SummarySurfaceState,
        anchorSource: 'marker',
      },
    })

    const shell = wrapper.get('[data-kawaii-shell="light"]')
    const title = wrapper.get('.map-context-popup__title')

    expect(shell.attributes('aria-labelledby')).toBe(title.attributes('id'))
    expect(title.text()).toBe('<strong>Kyoto</strong>')
    expect(title.element.innerHTML).not.toContain('<strong>')
  })
})
