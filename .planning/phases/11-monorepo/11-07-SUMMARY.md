---
phase: 11-monorepo
plan: 07
subsystem: ui
tags: [vue, vite, geojson, local-storage]
requires:
  - phase: 11-02
    provides: apps/web package shell, package-local bootstrap, and temporary legacy bridge
provides:
  - Package-local web supporting services under apps/web/src/services
  - Package-local seed/preview/geo datasets under apps/web/src/data
  - Package-local web-only geo and map-point types under apps/web/src/types
affects: [11-08, 11-09, 11-10]
tech-stack:
  added: []
  patterns: [package-local web supporting modules copied without consumer rewiring, contracts remain thin while web-only internals stay in apps/web]
key-files:
  created:
    - apps/web/src/services/point-storage.ts
    - apps/web/src/services/geo-lookup.ts
    - apps/web/src/data/geo/country-regions.geo.json
    - apps/web/src/types/map-point.ts
  modified: []
key-decisions:
  - "11-07 keeps the migration narrow by copying services/data/types into apps/web without rewiring current consumers; runtime bridge cleanup remains deferred to 11-09/11-10."
  - "The apps/web copy of point-storage adds a loadStoredPoints compatibility export so the moved module satisfies the plan contract while preserving existing snapshot-based behavior."
patterns-established:
  - "Pattern 1: web-only services, data, and local types can be staged into apps/web ahead of runtime rewiring."
  - "Pattern 2: @trip-map/contracts stays limited to shared contract fields while browser-local storage and geo datasets remain package-local."
requirements-completed: [ARC-01, ARC-04]
duration: 14min
completed: 2026-03-30
---

# Phase 11 Plan 07: Supporting Web Modules Summary

**apps/web 现已拥有 package-local 的 browser services、seed/preview 数据、GeoJSON 资产与 web-only 类型定义，并保持后续 rewiring 独立推进**

## Performance

- **Duration:** 14 min
- **Started:** 2026-03-30T04:00:30Z
- **Completed:** 2026-03-30T04:14:19Z
- **Tasks:** 1
- **Files modified:** 13

## Accomplishments

- 把 `map-projection`、`point-storage`、`city-boundaries`、`geo-lookup`、`city-search` 迁入 `apps/web/src/services`，形成 package-local supporting service 层。
- 把 `seed-points`、`preview-points`、`city-candidates`、`city-boundaries.geo.json`、`country-regions.geo.json` 迁入 `apps/web/src/data`，为后续 rewiring 提供本地数据来源。
- 把 `geo.ts` 与 `map-point.ts` 迁入 `apps/web/src/types`，并保持 `packages/contracts` 不吸收 web-only 运行时逻辑。

## Task Commits

Each task was committed atomically:

1. **Task 1: Relocate supporting web services, geo data, and web-local types into `apps/web`** - `5ba211b` (feat)

## Files Created/Modified

- `apps/web/src/services/map-projection.ts` - 迁入地图投影与坐标格式化工具。
- `apps/web/src/services/point-storage.ts` - 迁入浏览器存储快照逻辑，并补充 `loadStoredPoints()` 兼容导出。
- `apps/web/src/services/city-boundaries.ts` - 迁入城市边界读取与数据集版本守卫。
- `apps/web/src/services/geo-lookup.ts` - 迁入离线地理识别与城市候选计算逻辑。
- `apps/web/src/services/city-search.ts` - 迁入离线城市搜索逻辑。
- `apps/web/src/data/seed-points.ts` - 迁入 seed 点位定义。
- `apps/web/src/data/preview-points.ts` - 迁入 preview 点位装配逻辑。
- `apps/web/src/data/geo/city-candidates.ts` - 迁入城市候选静态表。
- `apps/web/src/data/geo/city-boundaries.geo.json` - 迁入城市边界 GeoJSON。
- `apps/web/src/data/geo/country-regions.geo.json` - 迁入国家/地区边界 GeoJSON。
- `apps/web/src/types/geo.ts` - 迁入 web-local geo 类型。
- `apps/web/src/types/map-point.ts` - 迁入 web-local map point 类型。

## Decisions Made

- 保持这次迁移为纯 package-local 文件归属变更，不提前改 `apps/web` 当前 bridge 消费者，以免和 11-09 的 runtime rewiring、11-10 的 bridge cleanup 交叉。
- 继续让 `packages/contracts` 只承载跨端共享字段，不把浏览器存储、GeoJSON 数据装载或搜索逻辑抽进去。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added `loadStoredPoints()` compatibility export in the moved web storage service**
- **Found during:** Task 1 (Relocate supporting web services, geo data, and web-local types into `apps/web`)
- **Issue:** The plan artifacts and acceptance criteria required `apps/web/src/services/point-storage.ts` to contain `loadStoredPoints`, but the source module only exposed `loadPointStorageSnapshot`.
- **Fix:** Added `StoredMapPoint` alias plus `loadStoredPoints()` in the `apps/web` copy, mapping the ready snapshot to `userPoints` and returning `[]` otherwise.
- **Files modified:** `apps/web/src/services/point-storage.ts`
- **Verification:** `rg -n 'loadStoredPoints|datasetVersion|FeatureCollection' apps/web/src/services apps/web/src/data apps/web/src/types`
- **Committed in:** `5ba211b` (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Auto-fix was narrowly scoped to satisfy the declared plan contract. No runtime rewiring or scope creep was introduced.

## Issues Encountered

- Parallel `git add` calls briefly raced on `.git/index.lock`; re-running the remaining staged files serially resolved it without affecting code changes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `apps/web` 现在已具备 package-local supporting services/data/types，后续 `11-08` 可以继续把非 UI specs/test-helper 跟进到同一 package。
- `11-09` 只需把现有运行时消费者从 root `src` bridge 改指向这些 package-local 文件，并收口 legacy 依赖链。

## Self-Check: PASSED

- Verified summary file exists at `.planning/phases/11-monorepo/11-07-SUMMARY.md`.
- Verified task commit `5ba211b` is present in git history.
- Verified stub scan across `apps/web/src/services`, `apps/web/src/data`, and `apps/web/src/types` returned no placeholder markers.

---
*Phase: 11-monorepo*
*Completed: 2026-03-30*
