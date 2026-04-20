---
phase: 27-multi-visit-record-foundation
plan: 01
subsystem: database
tags: [contracts, prisma, postgres, travel-records]
requires:
  - phase: 26-overseas-authoritative-support
    provides: 账号旅行记录、bootstrap 恢复与 authoritative metadata 基座
provides:
  - TravelRecord 与 CreateTravelRecordRequest 的日期字段契约
  - UserTravelRecord 的多次记录 schema 与 nullable 日期列
  - 已同步数据库结构与刷新的 Prisma Client
affects: [27-02-backend-record-pipeline, 27-03-map-points-store]
tech-stack:
  added: []
  patterns:
    - contracts 使用 nullable YYYY-MM-DD string 表达旅行日期
    - UserTravelRecord 通过 trip-level 行模型支持同地点多次旅行
    - Prisma db push 作为开发库 schema 同步主路径
key-files:
  created:
    - .planning/phases/27-multi-visit-record-foundation/27-01-SUMMARY.md
  modified:
    - packages/contracts/src/records.ts
    - apps/server/prisma/schema.prisma
key-decisions:
  - 保持 startDate/endDate 为 nullable string/String?，显式表达未知日期而非推测 createdAt
  - 继续使用 prisma db push 同步开发数据库，不引入 migration 文件
  - 对无可跟踪源码 diff 的 generate/db push 任务使用空提交保留原子历史
patterns-established:
  - 先升级共享 contracts，再让 Prisma schema 与数据库同步到同一日期模型
  - 用 @@index([userId, placeId]) 替代 @@unique([userId, placeId]) 支撑多次旅行记录
requirements-completed: [TRIP-01, TRIP-02, TRIP-03]
duration: 9m 25s
completed: 2026-04-20
---

# Phase 27 Plan 01: Multi-Visit Record Foundation Summary

**TravelRecord 契约新增 nullable 日期字段，UserTravelRecord 去唯一化并已推送到 Supabase 开发库**

## Performance

- **Duration:** 9m 25s
- **Started:** 2026-04-20T03:41:20Z
- **Completed:** 2026-04-20T03:50:45Z
- **Tasks:** 4
- **Files modified:** 2

## Accomplishments

- 在共享 contracts 中为 `TravelRecord` 与 `CreateTravelRecordRequest` 增加 `startDate` / `endDate`，并重新构建供下游消费
- 在 Prisma schema 中为 `UserTravelRecord` 加入 `startDate` / `endDate` nullable 列，同时把 `@@unique([userId, placeId])` 降级为 `@@index([userId, placeId])`
- 已重新生成 Prisma Client，并把 schema 变更成功推送到配置中的 Supabase PostgreSQL 数据库

## Contracts 与 Schema 差异概述

- `packages/contracts/src/records.ts`
  - `TravelRecord`：在 `subtitle` 与 `createdAt` 之间新增 `startDate: string | null`、`endDate: string | null`
  - `CreateTravelRecordRequest`：从空接口改为显式包含 `startDate: string | null`、`endDate: string | null`
- `apps/server/prisma/schema.prisma`
  - `UserTravelRecord`：在 `subtitle` 后新增 `startDate      String?`、`endDate        String?`
  - `UserTravelRecord`：删除 `@@unique([userId, placeId])`，新增 `@@index([userId, placeId])`
  - 保持 `TravelRecord.placeId @unique` 与其他模型既有索引不变

## Prisma 命令与退出码

- `pnpm --filter @trip-map/contracts build` → `0`
- `pnpm --filter @trip-map/contracts typecheck` → `0`
- `pnpm --dir apps/server exec prisma format --schema=prisma/schema.prisma` → `0`
- `pnpm --dir apps/server exec prisma validate --schema=prisma/schema.prisma` → `0`
- `pnpm --filter @trip-map/server exec prisma generate --schema=/Users/huangjingping/i/trip-map/apps/server/prisma/schema.prisma` → `0`
- `pnpm --filter @trip-map/server exec prisma db push --schema=/Users/huangjingping/i/trip-map/apps/server/prisma/schema.prisma --accept-data-loss` → `0`
- `pnpm --filter @trip-map/server exec prisma db push --schema=/Users/huangjingping/i/trip-map/apps/server/prisma/schema.prisma` → `0`（already in sync）

## Downstream 可依赖的新类型

- `TravelRecord`
- `CreateTravelRecordRequest`
- `UserTravelRecord`（Prisma Client）

## Task Commits

Each task was committed atomically:

1. **Task 1: 扩展 contracts TravelRecord 与 CreateTravelRecordRequest 日期字段** - `6b6927b` (feat)
2. **Task 2: 修改 UserTravelRecord Prisma schema（移除 unique，加日期字段）** - `fd9833e` (feat)
3. **Task 3: 重新生成 Prisma Client** - `d25e438` (chore)
4. **Task 4: [BLOCKING] Push schema 到数据库** - `f67988f` (chore)

## Files Created/Modified

- `packages/contracts/src/records.ts` - 共享旅行记录契约新增日期字段
- `apps/server/prisma/schema.prisma` - 多次旅行记录 schema 与索引调整
- `.planning/phases/27-multi-visit-record-foundation/27-01-SUMMARY.md` - 本计划执行总结

## Decisions Made

- 保持日期字段为 nullable string/`String?`，与 D-08 “未知日期”语义和 Prisma null 映射对齐
- 继续使用 `prisma db push` 同步开发库，而不是引入 migration 文件，符合本计划与仓库既有流程
- 任务 3 与任务 4 使用空提交记录生成/推库动作，因为实际变化落在依赖目录或真实数据库，不产生可跟踪源码 diff

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 修正 Prisma CLI 的 schema 路径解析**
- **Found during:** Task 2, Task 3, Task 4
- **Issue:** 计划里的 `pnpm --filter @trip-map/server exec prisma ... --schema=apps/server/prisma/schema.prisma` 在 pnpm 切到包目录后会把 schema 路径解析为不存在的相对路径，导致命令失败。
- **Fix:** 对 generate/db push 改用绝对 schema 路径；对本地 format/validate 改用 `pnpm --dir apps/server exec prisma ... --schema=prisma/schema.prisma`。
- **Files modified:** None
- **Verification:** Prisma format/validate/generate/db push 全部退出码为 0
- **Committed in:** `d25e438`, `f67988f`

**2. [Rule 3 - Blocking] 按 pnpm monorepo 的真实位置验证 Prisma Client 产物**
- **Found during:** Task 3
- **Issue:** 计划预期的 `apps/server/node_modules/.prisma/client/index.d.ts` 在当前 pnpm workspace 布局下不存在，实际生成产物位于 root `node_modules/.pnpm/.../.prisma/client/index.d.ts`。
- **Fix:** 通过 `apps/server/node_modules/@prisma/client` 的 symlink 定位真实 `.prisma/client/index.d.ts`，并在真实产物中验证 `startDate` / `endDate` 已生成。
- **Files modified:** None
- **Verification:** 真实生成的 `index.d.ts` 中多处匹配 `startDate` / `endDate`
- **Committed in:** `d25e438`

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** 仅修正执行环境与 workspace 布局差异，没有扩大范围；计划目标全部达成。

## Issues Encountered

- Task 1 的验收文字里要求全文件 `grep "createdAt: string"` 仅命中 1 行，但仓库原本就有 `SmokeRecordResponse.createdAt` 和 `TravelRecord.createdAt` 两处；已通过直接检查 `TravelRecord` 片段确认字段未丢失。
- Task 2 的验收文字里要求全文件 `grep "@@index([userId])"` 仅命中 1 行，但 `AuthSession` 与 `UserTravelRecord` 都合法使用了该索引；已通过直接检查 `UserTravelRecord` 片段确认目标模型正确。
- 首次 sandbox 内 `prisma db push` 返回 `Schema engine error`，提权后成功连接到配置的 Supabase 开发库并完成推送。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02 可以直接在后端 DTO、Repository、Service 与 bootstrap 链路消费 `TravelRecord.startDate` / `endDate` 和新的 `UserTravelRecord` 多行模型。
- Plan 03 可以在前端 store 层依赖新的 `CreateTravelRecordRequest` 日期字段和 trip-level 持久化语义。
- 数据库已达到目标状态，重复执行 `db push` 会返回 already in sync。

## Self-Check: PASSED

- Found: `.planning/phases/27-multi-visit-record-foundation/27-01-SUMMARY.md`
- Found task commits: `6b6927b`, `fd9833e`, `d25e438`, `f67988f`
