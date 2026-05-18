# Phase 46: 旅途手账重构 - Research

**Researched:** 2026-05-18  
**Domain:** Vue 3 authenticated journal UI refactor, deterministic decorative thumbnails, responsive Yume Kawaii card stream  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

## Implementation Decisions

### Reference Image Conflicts
- **D-01:** Treat `prd/v8.0/UI/旅途手帐.png` as the visual authority for atmosphere, spacing, glowing vertical line, star nodes, card rhythm, and postcard thumbnail placement, but do not copy excluded functionality from the mockup.
- **D-02:** Completely remove the mockup's `添加新旅行` entry from Phase 46. Do not render it as active, disabled, decorative, or future-placeholder UI.
- **D-03:** Completely remove favorite/collection controls from journal cards. The right-side circular heart/star button from the mockup should become a pure decorative star node or visual accent with no button semantics.
- **D-04:** The empty state may guide users back to `世界足迹` because real trip creation still starts from the map and a real recognized place. This is allowed as navigation, not a local "add trip" entry.
- **D-05:** Leave the header's upper-right area as whitespace / breathing room. Do not replace the removed add button with stats pills, return-map buttons, or tool actions.

### Journal Card Information Density
- **D-06:** Main cards should be lightweight reading cards, not management records. The primary view should show date, place name, a natural location path, one travel-note summary, a small tag-sticker treatment, a low-noise repeat-visit badge, and a thumbnail.
- **D-07:** Use a single "旅行摘记" style summary in the main card. Prefer the first meaningful note line or a short truncated note; tags may appear as a few small stickers alongside it.
- **D-08:** For multiple visits to the same place, show a low-noise badge such as `第 2 次 / 共 3 次`. Keep it near the date or card corner, not crowded into the title.
- **D-09:** Location context should read as one natural path, such as `中国 · 广东 · 地级市` or `日本 · 京都府`. Avoid splitting country, region, type, and admin level into table-like field blocks.

### Thumbnail and Illustration Treatment
- **D-10:** Journal thumbnails are deterministic decorative illustrations, not user photos. Do not imply photo upload or real travel imagery.
- **D-11:** Use region/type-driven soft landscape postcard variants: clouds, starlight, city silhouettes, mountains, sea, skyline, or similar dreamy travel scenery.
- **D-12:** Thumbnail selection should be stable across refreshes and sorting changes. Use a deterministic mapping from existing record fields such as `placeId`, `parentLabel`, and/or `regionSystem` into a small set of illustration variants.
- **D-13:** Thumbnail images are decorative for accessibility. The card already exposes real date/place/summary text, so the illustration should use empty alt text or `aria-hidden`.

### Edit and Delete Entry Points
- **D-14:** Keep v7 edit/delete capabilities, but move them out of the primary card footer into a low-noise more/menu/management area.
- **D-15:** The more/menu/management area should contain only management actions such as edit and delete. Do not turn it into a full record-detail panel.
- **D-16:** Editing should still happen inline by replacing the card body with the existing edit form flow, preserving current date conflict, notes, tags, submit, cancel, and store behavior.
- **D-17:** Deletion should remain low-noise but clearly destructive. Keep the confirmation dialog and destructive semantics, while making the entry visually quieter than the reading content.

### the agent's Discretion
Downstream agents may choose the exact component split, thumbnail variant names, hash helper placement, animation implementation, and whether the management entry is a small menu button or compact reveal control, as long as the decisions above stay locked and the page remains responsive without text overlap.

### Deferred Ideas (OUT OF SCOPE)

## Deferred Ideas

- Adding trips directly from the journal remains out of scope; creation stays on `世界足迹`.
- Favorites, collections, favorite state, and `我的收藏` remain out of scope for v8.0.
- User-uploaded photos, real photo thumbnails, and rich travel diary content remain out of scope; Phase 46 only uses decorative illustration slots.
- Phase 47 owns `旅途回忆` dashboard charts, rankings, overview cards, and memory image carousel behavior.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| JOURNAL-01 | `/timeline` 页面重命名并视觉升级为“旅途手账”。 | Phase 43 已锁定真实主路径为 `/journal`、route name 为 `travel-journal`，旧 `/timeline` 不保留兼容；Phase 46 应重构现有 `TimelinePageView.vue` 而不是新增旧路径。 [VERIFIED: `.planning/phases/43-landing/43-CONTEXT.md`; `apps/web/src/router/index.ts`] |
| JOURNAL-02 | 旅途手账以发光渐变竖线、星形节点和卡片流展示每条旅行记录。 | 现有 populated 分支只是 `grid` 卡片列表；需要替换为 journal stream，并在每条记录旁渲染装饰星形节点。 [VERIFIED: `apps/web/src/views/TimelinePageView.vue:149`; `prd/v8.0/ASSET-MANIFEST.md`] |
| JOURNAL-03 | 每张手账卡片展示日期、地点、地区、备注/标签摘要和视觉缩略图/插画位。 | `TimelineEntry` 已提供日期、地点、地区、备注、标签和访问次数字段；缺口是摘要派生和确定性装饰缩略图。 [VERIFIED: `apps/web/src/services/timeline.ts:3`; `apps/web/src/components/timeline/TimelineVisitCard.vue:112`] |
| JOURNAL-04 | 旅途手账不提供“添加新旅行”入口，新增旅行仍必须从地图真实地点进入。 | CONTEXT 明确禁止添加入口；空状态允许导航到 `/map`，不是本页创建入口。 [VERIFIED: `.planning/phases/46-travel-journal-refactor/46-CONTEXT.md`; `apps/web/src/views/TimelinePageView.vue:140`] |
| JOURNAL-05 | 旅途手账不展示收藏按钮、收藏状态或“我的收藏”相关入口。 | 当前 card 没有收藏控件，但 `ShellSidebar.vue` 仍显示禁用的 `我的收藏` 导航项；planner 必须决定把它纳入 Phase 46 清理，否则页面级验收会看到收藏入口。 [VERIFIED: `apps/web/src/components/timeline/TimelineVisitCard.vue:184`; `apps/web/src/components/shell/ShellSidebar.vue:28`] |
| JOURNAL-06 | 空状态、登录恢复状态和错误状态均符合 Yume Kawaii 视觉语言。 | 现有页面覆盖 restoring / anonymous / empty / populated 分支；未发现 journal 专属错误状态分支，错误体验若来自 store/app shell 需要在计划中明确验证。 [VERIFIED: `apps/web/src/views/TimelinePageView.vue:20`; `apps/web/src/App.vue`] |
</phase_requirements>

## Summary

Phase 46 should be planned as a route-surface and card-hierarchy refactor over the existing authenticated `/journal` implementation, not as a new route or a data-model rewrite. The canonical data pipeline already exists: `map-points.timelineEntries` derives from real `TravelRecord` records via `buildTimelineEntries()`, preserving chronological sort, unknown-date placement, notes, tags, canonical labels, and repeated-visit ordinal/count. [VERIFIED: `apps/web/src/stores/map-points.ts`; `apps/web/src/services/timeline.ts`]

The highest-risk planning issue is scope leakage from the mockup and current shell. The mockup contains excluded add/favorite affordances, and the current shell still renders disabled future entries including `我的收藏` and `点亮足迹`; because the shell is visible on `/journal`, JOURNAL-05 is likely not satisfied by card-only work. [VERIFIED: `.planning/phases/46-travel-journal-refactor/46-CONTEXT.md`; `apps/web/src/components/shell/ShellSidebar.vue:28`]

Use Vue 3 `<script setup lang="ts">`, Pinia, existing shadcn-vue/Reka primitives, existing v8 theme tokens, and Vitest/Vue Test Utils. Do not add a new animation, image, state, or routing library for this phase. [VERIFIED: `apps/web/package.json`; `apps/web/src/components/ui`; CITED: https://vuejs.org/guide/essentials/computed; CITED: https://pinia.vuejs.org/core-concepts/]

**Primary recommendation:** Plan a two-surface refactor: first lock absence/behavior tests and shell exclusions, then rebuild `TimelinePageView.vue` + `TimelineVisitCard.vue` into a responsive glowing journal stream with deterministic decorative postcard variants and quiet management actions. [VERIFIED: codebase grep; `.planning/phases/46-travel-journal-refactor/46-CONTEXT.md`]

## Project Constraints (from AGENTS.md)

- 与用户交流必须始终使用中文，除非用户明确要求英文。 [VERIFIED: `AGENTS.md`]
- 开始实现前必须简要说明将要执行的操作。 [VERIFIED: `AGENTS.md`]
- 修改代码时优先保持最小改动，并遵循现有项目结构与风格。 [VERIFIED: `AGENTS.md`]
- GSD workflow / phase / review / audit / execute / plan 可按工作流需要自动启动子代理或并行代理；如使用子代理，必须等待结果再继续。 [VERIFIED: `AGENTS.md`]
- 完成后用中文简要说明变更内容、影响范围与验证结果。 [VERIFIED: `AGENTS.md`]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| `/journal` route protection and route naming | Frontend Server / Router | Browser / Client | Vue Router owns route registration and auth guard; Phase 43 already locked `/journal` and old `/timeline` fallthrough behavior. [VERIFIED: `apps/web/src/router/index.ts`; `.planning/phases/43-landing/43-CONTEXT.md`] |
| Journal state branching | Browser / Client | Pinia Store | The view already branches on auth status and `timelineEntries`; no backend call should be introduced for visual states. [VERIFIED: `apps/web/src/views/TimelinePageView.vue:20`] |
| Travel record derivation | Browser / Client | Pinia Store | `buildTimelineEntries()` already transforms `TravelRecord[]` into display entries, including sort and repeated visits. [VERIFIED: `apps/web/src/services/timeline.ts:69`] |
| Journal stream layout and card visuals | Browser / Client | CDN / Static assets | CSS/Tailwind/Vue components should own glowing line, nodes, cards, and decorative thumbnails; static assets are optional support. [VERIFIED: `apps/web/src/styles/tokens.css`; `prd/v8.0/ASSET-MANIFEST.md`] |
| Edit/delete record lifecycle | Browser / Client | API / Backend | Existing card calls Pinia actions `updateRecord` and `deleteSingleRecord`; Phase 46 should move entry points, not change API contracts. [VERIFIED: `apps/web/src/components/timeline/TimelineVisitCard.vue:71`] |
| Favorite/add-trip exclusions | Browser / Client | Router / Shell | Excluded controls must be absent from page/card/shell rendering; creation remains the map flow. [VERIFIED: `.planning/phases/46-travel-journal-refactor/46-CONTEXT.md`; `apps/web/src/components/shell/ShellSidebar.vue:28`] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue | installed `^3.5.32`; npm current `3.5.34`, modified 2026-05-15 | SFC rendering, reactivity, computed display derivation, optional `<Transition>` for state changes | Project uses Vue SFCs; official docs state computed values track reactive dependencies and cache by dependency. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry; CITED: https://vuejs.org/guide/essentials/computed] |
| Pinia | installed `^3.0.4`; npm current `3.0.4`, modified 2025-11-05 | Existing auth/session and map-points store access | Project already uses Pinia and `storeToRefs`; Pinia documents stores as state/getters/actions and supports setup stores. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry; CITED: https://pinia.vuejs.org/core-concepts/] |
| Vue Router | installed `^4`; npm current `5.0.7`, modified 2026-05-13 | `/journal` route, auth guard, `/map` empty-state navigation | Project route lock is existing Vue Router; do not adopt v5 semantics unless the project explicitly upgrades later. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry; `apps/web/src/router/index.ts`] |
| Reka UI / shadcn-vue local primitives | `reka-ui 2.9.7`; generated local components present | Dropdown menu or dialog primitive for quiet management actions if needed | Existing local UI primitives include dropdown-menu, dialog, tooltip, skeleton, card, and button; use them before custom keyboard/focus behavior. [VERIFIED: `apps/web/package.json`; VERIFIED: `apps/web/src/components/ui`] |
| Tailwind CSS + project tokens | Tailwind `^4.2.2`; tokens in `tokens.css` | Responsive Yume Kawaii layout, glow, card surfaces, reduced-motion CSS | Existing tokens provide colors, gradients, shadows, radii, and motion durations used across v8 pages. [VERIFIED: `apps/web/package.json`; VERIFIED: `apps/web/src/styles/tokens.css`] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | installed `^4.1.4`; npm current `4.1.6`, modified 2026-05-11 | Unit/component verification | Use for focused page/card/service specs and phase gate. Vitest docs require Vite >= 6 and Node >= 20; environment has Vite 8.0.8 and Node 26.0.0. [VERIFIED: npm registry; VERIFIED: local commands; CITED: https://vitest.dev/guide/] |
| Vue Test Utils | installed `^2.4.6`; npm current `2.4.10`, modified 2026-04-30 | Mounting Vue components and asserting visible behavior | Use black-box assertions around user-observable DOM, actions, and store side effects rather than internals. [VERIFIED: npm registry; CITED: https://test-utils.vuejs.org/guide/essentials/easy-to-test.html] |
| @vueuse/core | installed/current `14.3.0`, modified 2026-05-01 | Optional composables if already used | Do not add VueUse just for deterministic hashing or CSS motion; simple pure helpers are enough. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry] |
| @iconify/vue / KawaiiIcon | `@iconify/vue 5.0.1`; local semantic icon registry present | Existing icon rendering | Use existing `KawaiiIcon` only where a semantic icon is necessary; decorative star nodes can be CSS/assets with hidden accessibility semantics. [VERIFIED: `apps/web/package.json`; `apps/web/src/lib/icons/semantic-icons.ts`] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS/Tailwind card stream | GSAP/framer-motion equivalent | Adds unnecessary dependency and test surface; Vue and CSS transitions cover lightweight enter/hover effects. [CITED: https://vuejs.org/guide/built-ins/transition.html; VERIFIED: `apps/web/package.json`] |
| Local deterministic postcard variants | Real uploaded photos | User-uploaded photos are explicitly out of scope and introduce storage/security/UI work. [VERIFIED: `.planning/REQUIREMENTS.md`; `.planning/phases/46-travel-journal-refactor/46-CONTEXT.md`] |
| Existing `ConfirmDialog` | New destructive action modal system | Existing delete dialog is already tested and wired; replacing it increases regression risk. [VERIFIED: `apps/web/src/components/timeline/ConfirmDialog.vue`; `apps/web/src/components/timeline/TimelineVisitCard.spec.ts`] |
| Local dropdown-menu primitive | Hand-rolled popover/menu | Local primitive already exists; hand-rolled menus risk keyboard/focus regressions. [VERIFIED: `apps/web/src/components/ui/dropdown-menu`; CITED: https://test-utils.vuejs.org/guide/essentials/easy-to-test.html] |

**Installation:**

```bash
# No new runtime dependency recommended for Phase 46.
```

## Architecture Patterns

### System Architecture Diagram

```text
Authenticated user opens /journal
        |
        v
Vue Router auth guard checks session
        |
        +-- anonymous/restoring --> Landing/restore or journal restoring/login branch
        |
        v
TimelinePageView reads Pinia auth + map-points store
        |
        v
map-points.timelineEntries computed from TravelRecord[]
        |
        v
buildTimelineEntries()
  - canonical labels pass through
  - known dates sorted first
  - repeated visits get ordinal/count
        |
        v
Journal stream
  - empty state --> RouterLink to /map only
  - populated state --> card flow + decorative nodes/thumbnails
        |
        v
TimelineVisitCard read mode
  - quiet management menu --> edit/delete
  - edit --> existing inline TimelineEditForm --> store.updateRecord
  - delete --> ConfirmDialog --> store.deleteSingleRecord
```

### Recommended Project Structure

```text
apps/web/src/
├── views/
│   └── TimelinePageView.vue              # route-level composition and state branches
├── components/timeline/
│   ├── TimelineVisitCard.vue             # card shell, read/edit/delete entry
│   ├── TimelineEditForm.vue              # preserve existing edit form flow
│   ├── ConfirmDialog.vue                 # preserve destructive confirmation
│   ├── JournalPostcardThumb.vue          # recommended new presentational thumbnail component
│   └── journal-thumbnails.ts             # recommended pure deterministic variant helper
└── services/
    └── timeline.ts                       # keep real entry derivation here unless data shape changes
```

### Pattern 1: Keep Route View as Composition Surface

**What:** `TimelinePageView.vue` should orchestrate auth/empty/populated branches and delegate card/postcard detail to timeline components. [VERIFIED: `apps/web/src/views/TimelinePageView.vue`; skill `vue-best-practices`]  
**When to use:** Use this for Phase 46 because the page has at least restoring, anonymous, empty, and populated sections plus a repeated card stream. [VERIFIED: `apps/web/src/views/TimelinePageView.vue:73`]  
**Example:**

```vue
<!-- Source: current project pattern + Vue SFC docs -->
<script setup lang="ts">
const shouldShowJournal = computed(() => status.value === 'authenticated' && entries.value.length > 0)
</script>

<template>
  <JournalEmptyState v-if="shouldShowEmptyState" />
  <JournalStream v-else-if="shouldShowJournal" :entries="entries" />
</template>
```

### Pattern 2: Deterministic Thumbnail Helper

**What:** Compute a variant from stable entry fields, not list index, random values, or current date. [VERIFIED: `.planning/phases/46-travel-journal-refactor/46-CONTEXT.md`]  
**When to use:** Use it for every decorative postcard thumbnail so sorting/refresh does not change a record's thumbnail. [VERIFIED: `.planning/phases/46-travel-journal-refactor/46-CONTEXT.md`]  
**Example:**

```typescript
// Source: Phase 46 CONTEXT D-10..D-13; project TimelineEntry fields
export type JournalPostcardVariant = 'city' | 'mountain' | 'sea' | 'starlight'

export function getJournalPostcardVariant(entry: TimelineEntry): JournalPostcardVariant {
  const source = `${entry.placeId}|${entry.parentLabel}|${entry.typeLabel}`
  let hash = 0
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0
  }
  return variants[hash % variants.length]
}
```

### Pattern 3: Decorative Media Hidden From Assistive Tech

**What:** Thumbnail/card illustrations should be `aria-hidden="true"` or `alt=""` because the card text already exposes the real trip information. [VERIFIED: `.planning/phases/46-travel-journal-refactor/46-CONTEXT.md`]  
**When to use:** Use on every thumbnail, glow node, and timeline ornament that does not add content. [VERIFIED: Phase 46 CONTEXT D-13]  
**Example:**

```vue
<!-- Source: Phase 46 CONTEXT D-13 -->
<div
  class="journal-postcard-thumb"
  :data-variant="variant"
  aria-hidden="true"
/>
```

### Pattern 4: Motion Uses Transform/Opacity and Reduced-Motion Fallback

**What:** Use CSS transitions/animations on `transform` and `opacity`; gate nonessential loops/entrances under `prefers-reduced-motion`. Vue docs identify transform/opacity as efficient because they avoid layout work, and MDN documents `prefers-reduced-motion` for reducing nonessential motion. [CITED: https://vuejs.org/guide/built-ins/transition.html; CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion]  
**When to use:** Use for card hover, star shimmer, and low-intensity entrance effects only. [VERIFIED: Phase success criteria; skill `baseline-ui`]  
**Example:**

```css
/* Source: Vue Transition performance docs + MDN reduced-motion docs */
.journal-card {
  transition: transform var(--motion-quick) ease, opacity var(--motion-quick) ease;
}

.journal-card:hover {
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  .journal-card {
    transition: none;
  }

  .journal-card:hover {
    transform: none;
  }
}
```

### Anti-Patterns to Avoid

- **Reintroducing `/timeline` as a route:** Phase 43 locked `/journal`; adding `/timeline` compatibility contradicts prior decisions. [VERIFIED: `.planning/phases/43-landing/43-CONTEXT.md`; `apps/web/src/router/index.ts`]
- **Index-based thumbnails:** Index-based variants change when sorting/filtering changes, violating stable thumbnail mapping. [VERIFIED: Phase 46 CONTEXT D-12]
- **Management footer as primary visual row:** Edit/delete must move to a quiet management area and not dominate the reading card. [VERIFIED: Phase 46 CONTEXT D-14..D-17]
- **Table-like location metadata blocks:** The user chose a natural location path instead of split field blocks. [VERIFIED: Phase 46 CONTEXT D-09]
- **Full-page screenshot as background:** CUTTING-GUIDE says UI, cards, lines, buttons, text, and data-bound content must be implemented as DOM/CSS, not whole-page PNGs. [VERIFIED: `prd/v8.0/CUTTING-GUIDE.md`]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Menu keyboard/focus behavior | Custom div popover/menu | Existing `components/ui/dropdown-menu` or a simple always-visible compact reveal if no menu behavior is needed | Primitive exists and avoids keyboard/focus regressions. [VERIFIED: `apps/web/src/components/ui/dropdown-menu`; skill `baseline-ui`] |
| Delete confirmation | New modal/dialog implementation | Existing `ConfirmDialog.vue`, or migrate to local Dialog only if the plan includes tests | Current behavior and tests already cover destructive delete. [VERIFIED: `apps/web/src/components/timeline/ConfirmDialog.vue`; `TimelineVisitCard.spec.ts`] |
| Travel entry sorting/counting | New card-level sorting/grouping | `buildTimelineEntries()` and `mapPointsStore.timelineEntries` | Existing service already handles known/unknown dates and visit ordinal/count. [VERIFIED: `apps/web/src/services/timeline.ts`] |
| User photo/media system | Upload widgets, object storage, photo metadata | Deterministic decorative postcard variants | User-uploaded photos are deferred/out of scope. [VERIFIED: `.planning/REQUIREMENTS.md`; Phase 46 CONTEXT] |
| Add-trip flow | Local journal form or CTA | Empty-state `RouterLink` to `/map` only | New trips must originate from a real recognized map place. [VERIFIED: Phase 44/46 CONTEXT; `TimelinePageView.vue:140`] |

**Key insight:** The deceptively complex parts are not visual CSS; they are preserving route/data contracts and excluding tempting mockup affordances while keeping edit/delete reachable. [VERIFIED: codebase grep; Phase 46 CONTEXT]

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | No stored route string or old `/timeline` key found for Phase 46; travel records store canonical trip fields and are already consumed through `timelineEntries`. [VERIFIED: codebase grep; `apps/web/src/services/timeline.ts`] | None for data migration; code-only refactor. [VERIFIED: codebase grep] |
| Live service config | No external service config in repo for journal route naming; no n8n/Datadog/Cloudflare-like config found in searched scope. [VERIFIED: `rg`/file tree] | None found; planner does not need API/UI service patch. [VERIFIED: repo scan] |
| OS-registered state | No OS-level registrations for `/timeline` or `旅途手账` found in repo. [VERIFIED: repo scan] | None. [VERIFIED: repo scan] |
| Secrets/env vars | No env var or secret key tied to `/timeline`, `journal`, favorite, or collection behavior found in app source. [VERIFIED: codebase grep] | None. [VERIFIED: codebase grep] |
| Build artifacts | `dist/` and `node_modules/` exist locally; these are generated/installed artifacts and should not be edited for this phase. [VERIFIED: workspace listing] | Rebuild/test via pnpm after code changes; do not manually edit artifacts. [VERIFIED: package scripts] |

## Common Pitfalls

### Pitfall 1: Route Name Confusion
**What goes wrong:** Planner may interpret the roadmap's `/timeline` wording literally and add a compatibility route. [VERIFIED: `.planning/ROADMAP.md`; `.planning/phases/43-landing/43-CONTEXT.md`]  
**Why it happens:** The current component/file names still say `Timeline`, while user-facing route vocabulary moved to `/journal` and `旅途手账`. [VERIFIED: `apps/web/src/views/TimelinePageView.vue`; `apps/web/src/router/index.ts`]  
**How to avoid:** Keep the route `/journal`; refactor or rename component internals only if the plan includes test updates. [VERIFIED: `router/index.spec.ts`]  
**Warning signs:** Tests expecting `/timeline` to resolve, or new redirects from `/timeline`. [VERIFIED: `apps/web/src/router/index.spec.ts`]

### Pitfall 2: Mockup Affordance Leakage
**What goes wrong:** `添加新旅行`, favorite buttons, heart/star button semantics, or `我的收藏` appear because they exist in the visual reference or current shell. [VERIFIED: Phase 46 CONTEXT; `ShellSidebar.vue:32`]  
**Why it happens:** The reference image is visual authority only, not functional authority. [VERIFIED: Phase 46 CONTEXT D-01..D-05]  
**How to avoid:** Add absence tests for add/favorite/collection strings and interactive selectors in page/card/shell scope. [VERIFIED: existing test pattern in `TimelinePageView.spec.ts`]  
**Warning signs:** Button labels with `添加`, `收藏`, `我的收藏`, or icon-only buttons using star/heart labels. [VERIFIED: codebase grep]

### Pitfall 3: Decorative Thumbnail Accessibility Regression
**What goes wrong:** Decorative thumbnails get misleading alt text such as "旅行照片" or become focusable controls. [VERIFIED: Phase 46 CONTEXT D-10..D-13]  
**Why it happens:** The mockup's image-like slots can be mistaken for uploaded media. [VERIFIED: Phase 46 CONTEXT]  
**How to avoid:** Render as non-focusable decorative CSS blocks or images with `alt=""` / `aria-hidden="true"`, while card text exposes date/place/location/summary. [VERIFIED: Phase 46 CONTEXT D-13]  
**Warning signs:** Tests or DOM contain `photo`, `upload`, `照片`, or thumbnail buttons. [VERIFIED: `.planning/REQUIREMENTS.md`]

### Pitfall 4: Layout Breakage on Mobile
**What goes wrong:** Glowing line, star nodes, thumbnail, and card text overlap or truncate on narrow screens. [VERIFIED: JOURNAL-02 success criteria]  
**Why it happens:** Timeline layouts often use absolute nodes without reserving inline space. [ASSUMED]  
**How to avoid:** Use responsive grid tracks with a fixed node column and `min-w-0` text containers; collapse thumbnail/card rows deliberately. [VERIFIED: existing `min-w-0` and responsive grid usage in codebase; ASSUMED pattern]  
**Warning signs:** `absolute` nodes over titles, `w-screen`, `h-screen`, or no mobile-specific grid adjustment. [VERIFIED: codebase style patterns; skill `baseline-ui`]

### Pitfall 5: Changing Edit/Delete Semantics During Visual Work
**What goes wrong:** Quieting actions accidentally removes edit/delete, breaks conflict warnings, or bypasses destructive confirmation. [VERIFIED: `TimelineVisitCard.vue`; `TimelineEditForm.vue`; `ConfirmDialog.vue`]  
**Why it happens:** The current action bar is visually loud but behaviorally complete. [VERIFIED: `TimelineVisitCard.spec.ts`]  
**How to avoid:** Move triggers into a menu/reveal while preserving the same handlers, inline edit form, conflict computation, and confirm dialog tests. [VERIFIED: `TimelineVisitCard.vue:37`; `TimelineVisitCard.vue:71`]  
**Warning signs:** New delete button directly calls store without `ConfirmDialog`, or edit route/detail panel replaces inline form. [VERIFIED: Phase 46 CONTEXT D-16..D-17]

## Code Examples

### Stable Summary Derivation

```typescript
// Source: Phase 46 CONTEXT D-07; existing TimelineEntry.notes
export function getJournalSummary(notes: string | null): string {
  const firstLine = notes?.split(/\r?\n/).map((line) => line.trim()).find(Boolean)
  return firstLine ?? '这段旅途还没有写下摘记'
}
```

### Low-Noise Management Menu Skeleton

```vue
<!-- Source: local shadcn-vue dropdown-menu primitives -->
<DropdownMenu>
  <DropdownMenuTrigger as-child>
    <button type="button" aria-label="管理这条旅行记录" data-card-management>
      <KawaiiIcon name="settings" label="管理" :decorative="false" />
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem data-card-edit @select="handleEditClick">编辑</DropdownMenuItem>
    <DropdownMenuItem data-card-delete variant="destructive" @select="handleDeleteClick">删除</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Page-Level Absence Test

```typescript
// Source: existing Vue Test Utils + Vitest page spec pattern
it('does not expose add-trip or collection affordances on the journal page', () => {
  const { wrapper } = mountTimelinePage(authenticatedWithRecords)

  expect(wrapper.text()).not.toContain('添加新旅行')
  expect(wrapper.text()).not.toContain('我的收藏')
  expect(wrapper.text()).not.toContain('收藏')
  expect(wrapper.find('[data-card-favorite]').exists()).toBe(false)
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `/timeline` user-facing route/copy | `/journal`, route name `travel-journal`, label `旅途手账` | Phase 43 | Do not add `/timeline` redirects or user-facing "时间轴" text. [VERIFIED: `.planning/phases/43-landing/43-CONTEXT.md`; `apps/web/src/router/index.ts`] |
| Plain management timeline cards | Reading-first Yume Kawaii journal stream | Phase 46 target | Move management actions to quiet area and add visual rhythm. [VERIFIED: Phase 46 CONTEXT] |
| User photo-like thumbnails | Deterministic decorative illustrations | Phase 46 locked decision | No upload/storage/photo implication. [VERIFIED: Phase 46 CONTEXT; `.planning/REQUIREMENTS.md`] |
| Table-like metadata blocks | Natural location path | Phase 46 locked decision | Use `parentLabel` + `subtitle/typeLabel` as prose path, not field blocks. [VERIFIED: Phase 46 CONTEXT D-09; `TimelineEntry` fields] |

**Deprecated/outdated:**
- `/timeline` compatibility route: old path should fall through, not be preserved. [VERIFIED: Phase 43 CONTEXT D-19; `router/index.spec.ts`]
- Favorites/collections in v8.0: explicitly out of scope, including `我的收藏` entry and favorite controls. [VERIFIED: `.planning/REQUIREMENTS.md`; Phase 46 CONTEXT]
- Full screenshot UI backgrounds: cutting guide says to implement UI in DOM/CSS and use assets only for illustrations/stickers. [VERIFIED: `prd/v8.0/CUTTING-GUIDE.md`]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Timeline layouts often overlap on mobile when absolute nodes do not reserve space. | Common Pitfalls | Planner may underweight mobile CSS checks; mitigate with responsive screenshots/tests. |
| A2 | Responsive grid with fixed node column and `min-w-0` text containers is the safest implementation pattern. | Common Pitfalls | If the visual design requires a different layout, planner should still require mobile verification. |

## Open Questions

1. **Should Phase 46 clean `ShellSidebar.vue` disabled future entries?**
   - What we know: JOURNAL-05 says the page must not show favorite/collection buttons, state, or `我的收藏` related entry; `ShellSidebar.vue` currently renders disabled `我的收藏`, `点亮足迹`, and `设置` items. [VERIFIED: `.planning/REQUIREMENTS.md`; `apps/web/src/components/shell/ShellSidebar.vue:28`]
   - What's unclear: CONTEXT focuses mostly on journal card/page content, but the shell is visible on the page and likely part of user-observable acceptance. [VERIFIED: `App.vue`; `ShellSidebar.vue`]
   - Recommendation: Include a small prerequisite task to remove or hide disabled future shell entries at least for v8.0 acceptance, and update shell tests accordingly. [VERIFIED: Phase 43 CONTEXT D-13/D-17]

2. **Is a journal-specific error state reachable today?**
   - What we know: `TimelinePageView.vue` has restoring, anonymous, empty, and populated branches; no journal-local error branch was found. [VERIFIED: `TimelinePageView.vue`]
   - What's unclear: Store/bootstrap errors may surface elsewhere in App-level notifications instead of this view. [VERIFIED: `App.vue`; codebase scan]
   - Recommendation: Planner should add a verification task that identifies the existing error path before adding new UI; only add a local error state if an actual reachable journal error condition exists. [VERIFIED: codebase scan]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Vite/Vitest/Vue tooling | ✓ | `v26.0.0` | None needed; Vitest docs require Node >= 20. [VERIFIED: local command; CITED: https://vitest.dev/guide/] |
| npm | Registry version verification | ✓ | `11.12.1` | Use package lock/local package files if registry unavailable. [VERIFIED: local command] |
| pnpm | Project scripts | Partial | packageManager declares `pnpm@10.33.0`; `pnpm --version` failed with `fetch failed`, but `pnpm --filter @trip-map/web test ...` ran successfully. [VERIFIED: `package.json`; local command] | Use existing `pnpm --filter` scripts; avoid relying on `pnpm --version` in gates. |
| Vite | Build/test transform | ✓ | `vite/8.0.8` | None. [VERIFIED: local command] |
| Vitest | Validation | ✓ | `vitest/4.1.4` | None. [VERIFIED: local command] |
| cwebp | Optional asset conversion | ✓ | `1.6.0` | Prefer CSS decorative thumbnails; use existing assets if no slicing needed. [VERIFIED: local command; `prd/v8.0/CUTTING-GUIDE.md`] |

**Missing dependencies with no fallback:** None found for the recommended code/CSS implementation. [VERIFIED: local commands]

**Missing dependencies with fallback:** `pnpm --version` registry/Corepack-style check failed, but actual `pnpm --filter @trip-map/web test` succeeded. [VERIFIED: local commands]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `4.1.4` with Vue Test Utils `2.4.x` and happy-dom. [VERIFIED: local command; `apps/web/package.json`] |
| Config file | No dedicated `vitest.config.*` found; tests run through package script. [VERIFIED: file scan; `apps/web/package.json`] |
| Quick run command | `pnpm --filter @trip-map/web test -- TimelinePageView TimelineVisitCard timeline` [VERIFIED: command passed 52 files / 452 tests / 2 skipped] |
| Full suite command | `pnpm --filter @trip-map/web test` [VERIFIED: `apps/web/package.json`] |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| JOURNAL-01 | `/journal` remains the protected travel journal route; old `/timeline` does not revive. | router/page unit | `pnpm --filter @trip-map/web test -- router TimelinePageView` | ✅ `apps/web/src/router/index.spec.ts`, ✅ `TimelinePageView.spec.ts` |
| JOURNAL-02 | Populated state renders glowing vertical stream, star nodes, responsive card flow. | component + visual smoke | `pnpm --filter @trip-map/web test -- TimelinePageView TimelineVisitCard` | ✅ existing specs; ❌ new assertions needed |
| JOURNAL-03 | Card shows date, place, natural location path, note/tag summary, decorative thumbnail. | component unit | `pnpm --filter @trip-map/web test -- TimelineVisitCard timeline` | ✅ existing specs; ❌ new summary/thumbnail assertions needed |
| JOURNAL-04 | No add-trip entry; empty state navigates to `/map` only. | page unit | `pnpm --filter @trip-map/web test -- TimelinePageView` | ✅ existing spec; ❌ absence assertions needed |
| JOURNAL-05 | No favorite/collection controls or `我的收藏` entry visible on journal page/shell. | component/page unit | `pnpm --filter @trip-map/web test -- TimelinePageView ShellSidebar TimelineVisitCard` | ✅ card/page specs; shell spec likely needs update |
| JOURNAL-06 | Restoring, empty, and reachable error states use Yume Kawaii styling and accessible live/status behavior. | page unit + manual visual | `pnpm --filter @trip-map/web test -- TimelinePageView` | ✅ restoring/empty specs; ❌ error-state coverage gap |

### Sampling Rate

- **Per task commit:** `pnpm --filter @trip-map/web test -- TimelinePageView TimelineVisitCard timeline` [VERIFIED: local command passed]
- **Per wave merge:** `pnpm --filter @trip-map/web test -- router TimelinePageView TimelineVisitCard timeline ShellSidebar` [VERIFIED: package test script; recommended focused set]
- **Phase gate:** `pnpm --filter @trip-map/web test` plus `pnpm --filter @trip-map/web build`; run browser screenshot checks if implementation changes responsive layout materially. [VERIFIED: package scripts; `.planning/REQUIREMENTS.md` QA-01]

### Wave 0 Gaps

- [ ] `apps/web/src/views/TimelinePageView.spec.ts` — add absence tests for `添加新旅行`, `收藏`, `我的收藏`, and empty-state `/map`-only navigation. [VERIFIED: current spec lacks these exact assertions]
- [ ] `apps/web/src/components/timeline/TimelineVisitCard.spec.ts` — add tests for summary derivation, decorative thumbnail `aria-hidden`/empty alt, stable variant mapping, and quiet management entry. [VERIFIED: current spec covers edit/delete/notes/tags but not thumbnail/summary]
- [ ] `apps/web/src/components/shell/ShellSidebar.spec.ts` or existing shell spec update — assert v8 shell on journal does not expose `我的收藏` if planner accepts shell cleanup. [VERIFIED: `ShellSidebar.vue` currently exposes disabled item]
- [ ] Error-state source test — identify existing app/store error path or document manual-only fallback if no journal-local error branch exists. [VERIFIED: codebase scan]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | Preserve Vue Router `requiresAuth` guard and auth session store; do not expose journal records anonymously. [VERIFIED: `apps/web/src/router/index.ts`] |
| V3 Session Management | yes | Preserve existing auth restoration branch; do not add local auth state. [VERIFIED: `TimelinePageView.vue:20`; `App.vue`] |
| V4 Access Control | yes | Edit/delete remains through existing Pinia actions/API; no client-only authorization shortcut. [VERIFIED: `TimelineVisitCard.vue:71`] |
| V5 Input Validation | yes | Preserve `TimelineEditForm` date/notes validation and conflict warning. [VERIFIED: `TimelineEditForm.vue`] |
| V6 Cryptography | no | Phase 46 does not introduce crypto, secrets, or token handling. [VERIFIED: phase scope; codebase scan] |

### Known Threat Patterns for Vue Journal UI

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Anonymous access to travel history | Information Disclosure | Keep `/journal` route `meta.requiresAuth` and restoration guard. [VERIFIED: `router/index.ts`] |
| Misleading photo/upload affordance | Spoofing / Privacy confusion | Use decorative thumbnails with `aria-hidden` and no upload/photo copy. [VERIFIED: Phase 46 CONTEXT] |
| Accidental destructive delete | Tampering | Preserve confirmation dialog and destructive semantics for final-record delete. [VERIFIED: `ConfirmDialog.vue`; `TimelineVisitCard.vue`] |
| XSS through notes/tags | Tampering | Keep Vue text interpolation; do not introduce `v-html` for notes/tags. [VERIFIED: `TimelineVisitCard.vue`; Vue template default escaping is official Vue behavior [CITED: https://vuejs.org/guide/best-practices/security.html]] |

## Sources

### Primary (HIGH confidence)

- `.planning/phases/46-travel-journal-refactor/46-CONTEXT.md` - locked user decisions, deferred scope, canonical refs. [VERIFIED: local file]
- `.planning/REQUIREMENTS.md` - JOURNAL-01..JOURNAL-06 and v8 out-of-scope items. [VERIFIED: local file]
- `.planning/ROADMAP.md` - Phase 46 scope and success criteria. [VERIFIED: local file]
- `.planning/STATE.md` - current handoff and prior decisions. [VERIFIED: local file]
- `apps/web/src/views/TimelinePageView.vue`, `TimelineVisitCard.vue`, `TimelineEditForm.vue`, `ConfirmDialog.vue`, `services/timeline.ts`, `stores/map-points.ts`, `router/index.ts`, `ShellSidebar.vue` - current implementation and integration points. [VERIFIED: local files]
- `prd/v8.0/ASSET-MANIFEST.md`, `prd/v8.0/CUTTING-GUIDE.md` - asset and slicing constraints. [VERIFIED: local files]
- npm registry via `npm view` - current versions and modified dates for Vue, Pinia, Vue Router, Vitest, Vue Test Utils, VueUse. [VERIFIED: npm registry]
- Vue docs - computed caching and Transition performance. [CITED: https://vuejs.org/guide/essentials/computed; CITED: https://vuejs.org/guide/built-ins/transition.html]
- Pinia docs - store state/getters/actions and setup-store model. [CITED: https://pinia.vuejs.org/core-concepts/]
- Vue Test Utils / Vue testing docs - behavior-oriented component tests and Vitest recommendation. [CITED: https://test-utils.vuejs.org/guide/essentials/easy-to-test.html; CITED: https://vuejs.org/guide/scaling-up/testing.html]
- MDN `prefers-reduced-motion` - reduced-motion media feature. [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion]

### Secondary (MEDIUM confidence)

- Project skills `vue-best-practices`, `vue-testing-best-practices`, and `baseline-ui` - local agent conventions for component splitting, test style, and UI constraints. [VERIFIED: local skill files]

### Tertiary (LOW confidence)

- None used as authoritative source. [VERIFIED: research log]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - package files, npm registry, local commands, and official docs all agree on the existing Vue/Vitest stack. [VERIFIED: local files; npm registry; official docs]
- Architecture: HIGH - current route/store/service/component responsibilities are visible in local code and constrained by Phase 43/46 context. [VERIFIED: local files]
- Pitfalls: MEDIUM - add/favorite/shell leakage and edit/delete regressions are verified; mobile overlap risk is partly assumed from UI layout experience and must be checked with responsive verification. [VERIFIED: local files; ASSUMED]

**Research date:** 2026-05-18  
**Valid until:** 2026-06-17 for project-local architecture; 2026-05-25 for npm/current-version facts.
