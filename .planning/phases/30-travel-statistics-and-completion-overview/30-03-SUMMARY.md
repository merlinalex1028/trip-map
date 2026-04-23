---
phase: 30-travel-statistics-and-completion-overview
plan: 03
subsystem: ui
tags: [vue, router, navigation, statistics]
requires:
  - phase: 29-timeline-page-and-account-entry
    provides: authenticated account menu shell and timeline entry pattern
  - phase: 30-travel-statistics-and-completion-overview
    provides: StatisticsPageView and frontend statistics layer
provides:
  - /statistics route registration in the web router
  - account-menu navigation entry for the statistics page
  - menu button ordering aligned with timeline -> statistics -> logout flow
affects: [web-router, account-panel-statistics-entry, phase-30-web-statistics-page]
tech-stack:
  added: []
  patterns:
    - Vue Router route registration alongside existing top-level views
    - Account menu pill button mirroring the existing timeline entry styling
key-files:
  modified:
    - apps/web/src/router/index.ts
    - apps/web/src/components/auth/AuthTopbarControl.vue
key-decisions:
  - "The /statistics route is inserted before the catch-all redirect so StatisticsPageView remains reachable."
  - "The statistics account-menu button intentionally mirrors the timeline entry styling and closes the menu before navigation."
patterns-established:
  - "Authenticated account-menu destinations should use closeMenu() before router.push()."
  - "New top-level personal views are registered beside /timeline in the shared router."
requirements-completed: [STAT-01, STAT-02]
duration: 10 min
completed: 2026-04-23
---

# Phase 30 Plan 03: Statistics Navigation Summary

**将 StatisticsPageView 接入路由，并在账号菜单中提供与时间轴一致的“查看统计”入口**

## Performance

- **Duration:** 10 min
- **Started:** 2026-04-23T16:00:00+08:00
- **Completed:** 2026-04-23T16:10:00+08:00
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- 在 `apps/web/src/router/index.ts` 中注册了 `/statistics` 顶层路由。
- 在 `AuthTopbarControl.vue` 中新增了 `handleNavigateToStatistics()` 与“查看统计”菜单按钮。
- 保持了账号菜单入口的视觉一致性与按钮顺序：`timeline -> statistics -> logout`。

## Task Commits

Each task was committed atomically:

1. **Task 1: 注册 /statistics 路由** - `6219851` (feat)
2. **Task 2: 新增“查看统计”账号入口** - `ffae23e` (feat)

## Files Created/Modified

- `apps/web/src/router/index.ts` - 新增 `StatisticsPageView` import 与 `/statistics` 路由。
- `apps/web/src/components/auth/AuthTopbarControl.vue` - 新增统计入口导航函数与菜单按钮。
- `.planning/phases/30-travel-statistics-and-completion-overview/30-03-SUMMARY.md` - 记录本次执行与验证结果。

## Decisions Made

- 统计入口沿用时间轴按钮的 pill 样式和圆角图标容器，避免菜单内出现新的视觉分叉。
- “查看统计”按钮放在“时间轴”之后、“退出登录”之前，保持信息架构连续。
- 为避免误带现有未提交改动，`router/index.ts` 的提交只纳入了统计路由相关变更，保留了工作树中已有的 history 模式切换未提交状态。

## Deviations from Plan

None - route registration and account-menu entry were implemented exactly within the planned scope.

## Issues Encountered

- `apps/web/src/router/index.ts` 在执行前已存在与本计划无关的未提交改动（history 模式切换）。本次执行通过精确暂存仅提交统计路由差异，避免把无关变更混入计划提交。

## User Setup Required

None.

## Next Phase Readiness

- `/statistics` 现在已经可以通过路由和账号菜单两条路径到达。
- Phase 30 的三份计划产物已齐备，可进入 phase-level verification 与收尾更新。

## Self-Check

PASSED

- Summary file exists: FOUND
- Commit `6219851` exists: FOUND
- Commit `ffae23e` exists: FOUND

