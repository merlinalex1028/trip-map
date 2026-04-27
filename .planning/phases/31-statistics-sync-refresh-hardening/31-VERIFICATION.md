---
phase: 31-statistics-sync-refresh-hardening
verified: 2026-04-27T09:19:40Z
status: human_needed
score: 7/7 must-haves verified
overrides_applied: 0
human_verification:
  - test: "真实浏览器下触发 bootstrap / same-user sync 后检查 Statistics 与 Timeline 同步"
    expected: "无需手动整页刷新，Statistics 的国家数/完成度会在权威 metadata 刷新后及时更新，并与 Timeline 的地点归类一致；无账号切换提示或额外 UI 抖动"
    why_human: "需要真实账号、真实 /auth/bootstrap 或前台 sync 时序，以及跨路由页面的可感知一致性确认；当前自动化覆盖是 store/page 分层回归，不是完整浏览器集成链路"
---

# Phase 31: Statistics Sync Refresh Hardening Verification Report

**Phase Goal:** authoritative metadata 经 bootstrap / same-user sync 刷新后，统计页会稳定重拉并与时间轴保持一致，不再出现国家数 / 完成度滞后。
**Verified:** 2026-04-27T09:19:40Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | metadata-only authoritative refresh with unchanged `id`/`placeId`/`createdAt` triggers a fresh `/records/stats` request | ✓ VERIFIED | `travelRecordRevision` 现在显式包含 metadata 字段，watcher 在 revision 变化时会直接拉取或排队拉取 `fetchStatsData()`：`apps/web/src/views/StatisticsPageView.vue:39-50,72-102`。命名用例 `re-fetches statistics after metadata-only authoritative refresh changes country metadata` 通过：`apps/web/src/views/StatisticsPageView.spec.ts:166-212`。 |
| 2 | `parentLabel` changes are treated as statistics-critical, and `displayName`/`typeLabel`/`subtitle` metadata-only changes are also part of the watched revision | ✓ VERIFIED | 统计页 revision 现在包含 `record.parentLabel`, `record.displayName`, `record.typeLabel`, `record.subtitle`：`apps/web/src/views/StatisticsPageView.vue:41-50`。后端 `visitedCountries` 由 distinct `parentLabel` 推导：`apps/server/src/modules/records/records.repository.ts:150-171`。 |
| 3 | metadata changes during an in-flight stats request queue exactly one follow-up refresh through `pendingRefreshAfterLoad` | ✓ VERIFIED | `isLoading` 为真时只设置 `pendingRefreshAfterLoad`，请求结束后再补拉一次：`apps/web/src/views/StatisticsPageView.vue:81-83,91-102`。对应命名用例通过：`apps/web/src/views/StatisticsPageView.spec.ts:214-280`。 |
| 4 | same-user refresh applies authoritative metadata without resetting the auth/session boundary | ✓ VERIFIED | same-user `refreshAuthenticatedSnapshot()` 分支继续走 `applyAuthoritativeTravelRecords()`，不触发 `applyAuthenticatedSnapshot()`：`apps/web/src/stores/auth-session.ts:210-237`。回归测试断言 `boundaryVersion` 不变且未调用 `resetTravelRecordsForSessionBoundary()`：`apps/web/src/stores/auth-session.spec.ts:264-302`。 |
| 5 | timeline 与 statistics 对同一份 overseas metadata / country completion 使用一致的数据源与关键字段 | ✓ VERIFIED | 时间轴直接由 `travelRecords` 生成，并消费 `displayName`/`parentLabel`/`subtitle`/`typeLabel`：`apps/web/src/stores/map-points.ts:129,198-216` 与 `apps/web/src/services/timeline.ts:20-31,65-78`。统计页对同一 `travelRecords` 建 revision：`apps/web/src/views/StatisticsPageView.vue:39-50`；统计接口再以服务端权威聚合返回 completion 数据：`apps/web/src/services/api/stats.ts:1-7`、`apps/server/src/modules/records/records.controller.ts:45-54`。 |
| 6 | regression coverage exists for bootstrap hydration, same-user sync, and completion staleness scenarios | ✓ VERIFIED | bootstrap 路径由 `restoreSession()` 用例覆盖记录灌入：`apps/web/src/stores/auth-session.spec.ts:141-171`；same-user metadata-only 路径由 `apps/web/src/stores/auth-session.spec.ts:264-302` 覆盖；completion 不滞后由 `apps/web/src/views/StatisticsPageView.spec.ts:166-280,282-389` 覆盖。这里的 bootstrap 覆盖是 store/page 分层，而非单一浏览器集成用例。 |
| 7 | Phase 31 introduces no visible UI/copy/color/focus/scroll/route/layout changes and keeps stats server-authoritative | ✓ VERIFIED | 代码提交 `6af1765` 只修改了 `StatisticsPageView.vue` 的 `<script setup>` revision 逻辑，没有触碰 `<template>`：`git diff 6af1765^ 6af1765 -- apps/web/src/views/StatisticsPageView.vue`。统计页仍只调用 `statsStore.fetchStatsData()`，不会在前端本地重算指标：`apps/web/src/views/StatisticsPageView.vue:53-60,72-102`、`apps/web/src/stores/stats.ts:22-58`。 |

**Score:** 7/7 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `apps/web/src/views/StatisticsPageView.vue` | route-local metadata-aware stats refresh trigger | ✓ VERIFIED | 文件存在且非 stub；`travelRecordRevision`、`pendingRefreshAfterLoad`、`fetchStatsData()` 三段链路都在：`39-50`, `72-102`。 |
| `apps/web/src/views/StatisticsPageView.spec.ts` | metadata-only refresh + in-flight coalescing regressions | ✓ VERIFIED | 新增两个 metadata 用例并保留 completion 展示断言：`166-280`, `282-389`。 |
| `apps/web/src/stores/auth-session.spec.ts` | same-user authoritative metadata refresh without session-boundary reset | ✓ VERIFIED | metadata-only same-user 回归存在且断言完整：`264-302`。 |
| `apps/web/src/stores/auth-session.ts` | same-user sync routes authoritative records through `applyAuthoritativeTravelRecords()` | ✓ VERIFIED | same-user 分支与 account-switch 分支分离，未重置 boundary：`210-237`。 |
| `apps/web/src/stores/map-points.ts` | authoritative `travelRecords` state and timeline projection | ✓ VERIFIED | `applyAuthoritativeTravelRecords()` 会把服务器权威快照写入 `travelRecords`，`timelineEntries` 直接消费它：`129`, `198-216`。 |
| `apps/web/src/stores/stats.ts` | authoritative stats fetch with stale-response guards | ✓ VERIFIED | `fetchStatsData()` 持续依赖 `boundaryVersion` + `activeRequestId`，没有静态返回：`22-58`。 |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `apps/web/src/views/StatisticsPageView.vue` | `apps/web/src/stores/map-points.ts` | `storeToRefs(mapPointsStore).travelRecords` observed by computed `travelRecordRevision` | ✓ VERIFIED | `gsd-sdk` 的 regex 因多行 computed 误报未命中；人工复核确认 `travelRecords` 从 `storeToRefs` 取出（`StatisticsPageView.vue:16`），并在 `39-50` 读取 `record.parentLabel/displayName/typeLabel/subtitle`。 |
| `apps/web/src/views/StatisticsPageView.vue` | `apps/web/src/stores/stats.ts` | existing watcher calls `statsStore.fetchStatsData()` or `pendingRefreshAfterLoad` | ✓ VERIFIED | `StatisticsPageView.vue:81-86,95-101` 直接调用 `statsStore.fetchStatsData()`；`gsd-sdk query verify.key-links` 对此链路返回 verified。 |
| `apps/web/src/stores/auth-session.ts` | `apps/web/src/stores/map-points.ts` | `refreshAuthenticatedSnapshot()` same-user path calls `applyAuthoritativeTravelRecords()` | ✓ VERIFIED | `auth-session.ts:234-236` 调用 `applyAuthoritativeTravelRecords(bootstrap.records)`；目标实现位于 `map-points.ts:198-216`。 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `apps/web/src/views/StatisticsPageView.vue` | `travelRecordRevision` | `storeToRefs(mapPointsStore).travelRecords` ← `replaceTravelRecords()` / `applyAuthoritativeTravelRecords()` ← `restoreSession()` / `refreshAuthenticatedSnapshot()` | Yes — `travelRecords` 由 `/auth/bootstrap` 返回的权威记录写入：`auth-session.ts:177-237`, `map-points.ts:192-216` | ✓ FLOWING |
| `apps/web/src/views/StatisticsPageView.vue` | `stats` | `statsStore.fetchStatsData()` ← `fetchStats()` ← `GET /records/stats` ← `RecordsRepository.getTravelStats()` | Yes — 前端 API 直接请求 `/records/stats`：`apps/web/src/services/api/stats.ts:1-7`；后端用 Prisma `count` + distinct `placeId` + distinct `parentLabel` 聚合：`apps/server/src/modules/records/records.repository.ts:150-171` | ✓ FLOWING |
| `apps/web/src/stores/map-points.ts` | `timelineEntries` | `buildTimelineEntries(travelRecords.value)` | Yes — `buildTimelineEntries()` 直接读取 `displayName`/`parentLabel`/`subtitle`/`typeLabel`：`apps/web/src/services/timeline.ts:20-31,65-78` | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| metadata-only authoritative refresh triggers a second stats fetch | `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts -t "re-fetches statistics after metadata-only authoritative refresh changes country metadata"` | `1 passed, 5 skipped` | ✓ PASS |
| in-flight metadata update queues exactly one follow-up fetch | `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts -t "queues one follow-up refresh for in-flight metadata-only authoritative updates"` | `1 passed, 5 skipped` | ✓ PASS |
| same-user metadata refresh keeps `boundaryVersion` stable | `pnpm --filter @trip-map/web exec vitest run src/stores/auth-session.spec.ts -t "applies metadata-only same-user refresh without resetting the session boundary"` | `1 passed, 21 skipped` | ✓ PASS |
| bootstrap hydrates authoritative records into client state | `pnpm --filter @trip-map/web exec vitest run src/stores/auth-session.spec.ts -t "enters restoring, reuses one in-flight bootstrap, and hydrates authenticated records"` | `1 passed, 21 skipped` | ✓ PASS |
| focused Phase 31 web regression suite stays green | `pnpm --filter @trip-map/web exec vitest run src/views/StatisticsPageView.spec.ts src/stores/stats.spec.ts src/stores/auth-session.spec.ts` | `33 passed (3 files)` | ✓ PASS |
| web package typecheck stays green | `pnpm --filter @trip-map/web typecheck` | exit code `0` | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `STAT-03` | `31-01-PLAN.md` | 当同一地点存在多次旅行记录时，统计会正确区分“总旅行次数”和“唯一地点 / 完成度” | ✓ SATISFIED | 服务端统计仍以 `totalTrips`、distinct `placeId`、distinct `parentLabel` 聚合：`apps/server/src/modules/records/records.repository.ts:150-171`。前端 Phase 31 修复的是 metadata-only refresh 不触发重新拉取的问题，相关 regression 在 `apps/web/src/views/StatisticsPageView.spec.ts:166-389` 与 `apps/web/src/stores/stats.spec.ts:24-137` 均通过。 |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| N/A | - | No blocker/warning anti-patterns found in phase-touched files | ℹ️ Info | 对 Phase 31 修改文件执行 TODO/placeholder/empty-data 扫描后，仅发现合法的初始态、reset 和错误态分支，没有会让目标落空的 stub。 |

### Human Verification Required

### 1. Bootstrap / Same-User Metadata Freshness

**Test:** 使用一个已经发生 overseas authoritative metadata 修正的真实账号，先查看 Timeline 中的地点标题/归类，然后保持 `/statistics` 打开状态触发 same-user sync；随后重新打开应用触发 `/auth/bootstrap` 并再次查看统计页。  
**Expected:** 无需手动刷新 `/statistics`，`已去过国家/地区数` 与 completion 文案会跟随新的 `parentLabel`/`displayName`/`typeLabel`/`subtitle` 更新，并与 Timeline 一致；过程中不出现“已切换到 ...”提示，也不新增额外 loading/banner。  
**Why human:** 需要真实账号、真实同步/恢复时序和跨页面肉眼比对。当前自动化把 coverage 分散在 `StatisticsPageView.spec.ts` 与 `auth-session.spec.ts`，没有完整浏览器集成链路。

### Gaps Summary

未发现会阻断 Phase 31 目标达成的代码缺口。剩余事项是上面的真实浏览器验收，因此本次状态为 `human_needed` 而非 `passed`。

---

_Verified: 2026-04-27T09:19:40Z_  
_Verifier: Claude (gsd-verifier)_
