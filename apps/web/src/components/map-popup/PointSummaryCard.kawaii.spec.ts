import {
  PHASE12_AMBIGUOUS_RESOLVE,
  PHASE12_RESOLVED_BEIJING,
  PHASE12_RESOLVED_CALIFORNIA,
} from '@trip-map/contracts'
import { mount } from '@vue/test-utils'

import PointSummaryCard from './PointSummaryCard.vue'
import pointSummaryCardSource from './PointSummaryCard.vue?raw'
import type { DraftMapPoint, MapPointDisplay, SummarySurfaceState } from '../../types/map-point'

type ViewSummarySurface = {
  mode: 'view'
  point: MapPointDisplay
  boundarySupportState: 'supported' | 'missing' | 'not-applicable'
}

const ambiguousResolve = (() => {
  if (PHASE12_AMBIGUOUS_RESOLVE.status !== 'ambiguous') {
    throw new Error('Expected ambiguous canonical resolve fixture')
  }

  return PHASE12_AMBIGUOUS_RESOLVE
})()

function createDraftPoint(
  place:
    | typeof PHASE12_RESOLVED_BEIJING
    | typeof PHASE12_RESOLVED_CALIFORNIA = PHASE12_RESOLVED_BEIJING,
  overrides: Partial<DraftMapPoint> = {},
): DraftMapPoint {
  const isCalifornia = place.placeId === PHASE12_RESOLVED_CALIFORNIA.placeId

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

function makeViewSurface(
  overrides: Partial<MapPointDisplay> = {},
): ViewSummarySurface {
  return {
    mode: 'view',
    point: createViewPoint(overrides),
    boundarySupportState: 'supported',
  }
}

function makeCandidateSurface(): Extract<SummarySurfaceState, { mode: 'candidate-select' }> {
  return {
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
  }
}

describe('PointSummaryCard kawaii contracts', () => {
  it('locks the inner cloud card surface and roomy spacing classes', () => {
    const wrapper = mount(PointSummaryCard, {
      props: { surface: makeViewSurface() },
    })

    const card = wrapper.get('[data-region="point-summary-card"]')
    const className = card.attributes('class') ?? ''

    expect(card.attributes('data-kawaii-surface')).toBe('cloud')
    expect(className).toContain('rounded-3xl')
    expect(className).toContain('border-4')
    expect(className).toContain('border-white')
    expect(className).toContain('p-6')
    expect(className).toContain('gap-4')
    expect(className).toContain(
      'shadow-[0_24px_48px_rgba(168,121,165,0.18),0_10px_24px_rgba(104,159,192,0.12)]',
    )
  })

  it('exposes badge, type pill, primary CTA, and secondary CTA kawaii role attrs', () => {
    const viewWrapper = mount(PointSummaryCard, {
      props: { surface: makeViewSurface() },
    })
    const candidateWrapper = mount(PointSummaryCard, {
      props: { surface: makeCandidateSurface() },
    })

    const badge = viewWrapper.get('[data-kawaii-role="badge"]')
    const typePill = viewWrapper.get('[data-kawaii-role="type-pill"]')
    const primaryCta = viewWrapper.get('[data-kawaii-role="primary-cta"]')
    const secondaryCta = candidateWrapper.get('[data-kawaii-role="secondary-cta"]')

    expect(badge.attributes('class')).toContain('rounded-full')
    expect(badge.attributes('class')).toContain('px-3')
    expect(badge.attributes('class')).toContain('py-1')
    expect(typePill.attributes('class')).toContain('rounded-full')
    expect(typePill.attributes('class')).toContain('px-3')
    expect(typePill.attributes('class')).toContain('py-1')
    expect(primaryCta.attributes('data-kawaii-role')).toBe('primary-cta')
    expect(secondaryCta.attributes('data-kawaii-role')).toBe('secondary-cta')
  })

  it('keeps primary hit areas tall and candidate / notice spacing roomy', () => {
    const viewWrapper = mount(PointSummaryCard, {
      props: {
        surface: makeViewSurface({
          fallbackNotice: '当前仅能按国家/地区保留这个点位。',
        }),
      },
    })
    const candidateWrapper = mount(PointSummaryCard, {
      props: { surface: makeCandidateSurface() },
    })

    const primaryCtaClass = viewWrapper.get('[data-kawaii-role="primary-cta"]').attributes('class')
    const noticeClass = viewWrapper.get('[data-notice-tone="fallback"]').attributes('class')
    const secondaryCtaClass = candidateWrapper
      .get('[data-kawaii-role="secondary-cta"]')
      .attributes('class')

    expect(primaryCtaClass).toMatch(/min-h-(11|\[44px\])/)
    expect(noticeClass).toContain('p-4')
    expect(secondaryCtaClass).toContain('gap-4')
    expect(secondaryCtaClass).toContain('p-4')
  })

  it('renders title, badge, notice, and candidate hint as escaped text without html injection', () => {
    const unsafeTitle = '<b>旅记标题</b>'
    const unsafeNotice = '<img src=x onerror=alert(1)>'
    const unsafeHint = '<script>alert("xss")</script>'
    const candidateSurface = makeCandidateSurface()
    candidateSurface.fallbackPoint.name = unsafeTitle
    candidateSurface.fallbackPoint.fallbackNotice = unsafeNotice
    candidateSurface.canonicalCandidates = candidateSurface.canonicalCandidates.map((candidate, index) => ({
      ...candidate,
      candidateHint: index === 0 ? unsafeHint : candidate.candidateHint,
    }))

    const candidateWrapper = mount(PointSummaryCard, {
      props: { surface: candidateSurface },
    })
    const viewWrapper = mount(PointSummaryCard, {
      props: {
        surface: makeViewSurface({
          name: unsafeTitle,
          fallbackNotice: unsafeNotice,
        }),
      },
    })

    expect(viewWrapper.get('[data-display="true"]').text()).toBe(unsafeTitle)
    expect(viewWrapper.text()).toContain('查看地点')
    expect(viewWrapper.text()).toContain(unsafeNotice)
    expect(candidateWrapper.text()).toContain(unsafeHint)
    expect(viewWrapper.find('b').exists()).toBe(false)
    expect(viewWrapper.find('img').exists()).toBe(false)
    expect(candidateWrapper.find('script').exists()).toBe(false)
  })

  it('locks the cloud card and ctas to the 300ms ease-out motion family', () => {
    const viewWrapper = mount(PointSummaryCard, {
      props: { surface: makeViewSurface() },
    })
    const candidateWrapper = mount(PointSummaryCard, {
      props: { surface: makeCandidateSurface() },
    })

    const cloudClass = viewWrapper.get('[data-kawaii-surface="cloud"]').attributes('class') ?? ''
    const primaryCtaClass = viewWrapper.get('[data-kawaii-role="primary-cta"]').attributes('class') ?? ''
    const secondaryCtaClass =
      candidateWrapper.get('[data-kawaii-role="secondary-cta"]').attributes('class') ?? ''

    expect(cloudClass).toContain('transition-all')
    expect(cloudClass).toContain('duration-300')
    expect(cloudClass).toContain('ease-out')
    expect(cloudClass).toContain('hover:scale-105')
    expect(cloudClass).toContain('hover:-translate-y-1')
    expect(cloudClass).not.toContain('active:scale-95')

    for (const className of [primaryCtaClass, secondaryCtaClass]) {
      expect(className).toContain('transition-all')
      expect(className).toContain('duration-300')
      expect(className).toContain('ease-out')
      expect(className).toContain('hover:scale-105')
      expect(className).toContain('hover:-translate-y-1')
      expect(className).toContain('active:scale-95')
    }
  })

  it('keeps badges, type pills, and notices free from scale / translate motion classes', () => {
    const wrapper = mount(PointSummaryCard, {
      props: {
        surface: makeViewSurface({
          fallbackNotice: '当前仅能按国家/地区保留这个点位。',
        }),
      },
    })

    const staticClasses = [
      wrapper.get('[data-kawaii-role="badge"]').attributes('class') ?? '',
      wrapper.get('[data-kawaii-role="type-pill"]').attributes('class') ?? '',
      wrapper.get('[data-notice-tone="fallback"]').attributes('class') ?? '',
    ]

    for (const className of staticClasses) {
      expect(className).not.toContain('hover:scale-105')
      expect(className).not.toContain('hover:-translate-y-1')
      expect(className).not.toContain('active:scale-95')
    }
  })

  it('keeps reduced-motion guards and removes legacy motion strings from the source contract', () => {
    expect(pointSummaryCardSource).toContain('@media (prefers-reduced-motion: reduce)')
    expect(pointSummaryCardSource).toMatch(
      /\[data-kawaii-surface="cloud"\][\s\S]*transform:\s*none !important;/,
    )
    expect(pointSummaryCardSource).toMatch(
      /\[data-kawaii-role="primary-cta"\][\s\S]*transform:\s*none !important;/,
    )
    expect(pointSummaryCardSource).toMatch(
      /\[data-kawaii-role="secondary-cta"\][\s\S]*transform:\s*none !important;/,
    )
    expect(pointSummaryCardSource).not.toContain('var(--motion-emphasis) ease')
    expect(pointSummaryCardSource).not.toContain('translateY(-1px)')
  })
})
