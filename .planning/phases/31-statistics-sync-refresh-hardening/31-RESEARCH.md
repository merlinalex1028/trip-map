# Phase 31: Statistics Sync Refresh Hardening - Research

**Researched:** 2026-04-24 [VERIFIED: current_date]
**Domain:** Vue 3 + Pinia statistics refresh consistency across auth bootstrap / same-user sync [VERIFIED: ROADMAP.md]
**Confidence:** HIGH [VERIFIED: codebase grep + targeted source reads]

## User Constraints

No `31-CONTEXT.md` exists in `.planning/phases/31-statistics-sync-refresh-hardening/`, so there are no user-locked phase decisions, discretion notes, or deferred ideas to copy verbatim. [VERIFIED: `cat .planning/phases/31-statistics-sync-refresh-hardening/*-CONTEXT.md` returned no file]

### Locked Decisions

- Phase 31 must address `STAT-03`. [VERIFIED: user prompt + ROADMAP.md]
- Phase 31 must close `Phase 28 metadata backfill / same-user sync -> Phase 30 statistics refresh`. [VERIFIED: user prompt + `.planning/milestones/v6.0-MILESTONE-AUDIT.md`]
- Phase 31 must cover `Overseas metadata -> bootstrap/sync -> statistics completion`. [VERIFIED: user prompt + `.planning/milestones/v6.0-MILESTONE-AUDIT.md`]
- Phase 31 should support consistency closure for `STAT-01` and `STAT-02` without expanding their remaining Phase 32 human/deploy acceptance scope. [VERIFIED: ROADMAP.md + `.planning/milestones/v6.0-MILESTONE-AUDIT.md`]

### Claude's Discretion

- The implementation strategy is not locked by a context file; choose the smallest code change that makes metadata-only authoritative refresh trigger a statistics reload. [VERIFIED: no context file + codebase inspection]

### Deferred Ideas (OUT OF SCOPE)

- Production deep-link / refresh for `/timeline` and `/statistics` belongs to Phase 32, not Phase 31. [VERIFIED: ROADMAP.md]
- Timeline / Statistics human UAT closure belongs to Phase 32 except for automated regression evidence directly needed by Phase 31. [VERIFIED: ROADMAP.md + milestone audit]

## Project Constraints (from CLAUDE.md)

- Always reply in Chinese to the user. [VERIFIED: CLAUDE.md]
- Keep code, commands, config keys, and interface field names in their original language where useful. [VERIFIED: CLAUDE.md]
- Explain the operation before implementation. [VERIFIED: CLAUDE.md]
- Keep code changes minimal and consistent with the existing project structure and style. [VERIFIED: CLAUDE.md]
- Use Vue 3 Composition API with `<script setup lang="ts">`; do not use Options API for frontend changes. [VERIFIED: CLAUDE.md]
- Use Pinia for frontend state management. [VERIFIED: CLAUDE.md]
- Use Vitest via `vitest run` for tests; frontend tests use `happy-dom`. [VERIFIED: CLAUDE.md + `apps/web/vitest.config.ts`]
- After frontend code changes, run the relevant web tests and `vue-tsc --noEmit` when practical. [VERIFIED: CLAUDE.md]
- Use `pnpm` in the monorepo; package-level commands use `pnpm --filter @trip-map/web ...`. [VERIFIED: CLAUDE.md + `package.json`]

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| `STAT-03` | 当同一地点存在多次旅行记录时，统计会正确区分“总旅行次数”和“唯一地点 / 完成度” | Backend aggregation already preserves this distinction; Phase 31 must harden refresh triggers so authoritative metadata updates cannot leave `visitedCountries` / completion stale while timeline reflects newer records. [VERIFIED: `.planning/REQUIREMENTS.md` + `apps/server/src/modules/records/records.repository.ts` + `StatisticsPageView.vue`] |

</phase_requirements>

## Summary

Phase 31 is a frontend consistency hardening phase, not a new statistics aggregation phase. [VERIFIED: ROADMAP.md + codebase inspection] The server already computes `totalTrips`, `uniquePlaces`, `visitedCountries`, and `totalSupportedCountries` in `RecordsRepository.getTravelStats()`, using record count, distinct `placeId`, distinct country labels derived from `parentLabel`, and `TOTAL_SUPPORTED_TRAVEL_COUNTRIES`. [VERIFIED: `apps/server/src/modules/records/records.repository.ts`] The remaining gap is that `StatisticsPageView` watches a revision string made only from `id:placeId:createdAt`, so metadata-only changes delivered by `/auth/bootstrap` or same-user refresh can update `travelRecords` for timeline consumers without changing the statistic page's watched revision. [VERIFIED: `apps/web/src/views/StatisticsPageView.vue` + milestone audit]

The recommended plan is to make statistics refresh react to an authoritative travel-record revision that includes the metadata fields affecting country completion, especially `parentLabel`, and to preserve the current request coalescing behavior that schedules one follow-up fetch after an in-flight request. [VERIFIED: `StatisticsPageView.vue` current pending refresh pattern + `RecordsRepository.getTravelStats()` dependency on `parentLabel`] This should be implemented with a targeted frontend change and regression tests in `StatisticsPageView.spec.ts`; backend changes are not required unless tests reveal a server-side mismatch. [VERIFIED: codebase inspection]

**Primary recommendation:** Extend the statistics page refresh dependency from identity-only record revision to statistics-relevant record revision (`id`, `placeId`, `createdAt`, `parentLabel`, and optionally displayed authoritative metadata), then add bootstrap/same-user metadata-only regression tests. [VERIFIED: audit gap + codebase inspection]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Authoritative metadata delivery | API / Backend | Frontend Store | `/auth/bootstrap` and same-user refresh return persisted `TravelRecord` metadata; web stores apply the snapshot. [VERIFIED: `auth-session.ts` + `map-points.ts`] |
| Statistics aggregation semantics | API / Backend | Database / Storage | `/records/stats` computes totals from persisted records; Phase 31 should not duplicate aggregation in the browser. [VERIFIED: `records.repository.ts` + `stats.ts`] |
| Statistics refresh orchestration | Browser / Client | API / Backend | `StatisticsPageView.vue` decides when to call `statsStore.fetchStatsData()` based on auth/session/record changes. [VERIFIED: `StatisticsPageView.vue`] |
| Timeline/statistics consistency | Browser / Client | API / Backend | Timeline consumes `mapPointsStore.timelineEntries`, while statistics fetches `/records/stats`; the client must align refresh timing after authoritative snapshot updates. [VERIFIED: `map-points.ts` + `StatisticsPageView.vue`] |
| Completion denominator | API / Backend | Contracts | `totalSupportedCountries` comes from backend canonical catalog, then flows through `TravelStatsResponse`. [VERIFIED: `records.repository.ts` + `packages/contracts/src/stats.ts`] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue | Installed `3.5.32`; npm current `3.5.33`, modified `2026-04-22T07:21:12.543Z` | Route-level statistics view, `computed`, `watch`, lifecycle hooks | Project standard frontend framework; official watcher docs support side-effect refresh on reactive source changes. [VERIFIED: `apps/web/package.json` + npm registry + CITED: https://vuejs.org/guide/essentials/watchers.html] |
| Pinia | Installed/current `3.0.4`, npm modified `2025-11-05T09:25:14.059Z` | Auth, map-points, and stats stores | Project standard state management; setup stores and `storeToRefs()` match current code. [VERIFIED: `apps/web/package.json` + npm registry + CITED: https://pinia.vuejs.org/core-concepts/] |
| Vitest | Installed `4.1.4`; npm current `4.1.5`, modified `2026-04-23T10:30:15.171Z` | Unit/component regression tests | Project-wide test framework; current specs already mock API modules and mount Vue components. [VERIFIED: `package.json` + npm registry + CITED: https://vitest.dev/guide/mocking.html] |
| Vue Test Utils | Installed `2.4.6`; npm current `2.4.8`, modified `2026-04-24T09:42:30.908Z` | Mount `StatisticsPageView` with Pinia and stubs | Official Vue 3 test utility suite; current view specs use it. [VERIFIED: `apps/web/package.json` + npm registry + CITED: https://test-utils.vuejs.org/] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@trip-map/contracts` | workspace package | Shared `TravelRecord` and `TravelStatsResponse` types | Use existing contract types; do not redefine response shapes in the view/store. [VERIFIED: `packages/contracts/src/stats.ts` + `apps/web/src/services/api/stats.ts`] |
| `@trip-map/web` test config | local package | `happy-dom` frontend test environment | Run targeted `StatisticsPageView.spec.ts`, `stats.spec.ts`, and `auth-session.spec.ts` through this package. [VERIFIED: `apps/web/vitest.config.ts`] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Extend `travelRecordRevision` | Add a global event bus | Event bus would add hidden cross-store coupling and is unnecessary because the page already watches store state. [VERIFIED: current `StatisticsPageView.vue`; [ASSUMED] event-bus complexity based on architecture judgment] |
| Refetch stats inside `auth-session.ts` | Keep refresh in `StatisticsPageView.vue` | Store-level fetch could refresh even when stats page is not mounted, wasting requests; route-level view already owns stats-page fetch timing. [VERIFIED: current code flow; [ASSUMED] request-waste impact] |
| Compute stats locally from `travelRecords` | Continue using `/records/stats` | Local computation would duplicate backend aggregation and risk denominator drift from canonical catalog. [VERIFIED: `records.repository.ts` + `TravelStatsResponse`; [ASSUMED] duplication risk] |

**Installation:** No new runtime dependency is recommended. [VERIFIED: codebase inspection]

```bash
# No install required for Phase 31.
pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/stores/auth-session.spec.ts
pnpm --filter @trip-map/web typecheck
```

**Version verification:** `npm view` succeeded only after escalated network access; installed versions were also verified from local `node_modules` / `package.json`. [VERIFIED: shell output]

## Architecture Patterns

### System Architecture Diagram

```text
Authoritative metadata backfill
  -> persisted userTravelRecord rows
  -> /auth/bootstrap or same-user refresh
  -> auth-session applies snapshot
  -> map-points replaces/applies travelRecords
  -> timeline entries update from travelRecords
  -> statistics page watches stats-relevant record revision
  -> stats store calls GET /records/stats
  -> server recomputes totalTrips / uniquePlaces / visitedCountries / denominator
  -> statistics UI renders values consistent with timeline metadata
```

This data flow must remain server-authoritative for aggregation and client-authoritative for refresh orchestration. [VERIFIED: `auth-session.ts` + `map-points.ts` + `stats.ts` + `records.repository.ts`]

### Recommended Project Structure

```text
apps/web/src/views/
├── StatisticsPageView.vue       # route-level refresh orchestration and rendering [VERIFIED: existing file]
└── StatisticsPageView.spec.ts   # component-level sync/refresh regressions [VERIFIED: existing file]

apps/web/src/stores/
├── stats.ts                     # request lifecycle and stale-response protection [VERIFIED: existing file]
├── stats.spec.ts                # store request lifecycle tests [VERIFIED: existing file]
├── auth-session.ts              # bootstrap / same-user snapshot application [VERIFIED: existing file]
└── auth-session.spec.ts         # snapshot behavior coverage, optional for cross-store assertion [VERIFIED: existing file]
```

### Pattern 1: Watch Explicit Statistics-Relevant Sources

**What:** Use a `computed` revision that includes all record fields affecting `/records/stats` results, then `watch()` that computed source to refetch after authenticated changes. [VERIFIED: Vue watcher docs + current page pattern]

**When to use:** Use this when the server stats response can change even if record identity and count do not change, such as metadata-only `parentLabel` corrections after authoritative backfill or same-user sync. [VERIFIED: audit gap + backend `visitedCountries` derives from `parentLabel`]

**Example:**

```typescript
// Source: https://vuejs.org/guide/essentials/watchers.html + existing StatisticsPageView.vue pattern
const statisticsRecordRevision = computed(() =>
  travelRecords.value
    .map((record) => [
      record.id,
      record.placeId,
      record.createdAt,
      record.parentLabel,
      record.displayName,
      record.typeLabel,
      record.subtitle,
    ].join('\u0000'))
    .join('|'),
)

watch(
  () => statisticsRecordRevision.value,
  (nextRevision, previousRevision) => {
    if (previousRevision === undefined || nextRevision === previousRevision) {
      return
    }

    fetchOrQueueStatsRefresh()
  },
)
```

**Confidence:** HIGH because the current code already uses this watcher pattern, but omits metadata fields. [VERIFIED: `StatisticsPageView.vue`]

### Pattern 2: Preserve In-Flight Follow-Up Fetch

**What:** Keep `pendingRefreshAfterLoad` so metadata changes during an active request schedule exactly one follow-up fetch instead of overlapping indefinitely. [VERIFIED: `StatisticsPageView.vue` + `StatisticsPageView.spec.ts`]

**When to use:** Use this when `fetchStatsData()` is already loading and another authoritative snapshot arrives before the first request resolves. [VERIFIED: current `re-fetches statistics after travel records change during an in-flight request` test]

**Example:**

```typescript
// Source: existing StatisticsPageView.vue pattern
function fetchOrQueueStatsRefresh() {
  if (status.value !== 'authenticated' || currentUser.value === null) {
    return
  }

  if (isLoading.value) {
    pendingRefreshAfterLoad.value = true
    return
  }

  void statsStore.fetchStatsData()
}
```

**Confidence:** HIGH because this is current implementation behavior with tests. [VERIFIED: `StatisticsPageView.vue` + `StatisticsPageView.spec.ts`]

### Pattern 3: Keep Store Request Staleness Guard

**What:** `statsStore.fetchStatsData()` captures `authSessionStore.boundaryVersion` and `activeRequestId`, then ignores stale responses after a session boundary or newer request. [VERIFIED: `apps/web/src/stores/stats.ts`]

**When to use:** Preserve this pattern during Phase 31; do not remove boundary checks to force metadata refresh. [VERIFIED: `stats.spec.ts` stale-response tests]

**Example:**

```typescript
// Source: existing stats.ts pattern
const requestId = ++activeRequestId
const boundaryVersionAtStart = authSessionStore.boundaryVersion
const response = await fetchStats()
if (authSessionStore.boundaryVersion !== boundaryVersionAtStart || requestId !== activeRequestId) {
  return
}
stats.value = response
```

**Confidence:** HIGH because this guards cross-session correctness and already has tests. [VERIFIED: `stats.ts` + `stats.spec.ts`]

### Anti-Patterns to Avoid

- **Watching only `id:placeId:createdAt`:** misses metadata-only changes that can alter `visitedCountries`. [VERIFIED: `StatisticsPageView.vue` + `records.repository.ts`]
- **Deep-watching full record objects:** Vue docs warn deep watchers traverse nested properties and can be expensive; a compact explicit revision is clearer and cheaper for this flat record shape. [CITED: https://vuejs.org/guide/essentials/watchers.html]
- **Calling `/records/stats` from `auth-session.ts` unconditionally:** refreshes stats even when statistics route is not mounted; keep route-level ownership unless planner intentionally adds global cache invalidation. [VERIFIED: current route-level design; [ASSUMED] waste impact]
- **Resetting auth boundary for same-user sync:** existing tests assert same-user refresh is lightweight and should not reset session boundary or announce an account switch. [VERIFIED: `auth-session.spec.ts`]
- **Duplicating server stats calculation in the browser:** backend owns aggregation and canonical denominator, so browser-local stats are a drift risk. [VERIFIED: `records.repository.ts`; [ASSUMED] drift risk]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reactive side-effect trigger | Custom event emitter / pub-sub | Vue `computed` + `watch` | Current app already uses Composition API watchers; official docs define `watch` for side effects on reactive changes. [VERIFIED: current code + CITED: https://vuejs.org/guide/essentials/watchers.html] |
| Shared page/store state | Manual singleton module | Pinia setup stores | Existing stores are Pinia setup stores and use `storeToRefs()` in views. [VERIFIED: `stats.ts` + `StatisticsPageView.vue` + CITED: https://pinia.vuejs.org/core-concepts/] |
| Statistics aggregation | Browser reduction over `travelRecords` | Existing `GET /records/stats` | Server already owns `distinct placeId`, `parentLabel` country grouping, and supported-country denominator. [VERIFIED: `records.repository.ts`] |
| Async race testing | Ad hoc timers / sleeps | Vitest controlled promises and mocks | Existing specs use controlled promises and `flushPromises()` style assertions; Vitest supports `vi.fn`, `vi.mock`, and reset discipline. [VERIFIED: current specs + CITED: https://vitest.dev/guide/mocking.html] |

**Key insight:** The hard part is not computing statistics; it is invalidating the server-backed statistics request when authoritative metadata changes without record identity changes. [VERIFIED: milestone audit + codebase inspection]

## Common Pitfalls

### Pitfall 1: Metadata-Only Sync Does Not Change Existing Revision

**What goes wrong:** `travelRecordRevision` does not change when only `parentLabel`, `displayName`, `typeLabel`, or `subtitle` changes. [VERIFIED: `StatisticsPageView.vue`]
**Why it happens:** The current revision maps records to `id:placeId:createdAt`, which excludes metadata fields. [VERIFIED: `StatisticsPageView.vue`]
**How to avoid:** Include at minimum `parentLabel`; include additional authoritative metadata fields if the goal is “timeline and statistics use the same refreshed metadata snapshot.” [VERIFIED: backend stats depends on `parentLabel`; [ASSUMED] extra metadata fields improve future-proofing]
**Warning signs:** A test can update `mapPointsStore.replaceTravelRecords()` with same `id`, same `placeId`, same `createdAt`, changed `parentLabel`, and observe no second `fetchStats()` call under current code. [VERIFIED: code behavior]

### Pitfall 2: In-Flight Fetch Race Masks the New Snapshot

**What goes wrong:** A stale response from the first request can render old stats after a newer metadata snapshot has arrived. [VERIFIED: current test covers record-change variant]
**Why it happens:** Fetch responses resolve asynchronously and may complete after state changes. [VERIFIED: `stats.ts` active request design]
**How to avoid:** Preserve `pendingRefreshAfterLoad` and `statsStore` request guards; add a metadata-only in-flight regression. [VERIFIED: existing pattern]
**Warning signs:** `fetchStatsMock` call count stays at one after metadata revision changes during loading. [VERIFIED: current test style]

### Pitfall 3: Same-User Refresh Should Not Reset Session Boundary

**What goes wrong:** Treating same-user sync like account switch clears optimistic state, invalidates unrelated requests, and may show account-switch notices. [VERIFIED: `auth-session.spec.ts` expectations]
**Why it happens:** `applyAuthenticatedSnapshot()` increments `boundaryVersion`, but same-user refresh intentionally calls `applyAuthoritativeTravelRecords()` directly. [VERIFIED: `auth-session.ts`]
**How to avoid:** Trigger statistics invalidation from changed `travelRecords`, not from forcing `boundaryVersion` changes. [VERIFIED: code architecture]
**Warning signs:** Existing `auth-session.spec.ts` same-user refresh tests fail. [VERIFIED: current tests]

### Pitfall 4: Completion Consistency Depends on `parentLabel`

**What goes wrong:** Country completion can lag even though timeline titles look updated. [VERIFIED: milestone audit]
**Why it happens:** Backend `visitedCountries` groups by country parsed from `parentLabel`; timeline can update from record metadata while stats page remains cached. [VERIFIED: `records.repository.ts` + `map-points.ts`]
**How to avoid:** Treat `parentLabel` as statistics-critical metadata and include it in the refresh dependency. [VERIFIED: `records.repository.ts`]
**Warning signs:** UI shows old “N 个国家/地区” after same-user snapshot changes overseas country grouping. [VERIFIED: milestone audit]

## Code Examples

Verified patterns from official and local sources:

### Metadata-Only Regression Test Shape

```typescript
// Source: existing StatisticsPageView.spec.ts + Vitest mocking docs
it('re-fetches statistics after metadata-only authoritative refresh changes country completion', async () => {
  fetchStatsMock
    .mockResolvedValueOnce({ totalTrips: 1, uniquePlaces: 1, visitedCountries: 1, totalSupportedCountries: 21 })
    .mockResolvedValueOnce({ totalTrips: 1, uniquePlaces: 1, visitedCountries: 2, totalSupportedCountries: 21 })

  const baseRecord = makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
    id: 'record-1',
    createdAt: '2025-01-01T00:00:00.000Z',
  })
  const refreshedRecord = { ...baseRecord, parentLabel: 'Canada' }

  const { mapPointsStore } = mountStatisticsPage(({ authSessionStore, mapPointsStore }) => {
    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = makeUser()
    mapPointsStore.replaceTravelRecords([baseRecord])
  })

  await flushPromises()
  mapPointsStore.replaceTravelRecords([refreshedRecord])
  await nextTick()

  expect(fetchStatsMock).toHaveBeenCalledTimes(2)
})
```

### Same-User Snapshot Test Shape

```typescript
// Source: existing auth-session.spec.ts same-user refresh tests
it('applies metadata-only same-user refresh through map points without session boundary reset', async () => {
  const authSessionStore = useAuthSessionStore()
  const mapPointsStore = useMapPointsStore()
  const currentUser = makeUser()
  const previous = makeRecord(PHASE28_RESOLVED_CALIFORNIA, { id: 'record-1' })
  const refreshed = { ...previous, parentLabel: 'Canada' }

  authSessionStore.status = 'authenticated'
  authSessionStore.currentUser = currentUser
  mapPointsStore.replaceTravelRecords([previous])

  fetchBootstrapMock.mockResolvedValueOnce({ authenticated: true, user: currentUser, records: [refreshed] })
  await authSessionStore.refreshAuthenticatedSnapshot()

  expect(mapPointsStore.travelRecords).toEqual([refreshed])
})
```

### Minimal View Helper Refactor

```typescript
// Source: existing StatisticsPageView.vue pattern
function fetchOrQueueStatsRefresh() {
  if (status.value !== 'authenticated' || currentUser.value === null) {
    return
  }

  if (isLoading.value) {
    pendingRefreshAfterLoad.value = true
    return
  }

  void statsStore.fetchStatsData()
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Statistics page watches record identity revision only | Watch statistics-relevant metadata revision | Phase 31 should implement | Fixes metadata-only authoritative refresh lag. [VERIFIED: milestone audit + current code] |
| Client computes completion locally | Server returns `visitedCountries` + `totalSupportedCountries` | Phase 30 | Keep backend as source of truth for completion. [VERIFIED: `30-VERIFICATION.md` + `records.repository.ts`] |
| Overseas metadata fallback in consumers | Persisted authoritative metadata is consumed by web | Phase 28 | Refresh triggers must account for authoritative metadata changes. [VERIFIED: `28-VERIFICATION.md` + `map-points.ts`] |

**Deprecated/outdated:**

- Identity-only revision (`id:placeId:createdAt`) is insufficient for Phase 31 because metadata-only sync can change country completion without changing identity fields. [VERIFIED: `StatisticsPageView.vue` + milestone audit]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Adding additional metadata fields beyond `parentLabel` to the revision improves future-proofing. | Common Pitfalls / Architecture Patterns | If wrong, the revision may refetch more often than necessary but should remain correct. |
| A2 | Refetching stats from `auth-session.ts` when the stats page is unmounted would waste requests. | Alternatives / Anti-Patterns | If wrong, a global invalidation design might still be acceptable, but it adds broader scope than needed. |
| A3 | Browser-local stats duplication risks drift from backend aggregation. | Alternatives / Don't Hand-Roll | If wrong, local derived stats could be feasible, but it would contradict current server-authoritative architecture. |

## Open Questions

1. **Should `updatedAt` be exposed in `TravelRecord` contracts?** [VERIFIED: current contract lacks `updatedAt`]
   - What we know: Server mappers omit `updatedAt` from `ContractTravelRecord`, and current records expose `createdAt`. [VERIFIED: `records.service.ts` + `auth.service.ts`]
   - What's unclear: Whether future metadata-only backfills should expose record update revision explicitly. [ASSUMED]
   - Recommendation: Do not add `updatedAt` in Phase 31 unless tests prove explicit update versioning is necessary; metadata fields are enough for this gap. [VERIFIED: current audit issue]
2. **Should a reusable record-revision helper live outside the view?** [VERIFIED: no helper exists]
   - What we know: Only `StatisticsPageView.vue` currently needs the stats refresh revision. [VERIFIED: codebase grep]
   - What's unclear: Whether upcoming phases will need shared invalidation semantics. [ASSUMED]
   - Recommendation: Keep the helper local unless reuse appears during implementation. [ASSUMED]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | pnpm / Vite / Vitest | ✓ | `v22.22.1` | — [VERIFIED: `node --version`] |
| pnpm | monorepo package commands | ✓ | `10.33.0` | — [VERIFIED: `pnpm --version`] |
| npm registry access | version verification | ✓ with escalated network | queried 2026-04-24 | Use installed package versions if offline. [VERIFIED: `npm view`] |
| Vitest | automated regression tests | ✓ | installed `4.1.4` | — [VERIFIED: local package] |
| Vue Test Utils | component mount tests | ✓ | installed `2.4.6` | — [VERIFIED: local package] |
| gsd-sdk | phase init / optional commit | ✓ | `v0.1.0` | manual git/doc update. [VERIFIED: `gsd-sdk --version`] |
| Graphify knowledge graph | graph context | ✗ disabled | — | Continue with grep/source inspection. [VERIFIED: `gsd-tools graphify query`] |

**Missing dependencies with no fallback:** None for planning Phase 31. [VERIFIED: environment audit]

**Missing dependencies with fallback:** Graphify is disabled; source inspection and planning docs provided enough context. [VERIFIED: graphify output]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest installed `4.1.4`; npm current `4.1.5`. [VERIFIED: local package + npm registry] |
| Config file | `apps/web/vitest.config.ts` [VERIFIED: file read] |
| Environment | `happy-dom` [VERIFIED: `apps/web/vitest.config.ts`] |
| Quick run command | `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/stores/auth-session.spec.ts` [VERIFIED: package scripts] |
| Full relevant command | `pnpm --filter @trip-map/web test --run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/stores/auth-session.spec.ts src/stores/map-points.spec.ts` [VERIFIED: package scripts + test files] |
| Typecheck command | `pnpm --filter @trip-map/web typecheck` [VERIFIED: `apps/web/package.json`] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| `STAT-03` | Metadata-only authoritative refresh changes `parentLabel` and triggers a second `/records/stats` fetch. | component | `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts -t metadata-only` | ✅ add case to existing file [VERIFIED: file exists] |
| `STAT-03` | Metadata-only change during in-flight stats request queues one follow-up fetch and renders new country count. | component | `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts -t in-flight` | ✅ extend existing case or add sibling [VERIFIED: file exists] |
| `STAT-03` | Same-user refresh applies new authoritative metadata without resetting session boundary. | store | `pnpm --filter @trip-map/web exec vitest run src/stores/auth-session.spec.ts -t same-user` | ✅ existing file and related tests [VERIFIED: file exists] |
| `STAT-03` | Stats store still ignores stale responses after auth boundary/request changes. | store | `pnpm --filter @trip-map/web exec vitest run src/stores/stats.spec.ts` | ✅ existing tests [VERIFIED: file exists] |

### Sampling Rate

- **Per task commit:** `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/stores/auth-session.spec.ts` [VERIFIED: package scripts]
- **Per wave merge:** `pnpm --filter @trip-map/web test --run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/stores/auth-session.spec.ts src/stores/map-points.spec.ts` [VERIFIED: test files]
- **Phase gate:** `pnpm --filter @trip-map/web typecheck` plus targeted tests green before `/gsd-verify-work`. [VERIFIED: CLAUDE.md + package scripts]

### Wave 0 Gaps

- [ ] `apps/web/src/views/StatisticsPageView.spec.ts` — add metadata-only authoritative refresh regression for `STAT-03`. [VERIFIED: current file lacks metadata-only test]
- [ ] `apps/web/src/views/StatisticsPageView.spec.ts` — add or extend in-flight refresh regression for metadata-only snapshot changes. [VERIFIED: current file covers record add during in-flight, not metadata-only]
- [ ] `apps/web/src/stores/auth-session.spec.ts` — optional assertion that same-user refresh applies changed metadata without boundary reset. [VERIFIED: current file covers same-user replacement and pending overlap]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Preserve existing session unauthorized handling through `isSessionUnauthorizedApiClientError()` and `authSessionStore.handleUnauthorized()`. [VERIFIED: `stats.ts` + `auth-session.ts`] |
| V3 Session Management | yes | Do not weaken `boundaryVersion` stale-response checks or same-user/session-switch semantics. [VERIFIED: `stats.ts` + `auth-session.spec.ts`] |
| V4 Access Control | no direct new server endpoint | Continue using existing authenticated `/records/stats` endpoint. [VERIFIED: `stats.ts` calls existing API] |
| V5 Input Validation | no new input expected | Phase 31 should not add new user input paths. [VERIFIED: phase goal + codebase inspection] |
| V6 Cryptography | no | No cryptographic operation is in scope. [VERIFIED: phase goal] |

### Known Threat Patterns for Vue/Pinia Stats Refresh

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Cross-session stale stats render | Information Disclosure | Keep `boundaryVersion` and `activeRequestId` guards. [VERIFIED: `stats.ts`] |
| Unauthorized stats request after session expiry | Elevation / Spoofing | Preserve 401 delegation to `handleUnauthorized()`. [VERIFIED: `stats.ts` + `stats.spec.ts`] |
| Excess refresh loop / client DoS | Denial of Service | Watch a stable explicit revision string and keep in-flight coalescing. [VERIFIED: current page pattern; [ASSUMED] DoS classification] |

## Sources

### Primary (HIGH confidence)

- `apps/web/src/views/StatisticsPageView.vue` — current `travelRecordRevision`, watchers, pending refresh pattern. [VERIFIED: file read]
- `apps/web/src/stores/auth-session.ts` — bootstrap and same-user sync behavior. [VERIFIED: file read]
- `apps/web/src/stores/map-points.ts` — authoritative travel-record application and timeline source state. [VERIFIED: file read]
- `apps/web/src/stores/stats.ts` — request lifecycle and stale-response guards. [VERIFIED: file read]
- `apps/server/src/modules/records/records.repository.ts` — stats aggregation semantics and `parentLabel` country grouping. [VERIFIED: file read]
- `.planning/milestones/v6.0-MILESTONE-AUDIT.md` — integration gap definition. [VERIFIED: file read]
- `.planning/ROADMAP.md` and `.planning/REQUIREMENTS.md` — Phase 31 scope and `STAT-03`. [VERIFIED: file read]
- npm registry — Vue, Pinia, Vitest, Vue Test Utils current versions and modified dates. [VERIFIED: `npm view`]

### Secondary (MEDIUM confidence)

- Vue Watchers official docs — `watch` for side effects, source types, deep watcher caveats. [CITED: https://vuejs.org/guide/essentials/watchers.html]
- Pinia core concepts official docs — setup stores and `storeToRefs()` for reactive destructuring. [CITED: https://pinia.vuejs.org/core-concepts/]
- Vitest mocking official docs — `vi.fn`, `vi.mock`, mock reset discipline. [CITED: https://vitest.dev/guide/mocking.html]
- Vue Test Utils official site — official Vue 3 testing utilities. [CITED: https://test-utils.vuejs.org/]

### Tertiary (LOW confidence)

- Architecture judgment that a route-local watcher is preferable to a global invalidation event bus for this narrow gap. [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — package versions verified locally and against npm registry where network allowed. [VERIFIED: shell output]
- Architecture: HIGH — source files directly show the refresh gap and data flow. [VERIFIED: codebase inspection]
- Pitfalls: HIGH for metadata-only revision gap; MEDIUM for broader future-proofing advice. [VERIFIED: audit + code; [ASSUMED] future-proofing]

**Research date:** 2026-04-24 [VERIFIED: current_date]
**Valid until:** 2026-05-24 for codebase-specific architecture; 2026-05-01 for npm current-version claims. [ASSUMED]
