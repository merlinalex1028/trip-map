---
phase: 11-monorepo
plan: 09
subsystem: ui
tags: [vue, pinia, composables, vite]
requires:
  - phase: 11-05
    provides: apps/web app shell and top-level interaction components under package-local ownership
  - phase: 11-07
    provides: apps/web supporting services, data, and web-local types for runtime rewiring
provides:
  - Package-local Pinia runtime glue under apps/web/src/stores
  - Package-local popup anchoring composable under apps/web/src/composables
  - Rewired app shell and top-level interaction components consuming apps/web runtime modules
affects: [11-10, 12]
tech-stack:
  added: []
  patterns: [apps/web owns runtime glue locally, top-level runtime consumers rewire by swapping relative imports without broad bridge cleanup]
key-files:
  created:
    - apps/web/src/composables/usePopupAnchoring.ts
    - apps/web/src/stores/map-ui.ts
    - apps/web/src/stores/map-points.ts
  modified:
    - apps/web/src/App.vue
    - apps/web/src/components/WorldMapStage.vue
    - apps/web/src/components/PointPreviewDrawer.vue
    - apps/web/src/components/SeedMarkerLayer.vue
key-decisions:
  - "11-09 keeps the change narrow by copying Pinia stores and popup anchoring into apps/web, then only rewiring the app shell and top-level runtime consumers."
  - "WorldMapStage now consumes apps/web-local services/types/composables, while root styles/assets and popup subcomponents remain deferred until later plans."
patterns-established:
  - "Pattern 1: runtime glue can be localized into apps/web without simultaneously migrating specs, assets, or legacy bridge cleanup."
  - "Pattern 2: top-level runtime rewiring is done by replacing root bridge imports with package-local stores/composables/services/types one consumer at a time."
requirements-completed: [ARC-01]
duration: 6min
completed: 2026-03-30
---

# Phase 11 Plan 09: Runtime Glue Rewiring Summary

**apps/web 现已拥有 package-local 的 Pinia store 与 popup anchoring composable，且主 app shell / 顶层交互组件已改为直接消费这些本地 runtime 模块**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-30T05:53:00Z
- **Completed:** 2026-03-30T05:59:04Z
- **Tasks:** 1
- **Files modified:** 7

## Accomplishments

- 在 `apps/web/src/stores` 新建 `map-ui.ts` 与 `map-points.ts`，保留 `bootstrapPoints`、popup/drawer 状态机和本地存储语义。
- 在 `apps/web/src/composables` 新建 `usePopupAnchoring.ts`，使 popup anchoring runtime 不再依赖 repo-root composable。
- 把 `App.vue`、`WorldMapStage.vue`、`PointPreviewDrawer.vue`、`SeedMarkerLayer.vue` rewiring 到 `apps/web` 内的 store/composable/services/types，去掉对 root runtime glue 的依赖。

## Task Commits

Each task was committed atomically:

1. **Task 1: Move Pinia/composable runtime glue into `apps/web` and rewire the moved app shell** - `2d83338` (feat)

## Files Created/Modified

- `apps/web/src/composables/usePopupAnchoring.ts` - package-local popup anchoring composable。
- `apps/web/src/stores/map-ui.ts` - package-local UI interaction store。
- `apps/web/src/stores/map-points.ts` - package-local points runtime store，包含 `bootstrapPoints`。
- `apps/web/src/App.vue` - app shell 改为消费 `./stores/map-points` 与 `./stores/map-ui`。
- `apps/web/src/components/WorldMapStage.vue` - 顶层地图舞台改为消费 `../stores`、`../composables`、`../services`、`../types`。
- `apps/web/src/components/PointPreviewDrawer.vue` - drawer 改为消费 package-local points store 与 map-point types。
- `apps/web/src/components/SeedMarkerLayer.vue` - marker layer 改为消费 package-local points store 与 map-point types。

## Decisions Made

- 保持这次迁移只处理 Pinia/composable runtime glue 与顶层 consumer rewiring，不提前碰 specs、styles/assets、backend smoke panel 或 bridge cleanup。
- `WorldMapStage.vue` 同步切到 `apps/web` 内的 services/types 动态导入链路，确保顶层运行时协作真实收口到 package-local supporting modules。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `pnpm -C apps/web build` 仅报告既有的 chunk size warning；构建与 `vue-tsc` 均成功，不影响本计划验收。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `apps/web` 的顶层运行时胶水已 package-local 化，`11-10` 可以继续处理剩余 UI regression、styles/assets 与 legacy bridge cleanup。
- 当前未触碰 popup 子组件的非 runtime 桥接与 root 资产归属，范围仍与本计划约束一致。

## Self-Check: PASSED

- Verified summary file exists at `.planning/phases/11-monorepo/11-09-SUMMARY.md`.
- Verified task commit `2d83338` is present in git history.
- Verified stub scan across `apps/web/src/App.vue`, `apps/web/src/components/WorldMapStage.vue`, `apps/web/src/components/PointPreviewDrawer.vue`, `apps/web/src/components/SeedMarkerLayer.vue`, `apps/web/src/composables/usePopupAnchoring.ts`, `apps/web/src/stores/map-ui.ts`, and `apps/web/src/stores/map-points.ts` found no placeholder markers blocking the plan goal.

---
*Phase: 11-monorepo*
*Completed: 2026-03-30*
