---
phase: 47-dashboard
plan: 04
subsystem: ui
tags: [vue, memories, ranking, postcards, build]
requires:
  - phase: 47-dashboard
    provides: Plan 47-01 stats payload and Plan 47-03 populated route composition
provides:
  - Visual Top 5 popular footprint list
  - Browse-only real-record memory postcard strip
  - Final populated /memories dashboard bands
affects: [dashboard, memories, route-state]
tech-stack:
  added: []
  patterns:
    - Browse-only local decorative media over real record seeds
    - Fixed visual Top 5 display over server-ordered stats payload
key-files:
  created:
    - apps/web/src/components/memories/PopularFootprintsList.vue
    - apps/web/src/components/memories/PopularFootprintsList.spec.ts
    - apps/web/src/components/memories/MemoryPostcardStrip.vue
    - apps/web/src/components/memories/MemoryPostcardStrip.spec.ts
  modified:
    - apps/web/src/views/StatisticsPageView.vue
    - apps/web/src/views/StatisticsPageView.spec.ts
    - apps/web/src/components/memories/MemoriesChartGrid.spec.ts
    - apps/web/src/components/memories/MemoriesOverviewGrid.spec.ts
key-decisions:
  - "The ranking component trusts server order and defensively renders only the first five rows."
  - "The postcard strip uses deterministic local scenic variants and remains non-interactive."
patterns-established:
  - "Final memories bands are presentational children of the protected route and receive stats payload props."
requirements-completed: [MEM-04, MEM-05, MEM-06, MEM-07]
duration: 14m
completed: 2026-05-26
---

# Phase 47: Dashboard Plan 04 Summary

**The populated memories dashboard now includes real Top 5 footprint ranking and a browse-only postcard strip sourced from `stats.memories`.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-05-26T02:51:38Z
- **Completed:** 2026-05-26T03:05:57Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Added `PopularFootprintsList` for a fixed visual Top 5 with rank, place, repeat count, and latest-date context.
- Added `MemoryPostcardStrip` for real dated memory seeds with deterministic local scenic artwork.
- Wired both final bands into the populated `/memories` route while empty accounts still omit populated modules.
- Closed the focused web test gate and production build gate.

## Task Commits

1. **Task 1 RED: popular footprint tests** - `e2af441`
2. **Task 1 GREEN: popular footprint list** - `4fdb0aa`
3. **Task 2 RED: postcard strip tests** - `86c6713`
4. **Task 2 GREEN: postcard strip** - `7373358`
5. **Task 3 RED: final band route tests** - `714cd5d`
6. **Task 3 GREEN: final dashboard band wiring** - `ed9bdcb`

**Plan metadata:** included in this summary commit

## Files Created/Modified

- `apps/web/src/components/memories/PopularFootprintsList.vue` - Visual Top 5 ranking section.
- `apps/web/src/components/memories/PopularFootprintsList.spec.ts` - Ranking count, limit, and missing-date coverage.
- `apps/web/src/components/memories/MemoryPostcardStrip.vue` - Horizontal browse-only real-memory strip.
- `apps/web/src/components/memories/MemoryPostcardStrip.spec.ts` - Visible place/date, semantics, and stable variant coverage.
- `apps/web/src/views/StatisticsPageView.vue` - Final populated dashboard composition.
- `apps/web/src/views/StatisticsPageView.spec.ts` - Populated/empty route assertions for final bands.
- `apps/web/src/components/memories/MemoriesChartGrid.spec.ts` - Type-safe wrapper existence assertions.
- `apps/web/src/components/memories/MemoriesOverviewGrid.spec.ts` - Type-safe wrapper existence assertions.

## Decisions Made

- Kept ranking non-clickable and non-tabular, with no expansion or sorting controls.
- Kept postcards as non-interactive articles, not links, buttons, upload slots, or viewers.
- Built contracts before the web build so `vue-tsc` saw the refreshed ignored `dist` types for the workspace package.

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0 auto-fixed.
**Impact on plan:** No sidebar, time-filter, upload, viewer, favorites, expanded leaderboard, or schema work was introduced.

## Issues Encountered

- `pnpm --filter @trip-map/web build` initially saw stale `@trip-map/contracts` generated types. Running `pnpm --filter @trip-map/contracts build` refreshed local ignored `dist` output; no source contract change was needed.
- `vue-tsc` flagged a few Vue Test Utils `get(...).exists()` type assertions. They were changed to `find(...).exists()` without altering behavior.

## User Setup Required

None - no external service configuration required.

## Verification

- `pnpm --filter @trip-map/web test src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/components/common/BaseChart.spec.ts src/components/memories/MemoriesOverviewGrid.spec.ts src/components/memories/MemoriesChartGrid.spec.ts src/components/memories/PopularFootprintsList.spec.ts src/components/memories/MemoryPostcardStrip.spec.ts` - passed, 34 tests.
- `pnpm --filter @trip-map/web build` - passed.
- `rg -n "全部时间|查看更多|上传照片|照片上传|viewer|我的收藏|收藏" apps/web/src/views/StatisticsPageView.vue apps/web/src/components/memories` - no matches.

## Next Phase Readiness

All four Phase 47 plans now have summaries. Phase-level review, regression gates, and verification can evaluate the complete memories dashboard against MEM-01 through MEM-07.

---
*Phase: 47-dashboard*
*Completed: 2026-05-26*
