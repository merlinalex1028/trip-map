# Phase 44: 世界足迹地图与留下足迹日期弹窗 - Context

**Gathered:** 2026-05-13T00:00:00Z
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 44 delivers the v8 `世界足迹` map experience on top of the existing Leaflet + canonical resolve flow: a high-fidelity map stage, a unified place-information popup, a standalone `留下足迹` date dialog, and page-level visual coordination so the map route and its same-screen sidebar feel like one coherent high-fidelity scene. It does not expand saveable coverage logic beyond current authoritative constraints, redesign journal or memories content, or rebuild the authenticated shell information architecture.

</domain>

<decisions>
## Implementation Decisions

### Map Stage and Same-Screen Sidebar Fidelity
- **D-01:** The map route should prioritize high-fidelity stage reproduction. The overall feeling should closely follow `prd/v8.0/UI/世界足迹.png`, with a dreamy Yume Kawaii presentation, while preserving real clickability, recognition clarity, and Leaflet usability.
- **D-02:** Phase 44 may push the map route's same-screen sidebar much closer to the high-fidelity design than Phase 43 did. This includes visual treatment, illustration usage, layering, button states, decorative surfaces, and spacing so the sidebar feels fully aligned with the map stage.
- **D-03:** Sidebar work in Phase 44 is a visual restoration, not a shell feature expansion. Do not add new navigation capabilities, do not change the authenticated shell information architecture, and do not turn this into a cross-route shell redesign for journal or memories.
- **D-04:** The map page should read as one coordinated composition: map stage, popup, date dialog, and sidebar should share the same high-fidelity visual language instead of feeling like separate UI systems.

### Place Popup Information Architecture
- **D-05:** The popup is an information-first place card. The place name is the most prominent element, followed by the type label and regional subtitle/context. The primary action `留下足迹` must be obvious, but it must not visually overpower the place identity.
- **D-06:** The popup should keep one unified place-information layout for detected, saved, and re-opened places. It should not branch into a different "history panel" experience for saved places.
- **D-07:** Saved places must not show prior trip lists, latest trip rows, or embedded trip history in the popup. Phase 44 explicitly removes the current history-list behavior from this surface.
- **D-08:** When the user opens a saved place, the popup should first communicate the place information and that the place already has saved footprints, then offer an entry to create another visit. It should feel like a warm place card with a follow-up action, not a task-heavy management panel.

### Footprint Date Dialog Structure
- **D-09:** Clicking `留下足迹` opens a standalone, full-presence card-style dialog. The date form must no longer live inline inside the popup.
- **D-10:** The date dialog should feel substantial and high-fidelity, closer to `prd/v8.0/UI/留下足迹.png` than to a lightweight utility popover.
- **D-11:** The dialog's first screen should already show the full place info, shortcut dates, and the full calendar at once. Do not hide the calendar behind an expand action and do not reduce it to a secondary section.
- **D-12:** The dialog should include a dedicated visual/illustration presence and supporting prompt area consistent with the high-fidelity reference, as long as the real date controls remain primary and accessible DOM.

### Date Semantics and Shortcut Behavior
- **D-13:** The recording model is single-day first. The default user mental model is "I went here on this day", not "I am always creating a date range".
- **D-14:** Shortcut options are fixed to `今天 / 明天 / 本周末 / 其他日期`.
- **D-15:** The dialog may still support an optional end date when needed, but the primary interaction and shortcut language should bias toward a single visit day.
- **D-16:** All submitted values must still honor the existing backend contract `{ startDate: string | null; endDate: string | null }` and use `YYYY-MM-DD`.
- **D-17:** When the dialog opens, it must snapshot the current resolved place payload so the user cannot accidentally save against a different map selection after context changes.

### State Feedback and Availability Rules
- **D-18:** Feedback is layered by context. Popup and date dialog surfaces should explain local state such as unavailable place, login requirement, submitting, or field-level failure. Page-level/global notice should handle success confirmation and broader errors that deserve app-level visibility.
- **D-19:** For places that are recognized but not authoritative-saveable, keep the `留下足迹` primary action in place but render it disabled and explain the reason directly in context. Do not let the user proceed into a dialog only to be rejected later.
- **D-20:** The unavailable-place treatment should feel explicit and honest rather than mysterious. Users should understand that the place was recognized, but current authoritative save requirements are not met.
- **D-21:** Anonymous users still do not get a silent failure path. The Phase 44 experience must make login gating clear within the current interaction context.

### the agent's Discretion
- Exact component boundaries, CSS implementation, and whether popup/dialog/sidebar decorative assets are composed from copied slices or semantic wrappers remain at the agent's discretion, as long as they honor the locked high-fidelity direction and do not introduce new product capabilities.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project and Scope
- `.planning/PROJECT.md` — v8.0 milestone scope, product priorities, and out-of-scope constraints.
- `.planning/REQUIREMENTS.md` — Phase 44 requirements `MAP-01` through `MAP-06` and `DATE-01` through `DATE-06`.
- `.planning/ROADMAP.md` — Phase 44 goal, success criteria, dependency on Phase 43, and milestone sequencing.
- `.planning/STATE.md` — current phase handoff and accumulated project decisions.
- `.planning/research/SUMMARY.md` — milestone-level research context and implementation risks.
- `.planning/phases/42-ui-primitives-yume-kawaii-theme-bridge/42-CONTEXT.md` — locked v8 UI foundation decisions, asset handling rules, `KawaiiIcon`, chart/theme foundations, and high-fidelity visual authority guidance.
- `.planning/phases/43-landing/43-CONTEXT.md` — locked route/auth/shell decisions, including the Phase 43 sidebar baseline and the rule that map-shell work should not become a new navigation capability set.

### Visual Authority and Assets
- `prd/v8.0/UI/世界足迹.png` — primary high-fidelity authority for the map stage, popup atmosphere, pin feel, and map-route sidebar treatment.
- `prd/v8.0/UI/留下足迹.png` — primary authority for the standalone footprint date dialog, illustration zone, and date-entry visual hierarchy.
- `prd/v8.0/UI/旅途手帐.png` — supporting reference for sidebar styling consistency and reliable sidebar illustration taste when map-route shell details need corroboration.
- `prd/v8.0/UI/旅途回忆.png` — supporting reference for sidebar styling consistency, glassmorphism layering, and high-fidelity token usage.
- `prd/v8.0/ASSET-MANIFEST.md` — required asset inventory, priority list, and canonical names for sidebar, popup, dialog, and pin assets.
- `prd/v8.0/CUTTING-GUIDE.md` — rules for translating high-fidelity comps into real DOM plus copied assets.
- `prd/v8.0/切图` — source folder for copied design slices; copy only the needed assets into app code with English kebab-case names.

### Current Map and Shell Implementation
- `apps/web/src/components/LeafletMapStage.vue` — current map recognition flow, popup orchestration, auth gating on map actions, and current integration point for popup/dialog behavior.
- `apps/web/src/components/map-popup/MapContextPopup.vue` — popup container and anchoring surface currently wrapping the place summary card.
- `apps/web/src/components/map-popup/PointSummaryCard.vue` — current place-card behavior, saved-place history rendering, and current inline `TripDateForm` expansion to replace.
- `apps/web/src/components/map-popup/TripDateForm.vue` — existing inline date form that Phase 44 should replace with a standalone dialog.
- `apps/web/src/stores/map-points.ts` — authoritative save/delete flows, optimistic record behavior, pending-place state, and summary surface modes.
- `apps/web/src/components/shell/AuthenticatedAppShell.vue` — current route shell composition around the authenticated app.
- `apps/web/src/components/shell/ShellSidebar.vue` — current sidebar baseline that Phase 44 may visually restore for the map route without changing shell information architecture.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/components/LeafletMapStage.vue`: already owns click recognition, popup anchoring, pending-marker behavior, and the `illuminate` / `unilluminate` event path. Phase 44 should layer the new popup/dialog contract onto this surface instead of introducing a second map orchestration path.
- `apps/web/src/components/map-popup/MapContextPopup.vue`: existing floating popup shell with focus entry behavior and card slot composition can likely be reused while swapping the internal content contract.
- `apps/web/src/components/map-popup/PointSummaryCard.vue`: contains the current summary, candidate selection, saved-place history, and inline date-form behaviors. It is the main refactor target for the new information-first popup.
- `apps/web/src/components/map-popup/TripDateForm.vue`: provides the current date payload contract and validation expectations, even though the inline form UI itself should be replaced.
- `apps/web/src/stores/map-points.ts`: already centralizes optimistic record creation, authoritative record replacement, pending place IDs, and summary modes; it should remain the source of truth for record writes.
- `apps/web/src/components/shell/ShellSidebar.vue` and related shell components: provide the current authenticated sidebar structure that can be visually upgraded for the map route without introducing a new navigation model.

### Established Patterns
- Vue code uses Composition API with `<script setup lang="ts">`, Pinia stores, and route-level orchestration components. Phase 44 should follow this pattern rather than embedding business state into presentational components.
- Phase 42 established the shadcn-vue primitive baseline and the rule that copied high-fidelity assets should be brought into the app selectively with English kebab-case filenames.
- Phase 43 already locked the three-entry authenticated navigation model and removed old topbar navigation semantics. Phase 44 must respect that shell contract even while visually pushing the map-route sidebar closer to the high-fidelity comp.
- The current map flow distinguishes `detected-preview`, `view`, and `candidate-select` summary modes. Popup and dialog decisions should map onto those existing modes where possible instead of inventing unrelated state machines.
- Existing save flows already distinguish optimistic pending state, unauthorized handling, and global notices. The new dialog/popup should build on that rather than replacing the record-write lifecycle.

### Integration Points
- `apps/web/src/components/LeafletMapStage.vue`: likely entry point for replacing inline date-form expansion with a standalone dialog controller and for wiring layered feedback.
- `apps/web/src/components/map-popup/PointSummaryCard.vue`: integration point for removing saved-place history UI, introducing the new saved-state messaging, and handling disabled unavailable-place treatment.
- `apps/web/src/components/map-popup/*`: likely location for new popup subcomponents or for a dedicated footprint-dialog component nearby if the planner keeps map-route concerns local.
- `apps/web/src/stores/map-points.ts`: integration point for any snapshotting semantics or save payload reshaping that still preserves the authoritative contract.
- `apps/web/src/components/shell/ShellSidebar.vue` plus map-route layout surfaces: integration point for high-fidelity sidebar restoration specific to the map page.
- Tests around `LeafletMapStage`, popup components, auth gating, and save flows will need updates because current specs still assume inline form and saved-place history rendering.

</code_context>

<specifics>
## Specific Ideas

- The user wants the map experience to lean hard toward the high-fidelity comp rather than settling for a softened approximation.
- The popup should feel like a beautiful place card first, not a compact CRUD utility.
- The date dialog should feel ceremonious and expressive, with real calendar controls visible immediately instead of being tucked behind secondary reveals.
- The map-route sidebar currently does not feel high-fidelity enough to the user. Phase 44 should treat it as part of the same visual restoration as the map stage.
- Unavailable places should communicate "recognized but not saveable" clearly and immediately in the popup instead of hiding that truth behind a later dialog or click failure.

</specifics>

<deferred>
## Deferred Ideas

- A full authenticated-shell redesign across all routes is deferred. Phase 44 may visually restore the map-route sidebar but must not become a whole-app shell re-architecture.
- Saveable coverage expansion remains Phase 45. Phase 44 should explain unsupported places honestly, not solve the backend/data completeness problem here.
- Journal and memories high-fidelity content redesigns remain Phase 46 and Phase 47.

</deferred>

---

*Phase: 44-世界足迹地图与留下足迹日期弹窗*
*Context gathered: 2026-05-13T00:00:00Z*
