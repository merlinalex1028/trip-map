import type { TravelRecord } from '@trip-map/contracts'
import {
  PHASE12_AMBIGUOUS_RESOLVE,
  PHASE12_RESOLVED_BEIJING,
  PHASE12_RESOLVED_CALIFORNIA,
  PHASE12_RESOLVED_HONG_KONG,
} from '@trip-map/contracts'
import { createPinia, setActivePinia } from 'pinia'

import { useMapPointsStore } from './map-points'

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const { fetchMock, createMock, deleteMock } = vi.hoisted(() => {
  return {
    fetchMock: vi.fn<() => Promise<TravelRecord[]>>(),
    createMock: vi.fn<() => Promise<TravelRecord>>(),
    deleteMock: vi.fn<() => Promise<void>>(),
  }
})

vi.mock('../services/api/records', () => {
  return {
    fetchTravelRecords: fetchMock,
    createTravelRecord: createMock,
    deleteTravelRecord: deleteMock,
  }
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRecord(
  place = PHASE12_RESOLVED_BEIJING,
): TravelRecord {
  return {
    id: `server-rec-${place.placeId}`,
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
    createdAt: new Date().toISOString(),
  }
}

function makeResolvedPlace(
  place = PHASE12_RESOLVED_BEIJING,
){
  return {
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
    deleteMock.mockReset()
    deleteMock.mockResolvedValue(undefined)
  })

  // -------------------------------------------------------------------------
  // bootstrapFromApi
  // -------------------------------------------------------------------------

  describe('bootstrapFromApi', () => {
    it('sets travelRecords from API response', async () => {
      const store = useMapPointsStore()
      const records = [
        makeRecord(PHASE12_RESOLVED_BEIJING),
        makeRecord(PHASE12_RESOLVED_CALIFORNIA),
      ]
      fetchMock.mockResolvedValueOnce(records)

      await store.bootstrapFromApi()

      expect(store.travelRecords).toHaveLength(2)
      expect(store.travelRecords[0]?.placeId).toBe(PHASE12_RESOLVED_BEIJING.placeId)
      expect(store.travelRecords[1]?.placeId).toBe(PHASE12_RESOLVED_CALIFORNIA.placeId)
      expect(store.hasBootstrapped).toBe(true)
    })

    it('sets empty array on API failure', async () => {
      fetchMock.mockRejectedValueOnce(new Error('network error'))
      const store = useMapPointsStore()

      await store.bootstrapFromApi()

      expect(store.travelRecords).toHaveLength(0)
      expect(store.hasBootstrapped).toBe(true)
    })

    it('skips if already bootstrapped', async () => {
      fetchMock.mockResolvedValueOnce([makeRecord(PHASE12_RESOLVED_BEIJING)])
      const store = useMapPointsStore()

      await store.bootstrapFromApi()
      expect(store.travelRecords).toHaveLength(1)
      await store.bootstrapFromApi()

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  // -------------------------------------------------------------------------
  // illuminate
  // -------------------------------------------------------------------------

  describe('illuminate', () => {
    it('adds record optimistically and replaces with server record on success', async () => {
      const store = useMapPointsStore()
      createMock.mockResolvedValueOnce(makeRecord(PHASE12_RESOLVED_BEIJING))

      await store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))

      expect(store.travelRecords.some(r => r.placeId === PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
      expect(store.pendingPlaceIds.has(PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          regionSystem: PHASE12_RESOLVED_BEIJING.regionSystem,
          adminType: PHASE12_RESOLVED_BEIJING.adminType,
          typeLabel: PHASE12_RESOLVED_BEIJING.typeLabel,
          parentLabel: PHASE12_RESOLVED_BEIJING.parentLabel,
          subtitle: PHASE12_RESOLVED_BEIJING.subtitle,
        }),
      )
    })

    it('adds record optimistically before await', async () => {
      let resolveCreate!: (value: TravelRecord) => void
      createMock.mockImplementation(
        () =>
          new Promise((r) => {
            resolveCreate = r
          }),
      )
      const store = useMapPointsStore()
      const promise = store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))

      expect(store.travelRecords.some(r => r.placeId === PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
      expect(store.pendingPlaceIds.has(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)

      resolveCreate(makeRecord(PHASE12_RESOLVED_BEIJING))
      await promise
    })

    it('rolls back on API failure', async () => {
      createMock.mockRejectedValueOnce(new Error('create failed'))
      const store = useMapPointsStore()

      await store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))

      expect(store.travelRecords.some((r) => r.placeId === PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
      expect(store.selectedPointId).toBeNull()
      expect(store.summaryMode).toBeNull()
    })

    it('reuses existing record without API call when already illuminated', async () => {
      fetchMock.mockResolvedValueOnce([makeRecord(PHASE12_RESOLVED_BEIJING)])
      const store = useMapPointsStore()
      await store.bootstrapFromApi()
      createMock.mockClear()

      await store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))

      expect(createMock).not.toHaveBeenCalled()
      expect(store.selectedPointId).not.toBeNull()
      expect(store.summarySurfaceState?.mode).toBe('view')
      if (!store.summarySurfaceState || store.summarySurfaceState.mode !== 'view') {
        throw new Error('Expected saved point summary surface in view mode')
      }
      expect(store.summarySurfaceState.point.typeLabel).toBe('直辖市')
      expect(store.summarySurfaceState.point.parentLabel).toBe('中国')
    })

    it('keeps canonical labels when reopening a saved Hong Kong point', async () => {
      fetchMock.mockResolvedValueOnce([makeRecord(PHASE12_RESOLVED_HONG_KONG)])
      const store = useMapPointsStore()
      await store.bootstrapFromApi()

      store.selectPointById(PHASE12_RESOLVED_HONG_KONG.placeId)

      expect(store.summarySurfaceState?.mode).toBe('view')
      if (!store.summarySurfaceState || store.summarySurfaceState.mode !== 'view') {
        throw new Error('Expected reopened summary surface in view mode')
      }
      expect(store.summarySurfaceState.point.typeLabel).toBe('特别行政区')
      expect(store.summarySurfaceState.point.parentLabel).toBe('中国')
    })
  })

  // -------------------------------------------------------------------------
  // unilluminate
  // -------------------------------------------------------------------------

  describe('unilluminate', () => {
    it('removes record optimistically before API returns', async () => {
      fetchMock.mockResolvedValueOnce([makeRecord(PHASE12_RESOLVED_BEIJING)])
      const store = useMapPointsStore()
      await store.bootstrapFromApi()

      store.unilluminate(PHASE12_RESOLVED_BEIJING.placeId)

      expect(store.travelRecords.some(r => r.placeId === PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
      expect(store.pendingPlaceIds.has(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
    })

    it('restores record on API failure', async () => {
      fetchMock.mockResolvedValueOnce([makeRecord(PHASE12_RESOLVED_BEIJING)])
      deleteMock.mockRejectedValueOnce(new Error('delete failed'))
      const store = useMapPointsStore()
      await store.bootstrapFromApi()
      const originalCount = store.travelRecords.length

      await store.unilluminate(PHASE12_RESOLVED_BEIJING.placeId)

      expect(store.travelRecords.length).toBe(originalCount)
      expect(store.travelRecords.some(r => r.placeId === PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
    })

    it('does nothing if placeId not found', async () => {
      const store = useMapPointsStore()
      await expect(store.unilluminate('non-existent')).resolves.toBeUndefined()
      expect(store.travelRecords).toHaveLength(0)
    })
  })

  // -------------------------------------------------------------------------
  // savedBoundaryIds
  // -------------------------------------------------------------------------

  describe('savedBoundaryIds', () => {
    it('derives boundaryIds from travelRecords', async () => {
      fetchMock.mockResolvedValueOnce([
        makeRecord(PHASE12_RESOLVED_BEIJING),
        makeRecord(PHASE12_RESOLVED_CALIFORNIA),
      ])
      const store = useMapPointsStore()
      await store.bootstrapFromApi()

      expect(store.savedBoundaryIds).toContain(PHASE12_RESOLVED_BEIJING.boundaryId)
      expect(store.savedBoundaryIds).toContain(PHASE12_RESOLVED_CALIFORNIA.boundaryId)
    })

    it('deduplicates boundaryIds', async () => {
      const record = makeRecord(PHASE12_RESOLVED_BEIJING)
      fetchMock.mockResolvedValueOnce([record, { ...record, id: 'duplicate-id' }])
      const store = useMapPointsStore()
      await store.bootstrapFromApi()

      expect(
        store.savedBoundaryIds.filter(id => id === PHASE12_RESOLVED_BEIJING.boundaryId),
      ).toHaveLength(1)
    })

    it('updates when illuminate adds a record', async () => {
      const store = useMapPointsStore()
      createMock.mockResolvedValueOnce(makeRecord(PHASE12_RESOLVED_BEIJING))

      expect(store.savedBoundaryIds).toEqual([])

      await store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))

      expect(store.savedBoundaryIds).toContain(PHASE12_RESOLVED_BEIJING.boundaryId)
    })
  })

  // -------------------------------------------------------------------------
  // pendingPlaceIds
  // -------------------------------------------------------------------------

  describe('pendingPlaceIds', () => {
    it('contains placeId during in-flight illuminate', async () => {
      let resolveCreate!: (value: TravelRecord) => void
      createMock.mockImplementation(
        () =>
          new Promise((r) => {
            resolveCreate = r
          }),
      )
      const store = useMapPointsStore()
      const promise = store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))

      expect(store.isPlacePending(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)

      resolveCreate(makeRecord(PHASE12_RESOLVED_BEIJING))
      await promise
      expect(store.isPlacePending(PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
    })

    it('contains placeId during in-flight unilluminate', async () => {
      fetchMock.mockResolvedValueOnce([makeRecord(PHASE12_RESOLVED_BEIJING)])
      let resolveDelete!: () => void
      deleteMock.mockImplementation(
        () =>
          new Promise((r) => {
            resolveDelete = r
          }),
      )
      const store = useMapPointsStore()
      await store.bootstrapFromApi()
      const promise = store.unilluminate(PHASE12_RESOLVED_BEIJING.placeId)

      expect(store.isPlacePending(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)

      resolveDelete()
      await promise
      expect(store.isPlacePending(PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // isPlaceIlluminated / isPlacePending
  // -------------------------------------------------------------------------

  describe('isPlaceIlluminated', () => {
    it('returns true for illuminated place', async () => {
      const store = useMapPointsStore()
      createMock.mockResolvedValueOnce(makeRecord(PHASE12_RESOLVED_BEIJING))

      expect(store.isPlaceIlluminated(PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
      await store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))
      expect(store.isPlaceIlluminated(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
    })
  })

  // -------------------------------------------------------------------------
  // clearActivePoint
  // -------------------------------------------------------------------------

  describe('clearActivePoint', () => {
    it('resets selection state', async () => {
      fetchMock.mockResolvedValueOnce([makeRecord(PHASE12_RESOLVED_BEIJING)])
      const store = useMapPointsStore()
      await store.bootstrapFromApi()
      store.selectPointById(store.travelRecords[0].placeId)

      expect(store.selectedPointId).not.toBeNull()
      expect(store.summaryMode).toBe('view')

      store.clearActivePoint()

      expect(store.selectedPointId).toBeNull()
      expect(store.summaryMode).toBeNull()
    })

    it('resets pendingCanonicalSelection when clearing active point', async () => {
      const store = useMapPointsStore()
      store.startPendingCanonicalSelection({
        draftPoint: {
          id: 'pending-click',
          name: '待确认地点',
          countryName: '待确认',
          countryCode: '__canonical__',
          precision: 'city-high',
          cityId: null,
          cityName: null,
          cityContextLabel: 'click',
          placeId: null,
          placeKind: null,
          datasetVersion: null,
          typeLabel: null,
          parentLabel: null,
          subtitle: null,
          boundaryId: null,
          boundaryDatasetVersion: null,
          fallbackNotice: 'click',
          lat: 0,
          lng: 0,
          clickLat: 0,
          clickLng: 0,
          x: 0,
          y: 0,
          source: 'detected',
          isFeatured: false,
          description: '',
          coordinatesLabel: '',
        },
        prompt: 'click',
        recommendedPlaceId: PHASE12_RESOLVED_BEIJING.placeId,
        candidates: [],
        click: { lat: 0, lng: 0 },
      })

      expect(store.summaryMode).toBe('candidate-select')
      store.clearActivePoint()
      expect(store.summaryMode).toBeNull()
      expect(store.pendingCanonicalSelection).toBeNull()
    })
  })

  // -------------------------------------------------------------------------
  // selectPointById
  // -------------------------------------------------------------------------

  describe('selectPointById', () => {
    it('sets summaryMode to view for saved source', async () => {
      fetchMock.mockResolvedValueOnce([makeRecord(PHASE12_RESOLVED_BEIJING)])
      const store = useMapPointsStore()
      await store.bootstrapFromApi()
      store.selectPointById(store.travelRecords[0].placeId)

      expect(store.summaryMode).toBe('view')
    })
  })
})
