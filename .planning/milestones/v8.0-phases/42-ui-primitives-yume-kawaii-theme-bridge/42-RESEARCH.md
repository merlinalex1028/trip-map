# Phase 42: UI Primitives 与 Yume Kawaii Theme Bridge - Research

**Researched:** 2026-05-11  
**Domain:** Vue 3 design-system primitives, Tailwind v4 theme bridge, local icon registry, ECharts foundation  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### shadcn-vue Primitives
- **D-01:** Phase 42 builds the UI primitives foundation only. Existing business components such as `AuthDialog`, `ConfirmDialog`, `TripDateForm`, and map popup buttons/cards are not migrated in this phase.
- **D-02:** Install and generate the full roadmap primitive set: `Button`, `Card`, `Dialog`, `Popover`, `Calendar`, `Tabs`, `Sidebar`, `Dropdown Menu`, `Skeleton`, and `Scroll Area`.
- **D-03:** Configure standard `@` alias in Vite and TypeScript. Generated primitives live under `apps/web/src/components/ui/*` and should be imported via `@/components/ui/...`.
- **D-04:** Leave migration guidance for later phases: `AuthDialog`, `ConfirmDialog`, `TripDateForm`, popup buttons/cards, and related dialog/form surfaces are future candidates, but Phase 42 must not rewrite them.

### Yume Kawaii Theme Bridge
- **D-05:** Use high-fidelity UI images as the visual authority. The canonical source is `prd/v8.0/UI`, not the older `8.0/` path referenced in some planning text.
- **D-06:** Recalibrate existing global tokens in `apps/web/src/styles/tokens.css` directly: `--color-*`, `--radius-*`, `--shadow-*`, `--motion-*`, and related theme variables should become the shared v8 baseline for both existing UI and shadcn primitives.
- **D-07:** shadcn-vue primitives should default to v8 high-fidelity styling: soft pink glass surfaces, deep indigo/purple text, large rounded forms, subtle translucent borders, and light shadows. Do not preserve shadcn's neutral black/white/gray default as the main style.
- **D-08:** Phase 42 only defines asset rules. It should not bulk-copy `prd/v8.0/切图`. Later implementation phases must inspect that folder, copy only used assets into `apps/web/src/assets`, and rename them with English kebab-case filenames.
- **D-09:** `prd/v8.0/UI/世界足迹.png` has an incorrect bottom illustration in the left menu and no matching cutout. Do not treat that portion as authoritative; use `prd/v8.0/UI/旅途回忆.png` and `prd/v8.0/UI/旅途手帐.png` plus available cutouts as the reference for that sidebar illustration area.

### Dev Showcase and Smoke
- **D-10:** Add a hidden development showcase route, expected as `/__ui`, to display all Phase 42 primitives in one place.
- **D-11:** Guard `/__ui` with `import.meta.env.DEV`; production builds should redirect this route to `/`.
- **D-12:** The showcase should present a state matrix: default, disabled, loading or skeleton, focus-visible, and basic interactive states. Dialog, Popover, Dropdown, and Calendar examples must be operable.
- **D-13:** Add lightweight Vitest + Vue Test Utils smoke coverage for the showcase or showcase component: key primitives render, buttons click, and popover/dialog-style surfaces can open. Screenshot/visual QA belongs to Phase 48.

### Icons
- **D-14:** Use Iconify through a local whitelist/registration layer. Runtime network icon fetching is not allowed.
- **D-15:** Prefer colorful illustrated icons and cutout-like decorative assets to match the high-fidelity v8 look.
- **D-16:** Source priority is: use `prd/v8.0/切图` assets when available, copied to `apps/web/src/assets` with English kebab-case names; use locally registered Iconify icons only to fill gaps.
- **D-17:** Provide a semantic wrapper API, e.g. `KawaiiIcon name="map" | "journal" | "memories" | "calendar" | "star"`. Page code should not directly pass Iconify ids or raw asset filenames.

### Charts
- **D-18:** Install `echarts` and `vue-echarts`, register a Yume Kawaii chart theme, and provide a reusable `BaseChart` wrapper.
- **D-19:** `BaseChart` handles option rendering plus foundation states: sizing, loading, empty, error, and resize behavior.
- **D-20:** `BaseChart` must not connect to real travel data in Phase 42. It consumes passed-in ECharts options and state props; `/__ui` may use clearly labeled demo options.
- **D-21:** Register ECharts modules centrally and on demand, likely in `apps/web/src/lib/charts`: line, pie, bar, radar, required components, and renderer support for Phase 47's chart needs.
- **D-22:** The chart theme should follow `prd/v8.0/UI/旅途回忆.png`: pink primary line/segment, lavender, sky blue, mint, and warm orange accents; very light grid lines; glassy white tooltip/card surfaces; deep indigo text.

### the agent's Discretion
No areas were delegated to the agent's discretion. User decisions above are locked for planning.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DS-01 | 开发者可以在 `apps/web` 中使用 shadcn-vue 生成的本地 UI primitives，并通过 `@/` alias 稳定导入。 | `apps/web` currently lacks `@/*` in Vite and TypeScript, while shadcn-vue Vite docs require `@/*` path alias before CLI use. [VERIFIED: apps/web/vite.config.ts, apps/web/tsconfig.json] [CITED: https://www.shadcn-vue.com/docs/installation/vite] |
| DS-02 | 应用可以使用已安装的 shadcn-vue primitives 承接 Button、Card、Dialog、Popover、Calendar、Tabs、Sidebar、Dropdown Menu、Skeleton、Scroll Area 等基础交互。 | The required components are present in the shadcn-vue registry navigation and can be installed with the CLI into local source. [CITED: https://www.shadcn-vue.com/docs/components-json] |
| DS-03 | 应用可以使用 ECharts/vue-echarts 渲染旅途回忆图表，并保持图表主题与 Yume Kawaii token 一致。 | ECharts supports tree-shakeable `echarts/core` module registration, and vue-echarts exposes `theme`, `option`, `loading`, and `autoresize` props suitable for a themed `BaseChart`. [CITED: https://echarts.apache.org/handbook/en/basics/import/] [CITED: https://github.com/ecomfe/vue-echarts] |
| DS-04 | 应用可以使用统一图标方案渲染地图、手账、回忆、日历、相机、奖章、星星等图标，且不依赖运行时公网拉取图标。 | Iconify Vue exposes `addIcon` and `addCollection`, which add icon data to local component storage before rendering. [CITED: https://iconify.design/docs/icon-components/vue/add-icon.html] [CITED: https://iconify.design/docs/icon-components/vue/add-collection.html] |
| DS-05 | shadcn-vue 默认中性视觉被主题化为 Soft Pastel Glassmorphism 风格，不出现默认黑白灰组件割裂。 | `apps/web/src/styles/tokens.css` is the existing global token layer and UI-SPEC locks the Yume Kawaii palette, glass surfaces, radius, shadow, and motion constraints for this phase. [VERIFIED: apps/web/src/styles/tokens.css] [VERIFIED: 42-UI-SPEC.md] |
</phase_requirements>

## Summary

Phase 42 should be planned as a foundation phase, not a page migration phase. The correct first move is to make `apps/web` compatible with shadcn-vue generation by adding `@/*` path resolution in both Vite and TypeScript, then initialize `components.json` and generate only the locked primitive set under `apps/web/src/components/ui/*`. [VERIFIED: 42-CONTEXT.md] [VERIFIED: apps/web/vite.config.ts] [VERIFIED: apps/web/tsconfig.json] [CITED: https://www.shadcn-vue.com/docs/installation/vite]

The theme bridge should be centralized in `apps/web/src/styles/tokens.css` and `apps/web/src/style.css`, because the project already imports Tailwind v4, Leaflet CSS, global tokens, and global styles from one entry. The plan should avoid creating a second design-token system or accepting shadcn-vue's neutral default as the product baseline. [VERIFIED: apps/web/src/style.css] [VERIFIED: apps/web/src/styles/tokens.css] [VERIFIED: 42-CONTEXT.md]

For charts and icons, use proven libraries but keep project-level wrappers. `BaseChart` should own `vue-echarts` rendering states and central ECharts registration, while `KawaiiIcon` should expose semantic names and register only local Iconify data or approved cutout assets. [CITED: https://github.com/ecomfe/vue-echarts] [CITED: https://echarts.apache.org/handbook/en/basics/import/] [CITED: https://iconify.design/docs/icon-components/vue/add-collection.html] [VERIFIED: 42-CONTEXT.md]

**Primary recommendation:** Plan four implementation tracks in order: alias/CLI setup, shadcn-vue primitive generation and token bridge, `KawaiiIcon` local whitelist, then `BaseChart` plus `/__ui` smoke coverage. [VERIFIED: 42-CONTEXT.md] [VERIFIED: 42-UI-SPEC.md]

## Project Constraints (from AGENTS.md)

- User-facing communication must be in Chinese unless explicitly requested otherwise. [VERIFIED: AGENTS.md]
- Before implementation, briefly describe the operations to run. [VERIFIED: AGENTS.md]
- Code changes should be minimal and follow existing project structure and style. [VERIFIED: AGENTS.md]
- GSD workflows may automatically start subagents or delegated agents when the workflow requires it and the user has authorized GSD workflow execution. [VERIFIED: AGENTS.md]
- If subagents are used, downstream agents must wait for their returned results before continuing. [VERIFIED: AGENTS.md]
- Final summaries must include change content, affected scope, and verification results in Chinese. [VERIFIED: AGENTS.md]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| shadcn-vue primitive source generation | Browser / Client | Build tooling | Generated Vue SFC primitives live in `apps/web/src/components/ui/*`, while Vite/TS aliases make imports resolvable. [VERIFIED: 42-CONTEXT.md] [CITED: https://www.shadcn-vue.com/docs/installation/vite] |
| Yume Kawaii theme bridge | Browser / Client | Build tooling | CSS tokens and Tailwind v4 theme variables define runtime visual output; Vite only compiles them. [VERIFIED: apps/web/src/style.css] [VERIFIED: apps/web/src/styles/tokens.css] |
| `/__ui` development showcase | Browser / Client | Frontend router | The route is a local developer surface guarded by `import.meta.env.DEV` in Vue Router. [VERIFIED: 42-CONTEXT.md] [VERIFIED: apps/web/src/router/index.ts] |
| Local semantic icons | Browser / Client | Static assets | `KawaiiIcon` renders local cutout assets or locally registered Iconify SVG data; it must not call remote icon APIs at runtime. [VERIFIED: 42-CONTEXT.md] [CITED: https://iconify.design/docs/icon-components/vue/add-collection.html] |
| Chart foundation | Browser / Client | Build tooling | `BaseChart` renders passed ECharts options in the browser; module registration is compile-time/runtime client setup. [CITED: https://echarts.apache.org/handbook/en/basics/import/] [CITED: https://github.com/ecomfe/vue-echarts] |
| Smoke tests | Build tooling | Browser / Client | Vitest + Vue Test Utils exercise Vue components in `happy-dom`; overlay primitives may need Teleport stubbing. [VERIFIED: apps/web/vitest.config.ts] [VERIFIED: vue-testing-best-practices skill] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `shadcn-vue` | `2.6.2`, modified 2026-04-12 | CLI generator for local Vue primitives. | Official Vite docs require the CLI for `components.json` and component generation; local source matches the locked "third-party primitives but locally themeable" decision. [VERIFIED: npm registry] [CITED: https://www.shadcn-vue.com/docs/installation/vite] [VERIFIED: 42-CONTEXT.md] |
| `reka-ui` | `2.9.7`, modified 2026-05-05 | Accessible primitive dependency used by shadcn-vue components. | shadcn-vue documents components as built on Reka UI primitives, so planner should let CLI add it instead of hand-building overlay/focus behavior. [VERIFIED: npm registry] [CITED: https://context7.com/unovue/shadcn-vue/llms.txt] |
| `echarts` | `6.0.0`, modified 2025-07-30 | Chart engine for line, donut/pie, bar, and radar charts. | Official ECharts docs recommend tree-shakeable `echarts/core` registration, and Phase 47 needs chart types that shadcn-vue charts do not cover as broadly. [VERIFIED: npm registry] [CITED: https://echarts.apache.org/handbook/en/basics/import/] [VERIFIED: 42-CONTEXT.md] |
| `vue-echarts` | `8.0.1`, modified 2026-02-18 | Vue component wrapper for ECharts. | `vue-echarts@8` supports Vue 3 and ECharts 6, exposes `theme`, `option`, `loading`, and `autoresize`, and drops Vue 2 support. [VERIFIED: npm registry] [CITED: https://github.com/ecomfe/vue-echarts/releases] [CITED: https://github.com/ecomfe/vue-echarts] |
| `@iconify/vue` | `5.0.1`, modified 2026-05-06 | SVG icon renderer with local icon-data APIs. | Iconify Vue supports `addIcon` and `addCollection`, enabling a local whitelist instead of runtime network icon fetch. [VERIFIED: npm registry] [CITED: https://iconify.design/docs/icon-components/vue/add-icon.html] [CITED: https://iconify.design/docs/icon-components/vue/add-collection.html] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@internationalized/date` | `3.12.1`, modified 2026-05-08 | Date primitives used by shadcn-vue Calendar/Date Picker examples. | Use when calendar examples need `today()`, local time zone, or date formatting. [VERIFIED: npm registry] [CITED: https://github.com/unovue/shadcn-vue/blob/dev/apps/v4/content/docs/components/date-picker.md] |
| `clsx` | `2.1.1`, modified 2025-06-27 | Conditional class composition. | Use in `@/lib/utils` for the `cn()` helper expected by shadcn-vue patterns. [VERIFIED: npm registry] [CITED: https://www.shadcn-vue.com/docs/components-json] |
| `tailwind-merge` | `3.6.0`, modified 2026-05-10 | Tailwind class conflict resolution. | Use with `clsx` in `cn()` so generated and themed classes merge predictably. [VERIFIED: npm registry] [CITED: https://www.shadcn-vue.com/docs/components-json] |
| `class-variance-authority` | `0.7.1`, modified 2024-11-26 | Variant class definitions for primitives such as Button. | Let shadcn-vue add it if generated components require variant maps. [VERIFIED: npm registry] [CITED: https://context7.com/unovue/shadcn-vue/llms.txt] |
| `@iconify/utils` | `3.1.3`, modified 2026-05-07 | Optional build-time extraction/validation of icon data. | Use only if planner chooses a generated whitelist from `@iconify-json/*`; do not import full icon-set JSON into runtime components. [VERIFIED: npm registry] [CITED: https://iconify.design/docs/libraries/utils/validate-icon-set.html] |
| `@iconify-json/flat-color-icons` | `1.2.3`, modified 2025-08-11 | Optional colorful icon data source. | Use as the first Iconify fallback family for illustrated semantic icons when no cutout asset exists. [VERIFIED: npm registry] [VERIFIED: 42-CONTEXT.md] |
| `@iconify-json/solar` | `1.2.5`, modified 2025-10-27 | Optional outline/fill icon data source. | Use for missing semantic icons that flat-color-icons does not cover. [VERIFIED: npm registry] [VERIFIED: 42-CONTEXT.md] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn-vue local primitives | Naive UI or Element Plus | Prior v8 research considered them viable, but locked decisions require shadcn-vue local primitives and full source theming in Phase 42. [VERIFIED: .planning/research/STACK.md] [VERIFIED: 42-CONTEXT.md] |
| ECharts/vue-echarts | shadcn-vue chart examples | shadcn-vue charts are not the locked choice; ECharts provides the line, pie/donut, bar, and radar foundation required for Phase 47. [VERIFIED: 42-CONTEXT.md] [CITED: https://echarts.apache.org/handbook/en/basics/import/] |
| Iconify local registration | Runtime Iconify API loading | Runtime network icon fetching is explicitly forbidden, so local registration is required even if API loading would reduce bundled data. [VERIFIED: 42-CONTEXT.md] [CITED: https://iconify.design/docs/icon-components/vue/add-collection.html] |
| Handwritten modal/menu/calendar | Reka-backed shadcn-vue primitives | Accessible focus, keyboard, escape, and overlay behavior should come from generated primitives, not custom interaction code. [VERIFIED: 42-UI-SPEC.md] [CITED: https://www.shadcn-vue.com/docs/components-json] |

**Installation:**

```bash
pnpm --filter @trip-map/web dlx shadcn-vue@2.6.2 init
pnpm --filter @trip-map/web dlx shadcn-vue@2.6.2 add button card dialog popover calendar tabs sidebar dropdown-menu skeleton scroll-area
pnpm --filter @trip-map/web add echarts@6.0.0 vue-echarts@8.0.1 @iconify/vue@5.0.1 @internationalized/date@3.12.1
pnpm --filter @trip-map/web add -D @iconify/utils@3.1.3 @iconify-json/flat-color-icons@1.2.3 @iconify-json/solar@1.2.5
```

**Version verification:** Versions were verified with `npm view <package> version time.modified` on 2026-05-11. [VERIFIED: npm registry]

## Architecture Patterns

### System Architecture Diagram

```text
Developer / Phase task
  -> Vite + TypeScript alias setup (@/* -> apps/web/src/*)
  -> shadcn-vue init (components.json + src/lib/utils.ts)
  -> shadcn-vue add locked primitives
  -> Theme bridge
       -> apps/web/src/styles/tokens.css recalibrated to v8 palette/radius/shadow/motion
       -> apps/web/src/style.css @theme synchronized where Tailwind utilities need token names
       -> generated components use tokenized classes by default
  -> Local foundations
       -> KawaiiIcon semantic API
            -> use copied cutout asset if explicitly present
            -> otherwise render locally registered Iconify data
       -> BaseChart wrapper
            -> central ECharts module registration
            -> Yume Kawaii theme registration
            -> VChart option/loading/empty/error/autoresize states
  -> /__ui dev-only route
       -> import.meta.env.DEV ? showcase : redirect("/")
       -> state matrix + operable Dialog/Popover/Dropdown/Calendar + chart/icon demos
  -> Vitest smoke tests
       -> render primitives
       -> trigger button/menu/dialog/popover interactions
       -> assert BaseChart states and local icon rendering
```

This architecture keeps route-level views as composition surfaces and moves primitive demos into focused components if `/__ui` grows. [VERIFIED: vue-best-practices skill] [VERIFIED: 42-UI-SPEC.md]

### Recommended Project Structure

```text
apps/web/
├── components.json                 # shadcn-vue CLI config
├── src/
│   ├── components/
│   │   ├── ui/                     # generated shadcn-vue primitives only
│   │   ├── common/
│   │   │   ├── KawaiiIcon.vue      # semantic icon wrapper
│   │   │   └── BaseChart.vue       # chart wrapper
│   │   └── showcase/               # /__ui sections and state matrix
│   ├── lib/
│   │   ├── utils.ts                # cn() helper for shadcn-vue
│   │   ├── charts/
│   │   │   ├── register.ts         # echarts.use([...]) and registerTheme()
│   │   │   └── theme.ts            # Yume Kawaii chart theme/options helpers
│   │   └── icons/
│   │       ├── registry.ts         # addIcon/addCollection whitelist bootstrap
│   │       └── semantic-icons.ts   # semantic name -> asset/icon mapping
│   ├── styles/
│   │   └── tokens.css              # v8 shared token baseline
│   ├── views/
│   │   └── UiShowcaseView.vue      # thin dev-only route
│   └── router/
│       └── index.ts                # /__ui DEV guard
```

`components/ui` should contain generated primitives only; project-specific wrappers belong in `components/common`, `lib/charts`, `lib/icons`, or `components/showcase`. [VERIFIED: 42-CONTEXT.md] [VERIFIED: vue-best-practices skill]

### Pattern 1: Vite and TypeScript Alias Before CLI

**What:** Add `@/*` to `apps/web/tsconfig.json` and `@` to `apps/web/vite.config.ts` before running `shadcn-vue init`. [CITED: https://www.shadcn-vue.com/docs/installation/vite]  
**When to use:** Always in Wave 0, because current `apps/web` has explicit package aliases but no source alias. [VERIFIED: apps/web/vite.config.ts] [VERIFIED: apps/web/tsconfig.json]

**Example:**

```ts
// Source: https://www.shadcn-vue.com/docs/installation/vite
// Adaptation: keep existing explicit dependency aliases and add only the source alias.
const fromWebRoot = (path: string) => new URL(path, import.meta.url).pathname

export default defineConfig({
  resolve: {
    alias: {
      '@': fromWebRoot('./src'),
      vue: fromWebRoot('./node_modules/vue'),
    },
  },
})
```

### Pattern 2: Token-First Theme Bridge

**What:** Recalibrate `tokens.css` values to UI-SPEC colors, radii, shadows, motion durations, and map Tailwind v4 `@theme` names to the same visual baseline. [VERIFIED: apps/web/src/styles/tokens.css] [VERIFIED: apps/web/src/style.css] [VERIFIED: 42-UI-SPEC.md]  
**When to use:** Before deep component edits, because generated shadcn-vue classes should consume project tokens instead of copying one-off colors. [VERIFIED: 42-CONTEXT.md]

**Example:**

```css
/* Source: 42-UI-SPEC.md and existing apps/web/src/styles/tokens.css */
:root {
  --color-page: #fff8fd;
  --color-surface: rgba(255, 255, 255, 0.78);
  --color-accent: #f75a9b;
  --color-ink-strong: #25146f;
  --color-ink-muted: #6f5b99;
  --color-frame: #e8ddf6;
  --radius-control: 22px;
  --radius-card: 28px;
  --radius-bubble: 32px;
  --motion-quick: 140ms;
  --motion-emphasis: 180ms;
}
```

### Pattern 3: Semantic Icon Wrapper with Local Registration

**What:** `KawaiiIcon` receives semantic names and internally maps to copied assets or registered Iconify names. Page code should not pass raw Iconify ids. [VERIFIED: 42-CONTEXT.md]  
**When to use:** For all app/page icons and `/__ui` icon examples. [VERIFIED: 42-UI-SPEC.md]

**Example:**

```ts
// Source: https://iconify.design/docs/icon-components/vue/add-icon.html
import { addIcon } from '@iconify/vue'

addIcon('kawaii:calendar', {
  width: 24,
  height: 24,
  body: '<path d="..." fill="currentColor"/>',
})

export const semanticIconMap = {
  calendar: { kind: 'iconify', icon: 'kawaii:calendar' },
  memories: { kind: 'iconify', icon: 'kawaii:memories' },
} as const
```

### Pattern 4: Central ECharts Registration and Thin BaseChart

**What:** Register charts/components/renderers once in `src/lib/charts/register.ts`, then use `BaseChart` for shared `loading`, `empty`, `error`, sizing, theme, and `autoresize`. [CITED: https://echarts.apache.org/handbook/en/basics/import/] [CITED: https://github.com/ecomfe/vue-echarts]  
**When to use:** Any future travel-memory chart should pass options into `BaseChart` instead of importing ECharts modules ad hoc. [VERIFIED: 42-CONTEXT.md]

**Example:**

```ts
// Source: https://echarts.apache.org/handbook/en/basics/import/
import { use, registerTheme } from 'echarts/core'
import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([
  LineChart,
  PieChart,
  BarChart,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
])

registerTheme('yume-kawaii', {
  color: ['#f75a9b', '#8b6fef', '#5ea7f2', '#7ed9b6', '#f5a354'],
  textStyle: { color: '#25146f', fontFamily: 'Nunito Variable, Noto Sans SC, sans-serif' },
})
```

### Pattern 5: Dev-Only Showcase Route

**What:** Add `/__ui` route and redirect to `/` when `import.meta.env.DEV` is false. [VERIFIED: 42-CONTEXT.md]  
**When to use:** Phase 42 only; do not add it to product navigation. [VERIFIED: 42-CONTEXT.md]

**Example:**

```ts
// Source: 42-CONTEXT.md and existing apps/web/src/router/index.ts
{
  path: '/__ui',
  name: 'ui-showcase',
  beforeEnter: () => (import.meta.env.DEV ? true : { path: '/' }),
  component: () => import('../views/UiShowcaseView.vue'),
}
```

### Anti-Patterns to Avoid

- **Generating primitives before alias setup:** shadcn-vue imports use `@/components/ui/...`, so missing alias breaks TS/Vite resolution. [VERIFIED: apps/web/vite.config.ts] [CITED: https://www.shadcn-vue.com/docs/installation/vite]
- **Parallel token systems:** adding `theme.css`, hard-coded component palettes, or per-component CSS variables outside `tokens.css` will make later phases inconsistent. [VERIFIED: 42-CONTEXT.md] [VERIFIED: apps/web/src/styles/tokens.css]
- **Runtime Iconify API loading:** using `<Icon icon="mdi:home" />` without local data can trigger runtime loading; Phase 42 forbids runtime network icons. [VERIFIED: 42-CONTEXT.md] [CITED: https://iconify.design/docs/icon-components/vue/]
- **Full ECharts import:** importing `echarts` wholesale is simpler but official docs encourage tree-shakeable imports for smaller bundles. [CITED: https://echarts.apache.org/handbook/en/basics/import/]
- **Business UI migration:** rewriting `AuthDialog`, `ConfirmDialog`, `TripDateForm`, or map popup business flows would violate Phase 42 scope. [VERIFIED: 42-CONTEXT.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dialog/Popover/Dropdown focus and keyboard behavior | Custom overlay managers, Escape handlers, focus traps, outside-click stacks | shadcn-vue generated primitives backed by Reka UI | UI-SPEC requires accessible primitives; generated components avoid custom focus bugs. [VERIFIED: 42-UI-SPEC.md] [CITED: https://www.shadcn-vue.com/docs/components-json] |
| Calendar/date selection primitives | A hand-written calendar grid | shadcn-vue `Calendar` plus `@internationalized/date` where needed | shadcn-vue Date Picker examples combine `Calendar`, `Popover`, and date helpers. [CITED: https://github.com/unovue/shadcn-vue/blob/dev/apps/v4/content/docs/components/date-picker.md] |
| Chart rendering and resize lifecycle | Canvas/SVG chart drawing from scratch | ECharts + vue-echarts | ECharts provides chart types and tree-shakeable module registration; vue-echarts provides Vue props such as `autoresize` and `loading`. [CITED: https://echarts.apache.org/handbook/en/basics/import/] [CITED: https://github.com/ecomfe/vue-echarts] |
| Icon rendering | Raw SVG path components scattered through pages | `KawaiiIcon` + `@iconify/vue` local registration | Semantic wrapper enforces source priority and prevents runtime network icon fetch. [VERIFIED: 42-CONTEXT.md] [CITED: https://iconify.design/docs/icon-components/vue/add-icon.html] |
| Loading placeholders | Random spinners and layout-shifting placeholders | shadcn-vue `Skeleton` and structural fixed-size states | UI-SPEC requires loading/skeleton state matrix and stable dimensions. [VERIFIED: 42-UI-SPEC.md] |
| Scroll containers | Custom scrollbar DOM/JS | shadcn-vue `Scroll Area` | The primitive exists in the locked set and avoids repeated custom scroll styling. [VERIFIED: 42-CONTEXT.md] [CITED: https://www.shadcn-vue.com/docs/components-json] |

**Key insight:** The hard parts in this phase are not visual CSS alone; they are preserving accessible primitive behavior, stable imports, deterministic local icons, chart module registration, and consistent tokens for later page phases. [VERIFIED: 42-CONTEXT.md] [VERIFIED: 42-UI-SPEC.md]

## Common Pitfalls

### Pitfall 1: shadcn-vue CLI Generates Imports the Project Cannot Resolve

**What goes wrong:** Generated components import from `@/components` or `@/lib`, but current `apps/web` has no `@/*` alias. [VERIFIED: apps/web/vite.config.ts] [VERIFIED: apps/web/tsconfig.json]  
**Why it happens:** shadcn-vue Vite setup assumes a source alias. [CITED: https://www.shadcn-vue.com/docs/installation/vite]  
**How to avoid:** Add alias first, then run `init`, then generate components. [CITED: https://www.shadcn-vue.com/docs/installation/vite]  
**Warning signs:** TypeScript reports unresolved `@/components/ui/*` or Vite build fails during import resolution. [ASSUMED]

### Pitfall 2: Tailwind v3 Assumptions Sneak Into a Tailwind v4 App

**What goes wrong:** Planner adds `tailwind.config.ts` work that the current app does not need or points `components.json.tailwind.config` to a nonexistent v3-style config. [VERIFIED: apps/web/src/style.css]  
**Why it happens:** shadcn-vue docs say Tailwind v4 leaves `tailwind.config` blank in `components.json`. [CITED: https://www.shadcn-vue.com/docs/components-json]  
**How to avoid:** Keep `tailwind.css` pointed at `src/style.css` and leave the Tailwind config field empty for v4. [CITED: https://www.shadcn-vue.com/docs/components-json]  
**Warning signs:** CLI prompts or generated config reference `tailwind.config.js` even though the app uses `@tailwindcss/vite`. [VERIFIED: apps/web/package.json]

### Pitfall 3: Default shadcn Neutral Theme Leaks Into v8

**What goes wrong:** Buttons, cards, popovers, and tabs render black/white/gray while existing app chrome uses kawaii colors. [VERIFIED: 42-CONTEXT.md]  
**Why it happens:** Generated primitives are source code, but they still need local class/token edits after generation. [CITED: https://www.shadcn-vue.com/docs/components-json]  
**How to avoid:** Treat token recalibration and primitive default variants as required acceptance criteria, not visual polish. [VERIFIED: 42-UI-SPEC.md]  
**Warning signs:** `/__ui` default state contains pure black text, gray borders, rectangular controls, or neutral hover states. [VERIFIED: 42-UI-SPEC.md]

### Pitfall 4: Iconify Silently Uses Runtime API Loading

**What goes wrong:** A semantic icon maps to a string id with no registered local data, causing the component to load or wait for remote Iconify data. [CITED: https://iconify.design/docs/icon-components/vue/]  
**Why it happens:** Iconify Vue can load icons on demand from its API when only an icon name is used. [CITED: https://iconify.design/docs/icon-components/vue/]  
**How to avoid:** Bootstrap all semantic fallback icons through `addIcon` or `addCollection`, and test `KawaiiIcon` with network-independent assertions. [CITED: https://iconify.design/docs/icon-components/vue/add-icon.html] [VERIFIED: 42-CONTEXT.md]  
**Warning signs:** Tests pass only with network access, icons appear after delayed fetches, or raw Iconify ids appear in page components. [ASSUMED]

### Pitfall 5: ECharts Renders Blank Because Container Has No Size

**What goes wrong:** `VChart` mounts but no chart is visible. [CITED: https://echarts.apache.org/handbook/en/concepts/chart-size/]  
**Why it happens:** ECharts requires the container to have width and height before initialization. [CITED: https://echarts.apache.org/handbook/en/concepts/chart-size/]  
**How to avoid:** `BaseChart` must enforce stable `min-height`/height and use `autoresize`. [CITED: https://github.com/ecomfe/vue-echarts] [VERIFIED: 42-UI-SPEC.md]  
**Warning signs:** `/__ui` chart demo has an empty chart root, missing canvas, or zero-height container. [VERIFIED: 42-UI-SPEC.md]

### Pitfall 6: Teleported Overlays Are Tested with the Wrong Query Scope

**What goes wrong:** Dialog/Popover tests cannot find opened content even though the component works. [VERIFIED: vue-testing-best-practices skill]  
**Why it happens:** Vue Test Utils wrapper queries do not automatically include Teleported DOM. [VERIFIED: vue-testing-best-practices skill]  
**How to avoid:** Stub Teleport for smoke tests or attach to `document.body` and query the real DOM. [VERIFIED: vue-testing-best-practices skill]  
**Warning signs:** Tests fail only for dialog/popover/dropdown content after click triggers. [ASSUMED]

### Pitfall 7: `/__ui` Escapes Into Production

**What goes wrong:** Production users can open the developer primitive matrix. [VERIFIED: 42-CONTEXT.md]  
**Why it happens:** The route exists in `router/index.ts` without a `DEV` guard. [VERIFIED: apps/web/src/router/index.ts]  
**How to avoid:** Add a route-level `beforeEnter` returning `{ path: '/' }` when `!import.meta.env.DEV`, and add a router spec that simulates production env where feasible. [VERIFIED: 42-CONTEXT.md]  
**Warning signs:** Production build route table still resolves `/__ui` to the showcase component. [ASSUMED]

## Code Examples

### `cn()` Utility for Generated Components

```ts
// Source: shadcn-vue generated patterns and components.json aliases.
// apps/web/src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

This helper should be generated or created under `@/lib/utils` because shadcn-vue component examples import `cn` from that alias. [CITED: https://www.shadcn-vue.com/docs/components-json]

### BaseChart Contract

```vue
<!-- Source: https://github.com/ecomfe/vue-echarts -->
<script setup lang="ts">
import VChart from 'vue-echarts'
import type { ComposeOption } from 'echarts/core'
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption, RadarSeriesOption } from 'echarts/charts'
import type { GridComponentOption, LegendComponentOption, TitleComponentOption, TooltipComponentOption } from 'echarts/components'

import '@/lib/charts/register'

type YumeChartOption = ComposeOption<
  | LineSeriesOption
  | PieSeriesOption
  | BarSeriesOption
  | RadarSeriesOption
  | GridComponentOption
  | LegendComponentOption
  | TitleComponentOption
  | TooltipComponentOption
>

defineProps<{
  option?: YumeChartOption
  loading?: boolean
  empty?: boolean
  error?: string | null
}>()
</script>

<template>
  <section class="base-chart" :aria-busy="loading ? 'true' : 'false'">
    <p v-if="error" class="base-chart__state" role="alert">{{ error }}</p>
    <p v-else-if="empty" class="base-chart__state">还没有旅行记录</p>
    <VChart
      v-else-if="option"
      class="base-chart__canvas"
      :option="option"
      theme="yume-kawaii"
      :loading="loading"
      :autoresize="{ throttle: 100 }"
    />
  </section>
</template>
```

`BaseChart` should not import stores or APIs in Phase 42; it consumes options and explicit state props. [VERIFIED: 42-CONTEXT.md]

### KawaiiIcon Contract

```vue
<!-- Source: 42-CONTEXT.md and https://iconify.design/docs/icon-components/vue/add-icon.html -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

import { semanticIconMap, type KawaiiIconName } from '@/lib/icons/semantic-icons'
import '@/lib/icons/registry'

const props = withDefaults(defineProps<{
  name: KawaiiIconName
  label?: string
  decorative?: boolean
  size?: number
}>(), {
  decorative: true,
  size: 24,
})

const entry = computed(() => semanticIconMap[props.name])
</script>

<template>
  <span class="kawaii-icon" :style="{ width: `${size}px`, height: `${size}px` }">
    <img v-if="entry.kind === 'asset'" :src="entry.src" :alt="decorative ? '' : label" />
    <Icon v-else :icon="entry.icon" :aria-hidden="decorative ? 'true' : undefined" />
  </span>
</template>
```

The implementation should enforce fixed square dimensions so icon loading or hover states do not shift layout. [VERIFIED: 42-UI-SPEC.md]

### Showcase Smoke Test Shape

```ts
// Source: apps/web/vitest.config.ts and vue-testing-best-practices skill.
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import UiShowcaseView from './UiShowcaseView.vue'

describe('UiShowcaseView', () => {
  it('renders primitive matrix and opens overlay examples', async () => {
    const wrapper = mount(UiShowcaseView, {
      global: { stubs: { Teleport: true } },
    })

    expect(wrapper.text()).toContain('UI Primitives')
    await wrapper.get('[data-testid="showcase-dialog-trigger"]').trigger('click')
    expect(wrapper.text()).toContain('Dialog')
  })
})
```

Vitest already runs in `happy-dom` and includes `src/**/*.spec.ts` by default. [VERIFIED: apps/web/vitest.config.ts]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 config-centered setup | Tailwind v4 with `@tailwindcss/vite` and CSS `@theme` entry | Project already uses Tailwind v4 in `apps/web`. [VERIFIED: apps/web/package.json] [VERIFIED: apps/web/src/style.css] | `components.json.tailwind.config` should be blank for Tailwind v4. [CITED: https://www.shadcn-vue.com/docs/components-json] |
| vue-echarts v7 + ECharts 5 | vue-echarts v8 + ECharts 6 | `vue-echarts@8.0.0` updated peer dependency to ECharts `^6.0.0`; npm latest stable is `8.0.1`. [CITED: https://github.com/ecomfe/vue-echarts/releases] [VERIFIED: npm registry] | Use `echarts@6.0.0` with `vue-echarts@8.0.1`, not older v7 docs. [VERIFIED: npm registry] |
| ECharts full import | Tree-shakeable `echarts/core` imports | Official handbook recommends importing only needed modules to reduce bundle size. [CITED: https://echarts.apache.org/handbook/en/basics/import/] | Central registration should include only line, pie, bar, radar, components, and renderer required for Phase 47. [VERIFIED: 42-CONTEXT.md] |
| Runtime Iconify API as convenience | Local `addIcon`/`addCollection` whitelist | Phase 42 forbids runtime network icon fetch. [VERIFIED: 42-CONTEXT.md] | Planner must include a registry test or code review check for raw Iconify ids outside `KawaiiIcon`. [VERIFIED: 42-UI-SPEC.md] |
| shadcn-vue default style | `new-york` style with local Yume Kawaii overrides | shadcn-vue docs mark `default` style deprecated and recommend `new-york`. [CITED: https://www.shadcn-vue.com/docs/components-json] | Initialize with current supported style, then theme generated classes locally. [CITED: https://www.shadcn-vue.com/docs/components-json] |

**Deprecated/outdated:**
- `components.json.style = "default"` is deprecated; use `new-york`. [CITED: https://www.shadcn-vue.com/docs/components-json]
- `vue-echarts@7` is not the preferred target for this Vue 3 + ECharts 6 phase; `vue-echarts@8.0.1` is the current stable npm version. [VERIFIED: npm registry] [CITED: https://github.com/ecomfe/vue-echarts/releases]
- `enableCache()` is not a solution for Phase 42 offline icons because Iconify docs state it no longer works as of 2025 and local `addIcon`/`addCollection` data is not cached through it. [CITED: https://iconify.design/docs/icon-components/vue/enable-cache.html]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | TypeScript/Vite unresolved alias errors will appear if generated `@/components/ui/*` imports are used before alias setup. | Common Pitfalls | Planner may order tasks incorrectly and hit build failures. |
| A2 | Missing local Iconify data can lead to delayed remote loading or blank icons depending on runtime network behavior. | Common Pitfalls | Tests may miss forbidden runtime network icon dependency. |
| A3 | Production route-table checks can identify whether `/__ui` still resolves to the showcase component. | Common Pitfalls | Planner may need a different test seam for `import.meta.env.DEV`. |

## Open Questions

1. **Should Phase 42 commit generated `components.json` choices exactly as `new-york` + CSS variables?**
   - What we know: shadcn-vue docs say `default` style is deprecated and `new-york` should be used. [CITED: https://www.shadcn-vue.com/docs/components-json]
   - What's unclear: The prior context did not explicitly lock the `components.json.style` value. [VERIFIED: 42-CONTEXT.md]
   - Recommendation: Use `new-york`, `typescript: true`, `tailwind.cssVariables: true`, `tailwind.css: "src/style.css"`, and keep Tailwind config blank for v4. [CITED: https://www.shadcn-vue.com/docs/components-json]

2. **Should the icon whitelist be generated from `@iconify-json/*` packages or maintained as a small typed local data file?**
   - What we know: Iconify Vue supports both `addIcon` and `addCollection` with local data. [CITED: https://iconify.design/docs/icon-components/vue/add-icon.html] [CITED: https://iconify.design/docs/icon-components/vue/add-collection.html]
   - What's unclear: The phase did not lock the exact icon set IDs. [VERIFIED: 42-CONTEXT.md]
   - Recommendation: Start with a small typed local registry for the semantic names and optionally use `@iconify-json/flat-color-icons` / `@iconify-json/solar` as dev-time extraction sources; do not import whole icon sets into `KawaiiIcon`. [VERIFIED: npm registry]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Vite, Vitest, shadcn-vue CLI, ECharts build | ✓ | `v24.15.0` | None needed. [VERIFIED: `node --version`] |
| npm / npx | npm registry checks and Context7 CLI fallback | ✓ | `11.12.1` | None needed. [VERIFIED: `npm --version`, `npx --version`] |
| pnpm executable | Workspace dependency installation | Partial | `package.json` pins `pnpm@10.33.0`; `/opt/homebrew/bin/pnpm` points to Homebrew `11.0.8`, but `pnpm --version` failed with `[ERROR] fetch failed`. | Use network-approved install command or fix local pnpm/Corepack before execution. [VERIFIED: package.json] [VERIFIED: `/opt/homebrew/bin/pnpm` symlink] [VERIFIED: `pnpm --version`] |
| apps/web node_modules | Local typecheck/test/build | ✓ | Existing directory present | Run install after dependency changes. [VERIFIED: filesystem check] |
| Network access to npm registry | Dependency install and version verification | Restricted by sandbox | Registry queries succeeded only with escalated network command. | Planner should include an install step that may require approval. [VERIFIED: npm registry] |

**Missing dependencies with no fallback:**
- None found for planning; execution needs working pnpm/network approval to install new packages. [VERIFIED: environment audit]

**Missing dependencies with fallback:**
- `pnpm --version` currently fails in the sandbox; `npm`/`npx` exist, but the monorepo should still use pnpm once network/Corepack behavior is resolved. [VERIFIED: `pnpm --version`] [VERIFIED: package.json]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `4.1.4` with Vue Test Utils `2.4.6` and `happy-dom` `20.9.0`. [VERIFIED: apps/web/package.json] |
| Config file | `apps/web/vitest.config.ts`. [VERIFIED: apps/web/vitest.config.ts] |
| Quick run command | `npm --prefix apps/web run test -- src/views/UiShowcaseView.spec.ts` or project-standard `pnpm --filter @trip-map/web test -- src/views/UiShowcaseView.spec.ts` after pnpm works. [VERIFIED: apps/web/package.json] |
| Full suite command | `npm --prefix apps/web run test` or `pnpm --filter @trip-map/web test`. [VERIFIED: apps/web/package.json] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| DS-01 | `@/components/ui/...` imports resolve in TS/Vite. | typecheck/build smoke | `npm --prefix apps/web run typecheck` | ❌ Wave 0 [VERIFIED: apps/web/package.json] |
| DS-02 | Required shadcn-vue primitives render in `/__ui`. | component smoke | `npm --prefix apps/web run test -- src/views/UiShowcaseView.spec.ts` | ❌ Wave 0 [VERIFIED: apps/web/vitest.config.ts] |
| DS-03 | `BaseChart` renders demo option plus loading/empty/error states. | component smoke | `npm --prefix apps/web run test -- src/components/common/BaseChart.spec.ts` | ❌ Wave 0 [VERIFIED: filesystem scan] |
| DS-04 | `KawaiiIcon` renders semantic examples from local data/assets without raw page Iconify ids. | unit/component smoke | `npm --prefix apps/web run test -- src/components/common/KawaiiIcon.spec.ts` | ❌ Wave 0 [VERIFIED: filesystem scan] |
| DS-05 | Primitive defaults use Yume Kawaii tokens, not neutral defaults. | component + CSS contract smoke | `npm --prefix apps/web run test -- src/components/showcase/UiPrimitiveShowcase.spec.ts` | ❌ Wave 0 [VERIFIED: filesystem scan] |

### Sampling Rate

- **Per task commit:** Run the focused spec touched by the task plus `npm --prefix apps/web run typecheck` when aliases or generated components change. [VERIFIED: apps/web/package.json]
- **Per wave merge:** Run `npm --prefix apps/web run test` and `npm --prefix apps/web run build`. [VERIFIED: apps/web/package.json]
- **Phase gate:** Full `apps/web` test and build should pass before `$gsd-verify-work`. [VERIFIED: .planning/config.json]

### Wave 0 Gaps

- [ ] `apps/web/src/views/UiShowcaseView.spec.ts` — covers DS-01/DS-02 route and primitive rendering. [VERIFIED: filesystem scan]
- [ ] `apps/web/src/components/common/KawaiiIcon.spec.ts` — covers DS-04 semantic icon rendering and no raw id API in page code. [VERIFIED: filesystem scan]
- [ ] `apps/web/src/components/common/BaseChart.spec.ts` — covers DS-03 chart wrapper states and stable container. [VERIFIED: filesystem scan]
- [ ] `apps/web/src/components/showcase/UiPrimitiveShowcase.spec.ts` — covers DS-05 default themed state matrix. [VERIFIED: filesystem scan]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no | Phase 42 does not change auth flows or session logic. [VERIFIED: 42-CONTEXT.md] |
| V3 Session Management | no | Phase 42 does not change cookies, session restore, or auth storage. [VERIFIED: 42-CONTEXT.md] |
| V4 Access Control | yes, limited | `/__ui` must be dev-only via `import.meta.env.DEV` redirect and omitted from product navigation. [VERIFIED: 42-CONTEXT.md] |
| V5 Input Validation | yes | Use typed props, semantic icon-name unions, and ECharts option props instead of accepting arbitrary user-provided SVG/HTML. [VERIFIED: vue-best-practices skill] [VERIFIED: 42-UI-SPEC.md] |
| V6 Cryptography | no | Phase 42 does not introduce cryptographic operations. [VERIFIED: 42-CONTEXT.md] |

### Known Threat Patterns for Vue UI Primitives

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Raw SVG/Iconify data injection through page props | Tampering / XSS | Keep `KawaiiIcon` semantic and source icon data from a local whitelist only. [VERIFIED: 42-CONTEXT.md] [CITED: https://iconify.design/docs/icon-components/vue/add-icon.html] |
| ECharts tooltip HTML built from user content | XSS | Phase 42 demo options should avoid raw user HTML; later data phases should escape or render plain text in formatter output. [ASSUMED] |
| Dev showcase exposed in production | Information Disclosure | Guard `/__ui` with `import.meta.env.DEV` and redirect production requests to `/`. [VERIFIED: 42-CONTEXT.md] |
| Overlay focus escape | Spoofing / UX integrity | Use shadcn-vue/Reka primitives for dialog, popover, dropdown, and sidebar behavior. [VERIFIED: 42-UI-SPEC.md] [CITED: https://www.shadcn-vue.com/docs/components-json] |
| Dependency supply-chain drift | Tampering | Pin current versions in install commands and review generated source before committing. [VERIFIED: npm registry] |

## Sources

### Primary (HIGH confidence)

- `42-CONTEXT.md` — locked Phase 42 decisions, scope, primitive list, icon/chart constraints, dev showcase requirements. [VERIFIED: 42-CONTEXT.md]
- `42-UI-SPEC.md` — visual contract, component states, accessibility, responsive, asset, and verification requirements. [VERIFIED: 42-UI-SPEC.md]
- `apps/web/package.json`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `style.css`, `styles/tokens.css` — current web stack, aliases, scripts, test config, and token entry. [VERIFIED: codebase scan]
- npm registry via `npm view` — current package versions and modified timestamps for stack packages. [VERIFIED: npm registry]
- shadcn-vue Vite docs — alias setup, Tailwind v4 setup, CLI init/add flow. [CITED: https://www.shadcn-vue.com/docs/installation/vite]
- shadcn-vue `components.json` docs — `new-york`, Tailwind v4 blank config, CSS variables, aliases. [CITED: https://www.shadcn-vue.com/docs/components-json]
- Apache ECharts import handbook — tree-shakeable imports, `echarts/core`, required renderer. [CITED: https://echarts.apache.org/handbook/en/basics/import/]
- Apache ECharts chart-size handbook — chart containers need width and height before initialization. [CITED: https://echarts.apache.org/handbook/en/concepts/chart-size/]
- vue-echarts README/releases — Vue component API, `autoresize`, `loading`, `theme`, and v8/ECharts 6 compatibility. [CITED: https://github.com/ecomfe/vue-echarts] [CITED: https://github.com/ecomfe/vue-echarts/releases]
- Iconify Vue docs — component usage, `addIcon`, `addCollection`, and local icon data registration. [CITED: https://iconify.design/docs/icon-components/vue/] [CITED: https://iconify.design/docs/icon-components/vue/add-icon.html] [CITED: https://iconify.design/docs/icon-components/vue/add-collection.html]

### Secondary (MEDIUM confidence)

- Context7 CLI excerpts for `/unovue/shadcn-vue`, `/ecomfe/vue-echarts`, `/apache/echarts-doc`, `/iconify/iconify` — used to cross-check official examples and APIs. [VERIFIED: Context7 CLI fallback]
- Project skills `vue-best-practices`, `vue-testing-best-practices`, `vite`, `vitest`, `baseline-ui` — used for planning conventions and test gotchas. [VERIFIED: local skills]

### Tertiary (LOW confidence)

- Assumptions A1-A3 in the Assumptions Log — need executor validation during implementation. [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified with npm registry and core APIs checked against official docs. [VERIFIED: npm registry] [CITED: official docs above]
- Architecture: HIGH — phase scope and codebase integration points are explicit in CONTEXT/UI-SPEC and current `apps/web` files. [VERIFIED: 42-CONTEXT.md] [VERIFIED: codebase scan]
- Pitfalls: MEDIUM-HIGH — most pitfalls are verified from current code and docs; runtime warning signs include a few implementation-time assumptions. [VERIFIED: codebase scan] [ASSUMED]

**Research date:** 2026-05-11  
**Valid until:** 2026-06-10 for local architecture and 2026-05-18 for npm package latest-version assumptions. [ASSUMED]
