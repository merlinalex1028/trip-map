# Phase 11: Monorepo 与契约基线 - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段只负责把当前单体前端重构为可独立运行的 `web + server + contracts` monorepo 基线，并锁定 v3.0 后续阶段都会依赖的共享字段契约、服务端工程骨架，以及 PostgreSQL 持久化底座。

Phase 11 的目标是把“前后端边界已经成立”这件事做成可验证事实，而不是在这一阶段就完成完整的 canonical 地点解析、Leaflet 地图迁移、行政区几何交付或最终记录 CRUD 闭环；这些分别属于 Phase 12-15。

</domain>

<decisions>
## Implementation Decisions

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

### the agent's Discretion
- `turbo.json` 中具体 task pipeline、缓存粒度与命名方式，只要能稳定支撑 `dev/build/test` 的多应用协作。
- `packages/contracts` 内部采用哪种 schema 组织方式与文件划分，只要保持“薄契约层、不承载业务逻辑”的原则。
- `apps/server` 在 NestJS 评估前的最小框架落点与模块划分方式，只要不妨碍后续切向正式后端架构。
- `Prisma` schema 的具体目录、生成物位置与环境变量命名，只要保持 PostgreSQL 可移植性，不绑定 Supabase 私有能力。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone scope and requirements
- `.planning/ROADMAP.md` — Phase 11 的目标、依赖与成功标准，明确本阶段只锁定 monorepo、契约和持久化基线
- `.planning/REQUIREMENTS.md` — Phase 11 直接对应的 `ARC-01`、`ARC-03`、`ARC-04` 与 `API-04`
- `.planning/PROJECT.md` — v3.0 里程碑目标、全局约束、技术栈边界与“不默认引入复杂基础设施”的原则
- `.planning/STATE.md` — 当前 milestone 状态，以及 `server` 作为后续 canonical area resolve 真源的阶段顺序约束

### Product and architecture research
- `.planning/research/FEATURES.md` — 已整理的 monorepo、共享契约、API 职责切分与基础设施护栏研究结论
- `PRD.md` §8-10 — 旧单体前端的模块划分、原始目录建议与技术原则，用于识别哪些职责应迁出前端

### Prior phase decisions that still constrain Phase 11
- `.planning/phases/07-城市选择与兼容基线/07-CONTEXT.md` — 已锁定稳定 `cityId` 与复用规则，是升级到 canonical `placeId` 前的重要身份背景
- `.planning/phases/08-城市边界高亮语义/08-CONTEXT.md` — 已锁定 `boundaryId` 与 `datasetVersion` 的边界恢复语义，Phase 11 的契约必须延续这些字段
- `.planning/phases/09-popup/09-CONTEXT.md` — popup + drawer 的主链路分工已成立，后端与契约改造不能破坏该交互边界
- `.planning/phases/10-可爱风格与可读性收口/10-CONTEXT.md` — 当前 v2.0 已交付的桌面主链路、视觉与状态辨识合同，需要在后续全栈化中保持稳定

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `package.json`: 当前仍是单应用 `vite` 脚本骨架，是拆成 workspace 任务的直接起点。
- `pnpm-workspace.yaml`: 仓库已经启用 pnpm workspace 文件，但尚未承载真正的多包结构，适合直接扩成 monorepo 基线。
- `src/types/map-point.ts`: 已承载 `boundaryId`、`boundaryDatasetVersion`、城市身份字段与摘要表面状态，是抽出共享记录/地点 DTO 的第一手来源。
- `src/types/geo.ts`: 已定义识别结果、边界 feature 与 datasetVersion 相关类型，是收口 `placeKind` / 边界契约的现有语义基础。
- `src/stores/map-points.ts`: 当前集中管理记录、草稿、选中态与持久化调用，是识别“哪些职责应该继续留在 web，哪些应后移到 server”的核心入口。
- `src/services/point-storage.ts`: 当前本地快照、合并和容错逻辑都在这里，适合作为后续 records API 替代目标的现状基线。

### Established Patterns
- 当前前端使用 `Vue 3 + Vite + TypeScript + Pinia`，说明 `apps/web` 不需要重选前端框架，重点是迁移目录和运行边界。
- 现有领域类型散落在 `src/types` 与 store/service 间，缺少前后端共享契约层；Phase 11 的核心价值就是把关键字段收口到 `contracts`。
- v2.0 仍以本地静态 geo 数据 + `localStorage` 为运行基础，这些路径在 v3.0 不再是正式 canonical 持久化方案，但其字段语义必须被继承和升级。
- 当前仓库还没有任何 server、DB schema 或 migration 目录，说明 Phase 11 需要从零建立服务端与数据库工程骨架，而不是接入现成后端。

### Integration Points
- `apps/web` 需要承接当前 `src/` 单体前端代码，并逐步把 API 调用从直接本地存储切向 `apps/server`。
- `packages/contracts` 需要从 `src/types/map-point.ts` 与 `src/types/geo.ts` 中抽出共享字段和 payload 契约，但不要把 `Pinia`、UI 状态或 helper 逻辑一起搬过去。
- `apps/server` 需要为后续 records API、canonical place resolve 与数据库访问建立稳定入口，并先验证最小跨端调用链路。
- 数据库建模需要为后续 `placeId`、`boundaryId`、`placeKind`、`datasetVersion` 和记录状态预留扩展空间，同时保持对普通 PostgreSQL 的可移植性。

</code_context>

<specifics>
## Specific Ideas

- Monorepo 先收口成 `apps/web + apps/server + packages/contracts`，不要在第 11 阶段把共享层做胖。
- `contracts` 更像“前后端通信宪法”，重点是字段、schema 和 DTO，而不是帮两边复用业务逻辑。
- PostgreSQL 直接使用 Supabase 托管实例，不在本地额外创建数据库，但仍然把 Prisma schema / migration 设计成可迁移到任意 PostgreSQL。
- Phase 11 需要有一条真实的 `web -> server -> DB` smoke path，证明后续 phases 不是建立在空架子上。

</specifics>

<deferred>
## Deferred Ideas

- 在 Phase 11 同时完成完整 records CRUD、点亮/取消点亮 mutation 闭环 — 属于 Phase 15 主交付
- 在 Phase 11 就把 canonical 地点解析全部后移到 server — 属于 Phase 12 的主交付
- 在 Phase 11 引入 `PostGIS`、`Redis`、`BullMQ`、对象存储或更复杂的多服务基础设施 — 超出当前 milestone 护栏
- 把共享格式化函数、业务规则引擎或跨端 helper 大量塞进 `contracts` — 会把薄契约层提前做胖

</deferred>

---
*Phase: 11-monorepo*
*Context gathered: 2026-03-27*
