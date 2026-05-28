# Phase 48: Visual QA、Accessibility 与回归验证 - Context

**Gathered:** 2026-05-27T06:02:34Z
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 48 closes v8.0 by validating and fixing the desktop visual QA, accessibility, reduced-motion, and regression-test surface for the completed landing, authenticated shell, world-footprints map, travel journal, travel memories dashboard, and footprint date dialog. This phase is a QA/fix pass, not a new product-feature phase: it must not add mobile support, favorites, photo upload, achievements, new trip creation paths, or broad visual-system redesign.

</domain>

<decisions>
## Implementation Decisions

### Screenshot Acceptance Matrix
- **D-01:** Use a core-state-first screenshot matrix. Cover each core route's desktop main state plus the footprint date dialog key state; do not attempt all loading/empty/error states.
- **D-02:** Desktop only. The user confirmed the system no longer has a mobile surface, so Phase 48 planning, docs, screenshots, and QA criteria must not include mobile coverage.
- **D-03:** Desktop screenshots must cover the real populated main path: landing page, authenticated `/map`, populated `/journal`, populated `/memories`, and the opened `留下足迹` date dialog.
- **D-04:** Evidence should be screenshot files plus a short checklist noting overlap, truncation, unreadable text, and missing core visuals.
- **D-05:** If desktop screenshots reveal obvious visual problems, Phase 48 should fix them in-scope instead of only recording them.

### Map and Chart Non-Empty Verification
- **D-06:** Verify non-empty map/chart rendering through local manual run plus desktop screenshot review. Phase 48 does not need to introduce browser-level automated smoke tests solely for this.
- **D-07:** The map screenshot should use an account with existing footprints so the Leaflet map stage shows the map/boundaries, saved star markers, and interactive map surface.
- **D-08:** The travel memories dashboard must show all four ECharts charts as visible rendered graphics: monthly trend, country/region distribution, yearly trend, and memories-profile radar.
- **D-09:** Prepare a fixed test account or seed data for manual QA so map markers and all four memories charts are reproducible. Do not rely on ad hoc manual clicking, and do not skip verification because local data is insufficient.

### Keyboard and Focus Gate
- **D-10:** Keyboard QA covers the core operable path only: auth entry, sidebar navigation, map popup `留下足迹`, date dialog close/submit, and Calendar date selection.
- **D-11:** Focus management blocks completion when the main flow loses focus: opening a dialog should move focus into it, closing should return focus to the trigger or a reasonable fallback, and Tab should not move into invisible areas.
- **D-12:** Accessibility semantics should make key controls readable: icon-only buttons, map popup, date dialog, current navigation item, chart/status regions need understandable labels, roles, `aria-current`, or `aria-live` where appropriate.
- **D-13:** Accessibility issues that block keyboard completion of the core path or screen-reader understanding of key controls must be fixed in Phase 48.

### Reduced Motion and Visual Failure Standards
- **D-14:** `prefers-reduced-motion` validation covers core page decoration and interaction motion: landing, app shell, map markers/popup, journal cards, memories charts/cards, floating/breathing effects, and hover displacement.
- **D-15:** Visual defects block completion when they affect reading or operation: overlap, truncation, unreadable text, covered core controls/charts/maps, or obvious overflow in button text/place names. Phase 48 does not pursue pixel-perfect comp matching.
- **D-16:** Long text is a dedicated QA risk. Check long place names, long usernames, and long note/tag summaries for graceful truncation without breaking layout.
- **D-17:** Visual fixes should be local and minimal. Adjust only the component/style causing the issue; do not use Phase 48 to restructure the global v8 visual system.

### Regression Test Gate
- **D-18:** The Phase 48 release gate should run the web, server, and contracts test suites to cover auth, records, journal, memories, and shared contracts. Build/typecheck are not locked as the default gate by this discussion.
- **D-19:** If server e2e tests fail because the local database environment is unavailable, record the environment reason and still run available server unit/contract coverage. Real logic failures must be fixed.
- **D-20:** Add targeted tests only when Phase 48 changes code. If fixes touch focus, aria, long text, reduced motion, or regression logic, add corresponding component/service tests. Pure screenshot QA does not require new automated tests.
- **D-21:** Final evidence should include test results, database-environment notes if relevant, the desktop screenshot checklist, and a repair summary. Do not produce a heavy full QA report unless later planning finds it necessary.

### the agent's Discretion
Downstream agents may choose the exact desktop screenshot dimensions, screenshot/checklist file names, seed-data mechanism, focused test placement, and local run commands, as long as the decisions above remain locked and no mobile QA scope is introduced.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project and Scope
- `.planning/PROJECT.md` — v8.0 milestone scope, explicit exclusions, current state, and the Phase 48 handoff.
- `.planning/REQUIREMENTS.md` — Phase 48 requirements `QA-01` through `QA-05`; note that the user has narrowed this phase to desktop only.
- `.planning/ROADMAP.md` — Phase 48 goal and success criteria; interpret any existing mobile wording as superseded by this context.
- `.planning/STATE.md` — Current project state and previous phase completion status.
- `.planning/phases/47-dashboard/47-CONTEXT.md` — memories dashboard data, chart, ranking, and postcard decisions that Phase 48 validates.
- `.planning/phases/46-travel-journal-refactor/46-CONTEXT.md` — journal visual and interaction decisions that Phase 48 validates.
- `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md` — authoritative coverage and map/journal/memories replay expectations.
- `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md` — map popup/date dialog flow, snapshot-safe footprint creation, and unavailable-place behavior.
- `.planning/phases/43-landing/43-CONTEXT.md` — landing, authenticated shell, route vocabulary, and app navigation decisions.
- `.planning/phases/42-ui-primitives-yume-kawaii-theme-bridge/42-CONTEXT.md` — shadcn-vue, chart foundation, theme bridge, icon, and asset rules.

### Current Desktop Surfaces
- `apps/web/src/router/index.ts` — authenticated routes and route names for `/map`, `/journal`, and `/memories`.
- `apps/web/src/views/LandingPageView.vue` — landing route wrapper.
- `apps/web/src/views/MapHomeView.vue` — world-footprints route surface.
- `apps/web/src/components/LeafletMapStage.vue` — Leaflet map stage, star marker/popup/date-dialog orchestration, focus return helpers, and reduced-motion CSS.
- `apps/web/src/components/map-popup/FootprintDateDialog.vue` — date dialog, Calendar, shortcut buttons, close/submit path, and place metadata rendering.
- `apps/web/src/components/map-popup/MapContextPopup.vue` — map popup dialog semantics and leave-footprint event path.
- `apps/web/src/views/TimelinePageView.vue` — populated journal route, long-text risk, empty/restoring states, and reduced-motion CSS.
- `apps/web/src/components/timeline/TimelineVisitCard.vue` — journal card content, management controls, long note/tag rendering, and focusable actions.
- `apps/web/src/views/StatisticsPageView.vue` — memories route state machine, dashboard composition, and chart/ranking/postcard surfaces.
- `apps/web/src/components/common/BaseChart.vue` — reusable ECharts wrapper and chart rendering states.
- `apps/web/src/components/memories/MemoriesChartGrid.vue` — four-chart memories layout and chart labels.
- `apps/web/src/components/shell/AuthenticatedAppShell.vue` — desktop authenticated shell layout.
- `apps/web/src/components/shell/ShellSidebar.vue` — sidebar navigation, current-route semantics, user card, disabled nav items, and long username risk.

### Test Surfaces
- `package.json` — root `test`, `build`, and `typecheck` scripts.
- `apps/web/package.json` — web test script and frontend dependencies.
- `apps/web/vitest.config.ts` — happy-dom web test environment.
- `apps/web/src/views/LandingPageView.spec.ts` — landing behavior coverage.
- `apps/web/src/router/index.spec.ts` — auth route guard behavior.
- `apps/web/src/components/LeafletMapStage.spec.ts` — map integration behavior.
- `apps/web/src/components/map-popup/MapContextPopup.spec.ts` — popup focus/semantics behavior.
- `apps/web/src/components/map-popup/FootprintDateDialog.spec.ts` — date dialog behavior if present or to be added/extended.
- `apps/web/src/views/TimelinePageView.spec.ts` — journal route behavior.
- `apps/web/src/components/timeline/TimelineVisitCard.spec.ts` — journal card behavior.
- `apps/web/src/views/StatisticsPageView.spec.ts` — memories route behavior.
- `apps/web/src/components/memories/MemoriesChartGrid.spec.ts` — chart-grid behavior.
- `apps/server/package.json` — server test script and database-dependent e2e behavior.
- `apps/server/test/auth-session.e2e-spec.ts` — auth regression surface.
- `apps/server/test/auth-bootstrap.e2e-spec.ts` — authenticated replay/bootstrap surface.
- `apps/server/test/records-travel.e2e-spec.ts` — records travel API regression surface.
- `apps/server/test/records-sync.e2e-spec.ts` — records sync regression surface.
- `packages/contracts/package.json` — contracts test script.
- `packages/contracts/src/contracts.spec.ts` — shared contract regression surface.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `LeafletMapStage.vue`: owns the map stage, marker/popup/date-dialog flow, existing focus-return helpers, and reduced-motion CSS; it is the main map QA target.
- `FootprintDateDialog.vue`: uses shadcn/reka Dialog and Calendar primitives, renders place metadata and shortcut dates, and is the key keyboard/focus target.
- `BaseChart.vue` and `MemoriesChartGrid.vue`: provide the four ECharts surfaces that must be visibly non-empty in desktop QA.
- `TimelinePageView.vue` and `TimelineVisitCard.vue`: contain journal cards, note/tag summaries, and long-text layout risks.
- `ShellSidebar.vue`: contains desktop nav semantics, disabled items, user card, and long username risk.
- Existing Vitest specs: provide focused places to add tests only when code fixes change behavior.

### Established Patterns
- Frontend uses Vue 3 `<script setup lang="ts">`, Pinia stores, shadcn-vue/reka primitives, Tailwind v4 utilities, and happy-dom Vitest tests.
- Current QA automation is mostly unit/component/service tests; no explicit Playwright project is required by this context.
- v8 visual work already includes reduced-motion media queries in several components; Phase 48 should audit/fix gaps locally.
- Server e2e coverage can depend on local PostgreSQL availability; environment failures should be documented separately from logic regressions.

### Integration Points
- Plan a reproducible desktop QA run that starts the local app with a populated account or seed data capable of showing map markers and all four memories charts.
- Save desktop screenshots plus a compact checklist for landing, `/map`, populated `/journal`, populated `/memories`, and the opened footprint date dialog.
- Use focused code fixes and focused tests for any discovered accessibility, long-text, reduced-motion, or visual-regression issues.
- Run web, server, and contracts tests as the release gate, with DB-environment notes if server e2e cannot fully execute.

</code_context>

<specifics>
## Specific Ideas

- The user explicitly superseded older mobile wording: "只看桌面，系统已经没有移动端了，后续都不要再出现了."
- The screenshot matrix should prove the happy-path desktop experience is solid rather than spending Phase 48 on exhaustive state coverage.
- Phase 48 should be a practical closeout: find visible/a11y/test issues, fix meaningful blockers locally, and leave concise evidence.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 48-Visual QA、Accessibility 与回归验证*
*Context gathered: 2026-05-27T06:02:34Z*
