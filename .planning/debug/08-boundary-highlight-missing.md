# Debug Session: Phase 08 Boundary Highlight Missing

## Goal

Diagnose why Phase 08 UAT reported that selected and reopened cities did not show any highlighted city boundary blocks.

## Symptoms

- Test 1: "没有以边界为边的内容全高亮块"
- Test 3: "目前没有边界城市块高亮"
- Test 5: "没有高亮城市块"

## Investigation

### Boundary asset coverage

Checked `src/data/geo/city-boundaries.geo.json`.

Current `cityId` coverage:

- `pt-lisbon`
- `eg-cairo`
- `jp-kyoto`
- `jp-tokyo`
- `fr-paris`
- `ar-buenos-aires`

This is a small curated fixture set, not broad city coverage.

### Store assignment path

`src/stores/map-points.ts` assigns `boundaryId` only through:

- `getBoundaryByCityId(candidate.cityId)` during candidate confirmation

If a city is not present in the offline boundary dataset, the draft is created with:

- `boundaryId: null`
- `boundaryDatasetVersion: null`

Then:

- `selectedBoundaryId` becomes `null`
- `savedBoundaryIds` excludes that point
- `WorldMapStage.vue` has no boundary group to render

### Render layer

`src/components/WorldMapStage.vue` does render boundary SVG paths when a valid `boundaryId` exists.
Automated tests pass because they exercise only fixture-covered cities such as Kyoto, Tokyo, and Lisbon.

## Root Cause

Phase 08 currently ships only a narrow offline boundary fixture set. Real UAT interactions against cities outside that set produce no `boundaryId`, so the map correctly fail-closes and renders no highlighted city boundary at all.

## Evidence

- `src/data/geo/city-boundaries.geo.json` contains only 6 cities.
- `src/services/city-boundaries.ts` can only resolve boundaries for those fixture `cityId`s.
- `src/stores/map-points.ts` explicitly falls back to `null` boundary identity when lookup misses.
- `src/components/WorldMapStage.vue` depends entirely on `selectedBoundaryId` / `savedBoundaryIds`, so no boundary identity means no highlight.

## Files Involved

- `src/data/geo/city-boundaries.geo.json`: boundary coverage too narrow for general UAT use
- `src/services/city-boundaries.ts`: lookup returns `null` for uncovered cities
- `src/stores/map-points.ts`: fail-closed assignment propagates missing coverage into render state
- `src/components/WorldMapStage.vue`: render layer is correct but has no geometry to draw when coverage misses

## Suggested Fix Direction

- Expand offline boundary dataset coverage to at least the cities reachable in current product/UAT flows
- Or explicitly constrain the UX so only boundary-supported cities are presented as supporting boundary highlight
- Add regression coverage for an uncovered city to make the coverage gap visible in tests
