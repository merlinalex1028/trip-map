# Phase 30: Travel Statistics & Completion Overview - Pattern Map

**Mapped:** 2026-04-23
**Files analyzed:** 9
**Analogs found:** 9 / 9

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `packages/contracts/src/stats.ts` | model | — | `packages/contracts/src/records.ts` | exact |
| `packages/contracts/src/index.ts` | config | — | `packages/contracts/src/index.ts` (modify) | exact |
| `apps/server/src/modules/records/records.repository.ts` | model | CRUD | `apps/server/src/modules/records/records.repository.ts` (modify) | exact |
| `apps/server/src/modules/records/records.service.ts` | service | CRUD | `apps/server/src/modules/records/records.service.ts` (modify) | exact |
| `apps/server/src/modules/records/records.controller.ts` | controller | request-response | `apps/server/src/modules/records/records.controller.ts` (modify) | exact |
| `apps/server/src/modules/records/records.service.spec.ts` | test | — | `apps/server/src/modules/records/records.service.spec.ts` (modify) | exact |
| `apps/web/src/services/api/stats.ts` | utility | request-response | `apps/web/src/services/api/records.ts` | exact |
| `apps/web/src/stores/stats.ts` | store | request-response | `apps/web/src/stores/map-points.ts` | role-match |
| `apps/web/src/components/statistics/StatCard.vue` | component | — | `apps/web/src/components/timeline/TimelineVisitCard.vue` | role-match |
| `apps/web/src/views/StatisticsPageView.vue` | component | request-response | `apps/web/src/views/TimelinePageView.vue` | exact |
| `apps/web/src/router/index.ts` | config | — | `apps/web/src/router/index.ts` (modify) | exact |
| `apps/web/src/components/auth/AuthTopbarControl.vue` | component | event-driven | `apps/web/src/components/auth/AuthTopbarControl.vue` (modify) | exact |

---

## Pattern Assignments

### `packages/contracts/src/stats.ts` (model, new file)

**Analog:** `packages/contracts/src/records.ts`

**Interface definition pattern** (lines 1–28 of records.ts):
```typescript
// Plain TypeScript interface, no class-validator decorators in contracts
export interface TravelStatsResponse {
  totalTrips: number
  uniquePlaces: number
}
```

---

### `packages/contracts/src/index.ts` (config, modify)

**Analog:** `packages/contracts/src/index.ts` lines 1–11

**Re-export pattern** (lines 1–11):
```typescript
// Add after existing exports — one line per new module
export * from './stats'
```

---

### `apps/server/src/modules/records/records.repository.ts` (model, CRUD — append method)

**Analog:** `apps/server/src/modules/records/records.repository.ts`

**Imports pattern** (lines 1–6):
```typescript
import { Inject, Injectable } from '@nestjs/common'
import type { SmokeRecordCreateRequest } from '@trip-map/contracts'
import type { SmokeRecord, UserTravelRecord } from '@prisma/client'

import { PrismaService } from '../../prisma/prisma.service.js'
import type { CreateTravelRecordDto } from './dto/create-travel-record.dto.js'
```

**New import to add** — `TravelStatsResponse` from contracts:
```typescript
import type { TravelStatsResponse } from '@trip-map/contracts'
```

**Core Prisma query pattern** (lines 62–67 — findAllTravelRecords as structural reference):
```typescript
async findAllTravelRecords(userId: string): Promise<UserTravelRecord[]> {
  return this.prisma.userTravelRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}
```

**New method to add** — parallel queries, `Promise.all`, `distinct`:
```typescript
async getTravelStats(userId: string): Promise<TravelStatsResponse> {
  const [totalTrips, uniquePlaceRecords] = await Promise.all([
    this.prisma.userTravelRecord.count({ where: { userId } }),
    this.prisma.userTravelRecord.findMany({
      where: { userId },
      select: { placeId: true },
      distinct: ['placeId'],
    }),
  ])
  return { totalTrips, uniquePlaces: uniquePlaceRecords.length }
}
```

---

### `apps/server/src/modules/records/records.service.ts` (service, CRUD — append method)

**Analog:** `apps/server/src/modules/records/records.service.ts`

**Imports pattern** (lines 1–18):
```typescript
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import type { SmokeRecord, UserTravelRecord } from '@prisma/client'
import type {
  ImportTravelRecordsResponse,
  SmokeRecordCreateRequest,
  SmokeRecordResponse,
  TravelRecord as ContractTravelRecord,
} from '@trip-map/contracts'
// Add TravelStatsResponse to the import above
```

**Service method pattern** (lines 70–72 — findAllTravel as structural reference):
```typescript
async findAllTravel(userId: string): Promise<ContractTravelRecord[]> {
  const records = await this.recordsRepository.findAllTravelRecords(userId)
  return records.map(toContractTravelRecord)
}
```

**New method to add** — thin delegation, no mapping needed:
```typescript
async getStats(userId: string): Promise<TravelStatsResponse> {
  return this.recordsRepository.getTravelStats(userId)
}
```

---

### `apps/server/src/modules/records/records.controller.ts` (controller, request-response — append handler)

**Analog:** `apps/server/src/modules/records/records.controller.ts`

**Imports pattern** (lines 1–28):
```typescript
import {
  Body, Controller, Delete, Get, HttpCode, Inject,
  Param, Post, UsePipes, UseGuards, ValidationPipe,
} from '@nestjs/common'
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import type {
  AuthUser,
  ImportTravelRecordsResponse,
  SmokeRecordResponse,
  TravelRecord as ContractTravelRecord,
} from '@trip-map/contracts'
// Add TravelStatsResponse to the import above

import { CurrentUser } from '../auth/decorators/current-user.decorator.js'
import { SessionAuthGuard } from '../auth/guards/session-auth.guard.js'
```

**Auth guard + GET handler pattern** (lines 52–60 — findAll as reference):
```typescript
@Get()
@ApiOperation({ summary: '获取所有旅行记录' })
@ApiOkResponse()
@UseGuards(SessionAuthGuard)
async findAll(
  @CurrentUser() user: AuthUser,
): Promise<ContractTravelRecord[]> {
  return this.recordsService.findAllTravel(user.id)
}
```

**New handler to add** — CRITICAL: `@Get('stats')` must be declared BEFORE `@Get()` to avoid route shadowing, or use a distinct path:
```typescript
@Get('stats')
@ApiOperation({ summary: '获取旅行统计' })
@ApiOkResponse()
@UseGuards(SessionAuthGuard)
async getStats(
  @CurrentUser() user: AuthUser,
): Promise<TravelStatsResponse> {
  return this.recordsService.getStats(user.id)
}
```

---

### `apps/server/src/modules/records/records.service.spec.ts` (test — append describe block)

**Analog:** `apps/server/src/modules/records/records.service.spec.ts`

**Mock factory pattern** (lines 8–16):
```typescript
function createRepositoryMock() {
  return {
    createSmokeRecord: vi.fn(),
    findAllTravelRecords: vi.fn(),
    createTravelRecord: vi.fn(),
    importTravelRecords: vi.fn(),
    deleteTravelRecordByPlaceId: vi.fn(),
    // Add: getTravelStats: vi.fn(),
  }
}
```

**Test case pattern** (lines 59–77 — createTravel test as reference):
```typescript
describe('RecordsService.getStats', () => {
  it('returns totalTrips and uniquePlaces from repository', async () => {
    const repository = createRepositoryMock()
    const service = new RecordsService(repository as never)

    repository.getTravelStats.mockResolvedValueOnce({ totalTrips: 3, uniquePlaces: 2 })

    const result = await service.getStats('user-1')

    expect(repository.getTravelStats).toHaveBeenCalledWith('user-1')
    expect(result).toEqual({ totalTrips: 3, uniquePlaces: 2 })
  })
})
```

---

### `apps/web/src/services/api/stats.ts` (utility, request-response — new file)

**Analog:** `apps/web/src/services/api/records.ts`

**Imports pattern** (lines 1–7 of records.ts):
```typescript
import type { TravelStatsResponse } from '@trip-map/contracts'
import { apiFetchJson } from './client'
```

**GET fetch pattern** — records.ts has no GET example; use the same `apiFetchJson` call shape:
```typescript
export async function fetchStats(): Promise<TravelStatsResponse> {
  return apiFetchJson<TravelStatsResponse>('/records/stats')
}
```

---

### `apps/web/src/stores/stats.ts` (store, request-response — new file)

**Analog:** `apps/web/src/stores/map-points.ts`

**Imports pattern** (lines 1–18 of map-points.ts):
```typescript
import { acceptHMRUpdate, defineStore } from 'pinia'
import { shallowRef } from 'vue'
import type { TravelStatsResponse } from '@trip-map/contracts'
import { fetchStats } from '../services/api/stats'
```

**Store skeleton pattern** (lines 85–95 of map-points.ts — defineStore setup function):
```typescript
export const useStatsStore = defineStore('stats', () => {
  const stats = shallowRef<TravelStatsResponse | null>(null)
  const isLoading = shallowRef(false)
  const error = shallowRef<string | null>(null)

  async function fetchStatsData() {
    isLoading.value = true
    error.value = null
    try {
      stats.value = await fetchStats()
    } catch {
      error.value = 'fetch-failed'
    } finally {
      isLoading.value = false
    }
  }

  return { stats, isLoading, error, fetchStatsData }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatsStore, import.meta.hot))
}
```

---

### `apps/web/src/components/statistics/StatCard.vue` (component — new file)

**Analog:** `apps/web/src/components/timeline/TimelineVisitCard.vue`

**Script setup pattern** (lines 1–23 of TimelineVisitCard.vue):
```typescript
<script setup lang="ts">
interface Props {
  label: string    // e.g. '总旅行次数'
  value: number    // e.g. 42
  unit: string     // e.g. '次旅行'
  gradient: string // CSS gradient string, e.g. 'linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,246,250,0.94))'
}

defineProps<Props>()
</script>
```

**Kawaii card shell pattern** (lines 26–28 of TimelineVisitCard.vue):
```html
<article
  class="grid gap-4 rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,246,250,0.94))] p-5 shadow-[var(--shadow-float)]"
  data-region="stat-card"
>
```

**Inner data cell pattern** (lines 56–63 of TimelineVisitCard.vue):
```html
<div class="rounded-[22px] border border-white/85 bg-white/78 p-4">
  <p class="text-[0.72rem] font-semibold tracking-[0.08em] text-[var(--color-ink-soft)] uppercase">
    {{ label }}
  </p>
  <p class="mt-2 text-base font-semibold text-[var(--color-ink-strong)]">
    {{ value }} {{ unit }}
  </p>
</div>
```

---

### `apps/web/src/views/StatisticsPageView.vue` (component, request-response — new file)

**Analog:** `apps/web/src/views/TimelinePageView.vue`

**Imports pattern** (lines 1–14 of TimelinePageView.vue):
```typescript
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import StatCard from '../components/statistics/StatCard.vue'
import { useAuthSessionStore } from '../stores/auth-session'
import { useStatsStore } from '../stores/stats'

const authSessionStore = useAuthSessionStore()
const statsStore = useStatsStore()

const { currentUser, status } = storeToRefs(authSessionStore)
const { stats, isLoading, error } = storeToRefs(statsStore)
```

**Four-state computed pattern** (lines 16–25 of TimelinePageView.vue):
```typescript
const isRestoring = computed(() => status.value === 'restoring')
const shouldShowAnonymousState = computed(
  () => status.value !== 'authenticated' || currentUser.value === null,
)
const shouldShowEmptyState = computed(
  // Use stats.totalTrips, NOT travelRecords.length — see Pitfall 1 in RESEARCH.md
  () => status.value === 'authenticated' && !isLoading.value && (stats.value?.totalTrips ?? 0) === 0,
)
const shouldShowStats = computed(
  () => status.value === 'authenticated' && !isLoading.value && (stats.value?.totalTrips ?? 0) > 0,
)

onMounted(() => {
  if (status.value === 'authenticated') {
    void statsStore.fetchStatsData()
  }
})
```

**Page shell pattern** (lines 29–31 of TimelinePageView.vue):
```html
<section
  class="flex min-h-0 flex-col gap-5 overflow-y-auto rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,248,251,0.94))] p-5 shadow-[var(--shadow-stage)] md:gap-6 md:p-6"
  data-region="statistics-shell"
  data-route-view="statistics"
>
```

**Header pill badge pattern** (lines 38–41 of TimelinePageView.vue):
```html
<p class="inline-flex w-fit items-center rounded-full border border-white/85 bg-white/88 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-[var(--color-ink-soft)] uppercase">
  Travel statistics
</p>
```

**Skeleton state pattern** (lines 69–91 of TimelinePageView.vue):
```html
<div
  v-if="isRestoring || isLoading"
  class="grid gap-4 rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-[var(--shadow-float)]"
  data-state="restoring"
  aria-live="polite"
>
  <!-- skeleton shimmer divs -->
</div>
```

**Anonymous state pattern** (lines 93–117 of TimelinePageView.vue):
```html
<div
  v-else-if="shouldShowAnonymousState"
  class="grid gap-4 rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,242,247,0.95))] p-5 shadow-[var(--shadow-float)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
  data-state="anonymous"
>
  <!-- login CTA -->
  <button type="button" @click="authSessionStore.openAuthModal('login')">立即登录</button>
</div>
```

**Populated state with StatCard grid:**
```html
<div v-else-if="shouldShowStats" class="grid gap-4 md:grid-cols-2" data-state="populated">
  <StatCard label="总旅行次数" :value="stats!.totalTrips" unit="次旅行" gradient="..." />
  <StatCard label="已去过地点数" :value="stats!.uniquePlaces" unit="个地点" gradient="..." />
</div>
```

---

### `apps/web/src/router/index.ts` (config — modify)

**Analog:** `apps/web/src/router/index.ts` lines 1–26

**Route registration pattern** (lines 13–18):
```typescript
{
  path: '/timeline',
  name: 'timeline',
  component: TimelinePageView,
},
// Add after:
{
  path: '/statistics',
  name: 'statistics',
  component: StatisticsPageView,
},
```

**Import to add** (line 4):
```typescript
import StatisticsPageView from '../views/StatisticsPageView.vue'
```

---

### `apps/web/src/components/auth/AuthTopbarControl.vue` (component — modify)

**Analog:** `apps/web/src/components/auth/AuthTopbarControl.vue`

**Navigation handler pattern** (lines 36–39):
```typescript
function handleNavigateToTimeline() {
  closeMenu()
  void router.push('/timeline')
}
// Add:
function handleNavigateToStatistics() {
  closeMenu()
  void router.push('/statistics')
}
```

**Menu button pattern** (lines 132–150 — timeline button as reference):
```html
<button
  type="button"
  class="mt-2 inline-flex min-h-11 w-full items-center gap-3 rounded-full border border-[color:color-mix(in_srgb,var(--color-accent)_24%,white_76%)] bg-white/86 px-4 py-2 text-sm font-semibold text-[var(--color-ink-strong)] shadow-[var(--shadow-button)] transition duration-[var(--motion-quick)] hover:bg-white"
  data-auth-menu-item="statistics"
  role="menuitem"
  @click="handleNavigateToStatistics"
>
  <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]" aria-hidden="true">
    <!-- icon -->
  </span>
  <span>统计</span>
</button>
```

Place this button between the timeline button (line 132) and the logout button (line 151).

---

## Shared Patterns

### Authentication Guard
**Source:** `apps/server/src/modules/records/records.controller.ts` lines 52–60
**Apply to:** `GET /records/stats` handler
```typescript
@UseGuards(SessionAuthGuard)
async getStats(@CurrentUser() user: AuthUser): Promise<TravelStatsResponse> {
  return this.recordsService.getStats(user.id)
}
```

### Auth Session State Branching
**Source:** `apps/web/src/views/TimelinePageView.vue` lines 10–25
**Apply to:** `StatisticsPageView.vue`
```typescript
const { currentUser, status } = storeToRefs(useAuthSessionStore())
const isRestoring = computed(() => status.value === 'restoring')
const shouldShowAnonymousState = computed(
  () => status.value !== 'authenticated' || currentUser.value === null,
)
```

### Kawaii Card Shell
**Source:** `apps/web/src/components/timeline/TimelineVisitCard.vue` lines 26–28
**Apply to:** `StatCard.vue`, `StatisticsPageView.vue` state panels
```html
class="grid gap-4 rounded-[28px] border border-white/80 bg-[linear-gradient(...)] p-5 shadow-[var(--shadow-float)]"
```

### Pinia shallowRef Store
**Source:** `apps/web/src/stores/map-points.ts` lines 85–95
**Apply to:** `apps/web/src/stores/stats.ts`
```typescript
const data = shallowRef<T | null>(null)
const isLoading = shallowRef(false)
const error = shallowRef<string | null>(null)
```

### HMR Accept
**Source:** `apps/web/src/stores/map-points.ts` lines 560–562
**Apply to:** `apps/web/src/stores/stats.ts`
```typescript
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatsStore, import.meta.hot))
}
```

---

## No Analog Found

All files have close analogs. No entries.

---

## Metadata

**Analog search scope:** `apps/server/src/modules/records/`, `apps/web/src/`, `packages/contracts/src/`
**Files scanned:** 12
**Pattern extraction date:** 2026-04-23
