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

  if (summary.datasetVersion !== '2026-04-21-geo-v3') {
    throw new Error(
      `Phase 28 case ${seed.iso2}/${seed.displayName} expected datasetVersion 2026-04-21-geo-v3, received ${summary.datasetVersion}.`,
    )
  }

  return {
    ...seed,
    expectedPlaceId: summary.placeId,
    expectedBoundaryId: summary.boundaryId,
  }
}

assertPhase28CaseSeeds()

export const PHASE28_NEW_COUNTRY_CASES = PHASE28_CASE_SEEDS.map(resolveCase)
