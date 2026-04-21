import { describe, expect, it } from 'vitest'

import {
  buildCanonicalMetadataLookup,
  buildSmokeMetadataUpdate,
  buildTravelMetadataUpdate,
} from '../scripts/backfill-record-metadata.ts'

describe('record metadata backfill helpers', () => {
  it('maps authoritative canonical metadata by placeId for travel and smoke records', () => {
    const lookup = buildCanonicalMetadataLookup()

    expect(buildTravelMetadataUpdate('cn-beijing', lookup)).toEqual({
      datasetVersion: '2026-04-21-geo-v3',
      displayName: '北京',
      regionSystem: 'CN',
      adminType: 'MUNICIPALITY',
      typeLabel: '直辖市',
      parentLabel: '中国',
      subtitle: '中国 · 直辖市',
    })

    expect(buildSmokeMetadataUpdate('us-california', lookup)).toEqual({
      datasetVersion: '2026-04-21-geo-v3',
      displayName: 'California',
      regionSystem: 'OVERSEAS',
      adminType: 'ADMIN1',
      typeLabel: 'State',
      parentLabel: 'United States',
      subtitle: 'United States · State',
    })

    expect(buildTravelMetadataUpdate('jp-tokyo', lookup)).toEqual({
      datasetVersion: '2026-04-21-geo-v3',
      displayName: 'Tokyo',
      regionSystem: 'OVERSEAS',
      adminType: 'ADMIN1',
      typeLabel: 'Prefecture',
      parentLabel: 'Japan',
      subtitle: 'Japan · Prefecture',
    })
  })

  it('keeps unknown placeIds unmatched instead of guessing labels', () => {
    const lookup = buildCanonicalMetadataLookup()

    expect(buildTravelMetadataUpdate('legacy-unknown-place', lookup)).toBeNull()
    expect(buildSmokeMetadataUpdate('legacy-unknown-place', lookup)).toBeNull()
  })
})
