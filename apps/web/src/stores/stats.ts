import type { TravelStatsResponse } from '@trip-map/contracts'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { shallowRef } from 'vue'

import { fetchStats } from '../services/api/stats'

export const useStatsStore = defineStore('stats', () => {
  const stats = shallowRef<TravelStatsResponse | null>(null)
  const isLoading = shallowRef(false)
  const error = shallowRef<string | null>(null)

  async function fetchStatsData() {
    isLoading.value = true
    error.value = null

    try {
      stats.value = await fetchStats()
    } catch {
      error.value = 'fetch-failed'
    } finally {
      isLoading.value = false
    }
  }

  return { stats, isLoading, error, fetchStatsData }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatsStore, import.meta.hot))
}
