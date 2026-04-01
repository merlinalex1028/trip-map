---
phase: 15-服务端记录与点亮闭环
plan: 03
subsystem: ui
tags: [vue, typescript, popup, illuminate, button, tdd]

# Dependency graph
requires:
  - phase: 15-02
    provides: map-points store with illuminate/unilluminate actions, travelRecords, pendingPlaceIds
provides:
  - PointSummaryCard with illuminate button in title row (state-driven text/color/disabled)
  - MapContextPopup forwarding isSaved/isPending props and illuminate/unilluminate emits
  - LeafletMapStage wired to store illuminate/unilluminate actions via handlers
  - 9 new unit tests for illuminate button rendering and interaction
affects: [16, popup, leaflet, store]

# Tech tracking
tech-stack:
  added: []
  patterns: [TDD red-green for UI button, emit-chain pattern through component hierarchy]

key-files:
  created: []
  modified:
    - apps/web/src/components/map-popup/PointSummaryCard.vue (illuminate button + props + emits + CSS)
    - apps/web/src/components/map-popup/PointSummaryCard.spec.ts (9 new illuminate tests)
    - apps/web/src/components/map-popup/MapContextPopup.vue (isSaved/isPending props + emit forwarding)
    - apps/web/src/components/LeafletMapStage.vue (computeds + handlers wired to store)

key-decisions:
  - "illuminate button placed in title-row as 3rd grid column — stays visible without scrolling"
  - "isActivePointSaved computed checks travelRecords.some(r => r.placeId === pid) for reactivity"
  - "handleIlluminate builds summary object from surface.point fields directly available in LeafletMapStage"

patterns-established:
  - "Emit-chain: PointSummaryCard → MapContextPopup → LeafletMapStage → store action"
  - "Optimistic illuminate state read from travelRecords + pendingPlaceIds shallowRefs"

requirements-completed: [UIX-02, UIX-03]

# Metrics
duration: ~20min
completed: 2026-04-01
---

# Phase 15 Plan 03: 点亮按钮 UI Summary

**Illuminate/un-illuminate button added to popup title row with teal state color, wired through MapContextPopup → LeafletMapStage → map-points store actions, with 9 TDD unit tests covering all states.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-01T14:30:00Z
- **Completed:** 2026-04-01T14:50:00Z
- **Tasks:** 1/2 (Task 2 is checkpoint:human-verify — awaiting visual confirmation)
- **Files modified:** 4

## Accomplishments

- `PointSummaryCard.vue` now accepts `isSaved` and `isPending` props, emits `illuminate` and `unilluminate` events
- Illuminate button renders in title row with text "点亮" (off) or "已点亮" (on), teal color when on, disabled during pending
- `MapContextPopup.vue` passes `isSaved`/`isPending` props through and forwards emits up the chain
- `LeafletMapStage.vue` computes `isActivePointSaved`/`isActivePointPending` from store reactive refs; `handleIlluminate`/`handleUnilluminate` call store actions
- 9 unit tests added to `PointSummaryCard.spec.ts` — all passing (138 total tests pass)
- TypeCheck passes with `vue-tsc --noEmit`
- Candidate-select mode correctly does NOT show illuminate button

## Task Commits

1. **Task 1: Add illuminate button to PointSummaryCard and wire through popup chain** - `5e0bf71` (feat)

Task 2 (checkpoint:human-verify) is pending human visual verification.

## Files Created/Modified

- `apps/web/src/components/map-popup/PointSummaryCard.vue` — Added `isSaved`/`isPending` props, `illuminate`/`unilluminate` emits, illuminate button in title row, 3-column title-row grid, illuminate CSS
- `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` — Added 9 illuminate button tests
- `apps/web/src/components/map-popup/MapContextPopup.vue` — Added `isSaved`/`isPending` props, forward `illuminate`/`unilluminate` emits to PointSummaryCard
- `apps/web/src/components/LeafletMapStage.vue` — Added `travelRecords`/`pendingPlaceIds` from storeToRefs, `isActivePointSaved`/`isActivePointPending` computeds, `handleIlluminate`/`handleUnilluminate` handlers wired to store

## Decisions Made

- illuminate button placed as 3rd column in title-row grid — always visible without scrolling, adjacent to type-label pill
- `isActivePointSaved` reads from `travelRecords.value.some(r => r.placeId === pid)` for reactive derivation
- `handleIlluminate` constructs the summary object from `surface.point` fields — no extra store lookup needed

## Deviations from Plan

None - plan executed exactly as written. Worktree was behind main branch (missing 15-01/15-02 commits); merged main before proceeding.

## Issues Encountered

- Worktree branch `worktree-agent-acf01fcc` was behind main — needed `git merge main` to get 15-01/15-02 changes before implementing
- `node_modules` missing in worktree — ran `pnpm install` + `pnpm --filter @trip-map/contracts build` to restore baseline

## Known Stubs

None — illuminate button is fully wired to store actions. Data flows: button click → emit → LeafletMapStage handler → store.illuminate/unilluminate → API call.

## Next Phase Readiness

- All three plans of Phase 15 are implemented; awaiting human visual verification of the complete flow
- Map starts empty (no seed data), illuminate creates TravelRecord via server API, highlight syncs via savedBoundaryIds computed

---
*Phase: 15-服务端记录与点亮闭环*
*Completed: 2026-04-01 (Task 1 complete; Task 2 checkpoint pending)*

## Self-Check: PASSED

- [x] `apps/web/src/components/map-popup/PointSummaryCard.vue` exists and contains `illuminate-btn`
- [x] `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` exists with 9 illuminate tests
- [x] `apps/web/src/components/map-popup/MapContextPopup.vue` contains `isSaved` prop
- [x] `apps/web/src/components/LeafletMapStage.vue` contains `isActivePointSaved` and `handleIlluminate`
- [x] Commit `5e0bf71` exists (feat(15-03))
- [x] 138 tests pass, typecheck passes
