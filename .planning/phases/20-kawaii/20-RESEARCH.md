# Phase 20: Kawaii 组件样式全面迁移 - Research

**Researched:** 2026-04-09
**Domain:** Vue 3 + Tailwind CSS v4 可见 UI 表面 kawaii 样式迁移
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

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

### Claude's Discretion
- 在“不增加顶部栏高度”和“不引发双重 chrome”的前提下，决定各组件具体使用 Tailwind 工具类、保留少量 scoped CSS，还是两者混合过渡。
- 在主 CTA / 次 CTA / 信息徽章三档层级内，决定每类组件的具体阴影、渐变、描边和留白数值，只要强弱关系清晰。
- 为 popup/card、候选卡与按钮分配具体 hover / active 组合，只要满足 `ease-out`、轻柔漂浮与按钮下压感，并避免作用到 Leaflet 地图容器或破坏坐标系。

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STYLE-03 | 所有按钮/徽章为 pill-shaped（`rounded-full`），配合彩色柔光阴影（阴影色与背景色匹配） [VERIFIED: .planning/REQUIREMENTS.md] | 采用 `rounded-full` + 语义色阴影 token；主 CTA、次 CTA、信息徽章三档分别落在 `PointSummaryCard.vue` 与 `App.vue` 的可见按钮/徽章上 [CITED: https://tailwindcss.com/docs/border-radius][VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue][VERIFIED: apps/web/src/App.vue] |
| STYLE-04 | 卡片/容器使用大圆角（`rounded-3xl`）+ `border-4 border-white` + 柔和 box-shadow，呈现 floating-cloud 浮动效果 [VERIFIED: .planning/REQUIREMENTS.md] | 依据锁定决策，厚白边与主投影应转移到 `PointSummaryCard.vue` 内层卡片，`MapContextPopup.vue` 仅保留轻壳与箭头 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md][VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue] |
| STYLE-05 | 布局宽松，组件内外使用 generous padding/margin（`p-6` / `gap-4` 以上），元素不拥挤 [VERIFIED: .planning/REQUIREMENTS.md] | 现有 token 已有 `--space-lg: 24px`、`--space-md: 16px`，规划应把主路径表面统一到宽松间距而不是逐处魔法数 [VERIFIED: apps/web/src/styles/tokens.css][VERIFIED: apps/web/src/App.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue] |
| INTER-01 | 可交互元素 hover 时平滑放大（`scale-105`）并上浮（`-translate-y-1`），过渡 300ms ease-out [VERIFIED: .planning/REQUIREMENTS.md] | 以 Tailwind 变体或等价 CSS 统一 hover 组合；当前候选卡和点亮按钮仅做 `translateY(-1px)`，仍缺 scale 与 300ms `ease-out` 收口 [CITED: https://tailwindcss.com/docs/hover-focus-and-other-states][CITED: https://tailwindcss.com/docs/scale][CITED: https://tailwindcss.com/docs/translate][CITED: https://tailwindcss.com/docs/transition-duration][CITED: https://tailwindcss.com/docs/transition-timing-function][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue] |
| INTER-02 | 按钮点击（active state）轻压（`scale-95`），体感弹性 [VERIFIED: .planning/REQUIREMENTS.md] | 规划需为主 CTA 与次 CTA 增加 active 下压态；当前按钮实现没有 active `scale` 规则 [CITED: https://tailwindcss.com/docs/scale][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue] |
| INTER-03 | 所有过渡使用 ease-out timing（300ms），避免 linear / ease-in 硬动画 [VERIFIED: .planning/REQUIREMENTS.md] | 应将现有 `--motion-emphasis: 180ms` 和 `ease` 过渡升级到统一的 300ms `ease-out`，同时保留 `prefers-reduced-motion` 降级 [VERIFIED: apps/web/src/styles/tokens.css][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue][VERIFIED: apps/web/src/components/LeafletMapStage.vue][CITED: https://tailwindcss.com/docs/transition-timing-function] |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- 与用户交流时始终使用中文；代码、命令、配置键名、接口字段名可保持原始语言 [VERIFIED: CLAUDE.md]
- 在开始实现前先简要说明将执行的操作 [VERIFIED: CLAUDE.md]
- 修改代码时优先保持改动最小，并遵循现有项目结构与风格 [VERIFIED: CLAUDE.md]
- 如果使用子代理，必须等待子代理返回结果后再继续 [VERIFIED: CLAUDE.md]
- 完成后要用中文简要说明变更内容、影响范围与验证结果 [VERIFIED: CLAUDE.md]
- 前端必须继续使用 Vue 3 Composition API + `<script setup lang="ts">`，不改用 Options API [VERIFIED: CLAUDE.md][VERIFIED: /Users/huangjingping/.agents/skills/vue-best-practices/SKILL.md]
- 前端测试框架继续使用 Vitest，且构建前须通过 `vue-tsc --noEmit` [VERIFIED: CLAUDE.md]

## Summary

Phase 20 不需要引入新库，核心是把 Phase 19 建好的 Tailwind v4 + token 基线，完整铺到当前主路径可见 UI 表面，并严格遵守“外轻内重”的 popup 分层、薄壳 topbar 护栏、以及地图容器禁止 transform 的既有约束 [VERIFIED: apps/web/package.json][VERIFIED: .planning/phases/19-tailwind-token/19-CONTEXT.md][VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md][VERIFIED: apps/web/src/components/LeafletMapStage.vue].

当前代码已经具备可复用的 kawaii 视觉基础，但距离成功标准还有清晰差距：`PointSummaryCard.vue` 的主卡片仍是 `border: 0` + `box-shadow: none`，候选按钮与点亮按钮仍使用 180ms `ease` 和仅 `translateY(-1px)` 的轻 hover，未实现统一的 `scale-105` / `scale-95` / `300ms ease-out` 语言；`MapContextPopup.vue` 目前仍承担较重的外层 chrome，需要把厚白边和主云朵投影移回内层卡片 [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue][VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue][VERIFIED: apps/web/src/styles/tokens.css].

最稳妥的规划方式不是“全仓 scoped CSS 清扫”，而是沿现有组件边界推进三条主线：`App.vue` 负责 shell/notice 呼吸感统一，`MapContextPopup.vue` 负责轻壳与箭头减法，`PointSummaryCard.vue` 负责 pill 层级、cloud card 质感和主要微交互，再用 Vitest 合同把样式类与数据属性锁住，避免视觉回归 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md][VERIFIED: apps/web/src/App.vue][VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.spec.ts][VERIFIED: apps/web/src/App.spec.ts].

**Primary recommendation:** 以 `PointSummaryCard.vue` 为主战场完成云朵卡片与 CTA/徽章三档收口，以 `MapContextPopup.vue` 做外壳减法，并用 Tailwind utilities + 少量保留 scoped CSS 的混合迁移完成 300ms `ease-out` 微交互统一 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue][VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue].

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `tailwindcss` | `4.2.2` (published 2026-03-18) [VERIFIED: npm registry] | 提供 `rounded-full`、`rounded-3xl`、`scale-*`、`translate-*`、`duration-300`、`ease-out` 等 utilities 与 `@theme` token 暴露 [CITED: https://tailwindcss.com/docs/theme][CITED: https://tailwindcss.com/docs/border-radius][CITED: https://tailwindcss.com/docs/scale][CITED: https://tailwindcss.com/docs/translate][CITED: https://tailwindcss.com/docs/transition-duration][CITED: https://tailwindcss.com/docs/transition-timing-function] | 已在 `apps/web` 安装且为当前 npm 最新稳定版，Phase 19 已把它作为本里程碑基线 [VERIFIED: apps/web/package.json][VERIFIED: .planning/phases/19-tailwind-token/19-CONTEXT.md] |
| `@tailwindcss/vite` | `4.2.2` (published 2026-03-18) [VERIFIED: npm registry] | 提供 Tailwind v4 的官方 Vite 集成 [CITED: https://tailwindcss.com/docs/installation/using-vite] | 已安装且为当前 npm 最新稳定版，不应在 Phase 20 顺手改集成方式 [VERIFIED: apps/web/package.json] |
| `vue` | `3.5.32` (published 2026-04-03) [VERIFIED: npm registry] | 承载 `<script setup lang="ts">` SFC、`computed`、`watch`、显式 props/emits 数据流 [VERIFIED: /Users/huangjingping/.agents/skills/vue-best-practices/SKILL.md][CITED: https://vuejs.org/guide/essentials/class-and-style.html] | 当前主路径组件均基于 Vue 3.5 SFC，且该版本是 npm 当前稳定版 [VERIFIED: apps/web/package.json][VERIFIED: apps/web/src/App.vue][VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@fontsource-variable/nunito` | `5.2.7` (published 2025-09-17) [VERIFIED: npm registry] | 继续提供离线圆润字体基线 [VERIFIED: apps/web/package.json][VERIFIED: apps/web/src/style.css] | 保持 Kawaii 视觉连续性，不在 Phase 20 切换字体体系 [VERIFIED: .planning/REQUIREMENTS.md] |
| `vitest` | `4.1.3` (published 2026-04-07) [VERIFIED: npm registry] | 组件 class contract、数据属性与结构回归测试 [VERIFIED: apps/web/package.json][VERIFIED: apps/web/vitest.config.ts] | 为 Phase 20 新增样式契约测试与快测命令 [VERIFIED: CLAUDE.md] |
| `@vue/test-utils` | `2.4.6` (published 2024-05-07) [VERIFIED: npm registry] | 挂载 Vue 组件并断言 class / attrs / emits [VERIFIED: apps/web/package.json] | 继续沿用现有组件测试模式，无需换工具 [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.spec.ts][VERIFIED: apps/web/src/App.spec.ts] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind utilities + 现有 token 层 [VERIFIED: apps/web/src/style.css][VERIFIED: apps/web/src/styles/tokens.css] | 继续以 scoped CSS 为主 [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue] | 会继续放大 scoped specificity 冲突，且不符合 v4.0 “全面迁移为 Tailwind 工具类”的方向 [VERIFIED: .planning/PROJECT.md][CITED: https://vuejs.org/api/sfc-css-features.html] |
| CSS transition / transform 微交互 [VERIFIED: .planning/REQUIREMENTS.md] | JS 动画库（如 motion / GSAP） [VERIFIED: .planning/REQUIREMENTS.md] | 需求与 out-of-scope 已明确排除 JS 动画库，新增库只会扩大实施面 [VERIFIED: .planning/REQUIREMENTS.md] |
| 继续使用 `MapContextPopup.vue` + `PointSummaryCard.vue` 两层结构 [VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue] | 新建 drawer / modal 抽象 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md] | 与锁定决策冲突，而且会重新引入已删除的 drawer 语义 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md] |

**Installation:** [VERIFIED: apps/web/package.json]
```bash
# Phase 20 无需新增依赖；沿用现有前端栈
pnpm --filter @trip-map/web add vue@3.5.32 @fontsource-variable/nunito@5.2.7
pnpm --filter @trip-map/web add -D tailwindcss@4.2.2 @tailwindcss/vite@4.2.2 vitest@4.1.3 @vue/test-utils@2.4.6
```

**Version verification:** 当前仓库已安装并且推荐继续沿用的关键版本均与 npm 当前稳定版一致；Phase 20 不应把视觉迁移夹带成依赖升级任务 [VERIFIED: npm registry][VERIFIED: apps/web/package.json].

## Architecture Patterns

### Recommended Project Structure

```text
apps/web/src/
├── App.vue                               # topbar / notice / map shell 呼吸感与轻壳收口
├── styles/
│   ├── tokens.css                        # 语义色、阴影、圆角、spacing token
│   └── global.css                        # 全局背景、排版、Leaflet 兼容补丁
├── components/
│   ├── LeafletMapStage.vue               # 地图安全边界；不接受 UI scale/translate
│   └── map-popup/
│       ├── MapContextPopup.vue           # 轻量 popup 壳与箭头
│       └── PointSummaryCard.vue          # 内层 cloud card、按钮/徽章层级、候选卡交互
└── *.spec.ts                             # 样式契约与结构回归测试
```

该结构已经存在于代码库中，planner 应按现有组件责任拆任务，而不是新增一个横切式 UI kit 重写层 [VERIFIED: apps/web/src/App.vue][VERIFIED: apps/web/src/components/LeafletMapStage.vue][VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue].

### Pattern 1: 外轻内重的 Popup / Card 分层

**What:** popup 外层只负责定位、最小边框和箭头，主云朵卡片的厚白边、大圆角和柔和阴影放在 `PointSummaryCard.vue` 内层实现 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md][VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue].

**When to use:** 所有地图 anchored summary surface 都沿用此模式，不新建第二套 modal/drawer 容器 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md].

**Example:**
```vue
<!-- Source: .planning/phases/20-kawaii/20-CONTEXT.md + codebase -->
<aside class="map-context-popup">
  <div class="map-context-popup__arrow" aria-hidden="true" />
  <div class="map-context-popup__body">
    <PointSummaryCard />
  </div>
</aside>
```

### Pattern 2: 三档 Pill 层级，而不是“一把梭同款按钮”

**What:** 主 CTA、次 CTA、信息徽章全部使用 pill 语言，但阴影强度、渐变甜度、边框对比和留白必须分层 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md].

**When to use:** `PointSummaryCard.vue` 的点亮按钮、候选确认按钮、类型胶囊、状态 badge，以及 `App.vue` 的 topbar / notice 胶囊都应套入此层级 [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue][VERIFIED: apps/web/src/App.vue].

**Example:**
```ts
// Source: Vue class/style binding docs + Tailwind utility docs + codebase
const ctaClass = computed(() => [
  'rounded-full transition duration-300 ease-out',
  'hover:scale-105 hover:-translate-y-1 active:scale-95',
  props.tone === 'primary'
    ? 'bg-sakura-300 text-white shadow-[0_14px_28px_rgba(244,143,177,0.34)]'
    : 'bg-white text-[var(--color-ink-strong)] shadow-[0_12px_24px_rgba(132,199,216,0.18)]',
])
```

### Pattern 3: Utility First，scoped CSS 只留给装饰层和 Leaflet 兼容层

**What:** 组件外观类优先迁到 Tailwind utilities；scoped CSS 仅保留不适合 utility 化的装饰背景、伪元素细节、Leaflet 相关兼容和 reduced-motion 特例 [VERIFIED: apps/web/src/App.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue][VERIFIED: apps/web/src/components/LeafletMapStage.vue][CITED: https://vuejs.org/api/sfc-css-features.html].

**When to use:** 本阶段覆盖 `App.vue`、`MapContextPopup.vue`、`PointSummaryCard.vue` 时都应遵循；避免“两套视觉规则长期并存” [VERIFIED: .planning/research/PITFALLS.md].

**Example:**
```css
/* Source: Tailwind theme docs + current token layer */
@import "tailwindcss";

@theme {
  --radius-pill: 999px;
  --shadow-kawaii-primary: 0 14px 28px rgba(244, 143, 177, 0.34);
}
```

### Anti-Patterns to Avoid

- **把 `border-4 border-white` 留在 `MapContextPopup.vue` 外壳上再给 `PointSummaryCard.vue` 继续加厚边：** 这会制造双重 chrome，直接违背 D-05 至 D-07 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md][VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue].
- **为了赶进度继续只用 scoped CSS 微调现有类：** 会继续遭遇 scoped specificity 与 utility 类冲突 [VERIFIED: .planning/research/PITFALLS.md][CITED: https://vuejs.org/api/sfc-css-features.html].
- **把 hover / active transform 施加到 `.leaflet-map-stage` 或 `.leaflet-map-stage__map`：** 会破坏地图命中与 popup 锚定稳定性 [VERIFIED: .planning/research/PITFALLS.md][VERIFIED: apps/web/src/components/LeafletMapStage.vue].
- **顺手把未挂载组件一并改造：** 会稀释本阶段交付面，且与 D-01 至 D-04 冲突 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md].

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 微交互动效 | 自定义 JS 动画状态机或新增动画库 [VERIFIED: .planning/REQUIREMENTS.md] | Tailwind utilities / 现有 CSS transition + `prefers-reduced-motion` [CITED: https://tailwindcss.com/docs/hover-focus-and-other-states][VERIFIED: apps/web/src/components/LeafletMapStage.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue] | 需求已限定纯 CSS 过渡，现有代码也已有 reduced-motion 模式可延续 [VERIFIED: .planning/REQUIREMENTS.md] |
| Popup 容器重构 | 新建 drawer、modal manager、二次抽象 popup shell [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md] | 继续使用 `MapContextPopup.vue` + `PointSummaryCard.vue` 的两层结构 [VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue] | 现有边界已经清晰，重建容器只会扩大风险面 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md] |
| 主题系统 | 组件内复制粘贴颜色/阴影魔法数并新增第二套 token 命名 [VERIFIED: apps/web/src/styles/tokens.css] | 沿用 Phase 19 `@theme` 基础色族 + `tokens.css` 语义变量 [VERIFIED: apps/web/src/style.css][VERIFIED: apps/web/src/styles/tokens.css][VERIFIED: .planning/phases/19-tailwind-token/19-CONTEXT.md] | 本阶段目标是消费已有 token，而不是重做语义体系 [VERIFIED: .planning/phases/19-tailwind-token/19-CONTEXT.md] |
| 组件通信 | 通过组件 ref 或直接改父状态驱动按钮/候选动作 [VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue] | 继续使用 props down / emits up [VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue][CITED: https://vuejs.org/guide/essentials/class-and-style.html] | 当前数据流已显式，样式迁移不应引入交互耦合 [VERIFIED: /Users/huangjingping/.agents/skills/vue-best-practices/SKILL.md] |

**Key insight:** Phase 20 的复杂度不在“功能新增”，而在把已有视觉 token、现有组件边界和微交互合同对齐；任何额外抽象、额外库或容器重建都会让 planner 平白多出非必要任务 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md][VERIFIED: .planning/PROJECT.md].

## Common Pitfalls

### Pitfall 1: 只改视觉，不统一 motion token

**What goes wrong:** 表面上变成了 pill / cloud card，但 hover 仍是 180ms `ease`、active 缺失，最终体验仍然碎片化 [VERIFIED: apps/web/src/styles/tokens.css][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue].

**Why it happens:** 当前 `--motion-emphasis` 仍是 `180ms`，候选卡与点亮按钮的 transition 直接引用它，并且只做 `translateY(-1px)` [VERIFIED: apps/web/src/styles/tokens.css][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue].

**How to avoid:** 在 Wave 0 先定义统一的 300ms `ease-out` utility 组合或 motion token，再批量替换主路径按钮/卡片 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md][CITED: https://tailwindcss.com/docs/transition-duration][CITED: https://tailwindcss.com/docs/transition-timing-function].

**Warning signs:** 代码里仍能搜到 `var(--motion-emphasis) ease`、`translateY(-1px)`，却搜不到 `duration-300` / `ease-out` / `scale-95` [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue].

### Pitfall 2: 云朵卡片质感放错层

**What goes wrong:** 外层 popup 壳和内层 card 同时有重边框/重投影，导致“套娃 chrome”而不是云朵卡片 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md].

**Why it happens:** 当前 `MapContextPopup.vue` 已带边框、圆角和阴影，而 `PointSummaryCard.vue` 仍没有主投影与厚边 [VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue].

**How to avoid:** 规划中应先做责任转移，再做视觉增强；优先让 `PointSummaryCard.vue` 获得 `border-4 border-white` + 主 shadow，`MapContextPopup.vue` 退成轻壳 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md].

**Warning signs:** `MapContextPopup.vue` 里出现厚边框 utility，而 `PointSummaryCard.vue` 仍保留 `border: 0` 或 `box-shadow: none` [VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue].

### Pitfall 3: scoped CSS 与 Tailwind utilities 长期并存

**What goes wrong:** 你在模板里加了 `rounded-full`、`shadow-*`，浏览器里却被旧 scoped 规则覆盖，看起来像 Tailwind “没生效” [VERIFIED: .planning/research/PITFALLS.md][CITED: https://vuejs.org/api/sfc-css-features.html].

**Why it happens:** Vue 的 scoped CSS 会带属性选择器，提高局部规则权重 [CITED: https://vuejs.org/api/sfc-css-features.html].

**How to avoid:** 每迁完一个组件，就删除对应的旧视觉 scoped 规则；只保留 utility 不适合表达的伪元素、装饰层和 Leaflet 兼容层 [VERIFIED: .planning/research/PITFALLS.md][VERIFIED: apps/web/src/components/LeafletMapStage.vue].

**Warning signs:** 样式文件里同时保留旧选择器和新 utility，且测试只断言文案不断言 class / attrs [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.spec.ts][VERIFIED: apps/web/src/App.spec.ts].

### Pitfall 4: hover / active 动效误伤地图坐标系

**What goes wrong:** 地图容器或其父级被 scale / translate 后，点击命中与 popup 锚定会漂移 [VERIFIED: .planning/research/PITFALLS.md].

**Why it happens:** Leaflet 的坐标和 overlay 定位依赖未被 transform 的容器几何 [VERIFIED: .planning/research/PITFALLS.md][VERIFIED: apps/web/src/components/LeafletMapStage.vue].

**How to avoid:** 只对按钮、候选卡、popup/card 表面施加 transform；`.leaflet-map-stage` 和 `.leaflet-map-stage__map` 只允许保持静态边框/背景变化 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md][VERIFIED: apps/web/src/components/LeafletMapStage.vue].

**Warning signs:** 在 `LeafletMapStage.vue` 的根容器或 map 容器上出现 `scale-*` / `translate-*` utilities 或 scoped `transform` [VERIFIED: apps/web/src/components/LeafletMapStage.vue].

### Pitfall 5: 为了更可爱而重新做厚 topbar

**What goes wrong:** 顶部栏甜度上去了，但地图首屏可视面积再次被侵占 [VERIFIED: .planning/phases/19-tailwind-token/19-CONTEXT.md][VERIFIED: .planning/quick/260408-nw1-kawaii/260408-nw1-SUMMARY.md].

**Why it happens:** 当前 `App.vue` 是薄壳护栏，任何把高度、垂直 padding 或多行内容做厚的改动都会立刻影响地图首屏 [VERIFIED: apps/web/src/App.vue][VERIFIED: .planning/phases/19-tailwind-token/19-CONTEXT.md].

**How to avoid:** 通过 pill 化、阴影、边框和颜色层级提升甜度，而不是增加 topbar 高度 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md][VERIFIED: apps/web/src/App.vue].

**Warning signs:** `App.vue` 的 header 高度超过当前 `h-14 md:h-16`，或 `main` 顶部 offset 被继续抬高 [VERIFIED: apps/web/src/App.vue].

## Code Examples

Verified patterns from official sources and current codebase:

### Tailwind v4 Theme Variables for Kawaii Utilities
```css
/* Source: https://tailwindcss.com/docs/theme */
@import "tailwindcss";

@theme {
  --color-sakura-300: #F48FB1;
  --color-cream-100: #FAFAFA;
  --radius-pill: 999px;
  --shadow-kawaii-primary: 0 14px 28px rgba(244, 143, 177, 0.34);
}
```

### Vue Class Composition for Interactive CTA
```vue
<!-- Source: https://vuejs.org/guide/essentials/class-and-style.html
     + https://tailwindcss.com/docs/hover-focus-and-other-states -->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ primary?: boolean }>()

const buttonClass = computed(() => [
  'rounded-full px-5 py-2.5 transition duration-300 ease-out',
  'hover:scale-105 hover:-translate-y-1 active:scale-95',
  props.primary
    ? 'bg-sakura-300 text-white shadow-[0_14px_28px_rgba(244,143,177,0.34)]'
    : 'bg-white/90 text-[var(--color-ink-strong)] shadow-[0_12px_24px_rgba(132,199,216,0.18)]',
])
</script>

<template>
  <button :class="buttonClass" type="button">
    点亮
  </button>
</template>
```

### Existing Popup Composition Boundary
```vue
<!-- Source: apps/web/src/components/map-popup/MapContextPopup.vue -->
<MapContextPopup
  :surface="summarySurfaceState"
  :anchor-source="popupAnchor.source"
  :floating-styles="popupFloatingStyles"
  :find-saved-point-by-city-id="findSavedPointByCityId"
  :is-saved="isActivePointSaved"
  :is-pending="isActivePointPending"
  :is-illuminatable="isActivePointIlluminatable"
/>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 / JS config 心智模型 [VERIFIED: .planning/research/PITFALLS.md] | Tailwind v4 CSS-first + `@tailwindcss/vite` + `@theme` [CITED: https://tailwindcss.com/docs/installation/using-vite][CITED: https://tailwindcss.com/docs/theme] | Tailwind v4 稳定后，项目在 Phase 19 落地 [VERIFIED: .planning/phases/19-tailwind-token/19-CONTEXT.md] | Phase 20 应消费既有 token，不再讨论配置迁移 [VERIFIED: .planning/phases/19-tailwind-token/19-CONTEXT.md] |
| `App.vue` 作为重壳容器 [VERIFIED: .planning/quick/260408-nw1-kawaii/260408-nw1-SUMMARY.md] | `App.vue` 保持薄壳，地图首屏优先 [VERIFIED: apps/web/src/App.vue][VERIFIED: .planning/phases/19-tailwind-token/19-CONTEXT.md] | 2026-04-08 quick task `260408-nw1` [VERIFIED: .planning/STATE.md] | Phase 20 的可爱化必须以不涨高 topbar 为前提 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md] |
| popup / drawer wording 混用 [VERIFIED: .planning/ROADMAP.md] | 真实主路径只剩 anchored popup，drawer 不再存在 [VERIFIED: .planning/phases/15-服务端记录与点亮闭环/15-CONTEXT.md][VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md] | Phase 15 删除 drawer 后 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md] | Planner 不应为 roadmap 旧 wording 重新造 drawer 任务 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md] |

**Deprecated/outdated:**
- `tailwind.config.js` 方案：对当前项目是过时路径，官方 v4 文档要求走 CSS-first / Vite 插件路线 [CITED: https://tailwindcss.com/docs/installation/using-vite][CITED: https://tailwindcss.com/docs/theme].
- “全仓 UI 清扫”范围：对 Phase 20 来说是过时假设，当前锁定范围只覆盖主路径可见表面 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md].

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `src/components/map-popup/PointSummaryCard.kawaii.spec.ts` 适合作为 `STYLE-03` / `INTER-01` / `INTER-02` / `INTER-03` 的集中契约测试文件 [ASSUMED] | Validation Architecture | 可能导致 planner 先建错测试文件边界，后续还要拆分 [ASSUMED] |
| A2 | `src/components/map-popup/MapContextPopup.kawaii.spec.ts` 适合作为 `STYLE-04` 的分层契约测试文件 [ASSUMED] | Validation Architecture | 可能导致 popup/card 断言分布不合理 [ASSUMED] |
| A3 | `src/App.kawaii.spec.ts` 适合作为 `STYLE-05` 的 shell/notice 合同测试文件 [ASSUMED] | Validation Architecture | 可能导致 shell 间距断言与现有 `App.spec.ts` 重复或分散 [ASSUMED] |

现有研究结论本身已验证完毕；仅测试文件命名与拆分方式仍属于 planner 可自行确认的实现级假设 [VERIFIED: apps/web/src/App.spec.ts][VERIFIED: apps/web/src/components/map-popup/MapContextPopup.spec.ts][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.spec.ts].

## Open Questions (RESOLVED)

1. **主 CTA / 次 CTA / 信息徽章是否要抽成共享 class 常量或小型样式映射，而不是直接散落在模板字符串里？**
   - Resolution: 保持抽象层级停留在组件内局部 class 组合 / `computed` 映射，不在 Phase 20 新建跨文件通用 UI kit 或 base button 抽象 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md][VERIFIED: .planning/phases/20-kawaii/20-03-PLAN.md].
   - Why this is settled: 已生成计划把主要视觉收口集中在 `PointSummaryCard.vue`，并把 `App.vue`、`MapContextPopup.vue`、`PointSummaryCard.vue` 按现有边界拆成独立计划，符合“最小改动、沿既有结构推进”的项目约束 [VERIFIED: CLAUDE.md][VERIFIED: .planning/phases/20-kawaii/20-01-PLAN.md][VERIFIED: .planning/phases/20-kawaii/20-02-PLAN.md][VERIFIED: .planning/phases/20-kawaii/20-03-PLAN.md].

2. **notice 是否需要与 popup/card 完全同级的 cloud card 视觉，还是只需 pill 化和呼吸感增强？**
   - Resolution: notice 明确定位为轻量 pill notice，不升级为与 popup/card 同级的主云朵卡视觉 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md][VERIFIED: .planning/phases/20-kawaii/20-UI-SPEC.md][VERIFIED: .planning/phases/20-kawaii/20-01-PLAN.md].
   - Why this is settled: `App.vue` 的 topbar 必须继续保持 thin-shell，不增加头部高度；计划 20-01 已把 notice 约束为 `data-kawaii-notice="pill"` 和 pill 语言，不与 popup/card 争夺主视觉 [VERIFIED: .planning/phases/19-tailwind-token/19-CONTEXT.md][VERIFIED: .planning/quick/260408-nw1-kawaii/260408-nw1-SUMMARY.md][VERIFIED: .planning/phases/20-kawaii/20-01-PLAN.md].

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `node` | Vue / Vite / Vitest / `vue-tsc` 执行 [VERIFIED: CLAUDE.md] | ✓ [VERIFIED: local environment] | `v22.22.1` [VERIFIED: local environment] | — |
| `pnpm` | workspace 脚本、单包测试与类型检查 [VERIFIED: package.json][VERIFIED: CLAUDE.md] | ✓ [VERIFIED: local environment] | `10.33.0` [VERIFIED: local environment] | `npm` 仅可做 registry 查询，不适合作为 workspace fallback [VERIFIED: local environment] |
| `npm` | registry 版本核验 [VERIFIED: this research process] | ✓ [VERIFIED: local environment] | `10.9.4` [VERIFIED: local environment] | — |

**Missing dependencies with no fallback:**
- None [VERIFIED: local environment].

**Missing dependencies with fallback:**
- None [VERIFIED: local environment].

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `4.1.3` + Vue Test Utils `2.4.6` [VERIFIED: npm registry][VERIFIED: apps/web/package.json] |
| Config file | `apps/web/vitest.config.ts` [VERIFIED: apps/web/vitest.config.ts] |
| Quick run command | `pnpm --filter @trip-map/web test -- src/components/map-popup/PointSummaryCard.spec.ts` [VERIFIED: local environment] |
| Full suite command | `pnpm --filter @trip-map/web test` [VERIFIED: local environment] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STYLE-03 | button / badge 根元素带 pill class、语义阴影和层级 attrs [VERIFIED: .planning/REQUIREMENTS.md] | component contract [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.spec.ts][VERIFIED: apps/web/src/App.spec.ts] | `pnpm --filter @trip-map/web test -- src/components/map-popup/PointSummaryCard.kawaii.spec.ts` [ASSUMED] | ❌ Wave 0 [VERIFIED: codebase grep] |
| STYLE-04 | inner card 具备 `rounded-3xl` / `border-4 border-white` / cloud shadow，popup shell 保持轻壳 [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md] | component contract [VERIFIED: apps/web/src/components/map-popup/MapContextPopup.spec.ts] | `pnpm --filter @trip-map/web test -- src/components/map-popup/MapContextPopup.kawaii.spec.ts` [ASSUMED] | ❌ Wave 0 [VERIFIED: codebase grep] |
| STYLE-05 | 主路径表面间距达到宽松阈值，不再出现紧贴边缘 [VERIFIED: .planning/REQUIREMENTS.md] | component contract [VERIFIED: apps/web/src/App.spec.ts] | `pnpm --filter @trip-map/web test -- src/App.kawaii.spec.ts` [ASSUMED] | ❌ Wave 0 [VERIFIED: codebase grep] |
| INTER-01 | hover class 统一为 `scale-105` + `-translate-y-1` + `duration-300 ease-out` [VERIFIED: .planning/REQUIREMENTS.md] | class contract [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.spec.ts] | `pnpm --filter @trip-map/web test -- src/components/map-popup/PointSummaryCard.kawaii.spec.ts` [ASSUMED] | ❌ Wave 0 [VERIFIED: codebase grep] |
| INTER-02 | 主 / 次 CTA 都有 active `scale-95` [VERIFIED: .planning/REQUIREMENTS.md] | class contract [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.spec.ts] | `pnpm --filter @trip-map/web test -- src/components/map-popup/PointSummaryCard.kawaii.spec.ts` [ASSUMED] | ❌ Wave 0 [VERIFIED: codebase grep] |
| INTER-03 | 所有新过渡收口到 300ms `ease-out`，且 reduced-motion 仍可降级 [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: apps/web/src/components/LeafletMapStage.vue] | class contract + smoke [VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.spec.ts][VERIFIED: apps/web/src/App.spec.ts] | `pnpm --filter @trip-map/web test -- src/components/map-popup/PointSummaryCard.kawaii.spec.ts` [ASSUMED] | ❌ Wave 0 [VERIFIED: codebase grep] |

### Sampling Rate

- **Per task commit:** `pnpm --filter @trip-map/web test -- src/components/map-popup/PointSummaryCard.spec.ts` [VERIFIED: local environment]
- **Per wave merge:** `pnpm --filter @trip-map/web test && pnpm --filter @trip-map/web typecheck` [VERIFIED: local environment]
- **Phase gate:** Full suite green before `/gsd-verify-work` [VERIFIED: .planning/config.json]

### Wave 0 Gaps

- [ ] `apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts` — 覆盖 `STYLE-03`、`INTER-01`、`INTER-02`、`INTER-03` [VERIFIED: codebase grep]
- [ ] `apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts` — 覆盖 `STYLE-04` 的外轻内重分层约束 [VERIFIED: codebase grep]
- [ ] `apps/web/src/App.kawaii.spec.ts` — 覆盖 notice / topbar / map shell 的 pill 与 spacing 合同 [VERIFIED: codebase grep]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no [VERIFIED: .planning/PROJECT.md] | 本阶段无认证改动 [VERIFIED: .planning/PROJECT.md] |
| V3 Session Management | no [VERIFIED: .planning/PROJECT.md] | 本阶段无会话改动 [VERIFIED: .planning/PROJECT.md] |
| V4 Access Control | no [VERIFIED: .planning/PROJECT.md] | 本阶段无权限改动 [VERIFIED: .planning/PROJECT.md] |
| V5 Input Validation | yes [CITED: https://vuejs.org/api/sfc-css-features.html][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue][VERIFIED: apps/web/src/App.vue] | 继续使用 Vue 模板插值，不引入 `v-html` 或不受信 HTML 注入 [CITED: https://vuejs.org/api/sfc-css-features.html][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue][VERIFIED: apps/web/src/App.vue] |
| V6 Cryptography | no [VERIFIED: .planning/PROJECT.md] | 本阶段无加密改动 [VERIFIED: .planning/PROJECT.md] |

### Known Threat Patterns for Vue + Tailwind + Leaflet UI Surface

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| 不受信 HTML 注入到 popup / notice | Tampering [CITED: https://vuejs.org/api/sfc-css-features.html] | 保持模板文本插值，不使用 `v-html` 渲染地点文案 [CITED: https://vuejs.org/api/sfc-css-features.html][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue][VERIFIED: apps/web/src/App.vue] |
| 视觉层 transform 误伤地图命中区域 | Tampering [VERIFIED: .planning/research/PITFALLS.md] | 仅对 UI 表面使用 transform，不对 `.leaflet-map-stage` / map 容器使用 [VERIFIED: .planning/research/PITFALLS.md][VERIFIED: apps/web/src/components/LeafletMapStage.vue] |
| 过厚装饰层遮挡交互热点 | Denial of Service [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue] | 保持 popup 外壳轻量、按钮最小点击面积和 clear z-index 层级，避免 decorative pseudo-elements 接管 pointer events [VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue] |

## Sources

### Primary (HIGH confidence)

- `apps/web/package.json` — 前端实际依赖版本与脚本 [VERIFIED: codebase]
- `apps/web/src/App.vue` — topbar / notice / map shell 当前结构与样式现状 [VERIFIED: codebase]
- `apps/web/src/components/map-popup/MapContextPopup.vue` — popup 外壳职责与当前 chrome 强度 [VERIFIED: codebase]
- `apps/web/src/components/map-popup/PointSummaryCard.vue` — 主卡片、按钮、候选卡、徽章与当前 transition 现状 [VERIFIED: codebase]
- `apps/web/src/components/LeafletMapStage.vue` — 地图安全边界、reduced-motion 和 transform 风险 [VERIFIED: codebase]
- `apps/web/src/styles/tokens.css` — spacing / radius / shadow / motion token [VERIFIED: codebase]
- `apps/web/vitest.config.ts` — 当前测试框架配置 [VERIFIED: codebase]
- `https://tailwindcss.com/docs/installation/using-vite` — Tailwind v4 官方 Vite 集成 [CITED: official docs]
- `https://tailwindcss.com/docs/theme` — Tailwind v4 `@theme` 与 theme variable 命名空间 [CITED: official docs]
- `https://tailwindcss.com/docs/hover-focus-and-other-states` — 交互状态变体 [CITED: official docs]
- `https://tailwindcss.com/docs/border-radius` — `rounded-full` 等圆角 utility [CITED: official docs]
- `https://tailwindcss.com/docs/scale` — `scale-*` utility [CITED: official docs]
- `https://tailwindcss.com/docs/translate` — `translate-*` utility [CITED: official docs]
- `https://tailwindcss.com/docs/transition-duration` — `duration-300` utility [CITED: official docs]
- `https://tailwindcss.com/docs/transition-timing-function` — `ease-out` utility [CITED: official docs]
- `https://vuejs.org/guide/essentials/class-and-style.html` — Vue class 绑定与类合并模式 [CITED: official docs]
- `https://vuejs.org/api/sfc-css-features.html` — Vue SFC scoped CSS 行为 [CITED: official docs]
- npm registry (`npm view`) — `tailwindcss`、`@tailwindcss/vite`、`vue`、`vite`、`vitest`、`@vue/test-utils`、`@fontsource-variable/nunito` 的当前版本与发布时间 [VERIFIED: npm registry]

### Secondary (MEDIUM confidence)

- `.planning/research/SUMMARY.md` — v4.0 里程碑既有研究摘要 [VERIFIED: codebase]
- `.planning/research/PITFALLS.md` — Tailwind / Leaflet / scoped CSS 失败模式 [VERIFIED: codebase]
- `.planning/phases/19-tailwind-token/19-CONTEXT.md` — Phase 19 carry-forward 约束 [VERIFIED: codebase]
- `.planning/phases/20-kawaii/20-CONTEXT.md` — Phase 20 锁定边界与视觉层级 [VERIFIED: codebase]

### Tertiary (LOW confidence)

- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - 依赖版本已通过 npm registry 核验，且与仓库现状一致 [VERIFIED: npm registry][VERIFIED: apps/web/package.json]
- Architecture: HIGH - 组件边界、用户锁定决策和现有代码职责高度一致 [VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md][VERIFIED: apps/web/src/App.vue][VERIFIED: apps/web/src/components/map-popup/MapContextPopup.vue][VERIFIED: apps/web/src/components/map-popup/PointSummaryCard.vue]
- Pitfalls: HIGH - 既有 research、官方文档和代码现状相互印证 [VERIFIED: .planning/research/PITFALLS.md][CITED: https://vuejs.org/api/sfc-css-features.html][VERIFIED: apps/web/src/components/LeafletMapStage.vue]

**Research date:** 2026-04-09
**Valid until:** 2026-05-09 [VERIFIED: apps/web/package.json][VERIFIED: .planning/phases/20-kawaii/20-CONTEXT.md]
