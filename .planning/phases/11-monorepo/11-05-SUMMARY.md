---
phase: 11-monorepo
plan: 05
subsystem: ui
tags: [vue, monorepo, apps-web, popup, drawer, app-shell]
requires:
  - phase: 11-monorepo
    plan: 02
    provides: apps/web package shell、temporary legacy bootstrap bridge
provides:
  - package-local app shell in apps/web
  - package-local top-level popup and drawer interaction components
  - explicit legacy runtime bridge limited to supporting modules and styles
affects: [11-07, 11-09, 11-10, apps-web, popup, drawer, app-shell]
tech-stack:
  added: []
  patterns: [package-local top-level UI with explicit legacy runtime imports, bootstrap bridge mounts apps/web App]
key-files:
  created:
    - .planning/phases/11-monorepo/11-05-SUMMARY.md
    - apps/web/src/App.vue
    - apps/web/src/components/WorldMapStage.vue
    - apps/web/src/components/PosterTitleBlock.vue
    - apps/web/src/components/PointPreviewDrawer.vue
    - apps/web/src/components/SeedMarkerLayer.vue
    - apps/web/src/components/map-popup/MapContextPopup.vue
    - apps/web/src/components/map-popup/PointSummaryCard.vue
  modified:
    - apps/web/src/legacy-entry.ts
    - src/App.vue
key-decisions:
  - "只把 app shell 与顶层交互组件迁入 apps/web，supporting modules 继续显式桥接到 legacy root，避免提前吞掉 11-07 和 11-09。"
  - "legacy-entry 改为挂载 apps/web/src/App.vue，使 package-local app shell 成为实际运行入口，而样式仍通过 bridge 从 root src 引入。"
patterns-established:
  - "Pattern: apps/web 下的顶层 Vue 组件可以先 package-local 化，再用显式相对路径桥接 legacy stores/services/types/composables。"
  - "Pattern: bootstrap bridge 只保留挂载与样式职责，不再继续持有 root App 作为主壳层。"
requirements-completed: [ARC-01]
duration: 22 min
completed: 2026-03-30
---

# Phase 11 Plan 05: App Shell Migration Summary

**apps/web 现在直接持有 Vue app shell、地图主舞台和 popup/drawer 顶层交互组件，并通过显式 bridge 继续接住 legacy supporting runtime**

## Performance

- **Duration:** 22 min
- **Started:** 2026-03-30T04:00:00Z
- **Completed:** 2026-03-30T04:21:45Z
- **Tasks:** 1
- **Files modified:** 9

## Accomplishments

- 把 `App.vue`、`WorldMapStage.vue`、`PosterTitleBlock.vue`、`PointPreviewDrawer.vue`、`SeedMarkerLayer.vue`、`MapContextPopup.vue` 和 `PointSummaryCard.vue` 迁入 `apps/web/src`，保持现有 `App -> WorldMapStage -> popup/drawer` 结构不变。
- 所有迁入组件都只在必要处通过显式相对路径桥接 legacy `stores/services/types/composables/assets`，没有提前迁移 Pinia stores、composables、specs、styles 或 assets。
- 更新 `apps/web/src/legacy-entry.ts` 让 `apps/web/src/App.vue` 成为实际挂载的 app shell，并顺手修正了两份 `App.vue` 的定时器类型，确保 `pnpm -C apps/web typecheck` 通过。

## Task Commits

Each task was committed atomically:

1. **Task 1: Relocate the app shell and top-level interaction components into `apps/web`** - `c43e7d3` (feat)

**Plan metadata:** pending docs commit

## Files Created/Modified

- `apps/web/src/App.vue` - package-local app shell，组合 `PosterTitleBlock` 和 `WorldMapStage`，并显式桥接 legacy stores
- `apps/web/src/components/WorldMapStage.vue` - package-local 主地图舞台，保留 popup/drawer 主链路并桥接 legacy runtime
- `apps/web/src/components/PosterTitleBlock.vue` - package-local 标题区组件
- `apps/web/src/components/PointPreviewDrawer.vue` - package-local deep drawer 顶层组件，桥接 legacy store 与类型
- `apps/web/src/components/SeedMarkerLayer.vue` - package-local marker 顶层图层组件
- `apps/web/src/components/map-popup/MapContextPopup.vue` - package-local popup shell，继续委托给迁移后的 summary card
- `apps/web/src/components/map-popup/PointSummaryCard.vue` - package-local summary card，桥接 legacy city search 与类型
- `apps/web/src/legacy-entry.ts` - temporary bootstrap bridge，改为挂载 package-local `App.vue`
- `src/App.vue` - 修正定时器类型，消除 apps/web typecheck 阻塞

## Decisions Made

- 本计划只迁移用户可见的 app shell 与顶层交互组件，不迁移 supporting runtime modules，也不做 bridge cleanup。
- 顶层组件进入 `apps/web` 后仍保留显式 relative imports 指向 root `src/`，让后续计划可以继续分批迁移 supporting modules 而不影响当前 UI 壳层归属。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 修正 app shell notice timer 的浏览器类型定义**
- **Found during:** Task 1 verification
- **Issue:** `pnpm -C apps/web typecheck` 命中 `apps/web/src/App.vue` 与 `src/App.vue` 的 `window.setTimeout` 返回值类型不兼容，阻塞验证完成。
- **Fix:** 把两份 `App.vue` 的 `noticeTimer` 改为浏览器语义下的 `number | null`，与 `window.setTimeout` / `window.clearTimeout` 保持一致。
- **Files modified:** `apps/web/src/App.vue`, `src/App.vue`
- **Verification:** `pnpm -C apps/web typecheck`
- **Committed in:** `c43e7d3` (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 Rule 3)
**Impact on plan:** 该修复只为解除验证阻塞，没有扩大迁移范围，也没有把 supporting modules 提前迁入 apps/web。

## Issues Encountered

- `apps/web/src` 在本计划开始前已经存在 `data/services/types` 等 supporting modules，但这次提交没有修改它们；本计划只新增 app shell 与顶层交互组件，并保持后续迁移边界清晰。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `apps/web` 已经拥有可运行的 package-local app shell 与顶层交互表面，后续 `11-07` / `11-09` 可以继续迁移 supporting modules 并逐步收口 bridge。
- 当前 bridge 仍显式依赖 root `src` 下的 stores、services、types、composables 与 styles，这是刻意保留的过渡态，不是遗漏。

## Known Stubs

None.

## Self-Check

PASSED

- Verified summary file exists: `.planning/phases/11-monorepo/11-05-SUMMARY.md`
- Verified task commit exists: `c43e7d3`
