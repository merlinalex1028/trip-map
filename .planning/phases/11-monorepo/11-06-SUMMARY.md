---
phase: 11-monorepo
plan: 06
subsystem: backend
tags: [nestjs, prisma, postgresql, supabase, smoke-test]
requires:
  - phase: 11-monorepo
    plan: 03
    provides: apps/server NestJS scaffold, health route, records contract boundary
provides:
  - Prisma/PostgreSQL persistence for smoke records in apps/server
  - Nest DI chain from AppModule to Prisma-backed RecordsRepository
  - DB-backed smoke verification against a Supabase-hosted PostgreSQL project
affects: [11-04, apps-server, records, persistence]
tech-stack:
  added: [prisma, "@prisma/client"]
  patterns: [portable-postgresql-via-prisma, repository-backed-records-module, supabase-hosted-postgres-without-supabase-sdk]
key-files:
  created:
    - .planning/phases/11-monorepo/11-06-SUMMARY.md
    - apps/server/src/prisma/prisma.module.ts
    - apps/server/src/prisma/prisma.service.ts
    - apps/server/src/modules/records/records.repository.ts
    - apps/server/test/records-smoke.e2e-spec.ts
    - apps/server/prisma.config.ts
    - apps/server/prisma/schema.prisma
    - apps/server/prisma/migrations/20260330043800_init_smoke_record/migration.sql
  modified:
    - apps/server/package.json
    - pnpm-lock.yaml
    - apps/server/.env.example
    - apps/server/src/app.module.ts
    - apps/server/src/modules/records/records.module.ts
    - apps/server/src/modules/records/records.controller.ts
    - apps/server/src/modules/records/records.service.ts
key-decisions:
  - "继续保持 ARC-03 的可移植性边界：使用 Prisma 直连标准 PostgreSQL，不引入 @supabase/supabase-js、Redis、BullMQ、对象存储或 PostGIS。"
  - "在当前网络环境下，apps/server 本地运行和 Prisma migration 都统一走 Supabase CLI 已验证的 session pooler URL；DIRECT_URL 仍保留为独立环境变量入口，但当前值与运行时连接对齐。"
patterns-established:
  - "Pattern: PrismaService 在 apps/server 内部归一化和加载 .env，Nest 运行时与 Prisma CLI 共享同一套连接串格式。"
  - "Pattern: records persistence 通过 RecordsRepository 将 shared contract DTO 映射到 PostgreSQL 行，再由 RecordsService 回映射为 SmokeRecordResponse。"
requirements-completed: [ARC-03]
duration: 81 min
completed: 2026-03-30
---

# Phase 11 Plan 06: Prisma Persistence Summary

**apps/server 现已通过 Prisma 接入真实的 Supabase-hosted PostgreSQL，并完成了 records smoke 路由的数据库落库验证。**

## Performance

- **Duration:** 81 min
- **Started:** 2026-03-30T04:31:42Z
- **Completed:** 2026-03-30T05:52:12Z
- **Tasks:** 1
- **Files modified:** 13

## Accomplishments

- 为 `apps/server` 显式增加 `prisma` / `@prisma/client` 依赖与 `prisma:generate`、`prisma:migrate:deploy`、`prisma:validate` 脚本，补齐 Phase 11 要求的 Prisma 安装面。
- 增加 `PrismaModule`、`PrismaService`、`RecordsRepository`，把 `POST /records/smoke` 从 contract-only service 提升为真实 PostgreSQL 持久化链路。
- 落地 `prisma/schema.prisma`、初始 migration、`.env.example` 和 `records-smoke.e2e-spec.ts`，并在新建的 Supabase 项目 `trip-map-dev` 上完成 migration 与 DB-backed smoke 验证。

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Prisma dependency surface, Nest DI wiring, and DB-backed smoke verification** - `387dd62` (test)
2. **Task 1: Add Prisma dependency surface, Nest DI wiring, and DB-backed smoke verification** - `dfd9dfb` (feat)

**Plan metadata:** pending docs commit

## Files Created/Modified

- `apps/server/package.json` - 增加 Prisma 依赖和 generate/migrate/validate 脚本。
- `pnpm-lock.yaml` - 锁定 Prisma 及其传递依赖版本。
- `apps/server/.env.example` - 明确 `DATABASE_URL`、`DIRECT_URL`、`SHADOW_DATABASE_URL` 的 PostgreSQL 环境入口。
- `apps/server/src/app.module.ts` - 保持 `RecordsModule` 进入根模块，并通过全局配置读取本地 `.env`。
- `apps/server/src/prisma/prisma.module.ts` - 提供 Prisma 依赖注入模块。
- `apps/server/src/prisma/prisma.service.ts` - 在服务端运行时加载并归一化数据库连接串，提供 PrismaClient 生命周期管理。
- `apps/server/src/modules/records/records.module.ts` - 引入 `PrismaModule` 并显式注册 repository/service。
- `apps/server/src/modules/records/records.controller.ts` - 保持 `POST /records/smoke` 作为持久化入口。
- `apps/server/src/modules/records/records.service.ts` - 把 repository 行结果回映射为 shared `SmokeRecordResponse`。
- `apps/server/src/modules/records/records.repository.ts` - 通过 Prisma 写入 `SmokeRecord` 表。
- `apps/server/test/records-smoke.e2e-spec.ts` - 用 shared fixture 验证真实 DB round-trip。
- `apps/server/prisma.config.ts` - 统一 Prisma CLI 的 schema、migration 路径和环境变量读取。
- `apps/server/prisma/schema.prisma` - 定义 PostgreSQL datasource 与 `SmokeRecord` 模型。
- `apps/server/prisma/migrations/20260330043800_init_smoke_record/migration.sql` - 创建 `SmokeRecord` 表。

## Decisions Made

- 继续遵守计划约束，只把 Supabase 用作托管 PostgreSQL，不引入任何 Supabase 平台 SDK 或私有数据 API 到服务端代码。
- 在当前网络环境中，优先使用 `supabase link` 验证过的 session pooler 主机作为本地 Prisma runtime/migration 入口，以避免 direct host DNS/IPv6 可达性问题。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 归一化 Supabase PostgreSQL 连接串并切到 CLI 已验证的 session pooler**
- **Found during:** Task 1 verification
- **Issue:** 初始 `.env` 里的数据库密码未做 URL 编码，且手工猜测的 pooler 主机与 Supabase CLI link 结果不一致，导致出现 `Tenant or user not found` / direct host 不可达。
- **Fix:** 将数据库密码编码后写入本地 `.env`，并统一改用 `supabase link` 生成的 `aws-1-ap-southeast-1.pooler.supabase.com:5432` 连接串完成 Prisma migration 与运行时连接。
- **Files modified:** `apps/server/.env` (local only, untracked)
- **Verification:** `supabase link --project-ref xgegqvzwmcvagulujnmu -p '***'`, `pnpm -C apps/server exec prisma migrate deploy --schema prisma/schema.prisma`, `pnpm -C apps/server exec prisma db pull --schema prisma/schema.prisma --print`
- **Committed in:** not committed (local environment-only fix)

---

**Total deviations:** 1 auto-fixed (1 Rule 3)
**Impact on plan:** 该修复只解决环境接入和连接串格式问题，没有扩大代码范围，也没有引入额外基础设施。

## Issues Encountered

- 第一次数据库验证时把 migration 与 smoke test 并行执行，测试在表创建完成前就开始访问 `SmokeRecord`，导致出现一次假阳性的 “table does not exist”。在 migration 成功完成后顺序重跑测试即恢复正常。
- 远端 direct host 在当前环境下没有稳定可达的 DNS/网络路径，因此最终以 Supabase 官方 session pooler 完成本地验证。

## User Setup Required

- 本地 `apps/server/.env` 已配置并指向专用 Supabase 项目 `trip-map-dev`。
- 若后续更换数据库实例，只需替换 `DATABASE_URL`、`DIRECT_URL`、`SHADOW_DATABASE_URL`，无需改服务端代码。

## Next Phase Readiness

- `apps/server` 已具备真实的 PostgreSQL 持久化链路，`11-04` 现在可以把 `apps/web -> apps/server -> DB/contracts` 的最小 smoke path 接到真实后端。
- `11-09` / `11-10` 可以继续专注于 web runtime rewiring 和 bridge cleanup，不需要再回头处理 server persistence 基线。

## Self-Check: PASSED

- Verified summary file exists at `.planning/phases/11-monorepo/11-06-SUMMARY.md`.
- Verified task commits `387dd62` and `dfd9dfb` are present in git history.
- Verified `pnpm -C apps/server exec prisma migrate deploy --schema prisma/schema.prisma` completed successfully.
- Verified `pnpm -C apps/server test -- test/records-smoke.e2e-spec.ts` passed after migration completed.
