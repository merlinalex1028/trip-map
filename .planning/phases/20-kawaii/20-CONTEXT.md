# Phase 20: Kawaii 组件样式全面迁移 - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 20 负责把当前主路径中的可见 UI 组件统一迁移到完整的 kawaii 视觉语言：pill 按钮/徽章、floating-cloud 弹窗卡片、宽松留白，以及 hover / active 微交互的一致收口。交付重点是当前真实运行中的主界面表面，而不是对整个仓库做一次无差别样式清扫。

本阶段按当前代码事实执行：主路径包含 `App.vue` 壳层、`MapContextPopup.vue`、`PointSummaryCard.vue`、点亮按钮、候选按钮、notice、地图中的 pending / popup / card 等交互表面。虽然 `ROADMAP.md` 仍沿用“popup、drawer”措辞，但 Phase 15 已明确删除 `drawer`，因此本阶段不会重新引入 drawer，也不会把未挂载的遗留组件强行纳入范围。

</domain>

<decisions>
## Implementation Decisions

### 迁移覆盖范围
- **D-01:** Phase 20 只迁移当前主路径中的真实可见 UI 组件，不把仓库里未挂载的遗留或备用组件一并纳入完整 kawaii 收口。
- **D-02:** 主路径范围包括 `App.vue` 壳层、`MapContextPopup.vue`、`PointSummaryCard.vue`、点亮按钮、候选确认按钮、notice、以及地图上的 pending / popup / card 交互表面。
- **D-03:** `PosterTitleBlock.vue`、`BackendBaselinePanel.vue` 这类当前未接入首页主链路的组件不作为本阶段必交范围；如后续重新挂载，可在未来任务中单独处理。
- **D-04:** 不因为 roadmap 中的旧 wording 重新创建或恢复 `drawer`；Phase 20 的“弹窗卡片”交付对象按当前唯一主交互表面 `popup` 理解。

### 云朵卡片层级
- **D-05:** floating-cloud 的主视觉应落在内层内容卡片，而不是把厚白边和重投影全部压到 `popup` 外壳上。
- **D-06:** `MapContextPopup.vue` 继续承担轻量定位壳与箭头容器职责，只保留克制的边框/外壳感，避免出现双重厚 chrome。
- **D-07:** `PointSummaryCard.vue` 承担大圆角、厚白边、柔和投影和主要“云朵卡片”质感，成为用户真正感知到的核心 kawaii 表面。

### 按钮与徽章层级
- **D-08:** 所有按钮和徽章都遵循 pill 语言，但保留明确的三档强弱层级，而不是所有元素都做成同样高甜度。
- **D-09:** 主 CTA（如点亮按钮、关键确认动作）可以更甜、更亮、更有糖感与存在感。
- **D-10:** 次 CTA（如候选卡内的次级动作或辅助按钮）保持圆角、柔光和 hover/active 反馈，但视觉强度低于主 CTA。
- **D-11:** 信息徽章与状态胶囊保持更轻的标签感，负责传达状态与分类，不与主操作按钮争夺注意力。
- **D-12:** 状态对比继续继承 Phase 10 / Phase 15 的语义合同：当前选中偏暖粉，已点亮偏淡蓝/蓝绿，辅助信息保持轻量但仍可区分。

### 微交互覆盖范围
- **D-13:** 完整 hover / active 微交互优先覆盖按钮、候选卡和 popup/card 等 UI 表面，确保 `STYLE-03`~`INTER-03` 在主路径上形成统一体验。
- **D-14:** popup/card 与候选卡可以采用轻柔的上浮和轻放大反馈，但动作应偏轻盈，不做夸张弹跳或大幅位移。
- **D-15:** 地图命中相关元素（如 marker、boundary、pending 点位）保持克制，继续以命中稳定、坐标可靠和交互安全优先，不做会制造“飘”“晃”感的强 Q 弹动效。
- **D-16:** 所有过渡统一向 `300ms ease-out` 收口；按钮保留下压感，卡片与候选项以轻 hover 为主。

### the agent's Discretion
- 在“不增加顶部栏高度”和“不引发双重 chrome”的前提下，决定各组件具体使用 Tailwind 工具类、保留少量 scoped CSS，还是两者混合过渡。
- 在主 CTA / 次 CTA / 信息徽章三档层级内，决定每类组件的具体阴影、渐变、描边和留白数值，只要强弱关系清晰。
- 为 popup/card、候选卡与按钮分配具体 hover / active 组合，只要满足 `ease-out`、轻柔漂浮与按钮下压感，并避免作用到 Leaflet 地图容器或破坏坐标系。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone scope and acceptance baseline
- `.planning/ROADMAP.md` — Phase 20 的目标、requirements 映射与成功标准；同时要注意其中 `drawer` wording 已落后于现有代码事实。
- `.planning/REQUIREMENTS.md` — `STYLE-03`、`STYLE-04`、`STYLE-05`、`INTER-01`、`INTER-02`、`INTER-03` 的正式要求文本。
- `.planning/PROJECT.md` — v4.0 的 Kawaii UI 总目标、纯前端范围与奶油白 / pastel / 圆润字体 / pill / cloud card 的产品级约束。
- `.planning/STATE.md` — 当前项目位置与“Phase 20 ready to plan”的里程碑状态。

### Prior phase decisions that still constrain Phase 20
- `.planning/phases/10-可爱风格与可读性收口/10-CONTEXT.md` — 轻旅行手账 + 少女感细节、暖粉/淡蓝状态语义、圆角优先、装饰与动效不能压坏地图交互。
- `.planning/phases/15-服务端记录与点亮闭环/15-CONTEXT.md` — `drawer` 已被完全删除，popup 成为唯一主交互表面；点亮按钮语义、乐观更新和状态色合同继续有效。
- `.planning/phases/19-tailwind-token/19-CONTEXT.md` — Phase 20 需继承 Tailwind token 基线、薄壳 topbar 护栏、popup 避免双重厚边框，以及 transform 不能作用到地图容器的约束。

### Recent implementation baseline and quick-task carry-forward
- `.planning/quick/260408-nch-anime-style-kawaii-cute-anime-style-kawa/260408-nch-SUMMARY.md` — 当前 shell、popup/card、marker 已建立共享 kawaii token 基线，但仍未完成 Phase 20 要求的全面 Tailwind / 微交互收口。
- `.planning/quick/260408-nw1-kawaii/260408-nw1-SUMMARY.md` — 顶部栏已被压缩回轻量导航密度，后续视觉升级不能再次侵占地图首屏面积。

### Milestone research and engineering guardrails
- `.planning/research/SUMMARY.md` — v4.0 的总体技术路径、Phase 20 应完成的全面组件迁移目标，以及 Tailwind + Kawaii 的推荐实现模式。
- `.planning/research/PITFALLS.md` — scoped CSS specificity、动态类、Leaflet preflight 与 `transform` 冲突等 Phase 20 实施时必须规避的失败模式。

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/App.vue`：当前唯一页面壳层入口，已经完成最小 Tailwind 样板，适合作为顶部栏、notice、地图壳层与全局留白收口的主入口。
- `apps/web/src/components/map-popup/MapContextPopup.vue`：现有 popup 外壳和箭头容器，适合继续承担轻量 chrome 与定位壳职责。
- `apps/web/src/components/map-popup/PointSummaryCard.vue`：当前 popup 内容主体，已集中承载 badge、标题、点亮按钮、候选列表和 notice，是“主云朵卡片”最佳落点。
- `apps/web/src/components/LeafletMapStage.vue`：已收口 popup 锚定、pending marker、boundary click 和地图交互；也是限制 transform 与重动效的关键安全边界。
- `apps/web/src/style.css`、`apps/web/src/styles/tokens.css`、`apps/web/src/styles/global.css`：已具备 Tailwind v4 token、页面背景、字体和现有阴影/渐变变量，可直接支撑 Phase 20 的视觉系统升级。

### Established Patterns
- 当前前端仍是“Tailwind utilities + 共享 token + 少量 scoped CSS”的混合模式，说明 Phase 20 应优先渐进式替换主路径组件，而不是全仓库一次性推平。
- `App.vue` 已被明确限定为薄壳，不承载地图业务逻辑；顶部栏的高度与 notice 偏移已经为地图首屏让位，不能因视觉甜度提升而再次涨高。
- `MapContextPopup.vue` + `PointSummaryCard.vue` 已形成“外壳 + 主内容卡”的两层结构，天然适合执行“外轻内重”的云朵卡片分层方案。
- `LeafletMapStage.vue`、`SeedMarkerLayer.vue` 与全局 research 已共同确认：CSS transform / scale 只能用于 UI 表面，不应施加到 Leaflet 地图容器或会影响坐标系的父层。

### Integration Points
- `apps/web/src/components/map-popup/PointSummaryCard.vue` 是主 CTA / 次 CTA / 信息徽章三档层级最直接的落地位置。
- `apps/web/src/components/map-popup/MapContextPopup.vue` 需要与 `PointSummaryCard.vue` 协同收口：外层减法、内层强化云朵感。
- `apps/web/src/App.vue` 需要继续负责 notice、topbar、map shell 的 pill / breathing space / hover 语言统一，但不能打破薄壳约束。
- `apps/web/src/components/LeafletMapStage.vue` 需要配合限制地图表面的动效强度，保证 pending / boundary / popup 锚定稳定。

</code_context>

<specifics>
## Specific Ideas

- 用户明确选择本阶段只收口当前主路径组件，不做“全仓 UI 清扫”。
- 用户明确选择让云朵卡片的主要视觉落在 `PointSummaryCard.vue` 这类内层内容卡，`MapContextPopup.vue` 保持更轻的壳层。
- 用户明确选择按钮 / 徽章保留三档强弱层级：主 CTA 更甜，次 CTA 更克制，信息徽章更轻。
- 用户明确选择微交互覆盖按钮、候选卡和 popup/card，但地图命中元素保持克制，避免强 Q 弹影响地图稳定性。

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 20-kawaii*
*Context gathered: 2026-04-09*
