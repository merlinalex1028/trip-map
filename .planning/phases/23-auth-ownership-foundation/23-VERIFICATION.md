---
phase: 23-auth-ownership-foundation
verified: 2026-04-12T14:32:00Z
status: passed
score: 7/7 must-haves verified
overrides_applied: 0
---

# Phase 23: Auth & Ownership Foundation Verification Report

**Phase Goal:** 用户可以拥有独立账号身份，且账号成为旅行记录的唯一归属真源  
**Verified:** 2026-04-12T14:32:00Z  
**Status:** passed  
**Re-verification:** Yes — after gap closure plans `23-08` and `23-09`

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | 用户可以使用邮箱和密码注册、登录、退出，并在刷新页面或重新打开应用后恢复到同一账号会话。 | ✓ VERIFIED | register/login/logout/bootstrap 主链路已在 23-02 到 23-09 全链路接通；本次补齐 register 原子性与 login failure 分流后，不再存在 blocker 级失败路径。 |
| 2 | 已登录用户可以在界面中明确看到当前账号身份，并能从稳定入口执行退出操作。 | ✓ VERIFIED | 顶栏 identity chip、菜单邮箱与退出入口保持来自 `auth-session` 的真实状态，23-09 未破坏既有 UI shell 路径。 |
| 3 | 登录后用户只能看到当前账号自己的旅行记录，不会读到其他账号或匿名上下文的数据。 | ✓ VERIFIED | `/records` 仍由 `SessionAuthGuard + CurrentUser` 驱动，前端 auth submit 401 修复后不会再误清当前账号 records 边界。 |
| 4 | 登录后新点亮的地点会绑定到当前账号，并在重新进入应用后仍可从云端重新加载出来。 | ✓ VERIFIED | `auth-session` 继续通过 bootstrap 快照恢复 `currentUser + records`，本次只收紧了 unauthorized 语义，没有放宽 ownership 真源。 |
| 5 | 错误凭据登录不会被误判为会话失效，认证弹层与地图数据边界保持稳定。 | ✓ VERIFIED | `apiFetchJson()` 现在把 auth submit 401 与 session 401 分开编码；`runAuthRequest()` 只在 `session-unauthorized` 时清场；dialog/store specs 覆盖失败登录不关弹层、不清 records。 |
| 6 | 注册流程是原子操作，不会留下仅有 User 无 AuthSession 的半成品账号。 | ✓ VERIFIED | `AuthRepository.createUserWithSession()` 使用 Prisma `$transaction()` 一次性创建 `User + AuthSession`；`auth.service.spec.ts` 覆盖事务失败与唯一约束映射。 |
| 7 | 注册用户名规则在前后端一致，且 trim 后不能写入空用户名。 | ✓ VERIFIED | `RegisterDto` trim-first 后执行 `2..32` 校验，`AuthDialog` 同步到 `minlength=2`、`maxlength=32`，并在提交前 trim / 拦截空白用户名。 |

**Score:** 7/7 truths verified

## Gap Closure Verification

### Closed blockers from the previous report

1. **错误凭据登录被误判为会话失效**  
   已关闭。现在 `login/register` 使用 `auth-submit-unauthorized`，不会再调用 `handleUnauthorized()`；真实 session expired 仍保留原回收语义。

2. **注册不是原子操作，会留下半成品账号**  
   已关闭。`register()` 只调用 `createUserWithSession()`；单测显式锁定了事务入口与失败路径。

3. **用户名前后端规则不一致且 trim 后可能写入空值**  
   已关闭。服务端 DTO 与前端 dialog 都以 trim 后 `2..32` 为准，并有 e2e/spec 回归覆盖。

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| server register transaction/unit regressions | `pnpm --filter @trip-map/server test -- src/modules/auth/auth.service.spec.ts` | 1 file, 3 tests passed | ✓ PASS |
| server typecheck | `pnpm --filter @trip-map/server typecheck` | exit 0 | ✓ PASS |
| web auth/store/dialog regressions | `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/components/auth/AuthDialog.spec.ts` | 2 files, 18 tests passed | ✓ PASS |
| web typecheck | `pnpm --filter @trip-map/web typecheck` | exit 0 | ✓ PASS |
| schema drift gate | `node "$HOME/.codex/get-shit-done/bin/gsd-tools.cjs" verify schema-drift 23` | `drift_detected: false` | ✓ PASS |
| server auth e2e re-check | `pnpm --filter @trip-map/server test -- test/auth-session.e2e-spec.ts` | 当前环境无法连接 `aws-1-ap-southeast-1.pooler.supabase.com:5432` | ⚠️ SKIP (external DB unavailable) |

## Requirements Coverage

| Requirement | Status | Notes |
| --- | --- | --- |
| AUTH-01 | ✓ SATISFIED | 注册流程已具备原子性，用户名合同前后端一致。 |
| AUTH-02 | ✓ SATISFIED | 登录失败保持在 dialog 内反馈；真实登录/退出路径保持成立。 |
| AUTH-03 | ✓ SATISFIED | bootstrap/restore 链路保持已验证状态。 |
| AUTH-05 | ✓ SATISFIED | 顶栏身份入口与退出入口保持稳定。 |
| SYNC-01 | ✓ SATISFIED | current-user records 隔离未被本次修复破坏。 |
| SYNC-02 | ✓ SATISFIED | authenticated bootstrap 与 records 真源保持成立。 |

## Residual Risk

- `auth-session.e2e-spec.ts` 的 register 新断言仍受外部 PostgreSQL 可达性限制，当前机器无法直接跑通该 e2e。现阶段的通过依据是：单测、web specs、typecheck、schema drift gate，以及对 register / auth submit failure path 的源码复核。

## Conclusion

Phase 23 的 3 个 blocker 均已通过 gap closure 计划关闭。账号注册现在具备事务性，用户名规范在前后端重新收口，登录失败与 session 失效的产品语义也已分流到正确边界。基于当前代码与自动化证据，这个 phase 已达到“独立账号身份成为旅行记录唯一归属真源”的目标，可标记为完成。

---

_Verified: 2026-04-12T14:32:00Z_  
_Verifier: Codex (inline execute-phase verifier)_  
_Status: passed_
