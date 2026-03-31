---
phase: 14-leaflet
plan: 01
subsystem: ui
tags: [leaflet, vue3, vitest, composables, geojson, floating-ui, bing-maps, cartocdn]

requires:
  - phase: 13-行政区数据与几何交付
    provides: geometry-loader.ts shard loader and geometry-manifest.ts service

provides:
  - useLeafletMap composable: L.map lifecycle with Bing CanvasLight primary tile and CartoDB Positron fallback
  - useGeoJsonLayers composable: CN + OVERSEAS independent GeoJSON layer management with three-state styling
  - useLeafletPopupAnchor composable: Leaflet latLng to @floating-ui VirtualElement bridge

affects:
  - 14-02 (LeafletMapStage component consumes all three composables)
  - 14-03 (popup anchoring integration depends on useLeafletPopupAnchor)

tech-stack:
  added:
    - leaflet 1.9.4
    - "@types/leaflet 1.9.21"
  patterns:
    - Leaflet composable isolation pattern (all L.* API usage in composables, not in component templates)
    - TDD for Leaflet with vi.mock('leaflet') to avoid happy-dom canvas/SVG issues
    - server.deps.inline leaflet in vitest.config.ts to prevent CSS import failures

key-files:
  created:
    - apps/web/src/composables/useLeafletMap.ts
    - apps/web/src/composables/useGeoJsonLayers.ts
    - apps/web/src/composables/useLeafletPopupAnchor.ts
    - apps/web/src/composables/useLeafletMap.spec.ts
    - apps/web/src/composables/useGeoJsonLayers.spec.ts
    - apps/web/src/composables/useLeafletPopupAnchor.spec.ts
  modified:
    - apps/web/package.json
    - pnpm-lock.yaml
    - apps/web/vitest.config.ts
    - apps/web/src/main.ts

key-decisions:
  - "useGeoJsonLayers creates two separate L.geoJSON instances (cnLayer/overseasLayer) — not merged — per GEOX-05 requirement"
  - "Bing Maps CanvasLight integration via REST Metadata API (no third-party plugin), with CartoDB Positron silent fallback when VITE_BING_MAPS_KEY absent"
  - "Style function closes over Ref values via buildStyleFunction helper; style refresh triggered explicitly via watch + setStyle call (Leaflet style functions are not reactive)"
  - "useLeafletPopupAnchor registers map move/zoom listeners imperatively (not via autoUpdate) to handle Leaflet pan/zoom which does not trigger DOM scroll/resize events"

patterns-established:
  - "Leaflet isolation: all L.* calls inside composables, LeafletMapStage consumes abstractions"
  - "Vitest Leaflet mock: vi.mock('leaflet', () => ({ default: { ... } })) in each spec file"
  - "Three-state GeoJSON styling: selected (pink rgba 244,143,177), saved (blue rgba 132,199,216), unrecorded (opacity 0)"

requirements-completed: [GEOX-05, MAP-04, MAP-06, UIX-01]

duration: 4min
completed: 2026-03-31
---

# Phase 14 Plan 01: Leaflet Foundation Summary

**Leaflet 1.9 installed with three composables isolating all map API: useLeafletMap (L.map lifecycle + Bing/CartoDB tile), useGeoJsonLayers (CN + OVERSEAS independent GeoJSON layers with three-state styling), useLeafletPopupAnchor (@floating-ui VirtualElement bridge via latLngToContainerPoint)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-31T17:23:49Z
- **Completed:** 2026-03-31T17:27:19Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Leaflet 1.9.4 and @types/leaflet installed; Vitest configured with `server.deps.inline: ['leaflet']` to prevent happy-dom crash; Leaflet CSS imported in main.ts for correct z-index pane system
- Three composables created with full TDD (18 tests, all green): useLeafletMap with Bing CanvasLight primary + CartoDB Positron fallback, useGeoJsonLayers with GEOX-05 compliant independent CN/OVERSEAS layers and three-state styles, useLeafletPopupAnchor with map move/zoom-triggered VirtualElement updates
- Style function returns exact color values from UI-SPEC state colors table: selected `rgba(244,143,177,0.96)/0.28fill`, saved `rgba(132,199,216,0.82)/0.24fill`, unrecorded `opacity:0`

## Task Commits

1. **Task 1: Install Leaflet and configure Vitest** - `27d7d2b` (chore)
2. **Task 2: Create composables with specs (TDD)** - `c4b4475` (feat)

## Files Created/Modified

- `apps/web/src/composables/useLeafletMap.ts` - L.map lifecycle composable (onMounted init, onBeforeUnmount cleanup, ResizeObserver, Bing/CartoDB tile)
- `apps/web/src/composables/useGeoJsonLayers.ts` - CN + OVERSEAS GeoJSON layers with buildStyleFunction, addFeatures, refreshStyles
- `apps/web/src/composables/useLeafletPopupAnchor.ts` - VirtualElement bridge via latLngToContainerPoint + container rect offset
- `apps/web/src/composables/useLeafletMap.spec.ts` - 5 tests: export, return types, initial null state
- `apps/web/src/composables/useGeoJsonLayers.spec.ts` - 8 tests: two L.geoJSON calls (GEOX-05), all three style states verified with exact color values
- `apps/web/src/composables/useLeafletPopupAnchor.spec.ts` - 5 tests: VirtualElement null/non-null, getBoundingClientRect coordinates, map event listener registration
- `apps/web/package.json` - leaflet dependency added
- `apps/web/vitest.config.ts` - server.deps.inline: ['leaflet']
- `apps/web/src/main.ts` - import 'leaflet/dist/leaflet.css' added

## Decisions Made

- **Bing Maps integration without plugin**: Used REST Imagery Metadata API to fetch tile URL template dynamically, avoiding the unmaintained `leaflet-bing-layer` package. Falls back silently to CartoDB Positron when `VITE_BING_MAPS_KEY` is absent.
- **buildStyleFunction closure**: Style function closed over reactive Refs so it always reads current values when called from setStyle(). Explicit watch + setStyle refresh needed because Leaflet style functions are not reactive (Pitfall 6 from RESEARCH.md).
- **Separate event binding for map move/zoom**: useLeafletPopupAnchor registers `map.on('move/zoom')` imperatively rather than relying on @floating-ui autoUpdate, because Leaflet pan/zoom modifies CSS transforms without triggering DOM scroll/resize events (Pitfall 4 from RESEARCH.md).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation proceeded without blocking issues. Vue lifecycle warnings in tests (`onMounted is called when there is no active component instance`) are expected behavior when composables are called outside a component setup context; they do not affect test correctness.

## User Setup Required

Optional: Set `VITE_BING_MAPS_KEY` in `.env` to enable Bing Maps CanvasLight tile layer. If absent, CartoDB Positron is used automatically as fallback.

## Next Phase Readiness

- All three composables are ready to be consumed by LeafletMapStage.vue (Plan 02)
- useLeafletMap exports `{ map: ShallowRef<L.Map | null>, isReady: ShallowRef<boolean> }`
- useGeoJsonLayers exports `{ cnLayer, overseasLayer, addFeatures, refreshStyles }`
- useLeafletPopupAnchor exports `{ virtualElement: ComputedRef<VirtualElement | null> }`
- Vitest environment is stable for Leaflet imports; Plan 02 can mock composables rather than Leaflet directly

---
*Phase: 14-leaflet*
*Completed: 2026-03-31*

## Self-Check: PASSED

- FOUND: apps/web/src/composables/useLeafletMap.ts
- FOUND: apps/web/src/composables/useGeoJsonLayers.ts
- FOUND: apps/web/src/composables/useLeafletPopupAnchor.ts
- FOUND: apps/web/src/composables/useLeafletMap.spec.ts
- FOUND: apps/web/src/composables/useGeoJsonLayers.spec.ts
- FOUND: apps/web/src/composables/useLeafletPopupAnchor.spec.ts
- Commit 27d7d2b: verified
- Commit c4b4475: verified
