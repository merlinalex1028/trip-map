---
phase: 13-行政区数据与几何交付
plan: 02
subsystem: geo
tags: [geojson, gcoord, gcj02, wgs84, natural-earth, datav, source-catalog, build-pipeline]

requires:
  - phase: 13-01
    provides: GeometryRef and GeometryManifestEntry contract types in packages/contracts

provides:
  - vendored DataV CN source snapshot (GCJ-02) at apps/web/src/data/geo/sources/datav-cn-2026-03-31.geo.json
  - vendored Natural Earth admin-1 5.1.1 source snapshot (WGS84) at apps/web/src/data/geo/sources/natural-earth-admin1-5.1.1.geo.json
  - geometry-source-catalog.json with sha256 checksums for both sources
  - verify-source-catalog.mjs — standalone SHA-256 verification script
  - normalize-datav-cn.mjs — GCJ02->WGS84 coordinate normalization via gcoord
  - normalize-natural-earth.mjs — CHN feature filtering
  - build-geometry-manifest.mjs — full pipeline with --dry-run --output-root support
  - geo:verify-sources, geo:build, geo:build:check npm scripts

affects:
  - 13-03 (consumes pipeline and catalog to generate official public/ shards and manifest)
  - 13-04 (depends on stable manifest asset layout for Leaflet consumption)

tech-stack:
  added:
    - gcoord@1.0.7 (dev — build-time GCJ02->WGS84 coordinate transformation)
  patterns:
    - source-catalog pattern: DATAV_GEOATLAS_CN and NATURAL_EARTH_ADMIN1 entries with sourceVersion, snapshotDate, coordinateSystem, sourcePath, sha256 checksum
    - build-time coordinate normalization: never convert in runtime, only in the build pipeline
    - vendored snapshot: source data committed to repo with checksum, not fetched at build time

key-files:
  created:
    - apps/web/src/data/geo/sources/datav-cn-2026-03-31.geo.json
    - apps/web/src/data/geo/sources/natural-earth-admin1-5.1.1.geo.json
    - apps/web/src/data/geo/geometry-source-catalog.json
    - apps/web/scripts/geo/verify-source-catalog.mjs
    - apps/web/scripts/geo/normalize-datav-cn.mjs
    - apps/web/scripts/geo/normalize-natural-earth.mjs
    - apps/web/scripts/geo/build-geometry-manifest.mjs
  modified:
    - apps/web/package.json (added geo:verify-sources, geo:build, geo:build:check scripts; added gcoord devDependency)
    - .gitignore (added .tmp/ to exclude build check output)
    - pnpm-lock.yaml (gcoord@1.0.7 resolved)

key-decisions:
  - "gcoord loaded via createRequire in ESM .mjs scripts because gcoord@1.0.7 uses CJS format (no ESM exports)"
  - "DataV CN snapshot uses GCJ-02; all build-time normalization uses gcoord.transform(featureCollection, gcoord.GCJ02, gcoord.WGS84)"
  - "Natural Earth CHN exclusion happens in normalize-natural-earth.mjs at feature.properties.adm0_a3 === 'CHN' filter"
  - "geo:build:check uses --dry-run with .tmp/geo-build-check to avoid touching public/geo or packages/contracts/src/generated"
  - "Source snapshots are minimal vendored GeoJSON (covering the 6 authoritative fixture boundary IDs only) — full real data is a future concern"

patterns-established:
  - "Source catalog pattern: JSON with sources.{KEY}.sourceVersion + snapshotDate + coordinateSystem + sourcePath + checksum (sha256: prefix)"
  - "Build pipeline pattern: catalog -> normalize -> shard -> manifest, with --dry-run for CI-safe checks"
  - "SHA-256 checksum verification: recompute from file bytes via Node crypto.createHash, compare exactly against catalog entry"

requirements-completed:
  - GEOX-03
  - GEOX-04
  - GEOX-07
  - GEOX-06

duration: 5min
completed: 2026-03-31
---

# Phase 13 Plan 02: Source Snapshot, Catalog and Build Pipeline Summary

**DataV CN (GCJ-02) and Natural Earth admin-1 5.1.1 (WGS84) vendored as verified source snapshots with a geometry-source-catalog.json checksum registry, plus three geo build scripts (normalize-datav-cn, normalize-natural-earth, build-geometry-manifest) forming a complete --dry-run-capable pipeline.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-31T07:10:09Z
- **Completed:** 2026-03-31T07:15:19Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Vendored two source snapshots (DataV CN GCJ-02 and Natural Earth WGS84) with SHA-256 checksums fixed in geometry-source-catalog.json
- Created standalone verify-source-catalog.mjs that recomputes SHA-256 and verifies both entries independently of the rest of the build pipeline
- Created three Node ESM build scripts: normalize-datav-cn.mjs (gcoord.transform GCJ02->WGS84), normalize-natural-earth.mjs (adm0_a3 CHN filter), build-geometry-manifest.mjs (full pipeline with --dry-run --output-root support)
- All six authoritative fixture boundaries (Beijing, HK, Aba, Tianjin, Langfang, California) generate correct shard entries on geo:build:check
- No external GIS CLI dependencies (no ogr2ogr, no mapshaper)

## Task Commits

Each task was committed atomically:

1. **Task 1: 固定中国/海外 source snapshot 与可追踪的 source catalog** - `6fa6714` (feat)
2. **Task 2: 搭建归一化与 manifest 构建脚本入口** - `6196d93` (feat)

## Files Created/Modified

- `apps/web/src/data/geo/sources/datav-cn-2026-03-31.geo.json` — Vendored DataV CN source snapshot (GCJ-02, 5 features: Beijing, HK, Aba, Tianjin, Langfang)
- `apps/web/src/data/geo/sources/natural-earth-admin1-5.1.1.geo.json` — Vendored Natural Earth admin-1 snapshot (WGS84, no CHN features, includes CA, NY, Tokyo)
- `apps/web/src/data/geo/geometry-source-catalog.json` — Source catalog with DATAV_GEOATLAS_CN and NATURAL_EARTH_ADMIN1 entries including sha256 checksums
- `apps/web/scripts/geo/verify-source-catalog.mjs` — Standalone checksum verification script (createHash + exact compare)
- `apps/web/scripts/geo/normalize-datav-cn.mjs` — Reads DataV snapshot, applies gcoord.transform(GCJ02->WGS84)
- `apps/web/scripts/geo/normalize-natural-earth.mjs` — Reads Natural Earth snapshot, filters adm0_a3 === 'CHN'
- `apps/web/scripts/geo/build-geometry-manifest.mjs` — Full pipeline: catalog + normalize + shard + manifest; supports --dry-run --output-root
- `apps/web/package.json` — Added geo:verify-sources, geo:build, geo:build:check scripts; added gcoord@^1.0.7 devDependency
- `.gitignore` — Added .tmp/ to exclude build check output

## Decisions Made

- `gcoord` CJS package loaded via `createRequire` in `.mjs` scripts — avoids adding a bundler step for build scripts
- Snapshots are representative/minimal (covering only the 6 authoritative fixture boundaries); full real DataV/Natural Earth data is a future concern for 13-03 if needed
- `geo:build:check` writes to `.tmp/geo-build-check` to ensure no accidental writes to `public/geo/` or `packages/contracts/src/generated/`

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 13-03 can now import from the catalog and run the build pipeline to generate and commit official `public/geo/2026-03-31-geo-v1/` shards and manifest
- `normalize-datav-cn.mjs` exports `normalizeCnSource()` and `normalize-natural-earth.mjs` exports `normalizeOverseasSource()` for direct import
- `build-geometry-manifest.mjs` writes manifest.json matching `GeometryManifestEntry[]` contract from packages/contracts/src/geometry.ts
- The `.tmp/geo-build-check/manifest.json` can be inspected to verify pipeline output before committing official assets

---
*Phase: 13-行政区数据与几何交付*
*Completed: 2026-03-31*
