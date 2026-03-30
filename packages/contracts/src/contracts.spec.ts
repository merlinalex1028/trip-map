import { describe, expect, expectTypeOf, it } from 'vitest'

import type {
  CanonicalPlaceSummary,
  CanonicalPlaceRef,
  CanonicalResolveFailedReason,
  CanonicalResolveResponse,
  HealthStatusResponse,
  PlaceKind,
  SmokeRecordCreateRequest,
  SmokeRecordResponse,
} from './index'
import {
  PHASE11_CONTRACTS_VERSION,
  PHASE11_SMOKE_RECORD_REQUEST,
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

  it('stays framework-free and only exports thin contract shapes', () => {
    expect(typeof PHASE11_CONTRACTS_VERSION).toBe('string')
    expect(PHASE11_SMOKE_RECORD_REQUEST.placeKind).toBe('OVERSEAS_ADMIN1')
  })
})
