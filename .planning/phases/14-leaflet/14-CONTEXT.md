# Phase 14: Leaflet 地图主链路迁移 - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 14 负责把当前基于 SVG + d3-geo 的世界地图渲染替换为 Leaflet 瓦片地图，并在 Leaflet 中恢复用户点击→canonical resolve→popup 摘要→drawer 深度查看→行政区边界高亮的连续主链路。同时将 Phase 13 交付的版本化几何资产通过 Leaflet GeoJSON 图层呈现为中国市级与海外一级行政区两个独立图层。

本阶段不交付：记录 CRUD API、点亮/取消点亮 mutation、旧 localStorage 数据迁移（Phase 15）；也不交付新的几何数据源或 manifest 变更（Phase 13 已固化）。

</domain>

<decisions>
## Implementation Decisions

### 底图与瓦片
- **D-01:** 底图使用 **Bing Maps** 瓦片服务，支持中英双语地名显示。
- **D-02:** API key 通过环境变量配置，具体集成方式由 Claude 判断。
- **D-03:** 地图初始视图以**中国为中心**展示，符合主要用户群体习惯。
- **D-04:** 缩放级别设置**最小/最大范围限制**，避免缩得太小看不到行政区边界或放得太大底图无意义。具体缩放范围由 Claude 判断。
- **D-05:** 底图视觉风格偏**淡雅简洁**，让行政区高亮和点亮状态更突出，与现有可爱风 UI 协调。

### 图层加载策略
- **D-06:** 中国市级与海外 admin-1 两个 GeoJSON 图层采用**按需加载**策略，复用 Phase 13 的 shard loader + 缓存机制。
- **D-07:** 但**已点亮地点对应的分片优先预加载**，确保已点亮边界在地图启动时即可见。这是"按需 + 已点亮预加载"的混合策略。
- **D-08:** 已点亮地点的边界在地图上**始终可见**，无论缩放级别。
- **D-09:** 加载反馈（loading 状态、失败重试等细节）由 Claude 判断。

### 点击→识别→popup 链路
- **D-10:** 用户**点击瓦片底图**触发识别，Leaflet 提供经纬度坐标后调用 server canonical resolve API。与现有链路一致，只是坐标来源从 d3 反投影变为 Leaflet 原生事件。
- **D-11:** 点击识别过程中，先在点击位置显示**临时标记 + loading 状态**，识别完成后替换为 popup。
- **D-12:** 点击已点亮行政区边界时，**直接打开对应记录的 popup**，跳过 server resolve，响应更快。

### 高亮与 popup 锚定
- **D-13:** 边界高亮使用 **Leaflet 原生 GeoJSON layer style**，通过 style 函数区分已点亮/当前选中/未记录三种状态。
- **D-14:** popup 锚定**继续使用 @floating-ui**，保留现有可爱风自定义样式的自由度。锚点从 SVG 元素改为 Leaflet 坐标点转换的屏幕位置。
- **D-15:** 高亮状态维持**三态区分**：已点亮（填充色）、当前选中（边框突出 + 填充）、未记录（无样式）——延续 v2.0 的状态辨识体系。
- **D-16:** popup 视觉风格保留可爱风主视觉，但允许**小幅调整尺寸、位置或动画**以适配 Leaflet 的交互特性（如地图拖动时的跟随同步）。

### Claude's Discretion
- Bing Maps API key 的具体集成方式（Leaflet 插件选型、加载方式）
- 缩放级别的具体数值范围
- 底图淡雅风格的具体实现（是否使用 Bing Maps 的 Light 主题或 CSS 滤镜处理）
- 图层加载时的 loading 状态指示器、加载失败重试策略
- popup 在地图拖动/缩放时与 @floating-ui 的同步策略
- 候选确认在 Leaflet 中的具体交互形式（延续现有 popup 内候选列表）
- 识别失败时的视觉反馈形式
- 高亮状态三态的具体配色方案（需与可爱风 UI 协调）
- 临时标记的视觉设计

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone scope and phase requirements
- `.planning/ROADMAP.md` — Phase 14 的目标、依赖、requirements 映射（GEOX-05, MAP-04, MAP-05, MAP-06, MAP-08, UIX-01）与成功标准
- `.planning/REQUIREMENTS.md` — `GEOX-05`（Leaflet 双图层不预合并）、`MAP-04`（Leaflet 主引擎）、`MAP-05`（双图层统一体验）、`MAP-06`（GeoJSON 边界高亮）、`MAP-08`（无残留高亮/双重选中）、`UIX-01`（popup + drawer 双层表面不退化）
- `.planning/PROJECT.md` — v3.0 全局约束：不引入复杂基础设施、地图切换到 Leaflet、几何用版本化静态资产交付

### Prior phase contracts that carry forward
- `.planning/phases/13-行政区数据与几何交付/13-CONTEXT.md` — 几何资产分片交付、manifest + shard loader、boundaryId→geometry 映射、坐标标准
- `.planning/phases/12-canonical/12-CONTEXT.md` — canonical resolve 权威来源、候选确认链路、跨表面语义展示合同、严格失败口径
- `.planning/phases/08-城市边界高亮语义/08-CONTEXT.md` — boundaryId 作为边界锚点、多面域整体高亮、边界不退化为 marker
- `.planning/phases/09-popup/09-CONTEXT.md` — popup/drawer 双层表面职责边界
- `.planning/phases/10-可爱风格与可读性收口/10-CONTEXT.md` — 可爱风视觉合同与状态辨识体系

### Geometry and data pipeline
- `apps/web/src/services/geometry-loader.ts` — Phase 13 shard loader 实现，Phase 14 直接复用
- `apps/web/src/services/geometry-manifest.ts` — manifest 解析服务
- `packages/contracts/src/place.ts` — CanonicalPlaceSummary、GeometryRef 等共享契约

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/services/geometry-loader.ts`: Phase 13 shard loader，按 `geometryDatasetVersion:assetKey` 缓存，可直接在 Leaflet 图层加载时复用
- `apps/web/src/services/geometry-manifest.ts`: manifest 解析服务，提供 boundaryId→assetKey 映射
- `apps/web/src/composables/usePopupAnchoring.ts`: @floating-ui 锚定逻辑，需适配从 SVG 元素锚点改为 Leaflet 坐标转屏幕点
- `apps/web/src/components/map-popup/MapContextPopup.vue` + `PointSummaryCard.vue`: popup UI 组件，可复用视觉部分
- `apps/web/src/components/PointPreviewDrawer.vue`: drawer 组件，不需要大改，只需确保与 Leaflet 地图共存
- `apps/web/src/stores/map-points.ts`: 状态管理，包含 `savedBoundaryIds`、`selectedBoundaryId`、`summarySurfaceState` 等
- `apps/web/src/services/api/canonical-places.ts`: canonical resolve API 客户端
- `packages/contracts/src/place.ts`: `CanonicalPlaceSummary`、`GeometryRef` 共享类型

### Established Patterns
- 当前地图使用 SVG + d3-geo 投影（`worldMapUrl` 静态 SVG + `map-projection.ts` 的投影函数），需要完全替换为 Leaflet
- popup 通过 @floating-ui 锚定到 SVG 元素或虚拟坐标点，迁移后需改为 Leaflet 坐标→屏幕坐标的转换
- 高亮通过 SVG `<path>` 渲染 normalized boundary，迁移后改为 Leaflet GeoJSON layer
- 状态管理已收口在 Pinia store，Leaflet 迁移不需要改变 store 接口，只改变渲染消费方式

### Integration Points
- `apps/web/src/components/WorldMapStage.vue` 是主要重构目标，从 SVG 地图替换为 Leaflet 地图容器
- `apps/web/src/services/map-projection.ts` 中的 d3-geo 投影逻辑将被 Leaflet 原生坐标系替代
- `apps/web/src/types/geo.ts` 中的 `NormalizedPoint`、`NormalizedCityBoundary` 等类型可能需要适配或退场
- `apps/web/src/stores/map-ui.ts` 中的 `pendingGeoHit`、`isRecognizing` 状态继续复用

</code_context>

<specifics>
## Specific Ideas

- 底图使用 Bing Maps 而非 OSM 或高德，因为需要全球覆盖 + 中英双语地名
- 初始视图以中国居中，符合主要用户群体
- 已点亮边界始终可见是硬性要求——需要启动时预加载已点亮地点的分片
- 点击已点亮区域直接打开记录 popup，不重走 resolve 链路，提供更快的响应体验
- popup 继续使用 @floating-ui 而非 Leaflet 原生 popup，保留可爱风自定义样式的自由度
- popup 允许微调以适配 Leaflet 交互（如拖动跟随），但不做大幅视觉重设计

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 14-leaflet*
*Context gathered: 2026-03-31*
