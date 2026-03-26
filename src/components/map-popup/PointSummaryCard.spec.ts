import { mount } from '@vue/test-utils'

import type { DraftMapPoint, MapPointDisplay, SummarySurfaceState } from '../../types/map-point'
import PointSummaryCard from './PointSummaryCard.vue'

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

function createCandidateSurface(
  overrides: Partial<DraftMapPoint> = {}
): SummarySurfaceState {
  return {
    mode: 'candidate-select',
    fallbackPoint: createDraftPoint(overrides),
    cityCandidates: [
      {
        cityId: 'jp-kyoto',
        cityName: 'Kyoto',
        contextLabel: 'Japan · Kansai',
        matchLevel: 'high',
        distanceKm: 1.5,
        statusHint: '更接近点击位置'
      },
      {
        cityId: 'jp-osaka',
        cityName: 'Osaka',
        contextLabel: 'Japan · Kansai',
        matchLevel: 'possible',
        distanceKm: 21,
        statusHint: '可能位置，需要确认'
      }
    ]
  }
}

describe('PointSummaryCard', () => {
  it('renders candidate actions with search input, fallback CTA, and saved reuse hint', async () => {
    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: createCandidateSurface(),
        findSavedPointByCityId: (cityId: string) => (cityId === 'jp-kyoto' ? createViewPoint() : null)
      }
    })

    expect(wrapper.text()).toContain('确认城市')
    expect(wrapper.text()).toContain('按国家/地区继续记录')
    expect(wrapper.find('input[placeholder="搜索城市"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('已存在记录')

    await wrapper.findAll('.point-summary-card__candidate-action')[0]?.trigger('click')

    expect(wrapper.emitted('confirmCandidate')?.[0]?.[0]).toMatchObject({
      cityId: 'jp-kyoto'
    })
  })

  it('uses both English and Chinese search results through the same candidate confirm path', async () => {
    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: {
          mode: 'candidate-select',
          fallbackPoint: createDraftPoint({
            id: 'detected-hu-1',
            name: 'Hungary',
            countryName: 'Hungary',
            countryCode: 'HU',
            cityContextLabel: 'Hungary',
            lat: 47.4979,
            lng: 19.0402,
            coordinatesLabel: '47.4979°N, 19.0402°E'
          }),
          cityCandidates: []
        } satisfies SummarySurfaceState,
        findSavedPointByCityId: (cityId: string) =>
          cityId === 'hu-budapest'
            ? createViewPoint({
                id: 'saved-hu-budapest',
                name: 'Budapest',
                countryName: 'Hungary',
                countryCode: 'HU',
                cityId: 'hu-budapest',
                cityName: 'Budapest',
                cityContextLabel: 'Hungary · Budapest'
              })
            : null
      }
    })

    const input = wrapper.get('input[placeholder="搜索城市"]')

    await input.setValue('buda')
    expect(wrapper.text()).toContain('Budapest')
    expect(wrapper.text()).toContain('已存在记录')

    await input.setValue('布达佩斯')
    expect(wrapper.text()).toContain('Budapest')

    await wrapper.findAll('.point-summary-card__candidate-action')[0]?.trigger('click')

    expect(wrapper.emitted('confirmCandidate')?.[0]?.[0]).toMatchObject({
      cityId: 'hu-budapest'
    })
  })

  it('renders detected preview actions with save, detail handoff, and featured toggle', async () => {
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

  it('uses inline delete confirmation instead of window.confirm for saved view state', async () => {
    const confirmSpy = vi.fn(() => true)
    vi.stubGlobal('confirm', confirmSpy)
    window.confirm = confirmSpy as typeof window.confirm

    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: {
          mode: 'view',
          point: createViewPoint(),
          boundarySupportState: 'supported'
        } satisfies SummarySurfaceState
      }
    })

    expect(wrapper.text()).toContain('查看详情')
    expect(wrapper.text()).toContain('编辑地点')
    expect(wrapper.text()).toContain('点亮状态')
    expect(wrapper.text()).toContain('删除地点')

    const actions = wrapper.findAll('.point-summary-card__action')
    await actions[actions.length - 1]?.trigger('click')

    expect(wrapper.text()).toContain('删除地点：确认删除这个地点？')
    expect(confirmSpy).not.toHaveBeenCalled()

    await wrapper.get('.point-summary-card__confirm-action').trigger('click')

    expect(wrapper.emitted('deletePoint')).toHaveLength(1)
  })

  it('uses inline hide confirmation for seed view state', async () => {
    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: {
          mode: 'view',
          point: createViewPoint({
            id: 'seed-kyoto',
            source: 'seed'
          }),
          boundarySupportState: 'supported'
        } satisfies SummarySurfaceState
      }
    })

    expect(wrapper.text()).toContain('隐藏预置地点')

    const actions = wrapper.findAll('.point-summary-card__action')
    await actions[actions.length - 1]?.trigger('click')

    expect(wrapper.text()).toContain('隐藏预置地点：确认隐藏这个预置地点？')

    await wrapper.get('.point-summary-card__confirm-action').trigger('click')

    expect(wrapper.emitted('hidePoint')).toHaveLength(1)
  })
})
