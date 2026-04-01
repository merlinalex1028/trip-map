<script setup lang="ts">
import type { VirtualElement } from '@floating-ui/dom'
import L from 'leaflet'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, shallowRef, useTemplateRef, watch } from 'vue'

import { useGeoJsonLayers } from '../composables/useGeoJsonLayers'
import { useLeafletMap } from '../composables/useLeafletMap'
import { useLeafletPopupAnchor } from '../composables/useLeafletPopupAnchor'
import { usePopupAnchoring } from '../composables/usePopupAnchoring'
import {
  confirmCanonicalPlace,
  resolveCanonicalPlace,
} from '../services/api/canonical-places'
import { loadGeometryShard } from '../services/geometry-loader'
import {
  GEOMETRY_DATASET_VERSION,
  getGeometryManifestEntry,
} from '../services/geometry-manifest'
import { formatCoordinatesLabel } from '../services/map-projection'
import { useMapPointsStore } from '../stores/map-points'
import { useMapUiStore } from '../stores/map-ui'
import type { GeoCityCandidate } from '../types/geo'
import type { DraftMapPoint } from '../types/map-point'
import MapContextPopup from './map-popup/MapContextPopup.vue'

type PopupAnchorSource = 'marker' | 'pending' | 'boundary'

interface PopupAnchor {
  source: PopupAnchorSource
  reference: Element | VirtualElement
}

interface PopupComponentExpose {
  getPopupElement: () => HTMLElement | null
}

const mapContainer = useTemplateRef<HTMLDivElement>('mapContainer')
const popupRef = useTemplateRef<PopupComponentExpose>('popup')

const mapPointsStore = useMapPointsStore()
const mapUiStore = useMapUiStore()

const {
  displayPoints,
  draftPoint,
  pendingCanonicalSelection,
  savedBoundaryIds,
  selectedBoundaryId,
  selectedPointId,
  summarySurfaceState,
  hasBootstrapped,
  travelRecords,
  pendingPlaceIds,
} = storeToRefs(mapPointsStore)

const { pendingGeoHit } = storeToRefs(mapUiStore)

const {
  clearInteractionNotice,
  clearPendingGeoHit,
  finishRecognition,
  setInteractionNotice,
  setPendingGeoHit,
  startRecognition,
} = mapUiStore

const {
  findSavedPointByCityId,
  openSavedPointForPlaceOrStartDraft,
  startPendingCanonicalSelection,
} = mapPointsStore

// --- Map initialization ---

const { map, isReady } = useLeafletMap(mapContainer)

// --- GeoJSON layers ---

const { addFeatures } = useGeoJsonLayers({
  map,
  savedBoundaryIds,
  selectedBoundaryId,
  onBoundaryClick: handleBoundaryClick,
})

// --- Popup anchor state ---

const popupLatLng = shallowRef<L.LatLng | null>(null)

const popupAnchor = shallowRef<PopupAnchor | null>(null)

const popupFloatingElement = computed(() => popupRef.value?.getPopupElement() ?? null)

// --- @floating-ui popup positioning ---

const { floatingStyles: popupFloatingStyles, updatePosition } = usePopupAnchoring({
  reference: () => popupAnchor.value?.reference ?? null,
  floating: popupFloatingElement,
  placement: 'top-start',
})

// --- Leaflet popup anchor bridge ---

const { virtualElement } = useLeafletPopupAnchor({
  map,
  latlng: popupLatLng,
  onPositionUpdate: () => {
    void updatePosition()
  },
})

// --- Popup visibility ---

const isSummarySurfaceVisible = computed(() => Boolean(summarySurfaceState.value))

const isDesktopPopupVisible = computed(
  () => isSummarySurfaceVisible.value && popupAnchor.value !== null,
)

// --- Anchor refresh ---

async function refreshPopupAnchor() {
  const surface = summarySurfaceState.value

  if (!surface) {
    popupAnchor.value = null
    return
  }

  await nextTick()

  const ve = virtualElement.value

  if (ve) {
    const source: PopupAnchorSource =
      surface.mode === 'candidate-select' ? 'pending' : 'boundary'

    popupAnchor.value = {
      source,
      reference: ve,
    }
  } else {
    popupAnchor.value = null
  }
}

watch(
  [
    () => summarySurfaceState.value?.mode,
    () =>
      summarySurfaceState.value?.mode === 'candidate-select'
        ? summarySurfaceState.value.fallbackPoint.id
        : summarySurfaceState.value?.point.id ?? null,
    () => selectedPointId.value,
    () => selectedBoundaryId.value,
    () => pendingGeoHit.value?.lat ?? null,
    () => pendingGeoHit.value?.lng ?? null,
    popupLatLng,
  ],
  () => {
    void refreshPopupAnchor()
  },
  { immediate: true },
)

onMounted(() => {
  void refreshPopupAnchor()
})

// --- Shard tracking ---

const loadedShardKeys = new Set<string>()

async function loadShardIfNeeded(boundaryId: string, layer: 'CN' | 'OVERSEAS') {
  const entry = getGeometryManifestEntry(boundaryId)

  if (!entry) {
    return
  }

  const shardKey = `${GEOMETRY_DATASET_VERSION}:${entry.assetKey}`

  if (loadedShardKeys.has(shardKey)) {
    return
  }

  loadedShardKeys.add(shardKey)

  try {
    const fc = await loadGeometryShard(GEOMETRY_DATASET_VERSION, entry.assetKey)
    addFeatures(layer, fc)
  } catch {
    // Shard load failure is non-fatal — the boundary just won't render
    loadedShardKeys.delete(shardKey)
  }
}

// --- Saved boundary preload (D-07, D-08) ---

async function preloadSavedBoundaryShards() {
  const ids = savedBoundaryIds.value

  if (ids.length === 0) {
    return
  }

  await Promise.allSettled(
    ids.map(async (boundaryId) => {
      const entry = getGeometryManifestEntry(boundaryId)

      if (!entry) {
        return
      }

      const shardKey = `${GEOMETRY_DATASET_VERSION}:${entry.assetKey}`

      if (loadedShardKeys.has(shardKey)) {
        return
      }

      loadedShardKeys.add(shardKey)

      try {
        const fc = await loadGeometryShard(GEOMETRY_DATASET_VERSION, entry.assetKey)
        addFeatures(entry.layer as 'CN' | 'OVERSEAS', fc)
      } catch {
        loadedShardKeys.delete(shardKey)
      }
    }),
  )
}

watch(isReady, (ready) => {
  if (ready) {
    void mapPointsStore.bootstrapFromApi()
  }
})

watch([isReady, () => mapPointsStore.travelRecords, () => hasBootstrapped.value], ([ready, , bootstrapped]) => {
  if (ready && bootstrapped) {
    void preloadSavedBoundaryShards()
  }
})

// --- Recognition sequence ---

let recognitionSequence = 0

function nextAnimationFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })
}

// --- Business logic helpers (ported from WorldMapStage) ---

function toCanonicalCountryName(parentLabel: string) {
  return parentLabel.split(' · ')[0] ?? parentLabel
}

function buildCanonicalDraftPoint(
  place: {
    placeId: string
    boundaryId: string
    placeKind: DraftMapPoint['placeKind']
    datasetVersion: string
    displayName: string
    regionSystem: 'CN' | 'OVERSEAS'
    typeLabel: string
    parentLabel: string
    subtitle: string
  },
  geo: { lat: number; lng: number },
): DraftMapPoint {
  const countryName = toCanonicalCountryName(place.parentLabel)

  return {
    id: `detected-${place.placeId}-${Math.round(geo.lat * 100)}-${Math.round(geo.lng * 100)}`,
    name: place.displayName,
    countryName,
    countryCode: place.regionSystem === 'CN' ? 'CN' : '__canonical__',
    precision: 'city-high',
    cityId: null,
    cityName: place.displayName,
    cityContextLabel: place.subtitle,
    placeId: place.placeId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
    boundaryId: place.boundaryId,
    boundaryDatasetVersion: place.datasetVersion,
    fallbackNotice: null,
    lat: geo.lat,
    lng: geo.lng,
    clickLat: geo.lat,
    clickLng: geo.lng,
    x: 0,
    y: 0,
    source: 'detected',
    isFeatured: false,
    coordinatesLabel: formatCoordinatesLabel(geo),
    description: '识别成功，下一阶段可补充地点内容。',
  }
}

function buildPendingCanonicalDraft(
  geo: { lat: number; lng: number },
  prompt: string,
): DraftMapPoint {
  return {
    id: `pending-${Math.round(geo.lat * 100)}-${Math.round(geo.lng * 100)}`,
    name: '待确认地点',
    countryName: '待确认',
    countryCode: '__canonical__',
    precision: 'city-high',
    cityId: null,
    cityName: null,
    cityContextLabel: prompt,
    placeId: null,
    placeKind: null,
    datasetVersion: null,
    typeLabel: null,
    parentLabel: null,
    subtitle: null,
    boundaryId: null,
    boundaryDatasetVersion: null,
    fallbackNotice: prompt,
    lat: geo.lat,
    lng: geo.lng,
    clickLat: geo.lat,
    clickLng: geo.lng,
    x: 0,
    y: 0,
    source: 'detected',
    isFeatured: false,
    coordinatesLabel: formatCoordinatesLabel(geo),
    description: '请确认 server 返回的 canonical 候选地点。',
  }
}

function applyResolvedPlace(
  place: Parameters<typeof buildCanonicalDraftPoint>[0],
  geo: { lat: number; lng: number },
  options: { hadDraft?: boolean } = {},
) {
  const decision = openSavedPointForPlaceOrStartDraft(buildCanonicalDraftPoint(place, geo))

  if (decision.type === 'reused') {
    setInteractionNotice({
      tone: 'info',
      message: `已打开你记录过的${decision.point.name}`,
    })
    return
  }

  if (options.hadDraft) {
    setInteractionNotice({
      tone: 'info',
      message: '当前未保存地点将被丢弃，并切换到新位置',
    })
    return
  }

  clearInteractionNotice()
}

// --- Illuminate state computeds ---

const activePointPlaceId = computed(() => {
  const surface = summarySurfaceState.value
  if (!surface || surface.mode === 'candidate-select') return null
  return surface.point.placeId ?? null
})

const isActivePointSaved = computed(() => {
  const pid = activePointPlaceId.value
  if (!pid) return false
  return travelRecords.value.some((r) => r.placeId === pid)
})

const isActivePointPending = computed(() => {
  const pid = activePointPlaceId.value
  if (!pid) return false
  return pendingPlaceIds.value.has(pid)
})

// --- Illuminate handlers ---

function handleIlluminate() {
  const surface = summarySurfaceState.value
  if (!surface || surface.mode === 'candidate-select') return
  const point = surface.point
  if (!point.placeId || !point.placeKind || !point.datasetVersion) return
  void mapPointsStore.illuminate({
    placeId: point.placeId,
    boundaryId: point.boundaryId,
    placeKind: point.placeKind,
    datasetVersion: point.datasetVersion,
    displayName: point.name,
    subtitle: point.subtitle ?? point.cityContextLabel ?? '',
  })
}

function handleUnilluminate() {
  const pid = activePointPlaceId.value
  if (!pid) return
  void mapPointsStore.unilluminate(pid)
}

// --- Boundary click handler (D-12) ---

function handleBoundaryClick(boundaryId: string, latlng: L.LatLng) {
  // Find a saved point matching this boundary
  const savedPoint = displayPoints.value.find(
    (p) => p.boundaryId === boundaryId && p.source === 'saved',
  )

  if (savedPoint) {
    openSavedPointForPlaceOrStartDraft({
      id: savedPoint.id,
      name: savedPoint.name,
      countryName: savedPoint.countryName,
      countryCode: savedPoint.countryCode,
      precision: savedPoint.precision,
      cityId: savedPoint.cityId,
      cityName: savedPoint.cityName,
      cityContextLabel: savedPoint.cityContextLabel,
      placeId: savedPoint.placeId,
      placeKind: savedPoint.placeKind,
      datasetVersion: savedPoint.datasetVersion,
      typeLabel: savedPoint.typeLabel,
      parentLabel: savedPoint.parentLabel,
      subtitle: savedPoint.subtitle,
      boundaryId: savedPoint.boundaryId,
      boundaryDatasetVersion: savedPoint.boundaryDatasetVersion,
      fallbackNotice: savedPoint.fallbackNotice,
      lat: savedPoint.lat,
      lng: savedPoint.lng,
      clickLat: savedPoint.clickLat,
      clickLng: savedPoint.clickLng,
      x: 0,
      y: 0,
      source: 'detected',
      isFeatured: savedPoint.isFeatured,
      coordinatesLabel: savedPoint.coordinatesLabel,
      description: savedPoint.description,
    })
    popupLatLng.value = latlng
    return
  }

  // No saved point for this boundary — set popup latlng to at least position the popup
  popupLatLng.value = latlng
}

// --- Pending circle marker ---

let pendingMarker: L.CircleMarker | null = null

function removePendingMarker() {
  if (pendingMarker && map.value) {
    map.value.removeLayer(pendingMarker)
    pendingMarker = null
  }
}

// --- handleConfirmCandidate (ported from WorldMapStage) ---

async function handleConfirmCandidate(candidate: GeoCityCandidate) {
  const pendingSelection = pendingCanonicalSelection.value

  if (!pendingSelection) {
    return
  }

  try {
    const response = await confirmCanonicalPlace({
      lat: pendingSelection.click.lat,
      lng: pendingSelection.click.lng,
      candidatePlaceId: candidate.cityId,
    })

    if (response.status === 'resolved') {
      applyResolvedPlace(response.place, response.click)

      // On-demand shard load after confirm (D-06)
      if (response.place.boundaryId) {
        const entry = getGeometryManifestEntry(response.place.boundaryId)
        const layer = response.place.regionSystem ?? 'CN'
        void loadShardIfNeeded(response.place.boundaryId, layer as 'CN' | 'OVERSEAS')

        if (entry) {
          popupLatLng.value = L.latLng(response.click.lat, response.click.lng)
        }
      }

      return
    }

    if (response.status === 'ambiguous') {
      startPendingCanonicalSelection({
        draftPoint: buildPendingCanonicalDraft(response.click, response.prompt),
        prompt: response.prompt,
        recommendedPlaceId: response.recommendedPlaceId,
        candidates: response.candidates,
        click: response.click,
      })
      return
    }

    setInteractionNotice({
      tone: 'info',
      message: response.message,
    })
  } catch {
    setInteractionNotice({
      tone: 'warning',
      message: '确认地点失败，请稍后重试',
    })
  }
}

// --- Map click handler (D-10, D-11) ---

async function handleMapClick(e: L.LeafletMouseEvent) {
  const { lat, lng } = e.latlng
  const activeSequence = ++recognitionSequence

  // Remove any previous pending marker
  removePendingMarker()

  // Set pending geo hit for aria status (x/y from container point for compat)
  const containerPoint = map.value?.latLngToContainerPoint(e.latlng)
  setPendingGeoHit({
    lat,
    lng,
    x: containerPoint?.x ?? 0,
    y: containerPoint?.y ?? 0,
  })
  startRecognition()

  // Create pending circle marker
  if (map.value) {
    pendingMarker = L.circleMarker([lat, lng], {
      radius: 8,
      color: 'rgba(244, 143, 177, 0.96)',
      fillColor: 'rgba(244, 143, 177, 0.94)',
      fillOpacity: 0.94,
      weight: 1.5,
      className: 'pending-marker--recognizing',
    }).addTo(map.value)
  }

  // Set popup anchor to pending location
  popupLatLng.value = e.latlng

  await nextAnimationFrame()

  if (activeSequence !== recognitionSequence) {
    return
  }

  try {
    const response = await resolveCanonicalPlace({ lat, lng })
    const hadDraft = Boolean(draftPoint.value)

    removePendingMarker()

    if (response.status === 'resolved') {
      applyResolvedPlace(response.place, response.click, { hadDraft })

      // Set popup anchor to resolved location
      popupLatLng.value = L.latLng(response.click.lat, response.click.lng)

      // On-demand shard load (D-06)
      if (response.place.boundaryId) {
        const layer = response.place.regionSystem ?? 'CN'
        void loadShardIfNeeded(response.place.boundaryId, layer as 'CN' | 'OVERSEAS')
      }

      finishRecognition()
      clearPendingGeoHit()
      return
    }

    if (response.status === 'ambiguous') {
      startPendingCanonicalSelection({
        draftPoint: buildPendingCanonicalDraft(response.click, response.prompt),
        prompt: response.prompt,
        recommendedPlaceId: response.recommendedPlaceId,
        candidates: response.candidates,
        click: response.click,
      })

      popupLatLng.value = L.latLng(response.click.lat, response.click.lng)

      if (hadDraft) {
        setInteractionNotice({
          tone: 'info',
          message: '当前未保存地点将被丢弃，并切换到新位置',
        })
      } else {
        clearInteractionNotice()
      }

      finishRecognition()
      clearPendingGeoHit()
      return
    }

    setInteractionNotice({
      tone: 'info',
      message: response.message,
    })
    finishRecognition()
    clearPendingGeoHit()
  } catch {
    removePendingMarker()
    clearPendingGeoHit()
    finishRecognition()
    setInteractionNotice({
      tone: 'warning',
      message: '识别请求失败，请稍后重试',
    })
  }
}

// Register Leaflet click handler once map is ready
watch(isReady, (ready) => {
  if (ready && map.value) {
    map.value.on('click', handleMapClick)
  }
})

// If map is already ready when component mounts (edge case)
onMounted(() => {
  if (isReady.value && map.value) {
    map.value.on('click', handleMapClick)
  }
})

</script>

<template>
  <section
    class="leaflet-map-stage"
    :class="{ 'leaflet-map-stage--selected': Boolean(selectedPointId) }"
    data-region="map-stage"
    aria-label="旅行世界地图"
  >
    <div ref="mapContainer" class="leaflet-map-stage__map"></div>
    <MapContextPopup
      v-if="isDesktopPopupVisible && summarySurfaceState && popupAnchor"
      ref="popup"
      :surface="summarySurfaceState"
      :anchor-source="popupAnchor.source"
      :floating-styles="popupFloatingStyles"
      :find-saved-point-by-city-id="findSavedPointByCityId"
      :is-saved="isActivePointSaved"
      :is-pending="isActivePointPending"
      @confirm-candidate="handleConfirmCandidate"
      @illuminate="handleIlluminate"
      @unilluminate="handleUnilluminate"
    />
    <div
      v-if="pendingGeoHit"
      class="leaflet-map-stage__sr-only"
      role="status"
      aria-live="polite"
      :aria-label="`正在识别…`"
    ></div>
  </section>
</template>

<style scoped>
.leaflet-map-stage {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.leaflet-map-stage__map {
  width: 100%;
  flex: 1 1 0;
  min-height: 0;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(199, 171, 200, 0.52);
  background: var(--color-page);
  z-index: 0;
}

.leaflet-map-stage--selected .leaflet-map-stage__map {
  border-color: rgba(244, 143, 177, 0.56);
}

.leaflet-map-stage__sr-only {
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
</style>

<style>
.pending-marker--recognizing {
  animation: leaflet-pending-pulse 1.1s ease-out infinite;
}

@keyframes leaflet-pending-pulse {
  0% {
    transform: scale(0.9);
    box-shadow:
      0 0 0 0 rgba(244, 143, 177, 0.24),
      0 0 18px rgba(244, 143, 177, 0.18);
  }

  70% {
    transform: scale(1);
    box-shadow:
      0 0 0 12px rgba(244, 143, 177, 0),
      0 0 24px rgba(244, 143, 177, 0.24);
  }

  100% {
    transform: scale(0.96);
    box-shadow:
      0 0 0 0 rgba(244, 143, 177, 0),
      0 0 14px rgba(244, 143, 177, 0.1);
  }
}

.leaflet-interactive {
  transition:
    fill var(--motion-emphasis) ease,
    stroke var(--motion-emphasis) ease,
    fill-opacity var(--motion-emphasis) ease,
    stroke-opacity var(--motion-emphasis) ease;
}

@media (prefers-reduced-motion: reduce) {
  .pending-marker--recognizing {
    animation: none;
  }

  .leaflet-interactive {
    transition: none;
  }
}
</style>
