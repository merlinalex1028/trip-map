import { describe, expect, expectTypeOf, it } from 'vitest'

import type {
  CanonicalPlaceSummary,
  CanonicalPlaceRef,
  CanonicalResolveFailedReason,
  CanonicalResolveResponse,
  GeometryLayer,
  GeometryManifestEntry,
  GeometryRef,
  GeometrySourceDataset,
  HealthStatusResponse,
  PlaceKind,
  ResolvedCanonicalPlace,
  SmokeRecordCreateRequest,
  SmokeRecordResponse,
} from './index'
import {
  PHASE11_CONTRACTS_VERSION,
  PHASE11_SMOKE_RECORD_REQUEST,
  PHASE12_AMBIGUOUS_RESOLVE,
  PHASE12_FAILED_RESOLVE,
  PHASE12_RESOLVED_BEIJING,
  PHASE12_RESOLVED_CALIFORNIA,
  PHASE12_RESOLVED_HONG_KONG,
} from './index'

describe('@trip-map/contracts', () => {
  it('exports the canonical contracts from one entrypoint', () => {
    expect(PHASE11_CONTRACTS_VERSION).toBe('phase11-v1')
    expect(PHASE11_SMOKE_RECORD_REQUEST).toEqual({
      placeId: 'phase11-demo-place',
      boundaryId: 'phase11-demo-boundary',
      placeKind: 'OVERSEAS_ADMIN1',
      datasetVersion: 'phase11-smoke-v1',
      displayName: 'Phase 11 Demo Place',
      regionSystem: 'OVERSEAS',
      adminType: 'ADMIN1',
      typeLabel: '一级行政区',
      parentLabel: 'Phase 11 Demo Country',
      subtitle: 'Phase 11 Demo Country · 一级行政区',
    })

    expectTypeOf<PlaceKind>().toEqualTypeOf<'CN_ADMIN' | 'OVERSEAS_ADMIN1'>()
    expectTypeOf<CanonicalPlaceRef>().toMatchTypeOf<{
      placeId: string
      boundaryId: string
      placeKind: 'CN_ADMIN' | 'OVERSEAS_ADMIN1'
      datasetVersion: string
    }>()
    expectTypeOf<CanonicalPlaceSummary>().toMatchTypeOf<{
      displayName: string
      regionSystem: 'CN' | 'OVERSEAS'
      adminType:
        | 'MUNICIPALITY'
        | 'SAR'
        | 'PREFECTURE_LEVEL_CITY'
        | 'AUTONOMOUS_PREFECTURE'
        | 'LEAGUE'
        | 'AREA'
        | 'ADMIN1'
      typeLabel: string
      parentLabel: string
      subtitle: string
    }>()
    expectTypeOf<SmokeRecordCreateRequest>().toMatchTypeOf<{
      placeId: string
      boundaryId: string
      placeKind: 'CN_ADMIN' | 'OVERSEAS_ADMIN1'
      datasetVersion: string
      displayName: string
      regionSystem: 'CN' | 'OVERSEAS'
      adminType:
        | 'MUNICIPALITY'
        | 'SAR'
        | 'PREFECTURE_LEVEL_CITY'
        | 'AUTONOMOUS_PREFECTURE'
        | 'LEAGUE'
        | 'AREA'
        | 'ADMIN1'
      typeLabel: string
      parentLabel: string
      subtitle: string
      note?: string
    }>()
    expectTypeOf<SmokeRecordResponse>().toMatchTypeOf<{
      id: string
      createdAt: string
      updatedAt: string
      placeId: string
      boundaryId: string
      placeKind: 'CN_ADMIN' | 'OVERSEAS_ADMIN1'
      datasetVersion: string
      displayName: string
      regionSystem: 'CN' | 'OVERSEAS'
      adminType:
        | 'MUNICIPALITY'
        | 'SAR'
        | 'PREFECTURE_LEVEL_CITY'
        | 'AUTONOMOUS_PREFECTURE'
        | 'LEAGUE'
        | 'AREA'
        | 'ADMIN1'
      typeLabel: string
      parentLabel: string
      subtitle: string
      note?: string
    }>()
    expectTypeOf<CanonicalResolveFailedReason>().toEqualTypeOf<
      | 'NO_CANONICAL_MATCH'
      | 'LOW_CONFIDENCE_BORDER'
      | 'OUTSIDE_SUPPORTED_DATA'
      | 'CANDIDATE_MISMATCH'
    >()
    expectTypeOf<CanonicalResolveResponse>().toMatchTypeOf<
      | {
          status: 'resolved'
          click: { lat: number; lng: number }
          place: CanonicalPlaceSummary
        }
      | {
          status: 'ambiguous'
          click: { lat: number; lng: number }
          prompt: string
          recommendedPlaceId: string | null
          candidates: Array<CanonicalPlaceSummary & { candidateHint: string }>
        }
      | {
          status: 'failed'
          click: { lat: number; lng: number }
          reason:
            | 'NO_CANONICAL_MATCH'
            | 'LOW_CONFIDENCE_BORDER'
            | 'OUTSIDE_SUPPORTED_DATA'
            | 'CANDIDATE_MISMATCH'
          message: string
        }
    >()
    expectTypeOf<HealthStatusResponse>().toMatchTypeOf<{
      status: 'ok'
      service: 'server'
      contractsVersion: string
      database: 'up' | 'down'
    }>()
  })

  it('uses canonical field names without legacy aliases', () => {
    const keys = Object.keys(PHASE11_SMOKE_RECORD_REQUEST)

    expect(keys).toEqual([
      'placeId',
      'boundaryId',
      'placeKind',
      'datasetVersion',
      'displayName',
      'regionSystem',
      'adminType',
      'typeLabel',
      'parentLabel',
      'subtitle',
    ])
    expect(keys).toHaveLength(10)
  })

  it('ships Phase 12 canonical fixtures with explicit admin semantics', () => {
    expect(PHASE12_RESOLVED_BEIJING.typeLabel).toBe('直辖市')
    expect(PHASE12_RESOLVED_HONG_KONG.typeLabel).toBe('特别行政区')
    expect(PHASE12_RESOLVED_CALIFORNIA.typeLabel).toBe('一级行政区')

    expectTypeOf<(typeof PHASE12_AMBIGUOUS_RESOLVE)['recommendedPlaceId']>().toEqualTypeOf<
      string | null
    >()
    expect(PHASE12_AMBIGUOUS_RESOLVE.status).toBe('ambiguous')
    expect(PHASE12_AMBIGUOUS_RESOLVE.candidates.length).toBeLessThanOrEqual(3)
    expect(
      PHASE12_AMBIGUOUS_RESOLVE.candidates.every((candidate) =>
        Object.prototype.hasOwnProperty.call(candidate, 'candidateHint'),
      ),
    ).toBe(true)

    expect(PHASE12_FAILED_RESOLVE.status).toBe('failed')
    expect(Object.keys(PHASE12_FAILED_RESOLVE)).toContain('reason')
    expect(Object.keys(PHASE12_FAILED_RESOLVE)).not.toContain('place')
    expect(Object.keys(PHASE12_FAILED_RESOLVE)).not.toContain('candidates')
  })

  it('mirrors server-authoritative canonical fixture ids and dataset versions', () => {
    expect(PHASE12_RESOLVED_BEIJING.placeId).toBe('cn-beijing')
    expect(PHASE12_RESOLVED_HONG_KONG.placeId).toBe('cn-hong-kong')
    expect(PHASE12_RESOLVED_ABA.placeId).toBe('cn-aba')
    expect(PHASE12_RESOLVED_CALIFORNIA.placeId).toBe('us-california')
    expect(PHASE12_RESOLVED_CALIFORNIA.boundaryId).toBe('ne-admin1-us-california')

    expect(PHASE12_RESOLVED_BEIJING.datasetVersion).toBe('phase12-canonical-fixture-v1')
    expect(PHASE12_RESOLVED_HONG_KONG.datasetVersion).toBe('phase12-canonical-fixture-v1')
    expect(PHASE12_RESOLVED_ABA.datasetVersion).toBe('phase12-canonical-fixture-v1')
    expect(PHASE12_RESOLVED_CALIFORNIA.datasetVersion).toBe('phase12-canonical-fixture-v1')

    expect(PHASE12_RESOLVED_CALIFORNIA.typeLabel).toBe('一级行政区')
    expect(PHASE12_RESOLVED_CALIFORNIA.subtitle).toBe('United States · 一级行政区')

    expect(PHASE12_AMBIGUOUS_RESOLVE.recommendedPlaceId).toBe('cn-beijing')
    expect(PHASE12_AMBIGUOUS_RESOLVE.candidates.map(candidate => candidate.placeId)).toEqual([
      'cn-beijing',
      'cn-tianjin',
      'cn-langfang',
    ])
    expect(
      PHASE12_AMBIGUOUS_RESOLVE.candidates.every(
        candidate => candidate.datasetVersion === 'phase12-canonical-fixture-v1',
      ),
    ).toBe(true)
  })

  it('keeps CanonicalResolveResponse aligned with the three resolve branches', () => {
    const responses: CanonicalResolveResponse[] = [
      {
        status: 'resolved',
        click: { lat: 39.9042, lng: 116.4074 },
        place: PHASE12_RESOLVED_BEIJING,
      },
      PHASE12_AMBIGUOUS_RESOLVE,
      PHASE12_FAILED_RESOLVE,
    ]

    expect(responses).toHaveLength(3)
    expect(responses.map((response) => response.status)).toEqual([
      'resolved',
      'ambiguous',
      'failed',
    ])
  })

  it('stays framework-free and only exports thin contract shapes', () => {
    expect(typeof PHASE11_CONTRACTS_VERSION).toBe('string')
    expect(PHASE11_SMOKE_RECORD_REQUEST.placeKind).toBe('OVERSEAS_ADMIN1')
  })

  it('exports Phase 13 geometry types: GeometryLayer and GeometrySourceDataset', () => {
    expectTypeOf<GeometryLayer>().toEqualTypeOf<'CN' | 'OVERSEAS'>()
    expectTypeOf<GeometrySourceDataset>().toEqualTypeOf<
      'DATAV_GEOATLAS_CN' | 'NATURAL_EARTH_ADMIN1'
    >()
  })

  it('exports Phase 13 GeometryRef with all required fields', () => {
    expectTypeOf<GeometryRef>().toMatchTypeOf<{
      boundaryId: string
      layer: 'CN' | 'OVERSEAS'
      geometryDatasetVersion: string
      assetKey: string
      renderableId: string | null
    }>()
  })

  it('exports Phase 13 GeometryManifestEntry extending GeometryRef', () => {
    expectTypeOf<GeometryManifestEntry>().toMatchTypeOf<{
      boundaryId: string
      layer: 'CN' | 'OVERSEAS'
      geometryDatasetVersion: string
      assetKey: string
      renderableId: string | null
      sourceDataset: 'DATAV_GEOATLAS_CN' | 'NATURAL_EARTH_ADMIN1'
      sourceVersion: string
      sourceFeatureId: string
    }>()
  })

  it('resolved and ambiguous branches carry geometryRef via ResolvedCanonicalPlace', () => {
    expectTypeOf<ResolvedCanonicalPlace>().toMatchTypeOf<{
      geometryRef: GeometryRef
    }>()

    expectTypeOf<CanonicalResolveResponse>().toMatchTypeOf<
      | {
          status: 'resolved'
          click: { lat: number; lng: number }
          place: ResolvedCanonicalPlace
        }
      | {
          status: 'ambiguous'
          click: { lat: number; lng: number }
          prompt: string
          recommendedPlaceId: string | null
          candidates: Array<ResolvedCanonicalPlace & { candidateHint: string }>
        }
      | {
          status: 'failed'
          click: { lat: number; lng: number }
          reason: CanonicalResolveFailedReason
          message: string
        }
    >()
  })

  it('PHASE12_RESOLVED_BEIJING fixture has correct geometryRef', () => {
    expect(PHASE12_RESOLVED_BEIJING.geometryRef.assetKey).toBe('cn/beijing.json')
    expect(PHASE12_RESOLVED_BEIJING.geometryRef.layer).toBe('CN')
    expect(PHASE12_RESOLVED_BEIJING.geometryRef.geometryDatasetVersion).toBe('2026-03-31-geo-v1')
  })

  it('PHASE12_RESOLVED_HONG_KONG fixture has correct geometryRef.assetKey', () => {
    expect(PHASE12_RESOLVED_HONG_KONG.geometryRef.assetKey).toBe('cn/hong-kong.json')
  })

  it('PHASE12_RESOLVED_CALIFORNIA fixture has correct geometryRef', () => {
    expect(PHASE12_RESOLVED_CALIFORNIA.geometryRef.assetKey).toBe('overseas/us.json')
    expect(PHASE12_RESOLVED_CALIFORNIA.geometryRef.renderableId).toBe('ne-admin1-us-california')
  })

  it('ambiguous candidates all carry geometryRef', () => {
    expect(
      PHASE12_AMBIGUOUS_RESOLVE.candidates.every((candidate) => 'geometryRef' in candidate),
    ).toBe(true)
  })
})
