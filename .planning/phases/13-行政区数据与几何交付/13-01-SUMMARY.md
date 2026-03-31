---
phase: 13-行政区数据与几何交付
plan: "01"
subsystem: contracts
tags: [geometry, contracts, types, fixtures]
dependency_graph:
  requires: [Phase 12 canonical contracts]
  provides: [GeometryRef, GeometryManifestEntry, ResolvedCanonicalPlace, geometry fixtures]
  affects: [packages/contracts, apps/server]
tech_stack:
  added: []
  patterns: [geometry ref over inline GeoJSON, version-tagged geometry assets]
key_files:
  created:
    - packages/contracts/src/geometry.ts
  modified:
    - packages/contracts/src/resolve.ts
    - packages/contracts/src/index.ts
    - packages/contracts/src/fixtures.ts
    - packages/contracts/src/contracts.spec.ts
    - apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts
    - apps/server/src/modules/canonical-places/canonical-places.service.ts
decisions:
  - "ResolvedCanonicalPlace extends CanonicalPlaceSummary with geometryRef, making geometryRef mandatory for all resolved/ambiguous responses"
  - "CanonicalPlaceCandidate now extends ResolvedCanonicalPlace so candidates also carry geometryRef"
  - "Server canonicalPlaceCatalog typed as ResolvedCanonicalPlace to enforce geometryRef at the data layer"
  - "geometryDatasetVersion is distinct from datasetVersion to separate place catalog versioning from geometry asset versioning"
metrics:
  duration: ~8min
  completed_date: "2026-03-31"
  tasks_completed: 2
  files_changed: 7
---

# Phase 13 Plan 01: Phase 13 几何契约固化 Summary

**One-liner:** Defined `GeometryRef`/`GeometryManifestEntry` Phase 13 geometry types, updated `CanonicalResolveResponse` to carry `geometryRef` via `ResolvedCanonicalPlace`, and pinned Beijing/Hong Kong/Aba/California asset key baselines.

## What Was Built

Phase 13 geometry contract is now the single source of truth for how server communicates geometry references to the frontend. Key changes:

1. **`packages/contracts/src/geometry.ts`** — New file providing:
   - `GeometryLayer = 'CN' | 'OVERSEAS'`
   - `GeometrySourceDataset = 'DATAV_GEOATLAS_CN' | 'NATURAL_EARTH_ADMIN1'`
   - `GeometryRef` with `boundaryId`, `layer`, `geometryDatasetVersion`, `assetKey`, `renderableId`
   - `GeometryManifestEntry extends GeometryRef` with `sourceDataset`, `sourceVersion`, `sourceFeatureId`

2. **`packages/contracts/src/resolve.ts`** — `ResolvedCanonicalPlace extends CanonicalPlaceSummary { geometryRef: GeometryRef }`, `CanonicalResolveResponse.resolved.place` now typed as `ResolvedCanonicalPlace`

3. **`packages/contracts/src/fixtures.ts`** — All 6 Phase 12 fixtures updated with precise `geometryRef` values; `PHASE12_RESOLVED_ABA` added; all ambiguous candidates carry `geometryRef`

4. **Server fixtures** — `canonicalPlaceCatalog` updated to use `ResolvedCanonicalPlace` with geometry refs pointing to correct asset shards

## Verification

```
pnpm --filter @trip-map/contracts test     → 13/13 passed
pnpm --filter @trip-map/contracts typecheck → clean
pnpm typecheck (full monorepo)              → 3/3 packages clean
```

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | `596a39a` | feat(13-01): define Phase 13 geometry contract and update canonical resolve to use geometryRef |
| Task 2 | `e855f71` | feat(13-01): fix geometryRef baseline fixtures for Beijing, Hong Kong, Aba, Tianjin, Langfang, California |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed server service type errors after contracts update**
- **Found during:** Task 2 (after rebuilding contracts package)
- **Issue:** `canonicalPlaceCatalog` was typed as `Record<CanonicalPlaceId, CanonicalPlaceSummary>` but `CanonicalPlaceCandidate` now requires `geometryRef`. Server's `getPlace()` and `getCandidate()` both had missing `geometryRef` type errors.
- **Fix:** Updated `canonical-place-fixtures.ts` to use `ResolvedCanonicalPlace` with full geometry refs for all entries; updated `canonical-places.service.ts` `getPlace()` return type accordingly
- **Files modified:** `apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts`, `apps/server/src/modules/canonical-places/canonical-places.service.ts`
- **Commit:** `e855f71` (included with Task 2)

## Known Stubs

None — all fixture `geometryRef` values are pinned to real asset key paths (`cn/beijing.json`, `cn/hong-kong.json`, etc.) matching the shard naming convention specified in the plan.

## Self-Check: PASSED
