---
phase: 29-timeline-page-and-account-entry
plan: 04
subsystem: testing
tags: [vitest, vue-router, timeline, routing, auth]
requires:
  - phase: 29-timeline-page-and-account-entry
    provides: "29-01/29-02/29-03 已交付的 timeline route、timelineEntries selector、TimelinePageView 和 AuthTopbarControl 时间轴入口"
provides:
  - "AuthTopbarControl 时间轴菜单入口与导航回归测试"
  - "TimelinePageView 页面状态、多次去访拆分和未知日期文案回归测试"
  - "App 根壳在 map route 与 timeline route 间切换的路由回归测试"
affects: [timeline-page, app-shell, auth-menu, phase-30]
tech-stack:
  added: []
  patterns:
    - "Vitest 组件测试使用真实 Pinia store"
    - "App root route 测试为每次挂载创建独立 memory router"
key-files:
  created:
    - apps/web/src/components/auth/AuthTopbarControl.spec.ts
    - apps/web/src/views/TimelinePageView.spec.ts
  modified:
    - apps/web/src/App.spec.ts
    - apps/web/src/services/timeline.spec.ts
key-decisions:
  - "AuthTopbarControl.spec 复用真实 auth store，只 mock router.push，保持和现有 store-backed component spec 一致。"
  - "App.spec 改为每次挂载使用独立 memory router，避免单例 router 在跨测试场景下串路由。"
patterns-established:
  - "TRIP-04 的菜单入口显隐与导航回归停留在组件 spec，而不是挪到 store spec。"
  - "TRIP-05 的页面状态与 route-shell 切换分别由 TimelinePageView.spec 和 App.spec 兜底。"
requirements-completed: [TRIP-04, TRIP-05]
duration: 13min
completed: 2026-04-23
---

# Phase 29 Plan 04: Timeline Regression Test Summary

**回归测试锁定用户名菜单时间轴入口、独立时间轴页面状态，以及 App 根壳在 `/` 与 `/timeline` 间的切换语义。**

## Performance

- **Duration:** 13 min
- **Started:** 2026-04-23T04:06:00Z
- **Completed:** 2026-04-23T04:19:26Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- 为 `AuthTopbarControl` 新增独立 spec，覆盖匿名/已登录菜单显隐、时间轴导航和 logout 排序。
- 为 `TimelinePageView` 新增页面级回归，覆盖匿名 CTA、空状态、同地点多次去访拆分和 `日期未知` 文案。
- 更新 `App.spec` 以适配真实路由，并锁定 map route 与 timeline route 的主内容切换行为。

## Task Commits

Each task was committed atomically:

1. **Task 1: 为 AuthTopbarControl 增加时间轴入口与导航回归测试** - `0be15f8` (test)
2. **Task 2: 为 TimelinePageView 增加页面状态与多次去访渲染测试** - `6badc58` (test)
3. **Task 3: 更新 App.spec，锁定 map route 与 timeline route 的根壳切换** - `ee53663` (test)

## Files Created/Modified
- `apps/web/src/components/auth/AuthTopbarControl.spec.ts` - 覆盖用户名菜单中的时间轴入口显隐、导航和 logout 顺序。
- `apps/web/src/views/TimelinePageView.spec.ts` - 覆盖匿名 CTA、空状态、多次去访拆分和未知日期文案。
- `apps/web/src/services/timeline.spec.ts` - 补充等日期记录按 `createdAt` 与 `id` 稳定排序的回归。
- `apps/web/src/App.spec.ts` - 为 App 根壳引入隔离 router 测试基座，并补 map/timeline route 切换断言。

## Decisions Made
- 使用真实 Pinia store 驱动组件测试，避免把 timeline page/menu 行为降级成纯 props 级别的浅测。
- 在 `App.spec.ts` 中使用每次挂载独立的 memory router，而不是复用单例 router，保证 route regression 不会互相污染。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 修复 App.spec 在 router 引入后的整套挂载基座**
- **Found during:** Task 3 (更新 App.spec，锁定 map route 与 timeline route 的根壳切换)
- **Issue:** `App.vue` 已切到 `RouterView`，旧测试仍按“无 router 插件”挂载，导致整份 `App.spec.ts` 全量失效。
- **Fix:** 把 `App.spec.ts` 改成每次挂载都创建独立 memory router，并在此基础上补 route-shell 回归测试。
- **Files modified:** `apps/web/src/App.spec.ts`
- **Verification:** `pnpm --filter @trip-map/web test -- src/App.spec.ts src/components/auth/AuthTopbarControl.spec.ts src/views/TimelinePageView.spec.ts src/services/timeline.spec.ts`；`pnpm --filter @trip-map/web typecheck`
- **Committed in:** `ee53663` (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** 为了让 Task 3 可验证，必须先修复已被 route-shell 改造破坏的旧测试基座；没有扩大实现范围，只增强了测试稳定性。

## Issues Encountered
- 提交 Task 2 时误把 `git status` 与 `git commit` 并行执行，触发了临时 `index.lock` 竞争；改为串行 git 操作后已恢复。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- TRIP-04 / TRIP-05 的关键回归点已经被测试锁住，后续 Phase 29 收尾或 Phase 30 扩展统计视图时有明确安全网。
- 当前没有新的代码 blocker；仅保留 orchestrator 自己对 `.planning/ROADMAP.md` 的未提交更新，不在本计划范围内。

## Self-Check: PASSED

- `FOUND: .planning/phases/29-timeline-page-and-account-entry/29-04-SUMMARY.md`
- `FOUND: 0be15f8`
- `FOUND: 6badc58`
- `FOUND: ee53663`

---
*Phase: 29-timeline-page-and-account-entry*
*Completed: 2026-04-23*
