# Phase 31: Statistics Sync Refresh Hardening - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>

## Phase Boundary

Phase 31 fixes statistics freshness after authoritative metadata changes. When `/auth/bootstrap` or same-user sync applies refreshed travel-record metadata, the statistics page must trigger a server-backed statistics refresh and stay consistent with the timeline without requiring a full page reload.

This phase is a consistency hardening pass, not a statistics redesign. Backend aggregation remains authoritative; frontend work should focus on detecting stats-relevant travel-record metadata changes and preserving the existing route-level refresh orchestration.

In scope:
- Metadata-only authoritative refresh triggers statistics refetch/recompute.
- Timeline and statistics stay aligned for overseas metadata and country count/completion fields.
- Regression tests cover bootstrap, same-user sync, metadata-only changes, and in-flight refresh coalescing.

Out of scope:
- New statistics metrics, new completion percentage UI, or copy changes.
- Browser-local duplication of backend statistics aggregation.
- `/timeline` and `/statistics` deployment deep-link / refresh closure, which belongs to Phase 32.
- Human UAT closure beyond automated regression evidence directly needed for Phase 31.

</domain>

<decisions>

## Implementation Decisions

### Statistics refresh trigger scope
- **D-01:** Keep `/records/stats` as the authoritative aggregation source; do not compute `totalTrips`, `uniquePlaces`, `visitedCountries`, or `totalSupportedCountries` locally from `travelRecords`.
- **D-02:** Extend the statistics-page refresh dependency from identity-only fields (`id`, `placeId`, `createdAt`) to a stats-relevant authoritative metadata revision.
- **D-03:** The revision must include `parentLabel` because server `visitedCountries` derives from country labels. It should also include the authoritative display metadata already used by timeline/stat presentation, such as `displayName`, `typeLabel`, and `subtitle`, so metadata-only snapshots cannot be missed.
- **D-04:** Keep the refresh trigger local to `StatisticsPageView.vue` or a helper directly used by it. Do not add a global event bus or unconditional stats fetching inside `auth-session.ts`.

### Same-user sync behavior
- **D-05:** Same-user authoritative refresh must update statistics through changed `travelRecords`, not by forcing a session-boundary reset.
- **D-06:** Preserve the existing lightweight same-user refresh behavior: no account-switch notice, no anonymous-state flash, and no reset of unrelated optimistic/session state.

### Refresh visibility and request coalescing
- **D-07:** Metadata-only statistics refresh is invisible to users unless the page is already in an existing loading/restoring state.
- **D-08:** Do not add new spinners, banners, toasts, copy, colors, focus movement, scroll jumps, or route changes for metadata-only refresh.
- **D-09:** Preserve the existing `pendingRefreshAfterLoad` model: if metadata changes while stats are loading, queue at most one follow-up fetch instead of starting overlapping request loops.
- **D-10:** Preserve `statsStore` request guards based on `boundaryVersion` and `activeRequestId` so stale responses cannot overwrite newer session/request state.

### Regression coverage
- **D-11:** Primary regression coverage belongs in `StatisticsPageView.spec.ts`, because the route view owns statistics refresh orchestration.
- **D-12:** Tests must cover metadata-only changes where record identity is unchanged but `parentLabel` changes.
- **D-13:** Tests must cover in-flight metadata-only updates and verify one follow-up stats fetch is queued after the active request settles.
- **D-14:** Add or extend `auth-session.spec.ts` only if needed to prove same-user refresh continues to call `applyAuthoritativeTravelRecords()` without resetting the session boundary.
- **D-15:** Backend repository changes are not expected unless tests reveal an aggregation mismatch; server stats semantics are already the canonical source.

### the agent's Discretion
- The exact shape of the computed revision/helper is left to planning and implementation, as long as it is explicit, compact, deterministic, and includes stats-relevant authoritative metadata.
- The test fixture shape and whether helper extraction is worthwhile are left to implementation, provided the phase success criteria remain covered.
- If planner finds an existing helper pattern for travel-record revisions, it may reuse that pattern instead of creating a new local helper.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` — Phase 31 goal, dependencies, gap-closure boundary, and success criteria.
- `.planning/REQUIREMENTS.md` — `STAT-03` requirement and traceability.
- `.planning/PROJECT.md` — Project-level statistics requirement context for `STAT-03`.
- `.planning/milestones/v6.0-MILESTONE-AUDIT.md` — Audit evidence for the metadata backfill / same-user sync to statistics refresh gap.

### Phase 31 design and validation contracts
- `.planning/phases/31-statistics-sync-refresh-hardening/31-RESEARCH.md` — Technical root-cause analysis and recommended implementation direction.
- `.planning/phases/31-statistics-sync-refresh-hardening/31-UI-SPEC.md` — Visual and interaction contract; metadata refresh must remain invisible and must not introduce UI drift.
- `.planning/phases/31-statistics-sync-refresh-hardening/31-VALIDATION.md` — Required validation strategy and test command map.

### Prior phase decisions carried forward
- `.planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md` — Authoritative metadata fields (`displayName`, `typeLabel`, `parentLabel`, `subtitle`) and catalog-backed overseas coverage decisions.
- `.planning/phases/29-timeline-page-and-account-entry/29-CONTEXT.md` — Timeline is a separate page and displays individual travel records with metadata.
- `.planning/phases/30-travel-statistics-and-completion-overview/30-CONTEXT.md` — Statistics live on `/statistics`; backend API owns statistics computation; no frontend-local aggregation.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets
- `apps/web/src/views/StatisticsPageView.vue`: Existing route-level statistics state machine, `travelRecordRevision`, auth/session watchers, and `pendingRefreshAfterLoad` refresh coalescing.
- `apps/web/src/stores/stats.ts`: Existing `fetchStatsData()` lifecycle, `boundaryVersion` snapshot guard, and `activeRequestId` stale-response guard.
- `apps/web/src/stores/auth-session.ts`: Existing bootstrap and same-user refresh flow; same-user refresh applies `mapPointsStore.applyAuthoritativeTravelRecords()` without treating it as an account boundary.
- `apps/web/src/stores/map-points.ts`: Existing `replaceTravelRecords()` and `applyAuthoritativeTravelRecords()` authoritative snapshot handling.
- `apps/web/src/views/StatisticsPageView.spec.ts`: Best home for route-level metadata-refresh regressions.
- `apps/web/src/stores/auth-session.spec.ts`: Optional home for same-user refresh behavior assertions if component tests do not already prove the path.

### Established Patterns
- Vue 3 Composition API with `computed`, `watch`, and Pinia `storeToRefs()` is the established view/store pattern.
- Statistics page currently fetches on mount, resets/refetches on `boundaryVersion`, and watches travel-record changes for same-session refresh.
- Stats store already guards stale responses; Phase 31 should preserve rather than bypass that behavior.
- Frontend tests use Vitest with Vue Test Utils and mocked API services.

### Integration Points
- `StatisticsPageView.vue` should observe `mapPointsStore.travelRecords` metadata changes and call `statsStore.fetchStatsData()` only while authenticated.
- `auth-session.ts` should continue to apply authoritative bootstrap/same-user snapshots into `mapPointsStore`.
- `apps/server/src/modules/records/records.repository.ts` remains the backend aggregation source for `totalTrips`, distinct `placeId`, distinct country labels from `parentLabel`, and supported-country denominator.
- `packages/contracts/src/stats.ts` defines the stats response shape consumed by the page and store.

</code_context>

<specifics>

## Specific Ideas

- Preferred implementation direction: make the watched revision stats-relevant instead of adding a new cross-store invalidation mechanism.
- Preferred user experience: refreshed metadata silently makes statistics correct; users should not see a special "syncing statistics" state.
- Preferred test shape: update records with the same `id`, `placeId`, and `createdAt`, but a changed `parentLabel`, then assert the statistics fetch path runs.

</specifics>

<deferred>

## Deferred Ideas

- `/timeline` and `/statistics` deployment direct-open / refresh behavior belongs to Phase 32.
- Timeline / Statistics human UAT documentation closure belongs to Phase 32.
- New statistics metrics or completion percentage UI are out of scope for Phase 31.

</deferred>

---

*Phase: 31-statistics-sync-refresh-hardening*
*Context gathered: 2026-04-27*
