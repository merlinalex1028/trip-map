import { describe, expect, it, vi } from 'vitest'

const { canonicalSummaries } = vi.hoisted(() => ({
  canonicalSummaries: [
    {
      placeId: 'cn-beijing',
      boundaryId: 'datav-cn-beijing',
      placeKind: 'CN_ADMIN',
      datasetVersion: 'canonical-authoritative-2026-04-21',
      displayName: '北京',
      regionSystem: 'CN',
      adminType: 'MUNICIPALITY',
      typeLabel: '直辖市',
      parentLabel: '中国',
      subtitle: '中国 · 直辖市',
    },
    {
      placeId: 'us-california',
      boundaryId: 'ne-admin1-us-california',
      placeKind: 'OVERSEAS_ADMIN1',
      datasetVersion: 'canonical-authoritative-2026-04-21',
      displayName: 'California',
      regionSystem: 'OVERSEAS',
      adminType: 'ADMIN1',
      typeLabel: 'State',
      parentLabel: 'United States',
      subtitle: 'United States · State',
    },
    {
      placeId: 'jp-tokyo',
      boundaryId: 'ne-admin1-jp-tokyo',
      placeKind: 'OVERSEAS_ADMIN1',
      datasetVersion: 'canonical-authoritative-2026-04-21',
      displayName: 'Tokyo',
      regionSystem: 'OVERSEAS',
      adminType: 'ADMIN1',
      typeLabel: 'Prefecture',
      parentLabel: 'Japan',
      subtitle: 'Japan · Prefecture',
    },
  ],
}))

vi.mock('../src/modules/canonical-places/place-metadata-catalog.js', () => {
  const byPlaceId = new Map(canonicalSummaries.map(summary => [summary.placeId, summary]))
  const byBoundaryId = new Map(canonicalSummaries.map(summary => [summary.boundaryId, summary]))

  return {
    buildCanonicalMetadataLookup: () => ({
      byPlaceId: new Map(byPlaceId),
      byBoundaryId: new Map(byBoundaryId),
    }),
    getCanonicalPlaceSummaryById: (placeId: string) => byPlaceId.get(placeId) ?? null,
    getCanonicalPlaceSummaryByBoundaryId: (boundaryId: string) => byBoundaryId.get(boundaryId) ?? null,
  }
})

import {
  backfillRecordMetadata,
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

  it('records updateMany zero-count rows as skipped userTravel rows without losing canonical payload semantics', async () => {
    const lookup = buildCanonicalMetadataLookup()
    const updateMany = vi.fn().mockResolvedValue({ count: 0 })
    const prisma: Parameters<typeof backfillRecordMetadata>[0] = {
      travelRecord: {
        findMany: vi.fn().mockResolvedValue([]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      smokeRecord: {
        findMany: vi.fn().mockResolvedValue([]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      userTravelRecord: {
        findMany: vi.fn().mockResolvedValue([{ id: 'user-travel-row-1', placeId: 'jp-tokyo' }]),
        updateMany,
      },
    }

    const summary = await backfillRecordMetadata(prisma, lookup)

    expect(summary.matchedUserTravelRows).toBe(0)
    expect(summary.unmatchedUserTravelRows).toEqual([])
    expect(summary.skippedUserTravelRows).toEqual([
      {
        id: 'user-travel-row-1',
        placeId: 'jp-tokyo',
      },
    ])
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'user-travel-row-1' },
      data: {
        datasetVersion: 'canonical-authoritative-2026-04-21',
        displayName: 'Tokyo',
        regionSystem: 'OVERSEAS',
        adminType: 'ADMIN1',
        typeLabel: 'Prefecture',
        parentLabel: 'Japan',
        subtitle: 'Japan · Prefecture',
      },
    })
  })
})
