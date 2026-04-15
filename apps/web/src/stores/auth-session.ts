import type {
  AuthBootstrapResponse,
  AuthUser,
  CreateTravelRecordRequest,
  LoginRequest,
  RegisterRequest,
} from '@trip-map/contracts'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { shallowRef } from 'vue'

import {
  fetchAuthBootstrap,
  loginWithPassword,
  logoutCurrentSession,
  registerWithPassword,
} from '../services/api/auth'
import { importTravelRecords } from '../services/api/records'
import { isSessionUnauthorizedApiClientError } from '../services/api/client'
import {
  clearLegacyPointStorageSnapshot,
  loadLegacyPointStorageSnapshot,
} from '../services/legacy-point-storage'
import { useMapPointsStore } from './map-points'
import { useMapUiStore } from './map-ui'

type AuthStatus = 'restoring' | 'anonymous' | 'authenticated'
type AuthMode = 'login' | 'register'

export interface PendingLocalImportDecision {
  legacyRecordCount: number
  records: CreateTravelRecordRequest[]
}

export interface LocalImportSummary {
  importedCount: number
  mergedDuplicateCount: number
  finalCount: number
}

const SESSION_EXPIRED_NOTICE =
  '账号会话已失效，请重新登录；如果你现在只想浏览地图，也可以继续停留在当前页面。'
const RESTORE_FAILED_NOTICE =
  '账号会话恢复失败，请稍后重试；如果你现在只想浏览地图，也可以继续停留在当前页面。'
const FOREGROUND_REFRESH_FAILED_NOTICE =
  '云端记录刷新失败，当前仍显示上次同步结果，请稍后重试。'

export const useAuthSessionStore = defineStore('auth-session', () => {
  const status = shallowRef<AuthStatus>('restoring')
  const currentUser = shallowRef<AuthUser | null>(null)
  const isAuthModalOpen = shallowRef(false)
  const authMode = shallowRef<AuthMode>('login')
  const isSubmitting = shallowRef(false)
  const hasRestoredOnce = shallowRef(false)
  const restorePromise = shallowRef<Promise<void> | null>(null)
  const refreshPromise = shallowRef<Promise<void> | null>(null)
  const pendingLocalImportDecision = shallowRef<PendingLocalImportDecision | null>(null)
  const localImportSummary = shallowRef<LocalImportSummary | null>(null)

  function openAuthModal(mode: AuthMode = 'login') {
    authMode.value = mode
    isAuthModalOpen.value = true
  }

  function closeAuthModal() {
    isAuthModalOpen.value = false
  }

  function stageLocalImportDecision() {
    const result = loadLegacyPointStorageSnapshot()

    if (result.status !== 'ready' || result.records.length === 0) {
      pendingLocalImportDecision.value = null
      return
    }

    pendingLocalImportDecision.value = {
      legacyRecordCount: result.records.length,
      records: result.records,
    }
  }

  function applyAnonymousSnapshot(
    options: {
      notice?: {
        tone: 'info' | 'warning'
        message: string
      }
      clearNotice?: boolean
    } = {},
  ) {
    const mapPointsStore = useMapPointsStore()
    const mapUiStore = useMapUiStore()

    mapPointsStore.resetTravelRecordsForSessionBoundary()
    currentUser.value = null
    status.value = 'anonymous'
    isSubmitting.value = false
    pendingLocalImportDecision.value = null
    localImportSummary.value = null
    closeAuthModal()

    if (options.notice) {
      mapUiStore.setInteractionNotice(options.notice)
      return
    }

    if (options.clearNotice ?? true) {
      mapUiStore.clearInteractionNotice()
    }
  }

  function applyAuthenticatedSnapshot(response: Extract<AuthBootstrapResponse, { authenticated: true }>) {
    const mapPointsStore = useMapPointsStore()
    const mapUiStore = useMapUiStore()
    const previousUser = currentUser.value
    const switchedAccount =
      previousUser !== null && previousUser.id !== response.user.id

    mapPointsStore.resetTravelRecordsForSessionBoundary()
    mapPointsStore.replaceTravelRecords(response.records)
    currentUser.value = response.user
    status.value = 'authenticated'
    isSubmitting.value = false
    localImportSummary.value = null
    closeAuthModal()
    if (switchedAccount) {
      mapUiStore.setInteractionNotice({
        tone: 'info',
        message: `已切换到 ${response.user.username}`,
      })
    } else {
      mapUiStore.clearInteractionNotice()
    }
    stageLocalImportDecision()
  }

  async function hydrateAuthenticatedSnapshot() {
    const bootstrap = await fetchAuthBootstrap()

    if (!bootstrap.authenticated) {
      throw new Error('Authenticated session did not return an authenticated bootstrap snapshot')
    }

    applyAuthenticatedSnapshot(bootstrap)
  }

  async function runAuthRequest(request: () => Promise<void>) {
    isSubmitting.value = true

    try {
      await request()
      await hydrateAuthenticatedSnapshot()
    } catch (error) {
      if (isSessionUnauthorizedApiClientError(error)) {
        handleUnauthorized()
        return
      }

      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  function restoreSession(): Promise<void> {
    if (restorePromise.value) {
      return restorePromise.value
    }

    if (hasRestoredOnce.value) {
      return Promise.resolve()
    }

    status.value = 'restoring'
    const pendingRestore = (async () => {
      try {
        const bootstrap = await fetchAuthBootstrap()

        if (!bootstrap.authenticated) {
          applyAnonymousSnapshot()
          return
        }

        applyAuthenticatedSnapshot(bootstrap)
      } catch (error) {
        if (isSessionUnauthorizedApiClientError(error)) {
          applyAnonymousSnapshot()
          return
        }

        applyAnonymousSnapshot({
          notice: {
            tone: 'warning',
            message: RESTORE_FAILED_NOTICE,
          },
        })
      } finally {
        hasRestoredOnce.value = true
        restorePromise.value = null
      }
    })()

    restorePromise.value = pendingRestore
    return pendingRestore
  }

  function refreshAuthenticatedSnapshot(): Promise<void> {
    if (refreshPromise.value) {
      return refreshPromise.value
    }

    if (status.value !== 'authenticated' || !currentUser.value) {
      return Promise.resolve()
    }

    const userId = currentUser.value.id
    const pendingRefresh = (async () => {
      try {
        const bootstrap = await fetchAuthBootstrap()

        if (!bootstrap.authenticated) {
          handleUnauthorized()
          return
        }

        if (bootstrap.user.id !== userId) {
          applyAuthenticatedSnapshot(bootstrap)
          return
        }

        const mapPointsStore = useMapPointsStore()
        mapPointsStore.replaceTravelRecords(bootstrap.records)
        currentUser.value = bootstrap.user
        status.value = 'authenticated'
      } catch (error) {
        if (isSessionUnauthorizedApiClientError(error)) {
          handleUnauthorized()
          return
        }

        useMapUiStore().setInteractionNotice({
          tone: 'warning',
          message: FOREGROUND_REFRESH_FAILED_NOTICE,
        })
      } finally {
        refreshPromise.value = null
      }
    })()

    refreshPromise.value = pendingRefresh
    return pendingRefresh
  }

  async function register(request: RegisterRequest) {
    await runAuthRequest(async () => {
      await registerWithPassword(request)
    })
  }

  async function login(request: LoginRequest) {
    await runAuthRequest(async () => {
      await loginWithPassword(request)
    })
  }

  async function logout() {
    isSubmitting.value = true

    try {
      await logoutCurrentSession()
      applyAnonymousSnapshot({
        notice: {
          tone: 'info',
          message: '已退出当前账号',
        },
      })
    } catch (error) {
      if (isSessionUnauthorizedApiClientError(error)) {
        handleUnauthorized()
        return
      }

      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  function handleUnauthorized() {
    applyAnonymousSnapshot({
      notice: {
        tone: 'warning',
        message: SESSION_EXPIRED_NOTICE,
      },
    })
  }

  function keepCloudRecordsAsSourceOfTruth() {
    clearLegacyPointStorageSnapshot()
    pendingLocalImportDecision.value = null
  }

  async function importLocalRecordsIntoAccount() {
    if (!pendingLocalImportDecision.value) {
      return
    }

    const mapPointsStore = useMapPointsStore()
    isSubmitting.value = true

    try {
      const response = await importTravelRecords({
        records: pendingLocalImportDecision.value.records,
      })

      mapPointsStore.replaceTravelRecords(response.records)
      localImportSummary.value = {
        importedCount: response.importedCount,
        mergedDuplicateCount: response.mergedDuplicateCount,
        finalCount: response.finalCount,
      }
      clearLegacyPointStorageSnapshot()
      pendingLocalImportDecision.value = null
    } catch (error) {
      if (isSessionUnauthorizedApiClientError(error)) {
        handleUnauthorized()
        return
      }

      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  function dismissLocalImportSummary() {
    localImportSummary.value = null
  }

  return {
    status,
    currentUser,
    isAuthModalOpen,
    authMode,
    isSubmitting,
    pendingLocalImportDecision,
    localImportSummary,
    restoreSession,
    refreshAuthenticatedSnapshot,
    register,
    login,
    logout,
    keepCloudRecordsAsSourceOfTruth,
    importLocalRecordsIntoAccount,
    dismissLocalImportSummary,
    openAuthModal,
    closeAuthModal,
    handleUnauthorized,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthSessionStore, import.meta.hot))
}
