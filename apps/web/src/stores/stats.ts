import type { TravelStatsResponse } from '@trip-map/contracts'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { shallowRef } from 'vue'

import { isSessionUnauthorizedApiClientError } from '../services/api/client'
import { fetchStats } from '../services/api/stats'
import { useAuthSessionStore } from './auth-session'

export const useStatsStore = defineStore('stats', () => {
  const stats = shallowRef<TravelStatsResponse | null>(null)
  const isLoading = shallowRef(false)
  const error = shallowRef<string | null>(null)
  let activeRequestId = 0

  function reset() {
    activeRequestId += 1
    stats.value = null
    isLoading.value = false
    error.value = null
  }

  async function fetchStatsData() {
    const requestId = ++activeRequestId
    const authSessionStore = useAuthSessionStore()
    const boundaryVersionAtStart = authSessionStore.boundaryVersion

    isLoading.value = true
    error.value = null

    try {
      const response = await fetchStats()
      if (
        authSessionStore.boundaryVersion !== boundaryVersionAtStart
        || requestId !== activeRequestId
      ) {
        return
      }

      stats.value = response
    } catch (cause) {
      if (
        authSessionStore.boundaryVersion !== boundaryVersionAtStart
        || requestId !== activeRequestId
      ) {
        return
      }

      if (isSessionUnauthorizedApiClientError(cause)) {
        authSessionStore.handleUnauthorized()
        return
      }

      error.value = 'fetch-failed'
    } finally {
      if (requestId === activeRequestId) {
        isLoading.value = false
      }
    }
  }

  return { stats, isLoading, error, fetchStatsData, reset }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatsStore, import.meta.hot))
}
