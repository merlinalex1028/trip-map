import type { CanonicalResolveFailedReason } from '@trip-map/contracts'

import { buildCanonicalMetadataLookup } from '../src/modules/canonical-places/place-metadata-catalog.js'

export type Phase45CoverageBlockingReason =
  | 'saveable'
  | 'missing_boundary_id'
  | 'missing_geometry_manifest'
  | 'missing_metadata_catalog'
  | 'record_authoritative_rejected'
  | 'frontend_guard_blocked'
  | 'missing_canonical_identity'
  | 'fallback_explanatory_only'

export type Phase45CoverageCategory =
  | 'map_data_unavailable'
  | 'place_not_precise_enough'
  | 'outside_supported_map'
  | 'temporarily_unavailable'
  | 'saveable'

export type Phase45RuntimeBreakpoint =
  | 'canonical_resolve'
  | 'frontend_footprint_guard'
  | 'geometry_manifest_lookup'
  | 'metadata_catalog_lookup'
  | 'record_api_authoritative_validation'
  | 'derived_replay'

export type Phase45ResolveCoverageCase = {
  id: string
  description: string
  lat: number
  lng: number
  expectedStatus: 'resolved' | 'failed'
  expectedFailedReason?: CanonicalResolveFailedReason
  expectedPlaceId?: string
  expectedBoundaryId?: string
  expectedTypeLabel?: string
  expectedParentLabel?: string
  expectedBlockingReason: Phase45CoverageBlockingReason
  expectedCategory: Phase45CoverageCategory
  expectedBreakpoint: Phase45RuntimeBreakpoint
}

export type Phase45RecordApiCoverageCase = {
  id: string
  description: string
  expectedPlaceId?: string
  expectedBoundaryId?: string
  expectedBlockingReason: Phase45CoverageBlockingReason
  expectedCategory: Phase45CoverageCategory
  expectedBreakpoint: Phase45RuntimeBreakpoint
}

type Phase45BritishColumbiaSeed = {
  displayName: 'British Columbia'
  parentLabel: 'Canada'
  typeLabel: 'Province'
}

const CANONICAL_DATASET_VERSION = 'canonical-authoritative-2026-04-21'

const PHASE45_EXPECTED_RESOLVE_IDS = [
  'resolve_us_california_saveable',
  'resolve_ca_british_columbia_saveable',
  'resolve_mexico_city_fallback_only',
] as const

const PHASE45_EXPECTED_RECORD_IDS = [
  'record_us_california_authoritative_saveable',
  'record_ca_british_columbia_authoritative_saveable',
  'record_mx_jalisco_authoritative_rejected',
  'record_us_california_forged_metadata_rejected',
] as const

const canonicalLookup = buildCanonicalMetadataLookup()

function buildPhase45Message(
  phase45Case: Pick<Phase45ResolveCoverageCase | Phase45RecordApiCoverageCase, 'id' | 'expectedBlockingReason'>
    & Partial<Pick<Phase45ResolveCoverageCase | Phase45RecordApiCoverageCase, 'expectedPlaceId' | 'expectedBoundaryId'>>,
  detail: string,
): string {
  return [
    `Phase45 coverage case ${phase45Case.id}`,
    phase45Case.expectedPlaceId ? `placeId=${phase45Case.expectedPlaceId}` : null,
    phase45Case.expectedBoundaryId ? `boundaryId=${phase45Case.expectedBoundaryId}` : null,
    `expectedBlockingReason=${phase45Case.expectedBlockingReason}`,
    detail,
  ].filter(Boolean).join(' ')
}

function findCatalogSummaryByIdentity(seed: Phase45BritishColumbiaSeed) {
  const matches = [...canonicalLookup.byPlaceId.values()].filter(place =>
    place.displayName === seed.displayName
    && place.parentLabel === seed.parentLabel
    && place.typeLabel === seed.typeLabel,
  )

  if (matches.length !== 1) {
    throw new Error(
      `Phase45 coverage case resolve_ca_british_columbia_saveable expected one catalog summary for ${seed.parentLabel}/${seed.displayName}; received ${matches.length}.`,
    )
  }

  const [summary] = matches

  if (summary.datasetVersion !== CANONICAL_DATASET_VERSION) {
    throw new Error(
      buildPhase45Message(
        {
          id: 'resolve_ca_british_columbia_saveable',
          expectedPlaceId: summary.placeId,
          expectedBoundaryId: summary.boundaryId,
          expectedBlockingReason: 'saveable',
        },
        `expected datasetVersion ${CANONICAL_DATASET_VERSION}, received ${summary.datasetVersion}.`,
      ),
    )
  }

  return summary
}

const britishColumbiaSummary = findCatalogSummaryByIdentity({
  displayName: 'British Columbia',
  parentLabel: 'Canada',
  typeLabel: 'Province',
})

export const PHASE45_RESOLVE_COVERAGE_CASES = [
  {
    id: 'resolve_us_california_saveable',
    description: 'California resolves with full canonical identity, geometry manifest coverage, and metadata catalog coverage.',
    lat: 36.7783,
    lng: -119.4179,
    expectedStatus: 'resolved',
    expectedPlaceId: 'us-california',
    expectedBoundaryId: 'ne-admin1-us-california',
    expectedTypeLabel: 'State',
    expectedParentLabel: 'United States',
    expectedBlockingReason: 'saveable',
    expectedCategory: 'saveable',
    expectedBreakpoint: 'canonical_resolve',
  },
  {
    id: 'resolve_ca_british_columbia_saveable',
    description: 'British Columbia resolves from the Phase 28 catalog-backed Canada admin1 sample.',
    lat: 54.6943,
    lng: -124.662,
    expectedStatus: 'resolved',
    expectedPlaceId: britishColumbiaSummary.placeId,
    expectedBoundaryId: britishColumbiaSummary.boundaryId,
    expectedTypeLabel: 'Province',
    expectedParentLabel: 'Canada',
    expectedBlockingReason: 'saveable',
    expectedCategory: 'saveable',
    expectedBreakpoint: 'canonical_resolve',
  },
  {
    id: 'resolve_mexico_city_fallback_only',
    description: 'Mexico City remains OUTSIDE_SUPPORTED_DATA and explanatory-only, with no saveable canonical place payload.',
    lat: 19.4326,
    lng: -99.1332,
    expectedStatus: 'failed',
    expectedFailedReason: 'OUTSIDE_SUPPORTED_DATA',
    expectedBlockingReason: 'fallback_explanatory_only',
    expectedCategory: 'outside_supported_map',
    expectedBreakpoint: 'canonical_resolve',
  },
] as const satisfies ReadonlyArray<Phase45ResolveCoverageCase>

export const PHASE45_RECORD_API_COVERAGE_CASES = [
  {
    id: 'record_us_california_authoritative_saveable',
    description: 'California authoritative record payload is expected to pass the record API validation gate.',
    expectedPlaceId: 'us-california',
    expectedBoundaryId: 'ne-admin1-us-california',
    expectedBlockingReason: 'saveable',
    expectedCategory: 'saveable',
    expectedBreakpoint: 'record_api_authoritative_validation',
  },
  {
    id: 'record_ca_british_columbia_authoritative_saveable',
    description: 'British Columbia authoritative record payload is expected to pass the record API validation gate.',
    expectedPlaceId: britishColumbiaSummary.placeId,
    expectedBoundaryId: britishColumbiaSummary.boundaryId,
    expectedBlockingReason: 'saveable',
    expectedCategory: 'saveable',
    expectedBreakpoint: 'record_api_authoritative_validation',
  },
  {
    id: 'record_mx_jalisco_authoritative_rejected',
    description: 'Mexico/Jalisco remains outside the authoritative metadata catalog and must be rejected by the record API.',
    expectedPlaceId: 'mx-jalisco',
    expectedBoundaryId: 'ne-admin1-mx-jalisco',
    expectedBlockingReason: 'record_authoritative_rejected',
    expectedCategory: 'temporarily_unavailable',
    expectedBreakpoint: 'record_api_authoritative_validation',
  },
  {
    id: 'record_us_california_forged_metadata_rejected',
    description: 'A forged California metadata payload must be rejected even when the placeId names a supported place.',
    expectedPlaceId: 'us-california',
    expectedBoundaryId: 'ne-admin1-us-california-forged',
    expectedBlockingReason: 'record_authoritative_rejected',
    expectedCategory: 'temporarily_unavailable',
    expectedBreakpoint: 'record_api_authoritative_validation',
  },
] as const satisfies ReadonlyArray<Phase45RecordApiCoverageCase>

function assertExactIds(
  label: string,
  actualIds: readonly string[],
  expectedIds: readonly string[],
): void {
  const actual = [...actualIds].sort()
  const expected = [...expectedIds].sort()

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Phase45 ${label} ids mismatch. Expected ${expected.join(', ')}, received ${actual.join(', ')}.`)
  }
}

function assertNoDuplicateIds(cases: ReadonlyArray<Phase45ResolveCoverageCase | Phase45RecordApiCoverageCase>): void {
  const seenIds = new Set<string>()

  for (const phase45Case of cases) {
    if (seenIds.has(phase45Case.id)) {
      throw new Error(buildPhase45Message(phase45Case, 'duplicate sample id.'))
    }

    seenIds.add(phase45Case.id)
  }
}

function assertSaveableCaseHasCatalogCoverage(
  phase45Case: Phase45ResolveCoverageCase | Phase45RecordApiCoverageCase,
): void {
  if (phase45Case.expectedBlockingReason !== 'saveable') {
    return
  }

  if (!phase45Case.expectedPlaceId || !phase45Case.expectedBoundaryId) {
    throw new Error(buildPhase45Message(phase45Case, 'saveable sample is missing canonical identity.'))
  }

  const placeSummary = canonicalLookup.byPlaceId.get(phase45Case.expectedPlaceId)
  const boundarySummary = canonicalLookup.byBoundaryId.get(phase45Case.expectedBoundaryId)

  if (!placeSummary || !boundarySummary) {
    throw new Error(buildPhase45Message(phase45Case, 'saveable sample is missing metadata_catalog coverage.'))
  }

  if (placeSummary.placeId !== boundarySummary.placeId || placeSummary.boundaryId !== boundarySummary.boundaryId) {
    throw new Error(buildPhase45Message(phase45Case, 'metadata_catalog lookup returned inconsistent identities.'))
  }
}

function assertResolveCase(phase45Case: Phase45ResolveCoverageCase): void {
  if (phase45Case.expectedStatus === 'failed' && !phase45Case.expectedFailedReason) {
    throw new Error(buildPhase45Message(phase45Case, 'failed sample is missing expectedFailedReason.'))
  }

  if (phase45Case.expectedStatus === 'failed' && (phase45Case.expectedPlaceId || phase45Case.expectedBoundaryId)) {
    throw new Error(buildPhase45Message(phase45Case, 'failed fallback sample must stay explanatory-only.'))
  }

  assertSaveableCaseHasCatalogCoverage(phase45Case)
}

function assertPhase45CoverageCases(): void {
  assertExactIds(
    'resolve coverage',
    PHASE45_RESOLVE_COVERAGE_CASES.map(phase45Case => phase45Case.id),
    PHASE45_EXPECTED_RESOLVE_IDS,
  )
  assertExactIds(
    'record API coverage',
    PHASE45_RECORD_API_COVERAGE_CASES.map(phase45Case => phase45Case.id),
    PHASE45_EXPECTED_RECORD_IDS,
  )
  assertNoDuplicateIds([...PHASE45_RESOLVE_COVERAGE_CASES, ...PHASE45_RECORD_API_COVERAGE_CASES])

  for (const phase45Case of PHASE45_RESOLVE_COVERAGE_CASES) {
    assertResolveCase(phase45Case)
  }

  for (const phase45Case of PHASE45_RECORD_API_COVERAGE_CASES) {
    assertSaveableCaseHasCatalogCoverage(phase45Case)
  }
}

function createReasonCounter<T extends string>(keys: readonly T[]): Record<T, number> {
  return Object.fromEntries(keys.map(key => [key, 0])) as Record<T, number>
}

export function getPhase45CoverageSummary() {
  const byBlockingReason = createReasonCounter<Phase45CoverageBlockingReason>([
    'saveable',
    'missing_boundary_id',
    'missing_geometry_manifest',
    'missing_metadata_catalog',
    'record_authoritative_rejected',
    'frontend_guard_blocked',
    'missing_canonical_identity',
    'fallback_explanatory_only',
  ])
  const byCategory = createReasonCounter<Phase45CoverageCategory>([
    'map_data_unavailable',
    'place_not_precise_enough',
    'outside_supported_map',
    'temporarily_unavailable',
    'saveable',
  ])
  const byBreakpoint = createReasonCounter<Phase45RuntimeBreakpoint>([
    'canonical_resolve',
    'frontend_footprint_guard',
    'geometry_manifest_lookup',
    'metadata_catalog_lookup',
    'record_api_authoritative_validation',
    'derived_replay',
  ])
  const coverageCases = [...PHASE45_RESOLVE_COVERAGE_CASES, ...PHASE45_RECORD_API_COVERAGE_CASES]

  for (const phase45Case of coverageCases) {
    byBlockingReason[phase45Case.expectedBlockingReason] += 1
    byCategory[phase45Case.expectedCategory] += 1
    byBreakpoint[phase45Case.expectedBreakpoint] += 1
  }

  return {
    total: coverageCases.length,
    byBlockingReason,
    byCategory,
    byBreakpoint,
  }
}

assertPhase45CoverageCases()
