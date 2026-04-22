import { buildCanonicalMetadataLookup } from '../src/modules/canonical-places/place-metadata-catalog.js'

type Phase28OverseasCaseSeed = {
  iso2: string
  countryLabel: string
  displayName: string
  lat: number
  lng: number
  expectedTypeLabel: string
}

export type Phase28OverseasCase = Phase28OverseasCaseSeed & {
  expectedPlaceId: string
  expectedBoundaryId: string
}

export type Phase28IdentityCollisionCase = Phase28OverseasCase & {
  sourceFeatureId: 'US-WA' | 'US-DC' | 'AR-B' | 'AR-C'
}

export type LegacyOverseasUserTravelRecordSeed = {
  placeId: string
  boundaryId: string
  placeKind: 'OVERSEAS_ADMIN1'
  datasetVersion: '2026-04-02-geo-v2'
  displayName: string
  regionSystem: 'OVERSEAS'
  adminType: 'ADMIN1'
  typeLabel: '一级行政区'
  parentLabel: string
  subtitle: string
}

const CANONICAL_DATASET_VERSION = 'canonical-authoritative-2026-04-21'

const PHASE28_REQUIRED_ISO2S = [
  'IN',
  'ID',
  'SA',
  'PG',
  'CA',
  'BR',
  'AR',
  'DE',
  'PL',
  'CZ',
  'EG',
  'MA',
  'ZA',
] as const

const PHASE28_CASE_SEEDS = [
  {
    iso2: 'IN',
    countryLabel: 'India',
    displayName: 'West Bengal',
    lat: 23.0523,
    lng: 87.7289,
    expectedTypeLabel: 'State',
  },
  {
    iso2: 'ID',
    countryLabel: 'Indonesia',
    displayName: 'East Java',
    lat: -7.88129,
    lng: 112.616,
    expectedTypeLabel: 'Province',
  },
  {
    iso2: 'SA',
    countryLabel: 'Saudi Arabia',
    displayName: 'Eastern',
    lat: 22.9875,
    lng: 50.1714,
    expectedTypeLabel: 'Region',
  },
  {
    iso2: 'PG',
    countryLabel: 'Papua New Guinea',
    displayName: 'Morobe',
    lat: -6.3992,
    lng: 146.83,
    expectedTypeLabel: 'Province',
  },
  {
    iso2: 'CA',
    countryLabel: 'Canada',
    displayName: 'British Columbia',
    lat: 54.6943,
    lng: -124.662,
    expectedTypeLabel: 'Province',
  },
  {
    iso2: 'BR',
    countryLabel: 'Brazil',
    displayName: 'Rio Grande do Sul',
    lat: -29.7277,
    lng: -53.656,
    expectedTypeLabel: 'State',
  },
  {
    iso2: 'AR',
    countryLabel: 'Argentina',
    displayName: 'Entre Ríos',
    lat: -32.0275,
    lng: -59.2824,
    expectedTypeLabel: 'Province',
  },
  {
    iso2: 'DE',
    countryLabel: 'Germany',
    displayName: 'Bavaria',
    lat: 49.0056,
    lng: 11.3966,
    expectedTypeLabel: 'State',
  },
  {
    iso2: 'PL',
    countryLabel: 'Poland',
    displayName: 'Silesian Voivodeship',
    lat: 50.1978,
    lng: 18.9924,
    expectedTypeLabel: 'Province',
  },
  {
    iso2: 'CZ',
    countryLabel: 'Czech Republic',
    displayName: 'Ústí nad Labem',
    lat: 50.4996,
    lng: 13.8424,
    expectedTypeLabel: 'Region',
  },
  {
    iso2: 'EG',
    countryLabel: 'Egypt',
    displayName: 'Aswan',
    lat: 22.6543,
    lng: 32.2794,
    expectedTypeLabel: 'Governorate',
  },
  {
    iso2: 'MA',
    countryLabel: 'Morocco',
    displayName: 'Tangier-Tetouan',
    lat: 35.2884,
    lng: -5.35664,
    expectedTypeLabel: 'Region',
  },
  {
    iso2: 'ZA',
    countryLabel: 'South Africa',
    displayName: 'Western Cape',
    lat: -33.5035,
    lng: 20.9745,
    expectedTypeLabel: 'Province',
  },
] as const satisfies ReadonlyArray<Phase28OverseasCaseSeed>

const PHASE28_IDENTITY_COLLISION_CASE_SEEDS = [
  {
    sourceFeatureId: 'US-WA',
    iso2: 'US',
    countryLabel: 'United States',
    displayName: 'Washington',
    lat: 47.4865,
    lng: -120.361,
    expectedTypeLabel: 'State',
    expectedPlaceId: 'us-washington-state',
    expectedBoundaryId: 'ne-admin1-us-washington-state',
  },
  {
    sourceFeatureId: 'US-DC',
    iso2: 'US',
    countryLabel: 'United States',
    displayName: 'Washington',
    lat: 38.8922,
    lng: -77.0113,
    expectedTypeLabel: 'State',
    expectedPlaceId: 'us-district-of-columbia',
    expectedBoundaryId: 'ne-admin1-us-district-of-columbia',
  },
  {
    sourceFeatureId: 'AR-B',
    iso2: 'AR',
    countryLabel: 'Argentina',
    displayName: 'Buenos Aires',
    lat: -36.6734,
    lng: -60.1133,
    expectedTypeLabel: 'Province',
    expectedPlaceId: 'ar-buenos-aires-province',
    expectedBoundaryId: 'ne-admin1-ar-buenos-aires-province',
  },
  {
    sourceFeatureId: 'AR-C',
    iso2: 'AR',
    countryLabel: 'Argentina',
    displayName: 'Buenos Aires',
    lat: -34.6202,
    lng: -58.4527,
    expectedTypeLabel: 'Province',
    expectedPlaceId: 'ar-buenos-aires-city',
    expectedBoundaryId: 'ne-admin1-ar-buenos-aires-city',
  },
] as const satisfies ReadonlyArray<Phase28IdentityCollisionCase>

function assertPhase28CaseSeeds() {
  if (PHASE28_CASE_SEEDS.length !== PHASE28_REQUIRED_ISO2S.length) {
    throw new Error(
      `PHASE28_NEW_COUNTRY_CASES must contain exactly ${PHASE28_REQUIRED_ISO2S.length} cases; received ${PHASE28_CASE_SEEDS.length}.`,
    )
  }

  const actualIso2s = [...new Set(PHASE28_CASE_SEEDS.map(entry => entry.iso2))].sort()
  const expectedIso2s = [...PHASE28_REQUIRED_ISO2S].sort()

  if (JSON.stringify(actualIso2s) !== JSON.stringify(expectedIso2s)) {
    throw new Error(
      `PHASE28_NEW_COUNTRY_CASES ISO2 set mismatch. Expected ${expectedIso2s.join(', ')}, received ${actualIso2s.join(', ')}.`,
    )
  }
}

const canonicalLookup = buildCanonicalMetadataLookup()

function resolveCase(seed: Phase28OverseasCaseSeed): Phase28OverseasCase {
  const matches = [...canonicalLookup.byPlaceId.values()].filter(place =>
    place.placeKind === 'OVERSEAS_ADMIN1'
    && place.displayName === seed.displayName
    && place.parentLabel === seed.countryLabel
    && place.typeLabel === seed.expectedTypeLabel,
  )

  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one canonical summary for ${seed.iso2}/${seed.displayName}; received ${matches.length}.`,
    )
  }

  const [summary] = matches

  if (summary.datasetVersion !== CANONICAL_DATASET_VERSION) {
    throw new Error(
      `Phase 28 case ${seed.iso2}/${seed.displayName} expected datasetVersion ${CANONICAL_DATASET_VERSION}, received ${summary.datasetVersion}.`,
    )
  }

  return {
    ...seed,
    expectedPlaceId: summary.placeId,
    expectedBoundaryId: summary.boundaryId,
  }
}

function assertPhase28IdentityCollisionCases(): void {
  const seenSourceFeatureIds = new Set<string>()
  const seenPlaceIds = new Set<string>()
  const seenBoundaryIds = new Set<string>()

  for (const phase28Case of PHASE28_IDENTITY_COLLISION_CASE_SEEDS) {
    if (seenSourceFeatureIds.has(phase28Case.sourceFeatureId)) {
      throw new Error(`Duplicate Phase 28 collision sourceFeatureId "${phase28Case.sourceFeatureId}".`)
    }
    seenSourceFeatureIds.add(phase28Case.sourceFeatureId)

    if (seenPlaceIds.has(phase28Case.expectedPlaceId)) {
      throw new Error(`Duplicate Phase 28 collision placeId "${phase28Case.expectedPlaceId}".`)
    }
    seenPlaceIds.add(phase28Case.expectedPlaceId)

    if (seenBoundaryIds.has(phase28Case.expectedBoundaryId)) {
      throw new Error(`Duplicate Phase 28 collision boundaryId "${phase28Case.expectedBoundaryId}".`)
    }
    seenBoundaryIds.add(phase28Case.expectedBoundaryId)

    const placeSummary = canonicalLookup.byPlaceId.get(phase28Case.expectedPlaceId)
    const boundarySummary = canonicalLookup.byBoundaryId.get(phase28Case.expectedBoundaryId)

    if (!placeSummary || !boundarySummary) {
      throw new Error(
        `Missing canonical summary for collision case ${phase28Case.sourceFeatureId}/${phase28Case.expectedPlaceId}.`,
      )
    }

    if (placeSummary.placeId !== boundarySummary.placeId || placeSummary.boundaryId !== boundarySummary.boundaryId) {
      throw new Error(
        `Collision case ${phase28Case.sourceFeatureId} resolved inconsistent place/boundary summaries.`,
      )
    }

    if (
      placeSummary.displayName !== phase28Case.displayName
      || placeSummary.parentLabel !== phase28Case.countryLabel
      || placeSummary.typeLabel !== phase28Case.expectedTypeLabel
      || placeSummary.datasetVersion !== CANONICAL_DATASET_VERSION
    ) {
      throw new Error(
        `Collision case ${phase28Case.sourceFeatureId} no longer matches canonical-authoritative-2026-04-21 metadata.`,
      )
    }
  }
}

assertPhase28CaseSeeds()
assertPhase28IdentityCollisionCases()

export const PHASE28_NEW_COUNTRY_CASES = PHASE28_CASE_SEEDS.map(resolveCase)
export const PHASE28_IDENTITY_COLLISION_CASES = [...PHASE28_IDENTITY_COLLISION_CASE_SEEDS]

export const PHASE28_LEGACY_OVERSEAS_USER_TRAVEL_ROWS = [
  {
    placeId: 'jp-tokyo',
    boundaryId: 'ne-admin1-jp-tokyo',
    placeKind: 'OVERSEAS_ADMIN1',
    datasetVersion: '2026-04-02-geo-v2',
    displayName: 'Tokyo',
    regionSystem: 'OVERSEAS',
    adminType: 'ADMIN1',
    typeLabel: '一级行政区',
    parentLabel: 'Japan',
    subtitle: 'Japan · 一级行政区',
  },
  {
    placeId: 'us-california',
    boundaryId: 'ne-admin1-us-california',
    placeKind: 'OVERSEAS_ADMIN1',
    datasetVersion: '2026-04-02-geo-v2',
    displayName: 'California',
    regionSystem: 'OVERSEAS',
    adminType: 'ADMIN1',
    typeLabel: '一级行政区',
    parentLabel: 'United States',
    subtitle: 'United States · 一级行政区',
  },
] as const satisfies ReadonlyArray<LegacyOverseasUserTravelRecordSeed>
