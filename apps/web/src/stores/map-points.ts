import type { CanonicalPlaceCandidate, TravelRecord } from '@trip-map/contracts'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'

import { isUnauthorizedApiClientError } from '../services/api/client'
import {
  createTravelRecord,
  deleteTravelRecord,
} from '../services/api/records'
import {
  hasBoundaryCoverageForBoundaryId,
  hasBoundaryCoverageForCityId,
} from '../services/city-boundaries'
import type { GeoCityCandidate } from '../types/geo'
import type { DraftMapPoint, MapPointDisplay, SummaryMode, SummarySurfaceState } from '../types/map-point'
import { useAuthSessionStore } from './auth-session'
import { useMapUiStore } from './map-ui'

interface SavedPointReuseDecision {
  type: 'reused' | 'created-draft'
  point: MapPointDisplay
}

export interface PendingCanonicalSelection {
  draftPoint: DraftMapPoint
  prompt: string
  recommendedPlaceId: string | null
  candidates: CanonicalPlaceCandidate[]
  click: {
    lat: number
    lng: number
  }
}

function toCandidateProjection(candidate: CanonicalPlaceCandidate): GeoCityCandidate {
  return {
    cityId: candidate.placeId,
    cityName: candidate.displayName,
    contextLabel: candidate.subtitle,
    matchLevel: 'high',
    distanceKm: 0,
    statusHint: candidate.candidateHint,
  }
}

function hasCanonicalIdentity(point: Pick<MapPointDisplay, 'placeId' | 'placeKind'>) {
  return Boolean(point.placeId && point.placeKind)
}

function recordToDisplayPoint(record: TravelRecord): MapPointDisplay {
  return {
    id: record.placeId,
    name: record.displayName,
    countryName: record.parentLabel.split(' · ')[0] ?? '',
    countryCode: '',
    precision: 'city-high',
    cityId: null,
    cityName: record.displayName,
    cityContextLabel: record.subtitle,
    placeId: record.placeId,
    placeKind: record.placeKind,
    datasetVersion: record.datasetVersion,
    regionSystem: record.regionSystem,
    adminType: record.adminType,
    typeLabel: record.typeLabel,
    parentLabel: record.parentLabel,
    subtitle: record.subtitle,
    boundaryId: record.boundaryId,
    boundaryDatasetVersion: record.datasetVersion,
    fallbackNotice: null,
    x: 0,
    y: 0,
    lat: 0,
    lng: 0,
    clickLat: undefined,
    clickLng: undefined,
    source: 'saved',
    isFeatured: false,
    description: '',
    coordinatesLabel: '',
  }
}

export const useMapPointsStore = defineStore('map-points', () => {
  const travelRecords = shallowRef<TravelRecord[]>([])
  const pendingPlaceIds = shallowRef<Set<string>>(new Set())
  const draftPoint = shallowRef<DraftMapPoint | null>(null)
  const pendingCanonicalSelection = shallowRef<PendingCanonicalSelection | null>(null)
  const selectedPointId = shallowRef<string | null>(null)
  const summaryMode = shallowRef<SummaryMode | null>(null)
  const hasBootstrapped = shallowRef(false)

  const savedBoundaryIds = computed(() => {
    const boundaryIds = travelRecords.value
      .map((record) => record.boundaryId)
      .filter((boundaryId): boundaryId is string => Boolean(boundaryId))

    return Array.from(new Set(boundaryIds))
  })

  const displayPoints = computed<MapPointDisplay[]>(() => {
    const latestByPlaceId = new Map<string, TravelRecord>()
    for (const record of travelRecords.value) {
      const existing = latestByPlaceId.get(record.placeId)
      if (!existing || record.createdAt > existing.createdAt) {
        latestByPlaceId.set(record.placeId, record)
      }
    }

    const points: MapPointDisplay[] = Array.from(latestByPlaceId.values()).map(recordToDisplayPoint)

    if (draftPoint.value) {
      points.push(draftPoint.value)
    }

    return points
  })

  const tripsByPlaceId = computed(() => {
    const map = new Map<string, TravelRecord[]>()
    for (const record of travelRecords.value) {
      const existing = map.get(record.placeId) ?? []
      map.set(record.placeId, [...existing, record])
    }
    return map
  })

  const activePoint = computed<MapPointDisplay | null>(() => {
    if (!selectedPointId.value) {
      return null
    }

    return displayPoints.value.find((point) => point.id === selectedPointId.value) ?? null
  })

  const activeBoundaryCoverageState = computed<'supported' | 'missing' | 'not-applicable'>(() => {
    if (!activePoint.value) {
      return 'not-applicable'
    }

    if (hasBoundaryCoverageForBoundaryId(activePoint.value.boundaryId)) {
      return 'supported'
    }

    if (hasCanonicalIdentity(activePoint.value)) {
      return 'missing'
    }

    if (activePoint.value.cityId && hasBoundaryCoverageForCityId(activePoint.value.cityId)) {
      return 'supported'
    }

    return 'not-applicable'
  })

  const summarySurfaceState = computed<SummarySurfaceState | null>(() => {
    if (summaryMode.value === 'candidate-select' && pendingCanonicalSelection.value) {
      return {
        mode: 'candidate-select',
        fallbackPoint: pendingCanonicalSelection.value.draftPoint,
        cityCandidates: pendingCanonicalSelection.value.candidates.map((candidate) =>
          toCandidateProjection(candidate),
        ),
        canonicalCandidates: pendingCanonicalSelection.value.candidates,
        recommendedPlaceId: pendingCanonicalSelection.value.recommendedPlaceId,
      }
    }

    if (
      (summaryMode.value === 'detected-preview' || summaryMode.value === 'view') &&
      activePoint.value
    ) {
      return {
        mode: summaryMode.value,
        point: activePoint.value,
        boundarySupportState: activeBoundaryCoverageState.value,
      }
    }

    return null
  })

  const selectedBoundaryId = computed(() => activePoint.value?.boundaryId ?? null)
  const RECORD_WRITE_SUCCESS_NOTICE = '已同步到当前账号。'
  const RECORD_WRITE_FAILED_NOTICE = '点亮失败，旅行记录暂时没有同步成功，请稍后重试。'
  const RECORD_DELETE_SUCCESS_NOTICE = '已从当前账号移除。'
  const RECORD_DELETE_FAILED_NOTICE = '取消点亮失败，旅行记录暂时没有同步成功，请稍后重试。'

  function replaceTravelRecords(records: TravelRecord[]) {
    travelRecords.value = [...records]
    pendingPlaceIds.value = new Set()
    hasBootstrapped.value = true
  }

  function applyAuthoritativeTravelRecords(records: TravelRecord[]) {
    if (pendingPlaceIds.value.size === 0) {
      travelRecords.value = [...records]
      hasBootstrapped.value = true
      return
    }

    const pendingRecords = travelRecords.value.filter(
      (r) => r.id.startsWith('pending-') && pendingPlaceIds.value.has(r.placeId),
    )
    const pendingOptimisticPlaceIds = new Set(pendingRecords.map((record) => record.placeId))
    const snapshotById = new Map(records.map((r) => [r.id, r]))
    const stableRecords = Array.from(snapshotById.values()).filter(
      (record) =>
        !pendingPlaceIds.value.has(record.placeId) || pendingOptimisticPlaceIds.has(record.placeId),
    )

    travelRecords.value = [...stableRecords, ...pendingRecords]
    hasBootstrapped.value = true
  }

  function hasSessionBoundaryChanged(boundaryVersionAtStart: number) {
    return useAuthSessionStore().boundaryVersion !== boundaryVersionAtStart
  }

  function resetTravelRecordsForSessionBoundary() {
    travelRecords.value = []
    pendingPlaceIds.value = new Set()
    draftPoint.value = null
    pendingCanonicalSelection.value = null
    selectedPointId.value = null
    summaryMode.value = null
    hasBootstrapped.value = true
  }

  function clearActivePoint() {
    if (pendingCanonicalSelection.value) {
      pendingCanonicalSelection.value = null
      selectedPointId.value = null
      summaryMode.value = null
      return
    }

    if (draftPoint.value && selectedPointId.value === draftPoint.value.id) {
      discardDraft()
      return
    }

    selectedPointId.value = null
    summaryMode.value = null
  }

  function startDraftFromDetection(point: DraftMapPoint) {
    pendingCanonicalSelection.value = null
    draftPoint.value = point
    selectedPointId.value = point.id
    summaryMode.value = 'detected-preview'
  }

  function replaceDraftFromDetection(point: DraftMapPoint) {
    startDraftFromDetection(point)
  }

  function startPendingCanonicalSelection(selection: PendingCanonicalSelection) {
    draftPoint.value = null
    pendingCanonicalSelection.value = {
      ...selection,
      draftPoint: {
        ...selection.draftPoint,
        clickLat: selection.click.lat,
        clickLng: selection.click.lng,
      },
    }
    selectedPointId.value = null
    summaryMode.value = 'candidate-select'
  }

  function discardDraft() {
    draftPoint.value = null
    pendingCanonicalSelection.value = null
    selectedPointId.value = null
    summaryMode.value = null
  }

  function selectPointById(id: string) {
    pendingCanonicalSelection.value = null

    if (draftPoint.value && draftPoint.value.id !== id) {
      draftPoint.value = null
    }

    const point = displayPoints.value.find((item) => item.id === id) ?? null

    if (!point) {
      selectedPointId.value = null
      summaryMode.value = null
      return
    }

    selectedPointId.value = point.id
    summaryMode.value = point.source === 'detected' ? 'detected-preview' : 'view'
  }

  function findSavedPointByPlaceId(placeId: string) {
    const trips = tripsByPlaceId.value.get(placeId)
    return trips?.[0] ?? null
  }

  function findSavedPointByCityId(identifier: string) {
    const byPlaceId = findSavedPointByPlaceId(identifier)

    if (byPlaceId) {
      return recordToDisplayPoint(byPlaceId)
    }

    const byRecord = travelRecords.value.find(
      (record) => record.placeId === identifier,
    )

    if (byRecord) {
      return recordToDisplayPoint(byRecord)
    }

    return null
  }

  function openSavedPointForPlaceOrStartDraft(point: DraftMapPoint): SavedPointReuseDecision {
    pendingCanonicalSelection.value = null
    const savedRecord = point.placeId ? findSavedPointByPlaceId(point.placeId) : null

    if (savedRecord) {
      draftPoint.value = null
      const displayPoint = recordToDisplayPoint(savedRecord)
      selectedPointId.value = displayPoint.id
      summaryMode.value = 'view'

      return {
        type: 'reused',
        point: displayPoint,
      }
    }

    startDraftFromDetection(point)

    return {
      type: 'created-draft',
      point,
    }
  }

  async function illuminate(summary: {
    placeId: string
    boundaryId: string | null
    placeKind: TravelRecord['placeKind']
    datasetVersion: string
    displayName: string
    regionSystem: TravelRecord['regionSystem']
    adminType: TravelRecord['adminType']
    typeLabel: TravelRecord['typeLabel']
    parentLabel: TravelRecord['parentLabel']
    subtitle: string | null
    startDate: string | null
    endDate: string | null
  }) {
    const authSessionStore = useAuthSessionStore()
    const boundaryVersionAtStart = authSessionStore.boundaryVersion
    const {
      placeId,
      boundaryId,
      placeKind,
      datasetVersion,
      displayName,
      regionSystem,
      adminType,
      typeLabel,
      parentLabel,
      subtitle,
      startDate,
      endDate,
    } = summary
    const optimisticId = `pending-${placeId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const optimisticRecord: TravelRecord = {
      id: optimisticId,
      placeId,
      boundaryId: boundaryId ?? '',
      placeKind,
      datasetVersion,
      displayName,
      regionSystem,
      adminType,
      typeLabel,
      parentLabel,
      subtitle: subtitle ?? '',
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
    }

    travelRecords.value = [...travelRecords.value, optimisticRecord]
    pendingPlaceIds.value = new Set([...pendingPlaceIds.value, placeId])
    selectedPointId.value = placeId
    summaryMode.value = 'view'

    try {
      const record = await createTravelRecord({
        placeId,
        boundaryId: boundaryId ?? '',
        placeKind,
        datasetVersion,
        displayName,
        regionSystem,
        adminType,
        typeLabel,
        parentLabel,
        subtitle: subtitle ?? '',
        startDate,
        endDate,
      })

      if (hasSessionBoundaryChanged(boundaryVersionAtStart)) {
        return
      }

      travelRecords.value = travelRecords.value.map((r) => (r.id === optimisticId ? record : r))
      useMapUiStore().setInteractionNotice({
        tone: 'info',
        message: RECORD_WRITE_SUCCESS_NOTICE,
      })
    } catch (error) {
      if (hasSessionBoundaryChanged(boundaryVersionAtStart)) {
        return
      }

      travelRecords.value = travelRecords.value.filter((r) => !(r.id === optimisticId))
      const stillIlluminated = travelRecords.value.some((record) => record.placeId === placeId)
      if (!stillIlluminated) {
        selectedPointId.value = null
        summaryMode.value = null
      }

      if (isUnauthorizedApiClientError(error)) {
        if (authSessionStore.currentUser) {
          authSessionStore.handleUnauthorized()
        }
      } else {
        useMapUiStore().setInteractionNotice({
          tone: 'warning',
          message: RECORD_WRITE_FAILED_NOTICE,
        })
      }
    } finally {
      if (hasSessionBoundaryChanged(boundaryVersionAtStart)) {
        return
      }

      const hasOtherPending = travelRecords.value.some(
        (record) => record.id.startsWith('pending-') && record.placeId === placeId,
      )
      if (!hasOtherPending) {
        const next = new Set(pendingPlaceIds.value)
        next.delete(placeId)
        pendingPlaceIds.value = next
      }
    }
  }

  async function unilluminate(placeId: string) {
    const authSessionStore = useAuthSessionStore()
    const boundaryVersionAtStart = authSessionStore.boundaryVersion
    const previousRecords = [...travelRecords.value]
    const prev = previousRecords.find((r) => r.placeId === placeId)
    if (!prev) {
      return
    }

    travelRecords.value = travelRecords.value.filter((r) => r.placeId !== placeId)
    pendingPlaceIds.value = new Set([...pendingPlaceIds.value, placeId])

    try {
      await deleteTravelRecord(placeId)

      if (hasSessionBoundaryChanged(boundaryVersionAtStart)) {
        return
      }

      travelRecords.value = travelRecords.value.filter((r) => r.placeId !== placeId)
      useMapUiStore().setInteractionNotice({
        tone: 'info',
        message: RECORD_DELETE_SUCCESS_NOTICE,
      })
    } catch (error) {
      if (hasSessionBoundaryChanged(boundaryVersionAtStart)) {
        return
      }

      travelRecords.value = previousRecords

      if (isUnauthorizedApiClientError(error)) {
        if (authSessionStore.currentUser) {
          authSessionStore.handleUnauthorized()
        }
      } else {
        useMapUiStore().setInteractionNotice({
          tone: 'warning',
          message: RECORD_DELETE_FAILED_NOTICE,
        })
      }
    } finally {
      if (hasSessionBoundaryChanged(boundaryVersionAtStart)) {
        return
      }

      const next = new Set(pendingPlaceIds.value)
      next.delete(placeId)
      pendingPlaceIds.value = next
    }
  }

  function isPlaceIlluminated(placeId: string): boolean {
    return travelRecords.value.some((record) => record.placeId === placeId)
  }

  function isPlacePending(placeId: string): boolean {
    return pendingPlaceIds.value.has(placeId)
  }

  return {
    travelRecords,
    pendingPlaceIds,
    draftPoint,
    pendingCanonicalSelection,
    selectedPointId,
    summaryMode,
    hasBootstrapped,
    savedBoundaryIds,
    tripsByPlaceId,
    displayPoints,
    activePoint,
    activeBoundaryCoverageState,
    summarySurfaceState,
    selectedBoundaryId,
    replaceTravelRecords,
    applyAuthoritativeTravelRecords,
    resetTravelRecordsForSessionBoundary,
    clearActivePoint,
    startDraftFromDetection,
    replaceDraftFromDetection,
    startPendingCanonicalSelection,
    discardDraft,
    selectPointById,
    findSavedPointByPlaceId,
    findSavedPointByCityId,
    openSavedPointForPlaceOrStartDraft,
    illuminate,
    unilluminate,
    isPlaceIlluminated,
    isPlacePending,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMapPointsStore, import.meta.hot))
}
