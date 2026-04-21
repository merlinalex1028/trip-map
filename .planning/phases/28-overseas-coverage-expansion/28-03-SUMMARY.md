---
phase: 28-overseas-coverage-expansion
plan: 03
subsystem: testing
tags: [web, contracts, vitest, overseas, metadata, consumer-compatibility]
requires:
  - phase: 28-01
    provides: Phase 28 v3 geometry manifest and generated supported-country summary constants
provides:
  - generated-summary-backed unsupported overseas notice helper
  - Phase 28 authoritative overseas fixtures with v3 geometry refs
  - persisted-metadata consumer compatibility regressions for map and popup flows
affects: [phase-29-timeline, phase-30-statistics, web-map, contracts-fixtures]
tech-stack:
  added: []
  patterns: [generated-summary-backed copy, authoritative overseas fixtures, persisted-metadata replay regression]
key-files:
  created: [.planning/phases/28-overseas-coverage-expansion/28-03-SUMMARY.md]
  modified:
    - apps/web/src/constants/overseas-support.ts
    - packages/contracts/src/fixtures.ts
    - packages/contracts/src/contracts.spec.ts
    - apps/web/src/stores/map-points.spec.ts
    - apps/web/src/components/LeafletMapStage.spec.ts
    - apps/web/src/components/map-popup/PointSummaryCard.spec.ts
key-decisions:
  - "unsupported overseas notice 直接消费 generated SUPPORTED_OVERSEAS_COUNTRY_LABEL_ZH，不再维持 web 侧静态名单。"
  - "Phase 28 consumer regression 使用专用 PHASE28 authoritative fixtures，避免继续把旧 PHASE12 California fixture 当成当前 contract。"
  - "web map/popup regression 继续验证 persisted displayName/typeLabel/parentLabel/subtitle 直出，不引入 placeId fallback derivation。"
patterns-established:
  - "Generated-summary-backed copy helper: unsupported-country 文案只从 contracts generated summary 取源。"
  - "Authoritative overseas fixtures: Phase 28 fixtures 统一使用 canonical-authoritative-2026-04-21 + 2026-04-21-geo-v3 + overseas/layer.json。"
  - "Persisted metadata replay tests: map/popup consumer regression 围绕持久化 metadata 断言，而不是客户端二次推导。"
requirements-completed: [GEOX-02]
duration: 35min
completed: 2026-04-21
---

# Phase 28 Plan 03: Overseas Consumer Compatibility Summary

**Generated-summary-backed unsupported notice helper with Phase 28 overseas fixtures and persisted-metadata consumer regressions on v3 geometry refs**

## Performance

- **Duration:** 35 min
- **Started:** 2026-04-21T06:23:00Z
- **Completed:** 2026-04-21T06:57:37Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- unsupported-country 文案 helper 改为直接消费 generated `SUPPORTED_OVERSEAS_COUNTRY_LABEL_ZH` / `SUPPORTED_OVERSEAS_COUNTRY_SUMMARIES`，移除了 Phase 26 静态 8 国名单漂移点。
- contracts fixtures 新增 `PHASE28_RESOLVED_CALIFORNIA`、`PHASE28_RESOLVED_TOKYO` 与 13 国 `PHASE28_NEW_OVERSEAS_RECORD_FIXTURES`，统一对齐 `canonical-authoritative-2026-04-21`、`2026-04-21-geo-v3` 和 `overseas/layer.json`。
- web regression 明确证明 map store、Leaflet stage、popup 继续直吃 persisted `displayName` / `typeLabel` / `parentLabel` / `subtitle`，不会退回到 `placeId` 级 fallback derivation。

## Task Commits

Each task was committed atomically:

1. **Task 1: 把 unsupported-country copy 改成 generated summary 驱动，移除 Phase 26 静态名单** - `6b4b802` (fix)
2. **Task 2: 用 Phase 28 authoritative fixtures 对齐 contracts/web consumer regression，并切到 v3 geometry contract** - `bd01a67` (test)

## Files Created/Modified

- `apps/web/src/constants/overseas-support.ts` - 直接 re-export generated supported-country summary，并生成新的 unsupported overseas notice。
- `packages/contracts/src/fixtures.ts` - 新增 Phase 28 authoritative overseas fixtures 和统一的 v3 geometryRef helper。
- `packages/contracts/src/contracts.spec.ts` - 增加 Phase 28 fixture contract 断言，并把 legacy Phase 12 California fixture 明确降级为历史回归基线。
- `apps/web/src/stores/map-points.spec.ts` - 用 13 国表驱动用例验证 persisted metadata replay，不从 `placeId` 重新推导标签。
- `apps/web/src/components/LeafletMapStage.spec.ts` - 把 overseas authoritative fixture 与 geometry mock 切到 `overseas/layer.json` / `2026-04-21-geo-v3`。
- `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` - 把 popup authoritative overseas fixture 断言切到 `State` / `Prefecture` / `Province` 风格。

## Decisions Made

- unsupported 文案的支持国家摘要只从 contracts generated output 读取，避免 web 与 build-time authoring 双写。
- Phase 28 consumer compatibility 不再依赖 `PHASE12_RESOLVED_CALIFORNIA`；历史 fixture 仅保留给 legacy regression 使用。
- map/popup regression 显式覆盖新扩容的 13 个国家，确保 Phase 29/30 可以沿用 persisted metadata 真源。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 修正 LeafletMapStage spec 仍使用旧 v1 geometry dataset mock**
- **Found during:** Task 2
- **Issue:** `LeafletMapStage.spec.ts` 的 geometry manifest mock 仍返回 `2026-03-31-geo-v1`，导致验证时对 `overseas/layer.json` 的 v3 contract 断言失败。
- **Fix:** 把 spec 内 `GEOMETRY_DATASET_VERSION` 与相关 geometry manifest mock/expectation 统一升级到 `2026-04-21-geo-v3`。
- **Files modified:** `apps/web/src/components/LeafletMapStage.spec.ts`
- **Verification:** 重新运行 `pnpm --filter @trip-map/contracts build && pnpm --filter @trip-map/contracts test && pnpm --filter @trip-map/web test src/stores/map-points.spec.ts && pnpm --filter @trip-map/web test src/components/LeafletMapStage.spec.ts && pnpm --filter @trip-map/web test src/components/map-popup/PointSummaryCard.spec.ts`
- **Committed in:** `bd01a67`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** 该修正属于当前 plan 暴露出的旧 contract drift，收口后验证结果与计划目标一致，无额外 scope creep。

## Issues Encountered

- `LeafletMapStage.spec.ts` 初次验证时仍携带旧 v1 geometry dataset mock，导致 Phase 28 的 overseas v3 contract 断言失败；已在 Task 2 内联修复并重新验证通过。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 29/30 可以直接复用 generated supported-country summary 和 `PHASE28_*` fixtures，继续围绕 persisted metadata 做 timeline/statistics consumer regression。
- 当前 plan 范围内无 blocker；未触碰 runtime fallback 逻辑，后续 phase 不需要再为 map/popup label consistency 额外补 consumer-side derivation。

## Self-Check: PASSED

- Found `.planning/phases/28-overseas-coverage-expansion/28-03-SUMMARY.md`
- Found task commit `6b4b802`
- Found task commit `bd01a67`

---
*Phase: 28-overseas-coverage-expansion*
*Completed: 2026-04-21*
