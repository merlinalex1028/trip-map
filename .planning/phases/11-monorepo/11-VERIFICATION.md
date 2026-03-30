---
phase: 11-monorepo
verified: 2026-03-30T07:29:53Z
status: passed
score: 4/4 must-haves verified
---

# Phase 11: Monorepo 与契约基线 Verification Report

**Phase Goal:** 用户可以通过拆分后的 `web` 与 `server` 应用访问同一套 v3.0 基线，且核心数据契约与持久化底座已经稳定  
**Verified:** 2026-03-30T07:29:53Z  
**Status:** passed  
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | 用户访问 v3.0 应用时，`apps/web` 可以通过独立运行的 `apps/server` 正常完成 Phase 11 baseline 链路，前后端不再耦合在单体前端里。 | ✓ VERIFIED | 根 `package.json` 通过 `turbo` 编排 `dev:web` / `dev:server` / `build` / `test` / `typecheck`；`apps/web/src/services/api/client.ts` 统一生成 `/api` 请求；`apps/web/vite.config.ts` 把 `/api` 代理到 `127.0.0.1:4000`；`apps/web/src/components/BackendBaselinePanel.vue` 已接入 health + smoke 写链路；`pnpm build`、`pnpm test`、`pnpm typecheck` 全部通过。 |
| 2 | 同一条请求链路中，前端与服务端一致使用 `placeId`、`boundaryId`、`placeKind`、`datasetVersion` 等关键字段，不会发生契约漂移。 | ✓ VERIFIED | `packages/contracts/src/place.ts` 与 `packages/contracts/src/records.ts` 定义 canonical 字段；`apps/web/src/services/api/phase11-smoke.ts` 直接提交 `PHASE11_SMOKE_RECORD_REQUEST`；`apps/server/src/modules/records/dto/create-smoke-record.dto.ts`、`records.repository.ts`、`records.service.ts` 与 `apps/server/prisma/schema.prisma` 全程保持同名字段；`apps/server/test/records-contract.e2e-spec.ts` 与 `records-smoke.e2e-spec.ts` 真实验证 round-trip。 |
| 3 | 环境切换到任意 PostgreSQL 兼容实例时，核心读写链路仍可运行，不依赖 Supabase 私有能力。 | ✓ VERIFIED | `apps/server/prisma/schema.prisma` 使用标准 `provider = "postgresql"`、`DATABASE_URL`、`DIRECT_URL`；`apps/server/.env.example` 明确写明只接受 PostgreSQL-compatible connection strings；代码库未引入 `@supabase/supabase-js`；提权后 `pnpm -C apps/server exec prisma migrate deploy --schema prisma/schema.prisma` 与 `pnpm -C apps/server test -- test/records-contract.e2e-spec.ts test/records-smoke.e2e-spec.ts` 均通过。 |
| 4 | 首发环境不启用 `PostGIS`、`Redis`、`BullMQ` 或对象存储时，仍能支撑 v3.0 主链路。 | ✓ VERIFIED | `apps/server/package.json` 只引入 Nest + Prisma + PostgreSQL 所需依赖；对 `apps/server` / `apps/web` / `packages/contracts` 的代码扫描未发现 `Redis`、`BullMQ`、`PostGIS`、对象存储 SDK 或 Supabase 平台 SDK；DB smoke 已在当前最小基础设施下跑通。 |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `package.json` | 根编排层负责 workspace 运行、构建、测试与类型检查 | ✓ VERIFIED | `dev:web`、`dev:server`、`build`、`test`、`typecheck` 均委托给 `turbo run`。 |
| `packages/contracts/src/place.ts` + `packages/contracts/src/records.ts` + `packages/contracts/src/fixtures.ts` | 共享 canonical place / records 契约与 smoke fixture 真源 | ✓ VERIFIED | 契约与 fixture 存在，`pnpm --filter @trip-map/contracts test && typecheck` 通过。 |
| `apps/web/src/components/BackendBaselinePanel.vue` | Web 侧可见的 backend baseline 读写表面 | ✓ VERIFIED | 组件挂在 `apps/web/src/App.vue` 中，展示 health 数据并触发 smoke record 创建。 |
| `apps/web/src/services/api/client.ts` + `apps/web/src/services/api/phase11-smoke.ts` | Web -> server 统一 API adapter | ✓ VERIFIED | 使用 `VITE_API_BASE_URL ?? '/api'`，并直接依赖 contracts fixture。 |
| `apps/server/src/main.ts` + `apps/server/src/modules/records/*.ts` | 独立 server bootstrap 与 records HTTP/DI 链路 | ✓ VERIFIED | Nest + Fastify 启动成功，`POST /records/smoke` 经 Controller -> Service -> Repository -> Prisma 持久化。 |
| `apps/server/prisma/schema.prisma` + `apps/server/prisma/migrations/20260330043800_init_smoke_record/migration.sql` + `apps/server/.env.example` | 可移植 PostgreSQL 持久化底座与环境说明 | ✓ VERIFIED | `prisma validate`、`prisma generate`、`prisma migrate deploy` 成功；migration 已存在且无待应用项。 |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `package.json` | `apps/web/package.json` / `apps/server/package.json` / `packages/contracts/package.json` | `turbo run build/test/typecheck/dev` | ✓ WIRED | 根级 `pnpm build`、`pnpm test`、`pnpm typecheck` 全部成功覆盖三个 workspace。 |
| `apps/web/src/components/BackendBaselinePanel.vue` | `apps/web/src/services/api/phase11-smoke.ts` | `fetchHealthStatus()` / `createSmokeRecord()` | ✓ WIRED | `gsd-tools verify key-links 11-04-PLAN` 通过，组件代码直接调用 adapter。 |
| `apps/web/src/services/api/phase11-smoke.ts` | `packages/contracts/src/fixtures.ts` | `PHASE11_SMOKE_RECORD_REQUEST` | ✓ WIRED | Web 直接发送共享 fixture，无本地重复常量。 |
| `apps/web/vite.config.ts` | `apps/server/src/main.ts` | `/api` dev proxy -> `http://127.0.0.1:4000` | ✓ WIRED | 开发态通过统一代理连独立 server，而不是在组件里写死绝对地址。 |
| `apps/server/src/modules/records/records.controller.ts` | `apps/server/src/modules/records/records.service.ts` | `createSmoke()` | ✓ WIRED | DTO 校验后进入 service，返回 `SmokeRecordResponse`。 |
| `apps/server/src/modules/records/records.service.ts` | `apps/server/src/modules/records/records.repository.ts` | `createSmokeRecord()` | ✓ WIRED | Service 把 repository 持久化结果映射回 contracts 响应。 |
| `apps/server/src/modules/records/records.repository.ts` | `apps/server/prisma/schema.prisma` | `this.prisma.smokeRecord.create(...)` | ✓ WIRED | Repository 使用 Prisma `smokeRecord` model 写入 PostgreSQL。 |
| `apps/server/test/records-smoke.e2e-spec.ts` | PostgreSQL `SmokeRecord` row | `app.inject()` + PrismaClient query | ✓ WIRED | 测试同时断言 HTTP 201 返回与数据库真实写入。 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `apps/web/src/components/BackendBaselinePanel.vue` | `smokeRecord` | `createSmokeRecord()` -> `apps/web/src/services/api/phase11-smoke.ts` -> `POST /records/smoke` -> `RecordsRepository` -> Prisma -> PostgreSQL | Yes | ✓ FLOWING |
| `apps/web/src/components/BackendBaselinePanel.vue` | `healthStatus` | `fetchHealthStatus()` -> `GET /health` -> `HealthController` | Yes, but controller payload is static and does not probe DB | ✓ FLOWING |
| `apps/server/src/modules/records/records.service.ts` | `record` | `RecordsRepository.createSmokeRecord()` -> Prisma `smokeRecord.create()` | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Contracts package exports and type surface are valid | `pnpm --filter @trip-map/contracts test` | 1 file / 3 tests passed | ✓ PASS |
| Web smoke adapter and panel work in package-local tests | `pnpm -C apps/web test -- src/components/BackendBaselinePanel.spec.ts src/services/api/phase11-smoke.spec.ts` | 2 files / 5 tests passed | ✓ PASS |
| Web app can build from `apps/web` | `pnpm -C apps/web build` | build passed; emitted production bundle | ✓ PASS |
| Server schema is valid | `pnpm -C apps/server exec prisma validate --schema prisma/schema.prisma` | schema valid | ✓ PASS |
| Server can generate Prisma client | `pnpm -C apps/server exec prisma generate --schema prisma/schema.prisma` | Prisma Client generated successfully | ✓ PASS |
| Server migration surface is usable against current PostgreSQL | `pnpm -C apps/server exec prisma migrate deploy --schema prisma/schema.prisma` | no pending migrations | ✓ PASS |
| DB-backed records path round-trips through PostgreSQL | `pnpm -C apps/server test -- test/records-contract.e2e-spec.ts test/records-smoke.e2e-spec.ts` | 3 files / 4 tests passed | ✓ PASS |
| Root workspace orchestration can run the full test graph | `pnpm test` | turbo ran contracts/web/server tests successfully | ✓ PASS |
| Root workspace orchestration can build and typecheck all packages | `pnpm build` / `pnpm typecheck` | 3 packages successful | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `ARC-01` | `11-01`, `11-02`, `11-03`, `11-04`, `11-10` | 项目拆分为 `apps/web`、`apps/server` 和最小共享契约层，使前后端可以独立运行与构建 | ✓ SATISFIED | 根 turbo 编排存在，`apps/web` 与 `apps/server` 独立 package/config/bootstrap 已落地，根级 build/test/typecheck 全通过。 |
| `ARC-03` | `11-06` | 使用 PostgreSQL 兼容数据库作为正式持久化底座，不绑定 Supabase 私有能力 | ✓ SATISFIED | Prisma datasource 为标准 `postgresql`，`.env.example` 只要求标准连接串，无 Supabase SDK，DB e2e + migration deploy 成功。 |
| `ARC-04` | `11-01`, `11-03`, `11-04` | 前后端通过共享契约固定 `placeId`、`boundaryId`、`placeKind`、`datasetVersion` 等关键字段 | ✓ SATISFIED | contracts -> web adapter -> DTO -> repository -> DB smoke tests 全链路同名字段。 |
| `API-04` | `11-06` | 首发版本默认不要求引入 `PostGIS`、`Redis`、`BullMQ` 或对象存储 | ✓ SATISFIED | 依赖与代码扫描未发现相关基础设施，现有 smoke path 已在普通 PostgreSQL + Prisma + Nest 下工作。 |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `apps/server/src/health/health.controller.ts` | 14 | `database: 'down'` 为静态返回值 | ⚠️ Warning | `BackendBaselinePanel` 的 database 字段不是 live DB probe，健康信息会低估真实就绪状态。 |
| `apps/web/vitest.config.ts` | 13 | 默认 `include` 仍混入 `../../src/**/*.spec.ts` | ℹ️ Info | `apps/web` 的默认测试入口仍会混跑 repo-root legacy specs；不阻塞 Phase 11 目标，但 test ownership 尚未完全收口。 |

### Human Verification Required

None blocking for phase-goal sign-off.  
建议补做一次人工联调：分别启动 `pnpm dev:web` 与 `pnpm dev:server`，在浏览器中确认 `BackendBaselinePanel` 首屏加载 `/health`，且点击“创建 smoke record”后可以显示返回的 canonical 字段。

### Gaps Summary

No functional gaps found against Phase 11 goal or its four roadmap success criteria.  
当前剩余项均为非阻塞风险或后续优化：

- `/health` 的 `database` 字段尚未做真实探测。
- `apps/web` 默认测试仍兼容 legacy root specs。
- `apps/web` 生产构建产物仍有超大 chunk 警告，但不影响本阶段 monorepo / contracts / PostgreSQL baseline 达标。
- 文档状态有轻微漂移：`ROADMAP.md` 的 Phase 11 plan 勾选与 `REQUIREMENTS.md` 的 `ARC-03` / `API-04` traceability 状态尚未同步到本次验证结果。

---

_Verified: 2026-03-30T07:29:53Z_  
_Verifier: Claude (gsd-verifier)_
