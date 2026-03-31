---
phase: 14-leaflet
plan: 02
subsystem: ui
tags: [leaflet, vue3, geojson, floating-ui, popup-anchor, shard-loading]

requires:
  - phase: 14-leaflet
    plan: 01
    provides: useLeafletMap, useGeoJsonLayers, useLeafletPopupAnchor composables

provides:
  - LeafletMapStage.vue: Leaflet-based map stage replacing WorldMapStage with full click->resolve->popup->drawer->highlight chain
  - App.vue updated to render LeafletMapStage

affects:
  - 14-03 (LeafletMapStage.spec.ts behavioral tests consume LeafletMapStage)
  - End user: sees Leaflet tile map in place of old SVG world map

tech-stack:
  added: []
  patterns:
    - Dual-path shard loading: preloadSavedBoundaryShards (saved boundaries on map ready) + on-demand via loadedShardKeys Set (unsaved boundaries after resolve)
    - handleBoundaryClick opens saved popup directly without server resolve (D-12 shortcut)
    - L.circleMarker pending marker during recognition (D-11)
    - @floating-ui VirtualElement anchored via useLeafletPopupAnchor (D-14)
    - x/y set to 0 in DraftMapPoint (NormalizedPoint no longer meaningful in Leaflet mode)

key-files:
  created:
    - apps/web/src/components/LeafletMapStage.vue
  modified:
    - apps/web/src/App.vue

key-decisions:
  - "x/y in DraftMapPoint set to 0 since NormalizedPoint coordinates have no semantic meaning in Leaflet mode — lat/lng from API response is the authoritative position"
  - "isRecognizing not exposed in template — removed from storeToRefs extraction since pending marker animation is CSS-only via L.circleMarker className"
  - "handleBoundaryClick reconstructs a minimal DraftMapPoint from the saved point display data to call openSavedPointForPlaceOrStartDraft which handles reuse vs new-draft logic"

metrics:
  duration: "6min"
  completed: "2026-03-31"
  tasks: 2
  files: 2
---

# Phase 14 Plan 02: LeafletMapStage Summary

**LeafletMapStage.vue built as full Leaflet map component replacing WorldMapStage, wiring all three Plan 01 composables with complete click->resolve->popup->drawer->highlight main flow and dual-path GeoJSON shard loading**

## Performance

- **Duration:** ~6 min
- **Completed:** 2026-03-31
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `LeafletMapStage.vue` (746 lines) with full business logic ported from WorldMapStage: recognition sequence debounce, `buildCanonicalDraftPoint`, `buildPendingCanonicalDraft`, `applyResolvedPlace`, `handleConfirmCandidate`, `handleConfirmDestructive`
- Implemented dual-path GeoJSON shard loading: `preloadSavedBoundaryShards` (D-07/D-08, on map ready) and on-demand via `loadedShardKeys` Set (D-06, after resolve/confirm)
- Pending `L.circleMarker` created on map click, removed after resolve completes (D-11)
- Popup anchoring via `useLeafletPopupAnchor` -> `virtualElement` -> `usePopupAnchoring` floating-ui chain, with `popupLatLng` updated on click/resolve/boundary-click (D-14)
- `handleBoundaryClick` finds saved point matching boundary and reopens directly without server round-trip (D-12)
- App.vue updated to import and render `LeafletMapStage` instead of `WorldMapStage`; WorldMapStage.vue preserved as reference
- vue-tsc --noEmit passes with zero errors

## Task Commits

1. **Task 1: Build LeafletMapStage.vue** - `3d8c391` (feat)
2. **Task 2: Wire LeafletMapStage into App.vue** - `566a72d` (feat)

## Files Created/Modified

- `apps/web/src/components/LeafletMapStage.vue` - Leaflet map stage, full main flow, dual-path shard loading, pending marker, popup anchoring
- `apps/web/src/App.vue` - import and render LeafletMapStage instead of WorldMapStage

## Decisions Made

- **NormalizedPoint x/y = 0**: DraftMapPoint still has `x: number; y: number` fields (from BaseMapPoint), but in Leaflet mode these have no semantic meaning. Set to 0 since lat/lng from API response is the authoritative position.
- **isRecognizing removed from storeToRefs**: Pending marker animation is pure CSS via `className: 'pending-marker--recognizing'` on L.circleMarker. No reactive binding to `isRecognizing` needed in the component.
- **handleBoundaryClick strategy**: Reconstructs a DraftMapPoint from the saved point's display data to call `openSavedPointForPlaceOrStartDraft`, which correctly handles the reuse-vs-draft decision and avoids duplicate server calls.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all data flows are wired. The `x: 0, y: 0` in DraftMapPoint is intentional and documented (see key-decisions), not a stub — downstream consumers use `lat/lng` not `x/y` for Leaflet positioning.

---
*Phase: 14-leaflet*
*Completed: 2026-03-31*

## Self-Check: PASSED

- FOUND: apps/web/src/components/LeafletMapStage.vue
- FOUND: apps/web/src/App.vue (contains LeafletMapStage, no WorldMapStage)
- FOUND: WorldMapStage.vue preserved
- Commit 3d8c391: verified
- Commit 566a72d: verified
- vue-tsc --noEmit: PASSED
