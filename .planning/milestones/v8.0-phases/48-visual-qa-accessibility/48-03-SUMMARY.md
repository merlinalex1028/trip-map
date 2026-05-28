---
phase: 48-visual-qa-accessibility
plan: 03
subsystem: accessibility
tags: [vue, vitest, leaflet, dialog, calendar, echarts, aria, focus]

requires:
  - phase: 48-visual-qa-accessibility
    provides: "Desktop evidence harness and auth/sidebar accessibility baseline"
provides:
  - "Map popup and footprint date dialog keyboard/focus regression coverage"
  - "Calendar, close, cancel, and submit accessible labels for the footprint flow"
  - "Memories chart panel labels and BaseChart accessible names"
  - "Chart loading/empty and memories error status announcements"
affects: [phase-48, map-popup, footprint-date-dialog, memories-dashboard, visual-qa]

tech-stack:
  added: []
  patterns:
    - "TDD RED/GREEN component accessibility gates for Vue SFCs"
    - "Chart panel headings provide stable aria-labelledby targets"
    - "BaseChart receives semantic labels from the owning dashboard panel"

key-files:
  created:
    - .planning/phases/48-visual-qa-accessibility/48-03-SUMMARY.md
  modified:
    - apps/web/src/components/LeafletMapStage.vue
    - apps/web/src/components/LeafletMapStage.spec.ts
    - apps/web/src/components/map-popup/FootprintDateDialog.vue
    - apps/web/src/components/map-popup/FootprintDateDialog.spec.ts
    - apps/web/src/components/common/BaseChart.vue
    - apps/web/src/components/common/BaseChart.spec.ts
    - apps/web/src/components/memories/MemoriesChartGrid.vue
    - apps/web/src/components/memories/MemoriesChartGrid.spec.ts
    - apps/web/src/views/StatisticsPageView.vue
    - apps/web/src/views/StatisticsPageView.spec.ts
    - .planning/phases/48-visual-qa-accessibility/evidence/desktop-checklist.md

key-decisions:
  - "FootprintDateDialog owns initial focus when opened; LeafletMapStage owns return focus after cancel/close/save."
  - "Memories chart accessible names are assigned by MemoriesChartGrid and exposed through BaseChart."

patterns-established:
  - "Dialog focus regressions are guarded by document.activeElement assertions in focused component specs."
  - "Chart/status accessibility is verified through BaseChart, MemoriesChartGrid, and route-level state tests."

requirements-completed: [QA-02, QA-03]

duration: 18min
completed: 2026-05-27
---

# Phase 48 Plan 03: Map Dialog and Chart Accessibility Summary

**Keyboard-safe footprint dialog focus flow plus readable memories chart/status semantics**

## Performance

- **Duration:** 18min
- **Started:** 2026-05-27T11:50:10Z
- **Completed:** 2026-05-27T12:08:16Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Added TDD coverage for footprint dialog initial focus, Calendar labeling, cancel focus return, and save focus return.
- Repaired the footprint dialog so opening focuses `[data-region="footprint-date-dialog"]`, and closing/canceling returns focus to `[data-footprint-cta="true"]`.
- Added readable chart names to `BaseChart` and wired all four memories chart panels to stable heading labels.
- Marked chart loading/empty states as polite status updates and memories route errors as alerts.
- Updated `desktop-checklist.md` with `48-03-map-dialog-chart-a11y` evidence for map/dialog and chart/status surfaces.

## Task Commits

1. **Task 1 RED: Map dialog focus accessibility gate** - `f0d5f75` (test)
2. **Task 1 GREEN: Footprint dialog focus flow repair** - `553222a` (fix)
3. **Task 2 RED: Chart status accessibility gate** - `92c45a3` (test)
4. **Task 2 GREEN: Memories chart accessible names** - `1f79564` (fix)

_Both tasks followed the requested TDD flow with RED test commits before GREEN implementation commits._

## Files Created/Modified

- `apps/web/src/components/LeafletMapStage.vue` - Restores focus to the footprint CTA after date-dialog cancel/close paths.
- `apps/web/src/components/LeafletMapStage.spec.ts` - Guards save and cancel focus return behavior.
- `apps/web/src/components/map-popup/FootprintDateDialog.vue` - Focuses the dialog surface on open and labels the Calendar region.
- `apps/web/src/components/map-popup/FootprintDateDialog.spec.ts` - Guards dialog initial focus and Calendar labeling.
- `apps/web/src/components/common/BaseChart.vue` - Exposes chart accessible names and announced loading/empty states.
- `apps/web/src/components/common/BaseChart.spec.ts` - Covers BaseChart names and status semantics.
- `apps/web/src/components/memories/MemoriesChartGrid.vue` - Adds heading labels and chart label props for all four panels.
- `apps/web/src/components/memories/MemoriesChartGrid.spec.ts` - Covers stable panel labels and BaseChart label wiring.
- `apps/web/src/views/StatisticsPageView.vue` - Marks the memories error state as an alert.
- `apps/web/src/views/StatisticsPageView.spec.ts` - Guards error alert semantics and preserves empty-account module absence.
- `.planning/phases/48-visual-qa-accessibility/evidence/desktop-checklist.md` - Records Task 1 and Task 2 evidence rows.

## Decisions Made

- Kept focus ownership split by component boundary: the modal owns initial focus, while the map stage owns returning focus to its popup trigger.
- Used BaseChart container labels instead of adding new ECharts dependencies or changing chart option contracts.
- Preserved all existing `data-chart-panel` values and empty-account behavior.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added footprint dialog focus and Calendar label semantics**
- **Found during:** Task 1 (Gate map popup and date dialog focus flow)
- **Issue:** Existing tests did not assert dialog initial focus, Calendar accessible naming, or cancel focus restoration.
- **Fix:** Added failing assertions, focused the dialog surface on open, labeled the Calendar region, and returned focus to the footprint CTA after cancel/close.
- **Files modified:** `apps/web/src/components/LeafletMapStage.vue`, `apps/web/src/components/LeafletMapStage.spec.ts`, `apps/web/src/components/map-popup/FootprintDateDialog.vue`, `apps/web/src/components/map-popup/FootprintDateDialog.spec.ts`
- **Verification:** `pnpm --filter @trip-map/web test -- src/components/LeafletMapStage.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/map-popup/FootprintDateDialog.spec.ts`
- **Committed in:** `553222a`

**2. [Rule 2 - Missing Critical] Added chart/status accessible names and announcements**
- **Found during:** Task 2 (Gate chart/status accessible names and non-empty evidence)
- **Issue:** BaseChart containers had no readable chart name, chart loading/empty states were not status regions, chart panels lacked stable heading relationships, and the memories error block was not an alert.
- **Fix:** Added `label` support to BaseChart, panel `aria-labelledby` relationships, chart label wiring, status roles, and route-level alert semantics.
- **Files modified:** `apps/web/src/components/common/BaseChart.vue`, `apps/web/src/components/common/BaseChart.spec.ts`, `apps/web/src/components/memories/MemoriesChartGrid.vue`, `apps/web/src/components/memories/MemoriesChartGrid.spec.ts`, `apps/web/src/views/StatisticsPageView.vue`, `apps/web/src/views/StatisticsPageView.spec.ts`
- **Verification:** `pnpm --filter @trip-map/web test -- src/components/common/BaseChart.spec.ts src/components/memories/MemoriesChartGrid.spec.ts src/views/StatisticsPageView.spec.ts`
- **Committed in:** `1f79564`

---

**Total deviations:** 2 auto-fixed (Rule 2: 2)
**Impact on plan:** Both fixes were required to satisfy QA-02/QA-03 and stayed within the plan's owner files.

## Issues Encountered

None. Pre-existing uncommitted `.planning/config.json` and unrelated untracked files were left untouched.

## Auth Gates

None.

## Known Stubs

None found. The `alt=""` matches in decorative image elements are intentional accessible-hidden image patterns, not UI stubs.

## Threat Flags

None. Changes stayed within existing client UI surfaces and did not add endpoints, auth paths, file access, schemas, or new trust boundaries.

## Verification

- `pnpm --filter @trip-map/web test -- src/components/LeafletMapStage.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/map-popup/FootprintDateDialog.spec.ts` - passed, 68 tests.
- `pnpm --filter @trip-map/web test -- src/components/common/BaseChart.spec.ts src/components/memories/MemoriesChartGrid.spec.ts src/views/StatisticsPageView.spec.ts` - passed, 21 tests.
- `pnpm --filter @trip-map/web test -- src/components/LeafletMapStage.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/map-popup/FootprintDateDialog.spec.ts src/components/common/BaseChart.spec.ts src/components/memories/MemoriesChartGrid.spec.ts src/views/StatisticsPageView.spec.ts` - passed, 89 tests.
- `grep -n "DialogTitle\|DialogDescription\|data-footprint-submit\|data-footprint-cancel\|data-footprint-calendar" apps/web/src/components/map-popup/FootprintDateDialog.vue` - found required source hooks.
- `grep -n "monthly-trend\|country-distribution\|yearly-trend\|memories-profile" apps/web/src/components/memories/MemoriesChartGrid.vue apps/web/src/components/memories/MemoriesChartGrid.spec.ts` - found stable selectors in source and specs.

## TDD Gate Compliance

- RED commit exists for Task 1: `f0d5f75`.
- GREEN commit exists for Task 1 after RED: `553222a`.
- RED commit exists for Task 2: `92c45a3`.
- GREEN commit exists for Task 2 after RED: `1f79564`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 48 can continue to Plan 04 with map/date-dialog/chart accessibility covered by focused regression tests and checklist evidence.

## Self-Check: PASSED

- Found `.planning/phases/48-visual-qa-accessibility/48-03-SUMMARY.md`.
- Found Task 1 RED commit `f0d5f75`.
- Found Task 1 GREEN commit `553222a`.
- Found Task 2 RED commit `92c45a3`.
- Found Task 2 GREEN commit `1f79564`.
- Plan-level focused verification passed with 7 files and 89 tests.

---
*Phase: 48-visual-qa-accessibility*
*Completed: 2026-05-27*
