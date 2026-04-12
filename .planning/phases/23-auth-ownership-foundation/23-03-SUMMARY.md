---
phase: 23-auth-ownership-foundation
plan: 03
subsystem: api
tags: [nest, prisma, auth, records, ownership, vitest]
requires:
  - phase: 23-07
    provides: SessionAuthGuard and CurrentUser primitives for protected current-user routes
provides:
  - session-protected current-user /records CRUD
  - userTravelRecord-backed ownership reads, upserts, and deletes
  - records ownership e2e coverage for anonymous rejection and cross-account isolation
affects: [23-04 auth-bound records bootstrap, protected server records flows, sync ownership verification]
tech-stack:
  added: []
  patterns: [current-user records controller pattern, prisma compound-key upsert, user-scoped records repository]
key-files:
  created:
    - apps/server/test/records-ownership.e2e-spec.ts
  modified:
    - apps/server/test/records-travel.e2e-spec.ts
    - apps/server/src/modules/records/records.controller.ts
    - apps/server/src/modules/records/records.service.ts
    - apps/server/src/modules/records/records.repository.ts
    - apps/server/src/modules/records/records.module.ts
key-decisions:
  - "受保护的 `/records` 路由统一采用 `@UseGuards(SessionAuthGuard)` 与 `@CurrentUser()`，smoke 辅助接口继续保持独立。"
  - "正式 ownership 真源切到 `UserTravelRecord`，并以 `(userId, placeId)` 复合键做 upsert/delete；legacy `TravelRecord` 只保留给 reopen/backfill 相关测试。"
patterns-established:
  - "Current-user records pattern: controller 注入 AuthUser，service/repository 全链路显式接收 userId"
  - "Ownership persistence pattern: prisma.userTravelRecord.upsert + userId_placeId 复合键"
requirements-completed: [SYNC-01, SYNC-02]
duration: 12min
completed: 2026-04-12
---

# Phase 23 Plan 03: Records Ownership Summary

**受 session 保护的 current-user `/records` 已切到 `userTravelRecord` 真源，并通过跨账号隔离 e2e 覆盖同地点双账号与匿名 401 语义**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-12T09:44:16Z
- **Completed:** 2026-04-12T09:56:13Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- 重写了 `records-travel` e2e，让 `/records` CRUD 以已登录 current-user 为前提，不再保留匿名全局 records 假设。
- 新增 `records-ownership` e2e，覆盖匿名 `401`、跨账号隔离、同地点双账号成功和按当前账号删除不串删。
- 将 records controller/service/repository/module 全链路收口到 `SessionAuthGuard + CurrentUser + UserTravelRecord`。

## Task Commits

Each task was committed atomically:

1. **Task 1: 建立 current-user records ownership 的 e2e 规格** - `09acb4e` (test)
2. **Task 2: 将 records API 收口为 current-user ownership 真源** - `63fdaf9` (feat)

## Files Created/Modified

- `apps/server/test/records-ownership.e2e-spec.ts` - 新增 ownership e2e，覆盖匿名拒绝、同地点双账号和删除隔离。
- `apps/server/test/records-travel.e2e-spec.ts` - 将既有 CRUD e2e 改为 authenticated current-user 语义，并把 legacy reopen/backfill 断言限制在 legacy 表。
- `apps/server/src/modules/records/records.controller.ts` - 为 `GET/POST/DELETE /records` 加入 `SessionAuthGuard` 与 `CurrentUser` 注入。
- `apps/server/src/modules/records/records.service.ts` - 把 records 读写删除接口改为显式接收 `userId`，移除 legacy `409` 冲突分支。
- `apps/server/src/modules/records/records.repository.ts` - 从 `prisma.travelRecord` 切到 `prisma.userTravelRecord`，按 `userId` 查询并用 `userId_placeId` 复合键 upsert/delete。
- `apps/server/src/modules/records/records.module.ts` - 导入 `AuthModule`，让 records 路由上下文可解析 `SessionAuthGuard`。

## Decisions Made

- `/records/smoke` 继续保留为不耦合 auth 的辅助接口，ownership 收口只作用于正式 travel records 路由。
- contracts 的 `TravelRecord` 返回形状保持不变，不向客户端暴露 owner 字段，owner 始终由 session 派生。
- legacy `TravelRecord` 仅用于 reopen/backfill 验证，current-user 真源完全落到 `UserTravelRecord`。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- sandbox 默认执行下，records e2e 无法连接当前 Prisma 配置的远程数据库；改为使用已批准的提权测试命令后完成验证。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 后续 23-04 可以直接基于 current-user `/records` 真源做 auth-bound bootstrap/store 生命周期切换。
- server 侧 ownership 边界已经稳定，后续前端不需要再传递任何 owner 语义字段。

## Self-Check

PASSED

---
*Phase: 23-auth-ownership-foundation*
*Completed: 2026-04-12*
