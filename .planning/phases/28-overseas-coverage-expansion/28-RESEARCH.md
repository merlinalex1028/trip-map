# Phase 28: Overseas Coverage Expansion - Research

**Researched:** 2026-04-21  
**Domain:** overseas admin1 coverage expansion / manifest-backed canonical metadata pipeline  
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

> 以下内容按 `28-CONTEXT.md` 原文复制，不做改写。[VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md]
>
> ### Locked Decisions
>
> ### 扩展范围与粒度
> - **D-01:** 按地理区域均衡覆盖，而非按用户旅行频次
> - **D-02:** admin1 粒度是必须的，国家级 fallback 不可接受；如果某国家没有可用的 admin1 边界数据，则暂不开放该国家
> - **D-03:** 一次性完成扩展目标范围内的所有国家/地区
>
> ### Metadata 规范
> - **D-04:** 新增国家沿用 Phase 26 的 manifest-backed catalog 机制，扩展 catalog 文件
> - **D-05:** 新增国家的 displayName / typeLabel / parentLabel / subtitle 规范全部沿用 Phase 26 的规则
> - **D-06:** displayName 使用英文或本地化的地区名称；typeLabel 使用 "State" / "Province" / "Region" 等标准标签
>
> ### Catalog 维护
> - **D-07:** Catalog 拆分为多个文件（按区域或字母），不再使用单一 JSON 文件
> - **D-08:** 新增 country entry 需要完整验证：admin1 resolve 生成 authoritative record、metadata 显示正确、bootstrap 恢复和地图展示一致性
>
> ### Agent's Discretion
> - 具体拆分数量和命名方式由规划阶段决定
> - 新增国家的验证测试策略由规划阶段设计
>
> ### Deferred Ideas (OUT OF SCOPE)
> None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GEOX-01 | 用户可以在更广的优先海外国家/地区上稳定识别并记录旅行。 [VERIFIED: .planning/REQUIREMENTS.md] | 需要把扩容入口锁定在 `apps/web/scripts/geo/overseas-admin1-support*.mjs` 一侧的 build-time support rules，并通过 `geo:verify-sources`、`geo:build(:check)`、`canonical-resolve.e2e`、`records-travel.e2e` 证明新国家可 resolve 且可保存。 [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] [VERIFIED: repo command pnpm --filter @trip-map/web geo:build:check] [VERIFIED: repo command cd apps/server && pnpm test test/canonical-resolve.e2e-spec.ts] [VERIFIED: repo command cd apps/server && pnpm test test/records-travel.e2e-spec.ts] |
| GEOX-02 | 扩展后的海外记录在地图、时间轴和统计视图中保持一致的标题、类型与归类。 [VERIFIED: .planning/REQUIREMENTS.md] | 需要把 metadata 生成规则、服务端 exact-match 校验、bootstrap replay、map store replay、以及未来 timeline/statistics consumer compatibility 一起规划；如果 D-06 要从通用 `一级行政区` 升级为 `State` / `Province` / `Region` 等标签，还必须显式规划 backfill/migration。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] [VERIFIED: apps/server/src/modules/records/records.service.ts] [VERIFIED: apps/server/scripts/backfill-record-metadata.ts] [VERIFIED: apps/server/src/modules/auth/auth.service.ts] [VERIFIED: apps/web/src/stores/map-points.ts] [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md] |
</phase_requirements>

## Summary

当前 authoritative overseas 支持链路不在 `28-CONTEXT.md` 提到的 `apps/web/src/stores/overseas-catalog.ts` 或 `apps/server/src/modules/overseas/overseas.service.ts`，这两个路径在当前仓库都不存在；真实入口是 `apps/web/scripts/geo/overseas-admin1-support.mjs` 的国家筛选规则、`apps/web/scripts/geo/build-geometry-manifest.mjs` 的生成流程、`packages/contracts/src/generated/geometry-manifest.generated.ts` 的共享 manifest，以及服务端 `canonical-places` / `records` 模块对该 manifest 的消费。 [VERIFIED: shell probe missing files] [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts] [VERIFIED: apps/server/src/modules/canonical-places/canonical-places.service.ts] [VERIFIED: apps/server/src/modules/records/records.service.ts]

当前 Phase 26 基线已经能从真实数据反推出来：`GEOMETRY_MANIFEST` 中有 `228` 条 overseas entry，只覆盖 `8` 个国家，分别是 `JP=47`、`KR=17`、`TH=77`、`SG=5`、`MY=16`、`AE=7`、`AU=8`、`US=51`；这与 `overseas-admin1-support.mjs` 的 `priorityCountries` 和前端 `PHASE26_SUPPORTED_OVERSEAS_COUNTRIES` 常量完全一致。 [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts] [VERIFIED: repo command pnpm --filter @trip-map/web geo:build:check] [VERIFIED: repo command node manifest-country-count script] [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] [VERIFIED: apps/web/src/constants/overseas-support.ts]

Phase 28 不能被规划成“只加国家名单”的轻量数据补丁，因为当前 map/bootstrap/records 链已经把 metadata 当成 authoritative 数据的一部分在持久化和回放；服务端会拒绝 catalog 外或 metadata 伪造的 overseas payload，前端 map store 会直接复用 record 里的 `displayName` / `typeLabel` / `subtitle`，不会再按 `placeId` 重算。 [VERIFIED: apps/server/src/modules/records/records.service.ts] [VERIFIED: apps/server/test/records-travel.e2e-spec.ts] [VERIFIED: apps/server/test/records-import.e2e-spec.ts] [VERIFIED: apps/server/test/auth-bootstrap.e2e-spec.ts] [VERIFIED: apps/web/src/stores/map-points.ts] [VERIFIED: apps/web/src/stores/map-points.spec.ts]

最大的规划风险是 D-06 与现状冲突：当前 overseas metadata 生成逻辑统一写死 `typeLabel: 一级行政区`，而 `28-CONTEXT.md` 锁定决策要求 `State` / `Province` / `Region` 等标准标签；Natural Earth 源数据确实提供了 `type_en`，但不同国家既有多种值也存在缺失值，因此如果 Phase 28 要遵守 D-06，就必须把“标签归一化策略 + 既有 8 国记录 backfill”写成显式实施切片。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md] [VERIFIED: apps/web/src/data/geo/sources/ne_10m_admin_1_states_provinces.json] [VERIFIED: repo command node natural-earth-type-en summary script] [VERIFIED: apps/server/scripts/backfill-record-metadata.ts]

**Primary recommendation:** 以“support rule authoring -> geo build 产物 -> server authoritative validation -> persisted metadata replay -> frontend unsupported copy / consumer compatibility -> regression tests”为唯一规划主线，并把 D-06 的标签规范升级视为和国家扩容同级的任务，而不是收尾文案问题。 [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] [VERIFIED: apps/server/src/modules/records/records.service.ts] [VERIFIED: apps/web/src/stores/map-points.ts] [VERIFIED: apps/web/src/constants/overseas-support.ts]

## Project Constraints (from CLAUDE.md)

- 与用户交流时始终使用中文。 [VERIFIED: CLAUDE.md]
- 修改代码时优先保持改动最小，并遵循现有项目结构与风格。 [VERIFIED: CLAUDE.md]
- monorepo 结构固定为 `apps/web`、`apps/server`、`packages/contracts`，Phase 28 规划不能绕开这三个包的边界。 [VERIFIED: CLAUDE.md]
- 前端必须继续使用 Vue 3 Composition API + `<script setup>`，状态管理使用 Pinia。 [VERIFIED: CLAUDE.md]
- 后端必须继续使用 NestJS + Fastify，并通过 `class-validator` / `class-transformer` 做 DTO 校验。 [VERIFIED: CLAUDE.md]
- 共享契约必须继续放在 `packages/contracts/src/`，改动后需要重新构建 `@trip-map/contracts`。 [VERIFIED: CLAUDE.md]
- 测试框架统一是 Vitest；前端环境是 `happy-dom`，后端 e2e 用 `supertest`。 [VERIFIED: CLAUDE.md]
- 包管理和编排继续使用 `pnpm` + `turbo`，不要在 Phase 28 里引入另一套脚本入口。 [VERIFIED: CLAUDE.md]

## Standard Stack

### Core

| Asset / Service | Version | Purpose | Why Standard |
|-----------------|---------|---------|--------------|
| Natural Earth admin1 vendored snapshot | `natural-earth-10m-admin1-no-china-2026-04-02` [VERIFIED: apps/web/src/data/geo/geometry-source-catalog.json] | 海外 admin1 边界的唯一上游输入。 [VERIFIED: apps/web/src/data/geo/geometry-source-catalog.json] | 当前 `geo:verify-sources` 会校验 checksum，`geo:build(:check)` 直接从它生成 `overseas/layer.json`。 [VERIFIED: repo command pnpm --filter @trip-map/web geo:verify-sources] [VERIFIED: repo command pnpm --filter @trip-map/web geo:build:check] |
| Overseas support rule authoring | 当前单文件 `apps/web/scripts/geo/overseas-admin1-support.mjs`，建议 Phase 28 拆分为同目录多文件。 [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md] | 定义哪些国家/哪些 admin1 feature 可以进入 authoritative 支持范围。 [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] | 这是当前 8 国覆盖的唯一筛选入口，扩容应继续从这里出发而不是手改 generated 产物。 [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts] |
| Shared geometry manifest | `2026-04-02-geo-v2` / `597` entries / `228` overseas entries。 [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts] [VERIFIED: repo command pnpm --filter @trip-map/web geo:build:check] | web/server 共享 geometryRef 和 boundary coverage authoritative 索引。 [VERIFIED: apps/web/src/services/geometry-manifest.ts] [VERIFIED: apps/server/src/modules/canonical-places/canonical-places.service.ts] | 当前 map、resolve、metadata catalog 都依赖它；不要引入第二份 support manifest。 [VERIFIED: apps/web/src/services/geometry-manifest.ts] [VERIFIED: apps/server/src/modules/canonical-places/place-metadata-catalog.ts] |
| Manifest-backed canonical metadata lookup | `place-metadata-catalog.ts` 运行时直接读 geometry shard metadata。 [VERIFIED: apps/server/src/modules/canonical-places/place-metadata-catalog.ts] | 为 server resolve、records guard、backfill 提供同一份 place summary。 [VERIFIED: apps/server/src/modules/canonical-places/place-metadata-catalog.ts] [VERIFIED: apps/server/scripts/backfill-record-metadata.ts] | 这是当前 metadata 一致性的核心，不需要另建手写 catalog JSON。 [VERIFIED: apps/server/src/modules/canonical-places/place-metadata-catalog.ts] [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md] |
| Server authoritative validation | 当前 `RecordsService.assertAuthoritativeOverseasRecord()` exact-match 校验。 [VERIFIED: apps/server/src/modules/records/records.service.ts] | 拦截 catalog 外 payload 和 forged metadata。 [VERIFIED: apps/server/src/modules/records/records.service.ts] | 已被 `records-travel.e2e` / `records-import.e2e` 验证，Phase 28 应继续强化而不是绕过。 [VERIFIED: repo command cd apps/server && pnpm test test/records-travel.e2e-spec.ts] [VERIFIED: repo command cd apps/server && pnpm test test/records-import.e2e-spec.ts] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vue` | repo `3.5.32`; npm latest `3.5.32`，registry modified `2026-04-14T13:24:43.837Z`。 [VERIFIED: apps/web/package.json] [VERIFIED: npm registry] | map popup、unsupported UX、未来 timeline/statistics consumer。 [VERIFIED: apps/web/package.json] | 所有 web consumer 层改动都继续在现有 Vue 3 组件和 store 内完成。 [VERIFIED: CLAUDE.md] |
| `pinia` | repo `3.0.4`; npm latest `3.0.4`，registry modified `2025-11-05T09:25:14.059Z`。 [VERIFIED: apps/web/package.json] [VERIFIED: npm registry] | `map-points` / `auth-session` 状态与 authoritative snapshot 回放。 [VERIFIED: apps/web/src/stores/map-points.ts] [VERIFIED: apps/web/src/stores/auth-session.ts] | 需要验证 map/bootstrap consumer compatibility 时继续用现有 store 测试。 [VERIFIED: repo command pnpm --filter @trip-map/web test src/stores/map-points.spec.ts] |
| `@nestjs/common` | repo `11.1.18`; npm latest `11.1.19`，registry modified `2026-04-13T07:52:25.034Z`。 [VERIFIED: apps/server/package.json] [VERIFIED: npm registry] | resolve / records / auth authoritative API。 [VERIFIED: apps/server/package.json] | Phase 28 不需要顺便升级 Nest；直接沿用当前模块边界即可。 [VERIFIED: apps/server/package.json] |
| `@prisma/client` | repo `6.19.3`; npm latest `7.7.0`，registry modified `2026-04-20T15:10:55.733Z`。 [VERIFIED: apps/server/package.json] [VERIFIED: npm registry] | 持久化旅行记录与 backfill。 [VERIFIED: apps/server/package.json] [VERIFIED: apps/server/scripts/backfill-record-metadata.ts] | 当前 server e2e 已在现有版本跑通，Phase 28 不应把覆盖扩容和 Prisma 大版本升级耦合。 [VERIFIED: repo command cd apps/server && pnpm test test/canonical-resolve.e2e-spec.ts] [VERIFIED: repo command cd apps/server && pnpm test test/records-travel.e2e-spec.ts] |
| `vitest` | repo `4.1.4`; npm latest `4.1.4`，registry modified `2026-04-09T07:36:53.103Z`。 [VERIFIED: package.json] [VERIFIED: npm registry] | web/server/contracts 多包回归。 [VERIFIED: package.json] | 当前相关 spec 已可单独运行，planner 可以直接把它们作为验证命令。 [VERIFIED: repo command pnpm --filter @trip-map/web test src/services/geometry-manifest.spec.ts] [VERIFIED: repo command pnpm --filter @trip-map/web test src/components/LeafletMapStage.spec.ts] [VERIFIED: repo command cd apps/server && pnpm test test/auth-bootstrap.e2e-spec.ts] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 继续手写 `PHASE26_SUPPORTED_OVERSEAS_COUNTRIES` 文案常量。 [VERIFIED: apps/web/src/constants/overseas-support.ts] | 从 build-time support rules 或 generated manifest 生成一份 supported-country summary。 [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts] | 多一份生成桥接，但可以消除当前“8 国名单和真实支持范围双写”的 drift 风险。 [VERIFIED: apps/web/src/constants/overseas-support.ts] [VERIFIED: repo command node manifest-country-count script] |
| 直接透传 Natural Earth `type_en`。 [VERIFIED: apps/web/src/data/geo/sources/ne_10m_admin_1_states_provinces.json] | 建立一层 curated label normalization，再为缺失值保留统一 fallback。 [VERIFIED: apps/web/src/data/geo/sources/ne_10m_admin_1_states_provinces.json] | 需要维护映射表，但能处理 `SG` 缺失、`KR`/`AU`/`MY` 多类型并存等问题，避免 Phase 28 文案不稳定。 [VERIFIED: repo command node natural-earth-type-en summary script] |

Phase 28 当前不需要新增第三方包；应复用现有 workspace、现有 geo source catalog 和现有 contracts build 流程。 [VERIFIED: apps/web/package.json] [VERIFIED: apps/server/package.json] [VERIFIED: package.json]

**Execution baseline:**

```bash
pnpm --filter @trip-map/web geo:verify-sources
pnpm --filter @trip-map/web geo:build
pnpm --filter @trip-map/contracts build
```

**Version verification:** `vue@3.5.32`、`pinia@3.0.4`、`vitest@4.1.4` 与 npm 当前最新版本一致；`@nestjs/common` 当前 repo 落后一补丁版；`@prisma/client` 当前 repo 落后一个大版本，但现有测试已验证当前版本可支撑本 phase，无需把覆盖扩容和依赖升级绑在一起。 [VERIFIED: apps/web/package.json] [VERIFIED: apps/server/package.json] [VERIFIED: npm registry]

## Architecture Patterns

### Recommended Project Structure

建议把当前单文件 `apps/web/scripts/geo/overseas-admin1-support.mjs` 拆成同目录多模块，继续让 build 脚本只依赖一个聚合入口，而不是改动 runtime service 位置。 [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md]

```text
apps/web/scripts/geo/
├── overseas-support/
│   ├── asia.mjs           # 东亚 / 东南亚 priority countries
│   ├── middle-east.mjs    # 中东 priority countries
│   ├── oceania.mjs        # 大洋洲 priority countries
│   ├── americas.mjs       # 北美 / 拉美 priority countries
│   └── index.mjs          # 汇总 priorityCountries + guards + label policy
├── overseas-admin1-support.mjs  # 兼容导出层，后续可转为 thin wrapper
└── build-geometry-manifest.mjs  # 继续唯一生成入口
```

### Pattern 1: Build-Time Coverage Expansion

**What:** 海外支持范围必须先在 geo build authoring 层扩容，再生成新的 `overseas/layer.json` 和 `GEOMETRY_MANIFEST`；不要直接修改 generated TS manifest 或 server catalog。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts] [VERIFIED: apps/server/src/modules/canonical-places/place-metadata-catalog.ts]

**When to use:** 任何新增国家、调整 admin1 allow-list / deny-list、切换 `typeLabel` 规则、或需要新增 special identity 的情况都应走这条路径。 [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs]

**Example:** [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs]

```javascript
// Source: apps/web/scripts/geo/build-geometry-manifest.mjs
function createOverseasFeatureMetadata(featureProperties) {
  const identity = buildOverseasIdentity(featureProperties)
  const displayName = featureProperties.name_en ?? featureProperties.name
  const parentLabel = normalizeCountryLabel(
    featureProperties.admin ?? featureProperties.geonunit ?? featureProperties.adm0_a3,
  )

  return {
    ...identity,
    displayName,
    placeKind: 'OVERSEAS_ADMIN1',
    datasetVersion: CANONICAL_DATASET_VERSION,
    regionSystem: 'OVERSEAS',
    adminType: 'ADMIN1',
    typeLabel: '一级行政区',
    parentLabel,
    subtitle: `${parentLabel} · 一级行政区`,
  }
}
```

### Pattern 2: Manifest-Backed Server Validation

**What:** 服务端 resolve、create、import、backfill 都应基于同一份 manifest-backed canonical metadata lookup 做 exact-match，而不是接受客户端自报 metadata。 [VERIFIED: apps/server/src/modules/canonical-places/place-metadata-catalog.ts] [VERIFIED: apps/server/src/modules/records/records.service.ts] [VERIFIED: apps/server/scripts/backfill-record-metadata.ts]

**When to use:** 新国家上线、旧数据 backfill、时间轴/统计 phase 需要复用 metadata 时，都必须继续沿用这套校验。 [VERIFIED: apps/server/src/modules/records/records.service.ts] [VERIFIED: apps/server/scripts/backfill-record-metadata.ts] [VERIFIED: .planning/ROADMAP.md]

**Example:** [VERIFIED: apps/server/src/modules/records/records.service.ts]

```typescript
// Source: apps/server/src/modules/records/records.service.ts
const placeSummary = getCanonicalPlaceSummaryById(input.placeId)
const boundarySummary = getCanonicalPlaceSummaryByBoundaryId(input.boundaryId)

if (!placeSummary || !boundarySummary || placeSummary.placeId !== boundarySummary.placeId) {
  throw new BadRequestException(
    'Overseas travel record is outside the Phase 26 authoritative support catalog.',
  )
}
```

### Pattern 3: Persisted Metadata Replay

**What:** web 端 map consumer 和 server bootstrap 都直接回放持久化 metadata 字段，不在 consumer 层按 `placeId` 重算标题/副标题/类型。 [VERIFIED: apps/server/src/modules/auth/auth.service.ts] [VERIFIED: apps/web/src/stores/map-points.ts]

**When to use:** Phase 28 要保证 timeline/statistics 未来可复用 metadata，就应继续把 `TravelRecord` 视为自描述记录，而不是只存 placeId。 [VERIFIED: packages/contracts/src/records.ts] [VERIFIED: .planning/ROADMAP.md]

**Example:** [VERIFIED: apps/web/src/stores/map-points.ts]

```typescript
// Source: apps/web/src/stores/map-points.ts
function recordToDisplayPoint(record: TravelRecord): MapPointDisplay {
  return {
    id: record.placeId,
    name: record.displayName,
    cityContextLabel: record.subtitle,
    typeLabel: record.typeLabel,
    parentLabel: record.parentLabel,
    boundaryId: record.boundaryId,
  }
}
```

### Anti-Patterns to Avoid

- **只改 `PHASE26_SUPPORTED_OVERSEAS_COUNTRIES` 文案不改 build rules:** 这样会让 unsupported UX、真实支持范围和 generated manifest 脱节。 [VERIFIED: apps/web/src/constants/overseas-support.ts] [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts]
- **手改 `geometry-manifest.generated.ts` 或 `overseas/layer.json`:** 这两个文件都是 build 输出，手改会在下一次 `geo:build` 被覆盖。 [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts] [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs]
- **在 map/timeline/statistics consumer 按 `placeId` 临时推导文案:** 当前 map store 已明确依赖 persisted metadata；如果新 consumer 反向推导，会在 label policy 变更时产生旧记录/新记录分裂。 [VERIFIED: apps/web/src/stores/map-points.ts] [VERIFIED: apps/web/src/stores/map-points.spec.ts]
- **把 D-06 理解为“直接透传 `type_en`”:** Natural Earth 在 `SG` 上缺失 `type_en`，在 `KR`、`AU`、`MY` 上有多种类型值，必须先归一化。 [VERIFIED: apps/web/src/data/geo/sources/ne_10m_admin_1_states_provinces.json] [VERIFIED: repo command node natural-earth-type-en summary script]
- **按 `28-CONTEXT.md` 的旧路径拆任务:** 当前 repo 中不存在 `apps/web/src/stores/overseas-catalog.ts` 和 `apps/server/src/modules/overseas/overseas.service.ts`，Phase 28 规划必须锚定真实文件。 [VERIFIED: shell probe missing files] [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 海外支持范围定义 | 在 web/server 多处各自维护国家名单。 [VERIFIED: apps/web/src/constants/overseas-support.ts] | 让 geo build support rules 成为唯一 authoring 真源，并从它派生 UI summary。 [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] | 单点更新才能避免 Phase 28 扩容后 resolve/save/UI 提示三者 drift。 [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] [VERIFIED: apps/web/src/constants/overseas-support.ts] |
| Geometry shard 路径 | 从国家码或 boundaryId 猜 `/geo/...` 路径。 [VERIFIED: old test refs via repo grep] | 使用 `geometryRef.assetKey` / `GEOMETRY_MANIFEST`。 [VERIFIED: apps/web/src/services/geometry-loader.ts] [VERIFIED: apps/web/src/services/geometry-manifest.ts] | 当前 authoritative overseas asset 已统一为 `overseas/layer.json`，路径推断会复活旧分片假设。 [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts] |
| Overseas metadata consumer | 在 consumer 层自行推导 `typeLabel` / `subtitle`。 [VERIFIED: apps/web/src/stores/map-points.ts] | 复用 persisted `TravelRecord` metadata；仅在 backfill/authoritative catalog 层修正。 [VERIFIED: packages/contracts/src/records.ts] [VERIFIED: apps/server/scripts/backfill-record-metadata.ts] | 这样时间轴、统计和地图才能吃同一份字段，不需要临时兜底。 [VERIFIED: .planning/ROADMAP.md] [VERIFIED: apps/web/src/stores/map-points.spec.ts] |
| Admin1 边界筛选 | 自己重新写一套 GIS 筛选逻辑。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] | 继续复用 vendored Natural Earth snapshot + country-specific allow-list / deny-list / guards。 [VERIFIED: apps/web/src/data/geo/geometry-source-catalog.json] [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] | `AU`、`AE`、`SG` 已经证明需要 country-specific guard，手写新逻辑只会重复踩坑。 [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] |

**Key insight:** 这个 phase 的本质是 authoritative geo-data pipeline 扩容和 metadata contract 稳定化，而不是前端选择器或后端 DTO 的局部小改。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] [VERIFIED: apps/server/src/modules/records/records.service.ts] [VERIFIED: apps/web/src/stores/map-points.ts]

## Common Pitfalls

### Pitfall 1: Support Rule 改了，但 Generated Outputs 没同步

**What goes wrong:** 新国家已经写进 support rules，但 `GEOMETRY_MANIFEST` / `overseas/layer.json` 还是旧内容，结果 resolve/save 仍然像没扩容一样。 [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs]

**Why it happens:** 当前 runtime 只消费 build 输出，不直接读 authoring rule 文件。 [VERIFIED: apps/web/src/services/geometry-manifest.ts] [VERIFIED: apps/server/src/modules/canonical-places/place-metadata-catalog.ts]

**How to avoid:** 每次 support rule 或 metadata 规则变更后，固定跑 `geo:verify-sources`、`geo:build(:check)`、`@trip-map/contracts build`。 [VERIFIED: apps/web/package.json] [VERIFIED: repo command pnpm --filter @trip-map/web geo:verify-sources] [VERIFIED: repo command pnpm --filter @trip-map/web geo:build:check]

**Warning signs:** `records.service` 仍报 “outside the Phase 26 authoritative support catalog”，或 `getGeometryManifestEntry()` 查不到新 boundaryId。 [VERIFIED: apps/server/src/modules/records/records.service.ts] [VERIFIED: apps/web/src/services/geometry-manifest.ts]

### Pitfall 2: 只扩容国家，不处理 D-06 的标签规则

**What goes wrong:** 新国家用 `State` / `Province`，旧 8 国仍是 `一级行政区`，导致地图、bootstrap、未来 timeline/statistics 呈现口径分裂。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md] [VERIFIED: packages/contracts/src/records.ts]

**Why it happens:** 当前 metadata 是持久化并直接回放的，不会在 consumer 层自动“跟随新规则”。 [VERIFIED: apps/server/src/modules/auth/auth.service.ts] [VERIFIED: apps/web/src/stores/map-points.ts]

**How to avoid:** 如果 D-06 要生效，就把 label normalization 和 backfill 作为同一个 wave；如果暂不改旧数据，则必须明确冻结“现有 8 国继续使用通用标签”的兼容政策。 [VERIFIED: apps/server/scripts/backfill-record-metadata.ts] [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md]

**Warning signs:** `auth-bootstrap.e2e` 和 `map-points.spec` 针对 persisted metadata replay 的断言开始出现新旧记录不一致。 [VERIFIED: apps/server/test/auth-bootstrap.e2e-spec.ts] [VERIFIED: apps/web/src/stores/map-points.spec.ts]

### Pitfall 3: 直接信源数据 `type_en`

**What goes wrong:** 某些国家能得到漂亮的 `Prefecture` / `Emirate`，某些国家却得到空字符串或过细类型，最终 UI 表达不统一。 [VERIFIED: apps/web/src/data/geo/sources/ne_10m_admin_1_states_provinces.json] [VERIFIED: repo command node natural-earth-type-en summary script]

**Why it happens:** Natural Earth 的 `type_en` 在 `SG` 缺失，在 `KR`/`AU`/`MY`/`JP` 存在多个值。 [VERIFIED: repo command node natural-earth-type-en summary script]

**How to avoid:** 先定义 normalized type-label policy，再决定哪些国家允许细分类、哪些国家仍统一映射为更稳定的标准标签。 [VERIFIED: apps/web/src/data/geo/sources/ne_10m_admin_1_states_provinces.json] [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md]

**Warning signs:** 同一国家的 admin1 record 出现多种 `typeLabel`，或者 `subtitle` 为空/夹杂源数据内部名词。 [VERIFIED: packages/contracts/src/records.ts] [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs]

### Pitfall 4: 继续沿用旧路径和旧分片假设

**What goes wrong:** planner 把任务拆到不存在的文件，或要求新增 `overseas/us.json` 这类 per-country shard，最终实现偏离当前架构。 [VERIFIED: shell probe missing files] [VERIFIED: repo grep stale path refs] [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts]

**Why it happens:** 仓库里还保留了旧版 dataset、旧 spec 和旧 fixtures，因此全文搜索能搜到过时路径。 [VERIFIED: apps/web/public/geo/2026-03-31-geo-v1/manifest.json] [VERIFIED: apps/web/src/services/geometry-loader.spec.ts] [VERIFIED: apps/web/src/services/geometry-validation.spec.ts] [VERIFIED: packages/contracts/src/fixtures.ts]

**How to avoid:** 以当前 `GEOMETRY_MANIFEST`、`geometry-manifest.spec.ts`、`canonical-resolve.e2e` 和运行中的 build 命令为 authoritative 依据；把旧 spec 视为历史 regression 参考，不作为 Phase 28 的文件定位依据。 [VERIFIED: apps/web/src/services/geometry-manifest.spec.ts] [VERIFIED: repo command pnpm --filter @trip-map/web test src/services/geometry-manifest.spec.ts] [VERIFIED: repo command cd apps/server && pnpm test test/canonical-resolve.e2e-spec.ts]

**Warning signs:** 规划文档里再次出现 `apps/web/src/stores/overseas-catalog.ts`、`apps/server/src/modules/overseas/overseas.service.ts`、`overseas/us.json` 作为主路径。 [VERIFIED: shell probe missing files] [VERIFIED: repo grep stale path refs]

## Code Examples

Verified patterns from current codebase:

### 当前 overseas metadata 生成口径

```javascript
// Source: apps/web/scripts/geo/build-geometry-manifest.mjs
return {
  ...identity,
  displayName,
  placeKind: 'OVERSEAS_ADMIN1',
  datasetVersion: CANONICAL_DATASET_VERSION,
  regionSystem: 'OVERSEAS',
  adminType: 'ADMIN1',
  typeLabel: '一级行政区',
  parentLabel,
  subtitle: `${parentLabel} · 一级行政区`,
}
```

这段代码证明“displayName / typeLabel / parentLabel / subtitle”当前是在 geo build 阶段一次性写进 feature metadata 的。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs]

### 当前 server authoritative metadata guard

```typescript
// Source: apps/server/src/modules/records/records.service.ts
const mismatchedFields = [
  ['datasetVersion', input.datasetVersion, placeSummary.datasetVersion],
  ['displayName', input.displayName, placeSummary.displayName],
  ['regionSystem', input.regionSystem, placeSummary.regionSystem],
  ['adminType', input.adminType, placeSummary.adminType],
  ['typeLabel', input.typeLabel, placeSummary.typeLabel],
  ['parentLabel', input.parentLabel, placeSummary.parentLabel],
  ['subtitle', input.subtitle, placeSummary.subtitle],
]
  .filter(([, actual, expected]) => actual !== expected)
  .map(([field]) => field)
```

这段代码说明 Phase 28 一旦改 metadata 规则，`create/import` 和现有测试都要一起更新，否则所有“旧 schema / 新 catalog”组合都会被判定为 forged metadata。 [VERIFIED: apps/server/src/modules/records/records.service.ts] [VERIFIED: apps/server/test/records-travel.e2e-spec.ts] [VERIFIED: apps/server/test/records-import.e2e-spec.ts]

### 当前 web saved-record replay 口径

```typescript
// Source: apps/web/src/stores/map-points.ts
function recordToDisplayPoint(record: TravelRecord): MapPointDisplay {
  return {
    id: record.placeId,
    name: record.displayName,
    cityContextLabel: record.subtitle,
    typeLabel: record.typeLabel,
    parentLabel: record.parentLabel,
    boundaryId: record.boundaryId,
  }
}
```

这段代码说明未来 timeline/statistics 只要继续消费 `TravelRecord` 的 persisted metadata，就不需要在 consumer 侧做临时兜底推导。 [VERIFIED: apps/web/src/stores/map-points.ts] [VERIFIED: packages/contracts/src/records.ts]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 旧 spec / fixture 仍引用 `overseas/us.json` 和 `2026-03-31-geo-v1`。 [VERIFIED: apps/web/src/services/geometry-loader.spec.ts] [VERIFIED: apps/web/src/services/geometry-validation.spec.ts] [VERIFIED: packages/contracts/src/fixtures.ts] | 当前 authoritative manifest 使用 `overseas/layer.json` 和 `2026-04-02-geo-v2`。 [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts] [VERIFIED: apps/web/src/services/geometry-manifest.spec.ts] | 至少在 `2026-04-16` 生成的当前 manifest 里已经完成切换。 [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts] | Phase 28 规划必须按 manifest-driven asset path 思维工作，不能恢复 per-country shard 设计。 [VERIFIED: apps/web/src/services/geometry-loader.ts] |
| `28-CONTEXT.md` 假设存在 `apps/web/src/stores/overseas-catalog.ts` 和 `apps/server/src/modules/overseas/overseas.service.ts`。 [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md] | 当前真实实现位于 `build-geometry-manifest.mjs`、`overseas-admin1-support.mjs`、`place-metadata-catalog.ts`、`canonical-places.service.ts`、`records.service.ts`、`overseas-support.ts`。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] [VERIFIED: apps/server/src/modules/canonical-places/place-metadata-catalog.ts] [VERIFIED: apps/server/src/modules/canonical-places/canonical-places.service.ts] [VERIFIED: apps/server/src/modules/records/records.service.ts] [VERIFIED: apps/web/src/constants/overseas-support.ts] | 当前仓库状态 `2026-04-21`。 [VERIFIED: current_date] | 如果 planner 继续按旧路径拆任务，会直接拆到不存在的文件。 [VERIFIED: shell probe missing files] |
| 当前 overseas `typeLabel` 全部统一为 `一级行政区`。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] [VERIFIED: apps/web/public/geo/2026-04-02-geo-v2/overseas/layer.json] | `28-CONTEXT.md` 锁定决策要求使用 `State` / `Province` / `Region` 等标准标签。 [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md] | 尚未在代码中落地；这是 Phase 28 需要决定并执行的变更。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md] | 如果采纳 D-06，既有 8 国记录和 future consumer compatibility 都必须纳入同一 migration/backfill 方案。 [VERIFIED: apps/server/scripts/backfill-record-metadata.ts] [VERIFIED: apps/web/src/stores/map-points.ts] |

**Deprecated/outdated:**

- `apps/web/src/stores/overseas-catalog.ts`、`apps/server/src/modules/overseas/overseas.service.ts` 在当前 repo 中不存在；它们只能作为 stale planning reference，不能作为实施目标。 [VERIFIED: shell probe missing files] [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md]
- 旧版 `2026-03-31-geo-v1` / `overseas/us.json` 相关 spec 和 fixture 仍在仓库中，但当前 authoritative manifest 和现行 web service 已切换到 `2026-04-02-geo-v2` / `overseas/layer.json`。 [VERIFIED: apps/web/public/geo/2026-03-31-geo-v1/manifest.json] [VERIFIED: apps/web/src/services/geometry-loader.spec.ts] [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts] [VERIFIED: apps/web/src/services/geometry-manifest.ts]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | None. 当前实现、数据范围、命令可用性和测试状态都已在本次会话中通过代码读取或实际执行验证。 [VERIFIED: codebase reads] [VERIFIED: repo command suite in this research] | — | — |

## Open Questions (RESOLVED)

1. **Phase 28 的“更广优先国家/地区”具体名单是什么？**
   - Resolution: planning 已锁定为 21 国的区域均衡矩阵，并在 `28-01-PLAN.md` 中按 authoring layer 直接落成固定范围，不留“后续再补国家”的口子。现有 8 国保留：`JP KR TH SG MY AE AU US`；新增 13 国：`IN ID SA PG CA BR AR DE PL CZ EG MA ZA`。 [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-01-PLAN.md]
   - Region split: Asia `JP KR TH SG MY IN ID`；Middle East `AE SA`；Oceania `AU PG`；Americas `US CA BR AR`；Europe `DE PL CZ`；Africa `EG MA ZA`。 [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-01-PLAN.md]
   - Planning consequence: 后续执行必须按该 21 国矩阵完成 build、server、consumer 和验证，不允许在 phase 内临时缩放范围。 [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-01-PLAN.md]

2. **D-06 的标准标签应该如何归一化？**
   - Resolution: planning 采用 country-level canonical label policy，而不是直接透传 Natural Earth 原始 `type_en`，也不是继续使用通用中文 `一级行政区`。示例映射包括：`JP -> Prefecture`、`US/IN/AU/DE/BR -> State`、`KR/TH/CA/ID/PG/PL -> Province`、`AE -> Emirate`、`EG -> Governorate`、`CZ/SA/SG -> Region`。 [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-01-PLAN.md]
   - Data consequence: `28-02-PLAN.md` 已把既有 8 国 persisted records 的 metadata backfill 作为显式任务，要求把旧 `一级行政区` 数据升级为新的标准标签与 subtitle。 [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-02-PLAN.md]
   - Consumer consequence: web/contracts fixtures 与 regression 也必须同步到这套标签策略，避免 Phase 29/30 继续继承旧文案基线。 [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-03-PLAN.md]

3. **D-07 的“catalog 拆成多个文件”应该落在哪一层？**
   - Resolution: 多文件拆分只落在 build-time authoring 层，即 `apps/web/scripts/geo/overseas-support/` 下的区域模块和聚合入口；`apps/web/scripts/geo/overseas-admin1-support.mjs` 只保留 thin wrapper / re-export 职责。 [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-01-PLAN.md]
   - Non-goal: 不引入新的 runtime catalog JSON / store / server module；runtime 继续只消费 generated `GEOMETRY_MANIFEST` 与 geometry shard metadata。 [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-01-PLAN.md] [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-RESEARCH.md]
   - Planning consequence: D-07 的实现边界已经锁死为 authoring 拆分，不再需要额外的 runtime truth source 决策。 [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-01-PLAN.md]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | geo build、Vitest、workspace scripts。 [VERIFIED: package.json] | ✓ [VERIFIED: shell probe] | `v22.22.1` [VERIFIED: shell probe] | — |
| pnpm | monorepo scripts。 [VERIFIED: package.json] | ✓ [VERIFIED: shell probe] | `10.33.0` [VERIFIED: shell probe] | — |
| npm | registry version verification。 [VERIFIED: this research workflow] | ✓ [VERIFIED: shell probe] | `10.9.4` [VERIFIED: shell probe] | — |
| Docker | 可选的本地基础设施调试 / DB 容器化。 [VERIFIED: shell probe] | ✓ [VERIFIED: shell probe] | `28.5.2` [VERIFIED: shell probe] | — |
| PostgreSQL runtime | Prisma-backed server e2e。 [VERIFIED: apps/server/package.json] | ✓ [VERIFIED: repo command cd apps/server && pnpm test test/canonical-resolve.e2e-spec.ts] [VERIFIED: repo command cd apps/server && pnpm test test/records-travel.e2e-spec.ts] [VERIFIED: repo command cd apps/server && pnpm test test/auth-bootstrap.e2e-spec.ts] [VERIFIED: repo command cd apps/server && pnpm test test/records-import.e2e-spec.ts] | version unknown；CLI 未探测到。 [VERIFIED: shell probe] | — |
| PostgreSQL CLI (`psql`, `pg_isready`) | 手工数据库排查。 [VERIFIED: shell probe] | ✗ [VERIFIED: shell probe] | — | 直接依赖现有 server e2e 作为数据库可用性 smoke check。 [VERIFIED: repo command cd apps/server && pnpm test test/canonical-resolve.e2e-spec.ts] |

**Missing dependencies with no fallback:** None. [VERIFIED: repo command suite in this research]

**Missing dependencies with fallback:** PostgreSQL CLI utilities 未安装，但 Prisma-backed server e2e 已能运行，短期可用测试代替手工连库排查。 [VERIFIED: shell probe] [VERIFIED: repo command cd apps/server && pnpm test test/records-travel.e2e-spec.ts]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `4.1.4` across web/server/contracts。 [VERIFIED: package.json] [VERIFIED: apps/web/vitest.config.ts] [VERIFIED: apps/server/vitest.config.ts] [VERIFIED: packages/contracts/vitest.config.ts] |
| Config file | `apps/web/vitest.config.ts`; `apps/server/vitest.config.ts`; `packages/contracts/vitest.config.ts`。 [VERIFIED: apps/web/vitest.config.ts] [VERIFIED: apps/server/vitest.config.ts] [VERIFIED: packages/contracts/vitest.config.ts] |
| Quick run command | `pnpm --filter @trip-map/web geo:build:check && pnpm --filter @trip-map/web test src/services/geometry-manifest.spec.ts && cd apps/server && pnpm test test/canonical-resolve.e2e-spec.ts`。 [VERIFIED: repo command pnpm --filter @trip-map/web geo:build:check] [VERIFIED: repo command pnpm --filter @trip-map/web test src/services/geometry-manifest.spec.ts] [VERIFIED: repo command cd apps/server && pnpm test test/canonical-resolve.e2e-spec.ts] |
| Full suite command | `pnpm test`。 [VERIFIED: package.json] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GEOX-01 | 新国家的 admin1 能进入 authoritative support、可 resolve、可保存。 [VERIFIED: .planning/REQUIREMENTS.md] | geo-build dry-run + server e2e。 [VERIFIED: repo command pnpm --filter @trip-map/web geo:build:check] [VERIFIED: repo command cd apps/server && pnpm test test/canonical-resolve.e2e-spec.ts] | `pnpm --filter @trip-map/web geo:build:check && cd apps/server && pnpm test test/canonical-resolve.e2e-spec.ts && pnpm test test/records-travel.e2e-spec.ts`。 [VERIFIED: repo command suite in this row] | ✅ [VERIFIED: apps/server/test/canonical-resolve.e2e-spec.ts] [VERIFIED: apps/server/test/records-travel.e2e-spec.ts] |
| GEOX-02 | metadata 在 map / bootstrap / future consumer 路径上保持一致。 [VERIFIED: .planning/REQUIREMENTS.md] | server e2e + web store/UI regression。 [VERIFIED: repo command cd apps/server && pnpm test test/auth-bootstrap.e2e-spec.ts] [VERIFIED: repo command pnpm --filter @trip-map/web test src/stores/map-points.spec.ts] [VERIFIED: repo command pnpm --filter @trip-map/web test src/components/LeafletMapStage.spec.ts] | `cd apps/server && pnpm test test/auth-bootstrap.e2e-spec.ts && pnpm test test/records-import.e2e-spec.ts && cd ../../ && pnpm --filter @trip-map/web test src/stores/map-points.spec.ts && pnpm --filter @trip-map/web test src/components/LeafletMapStage.spec.ts`。 [VERIFIED: repo command suite in this row] | ✅ [VERIFIED: apps/server/test/auth-bootstrap.e2e-spec.ts] [VERIFIED: apps/server/test/records-import.e2e-spec.ts] [VERIFIED: apps/web/src/stores/map-points.spec.ts] [VERIFIED: apps/web/src/components/LeafletMapStage.spec.ts] |

### Sampling Rate

- **Per task commit:** 运行与当前切片对应的最小命令集；geo rule / manifest 变更至少跑 `geo:build:check` + `geometry-manifest.spec.ts`，server metadata 变更至少跑对应 e2e。 [VERIFIED: repo command pnpm --filter @trip-map/web geo:build:check] [VERIFIED: repo command pnpm --filter @trip-map/web test src/services/geometry-manifest.spec.ts] [VERIFIED: repo command cd apps/server && pnpm test test/records-travel.e2e-spec.ts]
- **Per wave merge:** 跑完整的 GEOX-01 + GEOX-02 组合回归命令。 [VERIFIED: Validation Architecture test map above]
- **Phase gate:** `pnpm test` + 一次非 dry-run `pnpm --filter @trip-map/web geo:build` 生成产物核对后，再进入 `/gsd-verify-work`。 [VERIFIED: package.json] [VERIFIED: apps/web/package.json]

### Wave 0 Gaps

- [ ] 目前还没有专门面向“未来 timeline/statistics consumer” 的 contract/selector regression test；Phase 28 最好补一条，证明 consumer 可以只读 persisted metadata 而不做 fallback 推导。 [VERIFIED: .planning/ROADMAP.md] [VERIFIED: repo grep no timeline/statistics tests]
- [ ] 如果 D-06 要落地为 country-specific labels，需要新增覆盖“旧 8 国 metadata backfill 后 bootstrap/map 仍一致”的回归测试。 [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md] [VERIFIED: apps/server/scripts/backfill-record-metadata.ts]
- [ ] 如果 unsupported 文案从硬编码 8 国常量改为 generated summary，需要补一条 web unit test 防止文案与支持范围再次双写漂移。 [VERIFIED: apps/web/src/constants/overseas-support.ts] [VERIFIED: apps/web/src/components/LeafletMapStage.spec.ts]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes。当前保存/导入/读取旅行记录仍建立在已登录 `sid` session 之上。 [VERIFIED: apps/server/src/modules/auth/auth.service.ts] | 继续复用现有 email/password + session auth，不在 Phase 28 改 auth 体系。 [VERIFIED: .planning/PROJECT.md] [VERIFIED: apps/server/src/modules/auth/auth.service.ts] |
| V3 Session Management | yes。bootstrap replay 完全依赖 `AuthSession` 和 `sid` cookie。 [VERIFIED: apps/server/prisma/schema.prisma] [VERIFIED: apps/server/src/modules/auth/auth.service.ts] | 保持 `/auth/bootstrap` 为 authoritative snapshot 真源。 [VERIFIED: .planning/STATE.md] [VERIFIED: apps/web/src/stores/auth-session.ts] |
| V4 Access Control | yes。所有用户记录查询 / 删除都按 `userId` 作用域执行。 [VERIFIED: apps/server/src/modules/records/records.repository.ts] | 继续让 RecordsRepository 作为 user-scoped persistence 边界。 [VERIFIED: apps/server/src/modules/records/records.repository.ts] |
| V5 Input Validation | yes。Phase 28 会新增更多 overseas payload，因此 DTO + service guard 是强制项。 [VERIFIED: apps/server/src/modules/records/dto/create-travel-record.dto.ts] [VERIFIED: apps/server/src/modules/canonical-places/canonical-places.controller.ts] [VERIFIED: apps/server/src/modules/records/records.service.ts] | 使用 `ValidationPipe` + `class-validator` + authoritative exact-match guard。 [VERIFIED: apps/server/src/modules/canonical-places/canonical-places.controller.ts] [VERIFIED: apps/server/src/modules/records/records.service.ts] |
| V6 Cryptography | yes。虽然 Phase 28 不直接改密码逻辑，但整个 authenticated write path 仍依赖现有 argon2 password storage。 [VERIFIED: apps/server/src/modules/auth/auth.service.ts] | 继续使用 `argon2`，不要在本 phase 自己处理任何密码或 token 加密逻辑。 [VERIFIED: apps/server/package.json] [VERIFIED: apps/server/src/modules/auth/auth.service.ts] |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Forged overseas metadata payload | Tampering | `assertAuthoritativeOverseasRecord()` 按 `placeId` / `boundaryId` 和所有 metadata 字段 exact-match。 [VERIFIED: apps/server/src/modules/records/records.service.ts] |
| Over-posting / malformed request body | Tampering | `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })` + DTO enum/string/date validation。 [VERIFIED: apps/server/src/modules/canonical-places/canonical-places.controller.ts] [VERIFIED: apps/server/src/modules/records/dto/create-travel-record.dto.ts] |
| Cross-user read/delete of travel records | Elevation of Privilege | repository 所有 travel query / delete 都带 `userId` 条件。 [VERIFIED: apps/server/src/modules/records/records.repository.ts] |
| Metadata drift causing misleading UI after replay | Tampering | 只回放 persisted metadata，并通过 backfill 统一修正旧数据；不要在 consumer 层重算。 [VERIFIED: apps/server/scripts/backfill-record-metadata.ts] [VERIFIED: apps/web/src/stores/map-points.ts] |

## Sources

### Primary (HIGH confidence)

- `.planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md`，用于锁定 user constraints 和识别 stale refs。 [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md]
- `.planning/REQUIREMENTS.md`、`.planning/ROADMAP.md`、`.planning/STATE.md`、`.planning/PROJECT.md`，用于确认 GEOX-01 / GEOX-02 的 phase 边界和 downstream consumer 关系。 [VERIFIED: .planning/REQUIREMENTS.md] [VERIFIED: .planning/ROADMAP.md] [VERIFIED: .planning/STATE.md] [VERIFIED: .planning/PROJECT.md]
- `apps/web/scripts/geo/overseas-admin1-support.mjs`、`apps/web/scripts/geo/build-geometry-manifest.mjs`、`apps/web/src/data/geo/geometry-source-catalog.json`，用于确认真实覆盖 authoring 点、上游 source 和 current metadata generation 规则。 [VERIFIED: apps/web/scripts/geo/overseas-admin1-support.mjs] [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] [VERIFIED: apps/web/src/data/geo/geometry-source-catalog.json]
- `packages/contracts/src/generated/geometry-manifest.generated.ts`、`apps/web/public/geo/2026-04-02-geo-v2/overseas/layer.json`，用于确认 current dataset version、entry count、country distribution 和 feature-level metadata。 [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts] [VERIFIED: apps/web/public/geo/2026-04-02-geo-v2/overseas/layer.json]
- `apps/server/src/modules/canonical-places/*`、`apps/server/src/modules/records/*`、`apps/server/src/modules/auth/auth.service.ts`、`apps/server/scripts/backfill-record-metadata.ts`，用于确认 resolve、validation、bootstrap replay、backfill 链。 [VERIFIED: apps/server/src/modules/canonical-places/canonical-places.service.ts] [VERIFIED: apps/server/src/modules/canonical-places/place-metadata-catalog.ts] [VERIFIED: apps/server/src/modules/records/records.service.ts] [VERIFIED: apps/server/src/modules/records/records.repository.ts] [VERIFIED: apps/server/src/modules/auth/auth.service.ts] [VERIFIED: apps/server/scripts/backfill-record-metadata.ts]
- `apps/web/src/stores/map-points.ts`、`apps/web/src/stores/auth-session.ts`、`apps/web/src/constants/overseas-support.ts`、`apps/web/src/components/LeafletMapStage.vue`，用于确认 map/bootstrap replay 与 unsupported-country UX 的耦合点。 [VERIFIED: apps/web/src/stores/map-points.ts] [VERIFIED: apps/web/src/stores/auth-session.ts] [VERIFIED: apps/web/src/constants/overseas-support.ts] [VERIFIED: apps/web/src/components/LeafletMapStage.vue]
- 实际执行命令：`geo:verify-sources`、`geo:build:check`、`geometry-manifest.spec.ts`、`LeafletMapStage.spec.ts`、`map-points.spec.ts`、`contracts.spec.ts`、`canonical-resolve.e2e-spec.ts`、`records-travel.e2e-spec.ts`、`auth-bootstrap.e2e-spec.ts`、`records-import.e2e-spec.ts`。 [VERIFIED: repo command suite in this research]
- npm registry 查询：`vue`、`pinia`、`@nestjs/common`、`@prisma/client`、`vitest`。 [VERIFIED: npm registry]

### Secondary (MEDIUM confidence)

- None. 本研究未依赖 web search 或社区帖子。 [VERIFIED: research workflow]

### Tertiary (LOW confidence)

- None. 本研究没有仅靠训练知识做出的未验证实现性结论。 [VERIFIED: research workflow]

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - 全部来自当前 `package.json`、source catalog、generated manifest 和 npm registry。 [VERIFIED: package.json] [VERIFIED: apps/web/package.json] [VERIFIED: apps/server/package.json] [VERIFIED: apps/web/src/data/geo/geometry-source-catalog.json] [VERIFIED: packages/contracts/src/generated/geometry-manifest.generated.ts] [VERIFIED: npm registry]
- Architecture: HIGH - 全部来自真实 build script、server modules、web stores 和已跑通的回归命令。 [VERIFIED: apps/web/scripts/geo/build-geometry-manifest.mjs] [VERIFIED: apps/server/src/modules/records/records.service.ts] [VERIFIED: apps/web/src/stores/map-points.ts] [VERIFIED: repo command suite in this research]
- Pitfalls: MEDIUM - 核心风险已验证，但最终 target country list 和 D-06 label policy 仍待 user / planner 锁定。 [VERIFIED: .planning/phases/28-overseas-coverage-expansion/28-CONTEXT.md] [VERIFIED: .planning/REQUIREMENTS.md]

**Research date:** 2026-04-21  
**Valid until:** 2026-05-21
