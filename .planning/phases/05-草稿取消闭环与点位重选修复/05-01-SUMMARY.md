---
phase: 05-草稿取消闭环与点位重选修复
plan: 01
subsystem: ui
tags: [vue, pinia, vitest, draft-state, regression]
requires:
  - phase: 04-可用性打磨与增强能力
    provides: 现有地图点击草稿流、抽屉关闭语义与城市级交互回归基线
provides:
  - draft 切换到 seed/saved 点位时立即清理旧草稿
  - 草稿重选与抽屉关闭的 store 和交互级回归覆盖
affects: [Phase 06, map-points, drawer-close, marker-selection]
tech-stack:
  added: []
  patterns: [Pinia 单一状态机管理 draft/view 切换, Vitest + Vue Test Utils 黑盒交互回归]
key-files:
  created: [.planning/phases/05-草稿取消闭环与点位重选修复/05-01-SUMMARY.md]
  modified: [src/stores/map-points.ts, src/stores/map-points.spec.ts, src/components/WorldMapStage.spec.ts, src/components/PointPreviewDrawer.spec.ts]
key-decisions:
  - "将 `selectPointById()` 中的“切到已有点位”视为对当前未保存草稿的显式放弃，只在 seed/saved 目标上触发清理。"
  - "交互回归通过 marker `aria-label` 定位已有点位，避免依赖 hover/selected 才出现的可见标签。"
patterns-established:
  - "Draft reselect cleanup: 先清理旧 draft，再基于清理后的点集重建 selectedPointId、drawerMode 和 editableSnapshot。"
  - "UI regressions stay black-box: 通过地图点击、marker 点击和抽屉关闭入口验证闭环，不直接操纵组件内部状态。"
requirements-completed: [MAP-03, PNT-05]
duration: 5min
completed: 2026-03-24
---

# Phase 05 Plan 01: 草稿取消闭环与点位重选修复 Summary

**Pinia 点位状态机现在会在重选 seed/saved 点位时同步清空旧 draft，并由交互回归锁住“草稿新建 -> 重选已有点位 -> 关闭抽屉”的完整闭环**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-24T10:28:05Z
- **Completed:** 2026-03-24T10:33:17Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- 在 `map-points` store 中补上“重选已有点位 = 放弃当前未保存草稿”的状态机分支，避免旧 draft 继续混入 `displayPoints`
- 新增 store 级回归，覆盖 draft 重选清理、draft 替换语义保持和取消新建仍会丢弃 draft
- 新增 interaction-level 回归，覆盖地图创建 draft、点击已有 marker 移除 draft，以及关闭抽屉后不再残留 draft

## Task Commits

Each task was committed atomically:

1. **Task 1: 收紧 map-points 的重选状态机，确保切到已有点位时立即清掉旧草稿** - `f1e7ca6` (`fix`)
2. **Task 2: 用交互级回归锁住“草稿 -> 选已有点位 -> 关闭抽屉”的真实断口** - `9b9bef9` (`test`)

## Files Created/Modified

- `src/stores/map-points.ts` - 在 `selectPointById()` 中对 seed/saved 重选添加 draft 清理分支，并基于清理后的点集重建选中态
- `src/stores/map-points.spec.ts` - 补充 store 级断口回归，覆盖重选已有点位清 draft 与取消新建语义保持
- `src/components/WorldMapStage.spec.ts` - 补充地图点击创建 draft 后重选已有 marker 的黑盒回归
- `src/components/PointPreviewDrawer.spec.ts` - 补充“切到已有点位后关闭抽屉不残留 draft”的回归

## Decisions Made

- 将草稿清理逻辑放在 `selectPointById()`，而不是修改 `replaceDraftFromDetection()` 或新增 UI 分支；这样保持 Phase 3 已有的 draft->draft 替换语义不变
- 交互测试通过可访问性标签定位 seed marker，避免因为 label 只在 hover/selected 时显示而让测试依赖展示细节

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `WorldMapStage` 新回归最初依赖 marker 可见标签查找 Kyoto，无法稳定命中未显示 label 的 seed marker；改为基于按钮 `aria-label` 定位后，测试与真实交互语义一致且更稳定

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 05 的唯一 gap closure 已完成，`MAP-03` 与 `PNT-05` 的运行时断口已有自动化回归保护
- 可以进入 Phase 06 补齐历史 verification、validation 和 requirements traceability 证据

## Self-Check: PASSED

- Found summary file: `.planning/phases/05-草稿取消闭环与点位重选修复/05-01-SUMMARY.md`
- Verified task commits: `f1e7ca6`, `9b9bef9`
- No known stubs detected in plan-created or modified files
