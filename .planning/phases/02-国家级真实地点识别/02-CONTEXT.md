# Phase 2: 国家级真实地点识别 - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段只负责打通“地图点击坐标 -> 真实地理坐标 -> 国家/地区级离线识别 -> 成功/失败反馈”的核心链路。Phase 2 不扩展到完整点位 CRUD、详情编辑表单、本地持久化闭环或城市级强识别；城市相关能力只允许作为国家识别成功后的后续兼容入口，不作为本阶段主目标。

</domain>

<decisions>
## Implementation Decisions

### 点击识别反馈节奏
- 用户点击地图后的第一反馈是在点击位置显示轻量脉冲点，不先打断地图主视觉
- 识别中的等待感保持克制，只需要让用户确认“系统已收到点击”
- 识别成功后直接在对应位置生成新点位，并自动打开抽屉进入后续查看/编辑流程
- 如果识别耗时超过短暂瞬间，需要升级为带文案的状态提示，但仍避免重遮罩或锁死地图

### 国家与地区的展示口径
- 当国家与特殊地区信息同时存在时，展示上优先使用地区名，而不是强行并入国家名
- 香港、澳门这类区域在第一版按独立地区信息展示
- 整体结果口径优先贴近用户直觉地理认知，而不是只追求政治/行政归属文案
- 抽屉信息层级保持为“地点名是标题，国家/地区是副行”

### 无效点击的失败体验
- 点击海洋、无效区域或无法识别位置时，用页面级 toast 做失败提示
- 提示语气保持温和，重点引导“请点击有效陆地区域”
- 失败后地图上不保留失败标记或残留点位，提示消失后界面恢复原状
- 如果用户连续多次点到无效区域，提示可以升级为更明确的引导文案

### 边界不确定时的判定原则
- 靠近国界或海岸线时，整体策略偏保守，只有高置信度才返回结果
- 国家边界命中不够稳定时，不创建点位，提示用户重新点击
- 海岸线附近如果陆地/海洋难以可靠区分，优先判无效，也不要“猜一个”
- 对用户的解释文案不强调技术细节，只提示“请点击更靠近目标区域的位置”

### Claude's Discretion
- 轻量脉冲点、toast 和状态文案的具体视觉样式与动画节奏
- 成功识别与失败提示的文案措辞细节
- 特殊地区展示时副标题与坐标排版的具体样式
- 连续失败时提示升级的阈值与冷却方式

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Scope
- `PRD.md` — 产品目标、真实点位判断流程、国家/地区识别要求、失败与降级原则
- `.planning/PROJECT.md` — 项目核心价值、技术约束、离线识别与双坐标保存原则
- `.planning/REQUIREMENTS.md` — Phase 2 直接对应的 `GEO-01`、`GEO-02`、`GEO-03`
- `.planning/ROADMAP.md` — Phase 2 的目标、成功标准与 02-01 / 02-02 计划边界

### Prior Decisions
- `.planning/phases/01-地图基础与应用骨架/01-CONTEXT.md` — 继承的地图主视觉、海报风格、抽屉基调与低噪声交互契约
- `.planning/phases/01-地图基础与应用骨架/01-03-SUMMARY.md` — 已经落地的点位选中与抽屉交互基线

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/WorldMapStage.vue`：现有固定世界地图舞台组件，可作为 Phase 2 注入点击采样、投影换算和识别反馈的主入口
- `src/components/SeedMarkerLayer.vue`：现有点位展示层已经支持选中态与键盘交互，可继续承接“识别成功后生成临时/新点位”的视觉表现
- `src/components/PointPreviewDrawer.vue`：现有抽屉已经具备预览结构，可在后续阶段复用 Phase 2 识别出的国家/地区结果
- `src/stores/map-ui.ts`：已有共享选中态 store，可扩展识别中状态或临时结果，而不用重建交互流

### Established Patterns
- 当前项目使用 Vue 3 Composition API + `<script setup>` + Pinia setup store
- Phase 1 已经建立“地图为主视觉、抽屉默认关闭、点击点位才打开”的交互基线
- 当前点位数据仍是展示型 `MapPointDisplay`，Phase 2 需要为后续真实点位模型预留 `lat/lng`、国家代码和识别元信息的升级路径
- 当前 `preview-points` 读取模式是“seed + local overlay”，后续真实识别结果需要兼容这个数据入口而不破坏已保存点位显示

### Integration Points
- 新的点击识别链路应优先接到 `src/components/WorldMapStage.vue`
- 投影换算与地理命中逻辑应设计为可复用的组合式函数或服务层，供 Phase 3 的点位创建直接消费
- 识别成功/失败的 UI 反馈需要与 `src/App.vue` 的现有地图主舞台和抽屉布局兼容，不能破坏 Phase 1 已验收的视觉比例

</code_context>

<specifics>
## Specific Ideas

- 识别反馈应该“先轻后重”：先在点击点给轻量脉冲，再在必要时补文本状态
- 产品对边界模糊点击采取“宁可不创建，也不误判”的保守策略
- 特殊地区展示更贴近用户直觉地理认知，不强行统一成国家名优先
- 失败提示应是引导式而不是报错式，避免把产品做成 GIS 工具

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---
*Phase: 02-国家级真实地点识别*
*Context gathered: 2026-03-23*
