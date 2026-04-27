---
phase: 31-statistics-sync-refresh-hardening
plan: "01"
subsystem: ui
tags: [vue, pinia, vitest, statistics, metadata-refresh]
requires:
  - phase: 28-overseas-coverage-expansion
    provides: authoritative overseas metadata fields for travel records
  - phase: 30-travel-statistics-and-completion-overview
    provides: server-backed statistics page and stats store
provides:
  - metadata-aware statistics refresh trigger on the statistics route
  - regression coverage for metadata-only authoritative refresh
  - regression coverage for same-user refresh without session-boundary reset
affects: [statistics, timeline-consistency, auth-bootstrap]
tech-stack:
  added: []
  patterns:
    - Vue computed revision source for route-local refresh invalidation
    - Vitest controlled-promise regression for in-flight refresh coalescing
key-files:
  created:
    - .planning/phases/31-statistics-sync-refresh-hardening/31-01-SUMMARY.md
  modified:
    - apps/web/src/views/StatisticsPageView.vue
    - apps/web/src/views/StatisticsPageView.spec.ts
    - apps/web/src/stores/auth-session.spec.ts
key-decisions:
  - "Keep statistics aggregation server-authoritative via /records/stats."
  - "Keep the refresh trigger route-local in StatisticsPageView.vue."
  - "Treat parentLabel, displayName, typeLabel, and subtitle as authoritative metadata inputs for statistics refresh."
patterns-established:
  - "StatisticsPageView uses a metadata-aware computed revision to trigger existing stats fetch/coalescing behavior."
  - "Same-user auth refresh is tested as a metadata-only authoritative snapshot without boundaryVersion changes."
requirements-completed: [STAT-03]
duration: 12min
completed: 2026-04-27
---

# Phase 31 Plan 01: Statistics Sync Refresh Hardening Summary

**Metadata-only authoritative travel-record refreshes now invalidate statistics without changing the statistics page UI.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-27T08:15:02Z
- **Completed:** 2026-04-27T08:27:27Z
- **Tasks:** 2 completed
- **Files modified:** 3 source/test files, 1 summary file

## Accomplishments

- Extended `StatisticsPageView.vue` so `travelRecordRevision` includes `parentLabel`, `displayName`, `typeLabel`, and `subtitle` in addition to identity fields.
- Added route-level regressions proving metadata-only authoritative refresh triggers a fresh stats request and in-flight metadata changes queue one follow-up fetch.
- Added auth-session regression proving same-user metadata refresh applies authoritative records without resetting `boundaryVersion`.
- Preserved Phase 31 UI contract: no template, copy, color, layout, route, focus, or scroll behavior changes.

## Task Commits

1. **Task 1 RED and Task 2 regression tests** - `fcd3f70` (`test(31-01): add metadata refresh regressions`)
2. **Task 1 GREEN implementation** - `6af1765` (`feat(31-01): refresh stats on metadata changes`)

## Files Created/Modified

- `apps/web/src/views/StatisticsPageView.vue` - Replaced identity-only record revision with metadata-aware revision.
- `apps/web/src/views/StatisticsPageView.spec.ts` - Added metadata-only refresh and in-flight coalescing regressions.
- `apps/web/src/stores/auth-session.spec.ts` - Added same-user metadata refresh boundary regression.
- `.planning/phases/31-statistics-sync-refresh-hardening/31-01-SUMMARY.md` - Captures execution outcome.

## Decisions Made

- No `updatedAt` contract field was added; explicit authoritative metadata fields are enough for this gap.
- No shared revision helper was introduced; only `StatisticsPageView.vue` needs this route-local invalidation behavior.
- No backend or `statsStore` production logic was changed; existing `/records/stats`, `boundaryVersion`, and `activeRequestId` protections remain authoritative.

## Deviations from Plan

None - plan executed exactly as written.

---

**Total deviations:** 0 auto-fixed.
**Impact on plan:** No scope changes.

## Issues Encountered

None.

## Verification

- `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts` - passed, 11 tests.
- `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/stores/auth-session.spec.ts` - passed, 33 tests.
- `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/stores/auth-session.spec.ts src/stores/map-points.spec.ts` - passed, 82 tests.
- `pnpm --filter @trip-map/web typecheck` - passed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 31 is ready for phase-level verification. Phase 32 can rely on statistics and timeline consistency for metadata-only authoritative refreshes while it closes route deep-link and UAT gaps.

## Self-Check: PASSED

- Key modified files exist on disk.
- Task commits exist: `fcd3f70`, `6af1765`.
- Required `STAT-03` behavior is covered by automated tests.
- No planned UI or backend scope was added.

---
*Phase: 31-statistics-sync-refresh-hardening*
*Completed: 2026-04-27*
