<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, shallowRef, useTemplateRef } from 'vue'

import worldMapUrl from '../assets/world-map.svg'
import { loadPreviewPoints } from '../data/preview-points'
import {
  clampNormalizedPoint,
  formatCoordinatesLabel,
  geoCoordinatesToNormalizedPoint,
  normalizedPointToGeoCoordinates
} from '../services/map-projection'
import { useMapUiStore } from '../stores/map-ui'
import type { MapPointDisplay } from '../types/map-point'
import SeedMarkerLayer from './SeedMarkerLayer.vue'

const previewPoints = shallowRef<MapPointDisplay[]>(loadPreviewPoints())
const surfaceRef = useTemplateRef<HTMLDivElement>('surface')
const mapUiStore = useMapUiStore()
const { selectedPoint, selectedPointId, pendingGeoHit, isRecognizing } = storeToRefs(mapUiStore)
const {
  clearInteractionNotice,
  clearPendingGeoHit,
  clearSelection,
  finishRecognition,
  selectPoint,
  setInteractionNotice,
  setPendingGeoHit,
  startRecognition
} = mapUiStore

const displayPoints = computed(() => {
  if (selectedPoint.value?.source === 'detected') {
    return [...previewPoints.value, selectedPoint.value]
  }

  return previewPoints.value
})

let recognitionSequence = 0
let geoLookupModulePromise: Promise<typeof import('../services/geo-lookup')> | null = null

function isMarkerClick(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest('.seed-marker__button'))
}

function loadGeoLookupModule() {
  geoLookupModulePromise ??= import('../services/geo-lookup')

  return geoLookupModulePromise
}

function nextAnimationFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })
}

async function handleMapClick(event: MouseEvent) {
  if (isMarkerClick(event.target) || !surfaceRef.value) {
    return
  }

  const bounds = surfaceRef.value.getBoundingClientRect()
  const normalizedPoint = clampNormalizedPoint({
    x: (event.clientX - bounds.left) / bounds.width,
    y: (event.clientY - bounds.top) / bounds.height
  })
  const geo = normalizedPointToGeoCoordinates(normalizedPoint)
  const activeSequence = ++recognitionSequence

  setPendingGeoHit({
    ...normalizedPoint,
    ...geo
  })
  startRecognition()
  await nextAnimationFrame()

  if (activeSequence !== recognitionSequence) {
    return
  }

  try {
    const { isLowConfidenceBoundaryHit, lookupCountryRegionByCoordinates } = await loadGeoLookupModule()
    const detectionResult = lookupCountryRegionByCoordinates(geo)

    if (!detectionResult) {
      clearPendingGeoHit()
      finishRecognition()
      clearSelection()
      setInteractionNotice({
        tone: 'warning',
        message: '请点击有效陆地区域'
      })
      return
    }

    if (isLowConfidenceBoundaryHit(geo, detectionResult)) {
      clearPendingGeoHit()
      finishRecognition()
      clearSelection()
      setInteractionNotice({
        tone: 'info',
        message: '请点击更靠近目标区域的位置'
      })
      return
    }

    const detectedPoint = geoCoordinatesToNormalizedPoint({
      lat: detectionResult.lat,
      lng: detectionResult.lng
    })

    selectPoint({
      id: `detected-${detectionResult.countryCode}-${Math.round(detectionResult.lat * 100)}-${Math.round(
        detectionResult.lng * 100
      )}`,
      name: detectionResult.displayName,
      countryName: detectionResult.displayName,
      countryCode: detectionResult.countryCode,
      lat: detectionResult.lat,
      lng: detectionResult.lng,
      x: detectedPoint.x,
      y: detectedPoint.y,
      source: 'detected',
      isFeatured: false,
      coordinatesLabel: formatCoordinatesLabel(detectionResult),
      description: '识别成功，下一阶段可补充地点内容。'
    })
    clearInteractionNotice()
    finishRecognition()
    clearPendingGeoHit()
  } catch {
    clearPendingGeoHit()
    finishRecognition()
    clearSelection()
    setInteractionNotice({
      tone: 'warning',
      message: '识别数据加载失败，请稍后重试'
    })
  }
}
</script>

<template>
  <section
    class="world-map-stage"
    :class="{
      'world-map-stage--selected': Boolean(selectedPointId)
    }"
    data-region="map-stage"
    aria-label="World map stage"
  >
    <div class="world-map-stage__frame">
      <div ref="surface" class="world-map-stage__surface" @click="handleMapClick">
        <img class="world-map-stage__map" :src="worldMapUrl" alt="Vintage world map poster" />
        <SeedMarkerLayer :points="displayPoints" :selected-point-id="selectedPointId" />
        <div
          v-if="pendingGeoHit"
          class="world-map-stage__pending-hit"
          :class="{
            'world-map-stage__pending-hit--active': isRecognizing
          }"
          :style="{
            left: `${pendingGeoHit.x * 100}%`,
            top: `${pendingGeoHit.y * 100}%`
          }"
          :aria-label="`待识别坐标 ${formatCoordinatesLabel(pendingGeoHit)}`"
        >
          <span class="world-map-stage__pending-core" aria-hidden="true"></span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.world-map-stage {
  min-height: 60vh;
}

.world-map-stage__frame {
  min-height: 100%;
  padding: var(--space-lg);
  border: 1px solid var(--color-frame);
  background: color-mix(in srgb, var(--color-surface) 86%, white 14%);
  box-shadow: var(--shadow-dusty);
}

.world-map-stage__surface {
  position: relative;
  aspect-ratio: 2 / 1;
  overflow: hidden;
  border: 1px solid rgba(143, 117, 80, 0.45);
  background:
    radial-gradient(circle at 50% 35%, rgba(255, 251, 243, 0.58), transparent 44%),
    linear-gradient(180deg, rgba(244, 230, 201, 0.76), rgba(232, 212, 177, 0.88));
}

.world-map-stage--selected .world-map-stage__surface {
  border-color: rgba(200, 100, 59, 0.42);
}

.world-map-stage__map {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill;
  filter: saturate(0.78) sepia(0.14) contrast(0.96);
}

.world-map-stage__pending-hit {
  position: absolute;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.world-map-stage__pending-core {
  width: 0.95rem;
  height: 0.95rem;
  border-radius: 999px;
  border: 1px solid rgba(63, 47, 36, 0.42);
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 247, 224, 0.98), rgba(200, 100, 59, 0.92));
  box-shadow:
    0 0 0 6px rgba(200, 100, 59, 0.14),
    0 0 20px rgba(200, 100, 59, 0.24);
}

.world-map-stage__pending-hit--active .world-map-stage__pending-core {
  animation: pending-pulse 1.1s ease-out infinite;
}

@keyframes pending-pulse {
  0% {
    transform: scale(0.9);
    box-shadow:
      0 0 0 0 rgba(200, 100, 59, 0.26),
      0 0 18px rgba(200, 100, 59, 0.2);
  }

  70% {
    transform: scale(1);
    box-shadow:
      0 0 0 12px rgba(200, 100, 59, 0),
      0 0 24px rgba(200, 100, 59, 0.32);
  }

  100% {
    transform: scale(0.96);
    box-shadow:
      0 0 0 0 rgba(200, 100, 59, 0),
      0 0 14px rgba(200, 100, 59, 0.12);
  }
}

@media (min-width: 960px) {
  .world-map-stage {
    min-height: 68vh;
  }
}
</style>
