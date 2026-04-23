import type { ResolvedCanonicalPlace, TravelRecord } from '@trip-map/contracts'
import {
  PHASE12_AMBIGUOUS_RESOLVE,
  PHASE12_RESOLVED_BEIJING,
  PHASE12_RESOLVED_HONG_KONG,
  PHASE28_NEW_OVERSEAS_RECORD_FIXTURES,
  PHASE28_RESOLVED_CALIFORNIA,
  PHASE28_RESOLVED_TOKYO,
} from '@trip-map/contracts'
import { createPinia, setActivePinia } from 'pinia'

import { ApiClientError } from '../services/api/client'
import { useAuthSessionStore } from './auth-session'
import { useMapPointsStore } from './map-points'
import { useMapUiStore } from './map-ui'

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const { createMock, deleteMock } = vi.hoisted(() => {
  return {
    createMock: vi.fn<() => Promise<TravelRecord>>(),
    deleteMock: vi.fn<() => Promise<void>>(),
  }
})

vi.mock('../services/api/records', () => {
  return {
    createTravelRecord: createMock,
    deleteTravelRecord: deleteMock,
  }
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRecord(
  place: ResolvedCanonicalPlace = PHASE12_RESOLVED_BEIJING,
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
    startDate: null,
    endDate: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function makeResolvedPlace(
  place: ResolvedCanonicalPlace = PHASE12_RESOLVED_BEIJING,
) {
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
    startDate: null,
    endDate: null,
  }
}

const PHASE28_PERSISTED_TYPE_LABEL_SAMPLES = [
  'State（持久化）',
  'Prefecture（持久化）',
  'Province（持久化）',
] as const

function makeOverseasRecord(
  place: ResolvedCanonicalPlace = PHASE28_RESOLVED_TOKYO,
  overrides: Partial<TravelRecord> = {},
): TravelRecord {
  return {
    id: `server-rec-${place.placeId}`,
    placeId: place.placeId,
    boundaryId: place.boundaryId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    displayName: `${place.displayName}（持久化）`,
    regionSystem: place.regionSystem,
    adminType: place.adminType,
    typeLabel: `${place.typeLabel}（持久化）`,
    parentLabel: `${place.parentLabel}（持久化）`,
    subtitle: `${place.parentLabel}（持久化） · ${place.typeLabel}（持久化）`,
    startDate: null,
    endDate: null,
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
    createMock.mockReset()
    deleteMock.mockReset()
    deleteMock.mockResolvedValue(undefined)
  })

  // -------------------------------------------------------------------------
  // session boundary helpers
  // -------------------------------------------------------------------------

  describe('session boundary helpers', () => {
    it('replaceTravelRecords swaps the active snapshot', () => {
      const store = useMapPointsStore()
      const records = [
        makeRecord(PHASE12_RESOLVED_BEIJING),
        makeRecord(PHASE28_RESOLVED_CALIFORNIA),
      ]

      store.replaceTravelRecords(records)

      expect(store.travelRecords).toEqual(records)
      expect(store.hasBootstrapped).toBe(true)
    })

    it('resetTravelRecordsForSessionBoundary clears stale records and selection state', () => {
      const store = useMapPointsStore()
      store.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])
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
          cityContextLabel: 'United States · State',
          placeId: PHASE28_RESOLVED_CALIFORNIA.placeId,
          placeKind: PHASE28_RESOLVED_CALIFORNIA.placeKind,
          datasetVersion: PHASE28_RESOLVED_CALIFORNIA.datasetVersion,
          regionSystem: PHASE28_RESOLVED_CALIFORNIA.regionSystem,
          adminType: PHASE28_RESOLVED_CALIFORNIA.adminType,
          typeLabel: PHASE28_RESOLVED_CALIFORNIA.typeLabel,
          parentLabel: PHASE28_RESOLVED_CALIFORNIA.parentLabel,
          subtitle: PHASE28_RESOLVED_CALIFORNIA.subtitle,
          boundaryId: PHASE28_RESOLVED_CALIFORNIA.boundaryId,
          boundaryDatasetVersion: PHASE28_RESOLVED_CALIFORNIA.datasetVersion,
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
        recommendedPlaceId: PHASE28_RESOLVED_CALIFORNIA.placeId,
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

      expect(store.travelRecords).toEqual([])
      expect(store.hasBootstrapped).toBe(true)
    })

    it('documents the persisted english labels used by Phase 28 overseas fixtures', () => {
      expect(PHASE28_PERSISTED_TYPE_LABEL_SAMPLES).toEqual([
        'State（持久化）',
        'Prefecture（持久化）',
        'Province（持久化）',
      ])
    })

    it.each(PHASE28_NEW_OVERSEAS_RECORD_FIXTURES)(
      'replays persisted overseas metadata for $placeId without recomputing labels',
      (fixture) => {
        const store = useMapPointsStore()
        const overseasRecord = makeOverseasRecord(fixture)

        store.replaceTravelRecords([overseasRecord])
        store.selectPointById(overseasRecord.placeId)

        expect(store.displayPoints).toHaveLength(1)
        expect(store.displayPoints[0]).toMatchObject({
          name: overseasRecord.displayName,
          countryName: overseasRecord.parentLabel,
          cityContextLabel: overseasRecord.subtitle,
          typeLabel: overseasRecord.typeLabel,
        })
        expect(store.summarySurfaceState?.mode).toBe('view')
        if (!store.summarySurfaceState || store.summarySurfaceState.mode !== 'view') {
          throw new Error('Expected reopened summary surface in view mode')
        }
        expect(store.summarySurfaceState.point.name).toBe(overseasRecord.displayName)
        expect(store.summarySurfaceState.point.typeLabel).toBe(overseasRecord.typeLabel)
        expect(store.summarySurfaceState.point.parentLabel).toBe(overseasRecord.parentLabel)
        expect(store.summarySurfaceState.point.cityContextLabel).toBe(overseasRecord.subtitle)
      },
    )
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

    it('keeps canonical labels when reopening a saved Hong Kong point', () => {
      const store = useMapPointsStore()
      store.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_HONG_KONG)])

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
    it('removes record optimistically before API returns', () => {
      const store = useMapPointsStore()
      store.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])

      store.unilluminate(PHASE12_RESOLVED_BEIJING.placeId)

      expect(store.travelRecords.some(r => r.placeId === PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
      expect(store.pendingPlaceIds.has(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
    })

    it('restores record on API failure', async () => {
      deleteMock.mockRejectedValueOnce(new Error('delete failed'))
      const store = useMapPointsStore()
      const mapUiStore = useMapUiStore()
      store.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])
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
      const store = useMapPointsStore()
      const mapUiStore = useMapUiStore()
      store.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])

      await store.unilluminate(PHASE12_RESOLVED_BEIJING.placeId)

      expect(store.travelRecords.some((r) => r.placeId === PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
      expect(mapUiStore.interactionNotice).toMatchObject({
        tone: 'info',
        message: '已从当前账号移除。',
      })
    })

    it('keeps concurrent unilluminate converged to not illuminated when a stale authoritative replace overlaps delete', async () => {
      let resolveDelete!: () => void
      deleteMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveDelete = resolve
          }),
      )
      const store = useMapPointsStore()
      store.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])

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
      deleteMock.mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            rejectDelete = reject
          }),
      )
      const store = useMapPointsStore()
      store.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])

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
      deleteMock.mockResolvedValueOnce(undefined)
      const store = useMapPointsStore()
      store.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])

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
    it('derives boundaryIds from travelRecords', () => {
      const store = useMapPointsStore()
      store.replaceTravelRecords([
        makeRecord(PHASE12_RESOLVED_BEIJING),
        makeRecord(PHASE28_RESOLVED_CALIFORNIA),
      ])

      expect(store.savedBoundaryIds).toContain(PHASE12_RESOLVED_BEIJING.boundaryId)
      expect(store.savedBoundaryIds).toContain(PHASE28_RESOLVED_CALIFORNIA.boundaryId)
    })

    it('deduplicates boundaryIds', () => {
      const record = makeRecord(PHASE12_RESOLVED_BEIJING)
      const store = useMapPointsStore()
      store.replaceTravelRecords([record, { ...record, id: 'duplicate-id' }])

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
      let resolveDelete!: () => void
      deleteMock.mockImplementation(
        () =>
          new Promise((r) => {
            resolveDelete = r
          }),
      )
      const store = useMapPointsStore()
      store.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])
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
    it('resets selection state', () => {
      const store = useMapPointsStore()
      store.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])
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
    it('sets summaryMode to view for saved source', () => {
      const store = useMapPointsStore()
      store.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])
      store.selectPointById(store.travelRecords[0].placeId)

      expect(store.summaryMode).toBe('view')
    })
  })

  describe('multi-visit Phase 27', () => {
    it('passes startDate and endDate through illuminate to createTravelRecord', async () => {
      const store = useMapPointsStore()
      createMock.mockResolvedValueOnce(
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'server-record-with-dates',
          startDate: '2025-10-01',
          endDate: '2025-10-07',
        }),
      )

      await store.illuminate({
        ...makeResolvedPlace(PHASE12_RESOLVED_BEIJING),
        startDate: '2025-10-01',
        endDate: '2025-10-07',
      })

      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2025-10-01',
          endDate: '2025-10-07',
        }),
      )
    })

    it('allows multiple illuminate calls for the same place and keeps all travel records', async () => {
      const store = useMapPointsStore()
      createMock
        .mockResolvedValueOnce(
          makeRecord(PHASE12_RESOLVED_BEIJING, {
            id: 'server-record-beijing-1',
            startDate: '2025-10-01',
          }),
        )
        .mockResolvedValueOnce(
          makeRecord(PHASE12_RESOLVED_BEIJING, {
            id: 'server-record-beijing-2',
            startDate: '2025-11-05',
          }),
        )

      await store.illuminate({
        ...makeResolvedPlace(PHASE12_RESOLVED_BEIJING),
        startDate: '2025-10-01',
        endDate: null,
      })
      await store.illuminate({
        ...makeResolvedPlace(PHASE12_RESOLVED_BEIJING),
        startDate: '2025-11-05',
        endDate: null,
      })

      expect(
        store.travelRecords.filter((record) => record.placeId === PHASE12_RESOLVED_BEIJING.placeId),
      ).toHaveLength(2)
      expect(createMock).toHaveBeenCalledTimes(2)
    })

    it('merges authoritative travel records by record id and keeps same-place pending records', () => {
      const store = useMapPointsStore()
      store.travelRecords = [
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'pending-cn-admin-beijing-1',
          startDate: '2025-12-01',
        }),
      ]
      store.pendingPlaceIds = new Set([PHASE12_RESOLVED_BEIJING.placeId])

      store.applyAuthoritativeTravelRecords([
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'server-record-beijing-1',
          startDate: '2025-10-01',
        }),
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'server-record-beijing-2',
          startDate: '2025-11-05',
        }),
      ])

      expect(
        store.travelRecords.filter((record) => record.placeId === PHASE12_RESOLVED_BEIJING.placeId),
      ).toHaveLength(3)
    })

    it('deduplicates displayPoints by placeId and uses the latest createdAt record', () => {
      const store = useMapPointsStore()
      store.replaceTravelRecords([
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'server-record-beijing-early',
          displayName: '北京市（早）',
          createdAt: '2025-10-01T00:00:00.000Z',
          startDate: '2025-10-01',
        }),
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'server-record-beijing-late',
          displayName: '北京市（晚）',
          createdAt: '2025-11-05T00:00:00.000Z',
          startDate: '2025-11-05',
        }),
      ])

      const beijingPoints = store.displayPoints.filter(
        (point) => point.placeId === PHASE12_RESOLVED_BEIJING.placeId,
      )

      expect(beijingPoints).toHaveLength(1)
      expect(beijingPoints[0]?.name).toBe('北京市（晚）')
      expect(beijingPoints[0]?.cityName).toBe('北京市（晚）')
    })

    it('groups all trips under tripsByPlaceId for the same place', () => {
      const store = useMapPointsStore()
      store.replaceTravelRecords([
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'server-record-beijing-1',
          startDate: '2025-10-01',
        }),
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'server-record-beijing-2',
          startDate: '2025-11-05',
        }),
      ])

      expect(store.tripsByPlaceId.get(PHASE12_RESOLVED_BEIJING.placeId)).toHaveLength(2)
    })

    it('unilluminate removes all records for a place even when there are multiple visits', async () => {
      const store = useMapPointsStore()
      store.replaceTravelRecords([
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'server-record-beijing-1',
          startDate: '2025-10-01',
        }),
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'server-record-beijing-2',
          startDate: '2025-11-05',
        }),
      ])

      await store.unilluminate(PHASE12_RESOLVED_BEIJING.placeId)

      expect(
        store.travelRecords.filter((record) => record.placeId === PHASE12_RESOLVED_BEIJING.placeId),
      ).toHaveLength(0)
      expect(deleteMock).toHaveBeenCalledTimes(1)
    })

    it('rolls back only the failed optimistic record and keeps existing records for the same place', async () => {
      const store = useMapPointsStore()
      store.replaceTravelRecords([
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'server-record-existing',
          startDate: '2025-01-01',
        }),
      ])
      createMock.mockRejectedValueOnce(
        new ApiClientError({
          status: 500,
          code: 'http-error',
          message: 'boom',
        }),
      )

      await store.illuminate({
        ...makeResolvedPlace(PHASE12_RESOLVED_BEIJING),
        startDate: '2025-12-01',
        endDate: null,
      })

      expect(
        store.travelRecords.filter((record) => record.placeId === PHASE12_RESOLVED_BEIJING.placeId),
      ).toHaveLength(1)
      expect(store.travelRecords[0]?.id).toBe('server-record-existing')
    })
  })

  describe('timeline entries Phase 29', () => {
    it('keeps timelineEntries aligned with raw travelRecords and places unknown dates last', () => {
      const store = useMapPointsStore()
      store.replaceTravelRecords([
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'beijing-visit-2',
          startDate: '2025-04-12',
          endDate: null,
          createdAt: '2025-04-13T00:00:00.000Z',
        }),
        makeRecord(PHASE28_RESOLVED_TOKYO, {
          id: 'tokyo-unknown',
          startDate: null,
          endDate: null,
          createdAt: '2025-01-01T00:00:00.000Z',
        }),
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'beijing-visit-1',
          startDate: '2025-02-01',
          endDate: null,
          createdAt: '2025-02-02T00:00:00.000Z',
        }),
      ])

      expect(store.travelRecords).toHaveLength(3)
      expect(store.timelineEntries).toHaveLength(3)
      expect(store.timelineEntries.map((entry) => entry.recordId)).toEqual([
        'beijing-visit-1',
        'beijing-visit-2',
        'tokyo-unknown',
      ])
      expect(store.timelineEntries.map((entry) => entry.hasKnownDate)).toEqual([true, true, false])
      expect(store.timelineEntries[0]).toMatchObject({
        recordId: 'beijing-visit-1',
        visitOrdinal: 1,
        visitCount: 2,
      })
      expect(store.timelineEntries[1]).toMatchObject({
        recordId: 'beijing-visit-2',
        visitOrdinal: 2,
        visitCount: 2,
      })
    })
  })
})
