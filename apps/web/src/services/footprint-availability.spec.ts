import { PHASE28_RESOLVED_CALIFORNIA, type ResolvedCanonicalPlace } from '@trip-map/contracts'
import { describe, expect, it } from 'vitest'

import {
  FOOTPRINT_UNAVAILABLE_CATEGORY_COPY,
  FORBIDDEN_FOOTPRINT_COPY_TERMS,
  getFootprintAvailability,
  mapFootprintBlockingReasonToCategory,
  type FootprintBlockingReason,
  type FootprintUnavailableCategory,
} from './footprint-availability'
import type { MapPointDisplay, SummarySurfaceState } from '../types/map-point'

function makePoint(
  place: ResolvedCanonicalPlace = PHASE28_RESOLVED_CALIFORNIA,
  overrides: Partial<MapPointDisplay> = {},
): MapPointDisplay {
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
    regionSystem: place.regionSystem,
    adminType: place.adminType,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
    boundaryId: place.boundaryId,
    boundaryDatasetVersion: place.datasetVersion,
    fallbackNotice: null,
    x: 0.15,
    y: 0.44,
    lat: 36.7783,
    lng: -119.4179,
    source: 'detected',
    isFeatured: false,
    description: '',
    coordinatesLabel: '36.7783°N, 119.4179°W',
    ...overrides,
  }
}

function makeSurface(
  overrides: Partial<MapPointDisplay> = {},
  boundarySupportState: SummarySurfaceState extends infer Surface
    ? Surface extends { boundarySupportState: infer State }
      ? State
      : never
    : never = 'supported',
): SummarySurfaceState {
  return {
    mode: 'detected-preview',
    point: makePoint(PHASE28_RESOLVED_CALIFORNIA, overrides),
    boundarySupportState,
  }
}

const expectedReasonCategories: Record<FootprintBlockingReason, FootprintUnavailableCategory> = {
  missing_boundary_id: 'map_data_unavailable',
  missing_geometry_manifest: 'map_data_unavailable',
  missing_metadata_catalog: 'map_data_unavailable',
  frontend_guard_blocked: 'place_not_precise_enough',
  missing_canonical_identity: 'place_not_precise_enough',
  fallback_explanatory_only: 'outside_supported_map',
  record_authoritative_rejected: 'temporarily_unavailable',
}

describe('footprint availability service', () => {
  it.each([
    {
      name: 'missing_boundary_id',
      surface: makeSurface({ boundaryId: null }),
      options: undefined,
      reason: 'missing_boundary_id',
    },
    {
      name: 'missing_geometry_manifest',
      surface: makeSurface({ boundaryId: 'unknown-boundary' }, 'missing'),
      options: undefined,
      reason: 'missing_geometry_manifest',
    },
    {
      name: 'missing_metadata_catalog',
      surface: makeSurface(),
      options: { metadataCatalogStatus: 'missing' as const },
      reason: 'missing_metadata_catalog',
    },
    {
      name: 'frontend_guard_blocked',
      surface: makeSurface({ typeLabel: null }),
      options: undefined,
      reason: 'frontend_guard_blocked',
    },
    {
      name: 'missing_canonical_identity',
      surface: makeSurface({ placeId: null }),
      options: undefined,
      reason: 'missing_canonical_identity',
    },
    {
      name: 'fallback_explanatory_only',
      surface: makeSurface({
        fallbackNotice: '当前点击位置暂未命中已接入的正式行政区数据。',
        placeId: null,
        placeKind: null,
      }),
      options: undefined,
      reason: 'fallback_explanatory_only',
    },
    {
      name: 'record_authoritative_rejected',
      surface: makeSurface(),
      options: { recordAuthoritativeRejected: true },
      reason: 'record_authoritative_rejected',
    },
  ] satisfies Array<{
    name: string
    surface: SummarySurfaceState
    options: Parameters<typeof getFootprintAvailability>[1]
    reason: FootprintBlockingReason
  }>)(
    'returns exact reason, category, copy, and null snapshot for $name',
    ({ surface, options, reason }) => {
      const availability = getFootprintAvailability(surface, options)
      const category = expectedReasonCategories[reason]

      expect(availability.saveable).toBe(false)
      expect(availability.reason).toBe(reason)
      expect(availability.category).toBe(category)
      expect(availability.copy).toBe(FOOTPRINT_UNAVAILABLE_CATEGORY_COPY[category])
      expect(availability.snapshot).toBeNull()
      expect(mapFootprintBlockingReasonToCategory(reason)).toBe(category)
    },
  )

  it('returns a saveable California snapshot when canonical identity and manifest are complete', () => {
    const availability = getFootprintAvailability(makeSurface())

    expect(availability.saveable).toBe(true)
    expect(availability.reason).toBeNull()
    expect(availability.category).toBeNull()
    expect(availability.copy).toBeNull()
    expect(availability.snapshot).toMatchObject({
      placeId: PHASE28_RESOLVED_CALIFORNIA.placeId,
      boundaryId: 'ne-admin1-us-california',
      typeLabel: PHASE28_RESOLVED_CALIFORNIA.typeLabel,
      parentLabel: PHASE28_RESOLVED_CALIFORNIA.parentLabel,
    })
  })

  it('keeps all category copy free of implementation terms', () => {
    for (const copy of Object.values(FOOTPRINT_UNAVAILABLE_CATEGORY_COPY)) {
      for (const term of FORBIDDEN_FOOTPRINT_COPY_TERMS) {
        expect(copy).not.toContain(term)
      }
    }
  })
})
