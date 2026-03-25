# Project Research Summary

**Project:** 旅行世界地图 v2.0
**Domain:** 离线旅行地图 SPA 的城市主视角升级
**Researched:** 2026-03-25
**Confidence:** MEDIUM-HIGH

## Milestone Framing

`v2.0` 的本质不是把产品重做成通用地图平台，而是在已交付的离线世界地图上，引入“城市实体”这一层稳定语义：用户优先选择城市，系统用真实城市边界高亮结果，用轻量 popup 承接确认与快捷操作，再保留 drawer 作为完整编辑面。这个 milestone 的成功标准不是功能堆叠，而是让“选城市 -> 看边界 -> 预览详情 -> 保存/编辑”成为可信、顺滑、可回退的主链路，同时用统一的可爱风格重做地图主舞台而不牺牲交互可读性。

## Executive Summary

专家式做法很明确：保留现有 `Vue 3 + Vite + TypeScript + Pinia + SVG/d3-geo` 基线，不切换到 slippy map 或在线地理服务；新增一套离线城市索引和按需加载的城市边界分片，把点击地图后的识别流程拆成“粗识别 -> canonical destination selection -> 用户确认 -> 创建/编辑点位”四步，而不是沿用 v1 的“点击即建 draftPoint”。这样才能同时支撑城市优先选择、真实边界高亮、popup 预览和旧数据兼容。

推荐路线是先解决数据与状态模型，再做 UI。先定义 `destinationId / boundaryId / destinationKind / resolutionConfidence` 这一组新契约，并升级本地存储到 v2，确保旧点位不会被错误强转成城市；随后建设城市索引、边界分包和 lookup 服务，让高亮、保存、popup 标题都由同一个 `DestinationSelection` 驱动；最后再接 popup 与视觉重设计。最大的风险不在组件实现，而在城市数据口径、低置信度降级策略、popup 与 drawer 状态冲突，以及可爱风格压过地图可读性。控制办法是严格限定城市覆盖范围、保留国家/地区兜底、分离 `map-ui` 与 `map-points` 责任、把几何保持为只读静态资产，并在最终阶段补齐迁移、边界命中、键盘流和移动端回退测试。

## Key Findings

### Recommended Scope Split

**Must-have now**
- 城市优先选择入口：点击地图后优先解析城市，支持搜索/候选入口。
- 同名城市消歧与失败回退：低置信度时显式提示，并允许降级到国家/地区。
- 真实城市边界高亮：选中结果必须以真实面域而不是单点 marker 表达。
- 轻量 popup 摘要卡：展示城市名、国家/地区、状态摘要和 1-2 个高频动作。
- popup 到 drawer 接力：复杂编辑继续复用现有 drawer。
- v1 存档迁移与旧点懒增强：不破坏既有 `seed + localStorage` 数据。
- 统一视觉 token：至少覆盖 marker、boundary、popup、drawer、按钮与空状态。

**Good differentiators**
- 最近使用/当前视口快捷城市。
- 宽容命中区与最近城市确认，改善小城市和边界附近点击体验。
- popup 智能定位与移动端 peek/sheet 回退。
- 城市状态视觉语法、轻量 sparkle/halo 动效、角色化空状态与成功反馈。

**Defer**
- 全量全球 POI/乡镇级搜索。
- 在线 geocoding / autocomplete API。
- 地图引擎替换为 `MapLibre GL` / `Leaflet` / `OpenLayers`。
- popup 承担完整编辑表单。
- 统计、成就、bucket list、路线规划、分享、同步、账号。
- 全站无差别重设计和重资产角色系统。

### Stack And Data Recommendations

延续现有 `Vue 3 + Vite + TypeScript + Pinia + d3-geo + SVG overlay`。运行时新增 `@floating-ui/vue` 处理 popup 锚定与碰撞翻转，新增 `kdbush` 与 `geokdbush` 做城市最近邻 shortlist；`topojson-client` 应作为运行时依赖使用；数据构建阶段引入 `mapshaper` 做边界简化、裁剪与分片。

数据层应拆成两层而不是全量前端塞入城市 polygon：全球城市入口索引用 `Natural Earth populated places` 构建轻量 `city-index`，字段只保留 `id / name / aliases / countryCode / centroid / bbox / boundaryId / selectionPriority`；真实城市边界以 OSM `boundary=administrative` 离线抓取为主、geoBoundaries 仅补缺校验，按国家或区域切成 `TopoJSON` shard，通过 manifest 懒加载。不要运行时拼接多套来源，也不要把 polygon 存进业务状态或 `localStorage`。

**Core technologies**
- `@floating-ui/vue`：popup 定位与边缘避让，避免自己维护 anchor 和 flip 逻辑。
- `kdbush` + `geokdbush`：城市候选空间索引，支撑城市优先选择与宽容命中。
- `topojson-client`：运行时解码简化后的城市边界分片，兼顾体积和渲染。
- `mapshaper`：离线数据预处理，控制边界复杂度和包体。

### Architecture Approach

架构上应把 v2 的核心实体从“点击即生成点位”改为“先解析 destination，再决定是否创建点位”。`map-ui` 负责瞬时地图交互状态，包括 `activeSelection`、popup、边界高亮、notice 和 presentation state；`map-points` 继续负责 draft / saved / edit / persist，不承担 hover、锚点或边界几何。`WorldMapStage` 仍是舞台入口，但改为产出 `DestinationSelection`；`destination-lookup` 在 coarse geo hit 之上做城市 canonical 化；`CityBoundaryLayer` 只负责渲染高亮；`MapSelectionPopup` 只做摘要与 CTA；drawer 继续承担完整详情和编辑。

**Major components**
1. `destination-lookup` + 城市数据资产：统一命中、保存、标题与高亮的城市实体定义。
2. `map-ui` + `CityBoundaryLayer` + `MapSelectionPopup`：承接 transient selection、边界高亮和 popup 表现层。
3. `map-points` + `point-storage` v2 迁移：把 canonical destination 安全落到现有点位生命周期中。

### Architecture And Build-Order Guidance

建议按依赖顺序推进，而不是按界面表面推进：

### Phase 1: 数据契约与迁移基线
**Rationale:** 不先定义城市身份和存储升级，后续所有高亮和 popup 都会建立在不稳定数据上。  
**Delivers:** `DestinationSelection`、点位新增字段、`trip-map:point-state:v2`、旧点懒增强策略、失败回退语义。  
**Addresses:** 城市优先选择、已有城市复用、同名消歧、旧数据兼容。  
**Avoids:** 旧点被错误强转成城市、一个城市只能有一个点、同步写入大对象导致卡顿。

### Phase 2: 城市数据管线与命中引擎
**Rationale:** 必须先让“看到的城市”和“保存的城市”是同一个实体，再谈 UI。  
**Delivers:** `city-index`、boundary manifest、按需 shard、`destination-lookup`、真实边界高亮契约。  
**Uses:** `kdbush`、`geokdbush`、`topojson-client`、`mapshaper`。  
**Implements:** coarse geo lookup -> canonical destination -> boundary highlight 流程。  
**Avoids:** 高亮与保存两套城市定义、全量几何进 store、移动端点击退化成必须精准点中 polygon。

### Phase 3: Popup 状态机与地图交互重组
**Rationale:** 新的 popup 不是 tooltip，而是轻量交互表面，必须和 drawer 分责。  
**Delivers:** `MapSelectionPopup`、marker/boundary/map click 事件协调、桌面/移动端展示策略、popup 到 drawer 接力。  
**Addresses:** 轻量摘要卡、高频快捷动作、移动端安全展示。  
**Avoids:** popup 与 drawer 双状态冲突、事件冒泡抢占、弹层被容器裁切或跑出视口。

### Phase 4: 视觉重设计与回归验证
**Rationale:** 视觉应建立在稳定交互之上，否则会掩盖数据与状态问题。  
**Delivers:** 新 design tokens、marker/boundary/popup/drawer 统一皮肤、可爱但可读的状态体系、迁移与交互回归矩阵。  
**Addresses:** 统一视觉语言、状态视觉语法、关键反馈动效。  
**Avoids:** 可爱风压过可读性、装饰层破坏命中、只测新 UI 不测旧存档和边界场景。

### Phase Ordering Rationale

- 先做数据契约，再做几何数据，再做 popup，再做视觉，是因为 v2 的核心风险是“城市实体是否稳定”，不是“界面是否先变漂亮”。
- Phase 2 必须先于 popup，因为 popup 标题、边界高亮、保存入口都依赖统一的 `DestinationSelection`。
- Phase 4 放最后可以把视觉与可访问性回归绑在一起，避免样式提前污染命中层和状态机。

### Research Flags

需要在规划时做更深研究的阶段：
- **Phase 2：** 城市边界数据白名单、国家级 `admin_level` 映射、分片粒度和覆盖范围需要专项确认，这是最不稳定的外部依赖。
- **Phase 4：** 如果要做“原创二次元美少女可爱风”资产生产，需要先收敛视觉方向与性能预算，否则容易拖慢交付。

标准模式较多、通常可直接规划执行的阶段：
- **Phase 1：** 类型扩展、schema 迁移、lazy enrichment 是成熟的本地前端演进模式。
- **Phase 3：** 使用 `@floating-ui/vue`、`Teleport` 和显式状态分层处理 popup/drawer 协调，模式明确。

## Biggest Risks And Controls

1. **城市数据口径不统一**：不同国家的 `admin_level` 不能自动等价为“用户认知里的城市”。  
控制：限定支持城市白名单；一套主数据源为主、一套补缺源为辅；离线预处理时统一 `destinationId` 与命名。

2. **低置信度城市命中破坏可信度**：城市优先后如果取消国家/地区兜底，会让体验比 v1 更差。  
控制：定义 `city-confirmed / city-approximate / country-fallback` 精度层级；对低置信度显式提示，不静默误命中。

3. **popup、drawer、marker、boundary 状态互相打架**：继续沿用 v1 的 point-first 状态会产生残影和错误展示。  
控制：`selection`、`overlayPresentation`、`draft/edit` 分层；进入 drawer 编辑时显式关闭 popup pinned 状态。

4. **几何体积与主线程性能问题**：城市 polygon 数量级远高于 v1。  
控制：离线简化、bbox/spatial index、按国家分 shard、store 只存 id 和样式状态，不存 geometry。

5. **视觉重设计牺牲地图可读性**：可爱风容易把状态表达做成弱对比装饰。  
控制：先定义状态色、最小热区、字号、动效预算，再叠加贴纸、星屑和装饰层；装饰层统一 `pointer-events: none`。

## Recommendation

把 v2.0 当成一次“城市实体化”升级，而不是一次 UI 改版。规划时优先把 requirement 和 phase 写成以下主线：先定义 destination 契约和旧数据兼容，再落城市索引与边界资产，再接 popup 与状态机，最后统一视觉与验收。需求文档里应明确两条底线：一是任何时候都不能因为城市能力不足而比 v1 更难保存地点；二是高亮、popup、保存结果必须始终指向同一个城市实体。只要守住这两条，剩余差异化能力都可以按时间预算追加。

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | 新增库与数据构建工具选择清晰，和现有代码基线兼容性高。 |
| Features | MEDIUM | 城市优先、popup、边界高亮的共识强，但“原创可爱风”的具体表达仍依赖产品判断。 |
| Architecture | HIGH | 与现有仓库结构匹配度高，状态分层和 build order 已形成稳定结论。 |
| Pitfalls | HIGH | 风险点具体且与现有代码约束直接对应，可转化为 phase guardrails。 |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- 城市覆盖范围仍需在规划时明确：建议先做重点国家/城市白名单，而不是承诺全球全自动准确。
- OSM 与 geoBoundaries 的映射规则仍需通过小样本数据验证，尤其是飞地、岛屿、港澳和多 polygon 城市。
- 视觉方向需要在 Phase 4 前确认资产规模与性能预算，否则“原创风格”会无限膨胀。

## Sources

### Primary
- `.planning/research/STACK.md`
- `.planning/research/FEATURES.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/PITFALLS.md`
- `.planning/PROJECT.md`

### Supporting official references
- Floating UI Vue docs
- OpenStreetMap `admin_level` docs
- geoBoundaries API/docs
- Natural Earth populated places
- Vue Teleport guide
- RFC 7946 GeoJSON

---
*Research completed: 2026-03-25*
*Ready for roadmap: yes*
