---
phase: 25-sync-semantics-multi-device-hardening
verified: 2026-04-15T07:16:18Z
status: human_needed
score: 9/9 must-haves verified
overrides_applied: 0
human_verification:
  - test: "同账号双窗口：A 点亮后切回 B 触发 foreground refresh"
    expected: "B 自动显示已点亮，A/B 都不出现“已切换到 ...”提示或匿名清场。"
    why_human: "真实浏览器 focus/visibility 时序、cookie 会话与网络时延需要在双窗口 UAT 中最终确认。"
  - test: "同账号双窗口：A 取消点亮后切回 B，并在 B 的 stale 状态下再次取消点亮"
    expected: "B 自动收敛为未点亮；再次取消不出现假失败，提示仍区分成功、普通失败与需要重新登录。"
    why_human: "这是跨窗口时序与真实后端会话共同作用的用户流，自动化 store/spec 只能覆盖近似竞态。"
  - test: "DB 可达环境重跑 server sync e2e"
    expected: "`pnpm --filter @trip-map/server test -- test/records-sync.e2e-spec.ts test/records-travel.e2e-spec.ts` 通过。"
    why_human: "当前环境无法连接 aws-1-ap-southeast-1.pooler.supabase.com:5432，不应把环境限制误判为代码回归。"
---

# Phase 25: Sync Semantics & Multi-Device Hardening Verification Report

**Phase Goal:** 用户在多设备上看到稳定一致的账号记录，并能明确理解同步成功、失败与重新登录边界  
**Verified:** 2026-04-15T07:16:18Z  
**Status:** human_needed  
**Re-verification:** No — 本次为对 gap closure 后最终代码状态的完整重验；先前 `25-VERIFICATION.md` 时间戳早于 `25-UAT.md` blocker 诊断与 `25-04-SUMMARY.md` 完成时间，已失效。

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | 当前账号取消点亮后，云端对应 `placeId` 会被移除，后续 bootstrap 不再返回该记录。 | ✓ VERIFIED | `apps/server/src/modules/records/records.repository.ts:131` 使用 `deleteMany({ where: { userId, placeId } })`；`apps/server/test/records-sync.e2e-spec.ts:222` 断言 delete 后 session B bootstrap `records: []`。 |
| 2 | stale 设备再次删除已被移除的 `placeId` 时，服务端返回幂等成功，不再制造假失败。 | ✓ VERIFIED | `apps/server/src/modules/records/records.service.ts:85` 仅委托 repository，不再抛 missing-record 404；`apps/server/test/records-sync.e2e-spec.ts:257` 与 `apps/server/test/records-travel.e2e-spec.ts:321` 都断言 same-user missing delete 返回 `204`。 |
| 3 | 同一账号的两个 session 在 create/delete 后重新 bootstrap 时，会看到一致的 authoritative records snapshot。 | ✓ VERIFIED | `apps/server/test/records-sync.e2e-spec.ts:191` 覆盖 session A create -> session B `/auth/bootstrap` 可见；`apps/server/test/records-sync.e2e-spec.ts:222` 覆盖 delete -> bootstrap 不可见；`apps/server/src/modules/auth/auth.service.ts:187` 从真实 `userTravelRecord` 查询拼装 `records`。 |
| 4 | 当前账号页面回到前台或再次获得焦点时，会重新获取当前 user 的 authoritative bootstrap snapshot。 | ✓ VERIFIED | `apps/web/src/App.vue:49` 挂载 `focus`/`visibilitychange` 监听；`apps/web/src/App.vue:76` 仅在 `authenticated` 时触发 `refreshAuthenticatedSnapshot()`；`apps/web/src/App.spec.ts:389`、`:493` 断言两个触发源都生效。 |
| 5 | same-user refresh 不会误触发 switch-account 清边界，也不会错误落 “已切换到 ...” notice。 | ✓ VERIFIED | `apps/web/src/stores/auth-session.ts:229` 仅在 `bootstrap.user.id !== userId` 时才走 `applyAuthenticatedSnapshot()`；同 user 分支改为 `applyAuthoritativeTravelRecords()`；`apps/web/src/stores/auth-session.spec.ts:228`、`:303`、`:331` 断言不 reset、不出现 “已切换到”。 |
| 6 | refresh 的普通失败保留当前 snapshot；401 仍按会话失效语义回到 anonymous。 | ✓ VERIFIED | `apps/web/src/stores/auth-session.ts:238` 对普通错误仅落 `FOREGROUND_REFRESH_FAILED_NOTICE`，对 `session-unauthorized` 走 `handleUnauthorized()`；`apps/web/src/stores/auth-session.spec.ts:256` 与 `:279` 分别断言保留 records / 清空会话边界。 |
| 7 | 点亮成功、取消点亮成功、普通失败、需要重新登录四类同步结果在 UI 上可被明确区分。 | ✓ VERIFIED | `apps/web/src/stores/map-points.ts:437` 点亮成功 info；`:455` 点亮普通失败 warning；`:491` 取消点亮成功 info；`:502` 401 继续走 `handleUnauthorized()`；`apps/web/src/stores/map-points.spec.ts:352`、`:377`、`:487`、`apps/web/src/components/LeafletMapStage.spec.ts:777`、`:858` 覆盖上述分流。 |
| 8 | gap closure 后，same-user foreground refresh 与 in-flight `illuminate()` 重叠时，A 窗口最终仍稳定显示为已点亮。 | ✓ VERIFIED | `apps/web/src/stores/map-points.ts:208` 的 `applyAuthoritativeTravelRecords()` 会保留 pending `placeId`；`apps/web/src/stores/map-points.ts:433` 成功路径改为按 `placeId` upsert authoritative record；`apps/web/src/stores/map-points.spec.ts:334` 与 `apps/web/src/App.spec.ts:414` 覆盖原 UAT blocker。 |
| 9 | same-user refresh 与 `unilluminate()` 重叠时，最终仍收敛为未点亮，不会被 stale snapshot 复活。 | ✓ VERIFIED | `apps/web/src/stores/map-points.ts:218` 对 pending placeId 删除 stale snapshot 记录；`apps/web/src/stores/map-points.ts:480`/`:490` 删除路径保持最终过滤；`apps/web/src/stores/auth-session.spec.ts:331` 与 `apps/web/src/stores/map-points.spec.ts:520`、`:583` 断言未点亮收敛成立。 |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `apps/server/src/modules/records/records.service.ts` | current-user delete 幂等语义 | ✓ VERIFIED | 存在、实现非 stub、直接接到 repository 删除。 |
| `apps/server/src/modules/records/records.repository.ts` | current-user 范围内 deleteMany no-op 收口 | ✓ VERIFIED | 用真实 Prisma `deleteMany` 操作 `userTravelRecord`。 |
| `apps/server/test/records-sync.e2e-spec.ts` | multi-session bootstrap / stale delete 回归 | ✓ VERIFIED | 覆盖 create、delete、stale delete 三个关键场景。 |
| `apps/server/test/records-travel.e2e-spec.ts` | current-user delete contract / ownership 回归 | ✓ VERIFIED | 覆盖 same-user missing delete=204 与 cross-user ownership 安全边界。 |
| `apps/web/src/stores/auth-session.ts` | same-user foreground refresh + overlap-safe apply | ✓ VERIFIED | 有 in-flight guard、same-user 轻刷新、401 分流。 |
| `apps/web/src/App.vue` | foreground sync trigger | ✓ VERIFIED | 注册并清理 `focus` / `visibilitychange` 监听，不卸载 map shell。 |
| `apps/web/src/stores/map-points.ts` | pending-aware authoritative refresh + mutation convergence | ✓ VERIFIED | 对 pending `placeId` 做协调，并在 create/delete 成功后重申最终真值。 |
| `apps/web/src/stores/auth-session.spec.ts` | same-user refresh / overlap regression | ✓ VERIFIED | 包含 refresh success、network failure、401、overlap illuminate/unilluminate。 |
| `apps/web/src/stores/map-points.spec.ts` | illuminate/unilluminate notice 与 overlap regression | ✓ VERIFIED | 包含 success/failure/401 与 overlap 收敛。 |
| `apps/web/src/App.spec.ts` | 用户路径级 foreground refresh overlap regression | ✓ VERIFIED | 覆盖 focus/visibility 触发、authenticated guard、并发场景不误切账号。 |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `records.service.ts` | `records.repository.ts` | current-user delete semantics | ✓ VERIFIED | `deleteTravel()` 直接调用 `deleteTravelRecordByPlaceId()`。 |
| `records-sync.e2e-spec.ts` | `/auth/bootstrap` | same-user multi-session bootstrap verification | ✓ VERIFIED | e2e 直接通过 `/auth/bootstrap` 断言 create/delete 后 snapshot。 |
| `App.vue` | `auth-session.ts` | focus / visibility foreground refresh trigger | ✓ VERIFIED | `handleWindowFocus()` / `handleVisibilityChange()` 调 `refreshAuthenticatedSnapshot()`。 |
| `auth-session.ts` | `map-points.ts` | same-user authoritative snapshot application | ✓ VERIFIED | same-user refresh 分支调用 `applyAuthoritativeTravelRecords()`，不是 session-boundary reset。 |
| `map-points.ts` | `services/api/records.ts` | create/delete mutation resolution | ✓ VERIFIED | `illuminate()` 调 `createTravelRecord()`；`unilluminate()` 调 `deleteTravelRecord()`。 |
| `map-points.ts` | `map-ui.ts` | success / failure notices | ✓ VERIFIED | success/warning 都经 `setInteractionNotice()` 输出。 |
| `LeafletMapStage.spec.ts` | `map-points.ts` | popup action feedback semantics | ✓ VERIFIED | popup 点亮/取消点亮后断言 app-shell notice。 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `apps/server/src/modules/records/records.repository.ts` | current-user travel rows | Prisma `userTravelRecord.deleteMany/findMany` | Yes — 真实 DB query/mutation | ✓ FLOWING |
| `apps/server/src/modules/auth/auth.service.ts` | bootstrap `records` | `authRepository.findUserTravelRecordsByUserId()` | Yes — 从 `userTravelRecord` 表读取并返回给 `/auth/bootstrap` | ✓ FLOWING |
| `apps/web/src/stores/auth-session.ts` | same-user snapshot refresh | `fetchAuthBootstrap()` -> `/auth/bootstrap` | Yes — 响应 records 直接进入 `applyAuthoritativeTravelRecords()` | ✓ FLOWING |
| `apps/web/src/stores/map-points.ts` | `travelRecords` / sync notices | `createTravelRecord()` / `deleteTravelRecord()` API 响应 | Yes — 成功时 upsert/filter authoritative record，失败时 warning 或 unauthorized 分流 | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| web overlap regression bundle | `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/stores/map-points.spec.ts src/App.spec.ts` | 68 tests passed | ✓ PASS |
| web typecheck | `pnpm --filter @trip-map/web typecheck` | exit code 0 | ✓ PASS |
| server typecheck | `pnpm --filter @trip-map/server typecheck` | exit code 0 | ✓ PASS |
| server sync e2e | `pnpm --filter @trip-map/server test -- test/records-sync.e2e-spec.ts test/records-travel.e2e-spec.ts` | 当前环境跳过：数据库 `aws-1-ap-southeast-1.pooler.supabase.com:5432` 不可达 | ? SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `SYNC-03` | 25-01, 25-03, 25-04 | 取消点亮会同步删除或标记取消 | ✓ SATISFIED | server `deleteMany` + stale delete 204；`map-points` 删除成功/失败/overlap spec 全覆盖。 |
| `SYNC-04` | 25-01, 25-02, 25-04 | 同账号跨设备看到一致记录 | ✓ SATISFIED | `/auth/bootstrap` multi-session e2e、foreground refresh 触发、same-user overlap regression 全部存在且 web 当前回归通过。 |
| `SYNC-05` | 25-02, 25-03, 25-04 | 成功/失败/重新登录提示明确区分 | ✓ SATISFIED | `auth-session` refresh warning vs 401 分流；`map-points` success/warning/unauthorized 分层；popup/App spec 覆盖 notice 输出。 |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| — | — | 未发现会阻塞本 phase 目标的 TODO、placeholder、空实现或断线 stub | ℹ️ Info | grep 命中的 `return null` 仅是正常数据查询 fallback，不流向用户可见占位输出。 |

### Human Verification Required

### 1. 双窗口点亮最终一致

**Test:** 同账号打开 A/B 两个窗口；A 点亮一个当前未点亮地点；切到 B 并让页面重新获得焦点。  
**Expected:** B 自动显示该地点已点亮；A/B 都不出现“已切换到 ...”或匿名清场。  
**Why human:** 真实浏览器 focus/visibility 触发时序、cookie 会话与网络时延需要最终 UAT 确认。

### 2. 双窗口取消点亮与 stale delete

**Test:** 同账号打开 A/B 两个窗口；确保同一地点已点亮；A 取消点亮后切到 B 并重新聚焦；如 B 仍保留旧状态，再次取消点亮。  
**Expected:** B 自动收敛为未点亮；再次取消不出现假失败，成功/失败/重新登录提示仍可区分。  
**Why human:** 这是跨窗口真实交互链路，自动化 store/spec 只能覆盖近似并发，不等于最终 UAT。

### 3. DB 可达环境下的 server e2e

**Test:** 在可访问 `DATABASE_URL` 的环境中运行 `pnpm --filter @trip-map/server test -- test/records-sync.e2e-spec.ts test/records-travel.e2e-spec.ts`。  
**Expected:** multi-session create/delete/bootstrap 语义通过真实数据库回归。  
**Why human:** 当前验证环境无法连接 `aws-1-ap-southeast-1.pooler.supabase.com:5432`，这属于环境限制而非已证实的代码回归。

### Gaps Summary

没有发现新的代码缺口。`25-UAT.md` 中记录的 overlap blocker 根因是 foreground refresh 用 stale snapshot 覆盖 in-flight `illuminate()`，而当前代码已经通过以下组合关闭该 blocker：

- `auth-session.refreshAuthenticatedSnapshot()` 对 same-user 改走 `applyAuthoritativeTravelRecords()`，不再整表清空 pending 状态。
- `map-points.applyAuthoritativeTravelRecords()` 会按 `placeId` 保留 pending mutation 的局部真值。
- `map-points.illuminate()` 成功后改为按 `placeId` upsert authoritative record，避免 optimistic row 被并发 refresh 删除后写不回来。
- `auth-session.spec.ts`、`map-points.spec.ts`、`App.spec.ts` 已补上 overlap / concurrent / foreground refresh 回归并在当前环境通过。

四份 plan summary 与当前代码/测试基本一致；真正不一致的是旧版 `25-VERIFICATION.md`，它早于 gap closure，且未保留人工/环境复核项，因此本报告予以覆盖。

---

_Verified: 2026-04-15T07:16:18Z_  
_Verifier: Codex (gsd-verifier)_
