---
phase: 23-auth-ownership-foundation
plan: 07
subsystem: auth
tags: [nest, fastify, vitest, auth, session, guard]
requires:
  - phase: 23-06
    provides: sid session restore and auth bootstrap flow
provides:
  - sid-only SessionAuthGuard for protected routes
  - CurrentUser decorator backed by request.authUser
  - AuthModule export surface for downstream records ownership routes
affects: [23-03 records ownership, protected server routes, server test verification]
tech-stack:
  added: []
  patterns: [sid-only guard recovery, request.authUser handoff, vitest single-file forwarding]
key-files:
  created:
    - apps/server/src/modules/auth/guards/session-auth.guard.ts
    - apps/server/src/modules/auth/decorators/current-user.decorator.ts
    - apps/server/scripts/vitest-run.mjs
  modified:
    - apps/server/src/modules/auth/auth.module.ts
    - apps/server/src/modules/auth/auth.service.ts
    - apps/server/src/modules/auth/guards/session-auth.guard.spec.ts
    - apps/server/vitest.config.ts
    - apps/server/package.json
key-decisions:
  - "SessionAuthGuard 只信任 request.cookies.sid，并统一把认证结果写入 request.authUser。"
  - "AuthService 保留 bootstrap/restoreSession 语义，同时补 resolveAuthenticatedUserFromSession 供 guard 复用。"
  - "server test 脚本通过轻量 wrapper 去掉 pnpm 追加的前导 --，保证 plan 里的单文件验证命令可执行。"
patterns-established:
  - "Protected controller pattern: @UseGuards(SessionAuthGuard) + @CurrentUser() user"
  - "Auth runtime pattern: sid -> AuthService.resolveAuthenticatedUserFromSession -> request.authUser"
requirements-completed: [SYNC-01, SYNC-02]
duration: 17min
completed: 2026-04-12
---

# Phase 23 Plan 07: Current User Primitives Summary

**sid-only SessionAuthGuard、CurrentUser 装饰器与 AuthModule 导出已落地，可为后续 records ownership 路由直接提供当前用户原语**

## Performance

- **Duration:** 17 min
- **Started:** 2026-04-12T09:10:00Z
- **Completed:** 2026-04-12T09:26:51Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- 建立了 `SessionAuthGuard` 单测规格，覆盖缺失 sid、有效 sid、失效 sid 与忽略伪造 owner 线索。
- 实现了 sid-only `SessionAuthGuard` 与 `CurrentUser`，并把 guard 导出到 `AuthModule` 供后续模块复用。
- 修通了 server 单文件 Vitest 验证路径，使计划中的 `pnpm --filter @trip-map/server test -- src/modules/auth/guards/session-auth.guard.spec.ts` 可直接通过。

## Task Commits

Each task was committed atomically:

1. **Task 1: 建立 current-user guard/decorator 的单元规格** - `54d51c3` (test)
2. **Task 2: 实现 sid-only 的 SessionAuthGuard 与 CurrentUser 原语** - `346c173` (feat)

## Files Created/Modified

- `apps/server/src/modules/auth/guards/session-auth.guard.ts` - sid-only guard；缺失或无效 sid 时统一抛 `UnauthorizedException`。
- `apps/server/src/modules/auth/decorators/current-user.decorator.ts` - 从 `request.authUser` 读取当前认证用户。
- `apps/server/src/modules/auth/auth.service.ts` - 暴露 `resolveAuthenticatedUserFromSession()` 供 guard 复用。
- `apps/server/src/modules/auth/auth.module.ts` - 注册并导出 `SessionAuthGuard`。
- `apps/server/src/modules/auth/guards/session-auth.guard.spec.ts` - guard/decorator 行为规格。
- `apps/server/vitest.config.ts` - 让 server 包发现 `src/**/*.spec.ts`。
- `apps/server/package.json` - 通过 wrapper 转发单文件 test 参数。
- `apps/server/scripts/vitest-run.mjs` - 去掉 pnpm 追加的前导 `--` 后再调用 `vitest run`。

## Decisions Made

- 继续遵循 plan 的 sid-only 边界，不引入 bearer token、body/query/header owner 分支。
- `CurrentUser` 只暴露 guard 已注入的 `request.authUser`，不再创建第二套 owner DTO。
- 为了保持计划验证命令稳定，server 侧单文件测试走 wrapper 脚本，而不是改写 plan 命令格式。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 补齐 server unit spec 的 Vitest discover 范围**
- **Found during:** Task 1 (建立 current-user guard/decorator 的单元规格)
- **Issue:** `apps/server/vitest.config.ts` 只包含 `test/**/*.e2e-spec.ts`，新建的 `src/modules/auth/guards/session-auth.guard.spec.ts` 不会被执行。
- **Fix:** 将 server Vitest include 扩展为同时覆盖 `test/**/*.e2e-spec.ts` 与 `src/**/*.spec.ts`。
- **Files modified:** `apps/server/vitest.config.ts`
- **Verification:** `pnpm exec vitest run src/modules/auth/guards/session-auth.guard.spec.ts`
- **Committed in:** `54d51c3`

**2. [Rule 3 - Blocking] 修复 pnpm 单文件 test 参数无法正确传给 Vitest**
- **Found during:** Task 2 (实现 sid-only 的 SessionAuthGuard 与 CurrentUser 原语)
- **Issue:** 计划中的 `pnpm --filter @trip-map/server test -- <file>` 会把前导 `--` 原样传给 `vitest run`，导致 Vitest 忽略目标文件过滤并把所有 e2e 一起跑起，进而触发当前数据库不可达的无关失败。
- **Fix:** 新增 `apps/server/scripts/vitest-run.mjs`，在调用 `vitest run` 前去掉 pnpm 转发的前导 `--`；同时把 `apps/server/package.json` 的 `test` 脚本改为使用该 wrapper。
- **Files modified:** `apps/server/package.json`, `apps/server/scripts/vitest-run.mjs`
- **Verification:** `pnpm --filter @trip-map/server test -- src/modules/auth/guards/session-auth.guard.spec.ts`
- **Committed in:** `346c173`

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** 两个偏差都属于完成本 plan 验证闭环所必需的测试基础修复，没有扩大功能范围。

## Issues Encountered

- 并发 `git add` 触发过一次 `.git/index.lock` 竞争；确认 lock 已消失后改为串行 stage，未影响提交内容。
- 使用 `pnpm exec tsx` 做临时运行时探查时遇到 sandbox 对本地 IPC pipe 的限制，因此转而通过直接读包 `package.json` 的方式解析 Vitest bin。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `RecordsModule` 后续可以直接采用 `@UseGuards(SessionAuthGuard)` 与 `@CurrentUser()` 收口 current-user ownership。
- 当前仓库的 server 单文件测试入口已稳定，可继续为 23-03/23-04 等计划补 src 级单测。

## Self-Check

PASSED

---
*Phase: 23-auth-ownership-foundation*
*Completed: 2026-04-12*
