import { nanoid } from 'nanoid'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'

import { seedPoints } from '../data/seed-points'
import { getBoundaryByCityId, hasBoundaryCoverageForCityId } from '../services/city-boundaries'
import {
  clearPointStorageSnapshot,
  loadPointStorageSnapshot,
  mergeSeedAndLocalPoints,
  savePointStorageSnapshot
} from '../services/point-storage'
import type { GeoCityCandidate } from '../types/geo'
import type {
  DraftMapPoint,
  DrawerMode,
  EditablePointSnapshot,
  MapPointDisplay,
  PersistedMapPoint,
  PointStorageHealth,
  SeedPointOverride,
  SummaryMode,
  SummarySurfaceState
} from '../types/map-point'
import { useMapUiStore } from './map-ui'

function buildEditableSnapshot(point: MapPointDisplay): EditablePointSnapshot {
  return {
    name: point.name,
    description: point.description,
    isFeatured: point.isFeatured
  }
}

function toPersistedMapPoint(point: MapPointDisplay): PersistedMapPoint {
  const now = new Date().toISOString()

  return {
    ...point,
    source: 'saved',
    createdAt: now,
    updatedAt: now
  }
}

interface SavedPointReuseDecision {
  type: 'reused' | 'created-draft'
  point: MapPointDisplay
}

interface PendingCitySelection {
  fallbackPoint: DraftMapPoint
  cityCandidates: GeoCityCandidate[]
}

export const useMapPointsStore = defineStore('map-points', () => {
  const mapUiStore = useMapUiStore()
  const userPoints = shallowRef<PersistedMapPoint[]>([])
  const seedOverrides = shallowRef<SeedPointOverride[]>([])
  const deletedSeedIds = shallowRef<string[]>([])
  const draftPoint = shallowRef<DraftMapPoint | null>(null)
  const pendingCitySelection = shallowRef<PendingCitySelection | null>(null)
  const selectedPointId = shallowRef<string | null>(null)
  const summaryMode = shallowRef<SummaryMode | null>(null)
  const drawerMode = shallowRef<DrawerMode | null>(null)
  const editableSnapshot = shallowRef<EditablePointSnapshot | null>(null)
  const storageHealth = shallowRef<PointStorageHealth>('empty')
  const hasBootstrapped = shallowRef(false)

  const displayPoints = computed<MapPointDisplay[]>(() => {
    const points = mergeSeedAndLocalPoints(
      seedPoints,
      userPoints.value,
      seedOverrides.value,
      deletedSeedIds.value
    )

    if (draftPoint.value) {
      points.push(draftPoint.value)
    }

    return points
  })

  const activePoint = computed<MapPointDisplay | null>(() => {
    if (!selectedPointId.value) {
      return null
    }

    return displayPoints.value.find((point) => point.id === selectedPointId.value) ?? null
  })

  const activeBoundaryCoverageState = computed<'supported' | 'missing' | 'not-applicable'>(() => {
    if (!activePoint.value?.cityId) {
      return 'not-applicable'
    }

    if (activePoint.value.boundaryId || hasBoundaryCoverageForCityId(activePoint.value.cityId)) {
      return 'supported'
    }

    return 'missing'
  })

  const summarySurfaceState = computed<SummarySurfaceState | null>(() => {
    if (summaryMode.value === 'candidate-select' && pendingCitySelection.value) {
      return {
        mode: 'candidate-select',
        fallbackPoint: pendingCitySelection.value.fallbackPoint,
        cityCandidates: pendingCitySelection.value.cityCandidates
      }
    }

    if (
      (summaryMode.value === 'detected-preview' || summaryMode.value === 'view') &&
      activePoint.value
    ) {
      return {
        mode: summaryMode.value,
        point: activePoint.value,
        boundarySupportState: activeBoundaryCoverageState.value
      }
    }

    return null
  })

  const selectedBoundaryId = computed(() => activePoint.value?.boundaryId ?? null)

  const savedBoundaryIds = computed(() => {
    const boundaryIds = userPoints.value
      .map((point) => point.boundaryId)
      .filter((boundaryId): boundaryId is string => Boolean(boundaryId))

    return Array.from(new Set(boundaryIds))
  })

  function persistSnapshot() {
    savePointStorageSnapshot({
      version: 1,
      userPoints: userPoints.value,
      seedOverrides: seedOverrides.value,
      deletedSeedIds: deletedSeedIds.value
    })
  }

  function bootstrapPoints() {
    if (hasBootstrapped.value) {
      return
    }

    const storageResult = loadPointStorageSnapshot()

    if (storageResult.status === 'ready') {
      userPoints.value = storageResult.snapshot.userPoints
      seedOverrides.value = storageResult.snapshot.seedOverrides
      deletedSeedIds.value = storageResult.snapshot.deletedSeedIds
      storageHealth.value = 'ready'
    } else {
      userPoints.value = []
      seedOverrides.value = []
      deletedSeedIds.value = []
      storageHealth.value = storageResult.status
    }

    hasBootstrapped.value = true
  }

  function clearActivePoint() {
    if (pendingCitySelection.value) {
      pendingCitySelection.value = null
      selectedPointId.value = null
      summaryMode.value = null
      drawerMode.value = null
      editableSnapshot.value = null
      return
    }

    if (draftPoint.value && selectedPointId.value === draftPoint.value.id) {
      discardDraft()
      return
    }

    selectedPointId.value = null
    summaryMode.value = null
    drawerMode.value = null
    editableSnapshot.value = null
  }

  function startDraftFromDetection(point: DraftMapPoint) {
    pendingCitySelection.value = null
    draftPoint.value = point
    selectedPointId.value = point.id
    summaryMode.value = 'detected-preview'
    drawerMode.value = null
    editableSnapshot.value = buildEditableSnapshot(point)
  }

  function replaceDraftFromDetection(point: DraftMapPoint) {
    pendingCitySelection.value = null
    draftPoint.value = point
    selectedPointId.value = point.id
    summaryMode.value = 'detected-preview'
    drawerMode.value = null
    editableSnapshot.value = buildEditableSnapshot(point)
  }

  function startPendingCitySelection(fallbackPoint: DraftMapPoint, cityCandidates: GeoCityCandidate[]) {
    draftPoint.value = null
    pendingCitySelection.value = {
      fallbackPoint,
      cityCandidates
    }
    selectedPointId.value = null
    summaryMode.value = 'candidate-select'
    drawerMode.value = null
    editableSnapshot.value = null
  }

  function discardDraft() {
    draftPoint.value = null
    pendingCitySelection.value = null
    editableSnapshot.value = null
    selectedPointId.value = null
    summaryMode.value = null
    drawerMode.value = null
  }

  function selectPointById(id: string) {
    const persistedDisplayPoints = mergeSeedAndLocalPoints(
      seedPoints,
      userPoints.value,
      seedOverrides.value,
      deletedSeedIds.value
    )
    const persistedPoint = persistedDisplayPoints.find((item) => item.id === id) ?? null

    if (draftPoint.value && draftPoint.value.id !== id && persistedPoint && persistedPoint.source !== 'detected') {
      draftPoint.value = null
    }

    pendingCitySelection.value = null

    const point = displayPoints.value.find((item) => item.id === id) ?? null

    if (!point) {
      selectedPointId.value = null
      summaryMode.value = null
      drawerMode.value = null
      editableSnapshot.value = null
      return
    }

    selectedPointId.value = point.id
    summaryMode.value = point.source === 'detected' ? 'detected-preview' : 'view'
    drawerMode.value = null
    editableSnapshot.value = buildEditableSnapshot(point)
  }

  function openDrawerView() {
    if (!activePoint.value) {
      return
    }

    editableSnapshot.value = buildEditableSnapshot(activePoint.value)
    drawerMode.value = 'view'
  }

  function closeDrawer() {
    drawerMode.value = null
  }

  function enterEditMode() {
    if (!activePoint.value) {
      return
    }

    editableSnapshot.value = buildEditableSnapshot(activePoint.value)
    drawerMode.value = 'edit'
  }

  function exitEditMode() {
    if (!activePoint.value) {
      clearActivePoint()
      return
    }

    editableSnapshot.value = buildEditableSnapshot(activePoint.value)
    drawerMode.value = 'view'
  }

  function saveDraftAsPoint(snapshot?: EditablePointSnapshot) {
    if (!draftPoint.value) {
      return null
    }

    const payload = snapshot ?? editableSnapshot.value ?? buildEditableSnapshot(draftPoint.value)
    const now = new Date().toISOString()
    const nextPoint: PersistedMapPoint = {
      ...draftPoint.value,
      ...payload,
      id: `saved-${nanoid(8)}`,
      source: 'saved',
      createdAt: now,
      updatedAt: now
    }

    userPoints.value = [...userPoints.value, nextPoint]
    draftPoint.value = null
    selectedPointId.value = nextPoint.id
    summaryMode.value = 'view'
    drawerMode.value = null
    editableSnapshot.value = buildEditableSnapshot(nextPoint)
    storageHealth.value = 'ready'
    persistSnapshot()

    return nextPoint
  }

  function buildDraftFromCandidate(
    fallbackPoint: DraftMapPoint,
    candidate: GeoCityCandidate
  ): DraftMapPoint {
    const boundary = getBoundaryByCityId(candidate.cityId)

    return {
      ...fallbackPoint,
      id: `detected-${candidate.cityId}-${Math.round(fallbackPoint.lat * 100)}-${Math.round(fallbackPoint.lng * 100)}`,
      name: candidate.cityName,
      precision: 'city-high',
      cityId: candidate.cityId,
      cityName: candidate.cityName,
      cityContextLabel: candidate.contextLabel,
      boundaryId: boundary?.boundaryId ?? null,
      boundaryDatasetVersion: boundary?.datasetVersion ?? null,
      fallbackNotice: null
    }
  }

  function findSavedPointByCityId(cityId: string) {
    return userPoints.value.find((point) => point.cityId === cityId) ?? null
  }

  function openSavedPointForCityOrStartDraft(point: DraftMapPoint): SavedPointReuseDecision {
    pendingCitySelection.value = null
    const savedPoint = point.cityId ? findSavedPointByCityId(point.cityId) : null

    if (savedPoint) {
      draftPoint.value = null
      selectedPointId.value = savedPoint.id
      summaryMode.value = 'view'
      drawerMode.value = null
      editableSnapshot.value = buildEditableSnapshot(savedPoint)

      return {
        type: 'reused',
        point: savedPoint
      }
    }

    startDraftFromDetection(point)

    return {
      type: 'created-draft',
      point
    }
  }

  function confirmPendingCitySelection(candidate: GeoCityCandidate) {
    if (!pendingCitySelection.value) {
      return null
    }

    const decision = openSavedPointForCityOrStartDraft(
      buildDraftFromCandidate(pendingCitySelection.value.fallbackPoint, candidate)
    )

    if (decision.type === 'reused') {
      mapUiStore.setInteractionNotice({
        tone: 'info',
        message: `已打开你记录过的${decision.point.name}`
      })
    } else {
      mapUiStore.clearInteractionNotice()
    }

    return decision
  }

  function continuePendingWithFallback() {
    if (!pendingCitySelection.value) {
      return null
    }

    const fallbackPoint = pendingCitySelection.value.fallbackPoint

    mapUiStore.clearInteractionNotice()
    startDraftFromDetection(fallbackPoint)

    return fallbackPoint
  }

  function updateSavedPoint(id: string, snapshot: EditablePointSnapshot) {
    const now = new Date().toISOString()
    const seedPoint = seedPoints.find((point) => point.id === id)

    if (seedPoint) {
      const nextOverride: SeedPointOverride = {
        id,
        name: snapshot.name,
        description: snapshot.description,
        isFeatured: snapshot.isFeatured,
        updatedAt: now
      }
      const remainingOverrides = seedOverrides.value.filter((override) => override.id !== id)

      seedOverrides.value = [...remainingOverrides, nextOverride]
    } else {
      userPoints.value = userPoints.value.map((point) => {
        if (point.id !== id) {
          return point
        }

        return {
          ...point,
          ...snapshot,
          updatedAt: now
        }
      })
    }

    selectedPointId.value = id
    summaryMode.value = 'view'
    drawerMode.value = 'view'

    const nextActivePoint = displayPoints.value.find((point) => point.id === id)
    editableSnapshot.value = nextActivePoint ? buildEditableSnapshot(nextActivePoint) : null
    storageHealth.value = 'ready'
    persistSnapshot()
  }

  function toggleActivePointFeatured() {
    if (!activePoint.value) {
      return
    }

    const nextIsFeatured = !activePoint.value.isFeatured

    if (activePoint.value.source === 'detected') {
      if (!draftPoint.value || draftPoint.value.id !== activePoint.value.id) {
        return
      }

      draftPoint.value = {
        ...draftPoint.value,
        isFeatured: nextIsFeatured
      }
      editableSnapshot.value = buildEditableSnapshot(draftPoint.value)
      return
    }

    updateSavedPoint(activePoint.value.id, {
      name: activePoint.value.name,
      description: activePoint.value.description,
      isFeatured: nextIsFeatured
    })
  }

  function deleteUserPoint(id: string) {
    userPoints.value = userPoints.value.filter((point) => point.id !== id)

    if (selectedPointId.value === id) {
      clearActivePoint()
    }

    storageHealth.value = 'ready'
    persistSnapshot()
  }

  function hideSeedPoint(id: string) {
    if (!deletedSeedIds.value.includes(id)) {
      deletedSeedIds.value = [...deletedSeedIds.value, id]
    }

    if (selectedPointId.value === id) {
      clearActivePoint()
    }

    storageHealth.value = 'ready'
    persistSnapshot()
  }

  function restoreSeedPoint(id: string) {
    deletedSeedIds.value = deletedSeedIds.value.filter((item) => item !== id)
    storageHealth.value = 'ready'
    persistSnapshot()
  }

  function clearCorruptStorageState() {
    clearPointStorageSnapshot()
    userPoints.value = []
    seedOverrides.value = []
    deletedSeedIds.value = []
    draftPoint.value = null
    pendingCitySelection.value = null
    selectedPointId.value = null
    summaryMode.value = null
    drawerMode.value = null
    editableSnapshot.value = null
    storageHealth.value = 'empty'
  }

  return {
    userPoints,
    seedOverrides,
    deletedSeedIds,
    draftPoint,
    pendingCitySelection,
    selectedPointId,
    summaryMode,
    drawerMode,
    editableSnapshot,
    storageHealth,
    displayPoints,
    activePoint,
    activeBoundaryCoverageState,
    summarySurfaceState,
    selectedBoundaryId,
    savedBoundaryIds,
    bootstrapPoints,
    clearActivePoint,
    startDraftFromDetection,
    replaceDraftFromDetection,
    startPendingCitySelection,
    discardDraft,
    selectPointById,
    openDrawerView,
    closeDrawer,
    enterEditMode,
    exitEditMode,
    saveDraftAsPoint,
    findSavedPointByCityId,
    openSavedPointForCityOrStartDraft,
    confirmPendingCitySelection,
    continuePendingWithFallback,
    updateSavedPoint,
    toggleActivePointFeatured,
    deleteUserPoint,
    hideSeedPoint,
    restoreSeedPoint,
    clearCorruptStorageState
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMapPointsStore, import.meta.hot))
}
