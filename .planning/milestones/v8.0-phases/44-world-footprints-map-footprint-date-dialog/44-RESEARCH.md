# Phase 44: 世界足迹地图与留下足迹日期弹窗 - Research

**Researched:** 2026-05-13  
**Domain:** Vue 3 + Leaflet map interaction, shadcn-vue Dialog/Calendar, Yume Kawaii map UI refactor  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

The following constraints are copied verbatim from `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md`. [VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md`]

### Locked Decisions

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

### Deferred Ideas (OUT OF SCOPE)
- A full authenticated-shell redesign across all routes is deferred. Phase 44 may visually restore the map-route sidebar but must not become a whole-app shell re-architecture.
- Saveable coverage expansion remains Phase 45. Phase 44 should explain unsupported places honestly, not solve the backend/data completeness problem here.
- Journal and memories high-fidelity content redesigns remain Phase 46 and Phase 47.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MAP-01 | 保留现有 Leaflet 地图识别主链路并升级为柔粉紫地图舞台。 | Keep `LeafletMapStage.vue` as orchestration owner; restyle stage and marker layer without replacing `resolveCanonicalPlace` / `confirmCanonicalPlace`. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `.planning/REQUIREMENTS.md`] |
| MAP-02 | 已保存/识别中地点使用星形或发光足迹标记，hover/active 有轻量动效。 | Existing marker styling is CSS-based circles/pulses in `SeedMarkerLayer.vue`; Leaflet `CircleMarker` supports fixed pixel radius and custom class names for pending markers. [VERIFIED: `apps/web/src/components/SeedMarkerLayer.vue`; CITED: https://leafletjs.com/reference] |
| MAP-03 | 点击地图后弹窗始终展示真实地点信息、类型标签、地区信息和“留下足迹”。 | Current popup already receives `SummarySurfaceState`; refactor `PointSummaryCard.vue` to unified place card and replace `点亮/已点亮` labels. [VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.vue`; VERIFIED: `.planning/REQUIREMENTS.md`] |
| MAP-04 | 地图弹窗不再内嵌日期表单，点击后打开独立日期选择弹窗。 | Remove inline `TripDateForm` from `PointSummaryCard.vue`; introduce controlled `FootprintDateDialog` using shadcn-vue Dialog/Calendar. [VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.vue`; CITED: https://www.shadcn-vue.com/docs/components/dialog; CITED: https://www.shadcn-vue.com/docs/components/calendar] |
| MAP-05 | 已保存地点弹窗不展示过往记录，不使用“再留一次足迹”分支文案。 | Current saved popup renders `PopupTripRecord` list and `data-record-again`; planner must remove these from map popup tests and implementation. [VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.vue`; VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.spec.ts`] |
| MAP-06 | 网络失败、未登录、不可用地点和保存中状态都有清晰反馈。 | Current store uses optimistic pending IDs and map UI notices; keep store write lifecycle and add local popup/dialog messaging. [VERIFIED: `apps/web/src/stores/map-points.ts`; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`] |
| DATE-01 | 独立日期弹窗使用 shadcn-vue Dialog/Calendar 或等价成熟组件。 | The generated project already contains `components/ui/dialog` and `components/ui/calendar`, both backed by Reka UI. [VERIFIED: `apps/web/src/components/ui/dialog/index.ts`; VERIFIED: `apps/web/src/components/ui/calendar/Calendar.vue`; CITED: Context7 `/unovue/shadcn-vue`] |
| DATE-02 | 日期弹窗显示当前地点名称、类型标签、地区信息和插画/提示区。 | Snapshot object should include `placeId`, display name, `typeLabel`, `parentLabel`, `subtitle`, and saveability fields already available on `MapPointDisplay`. [VERIFIED: `apps/web/src/types/map-point.ts`] |
| DATE-03 | 日期弹窗支持今天、明天、本周末、选择其他日期。 | Use `@internationalized/date` `today(getLocalTimeZone())`, `.add({ days })`, and `CalendarDate.toString()` to produce `YYYY-MM-DD`. [VERIFIED: `apps/web/src/components/ui/calendar/Calendar.vue`; CITED: https://react-aria.adobe.com/internationalized/date/CalendarDate] |
| DATE-04 | 提交值统一为 `{ startDate, endDate }` 且符合 `YYYY-MM-DD`。 | Existing `TripDateForm` contract and `mapPointsStore.illuminate` already pass `startDate` / `endDate` to `createTravelRecord`. [VERIFIED: `apps/web/src/components/map-popup/TripDateForm.vue`; VERIFIED: `apps/web/src/stores/map-points.ts`; VERIFIED: `apps/web/src/services/api/records.ts`] |
| DATE-05 | 日期弹窗打开时 snapshot 当前地点 payload，切换地图地点不会保存错位。 | Do not read `summarySurfaceState` inside submit; create an immutable dialog snapshot before opening. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`] |
| DATE-06 | 取消、关闭、提交中、提交失败、提交成功状态均可访问且不会丢失焦点。 | Reka Dialog traps focus when modal, announces title/description, and returns focus to trigger on Esc; still add explicit tests for submit/close focus return. [CITED: https://www.reka-ui.com/docs/components/dialog] |
</phase_requirements>

## Summary

Phase 44 should be planned as a focused client-side map interaction refactor, not as a backend expansion. The canonical recognition and record-write chain already exists in `LeafletMapStage.vue` and `map-points.ts`; the phase should preserve it while moving the date UI out of `PointSummaryCard.vue` into a controlled, accessible dialog. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `apps/web/src/stores/map-points.ts`]

The main behavioral change is that `PointSummaryCard.vue` stops being a trip-management surface. It should become a unified place-information card for detected, saved, and reopened places, always showing the real place identity and a `留下足迹` entry point, while saved-place history rows and `再记一次去访` are removed from this popup surface. [VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md`; VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.vue`]

The highest-risk technical detail is DATE-05: the dialog must snapshot the resolved place payload at open time. The current implementation emits date payload from an inline form and then `LeafletMapStage.vue` reads the current `summarySurfaceState`; that is vulnerable to wrong-place writes if the active map selection changes before submit. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.vue`]

**Primary recommendation:** Keep `LeafletMapStage.vue` as the interaction controller, refactor `PointSummaryCard.vue` into a pure place-card CTA, add `FootprintDateDialog.vue` as a controlled sibling of `MapContextPopup`, and submit via a frozen `FootprintPlaceSnapshot`. [VERIFIED: codebase grep; CITED: https://www.reka-ui.com/docs/components/dialog]

## Project Constraints (from AGENTS.md)

- User-facing communication must remain Chinese unless the user explicitly asks otherwise. [VERIFIED: `AGENTS.md`]
- Before implementation, the agent should briefly explain planned operations. [VERIFIED: `AGENTS.md`]
- Code edits should be minimal and follow existing project structure and style. [VERIFIED: `AGENTS.md`]
- GSD workflow delegation is explicitly authorized when the workflow needs subagents, but this research was completed inline. [VERIFIED: `AGENTS.md`]
- If subagents are used later, wait for their results instead of taking over while they run. [VERIFIED: `AGENTS.md`]
- Completion notes should summarize changes, impact, and validation in Chinese. [VERIFIED: `AGENTS.md`]
- No project-local `.codex/skills` or `.agents/skills` directories exist, so no additional project skill rules apply. [VERIFIED: `find .codex/skills`; VERIFIED: `find .agents/skills`]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Leaflet click recognition and popup anchoring | Browser / Client | API / Backend | Client owns click, Leaflet state, popup anchoring, pending markers; backend owns canonical resolve and confirm APIs. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `apps/web/src/services/api/canonical-places.ts`] |
| Unified place-information popup | Browser / Client | — | This is presentational state derived from `SummarySurfaceState`; no backend contract change is required. [VERIFIED: `apps/web/src/types/map-point.ts`] |
| Footprint date dialog | Browser / Client | API / Backend | Client owns Dialog/Calendar, shortcut selection, snapshot lock, validation; backend receives the existing record create payload. [VERIFIED: `apps/web/src/services/api/records.ts`; CITED: https://www.shadcn-vue.com/docs/components/calendar] |
| Travel record creation | API / Backend | Browser / Client | Backend remains authoritative for persisted records; client uses optimistic pending records and rollback. [VERIFIED: `apps/web/src/stores/map-points.ts`; VERIFIED: `apps/web/src/services/api/records.ts`] |
| Map-route sidebar visual restoration | Browser / Client | CDN / Static assets | Sidebar is route shell UI using local assets; Phase 44 must not change app navigation semantics. [VERIFIED: `apps/web/src/components/shell/ShellSidebar.vue`; VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md`] |
| Star / footprint marker visuals | Browser / Client | Static assets | Saved/draft markers are DOM/CSS or Leaflet SVG-rendered layers; no backend state change is required. [VERIFIED: `apps/web/src/components/SeedMarkerLayer.vue`; CITED: https://leafletjs.com/reference] |

## Standard Stack

### Core

| Library | Project Version | Registry Latest | Purpose | Why Standard |
|---------|-----------------|-----------------|---------|--------------|
| Vue | `^3.5.32` installed; latest `3.5.34` published 2026-05-06 | `3.5.34` | Component model and Composition API. | Existing app is Vue SFCs with `<script setup lang="ts">`; do not introduce another UI framework. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry] |
| Pinia | `^3.0.4`; latest `3.0.4` published 2025-11-05 | `3.0.4` | Map/auth store state. | Existing map records, pending IDs, and auth status live in Pinia stores. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry; VERIFIED: `apps/web/src/stores/map-points.ts`] |
| Leaflet | `^1.9.4`; latest stable dist-tag `1.9.4` published 2023-05-18 | `1.9.4` | Interactive map and pending marker. | Phase requires preserving Leaflet recognition chain; `CircleMarker` supports fixed-pixel marker radius and SVG class names. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry; CITED: https://leafletjs.com/reference] |
| shadcn-vue local Dialog | generated in `apps/web/src/components/ui/dialog` | Context7 ID `/unovue/shadcn-vue` | Standalone footprint modal shell. | Project already generated Dialog primitives and shadcn-vue docs use Dialog parts for modal content. [VERIFIED: `apps/web/src/components/ui/dialog/index.ts`; CITED: Context7 `/unovue/shadcn-vue`; CITED: https://www.shadcn-vue.com/docs/components/dialog] |
| shadcn-vue local Calendar | generated in `apps/web/src/components/ui/calendar` | Context7 ID `/unovue/shadcn-vue` | Calendar date selection. | Project already generated Calendar, and docs state it is backed by Reka UI Calendar with `@internationalized/date`. [VERIFIED: `apps/web/src/components/ui/calendar/Calendar.vue`; CITED: Context7 `/unovue/shadcn-vue`; CITED: https://www.shadcn-vue.com/docs/components/calendar] |
| Reka UI | `2.9.7`; latest `2.9.7` published 2026-05-05 | `2.9.7` | Dialog and Calendar primitive behavior. | Generated shadcn-vue components wrap Reka UI; Reka Dialog handles modal focus trapping and keyboard behavior. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry; CITED: https://www.reka-ui.com/docs/components/dialog] |
| `@internationalized/date` | `3.12.1`; latest `3.12.1` published 2026-04-14 | `3.12.1` | Date values and `YYYY-MM-DD` serialization. | Calendar uses `DateValue`; `CalendarDate.toString()` returns ISO date format suitable for backend contract. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry; CITED: https://react-aria.adobe.com/internationalized/date/CalendarDate] |

### Supporting

| Library | Project Version | Purpose | When to Use |
|---------|-----------------|---------|-------------|
| `@floating-ui/dom` | `^1.7.6`; latest `1.7.6` published 2026-03-03 | Anchored map popup positioning. | Keep for `MapContextPopup`; do not use it for the modal date dialog. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry; VERIFIED: `apps/web/src/composables/usePopupAnchoring.ts`] |
| `@vueuse/core` | `^14.3.0`; latest `14.3.0` published 2026-05-01 | Generated primitive helpers and optional media queries. | Use only where existing generated components or local patterns already use it. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry; VERIFIED: `apps/web/src/components/ui/calendar/Calendar.vue`] |
| Vitest | `^4.1.4`; latest `4.1.6` published 2026-05-11 | Unit/component tests. | Update focused tests for popup/dialog/store behavior before full phase gate. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry; VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.spec.ts`] |
| Vue Test Utils | `^2.4.6`; latest `2.4.10` published 2026-04-30 | Vue component mounting. | Use for `FootprintDateDialog`, `PointSummaryCard`, `MapContextPopup`, and `LeafletMapStage` tests. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn-vue Dialog | Existing custom `AuthDialog`/`ConfirmDialog` shell | Existing custom dialogs are business-specific and do not provide the locked Calendar/Dialog composition expected by DATE-01. [VERIFIED: `apps/web/src/components/auth/AuthDialog.vue`; VERIFIED: `apps/web/src/components/timeline/ConfirmDialog.vue`; VERIFIED: `.planning/REQUIREMENTS.md`] |
| shadcn-vue Calendar | Native `<input type="date">` reused from `TripDateForm` | Native date inputs are compact utility fields and conflict with D-10/D-11 requiring a substantial calendar-first dialog. [VERIFIED: `apps/web/src/components/map-popup/TripDateForm.vue`; VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md`] |
| Existing popup record list | `PopupTripRecord` in map popup | Explicitly disallowed by MAP-05 and D-07; keep record management in journal/timeline surfaces. [VERIFIED: `.planning/REQUIREMENTS.md`; VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md`] |

**Installation:**

```bash
# No new package install is recommended for Phase 44.
# Use existing generated primitives and dependencies in apps/web/package.json.
```

**Version verification:** Versions above were verified with `npm view` on 2026-05-13 and cross-checked against `apps/web/package.json`. [VERIFIED: npm registry; VERIFIED: `apps/web/package.json`]

## Architecture Patterns

### System Architecture Diagram

```text
User clicks Leaflet map
  |
  v
LeafletMapStage.vue
  |-- set pending marker / aria status
  |-- resolveCanonicalPlace(lat,lng) ---------------------> API canonical resolve
  |
  +--> resolved place
  |      |
  |      v
  |   map-points store opens detected or saved point
  |      |
  |      v
  |   MapContextPopup + PointSummaryCard
  |      |-- show name/type/region
  |      |-- show disabled reason if not saveable
  |      '-- "留下足迹" click
  |             |
  |             v
  |        LeafletMapStage snapshots place payload
  |             |
  |             v
  |        FootprintDateDialog (Dialog + Calendar)
  |             |-- shortcut date selection
  |             |-- optional end date
  |             '-- submit { startDate, endDate }
  |                    |
  |                    v
  |             mapPointsStore.illuminate(snapshot + dates)
  |                    |
  |                    v
  |             createTravelRecord POST /records ----------> API records backend
  |                    |
  |         success notice / rollback warning / auth handling
```

The diagram preserves the existing API boundaries and moves only the date UI/controller responsibility. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `apps/web/src/stores/map-points.ts`; VERIFIED: `apps/web/src/services/api/records.ts`]

### Recommended Project Structure

```text
apps/web/src/components/
├── LeafletMapStage.vue                 # map orchestration, snapshot controller, dialog owner
├── SeedMarkerLayer.vue                 # CSS/star/footprint marker visual states
├── map-popup/
│   ├── MapContextPopup.vue             # anchored non-modal popup shell
│   ├── PointSummaryCard.vue            # unified place-info card and CTA only
│   └── FootprintDateDialog.vue         # new controlled Dialog + Calendar date UI
└── shell/
    └── ShellSidebar.vue                # map-route visual restoration without nav expansion

apps/web/src/assets/v8/
├── characters/                         # copy only used P0/P1 dialog/sidebar/popup characters
└── pins/                               # copy only used star/footprint pin assets if using images
```

This structure keeps map-specific UI local and follows the existing `map-popup` component boundary. [VERIFIED: codebase grep; VERIFIED: `prd/v8.0/ASSET-MANIFEST.md`]

### Pattern 1: Snapshot Place Payload Before Opening Dialog

**What:** Build a serializable snapshot from the currently resolved point before setting `isFootprintDialogOpen = true`. [VERIFIED: `apps/web/src/types/map-point.ts`]

**When to use:** Every `留下足迹` click from a non-candidate, saveable point. [VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md`]

**Example:**

```ts
// Source: apps/web/src/types/map-point.ts and apps/web/src/stores/map-points.ts
interface FootprintPlaceSnapshot {
  placeId: string
  boundaryId: string
  placeKind: NonNullable<MapPointDisplay['placeKind']>
  datasetVersion: string
  displayName: string
  regionSystem: NonNullable<MapPointDisplay['regionSystem']>
  adminType: NonNullable<MapPointDisplay['adminType']>
  typeLabel: string
  parentLabel: string
  subtitle: string
}

function openFootprintDialog(point: MapPointDisplay) {
  if (!isSaveable(point)) return
  footprintPlaceSnapshot.value = {
    placeId: point.placeId!,
    boundaryId: point.boundaryId!,
    placeKind: point.placeKind!,
    datasetVersion: point.datasetVersion!,
    displayName: point.name,
    regionSystem: point.regionSystem!,
    adminType: point.adminType!,
    typeLabel: point.typeLabel!,
    parentLabel: point.parentLabel!,
    subtitle: point.subtitle ?? point.cityContextLabel ?? '',
  }
  isFootprintDialogOpen.value = true
}
```

### Pattern 2: Use CalendarDate Serialization for Backend Contract

**What:** Keep dialog model as `DateValue | null`, then submit `date.toString()` for the `YYYY-MM-DD` API contract. `CalendarDate.toString()` is documented to return ISO 8601 date text. [CITED: https://react-aria.adobe.com/internationalized/date/CalendarDate]

**When to use:** Shortcut buttons and calendar date selection. [CITED: https://www.shadcn-vue.com/docs/components/calendar]

**Example:**

```ts
// Source: shadcn-vue Calendar docs and React Aria CalendarDate docs
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone, today } from '@internationalized/date'

const selectedDate = ref<DateValue | null>(today(getLocalTimeZone()))

function buildDatePayload() {
  return {
    startDate: selectedDate.value?.toString() ?? null,
    endDate: optionalEndDate.value?.toString() ?? null,
  }
}
```

### Pattern 3: Controlled Dialog With Explicit Submit Lifecycle

**What:** Use `v-model:open` so the parent can keep dialog open during submit, show errors, and close only after success or cancel. [CITED: https://www.reka-ui.com/docs/components/dialog]

**When to use:** Footprint date dialog submit/cancel/close paths. [VERIFIED: `.planning/REQUIREMENTS.md`]

**Example:**

```vue
<!-- Source: shadcn-vue Dialog docs and local components/ui/dialog -->
<Dialog v-model:open="isFootprintDialogOpen">
  <DialogContent class="max-w-[920px]" @escape-key-down="handleDialogEscape">
    <DialogHeader>
      <DialogTitle>留下足迹</DialogTitle>
      <DialogDescription>
        {{ footprintPlaceSnapshot?.displayName }}
      </DialogDescription>
    </DialogHeader>
    <Calendar v-model="selectedDate" layout="month-and-year" />
  </DialogContent>
</Dialog>
```

### Anti-Patterns to Avoid

- **Reading active point on submit:** This can save to the wrong place after map selection changes; submit from the frozen snapshot instead. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`]
- **Keeping `PopupTripRecord` in popup:** MAP-05 and D-07 explicitly remove past trip lists from the map popup. [VERIFIED: `.planning/REQUIREMENTS.md`; VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md`]
- **Replacing Leaflet or canonical resolve:** MAP-01 requires preserving the current Leaflet recognition chain. [VERIFIED: `.planning/REQUIREMENTS.md`]
- **Using image-only dialog/date UI:** The cutting guide says date numbers, calendars, buttons, and text must remain real UI, not baked into PNGs. [VERIFIED: `prd/v8.0/CUTTING-GUIDE.md`]
- **Letting unsupported places open the dialog:** D-19 requires disabled CTA and inline reason for recognized but non-saveable places. [VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md`]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal focus trap and keyboard semantics | Custom `div role="dialog"` modal with manual trap | shadcn-vue Dialog / Reka Dialog | Reka Dialog supports modal focus trap, controlled state, screen reader title/description, and Esc behavior. [CITED: https://www.reka-ui.com/docs/components/dialog] |
| Calendar grid/date model | Manual month grid and date math | shadcn-vue Calendar + `@internationalized/date` | Calendar already uses Reka UI and `@internationalized/date`; `CalendarDate.toString()` provides API-ready ISO dates. [CITED: https://www.shadcn-vue.com/docs/components/calendar; CITED: https://react-aria.adobe.com/internationalized/date/CalendarDate] |
| Map recognition | Custom point-in-polygon rewrite or new map library | Existing Leaflet + canonical API flow | Requirement MAP-01 locks the Leaflet chain; current code already handles resolve, confirm, pending marker, and shard loading. [VERIFIED: `.planning/REQUIREMENTS.md`; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`] |
| Record write lifecycle | New local save path | `mapPointsStore.illuminate` | Store already handles optimistic records, pending place IDs, API replacement, rollback, unauthorized handling, and notices. [VERIFIED: `apps/web/src/stores/map-points.ts`] |
| Whole-page screenshot implementation | Full design PNG as UI | Real DOM plus selected transparent assets | v8 asset guide explicitly says UI/code should restore controls while transparent assets carry illustrations/stickers. [VERIFIED: `prd/v8.0/ASSET-MANIFEST.md`; VERIFIED: `prd/v8.0/CUTTING-GUIDE.md`] |

**Key insight:** The deceptive complexity is not drawing a date picker; it is preserving map identity, auth/session boundaries, optimistic writes, and focus semantics while the user can continue interacting with the map. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `apps/web/src/stores/map-points.ts`; CITED: https://www.reka-ui.com/docs/components/dialog]

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | Travel records already store `placeId`, `boundaryId`, canonical metadata, `startDate`, and `endDate`; Phase 44 does not change the backend shape. [VERIFIED: `apps/web/src/stores/map-points.ts`; VERIFIED: `apps/web/src/services/api/records.ts`] | No data migration; keep API payload shape. [VERIFIED: `.planning/REQUIREMENTS.md`] |
| Live service config | None found for this UI-only phase; canonical and records services are existing API calls in source. [VERIFIED: `apps/web/src/services/api/canonical-places.ts`; VERIFIED: `apps/web/src/services/api/records.ts`] | None. |
| OS-registered state | None found; phase affects Vue components/assets/tests only. [VERIFIED: codebase grep; VERIFIED: `.planning/ROADMAP.md`] | None. |
| Secrets/env vars | No new secrets or env vars are required; existing API client/session flow is reused. [VERIFIED: `apps/web/src/services/api/client.ts`; VERIFIED: `apps/web/src/stores/auth-session.ts`] | None. |
| Build artifacts | No generated build artifact needs migration; new assets may be copied under `apps/web/src/assets/v8`. [VERIFIED: `prd/v8.0/ASSET-MANIFEST.md`; VERIFIED: `find apps/web/src/assets/v8`] | Copy only selected assets and update imports if visual plan uses them. |

## Common Pitfalls

### Pitfall 1: Snapshot Race

**What goes wrong:** User opens the date dialog for Place A, clicks another map location, then submits and record is saved to Place B. [VERIFIED: current submit reads `summarySurfaceState` in `LeafletMapStage.vue`]  
**Why it happens:** Inline form currently emits only dates, and parent reads active map state at submit time. [VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.vue`; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`]  
**How to avoid:** Store a frozen `FootprintPlaceSnapshot` before opening Dialog and submit from that snapshot. [VERIFIED: `apps/web/src/types/map-point.ts`]  
**Warning signs:** Tests still emit only `{ startDate, endDate }` from the popup and assert current active point state after submit. [VERIFIED: `apps/web/src/components/LeafletMapStage.spec.ts`]

### Pitfall 2: Saved Popup Remains a History Panel

**What goes wrong:** Saved place popup still renders `PopupTripRecord`, latest rows, edit/delete affordances, or `再记一次去访`. [VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.vue`]  
**Why it happens:** Existing Phase 27/37 tests encode the old behavior. [VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.spec.ts`; VERIFIED: `apps/web/src/components/LeafletMapStage.spec.ts`]  
**How to avoid:** Replace saved-state content with concise saved-footprint status plus the same `留下足迹` CTA; move trip history responsibility to journal/timeline. [VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md`]  
**Warning signs:** `data-region="popup-records"`, `PopupTripRecord`, or `data-record-again` still appears in `PointSummaryCard.vue`. [VERIFIED: codebase grep]

### Pitfall 3: Disabled Unsupported Places Without Explanation

**What goes wrong:** CTA disables but users do not know why, or the disabled reason still says `点亮`. [VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.vue`; VERIFIED: `apps/web/src/constants/overseas-support.ts`]  
**Why it happens:** Existing copy predates Phase 43/44 terminology and uses `点亮` in some store/error paths. [VERIFIED: codebase grep]  
**How to avoid:** Use `留下足迹` copy consistently and render inline reason text near the CTA for non-saveable canonical/detected places. [VERIFIED: `.planning/REQUIREMENTS.md`; VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md`]  
**Warning signs:** User can click a non-saveable place into the dialog or sees no reason next to disabled CTA. [VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md`]

### Pitfall 4: Calendar Emits Non-Contract Date Values

**What goes wrong:** Submit sends `Date`, localized text, or timezone-shifted values instead of `YYYY-MM-DD`. [CITED: https://react-aria.adobe.com/internationalized/date/CalendarDate]  
**Why it happens:** Mixing native `Date` formatting with all-day travel dates can introduce locale/timezone concerns. [CITED: https://react-aria.adobe.com/internationalized/date/CalendarDate]  
**How to avoid:** Keep all-day selection as `DateValue` / `CalendarDate` and call `.toString()` for API payload. [CITED: https://react-aria.adobe.com/internationalized/date/CalendarDate]  
**Warning signs:** Code uses `toLocaleDateString()`, `new Date().toISOString().slice(0, 10)`, or localized strings for submit payload. [ASSUMED]

### Pitfall 5: Dialog Focus Regression

**What goes wrong:** Opening/closing the date dialog loses focus, traps focus with no focusable element, or does not announce context. [CITED: https://www.reka-ui.com/docs/components/dialog]  
**Why it happens:** Custom modal wrappers often omit labels, close buttons, or trigger focus return. [CITED: https://www.reka-ui.com/docs/components/dialog]  
**How to avoid:** Use `DialogTitle`, `DialogDescription`, a visible or labelled close/cancel control, and tests for Esc/cancel/submit focus flow. [CITED: https://www.reka-ui.com/docs/components/dialog]  
**Warning signs:** `DialogContent` is rendered without `DialogTitle`, close button `aria-label`, or `v-model:open`. [VERIFIED: `apps/web/src/components/ui/dialog/DialogContent.vue`; CITED: https://www.reka-ui.com/docs/components/dialog]

## Code Examples

### Dialog Submit From Snapshot

```ts
// Source: apps/web/src/stores/map-points.ts existing illuminate payload shape
async function submitFootprintDate(payload: { startDate: string | null; endDate: string | null }) {
  const snapshot = footprintPlaceSnapshot.value
  if (!snapshot || isFootprintSubmitting.value) return

  isFootprintSubmitting.value = true
  try {
    await mapPointsStore.illuminate({
      ...snapshot,
      startDate: payload.startDate,
      endDate: payload.endDate,
    })
    isFootprintDialogOpen.value = false
    footprintPlaceSnapshot.value = null
  } finally {
    isFootprintSubmitting.value = false
  }
}
```

### Fixed Shortcut Dates

```ts
// Source: @internationalized/date docs via shadcn-vue Calendar examples
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone, today } from '@internationalized/date'

const todayValue = today(getLocalTimeZone())

const shortcuts: Array<{ label: string; value: DateValue | 'custom' }> = [
  { label: '今天', value: todayValue },
  { label: '明天', value: todayValue.add({ days: 1 }) },
  { label: '本周末', value: todayValue.add({ days: (6 - todayValue.toDate(getLocalTimeZone()).getDay() + 7) % 7 }) },
  { label: '其他日期', value: 'custom' },
]
```

The weekend calculation should be unit-tested because weekday conventions are easy to misread. [ASSUMED]

### Unified Popup CTA Contract

```vue
<!-- Source: Phase 44 CONTEXT D-05 through D-08 -->
<button
  type="button"
  data-footprint-entry
  :disabled="isPending || !isIlluminatable"
  :aria-describedby="!isIlluminatable ? unavailableReasonId : undefined"
  @click="emit('leaveFootprint')"
>
  留下足迹
</button>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline native date form in map popup | Full Dialog + visible Calendar + shortcuts | Phase 44 locked by CONTEXT on 2026-05-13 | Planner should create a new dialog component and remove inline `TripDateForm` from popup. [VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md`; VERIFIED: `apps/web/src/components/map-popup/TripDateForm.vue`] |
| Saved popup as trip history/edit surface | Saved popup as unified place card with same `留下足迹` entry | Phase 44 locked by CONTEXT on 2026-05-13 | Planner must delete/retire popup record-list tests and keep history in later journal surfaces. [VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md`; VERIFIED: `apps/web/src/components/map-popup/PointSummaryCard.spec.ts`] |
| `点亮` / `已点亮` / `再记一次去访` map language | `留下足迹` as the fixed entry label | Phase 43 copy migration plus Phase 44 popup decision | Remaining map/store strings need targeted copy cleanup. [VERIFIED: `.planning/STATE.md`; VERIFIED: codebase grep] |
| Submit date against current active point | Submit against snapshot captured at dialog open | Phase 44 DATE-05 | Prevents wrong-place writes during map interaction. [VERIFIED: `.planning/REQUIREMENTS.md`] |

**Deprecated/outdated:**
- `TripDateForm` as popup inline UI is deprecated for map creation flow, but its payload contract and validation tests are still useful references. [VERIFIED: `apps/web/src/components/map-popup/TripDateForm.vue`; VERIFIED: `.planning/REQUIREMENTS.md`]
- `PopupTripRecord` in map popup is deprecated for Phase 44, but it may remain reusable for journal/timeline surfaces if referenced elsewhere. [VERIFIED: `apps/web/src/components/map-popup/PopupTripRecord.vue`; VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md`]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Avoid localized/native `Date` strings for API payload unless converted back to `YYYY-MM-DD`. | Common Pitfalls | Medium: backend contract could receive invalid dates or timezone-shifted strings. |
| A2 | Weekend shortcut maps to the upcoming Saturday in the user's local timezone for Phase 44. | Code Examples | Resolved: D-13 says single-day first, and the plans implement `本周末` as one selected Saturday with optional end date left manual. |

## Open Questions (RESOLVED)

1. **RESOLVED: Which P0 map/dialog assets are usable without extra image processing?**
   - What we know: `ASSET-MANIFEST.md` lists `char-map-popup-girl`, `char-footprint-dialog-girl`, `char-sidebar-camera`, and star pins as P0; current app assets only include landing/shell assets. [VERIFIED: `prd/v8.0/ASSET-MANIFEST.md`; VERIFIED: `find apps/web/src/assets/v8`]
   - Previously unclear: Whether existing `prd/v8.0/切图` files already map cleanly to those semantic assets or require manual transparent cleanup. [VERIFIED: `find prd/v8.0/切图`]
   - Recommendation: Planner should include a small asset-selection task before UI polish and allow CSS/SVG marker fallback only if cut assets are not clean enough. [VERIFIED: `prd/v8.0/CUTTING-GUIDE.md`]
   - Resolution: Use the local asset `/images/two-characters-motorcycle.png` as the P0 visual asset choice reflected by the plans. No additional manual transparent cleanup decision remains open.

2. **RESOLVED: Should `本周末` submit Saturday only or a Saturday-Sunday range?**
   - What we know: D-13 says single-day first; D-15 allows optional end date when needed. [VERIFIED: `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md`]
   - Previously unclear: Exact product semantics for the weekend shortcut. [ASSUMED]
   - Recommendation accepted for Phase 44: Use upcoming Saturday as the selected single day and keep optional end date manual. [ASSUMED]
   - Resolution: `本周末` means the upcoming Saturday from the dialog opening date, submitted as the single `startDate`; optional `endDate` remains manual.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Vite/Vitest execution | ✓ | `v22.22.1` | — [VERIFIED: `node --version`] |
| pnpm | Project scripts | Partial | Declared `pnpm@10.33.0`; `pnpm --version` failed with fetch error in restricted sandbox | Use approved escalation for package-manager commands if needed. [VERIFIED: `package.json`; VERIFIED: `pnpm --version`] |
| Turbo | Root scripts | ✓ | `2.9.6` from `npx turbo --version`; package declares `^2.9.6` | Use `pnpm --filter @trip-map/web ...` if turbo unavailable. [VERIFIED: `npx turbo --version`; VERIFIED: `package.json`] |
| Context7 CLI | Library docs lookup | ✓ with escalated network | Resolved `/unovue/shadcn-vue`; docs fetched for Dialog/Calendar | Official web docs already cross-checked. [VERIFIED: `npx --yes ctx7@latest library`; VERIFIED: `npx --yes ctx7@latest docs`] |
| npm registry | Version verification | ✓ | Registry reachable for `npm view` | Use package lock/package.json if registry unavailable. [VERIFIED: npm registry] |

**Missing dependencies with no fallback:** None identified for planning. [VERIFIED: environment probes]

**Missing dependencies with fallback:** `pnpm --version` was blocked by fetch in the sandbox; implementation should rerun package commands with approval if the same error appears. [VERIFIED: `pnpm --version`]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `^4.1.4` installed; registry latest `4.1.6`. [VERIFIED: `apps/web/package.json`; VERIFIED: npm registry] |
| Config file | No separate Vitest config found; Vite config is `apps/web/vite.config.ts`. [VERIFIED: `apps/web/vite.config.ts`; VERIFIED: `rg --files`] |
| Quick run command | `pnpm --filter @trip-map/web test -- LeafletMapStage PointSummaryCard FootprintDateDialog` [VERIFIED: `apps/web/package.json`] |
| Full suite command | `pnpm --filter @trip-map/web test` and phase gate `pnpm --filter @trip-map/web build` [VERIFIED: `apps/web/package.json`] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| MAP-01 | Leaflet click resolve flow still opens real place popup | component/integration | `pnpm --filter @trip-map/web test -- LeafletMapStage` | ✅ `apps/web/src/components/LeafletMapStage.spec.ts` [VERIFIED] |
| MAP-02 | saved/draft markers render star/footprint visual states and reduced motion | component/CSS contract | `pnpm --filter @trip-map/web test -- SeedMarkerLayer` | ✅ `apps/web/src/components/SeedMarkerLayer.spec.ts` [VERIFIED] |
| MAP-03 | popup shows name/type/region and fixed `留下足迹` entry | component | `pnpm --filter @trip-map/web test -- PointSummaryCard MapContextPopup` | ✅ update existing files [VERIFIED] |
| MAP-04 | popup CTA opens independent dialog and no inline form | component/integration | `pnpm --filter @trip-map/web test -- LeafletMapStage FootprintDateDialog` | ❌ `FootprintDateDialog.spec.ts` needed [VERIFIED: rg] |
| MAP-05 | saved popup does not render `PopupTripRecord` or `data-record-again` | component | `pnpm --filter @trip-map/web test -- PointSummaryCard` | ✅ update existing file [VERIFIED] |
| MAP-06 | network/auth/unavailable/saving states are visible | component/store | `pnpm --filter @trip-map/web test -- LeafletMapStage map-points` | ✅ update existing files [VERIFIED] |
| DATE-01 | Dialog/Calendar primitives render and interact | component | `pnpm --filter @trip-map/web test -- FootprintDateDialog` | ❌ needed [VERIFIED: rg] |
| DATE-02 | dialog displays snapshot place name/type/region and visual prompt area | component | `pnpm --filter @trip-map/web test -- FootprintDateDialog` | ❌ needed [VERIFIED: rg] |
| DATE-03 | shortcuts select today/tomorrow/weekend/custom | unit/component | `pnpm --filter @trip-map/web test -- FootprintDateDialog` | ❌ needed [VERIFIED: rg] |
| DATE-04 | submit emits `{ startDate, endDate }` as `YYYY-MM-DD` | unit/component | `pnpm --filter @trip-map/web test -- FootprintDateDialog` | ❌ needed [VERIFIED: rg] |
| DATE-05 | changing active map point after opening dialog does not change submit target | integration | `pnpm --filter @trip-map/web test -- LeafletMapStage` | ✅ update existing file [VERIFIED] |
| DATE-06 | cancel/close/submit states preserve focus and accessibility labels | component | `pnpm --filter @trip-map/web test -- FootprintDateDialog` | ❌ needed [VERIFIED: rg] |

### Sampling Rate

- **Per task commit:** `pnpm --filter @trip-map/web test -- PointSummaryCard FootprintDateDialog` once dialog exists. [VERIFIED: `apps/web/package.json`]
- **Per wave merge:** `pnpm --filter @trip-map/web test -- LeafletMapStage PointSummaryCard MapContextPopup SeedMarkerLayer FootprintDateDialog map-points`. [VERIFIED: current spec inventory]
- **Phase gate:** `pnpm --filter @trip-map/web test` plus `pnpm --filter @trip-map/web build`. [VERIFIED: `apps/web/package.json`]

### Wave 0 Gaps

- [ ] `apps/web/src/components/map-popup/FootprintDateDialog.vue` — new Dialog/Calendar component for DATE-01 through DATE-06. [VERIFIED: rg]
- [ ] `apps/web/src/components/map-popup/FootprintDateDialog.spec.ts` — shortcut, payload, accessibility, submit/close state coverage. [VERIFIED: rg]
- [ ] Update `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` — remove old popup-history and inline-form expectations. [VERIFIED: current tests]
- [ ] Update `apps/web/src/components/LeafletMapStage.spec.ts` — add snapshot race regression and independent dialog integration. [VERIFIED: current tests]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | Keep auth gating through `auth-session` and do not write records while anonymous. [VERIFIED: `apps/web/src/stores/auth-session.ts`; VERIFIED: `apps/web/src/components/LeafletMapStage.spec.ts`] |
| V3 Session Management | yes | Preserve `boundaryVersionAtStart` checks in `mapPointsStore.illuminate` to avoid applying stale writes after session changes. [VERIFIED: `apps/web/src/stores/map-points.ts`] |
| V4 Access Control | yes | Do not bypass backend authoritative save requirements; disable unsupported places before dialog. [VERIFIED: `.planning/REQUIREMENTS.md`; VERIFIED: `apps/web/src/components/LeafletMapStage.vue`] |
| V5 Input Validation | yes | Keep date validation client-side and rely on backend contract for persisted record creation; output only `YYYY-MM-DD` or `null`. [VERIFIED: `apps/web/src/components/map-popup/TripDateForm.vue`; VERIFIED: `apps/web/src/services/api/records.ts`] |
| V6 Cryptography | no | No cryptography changes in this phase. [VERIFIED: `.planning/ROADMAP.md`] |

### Known Threat Patterns for Vue Map/Dialog Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Wrong-place record write from mutable active state | Tampering | Snapshot resolved place payload before dialog opens and submit from snapshot. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`] |
| Unauthorized record creation | Elevation of Privilege | Check authenticated session before calling `mapPointsStore.illuminate`; preserve backend `POST /records` authorization. [VERIFIED: `apps/web/src/components/LeafletMapStage.vue`; VERIFIED: `apps/web/src/stores/map-points.ts`] |
| XSS through place names/subtitles | Tampering | Use Vue interpolation for place text; current popup tests assert escaped title content. [VERIFIED: `apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts`] |
| Focus trap with no accessible escape | Denial of Service / Accessibility | Use Reka Dialog with labelled close/cancel and tests for Esc/cancel. [CITED: https://www.reka-ui.com/docs/components/dialog] |

## Sources

### Primary (HIGH confidence)

- `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-CONTEXT.md` — locked Phase 44 decisions, discretion, deferred scope. [VERIFIED]
- `.planning/REQUIREMENTS.md` — MAP-01 through MAP-06 and DATE-01 through DATE-06. [VERIFIED]
- `.planning/STATE.md` and `.planning/ROADMAP.md` — Phase 43 completion and Phase 44 dependency context. [VERIFIED]
- `apps/web/src/components/LeafletMapStage.vue` — recognition, popup, auth, save orchestration. [VERIFIED]
- `apps/web/src/components/map-popup/PointSummaryCard.vue` — current inline form and saved history behavior. [VERIFIED]
- `apps/web/src/stores/map-points.ts` — record write lifecycle and pending state. [VERIFIED]
- `apps/web/src/components/ui/dialog/*` and `apps/web/src/components/ui/calendar/*` — local generated primitives. [VERIFIED]
- Context7 `/unovue/shadcn-vue` — Dialog/Calendar patterns. [VERIFIED: Context7 CLI]
- shadcn-vue Dialog docs — component structure and usage. [CITED: https://www.shadcn-vue.com/docs/components/dialog]
- shadcn-vue Calendar docs — Calendar built on Reka UI and `@internationalized/date`. [CITED: https://www.shadcn-vue.com/docs/components/calendar]
- Reka Dialog docs — focus trap, controlled state, title/description, keyboard interactions. [CITED: https://www.reka-ui.com/docs/components/dialog]
- React Aria CalendarDate docs — `CalendarDate.toString()` ISO date serialization. [CITED: https://react-aria.adobe.com/internationalized/date/CalendarDate]
- Leaflet reference — `CircleMarker` fixed pixel radius and class/style options. [CITED: https://leafletjs.com/reference]
- npm registry — package versions and publish times. [VERIFIED: npm registry]

### Secondary (MEDIUM confidence)

- `prd/v8.0/ASSET-MANIFEST.md` and `prd/v8.0/CUTTING-GUIDE.md` — asset priorities and slice-vs-DOM rules. [VERIFIED: local docs]

### Tertiary (LOW confidence)

- None used as authoritative implementation guidance. [VERIFIED: sources audit]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — packages and local generated primitives were verified through `package.json`, npm registry, Context7, official docs, and source files. [VERIFIED]
- Architecture: HIGH — the relevant controller/store/component boundaries are explicit in current code. [VERIFIED]
- Pitfalls: HIGH for popup/history/snapshot/auth risks; `本周末` semantics are resolved for Phase 44 as upcoming Saturday from the dialog opening date. [VERIFIED; ASSUMED]

**Research date:** 2026-05-13  
**Valid until:** 2026-06-12 for codebase architecture; 2026-05-20 for package/doc currency because Vue/Reka/shadcn-vue are active. [ASSUMED]
