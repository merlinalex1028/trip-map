---
phase: 23-auth-ownership-foundation
plan: 04
subsystem: auth
tags: [vue, pinia, auth, records, vitest, cookie-session]
requires:
  - phase: 23-03
    provides: current-user records API and ownership-isolated TravelRecord snapshots
  - phase: 23-06
    provides: auth bootstrap endpoint and sid session restore semantics
provides:
  - auth-session pinia store with restoring/anonymous/authenticated lifecycle
  - cookie-backed auth and records API wrappers with normalized unauthorized errors
  - explicit map record snapshot replace/reset primitives for session boundaries
affects: [23-05 app restore wiring, auth modal UI, unauthorized recovery UX]
tech-stack:
  added: []
  patterns: [auth-bound store lifecycle, normalized api client error handling, session-boundary records reset]
key-files:
  created:
    - apps/web/src/services/api/auth.ts
    - apps/web/src/stores/auth-session.ts
    - apps/web/src/stores/auth-session.spec.ts
  modified:
    - apps/web/src/services/api/client.ts
    - apps/web/src/services/api/records.ts
    - apps/web/src/stores/map-points.ts
    - apps/web/src/stores/map-points.spec.ts
key-decisions:
  - "注册与登录成功后统一再走一次 `fetchAuthBootstrap()`，用服务端 bootstrap 快照同时刷新 currentUser 与 records，而不是信任 auth 响应本身。"
  - "账号切换、logout 与 unauthorized 回收都先调用 `resetTravelRecordsForSessionBoundary()`，再决定是否注入新 records，防止旧账号地图数据泄露到新会话。"
patterns-established:
  - "Auth session pattern: `auth-session` store 作为 web 首屏恢复、auth submit 和 unauthorized 回收的唯一状态机"
  - "Records snapshot pattern: `map-points` 通过 `replaceTravelRecords()` / `resetTravelRecordsForSessionBoundary()` 响应会话边界"
requirements-completed: [AUTH-03, SYNC-02]
duration: 16min
completed: 2026-04-12
---

# Phase 23 Plan 04: Auth Session Lifecycle Summary

**Pinia `auth-session` store 现已统一驱动 sid cookie 会话恢复、登录注册后的 bootstrap 重水合，以及地图 records 的账号边界清场与快照替换**

## Performance

- **Duration:** 16 min
- **Started:** 2026-04-12T10:14:31Z
- **Completed:** 2026-04-12T10:30:12Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- 新增 `auth-session` setup store，建立 `restoring / anonymous / authenticated` 三态，并把 `restoreSession`、`login`、`register`、`logout`、`handleUnauthorized` 收口到同一状态机。
- 新增 `auth.ts` 与统一 `apiFetchJson` / `ApiClientError` 层，让 auth/records 请求固定携带 `credentials: 'include'`，并把 `401` 归一成可被 store 识别的 unauthorized 错误。
- 为 `map-points` 增加 `replaceTravelRecords()` 与 `resetTravelRecordsForSessionBoundary()`，让地图记录快照能在 bootstrap、logout 和 unauthorized 回收时按账号边界安全切换。

## Task Commits

Each task was committed atomically:

1. **Task 1: 补齐 auth-session 与 records 切换的 web store 规格** - `227bd17` (test)
2. **Task 2: 实现 web auth-session store 与 authenticated records 生命周期** - `f8a87e2` (feat)

## Files Created/Modified

- `apps/web/src/services/api/client.ts` - 新增统一 `apiFetchJson`、`ApiClientError` 和 unauthorized 判定，默认附带 cookie 凭证。
- `apps/web/src/services/api/auth.ts` - 封装 `fetchAuthBootstrap`、`registerWithPassword`、`loginWithPassword`、`logoutCurrentSession`。
- `apps/web/src/services/api/records.ts` - 切到统一 client，去掉 create `409`/delete `404` 的私吞分支，保留服务端权威响应。
- `apps/web/src/stores/auth-session.ts` - 新增 auth session setup store，统一驱动恢复、提交、退出和 401 回收。
- `apps/web/src/stores/auth-session.spec.ts` - 覆盖恢复、匿名回落、恢复失败提示、登录/注册重水合、退出与 unauthorized 清场。
- `apps/web/src/stores/map-points.ts` - 新增 session-boundary records helper，并把 unauthorized 记录请求接回 `auth-session`。
- `apps/web/src/stores/map-points.spec.ts` - 增加 records 替换/清场断言，并收紧点亮成功为服务端权威记录覆盖 optimistic 记录。

## Decisions Made

- auth 成功后的客户端真源固定为 `/auth/bootstrap`，避免 register/login 响应和 records 快照之间出现两套状态来源。
- records store 不再把“是否直接拉过 `/records`”当作唯一 ready 语义，而是显式支持 auth-bound snapshot replace/reset。
- 对 `401` 的识别统一落到 API client 层，业务 store 只处理 unauthorized 语义而不自己解析状态码。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 调整 `restoreSession()` 的并发测试从 Promise 身份相等改为单次 bootstrap 语义**
- **Found during:** Task 2 (实现 web auth-session store 与 authenticated records 生命周期)
- **Issue:** Pinia action 代理不会稳定暴露同一 Promise 对象引用，导致“同一 in-flight promise”测试用 `toBe()` 误报失败。
- **Fix:** 将断言收口到真正的产品语义：重复调用只触发一次 bootstrap，并等待两个调用都完成。
- **Files modified:** apps/web/src/stores/auth-session.spec.ts
- **Verification:** `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/stores/map-points.spec.ts`
- **Committed in:** f8a87e2

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** 偏差仅修正测试对 Pinia action 返回值的错误假设，不影响计划目标与功能范围。

## Issues Encountered

- 并行 `git add` 会在主工作树中竞争 `.git/index.lock`；执行中改为顺序暂存后恢复正常提交。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 23-05 可以直接在 `App.vue` 里接入单一 `restoreSession()` 首挂入口，并消费 `auth-session` 的 restoring/authenticated/anonymous 三态。
- 认证弹层与顶栏账号入口不需要再自行管理 records 同步，只需调用 store action 并渲染 `isSubmitting` / `isAuthModalOpen` / `authMode`。

## Self-Check

PASSED

---
*Phase: 23-auth-ownership-foundation*
*Completed: 2026-04-12*
