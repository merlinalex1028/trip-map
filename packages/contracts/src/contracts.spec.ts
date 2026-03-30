import { describe, expect, it } from 'vitest'

import * as contracts from './index'

describe('@trip-map/contracts', () => {
  it('exports the canonical contracts from one entrypoint', () => {
    expect(contracts).toMatchObject({
      PHASE11_CONTRACTS_VERSION: 'phase11-v1',
      PHASE11_SMOKE_RECORD_REQUEST: {
        placeId: 'phase11-demo-place',
        boundaryId: 'phase11-demo-boundary',
        placeKind: 'OVERSEAS_ADMIN1',
        datasetVersion: 'phase11-smoke-v1',
        displayName: 'Phase 11 Demo Place',
      },
    })
  })

  it('uses canonical field names without legacy aliases', () => {
    const keys = Object.keys(contracts.PHASE11_SMOKE_RECORD_REQUEST)

    expect(keys).toEqual([
      'placeId',
      'boundaryId',
      'placeKind',
      'datasetVersion',
      'displayName',
    ])
    expect(keys).not.toContain('boundaryDatasetVersion')
  })

  it('stays framework-free and only exports thin contract shapes', () => {
    expect(contracts).toHaveProperty('HealthStatusResponse')
    expect(contracts).toHaveProperty('SmokeRecordCreateRequest')
    expect(contracts).toHaveProperty('SmokeRecordResponse')
    expect(contracts).toHaveProperty('CanonicalPlaceRef')
    expect(contracts).toHaveProperty('PlaceKind')
  })
})
