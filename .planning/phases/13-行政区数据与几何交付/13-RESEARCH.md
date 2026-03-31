# Phase 13: 行政区数据与几何交付 - Research

**Researched:** 2026-03-31
**Domain:** 中国/海外行政区 GeoJSON 数据源治理、版本化静态几何资产交付、坐标规范化
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### 几何资源入口与服务端职责
- **D-01:** `server` 继续承担 canonical 权威引用边界，但 Phase 13 的几何交付采用“`server` 返回边界引用 / asset key / datasetVersion，前端再按引用获取版本化静态几何资产”的模式。
- **D-02:** Phase 13 不采用“前端完全自行猜测本地几何路径、`server` 完全不管几何入口”的方案，也不采用“`server` 直接内联返回完整 GeoJSON”的重型返回方式。
- **D-03:** `API-03` 的实现方向应围绕“地点摘要 + 边界引用 + 几何资源入口”展开，让前端可以按需加载与缓存，而不是把整套 GeoJSON 预先塞进前端 bundle 或数据库。

### 静态几何资产切分
- **D-04:** 几何静态资产采用分片交付，而不是中国/海外各自一个超大整包，也不是一条 `boundaryId` 对应一个独立文件。
- **D-05:** 中国侧优先按省级或同等可维护区域分片，单个分片内包含该区域下属市级几何；海外侧优先按国家分片，单个分片内包含该国家下的 `admin-1` 几何。
- **D-06:** 每个分片都要挂在统一 manifest / index 之下，保证前端能先解析引用，再定位需要加载的静态资产分片。

### Canonical 边界身份与可渲染几何映射
- **D-07:** 保留“canonical `boundaryId` -> geometry asset id / renderable geometry id”的显式映射层，不强行要求两者在 Phase 13 完全同名同值。
- **D-08:** canonical `boundaryId` 继续作为跨端共享身份锚点；几何资产内部的 renderable id 可以独立演进，但必须能被 manifest 稳定映射、追踪和回放。
- **D-09:** 当前 `apps/web/src/services/city-boundaries.ts` 里的手工映射表属于过渡实现；Phase 13 应把这层映射升级为随数据版本管理的正式 manifest 资产，而不是继续散落在前端代码里长期维护。

### 坐标标准与验证规则
- **D-10:** Phase 13 采用“统一收口到单一对外坐标标准 + 固定转换规则 + 自动化代表性验点”的策略，而不是只写文档做人工验收，也不是一次性扩成大规模 GIS 校验体系。
- **D-11:** 自动化验证至少要覆盖中国与海外的代表性样例，明确锁定中国与海外边界在后续 `Leaflet` 渲染中不会出现明显错位、popup anchor 偏移或点击语义漂移。
- **D-12:** 北京、香港、California 这类跨中国直辖市 / 特别行政区 / 海外一级行政区的样例，应作为优先代表性验点进入构建或测试校验基线。

### Claude's Discretion
- manifest 的精确字段命名、`asset key` 结构、目录组织方式，以及分片文件名规范，只要满足“版本化、可追踪、可映射”原则。
- 中国分片与海外分片的具体边界切分策略，只要整体符合“中国按省级或同等维护单元、海外按国家”的主方向。
- 几何资产最终对外统一采用哪一种标准坐标表达，以及内部是否需要中间转换步骤，只要对 `web` / `Leaflet` 的消费侧保持单一稳定规则。
- 自动化验点采用单元测试、集成测试还是构建检查脚本，只要能稳定证明代表性中国/海外样例不会发生坐标错位。

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GEOX-03 | 中国行政区边界数据使用阿里云 `DataV.GeoAtlas` 的合规市级 GeoJSON 作为正式来源 | 研究确认 `DataV` 官方数据格式为 GeoJSON，坐标系为 `GCJ-02`；建议将中国源数据作为独立 source snapshot 管理，并在构建时统一转换到消费坐标标准。 |
| GEOX-04 | 海外行政区边界数据使用去除中国区域后的 `Natural Earth admin-1` GeoJSON 作为正式来源 | 研究确认 `Natural Earth admin-1` 官方下载页当前稳定版本为 `5.1.1`，并建议固定 tag/commit 或 vendored snapshot，过滤 `adm0_a3 = CHN` 后再分片。 |
| GEOX-05 | 系统不在底层预合并中国与海外 GeoJSON，而是在前端 `Leaflet` 中直接加载两个独立图层 | 研究建议建立单一 manifest，但保留 `CN` / `OVERSEAS` layer 标识和分片路径，前端按图层分别请求，不输出合并总包。 |
| GEOX-06 | 系统会对中国与海外数据建立统一的字段、ID 与版本清单，但保持两套来源与图层边界可追踪 | 研究建议使用“source catalog + geometry manifest + shard asset”三层模型，并把 `canonical boundaryId -> renderableId -> assetKey` 显式记录为版本化资产。 |
| GEOX-07 | 系统会验证并固定中国与海外数据在 `Leaflet` 渲染中的坐标适配规则，避免中国边界与点击位置发生错位 | 研究确认 `DataV` 为 `GCJ-02`、`Natural Earth`/Leaflet 消费侧应以 `WGS84/CRS84` 统一，建议构建期转换中国几何并用北京/香港/California 建立自动化验点。 |
| API-03 | 系统会提供地点摘要、边界引用或几何资源入口，使前端可以按需加载并缓存行政区边界 | 研究建议 `server` 响应扩展 `geometryRef`，仅返回 `boundaryId`、`geometryDatasetVersion`、`assetKey`、`layer`、`renderableId` 等引用，不内联完整 GeoJSON。 |
</phase_requirements>

## Summary

Phase 13 的核心不是“换一批 GeoJSON 文件”这么简单，而是把几何数据交付正式化：上游需要有可追踪的 source catalog，中间需要有稳定的 canonical `boundaryId -> renderableId -> assetKey` manifest，下游需要有对 `Leaflet` 友好的分片静态资产和单一坐标规则。当前仓库已经具备 Phase 12 的 canonical 契约和一个过渡态的本地 `city-boundaries.geo.json` + 手工映射表，但这套实现只有 45 个 feature、约 47 KB，只适合 demo，不适合中国市级 + 全球 admin-1 的正式数据面。

外部数据研究给出了一个明确结论：中国与海外源数据的最大风险点不是格式，而是坐标和版本治理。阿里云 `DataV` 官方文档明确其地图部件使用 `GCJ-02`，并通过 `DataV.GeoAtlas` 获取 GeoJSON；`Natural Earth admin-1` 官方下载页当前稳定版本是 `5.1.1`，并且官方自己承认这是最难保持最新的 dataset，部分国家还存在 region/admin-1 粒度混合问题。对后续 `Leaflet` 而言，最稳妥的做法是让消费侧只看到一套 WGS84/CRS84 风格的 GeoJSON，所有中国几何在构建阶段完成 `GCJ-02 -> WGS84` 归一化，海外几何保留原始经纬度，仅做过滤与分片。

从仓库现状看，前端和存储侧已经存在 `boundaryDatasetVersion` 这一分离字段，而共享契约只有单一 `datasetVersion`。这意味着 Phase 13 不应该继续把“canonical catalog 版本”和“geometry asset 版本”混成一个字符串，否则一旦中国与海外源版本独立演进，就会立刻失去追踪能力。规划时应把 geometry version 提升为显式概念，并让 `server` 返回 `geometryRef` 引用对象，而不是扩散更多手工 alias 常量。

**Primary recommendation:** 把 Phase 13 规划成“source catalog + build-time coordinate normalization + shared manifest + versioned static shards + API geometryRef”五件事，且对外统一交付 WGS84 GeoJSON。

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Alibaba Cloud `DataV.GeoAtlas` | 无稳定 semver；以 snapshot date + checksum 管理 | 中国市级行政区正式来源 | 官方文档确认 `DataV` 使用 GeoJSON，并明确其地图数据采用 `GCJ-02`；对中国合规数据链路是本阶段锁定选择。 |
| `Natural Earth admin-1` | `5.1.1` | 海外一级行政区正式来源 | 官方下载页给出当前稳定版本，覆盖全球 admin-1，且是公共领域数据，适合 vendored snapshot。 |
| Vite `public` static assets | 项目基线 `8.0.1` | 稳定交付不经 hash 改名的静态几何分片与 manifest | 官方文档明确 `public` 目录适合“保留精确文件名、无需先 import 才能拿 URL”的资产，这与 geometry manifest/shard 完全匹配。 |
| `@trip-map/contracts` | workspace `0.1.0` | 约束 `server -> web` 的 `geometryRef` 形状 | 现有 monorepo 已把 canonical 语义放进共享契约；Phase 13 只应在这个边界上增量扩展，而不是另造一套前端私有协议。 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `gcoord` | `1.0.7` | 构建期把 `DataV` 的 `GCJ-02` GeoJSON 统一转换为 `WGS84` | 当中国 GeoJSON 进入正式资产流水线时使用；只在 ingest/build 阶段运行，不在运行时逐点转换。 |
| Leaflet `GeoJSON` contract | `1.9.4` | 定义后续 `Leaflet` 消费层如何解释 GeoJSON 坐标与 bounds | 用于倒逼 Phase 13 资产输出满足 `(lng, lat)` GeoJSON 规范，并保留 layer/bounds 供 Phase 14 直接消费。 |
| Vitest | repo baseline `3.2.4` | 数据清单、manifest、坐标验点和 API ref 的自动化校验 | 现有 web/server 测试入口都已可跑 targeted spec，适合作为本阶段验证基线。 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `public/geo/...` 固定路径静态资产 | 通过 `src/...` import 让 Vite hash 文件名 | hash 资产更适合 bundle 图像，不适合 `server` 返回稳定 `assetKey`；`public` 更符合 manifest/缓存策略。 |
| 构建期把中国几何统一转成 `WGS84` | 运行时按点或按 feature 临时做 `GCJ-02` 转换 | 运行时转换会把坐标规则散落到 UI/render 层，增加 popup anchor、点击命中和高亮不一致风险。 |
| 固定 `Natural Earth` tag/commit 或 vendored snapshot | 直接依赖官网 download URL | 研究期间官网直链返回 WordPress 错误页，说明“站点链接稳定可用”不是安全假设。 |
| 单一 shared manifest 管中国/海外两个 layer | 两套完全独立、字段不同的 loader | 两套 loader 会把跨端 boundary 语义拆散；manifest 统一字段更利于 API-03 和版本治理。 |

**Installation:**
```bash
pnpm --filter @trip-map/web add -D gcoord
```

**Version verification:** 本次研究已核对以下 npm 版本：`gcoord@1.0.7`（registry modified 2025-01-14）、`leaflet@1.9.4`（modified 2025-08-16）。`Natural Earth admin-1` 官方下载页当前列出稳定版 `5.1.1`。`DataV.GeoAtlas` 无 semver，必须自己记录 snapshot date、source URL/adcode 和 checksum。

## Architecture Patterns

### Recommended Project Structure
```text
apps/
├── server/
│   └── src/modules/canonical-places/
│       ├── canonical-places.service.ts   # 返回 canonical summary + geometryRef
│       └── data/
│           └── geometry-manifest.generated.json
└── web/
    ├── public/geo/
    │   └── {geometryDatasetVersion}/
    │       ├── manifest.json
    │       ├── cn/
    │       │   ├── beijing.json
    │       │   └── hebei.json
    │       └── overseas/
    │           ├── us.json
    │           └── jp.json
    ├── scripts/geo/
    │   ├── build-geometry-manifest.ts
    │   ├── normalize-datav-cn.ts
    │   └── normalize-natural-earth.ts
    └── src/services/
        ├── geometry-manifest.ts
        └── geometry-loader.ts
packages/
└── contracts/src/
    └── geometry.ts                       # GeometryRef / asset manifest types
```

### Pattern 1: Source Catalog -> Manifest -> Shards
**What:** 将“原始来源信息”“canonical 到 renderable 的映射”“实际静态几何文件”拆成三层，而不是把所有语义塞进单个 GeoJSON。
**When to use:** Phase 13 的正式数据交付基线；尤其适合中国/海外两套来源独立演进但消费层又需要统一引用的场景。
**Example:**
```typescript
export interface GeometryRef {
  boundaryId: string
  layer: 'CN' | 'OVERSEAS'
  geometryDatasetVersion: string
  assetKey: string
  renderableId: string | null
}

export interface GeometryManifestEntry extends GeometryRef {
  sourceDataset: 'DATAV_GEOATLAS_CN' | 'NATURAL_EARTH_ADMIN1'
  sourceVersion: string
  sourceFeatureId: string
}
```
// Source synthesis: repo architecture + existing `boundaryId` contract

### Pattern 2: Build-Time Coordinate Normalization
**What:** 中国 GeoJSON 在数据生成阶段从 `GCJ-02` 转成 `WGS84`，海外 `Natural Earth` 保持经纬度坐标，仅做过滤和属性归一。
**When to use:** 任何面向 `Leaflet` 的正式几何输出。
**Example:**
```typescript
import gcoord from 'gcoord'

export function normalizeCnGeoJson(featureCollection: GeoJSON.FeatureCollection) {
  return gcoord.transform(featureCollection, gcoord.GCJ02, gcoord.WGS84)
}
```
// Source: https://github.com/hujiulong/gcoord

### Pattern 3: `server` Returns GeometryRef, Never Full GeoJSON
**What:** `/places/resolve` 与 `/places/confirm` 的 resolved/ambiguous place payload 返回 geometry 引用，而不是把完整 polygon 直接塞进响应。
**When to use:** `API-03` 正式落地时。
**Example:**
```typescript
type PlaceWithGeometryRef = CanonicalPlaceSummary & {
  geometryRef: GeometryRef
}
```
// Source synthesis: locked decision D-01/D-03 + existing contracts boundary

### Pattern 4: Layer-Aware Sharding
**What:** 中国分片按省级或同等维护单元、海外按国家分片；manifest 必须保留 `layer`，前端据此分开加载。
**When to use:** 任何需要同时满足 `GEOX-05` 与 `GEOX-06` 的交付方案。
**Example:**
```json
{
  "boundaryId": "datav-cn-langfang",
  "layer": "CN",
  "geometryDatasetVersion": "2026-03-31-geo-v1",
  "assetKey": "cn/hebei.json",
  "renderableId": "datav-cn-langfang",
  "sourceDataset": "DATAV_GEOATLAS_CN",
  "sourceVersion": "2025-10-29-doc-snapshot"
}
```

### Anti-Patterns to Avoid
- **把中国和海外 GeoJSON 预合成一个总包：** 这会直接违反 `GEOX-05`，也会让中国在海外 layer 中重复出现。
- **继续维护 `city-boundaries.ts` 里的手工 alias 常量：** 现有 `datav-cn-*` / `ne-admin1-*` 过渡表已经证明这种方式会漂移，正式版必须进 manifest。
- **把 canonical `datasetVersion` 和 geometry 版本复用成同一个字符串：** 当前 web 侧已有 `boundaryDatasetVersion` 分离字段，继续混用只会让版本追踪失真。
- **依赖官网临时下载链接作为唯一来源：** 研究中官网 Natural Earth 直链返回 HTML 错误页，必须固定到可校验的 snapshot/tag/commit。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 中国 GeoJSON 坐标转换 | 自己递归遍历所有 Geometry 类型并手写 GCJ-02 公式 | `gcoord.transform(geojson, gcoord.GCJ02, gcoord.WGS84)` | 坐标系转换本身稳定，但 GeoJSON 遍历和多 geometry 类型处理很容易出错。 |
| 几何资产寻址 | 运行时通过字符串拼路径猜文件位置 | 版本化 manifest + `assetKey` | 需要可追踪、可缓存、可回放，不能靠隐式命名约定。 |
| 全球 admin-1 几何整包交付 | 单个 40MB 级总 GeoJSON 直接前端加载 | 国家/省级分片 | 官方 `Natural Earth` admin-1 原始 GeoJSON 体量很大，Phase 13 目标明确要求按需加载。 |
| 站点直链下载治理 | README 手写一句“来源于官网” | source catalog 记录 URL、snapshot 日期、checksum、source version | 没有 checksum 和 snapshot，后续无法证明“这批资产是从哪来的”。 |
| GIS CLI 假设 | 假设机器一定有 `ogr2ogr` / `mapshaper` | Node + official GeoJSON + `gcoord`；必要时再新增 dev tool | 当前环境两个 CLI 都不存在，不应让计划默认依赖未安装工具。 |

**Key insight:** Phase 13 的复杂度不在“画 polygon”，而在“让 polygon 的来源、版本、坐标和寻址规则在半年后还能说清楚”。这类问题最怕隐式约定和一次性脚本。

## Common Pitfalls

### Pitfall 1: `GCJ-02` / `WGS84` 混用导致中国边界错位
**What goes wrong:** 中国边界看起来与点击点或 popup anchor 有系统性偏移，海外正常、中国不正常。
**Why it happens:** `DataV` 官方明确使用 `GCJ-02`，而 `Leaflet` 的 GeoJSON 消费按 `(lng, lat)` 经纬度工作；如果不在构建期统一坐标规则，中国 layer 会和海外 layer 落在不同参考系。
**How to avoid:** 规定“所有对外静态几何资产必须是 WGS84 GeoJSON”，中国源数据在 build 阶段转换，海外不转换。
**Warning signs:** 北京、香港这类样例在地图上总是向东南或西北整体偏移；点选命中与边界视觉中心不一致。

### Pitfall 2: boundary ID 漂移成多个别名
**What goes wrong:** 同一个海外地点在不同层面出现 `ne-admin1-us-ca` 和 `ne-admin1-us-california` 两种 ID，导致恢复、缓存或高亮失配。
**Why it happens:** 目前仓库里已经同时出现这两类 California ID，说明手工 alias 方案已开始分叉。
**How to avoid:** 在 manifest 中只保留一个 canonical `boundaryId`，其余都作为显式 alias/sourceFeatureId 记录，不允许散落在业务代码常量里。
**Warning signs:** `city-boundaries.ts` 或 fixture 中又新增 `CANONICAL_BOUNDARY_ID_TO_RENDERABLE_ID` 式硬编码。

### Pitfall 3: `datasetVersion` 被同时拿来表示 canonical 和 geometry 版本
**What goes wrong:** 记录恢复时看不出来是 canonical 目录变了还是几何资产变了，回放与缓存全部失真。
**Why it happens:** Phase 12 只有单一 fixture 版本，到了 Phase 13 中国/海外来源独立演进后，单字段表达力不够。
**How to avoid:** 保留 canonical `datasetVersion`，新增 `geometryDatasetVersion` 进入 `geometryRef` 或 boundary metadata。
**Warning signs:** 讨论里出现“这个版本号到底指 place catalog 还是 geometry asset”这种问题。

### Pitfall 4: `Natural Earth admin-1` 粒度并不总是“每国完全一致”
**What goes wrong:** 某些国家的 admin-1 更接近 region 而非用户直觉中的省/州，甚至和部门级层级混在一起。
**Why it happens:** `Natural Earth` 官方下载页明确承认这是最难维护的数据集，并提到像法国这类国家存在 region/admin-1 双层问题。
**How to avoid:** 先接受 `Natural Earth` 的 admin-1 语义作为 v3.0 海外正式粒度，不在 Phase 13 试图手动“纠正全球层级体系”。
**Warning signs:** 计划里开始扩展出国家定制例外表，或试图在本阶段补全球语义修正。

### Pitfall 5: 把官网直链当作稳定下载 API
**What goes wrong:** 数据更新脚本偶发下载到 HTML 错误页或跳转页，构建却仍然继续。
**Why it happens:** 官方网页下载入口和实际资源路径并不总是稳定；研究期已实测到官网 zip 直链返回 WordPress 错误页。
**How to avoid:** source catalog 必须记录 checksum；下载步骤要验证内容类型/文件签名，必要时固定到官方 GitHub tag/commit。
**Warning signs:** 生成的“zip”文件 `file` 结果是 HTML，或构建脚本没有 checksum 校验。

## Code Examples

Verified patterns from official sources:

### `gcoord` 转换 GeoJSON 坐标系
```typescript
import gcoord from 'gcoord'

const normalized = gcoord.transform(featureCollection, gcoord.GCJ02, gcoord.WGS84)
```
// Source: https://github.com/hujiulong/gcoord

### Leaflet 消费 GeoJSON 时的坐标约定
```typescript
const layer = L.geoJSON(data, {
  coordsToLatLng: L.GeoJSON.coordsToLatLng,
})
```
// Source: https://leafletjs.com/reference.html#geojson

### Vite `public` 目录提供稳定静态路径
```typescript
const manifestUrl = '/geo/2026-03-31-geo-v1/manifest.json'
```
// Source: https://vite.dev/guide/assets.html#the-public-directory

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 单一 `city-boundaries.geo.json` import + 本地查表 | 版本化 manifest + shard assets + API `geometryRef` | v3.0 / Phase 13 | 支持按需加载、缓存和独立追踪中国/海外来源。 |
| 运行时隐式承受不同坐标系 | build-time 收口到单一对外坐标标准 | v3.0 / Phase 13 | 把坐标偏移问题前移到数据流水线，避免 UI 层补丁化。 |
| 以 bundle import 为主的静态资源引用 | `public` 固定路径 + manifest 资产索引 | Vite 官方长期推荐模式 | 更适合稳定 URL、缓存 key 和服务端返回 assetKey。 |
| “把 GeoJSON 放哪儿再说” | source catalog + checksum + sourceVersion | 本阶段必须引入 | 解决来源追踪与数据升级回放问题。 |

**Deprecated/outdated:**
- 继续把 `apps/web/src/services/city-boundaries.ts` 当成正式 boundary registry：这是过渡实现，不应再承接正式中国/海外行政区清单。
- 把 `Natural Earth` 官网直链视为稳定下载 API：研究期间实际下载到了 HTML 错误页，必须加校验与固定版本策略。

## Open Questions

1. **GeoAtlas 的可复现获取方式到底是手工导出还是可固定的程序化入口？**
   - What we know: 官方文档确认 `DataV.GeoAtlas` 可获取/编辑 GeoJSON，并明确 `DataV` 使用 `GCJ-02`。
   - What's unclear: 当前没有找到一个官方、稳定、可批量拉取中国市级全量 GeoJSON 的程序化 API 文档。
   - Recommendation: 规划时先把“手工/半自动 snapshot + source metadata + checksum”视为正式路径；若实施中验证到稳定 API，再把自动下载补进脚本。

2. **海外 admin-1 是否需要本阶段做几何简化？**
   - What we know: 官方 `Natural Earth` admin-1 原始 GeoJSON 在当前仓库环境实测约 `40.7 MB`，不适合整包前端加载。
   - What's unclear: 过滤掉中国并按国家分片后，单片大小是否已足够；是否还需要额外 simplify。
   - Recommendation: 先做过滤 + 分片 + gzip 体积度量，再决定是否引入 simplify；不要在没有体积数据时提前增加处理步骤。

3. **shared manifest 由谁持有单一真源？**
   - What we know: `server` 需要读取 geometry metadata 返回 `assetKey`，`web` 需要读取同一份 metadata 做缓存和加载。
   - What's unclear: 最终是 server 直接导入生成 JSON，还是 web/server 分别消费同一生成产物。
   - Recommendation: 规划时明确“单一 generated manifest artifact，多消费者读取”，不要允许两份手写索引并存。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Geo build scripts, tests | ✓ | `v22.22.1` | — |
| pnpm | workspace scripts | ✓ | `10.33.0` | `npm` 可临时跑 registry 查询，但不适合作为 workspace 主入口 |
| npm | registry version verification | ✓ | `10.9.4` | — |
| curl | 拉取原始数据 snapshot / 探测资源 | ✓ | `8.7.1` | 浏览器手工下载 |
| unzip | 检查压缩包内容 | ✓ | `6.00` | Node 解压库 |
| `mapshaper` CLI | 可选的几何转换/裁剪工具 | ✗ | — | 使用官方 GeoJSON + Node 脚本；必要时新增 devDependency |
| `ogr2ogr` / GDAL | 可选的 shapefile/GIS 转换 | ✗ | — | 不依赖 GDAL；优先使用官方 GeoJSON 或 Node 工具链 |

**Missing dependencies with no fallback:**
- None.

**Missing dependencies with fallback:**
- `mapshaper` 未安装，但当前规划可直接使用官方 GeoJSON 与 Node 脚本。
- `ogr2ogr` 未安装，不应把它作为 Phase 13 的默认前提。

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest `3.2.4`（repo baseline） |
| Config file | `apps/web/vitest.config.ts`, `apps/server/vitest.config.ts`, `packages/contracts/vitest.config.ts` |
| Quick run command | `pnpm --filter @trip-map/web test src/services/city-boundaries.spec.ts` 或 `pnpm --filter @trip-map/server test test/canonical-resolve.e2e-spec.ts` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GEOX-03 | 中国 source catalog、GCJ-02→WGS84 归一化、manifest entry 生成正确 | unit | `pnpm --filter @trip-map/web test src/services/geometry-manifest.spec.ts` | ❌ Wave 0 |
| GEOX-04 | 海外 `Natural Earth admin-1` 过滤中国后按国家分片且保留版本信息 | unit | `pnpm --filter @trip-map/web test src/services/geometry-manifest.spec.ts` | ❌ Wave 0 |
| GEOX-05 | `CN` / `OVERSEAS` layer 维持分离寻址，不生成合并总包 | unit | `pnpm --filter @trip-map/web test src/services/geometry-loader.spec.ts` | ❌ Wave 0 |
| GEOX-06 | `boundaryId -> renderableId -> assetKey` 显式映射进入共享契约/manifest | unit/contracts | `pnpm --filter @trip-map/contracts test` | ✅ |
| GEOX-07 | 北京、香港、California 代表性样例的坐标、bounds、anchor 基线稳定 | unit/integration | `pnpm --filter @trip-map/web test src/services/geometry-validation.spec.ts` | ❌ Wave 0 |
| API-03 | `/places/resolve` `/places/confirm` 返回 summary + `geometryRef` 而非 GeoJSON | e2e | `pnpm --filter @trip-map/server test test/canonical-resolve.e2e-spec.ts` | ✅ |

### Sampling Rate
- **Per task commit:** `pnpm --filter @trip-map/web test src/services/city-boundaries.spec.ts` 或对应新增 targeted spec
- **Per wave merge:** `pnpm --filter @trip-map/server test test/canonical-resolve.e2e-spec.ts` + `pnpm --filter @trip-map/contracts test`
- **Phase gate:** `pnpm test` + `pnpm typecheck`

### Wave 0 Gaps
- [ ] `apps/web/src/services/geometry-manifest.spec.ts` — 覆盖 GEOX-03 / GEOX-04 / GEOX-06
- [ ] `apps/web/src/services/geometry-loader.spec.ts` — 覆盖 GEOX-05
- [ ] `apps/web/src/services/geometry-validation.spec.ts` — 覆盖 GEOX-07
- [ ] `packages/contracts/src/contracts.spec.ts` 扩展 `geometryRef` 类型断言 — 覆盖 API-03 / GEOX-06
- [ ] `apps/server/test/canonical-resolve.e2e-spec.ts` 扩展 geometryRef 响应断言 — 覆盖 API-03

## Sources

### Primary (HIGH confidence)
- Alibaba Cloud DataV Map Data Format - https://www.alibabacloud.com/help/en/datav/datav-7-0/user-guide/map-data-format-1
  - Verified `DataV` map widgets use `GCJ-02`, use GeoJSON, and GeoAtlas is the official GeoJSON editor/source surface.
- Natural Earth admin-1 download page - https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/
  - Verified current stable download versions (`5.1.1`), dataset scope, and official caveats about admin-1 maintenance quality.
- Natural Earth terms of use - https://www.naturalearthdata.com/about/terms-of-use/
  - Verified public-domain status.
- Leaflet GeoJSON reference - https://leafletjs.com/reference.html#geojson
  - Verified GeoJSON coordinate consumption contract, `coordsToLatLng`, `getBounds`, and layer separation primitives.
- Leaflet CRS reference - https://leafletjs.com/reference.html#crs
  - Verified `EPSG:4326`/lon-lat semantics relevant to Phase 13 output compatibility.
- Vite static asset handling - https://vite.dev/guide/assets.html#the-public-directory
  - Verified exact-file-name static asset delivery via `public/`.
- `gcoord` official repository - https://github.com/hujiulong/gcoord
  - Verified GeoJSON coordinate transform support and `GCJ02 -> WGS84` usage.

### Secondary (MEDIUM confidence)
- Natural Earth official GitHub repository `geojson/ne_10m_admin_1_states_provinces.geojson` on `master`
  - Used to verify an official raw GeoJSON artifact exists and is large enough to justify sharding; must be pinned to tag/commit before production use.
- Local environment observation on 2026-03-31
  - `curl` to Natural Earth website zip URL returned HTML instead of zip; indicates website direct links are not reliable enough to be the sole versioning strategy.
- Local repository inspection
  - Verified current `apps/web/src/services/city-boundaries.ts` still contains hand-written canonical/renderable aliases and that web types already separate `boundaryDatasetVersion`.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - core source choices are locked and backed by official docs; only GeoAtlas bulk acquisition mechanics remain unverified.
- Architecture: HIGH - manifest/shard/API-ref pattern is strongly implied by locked decisions, Vite asset model, and current repo boundaries.
- Pitfalls: HIGH - coordinate mismatch, ID drift, and dataset-version ambiguity are all directly evidenced by official docs plus local code inspection.

**Research date:** 2026-03-31
**Valid until:** 2026-04-30
