# Phase 16: UAT gap 修复：边界叠加层、点亮按钮 fallback、smoke record schema、typeLabel 持久化、California 识别 - Research

**Researched:** 2026-04-02
**Domain:** Vue/Nest/Prisma 跨端 gap-fix，覆盖 popup 交互、GeoJSON 叠加、records schema、canonical fixture/resolve 一致性
**Confidence:** MEDIUM-HIGH

## User Constraints

- 本 phase 没有 `CONTEXT.md`；以 `.planning/phases/15-服务端记录与点亮闭环/15-UAT.md` 和 5 份 `.planning/debug/*.md` 作为权威问题定义。
- 范围固定为 5 个问题，不扩成新的 GIS 平台重构：
  - 边界叠加层保存后不出现
  - 点亮按钮对 fallback 点位无反馈
  - smoke record schema 缺字段
  - `typeLabel` / `parentLabel` 持久化缺失
  - California 无法被稳定识别
- 研究输出必须回答 5 件事：
  - 把五个问题重组成适合 planning wave 的实施面
  - 指出高概率改动的精确文件/模块/contract/schema 路径
  - 给出每个问题的验证架构和回归覆盖
  - 补出可替换 roadmap `[To be planned]` 的 phase goal/requirements wording
  - 明确 web / server / contracts / Prisma / tests 的耦合风险
- Phase 16 依赖 Phase 15，默认遵守“最小改动、沿用现有结构与风格”。

## Project Constraints (from CLAUDE.md)

- 与用户交流和文档说明使用中文。
- 改动优先最小化，遵循现有 monorepo 结构与包边界。
- 前端保持 Vue 3 Composition API + `<script setup lang="ts">` + Pinia。
- 后端保持 NestJS 11 + Fastify + Prisma；Prisma schema 位于 `apps/server/prisma/schema.prisma`。
- 共享契约统一放在 `packages/contracts/src/`；修改后必须运行 `pnpm --filter @trip-map/contracts build`。
- 测试统一使用 Vitest；前端是 `happy-dom`，后端 e2e 是 Node 环境。
- 前端改动后应通过 `vue-tsc --noEmit`；整体仍以 `pnpm test` / `pnpm typecheck` 作为 phase gate。

## Summary

这 5 个问题本质上不是 5 个互不相干的 bug，而是 3 条断裂的合同链。第一条是“保存动作 -> GeoJSON feature 已加载 -> 样式刷新可见”的前端地图链；第二条是“canonical summary -> TravelRecord/SmokeRecord -> DB 行 -> reopen/view surface”的持久化链；第三条是“server authoritative fixture -> shared contracts fixture -> web specs/UAT copy”的 canonical 一致性链。只修单点 UI 或单个 schema 字段，都不能把这一组 UAT gap 真正关掉。

最重的耦合风险在 `TravelRecord` 和 canonical fixture。`TravelRecord` 现在只持久化 `displayName + subtitle`，导致 `recordToDisplayPoint()` 只能硬编码 `typeLabel: null`、`parentLabel: null`；而 server fixture 与 `packages/contracts` fixture 在 `placeId` / `datasetVersion` 上已经分叉，造成“spec 绿色、真实点击不一致”。California 识别问题也不是前端单点问题，它暴露的是 server 仍停留在“精确命中 fixture 点”的临时策略，和当前 UAT 的“点击 California 区域即可识别”预期不一致。

**Primary recommendation:** 把 Phase 16 规划成 3 个 wave：先收拢 contracts/Prisma/server 持久化合同，再修前端 popup/fallback/overlay 链，最后统一 canonical fixture 与 California 识别口径；不要在本 phase 顺手升级依赖或重做整套 resolver。

## Recommended Phase Goal & Requirements

**Recommended goal:** 用户在真实地图点击与保存链路中，能稳定看到正确的 canonical 行政区标签、点亮反馈与边界高亮；服务端记录 schema 与 shared contracts 保持一致，且 California 等已承诺支持的海外 admin1 能被 server-authoritative 地识别。

### Derived Phase Requirements

| ID | Description | Why this phase needs it |
|----|-------------|-------------------------|
| REQ-16-01 | 非 canonical fallback 点位不能继续显示一个“可点击但无效果”的点亮按钮；用户必须得到明确的禁用态或提示文案。 | 关闭 Phase 15 UAT test 3 的“按钮点击无效果”假交互。 |
| REQ-16-02 | 点亮成功后，同一 session 内必须加载对应 GeoJSON shard 并显示 saved overlay，而不是只更新 store 状态。 | 关闭边界叠加层不出现。 |
| REQ-16-03 | `SmokeRecord` 必须把 `CanonicalPlaceSummary` 的字段完整落库并从 DB 行 round-trip。 | 关闭 smoke e2e 失败。 |
| REQ-16-04 | `TravelRecord` 必须保留 reopened/view surface 所需的 canonical 展示元数据，至少覆盖 `typeLabel`、`parentLabel`、`subtitle`，推荐一并持久化 `regionSystem`、`adminType`。 | 关闭北京/香港无标签，避免再次 schema churn。 |
| REQ-16-05 | California 识别必须遵循 server-authoritative 结果；shared fixtures、UAT 文案和 server fixture 的 `placeId` / `datasetVersion` / `typeLabel` 口径必须一致。 | 关闭“无法识别”与 fixture 漂移。 |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue | `3.5.21` | popup、Leaflet stage、summary surface 交互 | 已是 `apps/web` 现有运行时；本 phase 只需要沿用，不应升级到 registry 最新 `3.5.31`（verified 2026-03-26）。 |
| Pinia | `3.0.3` | `map-points` / `map-ui` 状态管理 | 现有 store 链已完整接线；只需修正数据投影与 optimistic state，不应切换状态方案。Registry 最新 `3.0.4`（verified 2025-11-05）。 |
| NestJS + Fastify | `11.1.17` / `5.8.4` | `/places/*` 与 `/records*` API | server authoritative boundary 已固定；`@nestjs/common` 当前就是 registry 最新 `11.1.17`（verified 2026-03-16）。 |
| Prisma | `6.19.2` | `SmokeRecord` / `TravelRecord` schema、migration、DB access | 本 phase 的 schema 问题必须用 Prisma migration 解决；不要手写 SQL patch 代替 schema 演进。Registry 最新 `7.6.0`（verified 2026-04-01），但本 phase 不做升级。 |
| Vitest | `3.2.4` | web unit/component 与 server e2e 回归 | 项目统一测试框架；本 phase 所有 regression 都可挂到现有 spec。Registry 最新 `4.1.2`（verified 2026-03-26），本 phase 不升级。 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Leaflet | `1.9.4` | 地图图层与 GeoJSON 高亮 | 只在 `LeafletMapStage.vue` / `useGeoJsonLayers.ts` 层内修 overlay 行为。 |
| `@trip-map/contracts` | workspace | canonical shared types/fixtures | 任何 `TravelRecord` / fixture 改动先落 contracts，再让 web/server 消费。 |
| `d3-geo` | `3.1.1` | 客户端 country/region fallback geo lookup | 仅用于确认 California fallback 能力边界；不能取代 server authoritative canonical resolve。 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 在 `TravelRecord` 里只补 `typeLabel` | 一次性持久化 `regionSystem`、`adminType`、`typeLabel`、`parentLabel`、`subtitle` | 一次性多改几层合同，但能避免之后继续为 `parentLabel` / admin 语义再开新 migration。 |
| 继续在 `handleIlluminate` 里靠 `refreshStyles()` 等待已有 feature | 在成功保存后显式补 `loadShardIfNeeded()`，或直接消费 `geometryRef` loader | 前者改动最小；后者更符合 Phase 13 的 intended API，但改动面更大。 |
| 在前端把 California fallback 直接升级成可保存 canonical 点 | server 侧提供 authoritative California area match，再让前端按 resolved branch 走 | 前端直改最快，但违背 `ARC-02`，还会继续留下真实行为与测试夹层。 |
| 把 contracts fixture 改成新的 server ID 体系之外的第三套别名 | 直接以 server 现有 `placeId` / `datasetVersion` 为准，回写 contracts fixtures | 新别名会引入 saved rows 数据迁移；server 已是 authoratitive source，更适合作为对齐目标。 |

**Installation:**

```bash
# 无新增依赖，沿用现有 workspace
pnpm --filter @trip-map/contracts build
pnpm --filter @trip-map/server exec prisma generate
```

**Version verification:** 2026-04-02 已通过 `npm view vue version time.modified`、`npm view pinia version time.modified`、`npm view vitest version time.modified`、`npm view prisma version time.modified`、`npm view @nestjs/common version time.modified` 核对 registry 最新版本与发布时间。Phase 16 推荐沿用仓库锁定版本，不把 gap-fix 扩成依赖升级。

## Architecture Patterns

### Recommended Project Structure

```text
packages/contracts/src/
├── place.ts               # CanonicalPlaceSummary 定义
├── records.ts             # TravelRecord / CreateTravelRecordRequest / SmokeRecord*
└── fixtures.ts            # web tests 使用的 canonical fixtures

apps/server/
├── prisma/
│   ├── schema.prisma      # SmokeRecord / TravelRecord schema
│   └── migrations/        # Phase 16 需要新增 migration
└── src/modules/
    ├── records/           # DTO / repository / service / controller
    └── canonical-places/  # fixture catalog + resolve service

apps/web/src/
├── components/
│   ├── LeafletMapStage.vue
│   └── map-popup/         # PointSummaryCard / MapContextPopup
├── stores/
│   └── map-points.ts
└── services/
    ├── api/records.ts
    └── geometry-loader.ts
```

### Recommended Wave Grouping

| Wave | Scope | Problems Closed | Primary Files |
|------|-------|-----------------|---------------|
| Wave 1 | contracts + Prisma + server records contract | smoke schema、typeLabel 持久化基础 | `packages/contracts/src/records.ts`, `apps/server/prisma/schema.prisma`, `apps/server/src/modules/records/*` |
| Wave 2 | web popup fallback + illuminate overlay | 点亮按钮 fallback、边界叠加层 | `apps/web/src/components/LeafletMapStage.vue`, `apps/web/src/components/map-popup/PointSummaryCard.vue`, `apps/web/src/stores/map-points.ts` |
| Wave 3 | canonical fixture alignment + California resolve/UAT wording | California 识别、fixture 漂移、label 口径 | `apps/server/src/modules/canonical-places/*`, `packages/contracts/src/fixtures.ts`, `apps/server/test/canonical-resolve.e2e-spec.ts` |

### Pattern 1: Contract-First Persistence

**What:** 任何 `TravelRecord` / `SmokeRecord` 字段补齐都必须按 `contracts -> DTO -> Prisma schema -> repository -> service -> web API client/store -> tests` 的顺序推进。

**When to use:** 只要 DB 中的 record shape 要变，哪怕只是 `typeLabel` 一项。

**Example:**

```ts
// Source: packages/contracts/src/place.ts + packages/contracts/src/records.ts
interface TravelRecord {
  id: string
  placeId: string
  boundaryId: string
  placeKind: PlaceKind
  datasetVersion: string
  displayName: string
  regionSystem: 'CN' | 'OVERSEAS'
  adminType: ChinaAdminType | 'ADMIN1'
  typeLabel: string
  parentLabel: string
  subtitle: string
  createdAt: string
}
```

### Pattern 2: Save Path Must Ensure Feature Presence Before Styling

**What:** saved overlay 是否可见，取决于 layer 里是否已经有该 `boundaryId` 的 feature；单纯 `refreshStyles()` 不能“画出”不存在的 feature。

**When to use:** `handleIlluminate`、saved-record bootstrap、任何通过 API 新增 saved boundary 的流程。

**Example:**

```ts
// Source: apps/web/src/components/LeafletMapStage.vue + apps/web/src/composables/useGeoJsonLayers.ts
await mapPointsStore.illuminate(summary)
await loadShardIfNeeded(point.boundaryId, point.regionSystem)
// addFeatures(...) 之后，refreshStyles() 才有可样式化的 feature
```

### Pattern 3: Server-Authoritative Canonical Semantics

**What:** 用户点击 California、北京、香港时，最终可保存/可重开的 canonical identity 必须以 server resolve 返回的 `placeId` / `datasetVersion` / labels 为准，而不是 web fixture 或 client fallback 自己发明的 identity。

**When to use:** 任何涉及 `placeId`、California resolve、fixture 调整、saved-record reopen 的改动。

**Example:**

```ts
// Source: apps/server/src/modules/canonical-places/canonical-places.service.ts
const response = await resolveCanonicalPlace({ lat, lng })
if (response.status === 'resolved') {
  applyResolvedPlace(response.place, response.click)
}
```

### Likely Change Surface

| Area | Files | Why |
|------|-------|-----|
| TravelRecord contract expansion | `packages/contracts/src/records.ts`, `packages/contracts/src/contracts.spec.ts` | `TravelRecord` 现在不含 `typeLabel` / `parentLabel` / `regionSystem` / `adminType`。 |
| SmokeRecord schema parity | `apps/server/prisma/schema.prisma`, `apps/server/prisma/migrations/*`, `apps/server/src/modules/records/records.repository.ts` | DB 行缺 5 个 canonical 字段。 |
| TravelRecord schema parity | `apps/server/prisma/schema.prisma`, `apps/server/src/modules/records/dto/create-travel-record.dto.ts`, `apps/server/src/modules/records/records.service.ts`, `apps/server/src/modules/records/records.repository.ts` | 持久化链需要接住 canonical 展示元数据。 |
| Web reopen/view projection | `apps/web/src/stores/map-points.ts`, `apps/web/src/services/api/records.ts` | `recordToDisplayPoint()` 当前硬编码 null label。 |
| Popup illuminate affordance | `apps/web/src/components/map-popup/PointSummaryCard.vue`, `apps/web/src/components/map-popup/MapContextPopup.vue`, `apps/web/src/components/LeafletMapStage.vue` | fallback 点位可点击但无效果。 |
| Saved overlay loading | `apps/web/src/components/LeafletMapStage.vue`, 可选 `apps/web/src/services/geometry-loader.ts` | save path 没有补 feature load。 |
| Canonical fixture alignment | `apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts`, `packages/contracts/src/fixtures.ts`, `apps/server/test/canonical-resolve.e2e-spec.ts` | `placeId` / `datasetVersion` / California label 口径不一致。 |
| Web/server regression specs | `apps/web/src/components/LeafletMapStage.spec.ts`, `apps/web/src/stores/map-points.spec.ts`, `apps/web/src/components/map-popup/PointSummaryCard.spec.ts`, `apps/server/test/records-smoke.e2e-spec.ts`, `apps/server/test/records-travel.e2e-spec.ts`, `apps/server/test/records-contract.e2e-spec.ts`, `apps/server/test/canonical-resolve.e2e-spec.ts` | 现有 spec 覆盖不足或断言旧 shape。 |

### Anti-Patterns to Avoid

- **只改 UI，不改合同链：** 只把按钮隐藏/禁用，不补 `TravelRecord` / `SmokeRecord` schema，会留下 reopen/view 和 smoke e2e 失败。
- **把 California canonical 化放回客户端：** 这会继续违反 `ARC-02`，让 web fallback 成为“第二套 authoritative resolver”。
- **改 server `placeId` 去迎合 contracts fixture：** 现有 DB 中已经可能保存 server 发出的 `placeId`；反向改 server 会引入数据迁移风险。
- **依赖 `subtitle` 字符串反推 typeLabel：** 文案不是稳定主键；应持久化 canonical 字段，而不是解析自然语言。

## Coupling Risks

| Risk | Coupled Paths | Planning Implication |
|------|---------------|----------------------|
| `TravelRecord` 字段扩展会跨 3 个包 | contracts -> server DTO/service/repository -> web store/API -> specs | Wave 1 需要原子完成，否则类型和运行时会同时坏。 |
| fixture 对齐如果改 server ID，会波及已有 saved rows | `apps/server/src/modules/canonical-places/fixtures/*` -> DB `TravelRecord.placeId` -> web reopen | 推荐以 server 现有 ID 为准，更新 contracts fixtures，而不是反过来。 |
| label 文案如果从 `一级行政区` 改成 `State`，会变成持久化数据差异 | server fixtures -> contracts fixtures -> `TravelRecord.typeLabel` -> web popup/spec/UAT | 先锁定文案口径，再落 schema；否则还要补数据迁移。 |
| server e2e 依赖远程 PostgreSQL | Prisma `.env` / Supabase pooler -> `records-smoke` / `records-travel` / `records-contract` e2e | 计划中必须显式安排“DB connectivity restored”验证点，否则 server wave 无法闭环。 |

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 已保存边界高亮 | 手写第三套图层缓存或重新合并 GeoJSON | 现有 `loadShardIfNeeded()` / `useGeoJsonLayers()` / `geometry-loader.ts` | 现有问题不是“没有 loader”，而是 save path 没调用它。 |
| canonical 展示元数据恢复 | 从 `displayName` / `subtitle` 解析 label | 持久化 canonical summary projection | 解析文案不稳定，且会在多语言/复制调整时再次出错。 |
| schema 修复 | 只在 service response 上临时补字段 | Prisma schema + migration + repository write | 当前 smoke response 已能“看起来正确”，但 DB 行仍缺字段。 |
| California 识别 | 前端 fallback 直接产出可保存 canonical record | server authoritative match + web 只消费 resolved branch | 符合 `ARC-02`，也避免 web/spec/live 三套语义分裂。 |

**Key insight:** 这一 phase 最大的坑不是“缺一行判断”，而是“看似工作正常的表层 response 或 UI 实际没有穿透到 DB / authoritative resolve / reopen path”。规划时必须按合同链和数据链来分 wave。

## Runtime State Inventory

> 本 phase 涉及 Prisma schema migration 和已保存记录语义修复，因此必须审视 repo 外的 runtime state。由于 2026-04-02 当前环境无法连上项目 PostgreSQL，以下盘点对“现有数据量”是 MEDIUM confidence，但对“哪些状态会受影响”是 HIGH confidence。

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | PostgreSQL 中的 `SmokeRecord`、`TravelRecord` 表都受影响。`SmokeRecord` 当前 schema 缺 `regionSystem` / `adminType` / `typeLabel` / `parentLabel` / `subtitle`。`TravelRecord` 当前 schema 缺 canonical 展示元数据；现有行数未知，因为本地无法连上 DB。 | `SmokeRecord`: schema migration + repository write，通常无需回填历史测试数据。`TravelRecord`: schema migration 必做；若要让现有 saved rows 立即恢复标签，需数据 migration/backfill（可按 `placeId` 对 canonical catalog 回填），否则只能保证新写入记录正确。 |
| Live service config | 未发现 repo 外 UI/后台配置中保存这批字段名或 resolver 行为。当前 phase 主要是代码/DB 合同问题。 | None — verified by repo scan and debug artifacts。 |
| OS-registered state | None — 未发现 launchd/systemd/pm2 等以本 phase 字段为键的注册状态。 | None。 |
| Secrets/env vars | `DATABASE_URL`、`DIRECT_URL`、`SHADOW_DATABASE_URL` 由 `apps/server/prisma.config.ts` 读取和规范化。字段名本 phase 不改，但 migration 与 server e2e 都依赖它们指向可达 PostgreSQL。 | 无 key rename；需要保证执行 phase 时 DB env 可达。 |
| Build artifacts | `@trip-map/contracts/dist`、Prisma generated client、`apps/server/dist` 都会在 schema/contract 变更后过期。 | 代码编辑后执行 `pnpm --filter @trip-map/contracts build`、`pnpm --filter @trip-map/server exec prisma generate`；如产生 migration，再跑对应 migrate/validate。 |

## Common Pitfalls

### Pitfall 1: 修了按钮视觉，没修 fallback 行为

**What goes wrong:** `PointSummaryCard` 仍渲染“点亮”按钮，但 `LeafletMapStage.handleIlluminate()` 在 `placeId/placeKind/datasetVersion` 为空时静默 return。  
**Why it happens:** 可见性只看 `candidate-select` 与否，不看当前 surface 是否有 canonical identity。  
**How to avoid:** 让 CTA 的可点击性与 canonical identity 绑定；fallback surface 要么隐藏按钮，要么 disabled + 明示 notice。  
**Warning signs:** 点击后无 API、无 pending、无 notice、无 store 变动。

### Pitfall 2: 只补 `typeLabel`，不补整条 reopen contract

**What goes wrong:** 北京/香港标签回来了，但后续又因为 `parentLabel` / `adminType` 缺失再开第二个 schema phase。  
**Why it happens:** `TravelRecord` 现在只是最小文本投影，不是 canonical summary projection。  
**How to avoid:** 一次性决定 `TravelRecord` 的 canonical metadata 边界，并同步 DTO / Prisma / web store。  
**Warning signs:** `recordToDisplayPoint()` 还在给 canonical 字段写 `null` 或用字符串猜测。

### Pitfall 3: tests 绿了，但 live 行为还是漂

**What goes wrong:** web specs 继续使用 `packages/contracts/src/fixtures.ts`，server live 继续返回另一套 `placeId` / `datasetVersion`。  
**Why it happens:** tests 固定在 shared fixture，真实 server fixture 却没有同源。  
**How to avoid:** 锁定一个 authoritative source；对于当前架构，应以 server fixture 为准并同步 contracts fixture。  
**Warning signs:** spec 中出现 `cn-admin-beijing`，而 server e2e / live response 仍是 `cn-beijing`。

### Pitfall 4: 认为“刷新样式”就等于“叠加层可见”

**What goes wrong:** `savedBoundaryIds` 已更新，但地图上还是没有边界。  
**Why it happens:** layer 里没有这个 `boundaryId` 的 feature，`setStyle()` 只能改已有 feature 的样式。  
**How to avoid:** 把“加载 shard/feature”视为 save path 的显式步骤，而不是副作用碰运气。  
**Warning signs:** `refreshStyles()` 触发了，但 `addFeatures()` 没被调用。

### Pitfall 5: 计划里假设 server e2e 可随时跑

**What goes wrong:** Phase 16 计划写了大量 DB-backed verification，但执行时 PostgreSQL 不可达导致所有 server 波次阻塞。  
**Why it happens:** 当前环境全局没有 `psql/pg_isready`，而且 2026-04-02 直接跑 server e2e 已报 Supabase pooler unreachable。  
**How to avoid:** 在计划里把 DB availability 当成显式前提；web 回归和 contracts build 可先行，server schema/e2e 要 gated。  
**Warning signs:** `PrismaClientInitializationError: Can't reach database server at aws-1-ap-southeast-1.pooler.supabase.com:5432`。

## Code Examples

Verified patterns from current repo:

### Canonical Resolved Place Already Carries the UI Labels You Need

```ts
// Source: apps/web/src/components/LeafletMapStage.vue
function buildCanonicalDraftPoint(place, geo) {
  return {
    placeId: place.placeId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
    boundaryId: place.boundaryId,
    lat: geo.lat,
    lng: geo.lng,
    source: 'detected',
  }
}
```

**Use this pattern:** saved-record reopen 应直接复用这些 canonical fields，而不是在 `recordToDisplayPoint()` 里丢掉它们。

### Geometry Loader Is Already Shard-Aware

```ts
// Source: apps/web/src/services/geometry-loader.ts
export async function loadGeometryFeatureByRef(geometryRef: GeometryRef) {
  const shard = await loadGeometryShard(
    geometryRef.geometryDatasetVersion,
    geometryRef.assetKey,
  )

  const lookupId = geometryRef.renderableId ?? geometryRef.boundaryId
  return shard.features.find(
    (f) => f.properties.renderableId === lookupId || f.properties.boundaryId === lookupId,
  ) ?? null
}
```

**Use this pattern:** Phase 16 不需要再发明新的 overlay loader；只要确保保存路径会走到已有 loader/`addFeatures()`。

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `TravelRecord` 只存 `displayName + subtitle` | `TravelRecord` 应保存 reopen 所需 canonical metadata projection | 推荐在 Phase 16 落地 | 已保存记录重新打开时不再丢失标签语义。 |
| save path 只更新 store + style refresh | save path 显式保证对应 geometry shard 已加载 | 推荐在 Phase 16 落地 | 保存成功后 overlay 在同一 session 立即可见。 |
| server resolve 只接受“精确点命中 fixture” | 对承诺支持的 California 等点位提供真实点击可命中的 authoritative area match | 推荐在 Phase 16 落地 | UAT 从“点击代表点才成功”提升为“点击区域即可成功”。 |
| contracts fixtures 独立维护一套 canonical IDs | shared fixtures 与 server authoritative fixture 同步 | 推荐在 Phase 16 落地 | 避免 spec/live 分叉。 |

**Deprecated/outdated:**

- `LeafletMapStage.handleIlluminate()` 中的 silent guard return。
- `recordToDisplayPoint()` 对 canonical label 字段硬编码 `null`。
- `packages/contracts/src/fixtures.ts` 与 server fixture catalog 的 `placeId` / `datasetVersion` 漂移。
- 把 California UAT 建立在“精确代表点点击”之上的隐含假设。

## Open Questions

1. **California 的类型标签是否坚持中文统一口径？**
   - What we know: 当前 server 与 contracts fixtures 都是 `typeLabel: '一级行政区'`，但 debug/UAT 文案里出现了 `"State"`。
   - What's unclear: 用户是否真的要对海外 admin1 特判英文标签。
   - Recommendation: 默认继续用中文统一口径；如果要改为 `State`，必须同批调整 server fixtures、contracts fixtures、spec、UAT wording，并评估 `TravelRecord.typeLabel` 的历史数据是否要 backfill。

2. **TravelRecord 历史数据要不要 backfill？**
   - What we know: 现有 DB 行数未知；当前环境无法连库，但结构上旧行一定没有 `typeLabel` / `parentLabel` 等新列。
   - What's unclear: Phase 16 是否要求“旧已保存记录立即恢复标签”，还是只要求“新写入记录正确”。
   - Recommendation: 如果 milestone 验收会重开旧记录做视觉核对，则需要数据 migration；否则可以先允许新列 nullable 并把 backfill 记作后续明确任务。

3. **California 识别采用哪种最小 authoritative 实现？**
   - What we know: client `lookupCountryRegionByCoordinates()` 已能做 region-level fallback；server `findFixture()` 仍是 ±0.0001 精确点命中。
   - What's unclear: 是做“较宽容的 bbox/representative region match”，还是直接引入基于现有静态 geometry 的点落区判断。
   - Recommendation: 以 server-authoritative 为前提，选最小可交付方案；若只为本次 gap-fix，优先用 deterministic area/bbox match，不在本 phase 引入完整 GIS 查询栈。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | 全部 workspace scripts | ✓ | `v22.22.1` | — |
| pnpm | monorepo build/test/typecheck | ✓ | `10.33.0` | — |
| Prisma CLI | schema validate / generate / migrate | ✓（package-local） | `6.19.2` via `pnpm --filter @trip-map/server exec prisma --version` | 无全局 `prisma` 时使用 package-local exec |
| PostgreSQL connectivity | `records-smoke` / `records-travel` / migration | ✗（2026-04-02 当前会话） | — | 无 |
| `psql` / `pg_isready` | 手动 DB probe | ✗ | — | 仅能通过 Prisma/应用级命令间接验证 |

**Missing dependencies with no fallback:**

- 可达的 PostgreSQL/Supabase 连接。2026-04-02 运行 `pnpm --filter @trip-map/server test -- test/records-smoke.e2e-spec.ts` 时，实际报错为 `Can't reach database server at aws-1-ap-southeast-1.pooler.supabase.com:5432`。

**Missing dependencies with fallback:**

- 全局 `prisma` CLI 未安装；可用 `pnpm --filter @trip-map/server exec prisma ...`。

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `3.2.4`（web: `happy-dom`，server: Node e2e） |
| Config file | `apps/web/vitest.config.ts`, `apps/server/vitest.config.ts`, `packages/contracts` 使用默认 Vitest 配置 |
| Quick run command | `pnpm --filter @trip-map/web exec vitest run src/components/map-popup/PointSummaryCard.spec.ts src/stores/map-points.spec.ts src/components/LeafletMapStage.spec.ts` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-16-01 | fallback surface 不再出现“可点击但无效果”的点亮按钮；点击会得到可见反馈 | component | `pnpm --filter @trip-map/web exec vitest run src/components/map-popup/PointSummaryCard.spec.ts src/components/LeafletMapStage.spec.ts` | ✅ extend |
| REQ-16-02 | 点亮成功后会触发 shard load 并让 saved overlay 可见 | component/integration | `pnpm --filter @trip-map/web exec vitest run src/components/LeafletMapStage.spec.ts src/stores/map-points.spec.ts` | ✅ extend |
| REQ-16-03 | `SmokeRecord` DB 行完整 round-trip canonical fields | server e2e | `pnpm --filter @trip-map/server exec vitest run test/records-smoke.e2e-spec.ts test/records-contract.e2e-spec.ts` | ✅ extend |
| REQ-16-04 | TravelRecord 创建/读取/重开后仍保留 canonical labels | server e2e + web unit | `pnpm --filter @trip-map/server exec vitest run test/records-travel.e2e-spec.ts` and `pnpm --filter @trip-map/web exec vitest run src/stores/map-points.spec.ts src/components/map-popup/PointSummaryCard.spec.ts` | ✅ extend |
| REQ-16-05 | California 真实点击可命中 canonical resolved branch，且 fixture/文案一致 | server e2e + contracts spec | `pnpm --filter @trip-map/server exec vitest run test/canonical-resolve.e2e-spec.ts` and `pnpm --filter @trip-map/contracts test` | ✅ extend |

### Sampling Rate

- **Per task commit:** 跑对应 web specs；涉及 contracts 或 server schema 时，额外跑 `pnpm --filter @trip-map/contracts build` 与相关 server e2e（前提是 DB 可达）。
- **Per wave merge:** Wave 1 跑 contracts build + server e2e；Wave 2 跑 web targeted specs；Wave 3 跑 canonical resolve e2e + web popup specs。
- **Phase gate:** `pnpm test` + `pnpm typecheck` 全绿，并手动复现 5 个 UAT gap。

### Wave 0 Gaps

- [ ] `apps/web/src/components/LeafletMapStage.spec.ts` — 新增 fallback illuminate notice / disable coverage，以及 illuminate 后 shard load coverage。
- [ ] `apps/web/src/stores/map-points.spec.ts` — 新增 `TravelRecord` canonical metadata rehydrate 覆盖。
- [ ] `apps/server/test/records-travel.e2e-spec.ts` — 新增 `regionSystem` / `adminType` / `typeLabel` / `parentLabel` 断言。
- [ ] `apps/server/test/canonical-resolve.e2e-spec.ts` — 新增 California 非精确代表点点击覆盖，并锁定 authoritative label/ID 口径。
- [ ] DB connectivity restored — 当前 server e2e 因远程 PostgreSQL 不可达而无法作为 phase gate。

## Sources

### Primary (HIGH confidence)

- `.planning/phases/15-服务端记录与点亮闭环/15-UAT.md` - Phase 15 UAT gap 列表与 root cause 摘要
- `.planning/debug/illuminate-button-no-effect.md` - fallback illuminate silent guard 证据
- `.planning/debug/geojson-boundary-not-showing.md` - save path 未加载 shard 的证据
- `.planning/debug/records-smoke-test-failure.md` - `SmokeRecord` schema 缺字段证据
- `.planning/debug/beijing-no-type-label.md` - `TravelRecord` / fixture 漂移证据
- `.planning/debug/hk-no-type-label.md` - `TravelRecord` label 丢失证据
- `.planning/debug/california-not-recognized.md` - exact fixture click match 证据
- `apps/web/src/components/LeafletMapStage.vue` - resolved/draft/fallback/illuminate/save path 实现
- `apps/web/src/stores/map-points.ts` - `recordToDisplayPoint()` 与 optimistic `illuminate()` 实现
- `apps/web/src/components/map-popup/PointSummaryCard.vue` - button 可见性与 disabled 逻辑
- `apps/server/prisma/schema.prisma` - `SmokeRecord` / `TravelRecord` 当前 schema
- `apps/server/src/modules/records/*` - DTO / repository / service 当前合同链
- `apps/server/src/modules/canonical-places/*` - server authoritative fixture 与 resolve 逻辑
- `apps/server/test/records-smoke.e2e-spec.ts`, `apps/server/test/records-contract.e2e-spec.ts`, `apps/server/test/records-travel.e2e-spec.ts`, `apps/server/test/canonical-resolve.e2e-spec.ts` - 当前 server regression coverage
- `apps/web/src/components/LeafletMapStage.spec.ts`, `apps/web/src/stores/map-points.spec.ts`, `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` - 当前 web regression coverage
- `apps/server/prisma.config.ts` - Prisma CLI 与 env 加载方式

### Secondary (MEDIUM confidence)

- `npm view vue version time.modified`
- `npm view pinia version time.modified`
- `npm view vitest version time.modified`
- `npm view prisma version time.modified`
- `npm view @nestjs/common version time.modified`

### Tertiary (LOW confidence)

- None.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - 来自 repo `package.json`、workspace config 和 2026-04-02 的 npm registry version check。
- Architecture: MEDIUM-HIGH - 主要来自真实代码路径与 tests；California 的最小 authoritative 实现方案仍有一项待定。
- Pitfalls: HIGH - 全部由 UAT/debug artifact 和代码静态审计直接支撑。

**Research date:** 2026-04-02
**Valid until:** 2026-04-09
