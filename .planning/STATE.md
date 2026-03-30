---
gsd_state_version: 1.0
milestone: v3.0
milestone_name: 全栈化与行政区地图重构
status: ready_to_plan
stopped_at: Phase 11 complete; next up Phase 12
last_updated: "2026-03-30T07:31:59.762Z"
last_activity: 2026-03-30
progress:
  total_phases: 5
  completed_phases: 1
  total_plans: 10
  completed_plans: 10
  percent: 90
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-27)

**Core value:** 用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。  
**Current focus:** Phase 12 — canonical-地点语义

## Current Position

Phase: 12
Plan: Not started
Status: Ready to discuss / plan next phase
Last activity: 2026-03-30

Progress: [█████████░] 90%

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

### Pending Todos

None yet.

### Blockers/Concerns

- Canonical `placeId` 对直辖市、自治区、港澳和海外特殊行政区的规则需要在 Phase 12 明文化。
- 中国与海外边界的坐标适配仍需在 Phase 13 验证，避免 `Leaflet` 中出现点击与边界错位。
- 如果后续准备公开部署，还需要额外复核中国数据许可与分发边界。

## Session Continuity

Last session: 2026-03-30T07:31:59.762Z
Stopped at: Phase 11 complete; next up Phase 12
Resume file: None
