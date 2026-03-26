---
phase: 08-城市边界高亮语义
plan: 03
subsystem: regression
tags: [vitest, drawer, boundary-highlight, restore, regressions]
requires:
  - phase: 08-城市边界高亮语义
    provides: 边界持久化骨架、store 边界派生态、地图边界 overlay
provides:
  - restore / reopen / drawer 边界身份一致性回归
  - switch / close / fallback / multi-area 边界稳定性回归
  - Phase 8 完整测试与 build 质量门
affects: [Phase 08 verification, 城市边界状态切换, drawer-map consistency]
tech-stack:
  added: [none]
  patterns: [regression-first hardening, fail-closed boundary assertions, drawer-map identity consistency]
key-files:
  modified:
    - src/services/point-storage.spec.ts
    - src/stores/map-points.spec.ts
    - src/components/PointPreviewDrawer.spec.ts
    - src/components/WorldMapStage.spec.ts
    - src/App.spec.ts
key-decisions:
  - "本计划以回归测试补强为主，没有为通过测试引入额外 UI 记忆态或 hover 预览。"
  - "详情抽屉继续只读取 `activePoint` 作为城市身份来源，不新增 boundary-only 标题源。"
  - "关闭抽屉后允许已保存城市保留弱高亮，但必须立即移除 selected 强高亮。"
patterns-established:
  - "Restore consistency: persisted `cityId` / `boundaryId` / `boundaryDatasetVersion` -> store -> drawer 文案一致。"
  - "Transition stability: switch / close / fallback 通过 `selectedBoundaryId` 与 DOM class 双重断言。"
  - "Multi-area safety: Tokyo 多面域渲染继续由自动化回归覆盖。"
requirements-completed: [BND-02, BND-03, DAT-06]
duration: 4min
completed: 2026-03-26
---

# Phase 08 Plan 03: 边界语义回归与状态切换稳定性 Summary

**用回归测试把 restore、reopen、switch、close、fallback 和 multi-area 场景全部锁住，确保 Phase 8 不是只在 happy path 下成立**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-26T10:22:00+08:00
- **Completed:** 2026-03-26T10:26:32+08:00
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- 为持久化恢复链路补上精确字段断言，确认 v2 城市记录在 rehydrate 后仍保持相同的 `cityId`、`boundaryId` 和 `boundaryDatasetVersion`。
- 为 drawer / reuse 流程补上边界身份一致性测试，确认“重新打开已保存城市”时，抽屉标题、`activePoint` 和地图使用的是同一套边界身份。
- 为地图主舞台和 App shell 补上 switch / close / fallback / multi-area 回归，确认强高亮不会残留，saved 弱高亮保持稳定。

## Task Commits

1. **Task 1: Lock boundary identity consistency across restore, reopen, and details surfaces** - `e463256`
2. **Task 2: Add transition regressions for switch, close, fallback, and multi-area boundary stability** - `0fd887c`

## Files Created/Modified

- `src/services/point-storage.spec.ts` - 增加 v2 城市记录恢复后的精确边界字段断言。
- `src/stores/map-points.spec.ts` - 增加 reopen reuse 对齐和 clearActivePoint 后强高亮清理回归。
- `src/components/PointPreviewDrawer.spec.ts` - 断言 drawer 标题、`activePoint` 与 `selectedBoundaryId` 一致，fallback/legacy 继续文本化展示。
- `src/components/WorldMapStage.spec.ts` - 增加 saved 城市切换时 selected 边界切换与残留清理断言。
- `src/App.spec.ts` - 断言关闭 drawer 后 `drawer-open` 样式移除，selected 边界消失但 saved 边界仍保留。

## Decisions Made

- `08-03` 不再扩展任何运行时代码职责，现有实现已经满足 Phase 8 语义，本轮只补自动化回归和一个测试类型断言修正。
- 边界状态切换统一通过 store state 和 DOM hook 双重验证，避免未来只改一层时漏掉行为回退。
- 继续保持 fallback / legacy 路径 fail-closed，不把“没有边界身份”的记录包装成某个城市边界。

## Deviations from Plan

### No Runtime Deviations

- 本计划没有新增产品逻辑，只发现并修正了 `WorldMapStage.spec.ts` 中一个 `wrapper.get(...).exists()` 的 TypeScript 测试写法问题，以通过 `vue-tsc`。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 8 的边界语义现在已有完整回归护栏，可进入 verifier 阶段判断该 phase 是否达到完成标准。
- 后续 Phase 9 / Phase 10 若继续改 drawer 或地图主舞台，可直接复用这些回归验证边界身份不漂移。

## Verification

- `pnpm test -- src/services/point-storage.spec.ts src/stores/map-points.spec.ts src/components/PointPreviewDrawer.spec.ts`
- `pnpm test -- src/components/WorldMapStage.spec.ts src/stores/map-points.spec.ts src/App.spec.ts`
- `pnpm build`

## Self-Check: PASSED

- Verified restore / reopen / drawer consistency regressions exist and pass.
- Verified switch / close / fallback / multi-area boundary regressions exist and pass.
- Verified commits `e463256` and `0fd887c` exist in git history.

---
*Phase: 08-城市边界高亮语义*
*Completed: 2026-03-26*
