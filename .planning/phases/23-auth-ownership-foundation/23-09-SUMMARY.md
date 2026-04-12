---
phase: 23-auth-ownership-foundation
plan: 09
subsystem: web-auth
tags: [vue3, pinia, vitest, auth, api-client]
requires:
  - phase: 23-08
    provides: trim-first server username contract and transactional register semantics
provides:
  - endpoint-aware 401 classification for auth submit versus session expiry
  - auth-session store failure path that preserves records boundary on submit errors
  - AuthDialog username contract aligned to trim-after-submit 2..32
affects: [AUTH-01, AUTH-02, SYNC-01, auth dialog UX, current-user records boundary]
tech-stack:
  added: []
  patterns:
    - endpoint-aware ApiClientError codes
    - Pinia auth state machine that only clears on real session expiry
    - Vue dialog-level validation and error presentation before request dispatch
key-files:
  created: []
  modified:
    - apps/web/src/services/api/client.ts
    - apps/web/src/services/api/auth.ts
    - apps/web/src/stores/auth-session.ts
    - apps/web/src/stores/auth-session.spec.ts
    - apps/web/src/components/auth/AuthDialog.vue
    - apps/web/src/components/auth/AuthDialog.spec.ts
key-decisions:
  - "401 被拆成 session-unauthorized 与 auth-submit-unauthorized 两类，只有前者触发 handleUnauthorized()。"
  - "AuthDialog 在提交前统一 trim 用户名，并把输入合同收口为 `minlength=2`、`maxlength=32`。"
  - "auth submit 失败继续由 dialog 展示表单级错误，不再让 store 清空 records 边界或关闭弹层。"
requirements-completed: [AUTH-01, AUTH-02, SYNC-01]
completed: 2026-04-12
---

# Phase 23 Plan 09: Auth Submit Boundary Summary

**前端现在可以区分“登录/注册提交失败”和“真实会话失效”，错误凭据不会再把弹层关闭或清空当前 records 边界。**

## Accomplishments

- `apiFetchJson()` 新增 endpoint-aware `unauthorizedCode`，并把登录/注册 401 映射为 `auth-submit-unauthorized`。
- `auth-session` store 只在 `session-unauthorized` 时执行 `handleUnauthorized()`，auth submit 失败会原样抛回 dialog。
- `AuthDialog` 在失败时保留打开并显示表单级错误；注册用户名提交前会 `trim()`，并与服务端对齐为 `2..32`。
- 扩展 store 与 dialog specs，覆盖 auth submit 401 不清场、bootstrap 401 仍清场、失败登录不关闭弹层、用户名输入合同对齐等关键回归点。

## Verification

- `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/components/auth/AuthDialog.spec.ts` ✅
- `pnpm --filter @trip-map/web typecheck` ✅

## Decisions Made

- 没有引入第二套 fetch client，只在现有 `ApiClientError` 上扩展 401 语义，尽量保持改动集中。
- 继续让 `auth-session` store 充当唯一真源，但把“清场”限定为真正的 session expiry。
- 用户名规则只补最小必要闭环，不新增设置页、remember-me、device management 等 deferred 能力。

## Issues Encountered

- 无新增阻塞问题；定向 web tests 与 `vue-tsc` 均在本机通过。

## Self-Check

PASSED

---
*Phase: 23-auth-ownership-foundation*
*Completed: 2026-04-12*
