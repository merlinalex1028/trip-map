---
phase: 45-map-authoritative-coverage-expansion
plan: "03"
subsystem: frontend
tags: [vue, vitest, map-popup, footprint-availability, geometry-manifest]

requires:
  - phase: 45-01
    provides: Phase 45 runtime breakpoint fixture matrix and canonical saveable samples
  - phase: 45-02
    provides: frontend footprint availability classifier and unavailable category copy
  - phase: 44-05
    provides: snapshot-safe FootprintDateDialog submit flow
provides:
  - single-source availability wiring from LeafletMapStage to popup CTA and dialog entry
  - MapContextPopup bridge for unavailable category and copy
  - focused map-stage tests for blocked dialog entry and manifest-backed highlight loading
affects: [phase-45, map-popup, date-dialog, map-highlight, coverage-expansion]

tech-stack:
  added: []
  patterns:
    - computed availability result as the single frontend source of saveability truth
    - popup bridge props for friendly unavailable category/copy
    - focused Vitest runtime matrix assertions for blocked and saveable map flows

key-files:
  created:
    - .planning/phases/45-map-authoritative-coverage-expansion/45-03-SUMMARY.md
  modified:
    - apps/web/src/components/LeafletMapStage.vue
    - apps/web/src/components/LeafletMapStage.spec.ts
    - apps/web/src/components/map-popup/MapContextPopup.vue
    - apps/web/src/components/map-popup/MapContextPopup.spec.ts
    - apps/web/src/services/geometry-manifest.spec.ts

key-decisions:
  - "LeafletMapStage uses getFootprintAvailability(summarySurfaceState) as the single source for CTA enabled state, unavailable copy, and date-dialog entry."
  - "Blocked and fallback points are verified through the real popup CTA and FootprintDateDialog boundary, not dataset scans."
  - "Phase 45 highlight coverage is proven with manifest lookup plus focused LeafletMapStage save/highlight assertions."

patterns-established:
  - "openFootprintDateDialog copies availability.snapshot and never reconstructs a second saveability predicate."
  - "MapContextPopup forwards footprintUnavailableCategory and footprintUnavailableCopy directly to PointSummaryCard."

requirements-completed: [COV-02, COV-03]

duration: 6min
completed: 2026-05-18
---

# Phase 45 Plan 03: Map Availability Wiring Summary

**The real map popup now uses one availability result for disabled CTA copy, snapshot-safe date dialog entry, and Phase 45 manifest-backed highlight verification.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-18T02:43:43Z
- **Completed:** 2026-05-18T02:49:27Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Wired `getFootprintAvailability(summarySurfaceState)` into `LeafletMapStage` for CTA enabled state, unavailable category/copy, and `FootprintDateDialog` entry.
- Updated `MapContextPopup` to bridge unavailable category and copy to `PointSummaryCard`.
- Added focused map-stage coverage proving fallback and incomplete points never open the date dialog or create records.
- Added manifest coverage for `ne-admin1-us-california` and `ne-admin1-ca-british-columbia`, plus a save/highlight test for California.

## Task Commits

Each task was committed atomically:

1. **Task 1: Use one availability result for popup state and dialog entry** - `ab727ff` (feat)
2. **Task 2: Add matrix-driven map guard and highlight assertions** - `99b290c` (test)

## Files Created/Modified

- `apps/web/src/components/LeafletMapStage.vue` - Computes one active footprint availability result, passes unavailable copy to the popup, and opens the date dialog only from `availability.snapshot`.
- `apps/web/src/components/map-popup/MapContextPopup.vue` - Adds typed unavailable category/copy props and forwards them to `PointSummaryCard`.
- `apps/web/src/components/map-popup/MapContextPopup.spec.ts` - Verifies unavailable category/copy reach `PointSummaryCard`.
- `apps/web/src/components/LeafletMapStage.spec.ts` - Adds fallback, missing map data, enabled dialog entry, and manifest-backed highlight assertions.
- `apps/web/src/services/geometry-manifest.spec.ts` - Adds Phase 45 saveable boundary id manifest coverage.
- `.planning/phases/45-map-authoritative-coverage-expansion/45-03-SUMMARY.md` - Execution summary for this plan.

## Decisions Made

- Followed the Phase 45 single-source predicate requirement instead of keeping duplicate field guards in `openFootprintDateDialog()`.
- Kept `submitFootprintDate()` reading only `footprintPlaceSnapshot.value`, preserving the Phase 44 snapshot-safe submit rule.
- Kept the unavailable copy in existing popup surfaces; no diagnostic UI or coverage dashboard was added.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Aligned LeafletMapStage spec manifest mock with Phase 45 saveable samples**
- **Found during:** Task 2 (Add matrix-driven map guard and highlight assertions)
- **Issue:** The existing `LeafletMapStage.spec.ts` defaulted `getGeometryManifestEntry()` to `null`, which made real saveable California flows look unavailable after Task 1 correctly routed saveability through the manifest-aware classifier.
- **Fix:** Added a default California manifest entry in the spec mock while keeping unknown boundaries unresolved for the missing-manifest test.
- **Files modified:** `apps/web/src/components/LeafletMapStage.spec.ts`
- **Verification:** `pnpm --filter @trip-map/web test -- src/components/LeafletMapStage.spec.ts`
- **Committed in:** `99b290c`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix only corrected test runtime setup so it matched the real Phase 45 manifest-backed sample; product code scope stayed unchanged.

## Issues Encountered

- Runtime was a normal repository checkout on `main` with `.git` as a directory, not an isolated worktree. The required base `fecd4f9c43b7d365657ec93ca03528565c8e7ecd` was present. Shared orchestrator artifacts were not edited.
- Initial Task 1 commit attempt hit sandbox protection writing `.git/index.lock`; reran with escalation to create the required task commit.

## Known Stubs

None. Stub scan found only test helper defaults, intentional nullable runtime state, and DOM cleanup assignments; no UI-blocking stubs were introduced.

## Threat Flags

None. The touched trust boundaries were already listed in the plan threat model: map popup to date dialog, active point to snapshot, and manifest lookup to highlight layer.

## Verification

- `rg -n "getFootprintAvailability|activeFootprintAvailability|activeFootprintUnavailableCategory|activeFootprintUnavailableCopy" apps/web/src/components/LeafletMapStage.vue` - PASS
- `rg -n "availability\\.snapshot|footprintPlaceSnapshot\\.value = \\{ \\.\\.\\.availability\\.snapshot \\}|!availability\\.saveable" apps/web/src/components/LeafletMapStage.vue` - PASS
- `rg -n "summarySurfaceState\\.value" apps/web/src/components/LeafletMapStage.vue` - PASS; no usage in `submitFootprintDate()`
- `rg -n "footprintUnavailableCategory|footprintUnavailableCopy|FootprintUnavailableCategory" apps/web/src/components/map-popup/MapContextPopup.vue apps/web/src/components/map-popup/MapContextPopup.spec.ts` - PASS
- `rg -n "keeps the date dialog closed for fallback explanatory-only points|keeps the date dialog closed for missing map data points|uses footprint availability for enabled CTA and dialog entry|loads manifest-backed highlight for Phase 45 saveable samples" apps/web/src/components/LeafletMapStage.spec.ts` - PASS
- `rg -n "这里暂时只能用于查看位置，还不能留下足迹。|已识别到这个地点，但地图数据还不够完整，暂时不能保存足迹。|data-footprint-unavailable-reason|data-region=\\\"footprint-date-dialog\\\"" apps/web/src/components/LeafletMapStage.spec.ts` - PASS
- `rg -n "covers Phase 45 saveable boundary ids used by the runtime matrix|ne-admin1-us-california|ne-admin1-ca-british-columbia|2026-04-21-geo-v3" apps/web/src/services/geometry-manifest.spec.ts` - PASS
- `pnpm --filter @trip-map/web test -- src/services/footprint-availability.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/map-popup/MapContextPopup.spec.ts` - PASS, 37 tests
- `pnpm --filter @trip-map/web test -- src/components/LeafletMapStage.spec.ts` - PASS, 28 tests
- `pnpm --filter @trip-map/web test -- src/components/LeafletMapStage.spec.ts src/services/geometry-manifest.spec.ts` - PASS, 40 tests

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 45-04 can rely on the real frontend chain: saveable Phase 45 samples open the snapshot-safe date dialog and trigger manifest-backed highlight loading, while blocked/fallback points keep a disabled `留下足迹` CTA and never reach record creation.

## Self-Check: PASSED

- Found `apps/web/src/components/LeafletMapStage.vue`
- Found `apps/web/src/components/LeafletMapStage.spec.ts`
- Found `apps/web/src/components/map-popup/MapContextPopup.vue`
- Found `apps/web/src/components/map-popup/MapContextPopup.spec.ts`
- Found `apps/web/src/services/geometry-manifest.spec.ts`
- Found commits `ab727ff` and `99b290c`
- Confirmed `.planning/STATE.md` and `.planning/ROADMAP.md` were not modified.

---
*Phase: 45-map-authoritative-coverage-expansion*
*Completed: 2026-05-18*
