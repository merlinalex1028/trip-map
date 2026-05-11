# Phase 43: Landing、登录门禁与应用壳 - Context

**Gathered:** 2026-05-11T09:30:06Z
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 43 delivers the public v8 landing page, the authenticated `/map` entry, route-level login gating for all application pages, the logged-in Yume Kawaii left navigation shell, and the first pass of global user-facing copy migration. It does not redesign the map popup/date dialog, expand saveable coverage, rebuild the journal page content, or build the memories dashboard beyond routing/shell/copy integration.

</domain>

<decisions>
## Implementation Decisions

### Landing Page Fidelity and Assets
- **D-01:** The landing page should prioritize full-page high-fidelity reproduction, not just a simplified first viewport. Phase 43 should use the available v8 landing asset slices to match the full landing design as closely as practical.
- **D-02:** `prd/v8.0/切图/落地页上半背景.png` and `prd/v8.0/切图/落地页下半背景.png` are the landing page's primary high-fidelity scene backgrounds.
- **D-03:** Background slices carry the large scene and atmosphere; interactive UI must be real DOM layered over the scene. Titles, CTA buttons, login/register triggers, and any meaningful text should remain accessible HTML, not baked into image-only UI.
- **D-04:** Other transparent assets in `prd/v8.0/切图` may be used for high-fidelity restoration. When used in product code, copy only the needed assets into `apps/web/src/assets/v8/...` and rename them with English kebab-case filenames; do not reference Chinese raw design filenames directly from Vue code.
- **D-05:** Desktop layout should follow the design frame ratio, centered and proportionally scaled. Use the high-fidelity design composition as the anchor, with wide screens extending the background tastefully and smaller desktop screens scaling/cropping to preserve the original spatial relationships.
- **D-06:** Mobile compatibility is explicitly out of scope for this phase and for the current system direction. Do not spend Phase 43 effort on mobile-specific landing reflow, bottom navigation, drawer behavior, or mobile shell adaptation. This user decision overrides the original `SHELL-03` mobile adaptation expectation for this phase.

### Authentication Gate and Redirects
- **D-07:** Login or registration success always navigates to `/map`. Do not preserve redirect intent from protected routes.
- **D-08:** Anonymous visits to protected application pages should route to `/` and show the normal high-fidelity landing page. Do not auto-open the login dialog and do not show an extra "login required" warning.
- **D-09:** On initial session restore, show a short restore/loading state before choosing between landing and `/map`. Avoid flashing the public landing page to already-authenticated users.
- **D-10:** Logout returns the user to `/` landing. The existing logout notice can remain as a lightweight global notice if it fits the new shell, but the route destination is fixed to landing.
- **D-11:** The public landing page is not inside the logged-in application shell. The left navigation shell applies only to authenticated application routes.

### Authenticated App Shell
- **D-12:** Logged-in application pages use the left sidebar as the primary shell. Remove the old topbar's logged-in navigation responsibilities; `AuthTopbarControl` should not remain the main authenticated navigation surface.
- **D-13:** The left sidebar should contain the brand area, user card, fixed navigation entries, one reliable illustration area, and logout. Do not add "我的收藏" or any future placeholder entries.
- **D-14:** Use one reliable sidebar illustration across authenticated pages instead of switching illustrations per route. Do not blindly reproduce the incorrect bottom-left illustration noted in `prd/v8.0/UI/世界足迹.png`; prefer a reliable character/cat/flower asset from the available v8 slices.
- **D-15:** The sidebar user card currently shows only the default avatar and username. The default avatar should come from the high-fidelity asset slices. Structure the component/data path so future user-uploaded avatars can replace the default, but do not implement upload in this phase.
- **D-16:** Do not show travel record summaries, badges, progress, or stats in the sidebar during Phase 43, despite earlier `SHELL-02` wording. Leave room for later extension if needed.
- **D-17:** Sidebar navigation is exactly three main entries: `世界足迹`, `旅途手账`, and `旅途回忆`. Each entry uses `KawaiiIcon` plus Chinese text, has current-route highlighting, and does not include disabled/future entries.

### Routes and Copy Migration
- **D-18:** Replace the old route semantics completely. Use `/map`, `/journal`, and `/memories` as the main application paths.
- **D-19:** Do not keep compatibility redirects for `/timeline` or `/statistics`. Old paths should fall through as unknown routes and route to `/`; authenticated users may then be redirected from `/` to `/map` by the root auth behavior.
- **D-20:** Update user-visible text and route/test semantics together. Page titles, navigation labels, CTA text, empty states, `data-route-view`, router route names, and relevant test descriptions should use `世界足迹`, `旅途手账`, and `旅途回忆` vocabulary.
- **D-21:** Do not force broad file/component renames such as `TimelinePageView.vue` or `StatisticsPageView.vue` solely for naming purity. Rename internals where it directly supports route/test clarity, but avoid large churn that does not improve behavior.
- **D-22:** Global copy replacement for this phase is user-facing first: `点亮` becomes `留下足迹`, `旅行统计` becomes `旅途回忆`, and `时间轴` becomes `旅途手账` where those strings appear in Phase 43-owned surfaces and route-facing tests. Deeper map popup/date dialog behavior belongs to Phase 44.

### the agent's Discretion
No user decisions were delegated to the agent's discretion. Downstream agents may choose component boundaries and exact CSS implementation details only within the decisions above.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project and Scope
- `.planning/PROJECT.md` — v8.0 milestone scope, out-of-scope exclusions, and active product decisions.
- `.planning/REQUIREMENTS.md` — Phase 43 requirements `AUTH-01` through `AUTH-05` and `SHELL-01` through `SHELL-04`; note that this context intentionally overrides mobile compatibility expectations for Phase 43.
- `.planning/ROADMAP.md` — Phase 43 goal, success criteria, dependencies, and downstream phase boundaries.
- `.planning/STATE.md` — Current project state and prior accumulated decisions.
- `.planning/research/SUMMARY.md` — v8.0 research context for landing, authenticated shell, dependency choices, and routing risk.
- `.planning/phases/42-ui-primitives-yume-kawaii-theme-bridge/42-CONTEXT.md` — Locked Phase 42 decisions about shadcn-vue primitives, `KawaiiIcon`, `BaseChart`, v8 asset handling, and visual authority.

### Visual Authority and Assets
- `prd/v8.0/UI/落地页.png` — High-fidelity landing reference.
- `prd/v8.0/UI/世界足迹.png` — Authenticated map/shell reference; do not copy the known incorrect bottom-left sidebar illustration blindly.
- `prd/v8.0/UI/旅途手帐.png` — Journal/shell visual reference and reliable sidebar illustration reference.
- `prd/v8.0/UI/旅途回忆.png` — Memories/shell visual reference and reliable sidebar illustration reference.
- `prd/v8.0/UI/留下足迹.png` — Visual language reference only for Phase 43; actual date dialog implementation belongs to Phase 44.
- `prd/v8.0/切图` — Source folder for high-fidelity transparent slices and landing backgrounds. Copy selected assets into `apps/web/src/assets/v8/...` with English kebab-case filenames before using them in app code.
- `prd/v8.0/切图/落地页上半背景.png` — Required upper landing background slice.
- `prd/v8.0/切图/落地页下半背景.png` — Required lower landing background slice.
- `prd/v8.0/ASSET-MANIFEST.md` — Asset inventory, naming guidance, and priority list.
- `prd/v8.0/CUTTING-GUIDE.md` — Rules for using slices versus real DOM UI.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/components/ui/sidebar/*`: shadcn-vue sidebar primitives are available from Phase 42. Because mobile is out of scope, do not over-invest in drawer/bottom-navigation adaptations.
- `apps/web/src/components/common/KawaiiIcon.vue` and `apps/web/src/lib/icons/semantic-icons.ts`: semantic icon wrapper already supports map, journal, memories, calendar, star, camera, badge, and pin.
- `apps/web/src/components/auth/AuthDialog.vue`: existing login/register modal supports `openAuthModal('login' | 'register')` and can be reused from landing CTA buttons.
- `apps/web/src/stores/auth-session.ts`: existing auth store handles restore, login, register, logout, session boundary resets, and cloud snapshot hydration. Phase 43 should connect routing behavior around this store rather than inventing a second auth system.
- `apps/web/src/components/auth/LocalImportDecisionDialog.vue`: keep the existing post-login local import decision flow available after successful auth.

### Established Patterns
- Vue code uses Vue 3 Composition API with `<script setup lang="ts">`, Pinia stores, and Vue Router.
- Route-level views are thin composition surfaces. New landing and shell components should keep route views mostly as orchestration surfaces and move substantial UI into focused components.
- Router guards already await `restoreSession()` while status is `restoring`; preserve async guard correctness and avoid redirect loops.
- Tailwind v4 and tokenized Yume Kawaii styling are already in place via `apps/web/src/style.css` and `apps/web/src/styles/tokens.css`.

### Integration Points
- `apps/web/src/router/index.ts`: define `/` as public landing/root decision point, `/map`, `/journal`, `/memories` as protected app routes, and update catch-all behavior.
- `apps/web/src/App.vue`: split public landing versus authenticated app shell responsibilities; remove the old topbar as the logged-in navigation model.
- `apps/web/src/views/MapHomeView.vue`: map route should move from `/` to `/map` while keeping Leaflet core behavior intact.
- `apps/web/src/views/TimelinePageView.vue`: route-facing copy should become `旅途手账`; content redesign remains Phase 46.
- `apps/web/src/views/StatisticsPageView.vue`: route-facing copy should become `旅途回忆`; dashboard redesign remains Phase 47.
- `apps/web/src/router/index.spec.ts`, `apps/web/src/App.spec.ts`, and affected view specs: update route names, path expectations, anonymous routing expectations, and visible copy assertions.

</code_context>

<specifics>
## Specific Ideas

- The user explicitly wants to use `prd/v8.0/切图` for high-fidelity landing restoration, especially the upper/lower landing background slices.
- The landing page should feel like the high-fidelity v8 design as a complete page, with real interactive controls layered on top of the sliced scene.
- The app has intentionally abandoned mobile compatibility for now; desktop high-fidelity is the target.
- Default user avatar should come from the high-fidelity slice assets and be replaceable later by user-uploaded avatar data.
- Old `/timeline` and `/statistics` are not compatibility paths. Tests should be updated to the new route vocabulary instead of preserving old route behavior.

</specifics>

<deferred>
## Deferred Ideas

- User-uploaded avatar support is intentionally deferred. Phase 43 should only reserve the replacement path and use a default high-fidelity avatar asset.
- Sidebar travel summaries, badges, progress, or stats are deferred despite earlier shell wording.
- Mobile landing/shell compatibility is deferred/out of current system scope.

</deferred>

---

*Phase: 43-Landing、登录门禁与应用壳*
*Context gathered: 2026-05-11T09:30:06Z*
