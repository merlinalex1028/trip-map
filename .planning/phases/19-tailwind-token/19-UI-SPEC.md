---
phase: 19
slug: tailwind-token
status: draft
shadcn_initialized: false
preset: none
created: 2026-04-08
---

# Phase 19 — UI Design Contract

> 面向前端 phase 的视觉与交互合同。由 gsd-ui-researcher 生成，供 gsd-planner、gsd-executor 与 gsd-ui-checker 直接消费。

---

## Phase Boundary

- 本阶段只建立 Tailwind v4 基础设施、全局字体基线和 foundation token 暴露，不做全量组件视觉迁移。
- `App.vue` 只允许承担最小 Tailwind 样板：页面背景、topbar、notice、地图外框。
- `LeafletMapStage.vue`、`MapContextPopup.vue`、`PointSummaryCard.vue` 在本阶段只承担“样式不被破坏”的兼容观察点，不做 kawaii 化收口。
- Leaflet 控件、归因链接、图层控件与 popup 的目标是“视觉稳定”，不是“更可爱”。

来源：`19-CONTEXT.md` D-06 至 D-11，`19-RESEARCH.md` Summary / Common Pitfalls。

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | none（沿用 Leaflet 内建控件图形，无独立 icon 套件） |
| Font | Nunito Variable（全站默认） |

来源：`19-CONTEXT.md` D-04、D-05，代码现状侦察：仓库无 `components.json`、无 `tailwind.config.*`、无 `postcss.config.*`。默认：不引入 shadcn。

## Token Exposure Contract

本阶段必须通过 Tailwind v4 `@theme {}` 暴露 foundation-only token，且继续保留现有语义 CSS variable，不在本阶段重建语义 token。

| Family | Required Utility Contract | Purpose |
|--------|---------------------------|---------|
| `sakura` | `bg-sakura-100` `bg-sakura-300` `text-sakura-500` | 非地图 UI 的柔和粉色强调 |
| `mint` | `bg-mint-100` `bg-mint-300` `text-mint-500` | 辅助状态与清爽分层 |
| `lavender` | `bg-lavender-100` `bg-lavender-300` `text-lavender-500` | 次级强调与标题/标签点缀 |
| `cream` | `bg-cream-100` `bg-cream-200` `bg-cream-300` | 页面与容器底色 |

| Token | Value |
|-------|-------|
| `--color-sakura-100` | `#FFD7EA` |
| `--color-sakura-300` | `#F48FB1` |
| `--color-sakura-500` | `#FF78AD` |
| `--color-mint-100` | `#D8F6E8` |
| `--color-mint-300` | `#B8EAD6` |
| `--color-mint-500` | `#7ED9B6` |
| `--color-lavender-100` | `#F1E8FF` |
| `--color-lavender-300` | `#DBC4FF` |
| `--color-lavender-500` | `#B79BEA` |
| `--color-cream-100` | `#FAFAFA` |
| `--color-cream-200` | `#FFF5F5` |
| `--color-cream-300` | `#FDF5FF` |

补充约束：

- `selected`、`saved`、`fallback`、`surface` 等语义变量继续留在普通 CSS variable 层，不在本 phase 映射成 Tailwind 语义 token。
- 新增 Tailwind token 只服务基础设施可用和壳层样板，不触碰 Leaflet 专用样式命名。

来源：`19-CONTEXT.md` D-01 至 D-03，`REQUIREMENTS.md` STYLE-01，`apps/web/src/styles/tokens.css`。默认：`mint-300`、`mint-500`、`lavender-100`、`lavender-500` 由现有色盘连续性推导。

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | icon 与文字微间隙、细小 inline padding |
| sm | 8px | 紧凑提示条、topbar 内部短间距 |
| md | 16px | 默认元素间距、notice 与壳层基础 spacing |
| lg | 24px | 地图外框内边距、section 级 padding |
| xl | 32px | 页面外边距、桌面壳层左右留白 |
| 2xl | 48px | 大区块间隔、notice 与视口边缘安全留白 |
| 3xl | 64px | 页面级 breathing room 上限 |

Exceptions: 顶部栏固定高度允许使用 `56px`（移动端）与 `64px`（桌面端）；这是壳层尺寸，不作为通用 spacing token。

来源：`apps/web/src/styles/tokens.css` 现有 spacing token，`19-CONTEXT.md` D-06、D-07。默认：将当前 topbar 高度收敛到 8-point 兼容尺寸。

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 400 | 1.5 |
| Label | 14px | 600 | 1.4 |
| Heading | 24px | 600 | 1.2 |
| Display | 40px | 600 | 1.1 |

补充约束：

- 全站默认字体统一为 `Nunito Variable`，并通过 Tailwind `--font-sans` 对齐到 `body` 默认字体。
- 本阶段不保留旧 display 字体链作为默认入口；如需保留旧链，仅允许作为过渡兼容而非默认渲染。

来源：`19-CONTEXT.md` D-04、D-05，`apps/web/src/styles/tokens.css` 字号基线。默认：权重收敛为两档 `400/600`。

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#FAFAFA` | 页面底色、`body` 根画布、非地图区域的主背景 |
| Secondary (30%) | `#FDF5FF` | topbar、notice、map shell chrome、柔和浮层表面 |
| Accent (10%) | `#F48FB1` | 品牌 kicker、短时 notice 强调、未来主 CTA 填充 |
| Destructive | `#C86464` | 仅 destructive action 与确认态警示 |

Accent reserved for: `topbar` 品牌小标签、壳层 notice 强调、后续主 CTA 与选中态点缀；不得用于 Leaflet 缩放按钮、归因链接、地图底图、正文大段文本。

补充约束：

- 页面背景必须保持奶油白感，允许使用 `#FAFAFA` 到 `#FFF5F5` 的轻微渐变，但不可回到纯白硬底。
- `mint`、`lavender` 是辅助 tonal family，不替代主 accent。

来源：`REQUIREMENTS.md` STYLE-01、STYLE-02，`19-CONTEXT.md` D-01、D-09、D-10，`apps/web/src/styles/tokens.css`。默认：60/30/10 分配由 Phase 19 壳层用途推导。

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | 添加旅点 |
| Empty state heading | 还没有旅点 |
| Empty state body | 点击地图落下第一个旅点，开始记录这次出发。 |
| Error state | 地图暂时没有准备好，请刷新页面后重试；如果问题持续，请稍后再回来。 |
| Destructive confirmation | 无：本阶段不新增 destructive action，也不新增确认弹窗。 |

来源：上游文档未锁定具体文案。默认：根据产品核心价值与地图记录场景补齐。

## Interaction Stability Contract

- 本阶段的交互原则是“稳定优先”，不是“全面动效升级”。
- 如 `App.vue` 最小 Tailwind 样板需要 hover/active 示例，只允许用于非地图壳层 UI，动作上限为 `scale-105`、`-translate-y-1`、`300ms`、`ease-out`。
- 禁止对 `.leaflet-container`、`.leaflet-pane`、地图 canvas，及其影响坐标系的父层应用 `transform`、`scale`、`filter`、`perspective`。
- Tailwind `@import "tailwindcss"` 必须在前，Leaflet CSS 必须在后；现有 Leaflet SVG 兼容规则继续保留，直到浏览器冒烟验证证明可移除。
- 不在本阶段改造 Leaflet 缩放按钮、归因链接、图层控件、popup 视觉语言；验证标准是“不坏、不偏、不退化”。

来源：`19-CONTEXT.md` D-09 至 D-11，`19-RESEARCH.md` Common Pitfalls / Validation Architecture，`apps/web/src/styles/global.css`。

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable |
| third-party | none | not applicable |

来源：当前项目为 Vue 3 + Vite，且未初始化 shadcn。默认：不引入第三方 registry。

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
