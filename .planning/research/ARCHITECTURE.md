# Architecture Research

**Domain:** 旅行地图 v3.0 的 `monorepo + TypeScript server + 中国市级 / 海外一级行政区` 集成架构
**Researched:** 2026-03-27
**Confidence:** HIGH

## Standard Architecture

### System Overview

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                                  apps/web                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│  App Shell  │  LeafletMapStage  │  Summary Popup  │  Detail Drawer         │
│      │      │        │           │        │        │        │               │
│      └──────┴────────┴───────────┴────────┴────────┴────────┘               │
│                               Pinia / Query Layer                            │
│      map-ui      selection-store      trip-records-store      boundary-cache │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                │ HTTP DTOs
┌───────────────────────────────┴──────────────────────────────────────────────┐
│                              packages/contracts                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ AdminArea IDs │ Resolve DTOs │ TripRecord DTOs │ Dataset version contracts  │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                │ imports
┌───────────────────────────────┴──────────────────────────────────────────────┐
│                                 apps/server                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│  Geo Resolve Module  │  Admin Areas Module  │  Trip Records Module          │
│          │            │          │           │          │                    │
│          └────────────┴──────────┴───────────┴──────────┘                    │
│                     Geo Dataset Registry / Repository Layer                  │
└───────────────────────┬───────────────────────────────┬──────────────────────┘
                        │                               │
         ┌──────────────┘                               └──────────────┐
         │                                                           │
┌────────▼────────┐                                         ┌────────▼────────┐
│ Versioned Geo   │                                         │ Relational DB   │
│ datasets        │                                         │ trip_records    │
│ CN city / admin │                                         │ users(optional) │
│ overseas admin1 │                                         │                 │
└─────────────────┘                                         └─────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `apps/web` map stage | 承载 Leaflet 地图、图层顺序、点击事件、弹层锚点与边界可视化 | Vue 3 SFC + Leaflet bridge component |
| `apps/web` selection store | 管理当前点击命中、待解析状态、popup/drawer 协调、临时通知 | Pinia store，仅保存 UI 与临时领域状态 |
| `apps/web` trip records store | 保存已加载旅行记录、触发点亮/取消点亮、承接 optimistic UI | Pinia store + API repository |
| `apps/web` boundary cache | 缓存已请求过的 GeoJSON 边界，避免重复请求 | 内存 Map + 可选 session cache |
| `packages/contracts` | 提供前后端共享的 area ID、DTO、枚举、错误码 | 纯 TypeScript types/constants |
| `apps/server` geo resolve | 输入 `lat/lng`，输出“中国市级 / 海外 admin1” canonical area | NestJS module + read-only service |
| `apps/server` admin areas | 查询 area 摘要、返回边界 GeoJSON、暴露数据集版本 | NestJS controller + dataset registry |
| `apps/server` trip records | 用户点亮区域、读取记录、编辑备注/featured | NestJS controller + DB repository |

## Recommended Project Structure

```text
apps/
├── web/
│   └── src/
│       ├── app/                    # App shell、全局 providers、路由入口
│       ├── features/
│       │   ├── map/
│       │   │   ├── components/     # LeafletMapStage、popup 宿主
│       │   │   ├── layers/         # BoundaryHighlightLayer、TripMarkerLayer
│       │   │   ├── stores/         # map-ui、map-selection、boundary-cache
│       │   │   └── services/       # map adapters、popup anchoring
│       │   └── trips/
│       │       ├── components/     # drawer、summary card
│       │       ├── stores/         # trip-records
│       │       └── services/       # repository adapters
│       ├── services/api/           # resolve-api、admin-area-api、trip-records-api
│       └── types/                  # 仅保留纯前端 view-model
├── server/
│   └── src/
│       ├── modules/
│       │   ├── geo-resolve/        # lat/lng -> canonical area
│       │   ├── admin-areas/        # area summary + geometry
│       │   └── trip-records/       # CRUD / toggle visited state
│       ├── dataset/                # 规范化后的 GeoJSON manifest、索引读取
│       └── common/                 # config、errors、interceptors
packages/
├── contracts/                      # 前后端共享 DTO、enum、ID 规则
└── geo-domain/                     # area kind、dataset version、normalizers
```

### Structure Rationale

- **`apps/web`:** 保留现有 Vue 3 前端，但把“地图交互”和“旅行记录”拆成 feature 边界，避免继续由 [`map-points.ts`](/Users/huangjingping/i/trip-map/src/stores/map-points.ts) 单文件兼任所有职责。
- **`apps/server`:** 新增 TypeScript 服务端，承接地理识别、边界提供和持久化，不把大体积 GeoJSON 和 canonical area 规则继续硬塞进前端包。
- **`packages/contracts`:** 消除“前端猜 server 返回结构”的隐性耦合，尤其是 `areaId`、`areaKind`、`datasetVersion` 这类跨端关键字段。
- **`packages/geo-domain`:** 共享领域常量与归一化规则，但不共享原始几何数据本体，避免 web bundle 被静态数据拖大。

## Integration Strategy

### Current Coupling To Break

当前代码的主耦合链路是：

```text
WorldMapStage
  -> 本地 normalized x/y 转 lat/lng
  -> 本地 geo-lookup
  -> map-points 直接制造/复用 draft
  -> point-storage 写入 localStorage
  -> city-boundaries 本地查 GeoJSON 做整块高亮
```

这条链路在 v2 可行，但对 v3 有三个结构性问题：

1. [`WorldMapStage.vue`](/Users/huangjingping/i/trip-map/src/components/WorldMapStage.vue) 同时承担地图引擎、地理识别入口、边界渲染与业务状态切换，改成 Leaflet 后会继续膨胀。
2. [`map-points.ts`](/Users/huangjingping/i/trip-map/src/stores/map-points.ts) 既管领域对象，又管持久化，又管“候选城市确认”，不适合接远程 API。
3. [`point-storage.ts`](/Users/huangjingping/i/trip-map/src/services/point-storage.ts)、[`geo-lookup.ts`](/Users/huangjingping/i/trip-map/src/services/geo-lookup.ts)、[`city-boundaries.ts`](/Users/huangjingping/i/trip-map/src/services/city-boundaries.ts) 都默认“前端即数据源”，与全栈化目标冲突。

### Recommended Domain Pivot

v3 不应继续围绕“点位 point”建模，而应切到“行政区 area + 用户记录 record”：

- `ResolvedAreaSelection`
  - 表示一次点击后的 canonical 结果
  - 字段建议：`clickedLatLng`、`areaId`、`areaKind`、`name`、`countryCode`、`countryName`、`parentName`、`centroid`、`datasetVersion`、`matchConfidence`、`recordState`
- `TripRecord`
  - 表示用户是否点亮某个行政区，以及补充说明
  - 字段建议：`id`、`areaId`、`areaKind`、`note`、`isFeatured`、`createdAt`、`updatedAt`

这比沿用当前 [`MapPointDisplay`](/Users/huangjingping/i/trip-map/src/types/map-point.ts) 更合适，因为新语义的核心不再是“一个任意 marker 点”，而是“一个被点亮的中国市或海外一级行政区”。

## New Vs Modified Areas

### New Modules And Services

| Area | New Module | Responsibility |
|------|------------|----------------|
| Monorepo | `apps/web` | 承载现有前端并为后续目录重构提供宿主 |
| Monorepo | `apps/server` | 新增 TypeScript backend 服务 |
| Shared | `packages/contracts` | 共享 `ResolveAreaRequest/Response`、`TripRecordDto`、`AreaSummaryDto` |
| Shared | `packages/geo-domain` | 共享 `areaKind`、`datasetVersion`、行政区 ID 规则 |
| Server | `modules/geo-resolve` | 根据点击坐标返回“中国市级 / 海外 admin1”命中结果 |
| Server | `modules/admin-areas` | 返回 area 摘要、GeoJSON 边界、版本元信息 |
| Server | `modules/trip-records` | 点亮/取消点亮、查询列表、编辑备注 |
| Server | `dataset/registry` | 统一读取 DataV.GeoAtlas 与 Natural Earth 预处理产物 |
| Web | `features/map/stores/map-selection` | 管理当前选中行政区、pending 状态、popup 锚点 |
| Web | `features/map/stores/boundary-cache` | 缓存已请求的边界 GeoJSON |
| Web | `services/api/resolve-api` | 调用 server 的 area resolve 接口 |
| Web | `services/api/admin-area-api` | 获取 area 摘要和边界 |
| Web | `services/api/trip-records-api` | 获取和更新旅行记录 |
| Web | `features/map/layers/BoundaryHighlightLayer` | 在 Leaflet 上渲染已点亮与当前选中边界 |
| Web | `features/map/components/LeafletMapStage` | 替换现有 SVG 地图舞台 |

### Existing Modules Likely Modified

| Existing Module | Current Role | v3 Modification |
|-----------------|-------------|-----------------|
| [`src/App.vue`](/Users/huangjingping/i/trip-map/src/App.vue) | 应用壳层 + notice + stage 宿主 | 基本保留；改为挂载 `apps/web` 新 feature 结构和全局 query/provider |
| [`src/components/WorldMapStage.vue`](/Users/huangjingping/i/trip-map/src/components/WorldMapStage.vue) | SVG 底图、点击识别、边界高亮、popup 锚点 | 重写为 Leaflet 宿主，移除本地 `geo-lookup` 和 SVG 投影逻辑 |
| [`src/components/SeedMarkerLayer.vue`](/Users/huangjingping/i/trip-map/src/components/SeedMarkerLayer.vue) | marker 渲染和点选 | 改为 Leaflet marker layer，或按需求拆成 `TripMarkerLayer` 与 `SelectionMarkerLayer` |
| [`src/components/map-popup/MapContextPopup.vue`](/Users/huangjingping/i/trip-map/src/components/map-popup/MapContextPopup.vue) | summary surface 宿主 | 继续保留，但输入改为 `ResolvedAreaSelection + TripRecordState` |
| [`src/components/map-popup/PointSummaryCard.vue`](/Users/huangjingping/i/trip-map/src/components/map-popup/PointSummaryCard.vue) | 城市候选确认 + 详情摘要 | 改为 area 摘要 + 名称右侧点亮/取消点亮动作，不再内建本地城市搜索 |
| [`src/components/PointPreviewDrawer.vue`](/Users/huangjingping/i/trip-map/src/components/PointPreviewDrawer.vue) | 详情查看与编辑 | 保留表面职责，但编辑对象从 `MapPointDisplay` 切到 `TripRecord` |
| [`src/stores/map-ui.ts`](/Users/huangjingping/i/trip-map/src/stores/map-ui.ts) | pending hit / notice / recognizing | 保留为纯 UI store，扩展为 map viewport、pending request、surface 协调 |
| [`src/stores/map-points.ts`](/Users/huangjingping/i/trip-map/src/stores/map-points.ts) | seed/local/saved 合并 + draft 生命周期 + storage 编排 | 拆成 `map-selection` 与 `trip-records` 两个 store，去掉 localStorage 编排主责 |
| [`src/services/geo-lookup.ts`](/Users/huangjingping/i/trip-map/src/services/geo-lookup.ts) | 前端本地识别 | 下沉到 server；web 仅保留 API client |
| [`src/services/city-search.ts`](/Users/huangjingping/i/trip-map/src/services/city-search.ts) | 本地城市候选搜索 | 删除或迁到 server resolve 流程，不再作为主要确认路径 |
| [`src/services/city-boundaries.ts`](/Users/huangjingping/i/trip-map/src/services/city-boundaries.ts) | 直接读取本地 GeoJSON | 改为 `admin-area-api + boundary-cache`，由 server 控制边界版本 |
| [`src/services/point-storage.ts`](/Users/huangjingping/i/trip-map/src/services/point-storage.ts) | `localStorage` 快照持久化 | 降级为“旧数据迁移适配器”，不再是主存储 |
| [`src/services/map-projection.ts`](/Users/huangjingping/i/trip-map/src/services/map-projection.ts) | SVG normalized 坐标系 | 从主链路移除，仅在旧数据迁移或回归测试时保留 |
| [`src/types/map-point.ts`](/Users/huangjingping/i/trip-map/src/types/map-point.ts) | 点位领域模型 | 改造成 `selection` / `trip-record` / `view-model` 三层类型 |
| [`src/types/geo.ts`](/Users/huangjingping/i/trip-map/src/types/geo.ts) | 前端识别与边界类型 | 拆分为 shared contracts + 前端 view-model types |

## Architectural Patterns

### Pattern 1: Server-Owned Geo Semantics

**What:** 行政区识别规则、边界版本和 canonical area ID 由 server 持有，web 通过 API 使用。
**When to use:** 当 GeoJSON 体积大、数据源要统一版本、且识别语义涉及中国合规市级与海外 admin1 混合规则时。
**Trade-offs:** server 复杂度上升，但可以显著降低前端 bundle 体积，并避免前后端对 area 语义理解不一致。

**Example:**
```typescript
// packages/contracts
export interface ResolveAreaResponse {
  clickedLatLng: { lat: number; lng: number }
  area: {
    areaId: string
    areaKind: 'cn-city' | 'overseas-admin1'
    name: string
    countryCode: string
    countryName: string
    parentName: string | null
    centroid: { lat: number; lng: number }
    datasetVersion: string
  } | null
  recordState: 'lit' | 'unlit'
}
```

### Pattern 2: Repository Seam For Local-To-API Migration

**What:** 在 web 端引入 repository 接口，先用 local adapter 复刻旧行为，再切到 HTTP adapter。
**When to use:** 需要保住现有 popup/drawer UI，但逐步把存储从 `localStorage` 迁到 server。
**Trade-offs:** 早期会多一层抽象，但这是最稳的迁移缝。

**Example:**
```typescript
export interface TripRecordsRepository {
  list(): Promise<TripRecord[]>
  lightUp(areaId: string): Promise<TripRecord>
  unlight(areaId: string): Promise<void>
  update(recordId: string, patch: { note: string; isFeatured: boolean }): Promise<TripRecord>
}
```

### Pattern 3: Boundary Geometry By Reference, Not By Record

**What:** 旅行记录只保存 `areaId`，边界 GeoJSON 通过 `areaId` 单独请求与缓存。
**When to use:** 需要整块高亮，但不希望把 polygon 持久化进 DB 或前端 store。
**Trade-offs:** 首次选中某区域需要额外请求；换来更稳定的数据版本控制和更小的记录模型。

## Data Flow

### Request Flow

```text
[User Clicks Leaflet Map]
    ↓
[LeafletMapStage]
    ↓
[map-selection store sets pending lat/lng]
    ↓
[resolve-api]
    ↓
[server geo-resolve module]
    ↓
[dataset registry]
    ↓
[ResolveAreaResponse]
    ↓
[selection store updates current area]
    ↓
[boundary-cache fetches geometry if needed]
    ↓
[BoundaryHighlightLayer + popup render]
```

### State Management

```text
map-ui store
  -> viewport / popup anchor / notices / pending request

map-selection store
  -> current resolved area / selected area / boundary fetch state

trip-records store
  -> server-backed lit areas / optimistic toggle state / drawer editing state
```

### Key Data Flows

1. **地图点击识别流**
   - 用户点击 Leaflet
   - web 只保留 `lat/lng` 与 pending UI
   - server 返回 canonical `areaId`
   - web 再按需拉取 boundary GeoJSON
   - popup 和 drawer 读取同一个 `selection + recordState`

2. **点亮/取消点亮流**
   - popup 或 drawer 点击名称右侧 action
   - `trip-records store` 发起 `PUT /trip-records/areas/:areaId` 或 `DELETE /trip-records/areas/:areaId`
   - 成功后更新已点亮 area 集合
   - `BoundaryHighlightLayer` 立即根据 `areaId` 集合刷新高亮

3. **应用启动加载流**
   - web 启动后先读取 server trip records
   - 再懒加载已在视口内或当前选中的边界
   - 旧 `localStorage` 若存在，仅作为一次性 migration source，而不是持续 overlay

4. **旧数据迁移流**
   - 读取旧快照中的点位
   - 调用 server enrichment：按 `lat/lng` 映射到新的 `areaId`
   - 成功映射则生成 `TripRecord`
   - 失败映射则保留在本地 migration report，不直接污染主记录表

## Frontend-Only Data Vs Backend-Owned Data

### Frontend-Only

| Data | Why It Stays In Web |
|------|---------------------|
| 地图 viewport、zoom、当前 popup anchor | 纯展示状态，不需要跨设备同步 |
| pending click、loading/error notice | 瞬时 UI 状态 |
| boundary GeoJSON 缓存 | 只是网络缓存，不是事实来源 |
| drawer 打开模式、当前编辑草稿 | 表单临时态 |
| dev/demo seed data | 如果保留，只能作为开发或演示 fixture，不再是产品主数据源 |

### Backend-Owned

| Data | Why It Belongs To Server |
|------|--------------------------|
| `areaId` 体系与行政区层级规则 | 必须统一“中国市级 / 海外 admin1”语义 |
| resolve 结果与候选逻辑 | 命中规则不能在 web/server 各算一套 |
| GeoJSON 数据集版本与边界清单 | 需要合规、可替换、可追踪版本 |
| 用户 trip records | 这是系统记录，不应继续依赖浏览器本地快照 |
| area summary 元数据 | 名称、父级、国家信息需和边界版本保持一致 |

### Shared But Not Source Of Truth

| Data | Role |
|------|------|
| DTO/type definitions | 共享契约，不是实际存储 |
| `areaKind` / error code / datasetVersion 常量 | 防止跨端魔法字符串漂移 |

## Migration Seams

### Seam 1: `map-points` -> `trip-records repository`

先不要直接把所有 UI 改成 server-first。更稳的做法是：

- 第一步：保留当前 popup / drawer 入口
- 第二步：把 [`map-points.ts`](/Users/huangjingping/i/trip-map/src/stores/map-points.ts) 的持久化部分抽到 repository
- 第三步：先接 `LocalStorageTripRecordsRepository`
- 第四步：再切成 `HttpTripRecordsRepository`

这样 UI 逻辑不需要和后端接入同时重写。

### Seam 2: `geo-lookup` -> `resolve-api`

- 现有 [`WorldMapStage.vue`](/Users/huangjingping/i/trip-map/src/components/WorldMapStage.vue) 里 `handleMapClick` 先改成“只取 Leaflet click 的 `lat/lng`”
- 把本地 `lookupCountryRegionByCoordinates` 替换成 `resolve-api.resolve(lat, lng)`
- 这样即使 Leaflet 尚未完全切完，也能先把识别责任迁到 server

### Seam 3: `city-boundaries` -> `boundary-cache`

- 现有 [`city-boundaries.ts`](/Users/huangjingping/i/trip-map/src/services/city-boundaries.ts) 直接读本地 GeoJSON
- v3 应改成 `boundary-cache.get(areaId)`，内部没有就请求 server
- `BoundaryHighlightLayer` 只认 `GeoJSONFeatureCollection`，不关心数据来自本地还是远端

### Seam 4: `point-storage` -> one-time migration adapter

- [`point-storage.ts`](/Users/huangjingping/i/trip-map/src/services/point-storage.ts) 不应继续做长期 overlay
- 它在 v3 最合理的角色是：
  - 读取旧版快照
  - 生成 migration candidates
  - 完成迁移后退出主运行时路径

## Suggested Build Order

1. **Monorepo skeleton + shared contracts**
   - 先把现有前端搬到 `apps/web`
   - 新建 `apps/server` 和 `packages/contracts`
   - 这是所有后续模块能稳定联调的基础

2. **Canonical area model + dataset registry**
   - 先定义 `areaId`、`areaKind`、`datasetVersion`
   - 把中国市级与海外 admin1 的预处理结果统一成同一套摘要结构
   - 这是整个 milestone 风险最高、也最值得先验证的依赖

3. **Server read-only geo APIs**
   - 先做 `resolve`、`area summary`、`boundary geometry` 三类只读接口
   - 不要一开始就把 DB、鉴权、写接口全部捆在一起
   - 这样能尽早验证行政区命中与 Leaflet 边界渲染是否成立

4. **Web map engine switch to Leaflet**
   - 用 read-only geo APIs 驱动新 `LeafletMapStage`
   - 保留现有 popup / drawer 风格与主交互表面
   - 先打通“点击 -> 命中 -> 高亮 -> 查看”的主链路

5. **Trip records persistence module**
   - 在 server 落 trip record 表与接口
   - web 的 `trip-records repository` 从 local adapter 切到 HTTP adapter
   - 点亮/取消点亮动作此时再接入真正后端写链路

6. **Legacy local migration and cleanup**
   - 读取旧 `localStorage` 快照做一次性导入
   - 清理 `map-projection.ts`、`geo-lookup.ts`、`city-search.ts` 在主链路中的遗留调用
   - 最后再移除旧的 `seed + overlay` 主存储路径

## Anti-Patterns

### Anti-Pattern 1: 继续把 GeoJSON 和识别逻辑塞在前端

**What people do:** 只是把底图从 SVG 换成 Leaflet，但仍让 web 本地读取所有边界并自己做 resolve。
**Why it's wrong:** 包体会继续膨胀，合规数据和版本也无法由 server 统一治理，前后端迟早会出现 area 语义漂移。
**Do this instead:** web 只负责地图交互；server 持有 canonical area 规则与边界数据。

### Anti-Pattern 2: 保留“point-centric” 记录模型不动

**What people do:** 继续以 `point.id/x/y` 作为主键，仅额外挂一个 `boundaryId`。
**Why it's wrong:** v3 的核心语义是行政区是否点亮，不再是一个任意落点 marker；继续 point-centric 会把“一个行政区多个点”“取消点亮动作”都做乱。
**Do this instead:** 改为 `TripRecord(areaId)`，marker 只是视图投影，不是领域主键。

### Anti-Pattern 3: 一步到位同时重写地图、后端、数据迁移

**What people do:** 试图在一个阶段里同时切 monorepo、Leaflet、server、DB、旧数据导入。
**Why it's wrong:** 出问题时无法定位是地图、数据集、接口还是迁移造成的。
**Do this instead:** 先切 read-only geo 主链路，再切写链路，最后做迁移收尾。

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| 阿里云 `DataV.GeoAtlas` 数据产物 | 预处理后进入 server dataset registry | 不建议直接在浏览器端消费原始数据源 |
| `Natural Earth` admin1 数据 | 预处理后进入 server dataset registry | 与中国市级数据统一成同一份 `AreaSummary` 契约 |
| Leaflet | 仅作为 web 地图引擎 | 领域判断不能写进 Leaflet layer 本身 |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `apps/web` ↔ `apps/server` | HTTP + shared DTOs | 不允许 web 直接 import server dataset files |
| `selection store` ↔ `trip-records store` | store action / computed state | `selection` 管“当前命中”，`trip-records` 管“用户是否点亮” |
| `BoundaryHighlightLayer` ↔ `boundary-cache` | composable / service | 图层只渲染，不负责请求策略 |
| `popup/drawer` ↔ `trip-records repository` | store actions | UI 不直接写 HTTP 调用 |
| `dataset registry` ↔ `trip-records module` | shared area ID lookup | trip record 只存 area 引用，不存 geometry |

## Sources

- [PROJECT.md](/Users/huangjingping/i/trip-map/.planning/PROJECT.md)
- [package.json](/Users/huangjingping/i/trip-map/package.json)
- [pnpm-workspace.yaml](/Users/huangjingping/i/trip-map/pnpm-workspace.yaml)
- [App.vue](/Users/huangjingping/i/trip-map/src/App.vue)
- [WorldMapStage.vue](/Users/huangjingping/i/trip-map/src/components/WorldMapStage.vue)
- [PointPreviewDrawer.vue](/Users/huangjingping/i/trip-map/src/components/PointPreviewDrawer.vue)
- [MapContextPopup.vue](/Users/huangjingping/i/trip-map/src/components/map-popup/MapContextPopup.vue)
- [PointSummaryCard.vue](/Users/huangjingping/i/trip-map/src/components/map-popup/PointSummaryCard.vue)
- [SeedMarkerLayer.vue](/Users/huangjingping/i/trip-map/src/components/SeedMarkerLayer.vue)
- [map-points.ts](/Users/huangjingping/i/trip-map/src/stores/map-points.ts)
- [map-ui.ts](/Users/huangjingping/i/trip-map/src/stores/map-ui.ts)
- [geo-lookup.ts](/Users/huangjingping/i/trip-map/src/services/geo-lookup.ts)
- [point-storage.ts](/Users/huangjingping/i/trip-map/src/services/point-storage.ts)
- [city-boundaries.ts](/Users/huangjingping/i/trip-map/src/services/city-boundaries.ts)
- [map-projection.ts](/Users/huangjingping/i/trip-map/src/services/map-projection.ts)
- [map-point.ts](/Users/huangjingping/i/trip-map/src/types/map-point.ts)
- [geo.ts](/Users/huangjingping/i/trip-map/src/types/geo.ts)

---
*Architecture research for: 全栈化与行政区地图重构*
*Researched: 2026-03-27*
