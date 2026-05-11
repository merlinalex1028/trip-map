# Phase 42: UI Primitives 与 Yume Kawaii Theme Bridge - Context

**Gathered:** 2026-05-11T03:33:58Z
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 42 delivers the reusable UI foundation for v8.0 in `apps/web`: shadcn-vue local primitives, stable `@/` imports, Yume Kawaii / Soft Pastel Glassmorphism theme calibration, a unified icon wrapper, ECharts/vue-echarts chart foundation, and a dev-only primitive showcase. It does not migrate existing business UI flows or implement later pages.

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project and Scope
- `.planning/PROJECT.md` — Project identity, v8.0 milestone scope, out-of-scope items, and product decisions.
- `.planning/REQUIREMENTS.md` — v8.0 requirement list; Phase 42 covers `DS-01` through `DS-05`.
- `.planning/ROADMAP.md` — Phase 42 goal, success criteria, dependencies, and milestone sequencing.
- `.planning/STATE.md` — Current project state and deferred context.
- `.planning/research/SUMMARY.md` — v8.0 research conclusions, recommended dependency stack, and risks.

### Visual Authority
- `prd/v8.0/UI/落地页.png` — Landing visual language and global v8 mood.
- `prd/v8.0/UI/世界足迹.png` — Map page reference, except the bottom left-menu illustration noted in D-09.
- `prd/v8.0/UI/留下足迹.png` — Dialog, calendar, and action button reference.
- `prd/v8.0/UI/旅途回忆.png` — Dashboard, charts, cards, sidebar illustration, and chart palette reference.
- `prd/v8.0/UI/旅途手帐.png` — Journal card/list style and sidebar illustration reference.
- `prd/v8.0/切图` — Asset source folder. Copy only used assets later, rename to English kebab-case under `apps/web/src/assets`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/styles/tokens.css`: Existing kawaii token layer for colors, radii, shadows, gradients, textures, and motion. Phase 42 should recalibrate this file instead of adding a parallel token system.
- `apps/web/src/style.css`: Tailwind v4 entry with `@theme` definitions and global imports.
- `apps/web/src/components/auth/AuthDialog.vue`, `apps/web/src/components/timeline/ConfirmDialog.vue`, `apps/web/src/components/map-popup/TripDateForm.vue`: Existing business dialogs/forms remain in place but are future migration candidates.
- `apps/web/src/components/map-popup/PointSummaryCard.vue`, `apps/web/src/components/map-popup/MapContextPopup.vue`: Existing popup/card surfaces show current kawaii patterns and later migration targets.

### Established Patterns
- Vue stack is Vue 3 + Composition API + `<script setup lang="ts">`, with Pinia stores and Vue Router.
- Tailwind v4 is installed through `@tailwindcss/vite`; avoid Tailwind v3 config assumptions.
- Current code mostly uses relative imports. Phase 42 must add `@` alias in both `apps/web/vite.config.ts` and `apps/web/tsconfig.json` to satisfy DS-01.
- Route-level views are thin composition surfaces (`MapHomeView`, `TimelinePageView`, `StatisticsPageView`), which should remain the pattern for `/__ui`.

### Integration Points
- `apps/web/package.json`: Add `shadcn-vue` generated dependencies and runtime dependencies for ECharts/vue-echarts/Iconify as needed.
- `apps/web/vite.config.ts` and `apps/web/tsconfig.json`: Add `@` alias while preserving existing explicit package aliases.
- `apps/web/src/router/index.ts`: Add dev-only `/__ui` route guard.
- `apps/web/src/components/ui/*`: Target location for generated shadcn-vue primitives.
- `apps/web/src/components/common` or equivalent: Candidate location for `KawaiiIcon` and `BaseChart` wrappers if existing structure allows.
- `apps/web/src/lib/charts`: Candidate location for ECharts module registration and theme setup.

</code_context>

<specifics>
## Specific Ideas

- The UI should feel closer to the high-fidelity v8 images than the current lighter kawaii shell.
- Cutout assets are intentionally not copied during Phase 42; the important locked behavior is the rule for future phases.
- The `世界足迹` high-fidelity image contains one known incorrect sidebar illustration area; downstream agents should not blindly reproduce that part.
- `/__ui` is a developer validation surface, not a user-facing page or navigation entry.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 42-UI Primitives 与 Yume Kawaii Theme Bridge*
*Context gathered: 2026-05-11T03:33:58Z*
