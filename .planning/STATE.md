---
gsd_state_version: 1.0
milestone: v3.0
milestone_name: 全栈化与行政区地图重构
status: ready
stopped_at: Completed 12-canonical-05-PLAN.md
last_updated: "2026-03-30T11:17:19.599Z"
last_activity: 2026-03-30
progress:
  total_phases: 5
  completed_phases: 2
  total_plans: 15
  completed_plans: 15
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-27)

**Core value:** 用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。  
**Current focus:** Phase 13 — 行政区数据与几何交付

## Current Position

Phase: 13 (geometry-delivery) — READY
Plan: 0 of TBD
Status: Ready for next phase planning
Last activity: 2026-03-30 -- Completed Phase 12 plan 12-05

Progress: [██████████] 100%

## Last Shipped Milestone

- Version: `v2.0`
- Name: 城市主视角与可爱风格重构
- Status: archived
- Audit: `passed`
- Scope: 4 phases / 17 plans / 31 tasks

## Performance Metrics

**Velocity:**

- Total plans completed: 36
- Average duration: n/a
- Total execution time: n/a

**By Milestone:**

| Milestone | Phases | Plans | Status |
|-----------|--------|-------|--------|
| v1.0 | 1-6 | 17 | Shipped |
| v2.0 | 7-10 | 17 | Shipped |

**Recent Trend:**

- Last milestone pace: stable
- Trend: Stable

| Phase 11-monorepo P01 | 777 | 2 tasks | 14 files |
| Phase 11-monorepo P02 | 12min | 1 tasks | 8 files |
| Phase 11-monorepo P03 | 3min | 1 tasks | 14 files |
| Phase 11-monorepo P07 | 14min | 1 tasks | 13 files |
| Phase 11-monorepo P05 | 22min | 1 tasks | 9 files |
| Phase 11-monorepo P06 | 81min | 1 tasks | 13 files |
| Phase 11-monorepo P09 | 6min | 1 tasks | 7 files |
| Phase 11-monorepo P08 | 4min | 1 tasks | 10 files |
| Phase 11-monorepo P10 | 9min | 1 tasks | 14 files |
| Phase 11-monorepo P04 | 28min | 2 tasks | 11 files |
| Phase 12 P01 | 4min | 2 tasks | 5 files |
| Phase 12 P02 | 10min | 2 tasks | 10 files |
| Phase 12-canonical P03 | 12min | 2 tasks | 10 files |
| Phase 12-canonical P04 | 6min | 2 tasks | 6 files |
| Phase 12-canonical P05 | 5min | 2 tasks | 6 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- `v3.0` 从 Phase 11 开始，按 coarse 粒度压成 5 个 phase，避免写成平台重构。
- `server` 从 `v3.0` 起拥有 canonical area resolve；前端不再长期保留另一套主判定逻辑。
- 几何先走版本化静态资产；中国与海外 GeoJSON 不在数据层合并，`Leaflet` 直接加载两层。
- `v3.0` 不迁移旧 `localStorage` 数据，也不再保留历史 seed 点位。
- [Phase 11-monorepo]: 根 package.json 只保留 turbo 代理脚本，不再承载 Vite/Vue 单应用运行入口。
- [Phase 11-monorepo]: @trip-map/contracts 只暴露类型、常量与 fixture；不引入 Pinia、Vue、Nest 或 Prisma 运行时依赖。
- [Phase 11-monorepo]: apps/web now owns Vite/Vitest/typecheck dependency resolution for legacy imports; the root package stays orchestrator-only.
- [Phase 11-monorepo]: 11-02 keeps apps/web as the sole web shell while legacy root src remains behind an explicit temporary legacy-entry bridge.
- [Phase 11]: 11-03 keeps Nest validation DTO classes inside apps/server while @trip-map/contracts remains runtime-free.
- [Phase 11]: 11-03 bootstraps apps/server with NestJS plus FastifyAdapter and validates HTTP contracts through app.inject()-based e2e tests.
- [Phase 11-monorepo]: 11-07 keeps web service/data/type migration as package-local file ownership only; runtime rewiring stays deferred to 11-09/11-10.
- [Phase 11-monorepo]: apps/web point-storage adds a loadStoredPoints compatibility export to satisfy the moved-module contract without changing snapshot-based behavior.
- [Phase 11-monorepo]: 11-05 只迁移 app shell 与顶层交互组件到 apps/web，supporting modules 继续通过显式 legacy bridge 保留在 root src。
- [Phase 11-monorepo]: 11-05 让 legacy-entry 直接挂载 apps/web/src/App.vue，bootstrap bridge 仅保留样式与 legacy supporting runtime 桥接职责。
- [Phase 11-monorepo]: 11-06 使用 Prisma 连接 Supabase-hosted PostgreSQL，但 server 代码继续保持标准 PostgreSQL/Prisma 边界，不引入 Supabase SDK。
- [Phase 11-monorepo]: 当前开发环境通过 Supabase CLI 验证过的 session pooler URL 跑 migration 与 runtime，保证本机网络下的可达性与真实 smoke 验证。
- [Phase 11-monorepo]: 11-09 keeps Pinia stores and popup anchoring package-local inside apps/web, rewiring only the app shell and top-level runtime consumers.
- [Phase 11-monorepo]: WorldMapStage now resolves its stores, composable, services, and types from apps/web while deferring root asset ownership and bridge cleanup to later plans.
- [Phase 11-monorepo]: 11-08 只迁 non-UI regression specs 与 mountComposable helper 到 apps/web，UI specs 与 bridge cleanup 继续留给后续计划。
- [Phase 11-monorepo]: apps/web 在显式传入 .spec.ts 文件时仅运行请求的 package-local specs，默认 mixed-suite 发现规则保持不变。
- [Phase 11-monorepo]: apps/web/src/main.ts now owns the production bootstrap directly, so global CSS and the world-map asset must be imported from package-local paths instead of lingering in a dead bridge file.
- [Phase 11-monorepo]: The package-local UI regression entry focuses on targeted v2.0 shell/map/popup/drawer/marker behaviors, avoiding unrelated churn in repo-root legacy specs while making apps/web verification self-contained.
- [Phase 11-monorepo]: 11-04 keeps backend baseline UI additive in apps/web above WorldMapStage so backend proof does not disturb the shipped v2 map shell.
- [Phase 11-monorepo]: 11-04 isolates server smoke e2e datasetVersion variants so root pnpm test stays deterministic against the shared PostgreSQL instance.
- [Phase 11-monorepo]: 11-04 routes web health and smoke requests through createApiUrl plus a /api Vite proxy instead of hardcoded backend origins in Vue components.
- [Phase 12]: CanonicalPlaceSummary keeps stable identity separate from region/admin display metadata for all Phase 12 surfaces.
- [Phase 12]: Canonical resolve contracts use resolved/ambiguous/failed unions so failed results never carry fallback place payloads.
- [Phase 12]: Phase 12 server resolve stays fixture-backed inside apps/server so Phase 13 can swap the data source without changing HTTP contracts.
- [Phase 12]: /places/confirm always replays the same click against the authoritative candidate set and rejects out-of-set candidatePlaceId with CANDIDATE_MISMATCH.
- [Phase 12-canonical]: web 继续复用 candidate-select popup 结构，但 server candidate 通过 placeId 兼容投影进入旧 UI 候选模型。
- [Phase 12-canonical]: canonical reopened/reuse 链路统一使用 placeId，cityId 只保留兼容字段。
- [Phase 12-canonical]: apps/web 补 package-local .vue shim 满足计划要求的 tsc --noEmit，而不改根 TypeScript 配置。
- [Phase 12-canonical]: UI regressions now assert canonical title/type/subtitle fields directly instead of city-first aliases.
- [Phase 12-canonical]: Drawer parity tests use the real store handoff path to compare popup and drawer canonical summaries for one saved point.
- [Phase 12-canonical]: web 侧通过显式 canonical boundary 映射表衔接 server boundaryId 与现有可渲染 geometry，不改写持久化字段合同。
- [Phase 12-canonical]: canonical boundary support 统一由真实几何命中决定，legacy city 点位继续保留 cityId coverage 兜底。
- [Phase 12-canonical]: popup 与 drawer 的 boundary 支持态回归必须走 store 派生结果，不再在 spec 里手工注入 supported。

### Pending Todos

None yet.

### Blockers/Concerns

- Canonical `placeId` 对直辖市、自治区、港澳和海外特殊行政区的规则需要在 Phase 12 明文化。
- 中国与海外边界的坐标适配仍需在 Phase 13 验证，避免 `Leaflet` 中出现点击与边界错位。
- 如果后续准备公开部署，还需要额外复核中国数据许可与分发边界。

## Session Continuity

Last session: 2026-03-30T11:16:09.085Z
Stopped at: Completed 12-canonical-05-PLAN.md
Resume file: None
