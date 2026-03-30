# Phase 11 Discussion Log

**Phase:** 11 - Monorepo 与契约基线
**Date:** 2026-03-27
**Status:** Completed

## Summary

- User chose to discuss all identified gray areas for Phase 11.
- Decisions were captured for monorepo tooling, contracts package thickness, PostgreSQL baseline, and how much real cross-end functionality Phase 11 should include.
- User added one explicit implementation constraint: PostgreSQL should use a Supabase-hosted instance instead of creating a separate local database.

## Q&A Audit Trail

### 1. Monorepo 工具基线

**Question:** 这一阶段采用什么样的 monorepo 工具与目录基线？

**Options presented:**
- **A:** `pnpm workspace + turbo`，目录固定为 `apps/web`、`apps/server`、`packages/contracts`
- **B:** 只用 `pnpm workspace`，根脚本手动串联各 app
- **C:** 先只拆目录，不引入真正的 workspace 编排

**User selection:** A

**Captured decision:**
- 仓库采用 `pnpm workspace + turbo`
- 顶层目录固定为 `apps/web`、`apps/server`、`packages/contracts`

### 2. `contracts` 包厚度

**Question:** `packages/contracts` 应该薄到什么程度？

**Options presented:**
- **A:** 薄契约层：只放 schema / DTO / enum / 关键常量 / API 类型
- **B:** 中等契约层：在 A 基础上，再放少量 mapper / formatter / domain helper
- **C:** 厚契约层：前后端共用大量 domain logic / service helper

**User selection:** A

**Captured decision:**
- `contracts` 保持为薄契约层
- 只共享 schema、DTO、enum、关键常量与 API 类型
- 不共享业务逻辑

### 3. PostgreSQL 接入基线

**Question:** PostgreSQL 采用什么技术组合与托管边界？

**Options presented:**
- **A:** `PostgreSQL + Prisma + migration`，允许连接 Supabase 的 Postgres，但业务不依赖 Supabase 专有能力
- **B:** `PostgreSQL + Drizzle + migration`
- **C:** `PostgreSQL + 手写 SQL/迁移工具`

**User selection:** A

**Additional user note:**
- `PostgreSQL不在本地创建数据库，直接使用supabase托管`

**Captured decision:**
- 采用 `PostgreSQL + Prisma + migrations`
- 默认直接连接 Supabase 托管 PostgreSQL
- 业务与迁移不绑定 Supabase 私有能力，保持 PostgreSQL 可移植性

### 4. Phase 11 的真实打通范围

**Question:** Phase 11 只做基线，还是要包含一条真实跨端链路？

**Options presented:**
- **A:** 除脚手架外，再打通一条最小真实跨端链路：`web -> server` health/records smoke path + contracts + DB
- **B:** 只做 monorepo、server skeleton、contracts、DB baseline，不接任何真实 API
- **C:** Phase 11 就把完整 records CRUD 一起切过去

**User selection:** A

**Captured decision:**
- Phase 11 要包含最小真实跨端链路
- 该链路用于验证 `web -> server -> DB/contracts` 已成立
- 不提前吞掉 Phase 15 的完整 CRUD 与点亮闭环

## Final Locked Decisions

1. 使用 `pnpm workspace + turbo`，目录基线为 `apps/web`、`apps/server`、`packages/contracts`
2. `packages/contracts` 保持薄契约层，只放 schema / DTO / enum / 常量 / API 类型
3. 使用 `PostgreSQL + Prisma + migrations`，并直接连接 Supabase 托管 PostgreSQL
4. 保持 PostgreSQL 可移植性，不绑定 Supabase 专有能力
5. Phase 11 需要打通最小真实跨端 smoke path，而不是只停留在脚手架层

## Deferred From Discussion

- 完整 records CRUD 与点亮闭环
- canonical place resolve 全量后移到 server
- 复杂数据库或消息基础设施
- 厚共享业务层
