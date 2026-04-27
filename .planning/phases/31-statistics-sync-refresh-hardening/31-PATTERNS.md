# Phase 31: Statistics Sync Refresh Hardening - Pattern Map

**Mapped:** 2026-04-27
**Files analyzed:** 3 new/modified candidates
**Analogs found:** 3 / 3

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `apps/web/src/views/StatisticsPageView.vue` | component / route view | event-driven + request-response | `apps/web/src/views/StatisticsPageView.vue` | exact |
| `apps/web/src/views/StatisticsPageView.spec.ts` | test | event-driven + request-response | `apps/web/src/views/StatisticsPageView.spec.ts` | exact |
| `apps/web/src/stores/auth-session.spec.ts` | test | request-response + event-driven | `apps/web/src/stores/auth-session.spec.ts` | role-match, conditional |

Files explicitly referenced as guardrails but not expected to change: `apps/web/src/stores/stats.ts`, `apps/web/src/stores/auth-session.ts`, `apps/web/src/stores/map-points.ts`, `apps/server/src/modules/records/records.repository.ts`, `packages/contracts/src/stats.ts`.

## Pattern Assignments

### `apps/web/src/views/StatisticsPageView.vue` (component / route view, event-driven + request-response)

**Analog:** `apps/web/src/views/StatisticsPageView.vue`

**Imports pattern** (lines 1-9):
```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, shallowRef, watch } from 'vue'
import { RouterLink } from 'vue-router'

import StatCard from '../components/statistics/StatCard.vue'
import { useAuthSessionStore } from '../stores/auth-session'
import { useMapPointsStore } from '../stores/map-points'
import { useStatsStore } from '../stores/stats'
```

**Store refs and local coalescing state pattern** (lines 11-18):
```typescript
const authSessionStore = useAuthSessionStore()
const mapPointsStore = useMapPointsStore()
const statsStore = useStatsStore()

const { boundaryVersion, currentUser, status } = storeToRefs(authSessionStore)
const { travelRecords } = storeToRefs(mapPointsStore)
const { stats, isLoading, error } = storeToRefs(statsStore)
const pendingRefreshAfterLoad = shallowRef(false)
```

**UI state derivation pattern** (lines 20-38):
```typescript
const isRestoring = computed(() => status.value === 'restoring')
const shouldShowRestoringState = computed(() => isRestoring.value || isLoading.value)
const shouldShowAnonymousState = computed(
  () => !isRestoring.value && (status.value !== 'authenticated' || currentUser.value === null),
)
const shouldShowEmptyState = computed(
  () =>
    status.value === 'authenticated'
    && !isLoading.value
    && error.value === null
    && (stats.value?.totalTrips ?? 0) === 0,
)
const shouldShowStats = computed(
  () =>
    status.value === 'authenticated'
    && !isLoading.value
    && error.value === null
    && (stats.value?.totalTrips ?? 0) > 0,
)
```

**Current revision source to replace** (lines 39-43):
```typescript
const travelRecordRevision = computed(() =>
  travelRecords.value
    .map((record) => `${record.id}:${record.placeId}:${record.createdAt}`)
    .join('|'),
)
```

Planner instruction: keep this compact deterministic `computed` shape, but replace the field list with a stats-relevant authoritative metadata revision. At minimum include `id`, `placeId`, `createdAt`, and `parentLabel`; context decisions also require authoritative display metadata such as `displayName`, `typeLabel`, and `subtitle`. Do not add local statistics aggregation here.

**Authenticated fetch and boundary reset pattern** (lines 45-61):
```typescript
function fetchStatsIfAuthenticated() {
  if (status.value === 'authenticated' && currentUser.value !== null) {
    void statsStore.fetchStatsData()
  }
}

onMounted(() => {
  fetchStatsIfAuthenticated()
})

watch(
  () => boundaryVersion.value,
  () => {
    pendingRefreshAfterLoad.value = false
    statsStore.reset()
    fetchStatsIfAuthenticated()
  },
)
```

**Record-change watcher and in-flight coalescing pattern** (lines 64-95):
```typescript
watch(
  () => travelRecordRevision.value,
  (nextRevision, previousRevision) => {
    if (
      previousRevision !== undefined
      && nextRevision !== previousRevision
      && status.value === 'authenticated'
      && currentUser.value !== null
    ) {
      if (isLoading.value) {
        pendingRefreshAfterLoad.value = true
        return
      }

      void statsStore.fetchStatsData()
    }
  },
)

watch(
  () => isLoading.value,
  (nextLoading) => {
    if (
      !nextLoading
      && pendingRefreshAfterLoad.value
      && status.value === 'authenticated'
      && currentUser.value !== null
    ) {
      pendingRefreshAfterLoad.value = false
      void statsStore.fetchStatsData()
    }
  },
)
```

Planner instruction: copy this watcher/coalescing behavior unchanged unless extracting a tiny local helper improves clarity. Metadata-only refresh must stay invisible, so do not add template states, spinners, banners, route changes, focus movement, or copy changes.

---

### `apps/web/src/views/StatisticsPageView.spec.ts` (test, event-driven + request-response)

**Analog:** `apps/web/src/views/StatisticsPageView.spec.ts`

**Imports and API mock pattern** (lines 1-20):
```typescript
import type { ResolvedCanonicalPlace, TravelRecord } from '@trip-map/contracts'
import {
  PHASE12_RESOLVED_BEIJING,
  PHASE28_RESOLVED_CALIFORNIA,
} from '@trip-map/contracts'
import { RouterLinkStub, flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

import StatisticsPageView from './StatisticsPageView.vue'
import { useAuthSessionStore } from '../stores/auth-session'
import { useMapPointsStore } from '../stores/map-points'

const { fetchStatsMock } = vi.hoisted(() => ({
  fetchStatsMock: vi.fn(),
}))

vi.mock('../services/api/stats', () => ({
  fetchStats: fetchStatsMock,
}))
```

**Travel record fixture pattern** (lines 31-52):
```typescript
function makeRecord(
  place: ResolvedCanonicalPlace,
  overrides: Partial<TravelRecord> = {},
): TravelRecord {
  return {
    id: `record-${place.placeId}`,
    placeId: place.placeId,
    boundaryId: place.boundaryId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    displayName: place.displayName,
    regionSystem: place.regionSystem,
    adminType: place.adminType,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
    startDate: null,
    endDate: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}
```

Use this helper to create a base record and a metadata-only refreshed record with the same `id`, `placeId`, and `createdAt`, but changed `parentLabel` and optionally `displayName`, `typeLabel`, or `subtitle`.

**Component mount helper pattern** (lines 54-87):
```typescript
function mountStatisticsPage(
  setup?: (context: {
    authSessionStore: ReturnType<typeof useAuthSessionStore>
    mapPointsStore: ReturnType<typeof useMapPointsStore>
  }) => void,
) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authSessionStore = useAuthSessionStore()
  const mapPointsStore = useMapPointsStore()

  authSessionStore.status = 'anonymous'
  authSessionStore.currentUser = null
  setup?.({
    authSessionStore,
    mapPointsStore,
  })

  const wrapper = mount(StatisticsPageView, {
    global: {
      plugins: [pinia],
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  })

  return {
    authSessionStore,
    mapPointsStore,
    wrapper,
  }
}
```

**In-flight refresh coalescing test pattern** (lines 101-164):
```typescript
it('re-fetches statistics after travel records change during an in-flight request', async () => {
  let resolveFirst!: (value: {
    totalTrips: number
    uniquePlaces: number
    visitedCountries: number
    totalSupportedCountries: number
  }) => void
  let resolveSecond!: (value: {
    totalTrips: number
    uniquePlaces: number
    visitedCountries: number
    totalSupportedCountries: number
  }) => void

  fetchStatsMock
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve
        }),
    )
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSecond = resolve
        }),
    )

  const beijingRecord = makeRecord(PHASE12_RESOLVED_BEIJING, {
    id: 'beijing-1',
    createdAt: '2025-01-01T00:00:00.000Z',
  })
  const californiaRecord = makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
    id: 'california-1',
    createdAt: '2025-02-01T00:00:00.000Z',
  })

  const { mapPointsStore, wrapper } = mountStatisticsPage(({ authSessionStore, mapPointsStore }) => {
    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = makeUser()
    mapPointsStore.replaceTravelRecords([beijingRecord])
  })

  await flushPromises()
  expect(fetchStatsMock).toHaveBeenCalledTimes(1)

  mapPointsStore.replaceTravelRecords([beijingRecord, californiaRecord])
  await nextTick()
  expect(fetchStatsMock).toHaveBeenCalledTimes(1)

  resolveFirst({ totalTrips: 1, uniquePlaces: 1, visitedCountries: 1, totalSupportedCountries: 21 })
  await flushPromises()
  await nextTick()

  expect(fetchStatsMock).toHaveBeenCalledTimes(2)

  resolveSecond({ totalTrips: 2, uniquePlaces: 2, visitedCountries: 2, totalSupportedCountries: 21 })
  await flushPromises()
  await nextTick()

  expect(wrapper.get('[data-state="populated"]').text()).toContain(
    '2 次旅行 · 2 个地点 · 2 个国家/地区',
  )
})
```

Planner instruction: add a sibling test using the same controlled-promise style, but change only metadata while the first request is loading. Assert the second fetch is queued after the first settles, not started concurrently.

**Rendering assertion pattern** (lines 216-262):
```typescript
it('shows visitedCountries correctly for multi-country statistics', async () => {
  let resolveStats!: (value: {
    totalTrips: number
    uniquePlaces: number
    visitedCountries: number
    totalSupportedCountries: number
  }) => void

  fetchStatsMock.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveStats = resolve
      }),
  )

  const { wrapper } = mountStatisticsPage(({ authSessionStore, mapPointsStore }) => {
    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = makeUser()
    mapPointsStore.replaceTravelRecords([
      makeRecord(PHASE12_RESOLVED_BEIJING, {
        id: 'beijing-1',
        createdAt: '2025-01-01T00:00:00.000Z',
      }),
      makeRecord(PHASE12_RESOLVED_BEIJING, {
        id: 'beijing-2',
        createdAt: '2025-02-01T00:00:00.000Z',
      }),
      makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
        id: 'california-1',
        createdAt: '2025-03-01T00:00:00.000Z',
      }),
    ])
  })

  resolveStats({
    totalTrips: 3,
    uniquePlaces: 2,
    visitedCountries: 2,
    totalSupportedCountries: 21,
  })
  await flushPromises()
  await nextTick()

  const populated = wrapper.get('[data-state="populated"]')
  expect(populated.text()).toContain('3 次旅行 · 2 个地点 · 2 个国家/地区')
  expect(populated.text()).toContain('当前支持覆盖 21 个国家/地区。')
})
```

Use this assertion style when validating the final refreshed stats payload is visible after the queued metadata-only fetch resolves.

---

### `apps/web/src/stores/auth-session.spec.ts` (test, request-response + event-driven)

**Analog:** `apps/web/src/stores/auth-session.spec.ts`

This file is conditional. Only modify it if the component-level tests do not prove same-user `/auth/bootstrap` refresh continues to apply authoritative metadata without a session boundary reset.

**Imports and mocked service pattern** (lines 1-21):
```typescript
import type {
  AuthBootstrapResponse,
  AuthUser,
  CreateTravelRecordRequest,
  ImportTravelRecordsResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  TravelRecord,
} from '@trip-map/contracts'
import {
  PHASE12_RESOLVED_BEIJING,
  PHASE12_RESOLVED_CALIFORNIA,
} from '@trip-map/contracts'
import { createPinia, setActivePinia } from 'pinia'

import { ApiClientError } from '../services/api/client'
import { useMapPointsStore } from './map-points'
import { useMapUiStore } from './map-ui'
import { useAuthSessionStore } from './auth-session'
```

**Fixture helper pattern** (lines 76-99):
```typescript
function makeRecord(
  place = PHASE12_RESOLVED_BEIJING,
  overrides: Partial<TravelRecord> = {},
): TravelRecord {
  const { startDate, endDate, ...rest } = overrides

  return {
    id: `record-${place.placeId}`,
    placeId: place.placeId,
    boundaryId: place.boundaryId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    displayName: place.displayName,
    regionSystem: place.regionSystem,
    adminType: place.adminType,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
    startDate: startDate ?? null,
    endDate: endDate ?? null,
    createdAt: '2026-04-12T00:00:00.000Z',
    ...rest,
  }
}
```

**Same-user refresh test pattern** (lines 235-262):
```typescript
describe('refreshAuthenticatedSnapshot', () => {
  it('replaces records for the same user without resetting the session boundary or announcing an account switch', async () => {
    const authSessionStore = useAuthSessionStore()
    const mapPointsStore = useMapPointsStore()
    const mapUiStore = useMapUiStore()
    const currentUser = makeUser()
    const previousRecords = [makeRecord(PHASE12_RESOLVED_BEIJING, { id: 'record-prev' })]
    const nextRecords = [makeRecord(PHASE12_RESOLVED_CALIFORNIA, { id: 'record-next' })]
    const resetSpy = vi.spyOn(mapPointsStore, 'resetTravelRecordsForSessionBoundary')
    const applySpy = vi.spyOn(mapPointsStore, 'applyAuthoritativeTravelRecords')

    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = currentUser
    mapPointsStore.replaceTravelRecords(previousRecords)
    fetchBootstrapMock.mockResolvedValueOnce({
      authenticated: true,
      user: currentUser,
      records: nextRecords,
    })

    await authSessionStore.refreshAuthenticatedSnapshot()

    expect(fetchBootstrapMock).toHaveBeenCalledTimes(1)
    expect(resetSpy).not.toHaveBeenCalled()
    expect(applySpy).toHaveBeenLastCalledWith(nextRecords)
    expect(mapPointsStore.travelRecords).toEqual(nextRecords)
    expect(mapUiStore.interactionNotice?.message ?? '').not.toContain('已切换到')
  })
```

Planner instruction: if adding coverage here, create a same-user metadata-only variant by keeping the same record identity and changing `parentLabel`/display metadata in `nextRecords`. Assert `resetTravelRecordsForSessionBoundary` is not called and `applyAuthoritativeTravelRecords` receives the refreshed record.

## Shared Patterns

### Server-Authoritative Stats API

**Source:** `apps/web/src/services/api/stats.ts` lines 1-7
**Apply to:** `StatisticsPageView.vue`, `StatisticsPageView.spec.ts`
```typescript
import type { TravelStatsResponse } from '@trip-map/contracts'

import { apiFetchJson } from './client'

export async function fetchStats(): Promise<TravelStatsResponse> {
  return apiFetchJson<TravelStatsResponse>('/records/stats')
}
```

**Source:** `packages/contracts/src/stats.ts` lines 1-6
**Apply to:** stats response fixtures in tests
```typescript
export interface TravelStatsResponse {
  totalTrips: number
  uniquePlaces: number
  visitedCountries: number
  totalSupportedCountries: number
}
```

### Stats Store Request Guard

**Source:** `apps/web/src/stores/stats.ts` lines 22-58
**Apply to:** all stats refresh work; do not bypass this store
```typescript
async function fetchStatsData() {
  const requestId = ++activeRequestId
  const authSessionStore = useAuthSessionStore()
  const boundaryVersionAtStart = authSessionStore.boundaryVersion

  isLoading.value = true
  error.value = null

  try {
    const response = await fetchStats()
    if (
      authSessionStore.boundaryVersion !== boundaryVersionAtStart
      || requestId !== activeRequestId
    ) {
      return
    }

    stats.value = response
  } catch (cause) {
    if (
      authSessionStore.boundaryVersion !== boundaryVersionAtStart
      || requestId !== activeRequestId
    ) {
      return
    }

    if (isSessionUnauthorizedApiClientError(cause)) {
      authSessionStore.handleUnauthorized()
      return
    }

    error.value = 'fetch-failed'
  } finally {
    if (requestId === activeRequestId) {
      isLoading.value = false
    }
  }
}
```

**Source:** `apps/web/src/stores/stats.spec.ts` lines 76-93
**Apply to:** regression safety; keep this behavior green
```typescript
it('ignores stale responses after the auth boundary changes', async () => {
  const authSessionStore = useAuthSessionStore()
  const statsStore = useStatsStore()

  authSessionStore.status = 'authenticated'
  authSessionStore.currentUser = makeUser()

  fetchStatsMock.mockImplementationOnce(async () => {
    authSessionStore.boundaryVersion += 1
    return { totalTrips: 8, uniquePlaces: 5, visitedCountries: 3, totalSupportedCountries: 21 }
  })

  await statsStore.fetchStatsData()

  expect(statsStore.stats).toBeNull()
  expect(statsStore.error).toBeNull()
  expect(statsStore.isLoading).toBe(false)
})
```

### Same-User Auth Refresh

**Source:** `apps/web/src/stores/auth-session.ts` lines 210-255
**Apply to:** same-user metadata refresh path
```typescript
function refreshAuthenticatedSnapshot(): Promise<void> {
  if (refreshPromise.value) {
    return refreshPromise.value
  }

  if (status.value !== 'authenticated' || !currentUser.value) {
    return Promise.resolve()
  }

  const userId = currentUser.value.id
  const pendingRefresh = (async () => {
    try {
      const bootstrap = await fetchAuthBootstrap()

      if (!bootstrap.authenticated) {
        handleUnauthorized()
        return
      }

      if (bootstrap.user.id !== userId) {
        applyAuthenticatedSnapshot(bootstrap)
        return
      }

      const mapPointsStore = useMapPointsStore()
      mapPointsStore.applyAuthoritativeTravelRecords(bootstrap.records)
      currentUser.value = bootstrap.user
      status.value = 'authenticated'
    } catch (error) {
      if (isSessionUnauthorizedApiClientError(error)) {
        handleUnauthorized()
        return
      }

      useMapUiStore().setInteractionNotice({
        tone: 'warning',
        message: FOREGROUND_REFRESH_FAILED_NOTICE,
      })
    } finally {
      refreshPromise.value = null
    }
  })()

  refreshPromise.value = pendingRefresh
  return pendingRefresh
}
```

Planner instruction: do not force a boundary reset from this same-user path. Statistics invalidation should happen because `travelRecords` metadata changed and `StatisticsPageView.vue` observed the revision.

### Authoritative Travel Record Application

**Source:** `apps/web/src/stores/map-points.ts` lines 192-217
**Apply to:** understanding how bootstrap/same-user snapshots reach the statistics page
```typescript
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
```

### Persisted Metadata Consumption

**Source:** `apps/web/src/stores/map-points.ts` lines 51-68
**Apply to:** revision field selection for `StatisticsPageView.vue`
```typescript
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
```

The same metadata fields used by timeline/stat presentation are the fields the stats refresh revision should observe.

### Backend Statistics Semantics

**Source:** `apps/server/src/modules/records/records.repository.ts` lines 39-43
**Apply to:** deciding why `parentLabel` is statistics-critical
```typescript
function toCountryLabel(parentLabel: string | null) {
  const label = parentLabel ?? '未知'
  const separatorIndex = label.indexOf(' · ')
  return separatorIndex === -1 ? label : label.slice(0, separatorIndex)
}
```

**Source:** `apps/server/src/modules/records/records.repository.ts` lines 150-173
**Apply to:** no frontend-local aggregation
```typescript
async getTravelStats(userId: string): Promise<TravelStatsResponse> {
  const [totalTrips, uniquePlaceRecords, parentLabelRecords] = await Promise.all([
    this.prisma.userTravelRecord.count({ where: { userId } }),
    this.prisma.userTravelRecord.findMany({
      where: { userId },
      select: { placeId: true },
      distinct: ['placeId'],
    }),
    this.prisma.userTravelRecord.findMany({
      where: { userId },
      select: { parentLabel: true },
      distinct: ['parentLabel'],
    }),
  ])

  const visitedCountries = new Set(parentLabelRecords.map(record => toCountryLabel(record.parentLabel))).size

  return {
    totalTrips,
    uniquePlaces: uniquePlaceRecords.length,
    visitedCountries,
    totalSupportedCountries: TOTAL_SUPPORTED_TRAVEL_COUNTRIES,
  }
}
```

### Test Execution Pattern

**Source:** `31-RESEARCH.md` validation command map
**Apply to:** Phase 31 verification
```bash
pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/stores/auth-session.spec.ts
pnpm --filter @trip-map/web typecheck
```

## No Analog Found

None. The expected edits all have close existing analogs in the current codebase.

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| n/a | n/a | n/a | n/a |

## Metadata

**Analog search scope:** `apps/web/src`, `apps/server/src`, `packages/contracts/src`
**Files scanned:** 137 source files via `rg --files`
**Targeted source files read:** 10
**Project instructions read:** `AGENTS.md`, `CLAUDE.md`
**Project skills:** none found under `.claude/skills` or `.agents/skills`
**Pattern extraction date:** 2026-04-27
