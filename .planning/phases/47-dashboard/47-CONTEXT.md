# Phase 47: 旅途回忆 Dashboard - Context

**Gathered:** 2026-05-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 47 upgrades the authenticated `/memories` route from the existing lightweight statistics view into a real-data-driven Yume Kawaii travel memories dashboard. It should preserve the current account-authoritative data model while delivering four overview cards, monthly and yearly trip trends, country/region distribution, an explainable memories-profile radar, a visual Top 5 footprint ranking, and a horizontally browsable postcard strip tied to real dated travel records. It must not add time filtering, photo upload, favorites, a real achievement system, or new trip creation flows.

</domain>

<decisions>
## Implementation Decisions

### Trend and Distribution Semantics
- **D-01:** Monthly trend and yearly trend charts use trip count as their primary metric. Each travel record with a usable travel date contributes one trip occurrence to its date bucket.
- **D-02:** Country/region distribution also uses trip count. Repeated visits should change the distribution instead of being collapsed into unique-place counts.
- **D-03:** Phase 47 is an all-time dashboard. Do not add a time-range filter or make chart/ranking modules respond to `全部时间` controls in this phase.
- **D-04:** Records without a travel date do not enter monthly or yearly trend charts. They may still contribute to overview cards, country/region distribution, ranking, or other non-time-bucketed memories surfaces when their data supports it.

### Memories Profile Radar
- **D-05:** The radar chart must use only dimensions that can be stably derived from existing real account travel fields. Do not invent unsupported style scores only to copy the high-fidelity mockup labels.
- **D-06:** If the mockup's style dimensions such as scenery, culture, or food cannot be justified from current record fields, replace them with explainable real memories-profile dimensions and rename the chart language accordingly.
- **D-07:** The radar should feel like a gentle memories profile, not a professional rating report. Its labels and supporting copy should make the shape understandable without overstating precision.
- **D-08:** A small amount of data may still produce an initial profile when the selected real-data dimensions support it. The surface should communicate that it is an early profile rather than hide the module solely because the account is young.

### Popular Footprint Ranking
- **D-09:** Popular footprints rank places by repeat visit count.
- **D-10:** When repeat visit counts tie, the place with the more recent visit sorts first.
- **D-11:** Each ranking item should foreground place name, visit count, and most recent visit date. The ranking must stay visual and memory-oriented rather than falling back to a traditional data table.
- **D-12:** The ranking surface is fixed to Top 5 for Phase 47. Do not add expanded ranking browsing or a larger leaderboard flow.

### Memory Postcard Strip
- **D-13:** The bottom memories strip is a set of decorative postcards associated with real travel records. The visuals are illustrative/scenic memory slots, not uploaded user photos and not generic decoration detached from account history.
- **D-14:** Prefer the most recent dated travel memories when selecting postcards for the strip.
- **D-15:** Each postcard should carry lightweight place and date context so its real-memory association remains visible while the image still leads.
- **D-16:** The postcard strip is browse-only horizontal media for Phase 47. Do not add detail jumps, journal deep-links, zoom viewers, or photo-viewer semantics.

### the agent's Discretion
Downstream agents may choose the exact real-data radar dimensions, chart/card component boundaries, postcard illustration mapping, number of postcards shown in the visible viewport, and whether newly required aggregates live in an expanded stats response or a clearly derived memories data layer, as long as the decisions above remain locked and no static fake dashboard data is shown.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project and Scope
- `.planning/PROJECT.md` — v8.0 milestone scope, current product direction, and explicit exclusions for favorites and photo upload.
- `.planning/REQUIREMENTS.md` — Phase 47 requirements `MEM-01` through `MEM-07`.
- `.planning/ROADMAP.md` — Phase 47 goal, success criteria, and dependency on Phase 46.
- `.planning/STATE.md` — Current project state and Phase 47 handoff.
- `.planning/phases/46-travel-journal-refactor/46-CONTEXT.md` — predecessor decisions for real-record summaries, decorative thumbnails, journal boundaries, and Phase 47 ownership.
- `.planning/phases/45-map-authoritative-coverage-expansion/45-CONTEXT.md` — canonical replay and memories-derived label consistency context.
- `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md` — locked map/date creation flow and rule that new travel memories start from real map places.
- `.planning/phases/42-ui-primitives-yume-kawaii-theme-bridge/42-CONTEXT.md` — chart foundation, `BaseChart`, ECharts theme, asset rules, and high-fidelity v8 visual guidance.

### Visual Authority and Assets
- `prd/v8.0/UI/旅途回忆.png` — primary visual authority for the memories dashboard composition, chart mix, overview cards, ranking feel, and postcard strip atmosphere.
- `prd/v8.0/ASSET-MANIFEST.md` — postcard/scenic asset inventory and rule that statistics charts stay real ECharts data rather than screenshot slices.
- `prd/v8.0/CUTTING-GUIDE.md` — rules for translating high-fidelity comps into responsive DOM plus copied assets.
- `prd/v8.0/切图` — source asset folder; copy only needed decorative slices into app code with English kebab-case filenames.

### Current Memories Implementation and Data
- `apps/web/src/router/index.ts` — current authenticated `/memories` route contract.
- `apps/web/src/views/StatisticsPageView.vue` — current memories route surface, auth/restoring/error/empty states, stats refresh watches, and existing overview cards.
- `apps/web/src/views/StatisticsPageView.spec.ts` — current behavior coverage for stats refresh, empty state, and account-bound statistics.
- `apps/web/src/stores/stats.ts` — current stats fetch lifecycle and auth-bound reset behavior.
- `apps/web/src/services/api/stats.ts` — current `/records/stats` client.
- `packages/contracts/src/stats.ts` — current stats response contract, which currently only covers overview-level totals.
- `packages/contracts/src/records.ts` — travel record fields available for dated trends, country grouping, ranking, tags/notes, and postcard association.
- `apps/web/src/stores/map-points.ts` — current account travel record source and revision refresh integration used by memories.
- `apps/server/src/modules/records/records.controller.ts` — current stats endpoint entry point.
- `apps/server/src/modules/records/records.service.ts` — current stats service boundary.
- `apps/server/src/modules/records/records.repository.ts` — current server-authoritative aggregate implementation.

### Chart Foundation
- `apps/web/src/components/common/BaseChart.vue` — reusable ECharts wrapper for line, pie, bar, and radar modules plus loading/empty/error states.
- `apps/web/src/lib/charts/register.ts` — registered ECharts modules already aligned with Phase 47 chart needs.
- `apps/web/src/lib/charts/theme.ts` — Yume Kawaii chart theme.
- `apps/web/src/components/showcase/UiChartShowcase.vue` — existing chart foundation smoke example, not a source for production fake data.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StatisticsPageView.vue`: already owns the authenticated route state machine, `/memories` copy baseline, stats refresh on account boundary changes, and refresh after record revisions.
- `useStatsStore()` and `/records/stats`: already provide server-authoritative totals and a stable auth-aware fetch lifecycle that can be extended or complemented for dashboard aggregates.
- `TravelRecord`: already exposes `placeId`, display labels, country/region path context, dates, notes, and tags for record-tied derived memories.
- `BaseChart.vue`: already wraps ECharts line, pie, bar, and radar support with Yume Kawaii states.
- Phase 46 postcard/thumb treatment and v8 postcard assets: provide a precedent for decorative travel imagery that stays distinct from user-uploaded photos.

### Established Patterns
- Frontend work uses Vue 3 Composition API with `<script setup lang="ts">`, Pinia stores, route-level view orchestration, focused components, and component/spec coverage.
- Server totals are currently authoritative through `records` repository/service/controller layers; the existing stats contract is intentionally small and planners should account for additional real dashboard aggregates.
- Memories already re-fetches stats when authoritative record content or account boundary state changes. New dashboard data should not drift behind edits, deletes, metadata refresh, or session changes.
- Phase 42 established Yume Kawaii chart tokens and `BaseChart`; Phase 47 should use that real chart path instead of baking high-fidelity chart screenshots into the page.
- Phase 46 established decorative postcards as deterministic illustration slots rather than photo upload affordances.

### Integration Points
- Refactor the `/memories` route surface from the current three-card overview into section components for overview, charts, ranking, and postcard strip while preserving route states.
- Extend or pair the current stats data layer with real aggregates for trends, distribution, ranking, and explainable profile derivation.
- Use dated travel records carefully: missing travel dates can remain visible in non-time modules while trend buckets stay date-truthful.
- Add focused tests for real-data chart options, empty state without fake charts, Top 5 ranking order/tie break, initial radar messaging, and postcard selection/accessibility semantics.

</code_context>

<specifics>
## Specific Ideas

- The high-fidelity reference is valuable for dashboard rhythm and atmosphere, but the data semantics should stay honest even when that means renaming the radar chart away from unsupported style labels.
- The dashboard should read as a warm memories page with charts, not a leaderboard or BI report.
- Postcards should feel tied to the user's recent dated travel memories while remaining obviously decorative imagery rather than uploaded photos.

</specifics>

<deferred>
## Deferred Ideas

- Time-range filtering remains out of Phase 47 even though the high-fidelity reference shows an all-time control.
- Postcard click-through to journal entries, zoom viewers, or photo-viewer behavior remains out of Phase 47.
- Favorites, user photo upload, and a real achievement/badge system remain future capabilities outside v8.0 memories work.

</deferred>

---

*Phase: 47-旅途回忆 Dashboard*
*Context gathered: 2026-05-22*
