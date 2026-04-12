---
phase: 23-auth-ownership-foundation
plan: 06
subsystem: auth
tags: [nest, prisma, sid-cookie, vitest, bootstrap]
requires:
  - phase: 23-02
    provides: auth module、sid cookie runtime、register/login/logout session lifecycle
provides:
  - /auth/bootstrap 恢复入口
  - sid -> current user -> records 快照恢复服务
  - bootstrap 恢复与失效 cookie 回收 e2e 规格
affects: [23-04, 23-05, 23-07, auth-session, bootstrap]
tech-stack:
  added: []
  patterns: [sid bootstrap recovery, service-level session restore, invalid cookie cleanup]
key-files:
  created: [apps/server/test/auth-bootstrap.e2e-spec.ts]
  modified:
    [
      apps/server/src/modules/auth/auth.controller.ts,
      apps/server/src/modules/auth/auth.service.ts,
      apps/server/src/modules/auth/auth.repository.ts,
    ]
key-decisions:
  - "bootstrap 对无效或过期 sid 统一返回 authenticated: false，并由 controller 清理 sid cookie，而不是抛 401/500。"
  - "将 sid -> current user 的恢复逻辑抽到 AuthService.restoreSession，供后续 guard/current-user 原语直接复用。"
patterns-established:
  - "Pattern 1: bootstrap 只从 AuthSession + UserTravelRecord 恢复当前账号态，不回退到匿名全局 TravelRecord。"
  - "Pattern 2: controller 负责 cookie 写入/清理，service 负责 session 恢复与 records 快照装配。"
requirements-completed: [AUTH-03]
duration: 5min
completed: 2026-04-12
---

# Phase 23 Plan 06: Auth Bootstrap Recovery Summary

**基于 sid cookie 的 `/auth/bootstrap` 恢复入口已返回当前账号与用户 records 快照，并对失效 session 统一做安全回落和 cookie 回收**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-12T09:00:55Z
- **Completed:** 2026-04-12T09:05:28Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- 新增 `auth-bootstrap.e2e-spec.ts`，覆盖无 `sid`、有效 `sid`、失效/不存在 `sid`、多设备并行 session 四类恢复行为。
- 在 auth controller/service/repository 中补齐 `/auth/bootstrap`、`restoreSession()` 和按当前用户读取 `UserTravelRecord` 快照的链路。
- 保持 23-02 已落地的 cookie runtime 与 canonical places 暴露边界不变，没有提前引入 guard/decorator 或 `/records` ownership 改造。

## Task Commits

Each task was committed atomically:

1. **Task 1: 建立 bootstrap 恢复与 cookie 回收的 server e2e 规格** - `f68bd64` (test)
2. **Task 2: 接入 cookie runtime 与 `/auth/bootstrap` 恢复入口** - `ab55bb7` (feat)

## Files Created/Modified

- `apps/server/test/auth-bootstrap.e2e-spec.ts` - 定义 AUTH-03 的 bootstrap 恢复、cookie 清理和多设备 session e2e 验收面。
- `apps/server/src/modules/auth/auth.controller.ts` - 新增 `GET /auth/bootstrap` handler，并在 bootstrap/logout 上统一清理失效 `sid` cookie。
- `apps/server/src/modules/auth/auth.service.ts` - 新增 `restoreSession()` 与 `bootstrap()`，将 sid 恢复结果映射为 contracts `AuthBootstrapResponse`。
- `apps/server/src/modules/auth/auth.repository.ts` - 新增按 `sid` 读取有效 session+user 以及读取当前用户 `UserTravelRecord` 快照的方法。

## Decisions Made

- bootstrap 恢复链路只信任 `AuthSession` 表中未过期的 `sid`，不存在或过期时统一删除当前 session id 并回落到 `authenticated: false`。
- `records` 快照只来源于 `UserTravelRecord`，明确与 legacy `TravelRecord` 全局表隔离，避免 bootstrap 泄露匿名全局数据。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `pnpm --filter @trip-map/server test -- test/auth-bootstrap.e2e-spec.ts` 在当前仓库会误触发整个 `@trip-map/server` 测试集，而不是只跑目标 spec。
- 当测试数据库可连通时，该命令会被一个与本 plan 无关的既有失败 `test/health.e2e-spec.ts` 阻塞：断言预期 `database: 'down'`，实际返回 `database: 'up'`。
- 为完成当前 plan 验证，改用更精确的 `pnpm --filter @trip-map/server exec vitest run test/auth-bootstrap.e2e-spec.ts`，该命令已通过；相关 out-of-scope 问题记录在 `deferred-items.md`。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 23-04 与 23-05 可直接复用 `/auth/bootstrap` 作为 web 首屏恢复的单一入口。
- 23-07 可直接复用 `AuthService.restoreSession()` 收口 guard / `CurrentUser` 的 sid 恢复逻辑。
- 当前 package-level verify 命令存在既有过滤/环境差异问题，后续 phase 如继续依赖 `pnpm --filter @trip-map/server test -- <spec>`，需要先处理 `deferred-items.md` 中记录的问题。

## Self-Check: PASSED

- Found summary file: `.planning/phases/23-auth-ownership-foundation/23-06-SUMMARY.md`
- Found task commit: `f68bd64`
- Found task commit: `ab55bb7`

---
*Phase: 23-auth-ownership-foundation*
*Completed: 2026-04-12*
