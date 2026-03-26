<script setup lang="ts">
import type { VirtualElement } from '@floating-ui/dom'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'

import worldMapUrl from '../assets/world-map.svg'
import { usePopupAnchoring } from '../composables/usePopupAnchoring'
import { getBoundaryById } from '../services/city-boundaries'
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
import type {
  GeoBoundaryCoordinate,
  GeoBoundaryPolygon,
  NormalizedCityBoundary,
  NormalizedPoint
} from '../types/geo'
import type { DraftMapPoint, SummarySurfaceState } from '../types/map-point'
import MobilePeekSheet from './map-popup/MobilePeekSheet.vue'
import MapContextPopup from './map-popup/MapContextPopup.vue'
import SeedMarkerLayer from './SeedMarkerLayer.vue'

interface BoundaryPathGroup {
  boundaryId: string
  paths: string[]
}

type PopupAnchorSource = 'marker' | 'pending' | 'boundary'

interface PopupAnchor {
  source: PopupAnchorSource
  reference: Element | VirtualElement
}

interface PopupComponentExpose {
  getPopupElement: () => HTMLElement | null
}

const surfaceRef = useTemplateRef<HTMLDivElement>('surface')
const popupRef = useTemplateRef<PopupComponentExpose>('popup')
const viewportWidth = shallowRef(typeof window === 'undefined' ? 1440 : window.innerWidth)
const mapPointsStore = useMapPointsStore()
const mapUiStore = useMapUiStore()
const {
  draftPoint,
  displayPoints,
  drawerMode,
  savedBoundaryIds,
  selectedBoundaryId,
  selectedPointId,
  summarySurfaceState
} =
  storeToRefs(mapPointsStore)
const { pendingGeoHit, isRecognizing } = storeToRefs(mapUiStore)
const {
  clearInteractionNotice,
  clearPendingGeoHit,
  finishRecognition,
  setInteractionNotice,
  setPendingGeoHit,
  startRecognition
} = mapUiStore
const {
  clearActivePoint,
  confirmPendingCitySelection,
  continuePendingWithFallback,
  deleteUserPoint,
  enterEditMode,
  findSavedPointByCityId,
  hideSeedPoint,
  openDrawerView,
  saveDraftAsPoint,
  startPendingCitySelection,
  toggleActivePointFeatured
} = mapPointsStore

const pendingViewBoxPoint = computed(() => {
  if (!pendingGeoHit.value) {
    return null
  }

  return normalizedPointToViewBoxPoint(pendingGeoHit.value)
})

function coordinateToPathPoint([lng, lat]: GeoBoundaryCoordinate) {
  const normalizedPoint = geoCoordinatesToNormalizedPoint({ lat, lng })
  const viewBoxPoint = normalizedPointToViewBoxPoint(normalizedPoint)

  return `${viewBoxPoint.x.toFixed(2)} ${viewBoxPoint.y.toFixed(2)}`
}

function polygonToPath(polygon: GeoBoundaryPolygon) {
  return polygon
    .map((ring) => {
      if (ring.length === 0) {
        return null
      }

      const [firstCoordinate, ...restCoordinates] = ring

      return [`M ${coordinateToPathPoint(firstCoordinate)}`, ...restCoordinates.map((coordinate) => `L ${coordinateToPathPoint(coordinate)}`), 'Z'].join(' ')
    })
    .filter((path): path is string => Boolean(path))
    .join(' ')
}

function toBoundaryPathGroup(boundary: NormalizedCityBoundary | null): BoundaryPathGroup | null {
  if (!boundary) {
    return null
  }

  return {
    boundaryId: boundary.boundaryId,
    paths: boundary.polygons.map((polygon) => polygonToPath(polygon)).filter(Boolean)
  }
}

const savedBoundaryGroups = computed(() =>
  savedBoundaryIds.value
    .map((boundaryId) => toBoundaryPathGroup(getBoundaryById(boundaryId)))
    .filter((group): group is BoundaryPathGroup => Boolean(group))
)

const selectedBoundaryGroup = computed(() =>
  toBoundaryPathGroup(selectedBoundaryId.value ? getBoundaryById(selectedBoundaryId.value) : null)
)

const hasBoundaryOverlay = computed(
  () => savedBoundaryGroups.value.length > 0 || selectedBoundaryGroup.value !== null
)

const popupFloatingElement = computed(() => popupRef.value?.getPopupElement() ?? null)

function syncViewportWidth() {
  viewportWidth.value = window.innerWidth
}

function createPointRect(point: NormalizedPoint) {
  if (!surfaceRef.value) {
    return null
  }

  const bounds = surfaceRef.value.getBoundingClientRect()
  const x = bounds.left + point.x * bounds.width
  const y = bounds.top + point.y * bounds.height

  return {
    width: 0,
    height: 0,
    top: y,
    bottom: y,
    left: x,
    right: x,
    x,
    y,
    toJSON: () => ({})
  }
}

function createVirtualAnchor(point: NormalizedPoint): VirtualElement | null {
  if (!surfaceRef.value) {
    return null
  }

  return {
    getBoundingClientRect() {
      return createPointRect(point) ?? {
        width: 0,
        height: 0,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: () => ({})
      }
    }
  }
}

function findMarkerAnchor(pointId: string) {
  if (!surfaceRef.value) {
    return null
  }

  return surfaceRef.value.querySelector<HTMLElement>(`[data-point-id="${pointId}"]`)
}

function findPendingAnchor() {
  if (!surfaceRef.value) {
    return null
  }

  return surfaceRef.value.querySelector<Element>('[data-pending-marker="true"]')
}

function getBoundaryAnchorPoint(boundaryId: string | null) {
  if (!boundaryId) {
    return null
  }

  const boundary = getBoundaryById(boundaryId)

  if (!boundary) {
    return null
  }

  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const polygon of boundary.polygons) {
    for (const ring of polygon) {
      for (const [lng, lat] of ring) {
        const point = geoCoordinatesToNormalizedPoint({ lat, lng })

        minX = Math.min(minX, point.x)
        maxX = Math.max(maxX, point.x)
        minY = Math.min(minY, point.y)
        maxY = Math.max(maxY, point.y)
      }
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minY) || !Number.isFinite(maxY)) {
    return null
  }

  return clampNormalizedPoint({
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2
  })
}

function resolvePendingPopupAnchor(surface: SummarySurfaceState) {
  const pendingAnchor = findPendingAnchor()

  if (pendingAnchor) {
    return {
      source: 'pending' as const,
      reference: pendingAnchor
    }
  }

  if (surface.mode !== 'candidate-select') {
    return null
  }

  const fallbackAnchor = createVirtualAnchor(surface.fallbackPoint)

  if (!fallbackAnchor) {
    return null
  }

  return {
    source: 'pending' as const,
    reference: fallbackAnchor
  }
}

function resolveBoundaryPopupAnchor(surface: SummarySurfaceState) {
  if (surface.mode === 'candidate-select') {
    return null
  }

  const boundaryAnchorPoint = getBoundaryAnchorPoint(surface.point.boundaryId)
  const fallbackPoint = boundaryAnchorPoint ?? {
    x: surface.point.x,
    y: surface.point.y
  }
  const boundaryAnchor = createVirtualAnchor(fallbackPoint)

  if (!boundaryAnchor) {
    return null
  }

  return {
    source: 'boundary' as const,
    reference: boundaryAnchor
  }
}

function resolvePopupAnchor(surface: SummarySurfaceState) {
  if (surface.mode !== 'candidate-select') {
    const markerAnchor = findMarkerAnchor(surface.point.id)

    if (markerAnchor) {
      return {
        source: 'marker' as const,
        reference: markerAnchor
      }
    }
  }

  return resolvePendingPopupAnchor(surface) ?? resolveBoundaryPopupAnchor(surface)
}

const popupAnchor = shallowRef<PopupAnchor | null>(null)

async function refreshPopupAnchor() {
  const surface = summarySurfaceState.value

  if (!surface || drawerMode.value !== null) {
    popupAnchor.value = null
    return
  }

  await nextTick()
  popupAnchor.value = resolvePopupAnchor(surface)
}

const isSummarySurfaceVisible = computed(
  () => Boolean(summarySurfaceState.value) && drawerMode.value === null
)

const {
  availableHeight,
  collisionState,
  floatingStyles: popupFloatingStyles
} = usePopupAnchoring({
  reference: () => popupAnchor.value?.reference ?? null,
  floating: popupFloatingElement,
  placement: 'top-start'
})

const shouldUsePeek = computed(
  () =>
    viewportWidth.value < 960 ||
    collisionState.value === 'unsafe' ||
    (availableHeight.value > 0 && availableHeight.value < 260)
)

const isDesktopPopupVisible = computed(
  () => isSummarySurfaceVisible.value && popupAnchor.value !== null && !shouldUsePeek.value
)

const isMobilePeekVisible = computed(() => isSummarySurfaceVisible.value && shouldUsePeek.value)

function handleConfirmDestructive(action: 'delete' | 'hide') {
  const surface = summarySurfaceState.value

  if (!surface || surface.mode === 'candidate-select') {
    return
  }

  if (action === 'delete' && surface.point.source === 'saved') {
    deleteUserPoint(surface.point.id)
    return
  }

  if (action === 'hide' && surface.point.source === 'seed') {
    hideSeedPoint(surface.point.id)
  }
}

watch(
  [
    () => summarySurfaceState.value?.mode,
    () =>
      summarySurfaceState.value?.mode === 'candidate-select'
        ? summarySurfaceState.value.fallbackPoint.id
        : summarySurfaceState.value?.point.id ?? null,
    () => drawerMode.value,
    () => selectedPointId.value,
    () => selectedBoundaryId.value,
    () => pendingGeoHit.value?.x ?? null,
    () => pendingGeoHit.value?.y ?? null
  ],
  () => {
    void refreshPopupAnchor()
  },
  {
    immediate: true
  }
)

onMounted(() => {
  syncViewportWidth()
  window.addEventListener('resize', syncViewportWidth)
  void refreshPopupAnchor()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncViewportWidth)
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
            v-if="hasBoundaryOverlay"
            class="world-map-stage__boundary-layer"
          >
            <g
              v-for="boundaryGroup in savedBoundaryGroups"
              :key="`saved-${boundaryGroup.boundaryId}`"
              class="world-map-stage__boundary world-map-stage__boundary--saved"
              :data-boundary-id="boundaryGroup.boundaryId"
              data-highlight-state="saved"
            >
              <path
                v-for="(path, pathIndex) in boundaryGroup.paths"
                :key="`${boundaryGroup.boundaryId}-saved-${pathIndex}`"
                class="world-map-stage__boundary-path"
                :d="path"
                fill-rule="evenodd"
              />
            </g>
            <g
              v-if="selectedBoundaryGroup"
              class="world-map-stage__boundary world-map-stage__boundary--selected"
              :data-boundary-id="selectedBoundaryGroup.boundaryId"
              data-highlight-state="selected"
            >
              <path
                v-for="(path, pathIndex) in selectedBoundaryGroup.paths"
                :key="`${selectedBoundaryGroup.boundaryId}-selected-${pathIndex}`"
                class="world-map-stage__boundary-path"
                :d="path"
                fill-rule="evenodd"
              />
            </g>
          </g>
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
        <MapContextPopup
          v-if="isDesktopPopupVisible && summarySurfaceState && popupAnchor"
          ref="popup"
          :surface="summarySurfaceState"
          :anchor-source="popupAnchor.source"
          :floating-styles="popupFloatingStyles"
          :find-saved-point-by-city-id="findSavedPointByCityId"
          @confirm-candidate="confirmPendingCitySelection"
          @continue-fallback="continuePendingWithFallback"
          @save-point="saveDraftAsPoint"
          @open-detail="openDrawerView"
          @edit-point="enterEditMode"
          @toggle-featured="toggleActivePointFeatured"
          @confirm-destructive="handleConfirmDestructive"
        />
        <MobilePeekSheet
          v-if="isMobilePeekVisible && summarySurfaceState"
          :surface="summarySurfaceState"
          :find-saved-point-by-city-id="findSavedPointByCityId"
          @close="clearActivePoint"
          @confirm-candidate="confirmPendingCitySelection"
          @continue-fallback="continuePendingWithFallback"
          @save-point="saveDraftAsPoint"
          @open-detail="openDrawerView"
          @edit-point="enterEditMode"
          @toggle-featured="toggleActivePointFeatured"
          @confirm-destructive="handleConfirmDestructive"
        />
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

.world-map-stage__boundary-layer {
  isolation: isolate;
}

.world-map-stage__boundary {
  opacity: 1;
}

.world-map-stage__boundary-path {
  vector-effect: non-scaling-stroke;
  transition:
    fill 180ms ease,
    stroke 180ms ease,
    opacity 180ms ease;
}

.world-map-stage__boundary--saved .world-map-stage__boundary-path {
  fill: rgba(111, 122, 91, 0.18);
  stroke: rgba(88, 96, 70, 0.7);
  stroke-width: 2.4;
}

.world-map-stage__boundary--selected .world-map-stage__boundary-path {
  fill: rgba(200, 100, 59, 0.28);
  stroke: rgba(200, 100, 59, 0.96);
  stroke-width: 3.2;
  filter: drop-shadow(0 0 10px rgba(200, 100, 59, 0.22));
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
