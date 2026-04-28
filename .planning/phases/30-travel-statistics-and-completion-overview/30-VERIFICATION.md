---
phase: 30-travel-statistics-and-completion-overview
verified: 2026-04-23T10:32:12Z
status: passed
score: 15/15 must-haves verified
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 12/15
  gaps_closed:
    - "用户可以看到总旅行次数、已去过地点数和已去过国家/地区数等基础统计"
    - "用户可以看到国家/地区完成度，且完成度口径与当前支持覆盖范围保持一致"
    - "当同一地点存在多次旅行记录时，统计会正确累加旅行次数，但不会错误放大唯一地点数或完成度"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "以已登录用户访问 /statistics，检查三项统计卡片与完成度说明"
    expected: "页面显示总旅行次数、已去过地点数、已去过国家/地区数，并展示“当前支持覆盖 21 个国家/地区”的说明"
    why_human: "自动化测试只验证状态切换和文本断言；视觉层级、卡片排版和真实浏览器交互仍需人工确认"
  - test: "在实际部署环境直接访问并刷新 /statistics 与 /timeline"
    expected: "若继续使用 createWebHistory()，部署必须提供 SPA rewrite/fallback，深链接直达和刷新不应返回 404"
    why_human: "仓库内未见可验证的生产 rewrite 配置，是否安全取决于外部托管环境"
---

# Phase 30: Travel Statistics & Completion Overview Verification Report

**Phase Goal:** 用户可以基于自己的旅行历史看到基础旅行统计与国家/地区完成度，并正确区分总旅行次数与唯一地点完成度。  
**Verified:** 2026-04-23T10:32:12Z  
**Status:** human_needed  
**Re-verification:** Yes - after gap closure

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | 用户可以看到总旅行次数、已去过地点数和已去过国家/地区数等基础统计。 | ✓ VERIFIED | `packages/contracts/src/stats.ts:1-5` 已定义四字段 contract；`apps/server/src/modules/records/records.repository.ts:150-172` 返回 `visitedCountries`；`apps/web/src/views/StatisticsPageView.vue:246-284` 渲染三张统计卡片。 |
| 2 | 用户可以看到国家/地区完成度，且完成度口径与当前支持覆盖范围保持一致。 | ✓ VERIFIED | 当前完成度以“已去过国家/地区数 + 支持覆盖总数”表达，而不是独立 percentage bar；这与 30-04/30-05 gap-closure 合同一致。`apps/web/src/views/StatisticsPageView.vue:252-261` 展示 `visitedCountries` 与 `totalSupportedCountries`；`apps/server/src/modules/canonical-places/place-metadata-catalog.ts:203-214` 用 authoritative catalog 计算分母；运行时 spot-check 输出 `TOTAL_SUPPORTED_TRAVEL_COUNTRIES = 21`，`overseas/layer.json` 唯一海外国家数为 `20`，分母口径对齐为 `20 + 中国 1`。 |
| 3 | 当同一地点存在多次旅行记录时，统计会正确累加旅行次数，但不会错误放大唯一地点数或完成度。 | ✓ VERIFIED | `apps/server/src/modules/records/records.repository.ts:151-165` 同时使用 `count`、`distinct placeId` 与 `distinct parentLabel -> toCountryLabel`；`apps/server/src/modules/records/records.service.spec.ts:387-400` 验证同地点多次旅行得到 `totalTrips=3 / uniquePlaces=1 / visitedCountries=1`；`apps/web/src/views/StatisticsPageView.spec.ts:166-214` 验证前端展示不会放大国家数。 |
| 4 | GET `/records/stats` 对已认证用户返回四字段统计。 | ✓ VERIFIED | `apps/server/src/modules/records/records.controller.ts:45-51` 调用 `recordsService.getStats(user.id)`；`apps/server/src/modules/records/records.service.ts:92-94` 薄委托到 repository；`apps/server/src/modules/records/records.repository.ts:167-172` 返回 `{ totalTrips, uniquePlaces, visitedCountries, totalSupportedCountries }`。 |
| 5 | 未认证请求 GET `/records/stats` 返回 401。 | ✓ VERIFIED | `apps/server/src/modules/records/records.controller.ts:45-51` 对 `/records/stats` 使用 `SessionAuthGuard`；`apps/server/src/modules/auth/guards/session-auth.guard.ts:19-31` 在缺少或无效 `sid` 时抛出 `UnauthorizedException`。 |
| 6 | `TravelStatsResponse` 类型可从 `@trip-map/contracts` 导出。 | ✓ VERIFIED | `packages/contracts/src/stats.ts:1-5` 定义接口；`packages/contracts/src/index.ts:1-11` re-export `./stats`；`pnpm --filter @trip-map/contracts build` 通过。 |
| 7 | `StatisticsPageView` 在 authenticated + 有数据时渲染三张 `StatCard`。 | ✓ VERIFIED | `apps/web/src/views/StatisticsPageView.vue:246-284` 渲染总旅行次数、已去过地点数、已去过国家/地区数三张卡片；`apps/web/src/views/StatisticsPageView.spec.ts:202-261` 断言 populated state 含三指标摘要与国家/地区说明。 |
| 8 | `StatisticsPageView` 在 restoring 或 `isLoading` 时渲染 3 个 skeleton 占位卡片。 | ✓ VERIFIED | `apps/web/src/views/StatisticsPageView.vue:140-165` 通过 `shouldShowRestoringState` 分流，且 `v-for="index in 3"` 渲染 3 个占位卡片。 |
| 9 | `StatisticsPageView` 在 anonymous 时渲染登录 CTA。 | ✓ VERIFIED | `apps/web/src/views/StatisticsPageView.vue:168-191` 渲染“登录后查看你的旅行统计 / 立即登录”；`apps/web/src/views/StatisticsPageView.spec.ts:94-99` 有对应断言。 |
| 10 | `StatisticsPageView` 在 authenticated + 0 条记录时渲染 empty state。 | ✓ VERIFIED | `apps/web/src/views/StatisticsPageView.vue:25-31,220-243` 以 `stats.value?.totalTrips === 0` 进入 empty state，且给出返回地图 CTA。 |
| 11 | `StatCard` 正确渲染 `label`、`value`、`unit`。 | ✓ VERIFIED | `apps/web/src/components/statistics/StatCard.vue:18-35` 输出三个 DOM 节点；`apps/web/src/components/statistics/StatCard.spec.ts:7-44` 分别断言 label、value、unit。 |
| 12 | `useStatsStore.fetchStatsData()` 调用 GET `/records/stats` 并更新 `stats / isLoading / error`。 | ✓ VERIFIED | `apps/web/src/stores/stats.ts:22-59` 调用 `fetchStats()` 并维护 loading、401 和 stale-response；`apps/web/src/stores/stats.spec.ts:30-53,55-73,76-93,114-168` 覆盖成功、401、边界切换和晚到响应。 |
| 13 | 访问 `/statistics` 路由可渲染 `StatisticsPageView`。 | ✓ VERIFIED | `apps/web/src/router/index.ts:7-24` 注册 `/statistics -> StatisticsPageView`。 |
| 14 | 用户账号面板中出现“查看统计”按钮，点击后导航到 `/statistics` 并关闭菜单。 | ✓ VERIFIED | `apps/web/src/components/auth/AuthTopbarControl.vue:41-44,156-174` 定义 `handleNavigateToStatistics()` 与按钮；`apps/web/src/components/auth/AuthTopbarControl.spec.ts:107-117` 断言 `router.push('/statistics')` 且菜单关闭。 |
| 15 | “查看统计”按钮与“时间轴”按钮视觉一致。 | ✓ VERIFIED | `apps/web/src/components/auth/AuthTopbarControl.vue:137-174` 两个按钮沿用同一组 pill 样式体系，仅统计按钮额外增加 `mt-2` 作为垂直间距；入口排序也被 `apps/web/src/components/auth/AuthTopbarControl.spec.ts:89-105` 回归约束。 |

**Score:** 15/15 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `packages/contracts/src/stats.ts` | 共享四字段统计 contract | ✓ VERIFIED | `TravelStatsResponse` 含 `totalTrips / uniquePlaces / visitedCountries / totalSupportedCountries`。 |
| `packages/contracts/src/index.ts` | re-export 统计 contract | ✓ VERIFIED | `export * from './stats'` 已存在。 |
| `apps/server/src/modules/canonical-places/place-metadata-catalog.ts` | authoritative 分母来源 | ✓ VERIFIED | `TOTAL_SUPPORTED_TRAVEL_COUNTRIES` 基于 canonical metadata 唯一海外国家数 + 中国计算。 |
| `apps/server/src/modules/records/records.repository.ts` | 后端统计聚合查询 | ✓ VERIFIED | 同时计算总旅行次数、唯一地点数、国家桶数，并返回 authoritative denominator。 |
| `apps/server/src/modules/records/records.service.ts` | `getStats(userId)` 服务委托 | ✓ VERIFIED | `getStats()` 仍是 repository 薄委托，无额外漂移逻辑。 |
| `apps/server/src/modules/records/records.controller.ts` | 受保护的 GET `/records/stats` | ✓ VERIFIED | `@Get('stats')` 放在 `@Get()` 之前，且使用 `SessionAuthGuard`。 |
| `apps/server/src/modules/records/records.service.spec.ts` | 后端回归测试 | ✓ VERIFIED | 覆盖四字段 contract、authoritative denominator、同国多地点去重、同地点多次旅行去重。 |
| `apps/web/src/services/api/stats.ts` | 前端 stats API helper | ✓ VERIFIED | `apiFetchJson<TravelStatsResponse>('/records/stats')` 直接连接后端端点。 |
| `apps/web/src/stores/stats.ts` | 前端 stats store | ✓ VERIFIED | 管理 `stats / isLoading / error`，并处理 401、stale response 与 reset。 |
| `apps/web/src/components/statistics/StatCard.vue` | 单指标卡片组件 | ✓ VERIFIED | 组件定义和 DOM 输出完整，组件测试通过。 |
| `apps/web/src/views/StatisticsPageView.vue` | 三指标统计总览页 | ✓ VERIFIED | populated state 渲染三张卡片，并展示完成度上下文。 |
| `apps/web/src/views/StatisticsPageView.spec.ts` | 页面回归测试 | ✓ VERIFIED | 覆盖 anonymous、刷新中数据变化、同地点多次旅行、多国统计等关键场景。 |
| `apps/web/src/router/index.ts` | `/statistics` 路由注册 | ✓ VERIFIED | 路由注册成立；另见下方部署 fallback warning。 |
| `apps/web/src/components/auth/AuthTopbarControl.vue` | 账号面板入口 | ✓ VERIFIED | 统计入口存在，关闭菜单后导航到 `/statistics`。 |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `apps/server/src/modules/records/records.controller.ts` | `apps/server/src/modules/records/records.service.ts` | `recordsService.getStats(user.id)` | ✓ WIRED | `@Get('stats')` handler 直接调用 service。 |
| `apps/server/src/modules/records/records.service.ts` | `apps/server/src/modules/records/records.repository.ts` | `recordsRepository.getTravelStats(userId)` | ✓ WIRED | `getStats(userId)` 为薄委托。 |
| `apps/server/src/modules/records/records.repository.ts` | `apps/server/src/modules/canonical-places/place-metadata-catalog.ts` | `TOTAL_SUPPORTED_TRAVEL_COUNTRIES` | ✓ WIRED | 统计分母直接复用 authoritative 常量，而非 summary 列表长度。 |
| `apps/web/src/services/api/stats.ts` | `GET /records/stats` | `apiFetchJson<TravelStatsResponse>('/records/stats')` | ✓ WIRED | API helper 直连后端统计端点。 |
| `apps/web/src/stores/stats.ts` | `apps/web/src/services/api/stats.ts` | `fetchStats()` | ✓ WIRED | `fetchStatsData()` 获取接口响应并更新 store。 |
| `apps/web/src/views/StatisticsPageView.vue` | `apps/web/src/stores/stats.ts` | `statsStore.fetchStatsData()` | ✓ WIRED | `onMounted`、`boundaryVersion` watch、`travelRecordRevision` watch 均可触发刷新。 |
| `apps/web/src/views/StatisticsPageView.vue` | `apps/web/src/components/statistics/StatCard.vue` | 第三张 `<StatCard>` 渲染 `visitedCountries` | ✓ WIRED | populated state 明确消费 `stats!.visitedCountries`。 |
| `apps/web/src/components/auth/AuthTopbarControl.vue` | `apps/web/src/router/index.ts` | `router.push('/statistics')` | ✓ WIRED | 点击统计入口后关闭菜单并导航。 |
| `apps/web/src/router/index.ts` | `apps/web/src/views/StatisticsPageView.vue` | `component: StatisticsPageView` | ✓ WIRED | `/statistics` 顶层路由已挂接统计页。 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `apps/server/src/modules/records/records.repository.ts` | `totalTrips` | `prisma.userTravelRecord.count({ where: { userId } })` | Yes | ✓ FLOWING |
| `apps/server/src/modules/records/records.repository.ts` | `uniquePlaces` | `prisma.userTravelRecord.findMany({ distinct: ['placeId'] })` | Yes | ✓ FLOWING |
| `apps/server/src/modules/records/records.repository.ts` | `visitedCountries`, `totalSupportedCountries` | `distinct parentLabel -> toCountryLabel` + `TOTAL_SUPPORTED_TRAVEL_COUNTRIES` | Yes | ✓ FLOWING |
| `apps/web/src/views/StatisticsPageView.vue` | `stats` | `useStatsStore.fetchStatsData() -> fetchStats() -> GET /records/stats` | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| contracts 构建 | `pnpm --filter @trip-map/contracts build` | exit 0 | ✓ PASS |
| 后端统计语义测试 | `pnpm --filter @trip-map/server exec vitest run src/modules/records/records.service.spec.ts` | `1 file, 14 tests passed` | ✓ PASS |
| 前端 store + view 回归 | `pnpm --filter @trip-map/web exec vitest run src/stores/stats.spec.ts src/views/StatisticsPageView.spec.ts` | `2 files, 9 tests passed` | ✓ PASS |
| 前端组件 / 入口回归 | `pnpm --filter @trip-map/web exec vitest run src/components/statistics/StatCard.spec.ts src/components/auth/AuthTopbarControl.spec.ts` | `2 files, 7 tests passed` | ✓ PASS |
| 前端类型检查 | `pnpm --filter @trip-map/web typecheck` | exit 0 | ✓ PASS |
| 后端构建 | `pnpm --filter @trip-map/server build` | exit 0 | ✓ PASS |
| 前端构建 | `pnpm --filter @trip-map/web build` | `vite build succeeded` | ✓ PASS |
| authoritative 分母运行时值 | `pnpm --filter @trip-map/server exec tsx -e "import { TOTAL_SUPPORTED_TRAVEL_COUNTRIES } ..."` | `21` | ✓ PASS |
| authoritative 海外唯一国家数 | `node -e "...overseas/layer.json..."` | `20` | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `STAT-01` | `30-01, 30-04, 30-05` | 用户可以查看基础旅行统计，包括总旅行次数、已去过地点数和已去过国家/地区数 | ✓ SATISFIED | contract、后端聚合与统计页三张卡片已闭环。 |
| `STAT-02` | `30-04, 30-05` | 用户可以查看国家/地区完成度 | ✓ SATISFIED | 当前以 `visitedCountries / totalSupportedCountries` 的上下文表达完成度，且分母来自 authoritative catalog。 |
| `STAT-03` | `30-01, 30-04, 30-05` | 当同一地点存在多次旅行记录时，统计会正确区分“总旅行次数”和“唯一地点 / 完成度” | ✓ SATISFIED | repository 聚合与前后端测试均验证多次旅行不会放大 `uniquePlaces` 或 `visitedCountries`。 |

No orphaned Phase 30 requirements found in `REQUIREMENTS.md`.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `apps/web/src/router/index.ts` | 1 | `createWebHistory()` without repo-visible SPA fallback | ✅ Resolved | Phase 32 Plan 02 已配置 vercel.json / _redirects / 32-DEPLOY.md，提供 SPA rewrite/fallback 合约。部署环境 deep-link / refresh 风险已关闭。 |

### Human Verification Required

> **状态更新（Phase 32）：** 以下人工验证项已由 Phase 32 独立收口。SPA fallback 配置已就绪，统计页真实浏览器验收由 Phase 32 Plan 03 Task 2 执行。

### 1. 统计页真实浏览器验收

**Test:** 以已登录用户访问 `/statistics`，准备至少一种\u201c同地点多次旅行\u201d和一种\u201c多国旅行\u201d数据，检查页面中的三张统计卡片、摘要 badge 和\u201c当前支持覆盖 21 个国家/地区\u201d说明。  
**Expected:** 页面能稳定显示三项统计，并且\u201c总旅行次数\u201d与\u201c已去过地点数 / 国家地区数\u201d之间的差异对用户是清晰可理解的。  
**Status:** → Phase 32 Plan 03 Task 2

### 2. 部署环境 deep-link / refresh 验收

**Test:** 在实际部署环境直接打开并刷新 `/statistics` 与 `/timeline`。  
**Expected:** 若继续使用 `createWebHistory()`，页面应由部署侧 rewrite/fallback 正常回到 SPA，不应返回 404。  
**Status:** → Phase 32 Plan 02 已配置 SPA fallback（vercel.json / _redirects / 32-DEPLOY.md）

### Gaps Summary

本轮 re-verification 确认：上一版 `30-VERIFICATION.md` 里的 3 个 blocker gap 已全部关闭。Phase 30 现在已经具备完整的核心统计链路：  
后端能返回四字段统计，`visitedCountries` 与 `totalSupportedCountries` 的口径来自 authoritative catalog；前端 store、统计页和账号面板入口全部连通；多次旅行不会错误放大唯一地点或完成度语义。  

当前没有阻塞 Phase 30 goal achievement 的代码缺口，因此不再是 `gaps_found`。本次状态保留为 `human_needed`，原因只有两类：
1. 统计页作为 UI 功能，仍需要人工确认真实浏览器中的可读性与交互体验。
2. `createWebHistory()` 的部署 fallback 风险属于外部环境问题，不阻塞核心统计链路，但必须在实际部署中验收。

---

_Verified: 2026-04-23T10:32:12Z_  
_Verifier: Claude (gsd-verifier)_
