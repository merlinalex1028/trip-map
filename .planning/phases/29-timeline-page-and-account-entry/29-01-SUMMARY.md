---
phase: 29-timeline-page-and-account-entry
plan: 01
subsystem: ui
tags: [web, vue-router, routing, auth-menu, shell]
requires: []
provides:
  - Hash 路由驱动的地图页与时间轴页入口
  - 保留现有顶栏和会话逻辑的持久 app shell
  - 用户名菜单中的时间轴导航入口
affects: [29-02, 29-03, timeline-page, auth-menu-navigation]
tech-stack:
  added: [vue-router]
  patterns: [createWebHashHistory, persistent app shell with RouterView, routed auth menu CTA]
key-files:
  created:
    - apps/web/src/router/index.ts
    - apps/web/src/views/MapHomeView.vue
    - apps/web/src/views/TimelinePageView.vue
  modified:
    - apps/web/package.json
    - apps/web/src/main.ts
    - apps/web/src/App.vue
    - apps/web/src/components/auth/AuthTopbarControl.vue
key-decisions:
  - "使用 createWebHashHistory() 打通独立页面导航，避免额外部署 rewrite 依赖。"
  - "把 AuthRestoreOverlay 跟随地图 route view，保持根壳只负责共享顶栏、notice 和对话框。"
patterns-established:
  - "根壳通过 RouterView 渲染主内容，地图与时间轴各自拥有独立 route view。"
  - "已登录用户名菜单内的页面跳转动作先 closeMenu() 再执行 router.push()。"
requirements-completed: [TRIP-04]
duration: 5 min
completed: 2026-04-23
---

# Phase 29 Plan 01: 时间轴路由骨架与账号入口 Summary

**Hash 路由驱动的独立地图页/时间轴页壳层，以及用户名菜单中的时间轴导航入口。**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-23T03:22:19Z
- **Completed:** 2026-04-23T03:27:36Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- 为 `apps/web` 引入 `vue-router`，建立 `#/`、`#/timeline` 与兜底 redirect 的最小 hash router。
- 把地图主舞台从根壳 `App.vue` 抽到 `MapHomeView.vue`，让 `App.vue` 改为共享 shell + `RouterView`。
- 在 `AuthTopbarControl.vue` 的已登录菜单中增加“时间轴”入口，点击时先关闭菜单再导航到 `'/timeline'`。

## Task Commits

Each task was committed atomically:

1. **Task 1: 建立 hash router，并把地图主舞台抽成独立 route view** - `c438151` (feat)
2. **Task 2: 在已登录用户名菜单中增加时间轴入口并接通路由导航** - `76cb843` (feat)

## Files Created/Modified

- `apps/web/package.json` - 新增 `vue-router` 依赖声明。
- `apps/web/src/main.ts` - 在应用启动时注册 router。
- `apps/web/src/App.vue` - 保留现有顶栏、notice、auth dialog 与会话恢复逻辑，改用 `RouterView` 驱动主内容区。
- `apps/web/src/router/index.ts` - 定义 map-home、timeline 与 fallback redirect。
- `apps/web/src/views/MapHomeView.vue` - 承接原地图主舞台与 restore overlay。
- `apps/web/src/views/TimelinePageView.vue` - 提供 Wave 1 可编译的独立时间轴占位页与返回地图导航。
- `apps/web/src/components/auth/AuthTopbarControl.vue` - 新增时间轴菜单入口、图标容器与导航 handler。

## Decisions Made

- 采用 `createWebHashHistory()`，以最小代价满足同 tab 独立页面切换，不引入部署层 rewrite 改造。
- `AuthRestoreOverlay` 保留在地图 route view 中，确保切到时间轴页时主内容区不再渲染地图舞台。
- 时间轴入口放在已登录用户名菜单内，并遵循先 `closeMenu()` 后 `router.push('/timeline')` 的交互顺序。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

- `apps/web/src/views/TimelinePageView.vue:23` - 页面文案明确标记当前为 Wave 1 占位页，真实时间轴数据接入留给后续计划。
- `apps/web/src/views/TimelinePageView.vue:39` - 主内容区仍为占位说明，不展示真实旅行记录；这是本 plan 的预期交付边界。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `29-02` 现在可以直接基于 `#/timeline` route 接入 store/service 派生的真实时间轴数据。
- 用户名菜单入口与独立页面壳层已经就位，后续计划无需再从地图主舞台内联时间轴模块。

## Self-Check: PASSED

- Found `.planning/phases/29-timeline-page-and-account-entry/29-01-SUMMARY.md`
- Found task commit `c438151`
- Found task commit `76cb843`

---
*Phase: 29-timeline-page-and-account-entry*
*Completed: 2026-04-23*
