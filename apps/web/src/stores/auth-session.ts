import type {
  AuthBootstrapResponse,
  AuthUser,
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
import { isSessionUnauthorizedApiClientError } from '../services/api/client'
import { useMapPointsStore } from './map-points'
import { useMapUiStore } from './map-ui'

type AuthStatus = 'restoring' | 'anonymous' | 'authenticated'
type AuthMode = 'login' | 'register'

const SESSION_EXPIRED_NOTICE =
  '账号会话已失效，请重新登录；如果你现在只想浏览地图，也可以继续停留在当前页面。'
const RESTORE_FAILED_NOTICE =
  '账号会话恢复失败，请稍后重试；如果你现在只想浏览地图，也可以继续停留在当前页面。'

export const useAuthSessionStore = defineStore('auth-session', () => {
  const status = shallowRef<AuthStatus>('restoring')
  const currentUser = shallowRef<AuthUser | null>(null)
  const isAuthModalOpen = shallowRef(false)
  const authMode = shallowRef<AuthMode>('login')
  const isSubmitting = shallowRef(false)
  const hasRestoredOnce = shallowRef(false)
  const restorePromise = shallowRef<Promise<void> | null>(null)

  function openAuthModal(mode: AuthMode = 'login') {
    authMode.value = mode
    isAuthModalOpen.value = true
  }

  function closeAuthModal() {
    isAuthModalOpen.value = false
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

    mapPointsStore.resetTravelRecordsForSessionBoundary()
    mapPointsStore.replaceTravelRecords(response.records)
    currentUser.value = response.user
    status.value = 'authenticated'
    isSubmitting.value = false
    closeAuthModal()
    mapUiStore.clearInteractionNotice()
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

  return {
    status,
    currentUser,
    isAuthModalOpen,
    authMode,
    isSubmitting,
    restoreSession,
    register,
    login,
    logout,
    openAuthModal,
    closeAuthModal,
    handleUnauthorized,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthSessionStore, import.meta.hot))
}
