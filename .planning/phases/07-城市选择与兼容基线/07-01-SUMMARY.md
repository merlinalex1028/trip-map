---
phase: 07-城市选择与兼容基线
plan: 01
subsystem: geo-selection
tags: [city-id, geo-lookup, pinia, localstorage, vitest]
requires:
  - phase: 02-国家级真实地点识别
    provides: 国家/地区离线命中、保守边界判定与基础 geo lookup 链路
  - phase: 03-点位闭环与本地持久化
    provides: draft/saved 点位状态模型与本地持久化快照结构
provides:
  - 稳定 `cityId` 和 `cityContextLabel` 的点位字段
  - 带排序和状态提示的城市候选 lookup 契约
  - 基于 `cityId` 的已保存城市复用 helper
  - 对缺失城市字段的 v1 快照兼容读取
affects: [07-02, phase-08, city-selection, persistence]
tech-stack:
  added: []
  patterns:
    - 稳定城市身份通过 `cityId` 贯穿 detection/store/storage
    - 旧快照新增字段一律以 `null` 容错，不触发强制迁移
key-files:
  created:
    - .planning/phases/07-城市选择与兼容基线/07-01-SUMMARY.md
  modified:
    - src/services/geo-lookup.ts
    - src/types/geo.ts
    - src/types/map-point.ts
    - src/services/point-storage.ts
    - src/stores/map-points.ts
    - src/data/geo/city-candidates.ts
key-decisions:
  - "城市候选输出不再只给单一 cityName，而是返回稳定 cityId、contextLabel、matchLevel 和 statusHint"
  - "v1 快照继续使用 version 1，但新增城市字段缺失时统一归一化为 null"
  - "重复城市复用基于 cityId，而不是 cityName 文本"
patterns-established:
  - "Geo lookup pattern: 返回候选数组 + fallbackNotice，而不是只返回单一展示名"
  - "Persistence pattern: 新字段向后兼容读取，向前稳定写回"
requirements-completed: [DEST-01, DEST-04, DEST-05, DAT-05]
duration: 8min
completed: 2026-03-25
---

# Phase 7: 城市选择与兼容基线 Summary

**城市优先选择的底层语义已从单点 cityName 增强为稳定 `cityId`、候选排序结果和兼容旧快照的复用链路**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-25T13:08:21+08:00
- **Completed:** 2026-03-25T13:16:48+08:00
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- `geo-lookup` 现在能返回稳定 `cityId`、候选数组、状态提示和明确 fallback 文案，而不是只给一个临时城市名。
- `point-storage` 与 `map-point` 类型已支持 `cityId` / `cityContextLabel`，并对缺失这些字段的 v1 快照保持兼容。
- `map-points` 新增按 `cityId` 复用已有记录的 helper，为 wave 2 的候选确认 UI 提供统一入口。

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand city candidate and geo-lookup contracts into ranked candidate outputs with stable city identity** - `9c226aa` (`test`), `abcc72c` (`feat`)
2. **Task 2: Extend persisted point models and map-point state for legacy-safe city identity and reuse indexing** - `9b2e618` (`test`), `53f838e` (`feat`)

_Note: TDD tasks used test → feat commit pairs._

## Files Created/Modified
- `src/data/geo/city-candidates.ts` - 为城市候选补充稳定 `id` 和 `contextLabel`
- `src/types/geo.ts` - 定义 `GeoCityCandidate` 与扩展后的 detection 结果
- `src/services/geo-lookup.ts` - 生成排序后的候选数组、状态提示和 fallback 文案
- `src/types/map-point.ts` - 为点位模型增加 `cityId` / `cityContextLabel`
- `src/services/point-storage.ts` - 对新城市字段做向后兼容归一化
- `src/stores/map-points.ts` - 新增 `findSavedPointByCityId` 和复用决策 helper
- `src/components/WorldMapStage.vue` - 把城市身份字段带进 draft 点位

## Decisions Made
- 使用稳定 `cityId` 作为重复城市复用主键，而不是 `cityName`
- 保留现有快照版本号不变，通过读取时补默认值实现兼容
- 在 service 层就输出候选排序和状态提示，避免后续 UI 自己拼接识别语义

## Deviations from Plan

### Auto-fixed Issues

**1. [Blocking] 补充 point object 构造链路中的城市身份字段**
- **Found during:** Task 2
- **Issue:** 计划主要聚焦 types/storage/store，但现有 `seed-points` 和 `WorldMapStage` 仍在构造缺少 `cityId` / `cityContextLabel` 的点对象，后续会造成类型与运行时语义脱节。
- **Fix:** 同步在 `src/data/seed-points.ts` 和 `src/components/WorldMapStage.vue` 中补齐城市身份字段传递。
- **Files modified:** `src/data/seed-points.ts`, `src/components/WorldMapStage.vue`
- **Verification:** Wave 1 测试组全绿，point model / storage / store / world-map 相关用例一致通过。
- **Committed in:** `53f838e`

---

**Total deviations:** 1 auto-fixed
**Impact on plan:** 仅补足 plan 隐含依赖，没有扩 scope；这样 wave 2 可以直接复用统一的城市身份字段。

## Issues Encountered
- 子代理在 wave 1 收尾阶段卡住，只完成了 TDD 提交和部分实现，没有生成 SUMMARY。后续由主代理接手补完 `point-storage` / `map-points` 实现，并重跑验证后完成闭环。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Wave 2 现在可以直接消费稳定 `cityId`、候选数组、fallback 文案和复用 helper，不需要再重新定义数据契约。
- 目前没有已知 blocker；下一步就是把候选先行面板、轻量搜索、国家/地区回退和复用提示接到现有 drawer / map 交互里。

---
*Phase: 07-城市选择与兼容基线*
*Completed: 2026-03-25*
