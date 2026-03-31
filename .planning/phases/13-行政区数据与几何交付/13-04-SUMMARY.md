---
phase: 13
plan: "04"
subsystem: canonical-places-api, geometry-loader
tags: [geometryRef, manifest, shard-loader, cache, api-reference]
dependency_graph:
  requires: [13-01, 13-03]
  provides: [server-geometry-ref-api, web-shard-loader]
  affects: [canonical-places-service, web-geometry-loading]
tech_stack:
  added: []
  patterns:
    - manifest-backed geometryRef injection in NestJS service
    - in-memory promise-cache for geometry shards
    - boundaryId-based manifest lookup (no duplicate hand-coded asset mappings)
key_files:
  created:
    - apps/web/src/services/geometry-loader.ts
    - apps/web/src/services/geometry-loader.spec.ts
  modified:
    - apps/server/src/modules/canonical-places/canonical-places.service.ts
    - apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts
    - apps/server/test/canonical-resolve.e2e-spec.ts
decisions:
  - Server uses GEOMETRY_MANIFEST from @trip-map/contracts to inject geometryRef; fixture no longer hand-codes assetKey
  - lookupGeometryRefByBoundaryId is a private helper in the service — single lookup point, throws if boundaryId not in manifest
  - Web loader cache key is geometryDatasetVersion:assetKey (promise-cache prevents duplicate in-flight fetches)
  - loadGeometryFeatureByRef uses renderableId ?? boundaryId for feature lookup within shard
metrics:
  duration: "~10min"
  completed: "2026-03-31T07:35:56Z"
  tasks_completed: 2
  files_modified: 5
---

# Phase 13 Plan 04: Runtime Geometry Ref Wiring Summary

Server now returns manifest-backed `geometryRef` on all resolved/ambiguous places; web has a shard loader with promise-cache that fetches by `geometryDatasetVersion` and `assetKey` from the API response.

## Tasks Completed

### Task 1: Server returns manifest-backed `geometryRef`

Refactored `canonical-place-fixtures.ts` to remove hardcoded `assetKey` and `geometryRef` from the catalog entries. Fixtures now only carry canonical summary fields (`placeId`, `boundaryId`, `displayName`, semantic metadata).

Updated `canonical-places.service.ts` with a `lookupGeometryRefByBoundaryId()` helper that queries `GEOMETRY_MANIFEST` (imported from `@trip-map/contracts`) and constructs a `GeometryRef`. The `getPlace()` private method now injects `geometryRef:` from the manifest at runtime.

Extended `canonical-resolve.e2e-spec.ts` with:
- Beijing `geometryRef.assetKey === 'cn/beijing.json'` assertion
- Hong Kong `geometryRef.assetKey === 'cn/hong-kong.json'` assertion
- California `geometryRef.assetKey === 'overseas/us.json'` and `layer === 'OVERSEAS'` assertion
- Ambiguous candidates[0] has `geometryRef` assertion
- Failed branch `not.toHaveProperty('geometry')` and `not.toHaveProperty('features')` assertion

**Commit:** 55a1061

### Task 2: Web geometry shard loader with cache

Created `apps/web/src/services/geometry-loader.ts` with:
- `loadGeometryShard(geometryDatasetVersion, assetKey)` — fetches `/geo/${geometryDatasetVersion}/${assetKey}`, caches the in-flight Promise with key `${geometryDatasetVersion}:${assetKey}`
- `loadGeometryFeatureByRef(geometryRef)` — loads the shard, finds feature by `renderableId ?? boundaryId`, returns `null` if not found
- `clearGeometryShardCacheForTest()` — test utility to reset the cache

Created `apps/web/src/services/geometry-loader.spec.ts` with 9 tests covering:
- Beijing URL `/geo/2026-03-31-geo-v1/cn/beijing.json`
- California URL `/geo/2026-03-31-geo-v1/overseas/us.json`
- Cache dedup (same assetKey only fetches once)
- Separate cache entries for different assetKeys
- Non-2xx error throws with assetKey in message
- Feature lookup by renderableId
- Null return when feature not found
- Fallback to boundaryId when renderableId is null

**Commit:** 05b4279

## Verification Results

All three verification suites pass:
- `pnpm --filter @trip-map/server test test/canonical-resolve.e2e-spec.ts`: 11/11 tests
- `pnpm --filter @trip-map/web test src/services/geometry-loader.spec.ts`: 9/9 tests
- `pnpm --filter @trip-map/contracts test`: 13/13 tests

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] contracts package dist not built**

- **Found during:** Task 1 implementation
- **Issue:** `packages/contracts/dist/` did not include the `generated/` subdirectory, so `GEOMETRY_MANIFEST` was `undefined` at runtime in the server e2e test
- **Fix:** Ran `pnpm --filter @trip-map/contracts build` to compile the generated manifest into dist
- **Files modified:** `packages/contracts/dist/generated/geometry-manifest.generated.js` (auto-generated)
- **Commit:** N/A (build artifact, not committed)

None of the plan-specified files were changed beyond what the plan described.

## Key Decisions

1. `lookupGeometryRefByBoundaryId()` throws if boundaryId is not in the manifest — ensures data consistency and surfaces integration gaps early, rather than silently returning `undefined` or skipping geometryRef
2. The fixture type `CanonicalPlaceSummaryWithoutGeometryRef = Omit<ResolvedCanonicalPlace, 'geometryRef'>` makes the separation explicit at the type level
3. Promise-cache (not value-cache) in geometry-loader ensures concurrent callers for the same shard share the in-flight request without race conditions

## Known Stubs

None — all plan goals are fully wired:
- Server manifests are read from generated constants (no placeholder mappings)
- Web loader fetches from real public/ paths using geometryRef fields
- Both sides use the same `geometryDatasetVersion: 2026-03-31-geo-v1`
