import type { TravelRecord } from '@trip-map/contracts'
import {
  PHASE12_AMBIGUOUS_RESOLVE,
  PHASE12_RESOLVED_BEIJING,
  PHASE12_RESOLVED_CALIFORNIA,
  PHASE12_RESOLVED_HONG_KONG,
} from '@trip-map/contracts'
import { createPinia, setActivePinia } from 'pinia'

import { ApiClientError } from '../services/api/client'
import { useAuthSessionStore } from './auth-session'
import { useMapPointsStore } from './map-points'
import { useMapUiStore } from './map-ui'

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
  overrides: Partial<TravelRecord> = {},
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
    ...overrides,
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

function makeOverseasRecord(overrides: Partial<TravelRecord> = {}): TravelRecord {
  return {
    id: 'server-rec-jp-tokyo',
    placeId: 'jp-tokyo',
    boundaryId: 'ne-admin1-jp-tokyo',
    placeKind: 'OVERSEAS_ADMIN1',
    datasetVersion: '2026-04-02-geo-v2',
    displayName: 'Tokyo (Persisted)',
    regionSystem: 'OVERSEAS',
    adminType: 'ADMIN1',
    typeLabel: '一级行政区（持久化）',
    parentLabel: 'Japan',
    subtitle: 'Persisted subtitle from record',
    createdAt: new Date().toISOString(),
    ...overrides,
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

      const bootstrapped = await store.bootstrapFromApi()

      expect(store.travelRecords).toHaveLength(0)
      expect(store.hasBootstrapped).toBe(true)
      expect(bootstrapped).toBe(false)
    })

    it('skips if already bootstrapped', async () => {
      fetchMock.mockResolvedValueOnce([makeRecord(PHASE12_RESOLVED_BEIJING)])
      const store = useMapPointsStore()

      await store.bootstrapFromApi()
      expect(store.travelRecords).toHaveLength(1)
      const bootstrapped = await store.bootstrapFromApi()

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(bootstrapped).toBe(true)
    })
  })

  // -------------------------------------------------------------------------
  // session boundary helpers
  // -------------------------------------------------------------------------

  describe('session boundary helpers', () => {
    it('replaceTravelRecords swaps the active snapshot', () => {
      const store = useMapPointsStore()
      const records = [
        makeRecord(PHASE12_RESOLVED_BEIJING),
        makeRecord(PHASE12_RESOLVED_CALIFORNIA),
      ]

      store.replaceTravelRecords(records)

      expect(store.travelRecords).toEqual(records)
      expect(store.hasBootstrapped).toBe(true)
    })

    it('resetTravelRecordsForSessionBoundary clears stale records and selection state', async () => {
      fetchMock.mockResolvedValueOnce([makeRecord(PHASE12_RESOLVED_BEIJING)])
      const store = useMapPointsStore()
      await store.bootstrapFromApi()
      store.startDraftFromDetection({
        id: 'draft-point',
        name: '北京',
        countryName: '中国',
        countryCode: 'CN',
        precision: 'city-high',
        cityId: null,
        cityName: '北京',
        cityContextLabel: '中国 · 直辖市',
        placeId: PHASE12_RESOLVED_BEIJING.placeId,
        placeKind: PHASE12_RESOLVED_BEIJING.placeKind,
        datasetVersion: PHASE12_RESOLVED_BEIJING.datasetVersion,
        regionSystem: PHASE12_RESOLVED_BEIJING.regionSystem,
        adminType: PHASE12_RESOLVED_BEIJING.adminType,
        typeLabel: PHASE12_RESOLVED_BEIJING.typeLabel,
        parentLabel: PHASE12_RESOLVED_BEIJING.parentLabel,
        subtitle: PHASE12_RESOLVED_BEIJING.subtitle,
        boundaryId: PHASE12_RESOLVED_BEIJING.boundaryId,
        boundaryDatasetVersion: PHASE12_RESOLVED_BEIJING.datasetVersion,
        fallbackNotice: null,
        x: 0,
        y: 0,
        lat: 39.9042,
        lng: 116.4074,
        clickLat: 39.9042,
        clickLng: 116.4074,
        source: 'detected',
        isFeatured: false,
        description: '',
        coordinatesLabel: '39.9042°N, 116.4074°E',
      })
      store.startPendingCanonicalSelection({
        draftPoint: {
          id: 'pending-point',
          name: 'California',
          countryName: 'United States',
          countryCode: 'US',
          precision: 'city-high',
          cityId: null,
          cityName: 'California',
          cityContextLabel: 'United States · 一级行政区',
          placeId: PHASE12_RESOLVED_CALIFORNIA.placeId,
          placeKind: PHASE12_RESOLVED_CALIFORNIA.placeKind,
          datasetVersion: PHASE12_RESOLVED_CALIFORNIA.datasetVersion,
          regionSystem: PHASE12_RESOLVED_CALIFORNIA.regionSystem,
          adminType: PHASE12_RESOLVED_CALIFORNIA.adminType,
          typeLabel: PHASE12_RESOLVED_CALIFORNIA.typeLabel,
          parentLabel: PHASE12_RESOLVED_CALIFORNIA.parentLabel,
          subtitle: PHASE12_RESOLVED_CALIFORNIA.subtitle,
          boundaryId: PHASE12_RESOLVED_CALIFORNIA.boundaryId,
          boundaryDatasetVersion: PHASE12_RESOLVED_CALIFORNIA.datasetVersion,
          fallbackNotice: null,
          x: 0,
          y: 0,
          lat: 36.7783,
          lng: -119.4179,
          clickLat: 36.7783,
          clickLng: -119.4179,
          source: 'detected',
          isFeatured: false,
          description: '',
          coordinatesLabel: '36.7783°N, 119.4179°W',
        },
        prompt: '请选择一个 canonical 地点',
        recommendedPlaceId: PHASE12_RESOLVED_CALIFORNIA.placeId,
        candidates: [],
        click: {
          lat: 36.7783,
          lng: -119.4179,
        },
      })
      store.selectPointById(PHASE12_RESOLVED_BEIJING.placeId)

      store.resetTravelRecordsForSessionBoundary()

      expect(store.travelRecords).toEqual([])
      expect(store.draftPoint).toBeNull()
      expect(store.pendingCanonicalSelection).toBeNull()
      expect(store.selectedPointId).toBeNull()
      expect(store.summaryMode).toBeNull()
      expect(store.pendingPlaceIds.size).toBe(0)
      expect(store.hasBootstrapped).toBe(true)
    })

    it('treats anonymous session reset as a bootstrapped boundary without calling /records', () => {
      const store = useMapPointsStore()

      store.resetTravelRecordsForSessionBoundary()

      expect(fetchMock).not.toHaveBeenCalled()
      expect(store.travelRecords).toEqual([])
      expect(store.hasBootstrapped).toBe(true)
    })

    it('maps overseas saved records from persisted text fields without recomputing labels from placeId', () => {
      const store = useMapPointsStore()
      const overseasRecord = makeOverseasRecord()

      store.replaceTravelRecords([overseasRecord])

      expect(store.displayPoints).toHaveLength(1)
      expect(store.displayPoints[0]).toMatchObject({
        name: overseasRecord.displayName,
        cityContextLabel: overseasRecord.subtitle,
        typeLabel: overseasRecord.typeLabel,
      })
      expect(store.displayPoints[0]?.cityContextLabel).toBe('Persisted subtitle from record')
      expect(store.displayPoints[0]?.typeLabel).toBe('一级行政区（持久化）')
    })
  })

  // -------------------------------------------------------------------------
  // illuminate
  // -------------------------------------------------------------------------

  describe('illuminate', () => {
    it('adds record optimistically and replaces with server record on success', async () => {
      const store = useMapPointsStore()
      const mapUiStore = useMapUiStore()
      const serverRecord = makeRecord(PHASE12_RESOLVED_BEIJING, {
        id: 'server-record-authoritative',
        subtitle: '北京市 · 中国',
      })
      createMock.mockResolvedValueOnce(serverRecord)

      await store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))

      expect(store.travelRecords).toEqual([serverRecord])
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
      expect(mapUiStore.interactionNotice).toMatchObject({
        tone: 'info',
        message: '已同步到当前账号。',
      })
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
      const mapUiStore = useMapUiStore()

      await store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))

      expect(store.travelRecords.some((r) => r.placeId === PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
      expect(store.selectedPointId).toBeNull()
      expect(store.summaryMode).toBeNull()
      expect(mapUiStore.interactionNotice).toMatchObject({
        tone: 'warning',
        message: '点亮失败，旅行记录暂时没有同步成功，请稍后重试。',
      })
    })

    it('keeps overlap illuminate pending state through concurrent authoritative replace and upserts the authoritative record when create resolves', async () => {
      let resolveCreate!: (value: TravelRecord) => void
      const store = useMapPointsStore()
      const authoritativeRecord = makeRecord(PHASE12_RESOLVED_BEIJING, {
        id: 'server-record-overlap',
      })

      createMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveCreate = resolve
          }),
      )

      const illuminatePromise = store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))

      expect(store.isPlacePending(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
      expect(store.isPlaceIlluminated(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)

      store.applyAuthoritativeTravelRecords([])

      expect(store.isPlacePending(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
      expect(store.isPlaceIlluminated(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)

      resolveCreate(authoritativeRecord)
      await illuminatePromise

      expect(store.travelRecords).toEqual([authoritativeRecord])
      expect(store.isPlacePending(PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
      expect(store.isPlaceIlluminated(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
    })

    it('keeps concurrent illuminate failure distinct from session expiry during overlap refresh handling', async () => {
      const authSessionStore = useAuthSessionStore()
      const store = useMapPointsStore()
      const mapUiStore = useMapUiStore()
      const handleUnauthorizedSpy = vi.spyOn(authSessionStore, 'handleUnauthorized')

      authSessionStore.currentUser = {
        id: 'user-1',
        username: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }
      createMock.mockRejectedValueOnce(new Error('create failed'))

      const illuminatePromise = store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))
      store.applyAuthoritativeTravelRecords([])
      await illuminatePromise

      expect(handleUnauthorizedSpy).not.toHaveBeenCalled()
      expect(mapUiStore.interactionNotice).toMatchObject({
        tone: 'warning',
        message: '点亮失败，旅行记录暂时没有同步成功，请稍后重试。',
      })
    })

    it('routes concurrent illuminate 401 through handleUnauthorized instead of the generic overlap failure notice', async () => {
      const authSessionStore = useAuthSessionStore()
      const store = useMapPointsStore()
      const mapUiStore = useMapUiStore()
      const handleUnauthorizedSpy = vi.spyOn(authSessionStore, 'handleUnauthorized')

      authSessionStore.currentUser = {
        id: 'user-1',
        username: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }
      createMock.mockRejectedValueOnce(
        new ApiClientError({
          status: 401,
          code: 'session-unauthorized',
          message: 'Session expired',
        }),
      )

      const illuminatePromise = store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))
      store.applyAuthoritativeTravelRecords([])
      await illuminatePromise

      expect(handleUnauthorizedSpy).toHaveBeenCalledTimes(1)
      expect(mapUiStore.interactionNotice?.message).not.toBe(
        '点亮失败，旅行记录暂时没有同步成功，请稍后重试。',
      )
    })

    it('does not write an old-session illuminate result back after the auth boundary resets', async () => {
      let resolveCreate!: (value: TravelRecord) => void
      const authSessionStore = useAuthSessionStore()
      const store = useMapPointsStore()

      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = {
        id: 'user-1',
        username: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }
      createMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveCreate = resolve
          }),
      )

      const illuminatePromise = store.illuminate(makeResolvedPlace(PHASE12_RESOLVED_BEIJING))

      authSessionStore.handleUnauthorized()
      resolveCreate(makeRecord(PHASE12_RESOLVED_BEIJING, { id: 'stale-session-record' }))
      await illuminatePromise

      expect(authSessionStore.status).toBe('anonymous')
      expect(store.travelRecords).toEqual([])
      expect(store.pendingPlaceIds.size).toBe(0)
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
      const mapUiStore = useMapUiStore()
      await store.bootstrapFromApi()
      const originalCount = store.travelRecords.length

      await store.unilluminate(PHASE12_RESOLVED_BEIJING.placeId)

      expect(store.travelRecords.length).toBe(originalCount)
      expect(store.travelRecords.some(r => r.placeId === PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
      expect(mapUiStore.interactionNotice).toMatchObject({
        tone: 'warning',
        message: '取消点亮失败，旅行记录暂时没有同步成功，请稍后重试。',
      })
    })

    it('surfaces a success notice after unilluminate completes', async () => {
      fetchMock.mockResolvedValueOnce([makeRecord(PHASE12_RESOLVED_BEIJING)])
      const store = useMapPointsStore()
      const mapUiStore = useMapUiStore()
      await store.bootstrapFromApi()

      await store.unilluminate(PHASE12_RESOLVED_BEIJING.placeId)

      expect(store.travelRecords.some((r) => r.placeId === PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
      expect(mapUiStore.interactionNotice).toMatchObject({
        tone: 'info',
        message: '已从当前账号移除。',
      })
    })

    it('keeps concurrent unilluminate converged to not illuminated when a stale authoritative replace overlaps delete', async () => {
      let resolveDelete!: () => void
      fetchMock.mockResolvedValueOnce([makeRecord(PHASE12_RESOLVED_BEIJING)])
      deleteMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveDelete = resolve
          }),
      )
      const store = useMapPointsStore()
      await store.bootstrapFromApi()

      const unilluminatePromise = store.unilluminate(PHASE12_RESOLVED_BEIJING.placeId)

      expect(store.isPlacePending(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
      expect(store.isPlaceIlluminated(PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)

      store.applyAuthoritativeTravelRecords([
        makeRecord(PHASE12_RESOLVED_BEIJING, { id: 'stale-refresh' }),
      ])

      expect(store.isPlacePending(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
      expect(store.isPlaceIlluminated(PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)

      resolveDelete()
      await unilluminatePromise

      expect(store.isPlacePending(PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
      expect(store.isPlaceIlluminated(PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
    })

    it('does not restore old-session records when unilluminate fails after the auth boundary resets', async () => {
      let rejectDelete!: (reason?: unknown) => void
      const authSessionStore = useAuthSessionStore()
      fetchMock.mockResolvedValueOnce([makeRecord(PHASE12_RESOLVED_BEIJING)])
      deleteMock.mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            rejectDelete = reject
          }),
      )
      const store = useMapPointsStore()
      await store.bootstrapFromApi()

      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = {
        id: 'user-1',
        username: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }

      const unilluminatePromise = store.unilluminate(PHASE12_RESOLVED_BEIJING.placeId)

      authSessionStore.handleUnauthorized()
      rejectDelete(new Error('delete failed after logout'))
      await unilluminatePromise

      expect(authSessionStore.status).toBe('anonymous')
      expect(store.travelRecords).toEqual([])
      expect(store.pendingPlaceIds.size).toBe(0)
    })

    it('keeps stale deletes converged to not illuminated when the server responds with idempotent success', async () => {
      fetchMock.mockResolvedValueOnce([makeRecord(PHASE12_RESOLVED_BEIJING)])
      deleteMock.mockResolvedValueOnce(undefined)
      const store = useMapPointsStore()
      await store.bootstrapFromApi()

      await store.unilluminate(PHASE12_RESOLVED_BEIJING.placeId)

      expect(store.isPlaceIlluminated(PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
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
