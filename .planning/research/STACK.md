# Stack Research

**Domain:** 既有 `Vue 3 + Vite + TypeScript` 旅行地图升级为 `web + server` monorepo，全栈化并重构为“中国市级 / 海外一级行政区”语义
**Researched:** 2026-03-27
**Confidence:** MEDIUM

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `Node.js` | `22 LTS` preferred, minimum `20.19+` | 统一 `web` 与 `server` 运行时基线 | 当前 `Vite 8` 对 Node 要求比 Nest 更严格；直接把仓库基线抬到 `22 LTS`，可以同时满足 `Vite 8` 与 `Nest 11`，避免后面双版本兼容。 |
| `pnpm workspaces` | `10.33.x` | 管理 `apps/web`、`apps/server`、`packages/*` | 现仓库已经有 `pnpm-workspace.yaml`，但还没真正进入 workspace 模式。对“一个现有 Vite 前端 + 一个新增服务端”来说，`pnpm workspaces` 已足够，不需要先上更重的 monorepo 编排层。 |
| `Vue 3 + Vite` | keep existing `3.5.x / 8.0.x` | 保留现有前端主应用 | 这是已验证能力，不应在本里程碑重写。需要做的是把现有前端迁入 `apps/web`，而不是改框架。 |
| `Leaflet` | `1.9.4` | 替代现有地图渲染层，承载新行政区 GeoJSON 交互 | 这是本 milestone 的明确功能要求。Leaflet 足够承载行政区高亮、点击、popup 锚定与 GeoJSON layer，不必为当前范围改成更重的矢量平台。 |
| `NestJS` | `11.1.x` | 新增 TypeScript 后端服务 | 对现有 TypeScript 团队最稳，模块边界清晰，文档成熟，后续无论接数据库、队列还是 OpenAPI 都有稳定路径。这个里程碑重点是明确前后端边界，不是追求最轻 HTTP 框架。 |
| `PostgreSQL` | `18` | 旅行记录、地点身份、数据版本的系统记录库 | 你的数据本质是关系型数据: trip、place、boundary、dataset version、future user。PostgreSQL 是最稳的默认值；暂时不要求 `PostGIS`，先把几何大文件留在静态资产或对象存储。 |
| `Drizzle ORM + pg` | `0.45.x + 8.20.x` | 在 Nest 服务里访问 PostgreSQL | 当前产品规模不大，但数据语义要清楚。Drizzle 更轻，SQL 更显式，适合“少量但重要”的表和索引；比一上来用更重的 ORM 更符合这个里程碑。 |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@types/leaflet` | `1.9.21` | Leaflet 的 TypeScript 类型 | `apps/web` 切到 Leaflet 时直接使用。 |
| `@nestjs/config` | `4.0.x` | 管理 `DATABASE_URL`、对象存储配置、数据版本开关 | `apps/server` 创建后应立即加入，避免把环境变量读取散落在模块里。 |
| `@nestjs/swagger` | `11.2.x` | 生成 OpenAPI 文档 | 推荐从第一版 API 就开；后续 `web` 端可以基于 OpenAPI 生成类型，而不是手写重复 DTO。 |
| `class-validator` + `class-transformer` | `0.15.x + 0.5.x` | Nest DTO 校验与请求转换 | 如果先走 Nest 默认 DTO 方案，这是最稳的起步组合。 |
| `openapi-typescript` | `7.13.x` | 从 OpenAPI 生成前端类型 | 当 `web` 开始调用真实 API 后启用，优先生成到 `packages/contracts` 或 `apps/web/src/api/generated`。 |
| `tsx` | `4.21.x` | 跑 TypeScript 数据脚本 | 用于中国市级 / 海外 admin1 GeoJSON 的预处理、字段归一化、manifest 生成。比写额外构建链更轻。 |
| `@aws-sdk/client-s3` | `3.1018.x` | 访问 S3 兼容对象存储 | 只有当边界包、缩略图、导出文件开始脱离仓库静态资源时再加。不是 day 1 必需依赖。 |
| `@nestjs/bullmq` + `bullmq` + `ioredis` | `11.0.x + 5.71.x + 5.10.x` | 后台任务与队列 | 只有当你真的开始做数据导入、边界预处理、批量同步、导出等异步任务时才加。当前 milestone 不应默认引入。 |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `@nestjs/cli` `11.0.x` | 生成和管理 `apps/server` | 只把它用于 `server` 应用本身，不要把整个仓库改造成 Nest CLI 的 monorepo 模式。 |
| `tsconfig.base.json` + app-level `tsconfig` | 统一共享 TS 基线，拆开 `web` 与 `server` 运行时差异 | 当前根 `tsconfig.json` 明显是前端专用，含 `DOM` lib 与 `moduleResolution: Bundler`。`server` 应改用 Node 取向配置，例如 `NodeNext`。 |
| `turbo` `2.8.x` | 可选的 task pipeline 与 CI 缓存 | 现在只有 `web + server` 两个 app 时不是必须。等到 `packages/*`、E2E、数据脚本、CI 时间都明显增长，再补上。 |

## Recommended Monorepo Shape

```text
apps/
  web/               # 现有 Vite 前端整体迁入
  server/            # 新增 NestJS API 服务
packages/
  contracts/         # API 类型、共享枚举、共享 ID 规则
scripts/
  geo/               # GeoJSON 预处理、切分、manifest 生成
```

**默认建议：**
- 先做 `apps/web + apps/server + packages/contracts` 三段式。
- 不建议一开始就建一个什么都往里放的 `packages/shared`。这类包在小型 monorepo 里很容易退化成杂物间。
- `pnpm-workspace.yaml` 应明确声明 `apps/*` 和 `packages/*`；根 `package.json` 只保留 workspace scripts。

## Frontend / Static Vs API Boundary

| Concern | Keep in Frontend / Static | Move Behind API | Why |
|--------|----------------------------|-----------------|-----|
| 地图渲染与交互 | `Leaflet` 图层、hover/highlight、popup/drawer 状态 | 不需要 | 这些是纯 UI 与本地交互，放服务端只会增加延迟和复杂度。 |
| 行政区边界几何 | 优先作为版本化静态资产交付，必要时放对象存储/CDN | 不建议先做“数据库查 polygon 再返回” | 边界是读多写少的大文件，天然更适合静态分发，不适合作为频繁 REST 查询。 |
| 点击命中后的即时反馈 | 本地读取精简后的 boundary bundle 或 manifest 做命中与高亮 | 暂不强制后移 | 现有产品价值之一是地图点击后的直接反馈。若一上来改成 API hit-test，会把体验绑到网络。 |
| 旅行记录 CRUD | 不应继续只靠 `localStorage` | 应迁到 Nest API + PostgreSQL | 这是全栈化的核心收益，且为后续账号、同步、多端留接口。 |
| canonical place / boundary identity | 前端只消费 `placeId / boundaryId / displayName / datasetVersion` | 应由服务端定义权威结构 | 身份规范一旦散在前端静态数据里，后续版本迁移会很痛。 |
| 数据集版本与 manifest | 前端读取只读 manifest | manifest 元数据应由服务端或构建脚本统一产出 | 需要一处权威来源来描述“当前边界包版本”和映射规则。 |
| 导入、批处理、未来导出 | 不建议放前端 | 应走 API，必要时走队列 | 这些天然是后台任务。 |

**结论：**
- **应该保留在前端/静态层的**：地图渲染、行政区高亮、轻量命中、边界 bundle 的读取。
- **应该迁到 API 的**：trip 持久化、地点身份规范、数据版本元数据、未来导入导出与同步。
- **不要默认迁移到 API 的**：所有 GeoJSON 本身和每次点击的 polygon 查询。

## Infra Shortlist

### Database

| Choice | Recommendation | Why |
|--------|----------------|-----|
| `PostgreSQL 18` | **默认路径** | 最适合当前产品的关系模型，后面要加 auth、多端同步、审计字段都顺。 |
| `PostgreSQL + PostGIS` | **延后选项，不是 day 1** | 只有当服务端真的要做空间索引、服务端 hit-test、附近查询时再加。当前 milestone 不需要为此增加迁移和部署复杂度。 |
| `SQLite / Turso` | **可做超轻原型，不作为默认** | 单人 demo 可行，但对“未来可能有账号/同步/后台任务”的产品路径太短视。 |

### Object Storage

| Choice | Recommendation | Why |
|--------|----------------|-----|
| `暂不引入对象存储` | **默认路径** | 如果当前行政区 bundle 还能通过 `apps/web/public` 或构建产物交付，就先不要加基础设施。 |
| `Cloudflare R2` | **首选托管替代** | 如果后面要把边界包独立版本化并通过 CDN 分发，R2 的 S3 兼容接口足够实用，运维负担低。 |
| `AWS S3` | **AWS 环境优先时选** | 如果未来部署本身就在 AWS，直接用 S3 最自然。 |
| `MinIO` | **只推荐本地或自托管开发环境** | 它适合模拟 S3 兼容接口，不是当前产品必须的线上首选。 |

### Cache

| Choice | Recommendation | Why |
|--------|----------------|-----|
| `不加缓存层` | **默认路径** | 现阶段 API 主要是 trip CRUD 和少量 manifest 读取，没有证据表明必须上缓存。 |
| `Redis / Valkey` | **当 API 读压或限流出现后再加** | 适合缓存热点 manifest、速率限制、后台 job 状态，但不是这个 milestone 的先决条件。 |

### Queue

| Choice | Recommendation | Why |
|--------|----------------|-----|
| `不加队列` | **默认路径** | 还没到“必须后台异步处理”的阶段。 |
| `BullMQ + Redis` | **需要后台导入/导出/预处理时再加** | 如果开始把 GeoJSON 导入、切片、回填等逻辑放到 server，BullMQ 是 Nest 生态里最直接的路径。 |
| `Kafka / RabbitMQ / NATS` | **不建议** | 对这个产品范围明显过重，会把一个简单全栈应用拉成分布式系统。 |

## Installation

```bash
# Workspace foundation
pnpm add -w -D tsx openapi-typescript

# Optional later, only if CI/task graph grows
pnpm add -w -D turbo

# Web app
pnpm add -F @trip-map/web leaflet
pnpm add -F @trip-map/web -D @types/leaflet

# Server app
pnpm add -F @trip-map/server @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config @nestjs/swagger class-validator class-transformer drizzle-orm pg
pnpm add -F @trip-map/server -D @nestjs/cli drizzle-kit

# Optional later: object storage
pnpm add -F @trip-map/server @aws-sdk/client-s3

# Optional later: queue/cache
pnpm add -F @trip-map/server @nestjs/bullmq bullmq ioredis
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `pnpm workspaces` | `Nest CLI monorepo mode` | 只有当整个仓库几乎都是 Nest app / Nest libs 时才有意义。你的仓库是 `Vite web + Nest server` 混合结构，不适合让 Nest CLI 变成顶层 orchestrator。 |
| `NestJS REST + OpenAPI` | `GraphQL` / `tRPC` | 只有当你已经确定前后端要高度联动 schema、并且团队愿意承受更高的协议复杂度时再选。当前 milestone 需要的是清晰边界，不是更深的框架绑定。 |
| `Drizzle + PostgreSQL` | `Prisma + PostgreSQL` | 如果团队更看重 schema-first DX、自动生成 client、并接受更重的 ORM 运行时，可以选 Prisma。它是可行替代，不是更差，只是不是当前范围的最小稳态。 |
| 静态 boundary bundle + manifest | 服务端 `PostGIS` geometry API | 只有当前端静态包体积、访问控制、数据动态更新已经明显不适合静态分发时，再把 geometry 服务化。 |
| 无缓存/队列起步 | `Redis + BullMQ` 从 day 1 引入 | 当后台任务已明确进入第一阶段需求时才值得。否则只是多一层待维护依赖。 |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| 把整个仓库切到 `Nest CLI monorepo` | 它更适合纯 Nest 工作区，不适合现有 Vite 前端作为一等公民继续存在 | 顶层 `pnpm workspaces`，`apps/server` 内部再使用 Nest CLI |
| 一开始就上 `PostGIS` | 你当前主要需求不是服务端空间查询，而是行政区静态分发与记录持久化 | 先用普通 PostgreSQL，几何文件走静态资产/对象存储 |
| 一开始就上 `Redis + BullMQ` | 还没有足够的异步任务密度 | 先做同步 API；等导入/导出/批处理出现再加 |
| 把大块 GeoJSON 存进关系库表里当主存储 | 读写与部署都笨重，也不利于前端按版本分发 | 静态 bundle 或 S3 兼容对象存储 |
| `Kafka` / `RabbitMQ` / 微服务拆分 | 对当前产品范围完全过度设计 | 保持单体 `apps/server` |
| 泛化的 `packages/shared` 杂物包 | 很容易累积跨端耦合和隐式依赖 | 只建有边界的 `packages/contracts` |

## Stack Patterns by Variant

**如果当前阶段目标是尽快把现有前端升级成可持久化的全栈版本：**
- 用 `pnpm workspaces + apps/web + apps/server + packages/contracts`
- 用 `NestJS REST + OpenAPI + PostgreSQL + Drizzle`
- 继续把 boundary 几何作为静态资产或构建产物发给前端
- 因为这是对现有仓库改动最小、收益最大的路径

**如果 boundary 资产在本 milestone 末期已经明显过大，导致前端包体或部署管理变差：**
- 增加 `@aws-sdk/client-s3`
- 把处理后的 GeoJSON / TopoJSON bundle 移到 `R2` 或 `S3`
- 因为这能把“版本化静态大文件”从应用代码和数据库里拆出去

**如果后续 phase 明确要做服务端导入、边界处理流水线、用户导出：**
- 加 `BullMQ + Redis`
- 保持单体 `NestJS`，不要同时引入消息中间件集群
- 因为这类任务只是后台 job，不是要把系统拆成事件驱动架构

**如果未来必须做服务端空间查询或更复杂的地理搜索：**
- 在 PostgreSQL 上补 `PostGIS`
- 把现在的 `boundaryId / placeId / datasetVersion` 设计保留好
- 因为这样能平滑升级，而不是推翻当前静态资产策略

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `Node.js >=20.19` | `Vite 8.0.x`, `NestJS 11.1.x`, `pnpm 10.33.x` | 新环境更建议直接用 `Node 22 LTS`。 |
| `NestJS 11.1.x` | `@nestjs/swagger 11.2.x`, `@nestjs/config 4.0.x`, `@nestjs/platform-express 11.1.x` | 这是当前最稳的 Nest 11 组合。 |
| `drizzle-orm 0.45.x` | `drizzle-kit 0.31.x`, `pg 8.20.x` | 适合作为 Nest + PostgreSQL 的轻量默认栈。 |
| `Leaflet 1.9.4` | `@types/leaflet 1.9.21`, `Vue 3.5.x` | `Leaflet` 本身与 Vue 解耦，适合渐进接入现有前端。 |
| `bullmq 5.71.x` | `@nestjs/bullmq 11.0.x`, `ioredis 5.10.x` | 只有启用后台任务后才需要这组。 |

## Sources

- Repo context: `.planning/PROJECT.md`, `package.json`, `pnpm-workspace.yaml`, `tsconfig.json`
- `pnpm` workspaces docs: https://pnpm.io/workspaces
- NestJS monorepo docs: https://docs.nestjs.com/cli/monorepo
- NestJS OpenAPI docs: https://docs.nestjs.com/openapi/introduction
- NestJS database docs: https://docs.nestjs.com/techniques/database
- Drizzle docs: https://orm.drizzle.team/docs/overview
- Prisma ORM docs: https://www.prisma.io/docs/orm/overview/introduction
- PostgreSQL current docs: https://www.postgresql.org/docs/current/
- BullMQ docs: https://docs.bullmq.io/guide/introduction
- Cloudflare R2 S3 compatibility docs: https://developers.cloudflare.com/r2/api/s3/api/
- `npm view` checked on `2026-03-27`: `@nestjs/core`, `@nestjs/swagger`, `@nestjs/config`, `@nestjs/platform-express`, `@nestjs/platform-fastify`, `@nestjs/cli`, `drizzle-orm`, `drizzle-kit`, `pg`, `leaflet`, `@types/leaflet`, `@aws-sdk/client-s3`, `bullmq`, `@nestjs/bullmq`, `ioredis`, `redis`, `minio`, `openapi-typescript`, `tsx`

---
*Stack research for: 全栈化与行政区地图重构*
*Researched: 2026-03-27*
