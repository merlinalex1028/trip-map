---
phase: 23
slug: auth-ownership-foundation
status: revised
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-11
updated: 2026-04-12
---

# Phase 23 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `apps/web/vitest.config.ts`, `apps/server/vitest.config.ts`, root `package.json` turbo scripts |
| **Nearest-neighbor commands** | 单 spec、`test -f`、`rg` 级检查，优先在 5-30 秒内返回 |
| **Full suite command** | `pnpm typecheck && pnpm test` |
| **Estimated full runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** 运行下表对应的最近邻自动验证命令
- **After every plan:** 运行该 plan `<verification>` 中的包级测试或 typecheck
- **After every wave:** 运行 `pnpm typecheck && pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Runtime Target | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|----------------|--------|
| 23-01-01 | 01 | 1 | AUTH-01, AUTH-03 | T-23-01 | contracts 只暴露安全 DTO，不包含密码字段 | file/build | `cd /Users/huangjingping/i/trip-map && test -f packages/contracts/src/auth.ts && test -f packages/contracts/src/bootstrap.ts && rg -n "AuthUser|RegisterRequest|LoginRequest|AuthBootstrapResponse" packages/contracts/src/auth.ts packages/contracts/src/bootstrap.ts packages/contracts/src/index.ts` | <=10s | ⬜ pending |
| 23-01-02 | 01 | 1 | SYNC-01, SYNC-02 | T-23-02 | ownership 基座通过复合唯一键与 migration 产物可复现创建 | file/schema | `cd /Users/huangjingping/i/trip-map && test -n "$(find apps/server/prisma/migrations -path '*_add_auth_and_user_travel_record/migration.sql' -print -quit)" && rg -n "model User|model AuthSession|model UserTravelRecord|@@unique\\(\\[userId, placeId\\]\\)" apps/server/prisma/schema.prisma` | <=10s | ⬜ pending |
| 23-02-01 | 02 | 2 | AUTH-01, AUTH-02 | T-23-04 | register/login/logout spec 覆盖当前设备退出与多设备保留 | e2e scaffold | `cd /Users/huangjingping/i/trip-map && test -f apps/server/test/auth-session.e2e-spec.ts && rg -n "POST /auth/register|POST /auth/login|POST /auth/logout|Set-Cookie: sid" apps/server/test/auth-session.e2e-spec.ts` | <=10s | ⬜ pending |
| 23-02-02 | 02 | 2 | AUTH-01, AUTH-02 | T-23-03 | auth core 在真实应用启动路径上返回当前账号摘要，并按当前 cookie 删除 session | targeted test | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/server test -- test/auth-session.e2e-spec.ts` | <=30s | ⬜ pending |
| 23-06-01 | 06 | 3 | AUTH-03 | T-23-07 | bootstrap spec 覆盖无效 session 回落与 cookie 清理 | e2e scaffold | `cd /Users/huangjingping/i/trip-map && test -f apps/server/test/auth-bootstrap.e2e-spec.ts && rg -n "GET /auth/bootstrap|authenticated: false|authenticated: true|clear.*cookie|multiple session" apps/server/test/auth-bootstrap.e2e-spec.ts` | <=10s | ⬜ pending |
| 23-06-02 | 06 | 3 | AUTH-03 | T-23-06 | bootstrap 只信任服务端 session 并返回当前用户快照 | targeted test | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/server test -- test/auth-bootstrap.e2e-spec.ts` | <=30s | ⬜ pending |
| 23-07-01 | 07 | 4 | SYNC-01, SYNC-02 | T-23-09 | guard spec 覆盖 sid-only 恢复与忽略伪造 owner | unit scaffold | `cd /Users/huangjingping/i/trip-map && test -f apps/server/src/modules/auth/guards/session-auth.guard.spec.ts && rg -n "UnauthorizedException|cookies\\.sid|authUser|userId|owner" apps/server/src/modules/auth/guards/session-auth.guard.spec.ts` | <=10s | ⬜ pending |
| 23-07-02 | 07 | 4 | SYNC-01, SYNC-02 | T-23-10 | `SessionAuthGuard + CurrentUser` 只从 sid 派生 current-user | targeted test | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/server test -- src/modules/auth/guards/session-auth.guard.spec.ts` | <=30s | ⬜ pending |
| 23-03-01 | 03 | 5 | SYNC-01, SYNC-02 | T-23-06 | ownership spec 覆盖匿名 401、跨账号隔离、同地点双账号成功 | e2e scaffold | `cd /Users/huangjingping/i/trip-map && test -f apps/server/test/records-ownership.e2e-spec.ts && rg -n "401|userId|same placeId|different user" apps/server/test/records-ownership.e2e-spec.ts` | <=10s | ⬜ pending |
| 23-03-02 | 03 | 5 | SYNC-01, SYNC-02 | T-23-07 | `/records` 只从 session 推导 owner，并按 `(userId, placeId)` upsert | targeted test | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/server test -- test/records-travel.e2e-spec.ts test/records-ownership.e2e-spec.ts` | <=30s | ⬜ pending |
| 23-04-01 | 04 | 6 | AUTH-03, SYNC-02 | T-23-09 | `restoreSession()` 首屏安全且不会重复并发恢复 | store scaffold | `cd /Users/huangjingping/i/trip-map && test -f apps/web/src/stores/auth-session.spec.ts && rg -n "restoreSession|in-flight|called once|single bootstrap|logout" apps/web/src/stores/auth-session.spec.ts && rg -n "replaceTravelRecords|resetTravelRecordsForSessionBoundary" apps/web/src/stores/map-points.spec.ts` | <=10s | ⬜ pending |
| 23-04-02 | 04 | 6 | AUTH-03, SYNC-02 | T-23-10 | auth-session store 与 map records 快照在 bootstrap/logout/401 上同步切换 | targeted test | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/stores/map-points.spec.ts` | <=30s | ⬜ pending |
| 23-05-01 | 05 | 7 | AUTH-03, AUTH-05 | T-23-14 | App 首挂时真实触发 `restoreSession()`，overlay 仅覆盖 map shell | App/component scaffold | `cd /Users/huangjingping/i/trip-map && test -f apps/web/src/components/auth/AuthDialog.spec.ts && rg -n "restoreSession|called once|登录 / 注册|退出登录|data-region=\"map-shell\"" apps/web/src/App.spec.ts && rg -n "用户名|邮箱|密码|tab" apps/web/src/components/auth/AuthDialog.spec.ts` | <=10s | ⬜ pending |
| 23-05-02 | 05 | 7 | AUTH-05 | T-23-12 | 顶栏身份入口、统一弹层与 restoring UI 在真实 App shell 闭环 | targeted test | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/web test -- src/App.spec.ts src/components/auth/AuthDialog.spec.ts` | <=30s | ⬜ pending |
| 23-08-01 | 08 | 8 | AUTH-01, AUTH-02 | T-23-15 | 注册事务失败路径与 trim-first 用户名规则先由 spec/e2e 锁定 | unit/e2e scaffold | `cd /Users/huangjingping/i/trip-map && test -f apps/server/src/modules/auth/auth.service.spec.ts && rg -n "createUserWithSession|ConflictException|session create failure|trim" apps/server/src/modules/auth/auth.service.spec.ts apps/server/test/auth-session.e2e-spec.ts` | <=10s | ⬜ pending |
| 23-08-02 | 08 | 8 | AUTH-01, AUTH-02 | T-23-16, T-23-17 | `POST /auth/register` 经过单事务 user+session 创建，并拒绝 trim 后空白/超长用户名 | targeted test | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/server test -- src/modules/auth/auth.service.spec.ts test/auth-session.e2e-spec.ts && pnpm --filter @trip-map/server typecheck` | <=30s | ⬜ pending |
| 23-09-01 | 09 | 9 | AUTH-01, AUTH-02, SYNC-01 | T-23-18 | auth submit 401 与 session expired 401 在 store/dialog 层被明确分流 | store/component scaffold | `cd /Users/huangjingping/i/trip-map && rg -n "auth-submit|handleUnauthorized|travelRecords|401" apps/web/src/stores/auth-session.spec.ts && rg -n "closeAuthModal|maxlength|32|登录失败|用户名" apps/web/src/components/auth/AuthDialog.spec.ts` | <=10s | ⬜ pending |
| 23-09-02 | 09 | 9 | AUTH-01, AUTH-02, SYNC-01 | T-23-19, T-23-20 | 错误凭据不会清空 records 边界，用户名输入规则与后端一致 | targeted test | `cd /Users/huangjingping/i/trip-map && pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/components/auth/AuthDialog.spec.ts && pnpm --filter @trip-map/web typecheck` | <=30s | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Status

无独立 Wave 0 计划。当前 23-01 至 23-06 已在各自任务内创建缺失 spec/fixture，并为每个任务提供最近邻自动验证命令，因此 `wave_0_complete: true`。

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 顶栏账号 chip、下拉菜单和地图舞台恢复蒙层的整体节奏是否符合锁定 UX | AUTH-05, AUTH-03 | 需要人工确认交互动线与视觉节奏，不适合完全靠断言替代 | 启动应用，刷新页面确认 restoring 蒙层只遮罩地图主舞台；未登录时顶栏右侧只出现 `登录 / 注册`；登录后检查用户名 chip 与下拉内容；退出后确认回到未登录视角并有明确提示 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or an equivalent nearest-neighbor command
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 references fully resolved inside the active plan set
- [x] No watch-mode flags
- [x] Feedback latency <= 30 seconds for nearest-neighbor checks
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** revised for checker iteration 2
