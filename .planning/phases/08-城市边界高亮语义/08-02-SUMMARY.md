---
phase: 08-城市边界高亮语义
plan: 02
subsystem: map-ui
tags: [pinia, vue, svg-overlay, boundary-highlight, city-selection]
requires:
  - phase: 08-城市边界高亮语义
    provides: 离线 boundaryId 查询、归一化 polygons、兼容持久化字段
provides:
  - store 级 `selectedBoundaryId` / `savedBoundaryIds` 边界派生态
  - 地图主舞台真实城市边界 overlay
  - saved / selected 双层边界视觉层级与 marker 辅助化
affects: [08-03-PLAN, 城市边界回归场景, 重新打开已保存城市]
tech-stack:
  added: [none]
  patterns: [store-derived boundary semantics, SVG path overlay, fail-closed fallback rendering]
key-files:
  modified:
    - src/stores/map-points.ts
    - src/stores/map-points.spec.ts
    - src/components/WorldMapStage.vue
    - src/components/WorldMapStage.spec.ts
    - src/components/SeedMarkerLayer.vue
    - src/components/SeedMarkerLayer.spec.ts
key-decisions:
  - "边界高亮语义由 `map-points` store 派生，组件不维护额外的城市边界记忆态。"
  - "已保存城市保留弱边界层，当前选中城市在其上叠加强边界层；如果当前点位没有 `boundaryId`，则 fail-closed 不渲染城市边界。"
  - "marker 保留为辅助定位元素，但视觉强度下调，不再承担城市已点亮的主语义。"
patterns-established:
  - "Boundary render source: `selectedBoundaryId` + `savedBoundaryIds`."
  - "Boundary geometry render: GeoJSON polygons -> SVG path groups with evenodd fill-rule."
  - "Fallback safety: 国家/地区 fallback 和 legacy point 一律不进入城市边界层。"
requirements-completed: [BND-01, BND-03, DAT-06]
duration: 4min
completed: 2026-03-26
---

# Phase 08 Plan 02: Store 边界派生状态与地图边界图层 Summary

**把 `boundaryId` 真正接进点位 store 派生状态，并在地图上用真实城市边界替代 marker 成为主表达**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-26T10:16:00+08:00
- **Completed:** 2026-03-26T10:19:15+08:00
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- `map-points` store 新增 `selectedBoundaryId` 和 `savedBoundaryIds`，并在候选城市确认时用 `getBoundaryByCityId()` 自动补齐 `boundaryId` 与 `boundaryDatasetVersion`。
- `WorldMapStage.vue` 新增真实城市边界 SVG overlay，按 saved / selected 两层分别渲染，支持多面域城市整组点亮。
- `SeedMarkerLayer.vue` 下调 marker 视觉强度，仅保留当前选中点的辅助定位角色，不再充当边界语义主表达。

## Task Commits

1. **Task 1: Add boundary-aware derived state to the point store and draft/save lifecycle** - `1b3160f`
2. **Task 2: Render saved and selected city boundaries on the map while demoting markers to auxiliary status** - `7a46445`

## Files Created/Modified

- `src/stores/map-points.ts` - 为活动点位和已保存点位派生边界高亮状态，并在候选确认时分配真实 `boundaryId`。
- `src/stores/map-points.spec.ts` - 覆盖候选确认、已保存重开、legacy 点位与 fallback 流的边界 fail-closed 语义。
- `src/components/WorldMapStage.vue` - 新增 `world-map-stage__boundary-layer` 及 saved / selected 边界 path 组渲染。
- `src/components/WorldMapStage.spec.ts` - 断言真实边界层、saved-vs-selected 层级和 fallback-only 不渲染边界。
- `src/components/SeedMarkerLayer.vue` - 弱化 marker 阴影与选中强调，让 marker 退回辅助定位层。
- `src/components/SeedMarkerLayer.spec.ts` - 确认选中 button class 仍然存在，保证辅助定位状态可测试。

## Decisions Made

- 不为边界展示新增任何组件内记忆态，直接消费 store 的派生 id 列表，避免关闭面板或切换点位后残留错误高亮。
- selected 城市如果本身也是已保存点位，会同时存在 saved 弱层和 selected 强层，确保“常驻已记录”与“当前焦点”两层语义都成立。
- fallback 国家/地区与没有 `boundaryId` 的旧点位继续可读可编辑，但不会被误解释成某个城市边界。

## Deviations from Plan

### No Code Deviations

- `src/services/city-boundaries.ts` 本计划只作为读取依赖，不需要额外改动即可满足 `08-02` 的边界查询需求。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 已经具备 reopen / close / switch / fallback 场景所需的真实边界渲染链路，`08-03` 可直接补回归与状态切换测试。
- 边界图层现在由 store 统一驱动，后续只需要围绕状态转换补测试，不需要再次改造主数据流。

## Verification

- `pnpm test -- src/stores/map-points.spec.ts`
- `pnpm test -- src/components/WorldMapStage.spec.ts src/components/SeedMarkerLayer.spec.ts`

## Self-Check: PASSED

- Verified `selectedBoundaryId` / `savedBoundaryIds` are present in `src/stores/map-points.ts`.
- Verified `world-map-stage__boundary-layer` and saved / selected classes render in `src/components/WorldMapStage.vue`.
- Verified commits `1b3160f` and `7a46445` exist in git history.

---
*Phase: 08-城市边界高亮语义*
*Completed: 2026-03-26*
