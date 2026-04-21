import { describe, expect, it } from 'vitest'

import {
  buildCanonicalMetadataLookup,
  buildSmokeMetadataUpdate,
  buildTravelMetadataUpdate,
  buildUserTravelMetadataUpdate,
} from '../scripts/backfill-record-metadata.ts'

const CANONICAL_DATASET_VERSION = 'canonical-authoritative-2026-04-21'

describe('record metadata backfill helpers', () => {
  it('maps authoritative canonical metadata by placeId for travel, smoke, and userTravel records', () => {
    const lookup = buildCanonicalMetadataLookup()

    expect(buildTravelMetadataUpdate('cn-beijing', lookup)).toEqual({
      datasetVersion: CANONICAL_DATASET_VERSION,
      displayName: '北京',
      regionSystem: 'CN',
      adminType: 'MUNICIPALITY',
      typeLabel: '直辖市',
      parentLabel: '中国',
      subtitle: '中国 · 直辖市',
    })

    expect(buildSmokeMetadataUpdate('us-california', lookup)).toEqual({
      datasetVersion: CANONICAL_DATASET_VERSION,
      displayName: 'California',
      regionSystem: 'OVERSEAS',
      adminType: 'ADMIN1',
      typeLabel: 'State',
      parentLabel: 'United States',
      subtitle: 'United States · State',
    })

    expect(buildTravelMetadataUpdate('jp-tokyo', lookup)).toEqual({
      datasetVersion: CANONICAL_DATASET_VERSION,
      displayName: 'Tokyo',
      regionSystem: 'OVERSEAS',
      adminType: 'ADMIN1',
      typeLabel: 'Prefecture',
      parentLabel: 'Japan',
      subtitle: 'Japan · Prefecture',
    })

    expect(buildUserTravelMetadataUpdate('us-california', lookup)?.datasetVersion).toBe(
      'canonical-authoritative-2026-04-21',
    )
    expect(buildUserTravelMetadataUpdate('jp-tokyo', lookup)?.subtitle).toBe('Japan · Prefecture')
  })

  it('keeps unknown placeIds unmatched instead of guessing labels', () => {
    const lookup = buildCanonicalMetadataLookup()

    expect(buildTravelMetadataUpdate('legacy-unknown-place', lookup)).toBeNull()
    expect(buildSmokeMetadataUpdate('legacy-unknown-place', lookup)).toBeNull()
    expect(buildUserTravelMetadataUpdate('legacy-unknown-place', lookup)).toBeNull()
  })
})
