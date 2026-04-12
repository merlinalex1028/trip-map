---
phase: 23-auth-ownership-foundation
plan: 02
subsystem: auth
tags: [auth, nestjs, fastify, prisma, cookie, argon2, e2e]
requires:
  - phase: 23
    provides: Plan 01 提供的 Auth contracts 与 Prisma User/AuthSession 基座
provides:
  - `/auth/register`、`/auth/login`、`/auth/logout` 服务端实现
  - `sid` HttpOnly cookie 的当前设备会话生命周期
  - auth session e2e 规格与真实启动路径接线
affects: [23-06, 23-07, 24]
tech-stack:
  added: [@fastify/cookie, argon2]
  patterns: [Nest auth module layering, sid cookie sessions, current-device logout]
key-files:
  created:
    - apps/server/src/modules/auth/auth.module.ts
    - apps/server/src/modules/auth/auth.controller.ts
    - apps/server/src/modules/auth/auth.service.ts
    - apps/server/src/modules/auth/auth.repository.ts
    - apps/server/src/modules/auth/dto/register.dto.ts
    - apps/server/src/modules/auth/dto/login.dto.ts
  modified:
    - apps/server/package.json
    - apps/server/src/main.ts
    - apps/server/src/app.module.ts
    - apps/server/test/auth-session.e2e-spec.ts
    - pnpm-lock.yaml
key-decisions:
  - "sid 直接使用 AuthSession.id，通过 HttpOnly + SameSite=Lax cookie 绑定当前设备会话。"
  - "注册与登录响应统一只返回 contracts AuthUser 摘要，密码哈希仅保留在数据库。"
patterns-established:
  - "Auth module follows controller -> service -> repository -> prisma layering for future bootstrap/guard expansion."
  - "Current-device logout deletes only the cookie-carried session row and clears the sid cookie without touching sibling sessions."
requirements-completed: [AUTH-01, AUTH-02]
duration: 6m
completed: 2026-04-12
---

# Phase 23 Plan 02: Auth Ownership Foundation Summary

**邮箱密码注册/登录/当前设备退出已落在 Nest auth module，并通过 sid cookie 与 AuthSession 表形成真实多设备会话闭环**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-12T08:45:42Z
- **Completed:** 2026-04-12T08:52:00Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- 新建 `auth-session.e2e-spec.ts`，覆盖注册、登录、当前设备退出、多设备会话保留和敏感字段不泄露。
- 新增 `AuthModule`、controller/service/repository/DTO，并在真实应用启动路径上接通 `/auth/register`、`/auth/login`、`/auth/logout`。
- 在 `createApp()` 中注册 Fastify cookie runtime，使用 `argon2` 处理密码哈希与校验，完成 sid cookie 会话创建与清理。

## Task Commits

Each task was committed atomically:

1. **Task 1: 建立 register/login/logout 的 server e2e 规格** - `6efa8f9` (test)
2. **Task 2: 实现邮箱密码 auth module 主体与当前设备 session 生命周期** - `d80e1de` (feat)

## Files Created/Modified

- `apps/server/test/auth-session.e2e-spec.ts` - auth 当前设备会话与多设备策略的 e2e 断言基线。
- `apps/server/src/modules/auth/auth.controller.ts` - 暴露 register/login/logout 三个 handler，并设置/清除 `sid` cookie。
- `apps/server/src/modules/auth/auth.service.ts` - 处理邮箱归一化、`argon2.hash/verify`、用户创建与 session 生命周期。
- `apps/server/src/modules/auth/auth.repository.ts` - 封装 `user` / `authSession` Prisma 读写。
- `apps/server/src/modules/auth/dto/register.dto.ts` - 注册输入校验，锁定用户名/邮箱/密码字段集。
- `apps/server/src/modules/auth/dto/login.dto.ts` - 登录输入校验，仅允许邮箱与密码。
- `apps/server/src/modules/auth/auth.module.ts` - 收口 auth controller/service/repository 依赖。
- `apps/server/src/main.ts` - 注册 `@fastify/cookie` 运行时插件。
- `apps/server/src/app.module.ts` - 把 `AuthModule` 接入应用模块图。
- `apps/server/package.json` - 增加 `@fastify/cookie` 与 `argon2` 依赖。
- `pnpm-lock.yaml` - 记录新的 server 依赖锁文件状态。

## Decisions Made

- 使用 `AuthSession.id` 作为 `sid` cookie 值，减少本 plan 的存储面与 blast radius，后续 bootstrap/guard 直接围绕该 session 主键扩展。
- 登录与注册都立即创建当前设备 session，不采用“新登录挤掉旧设备”的单会话策略。
- DTO 将用户名长度上限收敛到 `32`，兼顾顶栏 chip 展示稳定性与测试/真实输入可用性。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 改用定向 Vitest 命令完成 auth spec 验证**
- **Found during:** Task 2（实现邮箱密码 auth module 主体与当前设备 session 生命周期）
- **Issue:** 计划中的 `pnpm --filter @trip-map/server test -- test/auth-session.e2e-spec.ts` 在当前 `pnpm + vitest` 配置下会连带执行其他 suite，并触发无关的既有 `test/health.e2e-spec.ts` 断言失败（期望 `database: down`，实际为 `up`）。
- **Fix:** 保留原脚本不改，使用等价的定向命令 `pnpm --filter @trip-map/server exec vitest run test/auth-session.e2e-spec.ts` 验证当前 task 目标 spec。
- **Files modified:** None
- **Verification:** `pnpm --filter @trip-map/server exec vitest run test/auth-session.e2e-spec.ts` 通过；`pnpm --filter @trip-map/server typecheck` 通过。
- **Committed in:** `d80e1de`（part of task commit）

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** 仅调整验证入口以绕开无关既有测试噪声，不改变本计划交付范围与实现结构。

## Issues Encountered

- sandbox 内直接跑 e2e 无法连接当前配置的远端 PostgreSQL，需要提权后完成数据库相关验证。
- `pnpm add` 时 build scripts 被 pnpm 安全策略提示为 ignored，但 `argon2` 与 Prisma 运行时在实际 e2e 中可正常工作，无需额外补救。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 06 可直接在现有 `AuthModule` 上扩展 `/auth/bootstrap` 与 session 恢复逻辑，不需要再改 cookie runtime 或应用模块接线。
- Plan 07 可在现有 repository/service 基础上补 `CurrentUser` guard 与 decorator，继续沿用 sid-only 的 current-device 边界。

## Self-Check: PASSED

- Verified summary file exists: `.planning/phases/23-auth-ownership-foundation/23-02-SUMMARY.md`
- Verified task commits exist: `6efa8f9`, `d80e1de`

---
*Phase: 23-auth-ownership-foundation*
*Completed: 2026-04-12*
