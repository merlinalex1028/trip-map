---
phase: 30-travel-statistics-and-completion-overview
plan: 02
subsystem: ui
tags: [vue, pinia, vitest, statistics, tailwind]
requires:
  - phase: 29-timeline-page-and-account-entry
    provides: TimelinePageView shell, state-flow patterns, and Kawaii card visual language
  - phase: 30-travel-statistics-and-completion-overview
    provides: TravelStatsResponse contract and authenticated GET /records/stats backend
provides:
  - fetchStats API helper for GET /records/stats
  - useStatsStore Pinia layer for stats/isLoading/error state
  - reusable StatCard component with DOM rendering coverage
  - StatisticsPageView with restoring, anonymous, error, empty, and populated states
affects: [phase-30-web-statistics-page, account-panel-statistics-entry, web-router]
tech-stack:
  added: []
  patterns:
    - Dedicated Pinia fetch-store pattern using shallowRef state plus fetchStatsData action
    - Statistics page shell mirrors TimelinePageView while consuming a separate stats API snapshot
key-files:
  created:
    - apps/web/src/services/api/stats.ts
    - apps/web/src/stores/stats.ts
    - apps/web/src/components/statistics/StatCard.vue
    - apps/web/src/components/statistics/StatCard.spec.ts
    - apps/web/src/views/StatisticsPageView.vue
  modified:
    - .planning/phases/30-travel-statistics-and-completion-overview/30-02-SUMMARY.md
key-decisions:
  - "Statistics frontend stays scoped to API/store/view/component files only; router and account entry wiring remain outside this plan."
  - "StatisticsPageView reuses TimelinePageView shell structure to preserve the established Kawaii visual language."
patterns-established:
  - "Frontend statistics features should consume the shared /records/stats contract via a dedicated service helper and Pinia store."
  - "Statistics route views must gate anonymous users in the UI and avoid rendering any numeric data before authentication succeeds."
requirements-completed: [STAT-01, STAT-02, STAT-03]
duration: 9 min
completed: 2026-04-23
---

# Phase 30 Plan 02: Statistics Frontend Summary

**Pinia 驱动的统计前端数据层、可复用 Kawaii StatCard 组件，以及基于 `/records/stats` 的五状态 StatisticsPageView**

## Performance

- **Duration:** 9 min
- **Started:** 2026-04-23T15:43:40+0800
- **Completed:** 2026-04-23T15:52:40+0800
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- 新增 `fetchStats()` 与 `useStatsStore`，把统计接口消费逻辑从视图中抽离为独立前端统计层。
- 新增 `StatCard` 组件及组件测试，确保 `label`、`value`、`unit` 三个核心展示值稳定渲染。
- 新增 `StatisticsPageView`，完整覆盖 restoring、anonymous、error、empty、populated 五种页面状态，并保持与时间轴页面一致的视觉语言。

## Task Commits

Each task was committed atomically:

1. **Task 1 (TDD RED): StatCard 失败测试基线** - `2d71a43` (test)
2. **Task 1 (TDD GREEN): 统计 API/store/StatCard 实现** - `e9e6589` (feat)
3. **Task 2: StatisticsPageView 五状态实现** - `eb4ab29` (feat)
4. **Task 2 follow-up: 视图状态顺序对齐计划** - `16d9577` (fix)

_Note: Task 1 followed TDD and therefore contains separate red/green commits._

## Files Created/Modified

- `apps/web/src/services/api/stats.ts` - 提供 `fetchStats()`，通过 `apiFetchJson` 调用 `GET /records/stats`。
- `apps/web/src/stores/stats.ts` - 提供 `useStatsStore`，管理 `stats`、`isLoading`、`error` 与 `fetchStatsData()`。
- `apps/web/src/components/statistics/StatCard.vue` - 提供单指标 Kawaii 卡片，接收 `label/value/unit/gradient` 四个 prop。
- `apps/web/src/components/statistics/StatCard.spec.ts` - 验证 StatCard 的 label/value/unit 三个 DOM 渲染点。
- `apps/web/src/views/StatisticsPageView.vue` - 提供统计页壳层、五状态分流、摘要 badge 与两张 StatCard。
- `.planning/phases/30-travel-statistics-and-completion-overview/30-02-SUMMARY.md` - 记录本次计划执行、验证与偏差修正。

## Decisions Made

- 没有扩展到 `router` 或账号面板入口，严格把范围限定在计划要求的 API、store、组件和页面视图。
- 统计页沿用时间轴页面的 shell、badge、pill button 和浮动卡片语言，避免 Phase 30 内部视觉分叉。
- 页面在 `onMounted` 的基础上额外监听认证恢复后的 `authenticated` 转换，以避免 restoring 阶段打开页面时出现“假 empty state”。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] 补上 restoring → authenticated 后的统计拉取**
- **Found during:** Task 2 (StatisticsPageView 四状态页面视图)
- **Issue:** 计划只要求 `onMounted` 触发拉取；但若页面在 `status='restoring'` 时挂载，恢复成功后不会自动请求统计，用户会看到错误的空状态。
- **Fix:** 在 `StatisticsPageView` 中监听 `status` 变化，当认证恢复为 `authenticated` 且尚未有统计数据时补触发 `fetchStatsData()`。
- **Files modified:** `apps/web/src/views/StatisticsPageView.vue`
- **Verification:** `pnpm --filter @trip-map/web test`、`pnpm --filter @trip-map/web typecheck`、`pnpm --filter @trip-map/web build`
- **Committed in:** `eb4ab29`

**2. [Rule 1 - Bug] 修正五状态 `v-if` 链顺序以匹配计划的 critical 要求**
- **Found during:** Task 2 verification
- **Issue:** 首版实现把 `empty` 分支放在 `error` 之前，不满足计划尾部明确要求的渲染顺序。
- **Fix:** 将 `error` 分支前移到 `empty` 之前，并重新执行测试、类型检查、构建和 grep 结构校验。
- **Files modified:** `apps/web/src/views/StatisticsPageView.vue`
- **Verification:** `pnpm --filter @trip-map/web test`、`pnpm --filter @trip-map/web typecheck`、`pnpm --filter @trip-map/web build`、`grep -n "data-state" apps/web/src/views/StatisticsPageView.vue`
- **Committed in:** `16d9577`

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 bug)
**Impact on plan:** 两项修正都直接服务于正确性与计划一致性，没有扩大功能范围。

## Issues Encountered

- Task 1 提交时曾短暂遇到 `.git/index.lock` 阻塞；复查时锁文件已消失，因此未做破坏性清理，仅重试提交并继续执行。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 前端统计层已经就绪，后续计划可以直接在现有页面入口或路由装配中复用 `StatisticsPageView` 与 `useStatsStore`。
- `StatCard` 与统计页的文案、状态分流、摘要 badge 已定型，后续若需要扩展更多统计项，可以沿用同一组件和视觉合同。

## Known Stubs

None.

## Self-Check

PASSED

- Summary file exists: FOUND
- Commit `2d71a43` exists: FOUND
- Commit `e9e6589` exists: FOUND
- Commit `eb4ab29` exists: FOUND
- Commit `16d9577` exists: FOUND
