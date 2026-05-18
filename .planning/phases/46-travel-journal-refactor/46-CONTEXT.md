# Phase 46: 旅途手账重构 - Context

**Gathered:** 2026-05-18T17:46:31+08:00
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 46 upgrades the authenticated `/journal` route from a plain timeline into a high-fidelity Yume Kawaii travel journal. It should show real account travel records as a glowing vertical journal stream with star nodes, lightweight card motion, date/place/context, note/tag summaries, and decorative postcard-style thumbnails. It must not add a new-travel creation path, must not show favorite/collection affordances, and must not drift into the Phase 47 memories dashboard.

</domain>

<decisions>
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project and Scope
- `.planning/PROJECT.md` — v8.0 milestone scope, Yume Kawaii direction, and explicit out-of-scope exclusions for favorites and photo upload.
- `.planning/REQUIREMENTS.md` — Phase 46 requirements `JOURNAL-01` through `JOURNAL-06`.
- `.planning/ROADMAP.md` — Phase 46 goal, dependency on Phase 45, and success criteria.
- `.planning/STATE.md` — Current project state and Phase 46 handoff.
- `.planning/phases/43-landing/43-CONTEXT.md` — locked `/journal` route vocabulary, authenticated shell decisions, and rule that old `/timeline` compatibility is not preserved.
- `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md` — predecessor map/date-dialog decisions, including the rule that new trips start from real map places.
- `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md` — canonical record consistency context feeding journal labels, grouping, and replay expectations.

### Visual Authority and Assets
- `prd/v8.0/UI/旅途手帐.png` — primary visual authority for the journal page's glowing vertical line, star nodes, card rhythm, and postcard-like composition; excluded add/favorite controls must not be copied.
- `prd/v8.0/UI/世界足迹.png` — supporting reference for current route shell visual consistency.
- `prd/v8.0/UI/旅途回忆.png` — supporting reference for the shared shell and Yume Kawaii dashboard taste; Phase 47 dashboard content remains out of scope.
- `prd/v8.0/ASSET-MANIFEST.md` — v8 asset inventory and naming guidance.
- `prd/v8.0/CUTTING-GUIDE.md` — rules for converting high-fidelity comps into real DOM plus copied assets.
- `prd/v8.0/切图` — source asset folder; copy only needed slices into app code with English kebab-case names.

### Current Journal Implementation
- `apps/web/src/router/index.ts` — current `/journal` route and route name.
- `apps/web/src/views/TimelinePageView.vue` — current journal route surface and empty/restoring/populated states.
- `apps/web/src/views/TimelinePageView.spec.ts` — existing page-level journal behavior tests.
- `apps/web/src/components/timeline/TimelineVisitCard.vue` — current record card, edit/delete entry points, and inline edit flow.
- `apps/web/src/components/timeline/TimelineVisitCard.spec.ts` — existing card behavior coverage for dates, notes, tags, edit, delete, and repeated visits.
- `apps/web/src/components/timeline/TimelineEditForm.vue` — current inline edit form to preserve and restyle.
- `apps/web/src/components/timeline/ConfirmDialog.vue` — current delete confirmation surface.
- `apps/web/src/services/timeline.ts` — journal entry derivation, sort order, visit counts, notes, and tags.
- `apps/web/src/services/timeline.spec.ts` — timeline derivation and Phase 45 canonical label coverage.
- `apps/web/src/stores/map-points.ts` — source of `timelineEntries`, travel records, update/delete actions, and optimistic state.
- `apps/web/src/components/shell/ShellSidebar.vue` — authenticated nav entry for `旅途手账`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `TimelinePageView.vue`: already owns authenticated/restoring/empty/populated states for `/journal`. It should be visually rebuilt rather than bypassed with a second route surface.
- `TimelineVisitCard.vue`: already owns repeated-visit badge data, date label, notes/tags display, edit mode, delete confirmation, and store calls. Phase 46 should refactor its information hierarchy and action placement instead of rewriting the record lifecycle.
- `TimelineEditForm.vue`: already handles date range validation, note length, tags, conflict warnings, submit/cancel, and accessibility labels. Keep the behavior; restyle the containing edit state to fit the journal card.
- `ConfirmDialog.vue`: already provides delete confirmation, including destructive tone for deleting the final visit record.
- `buildTimelineEntries()`: already derives chronological entries, known/unknown date sorting, visit ordinal/count, notes, and tags from authoritative `TravelRecord` data.
- `KawaiiIcon` / semantic journal icon assets: already support shell and route vocabulary; reuse where it fits the journal page.

### Established Patterns
- Vue 3 `<script setup lang="ts">`, Pinia stores, component-level tests, and route-level view orchestration are the existing frontend pattern.
- Phase 43 locked the `/journal` route and `旅途手账` vocabulary; do not reintroduce `/timeline`.
- Phase 44/45 locked that new trips come from the map and authoritative place flow; the journal page can guide users back to the map only as an empty-state path.
- v8 assets must be copied into `apps/web/src/assets/v8/...` with English kebab-case names if used directly from app code.
- Existing tests assert that user-facing legacy timeline/statistics routes fall through; preserve that routing direction.

### Integration Points
- Replace the current `grid` card list in `TimelinePageView.vue` with a vertical glowing journal stream that renders `TimelineVisitCard` or a renamed local component.
- Update `TimelineVisitCard.vue` to render the lightweight reading card, deterministic decorative thumbnail, star-node/card accent, summarized note/tag stickers, and low-noise management menu.
- Preserve `TimelineEditForm` and `ConfirmDialog` integration while moving edit/delete entry points into the low-noise management area.
- Add focused tests for absence of add/favorite controls, empty-state map guidance, decorative thumbnail accessibility, stable thumbnail mapping, lightweight summaries, and low-noise management entry behavior.

</code_context>

<specifics>
## Specific Ideas

- The page should feel like an open glowing travel journal rather than a management list.
- The high-fidelity reference's add and favorite controls are visual traps for this phase: the atmosphere is useful, the excluded capabilities are not.
- Thumbnails should feel like soft landscape postcards: dreamy, varied, stable, and clearly decorative.
- Cards should prioritize reading rhythm. Management actions stay available but should not dominate the card.

</specifics>

<deferred>
## Deferred Ideas

- Adding trips directly from the journal remains out of scope; creation stays on `世界足迹`.
- Favorites, collections, favorite state, and `我的收藏` remain out of scope for v8.0.
- User-uploaded photos, real photo thumbnails, and rich travel diary content remain out of scope; Phase 46 only uses decorative illustration slots.
- Phase 47 owns `旅途回忆` dashboard charts, rankings, overview cards, and memory image carousel behavior.

</deferred>

---

*Phase: 46-旅途手账重构*
*Context gathered: 2026-05-18T17:46:31+08:00*
