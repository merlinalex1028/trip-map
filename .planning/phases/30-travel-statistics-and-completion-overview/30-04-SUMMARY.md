---
phase: 30-travel-statistics-and-completion-overview
plan: "04"
subsystem: api
tags: [statistics, prisma, vitest, contracts]
requires:
  - phase: 27-multi-visit-record-foundation
    provides: 多次旅行记录基础模型与 totalTrips/uniquePlaces 去重语义
  - phase: 28-overseas-coverage-expansion
    provides: authoritative parentLabel 元数据与支持国家 catalog
provides:
  - TravelStatsResponse 新增 visitedCountries 与 totalSupportedCountries
  - RecordsRepository 基于 parentLabel 第一段聚合已去过国家/地区数
  - 后端回归测试覆盖同国多地点与同地点多次旅行去重
affects: [records-stats-api, statistics-page, completion-context]
tech-stack:
  added: []
  patterns:
    - parentLabel 通过首个 ` · ` 分隔段归一到国家/地区桶
    - totalSupportedCountries 由 `SUPPORTED_OVERSEAS_COUNTRY_SUMMARIES.length + 1` 推导
key-files:
  created:
    - .planning/phases/30-travel-statistics-and-completion-overview/30-04-SUMMARY.md
  modified:
    - packages/contracts/src/stats.ts
    - apps/server/src/modules/records/records.repository.ts
    - apps/server/src/modules/records/records.service.spec.ts
key-decisions:
  - 使用 `parentLabel` 第一段作为国家/地区归一键，国内 `中国 · 省份` 与海外国家名共享同一聚合口径
  - 以 contracts 生成常量计算 `totalSupportedCountries`，让支持覆盖分母与 authoritative catalog 保持一致
  - 在现有 spec 文件内直接补 `RecordsRepository.getTravelStats` 单测，避免扩散测试面并满足最小改动约束
patterns-established:
  - 统计接口扩字段后，先补 contract，再补 repository 聚合与测试
  - 国家/地区完成度相关分母统一由 contracts catalog 提供，不在服务端硬编码
requirements-completed: [STAT-01, STAT-02, STAT-03]
duration: 5min
completed: 2026-04-23
---

# Phase 30 Plan 04: Stats Country Aggregation Summary

**旅行统计 contract 现已输出已去过国家/地区数与支持覆盖总数，后端按 parentLabel 国家桶去重聚合并补齐多地点/多次旅行回归测试。**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-23T09:41:30Z
- **Completed:** 2026-04-23T09:46:30Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- 扩展 `TravelStatsResponse`，让 `/records/stats` 可承载 `visitedCountries` 与 `totalSupportedCountries`
- 在 `RecordsRepository.getTravelStats()` 中增加 `distinct parentLabel` 查询，并按国家桶去重
- 为后端统计补上真实聚合语义测试，覆盖同国多地点与同地点多次旅行不放大国家计数

## Task Commits

Each task was committed atomically:

1. **Task 1: 扩展 TravelStatsResponse 合约 + build** - `a4b6264` (feat)
2. **Task 2: 后端 repository 国家聚合 + 测试** - `2a6df4a` (feat)

## Files Created/Modified

- `packages/contracts/src/stats.ts` - 将统计 contract 从 2 个字段扩展为 4 个字段
- `apps/server/src/modules/records/records.repository.ts` - 增加支持国家总数计算与 `parentLabel` 国家桶聚合
- `apps/server/src/modules/records/records.service.spec.ts` - 更新 stats 薄委托断言，并新增 repository 聚合回归测试
- `.planning/phases/30-travel-statistics-and-completion-overview/30-04-SUMMARY.md` - 记录本计划执行结果与验证

## Decisions Made

- 以 `parentLabel` 的首段作为国家/地区归一键，保证 `中国 · 北京`、`中国 · 上海` 只计入一次 `visitedCountries`
- 将 `null` `parentLabel` 归入 `"未知"` 桶，避免统计过程中出现空值分支
- `totalSupportedCountries` 直接由 `SUPPORTED_OVERSEAS_COUNTRY_SUMMARIES.length + 1` 得出，避免分母与支持 catalog 漂移

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `GET /records/stats` 已具备国家/地区维度数据，前端统计页可以直接消费 `visitedCountries` 与 `totalSupportedCountries`
- 后续如补齐完成度 UI，可复用当前 repository 聚合口径，无需再改后端去重语义

## Verification

- `pnpm --filter @trip-map/contracts build`
- `pnpm --filter @trip-map/server exec vitest run src/modules/records/records.service.spec.ts`
- `pnpm --filter @trip-map/server test`
- `rg -n "SUPPORTED_OVERSEAS_COUNTRY_SUMMARIES|visitedCountries|totalSupportedCountries|distinct: \\['parentLabel'\\]|indexOf\\(' · '\\)" apps/server/src/modules/records/records.repository.ts apps/server/src/modules/records/records.service.spec.ts`

## Self-Check: PASSED

- Found `.planning/phases/30-travel-statistics-and-completion-overview/30-04-SUMMARY.md`
- Found commit `a4b6264`
- Found commit `2a6df4a`

---
*Phase: 30-travel-statistics-and-completion-overview*
*Completed: 2026-04-23*
