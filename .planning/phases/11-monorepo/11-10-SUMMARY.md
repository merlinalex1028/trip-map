---
phase: 11-monorepo
plan: 10
subsystem: ui
tags: [vue, vitest, css, assets, vite]
requires:
  - phase: 11-08
    provides: package-local non-UI regression suite and test helpers inside apps/web
  - phase: 11-09
    provides: package-local runtime glue and rewired app shell/components inside apps/web
provides:
  - Package-local UI regression suite under apps/web/src for app shell, map stage, popup, drawer, and marker surfaces
  - Package-local global styles and world-map asset loaded directly by apps/web/src/main.ts
  - Bridge-free web bootstrap that mounts apps/web/src/App.vue without legacy-entry
affects: [11-04, 12, apps/web smoke path]
tech-stack:
  added: []
  patterns: [apps/web owns UI regression, global styling, and static map assets locally; bootstrap cleanup requires removing residual repo-root UI imports together with legacy bridge removal]
key-files:
  created:
    - apps/web/src/App.spec.ts
    - apps/web/src/components/WorldMapStage.spec.ts
    - apps/web/src/components/PointPreviewDrawer.spec.ts
    - apps/web/src/components/SeedMarkerLayer.spec.ts
    - apps/web/src/components/map-popup/PointSummaryCard.spec.ts
    - apps/web/src/components/map-popup/MapContextPopup.spec.ts
    - apps/web/src/styles/tokens.css
    - apps/web/src/styles/global.css
    - apps/web/src/assets/world-map.svg
  modified:
    - apps/web/src/main.ts
    - apps/web/src/components/WorldMapStage.vue
    - apps/web/src/components/map-popup/PointSummaryCard.vue
    - apps/web/src/components/map-popup/MapContextPopup.vue
    - apps/web/src/legacy-entry.ts
key-decisions:
  - "apps/web/src/main.ts now owns the production bootstrap directly, so global CSS and the world-map asset must be imported from package-local paths instead of lingering in a dead bridge file."
  - "The package-local UI regression entry focuses on targeted v2.0 shell/map/popup/drawer/marker behaviors, avoiding unrelated churn in repo-root legacy specs while making apps/web verification self-contained."
patterns-established:
  - "Pattern 1: final bridge cleanup happens by moving the active bootstrap path first, then collapsing any residual repo-root UI asset/type/service imports in the same surface."
  - "Pattern 2: apps/web UI regression can be localized incrementally by adding targeted package-local specs for each surface instead of copying the entire legacy suite verbatim."
requirements-completed: [ARC-01]
duration: 9min
completed: 2026-03-30
---

# Phase 11 Plan 10: UI Surface Localization Summary

**apps/web 现已直接挂载 package-local App.vue，并在包内拥有 UI regression、global styles 与 world-map 资源，不再通过 legacy-entry 维持主启动链路**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-30T06:27:00Z
- **Completed:** 2026-03-30T06:35:41Z
- **Tasks:** 1
- **Files modified:** 14

## Accomplishments

- 在 `apps/web/src` 新增 `App.spec.ts`、`WorldMapStage.spec.ts`、`PointPreviewDrawer.spec.ts`、`SeedMarkerLayer.spec.ts`、`PointSummaryCard.spec.ts` 与 `MapContextPopup.spec.ts`，让当前 v2.0 UI 主链路回归命令完全可从 `apps/web` 内执行。
- 新增 `apps/web/src/styles/tokens.css`、`apps/web/src/styles/global.css` 与 `apps/web/src/assets/world-map.svg`，并将 `apps/web/src/main.ts` 改为直接 `createApp(App).use(createPinia()).mount('#app')`。
- 删除 `apps/web/src/legacy-entry.ts`，同时把 `WorldMapStage.vue`、`PointSummaryCard.vue` 与 `MapContextPopup.vue` 中残留的 repo-root UI 资源/类型/服务引用切回 package-local 路径。

## Task Commits

Each task was committed atomically:

1. **Task 1: Rehome the UI regression surface, package-local styles/assets, and remove the bootstrap bridge** - `25c2883` (feat)

## Files Created/Modified

- `apps/web/src/main.ts` - 直接加载 package-local `App.vue` 与 package-local global CSS。
- `apps/web/src/App.spec.ts` - package-local app shell regression entry。
- `apps/web/src/components/SeedMarkerLayer.spec.ts` - marker semantics regression。
- `apps/web/src/components/WorldMapStage.spec.ts` - map click、boundary layer 与 drawer handoff regression。
- `apps/web/src/components/PointPreviewDrawer.spec.ts` - deep drawer surface regression。
- `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` - summary CTA / fallback / destructive confirm regression。
- `apps/web/src/components/map-popup/MapContextPopup.spec.ts` - popup shell semantics regression。
- `apps/web/src/styles/tokens.css` - package-local design tokens。
- `apps/web/src/styles/global.css` - package-local global style surface。
- `apps/web/src/assets/world-map.svg` - package-local world map asset。
- `apps/web/src/components/WorldMapStage.vue` - world map asset path 改为 package-local。
- `apps/web/src/components/map-popup/PointSummaryCard.vue` - city search / shared type imports 改为 package-local。
- `apps/web/src/components/map-popup/MapContextPopup.vue` - popup type imports 改为 package-local。
- `apps/web/src/legacy-entry.ts` - 已删除，不再参与 active bootstrap path。

## Decisions Made

- 把 UI regression 迁移实现为 `apps/web` 内的定向 regression specs，而不是直接复制 legacy root 的完整大套件，保持范围聚焦在当前 plan 的 v2.0 主链路表面。
- `legacy-entry` 移除时一并修复 3 个 UI 组件中的 repo-root 资源/类型/服务导入，避免 `apps/web` 看似 bridge-free 但仍通过 import 隐式依赖 root UI surface。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 清理 bridge cleanup 后残留的 repo-root UI imports**
- **Found during:** Task 1 (Rehome the UI regression surface, package-local styles/assets, and remove the bootstrap bridge)
- **Issue:** `WorldMapStage.vue`、`PointSummaryCard.vue`、`MapContextPopup.vue` 仍引用 repo-root 的 asset / type / service，导致移除 `legacy-entry` 后 `apps/web` 仍未完全 package-local。
- **Fix:** 将这些 UI surface 的导入路径切换到 `apps/web/src/assets`、`apps/web/src/types`、`apps/web/src/services`，使 bootstrap cleanup 真正闭环。
- **Files modified:** `apps/web/src/components/WorldMapStage.vue`, `apps/web/src/components/map-popup/PointSummaryCard.vue`, `apps/web/src/components/map-popup/MapContextPopup.vue`
- **Verification:** `pnpm -C apps/web test -- src/App.spec.ts src/components/SeedMarkerLayer.spec.ts src/components/WorldMapStage.spec.ts src/components/PointPreviewDrawer.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/map-popup/MapContextPopup.spec.ts`, `pnpm -C apps/web build`, `pnpm -C apps/web typecheck`, `rg -n 'from .*/src/' apps/web/src`
- **Committed in:** `25c2883` (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** 这是完成 bridge-free bootstrap 所必需的收口，没有引入 backend smoke panel、contracts 扩张或 Phase 12+ 语义改动。

## Issues Encountered

- `pnpm -C apps/web test` 期间出现 Node 的 `--localstorage-file` warning，但 6 个目标 spec 文件与 19 个测试全部通过，不影响本计划验收。
- `pnpm -C apps/web build` 继续报告既有 chunk size warning；构建成功，未在本计划范围内处理分包优化。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `apps/web` 当前的 UI regression、styles、assets 与 active bootstrap 已全部落在包内，后续 web 侧 smoke path 调整可以直接围绕 `apps/web` 推进。
- 本计划未触碰 backend smoke panel、contracts 扩张、server 代码或 Phase 12-15 语义，范围与用户约束保持一致。

## Self-Check: PASSED

- Verified summary file exists at `.planning/phases/11-monorepo/11-10-SUMMARY.md`.
- Verified task commit `25c2883` is present in git history.
- Verified stub scan across the changed UI/bootstrap/style/asset files found no placeholder markers blocking the plan goal; the `placeholder="搜索城市"` string is an intentional user-facing input placeholder, not a data stub.

---
*Phase: 11-monorepo*
*Completed: 2026-03-30*
