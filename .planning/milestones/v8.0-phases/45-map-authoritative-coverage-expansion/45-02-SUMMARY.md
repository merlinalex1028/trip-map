---
phase: 45-map-authoritative-coverage-expansion
plan: "02"
subsystem: frontend
tags: [vue, vitest, map-popup, footprint-availability, coverage]

requires:
  - phase: 44-world-footprints-map-footprint-date-dialog
    provides: snapshot-safe footprint dialog entry and disabled popup CTA baseline
provides:
  - frontend footprint availability classifier with exact blocking reasons
  - friendly unavailable category copy for recognized-but-unsaveable points
  - focused service and component specs for COV-01 and COV-03
affects: [phase-45, map-popup, leaflet-map-stage, coverage-expansion]

tech-stack:
  added: []
  patterns:
    - pure reason-returning frontend availability service
    - stable technical-reason to product-category mapping
    - blackbox Vue component tests for disabled CTA behavior

key-files:
  created:
    - apps/web/src/services/footprint-availability.ts
    - apps/web/src/services/footprint-availability.spec.ts
  modified:
    - apps/web/src/components/map-popup/PointSummaryCard.vue
    - apps/web/src/components/map-popup/PointSummaryCard.spec.ts

key-decisions:
  - "Frontend saveability is classified by one reason-returning service before the popup opens a save path."
  - "Unavailable popup copy is constrained to four stable friendly categories while tests preserve exact technical reasons."

patterns-established:
  - "FootprintAvailability: return saveable snapshot only when canonical identity, manifest, metadata status, and UI guard fields are complete."
  - "PointSummaryCard unavailable UI: keep disabled data-footprint-cta visible and render category copy through data-footprint-unavailable-category."

requirements-completed: [COV-01, COV-03]

duration: 9min
completed: 2026-05-18
---

# Phase 45 Plan 02: Frontend Footprint Availability Summary

**Reason-returning frontend saveability classification with stable friendly unavailable categories for the map popup.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-05-18T02:08:12Z
- **Completed:** 2026-05-18T02:17:11Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Added `getFootprintAvailability()` with seven exact technical blocking reasons and saveable `FootprintPlaceSnapshot` output.
- Added explicit reason-to-category mapping and the four Phase 45 friendly unavailable copy strings.
- Updated `PointSummaryCard` to keep disabled `留下足迹` visible, render safe category copy, and remove the saved-state `再留一枚足迹` branch.
- Added focused Vitest coverage for blocked reason/category/copy assertions, copy safety, and disabled CTA behavior.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create the footprint availability classifier and reason matrix tests** - `de05657` (feat)
2. **Task 2: Render friendly unavailable categories in PointSummaryCard** - `9f213cd` (feat)

## Files Created/Modified

- `apps/web/src/services/footprint-availability.ts` - Pure availability classifier, category copy constants, forbidden copy terms, and reason mapping.
- `apps/web/src/services/footprint-availability.spec.ts` - Seven technical blocked cases, California saveable case, and copy safety matrix.
- `apps/web/src/components/map-popup/PointSummaryCard.vue` - Category/copy props, disabled reason category hook, and unified `留下足迹` CTA label.
- `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` - Four category copy render cases, saved CTA text assertions, copy safety, and disabled click guard.

## Decisions Made

- Followed the plan copy contract for `place_not_precise_enough`: `已识别到这个地点，但还需要更稳定的地点信息才能保存足迹。`
- Kept `PointSummaryCard` wiring prop-based for this plan; Phase 45 plan 03 owns connecting the classifier through `LeafletMapStage` and `MapContextPopup`.
- Did not modify `.planning/STATE.md` or `.planning/ROADMAP.md`; the orchestrator owns those shared artifacts.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The runtime is a normal repository workspace on `main`, not a `.git` file isolated worktree. The required base `344cc5297e8c3b9e587c05114a5a09ef3e4e5fc3` is present, and shared orchestrator artifacts were avoided.
- Parallel plan 45-01 commits landed during execution. No owned files overlapped, and no changes from that plan were reverted or staged.
- Stub scan found only intentional empty defaults in test helpers/service options and decorative `alt=""` image attributes; no UI-blocking stubs were introduced.

## Verification

- `rg -n "FootprintBlockingReason|FootprintUnavailableCategory|FOOTPRINT_UNAVAILABLE_CATEGORY_COPY|FORBIDDEN_FOOTPRINT_COPY_TERMS|getFootprintAvailability|mapFootprintBlockingReasonToCategory" apps/web/src/services/footprint-availability.ts` - PASS
- `rg -n "missing_boundary_id|missing_geometry_manifest|missing_metadata_catalog|frontend_guard_blocked|missing_canonical_identity|fallback_explanatory_only|record_authoritative_rejected" apps/web/src/services/footprint-availability.spec.ts` - PASS
- `rg -n "已识别到这个地点，但地图数据还不够完整，暂时不能保存足迹。|已识别到这个地点，但还需要更稳定的地点信息才能保存足迹。|这里暂时只能用于查看位置，还不能留下足迹。|这个地点暂时还不能保存足迹，请稍后再试。" apps/web/src/services/footprint-availability.ts apps/web/src/services/footprint-availability.spec.ts` - PASS
- `rg -n "FootprintUnavailableCategory|FOOTPRINT_UNAVAILABLE_CATEGORY_COPY|footprintUnavailableCategory|footprintUnavailableCopy|data-footprint-unavailable-category" apps/web/src/components/map-popup/PointSummaryCard.vue` - PASS
- `rg -n "map_data_unavailable|place_not_precise_enough|outside_supported_map|temporarily_unavailable|已识别到这个地点，但地图数据还不够完整，暂时不能保存足迹。|这里暂时只能用于查看位置，还不能留下足迹。" apps/web/src/components/map-popup/PointSummaryCard.spec.ts` - PASS
- `rg -n "再留一枚足迹|再留一次足迹|再记一次|点亮" apps/web/src/components/map-popup/PointSummaryCard.vue` - PASS, no lines returned
- `pnpm --filter @trip-map/web test -- src/services/footprint-availability.spec.ts` - PASS, 9 tests
- `pnpm --filter @trip-map/web test -- src/services/footprint-availability.spec.ts src/components/map-popup/PointSummaryCard.spec.ts` - PASS, 33 tests

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 03 can wire `getFootprintAvailability()` into the real map popup/date-dialog guard and pass `footprintUnavailableCategory` plus `footprintUnavailableCopy` through the popup bridge.

## Self-Check: PASSED

- Confirmed all key files exist.
- Confirmed task commits `de05657` and `9f213cd` exist in git history.
- Confirmed `.planning/STATE.md` and `.planning/ROADMAP.md` were not staged for this plan.

---
*Phase: 45-map-authoritative-coverage-expansion*
*Completed: 2026-05-18*
