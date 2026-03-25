---
phase: 07-城市选择与兼容基线
plan: 05
subsystem: city-candidate-consumers
tags: [geo-lookup, city-search, drawer, vitest, build, gap-closure]
requires:
  - phase: 07-城市选择与兼容基线
    provides: 07-04 的扩展离线城市目录与覆盖统计导出
provides:
  - top 3 候选输出与保守 fallback 语义
  - 43 城之外的中英文搜索回归
  - 稀疏国家点击、搜索命中、已存在记录复用的 UAT 风格自动化样例
affects: [phase-07, phase-08, geo-lookup, city-search, point-preview-drawer, world-map-stage]
tech-stack:
  added: []
  patterns:
    - lookup/search/drawer 统一消费同一份扩展目录
    - coverage-only 城市只作为候选补位，不破坏原有国家级 fallback
key-files:
  created:
    - .planning/phases/07-城市选择与兼容基线/07-05-SUMMARY.md
  modified:
    - src/services/geo-lookup.ts
    - src/services/geo-lookup.spec.ts
    - src/services/city-search.spec.ts
    - src/components/PointPreviewDrawer.spec.ts
    - src/components/WorldMapStage.spec.ts
key-decisions:
  - "lookup 对 UI 只暴露 top 3 候选，避免扩容后把抽屉重新变成冗长列表"
  - "即使目录扩大，也保留原有 fallback copy 和 `confirmPendingCitySelection` 统一收口"
  - "把 Budapest / Nairobi 这类原 43 城之外的样例写进回归，确保问题不再只在 verify-work 中暴露"
patterns-established:
  - "Consumer pattern: expanded offline catalog -> ranked top 3 -> shared confirm/reuse flow"
requirements-completed: [DEST-01, DEST-02, DEST-04, DEST-05]
duration: 19min
completed: 2026-03-25
---

# Phase 7: 07-05 Summary

**扩展后的离线目录已经真正接入 lookup、搜索与抽屉链路，Phase 7 最后的 UAT 缺口现在同时在行为层和回归层被收口。**

## Accomplishments

- `geo-lookup` 现在只向 UI 输出排名前 3 的候选，并对 coverage-only 城市保持保守，不再把它们误判成高置信城市。
- 搜索回归扩展到了原 43 城之外的中文/英文样例，确认 `searchOfflineCities` 的结果仍然兼容现有 `GeoCityCandidate` / `confirmPendingCitySelection` 流。
- 抽屉和地图点击回归新增 Budapest / Nairobi 等稀疏国家样例，并补上“已存在记录”复用断言，避免这轮问题再次只在手工验收时出现。

## Verification

- `pnpm test -- src/services/geo-lookup.spec.ts src/services/city-search.spec.ts src/components/PointPreviewDrawer.spec.ts src/components/WorldMapStage.spec.ts src/data/geo/city-candidates.spec.ts`
- `pnpm build`

## Key Files

- `src/services/geo-lookup.ts` - 排序后裁剪 top 3，并把 coverage-only 城市保持在候选补位层
- `src/services/geo-lookup.spec.ts` - 新增 Budapest / Nairobi 真实点击回归
- `src/services/city-search.spec.ts` - 新增原 43 城之外的中文/英文搜索样例
- `src/components/PointPreviewDrawer.spec.ts` - 新增扩展目录搜索复用已有记录断言
- `src/components/WorldMapStage.spec.ts` - 新增稀疏国家真实点击进入候选确认断言

## Notes

- `07-UAT.md` 仍保留旧的 diagnose 记录，建议下一步再跑一次 `$gsd-verify-work 7`，把这轮修复转换成新的用户视角验收结论。

