---
phase: 29-timeline-page-and-account-entry
plan: 02
subsystem: ui
tags: [timeline, pinia, vitest, sorting, travel-records]
requires:
  - phase: 27-multi-visit-record-foundation
    provides: trip-level travel records with optional startDate/endDate
  - phase: 28-overseas-coverage-expansion
    provides: stable displayName/typeLabel/parentLabel/subtitle metadata on each travel record
provides:
  - buildTimelineEntries pure helper for earliest-first timeline normalization
  - map-points timelineEntries selector derived directly from raw travelRecords
  - regression coverage for unknown-date ordering and same-place multi-visit splitting
affects: [29-03, 29-04, timeline-page, travel-stats]
tech-stack:
  added: []
  patterns:
    - pure timeline normalization helper in services
    - Pinia computed selector delegating to shared normalization logic
key-files:
  created:
    - apps/web/src/services/timeline.ts
    - apps/web/src/services/timeline.spec.ts
  modified:
    - apps/web/src/stores/map-points.ts
    - apps/web/src/stores/map-points.spec.ts
key-decisions:
  - "时间轴数据直接从 travelRecords 派生，不复用 displayPoints 的按地点去重结果。"
  - "排序固定为已知日期最早优先、未知日期后置，createdAt 只做稳定性 tie-break。"
  - "visitOrdinal 与 visitCount 基于全局排序后的同 placeId 记录生成，保证同地点多次去访可独立展示。"
patterns-established:
  - "Pattern 1: 纯数据排序和编号逻辑放在 services/timeline.ts，便于页面和 store 复用。"
  - "Pattern 2: store 只暴露 timelineEntries 数据字段，不硬编码任何 timeline 文案。"
requirements-completed: [TRIP-05]
duration: 6 min
completed: 2026-04-23
---

# Phase 29 Plan 02: Timeline Data Layer Summary

**Pure timeline entry normalization from raw travel records with earliest-first sorting, unknown-date last ordering, and per-place visit sequencing**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-23T03:21:00Z
- **Completed:** 2026-04-23T03:27:38Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- 新建 `buildTimelineEntries`，把每条 `TravelRecord` 归一化为稳定排序的时间轴 entry，并保留同地点多次去访。
- 锁定“已知日期最早优先、未知日期后置、`createdAt` 仅作稳定 tie-break”的排序规则。
- 在 `map-points` store 暴露 `timelineEntries` selector，同时补齐 service/store 两层回归测试。

## Task Commits

Each task was committed atomically:

1. **Task 1: 新建 timeline helper，派生逐条旅行记录的时间轴 entry** - `15b8e84` (feat)
2. **Task 2: 在 map-points store 中暴露 timelineEntries selector，但不破坏现有地图语义** - `68a2742` (feat)

## Files Created/Modified
- `apps/web/src/services/timeline.ts` - 定义 `TimelineEntry` 与 `buildTimelineEntries`，统一时间轴排序和 visit 编号。
- `apps/web/src/services/timeline.spec.ts` - 覆盖最早优先、未知日期后置和同地点多次去访拆分语义。
- `apps/web/src/stores/map-points.ts` - 新增只读 `timelineEntries` selector，直接委托 timeline helper。
- `apps/web/src/stores/map-points.spec.ts` - 验证 store 侧不会把同地点两条记录压成一条，且未知日期排在已知日期之后。
- `.planning/phases/29-timeline-page-and-account-entry/29-02-SUMMARY.md` - 记录本计划的实现、验证和提交结果。

## Decisions Made
- 时间轴 helper 以 `TravelRecord` 为唯一输入真源，避免页面误用 `displayPoints` 导致多次去访丢失。
- `hasKnownDate` 按 `startDate !== null` 判定，`sortDate` 对已知日期使用 `endDate ?? startDate`，确保展示语义与排序语义一致。
- 同地点 visit 序号基于全局排序结果回填，保证“第几次去访”与时间轴展示顺序保持一致。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 时间轴页面可以直接消费 `useMapPointsStore().timelineEntries`，不再依赖 `displayPoints` 去重视图。
- 同地点多次去访、未知日期后置和稳定排序语义已经在 service/store 两层锁定。
- 按用户要求，本次未更新 `.planning/STATE.md` 或 `.planning/ROADMAP.md`；这些元数据由 orchestrator 统一维护。

## Self-Check: PASSED

- Confirmed summary file exists at `.planning/phases/29-timeline-page-and-account-entry/29-02-SUMMARY.md`
- Confirmed task commits `15b8e84` and `68a2742` exist in git history
