---
phase: 13-行政区数据与几何交付
verified: 2026-03-31T15:40:00Z
status: passed
score: 12/12 must-haves verified
gaps: []
human_verification:
  - test: "geo:build:check may fail on a fresh checkout if pnpm install has not been run in the worktree first (gcoord not found)"
    expected: "pnpm install resolves the issue and geo:build:check completes successfully"
    why_human: "This is an environment setup concern, not a code defect; confirmed passing after install in this session"
---

# Phase 13: 行政区数据与几何交付 Verification Report

**Phase Goal:** 交付行政区几何数据基础设施——包括共享类型契约、数据源管理、build pipeline、生成资产(versioned shards + manifest)、以及 server/web 运行时接入——为 Phase 14 Leaflet 地图迁移提供正式的几何 loader。
**Verified:** 2026-03-31T15:40:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 调用 canonical resolve/confirm 的消费方可以从 resolved/ambiguous 响应拿到稳定的 `geometryRef`，而不是内联 GeoJSON | ✓ VERIFIED | `resolve.ts` defines `ResolvedCanonicalPlace` with mandatory `geometryRef: GeometryRef`; server e2e 11/11 pass asserting exact `assetKey` values |
| 2 | 消费方能够区分 `datasetVersion` 与 `geometryDatasetVersion` | ✓ VERIFIED | `geometry.ts` defines `geometryDatasetVersion` as a separate field on `GeometryRef`; `CanonicalPlaceRef.datasetVersion` remains independent |
| 3 | Beijing / Hong Kong / California 等代表性地点在共享 fixture 中都能解析到可追踪的 layer、assetKey 与 renderableId | ✓ VERIFIED | `fixtures.ts` has exact values; contracts spec 13/13 pass asserting these values |
| 4 | 中国与海外正式 GeoJSON 来源都能通过 source catalog 独立追踪到 snapshot、版本与 checksum | ✓ VERIFIED | `geometry-source-catalog.json` records both sources with sha256; `geo:verify-sources` recomputes and confirms checksums match |
| 5 | 构建脚本可以从 source catalog 复现几何流水线入口，无外部 GIS CLI 依赖 | ✓ VERIFIED | `build-geometry-manifest.mjs`, `normalize-datav-cn.mjs`, `normalize-natural-earth.mjs` all use Node-only deps; `geo:build:check` completes successfully |
| 6 | 中国来源在构建期统一转换到 WGS84，海外来源在构建期过滤中国区域 | ✓ VERIFIED | `normalize-datav-cn.mjs` uses `gcoord.transform(featureCollection, gcoord.GCJ02, gcoord.WGS84)`; `normalize-natural-earth.mjs` filters `adm0_a3 === 'CHN'` |
| 7 | 版本化 manifest 能把当前 authoritative 边界稳定映射到中国/海外分层 shard，且不存在合并总包路径 | ✓ VERIFIED | `manifest.json` and `geometry-manifest.generated.ts` contain 6 entries with CN/OVERSEAS split; `geometry-manifest.spec.ts` explicitly asserts no `all.json`/`combined.json`/`geo.json` keys |
| 8 | 消费侧可以通过同一份 manifest 查询 Beijing、Hong Kong、California 等代表性地点的静态几何入口 | ✓ VERIFIED | `geometry-manifest.ts` exports `getGeometryManifestEntry` and `listGeometryManifestEntriesByLayer`; 9 tests pass |
| 9 | 代表性中国/海外点位通过自动化证明生成后的 shard 已满足统一坐标消费规则 | ✓ VERIFIED | `geometry-validation.spec.ts` (9 tests) reads real shard files and confirms Beijing (39.9042, 116.4074), HK (22.3193, 114.1694), California (36.7783, -119.4179) are within WGS84 feature bounds |
| 10 | server resolved/ambiguous 响应会返回 manifest-backed `geometryRef`，前端可以只靠引用定位正式几何资产 | ✓ VERIFIED | `canonical-places.service.ts` uses `lookupGeometryRefByBoundaryId` against `GEOMETRY_MANIFEST`; server e2e 11/11 pass |
| 11 | web 可以按 `CN` / `OVERSEAS` shard 独立加载和缓存边界，不会请求任何合并 GeoJSON | ✓ VERIFIED | `geometry-loader.ts` fetches `/geo/${geometryDatasetVersion}/${assetKey}` with promise-cache keyed by `${geometryDatasetVersion}:${assetKey}`; loader spec asserts no `all.json` |
| 12 | API payload 继续只返回引用，不会在运行时把完整 polygon 塞进响应 | ✓ VERIFIED | e2e spec line 215-216 explicitly asserts `not.toHaveProperty('geometry')` and `not.toHaveProperty('features')` on failed branch; service never attaches polygon data |

**Score:** 12/12 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|---------|--------|---------|
| `packages/contracts/src/geometry.ts` | GeometryLayer, GeometrySourceDataset, GeometryRef, GeometryManifestEntry | ✓ VERIFIED | 18 lines, all 4 exports present with exact field shapes |
| `packages/contracts/src/resolve.ts` | ResolvedCanonicalPlace with geometryRef; CanonicalPlaceCandidate extends it | ✓ VERIFIED | ResolvedCanonicalPlace defined at line 15; CanonicalPlaceCandidate extends it at line 19 |
| `packages/contracts/src/index.ts` | exports `./geometry` and `./generated/geometry-manifest.generated` | ✓ VERIFIED | Both exports present |
| `packages/contracts/src/fixtures.ts` | Beijing/HK/California/Aba/Tianjin/Langfang geometryRef values | ✓ VERIFIED | All 6 places have exact assetKey values matching shard filenames |
| `packages/contracts/src/contracts.spec.ts` | Asserts GeometryRef, GeometryManifestEntry, ambiguous candidates carry geometryRef | ✓ VERIFIED | 13/13 tests pass; Phase 13 assertions at lines 211-287 |
| `apps/web/src/data/geo/geometry-source-catalog.json` | DATAV_GEOATLAS_CN and NATURAL_EARTH_ADMIN1 with sha256 checksums | ✓ VERIFIED | Both entries present with `coordinateSystem: GCJ02/WGS84` and sha256: prefixed checksums |
| `apps/web/src/data/geo/sources/datav-cn-2026-03-31.geo.json` | Vendored DataV CN snapshot (GCJ-02) | ✓ VERIFIED | File exists; checksum verified by geo:verify-sources |
| `apps/web/src/data/geo/sources/natural-earth-admin1-5.1.1.geo.json` | Vendored Natural Earth snapshot (WGS84) | ✓ VERIFIED | File exists; checksum verified by geo:verify-sources |
| `apps/web/scripts/geo/verify-source-catalog.mjs` | SHA-256 checksum verification script | ✓ VERIFIED | Uses `createHash`; exact comparison against catalog entries; passes in this session |
| `apps/web/scripts/geo/normalize-datav-cn.mjs` | GCJ02→WGS84 via gcoord.transform | ✓ VERIFIED | Line 40: `gcoord.transform(featureCollection, gcoord.GCJ02, gcoord.WGS84)` |
| `apps/web/scripts/geo/normalize-natural-earth.mjs` | adm0_a3 === 'CHN' filter | ✓ VERIFIED | Line 36: `feature.properties?.adm0_a3 !== 'CHN'` |
| `apps/web/scripts/geo/build-geometry-manifest.mjs` | Full pipeline with --dry-run support; reads source catalog | ✓ VERIFIED | geo:build:check produces 6 entries in .tmp; does not write public/ or contracts/generated/ |
| `packages/contracts/src/generated/geometry-manifest.generated.ts` | GEOMETRY_MANIFEST constant with 6 entries | ✓ VERIFIED | 6 entries, geometryDatasetVersion = 2026-03-31-geo-v1; exported from contracts index |
| `apps/web/public/geo/2026-03-31-geo-v1/manifest.json` | JSON manifest with assetKey entries; no all.json | ✓ VERIFIED | 6 entries; no combined/all keys |
| `apps/web/public/geo/2026-03-31-geo-v1/cn/beijing.json` | Shard with renderableId: datav-cn-beijing | ✓ VERIFIED | renderableId confirmed in file |
| `apps/web/public/geo/2026-03-31-geo-v1/cn/hong-kong.json` | Shard with renderableId: datav-cn-hong-kong | ✓ VERIFIED | File exists; validation spec passes |
| `apps/web/public/geo/2026-03-31-geo-v1/cn/hebei.json` | Shard for Langfang entry | ✓ VERIFIED | File exists |
| `apps/web/public/geo/2026-03-31-geo-v1/cn/sichuan.json` | Shard for Aba entry | ✓ VERIFIED | File exists |
| `apps/web/public/geo/2026-03-31-geo-v1/cn/tianjin.json` | Shard for Tianjin entry | ✓ VERIFIED | File exists |
| `apps/web/public/geo/2026-03-31-geo-v1/overseas/us.json` | Shard with renderableId: ne-admin1-us-california | ✓ VERIFIED | renderableId confirmed in file |
| `apps/web/src/services/geometry-manifest.ts` | GEOMETRY_DATASET_VERSION, getGeometryManifestEntry, listGeometryManifestEntriesByLayer | ✓ VERIFIED | All 3 exports present; consumes GEOMETRY_MANIFEST from contracts |
| `apps/web/src/services/geometry-manifest.spec.ts` | 9 tests covering version, lookup, layer filter, renderableId | ✓ VERIFIED | 9/9 pass |
| `apps/web/src/services/geometry-validation.spec.ts` | Real shard bounds validation for Beijing, HK, California | ✓ VERIFIED | 9/9 pass with representative click points |
| `apps/server/src/modules/canonical-places/canonical-places.service.ts` | lookupGeometryRefByBoundaryId from GEOMETRY_MANIFEST; geometryRef in response | ✓ VERIFIED | Lines 25-35: helper uses GEOMETRY_MANIFEST.find; getPlace() injects geometryRef |
| `apps/server/test/canonical-resolve.e2e-spec.ts` | Beijing/HK/California assetKey assertions; no geometry/features on failed | ✓ VERIFIED | 11/11 pass; assertions at lines 50, 86, 122-124, 215-216 |
| `apps/web/src/services/geometry-loader.ts` | loadGeometryShard, loadGeometryFeatureByRef, clearGeometryShardCacheForTest | ✓ VERIFIED | All 3 exports present with promise-cache and exact URL template |
| `apps/web/src/services/geometry-loader.spec.ts` | Beijing/California URLs; cache dedup; no all.json | ✓ VERIFIED | 9/9 pass |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `resolve.ts` | `geometry.ts` | `import type { GeometryRef }` | ✓ WIRED | Line 2 of resolve.ts |
| `fixtures.ts` assetKey | shard filenames | exact string match | ✓ WIRED | cn/beijing.json, cn/hong-kong.json, cn/sichuan.json, cn/tianjin.json, cn/hebei.json, overseas/us.json all match |
| `geometry-manifest.ts` | `GEOMETRY_MANIFEST` in contracts | `import { GEOMETRY_MANIFEST } from '@trip-map/contracts'` | ✓ WIRED | Line 13 of geometry-manifest.ts |
| `canonical-places.service.ts` | `GEOMETRY_MANIFEST` | `import { GEOMETRY_MANIFEST } from '@trip-map/contracts'` at line 11 | ✓ WIRED | lookupGeometryRefByBoundaryId uses it directly |
| server fixture `boundaryId` | manifest entry | `lookupGeometryRefByBoundaryId(base.boundaryId)` | ✓ WIRED | fixture only carries boundaryId; service resolves geometryRef at runtime |
| `geometry-loader.ts` | shard URL | `` `/geo/${geometryDatasetVersion}/${assetKey}` `` | ✓ WIRED | Line 38 of geometry-loader.ts |
| `geometry-loader.ts` | feature lookup | `renderableId ?? boundaryId` | ✓ WIRED | Line 72 of geometry-loader.ts |
| source catalog `sourcePath` | vendored snapshots | filesystem check in verify-source-catalog.mjs | ✓ WIRED | Both paths verified with SHA-256 match |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| `geometry-manifest.ts` | `GEOMETRY_MANIFEST` | `packages/contracts/src/generated/geometry-manifest.generated.ts` (6 entries) | Yes | ✓ FLOWING |
| `canonical-places.service.ts` | `geometryRef` on response | `GEOMETRY_MANIFEST.find(e => e.boundaryId === boundaryId)` | Yes — throws if not found | ✓ FLOWING |
| `geometry-loader.ts` | `CityBoundaryFeatureCollection` | fetch `/geo/${version}/${assetKey}` → real shard files in `public/geo/` | Yes — real GeoJSON files | ✓ FLOWING |
| `geometry-validation.spec.ts` | shard features | `readFileSync` on real `apps/web/public/geo/2026-03-31-geo-v1/` shards | Yes — real generated files | ✓ FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| contracts tests pass (geometry types, fixture assetKeys, resolve contract) | `pnpm --filter @trip-map/contracts test` | 13/13 passed | ✓ PASS |
| web geometry-manifest service tests | `pnpm --filter @trip-map/web test src/services/geometry-manifest.spec.ts` | 9/9 passed | ✓ PASS |
| web geometry-validation with real shards | `pnpm --filter @trip-map/web test src/services/geometry-validation.spec.ts` | 9/9 passed | ✓ PASS |
| web geometry-loader cache and URL tests | `pnpm --filter @trip-map/web test src/services/geometry-loader.spec.ts` | 9/9 passed | ✓ PASS |
| server e2e canonical resolve geometryRef | `pnpm --filter @trip-map/server test test/canonical-resolve.e2e-spec.ts` | 11/11 passed | ✓ PASS |
| source catalog SHA-256 verification | `pnpm --filter @trip-map/web run geo:verify-sources` | DATAV_GEOATLAS_CN and NATURAL_EARTH_ADMIN1 checksums OK | ✓ PASS |
| build pipeline dry-run (no GIS CLI) | `pnpm --filter @trip-map/web run geo:build:check` | 6 entries output to .tmp; public/ untouched | ✓ PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| GEOX-03 | 13-02 | 中国行政区边界使用 DataV.GeoAtlas 市级 GeoJSON 作为正式来源 | ✓ SATISFIED | `datav-cn-2026-03-31.geo.json` vendored; source catalog records `DATAV_GEOATLAS_CN` with coordinateSystem GCJ02 |
| GEOX-04 | 13-02 | 海外行政区边界使用去除中国区域后的 Natural Earth admin-1 GeoJSON | ✓ SATISFIED | `natural-earth-admin1-5.1.1.geo.json` vendored; normalize script filters `adm0_a3 === 'CHN'` |
| GEOX-06 | 13-01, 13-02, 13-03 | 建立统一的字段、ID 与版本清单，保持两套来源可追踪 | ✓ SATISFIED | `geometry-manifest.generated.ts` is the single authoritative mapping; `geometry-source-catalog.json` tracks source provenance |
| GEOX-07 | 13-02, 13-03 | 验证并固定中国与海外数据在 Leaflet 渲染中的坐标适配规则 | ✓ SATISFIED | `geometry-validation.spec.ts` validates WGS84 coordinate bounds for Beijing, HK, California; GCJ02→WGS84 confirmed via build pipeline |
| API-03 | 13-01, 13-04 | 系统提供地点摘要、边界引用或几何资源入口，使前端可以按需加载并缓存行政区边界 | ✓ SATISFIED | Server returns `geometryRef` (reference only, no inline GeoJSON); web `geometry-loader.ts` fetches and caches by assetKey |

All 5 requirements assigned to Phase 13 are satisfied. No orphaned requirements found.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | — |

No TODOs, FIXME, placeholder comments, empty handlers, or hardcoded empty data found in Phase 13 key files. The `gcoord` dependency requires `pnpm install` before `geo:build:check` can run on a fresh worktree (a setup concern, not a code defect).

---

### Human Verification Required

#### 1. Fresh-checkout build pipeline execution

**Test:** On a machine with no existing `node_modules`, run `pnpm install` followed by `pnpm --filter @trip-map/web run geo:build:check`
**Expected:** geo:build:check completes successfully, outputting 6 entries to `.tmp/geo-build-check/`
**Why human:** The `gcoord` CJS package is loaded via `createRequire` and requires physical node_modules to be present. Confirmed passing in this session after `pnpm install`, but a CI environment without pre-installed dependencies would exercise this path.

---

### Gaps Summary

No gaps. All 12 observable truths are verified. Every required artifact exists, is substantive, is wired, and has confirmed data flow. All 5 phase requirements (GEOX-03, GEOX-04, GEOX-06, GEOX-07, API-03) are satisfied by direct code evidence and passing test suites.

The phase delivered:
- Shared type contract (`GeometryRef`, `GeometryManifestEntry`) in `@trip-map/contracts`
- Source catalog with SHA-256 verified vendored snapshots (DataV CN GCJ-02, Natural Earth WGS84)
- Build pipeline (normalize-datav-cn, normalize-natural-earth, build-geometry-manifest) with --dry-run support
- Generated assets: `manifest.json` + 6 versioned GeoJSON shards under `apps/web/public/geo/2026-03-31-geo-v1/`
- `geometry-manifest.ts` query service consuming the generated manifest
- `geometry-loader.ts` shard fetch + promise-cache loader
- Server `canonical-places.service.ts` returning manifest-backed `geometryRef` on all resolved/ambiguous responses
- Automated validation: 13 contracts tests + 18 web tests + 11 server e2e tests = 42 tests all passing

---

_Verified: 2026-03-31T15:40:00Z_
_Verifier: Claude (gsd-verifier)_
