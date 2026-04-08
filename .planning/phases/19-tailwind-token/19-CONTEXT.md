# Phase 19: tailwind-token - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 19 负责把 `apps/web` 切换到可用的 Tailwind CSS v4 基础设施，并建立可直接在 Vue SFC `class` 中消费的 kawaii 主题 token 与全局字体基线，同时确保 Tailwind preflight 不破坏 Leaflet 地图控件、归因链接与现有地图主链路。

本阶段只交付基础设施、主题入口和最小示范迁移，不负责把全部组件彻底改写为 Tailwind 工具类，也不在这一阶段完成按钮 / 卡片 / popup / drawer 的完整 kawaii 微交互收口；这些属于 Phase 20。

</domain>

<decisions>
## Implementation Decisions

### Token 词表
- **D-01:** Tailwind v4 在 Phase 19 只暴露基础色族 `sakura`、`mint`、`lavender`、`cream`，先满足 `bg-sakura-*`、`text-lavender-*` 这类工具类可直接使用的目标。
- **D-02:** 现有语义变量（如 selected / saved / fallback / surface）暂时继续留在普通 CSS variable 层，不在 Phase 19 里同步重建为 Tailwind 语义 token；是否做语义桥接留给 Phase 20 再统一决策。
- **D-03:** Phase 19 的 token 设计优先服务“基础设施可用”和“与现有 kawaii palette 连续”，而不是借机重做整套语义命名体系。

### 字体基线
- **D-04:** 全站默认字体在 Phase 19 直接统一切到 `Nunito Variable`，并通过 Tailwind `@theme --font-sans` 让 `font-sans` 与全局默认字体保持一致。
- **D-05:** 标题、正文和常规 UI 文字在本阶段都先共享 `Nunito Variable` 基线，不保留旧 display 字体链作为默认入口；目标是先确保“全站已明显切到圆润字体”这一成功标准明确达成。

### Phase 19 迁移边界
- **D-06:** 在完成 Tailwind v4、`style.css` 主入口、字体导入和 Leaflet preflight 兼容之后，Phase 19 允许顺手把 `App.vue` 外壳层做成最小 Tailwind 样板，作为 Phase 20 的迁移模板。
- **D-07:** 这个最小样板只覆盖页面壳层级别内容，例如 topbar、页面背景、notice、地图外框等，不扩展到 popup/card 等更深层组件；组件全面迁移仍留到 Phase 20。
- **D-08:** `App.vue` 继续保持“视觉壳层”职责，不迁入地图业务逻辑，也不改变现有 store、Leaflet 交互和 popup/drawer 语义。

### Leaflet 兼容护栏
- **D-09:** Phase 19 对 Leaflet 的要求是“安全兼容优先”：保证控件、缩放按钮、归因链接、图层控件与 popup 不因 Tailwind preflight 受损，视觉上尽量保持当前 v3.0 / quick-task 之后的稳定状态。
- **D-10:** 本阶段不主动对 Leaflet 控件做 kawaii 化收口；只要样式正常、不崩、不退化即可，完整视觉对齐留给后续组件迁移阶段判断。
- **D-11:** 继续沿用研究文档确定的关键防护：`@import "tailwindcss"` 在前、Leaflet CSS 在后；hover / scale 等 transform 只允许用于 UI 组件，不允许用于 Leaflet 地图容器或其影响坐标系的父层。

### the agent's Discretion
- Phase 19 中 `sakura` / `mint` / `lavender` / `cream` 各自扩展到多少 shade，具体数值如何从现有 `tokens.css` 映射到 `@theme`，由后续 researcher / planner 结合现有色盘决定。
- `style.css` 是否同时承接一部分现有 `global.css` / `tokens.css` 内容，或采用“新增主入口 + 暂留旧文件承接少量兼容层”的过渡方式，由后续规划决定。
- `App.vue` 最小 Tailwind 样板的具体粒度、保留多少 `scoped CSS` 作为过渡层，以及哪些类应先迁移为 utilities，由后续规划决定，只要不越过本阶段边界。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone scope and acceptance baseline
- `.planning/ROADMAP.md` — Phase 19 的目标、依赖、requirements 映射与成功标准；明确本阶段只交付 Tailwind 基础设施、全局 token、字体和 Leaflet preflight 兼容。
- `.planning/REQUIREMENTS.md` — `INFRA-01`~`INFRA-04`、`STYLE-01`、`STYLE-02` 的正式 requirement 文本，定义 Tailwind v4、`style.css`、Nunito 字体、Leaflet 安全兼容与 kawaii 调色板边界。
- `.planning/PROJECT.md` — v4.0 里程碑目标、Kawaii UI 总方向、纯前端范围，以及暖粉 / 薄荷 / 淡紫 / 奶油白与圆润字体的产品级约束。
- `.planning/STATE.md` — 当前项目位置为“Phase 19 ready to plan”，说明这是 v4.0 的起始 phase，不应混入 Phase 20 的全面组件迁移范围。

### Prior visual and map contracts that still constrain Phase 19
- `.planning/phases/10-可爱风格与可读性收口/10-CONTEXT.md` — 已锁定的可爱风方向、暖粉/淡蓝状态语义、圆角优先和“视觉升级不能牺牲可读性/交互可靠性”的前置合同。
- `.planning/phases/14-leaflet/14-CONTEXT.md` — Leaflet 主链路、popup 锚定、边界高亮和地图控件稳定性的前置约束，决定本阶段必须以“Leaflet 不坏”为硬约束。

### Recent quick-task decisions to carry forward
- `.planning/quick/260408-nch-anime-style-kawaii-cute-anime-style-kawa/260408-nch-SUMMARY.md` — 当前 `tokens.css` / `global.css` / `App.vue` / popup / marker 的 kawaii quick restyle 基线，以及“App.vue 只做壳层、使用本地字体、通过共享 token 驱动视觉”的近期决策。
- `.planning/quick/260408-nw1-kawaii/260408-nw1-SUMMARY.md` — 顶部栏已经压缩为轻量导航密度，后续 Tailwind 迁移不能再次侵占首页地图首屏面积。

### Tailwind integration research for this milestone
- `.planning/research/SUMMARY.md` — v4.0 的总体技术路径、推荐依赖、两阶段拆分方式，以及本里程碑的主要工程风险总结。
- `.planning/research/ARCHITECTURE.md` — Tailwind v4 + Vite 8 的集成步骤、`style.css` 结构、插件顺序、字体导入位置与 monorepo 落点。
- `.planning/research/PITFALLS.md` — preflight/Leaflet 冲突、v3/v4 配置混淆、动态 class、scoped specificity、地图容器 transform 等关键失败模式与防护措施。

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/vite.config.ts`: 当前只有 `vue()` 插件，Phase 19 是加入 `@tailwindcss/vite` 的直接入口。
- `apps/web/src/main.ts`: 当前按 `tokens.css`、`global.css`、`leaflet/dist/leaflet.css` 顺序导入，是切换到 `style.css` 主入口和 Nunito 字体导入的关键连接点。
- `apps/web/src/styles/tokens.css`: 已承载 spacing、字体、颜色、圆角、阴影和状态语义变量，是 Tailwind `@theme` 映射的主要来源。
- `apps/web/src/styles/global.css`: 已承载页面背景、排版和 Leaflet SVG 兼容规则，可保留为 Tailwind 时代的全局补充层。
- `apps/web/src/App.vue`: 当前仍是集中式页面壳层，最适合作为 Phase 19 的“最小 Tailwind 样板”入口。

### Established Patterns
- 当前前端是“共享 token + 全局 CSS + SFC scoped CSS”模式，不存在现成 UI 库；Tailwind 迁移应走渐进式替换，而不是一次性重构所有组件。
- 近期 quick task 已锁定 `App.vue` 只承担壳层职责、标题栏维持轻量导航密度，因此 Tailwind 迁移不能把壳层重新做厚或把地图挤出首屏。
- Leaflet 当前通过独立 CSS 获得控件与归因样式，说明 Phase 19 的核心风险确实集中在 preflight 顺序和局部兼容层，而不是地图逻辑本身。

### Integration Points
- `apps/web/package.json` 需要新增 `tailwindcss`、`@tailwindcss/vite`、`@fontsource-variable/nunito`，并保持安装范围仅在 `apps/web`。
- `apps/web/src/style.css` 将成为 Tailwind + Leaflet + `@theme` 的主入口；`main.ts` 需要切换到这个入口并导入字体。
- `apps/web/src/App.vue` 是最小 Tailwind 样板的首选迁移对象，用来验证背景、topbar、notice、地图外框与新 token 是否贯通。
- 其余深层组件如 `MapContextPopup.vue`、`PointSummaryCard.vue`、`LeafletMapStage.vue` 在本阶段主要作为“不被破坏”的兼容观察点，而不是全面迁移目标。

</code_context>

<specifics>
## Specific Ideas

- Tailwind v4 在本项目中应采用 CSS-first 路线，不创建 `tailwind.config.js`，直接用 `@theme {}` 暴露 kawaii token。
- `style.css` 的关键顺序应是 Tailwind preflight 在前、Leaflet CSS 在后，再定义 `@theme`，以确保控件样式稳定。
- 本阶段先保证 `bg-sakura-*`、`text-lavender-*`、`bg-cream-*` 这类基础色工具类立即可用，不把 Phase 19 变成一轮语义 token 命名大讨论。
- 全站默认字体应有“明显切换为 Nunito Variable”的结果，这比保留多套 display/body 默认入口更符合本阶段成功标准。
- `App.vue` 应继续维持薄壳与轻 topbar 结构，Tailwind 迁移时不能让首页地图的首屏可视面积再次变差。

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 19-tailwind-token*
*Context gathered: 2026-04-08*
