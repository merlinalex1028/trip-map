import type {
  AuthBootstrapResponse,
  AuthUser,
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
} = vi.hoisted(() => {
  return {
    fetchBootstrapMock: vi.fn<() => Promise<AuthBootstrapResponse>>(),
    registerMock: vi.fn<() => Promise<RegisterResponse>>(),
    loginMock: vi.fn<() => Promise<LoginResponse>>(),
    logoutMock: vi.fn<() => Promise<void>>(),
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
    createdAt: '2026-04-12T00:00:00.000Z',
    ...overrides,
  }
}

describe('auth-session store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchBootstrapMock.mockReset()
    registerMock.mockReset()
    loginMock.mockReset()
    logoutMock.mockReset()
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
