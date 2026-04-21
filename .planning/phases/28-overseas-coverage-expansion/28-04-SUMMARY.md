---
phase: 28-overseas-coverage-expansion
plan: 04
subsystem: geo
tags: [geo, contracts, server-tests, dataset-version, gap-closure]
requires:
  - phase: 28-01
    provides: 21 国 overseas support matrix 与 Phase 28 metadata authoring
  - phase: 28-02
    provides: manifest-backed canonical resolve 与 records authoritative 校验
  - phase: 28-03
    provides: generated supported-country summaries 与 web consumer regressions
provides:
  - geometry shard feature metadata 恢复 canonical datasetVersion 语义
  - server/contracts 回归统一断言 canonical datasetVersion 与 geometryRef split
  - PHASE11_* / PHASE12_* 历史 fixtures 恢复基线，PHASE28_* fixtures 继续承载当前 authoritative 语义
affects: [phase-28-verification, phase29-timeline, phase30-statistics, overseas-record-backfill]
tech-stack:
  added: []
  patterns:
    - shard metadata 保留 canonical datasetVersion，geometry version 只出现在 manifest/geometryRef
    - 历史 fixtures 冻结历史语义，新 phase 的 authoritative 语义只进入 phase-specific fixtures
key-files:
  created:
    - .planning/phases/28-overseas-coverage-expansion/28-04-SUMMARY.md
  modified:
    - apps/web/scripts/geo/build-geometry-manifest.mjs
    - apps/web/public/geo/2026-04-21-geo-v3/cn/layer.json
    - apps/web/public/geo/2026-04-21-geo-v3/overseas/layer.json
    - packages/contracts/src/generated/geometry-manifest.generated.ts
    - apps/server/test/phase28-overseas-cases.ts
    - apps/server/test/canonical-resolve.e2e-spec.ts
    - apps/server/test/records-travel.e2e-spec.ts
    - apps/server/test/records-import.e2e-spec.ts
    - apps/server/test/record-metadata-backfill.e2e-spec.ts
    - packages/contracts/src/fixtures.ts
    - packages/contracts/src/contracts.spec.ts
key-decisions:
  - "generated geometry manifest 仅新增 canonicalDatasetVersion 注释 header，避免为验收再引入新的 runtime truth source"
  - "PHASE11_* / PHASE12_* fixtures 恢复历史标签语义，Phase 28 authoritative baseline 继续只留在 PHASE28_* fixtures"
patterns-established:
  - "Canonical datasetVersion comes from shard metadata authored at build time; geometry version remains manifest-only"
  - "Historical fixtures remain immutable snapshots; current semantics live in explicit Phase 28 fixtures"
requirements-completed: [GEOX-01, GEOX-02]
duration: 19min
completed: 2026-04-21
---

# Phase 28 Plan 04: Overseas Coverage Expansion Summary

**Phase 28 geometry shards now keep canonical authoritative `datasetVersion`, while server/contracts regressions and historical fixtures are realigned around that split**

## Performance

- **Duration:** 19 min
- **Started:** 2026-04-21T10:05:42Z
- **Completed:** 2026-04-21T10:24:42Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- 移除了 `build-geometry-manifest.mjs` 中对 feature `datasetVersion` 的 geometry-version 覆盖，重新生成了 Phase 28 CN / overseas shard 产物。
- `canonical-resolve`、`records-travel`、`records-import`、`record-metadata-backfill` 与共享 13 国矩阵全部改回 canonical authoritative `datasetVersion` 断言，同时保留 `geometryRef.geometryDatasetVersion` 的几何版本断言。
- `PHASE11_*` / `PHASE12_*` fixtures 恢复为历史中文标签 baseline，`PHASE28_*` fixtures 继续独立承载当前 authoritative Phase 28 语义。

## Task Commits

Each task was committed atomically:

1. **Task 1: 停止 shard feature 覆盖 canonical datasetVersion，并重新生成 Phase 28 产物** - `a5d1ccf` (fix)
2. **Task 2: 统一 server/contracts 断言到 canonical datasetVersion，并恢复历史 fixture baseline** - `3767d7c` (fix)

**Plan metadata:** None - per wave execution request, `STATE.md` / `ROADMAP.md` were intentionally left untouched.

## Files Created/Modified

- `apps/web/scripts/geo/build-geometry-manifest.mjs` - 移除 feature `datasetVersion` 覆盖，并给 generated manifest header 加入 canonical datasetVersion 注释。
- `apps/web/public/geo/2026-04-21-geo-v3/cn/layer.json` - 重新生成 CN shard，恢复 canonical authoritative `datasetVersion`。
- `apps/web/public/geo/2026-04-21-geo-v3/overseas/layer.json` - 重新生成 overseas shard，恢复 canonical authoritative `datasetVersion`。
- `packages/contracts/src/generated/geometry-manifest.generated.ts` - 重新生成 geometry manifest，并显式标记 canonical/geometry dataset version 的 header 元信息。
- `apps/server/test/phase28-overseas-cases.ts` - 13 国共享矩阵改为 canonical authoritative datasetVersion 预期。
- `apps/server/test/canonical-resolve.e2e-spec.ts` - resolve 响应断言统一到 canonical `datasetVersion`，几何版本仍在 `geometryRef`。
- `apps/server/test/records-travel.e2e-spec.ts` / `apps/server/test/records-import.e2e-spec.ts` / `apps/server/test/record-metadata-backfill.e2e-spec.ts` - authoritative / legacy / backfill 场景全部切回 canonical metadata reality。
- `packages/contracts/src/fixtures.ts` / `packages/contracts/src/contracts.spec.ts` - 恢复 Phase 11/12 历史语义，并把 Phase 28 fixtures 的 authoritative 断言单独隔离。

## Decisions Made

- 只修复现有 build pipeline 内的 split-brain，不新增 `canonicalDatasetVersion` 之类的运行时字段，避免引入第二份 truth source。
- 为了让 generated artifact 可直接核对 canonical 语义，只在 generated TS header 注释里写入 canonical datasetVersion，不新增导出常量或 manifest 字段。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 为 generated manifest 增加 canonical datasetVersion header 注释**

- **Found during:** Task 1
- **Issue:** `geometry-manifest.generated.ts` 原先只在 header 里暴露 geometry dataset version；即使产物内容已正确重生，也缺少一眼可核对的 canonical 语义信号。
- **Fix:** 在 `build-geometry-manifest.mjs` 的 generated header 中补充 `canonicalDatasetVersion` 注释，仅提升 artifact auditability，不新增任何 runtime 字段或导出。
- **Files modified:** `apps/web/scripts/geo/build-geometry-manifest.mjs`, `packages/contracts/src/generated/geometry-manifest.generated.ts`
- **Verification:** `pnpm --filter @trip-map/web geo:build`, `pnpm --filter @trip-map/contracts build`, `rg -n "canonical-authoritative-2026-04-21|SUPPORTED_OVERSEAS_COUNTRY_SUMMARIES|GEOMETRY_MANIFEST" packages/contracts/src/generated/geometry-manifest.generated.ts`
- **Committed in:** `a5d1ccf` (part of Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** 仅补齐 generated artifact 的可审计性，没有扩张 runtime contract，也没有引入新的 truth source。

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- build/server/contracts 之间关于 authoritative `datasetVersion` 的 split-brain 已收口，Phase 28 verification 可以直接复核这条 blocker。
- 历史 fixtures 已恢复为历史基线，后续回归可以明确区分 legacy baseline 与 Phase 28 authoritative baseline。
- 剩余的 Phase 28 blocker 只剩 `userTravelRecord` backfill 与 bootstrap/sync 升级链路，适合在 `28-05` 聚焦处理。

## Self-Check: PASSED

- Found summary file: `.planning/phases/28-overseas-coverage-expansion/28-04-SUMMARY.md`
- Found commit: `a5d1ccf`
- Found commit: `3767d7c`

---
*Phase: 28-overseas-coverage-expansion*
*Completed: 2026-04-21*
