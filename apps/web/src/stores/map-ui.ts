import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'

import type { GeoCoordinates, GeoLookupStatus, NormalizedPoint } from '../types/geo'

interface PendingGeoHit extends GeoCoordinates, NormalizedPoint {}

interface MapInteractionNotice {
  tone: 'info' | 'warning'
  message: string
}

export const useMapUiStore = defineStore('map-ui', () => {
  const pendingGeoHit = shallowRef<PendingGeoHit | null>(null)
  const isRecognizing = shallowRef(false)
  const interactionNotice = shallowRef<MapInteractionNotice | null>(null)

  const recognitionStatus = computed<GeoLookupStatus>(() => {
    if (isRecognizing.value) {
      return 'resolving'
    }

    if (interactionNotice.value) {
      return 'invalid'
    }

    return 'idle'
  })

  function setPendingGeoHit(hit: PendingGeoHit) {
    pendingGeoHit.value = hit
  }

  function clearPendingGeoHit() {
    pendingGeoHit.value = null
  }

  function startRecognition() {
    isRecognizing.value = true
    interactionNotice.value = null
  }

  function finishRecognition() {
    isRecognizing.value = false
  }

  function setInteractionNotice(notice: MapInteractionNotice) {
    interactionNotice.value = notice
  }

  function clearInteractionNotice() {
    interactionNotice.value = null
  }

  return {
    pendingGeoHit,
    isRecognizing,
    interactionNotice,
    recognitionStatus,
    setPendingGeoHit,
    clearPendingGeoHit,
    startRecognition,
    finishRecognition,
    setInteractionNotice,
    clearInteractionNotice
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMapUiStore, import.meta.hot))
}
