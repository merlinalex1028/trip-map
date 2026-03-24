import { nanoid } from 'nanoid'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'

import { seedPoints } from '../data/seed-points'
import {
  clearPointStorageSnapshot,
  loadPointStorageSnapshot,
  mergeSeedAndLocalPoints,
  savePointStorageSnapshot
} from '../services/point-storage'
import type {
  DraftMapPoint,
  DrawerMode,
  EditablePointSnapshot,
  MapPointDisplay,
  PersistedMapPoint,
  PointStorageHealth,
  SeedPointOverride
} from '../types/map-point'

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

export const useMapPointsStore = defineStore('map-points', () => {
  const userPoints = shallowRef<PersistedMapPoint[]>([])
  const seedOverrides = shallowRef<SeedPointOverride[]>([])
  const deletedSeedIds = shallowRef<string[]>([])
  const draftPoint = shallowRef<DraftMapPoint | null>(null)
  const selectedPointId = shallowRef<string | null>(null)
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
    if (draftPoint.value && selectedPointId.value === draftPoint.value.id) {
      discardDraft()
      return
    }

    selectedPointId.value = null
    drawerMode.value = null
    editableSnapshot.value = null
  }

  function startDraftFromDetection(point: DraftMapPoint) {
    draftPoint.value = point
    selectedPointId.value = point.id
    drawerMode.value = 'detected-preview'
    editableSnapshot.value = buildEditableSnapshot(point)
  }

  function replaceDraftFromDetection(point: DraftMapPoint) {
    draftPoint.value = point
    selectedPointId.value = point.id
    drawerMode.value = 'detected-preview'
    editableSnapshot.value = buildEditableSnapshot(point)
  }

  function discardDraft() {
    draftPoint.value = null
    editableSnapshot.value = null
    selectedPointId.value = null
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

    const point = displayPoints.value.find((item) => item.id === id) ?? null

    if (!point) {
      selectedPointId.value = null
      drawerMode.value = null
      editableSnapshot.value = null
      return
    }

    selectedPointId.value = point.id
    drawerMode.value = point.source === 'detected' ? 'detected-preview' : 'view'
    editableSnapshot.value = buildEditableSnapshot(point)
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
    drawerMode.value = activePoint.value.source === 'detected' ? 'detected-preview' : 'view'
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
    drawerMode.value = 'view'
    editableSnapshot.value = buildEditableSnapshot(nextPoint)
    storageHealth.value = 'ready'
    persistSnapshot()

    return nextPoint
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
    drawerMode.value = 'view'

    const nextActivePoint = displayPoints.value.find((point) => point.id === id)
    editableSnapshot.value = nextActivePoint ? buildEditableSnapshot(nextActivePoint) : null
    storageHealth.value = 'ready'
    persistSnapshot()
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
    selectedPointId.value = null
    drawerMode.value = null
    editableSnapshot.value = null
    storageHealth.value = 'empty'
  }

  return {
    userPoints,
    seedOverrides,
    deletedSeedIds,
    draftPoint,
    selectedPointId,
    drawerMode,
    editableSnapshot,
    storageHealth,
    displayPoints,
    activePoint,
    bootstrapPoints,
    clearActivePoint,
    startDraftFromDetection,
    replaceDraftFromDetection,
    discardDraft,
    selectPointById,
    enterEditMode,
    exitEditMode,
    saveDraftAsPoint,
    updateSavedPoint,
    deleteUserPoint,
    hideSeedPoint,
    restoreSeedPoint,
    clearCorruptStorageState
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMapPointsStore, import.meta.hot))
}
