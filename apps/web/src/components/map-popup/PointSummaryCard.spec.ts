import {
  PHASE12_AMBIGUOUS_RESOLVE,
  PHASE12_RESOLVED_BEIJING,
} from '@trip-map/contracts'
import { mount } from '@vue/test-utils'

import PointSummaryCard from './PointSummaryCard.vue'
import type { DraftMapPoint, MapPointDisplay, SummarySurfaceState } from '../../types/map-point'

const ambiguousResolve = (() => {
  if (PHASE12_AMBIGUOUS_RESOLVE.status !== 'ambiguous') {
    throw new Error('Expected ambiguous canonical resolve fixture')
  }

  return PHASE12_AMBIGUOUS_RESOLVE
})()

function createDraftPoint(overrides: Partial<DraftMapPoint> = {}): DraftMapPoint {
  return {
    id: 'detected-jp-1',
    name: 'Japan',
    countryName: 'Japan',
    countryCode: 'JP',
    precision: 'country',
    cityId: null,
    cityName: null,
    cityContextLabel: 'Japan',
    boundaryId: null,
    boundaryDatasetVersion: null,
    fallbackNotice: '未能可靠确认城市，已提供国家/地区继续记录',
    x: 0.7,
    y: 0.45,
    lat: 35,
    lng: 135,
    source: 'detected',
    isFeatured: false,
    description: '识别成功，下一阶段可补充地点内容。',
    coordinatesLabel: '35.0000°N, 135.0000°E',
    ...overrides
  }
}

function createViewPoint(overrides: Partial<MapPointDisplay> = {}): MapPointDisplay {
  return {
    ...createDraftPoint({
      id: 'saved-jp-kyoto',
      name: 'Kyoto',
      precision: 'city-high',
      cityId: 'jp-kyoto',
      cityName: 'Kyoto',
      cityContextLabel: 'Japan · Kansai',
      boundaryId: 'jp-kyoto-boundary',
      boundaryDatasetVersion: 'test-v1',
      fallbackNotice: null
    }),
    source: 'saved',
    ...overrides
  }
}

function createCanonicalDraftPoint(overrides: Partial<DraftMapPoint> = {}): DraftMapPoint {
  return createDraftPoint({
    id: 'pending-beijing',
    name: '待确认地点',
    countryName: '待确认',
    countryCode: '__canonical__',
    cityId: null,
    cityName: null,
    cityContextLabel: ambiguousResolve.prompt,
    placeId: null,
    placeKind: null,
    datasetVersion: null,
    typeLabel: null,
    parentLabel: null,
    subtitle: null,
    boundaryId: null,
    boundaryDatasetVersion: null,
    fallbackNotice: ambiguousResolve.prompt,
    lat: ambiguousResolve.click.lat,
    lng: ambiguousResolve.click.lng,
    clickLat: ambiguousResolve.click.lat,
    clickLng: ambiguousResolve.click.lng,
    ...overrides
  })
}

describe('PointSummaryCard', () => {
  it('renders canonical candidate labels and recommended marker without fallback CTA', async () => {
    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: {
          mode: 'candidate-select',
          fallbackPoint: createCanonicalDraftPoint(),
          cityCandidates: ambiguousResolve.candidates.map((candidate) => ({
            cityId: candidate.placeId,
            cityName: candidate.displayName,
            contextLabel: candidate.subtitle,
            matchLevel: 'high' as const,
            distanceKm: 0,
            statusHint: candidate.candidateHint
          })),
          canonicalCandidates: ambiguousResolve.candidates,
          recommendedPlaceId: ambiguousResolve.recommendedPlaceId
        } as SummarySurfaceState,
        findSavedPointByCityId: (cityId: string) =>
          cityId === ambiguousResolve.candidates[0]?.placeId
            ? createViewPoint({
                id: 'saved-beijing',
                name: PHASE12_RESOLVED_BEIJING.displayName,
                countryName: PHASE12_RESOLVED_BEIJING.parentLabel,
                placeId: PHASE12_RESOLVED_BEIJING.placeId,
                typeLabel: PHASE12_RESOLVED_BEIJING.typeLabel,
                subtitle: PHASE12_RESOLVED_BEIJING.subtitle
              })
            : null
      }
    })

    expect(wrapper.get('[data-region="point-summary-card"]').attributes('data-summary-mode')).toBe('candidate-select')
    expect(wrapper.text()).toContain('北京')
    expect(wrapper.text()).toContain('直辖市')
    expect(wrapper.text()).toContain('中国 · 直辖市')
    expect(wrapper.find('[data-candidate-recommended="true"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('按国家/地区继续记录')
    expect(wrapper.text()).toContain('已存在记录')

    await wrapper.findAll('.point-summary-card__candidate-action')[0]?.trigger('click')

    expect(wrapper.emitted('confirmCandidate')?.[0]?.[0]).toMatchObject({
      cityId: ambiguousResolve.candidates[0]?.placeId
    })
  })

  it('renders detected preview actions and emits the summary CTA events', async () => {
    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: {
          mode: 'detected-preview',
          point: createDraftPoint({
            id: 'detected-jp-kyoto',
            name: 'Kyoto',
            precision: 'city-high',
            cityId: 'jp-kyoto',
            cityName: 'Kyoto',
            cityContextLabel: 'Japan · Kansai',
            boundaryId: 'jp-kyoto-boundary',
            boundaryDatasetVersion: 'test-v1',
            fallbackNotice: null
          }),
          boundarySupportState: 'supported'
        } satisfies SummarySurfaceState
      }
    })

    expect(wrapper.text()).toContain('保存为地点')
    expect(wrapper.text()).toContain('查看详情')
    expect(wrapper.text()).toContain('点亮状态')

    const actions = wrapper.findAll('.point-summary-card__action')
    await actions[0]?.trigger('click')
    await actions[1]?.trigger('click')
    await actions[2]?.trigger('click')

    expect(wrapper.emitted('saveDraft')).toHaveLength(1)
    expect(wrapper.emitted('openDrawer')).toHaveLength(1)
    expect(wrapper.emitted('toggleFeatured')).toHaveLength(1)
  })

  it('uses inline delete confirmation for saved view state', async () => {
    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: {
          mode: 'view',
          point: createViewPoint(),
          boundarySupportState: 'supported'
        } satisfies SummarySurfaceState
      }
    })

    const actions = wrapper.findAll('.point-summary-card__action')
    await actions[actions.length - 1]?.trigger('click')

    expect(wrapper.text()).toContain('删除地点：确认删除这个地点？')
    expect(actions[actions.length - 1]?.attributes('data-cta-tone')).toBe('destructive')

    await wrapper.get('.point-summary-card__confirm-action').trigger('click')

    expect(wrapper.emitted('deletePoint')).toHaveLength(1)
  })

  it('marks fallback and unsupported-boundary notices with fallback tone', () => {
    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: {
          mode: 'view',
          point: createViewPoint({
            fallbackNotice: '当前仅能按国家/地区保留这个点位。'
          }),
          boundarySupportState: 'missing'
        } satisfies SummarySurfaceState
      }
    })

    const notices = wrapper.findAll('[data-notice-tone="fallback"]')

    expect(notices).toHaveLength(2)
    expect(notices[0]?.text()).toContain('当前仅能按国家/地区保留这个点位。')
    expect(notices[1]?.text()).toContain('当前地点暂不支持边界高亮')
  })
})
