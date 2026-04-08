---
phase: quick-260408-nch
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/styles/tokens.css
  - apps/web/src/styles/global.css
  - apps/web/src/App.vue
  - apps/web/src/components/map-popup/MapContextPopup.vue
  - apps/web/src/components/map-popup/PointSummaryCard.vue
  - apps/web/src/components/SeedMarkerLayer.vue
autonomous: true
requirements:
  - QUICK-ANIME-KAWAII-RESTYLE
must_haves:
  truths:
    - "页面主视觉、标题与交互表面统一呈现 anime / kawaii / cute 气质，但中文正文仍然清晰可读。"
    - "顶栏、地图容器、弹窗卡片与 marker 在颜色、圆角、阴影、字体语气上属于同一套视觉语言。"
    - "现有地图交互、候选确认、点亮按钮和 marker 选择行为保持不变。"
  artifacts:
    - path: "apps/web/src/styles/tokens.css"
      provides: "统一字体、颜色、圆角、阴影与装饰 token"
    - path: "apps/web/src/styles/global.css"
      provides: "全局字体栈、页面背景与基础排版"
    - path: "apps/web/src/App.vue"
      provides: "保持薄壳的 kawaii 页面框架"
    - path: "apps/web/src/components/map-popup/MapContextPopup.vue"
      provides: "与新主题一致的 popup 外壳"
    - path: "apps/web/src/components/map-popup/PointSummaryCard.vue"
      provides: "与新主题一致的 summary card"
    - path: "apps/web/src/components/SeedMarkerLayer.vue"
      provides: "与新主题一致的 marker 与标签"
  key_links:
    - from: "apps/web/src/styles/tokens.css"
      to: "apps/web/src/App.vue"
      via: "shell / notice / topbar CSS variables"
      pattern: "var\\(--font|var\\(--color|var\\(--shadow"
    - from: "apps/web/src/styles/tokens.css"
      to: "apps/web/src/components/map-popup/PointSummaryCard.vue"
      via: "card / badge / button / candidate styles"
      pattern: "var\\(--font|var\\(--color|var\\(--shadow"
    - from: "apps/web/src/styles/tokens.css"
      to: "apps/web/src/components/SeedMarkerLayer.vue"
      via: "marker dot / halo / label styles"
      pattern: "var\\(--color|var\\(--shadow|var\\(--radius"
---

<objective>
为现有地图页面补上一套 anime / kawaii / cute 风格的字体与视觉语言，并把壳层、弹窗卡片、marker 统一到同一主题下。

Purpose: 在不改动交互逻辑的前提下，提高页面辨识度与风格完整性。
Output: 一套新的主题 token、全局字体/背景样式，以及覆盖 App shell、popup card、marker 的 focused restyle。
</objective>

<context>
@/Users/huangjingping/i/trip-map/AGENTS.md
@/Users/huangjingping/i/trip-map/CLAUDE.md
@/Users/huangjingping/i/trip-map/apps/web/src/App.vue
@/Users/huangjingping/i/trip-map/apps/web/src/styles/global.css
@/Users/huangjingping/i/trip-map/apps/web/src/styles/tokens.css
@/Users/huangjingping/i/trip-map/apps/web/src/components/map-popup/PointSummaryCard.vue
@/Users/huangjingping/i/trip-map/apps/web/src/components/map-popup/MapContextPopup.vue
@/Users/huangjingping/i/trip-map/apps/web/src/components/SeedMarkerLayer.vue

<constraints>
- 保持 `App.vue` 作为薄壳，只做壳层视觉和少量装饰性结构调整，不把 feature 逻辑塞进去。
- 仅做最小而连贯的视觉改造，不改现有 props / emits / store 行为。
- 字体方案优先兼顾 kawaii 气质与中文可读性：display 字体可用于标题/徽章/强调文本，正文必须保留稳定的中文 sans fallback。
- 所有改动都应围绕统一 token 展开，避免在单个组件里硬编码一套新的独立颜色体系。
</constraints>
</context>

<tasks>

<task type="auto">
  <name>Task 1: 建立 kawaii 字体与主题 token 基线</name>
  <files>apps/web/src/styles/tokens.css, apps/web/src/styles/global.css</files>
  <action>
    在 `tokens.css` 中补齐这次 quick restyle 所需的主题基线：新增适合 anime / kawaii / cute 语气的 display font token、正文字体 token、柔和糖果色扩展、表面渐变、圆角、阴影和需要复用的高光/描边变量。字体策略要明确区分标题强调与正文阅读，不要把纯装饰字体硬铺到整站正文。

    在 `global.css` 中引入并应用字体栈与基础页面样式：为 `body`、按钮、表单等接入新的字体 token，调整页面背景与可选的轻装饰纹理，让整体基调先统一起来；同时保持基础可读性、默认字号和现有 layout 不被破坏。
  </action>
  <verify>
    <automated>pnpm --filter @trip-map/web typecheck</automated>
  </verify>
  <done>新主题的字体、颜色、圆角和阴影均通过 token 暴露；全局页面已经切换到 kawaii 视觉基线，但中文正文仍保持稳定易读。</done>
</task>

<task type="auto">
  <name>Task 2: 统一 App shell 与地图弹窗卡片视觉</name>
  <files>apps/web/src/App.vue, apps/web/src/components/map-popup/MapContextPopup.vue, apps/web/src/components/map-popup/PointSummaryCard.vue</files>
  <action>
    以 Task 1 的 token 为唯一视觉来源，重绘 `App.vue` 的 topbar、notice、map shell 外框与背景层次，让页面入口直接呈现 anime / kawaii / cute 语气；必要时可加入少量纯装饰性 DOM，但不能改变现有脚本职责，也不要把业务逻辑迁入 `App.vue`。

    同步改造 `MapContextPopup.vue` 与 `PointSummaryCard.vue`：让 popup 外壳、箭头、badge、标题、tag、候选按钮、点亮按钮、提示 notice 都统一为更软萌、更圆润、更有糖果感的样式。保留所有交互状态和数据流，尤其是 props / emits、聚焦逻辑、候选确认与点亮行为，不做行为层重写。
  </action>
  <verify>
    <automated>pnpm --filter @trip-map/web build</automated>
  </verify>
  <done>页面壳层和 popup/card 在字体、配色、阴影、边框和装饰语言上明显统一，且 `App.vue` 仍然是薄壳，地图弹窗现有交互完全保留。</done>
</task>

<task type="auto">
  <name>Task 3: 让地图 marker 与标签跟随新主题</name>
  <files>apps/web/src/components/SeedMarkerLayer.vue</files>
  <action>
    仅调整 `SeedMarkerLayer.vue` 的样式表达，把 marker dot、halo、pulse、label 改成与 popup/card 一致的 kawaii 语言，例如更柔和的果冻质感、糖果色光晕、圆润标签和更明确的 hover / focus / selected 层级。保持地理锚点位置、按钮尺寸、ARIA 标注、hover/focus/selected 条件和现有动画开关逻辑不变。

    选中、已保存、草稿三种状态要继续一眼可辨，但颜色和质感应与新的 token 体系对齐，避免 marker 成为页面上唯一还停留在旧风格的元素。
  </action>
  <verify>
    <automated>pnpm --filter @trip-map/web typecheck</automated>
  </verify>
  <done>marker 与标签完成 kawaii 化，状态辨识度不下降，并且与 App shell、popup card 形成统一视觉语言。</done>
</task>

</tasks>

<verification>
1. 运行 `pnpm --filter @trip-map/web typecheck`，确认样式调整没有引入 Vue/TS 错误。
2. 运行 `pnpm --filter @trip-map/web build`，确认生产构建通过。
3. 本地预览时检查四个区域是否统一：全局字体、顶栏/地图壳层、popup card、marker/label。
4. 手动确认三类交互未回归：点击 marker 选中、候选地点确认、点亮/取消点亮。
</verification>

<success_criteria>
- 新字体策略已经接入页面，并且标题/强调区域有明确的 anime / kawaii / cute 识别度。
- 壳层、popup card 与 marker 的视觉语言统一，不再像三套独立样式拼接。
- 现有地图交互和可访问性属性保持可用，构建与类型检查通过。
</success_criteria>

<output>
完成后直接在此 quick 目录补充执行结果或摘要文件（如工作流需要）。
</output>
