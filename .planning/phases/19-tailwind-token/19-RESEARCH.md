# Phase 19: tailwind-token - Research

**Researched:** 2026-04-08  
**Domain:** Tailwind CSS v4 + Vue 3 + Vite 8 + Leaflet 样式基础设施 [VERIFIED: codebase grep] [CITED: https://tailwindcss.com/docs/installation/using-vite] [CITED: https://leafletjs.com/examples/quick-start/]  
**Confidence:** HIGH [VERIFIED: npm registry] [VERIFIED: codebase grep] [CITED: https://tailwindcss.com/docs/theme]

<user_constraints>
## User Constraints (from CONTEXT.md)

[VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-CONTEXT.md] 以下内容按 `19-CONTEXT.md` 原文抄录，供 planner 直接继承。

### Locked Decisions
- **D-01:** Tailwind v4 在 Phase 19 只暴露基础色族 `sakura`、`mint`、`lavender`、`cream`，先满足 `bg-sakura-*`、`text-lavender-*` 这类工具类可直接使用的目标。
- **D-02:** 现有语义变量（如 selected / saved / fallback / surface）暂时继续留在普通 CSS variable 层，不在 Phase 19 里同步重建为 Tailwind 语义 token；是否做语义桥接留给 Phase 20 再统一决策。
- **D-03:** Phase 19 的 token 设计优先服务“基础设施可用”和“与现有 kawaii palette 连续”，而不是借机重做整套语义命名体系。
- **D-04:** 全站默认字体在 Phase 19 直接统一切到 `Nunito Variable`，并通过 Tailwind `@theme --font-sans` 让 `font-sans` 与全局默认字体保持一致。
- **D-05:** 标题、正文和常规 UI 文字在本阶段都先共享 `Nunito Variable` 基线，不保留旧 display 字体链作为默认入口；目标是先确保“全站已明显切到圆润字体”这一成功标准明确达成。
- **D-06:** 在完成 Tailwind v4、`style.css` 主入口、字体导入和 Leaflet preflight 兼容之后，Phase 19 允许顺手把 `App.vue` 外壳层做成最小 Tailwind 样板，作为 Phase 20 的迁移模板。
- **D-07:** 这个最小样板只覆盖页面壳层级别内容，例如 topbar、页面背景、notice、地图外框等，不扩展到 popup/card 等更深层组件；组件全面迁移仍留到 Phase 20。
- **D-08:** `App.vue` 继续保持“视觉壳层”职责，不迁入地图业务逻辑，也不改变现有 store、Leaflet 交互和 popup/drawer 语义。
- **D-09:** Phase 19 对 Leaflet 的要求是“安全兼容优先”：保证控件、缩放按钮、归因链接、图层控件与 popup 不因 Tailwind preflight 受损，视觉上尽量保持当前 v3.0 / quick-task 之后的稳定状态。
- **D-10:** 本阶段不主动对 Leaflet 控件做 kawaii 化收口；只要样式正常、不崩、不退化即可，完整视觉对齐留给后续组件迁移阶段判断。
- **D-11:** 继续沿用研究文档确定的关键防护：`@import "tailwindcss"` 在前、Leaflet CSS 在后；hover / scale 等 transform 只允许用于 UI 组件，不允许用于 Leaflet 地图容器或其影响坐标系的父层。

### Claude's Discretion
- Phase 19 中 `sakura` / `mint` / `lavender` / `cream` 各自扩展到多少 shade，具体数值如何从现有 `tokens.css` 映射到 `@theme`，由后续 researcher / planner 结合现有色盘决定。
- `style.css` 是否同时承接一部分现有 `global.css` / `tokens.css` 内容，或采用“新增主入口 + 暂留旧文件承接少量兼容层”的过渡方式，由后续规划决定。
- `App.vue` 最小 Tailwind 样板的具体粒度、保留多少 `scoped CSS` 作为过渡层，以及哪些类应先迁移为 utilities，由后续规划决定，只要不越过本阶段边界。

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md] [VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-CONTEXT.md] 下面的映射只覆盖本 phase 被明确点名的 requirement IDs。

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | `apps/web` 已安装 `tailwindcss` v4 + `@tailwindcss/vite`，`vite.config.ts` 已配置 Tailwind Vite 插件。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` | `## Standard Stack`、`## Architecture Patterns / Pattern 1`、`## Environment Availability` 说明依赖版本、安装命令与插件接入点。 `[VERIFIED: codebase grep] [VERIFIED: npm registry] [CITED: https://tailwindcss.com/docs/installation/using-vite]` |
| INFRA-02 | `apps/web/src/style.css` 包含 `@import "tailwindcss"` + `@theme {}` kawaii 调色板，Leaflet CSS 在其后引入（顺序正确）。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` | `## Architecture Patterns / Pattern 1`、`## Common Pitfalls / Pitfall 1`、`## Code Examples` 说明单一 CSS 入口、import 顺序与 token 写法。 `[CITED: https://tailwindcss.com/docs/installation/using-vite] [CITED: https://tailwindcss.com/docs/theme] [CITED: https://tailwindcss.com/docs/preflight]` |
| INFRA-03 | `@fontsource-variable/nunito` 已安装，在 `main.ts` 导入，Nunito Variable 字体全局生效。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` | `## Standard Stack`、`## Architecture Patterns / Pattern 2`、`## Code Examples` 说明字体包版本、入口导入与 `--font-sans` 接法。 `[VERIFIED: npm registry] [VERIFIED: codebase grep] [CITED: https://tailwindcss.com/docs/theme]` |
| INFRA-04 | Leaflet 地图控件、缩放按钮、归因链接在 Tailwind 集成后样式正常，无 preflight 副作用。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` | `## Architecture Patterns / Pattern 3`、`## Common Pitfalls / Pitfall 1`、`## Validation Architecture` 说明 import 顺序、必要覆盖层与人工冒烟门禁。 `[CITED: https://tailwindcss.com/docs/preflight] [CITED: https://leafletjs.com/examples/quick-start/] [VERIFIED: codebase grep]` |
| STYLE-01 | 页面全局背景为奶油白（#FAFAFA / #FFF5F5），Tailwind 工具类可使用 `sakura`、`mint`、`lavender`、`cream` 颜色。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` | `## Summary`、`## Standard Stack`、`## Architecture Patterns / Pattern 1` 说明 Tailwind 颜色 token 必须使用带档位的 `--color-*` 变量，并保留 `cream` 的浅阶做全局底色。 `[VERIFIED: codebase grep] [CITED: https://tailwindcss.com/docs/theme]` |
| STYLE-02 | 全站字体为 Nunito Variable（圆润友好），通过 `@theme --font-sans` 设置为默认字体。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` | `## Architecture Patterns / Pattern 2`、`## Code Examples`、`## Common Pitfalls / Pitfall 3` 说明全局字体切换方式与 `@theme inline`/字面量 font stack 的选择。 `[CITED: https://tailwindcss.com/docs/theme] [VERIFIED: npm registry]` |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- 与用户和文档产物保持中文。 `[VERIFIED: /Users/huangjingping/i/trip-map/CLAUDE.md]`
- 前端继续使用 Vue 3 Composition API + `<script setup lang="ts">`，不引入 Options API。 `[VERIFIED: /Users/huangjingping/i/trip-map/CLAUDE.md]`
- 包管理器固定为 `pnpm@10.33.0`，monorepo 由 Turborepo 编排。 `[VERIFIED: /Users/huangjingping/i/trip-map/CLAUDE.md] [VERIFIED: /Users/huangjingping/i/trip-map/package.json]`
- 前端类型检查命令必须能通过 `vue-tsc --noEmit`。 `[VERIFIED: /Users/huangjingping/i/trip-map/CLAUDE.md] [VERIFIED: codebase grep]`
- 测试框架统一为 Vitest，前端测试环境是 `happy-dom`。 `[VERIFIED: /Users/huangjingping/i/trip-map/CLAUDE.md] [VERIFIED: /Users/huangjingping/i/trip-map/apps/web/vitest.config.ts]`
- 仓库内不存在项目本地 `.claude/skills/` 或 `.agents/skills/` 目录，因此没有额外项目局部 skill 覆盖约束。 `[VERIFIED: filesystem probe]`

## Summary

Phase 19 的规划重点不是“把 UI 全部迁成 Tailwind”，而是用最小改动把 `apps/web` 从“分散 CSS 入口”切换到“单一 `src/style.css` 入口 + Tailwind v4 CSS-first token + 叶子节点不破坏的 Leaflet 兼容层”；当前代码已经把关键接入点集中在 `apps/web/package.json`、`apps/web/vite.config.ts`、`apps/web/src/main.ts`、`apps/web/src/styles/tokens.css`、`apps/web/src/styles/global.css` 和 `apps/web/src/App.vue`，因此这是一个低风险的基础设施 phase。 `[VERIFIED: codebase grep]`

本 phase 最容易规划错的地方有两个：第一，想得到 `bg-sakura-100`、`text-lavender-500` 这种工具类，必须定义带数字档位的 `--color-sakura-100`、`--color-lavender-500` 等 theme variable，而不是只有 `--color-sakura` 这种单值 token；第二，Tailwind Preflight 会重置 margin、border、heading、list、image 等基础样式，官方也明确提示第三方库会受影响，所以 Leaflet 只能走“Tailwind 在前、Leaflet CSS 在后、必要时加极窄覆盖层”的路线，不能靠全局关闭 preflight 或重写 Leaflet 控件来规避。 `[CITED: https://tailwindcss.com/docs/theme] [CITED: https://tailwindcss.com/docs/preflight] [VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-CONTEXT.md]`

当前仓库已经具备 Node、pnpm、npm registry 访问、Vitest/happy-dom 与 Vue 3 + Vite 8 运行条件，所以 planner 可以直接把 Phase 19 拆成“依赖接入、`style.css` 主入口、`App.vue` 最小样板、Leaflet 人工冒烟、静态/源文件测试补齐”几类任务；真正需要用户或 planner 决定的自由度只剩下色阶数量、`style.css` 是否暂时转引 `tokens.css/global.css`、以及 `App.vue` 样板迁移到哪个粒度。 `[VERIFIED: filesystem probe] [VERIFIED: codebase grep] [VERIFIED: npm registry]`

**Primary recommendation:** 规划时把 Phase 19 定义为“单入口 CSS 基础设施迁移”，要求一次性交付 `tailwindcss@4.2.2` + `@tailwindcss/vite@4.2.2` + `@fontsource-variable/nunito@5.2.7`、带数字档位的四个 kawaii 色族、全局 `font-sans = Nunito Variable`、Leaflet CSS 顺序验证和 `App.vue` 壳层样板，不要把 popup/card/button 的全面 Tailwind 化混进本 phase。 `[VERIFIED: npm registry] [CITED: https://tailwindcss.com/docs/installation/using-vite] [CITED: https://tailwindcss.com/docs/theme] [VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-CONTEXT.md]`

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `tailwindcss` | `4.2.2` published `2026-03-18` `[VERIFIED: npm registry]` | 提供 Tailwind v4 utility、preflight 与 `@theme` token 系统。 `[CITED: https://tailwindcss.com/docs/theme]` | 官方 Vite 安装文档直接要求安装 `tailwindcss` 并在 CSS 中 `@import "tailwindcss"`。 `[CITED: https://tailwindcss.com/docs/installation/using-vite]` |
| `@tailwindcss/vite` | `4.2.2` published `2026-03-18` `[VERIFIED: npm registry]` | 把 Tailwind 作为 Vite 插件接入 `apps/web/vite.config.ts`。 `[CITED: https://tailwindcss.com/docs/installation/using-vite]` | 官方当前推荐的 Vite 集成方式就是 `@tailwindcss/vite`，不需要先走 PostCSS。 `[CITED: https://tailwindcss.com/docs/installation/using-vite]` |
| `@fontsource-variable/nunito` | `5.2.7` published `2025-09-17` `[VERIFIED: npm registry]` | 以 npm 包形式自托管 `Nunito Variable`，避免 CDN 依赖。 `[VERIFIED: npm registry]` | Phase 19 要求默认字体切换为 `Nunito Variable`，该包直接支持 `import "@fontsource-variable/nunito"` 和 CSS `font-family: "Nunito Variable"`。 `[VERIFIED: npm registry]` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `leaflet` | `^1.9.4`（当前已安装） `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/package.json]` | 继续提供地图控件、归因和地图容器样式基线。 `[CITED: https://leafletjs.com/examples/quick-start/]` | 只需要保持现有地图样式稳定；Phase 19 不重写 Leaflet 视觉。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-CONTEXT.md]` |
| `Vitest + happy-dom` | `4.1.3` + `happy-dom` environment `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/package.json] [VERIFIED: /Users/huangjingping/i/trip-map/apps/web/vitest.config.ts]` | 做静态入口与壳层 smoke 测试。 `[VERIFIED: codebase grep]` | 适合验证 `vite.config.ts` / `main.ts` / `style.css` 文本约束，但不适合判断真实 Leaflet 控件视觉。 `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/vitest.config.ts] [ASSUMED]` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@tailwindcss/vite` | PostCSS 或 CLI 管线 | 官方当前 Vite 文档直接给出 Vite 插件方案；继续走旧式 PostCSS 只会增加配置面。 `[CITED: https://tailwindcss.com/docs/installation/using-vite]` |
| `@fontsource-variable/nunito` | Google Fonts CDN | CDN 方案会引入额外网络依赖，而项目要求纯前端改造且 `Out of Scope` 明确排除了 Google Fonts CDN。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` |
| 在 `main.ts` 继续分散导入 `tokens.css` / `global.css` / `leaflet.css` | 单一 `src/style.css` 主入口 | Phase requirement 已显式要求 `src/style.css` 成为 Tailwind 与 Leaflet 的顺序控制点，因此继续分散导入会让 import 顺序不可集中验证。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md] [VERIFIED: codebase grep]` |

**Installation:** `[VERIFIED: /Users/huangjingping/i/trip-map/CLAUDE.md] [VERIFIED: /Users/huangjingping/i/trip-map/package.json]`

```bash
pnpm --filter @trip-map/web add -D tailwindcss @tailwindcss/vite
pnpm --filter @trip-map/web add @fontsource-variable/nunito
```

**Version verification:** 以下版本已在本次研究中用 npm registry 实查。 `[VERIFIED: npm registry]`

```bash
npm view tailwindcss version
npm view @tailwindcss/vite version
npm view @fontsource-variable/nunito version
```

## Architecture Patterns

### Recommended Project Structure

```text
apps/web/
├── package.json            # 新增 Tailwind/Nunito 依赖
├── vite.config.ts          # 注册 @tailwindcss/vite
└── src/
    ├── main.ts             # 改为只导入字体 + style.css
    ├── style.css           # Tailwind 主入口、Leaflet 顺序、@theme、过渡期 import hub
    ├── styles/
    │   ├── tokens.css      # 继续承接旧语义变量与 legacy token
    │   └── global.css      # 继续承接全局补充规则与 Leaflet SVG 兼容层
    └── App.vue             # Phase 19 允许做最小 Tailwind 壳层样板
```

### Pattern 1: 单一 `style.css` 入口接管 Tailwind + Leaflet + Token
**What:** 用 `apps/web/src/style.css` 作为唯一样式入口，保证 Tailwind preflight、Leaflet CSS 和过渡期全局样式的顺序可验证。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md] [VERIFIED: codebase grep]`  
**When to use:** Phase 19 一开始就用；这是满足 `INFRA-02` 和 `INFRA-04` 的最小可控结构。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]`  
**Example:** `[CITED: https://tailwindcss.com/docs/installation/using-vite] [CITED: https://tailwindcss.com/docs/theme] [CITED: https://tailwindcss.com/docs/preflight]`

```css
@import "tailwindcss";
@import "leaflet/dist/leaflet.css";

@theme {
  --color-sakura-100: #ffd7ea;
  --color-sakura-500: #f48fb1;
  --color-mint-100: #d8f6e8;
  --color-mint-500: #84c7d8;
  --color-lavender-100: #efe7ff;
  --color-lavender-500: #dbc4ff;
  --color-cream-50: #fafafa;
  --color-cream-100: #fff5f5;
  --font-sans: "Nunito Variable", "Noto Sans SC", "PingFang SC", sans-serif;
}

@import "./styles/tokens.css";
@import "./styles/global.css";
```

**Planning note:** `bg-sakura-100` 这类 utility 需要 `--color-sakura-100` 这种带档位变量；只写 `--color-sakura` 不能自动生成 `-100/-500` 类。 `[CITED: https://tailwindcss.com/docs/theme]`

### Pattern 2: 字体统一时优先字面量 `--font-sans`，只有桥接 CSS 变量时才用 `@theme inline`
**What:** 如果 planner 直接把 `Nunito Variable` 写进 `--font-sans`，可以避免变量解析陷阱；如果一定要桥接到旧 token 变量，则应按官方使用 `@theme inline`。 `[CITED: https://tailwindcss.com/docs/theme]`  
**When to use:** 本 phase 要让默认字体和 `font-sans` 同步时。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-CONTEXT.md]`  
**Example:** `[CITED: https://tailwindcss.com/docs/theme]`

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-family-body);
}
```

**Planning note:** 由于当前 `tokens.css` 里 `--font-family-body` 仍指向旧字体链，Phase 19 更安全的规划是直接把 `Nunito Variable` 写入 `--font-sans`，同时再更新 legacy `--font-family-body`，而不是先做间接桥接。 `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/src/styles/tokens.css] [VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-CONTEXT.md]`

### Pattern 3: Leaflet 只做“稳定兼容”，不做控件重绘
**What:** 保留现有 `LeafletMapStage.vue` 的地图与 popup 样式职责，只通过 import 顺序和必要的极窄 base override 修复 preflight 副作用。 `[VERIFIED: codebase grep] [CITED: https://tailwindcss.com/docs/preflight]`  
**When to use:** Phase 19 全程；Phase 20 才考虑 UI 级别的全面 Tailwind 化。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-CONTEXT.md]`  
**Example:** `[CITED: https://tailwindcss.com/docs/preflight] [VERIFIED: codebase grep]`

```css
@layer base {
  .leaflet-container svg {
    max-width: none;
    max-height: none;
  }
}
```

**Planning note:** 当前仓库已经有 `svg:not(.leaflet-zoom-animated)` 与 `.leaflet-container svg` 的兼容规则，所以计划里不要删除这些全局补丁，除非先做浏览器级回归验证。 `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/src/styles/global.css]`

### Anti-Patterns to Avoid
- **创建 `tailwind.config.js` 作为主配置入口：** Tailwind v4 当前官方文档主推 CSS-first 的 `@theme` 路线；本 phase 不需要额外引入旧式 JS config。 `[CITED: https://tailwindcss.com/docs/installation/using-vite] [CITED: https://tailwindcss.com/docs/theme]`
- **只定义 `--color-sakura` 这类单值 token：** 这样无法直接满足 `bg-sakura-100` / `text-lavender-500` 的 success criteria。 `[CITED: https://tailwindcss.com/docs/theme] [VERIFIED: /Users/huangjingping/i/trip-map/.planning/ROADMAP.md]`
- **把 `hover:scale-*`、`active:scale-*` 放到地图容器或其父层：** 当前 phase context 已把此项列为禁止行为，避免地图坐标与交互错位。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-CONTEXT.md]`
- **一次性删除 `tokens.css` / `global.css`：** 当前深层组件仍依赖这些变量和全局规则；Phase 19 是基础设施 phase，不应顺手清空所有 legacy CSS。 `[VERIFIED: codebase grep] [VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-CONTEXT.md]`
- **在组件里动态拼接 Tailwind class 名：** 官方文档明确说明字符串拼接不会被扫描到，应改为完整静态类名映射。 `[CITED: https://tailwindcss.com/docs/detecting-classes-in-source-files]`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tailwind utility 生成 | 自己写颜色 class 生成器或手写一堆 `.bg-sakura-100` CSS | Tailwind v4 `@theme` 颜色命名空间 | `--color-mint-500` 这类 theme variable 会直接生成 `bg-*` / `text-*` / `fill-*` utility，复杂度更低。 `[CITED: https://tailwindcss.com/docs/theme]` |
| 字体托管 | Google Fonts CDN 或自拷字体文件目录 | `@fontsource-variable/nunito` | npm 包导入最符合当前仓库工作流，也避免 CDN 依赖。 `[VERIFIED: npm registry] [VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` |
| Leaflet 控件修复 | 重写整套 `.leaflet-control-*` 样式 | 保留 Leaflet 官方 CSS，并在 preflight 后引入 | Leaflet 官方 quick start 把 CSS 视为必需资源；本 phase 目标是“不坏”，不是重绘。 `[CITED: https://leafletjs.com/examples/quick-start/] [VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-CONTEXT.md]` |
| 类名扫描补洞 | 依赖运行时拼接 class 或人工猜 purge 规则 | 静态完整类名，必要时 `@source` | 官方文档明确说明 Tailwind 只按纯文本扫描，动态拼接不可见。 `[CITED: https://tailwindcss.com/docs/detecting-classes-in-source-files]` |

**Key insight:** 本 phase 真正难的不是“写多少 CSS”，而是把 `Tailwind theme`、`legacy token`、`Leaflet CSS` 和 `Vue SFC class` 四套来源收拢到一个稳定入口，因此最优路线是借官方能力做“组合”，而不是新增一层自定义样式基础设施。 `[VERIFIED: codebase grep] [CITED: https://tailwindcss.com/docs/theme]`

## Common Pitfalls

### Pitfall 1: Preflight 顺序对了，但仍删掉了 Leaflet 的兼容层
**What goes wrong:** 仅仅把 Leaflet CSS 放到 Tailwind 后面还不够；如果顺手删掉当前 `global.css` 里的 `.leaflet-container svg` 补丁，缩放动画和 SVG 尺寸仍可能退化。 `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/src/styles/global.css] [ASSUMED]`  
**Why it happens:** Phase 19 很容易把“导入顺序”误认为唯一风险，而忽略仓库已存在的项目级修复层。 `[VERIFIED: codebase grep]`  
**How to avoid:** 计划里明确把 `global.css` 视为 Tailwind 时代的过渡补充层，直到浏览器回归验证证明它可以下线。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-CONTEXT.md] [VERIFIED: codebase grep]`  
**Warning signs:** 地图加载后控件还在，但按钮内图标、SVG 尺寸或 popup 位置看起来发虚、错位或被裁切。 `[ASSUMED]`

### Pitfall 2: 用基础色族名规划 token，却忘了 success criteria 用的是具体色阶
**What goes wrong:** 规划里如果只说“暴露 sakura / mint / lavender / cream 四个色族”，实现时很容易只落单值变量，最终无法满足 `bg-sakura-100 text-lavender-500` 这样的类名。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/ROADMAP.md] [CITED: https://tailwindcss.com/docs/theme]`  
**Why it happens:** 当前 `tokens.css` 以语义色和单值 pastel 色为主，不是 Tailwind 数字色阶结构。 `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/src/styles/tokens.css]`  
**How to avoid:** planner 必须把“最小色阶集合”写成显式任务，至少覆盖 `100` / `500` 这两个 success criteria 已经出现的档位。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/ROADMAP.md] [CITED: https://tailwindcss.com/docs/theme]`  
**Warning signs:** `class="bg-sakura-100"` 没有样式，但 `style="background: ..."` 正常。 `[ASSUMED]`

### Pitfall 3: `font-sans` 看起来配置了，实际页面仍在用旧字体链
**What goes wrong:** 只安装字体包不够；如果 `body` 仍然继承旧的 `--font-family-body`，或者 `--font-sans` 只是间接引用但没有按官方用 `@theme inline`，页面会继续落到旧 sans-serif 链。 `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/src/styles/tokens.css] [VERIFIED: /Users/huangjingping/i/trip-map/apps/web/src/styles/global.css] [CITED: https://tailwindcss.com/docs/theme]`  
**Why it happens:** 当前全局字体来源有两层，`global.css` 直接用 `--font-family-body`，而 Tailwind 的 `font-sans` 是另一套 token 系统。 `[VERIFIED: codebase grep]`  
**How to avoid:** 规划时把“字体包导入”“`--font-sans` 定义”“legacy body 字体链更新”列为三个独立验收点。 `[VERIFIED: codebase grep] [VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]`  
**Warning signs:** `font-sans` 类名存在，但中文和英文字形仍与当前 Noto/PingFang 混合基线一致。 `[ASSUMED]`

### Pitfall 4: 过早把 Phase 19 扩写成全面组件迁移
**What goes wrong:** 计划如果把 popup/card/button/drawer 的 Tailwind 改造也塞进本 phase，会让依赖接入和 Leaflet 验证变成次要任务，最终影响 Phase 19 的可验证性。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-CONTEXT.md]`  
**Why it happens:** `App.vue` 当前是厚壳组件，视觉改动很容易继续往下层组件蔓延。 `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/src/App.vue]`  
**How to avoid:** 只允许 `App.vue` 壳层做最小 Tailwind 样板，其余组件在本 phase 仅承担“不坏”的兼容观察点。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-CONTEXT.md]`  
**Warning signs:** 计划里出现 `MapContextPopup.vue`、`PointSummaryCard.vue`、`SeedMarkerLayer.vue` 的大面积 utility 重写任务。 `[VERIFIED: codebase grep]`

## Code Examples

Verified patterns from official sources:

### Vite 插件接入
```ts
// Source: https://tailwindcss.com/docs/installation/using-vite
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), vue()],
})
```

### 颜色 token 生成可用 utility
```css
/* Source: https://tailwindcss.com/docs/theme */
@import "tailwindcss";

@theme {
  --color-sakura-100: #ffd7ea;
  --color-lavender-500: #dbc4ff;
}
```

### 静态可检测类名映射
```ts
// Source: https://tailwindcss.com/docs/detecting-classes-in-source-files
const toneVariants = {
  sakura: 'bg-sakura-100 text-sakura-500',
  lavender: 'bg-lavender-100 text-lavender-500',
} as const
```

### 第三方库 preflight 修复模式
```css
/* Source: https://tailwindcss.com/docs/preflight */
@layer base {
  .leaflet-container * {
    border-style: none;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3/旧教程常见的 JS config + PostCSS 心智模型 | Tailwind v4 官方主推 `@theme` + `@tailwindcss/vite` | Tailwind v4 current docs，`@tailwindcss/vite@4.0.0` 于 `2025-01-21` 发布。 `[VERIFIED: npm registry]` | Phase 19 规划应以 CSS-first 为中心，不要引入不必要的 JS config 面。 `[CITED: https://tailwindcss.com/docs/installation/using-vite] [CITED: https://tailwindcss.com/docs/theme]` |
| 当前 `main.ts` 直接分别导入 `tokens.css`、`global.css`、`leaflet.css` | `main.ts` 只导入字体和 `style.css`，由 `style.css` 统一控制顺序 | 这是 Phase 19 requirement 明确要求的目标状态。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` | 让 CSS 顺序可测试、可代码审查、可复用到 Phase 20。 `[VERIFIED: codebase grep]` |
| CDN 或系统字体回退 | npm 包自托管可变字体 | `@fontsource-variable/nunito@5.2.7` 当前可用。 `[VERIFIED: npm registry]` | 满足“全站明显切到圆润字体”的 success criteria，且不依赖外网。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/ROADMAP.md]` |

**Deprecated/outdated:**
- 以 `tailwind.config.js` 作为 Tailwind v4 唯一配置入口的规划思路已经过时。 `[CITED: https://tailwindcss.com/docs/installation/using-vite] [CITED: https://tailwindcss.com/docs/theme]`
- 通过动态字符串拼接 Tailwind class 名来表达颜色变体的做法不适合当前 Tailwind 扫描机制。 `[CITED: https://tailwindcss.com/docs/detecting-classes-in-source-files]`

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 仅靠 `happy-dom` 无法可靠判断 Leaflet 控件的最终视觉样式，需要浏览器人工冒烟作为 phase gate。 | `Validation Architecture` | 如果判断错，planner 可能过度依赖人工检查或漏掉可自动化的视觉验证。 |
| A2 | 删除当前 `global.css` 中的 Leaflet SVG 兼容规则会带来真实视觉回归。 | `Common Pitfalls / Pitfall 1` | 如果判断错，planner 可能保留了可删除的旧 CSS。 |
| A3 | 规划时至少覆盖 `100` / `500` 两档即可满足本 phase 的最小成功标准，更多色阶留给自由裁量。 | `Common Pitfalls / Pitfall 2` | 如果判断错，planner 可能定义的色阶太少或太多。 |

## Open Questions (RESOLVED)

1. **四个色族各自要暴露多少个 shade？**
Final decision: Phase 19 采用“最小可用色阶集合”，与当前计划完全绑定，不为 Phase 20 预铺 50-900 全梯度。最终结论是 `sakura` / `mint` / `lavender` 各暴露 `100 / 300 / 500`，`cream` 暴露 `100 / 200 / 300`，共 12 个 token：`sakura-100/300/500`、`mint-100/300/500`、`lavender-100/300/500`、`cream-100/200/300`。这样既满足 `bg-sakura-100`、`text-lavender-500` 的 success criteria，也覆盖奶油白背景所需的浅阶。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/ROADMAP.md] [VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-02-PLAN.md]`

2. **`style.css` 是完全吸收 legacy CSS，还是先做 import hub？**
Final decision: Phase 19 采用 import hub 方案，不在本阶段完全吸收或删除 `tokens.css` / `global.css`。`src/style.css` 只承担单一入口职责，按 `@import "tailwindcss"` → `@import 'leaflet/dist/leaflet.css'` → `@import './styles/tokens.css'` → `@import './styles/global.css'` 的顺序组织样式；legacy CSS 继续承接语义变量与 Leaflet 兼容补丁，真正清理延后到 Phase 20 或独立收尾任务。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-CONTEXT.md] [VERIFIED: /Users/huangjingping/i/trip-map/.planning/phases/19-tailwind-token/19-02-PLAN.md]`

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite 8、Tailwind v4、Vitest 执行 | ✓ `[VERIFIED: filesystem probe]` | `v22.22.1` `[VERIFIED: filesystem probe]` | — |
| `pnpm` | monorepo 依赖安装与包级命令 | ✓ `[VERIFIED: filesystem probe]` | `10.33.0` `[VERIFIED: filesystem probe]` | `npm` 可查 registry，但不适合作为本仓库主包管理器。 `[VERIFIED: /Users/huangjingping/i/trip-map/package.json]` |
| npm registry access | 安装 Tailwind/Nunito 与版本验证 | ✓ `[VERIFIED: npm registry]` | 查询成功于 `2026-04-08`。 `[VERIFIED: npm registry]` | — |
| Vitest / happy-dom | 源文件与壳层 smoke 验证 | ✓ `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/package.json] [VERIFIED: /Users/huangjingping/i/trip-map/apps/web/vitest.config.ts]` | `vitest 4.1.3` / `happy-dom 20.8.9` `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/package.json]` | — |

**Missing dependencies with no fallback:** None. `[VERIFIED: filesystem probe]`

**Missing dependencies with fallback:** None. `[VERIFIED: filesystem probe]`

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `Vitest 4.1.3` + `@vue/test-utils 2.4.6` + `happy-dom` `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/package.json] [VERIFIED: /Users/huangjingping/i/trip-map/apps/web/vitest.config.ts]` |
| Config file | `apps/web/vitest.config.ts` `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/vitest.config.ts]` |
| Quick run command | `pnpm --filter @trip-map/web test -- src/App.spec.ts` `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/package.json] [VERIFIED: /Users/huangjingping/i/trip-map/apps/web/vitest.config.ts]` |
| Full suite command | `pnpm --filter @trip-map/web test` `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/package.json]` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | `vite.config.ts` 注册 `@tailwindcss/vite`，依赖已写入 `package.json`。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` | static/unit | `pnpm --filter @trip-map/web test -- src/tailwind-token.spec.ts` `[ASSUMED]` | ❌ Wave 0 |
| INFRA-02 | `src/style.css` 含 `@import "tailwindcss"`、`@theme {}`、Leaflet CSS 紧随其后。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` | static/unit | `pnpm --filter @trip-map/web test -- src/tailwind-token.spec.ts` `[ASSUMED]` | ❌ Wave 0 |
| INFRA-03 | `main.ts` 导入 `@fontsource-variable/nunito`，默认字体链已切到 Nunito。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` | static/unit + manual visual | `pnpm --filter @trip-map/web test -- src/tailwind-token.spec.ts` `[ASSUMED]` | ❌ Wave 0 |
| INFRA-04 | Leaflet 缩放按钮、归因链接、图层控件样式在浏览器中保持正常。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` | manual-only browser smoke | `—` | ❌ Wave 0 |
| STYLE-01 | `sakura/mint/lavender/cream` 工具类可用，页面背景显示奶油白。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` | static/unit + manual visual | `pnpm --filter @trip-map/web test -- src/tailwind-token.spec.ts` `[ASSUMED]` | ❌ Wave 0 |
| STYLE-02 | `font-sans` 与默认全局字体统一到 `Nunito Variable`。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` | static/unit + manual visual | `pnpm --filter @trip-map/web test -- src/tailwind-token.spec.ts` `[ASSUMED]` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm --filter @trip-map/web test -- src/App.spec.ts`，以及新增静态入口 spec 后的目标文件运行。 `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/package.json] [ASSUMED]`
- **Per wave merge:** `pnpm --filter @trip-map/web test`。 `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/package.json]`
- **Phase gate:** 全量前端测试通过，并在真实浏览器里人工确认 Leaflet 控件、归因链接、图层控件、奶油白背景与 Nunito 字体视觉生效。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/ROADMAP.md] [ASSUMED]`

### Wave 0 Gaps
- [ ] `apps/web/src/tailwind-token.spec.ts` — 需要新增，用来静态校验 `package.json`、`vite.config.ts`、`main.ts`、`style.css` 的依赖与顺序要求。 `[VERIFIED: codebase grep]`
- [ ] `App.spec.ts` 目前只验证壳层结构，不覆盖 Tailwind token、字体切换或 Leaflet 兼容性。 `[VERIFIED: /Users/huangjingping/i/trip-map/apps/web/src/App.spec.ts]`
- [ ] 缺少浏览器级视觉回归脚本；INFRA-04 只能先以人工冒烟作为 phase gate。 `[VERIFIED: codebase grep] [ASSUMED]`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` | 本 phase 不涉及认证流程。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/ROADMAP.md]` |
| V3 Session Management | no `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` | 本 phase 不触达会话状态。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/ROADMAP.md]` |
| V4 Access Control | no `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` | 本 phase 只改前端样式基础设施。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/ROADMAP.md]` |
| V5 Input Validation | no `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/ROADMAP.md]` | 不新增表单或用户输入解析路径。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/ROADMAP.md]` |
| V6 Cryptography | no `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/ROADMAP.md]` | 不新增加密或密钥处理。 `[VERIFIED: /Users/huangjingping/i/trip-map/.planning/ROADMAP.md]` |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| 新增 npm 依赖引入供应链篡改面 | Tampering | 仅增加 `tailwindcss`、`@tailwindcss/vite`、`@fontsource-variable/nunito`，审查 lockfile diff 并保留 package scope 最小化。 `[VERIFIED: npm registry] [VERIFIED: /Users/huangjingping/i/trip-map/package.json]` |
| CDN 字体不可达导致 UI 可用性退化 | Denial of Service | 使用 Fontsource 自托管字体包，不依赖 Google Fonts CDN。 `[VERIFIED: npm registry] [VERIFIED: /Users/huangjingping/i/trip-map/.planning/REQUIREMENTS.md]` |
| Preflight 破坏第三方控件导致地图交互 UI 不可用 | Denial of Service | `@import "tailwindcss"` 在前、Leaflet CSS 在后，必要时用 `@layer base` 做窄覆盖。 `[CITED: https://tailwindcss.com/docs/preflight] [CITED: https://leafletjs.com/examples/quick-start/]` |
| 运行时动态拼接 class 导致生产缺样式并误伤状态提示 | Tampering | 只使用静态完整类名或静态映射对象。 `[CITED: https://tailwindcss.com/docs/detecting-classes-in-source-files]` |

## Sources

### Primary (HIGH confidence)
- `https://tailwindcss.com/docs/installation/using-vite` - 官方 Vite 安装步骤、`tailwindcss` + `@tailwindcss/vite` 与 `@import "tailwindcss"`。 `[CITED: https://tailwindcss.com/docs/installation/using-vite]`
- `https://tailwindcss.com/docs/theme` - `@theme`、`--color-*` / `--font-*` namespace、`@theme inline`。 `[CITED: https://tailwindcss.com/docs/theme]`
- `https://tailwindcss.com/docs/detecting-classes-in-source-files` - 动态类名限制、`@source` 机制。 `[CITED: https://tailwindcss.com/docs/detecting-classes-in-source-files]`
- `https://tailwindcss.com/docs/preflight` - preflight reset 范围、第三方库覆盖模式。 `[CITED: https://tailwindcss.com/docs/preflight]`
- `https://leafletjs.com/examples/quick-start/` - Leaflet CSS 是必需资源，地图默认带 zoom 和 attribution controls。 `[CITED: https://leafletjs.com/examples/quick-start/]`
- npm registry queries on `2026-04-08` - `tailwindcss@4.2.2`、`@tailwindcss/vite@4.2.2`、`@fontsource-variable/nunito@5.2.7` 的当前版本与发布时间。 `[VERIFIED: npm registry]`
- Local codebase files - `apps/web/package.json`、`apps/web/vite.config.ts`、`apps/web/src/main.ts`、`apps/web/src/styles/tokens.css`、`apps/web/src/styles/global.css`、`apps/web/src/App.vue`、`apps/web/src/components/LeafletMapStage.vue`、`apps/web/src/App.spec.ts`、`apps/web/vitest.config.ts`。 `[VERIFIED: codebase grep]`

### Secondary (MEDIUM confidence)
- None. `[VERIFIED: research log]`

### Tertiary (LOW confidence)
- None beyond items explicitly listed in `## Assumptions Log`. `[VERIFIED: research log]`

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - 版本已用 npm registry 实查，安装路径与接入方式有官方文档。 `[VERIFIED: npm registry] [CITED: https://tailwindcss.com/docs/installation/using-vite]`
- Architecture: HIGH - 当前仓库入口点集中，Tailwind/Leaflet/font 的集成面清晰。 `[VERIFIED: codebase grep]`
- Pitfalls: MEDIUM - preflight 与动态类名有官方来源，但部分 Leaflet 视觉退化仍需要浏览器实测确认。 `[CITED: https://tailwindcss.com/docs/preflight] [CITED: https://tailwindcss.com/docs/detecting-classes-in-source-files] [ASSUMED]`

**Research date:** 2026-04-08 `[VERIFIED: system date]`  
**Valid until:** 2026-04-15 `[ASSUMED]`
