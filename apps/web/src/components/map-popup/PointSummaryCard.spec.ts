import {
  PHASE12_AMBIGUOUS_RESOLVE,
  PHASE12_RESOLVED_BEIJING,
  PHASE12_RESOLVED_HONG_KONG,
  PHASE28_RESOLVED_CALIFORNIA,
  type ResolvedCanonicalPlace,
} from '@trip-map/contracts'
import { flushPromises, mount } from '@vue/test-utils'
import { vi } from 'vitest'

import { buildUnsupportedOverseasNotice } from '../../constants/overseas-support'
import PopupTripRecord from './PopupTripRecord.vue'
import PointSummaryCard from './PointSummaryCard.vue'
import TripDateForm from './TripDateForm.vue'
import type { DraftMapPoint, MapPointDisplay, SummarySurfaceState } from '../../types/map-point'

const mockTripsByPlaceId = vi.hoisted(() => new Map<string, any[]>())

vi.mock('../../stores/map-points', () => ({
  useMapPointsStore: () => ({
    tripsByPlaceId: mockTripsByPlaceId,
    updateRecord: vi.fn(),
    deleteSingleRecord: vi.fn(),
  }),
}))

const ambiguousResolve = (() => {
  if (PHASE12_AMBIGUOUS_RESOLVE.status !== 'ambiguous') {
    throw new Error('Expected ambiguous canonical resolve fixture')
  }

  return PHASE12_AMBIGUOUS_RESOLVE
})()

function createDraftPoint(
  place: ResolvedCanonicalPlace = PHASE12_RESOLVED_BEIJING,
  overrides: Partial<DraftMapPoint> = {},
): DraftMapPoint {
  const isCalifornia = place.placeId === PHASE28_RESOLVED_CALIFORNIA.placeId

  return {
    id: `detected-${place.placeId}`,
    name: place.displayName,
    countryName: place.parentLabel,
    countryCode: place.regionSystem === 'CN' ? 'CN' : '__canonical__',
    precision: 'city-high',
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
    x: isCalifornia ? 0.15 : 0.74,
    y: isCalifornia ? 0.44 : 0.31,
    lat: isCalifornia ? 36.7783 : 39.9042,
    lng: isCalifornia ? -119.4179 : 116.4074,
    source: 'detected',
    isFeatured: false,
    description: '',
    coordinatesLabel: isCalifornia ? '36.7783°N, 119.4179°W' : '39.9042°N, 116.4074°E',
    ...overrides,
  }
}

function createViewPoint(overrides: Partial<MapPointDisplay> = {}): MapPointDisplay {
  return {
    ...createDraftPoint(PHASE12_RESOLVED_BEIJING, {
      id: `saved-${PHASE12_RESOLVED_BEIJING.placeId}`,
    }),
    source: 'saved',
    ...overrides,
  }
}

function createCanonicalDraftPoint(overrides: Partial<DraftMapPoint> = {}): DraftMapPoint {
  return createDraftPoint(PHASE12_RESOLVED_BEIJING, {
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
    ...overrides,
  })
}

function makeViewSurface(overrides: Partial<MapPointDisplay> = {}): SummarySurfaceState {
  return {
    mode: 'view',
    point: createViewPoint(overrides),
    boundarySupportState: 'supported',
  }
}

function makeDetectedPreviewSurface(): SummarySurfaceState {
  return {
    mode: 'detected-preview',
    point: createDraftPoint(PHASE12_RESOLVED_BEIJING),
    boundarySupportState: 'supported',
  }
}

function makeCandidateSurface(): SummarySurfaceState {
  return {
    mode: 'candidate-select',
    fallbackPoint: createCanonicalDraftPoint(),
    cityCandidates: [],
    canonicalCandidates: [],
    recommendedPlaceId: null,
  }
}

describe('PointSummaryCard — illuminate button', () => {
  it('renders "点亮" button when isSaved=false in view mode', () => {
    const wrapper = mount(PointSummaryCard, {
      props: { surface: makeViewSurface(), isSaved: false },
    })
    const btn = wrapper.find('[data-illuminate-state]')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toBe('点亮')
  })

  it('renders "已点亮" button when isSaved=true in view mode', () => {
    const wrapper = mount(PointSummaryCard, {
      props: { surface: makeViewSurface(), isSaved: true },
    })
    const btn = wrapper.find('[data-illuminate-state]')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toBe('已点亮')
  })

  it('button has data-illuminate-state="off" when not saved', () => {
    const wrapper = mount(PointSummaryCard, {
      props: { surface: makeViewSurface(), isSaved: false },
    })
    expect(wrapper.find('[data-illuminate-state]').attributes('data-illuminate-state')).toBe('off')
  })

  it('button has data-illuminate-state="on" when saved', () => {
    const wrapper = mount(PointSummaryCard, {
      props: { surface: makeViewSurface(), isSaved: true },
    })
    expect(wrapper.find('[data-illuminate-state]').attributes('data-illuminate-state')).toBe('on')
  })

  it('button is disabled when isPending=true', () => {
    const wrapper = mount(PointSummaryCard, {
      props: { surface: makeViewSurface(), isSaved: false, isPending: true },
    })
    const btn = wrapper.find('[data-illuminate-state]')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('renders a disabled illuminate affordance for non-illuminatable points', async () => {
    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: makeViewSurface(),
        isSaved: false,
        isIlluminatable: false,
      },
    })

    const btn = wrapper.find('[data-illuminate-state]')

    expect(btn.attributes('disabled')).toBeDefined()
    expect(btn.attributes('data-illuminatable')).toBe('false')
    expect(btn.attributes('title')).toBe('该地点暂不支持点亮')
    expect(btn.attributes('aria-label')).toBe('该地点暂不支持点亮')
    await btn.trigger('click')
    expect(wrapper.emitted('illuminate')).toBeFalsy()
  })

  it('click on "点亮" opens TripDateForm instead of emitting illuminate directly', async () => {
    const wrapper = mount(PointSummaryCard, {
      props: { surface: makeViewSurface(), isSaved: false },
    })

    await wrapper.find('[data-illuminate-state]').trigger('click')

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('illuminate')).toBeFalsy()
    expect(wrapper.emitted('unilluminate')).toBeFalsy()
    expect(wrapper.find('[data-region="trip-date-form-wrapper"]').exists()).toBe(true)
  })

  it('click on "已点亮" emits unilluminate event', async () => {
    const wrapper = mount(PointSummaryCard, {
      props: { surface: makeViewSurface(), isSaved: true },
    })
    await wrapper.find('[data-illuminate-state]').trigger('click')
    expect(wrapper.emitted('unilluminate')).toBeTruthy()
    expect(wrapper.emitted('illuminate')).toBeFalsy()
  })

  it('candidate-select mode does NOT render illuminate button', () => {
    const wrapper = mount(PointSummaryCard, {
      props: { surface: makeCandidateSurface(), isSaved: false },
    })
    expect(wrapper.find('[data-illuminate-state]').exists()).toBe(false)
  })

  it('detected-preview mode renders "点亮" button', () => {
    const wrapper = mount(PointSummaryCard, {
      props: { surface: makeDetectedPreviewSurface(), isSaved: false },
    })
    const btn = wrapper.find('[data-illuminate-state]')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toBe('点亮')
  })
})

describe('PointSummaryCard — multi-visit Phase 27', () => {
  it('expands TripDateForm for unsaved points before emitting illuminate', async () => {
    const wrapper = mount(PointSummaryCard, {
      props: { surface: makeViewSurface(), isSaved: false },
    })

    await wrapper.get('[data-illuminate-state="off"]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('illuminate')).toBeFalsy()
    expect(wrapper.find('[data-region="trip-date-form-wrapper"]').exists()).toBe(true)
  })

  it('emits illuminate with date payload after the TripDateForm submits', async () => {
    const wrapper = mount(PointSummaryCard, {
      props: { surface: makeViewSurface(), isSaved: false },
    })

    await wrapper.get('[data-illuminate-state="off"]').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.findComponent(TripDateForm).vm.$emit('submit', {
      startDate: '2025-10-01',
      endDate: null,
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('illuminate')?.[0]?.[0]).toEqual({
      startDate: '2025-10-01',
      endDate: null,
    })
  })

  it('renders per-record PopupTripRecord list when isSaved=true and records exist', () => {
    mockTripsByPlaceId.set('cn-beijing', [
      {
        id: 'record-1',
        placeId: 'cn-beijing',
        boundaryId: 'boundary-1',
        placeKind: 'CN_ADMIN',
        datasetVersion: 'v1',
        displayName: '北京',
        regionSystem: 'CN',
        adminType: 'MUNICIPALITY',
        typeLabel: '直辖市',
        parentLabel: '中国',
        subtitle: '北京市',
        startDate: '2025-01-15',
        endDate: null,
        createdAt: '2025-01-16T00:00:00.000Z',
        updatedAt: '2025-01-16T00:00:00.000Z',
        notes: null,
        tags: [],
      },
      {
        id: 'record-2',
        placeId: 'cn-beijing',
        boundaryId: 'boundary-1',
        placeKind: 'CN_ADMIN',
        datasetVersion: 'v1',
        displayName: '北京',
        regionSystem: 'CN',
        adminType: 'MUNICIPALITY',
        typeLabel: '直辖市',
        parentLabel: '中国',
        subtitle: '北京市',
        startDate: '2024-06-01',
        endDate: '2024-06-10',
        createdAt: '2024-06-11T00:00:00.000Z',
        updatedAt: '2024-06-11T00:00:00.000Z',
        notes: '和家人一起',
        tags: ['美食', '文化'],
      },
    ])

    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: makeViewSurface(),
        isSaved: true,
      },
    })

    expect(wrapper.find('[data-region="popup-records"]').exists()).toBe(true)
    const records = wrapper.findAllComponents(PopupTripRecord)
    expect(records.length).toBe(2)
  })

  it('hides per-record list when no records in store', () => {
    mockTripsByPlaceId.clear()
    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: makeViewSurface(),
        isSaved: true,
      },
    })

    expect(wrapper.find('[data-region="popup-records"]').exists()).toBe(false)
  })

  it('expands TripDateForm from the re-record CTA on saved points', async () => {
    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: makeViewSurface(),
        isSaved: true,
        tripCount: 1,
      },
    })

    await wrapper.get('[data-record-again]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-region="trip-date-form-wrapper"]').exists()).toBe(true)
  })

  it('collapses the form on cancel without emitting illuminate', async () => {
    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: makeViewSurface(),
        isSaved: true,
        tripCount: 1,
      },
    })

    await wrapper.get('[data-record-again]').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.findComponent(TripDateForm).vm.$emit('cancel')

    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-region="trip-date-form-wrapper"]').exists()).toBe(false)
    expect(wrapper.emitted('illuminate')).toBeFalsy()
  })

  it('does not expand the form when the point is not illuminatable', async () => {
    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: makeViewSurface(),
        isSaved: false,
        isIlluminatable: false,
      },
    })

    await wrapper.get('[data-illuminate-state="off"]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-region="trip-date-form-wrapper"]').exists()).toBe(false)
    expect(wrapper.emitted('illuminate')).toBeFalsy()
  })

  it('does not render popup-records when isSaved=false', () => {
    mockTripsByPlaceId.set('cn-beijing', [
      {
        id: 'record-1',
        placeId: 'cn-beijing',
        boundaryId: '',
        placeKind: 'CN_ADMIN' as const,
        datasetVersion: 'v1',
        displayName: '北京',
        regionSystem: 'CN',
        adminType: 'MUNICIPALITY',
        typeLabel: '直辖市',
        parentLabel: '中国',
        subtitle: '北京市',
        startDate: '2025-01-15',
        endDate: null,
        createdAt: '2025-01-16T00:00:00.000Z',
        updatedAt: '2025-01-16T00:00:00.000Z',
        notes: null,
        tags: [],
      },
    ])

    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: makeViewSurface(),
        isSaved: false,
      },
    })

    expect(wrapper.find('[data-region="popup-records"]').exists()).toBe(false)
  })

  it('does not render popup-records in candidate-select mode', () => {
    mockTripsByPlaceId.set('cn-beijing', [
      {
        id: 'record-1',
        placeId: 'cn-beijing',
        boundaryId: '',
        placeKind: 'CN_ADMIN' as const,
        datasetVersion: 'v1',
        displayName: '北京',
        regionSystem: 'CN',
        adminType: 'MUNICIPALITY',
        typeLabel: '直辖市',
        parentLabel: '中国',
        subtitle: '北京市',
        startDate: '2025-01-15',
        endDate: null,
        createdAt: '2025-01-16T00:00:00.000Z',
        updatedAt: '2025-01-16T00:00:00.000Z',
        notes: null,
        tags: [],
      },
    ])

    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: makeCandidateSurface(),
        isSaved: true,
      },
    })

    expect(wrapper.find('[data-region="popup-records"]').exists()).toBe(false)
  })
})

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
            statusHint: candidate.candidateHint,
          })),
          canonicalCandidates: ambiguousResolve.candidates,
          recommendedPlaceId: ambiguousResolve.recommendedPlaceId,
        } as SummarySurfaceState,
        findSavedPointByCityId: (cityId: string) =>
          cityId === ambiguousResolve.candidates[0]?.placeId
            ? createViewPoint({
                id: 'saved-beijing',
                name: PHASE12_RESOLVED_BEIJING.displayName,
                countryName: PHASE12_RESOLVED_BEIJING.parentLabel,
                placeId: PHASE12_RESOLVED_BEIJING.placeId,
                typeLabel: PHASE12_RESOLVED_BEIJING.typeLabel,
                subtitle: PHASE12_RESOLVED_BEIJING.subtitle,
              })
            : null,
      },
    })

    expect(wrapper.get('[data-region="point-summary-card"]').attributes('data-summary-mode')).toBe(
      'candidate-select',
    )
    expect(wrapper.text()).toContain('北京')
    expect(wrapper.text()).toContain('直辖市')
    expect(wrapper.text()).toContain('中国 · 直辖市')
    expect(wrapper.find('[data-candidate-recommended="true"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('按国家/地区继续记录')
    expect(wrapper.text()).toContain('已存在记录')

    await wrapper.findAll('.point-summary-card__candidate-action')[0]?.trigger('click')

    expect(wrapper.emitted('confirmCandidate')?.[0]?.[0]).toMatchObject({
      cityId: ambiguousResolve.candidates[0]?.placeId,
    })
  })

  it('renders unsupported notice before the boundary-missing notice', () => {
    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: {
          mode: 'view',
          point: createViewPoint({
            fallbackNotice: buildUnsupportedOverseasNotice('British Columbia'),
          }),
          boundarySupportState: 'missing',
        } satisfies SummarySurfaceState,
      },
    })

    const notices = wrapper.findAll('[data-notice-tone="fallback"]')

    expect(notices).toHaveLength(2)
    expect(notices[0]?.text()).toContain(buildUnsupportedOverseasNotice('British Columbia'))
    expect(notices[1]?.text()).toContain('当前地点暂不支持边界高亮')
  })

  it('locks real admin labels and candidate limit for canonical popup surfaces', () => {
    const beijingWrapper = mount(PointSummaryCard, {
      props: {
        surface: {
          mode: 'view',
          point: createViewPoint(),
          boundarySupportState: 'supported',
        } satisfies SummarySurfaceState,
      },
    })
    const hongKongWrapper = mount(PointSummaryCard, {
      props: {
        surface: {
          mode: 'view',
          point: createViewPoint({
            id: `saved-${PHASE12_RESOLVED_HONG_KONG.placeId}`,
            name: PHASE12_RESOLVED_HONG_KONG.displayName,
            countryName: PHASE12_RESOLVED_HONG_KONG.parentLabel,
            cityName: PHASE12_RESOLVED_HONG_KONG.displayName,
            cityContextLabel: PHASE12_RESOLVED_HONG_KONG.subtitle,
            placeId: PHASE12_RESOLVED_HONG_KONG.placeId,
            placeKind: PHASE12_RESOLVED_HONG_KONG.placeKind,
            datasetVersion: PHASE12_RESOLVED_HONG_KONG.datasetVersion,
            typeLabel: PHASE12_RESOLVED_HONG_KONG.typeLabel,
            parentLabel: PHASE12_RESOLVED_HONG_KONG.parentLabel,
            subtitle: PHASE12_RESOLVED_HONG_KONG.subtitle,
            boundaryId: PHASE12_RESOLVED_HONG_KONG.boundaryId,
            boundaryDatasetVersion: PHASE12_RESOLVED_HONG_KONG.datasetVersion,
          }),
          boundarySupportState: 'supported',
        } satisfies SummarySurfaceState,
      },
    })
    const californiaWrapper = mount(PointSummaryCard, {
      props: {
        surface: {
          mode: 'view',
          point: createViewPoint({
            id: `saved-${PHASE28_RESOLVED_CALIFORNIA.placeId}`,
            name: PHASE28_RESOLVED_CALIFORNIA.displayName,
            countryName: PHASE28_RESOLVED_CALIFORNIA.parentLabel,
            countryCode: '__canonical__',
            cityName: PHASE28_RESOLVED_CALIFORNIA.displayName,
            cityContextLabel: PHASE28_RESOLVED_CALIFORNIA.subtitle,
            placeId: PHASE28_RESOLVED_CALIFORNIA.placeId,
            placeKind: PHASE28_RESOLVED_CALIFORNIA.placeKind,
            datasetVersion: PHASE28_RESOLVED_CALIFORNIA.datasetVersion,
            typeLabel: PHASE28_RESOLVED_CALIFORNIA.typeLabel,
            parentLabel: PHASE28_RESOLVED_CALIFORNIA.parentLabel,
            subtitle: PHASE28_RESOLVED_CALIFORNIA.subtitle,
            boundaryId: PHASE28_RESOLVED_CALIFORNIA.boundaryId,
            boundaryDatasetVersion: PHASE28_RESOLVED_CALIFORNIA.datasetVersion,
            lat: 36.7783,
            lng: -119.4179,
            x: 0.15,
            y: 0.44,
            coordinatesLabel: '36.7783°N, 119.4179°W',
          }),
          boundarySupportState: 'supported',
        } satisfies SummarySurfaceState,
      },
    })
    const candidateWrapper = mount(PointSummaryCard, {
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
            statusHint: candidate.candidateHint,
          })),
          canonicalCandidates: [
            { ...PHASE12_RESOLVED_BEIJING, candidateHint: '点击点位接近北京市中心' },
            { ...PHASE12_RESOLVED_HONG_KONG, candidateHint: '港岛与九龙附近候选' },
            { ...PHASE28_RESOLVED_CALIFORNIA, candidateHint: '跨洋 admin1 候选' },
            { ...PHASE12_RESOLVED_BEIJING, placeId: 'cn-admin-extra', candidateHint: 'extra candidate should be hidden' },
          ],
          recommendedPlaceId: ambiguousResolve.recommendedPlaceId,
        } as SummarySurfaceState,
      },
    })

    expect(beijingWrapper.text()).toContain('北京')
    expect(beijingWrapper.text()).toContain('直辖市')
    expect(beijingWrapper.text()).toContain('中国 · 直辖市')
    expect(hongKongWrapper.text()).toContain('香港')
    expect(hongKongWrapper.text()).toContain('特别行政区')
    expect(hongKongWrapper.text()).toContain('中国 · 特别行政区')
    expect(californiaWrapper.text()).toContain('California')
    expect(californiaWrapper.text()).toContain('State')
    expect(californiaWrapper.text()).toContain('United States · State')
    expect(candidateWrapper.findAll('.point-summary-card__candidate-action')).toHaveLength(3)
    expect(candidateWrapper.find('[data-candidate-recommended="true"]').exists()).toBe(true)
  })
})
