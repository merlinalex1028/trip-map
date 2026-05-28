---
phase: 44-world-footprints-map-footprint-date-dialog
plan: "01"
subsystem: testing
tags: [vue, vitest, map-popup, footprint-dialog, leaflet, shell]

requires:
  - phase: 43-landing
    provides: authenticated app shell, protected map route, and three-entry navigation baseline
provides:
  - Wave 0 red-state contracts for the world-footprints popup and footprint date dialog
  - Snapshot-safe Leaflet controller tests for independent footprint dialog submission
  - Marker and map-route sidebar visual hook contracts for Phase 44 implementation plans
affects:
  - 44-02 map stage marker/sidebar visuals
  - 44-03 unified popup refactor
  - 44-04 footprint date dialog
  - 44-05 snapshot-safe submission wiring

tech-stack:
  added: []
  patterns:
    - Vue Test Utils behavior-first component contracts
    - Vitest red-state contract tests for phased implementation

key-files:
  created:
    - apps/web/src/components/map-popup/FootprintDateDialog.spec.ts
  modified:
    - apps/web/src/components/map-popup/PointSummaryCard.spec.ts
    - apps/web/src/components/map-popup/MapContextPopup.spec.ts
    - apps/web/src/components/LeafletMapStage.spec.ts
    - apps/web/src/components/SeedMarkerLayer.spec.ts
    - apps/web/src/components/shell/AuthenticatedAppShell.spec.ts

key-decisions:
  - "Wave 0 intentionally locks red-state tests before implementing FootprintDateDialog.vue or popup/controller rewiring."
  - "Popup tests now reject old inline TripDateForm, PopupTripRecord history, and record-again branch behavior."
  - "Leaflet controller tests require dialog-open snapshot submission instead of reading the mutable active map point at submit time."

patterns-established:
  - "Dialog contract hooks: data-region=\"footprint-date-dialog\", data-footprint-shortcut, data-footprint-calendar, data-footprint-submit, data-footprint-cancel, data-footprint-error."
  - "Popup contract hooks: data-footprint-cta, data-footprint-unavailable-reason, and leaveFootprint event propagation."
  - "Visual boundary contract hooks: data-marker-visual=\"star-footprint\" and data-shell-visual-mode=\"world-footprints\"."

requirements-completed: [MAP-01, MAP-02, MAP-03, MAP-04, MAP-05, MAP-06, DATE-01, DATE-02, DATE-03, DATE-04, DATE-05, DATE-06]

duration: 27min
completed: 2026-05-13
---

# Phase 44 Plan 01: World Footprints Test Contracts Summary

**Executable red-state Vitest contracts now lock the Phase 44 popup, footprint date dialog, snapshot-safe map submission, marker visuals, and map-route sidebar hooks.**

## Performance

- **Duration:** 27 min
- **Started:** 2026-05-13T06:43:54Z
- **Completed:** 2026-05-13T07:10:26Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Added `FootprintDateDialog.spec.ts` to lock Dialog/Calendar hooks, four shortcuts, `YYYY-MM-DD` payloads, save-failure persistence, and cancel/close controls.
- Updated popup specs to require one unified `留下足迹` CTA, `leaveFootprint` propagation, saved-place hint copy, and disabled unavailable-place explanation.
- Added controller, marker, and shell contracts for snapshot-safe save, anonymous login gating, star-footprint marker hooks, and map-route `world-footprints` sidebar mode.

## Task Commits

1. **Task 1: popup 与日期 Dialog 的失败优先测试契约** - `9ea77e8` (test)
2. **Task 2: controller、marker、sidebar 的回归测试契约** - `ba7e395` (test)

## Files Created/Modified

- `apps/web/src/components/map-popup/FootprintDateDialog.spec.ts` - New red-state dialog contract for snapshot place details, shortcuts, payloads, failure, and cancel/close behavior.
- `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` - Replaces old illuminate/history expectations with unified footprint CTA, saved hint, disabled reason, and `leaveFootprint` event assertions.
- `apps/web/src/components/map-popup/MapContextPopup.spec.ts` - Adds `leaveFootprint` propagation while preserving non-modal popup semantics.
- `apps/web/src/components/LeafletMapStage.spec.ts` - Adds dialog open, snapshot-safe submission, and anonymous submit login-gate contracts.
- `apps/web/src/components/SeedMarkerLayer.spec.ts` - Locks star-footprint marker hook, hit target, star token, and reduced-motion style requirements.
- `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` - Locks the three-entry nav array and map-route `world-footprints` visual mode without `我的收藏`.

## Decisions Made

- Focused Vitest was run as a red-state contract check, not as a required green gate, because the plan explicitly says implementation follows in later plans.
- Kept existing unrelated tests in place even when they still assert old behavior; this plan adds/updates the contract surface without refactoring implementation files.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Initial `pnpm --filter @trip-map/web test -- LeafletMapStage PointSummaryCard MapContextPopup SeedMarkerLayer FootprintDateDialog` failed in the sandbox with `fetch failed`; reran with approved escalation.
- Escalated focused Vitest completed in expected red state: failures point to missing `FootprintDateDialog.vue`, missing `leaveFootprint` emits, missing `data-footprint-cta`, missing `data-marker-visual="star-footprint"`, and missing `data-shell-visual-mode="world-footprints"`.

## Acceptance Verification

- PASS: `rg -n "renders snapshot place details with Dialog and Calendar hooks|renders exactly four shortcut buttons today tomorrow weekend custom|emits YYYY-MM-DD single-day payload" apps/web/src/components/map-popup/FootprintDateDialog.spec.ts`
- PASS: `rg -n "data-footprint-cta|leaveFootprint|这里已经留下过足迹|data-footprint-unavailable-reason" apps/web/src/components/map-popup/PointSummaryCard.spec.ts apps/web/src/components/map-popup/MapContextPopup.spec.ts`
- PASS: `rg -n "PopupTripRecord|data-record-again|trip-date-form-wrapper|再留一次足迹|再记一次去访" apps/web/src/components/map-popup/PointSummaryCard.spec.ts` only finds negative assertions.
- PASS: `rg -n "saves against the dialog snapshot after active map point changes|opens the footprint date dialog from the unified popup CTA|opens the login modal instead of writing records when anonymous user submits a footprint" apps/web/src/components/LeafletMapStage.spec.ts`
- PASS: `rg -n "data-marker-visual=\"star-footprint\"|seed-marker__star|prefers-reduced-motion: reduce|width: 44px;|height: 44px;" apps/web/src/components/SeedMarkerLayer.spec.ts`
- PASS: `rg -n "world-footprints|\['map', 'journal', 'memories'\]|我的收藏" apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` shows `我的收藏` only in a negative assertion.
- INTENTIONAL RED: focused Vitest command failed with 17 failed tests and 1 failed suite, matching Wave 0 test-contract red state.

## Known Stubs

- `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` contains a pre-existing skipped logout TODO from Phase 43. This plan did not add or modify that stub.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 44 implementation plans can now use these specs as the contract to turn red tests green. The immediate follow-up work is implementing marker/sidebar hooks, refactoring popup events to `leaveFootprint`, creating `FootprintDateDialog.vue`, and wiring snapshot-safe submission.

## Self-Check: PASSED

- Created/modified key files exist.
- Task commits `9ea77e8` and `ba7e395` exist in git history.
- Text acceptance criteria pass.
- Focused Vitest red state is intentional and documented.

---
*Phase: 44-world-footprints-map-footprint-date-dialog*
*Completed: 2026-05-13*
