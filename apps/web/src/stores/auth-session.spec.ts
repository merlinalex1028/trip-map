import type {
  AuthBootstrapResponse,
  AuthUser,
  CreateTravelRecordRequest,
  ImportTravelRecordsResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  TravelRecord,
} from '@trip-map/contracts'
import {
  PHASE12_RESOLVED_BEIJING,
  PHASE12_RESOLVED_CALIFORNIA,
} from '@trip-map/contracts'
import { createPinia, setActivePinia } from 'pinia'

import { ApiClientError } from '../services/api/client'
import { useMapPointsStore } from './map-points'
import { useMapUiStore } from './map-ui'
import { useAuthSessionStore } from './auth-session'

const {
  fetchBootstrapMock,
  registerMock,
  loginMock,
  logoutMock,
  importTravelRecordsMock,
  loadLegacyPointStorageSnapshotMock,
  clearLegacyPointStorageSnapshotMock,
} = vi.hoisted(() => {
  return {
    fetchBootstrapMock: vi.fn<() => Promise<AuthBootstrapResponse>>(),
    registerMock: vi.fn<() => Promise<RegisterResponse>>(),
    loginMock: vi.fn<() => Promise<LoginResponse>>(),
    logoutMock: vi.fn<() => Promise<void>>(),
    importTravelRecordsMock: vi.fn<() => Promise<ImportTravelRecordsResponse>>(),
    loadLegacyPointStorageSnapshotMock: vi.fn(),
    clearLegacyPointStorageSnapshotMock: vi.fn(),
  }
})

vi.mock('../services/api/auth', () => {
  return {
    fetchAuthBootstrap: fetchBootstrapMock,
    registerWithPassword: registerMock,
    loginWithPassword: loginMock,
    logoutCurrentSession: logoutMock,
  }
})

vi.mock('../services/api/records', () => {
  return {
    importTravelRecords: importTravelRecordsMock,
  }
})

vi.mock('../services/legacy-point-storage', () => {
  return {
    POINT_STORAGE_KEY: 'trip-map:point-state:v2',
    loadLegacyPointStorageSnapshot: loadLegacyPointStorageSnapshotMock,
    clearLegacyPointStorageSnapshot: clearLegacyPointStorageSnapshotMock,
  }
})

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'user-1',
    username: 'Alice',
    email: 'alice@example.com',
    createdAt: '2026-04-12T00:00:00.000Z',
    ...overrides,
  }
}

function makeRecord(
  place = PHASE12_RESOLVED_BEIJING,
  overrides: Partial<TravelRecord> = {},
): TravelRecord {
  const { startDate, endDate, ...rest } = overrides

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
    startDate: startDate ?? null,
    endDate: endDate ?? null,
    createdAt: '2026-04-12T00:00:00.000Z',
    ...rest,
  }
}

function makeLegacyImportRecord(
  place = PHASE12_RESOLVED_BEIJING,
  overrides: Partial<CreateTravelRecordRequest> = {},
): CreateTravelRecordRequest {
  const { startDate, endDate, ...rest } = overrides

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
    startDate: startDate ?? null,
    endDate: endDate ?? null,
    ...rest,
  }
}

describe('auth-session store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchBootstrapMock.mockReset()
    registerMock.mockReset()
    loginMock.mockReset()
    logoutMock.mockReset()
    importTravelRecordsMock.mockReset()
    loadLegacyPointStorageSnapshotMock.mockReset()
    clearLegacyPointStorageSnapshotMock.mockReset()
    loadLegacyPointStorageSnapshotMock.mockReturnValue({
      status: 'empty',
      snapshot: null,
      records: [],
    })
  })

  describe('restoreSession', () => {
    it('enters restoring, reuses one in-flight bootstrap, and hydrates authenticated records', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()
      const user = makeUser()
      const records = [
        makeRecord(PHASE12_RESOLVED_BEIJING),
        makeRecord(PHASE12_RESOLVED_CALIFORNIA),
      ]

      let resolveBootstrap!: (value: AuthBootstrapResponse) => void
      fetchBootstrapMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveBootstrap = resolve
          }),
      )

      const firstRestore = authSessionStore.restoreSession()
      const secondRestore = authSessionStore.restoreSession()

      expect(authSessionStore.status).toBe('restoring')
      expect(fetchBootstrapMock).toHaveBeenCalledTimes(1)

      resolveBootstrap({ authenticated: true, user, records })
      await Promise.all([firstRestore, secondRestore])

      expect(authSessionStore.status).toBe('authenticated')
      expect(authSessionStore.currentUser).toEqual(user)
      expect(mapPointsStore.travelRecords).toEqual(records)
    })

    it('opens a one-time import decision after authenticated bootstrap when legacy records exist', async () => {
      const authSessionStore = useAuthSessionStore()
      const user = makeUser()
      const records = [makeRecord(PHASE12_RESOLVED_BEIJING)]
      const legacyRecords = [
        makeLegacyImportRecord(PHASE12_RESOLVED_BEIJING),
        makeLegacyImportRecord(PHASE12_RESOLVED_CALIFORNIA),
      ]

      fetchBootstrapMock.mockResolvedValueOnce({ authenticated: true, user, records })
      loadLegacyPointStorageSnapshotMock.mockReturnValueOnce({
        status: 'ready',
        snapshot: {
          version: 2,
          userPoints: [],
          seedOverrides: [],
          deletedSeedIds: [],
        },
        records: legacyRecords,
      })

      await authSessionStore.restoreSession()

      expect(authSessionStore.pendingLocalImportDecision).toEqual({
        legacyRecordCount: 2,
        records: legacyRecords,
      })
    })

    it('falls back to anonymous and clears stale records when no active session exists', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()

      mapPointsStore.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])
      fetchBootstrapMock.mockResolvedValueOnce({ authenticated: false })

      await authSessionStore.restoreSession()

      expect(authSessionStore.status).toBe('anonymous')
      expect(authSessionStore.currentUser).toBeNull()
      expect(mapPointsStore.travelRecords).toEqual([])
    })

    it('drops to anonymous and raises a warning notice when restore fails', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()
      const mapUiStore = useMapUiStore()

      mapPointsStore.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING)])
      fetchBootstrapMock.mockRejectedValueOnce(new Error('connect ECONNREFUSED'))

      await authSessionStore.restoreSession()

      expect(authSessionStore.status).toBe('anonymous')
      expect(authSessionStore.currentUser).toBeNull()
      expect(mapPointsStore.travelRecords).toEqual([])
      expect(mapUiStore.interactionNotice).toMatchObject({
        tone: 'warning',
      })
    })
  })

  describe('refreshAuthenticatedSnapshot', () => {
    it('replaces records for the same user without resetting the session boundary or announcing an account switch', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()
      const mapUiStore = useMapUiStore()
      const currentUser = makeUser()
      const previousRecords = [makeRecord(PHASE12_RESOLVED_BEIJING, { id: 'record-prev' })]
      const nextRecords = [makeRecord(PHASE12_RESOLVED_CALIFORNIA, { id: 'record-next' })]
      const resetSpy = vi.spyOn(mapPointsStore, 'resetTravelRecordsForSessionBoundary')
      const applySpy = vi.spyOn(mapPointsStore, 'applyAuthoritativeTravelRecords')

      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = currentUser
      mapPointsStore.replaceTravelRecords(previousRecords)
      fetchBootstrapMock.mockResolvedValueOnce({
        authenticated: true,
        user: currentUser,
        records: nextRecords,
      })

      await authSessionStore.refreshAuthenticatedSnapshot()

      expect(fetchBootstrapMock).toHaveBeenCalledTimes(1)
      expect(resetSpy).not.toHaveBeenCalled()
      expect(applySpy).toHaveBeenLastCalledWith(nextRecords)
      expect(mapPointsStore.travelRecords).toEqual(nextRecords)
      expect(mapUiStore.interactionNotice?.message ?? '').not.toContain('已切换到')
    })

    it('keeps the current snapshot when same-user refresh fails with a non-401 error', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()
      const mapUiStore = useMapUiStore()
      const currentUser = makeUser()
      const records = [makeRecord(PHASE12_RESOLVED_BEIJING)]

      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = currentUser
      mapPointsStore.replaceTravelRecords(records)
      fetchBootstrapMock.mockRejectedValueOnce(new Error('socket hang up'))

      await authSessionStore.refreshAuthenticatedSnapshot()

      expect(authSessionStore.status).toBe('authenticated')
      expect(authSessionStore.currentUser).toEqual(currentUser)
      expect(mapPointsStore.travelRecords).toEqual(records)
      expect(mapUiStore.interactionNotice).toMatchObject({
        tone: 'warning',
        message: '云端记录刷新失败，当前仍显示上次同步结果，请稍后重试。',
      })
    })

    it('treats same-user refresh 401 as session expiry', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()
      const currentUser = makeUser()
      const records = [makeRecord(PHASE12_RESOLVED_BEIJING)]

      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = currentUser
      mapPointsStore.replaceTravelRecords(records)
      fetchBootstrapMock.mockRejectedValueOnce(
        new ApiClientError({
          status: 401,
          code: 'session-unauthorized',
          message: 'Session expired',
        }),
      )

      await authSessionStore.refreshAuthenticatedSnapshot()

      expect(authSessionStore.status).toBe('anonymous')
      expect(authSessionStore.currentUser).toBeNull()
      expect(mapPointsStore.travelRecords).toEqual([])
    })

    it('keeps same-user overlap refresh lightweight while a concurrent illuminate target is still pending', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()
      const mapUiStore = useMapUiStore()
      const currentUser = makeUser()
      const optimisticRecord = makeRecord(PHASE12_RESOLVED_BEIJING, {
        id: 'pending-cn-beijing',
      })
      const resetSpy = vi.spyOn(mapPointsStore, 'resetTravelRecordsForSessionBoundary')

      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = currentUser
      mapPointsStore.travelRecords = [optimisticRecord]
      mapPointsStore.pendingPlaceIds = new Set([PHASE12_RESOLVED_BEIJING.placeId])
      fetchBootstrapMock.mockResolvedValueOnce({
        authenticated: true,
        user: currentUser,
        records: [],
      })

      await authSessionStore.refreshAuthenticatedSnapshot()

      expect(resetSpy).not.toHaveBeenCalled()
      expect(mapPointsStore.isPlacePending(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
      expect(mapPointsStore.isPlaceIlluminated(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
      expect(mapUiStore.interactionNotice?.message ?? '').not.toContain('已切换到')
    })

    it('does not let same-user overlap refresh resurrect a concurrently unilluminated place or announce an account switch', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()
      const mapUiStore = useMapUiStore()
      const currentUser = makeUser()

      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = currentUser
      mapPointsStore.travelRecords = []
      mapPointsStore.pendingPlaceIds = new Set([PHASE12_RESOLVED_BEIJING.placeId])
      fetchBootstrapMock.mockResolvedValueOnce({
        authenticated: true,
        user: currentUser,
        records: [makeRecord(PHASE12_RESOLVED_BEIJING, { id: 'stale-refresh-record' })],
      })

      await authSessionStore.refreshAuthenticatedSnapshot()

      expect(mapPointsStore.isPlacePending(PHASE12_RESOLVED_BEIJING.placeId)).toBe(true)
      expect(mapPointsStore.isPlaceIlluminated(PHASE12_RESOLVED_BEIJING.placeId)).toBe(false)
      expect(mapUiStore.interactionNotice?.message ?? '').not.toContain('已切换到')
    })
  })

  describe('register', () => {
    it('closes submitting/auth modal state and refreshes authenticated snapshot', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()
      const user = makeUser()
      const request: RegisterRequest = {
        username: 'Alice',
        email: 'alice@example.com',
        password: 'super-secret',
      }
      const records = [makeRecord(PHASE12_RESOLVED_CALIFORNIA)]

      authSessionStore.openAuthModal('register')
      registerMock.mockResolvedValueOnce({ user })
      fetchBootstrapMock.mockResolvedValueOnce({ authenticated: true, user, records })

      const registerPromise = authSessionStore.register(request)

      expect(authSessionStore.isSubmitting).toBe(true)

      await registerPromise

      expect(registerMock).toHaveBeenCalledWith(request)
      expect(fetchBootstrapMock).toHaveBeenCalledTimes(1)
      expect(authSessionStore.isSubmitting).toBe(false)
      expect(authSessionStore.isAuthModalOpen).toBe(false)
      expect(authSessionStore.status).toBe('authenticated')
      expect(authSessionStore.currentUser).toEqual(user)
      expect(mapPointsStore.travelRecords).toEqual(records)
    })
  })

  describe('login', () => {
    it('refreshes current user and records snapshot after login succeeds', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()
      const user = makeUser({ id: 'user-2', username: 'Bob', email: 'bob@example.com' })
      const request: LoginRequest = {
        email: 'bob@example.com',
        password: 'super-secret',
      }
      const records = [makeRecord(PHASE12_RESOLVED_BEIJING, { id: 'record-bj-server' })]

      authSessionStore.openAuthModal('login')
      loginMock.mockResolvedValueOnce({ user })
      fetchBootstrapMock.mockResolvedValueOnce({ authenticated: true, user, records })

      await authSessionStore.login(request)

      expect(loginMock).toHaveBeenCalledWith(request)
      expect(authSessionStore.isSubmitting).toBe(false)
      expect(authSessionStore.isAuthModalOpen).toBe(false)
      expect(authSessionStore.status).toBe('authenticated')
      expect(authSessionStore.currentUser).toEqual(user)
      expect(mapPointsStore.travelRecords).toEqual(records)
    })

    it('resets the previous account boundary before hydrating another authenticated user and announces the switch', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()
      const mapUiStore = useMapUiStore()
      const userA = makeUser({ id: 'user-1', username: 'Alice', email: 'alice@example.com' })
      const userB = makeUser({ id: 'user-2', username: 'Bob', email: 'bob@example.com' })
      const request: LoginRequest = {
        email: 'bob@example.com',
        password: 'super-secret',
      }
      const nextRecords = [makeRecord(PHASE12_RESOLVED_CALIFORNIA, { id: 'record-california-next' })]
      const resetSpy = vi.spyOn(mapPointsStore, 'resetTravelRecordsForSessionBoundary')
      const replaceSpy = vi.spyOn(mapPointsStore, 'replaceTravelRecords')

      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = userA
      mapPointsStore.replaceTravelRecords([makeRecord(PHASE12_RESOLVED_BEIJING, { id: 'record-beijing-prev' })])
      loginMock.mockResolvedValueOnce({ user: userB })
      fetchBootstrapMock.mockResolvedValueOnce({ authenticated: true, user: userB, records: nextRecords })

      await authSessionStore.login(request)

      expect(resetSpy).toHaveBeenCalled()
      expect(replaceSpy).toHaveBeenLastCalledWith(nextRecords)
      expect(resetSpy.mock.invocationCallOrder[0]).toBeLessThan(
        replaceSpy.mock.invocationCallOrder[replaceSpy.mock.invocationCallOrder.length - 1] ?? 0,
      )
      expect(authSessionStore.currentUser).toEqual(userB)
      expect(mapPointsStore.travelRecords).toEqual(nextRecords)
      expect(mapUiStore.interactionNotice?.message).toContain('已切换到')
    })

    it('does not enter the migration gate when no legacy snapshot exists', async () => {
      const authSessionStore = useAuthSessionStore()
      const user = makeUser({ id: 'user-2', username: 'Bob', email: 'bob@example.com' })
      const request: LoginRequest = {
        email: 'bob@example.com',
        password: 'super-secret',
      }

      authSessionStore.openAuthModal('login')
      loginMock.mockResolvedValueOnce({ user })
      fetchBootstrapMock.mockResolvedValueOnce({ authenticated: true, user, records: [] })

      await authSessionStore.login(request)

      expect(authSessionStore.pendingLocalImportDecision).toBeNull()
    })

    it('imports local records through the bulk import API and replaces the authoritative snapshot', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()
      const user = makeUser({ id: 'user-2', username: 'Bob', email: 'bob@example.com' })
      const request: LoginRequest = {
        email: 'bob@example.com',
        password: 'super-secret',
      }
      const legacyRecords = [makeLegacyImportRecord(PHASE12_RESOLVED_CALIFORNIA)]
      const importedRecord = makeRecord(PHASE12_RESOLVED_CALIFORNIA, {
        id: 'server-rec-imported',
      })

      authSessionStore.openAuthModal('login')
      loginMock.mockResolvedValueOnce({ user })
      fetchBootstrapMock.mockResolvedValueOnce({ authenticated: true, user, records: [] })
      loadLegacyPointStorageSnapshotMock.mockReturnValueOnce({
        status: 'ready',
        snapshot: {
          version: 2,
          userPoints: [],
          seedOverrides: [],
          deletedSeedIds: [],
        },
        records: legacyRecords,
      })
      importTravelRecordsMock.mockResolvedValueOnce({
        importedCount: 1,
        mergedDuplicateCount: 0,
        finalCount: 1,
        records: [importedRecord],
      })

      await authSessionStore.login(request)
      await authSessionStore.importLocalRecordsIntoAccount()

      expect(importTravelRecordsMock).toHaveBeenCalledWith({
        records: legacyRecords,
      })
      expect(mapPointsStore.travelRecords).toEqual([importedRecord])
      expect(authSessionStore.pendingLocalImportDecision).toBeNull()
      expect(authSessionStore.localImportSummary).toEqual({
        importedCount: 1,
        mergedDuplicateCount: 0,
        finalCount: 1,
      })
      expect(clearLegacyPointStorageSnapshotMock).toHaveBeenCalledTimes(1)
    })

    it('clears legacy snapshot and does not reopen the gate after choosing cloud records as the source of truth', async () => {
      const authSessionStore = useAuthSessionStore()
      const user = makeUser({ id: 'user-2', username: 'Bob', email: 'bob@example.com' })
      const request: LoginRequest = {
        email: 'bob@example.com',
        password: 'super-secret',
      }

      authSessionStore.openAuthModal('login')
      loginMock.mockResolvedValueOnce({ user })
      fetchBootstrapMock.mockResolvedValueOnce({ authenticated: true, user, records: [] })
      loadLegacyPointStorageSnapshotMock.mockReturnValueOnce({
        status: 'ready',
        snapshot: {
          version: 2,
          userPoints: [],
          seedOverrides: [],
          deletedSeedIds: [],
        },
        records: [makeLegacyImportRecord(PHASE12_RESOLVED_BEIJING)],
      })

      await authSessionStore.login(request)
      authSessionStore.keepCloudRecordsAsSourceOfTruth()

      expect(authSessionStore.pendingLocalImportDecision).toBeNull()
      expect(clearLegacyPointStorageSnapshotMock).toHaveBeenCalledTimes(1)
    })

    it.each([
      ['login', () => loginMock.mockRejectedValueOnce(
        new ApiClientError({
          status: 401,
          code: 'auth-submit-unauthorized',
          message: 'Invalid email or password',
        }),
      ), (store: ReturnType<typeof useAuthSessionStore>, request: LoginRequest) => store.login(request), {
        email: 'alice@example.com',
        password: 'wrong-password',
      }],
      ['register', () => registerMock.mockRejectedValueOnce(
        new ApiClientError({
          status: 401,
          code: 'auth-submit-unauthorized',
          message: 'Invalid registration request',
        }),
      ), (store: ReturnType<typeof useAuthSessionStore>, request: RegisterRequest) => store.register(request), {
        username: 'Alice',
        email: 'alice@example.com',
        password: 'wrong-password',
      }],
    ])(
      'keeps current session boundary intact when %s receives auth-submit 401',
      async (_mode, mockFailure, runAction, request) => {
        const authSessionStore = useAuthSessionStore()
        const mapPointsStore = useMapPointsStore()
        const mapUiStore = useMapUiStore()
        const user = makeUser()
        const records = [makeRecord(PHASE12_RESOLVED_BEIJING)]

        authSessionStore.status = 'authenticated'
        authSessionStore.currentUser = user
        authSessionStore.isAuthModalOpen = true
        mapPointsStore.replaceTravelRecords(records)
        const resetSpy = vi.spyOn(mapPointsStore, 'resetTravelRecordsForSessionBoundary')

        mockFailure()

        await expect(runAction(authSessionStore, request as never)).rejects.toBeInstanceOf(ApiClientError)

        expect(fetchBootstrapMock).not.toHaveBeenCalled()
        expect(authSessionStore.status).toBe('authenticated')
        expect(authSessionStore.currentUser).toEqual(user)
        expect(authSessionStore.isAuthModalOpen).toBe(true)
        expect(authSessionStore.isSubmitting).toBe(false)
        expect(mapPointsStore.travelRecords).toEqual(records)
        expect(resetSpy).not.toHaveBeenCalled()
        expect(mapUiStore.interactionNotice).toBeNull()
      },
    )
  })

  describe('logout', () => {
    it('clears only the current device snapshot and returns to anonymous', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()
      const user = makeUser()
      const records = [makeRecord(PHASE12_RESOLVED_BEIJING)]

      fetchBootstrapMock.mockResolvedValueOnce({ authenticated: true, user, records })
      await authSessionStore.restoreSession()
      logoutMock.mockResolvedValueOnce()

      await authSessionStore.logout()

      expect(logoutMock).toHaveBeenCalledTimes(1)
      expect(authSessionStore.status).toBe('anonymous')
      expect(authSessionStore.currentUser).toBeNull()
      expect(mapPointsStore.travelRecords).toEqual([])
    })

    it('clears pending import state and import summary on logout', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()
      const user = makeUser()
      const records = [makeRecord(PHASE12_RESOLVED_BEIJING)]

      fetchBootstrapMock.mockResolvedValueOnce({ authenticated: true, user, records })
      loadLegacyPointStorageSnapshotMock.mockReturnValueOnce({
        status: 'ready',
        snapshot: {
          version: 2,
          userPoints: [],
          seedOverrides: [],
          deletedSeedIds: [],
        },
        records: [makeLegacyImportRecord(PHASE12_RESOLVED_BEIJING)],
      })
      await authSessionStore.restoreSession()
      authSessionStore.localImportSummary = {
        importedCount: 1,
        mergedDuplicateCount: 0,
        finalCount: 1,
      }
      logoutMock.mockResolvedValueOnce()

      await authSessionStore.logout()

      expect(authSessionStore.pendingLocalImportDecision).toBeNull()
      expect(authSessionStore.localImportSummary).toBeNull()
      expect(mapPointsStore.selectedPointId).toBeNull()
    })
  })

  describe('handleUnauthorized', () => {
    it('clears stale records before returning to anonymous', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()
      const mapUiStore = useMapUiStore()
      const user = makeUser()
      const records = [makeRecord(PHASE12_RESOLVED_BEIJING)]

      fetchBootstrapMock.mockResolvedValueOnce({ authenticated: true, user, records })
      await authSessionStore.restoreSession()

      authSessionStore.handleUnauthorized()

      expect(authSessionStore.status).toBe('anonymous')
      expect(authSessionStore.currentUser).toBeNull()
      expect(mapPointsStore.travelRecords).toEqual([])
      expect(authSessionStore.pendingLocalImportDecision).toBeNull()
      expect(authSessionStore.localImportSummary).toBeNull()
      expect(mapUiStore.interactionNotice).toMatchObject({
        tone: 'warning',
      })
    })

    it('treats bootstrap 401 as a real session expiry and clears the boundary', async () => {
      const authSessionStore = useAuthSessionStore()
      const mapPointsStore = useMapPointsStore()
      const user = makeUser()
      const records = [makeRecord(PHASE12_RESOLVED_BEIJING)]

      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = user
      mapPointsStore.replaceTravelRecords(records)
      fetchBootstrapMock.mockRejectedValueOnce(
        new ApiClientError({
          status: 401,
          code: 'session-unauthorized',
          message: 'Session expired',
        }),
      )

      await authSessionStore.restoreSession()

      expect(authSessionStore.status).toBe('anonymous')
      expect(authSessionStore.currentUser).toBeNull()
      expect(mapPointsStore.travelRecords).toEqual([])
    })
  })
})
