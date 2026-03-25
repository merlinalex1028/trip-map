---
phase: 07-城市选择与兼容基线
plan: 03
subsystem: offline-city-search
tags: [geo-lookup, offline-search, vue, vitest, chinese-search, gap-closure]
requires:
  - phase: 07-城市选择与兼容基线
    provides: 07-01 的稳定 `cityId` 契约与 07-02 的候选确认抽屉 / 统一复用链路
provides:
  - 更广覆盖的离线城市索引与别名数据
  - 面向 geo lookup 的国家级候选补充
  - 支持中文/英文输入的离线城市搜索 helper
affects: [phase-08, geo-lookup, city-search, candidate-select, uat-gap-closure]
tech-stack:
  added: []
  patterns:
    - 抽屉搜索改为离线索引检索，不再依赖当前候选池是否为空
    - 候选点击与搜索点击继续共享 `confirmPendingCitySelection`
key-files:
  created:
    - .planning/phases/07-城市选择与兼容基线/07-03-SUMMARY.md
    - src/services/city-search.ts
    - src/services/city-search.spec.ts
  modified:
    - src/data/geo/city-candidates.ts
    - src/services/geo-lookup.ts
    - src/components/PointPreviewDrawer.vue
    - src/components/WorldMapStage.spec.ts
key-decisions:
  - "优先用更完整的离线城市索引关闭 UAT 缺口，而不是在 Phase 7 引入在线搜索"
  - "搜索结果仍返回 `GeoCityCandidate` 形状，避免新开一条 search-only 保存分支"
  - "中文搜索通过城市别名命中，英文搜索继续走原始城市名 / 上下文匹配"
patterns-established:
  - "Offline search pattern: query -> offline index -> `GeoCityCandidate` -> `confirmPendingCitySelection`"
  - "Coverage pattern: geo lookup 的国家候选和抽屉搜索都从同一份离线城市索引派生"
requirements-completed: [DEST-01, DEST-02, DEST-04]
duration: 21min
completed: 2026-03-25
---

# Phase 7: 城市选择与兼容基线 Summary

**Phase 7 的 UAT 缺口已通过更广离线城市索引和中文/英文可用搜索收口，城市确认不再局限于最初的演示城市集合**

## Performance

- **Duration:** 21 min
- **Started:** 2026-03-25T13:56:00+08:00
- **Completed:** 2026-03-25T14:17:51+08:00
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- `geo-lookup` 现在不再只依赖 5 个演示城市，常见国家点击也能得到城市候选。
- 新增 `city-search` 离线检索 helper，抽屉搜索可在候选池为空时通过中文或英文城市名搜出结果。
- 搜索命中的结果仍走原有 `confirmPendingCitySelection` 复用 / 建草稿链路，没有引入新的分叉流程。

## Task Commits

Plan tasks were delivered in one integrated execution commit:

1. **Task 1 + Task 2: broaden offline city coverage, add offline city search, and close Phase 7 UAT gaps** - `552e97e` (`feat`)

**Plan metadata:** `171c1d8` (`docs(07): add gap closure plan for city search coverage`)

## Files Created/Modified
- `src/data/geo/city-candidates.ts` - 将候选数据扩展为可复用的离线城市索引，加入国家分组、上下文键和中文别名
- `src/services/geo-lookup.ts` - 候选池改为 context + country 双来源聚合，避免大面积空候选
- `src/services/city-search.ts` - 新增中文/英文离线城市检索与排序
- `src/components/PointPreviewDrawer.vue` - 搜索查询切到离线检索 helper，而不是只过滤当前候选池
- `src/services/geo-lookup.spec.ts` - 新增 Paris / New York 这类非 demo 覆盖
- `src/services/city-search.spec.ts` - 新增中文搜索、英文搜索和空查询回归
- `src/components/PointPreviewDrawer.spec.ts` - 覆盖空候选池下的中文搜索救援
- `src/components/WorldMapStage.spec.ts` - 覆盖真实 Paris 点击出现候选

## Decisions Made
- 先用离线索引扩大覆盖并支持中文别名，保持 Phase 7 的“纯本地静态数据”边界不变。
- 搜索 helper 直接返回 `GeoCityCandidate`，这样无需改 store 契约也能把搜索接进同一条确认流。
- 真实 UAT 暴露的问题优先通过“更贴近真实使用的数据与回归样例”收口，而不是继续依赖 mock 候选。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- 扩充离线城市索引后，`WorldMapStage.spec.ts` 中几个使用真实 `geo-lookup` 动态导入的测试变慢，导致默认 5 秒超时。已将这些真实 lookup 回归用例的超时时间放宽到 15 秒，功能断言本身保持不变。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 7 的主要 UAT 缺口已在代码和自动化层面被关闭，下一步可以回到 `gsd-verify-work 7` 做一次简短复验，确认用户视角下的问题确实消失。
- Phase 8 现在可以建立在更可信的城市选择结果之上，不会再被“候选大面积为空 / 搜索无结果”这类基础问题拖住。

---
*Phase: 07-城市选择与兼容基线*
*Completed: 2026-03-25*
