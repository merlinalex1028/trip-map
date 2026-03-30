---
phase: 12-canonical
plan: 05
subsystem: ui
tags: [vue, pinia, vitest, canonical, boundary-highlight]
requires:
  - phase: 12-canonical
    provides: 12-03 canonical store persistence and 12-04 popup/drawer canonical summary regressions
provides:
  - canonical boundaryId to renderable web geometry mapping helpers
  - geometry-backed canonical boundary support state in the map-points store
  - canonical Beijing reopen highlight and California unsupported-boundary regressions
affects: [phase-12-canonical, phase-13-geometry, phase-14-leaflet, popup, drawer, map-highlight]
tech-stack:
  added: []
  patterns: [canonical-boundary-id mapping, geometry-backed support-state, store-derived popup-drawer parity]
key-files:
  created:
    - .planning/phases/12-canonical/12-05-SUMMARY.md
  modified:
    - apps/web/src/services/city-boundaries.ts
    - apps/web/src/services/city-boundaries.spec.ts
    - apps/web/src/stores/map-points.ts
    - apps/web/src/stores/map-points.spec.ts
    - apps/web/src/components/WorldMapStage.spec.ts
    - apps/web/src/components/PointPreviewDrawer.spec.ts
key-decisions:
  - "web 侧通过显式 `CANONICAL_BOUNDARY_ID_TO_RENDERABLE_ID` 衔接 server canonical boundaryId 与现有可渲染 geometry，不改写已持久化的 canonical 字段合同。"
  - "canonical boundary support 一律由真实几何命中决定，只有 legacy city 点位继续保留 `cityId + hasBoundaryCoverageForCityId()` 兜底。"
  - "popup 与 drawer 的 boundary 支持态对比继续走 store 派生结果，测试不再手工注入 `boundarySupportState: 'supported'`。"
patterns-established:
  - "Pattern 1: `getBoundaryById()` 先解析 canonical boundaryId，再查询当前 web boundary dataset。"
  - "Pattern 2: canonical reopen 回归同时锁定 store support-state 与 WorldMapStage 的 renderable boundaryId。"
requirements-completed: [ARC-02, PLC-01, PLC-02, PLC-03, PLC-04, PLC-05, UIX-04]
duration: 5min
completed: 2026-03-30
---

# Phase 12 Plan 05: Canonical Boundary Highlight Summary

**Canonical boundaryId 现在会先解析到当前 web 可渲染 geometry，并且 Beijing 的 reopened highlight 与 California 的 unsupported 提示都被组件回归锁定**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-30T11:09:04Z
- **Completed:** 2026-03-30T11:14:31Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- 在 `city-boundaries` 增加 canonical `boundaryId` 显式映射与 coverage helper，让 web 能区分“可渲染”和“当前无 geometry”。
- 在 `map-points` 用真实几何命中派生 `activeBoundaryCoverageState`，canonical `boundaryId` 不再因为非空字符串被误判成 supported。
- 用组件回归锁定 Beijing 保存后关闭/重开仍恢复 `cn-beijing-municipality`，以及 California reopened drawer 明确显示 unsupported 提示。

## Task Commits

Each task was committed atomically:

1. **Task 1: 建立 canonical boundaryId 映射层，并让 support state 以真实几何命中为准** - `4b0fa7e` (feat)
2. **Task 2: 用 canonical 回归锁定高亮与 reopened 边界恢复** - `47bcea3` (test)

**Plan metadata:** pending

## Files Created/Modified

- `apps/web/src/services/city-boundaries.ts` - 增加 canonical boundary 映射表、renderable boundary 解析 helper 与 boundary-level coverage helper。
- `apps/web/src/services/city-boundaries.spec.ts` - 锁定 Beijing/Hong Kong 映射命中与 Aba/Tianjin/California unsupported 行为。
- `apps/web/src/stores/map-points.ts` - `activeBoundaryCoverageState` 改为基于真实 geometry 命中派生 canonical support-state。
- `apps/web/src/stores/map-points.spec.ts` - 回归 Beijing supported 与 California missing 两种 canonical support-state。
- `apps/web/src/components/WorldMapStage.spec.ts` - 锁定 canonical Beijing save/close/reopen 高亮恢复与 California 无 selected boundary 行为。
- `apps/web/src/components/PointPreviewDrawer.spec.ts` - 锁定 reopened canonical California 的 unsupported 文案，并让 popup/drawer parity 走 store 派生 surface。

## Decisions Made

- 用最小增量方式在 web 侧加 canonical boundary 映射层，而不是改 server fixture 或改写本地持久化字段。
- 保留旧的 curated city coverage audit 和 legacy city fallback 逻辑，只把 canonical support-state 收口到 boundary helper。
- 组件回归继续保持黑盒断言，关注 `data-boundary-id` 和用户可见文案，不探测组件内部实现。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- 并行 `git add` 两次遇到仓库 `index.lock` 竞争，改为串行 stage 后恢复正常；未影响代码或验证结果。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 12 的 canonical identity、popup/drawer、已保存记录和地图高亮现在重新连通，`PLC-05` 的 boundary highlight blocker 已被收口。
- Phase 13/14 可以直接复用这次建立的 canonical boundary mapping 与 geometry-backed support-state 约束，继续推进几何交付和 Leaflet 迁移。

## Known Stubs

None.

## Self-Check: PASSED

- Found summary file: `.planning/phases/12-canonical/12-05-SUMMARY.md`
- Verified task commits exist: `4b0fa7e`, `47bcea3`

---
*Phase: 12-canonical*
*Completed: 2026-03-30*
