import type { ResolvedCanonicalPlace, TravelRecord } from '@trip-map/contracts'
import {
  PHASE12_RESOLVED_BEIJING,
  PHASE28_RESOLVED_CALIFORNIA,
  PHASE28_RESOLVED_TOKYO,
} from '@trip-map/contracts'

import { buildTimelineEntries } from './timeline'

function makeRecord(
  place: ResolvedCanonicalPlace,
  overrides: Partial<TravelRecord> = {},
): TravelRecord {
  return {
    id: `record-${place.placeId}`,
    placeId: place.placeId,
    boundaryId: place.boundaryId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    displayName: place.displayName,
    regionSystem: place.regionSystem,
    adminType: place.adminType,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
    startDate: null,
    endDate: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('buildTimelineEntries', () => {
  it('keeps multiple visits for the same place as separate timeline entries', () => {
    const entries = buildTimelineEntries([
      makeRecord(PHASE12_RESOLVED_BEIJING, {
        id: 'beijing-visit-2',
        startDate: '2025-05-03',
        endDate: null,
        createdAt: '2025-05-04T00:00:00.000Z',
      }),
      makeRecord(PHASE12_RESOLVED_BEIJING, {
        id: 'beijing-visit-1',
        startDate: '2025-01-10',
        endDate: null,
        createdAt: '2025-01-11T00:00:00.000Z',
      }),
    ])

    expect(entries).toHaveLength(2)
    expect(entries.map((entry) => entry.recordId)).toEqual([
      'beijing-visit-1',
      'beijing-visit-2',
    ])
  })

  it('orders dated entries from earliest to latest', () => {
    const entries = buildTimelineEntries([
      makeRecord(PHASE28_RESOLVED_TOKYO, {
        id: 'tokyo-late',
        startDate: '2025-06-12',
        endDate: '2025-06-15',
        createdAt: '2025-06-16T00:00:00.000Z',
      }),
      makeRecord(PHASE12_RESOLVED_BEIJING, {
        id: 'beijing-early',
        startDate: '2025-02-01',
        endDate: '2025-02-03',
        createdAt: '2025-02-04T00:00:00.000Z',
      }),
      makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
        id: 'california-middle',
        startDate: '2025-03-20',
        endDate: null,
        createdAt: '2025-03-21T00:00:00.000Z',
      }),
    ])

    expect(entries.map((entry) => entry.recordId)).toEqual([
      'beijing-early',
      'california-middle',
      'tokyo-late',
    ])
    expect(entries.map((entry) => entry.sortDate)).toEqual([
      '2025-02-03',
      '2025-03-20',
      '2025-06-15',
    ])
  })

  it('places unknown-date entries after dated entries', () => {
    const entries = buildTimelineEntries([
      makeRecord(PHASE12_RESOLVED_BEIJING, {
        id: 'beijing-unknown-2',
        startDate: null,
        endDate: null,
        createdAt: '2025-01-03T00:00:00.000Z',
      }),
      makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
        id: 'california-dated',
        startDate: '2025-01-01',
        endDate: null,
        createdAt: '2025-01-05T00:00:00.000Z',
      }),
      makeRecord(PHASE28_RESOLVED_TOKYO, {
        id: 'tokyo-unknown-1',
        startDate: null,
        endDate: null,
        createdAt: '2025-01-02T00:00:00.000Z',
      }),
    ])

    expect(entries.map((entry) => entry.recordId)).toEqual([
      'california-dated',
      'tokyo-unknown-1',
      'beijing-unknown-2',
    ])
    expect(entries.map((entry) => entry.hasKnownDate)).toEqual([true, false, false])
    expect(entries.slice(1).map((entry) => entry.sortDate)).toEqual([null, null])
  })

  it('assigns visitOrdinal and visitCount per place', () => {
    const entries = buildTimelineEntries([
      makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
        id: 'california-visit-1',
        startDate: '2025-04-10',
        endDate: null,
        createdAt: '2025-04-11T00:00:00.000Z',
      }),
      makeRecord(PHASE12_RESOLVED_BEIJING, {
        id: 'beijing-visit-1',
        startDate: '2025-01-01',
        endDate: null,
        createdAt: '2025-01-02T00:00:00.000Z',
      }),
      makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
        id: 'california-visit-2',
        startDate: '2025-08-20',
        endDate: null,
        createdAt: '2025-08-21T00:00:00.000Z',
      }),
    ])

    expect(entries).toEqual([
      expect.objectContaining({
        recordId: 'beijing-visit-1',
        visitOrdinal: 1,
        visitCount: 1,
      }),
      expect.objectContaining({
        recordId: 'california-visit-1',
        visitOrdinal: 1,
        visitCount: 2,
      }),
      expect.objectContaining({
        recordId: 'california-visit-2',
        visitOrdinal: 2,
        visitCount: 2,
      }),
    ])
  })
})
