---
phase: 39-map-popup
plan: 01
subsystem: ui
tags: [vue, pinia, map-popup, edit-delete, travel-records]

# Dependency graph
requires:
  - phase: 38-ui
    provides: TimelineEditForm, ConfirmDialog, TagInput edit/delete components
  - phase: 36-backend
    provides: updateRecord/deleteSingleRecord API + store methods
provides:
  - PopupTripRecord — compact per-record card with inline edit/delete for map popup
  - PointSummaryCard per-record PopupTripRecord list replacing static trip-summary
  - Edit/delete entry point from map view for travel records
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "PopupTripRecord follows TimelineVisitCard pattern: real Pinia store, spy on updateRecord/deleteSingleRecord"
    - "PointSummaryCard accesses mapPointsStore.tripsByPlaceId directly (no storeToRefs) via vi.mock in tests"

key-files:
  created:
    - apps/web/src/components/map-popup/PopupTripRecord.vue
    - apps/web/src/components/map-popup/PopupTripRecord.spec.ts
  modified:
    - apps/web/src/components/map-popup/PointSummaryCard.vue
    - apps/web/src/components/map-popup/PointSummaryCard.spec.ts
    - apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts
    - apps/web/src/components/map-popup/MapContextPopup.spec.ts
    - apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts
    - apps/web/src/components/LeafletMapStage.spec.ts

key-decisions:
  - "PopupTripRecord mirrors TimelineVisitCard pattern (Pinia store, spy methods) for consistency"
  - "PointSummaryCard tests use vi.mock for map-points store instead of real Pinia to minimize test changes"
  - "MapContextPopup/MapContextPopup.kawaii and LeafletMapStage specs also needed store mocks for Pinia access"

requirements-completed: []

# Metrics
duration: 12min
completed: 2026-04-29
---

# Phase 39 Plan 01: Map Popup 集成与端到端闭环 Summary

**PopupTripRecord 组件 + PointSummaryCard 集成，让用户可以在地图 popup 中编辑/删除旅行记录**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-29T14:20:00Z
- **Completed:** 2026-04-29T14:32:00Z
- **Tasks:** 2 (1 TDD)
- **Files modified:** 8

## Accomplishments

- 创建 `PopupTripRecord.vue` — 地图 popup 专用的紧凑型每条记录显示卡片，支持只读/编辑/删除三种模式
- 只读模式：显示日期范围、备注预览（前 80 字符）、标签 pill chips（最多 3 个 + "+N more"）
- 编辑模式：内联显示 `TimelineEditForm`（复用 Phase 38 组件），支持日期冲突检测
- 删除模式：`ConfirmDialog` 弹窗，最后一条记录使用 destructive 风格警告
- `PointSummaryCard` 集成：用 per-record PopupTripRecord 列表替换静态 trip-summary，保留"再记一次去访"按钮
- 覆盖 11 个 TDD 测试用例 + 新增强度测试（popup-records 渲染条件）
- 更新 LeafletMapStage 集成测试以使用新的 per-record 断言

## Task Commits

Each task was committed atomically:

1. **Task 1 (TDD): Create PopupTripRecord component with per-record edit/delete UI** — `c77b940` (feat)
2. **Task 2: Integrate PopupTripRecord into PointSummaryCard + update MapContextPopup + verify** — `2c38350` (feat)

**Plan metadata:** TBD (final commit)

_Note: Task 1 followed TDD (RED → GREEN). Test file created first, then component._

## Files Created/Modified

### Created
- `apps/web/src/components/map-popup/PopupTripRecord.vue` — Compact per-record card with read/edit/delete modes for map popup
- `apps/web/src/components/map-popup/PopupTripRecord.spec.ts` — 11 test cases covering date display, notes/tags rendering, edit/delete flow, date conflicts

### Modified
- `apps/web/src/components/map-popup/PointSummaryCard.vue` — Replaced static trip-summary with per-record PopupTripRecord list, added `mapPointsStore` access, `buildTimelineEntries` conversion
- `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` — Added store mock, updated trip-summary tests to per-record assertions, added 3 new popup-records tests
- `apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts` — Added store mock for Pinia dependency
- `apps/web/src/components/map-popup/MapContextPopup.spec.ts` — Added store mock for Pinia dependency
- `apps/web/src/components/map-popup/MapContextPopup.kawaii.spec.ts` — Added store mock for Pinia dependency
- `apps/web/src/components/LeafletMapStage.spec.ts` — Updated integration tests to use `data-region="popup-records"` and per-record assertions

## Decisions Made

- **PopupTripRecord 模式遵循 TimelineVisitCard**: 使用真实 Pinia store + vi.spyOn，与 Phase 38 编辑/删除模式保持一致
- **PointSummaryCard 使用 vi.mock**: 为了最小化测试改动，使用模块级 mock 而不是修改所有 mount 调用添加 Pinia
- **MapContextPopup 系列测试也需 store mock**: PointSummaryCard 现在在 setup 中调用 useMapPointsStore()，所有挂载 PointSummaryCard 的测试都需要提供 store 上下文
- **LeafletMapStage 集成测试更新**: `data-trip-summary-count` / `data-trip-summary-latest` 被替换为 `data-region="popup-records"` + `data-region="popup-trip-record"` 断言

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **storeToRefs 与 vi.mock 不兼容**: PointSummaryCard 采用直接访问 `mapPointsStore.tripsByPlaceId`（不使用 storeToRefs），因为 mocked store 的普通 Map 不会被 storeToRefs 识别。PopupTripRecord 本身在其自己的 spec 中使用真实 Pinia，正常使用 storeToRefs
- **PointSummaryCard 的 kawaii spec 也需要 store mock**: 因为 PointSummaryCard 现在在 setup 中初始化 Pinia store，所有挂载它的测试都需要 store 上下文
- **LeafletMapStage 集成测试需要更新**: `data-trip-summary-count` 元素被移除，测试改为验证 per-record PopupTripRecord 的渲染和排序

## Next Phase Readiness

- **Phase 39 完成**: Map popup 现在支持完整的编辑/删除工作流
- 用户可以从地图 popup 直接编辑日期、备注和标签，以及删除单条记录
- 时间轴和统计数据通过 Pinia store 的响应式计算自动同步更新
- 所有 396 个测试通过，类型检查干净

---

*Phase: 39-map-popup*
*Completed: 2026-04-29*
