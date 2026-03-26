---
phase: 08-城市边界高亮语义
plan: 01
subsystem: data
tags: [geojson, boundaryId, localStorage, vitest, city-highlight]
requires:
  - phase: 07-城市选择与兼容基线
    provides: 稳定 cityId、候选确认流与 v1 快照兼容基线
provides:
  - 离线城市边界数据集与 boundaryId 查询服务
  - Polygon/MultiPolygon 统一归一化的渲染边界契约
  - 持久化 boundaryId 与 boundaryDatasetVersion 的点位存储兼容层
affects: [08-02-PLAN, 城市边界渲染, 城市高亮恢复]
tech-stack:
  added: [none]
  patterns: [curated offline GeoJSON boundary registry, fail-closed persisted boundary metadata]
key-files:
  created:
    - src/data/geo/city-boundaries.geo.json
    - src/services/city-boundaries.ts
    - src/services/city-boundaries.spec.ts
  modified:
    - src/types/geo.ts
    - src/types/map-point.ts
    - src/services/point-storage.ts
    - src/services/point-storage.spec.ts
    - src/data/seed-points.ts
    - src/components/WorldMapStage.vue
key-decisions:
  - "使用精简离线 GeoJSON 子集承载 Phase 8 回归城市边界，而不是引入更大的全量城市边界包。"
  - "边界服务直接返回归一化后的 polygons 契约，让后续渲染层不再区分 Polygon 与 MultiPolygon。"
  - "本地快照继续保持 version 1，但读写路径显式归一化 boundaryId 与 boundaryDatasetVersion 为 string-or-null。"
patterns-established:
  - "Boundary lookup: 优先 boundaryId，其次 cityId，不做名称模糊猜测。"
  - "Boundary persistence: 缺少边界字段时统一写回 null，旧快照继续可读但不会伪造边界。"
requirements-completed: [BND-02, DAT-06]
duration: 9min
completed: 2026-03-26
---

# Phase 08 Plan 01: 城市边界骨架与边界身份持久化 Summary

**离线城市边界 GeoJSON、统一 Polygon/MultiPolygon 查询契约，以及对 `boundaryId` 的兼容安全持久化路径**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-26T02:01:01Z
- **Completed:** 2026-03-26T02:09:41Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments

- 新增了覆盖 Lisbon、Cairo、Kyoto、Tokyo、Paris、Buenos Aires 的离线城市边界数据，并为每个 feature 固定 `boundaryId`、`cityId`、`cityName`、`datasetVersion`。
- 建立了 `CITY_BOUNDARY_DATASET_VERSION`、`getBoundaryById()`、`getBoundaryByCityId()` 和 Polygon/MultiPolygon 统一归一化服务。
- 将 `boundaryId` 与 `boundaryDatasetVersion` 纳入点位模型和本地存储读写链路，同时保持 v1 旧快照缺字段时按 `null` fail-closed 恢复。

## Task Commits

1. **Task 1: Add offline city boundary assets and normalized lookup contracts** - `3ffcd5b` (test), `2cbd721` (feat)
2. **Task 2: Extend persisted point models for boundary identity and fail-closed legacy restore** - `442f735` (test), `caf73d0` (feat)

## Files Created/Modified

- `src/data/geo/city-boundaries.geo.json` - 精简离线城市边界数据集，包含多面域 Tokyo 样本。
- `src/services/city-boundaries.ts` - 边界版本校验、`boundaryId` / `cityId` 查询与几何归一化服务。
- `src/services/city-boundaries.spec.ts` - 覆盖按 `boundaryId` 查找、按 `cityId` 回退和多面域归一化。
- `src/types/geo.ts` - 新增边界 GeoJSON 与渲染态类型。
- `src/types/map-point.ts` - 为显示/草稿/持久化点位增加 nullable 边界字段。
- `src/services/point-storage.ts` - 读写 `boundaryId` 与 `boundaryDatasetVersion`，旧快照缺字段时回填为 `null`。
- `src/services/point-storage.spec.ts` - 新增边界感知持久化、legacy 兼容与 fail-closed 恢复用例。
- `src/data/seed-points.ts` - 让种子点位显式携带 `null` 边界字段。
- `src/components/WorldMapStage.vue` - 新建 fallback 草稿时显式带上 `null` 边界字段。
- `src/App.spec.ts`、`src/components/PointPreviewDrawer.spec.ts`、`src/components/SeedMarkerLayer.spec.ts`、`src/components/WorldMapStage.spec.ts`、`src/stores/map-points.spec.ts` - 为严格类型链路补齐默认 `null` 边界字段。

## Decisions Made

- 使用 repo 内静态 GeoJSON 作为 Phase 8 的边界真相源，避免引入在线 API 或额外地图引擎。
- 把边界查询输出定为渲染友好的 `polygons` 数组，后续边界图层可以直接消费。
- 在未接上真实边界赋值逻辑前，所有新建点位统一保存 `boundaryId: null` / `boundaryDatasetVersion: null`，避免误亮城市边界。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 为全仓库点位创建入口补齐 nullable 边界默认值**
- **Found during:** Task 2 (Extend persisted point models for boundary identity and fail-closed legacy restore)
- **Issue:** `MapPointDisplay` / `DraftMapPoint` 新增必填 nullable 字段后，`vue-tsc` 在多个测试 helper 和 `WorldMapStage.vue` 上报缺失字段，导致构建失败。
- **Fix:** 为种子点位、fallback 草稿和相关测试 helper 统一补上 `boundaryId: null` 与 `boundaryDatasetVersion: null`。
- **Files modified:** `src/data/seed-points.ts`, `src/components/WorldMapStage.vue`, `src/App.spec.ts`, `src/components/PointPreviewDrawer.spec.ts`, `src/components/SeedMarkerLayer.spec.ts`, `src/components/WorldMapStage.spec.ts`, `src/stores/map-points.spec.ts`, `src/services/point-storage.spec.ts`
- **Verification:** `pnpm build`
- **Committed in:** `caf73d0`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** 这是把新字段真正接入严格类型链路所必需的修复，没有引入额外功能范围。

## Issues Encountered

- 并行 `git add` 触发了一次 `.git/index.lock` 竞争；改为串行暂存后恢复正常，没有影响代码结果。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 已具备 `cityId -> boundaryId -> normalized polygons` 的服务骨架，下一计划可以直接接边界图层与 store 派生高亮状态。
- 当前新建城市草稿默认仍是 `boundaryId: null`，后续需要在真实城市确认/保存路径里接入边界分配与恢复优先级。

## Self-Check: PASSED

- Verified summary file exists.
- Verified `src/data/geo/city-boundaries.geo.json` and `src/services/city-boundaries.ts` exist.
- Verified task commits `3ffcd5b`, `2cbd721`, `442f735`, `caf73d0` exist in git history.

---
*Phase: 08-城市边界高亮语义*
*Completed: 2026-03-26*
