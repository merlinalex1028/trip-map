---
phase: 12-canonical
plan: 04
subsystem: ui
tags: [vue, vitest, canonical-summary, popup, drawer]
requires:
  - phase: 12-03
    provides: canonical summary fields in the web store and popup/drawer surfaces
provides:
  - popup and drawer regressions locked to canonical title, type label, and subtitle semantics
  - candidate-select regression coverage for recommended canonical candidates without fallback CTA
affects: [phase-12-canonical, popup, drawer, ui-regression]
tech-stack:
  added: []
  patterns: [canonical fixtures for UI regressions, popup/drawer cross-surface parity assertions]
key-files:
  created: [.planning/phases/12-canonical/12-04-SUMMARY.md]
  modified:
    - apps/web/src/components/map-popup/PointSummaryCard.spec.ts
    - apps/web/src/components/PointPreviewDrawer.spec.ts
    - .planning/STATE.md
    - .planning/ROADMAP.md
    - .planning/REQUIREMENTS.md
key-decisions:
  - "UI regressions continue to mount real popup and drawer surfaces, but all summary assertions now read canonical fixture fields instead of city-first aliases."
  - "Drawer parity tests use store handoff through startDraftFromDetection/saveDraftAsPoint/openDrawerView so the cross-surface contract stays aligned with runtime behavior."
patterns-established:
  - "Canonical summary parity: compare popup title/type/subtitle with drawer title/type/subtitle for the same saved point."
  - "Canonical admin label coverage: Beijing, Hong Kong, and California remain the baseline fixtures for China municipality, SAR, and overseas admin1 regressions."
requirements-completed: [UIX-04, PLC-05]
duration: 6min
completed: 2026-03-30
---

# Phase 12 Plan 04: Canonical Summary UI Summary

**Canonical popup/drawer regressions now lock Beijing, Hong Kong, and California to the same title, type label, subtitle, and recommended-candidate semantics**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-30T10:34:00Z
- **Completed:** 2026-03-30T10:40:28Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Locked popup candidate-select coverage to canonical fixtures, including recommended candidate markers and the removal of the fallback CTA.
- Migrated drawer regressions away from city-first fixtures and asserted real admin labels plus subtitles for Beijing, Hong Kong, and California.
- Added popup/drawer parity assertions so one canonical point renders the same title, type label, and subtitle across both surfaces.

## Task Commits

Each task was committed atomically:

1. **Task 1: 用 canonical summary 统一 popup 与 drawer 的真实类型展示** - `e94a4aa`, `fa3238c` (test, feat)
2. **Task 2: 用组件回归锁定真实行政称谓与跨表面一致性** - `93008db`, `091bc10` (test, test)

**Plan metadata:** pending

_Note: TDD tasks produced RED -> GREEN commit pairs._

## Files Created/Modified

- `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` - canonical popup regressions now use canonical fixtures consistently and type-check under `tsc --noEmit`.
- `apps/web/src/components/PointPreviewDrawer.spec.ts` - drawer regressions now cover Beijing/Hong Kong/California and compare popup/drawer summary parity through the store handoff.
- `.planning/phases/12-canonical/12-04-SUMMARY.md` - captures plan outcome, commits, deviations, and verification.
- `.planning/STATE.md` - advances Phase 12 plan progress to completion.
- `.planning/ROADMAP.md` - marks Phase 12 plan 12-04 complete and Phase 12 complete.
- `.planning/REQUIREMENTS.md` - keeps `UIX-04` and `PLC-05` tracked as complete under Phase 12.

## Decisions Made

- Kept UI regression coverage black-box: assertions target rendered title/type/subtitle and candidate markers rather than component internals.
- Used canonical fixtures only; no new city-priority test data was introduced.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Corrected an outdated popup spec helper call that broke `tsc --noEmit`**
- **Found during:** Task 2 verification
- **Issue:** `PointSummaryCard.spec.ts` still called `createDraftPoint` with an overrides object as the first argument, which TypeScript interpreted as a canonical summary and rejected.
- **Fix:** Replaced the stale call with a canonical fixture-backed `createDraftPoint(PHASE12_RESOLVED_CALIFORNIA)` usage.
- **Files modified:** `apps/web/src/components/map-popup/PointSummaryCard.spec.ts`
- **Verification:** `pnpm --dir apps/web exec vitest run src/components/map-popup/PointSummaryCard.spec.ts src/components/PointPreviewDrawer.spec.ts`, `pnpm --dir apps/web exec tsc --noEmit`
- **Committed in:** `091bc10` (part of Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix was required to satisfy the plan's typecheck gate. No scope creep.

## Issues Encountered

- `PointPreviewDrawer.spec.ts` still referenced a removed `createCityDraft` helper; replacing it with canonical fixture builders resolved the remaining RED state cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 12 canonical UI regressions are complete and green.
- Popup/drawer summary semantics are now locked for the upcoming geometry and Leaflet work in Phase 13/14.

## Known Stubs

None.

## Self-Check: PASSED

- Found summary file: `.planning/phases/12-canonical/12-04-SUMMARY.md`
- Verified task commits exist: `e94a4aa`, `fa3238c`, `93008db`, `091bc10`
