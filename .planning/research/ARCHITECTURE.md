# Architecture Patterns: 旅行世界地图 v2.0

**Domain:** 既有 `Vue 3 + Vite + TypeScript` 旅行地图 SPA 的 v2 增量架构
**Researched:** 2026-03-25
**Scope:** 仅覆盖城市优先选择、真实城市边界高亮、浮层详情、二次元可爱重设计的集成点
**Confidence:** HIGH

## Recommended Integration

v2 不要推翻 v1 的 `WorldMapStage -> geo lookup -> map-points -> drawer` 主链路，而是把“地点识别”和“点位创建”拆成两个阶段：

```text
地图交互
  -> 解析为 DestinationSelection（城市优先，其次地区/国家）
  -> map-ui 持有高亮 / popup / transient selection
  -> 用户确认后才进入 map-points draft / saved 生命周期
  -> drawer 负责完整详情与编辑
```

核心原则：

- `map-points` 继续只管持久化点位、draft、view/edit 生命周期，不接管 hover、边界高亮、popup 锚点。
- `map-ui` 扩展为地图瞬时交互状态中心，负责当前命中的 destination、边界高亮、popup 开关和 notice。
- 地理边界几何保持为静态只读资产，运行时只引用 `destinationId` / `boundaryId`，绝不把 polygon 写入 `localStorage`。

## New Vs Modified Pieces

### New

| Piece | Type | Responsibility |
|------|------|----------------|
| `src/data/geo/city-destinations.index.json` | 数据资产 | 城市级 canonical index；包含 `destinationId`、`countryCode`、`regionName`、`bbox`、`centroid`、`labelAnchor`、`geometryShard` |
| `src/data/geo/city-boundaries/*.json` | 数据资产 | 经过简化的城市边界几何分片，仅用于命中和高亮渲染 |
| `src/services/destination-lookup.ts` | 服务 | 在现有国家/地区识别之上补齐“城市优先”的 canonical destination 解析 |
| `src/services/city-boundary-loader.ts` | 服务 | 按需加载当前选中城市的边界 shard，控制包体与首屏成本 |
| `src/components/CityBoundaryLayer.vue` | 组件 | 渲染 hover/selected 城市边界高亮，不承载业务判断 |
| `src/components/MapSelectionPopup.vue` | 组件 | 地图上的轻量详情浮层，展示名称、国家/地区、状态摘要与 CTA |
| `src/components/MapStageDecorLayer.vue` | 组件 | 二次元可爱视觉装饰层；只做视觉，不参与命中 |

### Modified

| Piece | Current Role | v2 Modification |
|------|--------------|-----------------|
| `src/components/WorldMapStage.vue` | 点击底图后直接创建 `draftPoint` | 改为先生成 `DestinationSelection`，驱动 boundary highlight + popup，再由 CTA 进入 draft |
| `src/components/SeedMarkerLayer.vue` | 渲染 marker 并直接选中点位 | 增加 popup 锚点事件；marker 点击优先打开 popup，drawer 由显式动作进入 |
| `src/components/PointPreviewDrawer.vue` | 单一详情/编辑表面 | 改成“完整详情与编辑”表面；popup 负责轻量预览，drawer 负责 rich detail / edit |
| `src/stores/map-ui.ts` | pending hit / notice / recognizing | 扩展为 transient destination selection、highlighted boundary、popup anchor、hover/pinned 状态 |
| `src/stores/map-points.ts` | draft/view/edit/persist | 改为接受 canonical destination 创建 draft；保留现有 saved/seed 合并与编辑能力 |
| `src/services/geo-lookup.ts` | 国家/地区识别 + 城市候选增强 | 下沉为 coarse lookup；城市最终命中交给 `destination-lookup`，避免一个文件同时承担粗识别和 UI 语义 |
| `src/types/geo.ts` | 国家/城市识别结果类型 | 增加 destination/boundary 引用字段，区分 coarse result 与 canonical destination selection |
| `src/types/map-point.ts` | 点位核心字段 | 增加 `destinationId`、`destinationKind`、`boundaryId`，但不存 geometry |
| `src/services/point-storage.ts` | `version: 1` 快照 | 升级到 `version: 2`，提供从 v1 到 v2 的迁移与 lazy enrichment |
| `src/App.vue` | stage + drawer 外壳 | 增加 popup 宿主、视觉皮肤容器 class、不同 surface 的层级协调 |

## Data Assets And Contracts

### Required New Assets

| Asset | Minimum Fields | Notes |
|------|----------------|------|
| 城市索引 | `destinationId`, `name`, `countryCode`, `regionName`, `bbox`, `centroid`, `labelAnchor`, `geometryShard` | 作为命中、展示、popup 锚点的统一入口 |
| 城市边界分片 | `boundaryId`, `destinationId`, `polygon/multipolygon`, `bbox` | 仅选中/hover 时按需加载，不跟点位数据耦合 |
| 视觉主题 token | 颜色、字体、阴影、插画层 token | 视觉重构应落在 theme/token 层，不污染 geo/store 逻辑 |

### Type Changes

推荐引入两层语义，而不是继续复用 `DraftMapPoint` 承载一切：

1. `CoarseGeoResult`
   - 国家/地区命中结果
   - 用于边界容错和 fallback
2. `DestinationSelection`
   - canonical 选择结果
   - 至少包含：
   - `destinationId`
   - `destinationKind: 'city' | 'region' | 'country'`
   - `boundaryId: string | null`
   - `name`
   - `countryName`
   - `countryCode`
   - `regionName`
   - `lat/lng`
   - `x/y`
   - `precision`
   - `fallbackNotice`
   - `popupAnchor`

`MapPointDisplay` / `PersistedMapPoint` 建议新增：

- `destinationId: string | null`
- `destinationKind: 'city' | 'region' | 'country'`
- `boundaryId: string | null`

这样 v2 的点位仍保持 v1 的 `lat/lng + x/y` 双坐标，同时能稳定关联到城市边界与 popup 展示语义。

## State Flow Changes

### 1. 城市优先选择流

```text
click map
  -> WorldMapStage 计算 normalized point
  -> geo-lookup 做 coarse country/region hit
  -> destination-lookup 解析 canonical city/region/country
  -> map-ui.setActiveSelection(selection)
  -> CityBoundaryLayer 高亮真实城市边界
  -> MapSelectionPopup 展示轻量详情
  -> 用户点击“新建地点”后
  -> map-points.startDraftFromSelection(selection)
  -> PointPreviewDrawer 打开到 detected-preview / edit
```

与 v1 的关键变化：点击地图不再立刻制造 `draftPoint`。先有 `selection`，再由显式动作创建 draft，才能让 popup、边界高亮和后续 drawer 不互相打架。

### 2. 已有点位选择流

```text
click marker
  -> map-points.selectPointById(id)
  -> map-ui.pinPopupToPoint(point)
  -> popup 展示摘要
  -> 用户点击“查看详情/编辑”
  -> drawer 进入 view/edit
```

不要把 marker 的 hover/popup 状态塞进 `map-points`。`map-points` 只需要知道哪个点位是 active；popup 是否显示、显示在哪里，应由 `map-ui` 控制。

### 3. 抽屉与 popup 协调

- popup 是轻量 surface：摘要、状态、CTA。
- drawer 是重量 surface：长文本、编辑、删除、富内容扩展入口。
- 任何进入 `drawerMode === 'edit'` 的动作，都应自动关闭 popup pinned 状态，避免两个表面同时争夺焦点。

## Rendering Layers

推荐 `WorldMapStage` 内部图层顺序：

1. `BaseMapLayer`
   - 现有世界地图底图
2. `DecorLayer`
   - 二次元可爱主题的云朵、星屑、框饰、氛围图形
   - 必须 `pointer-events: none`
3. `CityBoundaryLayer`
   - 当前 hover/selected destination 的边界填充与描边
4. `PendingInteractionLayer`
   - 识别中的 ring、命中反馈、anchor debug
5. `MarkerLayer`
   - seed/saved/draft markers
6. `PopupLayer`
   - 浮层详情；允许 pointer events
7. `Drawer / global notices`
   - 继续由 `App.vue` 级别宿主承载

关键约束：

- 城市边界高亮必须和 marker 分层，不能把 polygon 渲染塞进 marker 组件。
- 视觉重设计的 decorative elements 必须位于交互层下方，否则会破坏命中区域。
- popup 锚点优先使用 `selection.popupAnchor` / `labelAnchor`，不要直接用 polygon 几何中心，避免海岸线城市弹层漂到水面上。

## UI Surface Contract

| Surface | Purpose | Source Of Truth |
|--------|---------|-----------------|
| `MapSelectionPopup` | 轻量预览、快速 CTA、桌面 hover/tap 反馈 | `map-ui.activeSelection` 或 `map-ui.popupPointId` |
| `PointPreviewDrawer` | 完整详情、编辑、删除、未来富内容扩展 | `map-points.activePoint` + `drawerMode` |
| 顶部 notice | 错误、fallback、识别提示 | `map-ui.interactionNotice` |

推荐交互规则：

- 桌面端 hover 可以预览 popup，但只有 click/tap 后才 pin。
- 移动端不依赖 hover；tap 直接 pin popup，再由 CTA 进入 drawer。
- drawer 打开时，地图仍保持 boundary/marker 选中态，避免用户失去空间上下文。

## Persistence And Migration

### Storage

- `POINT_STORAGE_KEY` 应升级为 `trip-map:point-state:v2`
- 快照版本升级为 `version: 2`
- 新增字段只存引用：
  - `destinationId`
  - `destinationKind`
  - `boundaryId`

### Migration Strategy

1. 读取到 v1 快照时先迁移结构，不阻塞启动。
2. 旧点位通过 `lat/lng` 做 lazy enrichment：
   - 命中城市边界则补 `destinationId/boundaryId`
   - 否则保留 `null`，继续按 v1 坐标展示
3. 迁移失败不能丢点，只能降级为“无 boundary 引用的旧点位”

这能保证 v2 上线时不破坏已有 `seed + localStorage overlay` 数据。

## Integration Risks

| Risk | Why It Matters | Mitigation |
|------|----------------|-----------|
| 城市边界数据过大 | 首屏慢、交互卡顿、移动端内存升高 | 几何简化、bbox index、按 shard 动态加载 |
| 城市边界与现有投影不对齐 | 高亮轮廓和 marker 不重合，可信度直接下降 | 统一投影契约；对 seed 城市做 golden-point 对齐测试 |
| popup 与 drawer 双状态冲突 | 容易出现一个显示旧 selection、一个显示新 activePoint | popup 状态留在 `map-ui`，进入 drawer 时显式同步/关闭 |
| 识别即建 draft 的旧流程残留 | 会导致点击城市后同时出现 draft、popup、boundary 三套状态 | 先落 selection 模型，再改 draft 入口 |
| 视觉重构侵入命中层 | 漂亮但不可点，回归 UX-01 类问题 | decorative layer 全部 `pointer-events: none`，交互热区保留独立层 |

## Recommended Build Order

1. **Destination schema + storage migration**
   - 先定义 `DestinationSelection` / 点位新增字段 / v2 存储迁移
   - 这是后续 geo、popup、drawer 的公共契约
2. **城市边界资产管线**
   - 准备 `city-destinations.index` 与 boundary shards
   - 没有 canonical city 数据，后面的“城市优先”都只能停留在文案层
3. **`destination-lookup` 服务改造**
   - 把现有 coarse lookup 和最终 destination 解析拆开
   - 保证点击地图时能稳定产出 selection，而不是直接 draft
4. **`map-ui` 扩展 + `CityBoundaryLayer`**
   - 先让地图能高亮真实边界，再做 popup
   - 这样可以尽早验证 geo 数据与投影一致性
5. **`MapSelectionPopup` + marker selection 协调**
   - 把新轻量 surface 接入地图和 marker
   - 明确 popup 与 drawer 的升级路径
6. **`map-points` draft 创建入口调整**
   - 将“创建点位”改为从 selection 显式进入
   - 收敛 v1 直接建 draft 的旧逻辑
7. **drawer 重构与视觉主题替换**
   - 最后做 UI 表面统一和二次元可爱皮肤
   - 此时 geo、selection、popup 已稳定，视觉改动不会遮盖核心问题

## Sources

- [PROJECT.md](/Users/huangjingping/i/trip-map/.planning/PROJECT.md)
- [STATE.md](/Users/huangjingping/i/trip-map/.planning/STATE.md)
- [v1.0-REQUIREMENTS.md](/Users/huangjingping/i/trip-map/.planning/milestones/v1.0-REQUIREMENTS.md)
- [App.vue](/Users/huangjingping/i/trip-map/src/App.vue)
- [WorldMapStage.vue](/Users/huangjingping/i/trip-map/src/components/WorldMapStage.vue)
- [SeedMarkerLayer.vue](/Users/huangjingping/i/trip-map/src/components/SeedMarkerLayer.vue)
- [PointPreviewDrawer.vue](/Users/huangjingping/i/trip-map/src/components/PointPreviewDrawer.vue)
- [map-points.ts](/Users/huangjingping/i/trip-map/src/stores/map-points.ts)
- [map-ui.ts](/Users/huangjingping/i/trip-map/src/stores/map-ui.ts)
- [geo-lookup.ts](/Users/huangjingping/i/trip-map/src/services/geo-lookup.ts)
- [point-storage.ts](/Users/huangjingping/i/trip-map/src/services/point-storage.ts)
