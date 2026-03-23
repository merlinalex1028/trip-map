import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'

import type { MapPointDisplay } from '../types/map-point'

export const useMapUiStore = defineStore('map-ui', () => {
  const selectedPoint = shallowRef<MapPointDisplay | null>(null)

  const selectedPointId = computed(() => selectedPoint.value?.id ?? null)

  function selectPoint(point: MapPointDisplay) {
    selectedPoint.value = point
  }

  function clearSelection() {
    selectedPoint.value = null
  }

  return {
    selectedPoint,
    selectedPointId,
    selectPoint,
    clearSelection
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMapUiStore, import.meta.hot))
}
