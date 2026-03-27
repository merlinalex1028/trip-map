# Phase 10: 可爱风格与可读性收口 - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段只负责把 v2.0 已经落定的城市选择、城市边界高亮和 popup 主舞台交互，统一收口为“原创可爱风 + 可读性不退步”的最终视觉系统。交付重点是：地图舞台、城市边界、marker、popup、详情表面和主要按钮形成一致的原创可爱风语言，同时继续保证当前桌面 anchored popup + deep drawer 主链路内的状态辨识、命中安全和交互可靠性。

本阶段不重做城市选择链路、边界语义、popup 信息结构，也不扩展为完整角色系统、全站无边界大改版、新的地图交互模型，或重新引入已移除的移动端 `peek` / 兼容壳层；这些都超出当前 phase 边界。

</domain>

<decisions>
## Implementation Decisions

### 视觉母题与整体气质
- **D-01:** Phase 10 的“可爱风”主方向锁定为“轻旅行手账 + 少女感细节”，而不是强 IP 角色绑定，也不是明确的陪伴角色系统。
- **D-02:** 整体视觉配色偏暖粉、淡蓝的柔和彩度组合，形成更轻盈的原创可爱气质，而不是继续沿用当前偏复古牛皮纸/土棕色作为主色。
- **D-03:** 标题区、卡片壳子、按钮、marker 和边界都需要带出更明确的二次元可爱语言，但仍保持“旅行地图产品”而不是“角色页”或“游戏主菜单”的产品感。
- **D-14:** 项目内用户可见表面默认优先使用圆角语言，包括卡片、popup、drawer、按钮、输入框和 marker 标签；只有在确有语义需要时才保留尖角或更硬的几何边。

### 地图舞台改造力度
- **D-04:** 世界地图底图采用“中度可爱化”方案：允许更柔和的海洋/陆地色彩、轻纹理和更统一的氛围处理，但不做会影响识别语义的重卡通化重绘。
- **D-05:** 可爱风的主要发力点优先放在地图边框、边界高亮、marker、popup、详情表面、按钮和标题氛围，而不是把全部风格压力压在底图本体上。
- **D-06:** 底图本体不采用会干扰地理识别与地图阅读的大面积贴纸覆盖、强装饰遮罩或高对比角色元素；大陆/海洋可做轻纹理与柔和渐层，但必须继续服务地图主链路。

### 状态辨识合同
- **D-07:** 状态辨识采用“颜色 + 轮廓/描边 + 纹理/徽章语义”共同拉开的方案，不只依赖单一配色变化。
- **D-08:** 关键状态的主配色映射锁定为：当前选中 = 暖粉主高亮；已记录 = 淡蓝或蓝绿色次高亮；低置信回退 = 更浅、更冷的蓝灰提示态；未记录 = 中性浅底。
- **D-09:** popup、drawer、marker、边界和主要按钮中的状态表达必须共享同一套语义映射，不能出现“地图上是一个状态、卡片上像另一个状态”的风格漂移。
- **D-10:** 即使加入贴纸感、纹理、边框装饰或更强视觉语言，当前桌面 anchored popup + deep drawer 主链路中也仍要一眼区分“未记录 / 已记录 / 当前选中 / 低置信回退”这四类关键状态。

### 装饰与动效预算
- **D-11:** Phase 10 允许“明显装饰化”的可爱风表达，但装饰和动效的主要落点集中在边框、边界、marker、popup、按钮和标题氛围，不把大面积连续装饰直接压到地图命中层上。
- **D-12:** 动效可以比当前更积极，允许更明显的呼吸、漂浮、闪烁、贴纸感反馈或进出场氛围，但必须优先服从 `VIS-03`：不遮挡点击命中区，不破坏 popup / marker / 地图交互。
- **D-13:** 地图底图本体的装饰强度低于表层 UI；底图只做柔和彩色和轻纹理，不做会与边界高亮、marker 命中、popup 锚点竞争注意力的大装饰覆盖。

### the agent's Discretion
- 在暖粉与淡蓝主方向内，具体补充哪些奶油中性色、珊瑚色或蓝绿色作为辅助 token
- 贴纸感、闪光感、缎带感、手账边框感分别在标题、popup、按钮、边界和 marker 上的具体分配比例
- 各状态在不同组件上的纹理、描边、阴影、玻璃感或纸感实现方式，只要不破坏统一语义
- 动效的精确时长、easing 和触发时机，只要不制造遮挡、残影或点击干扰

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and milestone constraints
- `.planning/ROADMAP.md` — Phase 10 的目标、依赖、requirements 映射与成功标准
- `.planning/REQUIREMENTS.md` — `VIS-01`、`VIS-02`、`VIS-03` 的正式 requirement 约束
- `.planning/PROJECT.md` — v2.0 的里程碑范围、原创可爱风要求、离线地图与主舞台优先原则
- `.planning/STATE.md` — 当前 milestone 位置，以及“可爱风重构必须带着可读性/交互可靠性一起交付”的阶段共识

### Prior phase decisions that still constrain Phase 10
- `.planning/phases/07-城市选择与兼容基线/07-CONTEXT.md` — 城市优先、回退提示、同城复用和旧数据兼容的前置语义，说明视觉重构不能改坏选择链路
- `.planning/phases/08-城市边界高亮语义/08-CONTEXT.md` — 已保存/当前选中/回退的边界语义与状态归位规则，约束本阶段的视觉状态合同
- `.planning/phases/09-popup/09-CONTEXT.md` — popup 仍是轻量摘要主入口、drawer 继续承接深层查看/编辑的交互边界
- `.planning/phases/09-popup/09-UI-SPEC.md` — Phase 9 已锁定的间距、触控尺寸、popup/peek 布局与 copy 合同，是 Phase 10 视觉升级的结构基线

### Product and implementation background
- `PRD.md` §5.3、§7-10 — 地图主舞台、地点详情职责、固定投影底图与旅行地图产品基调的背景约束

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/styles/tokens.css`: 已有全局 spacing / typography / color token，是 Phase 10 建立新视觉系统的主入口
- `src/styles/global.css`: 已集中定义全局背景、字体和基础排版，可承接页面级氛围和全局基底升级
- `src/components/WorldMapStage.vue`: 已统一承载底图、边界 overlay、pending marker、popup / peek / drawer 的层次，是地图舞台视觉重构的核心接入点
- `src/components/SeedMarkerLayer.vue`: 已经区分 saved / selected / draft / dimmed 等状态，是 marker 新语义和装饰反馈的现成基础
- `src/components/map-popup/PointSummaryCard.vue`: 已复用候选确认、识别结果和查看态摘要内容，是 popup / peek 统一视觉语言的最佳收口点
- `src/components/map-popup/MapContextPopup.vue`: 当前桌面 anchored popup 的主壳层，是摘要表面视觉收口的直接入口
- `src/components/PointPreviewDrawer.vue`: 已承接深层查看与编辑表面，是与 popup 形成“同语言不同密度”的关键表面
- `src/components/PosterTitleBlock.vue`: 当前标题区仍偏海报式中性表达，是引入“旅行手账 + 少女感细节”风格信号的直接切入点

### Established Patterns
- 当前代码库以手写 CSS + 全局 token 为主，没有外部设计系统或 UI 库依赖，说明视觉系统升级应继续走 token 驱动与组件局部样式收口
- 当前代码已收口到 desktop anchored popup 作为轻量摘要主入口、drawer 负责深层内容，说明 Phase 10 只能升级表面风格，不能打乱信息架构
- 地图边界、marker、pending 命中和 popup 锚点都已经在 `WorldMapStage.vue` 汇合，说明装饰和动效必须严格服从现有层次与点击安全边界
- 组件普遍保持 `44px` 触控安全尺寸、可见 focus ring 和轻量 notice 语义，说明新风格必须兼容现有可访问性与移动端可点性基线

### Integration Points
- `src/styles/tokens.css` 与 `src/styles/global.css` 需要升级为新的暖粉 + 淡蓝主视觉 token、背景、字体层级与阴影体系
- `src/components/WorldMapStage.vue` 需要同时收口底图氛围、边界高亮、pending marker 和地图外框的统一可爱风语义
- `src/components/SeedMarkerLayer.vue` 需要把 selected / saved / draft / dimmed 状态映射到新的颜色、纹理、描边和动效合同
- `src/components/map-popup/PointSummaryCard.vue`、`src/components/map-popup/MapContextPopup.vue` 需要统一成更明确的可爱风摘要表面，同时保留结构和可读性
- `src/components/PointPreviewDrawer.vue` 需要和 popup 共享视觉系统，但保持“更深层、更稳重”的编辑表面层级
- `src/components/PosterTitleBlock.vue` 需要把页面标题从现有复古海报感过渡到“旅行手账 + 少女感细节”的氛围入口

</code_context>

<specifics>
## Specific Ideas

- 整体方向更接近“轻旅行手账 + 少女感细节”，而不是强角色化陪伴系统
- 主色倾向锁定为暖粉、淡蓝这组更轻盈的原创可爱色，而不是继续以复古土棕为主导
- 项目内用户可见表面默认优先使用圆角，避免不同组件混用圆角和硬折角造成风格断裂
- Phase 10 以后按当前桌面 anchored popup + deep drawer 主链路规划，不重新拉回 `MobilePeekSheet` 或移动端兼容壳层
- 当前选中建议用暖粉主高亮；已记录建议用淡蓝/蓝绿次高亮；低置信回退建议用更冷更浅的蓝灰提示；未记录维持中性浅底
- 地图底图可以做中度可爱化，但主要通过柔和配色和轻纹理完成，不通过大贴纸或大面积覆盖性装饰来制造风格
- 强装饰和明显动效可以存在，但应更集中在边框、边界、marker、popup、按钮和标题，而不是直接覆盖命中区域

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-可爱风格与可读性收口*
*Context gathered: 2026-03-27*
