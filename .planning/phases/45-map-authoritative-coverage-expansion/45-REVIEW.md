---
phase: 45
phase_name: map-authoritative-coverage-expansion
status: clean
review_depth: standard
files_reviewed: 18
findings:
  critical: 0
  warning: 0
  info: 0
  total: 0
reviewed_at: 2026-05-18
reviewer: codex-inline
---

# Code Review: Phase 45

## Scope

Reviewed the Phase 45 source and test changes, plus the test-gate stabilization changes made during execution:

- `apps/server/scripts/vitest-run.mjs`
- `apps/server/test/auth-bootstrap.e2e-spec.ts`
- `apps/server/test/canonical-resolve.e2e-spec.ts`
- `apps/server/test/phase45-coverage-cases.ts`
- `apps/server/test/records-travel.e2e-spec.ts`
- `apps/server/vitest.config.ts`
- `apps/web/package.json`
- `apps/web/src/components/LeafletMapStage.spec.ts`
- `apps/web/src/components/LeafletMapStage.vue`
- `apps/web/src/components/map-popup/MapContextPopup.spec.ts`
- `apps/web/src/components/map-popup/MapContextPopup.vue`
- `apps/web/src/components/map-popup/PointSummaryCard.spec.ts`
- `apps/web/src/components/map-popup/PointSummaryCard.vue`
- `apps/web/src/services/footprint-availability.spec.ts`
- `apps/web/src/services/footprint-availability.ts`
- `apps/web/src/services/geometry-manifest.spec.ts`
- `apps/web/src/services/timeline.spec.ts`
- `apps/web/src/views/StatisticsPageView.spec.ts`

## Findings

No critical, warning, or info findings.

## Notes

- `getFootprintAvailability()` consistently blocks missing canonical identity, missing boundary identity, missing metadata, missing manifest coverage, fallback-only results, and record API authoritative rejection before opening the date dialog.
- `LeafletMapStage.vue` passes the computed availability state through `MapContextPopup` into `PointSummaryCard`, and the save path revalidates snapshot fields before calling `illuminate()`.
- The server test runner now serializes DB-backed Vitest files and retries the full server suite once only for explicit transient Prisma database connectivity failures in non-focused runs. Focused test selections still fail normally, preserving debugging signal.
- The added coverage samples exercise Phase 45 canonical resolve, frontend guard, record API validation, and derived replay paths without exposing implementation terms to user-facing unavailable copy.

## Verification Context

The review was performed after the root test gate passed with:

- `pnpm --filter @trip-map/server test`
- `pnpm run test`

