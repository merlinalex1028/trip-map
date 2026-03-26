<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, useTemplateRef } from 'vue'

import worldMapUrl from '../assets/world-map.svg'
import {
  clampNormalizedPoint,
  formatCoordinatesLabel,
  geoCoordinatesToNormalizedPoint,
  normalizedPointToGeoCoordinates,
  normalizedPointToViewBoxPoint,
  WORLD_PROJECTION_CONFIG
} from '../services/map-projection'
import { useMapPointsStore } from '../stores/map-points'
import { useMapUiStore } from '../stores/map-ui'
import type { DraftMapPoint } from '../types/map-point'
import SeedMarkerLayer from './SeedMarkerLayer.vue'

const surfaceRef = useTemplateRef<HTMLDivElement>('surface')
const mapPointsStore = useMapPointsStore()
const mapUiStore = useMapUiStore()
const { activePoint, displayPoints, draftPoint, selectedPointId } = storeToRefs(mapPointsStore)
const { pendingGeoHit, isRecognizing } = storeToRefs(mapUiStore)
const {
  clearInteractionNotice,
  clearPendingGeoHit,
  finishRecognition,
  setInteractionNotice,
  setPendingGeoHit,
  startRecognition
} = mapUiStore
const { startPendingCitySelection } = mapPointsStore

const pendingViewBoxPoint = computed(() => {
  if (!pendingGeoHit.value) {
    return null
  }

  return normalizedPointToViewBoxPoint(pendingGeoHit.value)
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
      setInteractionNotice({
        tone: 'warning',
        message: '请点击有效陆地区域'
      })
      return
    }

    if (isLowConfidenceBoundaryHit(geo, detectionResult)) {
      clearPendingGeoHit()
      finishRecognition()
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
    const fallbackDraftPoint: DraftMapPoint = {
      id: `detected-${detectionResult.countryCode}-${Math.round(detectionResult.lat * 100)}-${Math.round(
        detectionResult.lng * 100
      )}`,
      name: detectionResult.displayName,
      countryName: detectionResult.regionName ?? detectionResult.countryName,
      countryCode: detectionResult.countryCode,
      precision: detectionResult.precision,
      cityId: null,
      cityName: null,
      cityContextLabel:
        detectionResult.cityCandidates[0]?.contextLabel ??
        (detectionResult.regionName ?? detectionResult.countryName),
      boundaryId: null,
      boundaryDatasetVersion: null,
      fallbackNotice: detectionResult.fallbackNotice,
      lat: detectionResult.lat,
      lng: detectionResult.lng,
      x: detectedPoint.x,
      y: detectedPoint.y,
      source: 'detected',
      isFeatured: false,
      coordinatesLabel: formatCoordinatesLabel(detectionResult),
      description: '识别成功，下一阶段可补充地点内容。'
    }
    const hadDraft = Boolean(draftPoint.value)

    startPendingCitySelection(fallbackDraftPoint, detectionResult.cityCandidates)

    if (hadDraft) {
      setInteractionNotice({
        tone: 'info',
        message: '当前未保存地点将被丢弃，并切换到新位置'
      })
    } else {
      clearInteractionNotice()
    }
    finishRecognition()
    clearPendingGeoHit()
  } catch {
    clearPendingGeoHit()
    finishRecognition()
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
        <img
          class="world-map-stage__map"
          :src="worldMapUrl"
          alt="Vintage world map poster"
        />
        <svg
          class="world-map-stage__overlay"
          :viewBox="`0 0 ${WORLD_PROJECTION_CONFIG.viewBoxWidth} ${WORLD_PROJECTION_CONFIG.viewBoxHeight}`"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <g
            v-if="pendingGeoHit && pendingViewBoxPoint"
            class="world-map-stage__overlay-marker world-map-stage__overlay-marker--pending"
            :class="{
              'world-map-stage__overlay-marker--active': isRecognizing
            }"
            :transform="`translate(${pendingViewBoxPoint.x} ${pendingViewBoxPoint.y})`"
            data-pending-marker="true"
          >
            <circle class="world-map-stage__overlay-ring" r="15" />
            <circle class="world-map-stage__overlay-core" r="7" />
          </g>

        </svg>
        <SeedMarkerLayer :points="displayPoints" :selected-point-id="selectedPointId" />
        <div v-if="pendingGeoHit" class="world-map-stage__sr-only" :aria-label="`待识别坐标 ${formatCoordinatesLabel(pendingGeoHit)}`"></div>
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

.world-map-stage__overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.world-map-stage__overlay-marker {
  transform-origin: center;
}

.world-map-stage__overlay-ring {
  fill: rgba(200, 100, 59, 0.15);
  stroke: rgba(255, 246, 221, 0.95);
  stroke-width: 2.5;
}

.world-map-stage__overlay-core {
  fill: rgba(200, 100, 59, 0.94);
  stroke: rgba(63, 47, 36, 0.4);
  stroke-width: 1.5;
  filter: drop-shadow(0 0 12px rgba(200, 100, 59, 0.34));
}

.world-map-stage__overlay-marker--active {
  animation: pending-pulse 1.1s ease-out infinite;
}

.world-map-stage__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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
