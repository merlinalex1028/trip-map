# Phase 26: Overseas Coverage Foundation - Research

**Researched:** 2026-04-16
**Domain:** 海外 admin1 几何覆盖、canonical metadata 持久化、popup 内 unsupported 反馈
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### 首批覆盖范围 [VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md]
- **D-01:** 首批海外 admin1 覆盖国家/地区锁定为 `JP / KR / TH / SG / MY / AE / AU / US`，优先服务东亚、东南亚与少量远程热门目的地。
- **D-02:** v5.0 只承诺这组优先国家/地区的 admin1 可稳定识别与点亮，不扩展成“全球任意国家都应该可点亮”的承诺口径。

#### 未支持地区反馈 [VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md]
- **D-03:** 对暂未支持点亮的海外区域，反馈以当前地点 popup 内的明确说明为主，不额外弹全局 `interactionNotice`。
- **D-04:** 未支持地区仍允许展示识别结果，但必须明确表达“该地区暂不支持点亮”，避免用户把无保存能力误解为点击失效或网络错误。

#### 海外命名与记录展示 [VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md]
- **D-05:** 海外 admin1 的 `displayName` 以英文 canonical 名为主，不在 Phase 26 引入系统级中文翻译表作为主标题真源。
- **D-06:** `typeLabel` 继续沿用当前中文体系，海外 admin1 统一使用类似“一级行政区”的中文类型标签。
- **D-07:** `subtitle` 采用稳定的英文国家名 + 中文类型说明格式，例如 `United States · 一级行政区`，确保保存后刷新、重开和跨设备仍保持一致。

#### 候选确认交互 [VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md]
- **D-08:** 单一且明确的 canonical 命中结果直接进入正常地点详情与点亮链路，不额外增加确认步骤。
- **D-09:** 只有在多候选或边界模糊的 `ambiguous` 情况下，才进入候选确认流程；Phase 26 不把“每次海外点亮都先确认”作为默认交互。

### Claude's Discretion
[VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md]
- 首批 8 个国家/地区的具体计划拆分顺序、按国家还是按数据链路切 plan，可由 planner 决定，只要不突破已锁定范围。
- popup 内“暂不支持点亮”的具体中文文案、视觉层级和是否附带轻量说明句，可由 the agent 决定，但不能变成全局 notice 主导。
- 英文 admin1 名称是否保留缩写、连字符或 source 数据的标准拼写，可由 researcher / planner 在不破坏稳定性的前提下微调，但必须保证同一记录链路前后显示一致。

### Deferred Ideas (OUT OF SCOPE)
[VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md]
- 全球范围海外 admin1 全量覆盖
- 海外城市级统一覆盖或比 admin1 更细粒度的海外层级
- 系统级多语言翻译表、按语言切换海外地名展示
- 海外点亮后的专用说明面板、同步中心或更复杂的 unsupported 区域帮助中心
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| OVRS-01 | 用户可以在一组优先海外国家/地区的一级行政区上稳定识别并点亮地点 | 用现有 `Natural Earth -> generated geometry manifest -> CanonicalPlacesService` 链路，但把海外支持范围收口到锁定 8 国并增加国家级/边界级 allowlist 清洗，避免把全球 4557 个 admin1 一起当成 Phase 26 支持面。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs][VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts][VERIFIED: apps/server/src/modules/canonical-places/canonical-places.service.ts] |
| OVRS-02 | 已保存的海外旅行记录在刷新、重开和跨设备后，仍能稳定显示标题、类型标签和副标题 | 继续把 `displayName` / `typeLabel` / `parentLabel` / `subtitle` 在 authoritative resolve 后一次性写入 `UserTravelRecord`，并通过 `/auth/bootstrap` 原样回放；不要在 bootstrap 或 popup 再按 `placeId` 重算文本。 [VERIFIED: apps/server/src/modules/records/records.repository.ts][VERIFIED: apps/server/src/modules/auth/auth.service.ts][VERIFIED: apps/web/src/stores/map-points.ts] |
| OVRS-03 | 点击暂未支持的海外区域时，用户会看到明确的“暂不支持点亮该地区”说明，而不是静默失败 | 复用 `OUTSIDE_SUPPORTED_DATA -> geo-lookup fallback -> popup notice` 现有壳，但把 unsupported 文案放进 popup 的 `fallbackNotice`，并移除 `handleIlluminate()` 里的全局 notice 主路径。 [VERIFIED: apps/web/src/components/LeafletMapStage.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue] |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- 始终使用中文沟通，代码/配置键名保留原始语言。 [VERIFIED: CLAUDE.md]
- 变更要最小化，并遵循现有 monorepo 结构：`apps/web`、`apps/server`、`packages/contracts`。 [VERIFIED: CLAUDE.md]
- 前端必须继续使用 Vue 3 Composition API + `<script setup lang="ts">`，状态管理继续使用 Pinia。 [VERIFIED: CLAUDE.md]
- 后端继续使用 NestJS 11 + Fastify 5 + Prisma 6 路线，不在 Phase 26 顺手做框架升级。 [VERIFIED: CLAUDE.md]
- 改动 `packages/contracts` 后需要先 build 合同包，再让上游包消费。 [VERIFIED: CLAUDE.md]
- 测试统一走 Vitest；前端环境是 `happy-dom`，后端 e2e 走 `supertest`。 [VERIFIED: CLAUDE.md]
- Phase 26 是 `UI hint: yes`，但要沿用当前地图主舞台 + popup 路线，不引入新页面或重交互中心。 [VERIFIED: .planning/ROADMAP.md][VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md]

## Summary

Phase 26 本质上是一个“支持范围收口 + metadata 一致性 + unsupported 解释性”阶段，不是新的地图交互壳阶段。仓库已经具备完整的 `Natural Earth admin1 source -> geometry manifest -> server authoritative resolve -> TravelRecord 持久化 -> /auth/bootstrap 回放 -> popup 展示` 链路，所以 planner 不需要再发明海外专用的 resolve、保存或展示系统。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs][VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts][VERIFIED: apps/server/src/modules/canonical-places/canonical-places.service.ts][VERIFIED: apps/server/src/modules/auth/auth.service.ts][VERIFIED: apps/web/src/stores/map-points.ts]

当前真正要补的是“Phase 26 支持面”的 authoritative 定义。现有 manifest 中海外条目来自 `NATURAL_EARTH_ADMIN1`，共有 4557 个 manifest entry；而锁定的 8 个优先国家只占 234 个源条目，约 5.1%。如果只做前端按钮禁用而不收口 manifest / resolve，服务端仍会把大量全球海外 admin1 当成可 resolve 数据，前端也仍会在地图 ready 时预加载一个 67.5MB 的 `overseas/layer.json`。 [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts][VERIFIED: apps/web/src/components/LeafletMapStage.vue][VERIFIED: apps/web/public/geo/2026-04-02-geo-v2/overseas/layer.json][VERIFIED: local command]

OVRS-02 的结构性基础已经存在，因为 `displayName`、`typeLabel`、`parentLabel`、`subtitle` 在写入记录时就进入 `UserTravelRecord`，刷新和跨设备是通过 `/auth/bootstrap` 回放这些字段，而不是重新拼接。真正的风险在于任何“已有海外旧记录”的一次性修复都不能复用现在的 `backfill-record-metadata.ts` 原样逻辑，因为它仍只从 4 个旧 fixture 构建 lookup。 [VERIFIED: apps/server/src/modules/records/records.repository.ts][VERIFIED: apps/server/src/modules/auth/auth.service.ts][VERIFIED: apps/server/scripts/backfill-record-metadata.ts]

**Primary recommendation:** 用“过滤后的海外 manifest + server authoritative resolve + popup 内 unsupported notice + persisted TravelRecord 文本真源”作为 Phase 26 的唯一主路径；不要把支持范围判断放成单纯的前端 UI gate。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs][VERIFIED: apps/server/src/modules/canonical-places/canonical-places.service.ts][VERIFIED: apps/web/src/components/LeafletMapStage.vue]

## Standard Stack

### Core
| Library / Asset | Repo Pin / Snapshot | Registry Current | Purpose | Why Standard |
|---------|---------|---------|---------|--------------|
| Natural Earth 10m admin-1 states/provinces [VERIFIED: apps/web/src/data/geo/geometry-source-catalog.json] | `natural-earth-10m-admin1-no-china-2026-04-02` [VERIFIED: apps/web/src/data/geo/geometry-source-catalog.json] | 官方站点当前为 5.1.1 下载线，仓库已 vendored 2026-04-02 快照。 [CITED: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/][CITED: https://www.naturalearthdata.com/about/terms-of-use/] | 海外 admin1 几何与基础英文名称来源。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] | 现有 build 脚本已经围绕它生成 canonical metadata，且数据条款为 Public Domain。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs][CITED: https://www.naturalearthdata.com/about/terms-of-use/] |
| Vue 3 + `<script setup>` [VERIFIED: CLAUDE.md] | `vue@^3.5.32` [VERIFIED: apps/web/package.json] | `3.5.32`，发布于 2026-04-03。 [VERIFIED: npm registry][CITED: https://vuejs.org/api/sfc-script-setup.html] | popup、地图壳、frontend orchestration。 [VERIFIED: apps/web/package.json][VERIFIED: apps/web/src/components/LeafletMapStage.vue] | 这是仓库锁定前端范式；Phase 26 不应偏离。 [VERIFIED: CLAUDE.md] |
| Pinia [VERIFIED: CLAUDE.md] | `pinia@^3.0.4` [VERIFIED: apps/web/package.json] | `3.0.4`，发布于 2025-11-05。 [VERIFIED: npm registry][CITED: https://pinia.vuejs.org/introduction.html] | `map-points` / `auth-session` / `map-ui` 状态真源。 [VERIFIED: apps/web/src/stores/map-points.ts] | 当前 popup / records / pending selection 都已经建在 Pinia store 上。 [VERIFIED: apps/web/src/stores/map-points.ts] |
| NestJS + Fastify authoritative API [VERIFIED: CLAUDE.md] | `@nestjs/common@11.1.18`、`fastify@5.8.4` [VERIFIED: apps/server/package.json] | `@nestjs/common@11.1.19`（2026-04-13）、`fastify@5.8.5`（2026-04-14）。 [VERIFIED: npm registry] | `/places/resolve`、`/places/confirm`、`/records`、`/auth/bootstrap`。 [VERIFIED: apps/server/src/modules/canonical-places/canonical-places.controller.ts][VERIFIED: apps/server/src/modules/records/records.controller.ts][VERIFIED: apps/server/src/modules/auth/auth.service.ts] | 当前 authoritative resolve / persistence / bootstrap 全都已在这条后端线上闭环；Phase 26 不应夹带升级。 [VERIFIED: CLAUDE.md][VERIFIED: apps/server/package.json] |
| Prisma user-scoped upsert persistence [VERIFIED: CLAUDE.md] | `@prisma/client@^6.19.2`，本机 CLI 实际解析为 `6.19.3`。 [VERIFIED: apps/server/package.json][VERIFIED: local command] | `7.7.0`，发布于 2026-04-07。 [VERIFIED: npm registry][CITED: https://www.prisma.io/docs/orm/prisma-client/queries/crud] | 以 `(userId, placeId)` 为唯一键写入稳定的 canonical 文本字段。 [VERIFIED: apps/server/src/modules/records/records.repository.ts] | 这是 OVRS-02 的持久化基础，但不要在 Phase 26 顺手升级到 Prisma 7。 [VERIFIED: apps/server/src/modules/records/records.repository.ts][VERIFIED: npm registry] |

### Supporting
| Library / Tool | Repo Pin / Snapshot | Purpose | When to Use |
|---------|---------|---------|-------------|
| `d3-geo` [VERIFIED: apps/web/package.json] | `^3.1.1`，当前 registry 也是 `3.1.1`（2024-03-12）。 [VERIFIED: npm registry] | country / region fallback lookup。 [VERIFIED: apps/web/src/services/geo-lookup.ts] | 只用于 `OUTSIDE_SUPPORTED_DATA` 后的解释性 fallback，不用于 authoritative save。 [VERIFIED: apps/web/src/components/LeafletMapStage.vue][VERIFIED: apps/web/src/services/geo-lookup.ts] |
| `leaflet` [VERIFIED: apps/web/package.json] | `^1.9.4`，当前 registry 也是 `1.9.4`（2023-05-18）。 [VERIFIED: npm registry] | 地图底层与 GeoJSON layer 渲染。 [VERIFIED: apps/web/package.json][VERIFIED: apps/web/src/composables/useGeoJsonLayers.ts] | 继续复用现有 layer / popup anchor 体系，不新建地图实现。 [VERIFIED: apps/web/src/composables/useGeoJsonLayers.ts][VERIFIED: apps/web/src/components/LeafletMapStage.vue] |
| Vitest [VERIFIED: CLAUDE.md] | `4.1.3` 已安装。 [VERIFIED: apps/web/package.json][VERIFIED: apps/server/package.json][VERIFIED: local command] | web component/store、server unit/e2e、contracts type tests。 [VERIFIED: apps/web/vitest.config.ts][VERIFIED: apps/server/vitest.config.ts][VERIFIED: packages/contracts/vitest.config.ts] | 作为 Phase 26 的主验证框架，优先沿用现有 spec 体系加点位回归。 [VERIFIED: CLAUDE.md][CITED: https://vitest.dev/guide/filtering] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 过滤 build 产物与 resolve 支持面 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] | 只在前端禁用“点亮”按钮 [VERIFIED: apps/web/src/components/LeafletMapStage.vue] | 前者能同时收口 server resolve、manifest scope 和 preload 体积；后者会留下“服务端仍支持全球 admin1 + 仍预加载 67.5MB 世界 layer”的结构性偏差。 [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts][VERIFIED: apps/web/public/geo/2026-04-02-geo-v2/overseas/layer.json] |
| 本地 vendored Natural Earth + canonical resolve [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] | 第三方 geocoder / reverse geocoding API [ASSUMED] | 外部 geocoder 会引入额度、网络波动和不可复现结果，违背项目“本地静态地理数据稳定判断真实地点”的核心价值。 [VERIFIED: .planning/PROJECT.md][ASSUMED] |
| 持久化 `displayName` / `typeLabel` / `subtitle` 并直接回放 [VERIFIED: apps/server/src/modules/records/records.repository.ts][VERIFIED: apps/server/src/modules/auth/auth.service.ts] | bootstrap 时按 `placeId` 重新拼装标题 [VERIFIED: apps/web/src/stores/map-points.ts] | 重算会让跨设备显示依赖当前代码版本和 lookup 完整度，直接损害 OVRS-02。 [VERIFIED: apps/server/src/modules/auth/auth.service.ts][VERIFIED: apps/web/src/stores/map-points.ts] |

**Installation:**
```bash
# none — Phase 26 可以完全复用当前 workspace 依赖
```

**Version verification:** [VERIFIED: npm registry]
- `vue` 当前 `3.5.32`（2026-04-03），仓库已跟上，无需动。 [VERIFIED: npm registry][VERIFIED: apps/web/package.json]
- `pinia` 当前 `3.0.4`（2025-11-05），仓库已跟上，无需动。 [VERIFIED: npm registry][VERIFIED: apps/web/package.json]
- `vite` 当前 `8.0.8`（2026-04-09），仓库声明 `8.0.7`；这不是 Phase 26 的必要改动。 [VERIFIED: npm registry][VERIFIED: apps/web/package.json]
- `vitest` 当前 `4.1.4`（2026-04-09），仓库安装 `4.1.3`；同样不应夹带升级。 [VERIFIED: npm registry][VERIFIED: local command]
- `@nestjs/common` 当前 `11.1.19`（2026-04-13），仓库声明 `11.1.18`；不要在本阶段 piggyback 升级。 [VERIFIED: npm registry][VERIFIED: apps/server/package.json]
- `fastify` 当前 `5.8.5`（2026-04-14），仓库声明 `5.8.4`；不要在本阶段 piggyback 升级。 [VERIFIED: npm registry][VERIFIED: apps/server/package.json]
- `@prisma/client` 当前 `7.7.0`（2026-04-07），仓库仍在 Prisma 6 线；Phase 26 应维持现状，避免把 coverage phase 变成 ORM 升级 phase。 [VERIFIED: npm registry][VERIFIED: apps/server/package.json]

## Architecture Patterns

### Recommended Project Structure
```text
apps/web/scripts/geo/                  # 海外支持范围过滤、metadata 规范化、manifest 生成
packages/contracts/src/generated/      # geometry manifest 真源
apps/server/src/modules/canonical-places/ # authoritative resolve / confirm
apps/server/src/modules/records/       # 持久化 canonical 文本字段
apps/server/scripts/                   # 需要时做 metadata backfill，但应改成 manifest-driven
apps/web/src/components/map-popup/     # unsupported 文案展示主位
apps/web/src/stores/                   # TravelRecord -> popup display 回放
```

### Pattern 1: Build-Time Support Scope
**What:** 把“Phase 26 支持哪些海外 admin1”定义成 geometry build 的产物边界，而不是运行时 UI 约定。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs][VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts]
**When to use:** 处理 D-01 / D-02、OVRS-01、以及世界数据中过多非阶段条目时。 [VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md]
**Why:** 当前 `buildOverseasLayer()` 会把所有海外 feature 写入同一个 `overseas/layer.json`，而地图 ready 时会预加载这个文件；如果不在 build 阶段过滤，Phase 26 的“优先 8 国”就只是文案，不是技术边界。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs][VERIFIED: apps/web/src/components/LeafletMapStage.vue][VERIFIED: apps/web/public/geo/2026-04-02-geo-v2/overseas/layer.json]
**Example:**
```ts
// Source pattern: apps/web/scripts/geo/build-geometry-manifest.mjs [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs]
for (const feature of featureCollection.features) {
  const props = feature.properties ?? {}
  const admin1Name = props.name_en ?? props.name

  if (!props.adm0_a3 || !admin1Name) {
    continue
  }

  const metadata = createOverseasFeatureMetadata(props)
  layerFeatures.push(enrichFeature(feature, metadata))
  manifestEntries.push(createManifestEntry({
    boundaryId: metadata.boundaryId,
    layer: 'OVERSEAS',
    assetKey: OVERSEAS_LAYER_ASSET_KEY,
    sourceDataset: 'NATURAL_EARTH_ADMIN1',
    sourceVersion: catalog.sources.NATURAL_EARTH_ADMIN1.sourceVersion,
    sourceFeatureId: props.iso_3166_2 ?? `${props.adm0_a3}/${admin1Name}`,
  }))
}
```

### Pattern 2: Server-Owned Canonical Text, Client-Owned Playback
**What:** 服务端 resolve 和 records 写入决定海外地点的 canonical 文本；前端只回放 `TravelRecord` 与 `ResolvedCanonicalPlace`。 [VERIFIED: apps/server/src/modules/canonical-places/canonical-places.service.ts][VERIFIED: apps/server/src/modules/records/records.repository.ts][VERIFIED: apps/web/src/stores/map-points.ts]
**When to use:** 处理 OVRS-02，尤其是刷新、重开、跨设备一致性。 [VERIFIED: .planning/REQUIREMENTS.md]
**Why:** `recordToDisplayPoint()` 直接把 `TravelRecord.displayName` / `subtitle` / `typeLabel` 映射到 popup；`/auth/bootstrap` 也直接返回这些字段。 [VERIFIED: apps/web/src/stores/map-points.ts][VERIFIED: apps/server/src/modules/auth/auth.service.ts]
**Example:**
```ts
// Source: apps/server/src/modules/records/records.repository.ts [VERIFIED: apps/server/src/modules/records/records.repository.ts]
return this.prisma.userTravelRecord.upsert({
  where: {
    userId_placeId: {
      userId,
      placeId: input.placeId,
    },
  },
  update: toTravelRecordData(userId, input),
  create: toTravelRecordData(userId, input),
})
```

### Pattern 3: Popup-First Unsupported Explanation
**What:** 当 authoritative resolve 落到 `OUTSIDE_SUPPORTED_DATA` 时，继续展示 geo fallback 识别结果，但把“暂不支持点亮该地区”的解释写进 popup notice，不再依赖全局 notice。 [VERIFIED: apps/web/src/components/LeafletMapStage.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue]
**When to use:** 处理 OVRS-03、D-03、D-04。 [VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md]
**Why:** `PointSummaryCard` 已经有 `fallbackNotice` 渲染位；当前多余的是 `handleIlluminate()` 在不可点亮时再发一个全局 `interactionNotice`。 [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue][VERIFIED: apps/web/src/components/LeafletMapStage.vue]
**Example:**
```ts
// Source pattern: apps/web/src/components/LeafletMapStage.vue [VERIFIED: apps/web/src/components/LeafletMapStage.vue]
if (response.reason === 'OUTSIDE_SUPPORTED_DATA') {
  const geoResult = await lookupCountryRegionByCoordinates({ lat, lng })
  if (geoResult) {
    openSavedPointForPlaceOrStartDraft(buildFallbackDraftPoint(geoResult, { lat, lng }))
    popupLatLng.value = L.latLng(lat, lng)
    clearInteractionNotice()
    return
  }
}
```

### Anti-Patterns to Avoid
- **前端单点门控:** 只让按钮 disabled，不让 server / manifest 识别支持边界。这样 unsupported 只是 UI 表象，不是 authoritative 规则。 [VERIFIED: apps/web/src/components/LeafletMapStage.vue][VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts]
- **把 `boundarySupportState === 'missing'` 当成不能保存:** 当前这个状态只表示“没有可高亮边界”，文案也是“仅保存 canonical 地点身份与文本信息”，并不等价于“不支持点亮”。 [VERIFIED: apps/web/src/stores/map-points.ts][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue]
- **bootstrap 时按 `placeId` 重算标题:** 这会把跨设备展示稳定性绑到最新 lookup 代码，而不是记录写入时的 authoritative 文本。 [VERIFIED: apps/server/src/modules/auth/auth.service.ts][VERIFIED: apps/web/src/stores/map-points.ts]
- **继续沿用 fixture-bound backfill helper:** 当前 helper 只收录 4 个旧 Phase 12 place。 [VERIFIED: apps/server/scripts/backfill-record-metadata.ts]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 海外地点 authoritative resolve | 新的前端 point-in-polygon / client geocoder [ASSUMED] | 现有 `CanonicalPlacesService` + generated geometry manifest。 [VERIFIED: apps/server/src/modules/canonical-places/canonical-places.service.ts][VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts] | 服务端已经统一处理 `resolved / ambiguous / failed`，继续分叉只会制造双真源。 [VERIFIED: packages/contracts/src/resolve.ts][VERIFIED: apps/server/src/modules/canonical-places/canonical-places.service.ts] |
| 记录展示文本 | 前端按 `placeId` 拼 `displayName / subtitle / typeLabel` [VERIFIED: apps/web/src/stores/map-points.ts] | 直接持久化并回放 `TravelRecord` 文本字段。 [VERIFIED: apps/server/src/modules/records/records.repository.ts][VERIFIED: apps/server/src/modules/auth/auth.service.ts] | OVRS-02 要的是跨刷新/跨设备稳定，而不是“现在能重新算出来”。 [VERIFIED: .planning/REQUIREMENTS.md] |
| unsupported 海外提示 | 新的全局错误中心 / 额外 notice channel [VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md] | 复用 popup 的 `fallbackNotice` 区域。 [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue] | 用户已经在地点 popup 上下文里；再弹全局 notice 反而把语义拆散。 [VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md] |
| 国家名国际化体系 | 全局多语言翻译系统 [VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md] | 先保留英文 canonical `displayName` + 英文国家名 + 中文类型标签。 [VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md][VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] | D-05 / D-06 / D-07 已经锁死 Phase 26 不做系统级翻译表。 [VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md] |

**Key insight:** Phase 26 最大的实现价值不在“再写一个识别系统”，而在“把现有 authoritative 链路的支持边界和文本稳定性定义清楚”。 [VERIFIED: apps/server/src/modules/canonical-places/canonical-places.service.ts][VERIFIED: apps/server/src/modules/records/records.repository.ts][VERIFIED: apps/web/src/components/LeafletMapStage.vue]

## Common Pitfalls

### Pitfall 1: 把 Natural Earth 原始 admin1 当成可直接产品化的支持名单
**What goes wrong:** `SG / AE / AU` 当前源数据并不都是“用户直觉里的一级行政区”列表；直接放开会得到 `Singapore` 的 5 个 CDC、`AE` 的 2 个非标准 `X~` 条目、`AU` 的多条外岛/领地条目。 [VERIFIED: apps/web/src/data/geo/sources/ne_10m_admin_1_states_provinces.json][VERIFIED: local command]
**Why it happens:** 当前 `buildOverseasLayer()` 对所有 feature 一视同仁，没有国家级 allowlist / denylist。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs]
**How to avoid:** 为 8 个锁定国家建立显式 support catalog，至少对 `AE` 和 `AU` 做 boundary allowlist；对 `SG` 明确接受 CDC 语义或额外 country-specific override。 [VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md][VERIFIED: local command][ASSUMED]
**Warning signs:** 测试里出现 `Sayh Mudayrah`、`Ashmore and Cartier Islands`、`Lord Howe Island` 这类非预期标题。 [VERIFIED: local command]

### Pitfall 2: 只做前端门控，导致 authoritative 支持面和 UI 不一致
**What goes wrong:** 前端 popup 可能显示“不可点亮”，但 server resolve 仍会把该地点当 canonical 命中；地图也仍然预加载全球 overseas layer。 [VERIFIED: apps/web/src/components/LeafletMapStage.vue][VERIFIED: apps/server/src/modules/canonical-places/canonical-places.service.ts][VERIFIED: apps/web/public/geo/2026-04-02-geo-v2/overseas/layer.json]
**Why it happens:** `isActivePointIlluminatable` 现在只看 point 是否带 canonical identity，而不是 Phase 26 的支持 catalog。 [VERIFIED: apps/web/src/components/LeafletMapStage.vue]
**How to avoid:** 让支持 catalog 同时驱动 build 产物、server resolve 与 frontend `isIlluminatable`。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs][VERIFIED: apps/web/src/components/LeafletMapStage.vue][ASSUMED]
**Warning signs:** QA 在 unsupported 区域能拿到 resolved canonical popup，或者应用启动仍抓取完整 67.5MB 海外 layer。 [VERIFIED: apps/server/test/canonical-resolve.e2e-spec.ts][VERIFIED: apps/web/public/geo/2026-04-02-geo-v2/overseas/layer.json]

### Pitfall 3: 把 OVRS-02 做成“显示层重算”而不是“持久化字段回放”
**What goes wrong:** 同一条记录在刷新、重开、跨设备后标题或副标题漂移。 [VERIFIED: .planning/REQUIREMENTS.md]
**Why it happens:** 如果 planner 在 bootstrap 或 popup 阶段重新按 `placeId` 推导文本，就会引入代码版本依赖。 [VERIFIED: apps/server/src/modules/auth/auth.service.ts][VERIFIED: apps/web/src/stores/map-points.ts]
**How to avoid:** 只在 authoritative resolve 成功后确定文本字段，`UserTravelRecord` 和 `/auth/bootstrap` 原样回放。 [VERIFIED: apps/server/src/modules/records/records.repository.ts][VERIFIED: apps/server/src/modules/auth/auth.service.ts]
**Warning signs:** `recordToDisplayPoint()` 之外出现新的 subtitle/typeLabel 拼接逻辑。 [VERIFIED: apps/web/src/stores/map-points.ts]

### Pitfall 4: 继续使用 4-fixture backfill helper 修补海外旧记录
**What goes wrong:** 一次性 metadata 修复脚本只能修北京、香港、California、阿坝；Phase 26 新支持国家的旧记录不会被修正。 [VERIFIED: apps/server/scripts/backfill-record-metadata.ts]
**Why it happens:** `CANONICAL_PLACE_CATALOG` 目前仍从 `PHASE12_RESOLVED_*` fixture 常量构造。 [VERIFIED: apps/server/scripts/backfill-record-metadata.ts][VERIFIED: packages/contracts/src/fixtures.ts]
**How to avoid:** 如果需要 migration/backfill，把 lookup 改成 manifest-driven，而不是 fixture-driven。 [VERIFIED: apps/server/scripts/backfill-record-metadata.ts][ASSUMED]
**Warning signs:** backfill 输出出现大量 `unmatchedTravelRows` / `unmatchedSmokeRows`。 [VERIFIED: apps/server/scripts/backfill-record-metadata.ts]

### Pitfall 5: unsupported 反馈仍然依赖全局 notice
**What goes wrong:** 用户看到的是“点亮失败”或需要再次点击才明白不支持，体验与 D-03 / D-04 冲突。 [VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md][VERIFIED: apps/web/src/components/LeafletMapStage.vue]
**Why it happens:** `handleIlluminate()` 里还保留 `setInteractionNotice({ message: '该地点暂不支持点亮' })`。 [VERIFIED: apps/web/src/components/LeafletMapStage.vue]
**How to avoid:** 在 fallback draft point 上给出明确 unsupported 文案，并让不可点亮状态只表现为 popup 内 notice。 [VERIFIED: apps/web/src/components/LeafletMapStage.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue]
**Warning signs:** 组件测试仍断言全局 `interactionNotice` 是 unsupported 主反馈。 [VERIFIED: apps/web/src/components/LeafletMapStage.spec.ts]

## Code Examples

Verified patterns from current codebase:

### 1. Authoritative record write should remain an upsert
```ts
// Source: apps/server/src/modules/records/records.repository.ts [VERIFIED: apps/server/src/modules/records/records.repository.ts]
return this.prisma.userTravelRecord.upsert({
  where: {
    userId_placeId: {
      userId,
      placeId: input.placeId,
    },
  },
  update: toTravelRecordData(userId, input),
  create: toTravelRecordData(userId, input),
})
```

### 2. Bootstrap should replay stored text fields, not recalculate them
```ts
// Source: apps/server/src/modules/auth/auth.service.ts [VERIFIED: apps/server/src/modules/auth/auth.service.ts]
return {
  response: {
    authenticated: true,
    user: restoredSession.session.user,
    records: records.map(toContractTravelRecord),
  },
  clearSessionCookie: false,
}
```

### 3. Popup notices already have the right rendering slot
```vue
<!-- Source: apps/web/src/components/map-popup/PointSummaryCard.vue [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue] -->
<p
  v-if="isCandidateMode ? fallbackPoint?.fallbackNotice : summaryPoint?.fallbackNotice"
  :class="noticeClass"
  data-notice-tone="fallback"
>
  {{ isCandidateMode ? fallbackPoint?.fallbackNotice : summaryPoint?.fallbackNotice }}
</p>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 代表点 fixture / 小样本 authoritative catalog，`phase12-canonical-fixture-v1`。 [VERIFIED: packages/contracts/src/fixtures.ts] | geometry-manifest-backed canonical resolve，当前 dataset 为 `2026-04-02-geo-v2`，overseas layer 由 Natural Earth admin1 批量生成。 [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts][VERIFIED: apps/server/src/modules/canonical-places/canonical-places.service.ts] | 到当前仓库状态时已切到 `geo-v2` manifest 路线。 [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts] | Phase 26 应继续扩展 manifest/build 规则，而不是回退到点位 fixture 特判。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs][VERIFIED: apps/server/src/modules/canonical-places/canonical-places.service.ts] |

**Deprecated/outdated:**
- 以 `PHASE12_RESOLVED_*` fixture 作为长期 metadata catalog。 [VERIFIED: packages/contracts/src/fixtures.ts][VERIFIED: apps/server/scripts/backfill-record-metadata.ts]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `Singapore` 当前 Natural Earth 的 5 个 CDC 语义在 Phase 26 作为“更实用”的 admin1 近似口径被接受；如后续产品验证不通过，再在后续 phase 做 country-specific override。 [RESOLVED: 2026-04-16 planning decision] | Common Pitfalls / Open Questions | 风险已由 support catalog 显式锁定，不再阻塞计划生成。 |
| A2 | Phase 26 将显式交付 manifest-driven metadata backfill 路径与自动化验证，因此即使现有 DB 中已有旧海外记录，也不会只停留在“新写入正确”。 [RESOLVED: 2026-04-16 planning decision] | Summary / Open Questions | 风险被纳入 Plan 02，而不是留作未决假设。 |

## Planning Resolutions

1. **Singapore 的 admin1 口径**
   - Resolution: 接受 vendored Natural Earth 的 5 个 CDC 作为 Phase 26 的 `SG` admin1 支持口径，并把它们显式写进 support catalog。 [RESOLVED: 2026-04-16 planning decision]
   - Why now: 这样能在不引入新几何源和特殊 override pipeline 的前提下，保持 `SG` 处于首批支持国家列表内。 [VERIFIED: local command][ASSUMED]

2. **历史海外记录 metadata**
   - Resolution: Phase 26 不只保证“新写入正确”，还会补一条 manifest-driven metadata backfill 路径，并为 backfill 提供脚本/测试级自动化验证。 [RESOLVED: 2026-04-16 planning decision]
   - Why now: 当前 helper 仍绑定 4 个旧 fixture，如果不在本 phase 处理，OVRS-02 对已存在海外记录就不成立。 [VERIFIED: apps/server/scripts/backfill-record-metadata.ts]

3. **海外预加载体积**
   - Resolution: Phase 26 通过 build/manifest 过滤同步裁剪 overseas layer，只保留首批 8 国支持面，不接受继续预加载全球 layer。 [RESOLVED: 2026-04-16 planning decision]
   - Why now: 这是把“首批优先国家”变成 authoritative 支持面的最直接方式，也能顺手压缩 `overseas/layer.json` 体积。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs][VERIFIED: apps/web/public/geo/2026-04-02-geo-v2/overseas/layer.json]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `pnpm`, Vite, Vitest, geo build scripts | ✓ [VERIFIED: local command] | `v22.22.1` [VERIFIED: local command] | — |
| pnpm | monorepo workspace commands | ✓ [VERIFIED: local command] | `10.33.0` [VERIFIED: local command] | — |
| Vitest CLI | web/server/contracts quick verification | ✓ [VERIFIED: local command] | `4.1.3` installed in workspace [VERIFIED: local command] | — |
| Prisma CLI | schema inspection / local DB-oriented verification | ✓（通过 `pnpm --filter @trip-map/server exec prisma`） [VERIFIED: local command] | `6.19.3` installed locally [VERIFIED: local command] | 若全局 `prisma` 缺失，继续走 workspace script。 [VERIFIED: apps/server/package.json][VERIFIED: local command] |
| PostgreSQL / Supabase connection | server auth/records e2e、bootstrap cross-device checks | ✓（`.env` 已配置） [VERIFIED: apps/server/.env] | 远程实例版本未探测；本机无 `pg_isready`。 [VERIFIED: apps/server/.env][VERIFIED: local command] | 对 code-only 阶段可先跑不依赖 DB 的 web/component 与 canonical resolve specs；完整 e2e 仍需要可连通的数据库。 [VERIFIED: apps/server/test/canonical-resolve.e2e-spec.ts][VERIFIED: apps/web/vitest.config.ts] |

**Missing dependencies with no fallback:**
- None confirmed. [VERIFIED: local command]

**Missing dependencies with fallback:**
- 本机没有全局 `prisma` / `pg_isready`；但 workspace Prisma CLI 可用，数据库连接也已有 `.env` 配置。 [VERIFIED: local command][VERIFIED: apps/server/.env]

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest `4.1.3` installed in workspace. [VERIFIED: local command] |
| Config file | [`/Users/huangjingping/i/trip-map/apps/web/vitest.config.ts`](/Users/huangjingping/i/trip-map/apps/web/vitest.config.ts), [`/Users/huangjingping/i/trip-map/apps/server/vitest.config.ts`](/Users/huangjingping/i/trip-map/apps/server/vitest.config.ts), [`/Users/huangjingping/i/trip-map/packages/contracts/vitest.config.ts`](/Users/huangjingping/i/trip-map/packages/contracts/vitest.config.ts) |
| Quick run command | `pnpm --filter @trip-map/web test apps/web/src/components/LeafletMapStage.spec.ts` 或 `pnpm --filter @trip-map/server test test/canonical-resolve.e2e-spec.ts`。 [VERIFIED: apps/web/package.json][VERIFIED: apps/server/package.json][VERIFIED: apps/server/scripts/vitest-run.mjs][VERIFIED: local command] |
| Full suite command | `pnpm test`。 [VERIFIED: package.json] |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| OVRS-01 | 锁定 8 国的 admin1 在真实点击下可 resolve / ambiguous / illuminate，且不扩大到全球承诺。 [VERIFIED: .planning/REQUIREMENTS.md] | server e2e + web component/store | `pnpm --filter @trip-map/server test test/canonical-resolve.e2e-spec.ts`；`pnpm --filter @trip-map/web test apps/web/src/components/LeafletMapStage.spec.ts` [VERIFIED: apps/server/test/canonical-resolve.e2e-spec.ts][VERIFIED: apps/web/src/components/LeafletMapStage.spec.ts] | ✅ |
| OVRS-02 | 已保存海外记录在 `/records` / `/auth/bootstrap` / popup replay 后文本稳定一致。 [VERIFIED: .planning/REQUIREMENTS.md] | server e2e + store/unit | `pnpm --filter @trip-map/server test test/auth-bootstrap.e2e-spec.ts`；`pnpm --filter @trip-map/server test test/records-sync.e2e-spec.ts`；`pnpm --filter @trip-map/web test apps/web/src/stores/map-points.spec.ts` [VERIFIED: apps/server/test/auth-bootstrap.e2e-spec.ts][VERIFIED: apps/server/test/records-sync.e2e-spec.ts][VERIFIED: apps/web/src/stores/map-points.spec.ts] | ✅ |
| OVRS-03 | unsupported 海外区域会出现 popup 解释，而不是静默失败或全局 notice 主导。 [VERIFIED: .planning/REQUIREMENTS.md] | web component | `pnpm --filter @trip-map/web test apps/web/src/components/LeafletMapStage.spec.ts`；`pnpm --filter @trip-map/web test apps/web/src/components/map-popup/PointSummaryCard.spec.ts` [VERIFIED: apps/web/src/components/LeafletMapStage.spec.ts][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.spec.ts] | ✅ |

### Sampling Rate
- **Per task commit:** 运行受影响文件的最小 web/server spec。 [VERIFIED: apps/web/package.json][VERIFIED: apps/server/package.json]
- **Per wave merge:** `pnpm --filter @trip-map/web test` + `pnpm --filter @trip-map/server test`。 [VERIFIED: apps/web/package.json][VERIFIED: apps/server/package.json]
- **Phase gate:** `pnpm test` + `pnpm typecheck`，并人工抽样至少覆盖 `JP / SG / AE / AU / US` 五类差异国家。 [VERIFIED: package.json][ASSUMED]

### Wave 0 Gaps
- [ ] 新增一组“priority-country support catalog”单元测试，直接锁 `JP / KR / TH / SG / MY / AE / AU / US` 的允许/排除边界。 [ASSUMED]
- [ ] 新增 server e2e，覆盖至少 `JP` 或 `TH` 的真实 admin1 命中，而不是只沿用 California。 [VERIFIED: apps/server/test/canonical-resolve.e2e-spec.ts][ASSUMED]
- [ ] 新增 web spec，断言 unsupported 语义停留在 popup notice，而不是 `interactionNotice`。 [VERIFIED: apps/web/src/components/LeafletMapStage.spec.ts][ASSUMED]
- [ ] 若 planner 决定做 backfill，再补一组 script-level test，证明 lookup 从 manifest 而非 4-fixture catalog 构建。 [VERIFIED: apps/server/scripts/backfill-record-metadata.ts][ASSUMED]

## Security Domain

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes [VERIFIED: apps/server/src/modules/auth/guards/session-auth.guard.ts] | 继续使用 `sid` cookie + `SessionAuthGuard`。 [VERIFIED: apps/server/src/modules/auth/guards/session-auth.guard.ts] |
| V3 Session Management | yes [VERIFIED: apps/server/src/modules/auth/auth.service.ts] | 会话恢复仍通过 `AuthService.restoreSession` / `/auth/bootstrap`。 [VERIFIED: apps/server/src/modules/auth/auth.service.ts] |
| V4 Access Control | yes [VERIFIED: apps/server/src/modules/records/records.controller.ts] | 所有 `/records` 操作继续按 `CurrentUser` 的 `user.id` 作用域执行。 [VERIFIED: apps/server/src/modules/records/records.controller.ts][VERIFIED: apps/server/src/modules/records/records.repository.ts] |
| V5 Input Validation | yes [VERIFIED: apps/server/src/modules/records/dto/create-travel-record.dto.ts][VERIFIED: apps/server/src/modules/canonical-places/dto/resolve-canonical-place.dto.ts] | 继续使用 `class-validator` + `ValidationPipe` 的 `forbidNonWhitelisted`。 [VERIFIED: apps/server/src/modules/records/records.controller.ts][VERIFIED: apps/server/src/modules/canonical-places/canonical-places.controller.ts] |
| V6 Cryptography | no new work [VERIFIED: CLAUDE.md] | Phase 26 不新增加密需求；沿用既有 auth 方案即可。 [VERIFIED: CLAUDE.md] |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| 伪造 unsupported / out-of-scope `placeId` 直接写入 `/records` | Tampering | 不要只信任前端按钮状态；server 侧要用 authoritative support catalog 验证写入是否属于 Phase 26 支持面。 [VERIFIED: apps/server/src/modules/records/records.controller.ts][VERIFIED: apps/server/src/modules/records/records.repository.ts][ASSUMED] |
| 跨账号读取或删除旅行记录 | Information Disclosure / Tampering | 继续依赖 `SessionAuthGuard` 和 `userId_placeId` scoped persistence。 [VERIFIED: apps/server/src/modules/auth/guards/session-auth.guard.ts][VERIFIED: apps/server/src/modules/records/records.repository.ts] |
| popup notice / title 被未转义文本注入 | XSS | Vue 模板默认转义；现有 kawaii spec 已断言 notice/title/hint 文本不会插入 HTML。 [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts] |
| 全球 overseas layer 过大导致可用性退化 | Denial of Service / Availability | 把海外几何裁到 Phase 26 支持范围，或者至少显式接受 67.5MB preload 成本。 [VERIFIED: apps/web/public/geo/2026-04-02-geo-v2/overseas/layer.json][VERIFIED: apps/web/src/components/LeafletMapStage.vue][ASSUMED] |

## Sources

### Primary (HIGH confidence)
- [VERIFIED: .planning/phases/26-overseas-coverage-foundation/26-CONTEXT.md] - 锁定范围、命名策略、unsupported 交互约束
- [VERIFIED: .planning/REQUIREMENTS.md] - OVRS-01 / OVRS-02 / OVRS-03 正式 requirement
- [VERIFIED: CLAUDE.md] - 项目技术栈、测试与编码约束
- [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] - overseas manifest 生成、metadata 规则、当前未过滤的世界数据导入
- [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts] - 当前 geometry scope 与 dataset version
- [VERIFIED: apps/server/src/modules/canonical-places/canonical-places.service.ts] - authoritative resolve/confirm 当前行为
- [VERIFIED: apps/server/src/modules/records/records.repository.ts] - `UserTravelRecord` upsert 与稳定文本持久化
- [VERIFIED: apps/server/src/modules/auth/auth.service.ts] - `/auth/bootstrap` 文本回放
- [VERIFIED: apps/web/src/components/LeafletMapStage.vue] - unsupported fallback、popup anchor、当前全局 notice 逻辑
- [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue] - popup notice / disabled CTA 渲染位
- [VERIFIED: apps/server/scripts/backfill-record-metadata.ts] - 当前 backfill helper 的 fixture-bound 限制
- [CITED: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/] - Natural Earth admin1 数据集说明
- [CITED: https://www.naturalearthdata.com/about/terms-of-use/] - Natural Earth 许可条款
- [CITED: https://vuejs.org/api/sfc-script-setup.html] - Vue `<script setup>` 官方说明
- [CITED: https://pinia.vuejs.org/introduction.html] - Pinia 官方介绍
- [CITED: https://www.prisma.io/docs/orm/prisma-client/queries/crud] - Prisma Client CRUD / upsert 官方文档
- [CITED: https://vitest.dev/guide/filtering] - Vitest 过滤运行文档

### Secondary (MEDIUM confidence)
- [VERIFIED: npm registry] - `vue`、`pinia`、`vite`、`vitest`、`@nestjs/common`、`fastify`、`@prisma/client` 当前版本与发布时间
- [VERIFIED: local command] - Node / pnpm / Vitest / Prisma CLI / geometry file size / priority-country counts / source anomalies

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - repo stack、npm registry 和官方 docs 足够明确。 [VERIFIED: package.json][VERIFIED: npm registry][CITED: https://vuejs.org/api/sfc-script-setup.html]
- Architecture: MEDIUM - 主路径清楚，但 `SG` 语义与是否裁剪 world layer 仍需产品/计划确认。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs][VERIFIED: apps/web/src/components/LeafletMapStage.vue][ASSUMED]
- Pitfalls: HIGH - 关键风险都能在现有代码和数据里直接观测到。 [VERIFIED: apps/server/scripts/backfill-record-metadata.ts][VERIFIED: local command][VERIFIED: apps/web/public/geo/2026-04-02-geo-v2/overseas/layer.json]

**Research date:** 2026-04-16
**Valid until:** 2026-04-23 - npm 版本与官方文档可能继续变化；repo 内部发现对当前 HEAD 有效。 [VERIFIED: npm registry][VERIFIED: local command]
