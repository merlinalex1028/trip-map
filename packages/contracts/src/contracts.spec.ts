import { describe, expect, expectTypeOf, it } from 'vitest'

import type {
  CanonicalPlaceRef,
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
    })

    expectTypeOf<PlaceKind>().toEqualTypeOf<'CN_CITY' | 'OVERSEAS_ADMIN1'>()
    expectTypeOf<CanonicalPlaceRef>().toMatchTypeOf<{
      placeId: string
      boundaryId: string
      placeKind: 'CN_CITY' | 'OVERSEAS_ADMIN1'
      datasetVersion: string
    }>()
    expectTypeOf<SmokeRecordCreateRequest>().toMatchTypeOf<{
      placeId: string
      boundaryId: string
      placeKind: 'CN_CITY' | 'OVERSEAS_ADMIN1'
      datasetVersion: string
      displayName: string
      note?: string
    }>()
    expectTypeOf<SmokeRecordResponse>().toMatchTypeOf<{
      id: string
      createdAt: string
      updatedAt: string
      placeId: string
      boundaryId: string
      placeKind: 'CN_CITY' | 'OVERSEAS_ADMIN1'
      datasetVersion: string
      displayName: string
      note?: string
    }>()
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
    ])
    expect(keys).toHaveLength(5)
  })

  it('stays framework-free and only exports thin contract shapes', () => {
    expect(typeof PHASE11_CONTRACTS_VERSION).toBe('string')
    expect(PHASE11_SMOKE_RECORD_REQUEST.placeKind).toBe('OVERSEAS_ADMIN1')
  })
})
