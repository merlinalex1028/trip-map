# Phase 12: Canonical 地点语义 - Research

**Researched:** 2026-03-30
**Domain:** canonical place resolve contracts across `contracts` / `server` / `web`
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### 中国侧 canonical 归类与真实称谓
- **D-01:** 中国侧 canonical 结果不把所有地点统一伪装成“城市”；前端必须按真实行政称谓展示正式地点类型。
- **D-02:** 北京、上海、天津、重庆在产品中明确展示为“直辖市”，而不是泛化成普通城市标签。
- **D-03:** 港澳在产品中明确展示为“特别行政区”，不伪装成“城市”，但仍归中国侧语义体系处理，而不是归入海外一级行政区语义。
- **D-04:** 中国侧其他正式地点若属于自治州、地区、盟等非“市”地级单位，前端保持真实行政称谓展示，不统一抹平成“城市”。

### Canonical resolve 与候选确认链路
- **D-05:** `server` 从 Phase 12 开始成为 canonical area resolve 的权威来源；前端不再长期维护另一套正式判定逻辑。
- **D-06:** 对于存在歧义的点击结果，系统继续保留候选确认链路，不把不确定结果伪装成唯一正确答案。
- **D-07:** 候选确认所需的 canonical 候选集、推荐项与必要提示信息由 `server` 返回，前端只负责展示与确认，不再自行生成正式候选集。
- **D-08:** 候选列表上限继续保持最多 3 个，延续 Phase 7 的轻确认密度，避免把确认表面重新做成搜索页。

### 跨表面语义展示合同
- **D-09:** popup、drawer、已保存记录与后续地图高亮引用的地点摘要，都必须消费同一套 canonical 身份与真实类型语义，不能在不同表面把同一地点叫成不同层级。
- **D-10:** 地点主标题旁明确显示真实类型标签，例如“直辖市”“特别行政区”“自治州”“一级行政区”，不再省略或弱化层级语义。
- **D-11:** 地点副标题统一采用“上级归属 + 类型语义”的结构，例如“中国 · 直辖市”“中国 · 特别行政区”“United States · 一级行政区”，确保用户一眼区分中国侧与海外侧正式语义。

### 失败口径与 canonical 边界
- **D-12:** 当系统无法可靠命中到中国侧正式地点或海外一级行政区时，必须严格失败，不创建任何 fallback 记录。
- **D-13:** Phase 12 不再沿用“按国家/地区继续记录”作为正式兜底路径；这类点击只给明确失败反馈，避免产生伪 canonical 记录。
- **D-14:** “严格失败”优先于“不中断流程”，Phase 12 的首要目标是把 canonical 边界做准，而不是在不确定场景下继续创建更粗粒度记录。

### Claude's Discretion
- 中国侧正式地点类型在契约中的具体编码方式，以及它与现有 `PlaceKind` 的扩展或映射策略，只要不破坏“中国侧 / 海外一级行政区”主边界。
- `server` 返回候选集时的精确 payload 结构、推荐项字段命名、失败 reason 枚举与置信度表达，只要前端能稳定消费并做一致反馈。
- 跨表面类型标签的具体文案、排序、视觉样式与是否补充别名，只要不削弱真实行政语义。
- 海外一级行政区的主标题采用何种主名 / 别名策略，只要保证 canonical 身份稳定且 UI 语义一致。

### Deferred Ideas (OUT OF SCOPE)
- 中国与海外几何资产的正式数据源、版本清单、字段清洗与交付策略 — 属于 Phase 13
- `Leaflet` 地图图层迁移、GeoJSON 图层加载与点击/高亮迁移 — 属于 Phase 14
- 记录 CRUD、点亮 / 取消点亮 API、统一服务端持久化闭环 — 属于 Phase 15
- 旧 `localStorage` / seed 点位向新 canonical 模型的兼容或迁移 — 明确不纳入 v3.0 正式方案
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ARC-02 | `server` 从 `v3.0` 开始成为 canonical area resolve 的权威来源，前端不再长期保留另一套主判定逻辑 | 新增 `server` resolve endpoint、前端 API client、移除 `apps/web/src/services/geo-lookup.ts` 的权威角色，只保留 UI 消费与短期桥接 |
| PLC-01 | 中国境内地点以市级行政区作为正式记录语义，海外地点以一级行政区作为正式记录语义 | 用 discriminated union resolve 结果表达 `CN_*` 与 `OVERSEAS_ADMIN1`，并把中国真实行政类型单独编码/映射到 UI 标签 |
| PLC-02 | 系统为每个可记录地点生成稳定的 canonical `placeId`，而不是依赖展示名称或临时拼接字符串作为主键 | `placeId` 与 `displayName`、`datasetVersion` 脱钩；跨 popup/drawer/saved/highlight 统一使用 stable ref |
| PLC-03 | 系统会持久化 `placeKind`、`boundaryId`、`datasetVersion` 和原始点击坐标，以支持后续重开和版本兼容 | 扩展 canonical summary / persisted point shape，把语义字段与 `lat/lng` 同时保留到本地临时存储和后续 DTO |
| PLC-04 | 当地点无法可靠命中到中国市级或海外一级行政区时，系统会给出明确 fallback，而不是静默创建错误地点 | resolve contract 必须包含 `failed` 分支与 reason 枚举；前端只展示失败反馈，不再创建国家/地区 fallback 草稿 |
| PLC-05 | 用户在 popup、drawer、已保存记录和地图高亮中看到的是同一个 canonical 地点身份，不会出现名称、边界和保存结果不一致 | store 派生状态只消费同一份 canonical summary；显示标签、`boundaryId`、保存键与 reopen 恢复全部由同一对象驱动 |
| UIX-04 | 用户可以清楚区分“中国市级”和“海外一级行政区”这两类地点语义，不会被统一伪装成“城市” | 统一 `title + type label + subtitle` 展示合同，并保留中国真实行政称谓而不是一律 `city` |
</phase_requirements>

## Summary

Phase 12 最值得规划器优先锁定的，不是“再写一版更聪明的前端 geo lookup”，而是把 canonical 语义的权威边界一次性收住：`server` 负责把点击坐标解析成 `resolved / ambiguous / failed` 三类正式结果，`contracts` 负责定义稳定 identity 与显示语义，`web` 只负责消费结果并把同一个 canonical summary 投影到 popup、drawer、已保存记录和地图高亮。

现有代码的最大风险很明确：`apps/web/src/services/geo-lookup.ts` 仍在本地执行国家/地区命中、城市候选排序和 fallback；`apps/web/src/types/geo.ts`、[`apps/web/src/types/map-point.ts`](/Users/huangjingping/i/trip-map/apps/web/src/types/map-point.ts) 和 [`apps/web/src/services/point-storage.ts`](/Users/huangjingping/i/trip-map/apps/web/src/services/point-storage.ts) 仍以“城市优先、国家兜底”的 v2 语义组织状态。这意味着如果 Phase 12 只加一个后端接口、却不把前端状态模型和持久化字段一起收口，ARC-02、PLC-02、PLC-03、PLC-05 会一起失效。

本 phase 不应该等待 Phase 13 的正式 GeoJSON 资产交付后再开始。更稳的方式是“契约先行、数据实现可替换”：先在 `contracts` 和 `server` 中固定 canonical resolve 合同与 place taxonomy，再由 `server` 暂时复用当前仓库已有的离线候选/区域数据或受限 fixture 做解析，等 Phase 13 只替换 resolver 背后的数据源，不改 API 和 UI 语义。

**Primary recommendation:** 规划为 4 条主线并行推进: 1) `contracts` 先定义 canonical resolve union 与 richer summary；2) `server` 新增 authoritative resolve 模块；3) `web` 把候选流、popup/drawer 摘要和本地临时存储全部切到 canonical summary；4) 用 server e2e + web store/UI tests 把“同一 canonical 身份跨表面一致”钉死。

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@trip-map/contracts` | workspace `0.1.0` | canonical DTO、resolve response union、共享 place 字段 | Phase 11 已锁定“薄契约层”；Phase 12 最小改动的入口就是在这里扩展 canonical 合同，而不是再造共享运行时 |
| `@nestjs/common` + `@nestjs/platform-fastify` | repo `11.1.17`; npm latest `11.1.17` | authoritative resolve controller / service / DTO validation | `apps/server` 已落地 NestJS + Fastify；官方文档明确推荐用 `ValidationPipe` 和 DTO classes 做请求验证 |
| `class-validator` + `class-transformer` | repo `0.15.1` / `0.5.1`; npm latest `0.15.1` / `0.5.1` | 解析请求的结构校验与白名单过滤 | Nest 官方 validation 路径直接依赖它们，适合 resolve endpoint 的 `lat/lng` 和 confirm payload |
| `@prisma/client` + `prisma` | repo `6.19.2`; npm latest `7.6.0` | 当前 PostgreSQL smoke baseline 与后续唯一约束承载层 | Phase 12 不是 ORM 升级 phase；继续沿用现有 Prisma 6 基线，避免把语义改造和框架升级绑在一起 |
| `vue` + `pinia` | repo `3.5.21` / `3.0.3`; npm latest `3.5.31` / `3.0.4` | popup、drawer、saved/highlight 的单一 canonical 状态消费层 | 现有 UI 已集中在 Vue Composition API + Pinia setup store，适合用 computed 派生所有表面语义 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vitest` | repo `3.2.4`; npm latest `4.1.2` | `contracts`、`server`、`web` 的 phase-level regression | 为 Phase 12 新增 contract/e2e/store/UI regression，不要在本 phase 引入另一套测试框架 |
| `d3-geo` | repo `3.1.1`; npm latest `3.1.1` | 当前离线 polygon hit 的既有实现基础 | 如果 `server` 直接迁移现有命中逻辑，优先复用既有算法和数据形态，而不是新写几何 helper |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 继续由前端 authoritative resolve | `server` authoritative resolve + 前端纯消费 | 前端本地 resolve 会直接违背 ARC-02，并持续制造 popup / drawer / save / highlight 语义漂移 |
| 扩张 `contracts` 为共享业务层 | 仅在 `contracts` 放类型和 DTO，把 resolver 逻辑留在 `apps/server` | 共享业务层会违反 Phase 11 “薄契约层”决策，也会重新制造双端权威 |
| 只保留两值 `PlaceKind` 并把真实称谓硬编码在组件 | 保留跨边界 coarse kind，同时新增 `adminType` / `typeLabel` 元数据 | 组件硬编码会让不同表面再次漂移；增加 subtype 元数据更适合中国真实称谓 |
| 继续创建国家/地区 fallback 记录 | `failed` response + 明确 reason feedback | 国家/地区 fallback 会继续制造伪 canonical 记录，直接冲突 D-12 至 D-14 |

**Installation:**
```bash
pnpm install
```

**Version verification:** 2026-03-30 通过 `npm view` 核实。
- `@nestjs/common`: repo `11.1.17`; npm latest `11.1.17`; published `2026-03-16`
- `class-validator`: repo `0.15.1`; npm latest `0.15.1`; published `2026-02-26`
- `class-transformer`: repo `0.5.1`; npm latest `0.5.1`; published `2021-11-22`
- `vue`: repo `3.5.21`; npm latest `3.5.31`; latest published `2026-03-25`
- `pinia`: repo `3.0.3`; npm latest `3.0.4`; latest published `2025-11-05`
- `@prisma/client`: repo `6.19.2`; npm latest `7.6.0`; latest published `2026-03-27`
- `vitest`: repo `3.2.4`; npm latest `4.1.2`; latest published `2026-03-26`
- `d3-geo`: repo `3.1.1`; npm latest `3.1.1`; published `2024-03-12`

**Dependency policy for this phase:** Keep repo-pinned versions for implementation. Phase 12 is semantic-contract work, not a dependency-upgrade wave.

## Architecture Patterns

### Recommended Project Structure

```text
packages/contracts/src/
├── place.ts                # Canonical ref, summary, place taxonomy, UI-facing labels
├── records.ts              # Persisted record payloads that carry canonical refs
└── index.ts

apps/server/src/modules/
├── canonical-places/
│   ├── canonical-places.controller.ts   # POST /places/resolve, POST /places/confirm
│   ├── canonical-places.service.ts      # authoritative resolve + candidate ranking
│   ├── dto/
│   └── fixtures/ or data/               # temporary offline catalog until Phase 13 swaps data source
├── records/
└── prisma/

apps/web/src/
├── services/api/            # canonical resolve client
├── stores/                  # canonical selection + summary surface derivation
├── types/                   # UI projection types only
├── components/              # popup/drawer consume the same canonical summary
└── services/point-storage.ts
```

### Pattern 1: Server-Authoritative Resolve Contract
**What:** `server` 接受点击坐标或候选确认输入，返回 discriminated union: `resolved`、`ambiguous`、`failed`。`resolved` 和 `ambiguous` 都必须带 canonical 候选或 canonical summary；`failed` 必须带明确 reason。

**When to use:** 所有地图点击、候选确认、reopen 身份校验和后续 records API 都应基于同一套 contract，而不是让 web 各自猜测。

**Example:**
```typescript
// Source: https://docs.nestjs.com/techniques/validation
import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { IsLatitude, IsLongitude } from 'class-validator'

class ResolveCanonicalPlaceDto {
  @IsLatitude()
  lat!: number

  @IsLongitude()
  lng!: number
}

@Controller('places')
export class CanonicalPlacesController {
  @Post('resolve')
  @UsePipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }))
  resolve(@Body() body: ResolveCanonicalPlaceDto) {
    return this.canonicalPlacesService.resolve(body)
  }
}
```

### Pattern 2: Discriminated Union for Resolve Results
**What:** 在 `contracts` 里把 resolve 结果做成 discriminated union，而不是一个到处塞 nullable 字段的大对象。建议把 identity、显示语义、候选链路、失败口径拆成不同分支。

**When to use:** 需要同时表达“唯一命中 / 存在歧义 / 严格失败”三种结果，并要求前端做 exhaustiveness handling 时。

**Example:**
```typescript
// Source: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
export type CanonicalResolveResponse =
  | {
      status: 'resolved'
      place: CanonicalPlaceSummary
      click: { lat: number; lng: number }
    }
  | {
      status: 'ambiguous'
      candidates: CanonicalPlaceCandidate[]
      recommendedPlaceId: string | null
      click: { lat: number; lng: number }
    }
  | {
      status: 'failed'
      reason: 'NO_CANONICAL_MATCH' | 'LOW_CONFIDENCE_BORDER' | 'OUTSIDE_SUPPORTED_DATA'
      message: string
      click: { lat: number; lng: number }
    }
```

### Pattern 3: Single Store Projection for All Surfaces
**What:** Pinia setup store 保留一份 canonical 结果源数据，再用 `computed()` 派生 popup、drawer、saved list 和 boundary highlight 的 display model。不要让每个组件各自拼 title、subtitle、type label。

**When to use:** 任何需要同一地点在不同 UI 表面保持同一 identity 和同一语义标签时。

**Example:**
```typescript
// Source: https://pinia.vuejs.org/core-concepts/
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useCanonicalSelectionStore = defineStore('canonical-selection', () => {
  const activePlace = ref<CanonicalPlaceSummary | null>(null)

  const summarySurface = computed(() => {
    if (!activePlace.value) {
      return null
    }

    return {
      title: activePlace.value.displayName,
      typeLabel: activePlace.value.typeLabel,
      subtitle: activePlace.value.parentLabel,
      boundaryId: activePlace.value.boundaryId,
      placeId: activePlace.value.placeId,
    }
  })

  return {
    activePlace,
    summarySurface,
  }
})
```

### Pattern 4: Persist Canonical Ref Separately from Display Copy
**What:** `placeId`、`boundaryId`、`placeKind`、`datasetVersion`、原始点击坐标是 restore contract；`displayName`、`typeLabel`、`parentLabel` 是可更新的展示层。两者都要存，但职责不能混。

**When to use:** 需要支持 reopen、dataset 升级、UI rename 和 future record CRUD，而不把展示名误当主键时。

**Anti-Patterns to Avoid**
- **前端继续本地 authoritative ranking:** 这会让 `apps/web/src/services/geo-lookup.ts` 和 `server` 两边同时演化，ARC-02 直接失效。
- **把 `displayName` 当 identity:** 名称、别名、语言、dataset 更名都会打断 reopen 和高亮恢复。
- **继续创建国家/地区 fallback 草稿:** 已被 D-12 至 D-14 明确否决。
- **每个表面各自写一套类型文案:** popup、drawer、record list 会再次把同一地点叫成不同层级。
- **把中国真实行政称谓塞进 `displayName`:** `displayName` 应是地点主名；类型语义应由单独字段表达，便于 UI 统一渲染。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP 请求校验 | 手写 `if (!body.lat)` 之类的 controller 校验 | Nest `ValidationPipe` + DTO classes | 官方支持 `whitelist`、`forbidNonWhitelisted`、`transform`，比散落的手写分支可靠得多 |
| resolve 结果表达 | 一个塞满 nullable 字段的“大而全对象” | discriminated union response | `resolved / ambiguous / failed` 更容易写 exhaustiveness tests，也更不容易误用 |
| UI 多表面标签生成 | popup、drawer、record item 各自 format | 单一 canonical summary + shared projection helper | 同一地点的主标题、类型标签、副标题必须来自同一个源 |
| place identity 唯一性 | 用展示名、国家名、datasetVersion 现场拼 key | stable `placeId` + canonical ref persistence | 只有 stable identity 才能满足 PLC-02 / PLC-05 和 reopen 场景 |
| 数据库唯一约束 | 仅在 JS 里靠 `Set`/字符串比较防重复 | Prisma `@unique` / `@@unique`（在后续 records 模型正式化时落地） | 官方 schema 约束比内存比较更可靠，也能支持 `findUnique` / `upsert` |

**Key insight:** Phase 12 的复杂度不在“地图点击命中”本身，而在“同一 canonical 身份如何穿过 contracts、server、store、popup、drawer、saved state 和后续 highlight”。凡是让 identity、标签和失败口径分散到多处的实现，后面都会返工。

## Common Pitfalls

### Pitfall 1: 用展示名或数据版本生成 `placeId`
**What goes wrong:** 同一个地点一旦更名、补别名、切语言或升级数据版本，就会被识别成另一条记录。
**Why it happens:** 开发时把“当前 UI 上看到的文本”误当成 canonical 身份。
**How to avoid:** `placeId` 只编码稳定语义，不编码 `datasetVersion`、UI label、排序位次或临时候选下标。
**Warning signs:** reopen 后标题对得上，但 `boundaryId` 或高亮对不上；同一地点出现重复 saved record。

### Pitfall 2: 只保留 coarse `PlaceKind`，把中国真实类型写死在组件里
**What goes wrong:** popup 能显示“直辖市”，drawer 又退回“城市”，record list 只剩名称，UIX-04 失败。
**Why it happens:** 把真实行政称谓当成展示细节，而不是 canonical summary 的一部分。
**How to avoid:** coarse `placeKind` 负责大边界；另加 `adminType` / `typeLabel` / `parentLabel` 负责真实显示语义。
**Warning signs:** 不同组件都在 `if (countryCode === 'CN')`；多处出现同样的标签映射表。

### Pitfall 3: `server` 只返回一个“最像的答案”
**What goes wrong:** 歧义点击被静默定成唯一 canonical，之后 popup、保存和 reopen 都基于错误 identity。
**Why it happens:** 为了省前端状态设计，牺牲了候选确认链路。
**How to avoid:** 保留 `ambiguous` 分支、最多 3 个候选、推荐项字段和失败提示，不让前端自行生成候选。
**Warning signs:** 接口永远返回 200 + 单个 place；前端再次出现本地候选排序代码。

### Pitfall 4: 只切 resolve API，不切本地持久化字段
**What goes wrong:** 当前 session 内看起来正常，刷新或 reopen 后 identity 又退回旧 `cityId` / `boundaryId` 规则。
**Why it happens:** 把 Phase 12 当成纯服务端 phase，忽略了 PLC-03 和 PLC-05 的跨表面要求。
**How to avoid:** 同步升级 [`apps/web/src/types/map-point.ts`](/Users/huangjingping/i/trip-map/apps/web/src/types/map-point.ts) 和 [`apps/web/src/services/point-storage.ts`](/Users/huangjingping/i/trip-map/apps/web/src/services/point-storage.ts) 的 canonical 字段。
**Warning signs:** 新接口返回 `placeId`，但本地 snapshot 里仍只存 `cityId` / `cityName` / `fallbackNotice`。

### Pitfall 5: 把 Phase 13 的正式数据问题提前吞进 Phase 12
**What goes wrong:** 计划被“清洗中国/海外全部 GeoJSON 资产”拖慢，Phase 12 迟迟不能交付语义合同。
**Why it happens:** 把“正式数据交付”与“正式 resolve contract”混成一个问题。
**How to avoid:** 先让 `server` resolve contract 稳定，再把 resolver 背后的数据来源隔离成可替换模块。
**Warning signs:** 计划项大量落在大规模 GeoJSON 清洗、Leaflet 图层、对象存储，而不是 contracts/server/web 语义边界。

## Code Examples

Verified patterns from official sources:

### Global Validation Pipe Baseline
```typescript
// Source: https://docs.nestjs.com/techniques/validation
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }))
  await app.listen(4000)
}
```

### Pinia Setup Store Mapping
```typescript
// Source: https://pinia.vuejs.org/core-concepts/
export const useStore = defineStore('canonical-place', () => {
  const place = ref<CanonicalPlaceSummary | null>(null)
  const subtitle = computed(() => place.value?.parentLabel ?? '')

  function setPlace(next: CanonicalPlaceSummary | null) {
    place.value = next
  }

  return { place, subtitle, setPlace }
})
```

### Prisma Enum + Unique Constraint Pattern
```prisma
// Source: https://docs.prisma.io/docs/orm/prisma-schema/data-model/models
model PlaceRecord {
  id             String    @id @default(cuid())
  placeId        String    @unique
  boundaryId     String
  placeKind      PlaceKind
  datasetVersion String
}

enum PlaceKind {
  CN_CITY
  OVERSEAS_ADMIN1
}
```

### Compound Unique Constraint Pattern
```prisma
// Source: https://docs.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints
model PlaceBoundaryVersion {
  placeId        String
  boundaryId     String
  datasetVersion String

  @@unique([placeId, datasetVersion])
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 前端本地 `geo-lookup` 负责权威命中、候选排序和 fallback | `server` authoritative resolve，前端只消费 response union | Phase 12 design, 2026-03-30 | 满足 ARC-02，减少双端漂移 |
| 统一把地点伪装成“城市” | 中国显示真实行政称谓，海外显示一级行政区 | Phase 12 design, 2026-03-30 | 满足 UIX-04，避免中国侧语义失真 |
| 国家/地区 fallback 继续可保存 | 无法可靠命中时严格失败，不创建伪 canonical 记录 | Phase 12 design, 2026-03-30 | 满足 D-12 至 D-14 |
| 保存/重开主要依赖 `cityId`、`boundaryId` 和展示字段 | 保存/重开依赖完整 canonical ref + 原始点击坐标 | Phase 12 design, 2026-03-30 | 提高 reopen 和 dataset 升级兼容性 |

**Deprecated/outdated:**
- `apps/web/src/services/geo-lookup.ts` 作为正式判定器：Phase 12 之后只能作为临时桥接或测试 fixture 来源，不能继续担任权威 resolver
- “按国家/地区继续记录”按钮文案与数据路径：与严格失败策略冲突，应从 canonical 主链路中移除
- 用 `cityContextLabel` 承载全部层级语义：不足以表达“直辖市 / 特别行政区 / 自治州 / 一级行政区”

## Open Questions

1. **中国真实类型如何编码，才能既保留真实称谓又不把 `PlaceKind` 爆炸成几十个值？**
   - What we know: `PlaceKind` 当前只有 `CN_CITY | OVERSEAS_ADMIN1`；context 明确允许扩展或映射策略由本 phase 决定。
   - What's unclear: 是把 `PlaceKind` 扩成更细枚举，还是保留 coarse kind 并增加 `adminType` / `typeLabel`。
   - Recommendation: 规划优先采用“双层编码”。
   - Recommendation: `placeKind` 保留 coarse 边界，新增 `adminType` 与统一 `typeLabel`/`parentLabel` 供 UI 渲染。

2. **Phase 12 应该在多大程度上依赖当前 web 里的离线数据，直到 Phase 13 正式数据接手？**
   - What we know: Phase 13 才负责官方数据源、版本清单和几何交付；Phase 12 不能等待全部数据资产完成。
   - What's unclear: 现有 `country-regions.geo.json`、`city-candidates`、`city-boundaries` 哪些可以直接迁移到 `server`，哪些只适合作为测试 fixture。
   - Recommendation: 规划中显式拆出“resolver data adapter”任务。
   - Recommendation: Phase 12 只要求接口和语义稳定，不把当前 fixture 误写成 Phase 13 的正式来源。

3. **本地临时持久化要不要立刻升级 snapshot version？**
   - What we know: 当前 `POINT_STORAGE_KEY` 仍是 `trip-map:point-state:v1`，且旧数据迁移不在本 milestone 正式方案中。
   - What's unclear: Phase 12 若只增加 canonical 字段，是否能在兼容 v1 的前提下平滑扩展；或者应该 bump 到 `v2` 并失败关闭旧快照。
   - Recommendation: 优先做兼容性扩展而不是 migration。
   - Recommendation: 仅当现有结构无法容纳 canonical ref 时才 bump version，并把旧快照明确标为 incompatible，而不是偷偷部分升级。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | 全部 workspace build/test 与 `server`/`web` runtime | ✓ | `v22.22.1` | — |
| `pnpm` | workspace scripts、Vitest、Prisma CLI | ✓ | `10.33.0` | `npm` 只能做 registry/version 查询，不适合作为 workspace 主入口 |
| `npm` | registry 版本核实 | ✓ | `10.9.4` | — |
| Prisma CLI | `apps/server` schema validate / e2e setup | ✓ | `6.19.2` | — |
| PostgreSQL CLI (`psql`) | 手工 DB 探测 | ✗ | — | 用 Prisma client + 现有 e2e 代替；Phase 11 已验证真实 PostgreSQL smoke path |
| `apps/server/.env` | DB-backed server e2e | ✓ | 文件存在；shell env 本身未注入 `DATABASE_URL` / `DIRECT_URL` | `health` e2e 不依赖 DB，可先跑无 DB 验证 |

**Missing dependencies with no fallback:**
- None identified for planning. Phase 12 implementation itself不依赖新增外部服务。

**Missing dependencies with fallback:**
- `psql` CLI 缺失；用 Prisma CLI、Nest `app.inject()` e2e 和既有 `.env` 配置足以完成本 phase 的自动化验证。

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `Vitest` (`apps/web` and `packages/contracts`: 3.2.4, `apps/server`: 3.2.4) |
| Config file | [`/Users/huangjingping/i/trip-map/apps/web/vitest.config.ts`](/Users/huangjingping/i/trip-map/apps/web/vitest.config.ts), [`/Users/huangjingping/i/trip-map/apps/server/vitest.config.ts`](/Users/huangjingping/i/trip-map/apps/server/vitest.config.ts), [`/Users/huangjingping/i/trip-map/packages/contracts/vitest.config.ts`](/Users/huangjingping/i/trip-map/packages/contracts/vitest.config.ts) |
| Quick run command | `pnpm --dir apps/server exec vitest run test/canonical-resolve.e2e-spec.ts && pnpm --dir apps/web exec vitest run src/stores/map-points.spec.ts src/components/map-popup/PointSummaryCard.spec.ts` |
| Full suite command | `pnpm test && pnpm typecheck` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ARC-02 | `server` 是唯一 authoritative resolve 来源，前端不再本地定 canonical 结果 | e2e | `pnpm --dir apps/server exec vitest run test/canonical-resolve.e2e-spec.ts` | ❌ Wave 0 |
| PLC-01 | 中国返回市级语义，海外返回一级行政区语义 | e2e + contract | `pnpm --dir apps/server exec vitest run test/canonical-resolve.e2e-spec.ts` | ❌ Wave 0 |
| PLC-02 | `placeId` 稳定，不依赖展示名 | contract + store | `pnpm --dir packages/contracts exec vitest run src/contracts.spec.ts` | ✅ extend |
| PLC-03 | `placeKind`、`boundaryId`、`datasetVersion`、原始点击坐标可持久化并可恢复 | store + storage | `pnpm --dir apps/web exec vitest run src/stores/map-points.spec.ts src/services/point-storage.spec.ts` | ✅ extend |
| PLC-04 | 无法可靠命中时返回明确 failure，不创建错误记录 | e2e + UI | `pnpm --dir apps/server exec vitest run test/canonical-resolve.e2e-spec.ts && pnpm --dir apps/web exec vitest run src/components/WorldMapStage.spec.ts` | `server`: ❌ Wave 0; `web`: ✅ extend |
| PLC-05 | popup、drawer、saved、高亮共享同一 canonical identity | store + component | `pnpm --dir apps/web exec vitest run src/stores/map-points.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/WorldMapStage.spec.ts` | ✅ extend |
| UIX-04 | UI 明确区分中国真实类型与海外一级行政区 | component | `pnpm --dir apps/web exec vitest run src/components/map-popup/PointSummaryCard.spec.ts src/components/PointPreviewDrawer.spec.ts` | ✅ extend |

### Sampling Rate
- **Per task commit:** `pnpm --dir apps/server exec vitest run test/canonical-resolve.e2e-spec.ts` 或对应受影响的 `apps/web` / `packages/contracts` targeted specs
- **Per wave merge:** `pnpm test`
- **Phase gate:** `pnpm test && pnpm typecheck`

### Wave 0 Gaps
- [ ] [`/Users/huangjingping/i/trip-map/apps/server/test/canonical-resolve.e2e-spec.ts`](/Users/huangjingping/i/trip-map/apps/server/test/canonical-resolve.e2e-spec.ts) — covers ARC-02, PLC-01, PLC-04
- [ ] Extend [`/Users/huangjingping/i/trip-map/packages/contracts/src/contracts.spec.ts`](/Users/huangjingping/i/trip-map/packages/contracts/src/contracts.spec.ts) — covers PLC-02 resolve union and new canonical fields
- [ ] Extend [`/Users/huangjingping/i/trip-map/apps/web/src/stores/map-points.spec.ts`](/Users/huangjingping/i/trip-map/apps/web/src/stores/map-points.spec.ts) — covers PLC-03, PLC-05
- [ ] Extend [`/Users/huangjingping/i/trip-map/apps/web/src/services/point-storage.spec.ts`](/Users/huangjingping/i/trip-map/apps/web/src/services/point-storage.spec.ts) — covers PLC-03 reopen persistence
- [ ] Extend [`/Users/huangjingping/i/trip-map/apps/web/src/components/map-popup/PointSummaryCard.spec.ts`](/Users/huangjingping/i/trip-map/apps/web/src/components/map-popup/PointSummaryCard.spec.ts) and [`/Users/huangjingping/i/trip-map/apps/web/src/components/PointPreviewDrawer.spec.ts`](/Users/huangjingping/i/trip-map/apps/web/src/components/PointPreviewDrawer.spec.ts) — covers UIX-04

## Sources

### Primary (HIGH confidence)
- Local phase context: [`/Users/huangjingping/i/trip-map/.planning/phases/12-canonical/12-CONTEXT.md`](/Users/huangjingping/i/trip-map/.planning/phases/12-canonical/12-CONTEXT.md) - locked decisions, scope, deferred items
- Local requirements: [`/Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md`](/Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md) - ARC-02, PLC-01..05, UIX-04
- Local milestone docs: [`/Users/huangjingping/i/trip-map/.planning/ROADMAP.md`](/Users/huangjingping/i/trip-map/.planning/ROADMAP.md), [`/Users/huangjingping/i/trip-map/.planning/PROJECT.md`](/Users/huangjingping/i/trip-map/.planning/PROJECT.md), [`/Users/huangjingping/i/trip-map/.planning/STATE.md`](/Users/huangjingping/i/trip-map/.planning/STATE.md)
- Local code baseline: [`/Users/huangjingping/i/trip-map/packages/contracts/src/place.ts`](/Users/huangjingping/i/trip-map/packages/contracts/src/place.ts), [`/Users/huangjingping/i/trip-map/apps/web/src/services/geo-lookup.ts`](/Users/huangjingping/i/trip-map/apps/web/src/services/geo-lookup.ts), [`/Users/huangjingping/i/trip-map/apps/web/src/types/geo.ts`](/Users/huangjingping/i/trip-map/apps/web/src/types/geo.ts), [`/Users/huangjingping/i/trip-map/apps/web/src/types/map-point.ts`](/Users/huangjingping/i/trip-map/apps/web/src/types/map-point.ts), [`/Users/huangjingping/i/trip-map/apps/server/src/modules/records/records.service.ts`](/Users/huangjingping/i/trip-map/apps/server/src/modules/records/records.service.ts)
- NestJS Validation docs - https://docs.nestjs.com/techniques/validation
- Pinia Core Concepts - https://pinia.vuejs.org/core-concepts/
- Prisma Models docs - https://docs.prisma.io/docs/orm/prisma-schema/data-model/models
- Prisma compound IDs / unique constraints - https://docs.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints
- TypeScript narrowing / discriminated unions - https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- Vitest config reference - https://vitest.dev/config/

### Secondary (MEDIUM confidence)
- npm registry version verification via `npm view` on 2026-03-30 for `vue`, `pinia`, `@nestjs/common`, `@prisma/client`, `class-validator`, `vitest`

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - 现有 repo 依赖、官方文档和 npm registry 版本都已核实
- Architecture: MEDIUM - 契约/权威边界明确，但中国 subtype 编码和临时数据 adapter 仍有设计裁量
- Pitfalls: MEDIUM - 主要来自本仓库现状与 phase 决策推演，不是全部都有外部官方来源

**Research date:** 2026-03-30
**Valid until:** 2026-04-06
