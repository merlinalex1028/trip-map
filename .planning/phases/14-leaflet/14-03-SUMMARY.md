---
plan: 14-03
phase: 14-leaflet
status: complete
wave: 3
commits:
  - bc4f2c9
  - 744412f
  - 51795dd
---

## What Was Built

Task 1: LeafletMapStage.spec.ts — 13 tests covering all 6 phase requirement IDs.

Task 2: Visual verification passed. Phase 11 BackendBaselinePanel placeholder removed.

## Test Coverage

| Requirement | Test Case |
|-------------|-----------|
| MAP-04 | calls resolveCanonicalPlace on map click; creates draft point on resolved response |
| MAP-05 | calls addFeatures with CN layer when shard loads |
| MAP-06 | refreshes styles when selectedBoundaryId changes |
| MAP-08 | no double-highlight on selection switch |
| UIX-01 | MapContextPopup/PointPreviewDrawer visibility gates |
| GEOX-05 | addFeatures called separately for CN and OVERSEAS layers |
| D-12 | boundary click on saved point opens popup without resolveCanonicalPlace |

## Key Fixes During Execution

1. **ASI (Automatic Semicolon Insertion)**: `capturedMapClickHandler = null` followed by `(leafletMapContainer...)` on the next line was parsed as `null(...)`. Fixed by prefixing all parenthesized statements with `;`.

2. **`map.addLayer is not a function`**: Leaflet's `circleMarker.addTo(map)` calls `map.addLayer`. Added `addLayer: vi.fn()` to all fake map objects.

3. **`isRecognizing` timing**: `startRecognition()` fires synchronously before the first `await` in `handleMapClick`. Test restructured to check the state before awaiting the click promise.

4. **`drawerMode` value**: `openDrawerView()` sets mode to `'view'`, not `'detail'`. Test assertions updated.

5. **`useLeafletPopupAnchor` in App.spec.ts**: `PointPreviewDrawer` requires non-null `popupAnchor`, which requires non-null `virtualElement`. Added mock returning a fake VirtualElement.

6. **vue-tsc**: `vi.fn<(...args: any[]) => any>` for `getGeometryManifestEntry` to allow flexible return types; `L.latLng()` for proper LatLng construction in boundary click test.

## Visual Verification

- Leaflet tile basemap (CartoDB Positron) loads centered on China ✓
- Click triggers recognition flow with toast feedback ✓
- Phase 11 BackendBaselinePanel removed ✓

## Full Suite Result

23 test files, 141 tests passing. vue-tsc zero errors.
