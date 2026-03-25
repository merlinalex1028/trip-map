# Phase 08: 城市边界高亮语义 - Research

**Researched:** 2026-03-25
**Domain:** 离线城市边界数据、边界身份持久化、SVG 面域高亮、状态稳定切换
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### 边界主表达
- **D-01:** 城市边界将替代单点 marker 成为地图上的主表达，默认采用“半透明面填充 + 明确描边”的组合，而不是只依赖单点发光或纯 marker。
- **D-02:** 小 marker 仍可保留，但只作为当前选中城市的辅助定位元素，不再承担“这座城市是否被点亮”的主语义。
- **D-03:** 不采用“只显示边界、不显示任何 marker”的极简方案，也不采用“边界和 marker 同等强调”的双主语义方案，避免地图层次混乱。

### 已保存、当前选中与回退层级
- **D-04:** 已保存城市默认常驻弱高亮边界，表达“这座城市已记录过”，但视觉强度必须明显弱于当前选中城市。
- **D-05:** 当前选中城市在已保存常驻层之上进一步强化为更亮的填充、更清晰的描边，并可叠加辅助 marker，形成明确的当前焦点。
- **D-06:** 未保存草稿只有在用户已经确认到具体城市后，才显示城市边界；尚未确认前不提前点亮城市面域。
- **D-07:** 当用户回退到国家或地区继续记录时，不显示城市边界，避免把“未可靠确认城市”的结果伪装成已确认城市。

### 状态切换与归位规则
- **D-08:** 不做 hover 触发的临时城市边界预览；城市边界只跟随“已保存常驻层”和“当前选中层”两套正式状态。
- **D-09:** 切换城市时，旧选中边界必须立即退回已保存态或直接消失，不允许遗留错误面域；可以使用非常轻的淡出过渡，但过渡不能改变最终状态归属。
- **D-10:** 关闭面板后，不保留一层额外的“最后一次强高亮”；边界状态应回到 store 中真实存在的已保存/选中状态，而不是留下 UI 记忆态。
- **D-11:** “状态稳定”优先于炫技动效，任何过渡都不能引入残影、串态或错误归位。

### 边界身份与持久化恢复
- **D-12:** v2 城市记录在已存在的稳定 `cityId` 之上，还需要额外持久化 `boundaryId`，必要时再附带边界数据集版本字段，用于恢复同一城市对应的同一片边界语义。
- **D-13:** 重开应用或重新选中已保存城市时，恢复逻辑优先按 `boundaryId` 找对应边界；如果该边界不存在，再回退到 `cityId` 对应的当前边界数据。
- **D-14:** `cityId` 继续作为跨阶段共享的城市身份主键；`boundaryId` 是边界表达与恢复锚点，不替代城市身份本身。
- **D-15:** v1 旧点位由于没有 `cityId` / `boundaryId`，默认不参与城市边界高亮，必须继续保持可读、可编辑，但不能被错误解释成某个城市边界记录。

### 多面域城市边界
- **D-16:** 同一 `boundaryId` 下的所有面域需要整体一起高亮，包括岛屿、飞地或分离的多面域，不只点亮主城区或点击最近的一块。
- **D-17:** 多面域整体点亮的优先级高于“只亮一块更省事”的实现方式，因为本阶段的核心语义是“真实城市边界整体高亮”。

### the agent's Discretion
- 常驻弱高亮、当前选中强化态与辅助 marker 的具体颜色、透明度、阴影和动画参数
- 边界淡入淡出的精确时长与 easing，只要不制造状态歧义
- 多面域数据的简化、缓存与渲染优化策略，只要不破坏“同一 `boundaryId` 整体高亮”的语义
- `boundaryId` 与边界版本字段的具体命名方式、存储结构和兼容策略
- 当 `boundaryId` 缺失或数据集升级导致边界找不到时的轻提示文案

### Deferred Ideas (OUT OF SCOPE)
- 候选项 hover 时直接预览边界或地图内联预览候选城市边界 — 更适合后续 popup 主舞台或更强交互阶段
- 把关闭面板后的最后一次选中高亮做成持久记忆态 — 超出本阶段“状态稳定”主目标，且容易引入串态
- 在线边界数据服务、按缩放层级动态加载边界、多级行政区边界切换 — 超出当前离线静态架构与 milestone 范围
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BND-01 | 用户选中城市后，地图会以真实城市边界范围高亮该城市，而不是仅显示单个点状 marker 作为主表达 | 需要新增本地边界数据资产、`boundaryId` 映射、`CityBoundaryLayer` 渲染层，并将 marker 降级为辅助定位 |
| BND-02 | 用户在 popup、详情面板和保存结果中看到的城市身份，与地图上被高亮的城市边界保持一致 | 需要把边界身份绑定到 `cityId -> boundaryId`，并由 store 统一驱动 drawer / popup / 保存恢复语义 |
| BND-03 | 用户在 hover、选中、关闭 popup、切换城市或返回已有点位时，城市边界高亮状态切换稳定且不会残留错误面域 | 需要用 store 派生 selected/saved boundary state，禁止 hover 记忆态，关闭/切换时回到真实状态 |
| DAT-06 | 用户保存 v2.0 点位后，系统会持久化稳定的城市身份引用，使同一城市在后续重开时能够恢复一致的高亮与详情语义 | 需要在 `PersistedMapPoint` 与 `point-storage` 中增加 `boundaryId` 与可选数据集版本字段，并为找不到边界提供降级恢复 |
</phase_requirements>

## Summary

仓库当前已经在 Phase 7 建立了稳定 `cityId`、候选确认流、旧点位兼容以及“点击/搜索统一复用”的基线，但地图层仍然只有 pending marker 和 `SeedMarkerLayer`，没有任何城市面域数据、边界状态选择器或边界持久化字段。Phase 8 的本质不是给现有 marker 加一层视觉特效，而是补齐一条新的主链路：`cityId -> boundaryId -> geometry -> selected/saved highlight -> localStorage restore`。

最稳的方案是不引入新的地图引擎，也不把边界逻辑塞回组件局部状态，而是继续沿用当前 `WorldMapStage -> map-points -> point-storage` 架构。新增一个专门的 `CityBoundaryLayer`，使用本地静态边界数据渲染 SVG 面域；`map-points` 负责产出“当前强高亮边界”和“已保存弱高亮边界”两套派生状态；`point-storage` 负责把 `boundaryId` 与可选 `boundaryDatasetVersion` 持久化。`pendingCitySelection`、国家/地区 fallback、v1 旧点位都不应点亮城市边界。

真正需要谨慎规划的风险有两个：一是城市边界数据源与现有 `cityCandidates` 的身份映射，二是边界几何与当前 `world-map.svg` 固定投影是否足够对齐。前者决定 `DAT-06` 是否稳定，后者决定 `BND-01` 是否可信。因此计划应把“边界数据契约 + 存储升级”与“边界渲染 + 状态切换回归”拆开验收。

**Primary recommendation:** 先做“边界身份与数据层”再做“边界图层与状态回归”，保持两份 plan：`08-01` 处理 `boundaryId` / 数据资产 / 存储兼容，`08-02` 处理 `CityBoundaryLayer` / store 派生状态 / 交互回归。

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 | repo `^3.5.21`；npm current `3.5.31` | 承载新增 `CityBoundaryLayer` 与 `WorldMapStage` 组合渲染 | 当前仓库全部使用 Vue 3 SFC，不需要引入新框架 |
| Pinia | repo `^3.0.3`；npm current `3.0.4` | 统一管理 selected/saved boundary 派生状态 | `map-points` 已是城市身份、草稿和恢复逻辑的单一状态源 |
| SVG overlay + 现有 `map-projection.ts` | repo code | 在固定世界地图舞台上绘制城市边界 fill/stroke | 直接复用当前 viewBox、margin 和经纬度映射，避免引入第二套投影真相 |
| GeoJSON `Polygon` / `MultiPolygon` | RFC 7946 | 表达真实城市边界、多面域与孔洞 | 标准语义明确，天然支持“同一 `boundaryId` 整体高亮” |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `topojson-client` | repo `^3.1.0`；npm current `3.1.0` | 如边界资产以 TopoJSON 预压缩存储，则在运行时解码为 GeoJSON | 边界数据体积较大，需要减少 repo 体积和重复坐标时使用 |
| `d3-geo` | repo `^3.1.1`；npm current `3.1.1` | 保留现有国家命中逻辑；如后续用 `geoPath` 生成 `d` 字符串也可复用 | 需要官方 path generator，而不是手写 SVG path 时使用 |
| 浏览器 `localStorage` | built-in | 持久化 `boundaryId` / `boundaryDatasetVersion` | `DAT-06` 恢复语义沿用现有本地快照机制 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 按支持城市裁剪后的本地边界子集 | 直接引入全球 ADM2 级边界文件 | geoBoundaries 官方全局 ADM2 GeoJSON 约 `~500MB`，对离线 SPA 明显过重 |
| 继续使用现有固定 SVG 舞台和投影配置 | MapLibre / Leaflet / 新地图引擎 | 与 milestone 明确 out-of-scope 冲突，且会把 Phase 8 变成架构重做 |
| 由 `map-points` 派生 selected/saved boundary 状态 | 在 `WorldMapStage` / `SeedMarkerLayer` / drawer 各自记忆边界状态 | 关闭面板、切换点位时极易残留错误面域，直接违背 `D-09` / `D-10` |

**Installation:**
```bash
# Phase 8 可继续使用现有依赖；核心工作是新增数据资产和新组件
pnpm test && pnpm build
```

**Version verification:** 2026-03-25 已用 `npm view` 核实当前 registry 元数据。

| Package | Repo Range | Current Registry Version | Published |
|---------|------------|--------------------------|-----------|
| `vue` | `^3.5.21` | `3.5.31` | 2026-03-25 |
| `pinia` | `^3.0.3` | `3.0.4` | 2025-11-05 |
| `vitest` | `^3.2.4` | `4.1.1` | 2026-03-23 |
| `d3-geo` | `^3.1.1` | `3.1.1` | 2024-03-12 |
| `topojson-client` | `^3.1.0` | `3.1.0` | 2019-11-06 |
| `@turf/boolean-point-in-polygon` | `^7.3.4` | `7.3.4` | 2026-02-08 |

**Planning guidance:** 当前有更新可用，但 Phase 8 本身不需要为了边界高亮而升级 Vue / Pinia / Vitest；版本升级应视为独立工作，不要混入本阶段。

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── components/
│   ├── CityBoundaryLayer.vue      # 城市边界 fill/stroke 渲染
│   ├── SeedMarkerLayer.vue        # 保留为辅助 marker 层
│   └── WorldMapStage.vue          # 组合 boundary + marker + pending overlay
├── data/geo/
│   ├── city-boundaries.topo.json  # 或 geojson，按 boundaryId 收录裁剪后的城市边界
│   └── city-boundary-index.ts     # cityId -> boundaryId / datasetVersion / 名称映射
├── services/
│   ├── city-boundaries.ts         # 懒加载、解码、缓存、fallback 解析
│   ├── map-projection.ts          # 继续作为唯一投影真相
│   └── point-storage.ts           # 增加 boundary 持久化兼容
├── stores/
│   └── map-points.ts              # 派生 selected/saved boundary state
└── types/
    ├── geo.ts                     # 边界 geometry / reference 类型
    └── map-point.ts               # PersistedMapPoint 边界字段
```

### Pattern 1: Boundary Identity Is A Persisted Reference, Not A Derived Display Guess
**What:** `cityId` 继续承担“这是哪座城市”的业务身份；`boundaryId` 只负责“这座城市对应哪片边界几何”。保存时必须写入 `boundaryId`，恢复时优先按 `boundaryId` 找几何，找不到再回退到 `cityId` 当前映射。  
**When to use:** 任何 v2 城市记录被创建、保存、恢复、复用时。  
**Example:**
```ts
interface BoundaryReference {
  cityId: string | null
  boundaryId: string | null
  boundaryDatasetVersion: string | null
}
```

### Pattern 2: The Store Emits Highlight Semantics; The Map Only Renders Them
**What:** `map-points` 应派生出 `selectedBoundaryId`、`savedBoundaryIds`、`showBoundaryMarker` 之类的纯状态结果；`WorldMapStage` 和 `CityBoundaryLayer` 只消费这些状态，不自己记忆“上一次高亮的边界”。  
**When to use:** 关闭 drawer、切换城市、复用已有点位、从 saved 点返回时。  
**Example:**
```ts
const selectedBoundaryId = computed(() => activePoint.value?.boundaryId ?? null)

const savedBoundaryIds = computed(() => {
  return new Set(
    userPoints.value
      .map((point) => point.boundaryId)
      .filter((boundaryId): boundaryId is string => Boolean(boundaryId))
  )
})
```

### Pattern 3: MultiPolygon-First Registry
**What:** 边界服务对外暴露的单位必须是“一个 `boundaryId` 对应的一组 polygon / hole”，而不是“一个 `boundaryId` 只取第一块面域”。  
**When to use:** 岛屿城市、飞地、港澳台、特殊行政边界或任何由多个 polygon 组成的城市。  
**Example:**
```ts
interface CityBoundaryGeometry {
  boundaryId: string
  features: Array<{
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }>
}
```

### Pattern 4: Boundary Assets Should Be Curated To Supported Cities
**What:** Phase 8 只需要覆盖当前离线城市目录可达的城市，不需要把全球所有 municipal boundaries 一次性塞进前端。  
**When to use:** 生成 `city-boundaries` 数据文件时。  
**Example:**
```ts
// 以 cityCandidates 中已有 stable cityId 为白名单，离线预裁剪边界数据
const supportedBoundaryIds = new Set(cityCandidates.map((candidate) => candidate.id))
```

### Anti-Patterns to Avoid
- **把 `boundaryId` 运行时临时拼成 `countryCode + cityName`：** 同名城市、别名和数据集升级后都容易漂移。
- **在 `candidate-select` 或 fallback 国家态提前点亮边界：** 与 `D-06` / `D-07` 直接冲突。
- **让组件自己保存“最后一次强高亮”的 boundary：** 关闭面板或切换点位时必然产生串态。
- **只渲染 `MultiPolygon` 的第一块面域：** 多岛城市会被错误裁断。
- **把原始全球 ADM2 文件直接打进前端：** 体积和渲染都不受控。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 边界几何格式 | 自定义 JSON 语义或随意嵌套数组 | RFC 7946 `Polygon` / `MultiPolygon`，必要时 TopoJSON 预压缩 | 标准格式天然支持孔洞和多面域，工具链成熟 |
| Topology 解码 | 自己写 TopoJSON arc 解码器 | `topojson-client.feature(...)` | 官方客户端已处理 topology -> GeoJSON 转换 |
| 边界身份恢复 | 用 `cityName` 文本、contextLabel 或经纬度近似猜边界 | 持久化 `boundaryId`，缺失时再回退 `cityId` 映射 | 恢复语义稳定，兼容数据集升级 |
| 状态切换 | 组件局部 hover/selected memory state | store 派生的 selected/saved boundary 集合 | 更容易验证“不残留错误面域” |
| 数据获取 | 在线 boundary API 或地图瓦片服务 | repo 内静态边界资产 | 保持 milestone 的离线本地架构 |

**Key insight:** Phase 8 最复杂的部分不是“把 polygon 画出来”，而是保证边界 identity、恢复语义和状态切换都只认一套真相。

## Common Pitfalls

### Pitfall 1: Background Map And Boundary Geometry Use Two Different Projection Truths
**What goes wrong:** 边界路径能画出来，但和 `world-map.svg` 明显错位，尤其在高纬度和海岛国家更明显。  
**Why it happens:** 另起一套 D3 projection 参数，没有严格对齐 `src/services/map-projection.ts` 里的 `plotLeft / plotTop / plotWidth / plotHeight`。  
**How to avoid:** 把 `map-projection.ts` 继续视为地图舞台唯一投影真相；如果用 D3 `geoPath`，也必须显式对齐同一视口参数。  
**Warning signs:** 京都大致能对上，但东京、格陵兰、印尼等地区偏移明显。

### Pitfall 2: Saved Points Persist `cityId` But Not `boundaryId`
**What goes wrong:** 当前版本能高亮，换一版边界数据或重开应用后恢复到另一块边界，或根本找不到边界。  
**Why it happens:** 只把 `cityId` 当作恢复锚点，没有额外的边界引用。  
**How to avoid:** 在 `PersistedMapPoint`、`point-storage`、store normalize 路径里一起加入 `boundaryId` 和可选数据集版本字段。  
**Warning signs:** 计划里提了边界高亮，却没有修改 `src/types/map-point.ts` 和 `src/services/point-storage.ts`。

### Pitfall 3: Boundary State Lives In Multiple Components
**What goes wrong:** 关闭面板、切换点位或从 saved 点返回时，地图上残留上一座城市的强高亮。  
**Why it happens:** `WorldMapStage`、drawer、marker layer 各自维护 selected/hover memory state。  
**How to avoid:** 让 `map-points` 派生唯一的 boundary highlight contract，组件只 render。  
**Warning signs:** 计划里出现“在组件内缓存 lastSelectedBoundaryId”之类状态。

### Pitfall 4: MultiPolygon City Gets Truncated To The First Surface
**What goes wrong:** 岛屿、飞地或不连续城市边界只高亮一块，看起来像半座城市。  
**Why it happens:** 实现假设每个边界都是单一 `Polygon`。  
**How to avoid:** 数据模型和渲染循环从一开始就按 `Polygon | MultiPolygon` 设计，并用测试覆盖多个面域一起点亮。  
**Warning signs:** spec 里没有 `MultiPolygon` 样本，或者渲染器代码只访问 `coordinates[0]`。

### Pitfall 5: Boundary Dataset Scope Is Too Big For The Current App Shell
**What goes wrong:** 首屏变重、切换卡顿、测试变慢，甚至影响 Phase 9/10 的 popup 与视觉收口。  
**Why it happens:** 直接纳入全球 municipal boundary 数据，而不是围绕支持城市目录做裁剪。  
**How to avoid:** 先从 `cityCandidates` 白名单出发，只引入会被当前产品实际命中的城市边界。  
**Warning signs:** 新增数据文件达到几十到几百 MB，或 render 层为“所有城市”同时建立 path。

## Code Examples

Verified planning patterns:

### Decode TopoJSON Once, Then Cache By `boundaryId`
```ts
// Source: https://github.com/topojson/topojson-client
import { feature } from 'topojson-client'

const geoJson = feature(topology, topology.objects.boundaries)
```

### Render GeoJSON / MultiPolygon As SVG Path Data
```ts
// Source: https://d3js.org/d3-geo/path
import { geoPath } from 'd3-geo'

const path = geoPath(projection)
const d = path(featureObject)
```

### Keep Highlight Semantics In The Store
```ts
const selectedBoundaryId = computed(() => activePoint.value?.boundaryId ?? null)

const savedBoundaryIds = computed(() => {
  return new Set(
    userPoints.value
      .map((point) => point.boundaryId)
      .filter((boundaryId): boundaryId is string => Boolean(boundaryId))
  )
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 城市只用 marker 代表 | 城市 identity 对应真实 boundary polygon，高亮成为主表达 | v2.0 / Phase 8 | 地图本身可表达“去过哪座城市”而不是只表达坐标 |
| 保存后只靠 `cityName` / `cityId` 推断边界 | 保存 `cityId + boundaryId (+ datasetVersion)` | 2024-2026 离线地图实践更强调 stable references | 数据集变化后仍能最大化恢复相同语义 |
| hover / component memory 驱动高亮 | store 派生状态驱动高亮 | 当前 UI 状态机复杂度上升后成为必要 | 关闭、切换、复用时更容易保证无残留 |
| 全量全球 admin 数据一次进前端 | 围绕实际支持城市裁剪静态子集 | 近年离线前端地图更强调 bundle 控制 | 更适合当前无瓦片、无缩放的 SPA 架构 |

**Deprecated/outdated:**
- 用 `cityName` 文本或点击经纬度“就近猜”边界。
- 在 hover 或关闭面板后保留额外的记忆高亮层。
- 把城市边界渲染与 marker 语义完全等权处理。

## Open Questions

1. **边界数据源最终选哪一个**
   - What we know: geoBoundaries 提供 API、GeoJSON 和 TopoJSON 下载链接，并且 boundary layer 有稳定 `boundaryID`；Who’s On First 提供稳定 locality / localadmin 标识和文本 GeoJSON 分发。
   - What's unclear: 当前支持城市列表与哪个数据源的“城市边界”映射最稳，尤其是 locality 与 localadmin 在各国并不完全等价。
   - Recommendation: planner 把“数据源验证与抽样映射”列为 `08-01` 的首个 task，至少抽样 `JP / FR / US / HK / ID` 这类单面域、多面域和区域型城市。

2. **当前 `world-map.svg` 与线性投影是否足够对齐**
   - What we know: 现有点击命中与 marker 都依赖 `src/services/map-projection.ts` 的线性投影。
   - What's unclear: 对于真实边界轮廓，这套近似映射是否会在视觉上出现不可接受的错位。
   - Recommendation: `08-02` 开头先做 3-5 个城市的对齐 spike；如果视觉偏移可接受，继续复用当前投影；如果偏移明显，再局部引入明确的 D3 projection，但仍要保持同一配置源。

3. **`boundaryId` 是否直接使用数据源原生 ID**
   - What we know: Who’s On First 和 geoBoundaries 都提供稳定 ID 体系。
   - What's unclear: 产品是否需要保留源数据 ID，还是转成 repo 自有 slug。
   - Recommendation: 优先保存 source-native stable ID，再单独维护 `cityId -> boundaryId` 映射；不要新造第二套可漂移主键。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | 测试、构建、可能的数据预处理脚本 | ✓ | `v22.22.1` | — |
| pnpm | 运行测试与构建 | ✓ | `10.33.0` | `npm` 可运行部分命令，但不建议偏离 repo 包管理器 |
| Python 3 | 若需要一次性辅助数据清洗 | ✓ | `3.13.12` | 可完全不用，改为 Node 脚本 |
| `ogr2ogr` | 若计划直接处理 shapefile / geopackage | ✗ | — | 不要把 Phase 8 依赖建立在本机 GIS CLI 上 |
| `mapshaper` | 若计划本机做几何简化 | ✗ | — | 预先提交已简化数据，或用 Node/TopoJSON 路径代替 |

**Missing dependencies with no fallback:**
- None，前提是 phase plan 不依赖本机 GIS CLI 处理原始 shapefile。

**Missing dependencies with fallback:**
- `ogr2ogr` / `mapshaper` 缺失：改为提交预裁剪后的 GeoJSON / TopoJSON 资产，或使用 repo 内脚本只消费已准备好的边界文件。

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest `^3.2.4` + Vue Test Utils `^2.4.6` + happy-dom |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test && pnpm build` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BND-01 | 选中城市后显示真实边界主表达，marker 降级为辅助 | component + store | `pnpm vitest run src/components/WorldMapStage.spec.ts src/components/CityBoundaryLayer.spec.ts` | `WorldMapStage.spec.ts` ✅ / `CityBoundaryLayer.spec.ts` ❌ Wave 0 |
| BND-02 | drawer / 保存结果 / 恢复后的城市身份与边界一致 | store + storage + component | `pnpm vitest run src/stores/map-points.spec.ts src/services/point-storage.spec.ts src/components/PointPreviewDrawer.spec.ts` | ✅ |
| BND-03 | 切换、关闭、返回已有点位时边界状态稳定，无残留 | component integration | `pnpm vitest run src/components/WorldMapStage.spec.ts src/stores/map-points.spec.ts src/components/CityBoundaryLayer.spec.ts` | 部分存在，新增 spec 缺失 |
| DAT-06 | 保存后持久化稳定边界引用，重开后能恢复 | storage + store | `pnpm vitest run src/services/point-storage.spec.ts src/stores/map-points.spec.ts` | ✅ |

### Sampling Rate
- **Per task commit:** `pnpm vitest run src/stores/map-points.spec.ts src/services/point-storage.spec.ts src/components/WorldMapStage.spec.ts src/components/PointPreviewDrawer.spec.ts`
- **Per wave merge:** `pnpm test`
- **Phase gate:** `pnpm test && pnpm build`

### Wave 0 Gaps
- [ ] `src/components/CityBoundaryLayer.spec.ts` — 覆盖 `Polygon` / `MultiPolygon`、selected vs saved 层级、无 boundary 时不渲染
- [ ] `src/services/city-boundaries.spec.ts` — 覆盖 `boundaryId` 查找、`cityId` fallback、缺失 geometry 降级
- [ ] 扩展 `src/services/point-storage.spec.ts` — 覆盖 `boundaryId` / `boundaryDatasetVersion` 的兼容读取与回写
- [ ] 扩展 `src/stores/map-points.spec.ts` — 覆盖关闭面板、切换点位、v1 旧点位不参与高亮
- [ ] 扩展 `src/components/WorldMapStage.spec.ts` — 覆盖 `candidate-select`、fallback 国家态不点亮边界

## Sources

### Primary (HIGH confidence)
- Repo inspection:
  - `/Users/huangjingping/i/trip-map/src/stores/map-points.ts`
  - `/Users/huangjingping/i/trip-map/src/services/point-storage.ts`
  - `/Users/huangjingping/i/trip-map/src/components/WorldMapStage.vue`
  - `/Users/huangjingping/i/trip-map/src/components/PointPreviewDrawer.vue`
  - `/Users/huangjingping/i/trip-map/src/services/geo-lookup.ts`
  - `/Users/huangjingping/i/trip-map/vitest.config.ts`
- RFC 7946 - GeoJSON `Polygon` / `MultiPolygon` 语义: https://www.rfc-editor.org/rfc/rfc7946
- D3 `geoPath` docs: https://d3js.org/d3-geo/path
- D3 projection `fitExtent` / `fitSize` docs: https://d3js.org/d3-geo/projection
- TopoJSON Client README / API: https://github.com/topojson/topojson-client
- npm registry verification via `npm view` on 2026-03-25:
  - `npm view vue version time --json`
  - `npm view pinia version time --json`
  - `npm view vitest version time --json`
  - `npm view d3-geo version time --json`
  - `npm view topojson-client version time --json`
  - `npm view @turf/boolean-point-in-polygon version time --json`

### Secondary (MEDIUM confidence)
- geoBoundaries simplified downloads: https://www.geoboundaries.org/simplifiedDownloads.html
- geoBoundaries API and `boundaryID` metadata: https://www.geoboundaries.org/api.html
- geoBoundaries global ADM2 size reference: https://www.geoboundaries.org/globalDownloads.html
- Who’s On First docs overview: https://whosonfirst.org/docs/
- Who’s On First placetypes (`locality`, `localadmin`): https://whosonfirst.org/docs/placetypes/
- Who’s On First shapefile distribution: https://whosonfirst.org/docs/shapefiles/

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - 主要依赖现有 Vue / Pinia / SVG 舞台，外部标准格式和官方文档清晰。
- Architecture: MEDIUM - 数据源映射与底图对齐仍需一个执行期 spike 验证。
- Pitfalls: HIGH - 多数风险直接来自仓库现状与已锁定的 phase 约束。

**Research date:** 2026-03-25
**Valid until:** 2026-04-08

## RESEARCH COMPLETE

**Phase:** 08 - 城市边界高亮语义
**Confidence:** MEDIUM

### Key Findings
- 当前仓库已有稳定 `cityId` 和候选确认流，但完全缺少 `boundaryId`、城市边界资产和边界渲染层。
- Phase 8 不应引入新地图引擎；最佳路径是在现有 `WorldMapStage` 上新增 `CityBoundaryLayer`，并继续把 `map-projection.ts` 作为唯一投影真相。
- `boundaryId` 和可选 `boundaryDatasetVersion` 必须进入 `PersistedMapPoint` 与 `point-storage`，否则 `DAT-06` 无法稳定满足。
- 状态稳定性的关键是 store 派生 selected/saved boundary state，而不是 hover 或组件局部记忆态。
- 边界数据必须按当前支持城市目录裁剪；不要把全球 ADM2 文件直接塞进前端。

### File Created
`.planning/phases/08-城市边界高亮语义/08-RESEARCH.md`

### Confidence Assessment
| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | 复用现有前端栈即可完成，官方格式与工具链明确 |
| Architecture | MEDIUM | 仍需验证边界数据源映射和底图投影对齐 |
| Pitfalls | HIGH | 风险已从当前代码结构和 phase 约束中直接暴露 |

### Open Questions
- 边界数据源最终采用 geoBoundaries 还是 Who’s On First 的哪一层级。
- `world-map.svg` 与真实 boundary 几何的视觉对齐是否足够，不需要额外 projection 校正。
- `boundaryId` 是否直接保留 source-native ID，还是在 repo 内做包装映射。

### Ready for Planning
Research complete. Planner can now create PLAN.md files.
