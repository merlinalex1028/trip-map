---
phase: 16-uat-gap-fallback-smoke-record-schema-typelabel-california
plan: 02
subsystem: ui
tags: [vue, pinia, leaflet, vitest, canonical-metadata, geometry-shards]
requires:
  - phase: 16-01
    provides: TravelRecord canonical metadata persisted from server round-trip
provides:
  - Saved popup surfaces rehydrate canonical typeLabel/parentLabel/subtitle from TravelRecord
  - Fallback popup surfaces expose a disabled illuminate affordance with explicit unsupported messaging
  - Successful illuminate actions load geometry shards immediately so saved overlays render in-session
affects: [phase-16-03, web-popup, web-map-stage, canonical-record-display]
tech-stack:
  added: []
  patterns: [MapPoint carries canonical metadata end-to-end, illuminate success eagerly loads geometry shards]
key-files:
  created: []
  modified:
    - apps/web/src/stores/map-points.ts
    - apps/web/src/stores/map-points.spec.ts
    - apps/web/src/components/map-popup/PointSummaryCard.vue
    - apps/web/src/components/map-popup/PointSummaryCard.spec.ts
    - apps/web/src/components/map-popup/MapContextPopup.vue
    - apps/web/src/components/LeafletMapStage.vue
    - apps/web/src/components/LeafletMapStage.spec.ts
    - apps/web/src/types/map-point.ts
key-decisions:
  - "MapPointDisplay/DraftMapPoint 补齐 regionSystem 与 adminType，避免 popup 点亮链路再从展示文本做隐式推断。"
  - "fallback 点位保留“点亮”按钮文案，但固定为 disabled + unsupported hint，明确告知当前地点不能点亮。"
  - "点亮成功后在 LeafletMapStage 内显式走 manifest -> loadShardIfNeeded，而不是只等 refreshStyles 命中已有 feature。"
patterns-established:
  - "Canonical popup state should round-trip display metadata from persisted records, not re-infer from subtitle strings."
  - "Leaflet overlay transitions that depend on GeoJSON presence should load shards eagerly in the user action success path."
requirements-completed: [REQ-16-01, REQ-16-02, REQ-16-04]
duration: 23min
completed: 2026-04-02
---

# Phase 16 Plan 02: Web Reopen Labels, Fallback Illuminate Feedback, and Shard Reload Summary

**Saved canonical popup labels now survive reopen, fallback points show an explicit unsupported illuminate affordance, and successful illuminate actions eagerly load the matching GeoJSON shard**

## Performance

- **Duration:** 23 min
- **Started:** 2026-04-02T08:48:00Z
- **Completed:** 2026-04-02T09:11:13Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- `map-points` store now rehydrates `typeLabel`、`parentLabel`、`subtitle`、`regionSystem`、`adminType` from `TravelRecord`, and sends full canonical metadata in optimistic + API illuminate payloads.
- `PointSummaryCard` and `MapContextPopup` now support `isIlluminatable`, rendering fallback points as disabled with `该地点暂不支持点亮` instead of a silent no-op button.
- `LeafletMapStage` now checks illuminatability explicitly, surfaces an info notice for unsupported points, and loads the resolved shard after a successful illuminate so saved overlays appear in the same session.

## Task Commits

Each task was committed atomically:

1. **Task 1: 让 TravelRecord 重新打开时恢复 canonical 标签，并把保存请求升级为完整 metadata**
   - `52d2c99` (`test`) RED: store metadata rehydrate coverage
   - `6be794d` (`fix`) GREEN: restore canonical metadata in saved map points
2. **Task 2: 去掉 fallback 假可点击点亮按钮，并在 illuminate 成功后补 shard load**
   - `f569f5b` (`test`) RED: popup and shard load regressions
   - `0e7aa22` (`fix`) GREEN: disable fallback illuminate and load saved shards
   - `101bfa4` (`test`) follow-up: narrow summary surface assertions for `vue-tsc`

## Files Created/Modified

- `apps/web/src/stores/map-points.ts` - Restored saved canonical display metadata and threaded complete illuminate payload fields.
- `apps/web/src/stores/map-points.spec.ts` - Added reopen/view regressions for Beijing and Hong Kong plus type-safe summary surface assertions.
- `apps/web/src/components/map-popup/PointSummaryCard.vue` - Added `isIlluminatable` disable state, affordance metadata, and unsupported hint wiring.
- `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` - Covered disabled fallback illuminate affordance and no-emit behavior.
- `apps/web/src/components/map-popup/MapContextPopup.vue` - Forwarded `isIlluminatable` through the popup component boundary.
- `apps/web/src/components/LeafletMapStage.vue` - Added illuminatable computed, unsupported info notice, full illuminate payload, and post-save shard loading.
- `apps/web/src/components/LeafletMapStage.spec.ts` - Covered disabled fallback popup affordance and successful shard load after illuminate.
- `apps/web/src/types/map-point.ts` - Extended map point state with canonical `regionSystem` and `adminType`.

## Decisions Made

- `MapPointDisplay` and `DraftMapPoint` now own canonical region/admin metadata because `LeafletMapStage` cannot safely rebuild those fields from UI labels during illuminate.
- Unsupported fallback points keep the same button label for visual consistency, but the disabled state and fixed hint text make the limitation explicit.
- The shard load stays in `LeafletMapStage` action handling, keeping store responsibilities limited to record state while map rendering remains local to the stage.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Map point state lacked `regionSystem` and `adminType` needed by the upgraded illuminate payload**
- **Found during:** Task 2 (popup/stage illuminate wiring)
- **Issue:** After Task 1 expanded `mapPointsStore.illuminate()`, popup surfaces still did not carry canonical region/admin metadata, so the stage could not submit the full payload without inference.
- **Fix:** Extended `MapPointDisplay` / `DraftMapPoint` plus store/stage draft mapping to keep `regionSystem` and `adminType` alongside the rest of the canonical summary.
- **Files modified:** `apps/web/src/types/map-point.ts`, `apps/web/src/stores/map-points.ts`, `apps/web/src/components/LeafletMapStage.vue`
- **Verification:** `pnpm --filter @trip-map/web exec vitest run src/stores/map-points.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/LeafletMapStage.spec.ts`, `pnpm --filter @trip-map/web exec vue-tsc --noEmit`
- **Committed in:** `0e7aa22`

**2. [Rule 3 - Blocking] New store regressions needed explicit union narrowing for `SummarySurfaceState`**
- **Found during:** Overall verification
- **Issue:** `vue-tsc` rejected direct `.point` access on `summarySurfaceState` in the new reopen assertions because the union still included `candidate-select`.
- **Fix:** Added explicit `mode === 'view'` guards in the store spec before asserting on `summarySurfaceState.point`.
- **Files modified:** `apps/web/src/stores/map-points.spec.ts`
- **Verification:** `pnpm --filter @trip-map/web exec vitest run src/stores/map-points.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/LeafletMapStage.spec.ts`, `pnpm --filter @trip-map/web exec vue-tsc --noEmit`
- **Committed in:** `101bfa4`

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were required to complete the planned metadata and popup/shard behavior without adding scope beyond the intended UI chain.

## Issues Encountered

- Parallel `git add` calls briefly created a transient `.git/index.lock`; rerunning the staged add after the lock cleared was sufficient and did not require repository repair.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Web popup and illuminate behavior now match the UAT expectations for saved canonical labels, fallback affordance, and in-session overlay loading.
- Phase `16-03` can build on this without needing additional frontend metadata or popup affordance plumbing.

## Self-Check: PASSED

- Verified summary file exists at `.planning/phases/16-uat-gap-fallback-smoke-record-schema-typelabel-california/16-02-SUMMARY.md`.
- Verified task commits `52d2c99`, `6be794d`, `f569f5b`, `0e7aa22`, and `101bfa4` exist in git history.

---
*Phase: 16-uat-gap-fallback-smoke-record-schema-typelabel-california*
*Completed: 2026-04-02*
