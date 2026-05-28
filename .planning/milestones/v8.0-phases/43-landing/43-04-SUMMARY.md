---
phase: 43-landing
plan: 04
subsystem: route-copy-gate
tags: [vue, routing, copy-migration, vitest, vite]
requires: [43-02, 43-03]
provides:
  - route-facing copy migration for map, journal, and memories views
  - updated route/app/view specs for Phase 43 vocabulary
  - focused spec, grep audit, full test, and build verification before screenshot gate
affects: [map-view, journal-view, memories-view, router-specs, app-shell-specs]
tech-stack:
  added: []
  patterns:
    - route-facing copy and test vocabulary migrate together
    - grep gate enforced without old route literals on Phase 43-owned surfaces
key-files:
  created:
    - .planning/phases/43-landing/43-04-SUMMARY.md
  modified:
    - apps/web/src/views/MapHomeView.vue
    - apps/web/src/views/TimelinePageView.vue
    - apps/web/src/views/TimelinePageView.spec.ts
    - apps/web/src/views/StatisticsPageView.vue
    - apps/web/src/views/StatisticsPageView.spec.ts
    - apps/web/src/router/index.spec.ts
    - apps/web/src/App.spec.ts
    - apps/web/src/App.kawaii.spec.ts
key-decisions:
  - "MapHomeView 保持 LeafletMapStage 与 AuthRestoreOverlay 行为不变，只补 route-facing hook。"
  - "TimelinePageView.vue 与 StatisticsPageView.vue 不为命名纯洁性改名，只迁移文案、data hook 与 map 返回路径。"
  - "为满足 grep gate，不在 Phase 43-owned surfaces 中保留旧 `/timeline`、`/statistics` 字面量。"
completed: 2026-05-12
---

# Phase 43 Plan 04: Route Copy Gate Summary

**Phase 43 的 route-facing 视图与测试已切到 `世界足迹`、`旅途手账`、`旅途回忆`、`留下足迹` 词汇，并完成 focused specs、grep audit、full web test、build；landing 后续按高保反馈改为完整背景、无底部 CTA 条，当前只剩桌面截图 checkpoint。**

## Accomplishments

- 在 `MapHomeView.vue` 增加 `data-route-view="map"` 与 `aria-label="世界足迹"`，不改动 Leaflet 舞台与恢复遮罩行为。
- 将 `TimelinePageView.vue` 迁移到 `data-route-view="journal"` / `data-region="journal-shell"`，并统一为 `旅途手账`、`返回世界足迹`、`去世界足迹留下足迹`、`还没有留下足迹`。
- 将 `StatisticsPageView.vue` 迁移到 `data-route-view="memories"` / `data-region="memories-shell"`，并统一为 `旅途回忆`、`返回世界足迹`、`旅途数据暂时没有同步成功，请刷新页面或稍后重试。`、`还没有留下足迹`。
- 更新 `TimelinePageView.spec.ts`、`StatisticsPageView.spec.ts`、`router/index.spec.ts`、`App.spec.ts`、`App.kawaii.spec.ts`，让断言跟随新路径、新 route hook 与新中文词汇同步迁移。
- 采纳用户后续视觉反馈：landing 改用 `landing-full-bg.png` 完整背景；底部 CTA 条、底部注册/登录按钮和 CTA 吉祥物 DOM 已移除；下半区标题、统计、拍立得改为底边锚定并整体下移。

## Verification

- 通过：`./node_modules/.bin/vitest run src/router/index.spec.ts src/App.spec.ts src/App.kawaii.spec.ts src/views/LandingPageView.spec.ts src/components/shell/AuthenticatedAppShell.spec.ts src/components/auth/AuthDialog.spec.ts src/views/TimelinePageView.spec.ts src/views/StatisticsPageView.spec.ts`
- 通过：`rg -n "我的收藏|/timeline|/statistics|时间轴|旅行统计|点亮" apps/web/src/router apps/web/src/App.vue apps/web/src/App.spec.ts apps/web/src/App.kawaii.spec.ts apps/web/src/views apps/web/src/components/landing apps/web/src/components/shell apps/web/src/components/auth/AuthDialog.vue apps/web/src/components/auth/AuthDialog.spec.ts apps/web/src/components/auth/AuthTopbarControl.vue apps/web/src/components/auth/AuthTopbarControl.spec.ts`
- 通过：`NODE_OPTIONS='--localstorage-file=/tmp/trip-map-localstorage' ./node_modules/.bin/vitest run`
- 通过：`./node_modules/.bin/vite build`
- 后续视觉修订后通过：`./node_modules/.bin/vitest run src/views/LandingPageView.spec.ts`
- 后续视觉修订后通过：`./node_modules/.bin/vue-tsc --noEmit`
- 后续视觉修订后通过：`./node_modules/.bin/vite build`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 继续使用项目内可执行文件替代 `pnpm --filter ...` 入口**
- **Found during:** Task 1 / Task 2 verification
- **Issue:** 用户已预警 `pnpm --filter ...` 可能挂起，且前序计划也已记录同类问题。
- **Fix:** focused specs、full web test、build 全部改用 `apps/web/node_modules/.bin/*` 等价入口执行。
- **Files modified:** 无
- **Impact:** 仅替换验证入口，不影响测试范围与构建产物。

**2. [Rule 3 - Blocking] 为 full web test 注入 `happy-dom` 所需的 localStorage 文件参数**
- **Found during:** Task 2 full web test
- **Issue:** 直接运行 `./node_modules/.bin/vitest run` 时，`src/services/legacy-point-storage.spec.ts` 因 `window.localStorage` 不可用失败，属于当前测试环境缺少 `--localstorage-file` 参数，而不是本计划改动引入的行为回归。
- **Fix:** 改用 `NODE_OPTIONS='--localstorage-file=/tmp/trip-map-localstorage' ./node_modules/.bin/vitest run` 复跑。
- **Files modified:** 无
- **Impact:** 仅修正验证环境入口；复跑后 49 个测试文件、418 个测试全部通过。

## Task Commits

本次未执行任务级 git 提交。

原因：当前工作树已有并行改动，且本次用户授权写入范围不包含 GSD 状态/路线图元数据文件；同时当前分支不是可直接按 GSD 规范落提交的独立执行分支，因此保留为工作区变更，避免在受保护主线或混合改动上下文中误提交。

## Checkpoint Status

### Task 3: Desktop Screenshot Gate

- **Status:** pending human verification
- **What is ready:** `/` public landing、`/map` authenticated shell、route-facing 文案迁移、focused specs、grep audit、full web test、web build
- **Manual evidence recorded:** 尚未生成截图；等待按计划在 `/` 与 `/map` 的 `1366x768`、`1440x900`、`1536x1024`、`1920x1080` 桌面视口执行截图/肉眼检查
- **Pass criteria to confirm:** landing 的完整背景按宽度铺满、hero offset、下半区标题/统计/拍立得相对底边协调且无底部 CTA 条，以及 `/map` 的 `280px` 左侧 sidebar、三项固定导航、无旧 topbar/drawer/bottom nav、主内容不与 sidebar 重叠

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- 允许改写的 8 个目标源码/测试文件均已更新。
- `43-04-SUMMARY.md` 已创建。
- focused specs、grep audit、full web test、build 都已执行，其中 full web test 通过带 `--localstorage-file` 的等价入口完成。
