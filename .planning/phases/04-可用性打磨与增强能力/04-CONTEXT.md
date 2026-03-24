# Phase 4: 可用性打磨与增强能力 - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段只负责在 Phase 3 已完成的国家/地区识别与点位闭环基础上，补齐可访问性、焦点与关闭语义、长文本与异常降级韧性、边界点击显示稳定性，以及城市级增强入口。Phase 4 可以提升结果表达和降级体验，但不能破坏既有国家/地区级创建主链路，也不扩展到新的内容类型、账户体系、在线服务或真正完整的城市级精确识别产品。

</domain>

<decisions>
## Implementation Decisions

### 点位层级与地图反馈
- 普通已保存点位提升到中等亮度，平时就能被清楚看见，但仍保持地图主视觉优先。
- 当前选中点位主要通过更强发光与外圈描边拉开，不依赖换整套强调色。
- 草稿点位保持更暖、更活的临时态表达，并持续带轻微呼吸/脉冲，明确“尚未保存”。
- 某个点位被选中后，其他点位略微退后一步，帮助用户聚焦当前对象。
- 键盘聚焦到点位时，视觉表现接近悬停态，但额外给明确焦点框；不把 focus 直接做成 selected。
- 点位标签默认不常驻，只在悬停、聚焦或选中时出现；Phase 4 中 `seed` 与用户点位视觉基本统一，来源差异主要放到抽屉里表达。

### 抽屉关闭、焦点与移动端交互
- 抽屉打开时，焦点先落到标题或抽屉容器本身，先建立“进入面板”的语义。
- 抽屉打开后启用焦点限制，`Tab` 先留在抽屉内部直到关闭。
- `Esc` 的关闭策略保持分层：没有未保存更改时直接关闭，有未保存更改时才确认。
- 地图点位的键盘触发只要求 `Enter`，不强制把 `Space` 也纳入主交互。
- 抽屉关闭按钮需要比当前更明显，不能只是低存在感文字按钮。
- 移动端查看态与编辑态高度整体保持稳定，不通过大幅高度切换制造模式差异。
- 移动端编辑态的保存/取消操作固定在底部，保证操作随时可达。
- 移动端键盘弹出时优先保证当前输入框可见；保存按钮可通过滚动到达，不强制全屏化抽屉。

### 边界点击、异常与长文本韧性
- 无效点击提示区分两类：海洋/无效陆地区域，与边界不确定区域；两类提示语气允许不同。
- 边界不确定时，文案可以比当前更解释型，但仍不暴露过多技术细节。
- 识别模块加载失败时继续使用顶部提示，不锁定地图，不禁用继续尝试。
- 本地存档异常延续顶部提示方案，不再额外给地图主舞台叠加重型异常态。
- 长简介不允许撑坏抽屉；顶部关键信息与底部操作保持稳定，只让简介内容区自身滚动。
- 移动端查看态遇到长简介时，先展示一部分，再通过独立滚动区继续查看。
- 地图容器边缘点击时允许点位贴边显示，不因为视觉压线就判无效；真实地理结果仍按点击语义保留。

### 城市级增强入口与降级语义
- 城市级增强默认对用户无感，系统在后台静默尝试，不额外打断国家/地区级主流程。
- 当城市级高置信命中时，抽屉标题使用城市名，副标题显示国家/地区，并额外附上可信度说明。
- 当城市级只是“可能位置”时，只做轻提示，提示内容紧贴城市结果本身，不做 warning 级强调。
- 城市级高置信结果一旦命中，应与点位一起持久化，为后续更精细识别升级铺路。
- 如果城市级未命中但国家/地区级命中，系统需要明确说明“未识别到更精确城市，已回退到国家/地区”，且不影响保存。
- 如果城市级结果与点击直觉略有偏差，但国家/地区级是正确的，允许展示为“可能位置”，而不是完全丢弃。
- 这一阶段的城市级增强整体产品感觉偏“让用户知道产品正在往更精细识别升级”，但不引入明显半成品入口。

### 无障碍读屏语义
- 识别中的瞬时状态不主动播报“正在识别位置”，避免读屏噪音。
- 城市级未命中并回退到国家/地区级时，需要给读屏用户明确播报回退结果。
- 草稿点位需要带“未保存地点”这一类明确状态语义。
- 地图点位的 `aria-label` 保持偏完整，包含名称、国家/地区、坐标等核心信息，而不是只读一个名字。

### Claude's Discretion
- 点位降亮、发光、焦点框与轻微脉冲的具体视觉参数与动画节奏。
- 边界点击的具体文案拆分逻辑与不同提示之间的切换阈值。
- 移动端抽屉中“预览一部分 + 独立滚动区”的具体排版实现方式。
- 城市级可信度说明的措辞、图标样式与在抽屉中的精确位置。
- 读屏文案是否通过 `aria-live`、描述文本或状态标签组合实现。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Scope
- `PRD.md` — 产品目标、真实点位判断要求、阶段补充说明与城市级增强背景
- `.planning/PROJECT.md` — 项目核心价值、双坐标保存约束、离线识别边界与全局非目标
- `.planning/REQUIREMENTS.md` — Phase 4 直接对应的 `GEO-04`、`PNT-04`、`DRW-04`、`DAT-04`、`UX-01`、`UX-02`、`UX-03`
- `.planning/ROADMAP.md` — Phase 4 的目标、成功标准与 04-01 / 04-02 计划边界

### Prior Decisions
- `.planning/phases/01-地图基础与应用骨架/01-CONTEXT.md` — 地图主视觉优先、海报风基调、桌面右抽屉 / 移动端底抽屉基线
- `.planning/phases/02-国家级真实地点识别/02-CONTEXT.md` — 边界点击保持保守、地区展示口径、失败提示的克制风格
- `.planning/phases/03-点位闭环与本地持久化/03-CONTEXT.md` — 草稿/查看/编辑语义、显式存档异常提示、Phase 4 的 deferred items
- `.planning/phases/03-点位闭环与本地持久化/03-UAT.md` — 最近用户验收中暴露并已修复的点位偏移问题，提示 Phase 4 继续重视点击与渲染一致性

### Current Implementation Baseline
- `src/components/WorldMapStage.vue` — 当前地图点击、边界提示、识别反馈与落点流程的主入口
- `src/components/SeedMarkerLayer.vue` — 当前点位按钮、选中态、标签与焦点样式基线
- `src/components/PointPreviewDrawer.vue` — 当前抽屉模式、关闭语义、编辑表单与长文本承载位置
- `src/stores/map-points.ts` — 当前点位来源、抽屉状态、草稿与持久化语义的单一事实源
- `src/stores/map-ui.ts` — 当前识别中状态与页面顶部提示状态入口

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/SeedMarkerLayer.vue`: 已有点位渲染、选中态、标签与键盘 focus 样式，是 Phase 4 强化点位层级与可访问性的首要入口。
- `src/components/PointPreviewDrawer.vue`: 已有 `detected-preview / view / edit` 三态、`Esc` 关闭和确认语义，适合继续补焦点管理、移动端操作区与长文本滚动韧性。
- `src/components/WorldMapStage.vue`: 已有点击识别、边界提示、识别加载失败提示与 pending marker，可继续接城市级增强、边缘点击提示和读屏状态。
- `src/stores/map-points.ts`: 已统一维护 `draft / saved / seed / deletedSeedIds / drawerMode / storageHealth`，适合作为城市级附加字段与未保存语义的状态落点。
- `src/services/geo-lookup.ts`: 当前国家/地区级识别和低置信边界判定都集中在这里，是加城市级尝试与回退口径的自然服务层。
- `src/services/point-storage.ts`: 已有版本化快照和损坏回退入口，可继续扩展到城市级结果持久化与异常兼容。
- `src/components/*.spec.ts` 与 `src/App.spec.ts`: 已覆盖抽屉、地图点击和存储异常路径，是 Phase 4 补可用性回归的重要测试骨架。

### Established Patterns
- 当前项目使用 Vue 3 Composition API + `<script setup>` + Pinia setup store，交互状态已集中在 store 中，不需要另起新的状态范式。
- 地图主舞台优先、抽屉辅助的页面结构已经固定，Phase 4 只能强化体验，不能把重心从地图转移到表单或说明层。
- 页面级反馈当前统一走顶部 notice / warning banner，说明 Phase 4 的异常体验仍应优先沿用轻量提示模式，而不是引入新的重模态体系。
- 点位来源与视觉状态已经有 `seed / saved / detected / selected` 的基本分层，Phase 4 更适合在现有层级上增强，而不是重做点位组件模型。

### Integration Points
- 点位视觉增强、焦点框、标签显隐与 aria 文案优先落在 `src/components/SeedMarkerLayer.vue`。
- 抽屉的焦点限制、打开落点、关闭按钮强化、移动端固定操作区与长文本滚动主要落在 `src/components/PointPreviewDrawer.vue` 与 `src/App.vue`。
- 城市级增强尝试与国家级回退文案需要联动 `src/components/WorldMapStage.vue`、`src/services/geo-lookup.ts`、`src/stores/map-points.ts`、`src/types/map-point.ts` 和 `src/services/point-storage.ts`。
- 本地存储安全回退与顶部异常提示的延续，需要沿用 `src/services/point-storage.ts` + `src/stores/map-points.ts` + `src/App.vue` 这条现有链路。

</code_context>

<specifics>
## Specific Ideas

- 选中点位与普通点位的差异应该明显，但不要通过粗暴换色把地图做成工具告警面板。
- 草稿点位要让用户一眼知道“这次识别还没真正保存”，因此需要更暖、更活且带轻微呼吸。
- 城市级增强应该让用户感到产品在变得更聪明，但又不需要多学一套新操作。
- 抽屉应该更像一个稳定、可读、可键盘操作的工作台，而不是会频繁跳动高度的浮层。
- 边界提示可以更解释型，但仍保持旅行产品语气，不写成 GIS 诊断信息。

</specifics>

<deferred>
## Deferred Ideas

- 真正完整的城市级高精度识别能力与更可靠的数据源体系 — 后续独立增强阶段
- 在线逆地理编码、外部城市数据库或后端同步识别结果 — 超出当前离线本地架构边界
- 更复杂的点位筛选、聚类、统计面板或地图控制器 — 属于新能力，不纳入本阶段

</deferred>

---
*Phase: 04-可用性打磨与增强能力*
*Context gathered: 2026-03-24*
