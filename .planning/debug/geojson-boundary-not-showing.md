## ROOT CAUSE FOUND

**Root Cause:** `handleIlluminate` (the save/confirm action) never calls `loadShardIfNeeded`, so no GeoJSON features are ever added to the Leaflet layers for newly confirmed places. The `styleFunction` can only style features that are already present in the layer — if the shard was never loaded for a given `boundaryId`, `refreshStyles()` has nothing to operate on and no boundary overlay appears.

---

## Evidence Summary

### 1. `loadShardIfNeeded` is called in only two places — neither is the save path

`grep` confirms `loadShardIfNeeded` / `addFeatures` is called from:
- `handleMapClick` (line 617) — on resolve after a raw map click
- `handleConfirmCandidate` (line 529) — on confirm after ambiguous candidate selection
- `preloadSavedBoundaryShards` (lines 202-233) — on bootstrap for already-saved records

`handleIlluminate` (lines 428-441) calls only `mapPointsStore.illuminate(...)`. There is no shard load anywhere in that function or in `illuminate()` in the store.

### 2. `illuminate()` changes `selectedBoundaryId` but no features exist in the layer

After `illuminate()`:
- `travelRecords` gains the new record → `savedBoundaryIds` now includes `record.boundaryId`
- `selectedPointId` becomes `record.placeId` → `selectedBoundaryId` = `record.boundaryId`
- The `watch(savedBoundaryIds)` and `watch(selectedBoundaryId)` in `useGeoJsonLayers` both fire `refreshStyles()`
- `refreshStyles()` calls `cnLayer.setStyle(...)` / `overseasLayer.setStyle(...)`

But `cnLayer` and `overseasLayer` contain **zero features** for this boundary — `addFeatures` was never called for this shard during the illuminate flow. `setStyle` iterates over the existing (empty) layer and finds nothing to paint.

### 3. The shard load path in `handleMapClick` fires before `illuminate` — so the draft phase does briefly have the right data

When a user clicks the map:
1. `applyResolvedPlace` → `startDraftFromDetection` → `selectedBoundaryId = draftPoint.boundaryId` (pink)
2. `loadShardIfNeeded` fires async → `addFeatures(layer, fc)` → Leaflet styles the feature pink ✓

However, this only shows the **draft pink highlight**, not the **saved blue highlight**. After clicking the save/illuminate button, `illuminate()` replaces `selectedPointId` with `record.placeId` and adds the record to `savedBoundaryIds`. `refreshStyles()` fires and re-evaluates the already-added features. Because those features were added when the shard loaded in step 2, the blue saved highlight **does** render in this specific session path.

### 4. The complete failure scenario — confirmed by symptom

The symptom "no boundary appears after confirming/saving" most precisely describes one of two cases:

**Case A — Fresh session / page reload, then clicking a previously-saved place's boundary:**
`preloadSavedBoundaryShards` runs on bootstrap and loads shards for all saved `boundaryId`s. If `bootstrapFromApi` has not completed before the user clicks the boundary (or if the shard fetch is still in flight), `refreshStyles()` fires before features are present. Because `preloadSavedBoundaryShards` uses `Promise.allSettled` correctly, this is a race — not a definitive bug on its own.

**Case B — The `illuminate` path for a place whose shard was never loaded in this session:**
If `loadShardIfNeeded` was not called for the place's `boundaryId` (e.g., the user used the popup's save button without first triggering a map-click resolve for the exact same boundary), the GeoJSON layer is empty for that boundary. `illuminate()` correctly updates all reactive state, but `addFeatures` is never called, so nothing appears.

### 5. `loadGeometryFeatureByRef` is implemented, tested, and exported — but never called in production code

`geometry-loader.ts` exports `loadGeometryFeatureByRef`, which is designed exactly for this use case (load shard by `GeometryRef` from API response). It is imported and tested in `geometry-loader.spec.ts`. However, the grep of all web `src/` files shows **zero production call sites** for `loadGeometryFeatureByRef`. `LeafletMapStage.vue` imports only `loadGeometryShard` (line 15), not `loadGeometryFeatureByRef`.

The API response (`ResolvedCanonicalPlace`) already includes `geometryRef` (verified in `resolve.ts` and confirmed by `canonical-places.service.ts` which calls `lookupGeometryRefByBoundaryId`). The `geometryRef.assetKey` is the exact shard path. This data is available on `response.place.geometryRef` in both `handleMapClick` and `handleConfirmCandidate` — but it is **never used**; the code instead re-derives the `assetKey` from the client-side manifest via `getGeometryManifestEntry(boundaryId)`.

### 6. Shard files exist and manifest is correct — infrastructure is not the problem

- `/apps/web/public/geo/2026-03-31-geo-v1/cn/` contains: `beijing.json`, `hebei.json`, `hong-kong.json`, `sichuan.json`, `tianjin.json`
- `/apps/web/public/geo/2026-03-31-geo-v1/overseas/` contains: `us.json`
- The generated manifest in `packages/contracts/src/generated/geometry-manifest.generated.ts` has correct entries with matching `boundaryId`, `assetKey`, and `geometryDatasetVersion`
- The GeoJSON shard features include both `boundaryId` and `renderableId` in their `properties` — matching what `styleFunction` reads (`feature.properties.boundaryId`)
- `GEOMETRY_DATASET_VERSION` in `geometry-manifest.ts` (web) is hardcoded as `'2026-03-31-geo-v1'` — currently matches the contracts constant, but the import alias `_CONTRACTS_GEOMETRY_DATASET_VERSION` (prefixed with underscore = unused) is a latent drift risk

---

## Files Involved

- `apps/web/src/components/LeafletMapStage.vue`: `handleIlluminate` (lines 428-441) calls `mapPointsStore.illuminate()` but never calls `loadShardIfNeeded`. Both `handleMapClick` and `handleConfirmCandidate` do call it, but only for the direct resolve flow.
- `apps/web/src/stores/map-points.ts`: `illuminate()` (lines 293-348) correctly updates `travelRecords`, `savedBoundaryIds`, and `selectedBoundaryId` — all reactive state is correct, the layer just has no features.
- `apps/web/src/composables/useGeoJsonLayers.ts`: `refreshStyles()` (lines 92-95) re-evaluates style for existing layer features only; it cannot conjure features that were never added via `addFeatures`.
- `apps/web/src/services/geometry-loader.ts`: `loadGeometryFeatureByRef` (lines 64-79) is the intended API-ref-based loader — implemented, exported, tested, but has zero production call sites.

---

## Suggested Fix Direction

In `handleIlluminate`, after `await mapPointsStore.illuminate(...)` resolves successfully, call `loadShardIfNeeded(point.boundaryId, point.regionSystem ?? 'CN')` using the draft point's data (already available as `surface.point` before the await). This ensures the shard is loaded and `addFeatures` is called, giving `refreshStyles()` actual features to style.

Alternatively, replace the `getGeometryManifestEntry` + `loadGeometryShard` pattern throughout with `loadGeometryFeatureByRef(response.place.geometryRef)` — using the `geometryRef` the API already returns — which is the documented intended usage per the `geometry-loader.ts` file header comment.
