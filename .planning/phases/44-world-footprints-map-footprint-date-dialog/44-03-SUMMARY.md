---
phase: 44-world-footprints-map-footprint-date-dialog
plan: 03
subsystem: ui
tags: [vue, vitest, leaflet, popup, footprint]
requires:
  - phase: 44-01
    provides: popup/date-dialog focused regression expectations
  - phase: 44-02
    provides: world-footprints popup shell styling baseline
provides:
  - unified place-information popup card without inline trip history
  - leaveFootprint event forwarding contract for the anchored popup shell
  - focused popup regression coverage for saved/unavailable surfaces
affects: [44-04, 44-05, LeafletMapStage, map-popup]
tech-stack:
  added: []
  patterns: [props-down-events-up popup CTA contract, unified popup place card]
key-files:
  created: [.planning/phases/44-world-footprints-map-footprint-date-dialog/44-03-SUMMARY.md]
  modified:
    - apps/web/src/components/map-popup/PointSummaryCard.vue
    - apps/web/src/components/map-popup/MapContextPopup.vue
    - apps/web/src/components/map-popup/PointSummaryCard.spec.ts
    - apps/web/src/components/map-popup/MapContextPopup.spec.ts
key-decisions:
  - "PointSummaryCard 不再承载旅行记录管理，只保留真实地点信息与 leaveFootprint 入口。"
  - "MapContextPopup 保留非模态 dialog 语义，仅负责转发 leaveFootprint。"
patterns-established:
  - "Popup CTA Pattern: 地点卡片统一输出无 payload 的 leaveFootprint 事件，由上层控制独立日期流程。"
  - "Saved Place Popup Pattern: 已保存地点沿用同一地点信息卡片布局，只补充文字提示，不展示历史记录面板。"
requirements-completed: [MAP-03, MAP-04, MAP-05, MAP-06]
duration: 15 min
completed: 2026-05-13
---

# Phase 44 Plan 03: Unified Popup Place Card Summary

**地图 popup 已收敛为统一地点信息卡片，移除了 inline 日期表单和已保存地点历史面板，并把 CTA 契约统一成 leaveFootprint 事件。**

## Performance

- **Duration:** 15 min
- **Started:** 2026-05-13T08:40:00Z
- **Completed:** 2026-05-13T08:54:41Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- `PointSummaryCard` 只保留真实地点信息、类型、地区文案和统一 `留下足迹` CTA。
- 已保存地点 popup 改为暖提示 `这里已经留下过足迹`，不再渲染 `PopupTripRecord`、`TripDateForm` 或 repeat 分支。
- `MapContextPopup` 透传 `leaveFootprint`，并用 focused specs 锁住 CTA 与可访问性契约。

## Task Commits

Each task was committed atomically:

1. **Task 1: 将 PointSummaryCard 改为统一地点信息卡片** - `8b4e7a1` (feat)
2. **Task 2: 让 MapContextPopup 转发 leaveFootprint 事件** - `17b6434` (feat)
3. **Task 3: 更新 popup focused specs 并转绿** - `ae3798e` (test)

## Files Created/Modified

- `apps/web/src/components/map-popup/PointSummaryCard.vue` - 删除 inline 日期表单、旧记录列表与 repeat 分支，统一为地点信息卡片 + `leaveFootprint` CTA。
- `apps/web/src/components/map-popup/MapContextPopup.vue` - 将 popup 事件契约改为 `leaveFootprint`，保留 `role="dialog"`、`aria-modal="false"` 和 `getPopupElement()`。
- `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` - 收紧已保存地点 CTA 与旧分支缺失断言。
- `apps/web/src/components/map-popup/MapContextPopup.spec.ts` - 收紧 `leaveFootprint` 转发与 popup 语义断言。

## Decisions Made

- 旧的旅行记录管理和 inline 日期输入不再属于地图 popup 范围，popup 只负责显示地点身份和提供统一入口。
- 不可保存地点仍保留 `留下足迹` CTA，但必须 disabled 并在本地表面解释原因。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `git commit` 初次执行命中 `.git/index.lock` 权限限制；改用提权 git 提交完成原子提交，未影响代码结果。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 44-04 / 44-05 可以直接复用当前 `leaveFootprint` 事件接入独立日期 Dialog 和 snapshot 提交流程。
- 工作区中仍存在未归属本计划的 `FootprintDateDialog.vue`、`FootprintDateDialog.spec.ts`、`map-point.ts` 改动，本计划未合并也未改写这些文件。

## Self-Check

PASSED

- Found summary file at `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-03-SUMMARY.md`
- Verified task commits `8b4e7a1`, `17b6434`, and `ae3798e` in git history
- Verified the last task commit introduced no tracked file deletions

---
*Phase: 44-world-footprints-map-footprint-date-dialog*
*Completed: 2026-05-13*
