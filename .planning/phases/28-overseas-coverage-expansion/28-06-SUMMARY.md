---
phase: 28-overseas-coverage-expansion
plan: 06
subsystem: geo
tags:
  - geo
  - overseas
  - canonical-lookup
  - identity
  - regression
requires: []
provides:
  - sourceFeatureId-backed overseas identity overrides for ambiguous admin1 records
  - fail-fast duplicate guards for overseas generated artifacts and canonical lookup indexes
  - shared Washington/DC and Buenos Aires collision regressions for resolve and save flows
affects:
  - Phase 28-07 backfill hardening
  - Phase 29 timeline metadata consumers
  - Phase 30 statistics metadata consumers
tech-stack:
  added: []
  patterns:
    - sourceFeatureId-based overseas identity authoring
    - fail-fast duplicate key guards
    - shared collision probe matrix
key-files:
  created:
    - .planning/phases/28-overseas-coverage-expansion/28-06-SUMMARY.md
  modified:
    - apps/web/scripts/geo/build-geometry-manifest.mjs
    - apps/web/public/geo/2026-04-21-geo-v3/manifest.json
    - apps/web/public/geo/2026-04-21-geo-v3/overseas/layer.json
    - packages/contracts/src/generated/geometry-manifest.generated.ts
    - apps/server/src/modules/canonical-places/place-metadata-catalog.ts
    - apps/server/test/phase28-overseas-cases.ts
    - apps/server/test/canonical-resolve.e2e-spec.ts
    - apps/server/test/records-travel.e2e-spec.ts
key-decisions:
  - "Overseas special identities now key off getOverseasAdmin1SourceFeatureId() so ambiguous admin1 names never depend on name_en matching."
  - "Canonical metadata lookup now pre-indexes each shard and rejects duplicate lookupId/placeId/boundaryId instead of silently overriding entries."
  - "Washington/DC and Buenos Aires collision probes live in one shared matrix so resolve and save regressions reuse the same truth source."
patterns-established:
  - "sourceFeatureId override pattern: explicit overrides only for ambiguous overseas admin1, slug fallback for the rest"
  - "fail-fast catalog pattern: generated artifacts and canonical lookup both reject duplicate identity keys before serving data"
  - "shared collision probes: resolve/save regressions import one canonical matrix instead of hand-rolled fixtures"
requirements-completed:
  - GEOX-01
  - GEOX-02
duration: 12min
completed: 2026-04-22
---

# Phase 28 Plan 06 Summary

**sourceFeatureId 驱动的 overseas admin1 唯一 identity、fail-fast canonical lookup 守卫，以及 Washington/DC 与 Buenos Aires 冲突回归面**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-22T02:56:00Z
- **Completed:** 2026-04-22T03:07:46Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- 用 `sourceFeatureId` 重写 overseas 特例 identity 入口，为 `US-WA`、`US-DC`、`AR-B`、`AR-C` 生成唯一 `placeId` / `boundaryId` / `renderableId`，并把新 truth 写回 manifest、overseas layer 与 generated contracts。
- 在 `geo:build` 和 server canonical lookup 两侧都补上 fail-fast duplicate guard，阻断未来 collision 静默写盘或静默覆盖。
- 新增共享 `PHASE28_IDENTITY_COLLISION_CASES`，把 Washington/DC 与 Buenos Aires 的 resolve/save distinctness 固定为自动化回归。

## Task Commits

Each task was committed atomically:

1. **Task 1: 用 sourceFeatureId 修复歧义 overseas identity，并为 generated artifacts 增加 fail-fast 唯一性守卫** - `47a4567` (fix)
2. **Task 2: 让 canonical lookup 对 collision fail-fast，并补 Washington/DC + Buenos Aires resolve/save regression** - `0a07659` (fix)

## Files Created/Modified

- `apps/web/scripts/geo/build-geometry-manifest.mjs` - 把 overseas special identity key 切到 `sourceFeatureId`，并新增 `assertUniqueOverseasIdentity()`。
- `apps/web/public/geo/2026-04-21-geo-v3/manifest.json` - 重新生成唯一 overseas manifest entries，移除旧的 Washington / Buenos Aires collision ids。
- `apps/web/public/geo/2026-04-21-geo-v3/overseas/layer.json` - 重新生成唯一 canonical overseas feature metadata。
- `packages/contracts/src/generated/geometry-manifest.generated.ts` - 同步生成唯一 overseas geometry manifest contracts。
- `apps/server/src/modules/canonical-places/place-metadata-catalog.ts` - 用 shard lookup 索引与 duplicate guards 替换 `find()` + `Map.set()` 静默覆盖路径。
- `apps/server/test/phase28-overseas-cases.ts` - 增加 `PHASE28_IDENTITY_COLLISION_CASES` 与模块加载时的唯一性校验。
- `apps/server/test/canonical-resolve.e2e-spec.ts` - 新增 4 组 collision resolve regression。
- `apps/server/test/records-travel.e2e-spec.ts` - 新增 4 组 authoritative save regression 与旧 `us-washington` 负例。

## Decisions Made

- `OVERSEAS_SPECIAL_IDENTITIES` 只对歧义 admin1 走显式 override，其他国家继续沿用既有 slug fallback，避免无必要地重写 Phase 28 已稳定 id。
- canonical lookup 在读取 geometry shard 时先建索引再消费 manifest entry，这样 duplicate `lookupId`、`placeId`、`boundaryId` 都能在 catalog 初始化阶段直接暴露。
- resolve 与 save regression 共用 `PHASE28_IDENTITY_COLLISION_CASES`，防止后续只修一条路径而另一条路径再次漂移。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `apps/server` 测试首次运行时读到了旧的 `packages/contracts/dist` manifest，导致 lookup 仍指向 `ne-admin1-us-washington`。重新执行 `tsc -p tsconfig.json` 刷新 contracts 运行时产物后，两条 server e2e 均通过。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- overseas identity collision 已经在 build-time 和 server lookup 两侧被阻断，Phase 28 后续工作可以基于唯一 authoritative ids 继续推进。
- 28-07 现在只需要聚焦 backfill race hardening，不再需要同时处理 Washington/DC 与 Buenos Aires identity 歧义。

## Self-Check: PASSED

- `FOUND: .planning/phases/28-overseas-coverage-expansion/28-06-SUMMARY.md`
- `FOUND: 47a4567`
- `FOUND: 0a07659`

---
*Phase: 28-overseas-coverage-expansion*
*Completed: 2026-04-22*
