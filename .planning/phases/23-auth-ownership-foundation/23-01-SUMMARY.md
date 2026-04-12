---
phase: 23-auth-ownership-foundation
plan: 01
subsystem: database
tags: [auth, prisma, contracts, postgres, ownership]
requires:
  - phase: 22
    provides: Tailwind-based shell and existing canonical records/contracts baseline
provides:
  - Shared auth/register/login/bootstrap contracts in `@trip-map/contracts`
  - Prisma `User`, `AuthSession`, and `UserTravelRecord` ownership schema
  - Committed SQL migration for auth ownership foundation
affects: [23-02, 23-03, 23-04, 23-06]
tech-stack:
  added: []
  patterns: [contracts-first auth DTOs, prisma ownership via composite unique key]
key-files:
  created:
    - packages/contracts/src/auth.ts
    - packages/contracts/src/bootstrap.ts
    - apps/server/prisma/migrations/20260412000000_add_auth_and_user_travel_record/migration.sql
  modified:
    - packages/contracts/src/index.ts
    - apps/server/prisma/schema.prisma
key-decisions:
  - "Legacy TravelRecord 和 SmokeRecord 保持隔离，账号归属从新的 UserTravelRecord 表开始承接。"
  - "由于历史 RLS migration 会阻断 shadow database 回放，本次 migration 采用 Prisma diff + db execute + migrate resolve 落库并登记。"
patterns-established:
  - "Contracts-first auth surface: register/login/bootstrap DTOs 统一放在 @trip-map/contracts 并由 src/index.ts re-export。"
  - "Ownership storage: 通过 @@unique([userId, placeId]) 约束用户维度唯一性，而不是复用 legacy 全局 placeId 唯一键。"
requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-05, SYNC-01, SYNC-02]
duration: 12m
completed: 2026-04-12
---

# Phase 23 Plan 01: Auth Ownership Foundation Summary

**共享 auth/bootstrap contracts 与 Prisma User/AuthSession/UserTravelRecord 基座，建立后续账号化与 ownership 收口的统一接口和持久化模型**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-12T08:26:24Z
- **Completed:** 2026-04-12T08:38:29Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- 新增 `AuthUser`、注册/登录请求响应，以及 `AuthBootstrapResponse` 联合类型，统一后续前后端 auth 接口形状。
- 在 Prisma schema 中追加 `User`、`AuthSession`、`UserTravelRecord` 三个模型，并通过 `@@unique([userId, placeId])` 固化 ownership 唯一键。
- 生成并应用了可提交的 SQL migration，确保数据库已有 Phase 23 所需的账号与会话基础实体。

## Task Commits

Each task was committed atomically:

1. **Task 1: 创建 auth + bootstrap contracts 类型定义** - `280b9d2` (feat)
2. **Task 2: 扩展 Prisma schema 新增 User, AuthSession, UserTravelRecord 模型** - `f9ce52d` (feat)

## Files Created/Modified

- `packages/contracts/src/auth.ts` - 共享 `AuthUser`、注册/登录 DTO 与响应类型。
- `packages/contracts/src/bootstrap.ts` - 定义会话恢复返回的鉴权联合类型。
- `packages/contracts/src/index.ts` - 导出新的 auth/bootstrap contracts。
- `apps/server/prisma/schema.prisma` - 增加账号、会话和用户归属记录模型。
- `apps/server/prisma/migrations/20260412000000_add_auth_and_user_travel_record/migration.sql` - 提交 ownership schema 的 SQL migration 产物。

## Decisions Made

- 保持 legacy `TravelRecord` / `SmokeRecord` 不变，避免把 Phase 24 的历史数据导入语义提前混入本计划。
- `UserTravelRecord` 以 `(userId, placeId)` 作为数据库复合唯一键，允许不同账号分别保存同一 canonical place。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 绕过历史 shadow migration 失败以完成本次 Prisma migration**
- **Found during:** Task 2（扩展 Prisma schema 新增 User, AuthSession, UserTravelRecord 模型）
- **Issue:** 计划中的 `npx prisma migrate dev --name add_auth_and_user_travel_record` 因历史 migration `20260408093000_enable_rls_for_public_tables` 在 shadow database 上引用 `_prisma_migrations` 失败，无法生成新 migration。
- **Fix:** 保持历史 migration 文件不变，改用 `prisma migrate diff` 生成本次 SQL，随后执行 `prisma db execute` 应用 SQL，并用 `prisma migrate resolve --applied` 登记为已应用。
- **Files modified:** apps/server/prisma/migrations/20260412000000_add_auth_and_user_travel_record/migration.sql
- **Verification:** `npx prisma migrate status` 显示 schema up to date；`pnpm typecheck` 通过。
- **Committed in:** `f9ce52d`（part of task commit）

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** 偏差仅用于绕过既有 migration 基础设施缺陷，不改变本计划交付范围或接口设计。

## Issues Encountered

- 历史 RLS migration 在 shadow database 上不可重放，导致标准 `prisma migrate dev` 路径被阻断；已通过 diff/execute/resolve 路径完成本次落库与迁移登记。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02 可直接消费 `@trip-map/contracts` 中的 auth/register/login/bootstrap 类型，并基于 `User`/`AuthSession` 模型实现 auth module。
- Plan 03 可在 `UserTravelRecord` 上收口 current-user `/records` ownership 逻辑，不需要再改 legacy `TravelRecord` 结构。

## Self-Check: PASSED

- Verified summary file exists: `.planning/phases/23-auth-ownership-foundation/23-01-SUMMARY.md`
- Verified task commits exist: `280b9d2`, `f9ce52d`

---
*Phase: 23-auth-ownership-foundation*
*Completed: 2026-04-12*
