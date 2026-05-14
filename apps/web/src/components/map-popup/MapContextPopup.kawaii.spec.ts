import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { vi } from 'vitest'

import type { DraftMapPoint, MapPointDisplay, SummarySurfaceState } from '../../types/map-point'
import MapContextPopup from './MapContextPopup.vue'
import PointSummaryCard from './PointSummaryCard.vue'

vi.mock('../../stores/map-points', () => ({
  useMapPointsStore: () => ({
    tripsByPlaceId: new Map(),
    updateRecord: vi.fn(),
    deleteSingleRecord: vi.fn(),
  }),
}))

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
  it('renders a transparent outer shell so the high-fidelity result card owns the chrome', () => {
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
    const shellStyle = shell.attributes('style')

    expect(shellClassName).toContain('rounded-[32px]')
    expect(shellClassName).toContain('bg-transparent')
    expect(shellClassName).toContain('p-0')
    expect(shellClassName).toContain('shadow-none')
    expect(shellStyle).toContain('--map-context-popup-min-width: 420px')
    expect(shellStyle).toContain('--map-context-popup-max-width: 420px')
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

    expect(body.attributes('class')).toContain('rounded-[32px]')
    expect(body.attributes('class')).toContain('overflow-visible')
    expect(wrapper.findComponent(PointSummaryCard).exists()).toBe(true)
  })

  it('locks the high-fidelity result card to 420 by 260 with a card-level close affordance', () => {
    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: {
          mode: 'detected-preview',
          point: createDraftPoint(),
          boundarySupportState: 'supported',
        } satisfies SummarySurfaceState,
      },
    })
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/map-popup/PointSummaryCard.vue'),
      'utf8',
    )

    expect(wrapper.get('[data-region="point-summary-card"]').attributes('class')).toContain(
      'point-summary-card',
    )
    expect(wrapper.find('button[aria-label="关闭识别结果"]').exists()).toBe(true)
    expect(wrapper.get('[data-footprint-cta="true"]').text()).toContain('留下足迹')
    expect(source).toContain('width: 420px;')
    expect(source).toContain('height: 260px;')
    expect(source).toContain('position: absolute;')
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
