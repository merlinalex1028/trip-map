---
phase: 38-ui
plan: 02
subsystem: ui
tags: [vue, confirm-dialog, edit, delete, timeline, component]

requires:
  - phase: 38-ui-01
    provides: TimelineEditForm, TagInput, date-conflict service

provides:
  - ConfirmDialog 通用确认弹窗组件（支持 default/destructive 两种模式）
  - TimelineVisitCard 编辑/删除交互（编辑模式切换、删除确认弹窗、最后一条警告）

affects:
  - 39-ui: 地图 popup 复用 ConfirmDialog

tech-stack:
  added: []
  patterns:
    - "通用确认弹窗模式：v-if 控制显示、ESC/backdrop 关闭、destructive 红色样式"
    - "时间轴卡片编辑模式：内联表单替换只读内容，非 navigate-away 模式"
    - "删除最后一条检测：visitCount=1 时显示 destructive 风格弹窗"

key-files:
  created:
    - apps/web/src/components/timeline/ConfirmDialog.vue
    - apps/web/src/components/timeline/ConfirmDialog.spec.ts
    - apps/web/src/components/timeline/TimelineVisitCard.spec.ts
  modified:
    - apps/web/src/components/timeline/TimelineVisitCard.vue

key-decisions:
  - "TimelineVisitCard 内部管理编辑模式状态（isEditing ref），不依赖父组件"
  - "编辑/删除按钮直接调用 store 方法（updateRecord / deleteSingleRecord），不再 emit 到父组件"
  - "禁用按钮的 stores 方法先在组件内 mock 测试，避免 API 调用"

patterns-established:
  - "弹窗组件：data-* 属性标识关键元素（backdrop/content/title/message/confirm/cancel），便于测试和 E2E 选择"
  - "卡片操作栏：border-t 分隔，pill 样式按钮（浅蓝编辑 + 浅红删除）"
  - "Notes/Tags 显示：只读模式下展示可选元数据，编辑模式下通过 TimelineEditForm 管理"

requirements-completed: [DEL-01, DEL-02, DEL-03, EDIT-01, EDIT-02, EDIT-03]

duration: 15min
completed: 2026-04-29
---

# Phase 38 Plan 02: 删除确认弹窗与时间轴卡片编辑/删除集成

**ConfirmDialog 通用确认弹窗 + TimelineVisitCard 编辑/删除交互（编辑模式切换、删除确认弹窗、最后一条 destructive 警告）**

## Performance

- **Duration:** 15 min (13:57 - 14:12)
- **Started:** 2026-04-29T13:57:22Z
- **Completed:** 2026-04-29T14:12:00Z
- **Tasks:** 2 (TDD: 4 commits)
- **Files modified:** 4

## Accomplishments

- 创建通用确认弹窗 ConfirmDialog.vue，支持 default/destructive 两种模式
- 修改 TimelineVisitCard.vue，集成编辑模式（内联 TimelineEditForm）和删除确认弹窗
- 只读模式新增备注和标签显示区域
- 删除最后一条记录（visitCount=1）时显示 destructive 风格警告弹窗
- 操作栏含编辑/删除 pill 按钮，底部 border-t 分隔
- 所有组件使用 data-* 属性标识关键元素，测试全覆盖

## Task Commits

Each task was committed atomically with TDD RED/GREEN split:

1. **Task 1: ConfirmDialog 组件（TDD）**
   - `bd9099b` (RED) — test: add failing ConfirmDialog tests
   - `d16aa71` (GREEN) — feat: implement ConfirmDialog component

2. **Task 2: TimelineVisitCard 编辑/删除集成（TDD）**
   - `38853d5` (RED) — test: add TimelineVisitCard edit/delete tests
   - `b142b0b` (GREEN) — feat: integrate edit/delete in TimelineVisitCard

## Files Created/Modified

- `apps/web/src/components/timeline/ConfirmDialog.vue` — 通用确认弹窗（Props: isOpen, title, message, confirmLabel, cancelLabel, tone）
- `apps/web/src/components/timeline/ConfirmDialog.spec.ts` — 10 个测试用例覆盖渲染、emit、ARIA、destructive 样式、backdrop 点击、ESC 键
- `apps/web/src/components/timeline/TimelineVisitCard.vue` — 修改：添加编辑/删除交互、备注/标签显示、操作栏
- `apps/web/src/components/timeline/TimelineVisitCard.spec.ts` — 12 个测试用例覆盖只读模式、编辑模式切换、删除确认、最后一条警告、备注/标签渲染

## Decisions Made

- **编辑模式状态管理：** TimelineVisitCard 内部使用 `isEditing` ref 控制，不依赖父组件传入 prop，简化数据流
- **编辑/删除直接调用 store：** 组件直接调用 `mapPointsStore.updateRecord` 和 `deleteSingleRecord`，而不是 emit 到父组件（TimelinePageView），因为父组件只做遍历渲染，没有中间处理逻辑
- **Notes/Tags 显示：** TimelineEntry 已包含 notes 和 tags 字段（Plan 01 已添加），无需额外修改 timeline.ts

## Deviations from Plan

None — plan executed exactly as written.

## TDD Gate Compliance

- ✅ RED gate: `test(38-ui-02): add failing ConfirmDialog tests` (bd9099b)
- ✅ GREEN gate: `feat(38-ui-02): implement ConfirmDialog component` (d16aa71)
- ✅ RED gate: `test(38-ui-02): add TimelineVisitCard edit/delete tests` (38853d5)
- ✅ GREEN gate: `feat(38-ui-02): integrate edit/delete in TimelineVisitCard` (b142b0b)

All four TDD gates validated — each test commit is followed by its corresponding feat commit.

## Known Stubs

None — all features fully wired.

## Threat Flags

None — no new security-relevant surface introduced beyond what the plan's threat model covers.

## Issues Encountered

None

## Verification Results

| Check | Result |
|-------|--------|
| `pnpm --filter @trip-map/web test` | ✅ 382 passed (42 test files) |
| `pnpm --filter @trip-map/web typecheck` | ✅ No errors |

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ConfirmDialog 是通用组件，Phase 39 地图 popup 编辑/删除可直接复用
- TimelinePageView 是待修改目标——当前计划 38-01/02 已完成编辑表单和卡片交互，Phase 39 需在 popup 中集成编辑/删除

## Self-Check: PASSED

- ✅ `ConfirmDialog.vue` — exists
- ✅ `ConfirmDialog.spec.ts` — exists (10 tests)
- ✅ `TimelineVisitCard.vue` — modified (edit/delete integration)
- ✅ `TimelineVisitCard.spec.ts` — exists (12 tests)
- ✅ `SUMMARY.md` — exists
- ✅ `bd9099b` — test commit exists
- ✅ `d16aa71` — feat commit exists
- ✅ `38853d5` — test commit exists
- ✅ `b142b0b` — feat commit exists

---

*Phase: 38-ui*
*Completed: 2026-04-29*
