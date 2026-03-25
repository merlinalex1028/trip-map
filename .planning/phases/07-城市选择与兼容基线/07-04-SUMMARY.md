---
phase: 07-城市选择与兼容基线
plan: 04
subsystem: offline-city-catalog
tags: [geo-data, offline-catalog, coverage-audit, vitest, gap-closure]
requires:
  - phase: 07-城市选择与兼容基线
    provides: 07-01/07-03 已建立的 `cityId` 契约、离线搜索入口与候选确认流
provides:
  - 覆盖 200+ 国家/地区的离线城市目录
  - 可审计的城市覆盖统计与缺口导出
  - 用自动化锁住目录规模、唯一性与关键国家多城市分布
affects: [phase-07, phase-08, geo-lookup, city-search, candidate-select]
tech-stack:
  added: []
  patterns:
    - 保留高精度核心城市坐标，同时为稀疏国家补 coverage-only 城市
    - 通过 `cityCoverageStats` / `countriesMissingCityCoverage` 让覆盖退化显式可见
key-files:
  created:
    - .planning/phases/07-城市选择与兼容基线/07-04-SUMMARY.md
    - src/data/geo/city-candidates.spec.ts
  modified:
    - src/data/geo/city-candidates.ts
key-decisions:
  - "在无网络条件下优先落地更大规模的离线目录，而不是继续手工追加少量样例城市"
  - "对没有真实坐标支撑的 coverage-only 城市保持保守策略：可展示为候选，但不直接升格为高置信城市命中"
  - "继续复用现有导出契约，避免 07-05 及后续 phase 出现接口 churn"
patterns-established:
  - "Catalog pattern: curated precise cities + broader coverage seeds + audit exports"
requirements-completed: [DEST-01, DEST-02, DEST-04]
duration: 23min
completed: 2026-03-25
---

# Phase 7: 07-04 Summary

**Phase 7 的剩余 root cause 已从“43 城 demo 表”升级为可审计的大覆盖离线城市目录，候选与搜索终于拥有足够大的基础数据面。**

## Accomplishments

- `src/data/geo/city-candidates.ts` 不再是固定 43 城列表，而是改成“核心精确城市 + 全球 coverage 城市”的组合目录。
- 新增 `cityCoverageStats` 和 `countriesMissingCityCoverage`，让城市覆盖规模、覆盖国家数和剩余缺口都可以直接被代码和测试消费。
- 对只有 bbox 中心坐标的 coverage-only 城市采用保守配置，避免它们被误判为 `city-high`，只作为候选补位与搜索兜底使用。

## Verification

- `pnpm test -- src/data/geo/city-candidates.spec.ts`
- 结果：通过，当前目录达到 328 个城市、228 个国家/地区 code，关键国家（JP/US/FR/GB/CN/IN/AU/CA）均有多个地理分散城市。

## Key Files

- `src/data/geo/city-candidates.ts` - 重建城市目录、自动生成 context/country 索引，并导出覆盖统计
- `src/data/geo/city-candidates.spec.ts` - 锁住规模阈值、唯一性、国家码合法性和关键国家多城市分布

## Notes

- 这一步只解决“数据面太小”的根因，还没有完成 lookup / drawer / UAT 风格回归的最终收口；这些在 `07-05` 继续完成。

