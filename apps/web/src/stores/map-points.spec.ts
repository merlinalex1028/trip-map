import {
  PHASE12_AMBIGUOUS_RESOLVE,
  PHASE12_RESOLVED_BEIJING,
  PHASE12_RESOLVED_CALIFORNIA,
} from '@trip-map/contracts'
import { createPinia, setActivePinia } from 'pinia'

import type { TravelRecord } from '@trip-map/contracts'
import { useMapPointsStore } from './map-points'

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const fetchMock = vi.hoisted(() => vi.fn<() => Promise<TravelRecord[]>>())
const createMock = vi.hoisted(() => vi.fn<() => Promise<TravelRecord>>())
const deleteMock = vi.hoisted(() => vi.fn<() => Promise<void>>())

vi.mock('../services/api/records', () => ({
  fetchTravelRecords: fetchMock,
  createTravelRecord: createMock,
  deleteTravelRecord: deleteMock,
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRecord(place = PHASE12_RESOLVED_BEIJING): TravelRecord {
  return {
    id: `server-rec-${place.placeId}`,
    placeId: place.placeId,
    boundaryId: place.boundaryId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    displayName: place.displayName,
    subtitle: place.subtitle,
    createdAt: new Date().toISOString(),
  }
}

function makeResolvedPlace(
  place = PHASE12_RESOLVED_BEIJING,
): {
  placeId: string
  boundaryId: string
  placeKind: 'CN_ADMIN' | 'OVERSEAS_ADMIN' | 'CITY'
  datasetVersion: string
  displayName: string
  regionSystem: 'CN' | 'OVERSEAS'
  typeLabel: string | null
  parentLabel: string
  subtitle: string
} {
  return {
    placeId: place.placeId,
    boundaryId: place.boundaryId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    displayName: place.displayName,
    regionSystem: place.regionSystem,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
  }
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('map-points store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchMock.mockReset()
    fetchMock.mockResolvedValue([])
    createMock.mockReset()
    createMock.mockResolvedValue({ id: 'server-rec', placeId: '', boundaryId: '', placeKind: 'CN_ADMIN' as const, datasetVersion: '', displayName: '', subtitle: '', createdAt: new Date().toISOString() })
    deleteMock.mockReset()
    deleteMock.mockResolvedValue(undefined)
  })

  describe('bootstrapFromApi', () => {
    it('sets travelRecords from API response', async () => {
      const store = useMapPointsStore()
      const records = [makeRecord(PHASE12_RESOLVED_BEIJING), makeRecord(PHASE12_RESOLVED_CALIFORNIA)]
      fetchMock.mockResolvedValueOnce(records)

      await store.bootstrapFromApi()

      expect(store.travelRecords).toHaveLength(2)
      expect(store.travelRecords[0]?.placeId).toBe(PHASE12_RESOLVED_BEIJING.placeId)
      expect(store.travelRecords[1]?.placeId).toBe(PHASE12_RESOLVED_CALIFORNIA.placeId)
      expect(store.hasBootstrapped).toBe(true)
    })

    it('sets travelRecords to empty array on API failure', async () => {
      fetchMock.mockRejectedValueOnce(new Error('network error'))
      const store = useMapPointsStore()
      await store.bootstrapFromApi()
      expect(store.travelRecords).toHaveLength(0)
    })

    it('skips if already bootstrapped', async () => {
      const store = useMapPointsStore()
      fetchMock.mockResolvedValueOnce([makeRecord(PHASE12_RESOLVED_BEIJING)])
      await store.bootstrapFromApi()
      await store.bootstrapFromApi()
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('savedBoundaryIds', () => {
    it('derives savedBoundaryIds from travelRecords', async () => {
      const store = useMapPointsStore()
      fetchMock.mockResolvedValueOnce([makeRecord(PHASE12_RESOLVED_BEIJING)])
      await store.bootstrapFromApi()
      expect(store.savedBoundaryIds).toContain(PHASE12_RESOLVED_BEIJING.boundaryId)
    })

    it('deduplicates boundaryIds', async () => {
      fetchMock.mockResolvedValueOnce([
        makeRecord({ ...PHASE12_RESOLVED_BEIJING, placeId: 'p1', boundaryId: 'CN-11' } as typeof PHASE12_RESOLVED_BEIJING),
        makeRecord({ ...PHASE12_RESOLVED_BEIJING, placeId: 'p2', boundaryId: 'CN-11' } as typeof PHASE12_RESOLVED_BEIJING),
      ])
      const store = useMapPointsStore()
      await store.bootstrapFromApi()
      expect(store.savedBoundaryIds).toEqual(['CN-11'])
    })
  })

  describe('illuminate', () => {
    it('adds record optimistically before API returns', async () => {
      const store = useMapPointsStore()
      fetchMock.mockResolvedValueOnce([])
      await store.bootstrapFromApi()
      store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))
      const rec = store.travelRecords.find((r) => r.placeId === PHASE12_RESOLVED_BEIJING.placeId)
      expect(rec).toBeDefined()
      expect(rec?.id).toMatch(/^pending-/)
      expect(store.pendingPlaceIds.has(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
      expect(store.selectedPointId).toBe(PHASE12_RESOLVED_BEIJING.placeId)
    })

    it('replaces optimistic record with server record on success', async () => {
      const store = useMapPointsStore()
      fetchMock.mockResolvedValueOnce([])
      createMock.mockResolvedValueOnce(makeRecord(PHASE12_RESOLVED_BEIJING))
      await store.bootstrapFromApi()
      await store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))
      const rec = store.travelRecords.find((r) => r.placeId === PHASE12_RESOLVED_BEIJING.placeId)
      expect(rec?.id).toBe('server-rec-cn-admin-beijing')
      expect(store.pendingPlaceIds.has(PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
    })

    it('removes record on API failure (rollback)', async () => {
      createMock.mockRejectedValueOnce(new Error('server error'))
      const store = useMapPointsStore()
      fetchMock.mockResolvedValueOnce([])
      await store.bootstrapFromApi()
      await store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))
      expect(store.travelRecords.find((r) => r.placeId === PHASE12_RESOLVED_BEIJING.placeId)).toBeUndefined()
      expect(store.pendingPlaceIds.has(PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
      expect(store.selectedPointId).toBeNull()
    })

    it('skips API call when record already exists', async () => {
      const store = useMapPointsStore()
      const existingRecord = makeRecord(PHASE12_RESOLVED_BEIJING)
      fetchMock.mockResolvedValueOnce([existingRecord])
      await store.bootstrapFromApi()
      await store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))
      expect(createMock).not.toHaveBeenCalled()
      expect(store.selectedPointId).toBe(existingRecord.placeId)
    })
  })

  describe('unilluminate', () => {
    it('removes record optimistically before API returns', async () => {
      const store = useMapPointsStore()
      const existingRecord = makeRecord(PHASE12_RESOLVED_BEIJING)
      fetchMock.mockResolvedValueOnce([existingRecord])
      await store.bootstrapFromApi()
      expect(store.travelRecords).toHaveLength(1)
      store.unilluminate(PHASE12_RESOLVED_BEIJING.placeId)
      expect(store.travelRecords).toHaveLength(0)
      expect(store.pendingPlaceIds.has(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
    })

    it('restores record on API failure (rollback)', async () => {
      deleteMock.mockRejectedValueOnce(new Error('server error'))
      const store = useMapPointsStore()
      const existingRecord = makeRecord(PHASE12_RESOLVED_BEIJING)
      fetchMock.mockResolvedValueOnce([existingRecord])
      await store.bootstrapFromApi()
      await store.unilluminate(PHASE12_RESOLVED_BEIJING.placeId)
      expect(store.travelRecords).toHaveLength(1)
      expect(store.pendingPlaceIds.has(PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
    })

    it('does nothing if placeId not found', () => {
      const store = useMapPointsStore()
      fetchMock.mockResolvedValueOnce([])
      expect(() => store.unilluminate('non-existent')).not.toThrow()
      expect(store.travelRecords).toHaveLength(0)
    })
  })

  describe('clearActivePoint', () => {
    it('resets selection state', async () => {
      const store = useMapPointsStore()
      const existingRecord = makeRecord(PHASE12_RESOLVED_BEIJING)
      fetchMock.mockResolvedValueOnce([existingRecord])
      await store.bootstrapFromApi()
      store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))
      expect(store.selectedPointId).not.toBeNull()
      store.clearActivePoint()
      expect(store.selectedPointId).toBeNull()
      expect(store.summaryMode).toBeNull()
    })
  })

  describe('selectPointById', () => {
    it('sets summaryMode to view for saved source', async () => {
      const store = useMapPointsStore()
      const existingRecord = makeRecord(PHASE12_RESOLVED_BEIJING)
      fetchMock.mockResolvedValueOnce([existingRecord])
      await store.bootstrapFromApi()
      expect(store.travelRecords).toHaveLength(1)
      store.selectPointById(store.travelRecords[0].placeId)
      expect(store.summaryMode).toBe('view')
    })
  })

  describe('displayPoints', () => {
    it('maps travelRecords to MapPointDisplay shape with source saved', async () => {
      const store = useMapPointsStore()
      const existingRecord = makeRecord(PHASE12_RESOLVED_BEIJING)
      fetchMock.mockResolvedValueOnce([existingRecord])
      await store.bootstrapFromApi()
      const points = store.displayPoints
      const savedPoint = points.find((p) => p.placeId === PHASE12_RESOLVED_BEIJING.placeId)
      expect(savedPoint?.source).toBe('saved')
      expect(savedPoint?.placeId).toBe(PHASE12_RESOLVED_BEIJING.placeId)
      expect(savedPoint?.id).toBe(PHASE12_RESOLVED_BEIJING.placeId)
    })
  })
})
