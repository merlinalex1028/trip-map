---
phase: 07-城市选择与兼容基线
plan: 02
subsystem: city-selection-ui
tags: [vue, pinia, vitest, city-selection, drawer, reuse]
requires:
  - phase: 07-城市选择与兼容基线
    provides: 07-01 已建立稳定 `cityId`、候选排序输出和按 `cityId` 复用 helper
provides:
  - 候选先行确认抽屉态与轻量搜索输入
  - 按 `cityId` 统一的点击/搜索复用与新 draft 决策
  - 国家/地区回退 CTA、解释文案与 legacy 点位兼容回归
affects: [phase-08, city-selection, drawer, reuse-notice, compatibility]
tech-stack:
  added: []
  patterns:
    - 识别结果先进入 `candidate-select`，确认后再进入 `detected-preview`
    - 搜索与候选点击统一复用 `confirmPendingCitySelection`
key-files:
  created:
    - .planning/phases/07-城市选择与兼容基线/07-02-SUMMARY.md
  modified:
    - src/components/WorldMapStage.vue
    - src/components/PointPreviewDrawer.vue
    - src/stores/map-points.ts
    - src/App.vue
key-decisions:
  - "地图点击不再直接生成城市 draft，而是统一进入候选先行确认态"
  - "候选行的 `已存在记录` 提示在 UI 层基于已保存 `cityId` 派生，避免污染 geo lookup 契约"
  - "国家/地区回退仍进入现有 `detected-preview` / 保存链路，不另起第二套保存流程"
patterns-established:
  - "Selection pattern: click/search/candidate 都通过同一个 pending-selection store action 收口"
  - "Compatibility pattern: legacy saved points 缺失城市身份时继续走原有查看/编辑路径"
requirements-completed: [DEST-01, DEST-02, DEST-03, DEST-04, DEST-05, DAT-05]
duration: 14min
completed: 2026-03-25
---

# Phase 7: 城市选择与兼容基线 Summary

**城市确认链路已从“点击即落 draft”切换为候选先行确认、国家回退和 `cityId` 统一复用的轻量抽屉流**

## Performance

- **Duration:** 14 min
- **Started:** 2026-03-25T13:17:00+08:00
- **Completed:** 2026-03-25T13:31:24+08:00
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- `WorldMapStage` 点击地图后现在先打开候选确认态，默认只展示最多 3 个候选，并显式保留 `搜索城市` 输入。
- `PointPreviewDrawer` 现在能展示城市名、上下文和状态提示，并提供精确文案的国家/地区回退 CTA。
- `map-points` 把点击候选、搜索结果和已有城市复用统一收口到 `cityId`，同时保持 legacy 点位不被强制拉进新确认流。

## Task Commits

Plan tasks were delivered in one integrated execution commit:

1. **Task 1 + Task 2: candidate-first confirmation, fallback CTA, reuse notice, and legacy-safe regressions** - `129c334` (`feat`)

**Plan metadata:** `75d26fa` (`docs(07-01): record wave 1 completion`)

## Files Created/Modified
- `src/components/WorldMapStage.vue` - 将点击识别改为 pending candidate selection 入口
- `src/components/PointPreviewDrawer.vue` - 渲染候选列表、轻量搜索、状态提示和国家回退 CTA
- `src/stores/map-points.ts` - 新增 `candidate-select` 状态、候选确认/回退 action 与统一复用提示
- `src/App.vue` - 抽屉打开布局现在兼容候选确认态
- `src/components/WorldMapStage.spec.ts` - 覆盖候选先行、复用提示前缀和真实点击回归
- `src/components/PointPreviewDrawer.spec.ts` - 覆盖默认 3 候选、搜索、回退 CTA 与 explanatory copy
- `src/stores/map-points.spec.ts` - 覆盖 pending selection -> reuse/new draft/fallback 三条收口路径
- `src/App.spec.ts` - 覆盖 legacy saved point 继续查看/编辑

## Decisions Made
- 保持候选搜索为“轻量筛选当前候选池”，而不是引入新的在线或全局搜索分支。
- 当候选命中已有保存城市时，直接打开旧记录并通过轻提示说明，而不是再显示二次确认。
- 国家/地区回退沿用现有 draft 保存流程，因此 drawer、保存和持久化不需要额外分叉。

## Deviations from Plan

### Auto-fixed Issues

**1. [Blocking] phase 级 build 暴露测试样板和模板空值收窄问题**
- **Found during:** Final verification
- **Issue:** `pnpm build` 暴露了 `SeedMarkerLayer.spec.ts` 仍缺少新城市字段、部分 spec 断言类型不兼容，以及抽屉模板在 `view` 分支里的空值收窄问题。
- **Fix:** 补齐测试样板里的 `cityId` / `cityContextLabel`，把有问题的断言改成兼容写法，并为模板访问加上可空保护。
- **Files modified:** `src/components/SeedMarkerLayer.spec.ts`, `src/components/PointPreviewDrawer.spec.ts`, `src/components/PointPreviewDrawer.vue`, `src/stores/map-points.spec.ts`
- **Verification:** `pnpm test -- src/components/WorldMapStage.spec.ts src/components/PointPreviewDrawer.spec.ts src/App.spec.ts` 与 `pnpm build` 均通过。
- **Committed in:** `129c334`

---

**Total deviations:** 1 auto-fixed
**Impact on plan:** 仅为确保 phase 级类型与构建验证闭环，没有扩 scope。

## Issues Encountered
- 构建阶段暴露的 TypeScript 收窄问题没有在组件级测试里出现，但都属于低风险样板/模板修补，已在最终验证前一次性补齐。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 8 可以直接消费 Phase 7 留下的稳定 `cityId` 选择结果、统一复用入口和候选确认抽屉态。
- 当前唯一额外信号是 `geo-lookup` 产物体积仍然偏大，Vite 在构建时给出 chunk size warning；这不是本阶段 blocker，但做城市边界高亮时值得顺手关注拆分策略。

---
*Phase: 07-城市选择与兼容基线*
*Completed: 2026-03-25*
