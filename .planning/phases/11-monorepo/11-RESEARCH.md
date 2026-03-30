# Phase 11: Monorepo 与契约基线 - Research

**Researched:** 2026-03-30
**Domain:** TypeScript monorepo 拆分、薄契约层、NestJS + Prisma PostgreSQL 基线
**Confidence:** MEDIUM-HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Monorepo 结构与工具基线
- **D-01:** 仓库采用 `pnpm workspace + turbo` 作为 monorepo 基线，而不是只做目录拆分或手工串联根脚本。
- **D-02:** 顶层目录固定收口为 `apps/web`、`apps/server`、`packages/contracts` 三块；Phase 11 不额外扩张更多共享运行时包。
- **D-03:** Phase 11 需要让 `web` 与 `server` 在本地开发、构建和测试中都能以 workspace 任务方式独立运行，证明拆分不是空壳。

### 共享契约层边界
- **D-04:** `packages/contracts` 保持为薄契约层，只承载 schema、DTO、enum、关键常量与 API 类型，不承载共享业务逻辑。
- **D-05:** 前后端共享的关键字段至少包括 `placeId`、`boundaryId`、`placeKind`、`datasetVersion` 以及与记录读写直接相关的基础 payload 形态。
- **D-06:** 当前前端里的领域行为、格式化逻辑、store 逻辑与识别逻辑不直接搬进 `contracts`；Phase 11 的优先级是“消除字段漂移”，不是“抽公共业务层”。

### PostgreSQL 与托管边界
- **D-07:** v3.0 的正式持久化基线采用 `PostgreSQL + Prisma + migrations`。
- **D-08:** 数据库不在本地额外创建独立 PostgreSQL 实例，Phase 11 默认直接连接 Supabase 托管的 PostgreSQL。
- **D-09:** 虽然使用 Supabase 托管 PostgreSQL，但业务模型、迁移方式和运行时访问不能依赖 Supabase 专有能力；后续应可切换到任意 PostgreSQL 兼容实例。
- **D-10:** Phase 11 不引入 `PostGIS`、`Redis`、`BullMQ`、对象存储或额外基础设施，把数据库能力保持在普通 PostgreSQL + 应用层建模即可支撑的范围。

### Phase 11 的真实打通范围
- **D-11:** Phase 11 不止做脚手架，还要打通一条最小真实跨端链路，至少证明 `web -> server -> database/contracts` 已经成立。
- **D-12:** 这条最小链路可以是 `health` 与最小 `records` smoke path，但不提前吞掉 Phase 15 的完整 CRUD 与点亮闭环范围。
- **D-13:** 当前前端本地 `localStorage` / `seed` 路径不会被继续扩展成 v3.0 正式方案；Phase 11 应开始为后续服务端记录模型腾出边界，但不承担旧数据迁移。

### Claude's Discretion
- `turbo.json` 中具体 task pipeline、缓存粒度与命名方式，只要能稳定支撑 `dev/build/test` 的多应用协作。
- `packages/contracts` 内部采用哪种 schema 组织方式与文件划分，只要保持“薄契约层、不承载业务逻辑”的原则。
- `apps/server` 在 NestJS 评估前的最小框架落点与模块划分方式，只要不妨碍后续切向正式后端架构。
- `Prisma` schema 的具体目录、生成物位置与环境变量命名，只要保持 PostgreSQL 可移植性，不绑定 Supabase 私有能力。

### Deferred Ideas (OUT OF SCOPE)
- 在 Phase 11 同时完成完整 records CRUD、点亮/取消点亮 mutation 闭环 — 属于 Phase 15 主交付
- 在 Phase 11 就把 canonical 地点解析全部后移到 server — 属于 Phase 12 的主交付
- 在 Phase 11 引入 `PostGIS`、`Redis`、`BullMQ`、对象存储或更复杂的多服务基础设施 — 超出当前 milestone 护栏
- 把共享格式化函数、业务规则引擎或跨端 helper 大量塞进 `contracts` — 会把薄契约层提前做胖
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ARC-01 | 项目代码库拆分为 `apps/web`、`apps/server` 和最小共享契约层，使前后端可以独立运行与构建 | 推荐 `pnpm workspace + turbo`、`apps/* + packages/*` 结构、独立 package scripts、`dev/build/test` task graph，以及最小 `web -> server` smoke path |
| ARC-03 | 系统以 PostgreSQL 兼容数据库作为正式持久化基础，并允许采用 `Supabase` 这类托管 PostgreSQL 方案而不把业务模型绑定到平台私有能力 | 推荐 `NestJS + Prisma + migrations`，只走标准 PostgreSQL 连接串和 Prisma migration/workflow，不引入 Supabase SDK / RLS / Storage 依赖 |
| ARC-04 | 前后端通过共享契约明确 `placeId`、`boundaryId`、`placeKind`、`datasetVersion` 等关键字段，避免多端语义漂移 | 推荐 `packages/contracts` 作为薄 DTO/enum/常量层，由 web、server DTO、test fixtures 共同引用同一份 contracts type，server 入站校验交给 Nest `ValidationPipe` |
| API-04 | 首发版本默认不要求引入 `PostGIS`、`Redis`、`BullMQ` 或对象存储，只有在实际规模证明需要时再升级基础设施 | 推荐以普通 PostgreSQL 表 + Prisma + NestJS 完成首条真实链路，不为 Phase 11 预建消息队列、缓存、对象存储或数据库专有扩展 |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

未发现仓库根目录 `CLAUDE.md`。本研究仅额外遵循仓库 `AGENTS.md` 与 phase context 中的锁定决策。

## Summary

Phase 11 最稳的做法不是“把当前前端粗暴拆成两个目录”，而是一次性建立能持续服务 Phase 12-15 的真实边界：根目录用 `pnpm workspace + turbo` 管任务图，`apps/web` 保留现有 `Vue 3 + Vite + Pinia` 前端，`apps/server` 用轻量 TypeScript 服务承接 HTTP 和数据库访问，`packages/contracts` 只保存跨端 DTO / enum / 常量 / API type。这样能把“字段不漂移”和“前后端可以独立运行”同时做成事实。

按前面的锁定方向，`apps/server` 应该直接以 `NestJS` 作为服务框架来规划，而不是把 Fastify 当成框架本身。更准确的说法是：Phase 11 的后端框架是 `NestJS`，底层 HTTP provider 可选 `@nestjs/platform-fastify`，这样既保持 Nest 的模块/控制器/依赖注入边界，也保留 Fastify adapter 的轻量运行时与后续性能空间。数据库层仍然只使用标准 PostgreSQL 能力和 Prisma migration，连接 Supabase-hosted PostgreSQL 也只把它当成托管 Postgres，不当成业务平台。

Phase 11 的最小真实链路不能只剩 `GET /health`。至少还需要一个真实的 `records` smoke path，让 `apps/web` 发起请求、`apps/server` 以 shared contracts type + Nest `ValidationPipe` 校验 payload、Prisma 写入并读回 PostgreSQL，然后把同样的字段形态返回给前端。`placeId`、`boundaryId`、`placeKind`、`datasetVersion` 这些字段应该在这一阶段就被定义成跨端“宪法”，否则 Phase 12 以后会在服务端语义与前端 UI 之间继续漂移。

**Primary recommendation:** 用 `pnpm workspace + turbo` 拆成 `apps/web`、`apps/server`、`packages/contracts`，服务端采用 `NestJS + Prisma`，必要时以 `FastifyAdapter` 作为底层 HTTP adapter，Phase 11 以一条真实 `web -> server -> PostgreSQL` smoke path 验证边界成立。

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `pnpm` | `10.33.0` | workspace 包管理、`workspace:` 依赖、filter 命令 | 官方 workspaces 与 workspace protocol 是当前标准做法，适合三包结构且不需要额外包管理层 |
| `turbo` | `2.8.21` | monorepo 任务图、`dev/build/test/typecheck` 编排 | 官方文档明确以 `apps/* + packages/*` 和 task graph 作为 monorepo 常规结构，适合独立应用协作 |
| `Vue 3 + Vite 8 + Pinia 3` | repo 现状：`3.5.21 / 8.0.1 / 3.0.3` | `apps/web` 主应用 | 现有 v2.0 已稳定交付，Phase 11 应先迁移目录和 API 边界，不把 monorepo 拆分与框架升级绑在一起 |
| `@nestjs/common` + `@nestjs/core` + `@nestjs/platform-fastify` | `11.1.17` | `apps/server` 框架层与 HTTP adapter | 用户已锁定后端用 Nest；Nest 官方支持 Fastify adapter，适合先建立模块/控制器/DI 边界，再保留更轻的 HTTP provider |
| `prisma` + `@prisma/client` | `7.6.0` | PostgreSQL ORM、迁移、客户端生成 | 官方 PostgreSQL 与 migrate 工作流成熟，能直接使用标准连接串并保持对 Supabase-hosted PostgreSQL 的可移植性 |
| `class-validator` + `class-transformer` | `0.15.1` + `0.5.1` | Nest DTO 入站校验与 payload 转换 | 这是 Nest 官方 ValidationPipe 路线，适合在 server 侧校验请求，同时让 `packages/contracts` 保持为纯类型/常量层 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@nestjs/config` | `4.0.3` | 读取 `DATABASE_URL`、`DIRECT_URL`、服务端环境配置 | Nest 官方配置模块，避免在 bootstrap 里散落读取环境变量 |
| `@nestjs/testing` + `supertest` | `11.1.17` + `7.2.2` | `apps/server` 单元 / e2e / smoke 测试 | Nest 官方测试容器 + HTTP 模拟是标准路径，适合 Phase 11 最小跨端 smoke |
| `tsx` | `4.21.0` | `apps/server` TypeScript 开发态执行 / watch | Phase 11 只需快速建立 dev server，无需为了服务端再引入更重打包器 |
| `vitest` | repo 现状：`3.2.4` | 统一 web/server/contracts 测试框架 | 仓库现有基线已稳定通过 `115` 个测试，最小成本做法是继续沿用 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `NestJS + FastifyAdapter` | 纯 `Fastify` | 纯 Fastify 更轻，但与你前面锁定的“后端服务用 Nest”不一致；在 Nest 内使用 FastifyAdapter 更符合当前决策 |
| `packages/contracts` 纯类型/常量层 | 在 contracts 里直接放 Nest DTO 装饰器类 | 把带 `class-validator` 装饰器的 DTO 直接放进 contracts 会把 Nest/runtime 依赖泄漏到 web；Phase 11 更稳的是 contracts 纯净、server DTO 自己实现 contracts type |
| `Prisma + direct PostgreSQL` | `Supabase JS / platform APIs` | Supabase SDK 更快接入，但会让 ARC-03 的“可迁移到任意 PostgreSQL”目标变弱 |
| 编译后的 `packages/contracts` | JIT/source-only internal package | JIT 包更轻，但独立 build 保证更弱；Phase 11 既然要求 web/server 独立构建，编译型 contracts 更稳 |

**Installation:**
```bash
pnpm add -Dw turbo
pnpm -C apps/server add @nestjs/common @nestjs/core @nestjs/platform-fastify @nestjs/config class-transformer class-validator reflect-metadata rxjs @prisma/client
pnpm -C apps/server add -D @nestjs/testing prisma supertest tsx
```

**Version verification:** 2026-03-30 已通过 `npm view` 验证推荐包的当前 registry 版本与最近发布时间。
- `turbo` `2.8.21` — modified `2026-03-29T23:32:43.004Z`
- `prisma` / `@prisma/client` `7.6.0` — modified `2026-03-27T15:49:26.425Z` / `2026-03-27T15:48:50.307Z`
- `@nestjs/common` / `@nestjs/core` / `@nestjs/platform-fastify` `11.1.17` — modified `2026-03-16T10:32:14.594Z` / `2026-03-16T10:32:17.660Z` / `2026-03-16T10:32:14.704Z`
- `@nestjs/config` `4.0.3` — modified `2026-02-04T10:43:09.163Z`
- `@nestjs/testing` `11.1.17` — modified `2026-03-16T10:32:14.742Z`
- `class-validator` `0.15.1` — modified `2026-02-26T10:46:55.166Z`
- `class-transformer` `0.5.1` — modified `2022-12-09T18:09:10.473Z`
- `supertest` `7.2.2` — modified `2026-01-06T09:29:48.496Z`
- `tsx` `4.21.0` — modified `2025-11-30T15:56:09.695Z`

## Architecture Patterns

### Recommended Project Structure
```text
.
├── apps/
│   ├── web/                    # 现有 Vue/Vite 前端迁入
│   │   ├── src/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── vitest.config.ts
│   └── server/                 # NestJS + Prisma 服务端
│       ├── src/
│       │   ├── app.module.ts
│       │   ├── main.ts
│       │   ├── prisma/
│       │   │   ├── prisma.module.ts
│       │   │   └── prisma.service.ts
│       │   ├── health/
│       │   │   ├── health.controller.ts
│       │   │   └── health.module.ts
│       │   └── modules/
│       │       └── records/
│       │           ├── dto/
│       │           │   └── create-record-smoke.dto.ts
│       │           ├── records.controller.ts
│       │           ├── records.module.ts
│       │           ├── records.repository.ts
│       │           └── records.service.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── prisma.config.ts
│       ├── package.json
│       └── vitest.config.ts
├── packages/
│   └── contracts/              # schema / DTO / enum / 常量
│       ├── src/
│       │   ├── health.ts
│       │   ├── place.ts
│       │   ├── records.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── package.json                # 根脚本只做 workspace/turbo 入口
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

### Pattern 1: Thin Contracts Package
**What:** `packages/contracts` 只暴露可跨端共享的 DTO type、enum、关键常量与 API type；不带 store、formatter、Prisma、Nest provider、UI helper。

**When to use:** 所有 `web <-> server` 传输对象、测试 fixture 基线和字段命名的唯一来源。

**Example:**
```typescript
// Source: .planning/phases/11-monorepo/11-CONTEXT.md
export type PlaceKind = 'CN_CITY' | 'OVERSEAS_ADMIN1'

export interface RecordSmokeDto {
  placeId: string
  boundaryId: string
  placeKind: PlaceKind
  datasetVersion: string
}
```

### Pattern 2: Nest Module + Controller + ValidationPipe
**What:** 服务端用 `AppModule` 组装模块，按 `controller -> service -> repository -> Prisma` 分层；controller 的 DTO 类在 server 内部实现 `packages/contracts` 的 type，并通过 `ValidationPipe` 做请求校验。

**When to use:** Phase 11 的 `health` 与最小 `records` smoke path，以及之后所有 API 单元/集成测试。

**Example:**
```typescript
// Source: https://docs.nestjs.com/techniques/validation
// Source: https://docs.nestjs.com/techniques/performance
import { Body, Controller, Post } from '@nestjs/common'
import { IsIn, IsString } from 'class-validator'
import type { RecordSmokeDto } from '@trip-map/contracts'

class CreateRecordSmokeBody implements RecordSmokeDto {
  @IsString()
  placeId!: string

  @IsString()
  boundaryId!: string

  @IsIn(['CN_CITY', 'OVERSEAS_ADMIN1'])
  placeKind!: RecordSmokeDto['placeKind']

  @IsString()
  datasetVersion!: string
}

@Controller('records')
export class RecordsController {
  @Post('smoke')
  createSmoke(@Body() body: CreateRecordSmokeBody) {
    return body
  }
}
```

### Pattern 3: Prisma Lives Only in `apps/server`
**What:** 数据库 schema、migrations、generated client 和 Prisma repository 都只存在于 `apps/server`；`packages/contracts` 不暴露 Prisma model type，`apps/web` 也不直接依赖 Prisma client。

**When to use:** 所有 PostgreSQL 访问与 schema 迁移。

**Example:**
```typescript
// Source: https://www.prisma.io/docs/orm/reference/prisma-config-reference
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
    directUrl: env('DIRECT_URL'),
  },
})
```

### Pattern 4: Turbo Owns Cross-App Task Wiring
**What:** 根脚本只代理 `turbo run ...`；`build` 依赖 `^build`，`dev` 为 persistent/non-cached 任务，`apps/web` 开发态通过 proxy 或显式 API base 连到 `apps/server`。

**When to use:** Phase 11 的本地联合开发、独立构建、根级 CI 命令。

**Example:**
```json
// Source: https://turborepo.com/docs/crafting-your-repository/configuring-tasks
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Anti-Patterns to Avoid
- **把 `packages/contracts` 做成“公共业务层”:** 一旦把 formatter、store helper、Prisma mapper 塞进去，Phase 12-15 会被共享逻辑绑死。
- **`apps/server` 直接复用 `apps/web/src/types` 或 `apps/web` 直接 import Prisma types:** 这会让 monorepo 只是在目录上拆开，依赖边界仍然是耦合的。
- **把带 Nest 装饰器和 `class-validator` 运行时依赖的 DTO 直接暴露给 `apps/web`:** 这会把服务端框架细节泄漏到 contracts/web。
- **把 `GET /health` 当成 Phase 11 唯一 smoke path:** 它证明不了 DB、contracts 和真实 payload 已经打通。
- **继续扩展 `localStorage` / seed 作为 v3.0 正式链路:** 当前 phase 的目标是建立新的 server 持久化基线，不是继续强化旧方案。
- **把拆 monorepo 和升级 Vue/Vite/Vitest/TypeScript 主版本绑在一起:** 这会把 Phase 11 变成“迁移 + 升级”双重问题，排障成本显著上升。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| monorepo 任务编排 | 根目录手写一堆 `&&` / `concurrently` 脚本 | `turbo` task graph | 有依赖图、缓存、persistent task 和 package 过滤能力，后续 phase 更稳 |
| 跨端字段契约 | 前端一套 `interface`、后端一套 DTO、测试再复制一套 fixture | `packages/contracts` 里的单一 contracts type / DTO 基线 | 关键字段一旦重复定义，就会在 `placeId` / `boundaryId` / `placeKind` / `datasetVersion` 上漂移 |
| 迁移元数据管理 | 手工维护 SQL 序号和“执行到哪了”的说明文档 | `Prisma Migrate` | 已内建 migration history、deploy/dev 区分和 drift 检查 |
| PostgreSQL 访问 | 直接绑定 `@supabase/supabase-js` 或 Supabase-only 数据 API | `Prisma` 直连 PostgreSQL | 更符合 ARC-03，可迁移到任意 PostgreSQL 兼容实例 |
| server 测试 | 每个测试启动真实端口、自己拼 HTTP 客户端 | `@nestjs/testing` + `supertest`（若用 FastifyAdapter，也可用 `app.inject()`） | 更接近 Nest 官方路径，且仍能保持轻量 smoke 测试 |

**Key insight:** Phase 11 的价值不在于造“更抽象”的基础设施，而在于尽快把跨端边界变成单一真实来源。任何会增加第二份定义、第二套执行入口、第二种持久化路径的做法，都应该压住。

## Common Pitfalls

### Pitfall 1: Prisma `migrate dev` 直接打到共享/生产 Supabase 数据库
**What goes wrong:** 迁移命令在远端数据库上失败，或因为 shadow database / 权限问题导致开发工作流不可用。

**Why it happens:** Prisma 官方开发工作流依赖开发态 migration 语义；如果没有单独 dev DB、branch DB 或 `shadowDatabaseUrl`，直接连接共享实例很容易踩权限/污染风险。

**How to avoid:** 在计划里明确 Phase 11 的开发数据库策略。优先准备独立 dev 实例或可用的 `DIRECT_URL` / `shadowDatabaseUrl`；生产环境只用 `migrate deploy`，不要用 `migrate dev`。

**Warning signs:** `.env` 缺失、只有单个生产连接串、第一次 migration 就报 shadow DB / permission 相关错误。

### Pitfall 2: `contracts` 里塞入业务逻辑，导致“薄契约层”失真
**What goes wrong:** 包结构看似优雅，但 Phase 12-15 一改 place 语义或 server 规则，就要同时动 web 与 contracts 的共享逻辑。

**Why it happens:** 开发时会忍不住把格式化、store helper、Prisma mapper 一起抽走，短期省几行代码，长期失去边界。

**How to avoid:** 把 `contracts` 的出口严格限定为 schema、DTO、enum、常量和 API type；任何需要运行态依赖、业务判断、存储映射的逻辑都留在 `apps/server` 或 `apps/web`。

**Warning signs:** `contracts` 开始依赖 `pinia`、`Prisma`、`@nestjs/*`、日期格式化 helper 或 UI label 生成函数。

### Pitfall 3: `apps/web` 仍然默认从 `localStorage` 启动主链路
**What goes wrong:** 即使增加了 server，真实运行时仍以浏览器本地快照为准，Phase 11 成功标准被“伪打通”。

**Why it happens:** 现有 `src/stores/map-points.ts` 与 `src/services/point-storage.ts` 深度绑定 `seed + localStorage`，如果不主动切出边界，很容易先保留旧链路再“之后再说”。

**How to avoid:** 计划中明确把旧本地存储路径降为历史基线参考，只允许 Phase 11 的 smoke path 走 API；即使完整 CRUD 在 Phase 15，也不要再新增基于 `localStorage` 的功能。

**Warning signs:** `apps/web` 新增 API 调用后，应用初始化仍默认 `bootstrapPoints()` 读取本地存档作为 canonical 数据源。

### Pitfall 4: 只验证“路由通了”，没有验证“字段没漂移”
**What goes wrong:** 请求能 200，但前端叫 `boundaryDatasetVersion`、服务端叫 `datasetVersion`，或者 `placeKind` 枚举值不一致，后续 reopen/highlight 立刻出问题。

**Why it happens:** 把 smoke test 写成“status code == 200”太弱，没有对关键字段做 round-trip 断言。

**How to avoid:** Phase 11 的 smoke fixture 必须显式断言 `placeId`、`boundaryId`、`placeKind`、`datasetVersion` 的请求体与响应体一致，并在 web adapter 层覆盖这些字段。

**Warning signs:** 契约包只导出 type、却没有对应的 DTO round-trip 测试；测试断言只看状态码或 `ok: true`。

### Pitfall 5: `web` 与 `server` 联调靠硬编码绝对地址
**What goes wrong:** 本地能跑，CI、预发或后续代理环境全部需要重改 URL，开发态与部署态行为分裂。

**Why it happens:** Phase 11 初期最容易直接在组件里写 `fetch('http://localhost:4000/...')`。

**How to avoid:** 在 `apps/web` 集中做 API client，开发态优先用 Vite proxy；如果需要环境变量，也只通过单一 `VITE_API_BASE_URL` 或统一 client 配置暴露。

**Warning signs:** `fetch`/`axios` 调用散落组件与 store，多处出现 `localhost` 或重复 base URL 字符串。

## Code Examples

Verified patterns from official sources:

### pnpm Workspace Declaration
```yaml
# Source: https://pnpm.io/workspaces
packages:
  - "apps/*"
  - "packages/*"
```

### Nest Route Smoke Test
```typescript
// Source: https://docs.nestjs.com/fundamentals/testing
import * as request from 'supertest'
import { Test } from '@nestjs/testing'
import { describe, expect, it } from 'vitest'
import { AppModule } from '../src/app.module'

describe('records smoke route', () => {
  it('round-trips canonical fields', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    const app = moduleRef.createNestApplication()
    await app.init()

    const response = await request(app.getHttpServer())
      .post('/records/smoke')
      .send({
        placeId: 'cn-shanghai',
        boundaryId: 'cn-shanghai-municipality',
        placeKind: 'CN_CITY',
        datasetVersion: 'phase11-smoke-v1'
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toMatchObject({
      placeId: 'cn-shanghai',
      boundaryId: 'cn-shanghai-municipality',
      placeKind: 'CN_CITY',
      datasetVersion: 'phase11-smoke-v1'
    })

    await app.close()
  })
})
```

### Prisma Datasource with Portable PostgreSQL URLs
```prisma
// Source: https://www.prisma.io/docs/orm/overview/databases/postgresql
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 单应用根目录 `vite` 脚本 | `pnpm workspace + turbo` 管 `apps/* + packages/*` | 2025-2026 官方 monorepo 文档长期收敛到该结构 | Phase 11 应把根目录从“应用本体”改成“workspace orchestration layer” |
| 浏览器 `localStorage` 作为正式持久化 | `apps/server` + PostgreSQL + Prisma` 作为正式持久化基线 | 本 milestone 于 2026-03-27 锁定 | web 不再拥有正式记录权威来源 |
| Prisma 旧式隐式 `prisma-client-js` 心智 | 当前官方文档鼓励 `prisma.config.ts` 与 `prisma-client` /显式生成路径心智 | Prisma 6/7 文档已更新 | 规划时应把 Prisma 配置和生成物放在 `apps/server`，不要再默认根目录隐式生成 |
| 纯前端脚本入口直接 new server | `NestFactory.create()` + `AppModule` 统一 bootstrap | Nest 11 官方文档长期稳定 | Phase 11 应让 server 从 day 1 就具备模块化入口，而不是之后再从裸 HTTP server 回迁 |

**Deprecated/outdated:**
- 根级 `dev/build/test` 直接指向单个 `vite` 应用：不再适合作为 v3.0 的 orchestrator。
- 把 `localStorage` 快照继续当作正式持久化路径：已与 `API-05` 方向冲突，Phase 11 不应再增强它。

## Open Questions

1. **Supabase 开发库是否具备 Prisma `migrate dev` 所需的 shadow DB / 分支库策略？**
   - What we know: Phase 11 锁定为“不本地自建 PostgreSQL，默认连 Supabase-hosted PostgreSQL”，且仓库当前没有 `.env` / `DATABASE_URL`。
   - What's unclear: 现有 Supabase 实例是否有独立 dev 分支、是否允许用于开发迁移、是否需要显式 `shadowDatabaseUrl`。
   - Recommendation: 计划前先锁定开发数据库工作流；如果没有独立 dev DB，就把“准备 dev connection / shadow strategy”列为 Wave 0。

2. **`boundaryId` / `datasetVersion` 在 Phase 11 的持久化层是否要求全量非空？**
   - What we know: 当前前端类型仍允许 `null`，但 Phase 11 成功标准要求这些字段跨端不漂移。
   - What's unclear: 在 canonical 地点语义尚未于 Phase 12 全量落地前，DB schema 是先强制非空，还是先保留显式 nullable。
   - Recommendation: Phase 11 至少让 smoke path 使用非空 fixture，并在规划时单独决定持久化 nullability，避免 web/server/DB 三方各自猜测。

3. **是否要在 Phase 11 顺手升级现有 web 基础包到最新小版本？**
   - What we know: 当前 repo 已运行在 `vue 3.5.21`、`vite 8.0.1`、`pinia 3.0.3`、`vitest 3.2.4`，测试全部通过；registry 已有更新小版本。
   - What's unclear: 当前 Phase 11 是否有足够余量同时承接升级带来的回归成本。
   - Recommendation: 默认不绑定升级，把 monorepo 拆分、server 骨架、contracts、Prisma smoke path 作为唯一主线；除非升级能直接解决 Phase 11 阻塞。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `node` | 全部 workspace 命令 | ✓ | `25.8.2` | — |
| `pnpm` | workspace 安装与 filter 命令 | ✓ | `10.33.0` | — |
| `turbo` CLI | 根级 `dev/build/test` task graph | ✗ | — | 先本地安装为 devDependency；临时可 `pnpm dlx turbo` |
| `prisma` CLI | migration、client generate、schema workflow | ✗ | — | 安装到 `apps/server` devDependencies；临时可 `pnpm dlx prisma` |
| PostgreSQL 连接串 (`DATABASE_URL`) | 最小真实 `server -> DB` smoke path | ✗ | — | 无；必须提供可用 PostgreSQL/Supabase dev 连接 |
| `psql` | 手工 SQL 检查（可选） | ✗ | — | 用 Prisma CLI 替代；Phase 11 不是硬阻塞 |

**Missing dependencies with no fallback:**
- `DATABASE_URL` / 可用 PostgreSQL 开发实例。当前仓库未发现 `.env`、`DATABASE_URL`、`DIRECT_URL` 配置，也无法验证真实 DB smoke path。

**Missing dependencies with fallback:**
- `turbo` CLI：安装本地 devDependency 即可，不需要全局安装。
- `prisma` CLI：安装到 `apps/server` 或临时用 `pnpm dlx prisma`。

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `Vitest 3.2.4`（现有基线，Phase 11 继续沿用） |
| Config file | 当前为 `vitest.config.ts`；Phase 11 需拆成 `apps/web/vitest.config.ts` 与 `apps/server/vitest.config.ts` |
| Quick run command | 当前：`pnpm test`；目标：`pnpm turbo run test --filter=./apps/web --filter=./apps/server --filter=./packages/contracts` |
| Full suite command | 目标：`pnpm turbo run build test typecheck` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ARC-01 | `apps/web`、`apps/server`、`packages/contracts` 可独立 build/test，且 web 通过 server 完成最小主链路 | smoke + build | `pnpm turbo run build test` | ❌ Wave 0 |
| ARC-03 | 同一 records smoke path 在标准 PostgreSQL 连接串下可 migrate / read / write | integration | `pnpm -C apps/server test` | ❌ Wave 0 |
| ARC-04 | `placeId`、`boundaryId`、`placeKind`、`datasetVersion` 在 contracts、server、web adapter 中同名同义 | unit + typecheck | `pnpm turbo run test typecheck --filter=./packages/contracts --filter=./apps/server --filter=./apps/web` | ❌ Wave 0 |
| API-04 | 主链路在无 `PostGIS`、`Redis`、`BullMQ`、对象存储下仍可运行 | smoke | `pnpm -C apps/server test` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm turbo run test --filter=...[changed package]`
- **Per wave merge:** `pnpm turbo run build test typecheck`
- **Phase gate:** 配好 `DATABASE_URL` 后跑完整 `web -> server -> DB` smoke，并确认不依赖 Redis/BullMQ/PostGIS/对象存储

### Wave 0 Gaps
- [ ] `apps/server/vitest.config.ts` — 服务端 controller / repository / e2e smoke 测试配置
- [ ] `apps/server/src/modules/records/records.smoke.spec.ts`（或独立 `test/records.e2e-spec.ts`）— 覆盖 ARC-01 / ARC-03 / ARC-04 / API-04 的最小真实链路
- [ ] `packages/contracts` 的 typecheck / contract smoke 脚本 — 防止字段名与枚举值漂移
- [ ] `apps/web` API adapter 测试（例如 `src/services/api/*.spec.ts`）— 确认 web 使用 contracts DTO 而不是直接拼字段
- [ ] `turbo.json` 与每个 package 的 `build/test/typecheck/dev` 脚本 — 当前尚不存在
- [ ] `.env.example` / 环境说明 — 至少包含 `DATABASE_URL`、`DIRECT_URL`、`VITE_API_BASE_URL` 或 proxy 约定

## Sources

### Primary (HIGH confidence)
- Project docs:
  - `.planning/phases/11-monorepo/11-CONTEXT.md` - 锁定决策、成功标准、代码上下文
  - `.planning/REQUIREMENTS.md` - `ARC-01`、`ARC-03`、`ARC-04`、`API-04` 的正式要求
  - `.planning/STATE.md` - 当前 milestone 状态
  - `.planning/PROJECT.md` - v3.0 总体约束与既有技术栈
  - `.planning/ROADMAP.md` - Phase 11 的目标与依赖顺序
  - `.planning/research/FEATURES.md` - 既有产品/架构护栏
- Official docs:
  - https://pnpm.io/workspaces - workspace 与 `workspace:` protocol
  - https://turborepo.com/docs/crafting-your-repository/structuring-a-repository - `apps/* + packages/*` 结构
  - https://turborepo.com/docs/crafting-your-repository/configuring-tasks - task graph、`dependsOn`、persistent dev tasks
  - https://turborepo.com/repo/docs/core-concepts/internal-packages - internal package 的 JIT / compiled 模式
  - https://docs.nestjs.com/techniques/validation - ValidationPipe 与 `class-validator`
  - https://docs.nestjs.com/fundamentals/testing - Nest testing module 与 e2e / smoke 测试
  - https://www.prisma.io/docs/orm/overview/databases/postgresql - PostgreSQL datasource
  - https://www.prisma.io/docs/orm/reference/prisma-config-reference - `prisma.config.ts`、`datasource.url` / `directUrl`
  - https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production - `migrate dev` / `migrate deploy` 区分
  - https://www.prisma.io/docs/guides/database/supabase - Prisma 与 Supabase Postgres 集成说明
  - https://supabase.com/docs/guides/database/connecting-to-postgres - Supabase-hosted PostgreSQL 标准连接方式
  - https://docs.nestjs.com/techniques/performance - `NestJS` 与 Fastify adapter 的迁移空间
- Official package registry metadata via `npm view`:
  - `turbo`, `prisma`, `@prisma/client`, `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-fastify`, `@nestjs/config`, `@nestjs/testing`, `class-validator`, `class-transformer`, `supertest`, `tsx`, `vue`, `vite`, `pinia`, `vitest`

### Secondary (MEDIUM confidence)
- None.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - `pnpm`/`turbo`/`NestJS`/`Prisma` 的主方向已经被用户决策和官方文档同时锁定。
- Architecture: MEDIUM-HIGH - 目录与边界模式同时受官方文档与当前 repo 现实约束，建议可执行，但仍需在 plan 阶段决定少量实现细节（如 migration dev DB 策略、字段 nullability）。
- Pitfalls: HIGH - 主要风险点直接来自当前仓库现状（仍是单应用 + localStorage）与 Prisma/Nest 官方工作流约束。

**Research date:** 2026-03-30
**Valid until:** 2026-04-06
