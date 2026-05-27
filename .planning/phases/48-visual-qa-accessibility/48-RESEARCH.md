# Phase 48: Visual QA、Accessibility 与回归验证 - Research

**Researched:** 2026-05-27  
**Domain:** Vue 3 desktop visual QA, accessibility, reduced-motion audit, and regression testing  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

Source for all bullets in this section: [VERIFIED: .planning/phases/48-visual-qa-accessibility/48-CONTEXT.md]

### Locked Decisions

#### Screenshot Acceptance Matrix
- **D-01:** Use a core-state-first screenshot matrix. Cover each core route's desktop main state plus the footprint date dialog key state; do not attempt all loading/empty/error states.
- **D-02:** Desktop only. The user confirmed the system no longer has a mobile surface, so Phase 48 planning, docs, screenshots, and QA criteria must not include mobile coverage.
- **D-03:** Desktop screenshots must cover the real populated main path: landing page, authenticated `/map`, populated `/journal`, populated `/memories`, and the opened `留下足迹` date dialog.
- **D-04:** Evidence should be screenshot files plus a short checklist noting overlap, truncation, unreadable text, and missing core visuals.
- **D-05:** If desktop screenshots reveal obvious visual problems, Phase 48 should fix them in-scope instead of only recording them.

#### Map and Chart Non-Empty Verification
- **D-06:** Verify non-empty map/chart rendering through local manual run plus desktop screenshot review. Phase 48 does not need to introduce browser-level automated smoke tests solely for this.
- **D-07:** The map screenshot should use an account with existing footprints so the Leaflet map stage shows the map/boundaries, saved star markers, and interactive map surface.
- **D-08:** The travel memories dashboard must show all four ECharts charts as visible rendered graphics: monthly trend, country/region distribution, yearly trend, and memories-profile radar.
- **D-09:** Prepare a fixed test account or seed data for manual QA so map markers and all four memories charts are reproducible. Do not rely on ad hoc manual clicking, and do not skip verification because local data is insufficient.

#### Keyboard and Focus Gate
- **D-10:** Keyboard QA covers the core operable path only: auth entry, sidebar navigation, map popup `留下足迹`, date dialog close/submit, and Calendar date selection.
- **D-11:** Focus management blocks completion when the main flow loses focus: opening a dialog should move focus into it, closing should return focus to the trigger or a reasonable fallback, and Tab should not move into invisible areas.
- **D-12:** Accessibility semantics should make key controls readable: icon-only buttons, map popup, date dialog, current navigation item, chart/status regions need understandable labels, roles, `aria-current`, or `aria-live` where appropriate.
- **D-13:** Accessibility issues that block keyboard completion of the core path or screen-reader understanding of key controls must be fixed in Phase 48.

#### Reduced Motion and Visual Failure Standards
- **D-14:** `prefers-reduced-motion` validation covers core page decoration and interaction motion: landing, app shell, map markers/popup, journal cards, memories charts/cards, floating/breathing effects, and hover displacement.
- **D-15:** Visual defects block completion when they affect reading or operation: overlap, truncation, unreadable text, covered core controls/charts/maps, or obvious overflow in button text/place names. Phase 48 does not pursue pixel-perfect comp matching.
- **D-16:** Long text is a dedicated QA risk. Check long place names, long usernames, and long note/tag summaries for graceful truncation without breaking layout.
- **D-17:** Visual fixes should be local and minimal. Adjust only the component/style causing the issue; do not use Phase 48 to restructure the global v8 visual system.

#### Regression Test Gate
- **D-18:** The Phase 48 release gate should run the web, server, and contracts test suites to cover auth, records, journal, memories, and shared contracts. Build/typecheck are not locked as the default gate by this discussion.
- **D-19:** If server e2e tests fail because the local database environment is unavailable, record the environment reason and still run available server unit/contract coverage. Real logic failures must be fixed.
- **D-20:** Add targeted tests only when Phase 48 changes code. If fixes touch focus, aria, long text, reduced motion, or regression logic, add corresponding component/service tests. Pure screenshot QA does not require new automated tests.
- **D-21:** Final evidence should include test results, database-environment notes if relevant, the desktop screenshot checklist, and a repair summary. Do not produce a heavy full QA report unless later planning finds it necessary.

### the agent's Discretion
Downstream agents may choose the exact desktop screenshot dimensions, screenshot/checklist file names, seed-data mechanism, focused test placement, and local run commands, as long as the decisions above remain locked and no mobile QA scope is introduced.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QA-01 | Validate desktop screenshots for landing, map, journal, memories, and footprint dialog with no obvious overlap, truncation, or unreadable text. | Use the desktop-only screenshot matrix and checklist under Architecture Patterns. [VERIFIED: 48-CONTEXT.md + .planning/REQUIREMENTS.md] |
| QA-02 | Verify Leaflet map, star markers, and ECharts charts render non-empty locally. | Use populated account/seed data plus screenshot review; `BaseChart.vue` wraps `vue-echarts` and `LeafletMapStage.vue` renders star marker icons. [VERIFIED: codebase grep] |
| QA-03 | Verify Dialog, Calendar, navigation, and auth entry keyboard/focus/ARIA behavior. | Use WAI-ARIA modal dialog rules, Reka Dialog semantics, and existing component specs as the fix-test targets. [CITED: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/] [CITED: https://www.reka-ui.com/docs/components/dialog] |
| QA-04 | Verify `prefers-reduced-motion` disables decorative/interaction motion without blocking operation. | Use MDN/WCAG guidance and component-level CSS audits for landing, map, journal, memories, and shell motion. [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion] [CITED: https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html] |
| QA-05 | Ensure v8 changes do not break auth, records, journal, memories, and contracts regression coverage. | Run `@trip-map/web`, `@trip-map/server`, and `@trip-map/contracts` test scripts; server runner already skips DB-backed specs only when DB is unreachable. [VERIFIED: package.json + apps/server/scripts/vitest-run.mjs] |
</phase_requirements>

## Project Constraints (from AGENTS.md)

- User-facing communication must be Chinese unless explicitly requested otherwise. [VERIFIED: AGENTS.md]
- Before implementation, briefly state what will be done. [VERIFIED: AGENTS.md]
- Code changes should stay minimal and follow the existing project structure/style. [VERIFIED: AGENTS.md]
- GSD workflows are authorized to use subagents/parallel agents when the workflow requires them, but this research was completed inline. [VERIFIED: AGENTS.md]
- If subagents are used later, wait for their result before continuing. [VERIFIED: AGENTS.md]
- Completion notes should summarize changes, impact, and verification in Chinese. [VERIFIED: AGENTS.md]
- No project-local `.codex/skills` or `.agents/skills` directory exists in this repo, so no extra project skill rules apply. [VERIFIED: find .codex/skills .agents/skills]

## Summary

Phase 48 should be planned as a desktop-only QA and repair pass over already-built v8 surfaces, not as a new feature or tooling expansion. [VERIFIED: 48-CONTEXT.md] The core deliverables are reproducible desktop screenshots, a compact checklist, local non-empty map/chart verification, keyboard/focus/ARIA checks, reduced-motion checks, and existing regression suites. [VERIFIED: 48-CONTEXT.md]

The standard implementation stack is already present: Vue 3 components, shadcn-vue/Reka primitives, Leaflet, ECharts through `vue-echarts`, and Vitest with `@vue/test-utils` in `happy-dom`. [VERIFIED: package.json + apps/web/package.json + vitest.config.ts] No new dependency is required for the locked scope, and browser-level automated visual testing should not be introduced solely for map/chart smoke verification. [VERIFIED: 48-CONTEXT.md]

**Primary recommendation:** plan one Wave 0 evidence harness for desktop screenshots/checklist/seed data, then targeted fix-and-test tasks only for issues found in visual, accessibility, reduced-motion, or regression gates. [VERIFIED: 48-CONTEXT.md + codebase grep]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Desktop screenshot evidence | Browser / Client | API / Backend | Screenshots validate rendered Vue/Leaflet/ECharts surfaces; populated auth data may require server/API data. [VERIFIED: 48-CONTEXT.md + codebase grep] |
| Map and star marker non-empty rendering | Browser / Client | API / Backend, Static Assets | `LeafletMapStage.vue` renders Leaflet, geometry shards, and star marker PNGs; populated records come from authenticated state/API. [VERIFIED: apps/web/src/components/LeafletMapStage.vue] |
| Memories chart non-empty rendering | Browser / Client | API / Backend | `StatisticsPageView.vue` fetches server-authoritative stats and `MemoriesChartGrid.vue` renders four chart panels through `BaseChart.vue`. [VERIFIED: codebase grep] |
| Dialog/Calendar keyboard and focus | Browser / Client | — | Dialog, Calendar, popup, and auth interactions are Vue/Reka/shadcn component responsibilities. [VERIFIED: codebase grep] [CITED: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/] |
| Reduced-motion behavior | Browser / Client | CSS / Static Assets | Motion is implemented via component CSS transitions, animations, Tailwind utility classes, and media queries. [VERIFIED: rg prefers-reduced-motion] |
| Regression testing | API / Backend, Browser / Client, Shared Contracts | Database / Storage | Web specs cover frontend auth/routes/views/components, server specs cover auth/records/stats behavior, contracts specs cover shared schemas. [VERIFIED: package.json + rg test files] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue | `^3.5.32` installed; npm latest not separately audited because no upgrade is planned | Component runtime for all phase surfaces. | Existing frontend is Vue 3 SFCs with `<script setup lang="ts">`. [VERIFIED: apps/web/package.json + codebase grep] |
| Vitest | installed `^4.1.4`; npm latest `4.1.7`, modified 2026-05-20 | Unit/component/service test runner. | Existing root/web/server/contracts test scripts use Vitest; Vitest documents `happy-dom` as a browser-API emulation environment. [VERIFIED: package.json + npm registry] [CITED: https://vitest.dev/guide/environment.html] |
| `@vue/test-utils` | installed `^2.4.6`; npm latest `2.4.10`, modified 2026-04-30 | Vue component mounting and event/form assertions. | Official Vue Test Utils for Vue 3; docs recommend `setValue()` and `trigger()` for forms/actions. [VERIFIED: apps/web/package.json + npm registry] [CITED: https://test-utils.vuejs.org/] |
| `happy-dom` | installed/latest `^20.9.0`, modified 2026-04-13 | DOM emulation for web specs. | Existing `apps/web/vitest.config.ts` uses `environment: 'happy-dom'`; Vitest docs describe `happy-dom` as faster but with fewer APIs than jsdom. [VERIFIED: apps/web/vitest.config.ts + npm registry] [CITED: https://vitest.dev/guide/environment.html] |
| Reka UI / shadcn-vue primitives | installed `reka-ui 2.9.7`; npm latest `2.9.8`, modified 2026-05-22 | Dialog, Calendar, Dropdown, Sidebar primitives. | Reka Dialog docs specify accessible Title/Description and controlled dialog patterns; project already wraps these primitives under `apps/web/src/components/ui`. [VERIFIED: apps/web/package.json + npm registry + codebase grep] [CITED: https://www.reka-ui.com/docs/components/dialog] |
| Leaflet | installed/latest `^1.9.4`, modified 2025-08-16 | Interactive map rendering. | Existing `LeafletMapStage.vue` uses Leaflet; official marker docs expose keyboard/title/alt accessibility options. [VERIFIED: apps/web/package.json + npm registry] [CITED: https://leafletjs.com/reference] |
| ECharts + `vue-echarts` | installed `echarts 6.0.0` with npm latest `6.1.0`, modified 2026-05-19; installed/latest `vue-echarts 8.0.1`, modified 2026-02-18 | Memories dashboard charts. | Existing `BaseChart.vue` wraps `vue-echarts`; ECharts ARIA docs require manual `AriaComponent` import before `aria.show` works. [VERIFIED: apps/web/package.json + npm registry + BaseChart.vue] [CITED: https://echarts.apache.org/handbook/en/best-practices/aria/] |

### Supporting

| Library/Tool | Version | Purpose | When to Use |
|--------------|---------|---------|-------------|
| Node.js | `v22.22.1` | Runtime for scripts/tests/dev server. | Required for pnpm/Vite/Vitest/Nest tooling. [VERIFIED: node --version] |
| pnpm | repo declares `pnpm@10.33.0`; local `pnpm --version` succeeds with network-enabled shell | Workspace package manager. | Use existing `pnpm --filter` scripts for targeted test/dev commands. [VERIFIED: package.json + pnpm --version] |
| Docker | `28.5.2` | Optional DB/service helper. | Use only if planner chooses a local Postgres path; Phase 48 can document DB unavailability instead. [VERIFIED: docker --version + 48-CONTEXT.md] |
| PostgreSQL CLI | `psql` and `pg_isready` not found | DB reachability diagnostics. | Missing CLI is not blocking because server runner probes `DATABASE_URL` by socket and skips DB-backed e2e specs when unreachable. [VERIFIED: command -v psql + command -v pg_isready + apps/server/scripts/vitest-run.mjs] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual desktop screenshots/checklist | Playwright/Vitest Browser Mode visual tests | Locked context says browser-level automated smoke tests are not needed solely for map/chart rendering; `node_modules/.bin/playwright` is absent locally. [VERIFIED: 48-CONTEXT.md + test -e node_modules/.bin/playwright] |
| Existing Vitest component tests | Add axe-core or Testing Library | No new dependency is needed for locked QA; add tests only when code fixes alter behavior. [VERIFIED: 48-CONTEXT.md] |
| Current ECharts wrapper | Hand-render SVG charts for tests | ECharts is already the project standard and supports ARIA labels through `AriaComponent`; replacing it would be out of scope. [VERIFIED: apps/web/package.json] [CITED: https://echarts.apache.org/handbook/en/best-practices/aria/] |

**Installation:**

```bash
# No new package installation is recommended for Phase 48.
```

## Package Legitimacy Audit

No new external packages should be installed for this phase. [VERIFIED: 48-CONTEXT.md] Existing packages were version-checked through `npm view` where relevant, but slopcheck was not required because the phase does not recommend an install. [VERIFIED: npm registry]

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| Not applicable | — | — | — | — | Not run | No new packages approved for installation. [VERIFIED: 48-CONTEXT.md] |

**Packages removed due to slopcheck [SLOP] verdict:** none. [VERIFIED: no install scope]  
**Packages flagged as suspicious [SUS]:** none. [VERIFIED: no install scope]

## Architecture Patterns

### System Architecture Diagram

```text
Desktop QA operator
  -> start local web/server as needed
  -> authenticate with fixed populated account or seed data
  -> route matrix:
       /                  -> landing screenshot + auth-entry keyboard check
       /map               -> Leaflet non-empty map + star marker + popup + footprint dialog
       /journal           -> populated hand账 stream + long text scan
       /memories          -> overview + four ECharts charts + ranking/postcards
  -> evidence:
       screenshots + compact checklist + repair summary
  -> targeted code fixes if blockers are found
  -> targeted specs only for changed behavior
  -> release gate:
       web tests -> server tests -> contracts tests
       DB unavailable? record environment note and run available coverage
```

This data flow matches the locked evidence-first QA scope and existing test ownership. [VERIFIED: 48-CONTEXT.md + package.json]

### Recommended Project Structure

```text
.planning/phases/48-visual-qa-accessibility/
├── 48-RESEARCH.md                  # this research document
├── 48-PLAN.md                      # planner output
├── evidence/
│   ├── desktop-landing.png          # screenshot evidence
│   ├── desktop-map.png
│   ├── desktop-journal.png
│   ├── desktop-memories.png
│   ├── desktop-footprint-dialog.png
│   └── desktop-checklist.md         # overlap/truncation/readability/rendering notes
└── 48-VERIFICATION.md               # final verification summary if workflow creates one
```

The exact names remain at planner discretion; evidence should stay under the phase directory to keep QA artifacts discoverable. [VERIFIED: 48-CONTEXT.md]

### Pattern 1: Core-State-First Screenshot Matrix

**What:** capture only the populated desktop happy path and the opened footprint dialog. [VERIFIED: 48-CONTEXT.md]  
**When to use:** use for QA-01/QA-02 evidence before deciding whether code fixes are needed. [VERIFIED: 48-CONTEXT.md]  
**Checklist fields:** route/state, screenshot path, visible core visual, overlap/truncation/unreadable text, long-text note, repair needed. [VERIFIED: 48-CONTEXT.md]

### Pattern 2: Accessibility Fixes Stay on Existing Components

**What:** fix labels, roles, `aria-current`, `aria-live`, focus return, and disabled/focus behavior in the component that owns the interaction. [VERIFIED: codebase grep]  
**When to use:** use when keyboard completion or screen-reader understanding is blocked. [VERIFIED: 48-CONTEXT.md]  
**Reference:** WAI-ARIA modal dialogs require focus to move inside on open and keep Tab/Shift+Tab within the dialog; dialog containers need a role plus label. [CITED: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/]

### Pattern 3: Reduced Motion as CSS Contract

**What:** verify `@media (prefers-reduced-motion: reduce)` disables non-essential animations/transforms and keeps controls operable. [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion]  
**When to use:** use for landing, shell/sidebar hover displacement, map pending marker pulse, journal node/shimmer, dialog hover transforms, and chart/card decoration. [VERIFIED: rg prefers-reduced-motion]  
**Rule:** prefer local CSS guards or Tailwind `motion-reduce:*` on the exact component causing the motion. [ASSUMED]

### Anti-Patterns to Avoid

- **Reintroducing broad viewport coverage:** Phase 48 is desktop-only and must not expand into other surfaces. [VERIFIED: 48-CONTEXT.md]
- **Adding Playwright/axe only to prove non-empty rendering:** locked context says local manual run plus screenshots are enough for map/chart non-empty verification. [VERIFIED: 48-CONTEXT.md]
- **Global visual-system redesign:** visual fixes should be local/minimal and tied to observed defects. [VERIFIED: 48-CONTEXT.md]
- **Testing implementation internals instead of behavior:** Vue Test Utils docs recommend asserting emitted events and DOM behavior, not component instance data. [CITED: https://test-utils.vuejs.org/guide/essentials/forms.html]
- **Leaving DB failures ambiguous:** server test runner distinguishes unreachable `DATABASE_URL` and skips DB-backed specs only for that environment condition. [VERIFIED: apps/server/scripts/vitest-run.mjs]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal focus trap and dialog semantics | Custom focus trap for date/auth dialogs | Existing Reka/shadcn Dialog wrappers plus targeted focus return checks | WAI-ARIA dialog behavior has detailed keyboard rules; Reka Dialog already provides accessible title/description primitives. [CITED: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/] [CITED: https://www.reka-ui.com/docs/components/dialog] |
| Chart canvas accessibility | Custom chart narration parser | ECharts `aria.show` with `AriaComponent` where chart-level accessible text is needed | ECharts docs state ARIA features need `AriaComponent` import and can generate chart descriptions. [CITED: https://echarts.apache.org/handbook/en/best-practices/aria/] |
| Date handling for Calendar | Manual date string parsing beyond current contract | Existing `@internationalized/date` usage in `FootprintDateDialog.vue` | The dialog already emits `YYYY-MM-DD` strings from `CalendarDate.toString()`. [VERIFIED: FootprintDateDialog.vue + FootprintDateDialog.spec.ts] |
| Regression orchestration | Custom test runner | Existing `pnpm --filter` scripts and `apps/server/scripts/vitest-run.mjs` | Existing scripts already encode workspace and DB-unavailable behavior. [VERIFIED: package.json + apps/server/scripts/vitest-run.mjs] |
| Visual diff engine | Pixel-perfect comparison system | Screenshot files plus checklist | Locked success criteria require obvious visual defect detection, not pixel-perfect matching. [VERIFIED: 48-CONTEXT.md] |

**Key insight:** Phase 48 risk is missing obvious desktop regressions and accessibility blockers, not insufficient framework sophistication. [VERIFIED: 48-CONTEXT.md]

## Common Pitfalls

### Pitfall 1: Planning Against Superseded Coverage Wording

**What goes wrong:** planner copies older roadmap/requirements wording and adds non-desktop work. [VERIFIED: .planning/ROADMAP.md + .planning/REQUIREMENTS.md + 48-CONTEXT.md]  
**Why it happens:** older docs still contain superseded wording, while `48-CONTEXT.md` narrows scope. [VERIFIED: rg mobile/移动]  
**How to avoid:** treat `48-CONTEXT.md` D-02 as authoritative and keep screenshot/checklist matrix desktop-only. [VERIFIED: 48-CONTEXT.md]  
**Warning signs:** any planned screenshot dimension or QA task outside desktop scope. [VERIFIED: 48-CONTEXT.md]

### Pitfall 2: Empty Charts Caused by Insufficient Seed Data

**What goes wrong:** `/memories` may render sparse/empty chart states if the account lacks dated records or distribution/profile data. [VERIFIED: MemoriesChartGrid.vue + StatisticsPageView.spec.ts]  
**Why it happens:** monthly/yearly/profile charts are conditional on real dashboard arrays. [VERIFIED: MemoriesChartGrid.vue]  
**How to avoid:** prepare a fixed account or seed records with dates, multiple places/countries, and enough profile dimensions before screenshots. [VERIFIED: 48-CONTEXT.md]  
**Warning signs:** `data-chart-sparse="date-trend"` or absent `data-mocked-vchart`/chart canvas in populated evidence. [VERIFIED: MemoriesChartGrid.vue + MemoriesChartGrid.spec.ts]

### Pitfall 3: Focus Appears Fine by Mouse but Fails Keyboard Flow

**What goes wrong:** user can click through the flow but Tab/Escape/open/close focus behavior loses the active control or reaches invisible content. [VERIFIED: 48-CONTEXT.md]  
**Why it happens:** popup/dialog focus is split across `LeafletMapStage.vue`, `MapContextPopup.vue`, `FootprintDateDialog.vue`, and `AuthDialog.vue`. [VERIFIED: codebase grep]  
**How to avoid:** test the exact core path: auth entry, sidebar nav, map popup, date dialog close/submit, and Calendar selection. [VERIFIED: 48-CONTEXT.md]  
**Warning signs:** `document.activeElement` becomes `body`, close returns focus nowhere, or icon-only controls lack readable labels. [VERIFIED: 48-CONTEXT.md]

### Pitfall 4: Reduced-Motion Guards Miss Tailwind Utility Motion

**What goes wrong:** CSS media queries cover component animations but utility classes such as `hover:-translate-y-0.5`, `transition`, `animate-pulse`, or shadcn `animate-in` still move. [VERIFIED: rg prefers-reduced-motion]  
**Why it happens:** motion is distributed across scoped CSS, global UI primitive classes, and Tailwind utilities. [VERIFIED: rg prefers-reduced-motion]  
**How to avoid:** audit both CSS blocks and template utility classes, then add local reduced-motion overrides where the observed desktop QA surface moves. [VERIFIED: codebase grep]  
**Warning signs:** hover displacement, pulsing markers/skeletons, dialog zoom/fade, or card translate still visible under reduced motion. [VERIFIED: rg transition/animate]

### Pitfall 5: Treating DB-Unavailable Server Tests as Product Failures

**What goes wrong:** planner blocks the phase on local PostgreSQL even when the runner has an explicit DB-unreachable fallback. [VERIFIED: apps/server/scripts/vitest-run.mjs]  
**Why it happens:** server tests include DB-backed e2e specs and non-DB specs in one script. [VERIFIED: apps/server/vitest.config.ts + apps/server/scripts/vitest-run.mjs]  
**How to avoid:** run the server test script, record environment skips if `DATABASE_URL` is unreachable, and fix only real logic failures. [VERIFIED: 48-CONTEXT.md + apps/server/scripts/vitest-run.mjs]  
**Warning signs:** `DATABASE_URL is not reachable; skipping DB-backed e2e specs.` appears in output. [VERIFIED: apps/server/scripts/vitest-run.mjs]

## Code Examples

### Vue Test Utils Event Pattern

```ts
// Source: https://test-utils.vuejs.org/guide/essentials/forms.html
await wrapper.find('button').trigger('click')
expect(wrapper.emitted()).toHaveProperty('submit')
```

Use this pattern for targeted component tests when Phase 48 fixes auth buttons, dialog buttons, shortcut buttons, or menu triggers. [CITED: https://test-utils.vuejs.org/guide/essentials/forms.html]

### Existing Date Dialog Focus/ARIA Test Placement

```ts
// Source: apps/web/src/components/map-popup/FootprintDateDialog.spec.ts
const closeButton = getElement<HTMLButtonElement>('button[aria-label="关闭留下足迹弹窗"]')
const cancelButton = getElement<HTMLButtonElement>('[data-footprint-cancel="true"]')
expect(closeButton).toBeTruthy()
expect(cancelButton.textContent).toContain('取消')
```

Extend this spec only if a Phase 48 fix changes date-dialog labels, close behavior, disabled state, or submit behavior. [VERIFIED: FootprintDateDialog.spec.ts]

### Existing ECharts Wrapper Pattern

```vue
<!-- Source: apps/web/src/components/common/BaseChart.vue -->
<VChart
  class="base-chart__canvas"
  :option="option"
  :theme="YUME_KAWAII_CHART_THEME"
  :autoresize="{ throttle: 100 }"
  style="width: 100%; height: 100%;"
/>
```

Keep chart fixes inside `BaseChart.vue`, chart options, or the specific memories panel unless screenshots prove a higher-level layout issue. [VERIFIED: BaseChart.vue + MemoriesChartGrid.vue]

### Reduced Motion CSS Pattern

```css
/* Source: apps/web/src/components/LeafletMapStage.vue */
@media (prefers-reduced-motion: reduce) {
  .pending-marker--recognizing {
    animation: none;
  }

  .leaflet-interactive {
    transition: none;
  }
}
```

Replicate this local pattern for any observed floating, pulse, shimmer, zoom, or hover-displacement defect. [VERIFIED: LeafletMapStage.vue] [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Exhaustive visual-state matrix | Core-state-first desktop screenshot matrix | Locked in Phase 48 context on 2026-05-27 | Planner should cover the populated happy path and date dialog, not all loading/empty/error states. [VERIFIED: 48-CONTEXT.md] |
| Pixel-perfect visual comparison | Human-readable screenshot checklist for obvious defects | Locked in Phase 48 context on 2026-05-27 | Evidence should flag overlap/truncation/unreadable text/missing visuals, not compare pixels. [VERIFIED: 48-CONTEXT.md] |
| Browser automation as default visual smoke | Local manual run plus screenshots for map/chart non-empty | Locked in Phase 48 context on 2026-05-27 | Do not add Playwright solely for Leaflet/ECharts non-empty checks. [VERIFIED: 48-CONTEXT.md] |
| ECharts without accessibility text | ECharts `AriaComponent` plus `aria.show` when chart labels are needed | ECharts 5+ docs | If chart accessible names are missing, import/register ARIA rather than hand-writing chart internals. [CITED: https://echarts.apache.org/handbook/en/best-practices/aria/] |

**Deprecated/outdated:**
- Any prior QA wording that expands the scope beyond desktop is superseded by `48-CONTEXT.md` D-02. [VERIFIED: 48-CONTEXT.md + rg .planning]
- Adding a heavy QA report is out of scope unless planning discovers a specific need. [VERIFIED: 48-CONTEXT.md]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Prefer local CSS guards or Tailwind `motion-reduce:*` on the exact component causing motion. | Architecture Patterns | Planner might choose a different but still valid reduced-motion implementation pattern. |
| A2 | Research remains valid until 2026-06-26 for project-specific QA planning. | Metadata | Fast-moving dependency docs could change earlier if planner adds packages or upgrades tooling. |

## Open Questions

1. **What exact fixed account or seed mechanism should be used for screenshots?**
   - What we know: Phase 48 requires reproducible populated map and all four memories charts. [VERIFIED: 48-CONTEXT.md]
   - What's unclear: no existing dedicated QA seed script was found during research. [VERIFIED: rg scripts + package.json]
   - Recommendation: planner should add a Wave 0 task to define either a fixed local account or minimal seed-data procedure before screenshot capture. [VERIFIED: 48-CONTEXT.md]

2. **Should ECharts ARIA be added if screenshots show charts are visually fine but screen-reader labels are weak?**
   - What we know: ECharts requires `AriaComponent` import for `aria.show` to work. [CITED: https://echarts.apache.org/handbook/en/best-practices/aria/]
   - What's unclear: current `BaseChart.vue` does not show ARIA chart option wiring in the inspected snippet. [VERIFIED: BaseChart.vue]
   - Recommendation: treat missing chart labels as an accessibility fix if key chart/status regions are unreadable to assistive tech. [VERIFIED: 48-CONTEXT.md]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | All JS tooling | ✓ | `v22.22.1` | — [VERIFIED: node --version] |
| pnpm | Workspace scripts | ✓ | `10.33.0` | Use existing package manager only; sandbox shell required network-enabled check for version. [VERIFIED: package.json + pnpm --version] |
| npm | Registry/version audit | ✓ | `10.9.4` | — [VERIFIED: npm --version] |
| Vitest binary | Web/server/contracts tests | ✓ | package `^4.1.4` installed, npm latest `4.1.7` | Use `pnpm --filter` scripts. [VERIFIED: test -e node_modules/.bin/vitest + npm registry] |
| Vite binary | Local web dev server | ✓ | package `^8.0.8` | Use `pnpm --filter @trip-map/web dev`. [VERIFIED: test -e apps/web/node_modules/.bin/vite + apps/web/package.json] |
| vue-tsc binary | Optional typecheck/build | ✓ | package `^3.2.6` | Not locked as gate, but available. [VERIFIED: test -e apps/web/node_modules/.bin/vue-tsc + apps/web/package.json] |
| Playwright binary | Optional browser automation | ✗ | — | Manual desktop screenshots/checklist per locked context. [VERIFIED: test -e node_modules/.bin/playwright + 48-CONTEXT.md] |
| Docker | Optional local DB | ✓ | `28.5.2` | Record DB unavailable if not used. [VERIFIED: docker --version + 48-CONTEXT.md] |
| PostgreSQL CLI (`psql`, `pg_isready`) | DB diagnostics | ✗ | — | Server runner socket-probes `DATABASE_URL`; document environment note if DB unreachable. [VERIFIED: command -v psql + command -v pg_isready + apps/server/scripts/vitest-run.mjs] |

**Missing dependencies with no fallback:**
- None for the locked research scope. [VERIFIED: 48-CONTEXT.md]

**Missing dependencies with fallback:**
- Playwright is absent; fallback is manual desktop screenshots and checklist. [VERIFIED: test -e node_modules/.bin/playwright + 48-CONTEXT.md]
- PostgreSQL CLI tools are absent; fallback is the existing server test runner's `DATABASE_URL` reachability handling. [VERIFIED: apps/server/scripts/vitest-run.mjs]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `^4.1.4` installed; npm latest `4.1.7`. [VERIFIED: package.json + npm registry] |
| Web config file | `apps/web/vitest.config.ts`, `happy-dom`, `src/**/*.spec.ts`, Leaflet inlined. [VERIFIED: apps/web/vitest.config.ts] |
| Server config file | `apps/server/vitest.config.ts`, Node environment, e2e/spec include, no file parallelism, 30s timeout. [VERIFIED: apps/server/vitest.config.ts] |
| Contracts config file | package script uses `vitest run`; no separate config found in inspected files. [VERIFIED: packages/contracts/package.json] |
| Quick run command | `pnpm --filter @trip-map/web test -- src/components/map-popup/FootprintDateDialog.spec.ts` for focused UI fixes. [VERIFIED: apps/web/vitest.config.ts] |
| Full suite command | `pnpm --filter @trip-map/web test`; `pnpm --filter @trip-map/server test`; `pnpm --filter @trip-map/contracts test`. [VERIFIED: package.json + workspace package.json files] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| QA-01 | Desktop screenshot matrix and visual checklist | manual visual QA + targeted component test if fixed | No automated screenshot command required; targeted specs depend on changed component. [VERIFIED: 48-CONTEXT.md] | ❌ Wave 0 evidence files |
| QA-02 | Leaflet map/star markers and four ECharts charts visible | manual local run + component/service tests if fixed | `pnpm --filter @trip-map/web test -- src/components/LeafletMapStage.spec.ts src/components/memories/MemoriesChartGrid.spec.ts src/components/common/BaseChart.spec.ts` | ✅ [VERIFIED: rg --files] |
| QA-03 | Dialog, Calendar, nav, auth entry keyboard/focus/ARIA | component tests + manual keyboard QA | `pnpm --filter @trip-map/web test -- src/components/map-popup/FootprintDateDialog.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/auth/AuthDialog.spec.ts src/components/shell/AuthenticatedAppShell.spec.ts` | ✅ [VERIFIED: rg --files] |
| QA-04 | Reduced-motion disables decorative motion | source/style assertions if code changed + manual reduced-motion QA | Existing focused files vary; use changed component spec or add one near changed component. [VERIFIED: rg prefers-reduced-motion] | ⚠️ Partial [VERIFIED: rg specs] |
| QA-05 | Auth, records, journal, memories, contracts regressions | unit/e2e/contract suites | `pnpm --filter @trip-map/web test`; `pnpm --filter @trip-map/server test`; `pnpm --filter @trip-map/contracts test` | ✅ [VERIFIED: package.json + rg test files] |

### Sampling Rate

- **Per task commit:** run the focused web/server/contracts spec for touched code. [VERIFIED: 48-CONTEXT.md]
- **Per wave merge:** run affected package test suite. [VERIFIED: package.json]
- **Phase gate:** run web, server, and contracts test suites, with DB environment notes if needed. [VERIFIED: 48-CONTEXT.md + apps/server/scripts/vitest-run.mjs]

### Wave 0 Gaps

- [ ] `.planning/phases/48-visual-qa-accessibility/evidence/desktop-checklist.md` — covers QA-01/QA-02/QA-03/QA-04 evidence checklist. [VERIFIED: 48-CONTEXT.md]
- [ ] `.planning/phases/48-visual-qa-accessibility/evidence/*.png` — covers desktop screenshots for landing, `/map`, `/journal`, `/memories`, and footprint dialog. [VERIFIED: 48-CONTEXT.md]
- [ ] Fixed account or seed-data procedure — covers QA-02 reproducible map markers and all four memories charts. [VERIFIED: 48-CONTEXT.md]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | Existing auth dialog/store/router/server tests remain in regression gate; do not alter auth semantics during visual QA. [VERIFIED: rg auth-session + package scripts] |
| V3 Session Management | yes | Existing `sid` cookie/session behavior is covered by server auth e2e and web auth store specs. [VERIFIED: PROJECT.md + rg auth-session.e2e-spec.ts] |
| V4 Access Control | yes | Protected routes redirect anonymous users and server records APIs enforce current-user ownership in existing tests. [VERIFIED: router/index.ts + rg records-ownership] |
| V5 Input Validation | yes | Date dialog emits `{ startDate, endDate }` with `YYYY-MM-DD` contract; server/contracts tests cover request shapes. [VERIFIED: FootprintDateDialog.spec.ts + contracts.spec.ts] |
| V6 Cryptography | no new crypto | Do not change password/session cryptography in this QA phase. [VERIFIED: 48-CONTEXT.md] |

### Known Threat Patterns for Vue/Nest QA Phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Visual QA accidentally bypasses auth guard to capture screenshots | Elevation of privilege | Use normal authenticated account/seed flow and keep router/auth regression tests in the gate. [VERIFIED: 48-CONTEXT.md + router/index.spec.ts] |
| Screen-reader inaccessible state changes | Information disclosure/repudiation risk through unusable feedback | Use `aria-live`, `role="status"`, and `role="alert"` on status/error messages already present in key components. [VERIFIED: codebase grep] |
| Server DB unavailability hidden as a pass | Repudiation | Record DB environment note when server runner skips DB-backed specs. [VERIFIED: 48-CONTEXT.md + apps/server/scripts/vitest-run.mjs] |

## Sources

### Primary (HIGH confidence)
- `.planning/phases/48-visual-qa-accessibility/48-CONTEXT.md` — locked phase decisions, desktop-only scope, evidence/test gates. [VERIFIED: local file]
- `.planning/REQUIREMENTS.md`, `.planning/PROJECT.md`, `.planning/STATE.md`, `.planning/ROADMAP.md` — requirement IDs, milestone state, historical wording to supersede. [VERIFIED: local files]
- `package.json`, `apps/web/package.json`, `apps/server/package.json`, `packages/contracts/package.json`, `apps/*/vitest.config.ts` — scripts, dependencies, test infrastructure. [VERIFIED: local files]
- Source files listed in `48-CONTEXT.md` canonical refs — QA ownership and existing patterns. [VERIFIED: codebase grep]
- npm registry via `npm view` — current versions for Vitest, Vue Test Utils, happy-dom, Reka UI, ECharts, Leaflet, vue-echarts, and `@internationalized/date`. [VERIFIED: npm registry]
- Vitest docs — test environments and `happy-dom` behavior. [CITED: https://vitest.dev/guide/environment.html]
- Vue Test Utils docs — Vue 3 official testing utilities and `setValue`/`trigger` patterns. [CITED: https://test-utils.vuejs.org/] [CITED: https://test-utils.vuejs.org/guide/essentials/forms.html]
- WAI-ARIA APG modal dialog pattern — keyboard/focus/role expectations. [CITED: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/]
- Reka Dialog docs — accessible Title/Description and controlled dialog usage. [CITED: https://www.reka-ui.com/docs/components/dialog]
- MDN `prefers-reduced-motion` — reduced-motion media feature semantics. [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion]
- W3C WCAG 2.3.3 understanding — interaction animation can be disabled unless essential. [CITED: https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html]
- Apache ECharts ARIA best practices — `AriaComponent` import and `aria.show`. [CITED: https://echarts.apache.org/handbook/en/best-practices/aria/]
- Leaflet reference — marker `keyboard`, `title`, and `alt` accessibility options. [CITED: https://leafletjs.com/reference]

### Secondary (MEDIUM confidence)
- Official Vue ECharts site — wrapper exists and supports runtime chart demos; detailed `autoresize` prop was not needed beyond existing project code. [CITED: https://vue-echarts.dev/]

### Tertiary (LOW confidence)
- None used for recommendations. [VERIFIED: research log]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — dependency versions and scripts were verified locally and through npm registry; no new package install is recommended. [VERIFIED: package.json + npm registry]
- Architecture: HIGH — ownership maps directly to inspected Vue components and locked context decisions. [VERIFIED: 48-CONTEXT.md + codebase grep]
- Pitfalls: HIGH — pitfalls come from locked phase constraints and observed source/test structure. [VERIFIED: 48-CONTEXT.md + rg]
- External docs: HIGH — accessibility and testing guidance came from official docs. [CITED: official docs listed above]

**Research date:** 2026-05-27  
**Valid until:** 2026-06-26 for project-specific QA plan; re-check npm/docs if adding packages or upgrading tooling. [ASSUMED]
