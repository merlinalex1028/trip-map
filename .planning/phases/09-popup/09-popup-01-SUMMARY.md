---
phase: 09-popup
plan: 01
subsystem: ui
tags: [vue, pinia, vitest, popup, drawer, summary-surface]
requires:
  - phase: 08-城市边界高亮语义
    provides: selectedBoundaryId、城市边界身份与 reopen/switch/close 语义
provides:
  - store 级 summary/deep surface 契约
  - 共享 PointSummaryCard 摘要卡
  - 仅承接 deep view/edit 的 PointPreviewDrawer
affects: [09-02-popup, 09-03-popup, popup-anchor, mobile-peek]
tech-stack:
  added: []
  patterns: [summary-surface-vs-deep-drawer split, shared summary card, store-driven handoff]
key-files:
  created:
    - src/components/map-popup/PointSummaryCard.vue
    - src/components/map-popup/PointSummaryCard.spec.ts
  modified:
    - src/types/map-point.ts
    - src/stores/map-points.ts
    - src/stores/map-points.spec.ts
    - src/components/PointPreviewDrawer.vue
    - src/components/PointPreviewDrawer.spec.ts
    - src/App.vue
    - src/App.spec.ts
    - src/components/WorldMapStage.spec.ts
key-decisions:
  - "summary surface 继续留在 store 中作为单一事实源，drawer 只处理 deep view/edit。"
  - "候选搜索、已存在记录提示和 fallback 行为统一经由 PointSummaryCard + confirmPendingCitySelection 流转。"
patterns-established:
  - "Pattern: popup/peek 只消费 summarySurfaceState，不再从 drawerMode 反推轻交互状态。"
  - "Pattern: deep drawer 通过 openDrawerView/closeDrawer 与 summary surface 显式接力。"
requirements-completed: [POP-02]
duration: 28min
completed: 2026-03-26
---

# Phase 09 Plan 01: Summary/Deep Surface Split Summary

**Pinia summary surface 契约、共享 PointSummaryCard，以及只承接 deep view/edit 的 PointPreviewDrawer**

## Performance

- **Duration:** 28 min
- **Started:** 2026-03-26T06:34:00Z
- **Completed:** 2026-03-26T07:02:17Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- 完成 `map-points` 的 summary/deep surface 拆分，让 `summaryMode`、`summarySurfaceState` 和 `openDrawerView()`/`closeDrawer()` 成为后续 popup/peek 的直接消费接口。
- 新增 `PointSummaryCard`，覆盖 candidate / detected-preview / view 三态，保留轻量搜索、`已存在记录` 复用提示、fallback CTA 和内联破坏性确认。
- 将 `PointPreviewDrawer` 收缩为 deep-only surface，只保留完整查看/编辑与 `放弃编辑` guard，并补齐受当前重构影响的 App / WorldMapStage 回归断言。

## Task Commits

Each task was committed atomically:

1. **Task 1: 定义 summary/deep surface 契约并补齐 store handoff 动作（RED）** - `3ea8261` (test)
2. **Task 1: 定义 summary/deep surface 契约并补齐 store handoff 动作（GREEN）** - `aefdcee` (feat)
3. **Task 2: 抽共享摘要卡并把 drawer 缩回 deep view/edit** - `9c564c3` (feat)

**Plan metadata:** pending docs commit

## Files Created/Modified

- `src/types/map-point.ts` - 新增 `SummaryMode`、收窄 `DrawerMode` 并定义 `SummarySurfaceState`
- `src/stores/map-points.ts` - 暴露 summary surface、drawer handoff 和 featured toggle
- `src/stores/map-points.spec.ts` - 覆盖候选确认、summary/deep handoff 和 featured 切换
- `src/components/map-popup/PointSummaryCard.vue` - 共享 candidate/detected/view 摘要卡与 inline confirm
- `src/components/map-popup/PointSummaryCard.spec.ts` - 直接验证三态 CTA、搜索与 destructive confirm
- `src/components/PointPreviewDrawer.vue` - 抽屉仅保留 deep view/edit
- `src/components/PointPreviewDrawer.spec.ts` - 验证 deep-only 渲染、焦点循环与 `放弃编辑`
- `src/App.vue` - 布局 hook 改为基于 `summaryMode` 兼容 summary-only 状态
- `src/App.spec.ts` - 显式 handoff 到 deep drawer 后再断言抽屉内容
- `src/components/WorldMapStage.spec.ts` - 将候选确认断言从旧 `drawerMode` 迁到 `summaryMode`

## Decisions Made

- 使用 `summaryMode + summarySurfaceState` 作为 popup/peek 主入口状态，不再继续让 `drawerMode` 同时承担 candidate/draft/view/edit 四态。
- `PointSummaryCard` 采用 props down / emits up，不直接依赖 store，避免在 09-02 / 09-03 接桌面 popup 和移动端 peek 时再拆一次。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Regression] 修正 App / WorldMapStage 对旧 drawer summary 语义的断言**
- **Found during:** Task 2
- **Issue:** `summaryMode` 拆分后，现有 `App.spec.ts` 和 `WorldMapStage.spec.ts` 仍把 candidate summary 视为 `drawerMode === 'candidate-select'`，并默认抽屉始终可见。
- **Fix:** 将候选确认断言迁移到 `summaryMode`，并在 App 回归里显式调用 `openDrawerView()` 后再检查 deep drawer 内容。
- **Files modified:** `src/App.vue`, `src/App.spec.ts`, `src/components/WorldMapStage.spec.ts`
- **Verification:** `pnpm test -- src/stores/map-points.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/PointPreviewDrawer.spec.ts`
- **Committed in:** `9c564c3`

**2. [Rule 3 - Blocking] 收紧联合类型与测试写法以通过 `vue-tsc`**
- **Found during:** Task 2 verification
- **Issue:** `PointSummaryCard` 的联合类型访问和若干 spec 中的 `.at()` 写法不符合当前 TS target / `vue-tsc` 约束，导致构建失败。
- **Fix:** 在组件中显式拆分 candidate/detail surface 计算，并把 `.at()` 改为兼容当前 target 的数组索引访问。
- **Files modified:** `src/components/map-popup/PointSummaryCard.vue`, `src/components/map-popup/PointSummaryCard.spec.ts`, `src/components/PointPreviewDrawer.spec.ts`, `src/stores/map-points.spec.ts`
- **Verification:** `pnpm build`
- **Committed in:** `9c564c3`

---

**Total deviations:** 2 auto-fixed (1 regression, 1 blocking)
**Impact on plan:** 两项偏差都直接由 summary/deep 拆分引出，属于为保证当前计划正确性必须完成的收口，没有扩展到额外功能范围。

## Issues Encountered

- 恢复执行时工作树里已经有未提交的 `PointSummaryCard.spec.ts` 与 `PointPreviewDrawer.spec.ts` 变更；本次执行在不覆盖这些改动的前提下吸收并完成了对应实现。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 09-02 可以直接把 `summarySurfaceState` 接到 anchored popup shell，而不需要再触碰 drawer 业务分流。
- 09-03 可以在不改 store 契约的前提下复用同一张 `PointSummaryCard` 做移动端 peek fallback。

## Self-Check

PASSED

- Verified summary file exists: `.planning/phases/09-popup/09-popup-01-SUMMARY.md`
- Verified task commits exist: `3ea8261`, `aefdcee`, `9c564c3`

---
*Phase: 09-popup*
*Completed: 2026-03-26*
