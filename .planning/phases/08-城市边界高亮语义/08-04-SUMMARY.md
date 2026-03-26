---
phase: 08-城市边界高亮语义
plan: 04
subsystem: gap-closure
tags: [boundary-coverage, drawer-guardrail, regression, offline-geo]
requires:
  - phase: 08-城市边界高亮语义
    provides: Phase 8 主链路边界高亮实现与回归基线
provides:
  - 43 个 curated 城市的边界覆盖审计
  - Budapest / Nairobi 非 demo 城市边界高亮补齐
  - unsupported 城市的抽屉提示护栏
affects: [城市边界数据集, map-points 派生态, drawer 语义提示, Phase 08 UAT gap closure]
tech-stack:
  added: [none]
  patterns: [offline curated boundary coverage, fail-closed unsupported notice, coverage-first regression]
key-files:
  modified:
    - src/data/geo/city-boundaries.geo.json
    - src/data/geo/city-candidates.ts
    - src/services/city-boundaries.ts
    - src/services/city-boundaries.spec.ts
    - src/stores/map-points.ts
    - src/stores/map-points.spec.ts
    - src/components/PointPreviewDrawer.vue
    - src/components/PointPreviewDrawer.spec.ts
    - src/components/WorldMapStage.spec.ts
key-decisions:
  - "保留已发出的 6 个 boundaryId 不变，避免已保存记录的 restore / reopen 语义漂移。"
  - "coverage audit 只用 `curatedCityIds` 这 43 个主链路城市做硬性审计，同时额外覆盖 Budapest / Nairobi 作为 sparse-country 回归样例。"
  - "unsupported 提示只在 `cityId` 非空但本地无边界资产时显示；fallback / legacy 继续保持 not-applicable，不误导成城市边界场景。"
patterns-established:
  - "Coverage audit: `curatedCityIds` -> `curatedCitiesMissingBoundaryCoverage` -> CI 断言 43/0。"
  - "Boundary support state: `supported | missing | not-applicable` 由 store 派生，drawer 只消费这一层语义。"
  - "Gap regression: Budapest confirm/save/reopen 与 Santiago unsupported copy 都由自动化守护。"
requirements-completed: [BND-01, BND-02, BND-03, DAT-06]
duration: 7min
completed: 2026-03-26
---

# Phase 08 Plan 04: 边界覆盖补齐与 unsupported 护栏 Summary

**把 Phase 8 的问题从“逻辑缺陷”收敛回“数据覆盖缺口”，并用离线 curated 边界集与显式护栏把这个 gap 真正补平。**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-26T11:57:00+08:00
- **Completed:** 2026-03-26T12:04:03+08:00
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- 将 `city-boundaries.geo.json` 从 6 城扩展到 45 个离线城市 feature，覆盖全部 43 个 curated 城市，并额外补上 Budapest / Nairobi。
- 在 `city-boundaries.ts` 增加 `hasBoundaryCoverageForCityId`、`curatedCitiesMissingBoundaryCoverage`、`boundaryCoverageStats`，让覆盖退化直接在自动化里可见。
- 在 `map-points` 增加 `activeBoundaryCoverageState`，并在 `PointPreviewDrawer` 只对 unsupported 城市显示精确提示文案 `当前城市暂不支持边界高亮，将仅保存城市身份与文本信息`。
- 为 Budapest 的 confirm/save/reopen 高亮链路和 `cl-santiago` 的 unsupported 提示补齐回归，确保 supported / missing / not-applicable 三类语义都被覆盖。

## Task Commits

1. **Task 1: Expand boundary assets and add coverage audit** - `9a6bed4`
2. **Task 2: Add unsupported-boundary guardrail and regressions** - `b786c87`

## Files Created/Modified

- `src/data/geo/city-boundaries.geo.json` - 扩展离线边界数据到 45 个城市 feature，保留既有 6 个 shipped `boundaryId`。
- `src/data/geo/city-candidates.ts` - 导出 `curatedCityIds` / `curatedCityCount`，供边界 coverage audit 直接复用源数据。
- `src/services/city-boundaries.ts` - 增加 coverage audit 导出与 `hasBoundaryCoverageForCityId`。
- `src/services/city-boundaries.spec.ts` - 断言 curated 覆盖数为 43、缺口为 0，并锁住 Budapest / Nairobi / Osaka / Porto / New York。
- `src/stores/map-points.ts` - 增加 `activeBoundaryCoverageState`，统一 boundary support 语义。
- `src/stores/map-points.spec.ts` - 覆盖 Budapest confirm/save/reopen，以及 `cl-santiago` missing / fallback not-applicable。
- `src/components/PointPreviewDrawer.vue` - 对 unsupported 城市显示显式文案护栏。
- `src/components/PointPreviewDrawer.spec.ts` - 覆盖 unsupported 城市文案与 fallback/legacy 不误报。
- `src/components/WorldMapStage.spec.ts` - 覆盖 reopened Budapest 的 selected boundary highlight。

## Decisions Made

- 这轮 gap closure 不再改动高亮渲染机制本身，继续沿用 fail-closed 行为，只补齐离线边界资产与 UI 语义护栏。
- 覆盖审计聚焦产品主链路的 curated 城市集合，而不是对整个扩展城市库做硬性承诺，避免 verification 范围失控。
- unsupported 护栏只负责说明语义，不为无边界城市伪造 `boundaryId` 或引入 remembered highlight 状态。

## Deviations from Plan

### Minor Scope Extension

- 计划要求硬性审计 43 个 curated 城市；实现里同时把 Budapest / Nairobi 一并放入离线边界数据集，以闭合 Phase 07 已纳入回归的 sparse-country 样例。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 8 的 UAT gap 已被落地为可验证的代码与回归，接下来可直接进入 verifier / phase completion 流程。
- 后续若再扩充城市目录，只需继续沿用 `curatedCityIds` coverage audit 模式，不必重新依赖人工 UAT 发现缺口。

## Verification

- `pnpm test -- src/services/city-boundaries.spec.ts`
- `pnpm test -- src/stores/map-points.spec.ts src/components/PointPreviewDrawer.spec.ts src/components/WorldMapStage.spec.ts`
- `pnpm build`
- 确认 `boundaryCoverageStats.coveredCuratedCityCount === 43`
- 确认 `curatedCitiesMissingBoundaryCoverage.length === 0`

## Self-Check: PASSED

- Verified curated city boundary coverage now audits to `43 / 43`.
- Verified Budapest / Nairobi-style sparse-country samples resolve real boundary assets.
- Verified unsupported city records show the exact drawer notice while fallback / legacy records do not.
- Verified task commits `9a6bed4` and `b786c87` exist in git history.

---
*Phase: 08-城市边界高亮语义*
*Completed: 2026-03-26*
