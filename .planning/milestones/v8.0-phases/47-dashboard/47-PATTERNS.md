# Phase 47: 旅途回忆 Dashboard - Pattern Map

**Mapped:** 2026-05-22
**Files analyzed:** 18 new/modified code and test targets inferred from `47-CONTEXT.md` and `47-RESEARCH.md`
**Analogs found:** 17 / 18

## Scope Guard

- Phase 47 maps the existing authenticated `/memories` dashboard path. Keep `apps/web/src/components/shell/ShellSidebar.vue` and sidebar behavior/layout out of planning and implementation unless the user changes that constraint.
- `apps/web/src/router/index.ts` already declares `/memories` as `meta: { requiresAuth: true }` on lines 29-34. Use it as the route contract reference; do not create a sidebar task from it.
- Research leaves exact `apps/web/src/components/memories/` component boundaries to planning. Glob-like rows below classify the file families the research explicitly implies rather than locking final filenames.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `packages/contracts/src/stats.ts` | model | request-response | `packages/contracts/src/stats.ts` | exact |
| `packages/contracts/src/contracts.spec.ts` | test | request-response | `packages/contracts/src/contracts.spec.ts` | role-match |
| `apps/server/src/modules/records/records.controller.ts` | controller | request-response | `apps/server/src/modules/records/records.controller.ts` | exact |
| `apps/server/src/modules/records/records.service.ts` | service | request-response | `apps/server/src/modules/records/records.service.ts` | exact |
| `apps/server/src/modules/records/records.repository.ts` | service | batch | `apps/server/src/modules/records/records.repository.ts` | exact |
| `apps/server/src/modules/records/records.service.spec.ts` | test | batch | `apps/server/src/modules/records/records.service.spec.ts` | exact |
| `apps/web/src/services/api/stats.ts` | service | request-response | `apps/web/src/services/api/stats.ts` | exact |
| `apps/web/src/stores/stats.ts` | store | request-response | `apps/web/src/stores/stats.ts` | exact |
| `apps/web/src/stores/stats.spec.ts` | test | request-response | `apps/web/src/stores/stats.spec.ts` | exact |
| `apps/web/src/views/StatisticsPageView.vue` | component | request-response | `apps/web/src/views/StatisticsPageView.vue` | exact |
| `apps/web/src/views/StatisticsPageView.spec.ts` | test | request-response | `apps/web/src/views/StatisticsPageView.spec.ts` | exact |
| `apps/web/src/services/memories/*.ts` for pure option/display builders if extracted | utility | transform | `apps/web/src/services/timeline.ts` | role-match |
| `apps/web/src/services/memories/*.spec.ts` | test | transform | `apps/web/src/services/timeline.spec.ts` | role-match |
| `apps/web/src/components/memories/MemoriesOverview*.vue` | component | transform | `apps/web/src/components/statistics/StatCard.vue` | role-match |
| `apps/web/src/components/memories/MemoriesChart*.vue` | component | transform | `apps/web/src/components/common/BaseChart.vue` | role-match |
| `apps/web/src/components/memories/PopularFootprints*.vue` | component | transform | none | no-analog |
| `apps/web/src/components/memories/MemoryPostcardStrip*.vue` | component | transform | `apps/web/src/components/timeline/JournalPostcardThumb.vue` | partial |
| `apps/web/src/components/memories/*.spec.ts` | test | transform | `apps/web/src/components/timeline/TimelineVisitCard.spec.ts` | role-match |

## Pattern Assignments

### `packages/contracts/src/stats.ts` and contract coverage

**Role/data flow:** model, request-response

**Analog:** `packages/contracts/src/stats.ts`

**Current contract pattern** (`packages/contracts/src/stats.ts` lines 1-6):

```ts
export interface TravelStatsResponse {
  totalTrips: number
  uniquePlaces: number
  visitedCountries: number
  totalSupportedCountries: number
}
```

Copy the thin framework-free interface style. Phase 47 research points dashboard data back through this stats contract, so monthly/yearly buckets, country trip distribution, radar dimensions, Top 5 items, and recent postcard seeds should be typed here or in interfaces exported from here instead of being invented inside Vue components.

**Contract test pattern** (`packages/contracts/src/contracts.spec.ts` lines 1-17 and 32-49):

```ts
import { describe, expect, expectTypeOf, it } from 'vitest'

import type {
  CanonicalPlaceSummary,
  CanonicalPlaceRef,
  // ...
} from './index'

describe('@trip-map/contracts', () => {
  it('exports the canonical contracts from one entrypoint', () => {
    expectTypeOf<PlaceKind>().toEqualTypeOf<'CN_ADMIN' | 'OVERSEAS_ADMIN1'>()
    expectTypeOf<CanonicalPlaceRef>().toMatchTypeOf<{
      placeId: string
      boundaryId: string
      placeKind: 'CN_ADMIN' | 'OVERSEAS_ADMIN1'
      datasetVersion: string
    }>()
  })
})
```

Use this type-assertion style if the new stats payload gets explicit contract shape coverage. `packages/contracts/src/index.ts` already exports `./stats`; preserve the same entrypoint flow.

### Records stats endpoint: controller, service, repository

**Roles/data flow:** controller/request-response, service/request-response, service/batch

**Analogs:** the existing stats path in `apps/server/src/modules/records/records.controller.ts`, `records.service.ts`, and `records.repository.ts`

**Controller imports and guarded stats endpoint** (`records.controller.ts` lines 16-30 and 55-63):

```ts
import type {
  AuthUser,
  ImportTravelRecordsResponse,
  SmokeRecordResponse,
  TravelRecord as ContractTravelRecord,
  TravelStatsResponse,
} from '@trip-map/contracts'

import { CurrentUser } from '../auth/decorators/current-user.decorator.js'
import { SessionAuthGuard } from '../auth/guards/session-auth.guard.js'
import { RecordsService } from './records.service.js'

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

Keep user scope server-derived. The dashboard GET must continue taking `user.id` from `CurrentUser`; do not add a chart filter or client-supplied user id in this phase.

**Service boundary pattern** (`records.service.ts` lines 128-130):

```ts
async getStats(userId: string): Promise<TravelStatsResponse> {
  return this.recordsRepository.getTravelStats(userId)
}
```

The current stats service is deliberately thin. If formulas stay inside the repository, preserve this delegate. If aggregate derivation becomes complex enough for a service helper, keep controller shape unchanged and keep repository calls user-scoped.

**Repository import and current aggregate pattern** (`records.repository.ts` lines 1-8 and 178-201):

```ts
import { Inject, Injectable } from '@nestjs/common'
import type { SmokeRecordCreateRequest } from '@trip-map/contracts'
import type { TravelStatsResponse } from '@trip-map/contracts'
import type { SmokeRecord, UserTravelRecord } from '@prisma/client'

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

Use the same repository layer for account-authoritative aggregates. Distinct overview totals and occurrence-based chart/ranking reducers need separate calculations because Phase 47 country distribution and Top 5 repeat visits are not the same as current `visitedCountries`.

**Existing record selection convention** (`records.repository.ts` lines 70-75):

```ts
async findAllTravelRecords(userId: string): Promise<UserTravelRecord[]> {
  return this.prisma.userTravelRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}
```

Copy the `where: { userId }` boundary for any dashboard row selection before reducing dates, notes, tags, countries, or postcard seeds.

**Repository/service test pattern** (`records.service.spec.ts` lines 275-360):

```ts
describe('RecordsService.getStats', () => {
  it('delegates to repository and returns stats as-is', async () => {
    const repository = createRepositoryMock()
    const service = new RecordsService(repository as never)

    repository.getTravelStats.mockResolvedValueOnce({
      totalTrips: 3,
      uniquePlaces: 2,
      visitedCountries: 2,
      totalSupportedCountries: TOTAL_SUPPORTED_TRAVEL_COUNTRIES,
    })

    const result = await service.getStats('user-1')

    expect(repository.getTravelStats).toHaveBeenCalledWith('user-1')
    expect(result).toEqual({
      totalTrips: 3,
      uniquePlaces: 2,
      visitedCountries: 2,
      totalSupportedCountries: TOTAL_SUPPORTED_TRAVEL_COUNTRIES,
    })
  })
})

expect(prisma.userTravelRecord.findMany).toHaveBeenNthCalledWith(1, {
  where: { userId: 'user-1' },
  select: { placeId: true },
  distinct: ['placeId'],
})
```

Add new aggregate cases beside these stats tests: null travel dates excluded from trend buckets, repeat-country distribution counted by trips, Top 5 order fixed by repeat count then latest date, and any fourth overview metric rule made explicit.

### Stats API client and Pinia store

**Roles/data flow:** service/request-response and store/request-response

**Analogs:** `apps/web/src/services/api/stats.ts`, `apps/web/src/stores/stats.ts`

**API client pattern** (`apps/web/src/services/api/stats.ts` lines 1-7):

```ts
import type { TravelStatsResponse } from '@trip-map/contracts'

import { apiFetchJson } from './client'

export async function fetchStats(): Promise<TravelStatsResponse> {
  return apiFetchJson<TravelStatsResponse>('/records/stats')
}
```

If Phase 47 extends the existing response, the client should stay this small. A second memories API client only has a role-match if planning deliberately chooses a separate endpoint.

**Store state, stale request suppression, and unauthorized handling** (`apps/web/src/stores/stats.ts` lines 9-66):

```ts
export const useStatsStore = defineStore('stats', () => {
  const stats = shallowRef<TravelStatsResponse | null>(null)
  const isLoading = shallowRef(false)
  const error = shallowRef<string | null>(null)
  let activeRequestId = 0

  function reset() {
    activeRequestId += 1
    stats.value = null
    isLoading.value = false
    error.value = null
  }

  async function fetchStatsData() {
    const requestId = ++activeRequestId
    const authSessionStore = useAuthSessionStore()
    const boundaryVersionAtStart = authSessionStore.boundaryVersion
    // fetch, boundary checks, unauthorized handoff, and final loading cleanup
  }

  return { stats, isLoading, error, fetchStatsData, reset }
})
```

Do not move dashboard fetch lifecycle into chart components. Expand the cached stats shape or pair it with an equally auth-bound store only if the plan chooses a second data response.

**Store test pattern** (`apps/web/src/stores/stats.spec.ts` lines 24-93 and 114-168):

```ts
describe('stats store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchStatsMock.mockReset()
  })

  it('ignores stale responses after the auth boundary changes', async () => {
    const authSessionStore = useAuthSessionStore()
    const statsStore = useStatsStore()

    fetchStatsMock.mockImplementationOnce(async () => {
      authSessionStore.boundaryVersion += 1
      return { totalTrips: 8, uniquePlaces: 5, visitedCountries: 3, totalSupportedCountries: 21 }
    })

    await statsStore.fetchStatsData()

    expect(statsStore.stats).toBeNull()
    expect(statsStore.error).toBeNull()
  })
})
```

Keep success, unauthorized, boundary reset, and late-response coverage when the stats payload grows.

### `/memories` route view and view spec

**Role/data flow:** component/request-response

**Analog:** `apps/web/src/views/StatisticsPageView.vue`

**View imports and store wiring** (`StatisticsPageView.vue` lines 1-22):

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, shallowRef, watch } from 'vue'
import { RouterLink } from 'vue-router'

import { useAuthSessionStore } from '../stores/auth-session'
import { useMapPointsStore } from '../stores/map-points'
import { useStatsStore } from '../stores/stats'

const authSessionStore = useAuthSessionStore()
const mapPointsStore = useMapPointsStore()
const statsStore = useStatsStore()

const { boundaryVersion, currentUser, status } = storeToRefs(authSessionStore)
const { travelRecords } = storeToRefs(mapPointsStore)
const { stats, isLoading, error } = storeToRefs(statsStore)
</script>
```

Copy the route-level Composition API wiring. New populated dashboard sections should get typed props from this view or its feature container rather than reading auth/session/store state independently.

**State gates and refresh revision pattern** (`StatisticsPageView.vue` lines 24-112):

```ts
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

watch(
  () => boundaryVersion.value,
  () => {
    pendingRefreshAfterLoad.value = false
    statsStore.reset()
    fetchStatsIfAuthenticated()
  },
)

watch(
  () => travelRecordRevision.value,
  (nextRevision, previousRevision) => {
    if (previousRevision !== undefined && nextRevision !== previousRevision) {
      if (isLoading.value) {
        pendingRefreshAfterLoad.value = true
        return
      }
      void statsStore.fetchStatsData()
    }
  },
)
```

Preserve the route state machine while splitting the populated branch. `47-CONTEXT.md` requires honest zero-data behavior; empty accounts should not mount example charts, rankings, or postcards.

**Populated section seam to replace with focused memories components** (`StatisticsPageView.vue` lines 262-300):

```vue
<div v-else-if="shouldShowStats" class="grid gap-4" data-state="populated">
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
    <StatCard
      label="总旅行次数"
      :value="stats!.totalTrips"
      unit="次旅行"
      gradient="linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,246,250,0.94))"
    />
  </div>
</div>
```

This is the current three-card branch that Phase 47 grows into overview, charts, ranking, and postcards. Keep restoring, anonymous, error, and empty branches in the route view.

**View mount and state test pattern** (`StatisticsPageView.spec.ts` lines 57-139):

```ts
function mountStatisticsPage(setup?: (context: {
  authSessionStore: ReturnType<typeof useAuthSessionStore>
  mapPointsStore: ReturnType<typeof useMapPointsStore>
}) => void) {
  const pinia = createPinia()
  setActivePinia(pinia)
  // store setup and RouterLink stub
  return { authSessionStore, mapPointsStore, wrapper }
}

it('renders the updated empty and error copy contracts', async () => {
  fetchStatsMock.mockResolvedValue({ totalTrips: 0, uniquePlaces: 0, visitedCountries: 0, totalSupportedCountries: 21 })
  // ...
  expect(wrapper.get('[data-state="empty"]').text()).toContain('还没有留下足迹')
})
```

**Refresh regression pattern** (`StatisticsPageView.spec.ts` lines 141-204):

```ts
it('re-fetches statistics after travel records change during an in-flight request', async () => {
  fetchStatsMock
    .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve }))
    .mockImplementationOnce(() => new Promise((resolve) => { resolveSecond = resolve }))

  mapPointsStore.replaceTravelRecords([beijingRecord, californiaRecord])
  await nextTick()
  expect(fetchStatsMock).toHaveBeenCalledTimes(1)

  resolveFirst({ totalTrips: 1, uniquePlaces: 1, visitedCountries: 1, totalSupportedCountries: 21 })
  await flushPromises()
  expect(fetchStatsMock).toHaveBeenCalledTimes(2)
})
```

Extend this spec for dashboard branch absence/presence and refresh behavior. Keep behavior assertions on `data-state` / section test ids instead of static mockup strings.

### `apps/web/src/services/memories/*.ts` option and display helpers

**Role/data flow:** utility/transform

**Analog:** `apps/web/src/services/timeline.ts`

**Transform shape and stable sorting pattern** (`timeline.ts` lines 1-19 and 41-89):

```ts
import type { TravelRecord } from '@trip-map/contracts'

export interface TimelineEntry {
  recordId: string
  placeId: string
  startDate: string | null
  hasKnownDate: boolean
  sortDate: string | null
  visitOrdinal: number
  visitCount: number
}

function compareTimelineEntries(
  left: Omit<TimelineEntry, 'visitOrdinal' | 'visitCount'>,
  right: Omit<TimelineEntry, 'visitOrdinal' | 'visitCount'>,
) {
  if (left.hasKnownDate !== right.hasKnownDate) {
    return left.hasKnownDate ? -1 : 1
  }
  // date comparison, createdAt comparison, then id comparison
}

export function buildTimelineEntries(records: TravelRecord[]): TimelineEntry[] {
  const sortedEntries = records.map(toTimelineEntry).sort(compareTimelineEntries)
  const visitCounts = new Map<string, number>()
  // aggregate counts first, enrich entries second
}
```

Use this as the closest pure transform analog when extracting chart option builders, display-ready labels, or deterministic postcard variant selection. Keep raw server aggregate truth separate from Vue templates; avoid hiding sorting and bucket semantics in templates.

**Transform tests** (`timeline.spec.ts` lines 36-123 and 154-212):

```ts
describe('buildTimelineEntries', () => {
  it('orders dated entries from earliest to latest', () => {
    const entries = buildTimelineEntries([late, early, middle])
    expect(entries.map((entry) => entry.recordId)).toEqual([
      'beijing-early',
      'california-middle',
      'tokyo-late',
    ])
  })

  it('places unknown-date entries after dated entries', () => {
    expect(entries.map((entry) => entry.hasKnownDate)).toEqual([true, false, false])
    expect(entries.slice(1).map((entry) => entry.sortDate)).toEqual([null, null])
  })
})
```

For new memories helpers, mirror fixture builders and direct result assertions. This is a good home for chart option tests if options are extracted out of component SFCs.

### Memories overview and chart components

**Roles/data flow:** component/transform

**Analogs:** `apps/web/src/components/statistics/StatCard.vue`, `apps/web/src/components/common/BaseChart.vue`, and only for BaseChart usage shape `apps/web/src/components/showcase/UiChartShowcase.vue`

**Typed display component pattern** (`StatCard.vue` lines 1-39):

```vue
<script setup lang="ts">
interface Props {
  label: string
  value: number
  unit: string
  gradient: string
}

defineProps<Props>()
</script>

<template>
  <article data-region="stat-card" :style="{ background: gradient }">
    <p data-stat="label">{{ label }}</p>
    <p data-stat="value">{{ value }}</p>
    <p data-stat="unit">{{ unit }}</p>
  </article>
</template>
```

Keep memories section children prop-driven and focused. If the four overview cards move into a new `memories` folder, this is the card contract to reuse or adapt.

**Chart wrapper option type and state boundary** (`BaseChart.vue` lines 1-41 and 44-92):

```vue
<script setup lang="ts">
import type { ComposeOption } from 'echarts/core'
import VChart from 'vue-echarts'
import { YUME_KAWAII_CHART_THEME } from '@/lib/charts/theme'
import '@/lib/charts/register'

export type YumeChartOption = ComposeOption<
  | LineSeriesOption
  | PieSeriesOption
  | BarSeriesOption
  | RadarSeriesOption
  | GridComponentOption
  | LegendComponentOption
  | TitleComponentOption
  | TooltipComponentOption
>
</script>

<template>
  <section data-base-chart :aria-busy="loading">
    <div v-if="error" role="alert" data-state="error" />
    <div v-else-if="empty" data-state="empty" />
    <div v-else-if="loading" data-state="loading" />
    <VChart v-else :option="option" :theme="YUME_KAWAII_CHART_THEME" :autoresize="{ throttle: 100 }" />
  </section>
</template>
```

All Phase 47 line, doughnut/pie, bar, and radar panels should render through `BaseChart`. Use returned real aggregate arrays to decide empty options; do not bypass the registered chart stack.

**BaseChart usage example with anti-pattern warning** (`UiChartShowcase.vue` lines 1-10 and 19-41):

```vue
<script setup lang="ts">
import type { YumeChartOption } from '@/components/common/BaseChart.vue'
import BaseChart from '@/components/common/BaseChart.vue'

const demoOption: YumeChartOption = {
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
  yAxis: { type: 'value' },
  series: [{ type: 'line', data: [2, 4, 3, 5, 7, 6], smooth: true }],
}
</script>
```

Copy the `YumeChartOption` import and `<BaseChart>` wrapper shape only. Do not copy `demoOption` values into production memories charts.

**Chart test seam** (`BaseChart.spec.ts` lines 13-50):

```ts
vi.mock('vue-echarts', () => ({
  default: {
    name: 'VChart',
    props: ['option', 'theme', 'autoresize', 'loading'],
    template: '<div data-mocked-vchart :data-theme="theme" :data-autoresize="JSON.stringify(autoresize)"></div>',
  },
}))

it('renders VChart with yume-kawaii theme and autoresize', () => {
  const wrapper = mount(BaseChart, { props: { option } })
  expect(wrapper.find('[data-mocked-vchart]').exists()).toBe(true)
})
```

Use helper assertions for ECharts option content and component assertions for state/render boundaries. Do not make new section tests depend on actual canvas rendering.

### Popular footprints ranking

**Role/data flow:** component/transform

**Closest transform analog:** `apps/web/src/services/timeline.ts` lines 41-89 for deterministic compare/count enrichment.

**Closest visual record analog:** `apps/web/src/components/timeline/TimelineVisitCard.vue` lines 31-56 and 121-193 for a prop-driven travel-memory item with date/place context.

```vue
<script setup lang="ts">
const props = defineProps<{
  entry: TimelineEntry
}>()

const dateLabel = computed(() => {
  if (props.entry.startDate === null) {
    return '日期未知'
  }
  return props.entry.endDate !== null
    ? `${props.entry.startDate} - ${props.entry.endDate}`
    : props.entry.startDate
})
</script>

<template>
  <article data-region="timeline-entry">
    <p>{{ dateLabel }}</p>
    <h3>{{ entry.displayName }}</h3>
  </article>
</template>
```

There is no existing Top 5 visual ranking component. Planner should treat the ranking SFC as new presentation work while copying deterministic counting/tie-break testing discipline from `timeline.ts` and the prop-driven travel-memory card shape from `TimelineVisitCard`.

### Memory postcard strip and postcard helpers

**Role/data flow:** component/transform

**Analogs:** `apps/web/src/components/timeline/JournalPostcardThumb.vue`, `apps/web/src/components/timeline/journal-thumbnails.ts`, `apps/web/src/components/timeline/TimelineVisitCard.spec.ts`

**Decorative media atom** (`JournalPostcardThumb.vue` lines 1-30):

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { getJournalPostcardImage, type JournalPostcardVariant } from './journal-thumbnails'

const props = defineProps<{ variant: JournalPostcardVariant }>()
const postcardSrc = computed(() => getJournalPostcardImage(props.variant))
</script>

<template>
  <div data-journal-postcard :data-variant="props.variant" aria-hidden="true">
    <img :src="postcardSrc" alt="" draggable="false" data-journal-postcard-image>
  </div>
</template>
```

Use this for decorative image semantics. Phase 47 strip itself must still show real place/date context outside the decorative image because the strip is record-tied.

**Deterministic variant selection** (`journal-thumbnails.ts` lines 8-28 and 55-82):

```ts
export type JournalPostcardVariant =
  | 'river'
  | 'kyoto'
  | 'paris'
  | 'shanghai'

const JOURNAL_POSTCARD_IMAGES: Record<JournalPostcardVariant, string> = {
  river: riverThumbnail,
  kyoto: kyotoThumbnail,
  paris: parisThumbnail,
  shanghai: shanghaiThumbnail,
}

export function getJournalPostcardVariant(entry: TimelineEntry): JournalPostcardVariant {
  const displayNameVariant = getSemanticPostcardVariant(entry.displayName.toLowerCase())
  // semantic lookup, then stable place-context hash fallback
  return JOURNAL_POSTCARD_VARIANTS[hash % JOURNAL_POSTCARD_VARIANTS.length]
}
```

Reuse or mirror deterministic scenic mapping. Do not turn the strip into upload/photo-viewer affordances.

**Postcard tests to copy** (`journal-thumbnails.spec.ts` lines 77-108 and `TimelineVisitCard.spec.ts` lines 126-185):

```ts
it('derives the variant from stable place context fields', () => {
  const variants = new Set([
    getJournalPostcardVariant(makeEntry({ placeId: 'jp-kyoto' })),
    getJournalPostcardVariant(makeEntry({ displayName: '河源', parentLabel: '中国' })),
  ])

  expect(variants).toEqual(new Set(['kyoto', 'river']))
})

it('renders the decorative postcard as hidden from assistive technology with a stable variant', () => {
  const postcard = wrapper.get('[data-journal-postcard]')
  expect(postcard.attributes('aria-hidden')).toBe('true')
  expect(wrapper.get('[data-journal-postcard-image]').attributes('alt')).toBe('')
})

it('does not use v-html in the card source', () => {
  const source = readFileSync('src/components/timeline/TimelineVisitCard.vue', 'utf8')
  expect(source).not.toContain('v-html')
})
```

Add strip-specific tests for recent dated record selection, horizontal browse semantics, visible place/date copy, and absence of deep-links, zoom, upload, and viewer behavior.

## Shared Patterns

### Authentication and Account Scope

**Sources:** `apps/web/src/router/index.ts` lines 29-34; `apps/server/src/modules/records/records.controller.ts` lines 55-63; `apps/server/src/modules/records/records.repository.ts` lines 178-190

**Apply to:** `/memories` route composition and every server aggregate query

```ts
{
  path: '/memories',
  name: 'travel-memories',
  component: StatisticsPageView,
  meta: { requiresAuth: true },
}

@UseGuards(SessionAuthGuard)
async getStats(@CurrentUser() user: AuthUser): Promise<TravelStatsResponse> {
  return this.recordsService.getStats(user.id)
}
```

### Route State and Freshness

**Sources:** `apps/web/src/stores/stats.ts` lines 9-66; `apps/web/src/views/StatisticsPageView.vue` lines 24-112

**Apply to:** the stats store and the route view after dashboard sections are split out

- Keep `activeRequestId` and `authSessionStore.boundaryVersion` checks in the store.
- Keep authenticated-only fetch, boundary reset, record revision refresh, and one queued follow-up refresh in the route view.
- Keep empty dashboards honest: `totalTrips === 0` routes to the existing empty branch instead of fake populated charts.

### Aggregate Truth

**Sources:** `records.repository.ts` lines 39-43 and 178-201; `packages/contracts/src/records.ts` lines 13-30

**Apply to:** overview totals, chart reducers, ranking, radar, and postcard seeds

```ts
function toCountryLabel(parentLabel: string | null) {
  const label = parentLabel ?? '未知'
  const separatorIndex = label.indexOf(' · ')
  return separatorIndex === -1 ? label : label.slice(0, separatorIndex)
}
```

Available real record fields include `placeId`, `boundaryId`, labels, nullable `startDate` / `endDate`, `notes`, and `tags`. Use them to derive explainable dashboard data. Do not infer trend dates from `createdAt` when `startDate` is missing.

### Vue Component Data Flow

**Sources:** `StatCard.vue` lines 1-39; `BaseChart.vue` lines 30-92; `TimelineVisitCard.vue` lines 31-56

**Apply to:** new memories overview, chart panel, ranking item, and postcard strip SFCs

- Keep new SFCs in `<script setup lang="ts">`.
- Pass typed aggregate arrays or item props down from the route/feature container.
- Use pure services for chart option/display derivations when logic grows; do not make each component fetch the stats endpoint.

### Testing

**Sources:** `records.service.spec.ts` lines 275-401; `StatisticsPageView.spec.ts` lines 57-204; `timeline.spec.ts` lines 36-212; `BaseChart.spec.ts` lines 13-50

**Apply to:** all new Phase 47 stats and memories files

- Server stats tests assert repository user scope and reducer semantics.
- View tests mock `fetchStats`, mount Pinia stores, and assert route states and refresh lifecycle.
- Pure helper tests use record fixtures and deterministic sort/bucket/result assertions.
- Chart component tests mock `vue-echarts`; helper tests own option payload details.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `apps/web/src/components/memories/PopularFootprints*.vue` | component | transform | The repo has memory-oriented cards and visit-count transforms, but no existing visual Top 5 ranking component with repeat-count and latest-date ordering. |

## Metadata

**Analog search scope:** `packages/contracts/src`, `apps/server/src/modules/records`, `apps/web/src/{router,views,stores,services,components}`
**Files scanned:** 24 code and test files read after targeted `rg` search
**Pattern groups selected:** records stats boundary; stats API/store; `/memories` route view; chart wrapper/cards; timeline/postcard transforms
**Pattern extraction date:** 2026-05-22
