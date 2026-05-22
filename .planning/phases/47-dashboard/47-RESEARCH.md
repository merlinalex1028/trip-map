# Phase 47: 旅途回忆 Dashboard - Research

**Researched:** 2026-05-22  
**Domain:** authenticated travel memories dashboard, server-authoritative travel aggregates, Vue/ECharts dashboard composition  
**Confidence:** MEDIUM [VERIFIED: .planning/phases/47-dashboard/47-CONTEXT.md + codebase grep + Context7 + npm registry]

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions [VERIFIED: .planning/phases/47-dashboard/47-CONTEXT.md]

### Trend and Distribution Semantics
- **D-01:** Monthly trend and yearly trend charts use trip count as their primary metric. Each travel record with a usable travel date contributes one trip occurrence to its date bucket.
- **D-02:** Country/region distribution also uses trip count. Repeated visits should change the distribution instead of being collapsed into unique-place counts.
- **D-03:** Phase 47 is an all-time dashboard. Do not add a time-range filter or make chart/ranking modules respond to `全部时间` controls in this phase.
- **D-04:** Records without a travel date do not enter monthly or yearly trend charts. They may still contribute to overview cards, country/region distribution, ranking, or other non-time-bucketed memories surfaces when their data supports it.

### Memories Profile Radar
- **D-05:** The radar chart must use only dimensions that can be stably derived from existing real account travel fields. Do not invent unsupported style scores only to copy the high-fidelity mockup labels.
- **D-06:** If the mockup's style dimensions such as scenery, culture, or food cannot be justified from current record fields, replace them with explainable real memories-profile dimensions and rename the chart language accordingly.
- **D-07:** The radar should feel like a gentle memories profile, not a professional rating report. Its labels and supporting copy should make the shape understandable without overstating precision.
- **D-08:** A small amount of data may still produce an initial profile when the selected real-data dimensions support it. The surface should communicate that it is an early profile rather than hide the module solely because the account is young.

### Popular Footprint Ranking
- **D-09:** Popular footprints rank places by repeat visit count.
- **D-10:** When repeat visit counts tie, the place with the more recent visit sorts first.
- **D-11:** Each ranking item should foreground place name, visit count, and most recent visit date. The ranking must stay visual and memory-oriented rather than falling back to a traditional data table.
- **D-12:** The ranking surface is fixed to Top 5 for Phase 47. Do not add expanded ranking browsing or a larger leaderboard flow.

### Memory Postcard Strip
- **D-13:** The bottom memories strip is a set of decorative postcards associated with real travel records. The visuals are illustrative/scenic memory slots, not uploaded user photos and not generic decoration detached from account history.
- **D-14:** Prefer the most recent dated travel memories when selecting postcards for the strip.
- **D-15:** Each postcard should carry lightweight place and date context so its real-memory association remains visible while the image still leads.
- **D-16:** The postcard strip is browse-only horizontal media for Phase 47. Do not add detail jumps, journal deep-links, zoom viewers, or photo-viewer semantics.

### the agent's Discretion [VERIFIED: .planning/phases/47-dashboard/47-CONTEXT.md]
Downstream agents may choose the exact real-data radar dimensions, chart/card component boundaries, postcard illustration mapping, number of postcards shown in the visible viewport, and whether newly required aggregates live in an expanded stats response or a clearly derived memories data layer, as long as the decisions above remain locked and no static fake dashboard data is shown.

### Deferred Ideas (OUT OF SCOPE) [VERIFIED: .planning/phases/47-dashboard/47-CONTEXT.md]

- Time-range filtering remains out of Phase 47 even though the high-fidelity reference shows an all-time control.
- Postcard click-through to journal entries, zoom viewers, or photo-viewer behavior remains out of Phase 47.
- Favorites, user photo upload, and a real achievement/badge system remain future capabilities outside v8.0 memories work.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MEM-01 | `/statistics` 页面重命名并视觉升级为“旅途回忆”。 [VERIFIED: .planning/REQUIREMENTS.md] | Existing route is already authenticated `/memories`; research maps the remaining dashboard composition and old-name inventory. [VERIFIED: apps/web/src/router/index.ts + apps/web/src/router/index.spec.ts] |
| MEM-02 | 展示总旅行次数、去过地点、去过城市或行政区、去过国家/地区四个概览卡。 [VERIFIED: .planning/REQUIREMENTS.md] | Current stats contract has only `totalTrips`, `uniquePlaces`, and `visitedCountries`; planner must define the fourth overview aggregate explicitly. [VERIFIED: packages/contracts/src/stats.ts + apps/server/src/modules/records/records.repository.ts] |
| MEM-03 | 展示月度趋势折线图、国家/地区分布环图、年度趋势柱状图和旅行风格雷达图。 [VERIFIED: .planning/REQUIREMENTS.md] | Existing `BaseChart` and ECharts registration already cover line, pie, bar, and radar; real-data bucket semantics come from Context decisions. [VERIFIED: apps/web/src/components/common/BaseChart.vue + apps/web/src/lib/charts/register.ts + 47-CONTEXT.md] |
| MEM-04 | 展示视觉化热门足迹排行，不使用传统表格。 [VERIFIED: .planning/REQUIREMENTS.md] | Research prescribes repeat-count ranking, recent-visit tie break, and a Top 5 visual list contract. [VERIFIED: .planning/phases/47-dashboard/47-CONTEXT.md] |
| MEM-05 | 展示回忆图片横滑/视觉缩略图区，不提供用户上传照片能力。 [VERIFIED: .planning/REQUIREMENTS.md] | Phase 46 already established deterministic decorative postcard assets and helpers that Phase 47 can reuse or parallel. [VERIFIED: apps/web/src/components/timeline/journal-thumbnails.ts + prd/v8.0/ASSET-MANIFEST.md] |
| MEM-06 | 图表和排行来自当前账号真实记录或 server-authoritative stats，不展示静态假数据。 [VERIFIED: .planning/REQUIREMENTS.md] | Research recommends extending the guarded `/records/stats` response and keeping chart components display-only. [VERIFIED: apps/server/src/modules/records/records.controller.ts + apps/web/src/services/api/stats.ts] |
| MEM-07 | 无旅行记录时展示空状态，不渲染误导性示例图表。 [VERIFIED: .planning/REQUIREMENTS.md] | Current memories view and `BaseChart` already expose empty states; tests need to assert chart/ranking/postcard absence for zero trips. [VERIFIED: apps/web/src/views/StatisticsPageView.vue + apps/web/src/components/common/BaseChart.vue] |
</phase_requirements>

## Summary

Phase 47 should be planned as a real aggregate dashboard upgrade on the existing authenticated `/memories` route, not as a new public statistics page. [VERIFIED: .planning/phases/47-dashboard/47-CONTEXT.md + apps/web/src/router/index.ts] The current page already owns auth/restoring/error/empty/populated state transitions, stats refresh after account-boundary changes, and refresh after travel-record revision changes. [VERIFIED: apps/web/src/views/StatisticsPageView.vue + apps/web/src/views/StatisticsPageView.spec.ts] The current data contract is not yet dashboard-sized: `TravelStatsResponse` only exposes total trips, unique places, visited countries, and supported-country count. [VERIFIED: packages/contracts/src/stats.ts]

Plan the primary data work in the existing records stats boundary. [VERIFIED: apps/server/src/modules/records/records.controller.ts + apps/server/src/modules/records/records.service.ts + apps/server/src/modules/records/records.repository.ts] Trends, country distribution, ranking, profile inputs, and recent dated postcard seeds all originate from the current user's `UserTravelRecord` rows; date strings are validated as `YYYY-MM-DD`, notes and tags already exist, and the records repository already filters stats by `userId`. [VERIFIED: apps/server/prisma/schema.prisma + apps/server/src/modules/records/dto/create-travel-record.dto.ts + apps/server/src/modules/records/dto/update-travel-record.dto.ts + apps/server/src/modules/records/records.repository.ts] Keeping aggregate derivation behind the guarded stats response gives planner tasks one authority path for MEM-02, MEM-03, MEM-04, MEM-06, and MEM-07. [VERIFIED: apps/server/src/modules/records/records.controller.ts + .planning/REQUIREMENTS.md]

The major unresolved semantics are not library questions. [VERIFIED: codebase grep] Current canonical records represent `CN_ADMIN` or `OVERSEAS_ADMIN1` places; `placeId` and `boundaryId` are both one-summary canonical identities in the metadata catalog, so the requirement split between “去过地点” and “去过城市或行政区” needs an explicit aggregate rule before implementation claims two different numbers. [VERIFIED: packages/contracts/src/place.ts + apps/server/src/modules/canonical-places/place-metadata-catalog.ts + apps/server/src/modules/records/records.repository.ts] The radar also must be renamed to a memories profile unless its dimensions are explainable ratios or counts from real fields such as distinct places, countries, repeat visits, dated-record coverage, notes, and tags. [VERIFIED: .planning/phases/47-dashboard/47-CONTEXT.md + packages/contracts/src/records.ts]

**Primary recommendation:** Extend the existing guarded `/records/stats` contract with a Phase 47 memories dashboard payload, keep `/memories` view orchestration thin, build each chart from `BaseChart` options over returned real aggregates, and treat postcard visuals as deterministic illustrations attached to recent dated records. [VERIFIED: apps/server/src/modules/records/records.controller.ts + apps/web/src/views/StatisticsPageView.vue + apps/web/src/components/common/BaseChart.vue + apps/web/src/components/timeline/journal-thumbnails.ts]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Authenticated `/memories` route states and dashboard composition | Browser / Client | API / Backend | Vue Router already protects `/memories`, and `StatisticsPageView` already orchestrates the route states. [VERIFIED: apps/web/src/router/index.ts + apps/web/src/views/StatisticsPageView.vue] |
| Overview totals, trends, country distribution, and ranking | API / Backend | Database / Storage | Aggregates must stay scoped to the current user through the existing guarded records stats boundary. [VERIFIED: apps/server/src/modules/records/records.controller.ts + apps/server/src/modules/records/records.repository.ts] |
| Monthly/yearly bucket truth | API / Backend | Database / Storage | Only rows with usable `startDate` may enter time buckets, and persisted record dates are validated as `YYYY-MM-DD`. [VERIFIED: 47-CONTEXT.md + apps/server/src/modules/records/dto/create-travel-record.dto.ts] |
| ECharts option construction and responsive rendering | Browser / Client | API / Backend | API returns dashboard data; client maps it into `YumeChartOption` and renders through existing `BaseChart`. [VERIFIED: apps/web/src/components/common/BaseChart.vue + apps/web/src/lib/charts/register.ts] |
| Explainable memories profile | API / Backend | Browser / Client | Derived dimensions should be computed from real record fields centrally and explained gently by the client copy. [VERIFIED: 47-CONTEXT.md + packages/contracts/src/records.ts] |
| Recent postcard selection and horizontal browsing | API / Backend | Browser / Client | Recent dated record seeds should be account-scoped; frontend maps place context to decorative scenic assets and browse-only strip semantics. [VERIFIED: 47-CONTEXT.md + apps/web/src/components/timeline/journal-thumbnails.ts] |

## Project Constraints (from AGENTS.md)

- 与用户交流始终使用中文，除非用户明确要求切换语言。 [VERIFIED: AGENTS.md]
- 开始实现前先简要说明将执行的操作。 [VERIFIED: AGENTS.md]
- 修改代码时优先保持改动最小，并遵循现有项目结构与风格。 [VERIFIED: AGENTS.md]
- GSD 流程允许按 workflow 需要启动、并行或委派代理；若使用子代理，必须等待返回后再继续。 [VERIFIED: AGENTS.md]
- 完成后用中文简要说明变更内容、影响范围与验证结果。 [VERIFIED: AGENTS.md]

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue | Repo resolved `3.5.32`; npm latest `3.5.34`, published 2026-05-06 | Route view and section components | Existing web app uses Vue 3 SFCs with `<script setup lang="ts">`; stay with that pattern. [VERIFIED: pnpm list + npm registry + apps/web/src/views/StatisticsPageView.vue] |
| Pinia | Repo resolved and npm latest `3.0.4`, published 2025-11-05 | Stats fetch lifecycle and auth-bound store reset | Existing `useStatsStore` already handles stale request suppression and session-boundary reset. [VERIFIED: pnpm list + npm registry + apps/web/src/stores/stats.ts] |
| Apache ECharts | Repo resolved `6.0.0`; npm latest `6.1.0`, published 2026-05-19 | Line, doughnut-style pie, bar, and radar rendering | Phase 42 already registered the exact chart families Phase 47 needs and ECharts official docs support tree-shakeable chart registration. [VERIFIED: pnpm list + npm registry + apps/web/src/lib/charts/register.ts] [CITED: https://echarts.apache.org/handbook/en/basics/import/] |
| `vue-echarts` | Repo resolved and npm latest `8.0.1`, published 2025-10-11 | Vue component wrapper around ECharts | Existing `BaseChart` already passes `option`, theme, and `autoresize` through `VChart`. [VERIFIED: pnpm list + npm registry + apps/web/src/components/common/BaseChart.vue] [CITED: https://github.com/ecomfe/vue-echarts/blob/main/README.md] |
| Records stats endpoint + Prisma Client | Repo endpoint `/records/stats`; repo resolved `@prisma/client@6.19.3`; npm latest `7.8.0`, modified 2026-05-19 | Account-scoped aggregate source | Existing controller/service/repository layer already provides guarded server-authoritative stats over `UserTravelRecord`. [VERIFIED: apps/server/src/modules/records/records.controller.ts + apps/server/src/modules/records/records.repository.ts + pnpm list + npm registry] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest + Vue Test Utils | Repo resolved `vitest@4.1.4`; npm latest `4.1.7`, published 2026-05-20 | Unit/component behavior coverage | Use for stats reducers, option builders, view state branches, store lifecycle, and visual-list semantics. [VERIFIED: pnpm list + npm registry + apps/web/vitest.config.ts] |
| Existing `BaseChart` | Local Phase 42 component | Theme, sizing, autoresize, loading/empty/error chart states | Use for all four chart modules; do not place raw `VChart` configuration in every dashboard section. [VERIFIED: apps/web/src/components/common/BaseChart.vue + apps/web/src/components/common/BaseChart.spec.ts] |
| Journal postcard helpers/assets | Local Phase 46 code and v8 assets | Deterministic scenic illustration mapping | Reuse or mirror for memories strip variants attached to real dated record seeds. [VERIFIED: apps/web/src/components/timeline/journal-thumbnails.ts + apps/web/src/assets/v8/journal-thumbnails + prd/v8.0/ASSET-MANIFEST.md] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Existing `BaseChart` + ECharts | A new chart package or hand-built SVG/canvas charts | Conflicts with the Phase 42 ECharts foundation and duplicates theme/state/resizing work. [VERIFIED: .planning/phases/42-ui-primitives-yume-kawaii-theme-bridge/42-CONTEXT.md + apps/web/src/components/common/BaseChart.vue] |
| Expanded server stats payload | Frontend-only aggregation from `mapPointsStore.travelRecords` | Current product decision keeps statistics server-authoritative; client-only reducers risk duplicating country extraction and refresh truth across UI modules. [VERIFIED: .planning/PROJECT.md + apps/server/src/modules/records/records.repository.ts + apps/web/src/views/StatisticsPageView.vue] |
| Decorative record-tied postcards | Photo upload, photo viewer, or generic carousel decoration | Upload/viewer work is explicitly out of scope and generic decoration would violate real-memory association. [VERIFIED: .planning/REQUIREMENTS.md + 47-CONTEXT.md] |

**Installation:**
```bash
# Phase 47 should reuse the already installed chart stack.
pnpm --filter @trip-map/web list echarts vue-echarts vue pinia vitest --depth 0
```
[VERIFIED: apps/web/package.json + pnpm list]

**Version verification:** Registry checks were run with `npm view <package> version time --json` for `vue`, `pinia`, `echarts`, `vue-echarts`, and `vitest`, plus `npm view @prisma/client@7.8.0 version time.modified`, on 2026-05-22. [VERIFIED: npm registry] Phase 47 planning should prefer the repo-resolved chart stack first; make a dependency upgrade task only if the dashboard work exposes a concrete need. [VERIFIED: apps/web/package.json + apps/server/package.json + pnpm list]

## Architecture Patterns

### System Architecture Diagram

```text
Authenticated browser request
        |
        v
Vue Router /memories guard
        |
        v
StatisticsPageView route orchestrator
        |                          \
        | auth/restoring/error       \ zero totalTrips
        | states                      v
        |------------------------> empty memories state
        |
        v
useStatsStore.fetchStatsData()
        |
        v
GET /records/stats  -- SessionAuthGuard --> CurrentUser.id
        |
        v
RecordsService.getStats(userId)
        |
        v
RecordsRepository + UserTravelRecord rows
        |
        +--> overview totals / fourth overview rule
        +--> date decision: startDate usable?
        |          | yes                 | no
        |          v                     v
        |     monthly + yearly buckets   exclude from time charts
        +--> country trip distribution
        +--> Top 5 repeat-count ranking + recent-visit tie break
        +--> real memories-profile dimensions
        +--> recent dated postcard seeds
        |
        v
Shared stats contract
        |
        +--> overview/ranking/postcard section props
        +--> chart option builders --> BaseChart --> ECharts canvas
```
[VERIFIED: apps/web/src/router/index.ts + apps/web/src/stores/stats.ts + apps/server/src/modules/records/records.controller.ts + apps/server/src/modules/records/records.repository.ts + 47-CONTEXT.md]

### Recommended Project Structure

```text
packages/contracts/src/
└── stats.ts                         # extend typed memories dashboard response

apps/server/src/modules/records/
├── records.repository.ts            # user-scoped record selection and aggregates
└── records.service.ts               # existing stats boundary

apps/web/src/
├── views/StatisticsPageView.vue     # keep as route/state orchestration or rename coherently
├── stores/stats.ts                  # existing account-bound fetch lifecycle
├── services/memories/               # pure chart-option and display derivation helpers if needed
└── components/memories/             # overview, chart panels, footprint ranking, postcard strip
```
[VERIFIED: packages/contracts/src/stats.ts + apps/server/src/modules/records + apps/web/src/views/StatisticsPageView.vue] [VERIFIED: vue-best-practices skill]

### Pattern 1: Expand One Account-Scoped Dashboard Contract

**What:** Add a memories dashboard shape to the existing stats response or a nested payload returned by the same guarded `/records/stats` boundary; every aggregate carries display-ready data derived from the current user's rows. [VERIFIED: apps/server/src/modules/records/records.controller.ts + apps/server/src/modules/records/records.repository.ts]  
**When to use:** Use for overview totals, chart data series, ranking entries, radar dimensions, and recent postcard seeds that must stay aligned after edits, deletes, metadata refresh, and session changes. [VERIFIED: apps/web/src/views/StatisticsPageView.vue + apps/web/src/views/StatisticsPageView.spec.ts]

**Recommended payload direction:**
```ts
// Source: codebase stats boundary + Context7 Prisma aggregation docs
export interface TravelMemoriesDashboard {
  overview: {
    totalTrips: number
    uniquePlaces: number
    visitedAdministrativeAreas: number
    visitedCountries: number
  }
  monthlyTrend: Array<{ month: string; tripCount: number }>
  yearlyTrend: Array<{ year: string; tripCount: number }>
  countryDistribution: Array<{ countryLabel: string; tripCount: number }>
  popularFootprints: Array<{
    placeId: string
    displayName: string
    visitCount: number
    latestVisitDate: string | null
  }>
  profile: Array<{ key: string; label: string; value: number; max: number }>
  postcards: Array<{ recordId: string; placeId: string; displayName: string; startDate: string }>
}
```
[VERIFIED: packages/contracts/src/stats.ts + packages/contracts/src/records.ts + apps/server/src/modules/records/records.repository.ts] [CITED: https://www.prisma.io/docs/concepts/components/prisma-client/aggregation-grouping-summarizing/]

### Pattern 2: Thin Route View, Focused Dashboard Sections

**What:** Keep route/auth/fetch state in `StatisticsPageView`; split overview, chart grid, ranking, and postcard strip into focused presentational components with typed props. [VERIFIED: apps/web/src/views/StatisticsPageView.vue] [VERIFIED: vue-best-practices skill]  
**When to use:** The populated dashboard has at least four independent UI sections and should not become a single large route template. [VERIFIED: .planning/REQUIREMENTS.md] [VERIFIED: vue-best-practices skill]

### Pattern 3: Chart Panels Build Options, `BaseChart` Renders Them

**What:** Build `YumeChartOption` objects from returned aggregate arrays and render through the existing themed wrapper. [VERIFIED: apps/web/src/components/common/BaseChart.vue + apps/web/src/components/showcase/UiChartShowcase.vue] [CITED: https://echarts.apache.org/handbook/en/basics/import/]  
**When to use:** Use for line, doughnut/ring pie, bar, and radar modules so empty/loading/error states stay consistent. [VERIFIED: apps/web/src/lib/charts/register.ts + apps/web/src/components/common/BaseChart.vue]

### Pattern 4: Explainable Profile Ratios

**What:** Prefer radar dimensions whose numerator and denominator are visible in existing records, such as dated-record coverage, note/tag coverage, repeat-visit share, distinct-place share, or country spread per unique place. [VERIFIED: packages/contracts/src/records.ts + 47-CONTEXT.md]  
**When to use:** Use when mockup dimensions such as “风景 / 美食 / 文化” are not supported by canonical record fields. [VERIFIED: 47-CONTEXT.md]

### Anti-Patterns to Avoid

- **Demo chart data leaking from the showcase:** `UiChartShowcase` contains explicit demo line data; production memories charts must not reuse it. [VERIFIED: apps/web/src/components/showcase/UiChartShowcase.vue + .planning/REQUIREMENTS.md]
- **Bucket unknown dates by `createdAt`:** Context explicitly excludes records without travel dates from monthly and yearly trend charts. [VERIFIED: 47-CONTEXT.md]
- **Client chart components each reduce raw records differently:** that duplicates country parsing, tie-break logic, and empty-data behavior. [VERIFIED: apps/server/src/modules/records/records.repository.ts + apps/web/src/views/StatisticsPageView.vue]
- **Copying the mockup `全部时间` control or style-score labels verbatim:** time filtering is deferred and unsupported radar labels would overstate precision. [VERIFIED: 47-CONTEXT.md + prd/v8.0/UI/旅途回忆.png]
- **Treating postcard strip imagery as photos:** v8 assets and Phase 46 establish decorative illustrations, not upload/photo-viewer semantics. [VERIFIED: prd/v8.0/ASSET-MANIFEST.md + apps/web/src/components/timeline/journal-thumbnails.ts]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dashboard charts | Custom SVG/canvas line, ring, bar, or radar renderers | `BaseChart` + ECharts + current chart theme | The exact chart families, resize behavior, and state wrapper already exist. [VERIFIED: apps/web/src/components/common/BaseChart.vue + apps/web/src/lib/charts/register.ts] |
| Account scoping for aggregates | Client-provided `userId` or a new ad hoc endpoint without guard | Existing `SessionAuthGuard`, `CurrentUser`, records stats service/repository boundary | Current stats already derive user scope on the server. [VERIFIED: apps/server/src/modules/records/records.controller.ts] |
| Example-state visualization | Hard-coded fake series, ranking items, or postcards for populated states | Zero-data empty state and real aggregate arrays | MEM-06 and MEM-07 prohibit static fake dashboard data. [VERIFIED: .planning/REQUIREMENTS.md] |
| Memory strip media | Upload flow, image storage, zoom viewer, journal deep-link carousel | Decorative scenic variants mapped to recent real record seeds | Upload/viewer/detail navigation are deferred. [VERIFIED: 47-CONTEXT.md + prd/v8.0/ASSET-MANIFEST.md] |
| Record-derived refresh lifecycle | New page-local session cache | Existing stats store reset/request-id pattern and existing record-revision watch | Current memories page already avoids stale stats after session or record changes. [VERIFIED: apps/web/src/stores/stats.ts + apps/web/src/views/StatisticsPageView.vue] |

**Key insight:** Phase 47 complexity is data truth and semantics, not chart plumbing. [VERIFIED: 47-CONTEXT.md + apps/web/src/lib/charts/register.ts] Reusing the existing stats and chart foundations keeps planner tasks focused on a single aggregate contract, view composition, and behavior tests. [VERIFIED: apps/server/src/modules/records/records.repository.ts + apps/web/src/components/common/BaseChart.vue]

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `UserTravelRecord` stores travel fields, dates, notes, tags, place ids, and country path labels; the schema does not store the old `/statistics` route string. [VERIFIED: apps/server/prisma/schema.prisma + codebase grep] | Code edit only for new aggregates; no route-name data migration identified. [VERIFIED: apps/server/prisma/schema.prisma] |
| Live service config | No repository-owned workflow, service config, or runtime config reference to `/statistics` was found in the non-Markdown code/config audit. [VERIFIED: codebase grep] | None identified in-repo; do not invent an external config migration task without a declared service. [VERIFIED: codebase grep] |
| OS-registered state | No `launchd`, `systemd`, or `pm2` registration path for `/statistics` or `memories` was found in repo code/config. [VERIFIED: codebase grep] | None identified. [VERIFIED: codebase grep] |
| Secrets/env vars | Server config references database env vars such as `DATABASE_URL`; no secret/env name tied to `statistics` or `memories` was found. [VERIFIED: apps/server/prisma/schema.prisma + apps/server/scripts/vitest-run.mjs + codebase grep] | None identified for rename semantics. [VERIFIED: codebase grep] |
| Build artifacts | Source still has internal `StatisticsPageView` and `components/statistics/StatCard` names while router tests deliberately let legacy `/statistics` fall through. [VERIFIED: apps/web/src/router/index.ts + apps/web/src/router/index.spec.ts + apps/web/src/views/StatisticsPageView.vue] | Decide whether internal file/component rename is worth the churn; no installed artifact migration identified. [VERIFIED: codebase grep] |

## Common Pitfalls

### Pitfall 1: Treating the mockup as a data source
**What goes wrong:** Trend lines, Top 5 entries, donut segments, or scenic cards render even when the account has no records. [VERIFIED: prd/v8.0/UI/旅途回忆.png + .planning/REQUIREMENTS.md]  
**Why it happens:** The high-fidelity screenshot carries complete example data and the chart showcase has demo options. [VERIFIED: prd/v8.0/UI/旅途回忆.png + apps/web/src/components/showcase/UiChartShowcase.vue]  
**How to avoid:** Gate populated modules from the real stats payload; keep zero-trip behavior at the page level and set chart empty states from real arrays only. [VERIFIED: apps/web/src/views/StatisticsPageView.vue + apps/web/src/components/common/BaseChart.vue]  
**Warning signs:** A populated chart option literal contains month values or country percentages unrelated to a stats response. [VERIFIED: codebase grep]

### Pitfall 2: Polluting trends with records that lack travel dates
**What goes wrong:** Unknown-date records are silently placed in the current month/year or in `createdAt` buckets. [VERIFIED: 47-CONTEXT.md]  
**Why it happens:** `createdAt` is always present while `startDate` is nullable. [VERIFIED: packages/contracts/src/records.ts]  
**How to avoid:** Filter monthly/yearly buckets on usable `startDate`; keep non-time modules free to count the same record when data supports it. [VERIFIED: 47-CONTEXT.md + apps/server/src/modules/records/dto/create-travel-record.dto.ts]  
**Warning signs:** Tests with a null `startDate` change monthly or yearly totals. [VERIFIED: packages/contracts/src/records.ts]

### Pitfall 3: Losing repeat-visit and country semantics
**What goes wrong:** Distribution collapses repeated visits to unique countries, or ranking sorts by alphabetical place name before recent-visit tie-break. [VERIFIED: 47-CONTEXT.md]  
**Why it happens:** Current stats uses distinct sets for overview counts, while Phase 47 chart/ranking semantics use trip occurrences and repeat counts. [VERIFIED: apps/server/src/modules/records/records.repository.ts + 47-CONTEXT.md]  
**How to avoid:** Keep separate reducers for overview distinct counts, country trip distribution, and Top 5 repeat ranking with deterministic tie-break tests. [VERIFIED: 47-CONTEXT.md]  
**Warning signs:** Country distribution reuses `visitedCountries` or Top 5 item count is always one. [VERIFIED: apps/server/src/modules/records/records.repository.ts]

### Pitfall 4: Inventing style scores
**What goes wrong:** The radar promises scenery, food, history, or vacation ratings that the data model cannot derive. [VERIFIED: 47-CONTEXT.md + packages/contracts/src/records.ts]  
**Why it happens:** The mockup labels look product-ready, but current travel rows only carry canonical place metadata, dates, notes, and tags. [VERIFIED: prd/v8.0/UI/旅途回忆.png + packages/contracts/src/records.ts]  
**How to avoid:** Rename the panel to a memories profile and compute only explainable counts or ratios from existing fields. [VERIFIED: 47-CONTEXT.md]  
**Warning signs:** Radar values are static numbers or depend on image variant choice. [VERIFIED: codebase grep]

### Pitfall 5: Dropping the existing stale-data protections
**What goes wrong:** Edits, deletes, metadata refreshes, or account switches leave dashboard numbers stale. [VERIFIED: apps/web/src/views/StatisticsPageView.spec.ts + apps/web/src/stores/stats.spec.ts]  
**Why it happens:** The current page has a record-revision watcher and stats store request-id/boundary logic that a rewrite can bypass. [VERIFIED: apps/web/src/views/StatisticsPageView.vue + apps/web/src/stores/stats.ts]  
**How to avoid:** Preserve store reset and refresh semantics while splitting populated UI into children. [VERIFIED: apps/web/src/views/StatisticsPageView.vue]  
**Warning signs:** New dashboard components fetch independently or survive a session boundary with cached payload. [VERIFIED: apps/web/src/stores/stats.ts]

### Pitfall 6: Assuming the fourth overview metric is already modeled
**What goes wrong:** “去过地点” and “去过城市或行政区” ship as ambiguous or accidentally duplicated values with no contract name explaining the difference. [VERIFIED: .planning/REQUIREMENTS.md + packages/contracts/src/stats.ts]  
**Why it happens:** Current stored canonical place kinds are already admin-place granular and the existing stats contract only exposes `uniquePlaces`. [VERIFIED: packages/contracts/src/place.ts + apps/server/prisma/schema.prisma + packages/contracts/src/stats.ts]  
**How to avoid:** Lock the aggregate rule in the plan before UI work; if `placeId` and `boundaryId` are intentionally the two distinct concepts, name and test both fields accordingly. [VERIFIED: packages/contracts/src/place.ts + apps/server/src/modules/canonical-places/place-metadata-catalog.ts]  
**Warning signs:** The fourth card is implemented by copying `uniquePlaces` without an explicit requirement note or test fixture. [VERIFIED: .planning/REQUIREMENTS.md]

## Code Examples

Verified patterns from current code and official docs:

### ECharts line option over a real monthly aggregate
```ts
// Source: ECharts option docs + local BaseChart YumeChartOption
import type { YumeChartOption } from '@/components/common/BaseChart.vue'

export function buildMonthlyTrendOption(
  points: Array<{ month: string; tripCount: number }>,
): YumeChartOption {
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: points.map(point => point.month) },
    yAxis: { type: 'value', min: 0 },
    series: [{
      name: '旅行次数',
      type: 'line',
      smooth: true,
      data: points.map(point => point.tripCount),
    }],
  }
}
```
[VERIFIED: apps/web/src/components/common/BaseChart.vue] [CITED: https://echarts.apache.org/handbook/en/basics/import/]

### User-scoped record selection for a dashboard reducer
```ts
// Source: existing RecordsRepository boundary + Prisma grouping docs
const records = await prisma.userTravelRecord.findMany({
  where: { userId },
  select: {
    id: true,
    placeId: true,
    boundaryId: true,
    displayName: true,
    parentLabel: true,
    startDate: true,
    notes: true,
    tags: true,
  },
})

const datedRecords = records.filter(
  (record): record is typeof record & { startDate: string } =>
    record.startDate !== null,
)
```
[VERIFIED: apps/server/src/modules/records/records.repository.ts + apps/server/prisma/schema.prisma] [CITED: https://www.prisma.io/docs/concepts/components/prisma-client/aggregation-grouping-summarizing/]

### Top 5 repeat ranking tie break
```ts
// Source: Phase 47 CONTEXT.md decisions D-09 through D-12
rankedPlaces
  .sort((left, right) =>
    right.visitCount - left.visitCount
    || (right.latestVisitDate ?? '').localeCompare(left.latestVisitDate ?? '')
    || left.displayName.localeCompare(right.displayName)
    || left.placeId.localeCompare(right.placeId),
  )
  .slice(0, 5)
```
[VERIFIED: .planning/phases/47-dashboard/47-CONTEXT.md + packages/contracts/src/records.ts]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Lightweight memories page with three overview cards | Real dashboard with four overview cards, four charts, Top 5 footprints, and postcard strip | Phase 47 requirement set | Planner must expand data contract and component composition. [VERIFIED: apps/web/src/views/StatisticsPageView.vue + .planning/REQUIREMENTS.md] |
| Rendering chart screenshots from high-fidelity comps | Real ECharts options rendered through themed `BaseChart` | Phase 42 chart foundation | Mockup charts guide layout only; data must come from account records. [VERIFIED: .planning/phases/42-ui-primitives-yume-kawaii-theme-bridge/42-CONTEXT.md + prd/v8.0/ASSET-MANIFEST.md] |
| All-in ECharts import path | Tree-shakeable `echarts/core` registration with selected charts/components/renderer | ECharts official NPM import guidance and local Phase 42 setup | Phase 47 should add option builders, not a second chart registration path. [VERIFIED: apps/web/src/lib/charts/register.ts] [CITED: https://echarts.apache.org/handbook/en/basics/import/] |
| Mockup “旅行风格” labels treated as product scores | Explainable memories-profile dimensions from current record fields | Phase 47 context decisions | Radar copy and formulas must stay honest on sparse data. [VERIFIED: 47-CONTEXT.md + packages/contracts/src/records.ts] |

**Deprecated/outdated:**
- Treating `/statistics` as a live route is outdated in current code; router tests intentionally let the old path fall through while `/memories` is the named route. [VERIFIED: apps/web/src/router/index.ts + apps/web/src/router/index.spec.ts]
- Using screenshot chart slices is disallowed for v8 statistics surfaces because charts need real data and responsive DOM. [VERIFIED: prd/v8.0/ASSET-MANIFEST.md + prd/v8.0/CUTTING-GUIDE.md]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | No `[ASSUMED]` factual claims are used in this research. [VERIFIED: research provenance audit] | All sections | Planner still must resolve the explicit overview semantic open question before implementation. [VERIFIED: Open Questions] |

## Open Questions

1. **What is the contract difference between “去过地点” and “去过城市或行政区”?** [VERIFIED: .planning/REQUIREMENTS.md]
   - What we know: Current `TravelStatsResponse` has `uniquePlaces`; persisted travel records carry canonical `placeId`, `boundaryId`, and kinds `CN_ADMIN` or `OVERSEAS_ADMIN1`. [VERIFIED: packages/contracts/src/stats.ts + packages/contracts/src/place.ts + apps/server/prisma/schema.prisma]
   - What's unclear: The codebase does not yet name a separate city/admin overview metric, and canonical metadata maps both place and boundary identities to the same place summary. [VERIFIED: apps/server/src/modules/canonical-places/place-metadata-catalog.ts + packages/contracts/src/stats.ts]
   - Recommendation: Before card implementation, choose and test one explicit rule. The conservative rule is `uniquePlaces = distinct placeId` and `visitedAdministrativeAreas = distinct boundaryId`, with copy/tests accepting that current canonical records can make the counts equal. [VERIFIED: packages/contracts/src/place.ts + apps/server/src/modules/canonical-places/place-metadata-catalog.ts]

2. **Should the internal `StatisticsPageView` file family be renamed during Phase 47?** [VERIFIED: apps/web/src/router/index.ts + apps/web/src/views/StatisticsPageView.vue]
   - What we know: User-facing route and copy are already `/memories` and `旅途回忆`; old `/statistics` falls through in router tests. [VERIFIED: apps/web/src/router/index.ts + apps/web/src/router/index.spec.ts]
   - What's unclear: MEM-01 can be satisfied visually without an internal file rename, but the old symbol names will remain visible to maintainers. [VERIFIED: .planning/REQUIREMENTS.md + codebase grep]
   - Recommendation: Keep runtime route behavior unchanged; rename internal files only if the plan batches import/test updates in a focused task and avoids mixing that churn with aggregate semantics. [VERIFIED: codebase grep]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite/Vitest/Nest build and tests | ✓ | `v22.22.1` | — [VERIFIED: `node --version`] |
| npm registry access | Version verification | ✓ | npm CLI `10.9.4` | Use repo lock/package manifests if registry is unavailable during execution. [VERIFIED: `npm --version` + npm registry checks] |
| pnpm workspace CLI | package scripts | ✓ | Root declares `pnpm@10.33.0`; `pnpm list` succeeded in this workspace | Use root package manager spec and existing package scripts. [VERIFIED: package.json + pnpm list] |
| Vitest | web/server/contracts tests | ✓ | local `4.1.4` | — [VERIFIED: pnpm list + `pnpm --filter @trip-map/web exec vitest --version`] |
| PostgreSQL CLI/service | Full DB-backed server e2e execution | ✗ CLI probe | `pg_isready` and `psql` not found in this shell | Server unit specs remain runnable; `apps/server/scripts/vitest-run.mjs` skips DB-backed e2e specs when DB is unreachable on full run. [VERIFIED: command probes + apps/server/scripts/vitest-run.mjs] |
| Docker daemon | Possible local PostgreSQL fallback | client present, daemon unavailable in sandbox probe | client `28.5.2` | Use an already running DB or defer DB-backed e2e specs until daemon/socket access is available. [VERIFIED: `docker version` probe] |

**Missing dependencies with no fallback:**
- None for research and Phase 47 unit/component planning. [VERIFIED: existing Vitest configs + server test runner]

**Missing dependencies with fallback:**
- PostgreSQL service access is not confirmed in this shell; focused repository/service specs and web component tests cover plan waves until DB-backed e2e can run. [VERIFIED: command probes + apps/server/scripts/vitest-run.mjs]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `4.1.4` with Vue Test Utils in `apps/web`; Vitest node environment in `apps/server` and `packages/contracts`. [VERIFIED: pnpm list + apps/web/vitest.config.ts + apps/server/vitest.config.ts + packages/contracts/vitest.config.ts] |
| Config file | `apps/web/vitest.config.ts`, `apps/server/vitest.config.ts`, `packages/contracts/vitest.config.ts`. [VERIFIED: codebase grep] |
| Quick run command | `pnpm --filter @trip-map/web test -- src/views/StatisticsPageView.spec.ts` plus `pnpm --filter @trip-map/server test -- src/modules/records/records.service.spec.ts` for stats contract work. [VERIFIED: apps/web/package.json + apps/server/package.json + apps/server/scripts/vitest-run.mjs] |
| Full suite command | `pnpm test`. [VERIFIED: package.json] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MEM-01 | `/memories` renders memories dashboard route/copy and legacy `/statistics` does not revive | component + router | `pnpm --filter @trip-map/web test -- src/router/index.spec.ts src/views/StatisticsPageView.spec.ts` | ✅ [VERIFIED: apps/web/src/router/index.spec.ts + apps/web/src/views/StatisticsPageView.spec.ts] |
| MEM-02 | Four overview cards reflect typed stats aggregates | server unit + component | `pnpm --filter @trip-map/server test -- src/modules/records/records.service.spec.ts` and web view spec | ✅ existing files, new assertions needed [VERIFIED: codebase grep] |
| MEM-03 | Line/donut/bar/radar options render from real aggregate payload and empty arrays do not show fake charts | helper + component | `pnpm --filter @trip-map/web test -- src/views/StatisticsPageView.spec.ts src/components/common/BaseChart.spec.ts` | ✅ base/view files; option-helper spec is Wave 0 if helper is extracted [VERIFIED: codebase grep] |
| MEM-04 | Top 5 ranking uses repeat count then recent visit tie break and visual list semantics | helper/server unit + component | `pnpm --filter @trip-map/server test -- src/modules/records/records.service.spec.ts` and ranking component spec | ❌ ranking-specific spec not present [VERIFIED: codebase grep] |
| MEM-05 | Record-tied horizontal postcard strip exists without upload/viewer/deep-link semantics | component | `pnpm --filter @trip-map/web test -- src/views/StatisticsPageView.spec.ts` plus postcard strip spec | ❌ memories strip spec not present [VERIFIED: codebase grep] |
| MEM-06 | Dashboard data remains current-user/server-derived and refreshes after record/session changes | store + view + server unit | `pnpm --filter @trip-map/web test -- src/stores/stats.spec.ts src/views/StatisticsPageView.spec.ts` and server stats spec | ✅ [VERIFIED: apps/web/src/stores/stats.spec.ts + apps/web/src/views/StatisticsPageView.spec.ts + apps/server/src/modules/records/records.service.spec.ts] |
| MEM-07 | Zero trips shows one honest empty state and omits charts/ranking/postcards | component | `pnpm --filter @trip-map/web test -- src/views/StatisticsPageView.spec.ts` | ✅ file exists, stronger negative assertions needed [VERIFIED: apps/web/src/views/StatisticsPageView.spec.ts] |

### Sampling Rate
- **Per task commit:** Run the focused web or server spec for the layer changed. [VERIFIED: existing package scripts]
- **Per wave merge:** `pnpm --filter @trip-map/web test -- src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/components/common/BaseChart.spec.ts` plus `pnpm --filter @trip-map/server test -- src/modules/records/records.service.spec.ts`. [VERIFIED: existing spec files]
- **Phase gate:** `pnpm test` green before `$gsd-verify-work`; note DB-backed server e2e skip behavior if PostgreSQL remains unreachable. [VERIFIED: package.json + apps/server/scripts/vitest-run.mjs]

### Wave 0 Gaps
- [ ] Add stats-contract coverage for the new memories payload and fourth overview metric in existing contracts/server stats specs. [VERIFIED: packages/contracts/src/stats.ts + apps/server/src/modules/records/records.service.spec.ts]
- [ ] Add a ranking reducer or server aggregate test that fixes Top 5, repeat-count ordering, and recent-date tie break. [VERIFIED: .planning/phases/47-dashboard/47-CONTEXT.md + codebase grep]
- [ ] Add a memories chart option/helper spec if chart options leave the route view. [VERIFIED: apps/web/src/components/common/BaseChart.spec.ts + vue-best-practices skill]
- [ ] Add a memories postcard strip component/view test for real record association, decorative-image semantics, horizontal browse UI, and absence of upload/viewer links. [VERIFIED: 47-CONTEXT.md + codebase grep]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Keep `/memories` behind router auth metadata and `/records/stats` behind `SessionAuthGuard`. [VERIFIED: apps/web/src/router/index.ts + apps/server/src/modules/records/records.controller.ts] [CITED: https://devguide.owasp.org/en/11-security-gap-analysis/01-guides/02-asvs/] |
| V3 Session Management | yes | Preserve auth-session boundary reset and stats request-id stale-response suppression. [VERIFIED: apps/web/src/stores/stats.ts + apps/web/src/views/StatisticsPageView.vue] [CITED: https://devguide.owasp.org/en/11-security-gap-analysis/01-guides/02-asvs/] |
| V4 Access Control | yes | Derive aggregate user scope only from `CurrentUser().id`; never accept user id from chart requests. [VERIFIED: apps/server/src/modules/records/records.controller.ts + apps/server/src/modules/records/records.repository.ts] [CITED: https://devguide.owasp.org/en/11-security-gap-analysis/01-guides/02-asvs/] |
| V5 Input Validation | yes | Continue using validated persisted date strings and DTO validation for record writes; dashboard GET should not add free-form aggregate filters in this phase. [VERIFIED: apps/server/src/modules/records/dto/create-travel-record.dto.ts + apps/server/src/modules/records/dto/update-travel-record.dto.ts + 47-CONTEXT.md] [CITED: https://devguide.owasp.org/en/11-security-gap-analysis/01-guides/02-asvs/] |
| V6 Cryptography | no new phase surface | Reuse existing session/auth stack; Phase 47 should not add cryptography or media-secret handling. [VERIFIED: apps/server/src/modules/records/records.controller.ts + .planning/REQUIREMENTS.md] [CITED: https://devguide.owasp.org/en/11-security-gap-analysis/01-guides/02-asvs/] |

### Known Threat Patterns for Vue + guarded records stats

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Cross-account aggregate disclosure | Information Disclosure | Filter every stats query by server-side `userId` from `CurrentUser`; test repository calls keep `where: { userId }`. [VERIFIED: apps/server/src/modules/records/records.controller.ts + apps/server/src/modules/records/records.repository.ts] |
| Stale payload after logout/account switch | Information Disclosure | Keep `boundaryVersion` invalidation and request-id checks in `useStatsStore`. [VERIFIED: apps/web/src/stores/stats.ts] |
| Fake or misleading statistics | Tampering | Reject static populated datasets and drive page states from current-account payload and zero-trip empty state. [VERIFIED: .planning/REQUIREMENTS.md + apps/web/src/views/StatisticsPageView.vue] |
| Unsafe rich tooltip/content rendering from record text | Tampering / XSS | Keep chart/ranking copy text-based and do not introduce `v-html` or HTML tooltip injection for notes/tags. [VERIFIED: packages/contracts/src/records.ts + vue-best-practices skill] |

## Sources

### Primary (HIGH confidence)
- Context7 `/apache/echarts-doc` - ECharts option model, line/bar/pie/radar examples, dataset and tree-shaking topics. [VERIFIED: Context7]
- Context7 `/ecomfe/vue-echarts` - `VChart` option, theme, and autoresize topics. [VERIFIED: Context7]
- Context7 `/prisma/web` - Prisma grouping/aggregation topics. [VERIFIED: Context7]
- Apache ECharts NPM import handbook - tree-shakeable chart/component/renderer registration and TypeScript option typing. [CITED: https://echarts.apache.org/handbook/en/basics/import/]
- Vue-ECharts README - `option`, theme, autoresize, and v8/ECharts 6 guidance. [CITED: https://github.com/ecomfe/vue-echarts/blob/main/README.md]
- Prisma aggregation/grouping docs - server aggregate tooling and `groupBy`/`distinct` distinction. [CITED: https://www.prisma.io/docs/concepts/components/prisma-client/aggregation-grouping-summarizing/]
- OWASP Developer Guide ASVS section list - V2 through V6 security categories. [CITED: https://devguide.owasp.org/en/11-security-gap-analysis/01-guides/02-asvs/]
- Local project context, requirements, roadmap, AGENTS, current contracts, records modules, stats store/view/specs, chart wrapper/theme/register files, and v8 asset guidance. [VERIFIED: codebase grep]
- npm registry checks for `vue`, `pinia`, `echarts`, `vue-echarts`, `vitest`, and `@prisma/client` versions/publish times or modified time. [VERIFIED: npm registry]

### Secondary (MEDIUM confidence)
- None used for prescriptive decisions; web lookups were restricted to official documentation and local code was used for project behavior. [VERIFIED: source audit]

### Tertiary (LOW confidence)
- None. [VERIFIED: source audit]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Chart and Vue stack are already installed, registered, and registry-checked; official ECharts/Vue-ECharts docs align with the current wrapper. [VERIFIED: pnpm list + npm registry + official docs]
- Architecture: MEDIUM - The current records stats boundary is clear, but planner still must lock the fourth overview metric and exact payload split. [VERIFIED: codebase grep + Open Questions]
- Pitfalls: HIGH - Most risks are explicit in Phase 47 decisions or visible in current code/test boundaries. [VERIFIED: 47-CONTEXT.md + codebase grep]

**Research date:** 2026-05-22 [VERIFIED: environment current date]  
**Valid until:** 2026-06-21 for codebase architecture; re-check npm versions before dependency changes. [VERIFIED: npm registry checks]
