---
phase: 38
plan: 01
subsystem: timeline
tags:
  - component
  - form
  - tag-input
  - date-conflict
  - edit
requires: [37-01, 36-01]
provides:
  - TimelineEntry with notes/tags
  - checkDateConflict pure function
  - TagInput component
  - TimelineEditForm component
affects:
  - apps/web/src/services/timeline.ts
  - apps/web/src/services/date-conflict.ts
  - apps/web/src/services/date-conflict.spec.ts
  - apps/web/src/components/timeline/TagInput.vue
  - apps/web/src/components/timeline/TagInput.spec.ts
  - apps/web/src/components/timeline/TimelineEditForm.vue
  - apps/web/src/components/timeline/TimelineEditForm.spec.ts
tech-stack:
  added: []
  patterns:
    - "TimelineEntry 接口扩展 notes/tags 字段映射"
    - "checkDateConflict 纯函数通过 tripsByPlaceId Map 进行日期重叠检查"
    - "TagInput 使用 v-model 模式（update:tags emit）"
    - "TimelineEditForm 复用 TripDateForm 的表单交互和样式模式"
    - "所有组件使用 data-* 属性标识关键元素"
key-files:
  created:
    - apps/web/src/services/date-conflict.ts
    - apps/web/src/services/date-conflict.spec.ts
    - apps/web/src/components/timeline/TagInput.vue
    - apps/web/src/components/timeline/TagInput.spec.ts
    - apps/web/src/components/timeline/TimelineEditForm.vue
    - apps/web/src/components/timeline/TimelineEditForm.spec.ts
  modified:
    - apps/web/src/services/timeline.ts
decisions: []
metrics:
  duration: "~8 minutes"
  completed_date: "2026-04-29"
  tasks: 4 (all auto)
  commits: 8
  files_created: 6
  files_modified: 1
---

# Phase 38 Plan 01: 时间轴编辑组件核心构建

**One-liner:** 构建时间轴编辑功能的四个核心组件——TimelineEntry 接口扩展 notes/tags 字段、checkDateConflict 日期冲突检查纯函数、TagInput 标签输入控件、TimelineEditForm 编辑表单组件，覆盖 EDIT-01~04 四个需求。

## Objective

Phase 38 Plan 01 的四个核心任务为 TimelineVisitCard 编辑模式提供所有子组件：
- `EDIT-01`（日期修改）— TimelineEditForm 提供开始/结束日期输入 + 验证
- `EDIT-02`（备注）— TimelineEditForm 提供纯文本备注 textarea，最长 1000 字符
- `EDIT-03`（标签）— TagInput 提供标签添加/删除，最多 10 个，每个最长 20 字符
- `EDIT-04`（日期冲突）— checkDateConflict 纯函数检查同地点其他记录的日期重叠

## Task Execution Summary

### Task 1: 扩展 TimelineEntry 接口添加 notes/tags 字段

**类型:** auto
**文件:** `apps/web/src/services/timeline.ts`

- 在 `TimelineEntry` 接口添加 `notes: string | null` 和 `tags: string[]` 字段
- 在 `toTimelineEntry()` 函数添加 `notes: record.notes` 和 `tags: record.tags` 映射
- `pnpm --filter @trip-map/web typecheck` 通过
- 全部 37 个既有测试文件、333 个测试用例通过

**提交:** `806b63c feat(38-ui-01): extend TimelineEntry interface with notes and tags fields`

### Task 2: 创建日期冲突检查纯函数 date-conflict.ts (TDD)

**类型:** auto (tdd)
**文件:** `apps/web/src/services/date-conflict.ts`, `apps/web/src/services/date-conflict.spec.ts`

- **RED** 阶段: 写 9 个测试用例覆盖无冲突、日期重叠、排除自身、null 边界、多冲突场景
- **GREEN** 阶段: 实现 `checkDateConflict` 纯函数，函数签名 `(placeId, currentRecordId, newStart, newEnd, tripsByPlaceId) => string[]`
- 9 个测试用例全部通过

**提交:** `dd28983 test(38-ui-01): add failing tests for date-conflict checkDateConflict`
**提交:** `5ca1833 feat(38-ui-01): implement checkDateConflict pure function`

### Task 3: 创建标签输入控件 TagInput.vue (TDD)

**类型:** auto (tdd)
**文件:** `apps/web/src/components/timeline/TagInput.vue`, `apps/web/src/components/timeline/TagInput.spec.ts`

- **RED** 阶段: 10 个测试用例覆盖 chip 渲染、回车/逗号/失焦添加、删除按钮、去重、空白过滤、上限、Backspace 删除
- **GREEN** 阶段: 实现 TagInput 组件，使用 `data-region="tag-input"`、`data-tag-chip`、`data-tag-remove`、`data-tag-input-field` 属性
- 支持 v-model 通过 `update:tags` emit
- 10 个测试用例全部通过

**提交:** `78a0fa8 test(38-ui-01): add failing tests for TagInput component`
**提交:** `d70a762 feat(38-ui-01): implement TagInput component with v-model support`
**提交:** `7efa3f3 fix(38-ui-01): fix TagInput max-length test string to exceed 20 characters`

### Task 4: 创建编辑表单组件 TimelineEditForm.vue (TDD)

**类型:** auto (tdd)
**文件:** `apps/web/src/components/timeline/TimelineEditForm.vue`, `apps/web/src/components/timeline/TimelineEditForm.spec.ts`

- **RED** 阶段: 8 个测试用例覆盖表单渲染、范围验证、备注长度验证、冲突警告、提交/取消 emit、禁用状态、空备注转 null
- **GREEN** 阶段: 实现 TimelineEditForm 组件，复用 TripDateForm 的样式和交互模式
  - 集成 TagInput 标签输入控件
  - 日期验证: `hasRangeError` / `notesTooLong` computed
  - 提交 payload 为 `UpdateTravelRecordRequest` 类型
  - 使用 `data-region="timeline-edit-form"`、`data-edit-input`、`data-edit-error`、`data-edit-warning`、`data-edit-submit`、`data-edit-cancel` 属性
- 8 个测试用例全部通过
- 最终 `pnpm --filter @trip-map/web typecheck` 和全部 360 个测试通过

**提交:** `4d008c0 test(38-ui-01): add failing tests for TimelineEditForm component`
**提交:** `b7dbb02 feat(38-ui-01): implement TimelineEditForm component with date/notes/tag editing`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing type correctness] 测试文件中使用了不正确的类型值**
- **Found during:** Task 4 — typecheck 阶段
- **Issue:** `date-conflict.spec.ts` 中 `placeKind: 'CITY'` 和 `adminType: 'DIRECT_ADMINISTERED'` 不是有效的 `PlaceKind` 和 `ChinaAdminType` 字面量值。正确的类型为 `'CN_ADMIN'` 和 `'MUNICIPALITY'`。
- **Fix:** 修正为正确的类型字面量值。
- **Files modified:** `apps/web/src/services/date-conflict.spec.ts`
- **Commit:** `b7dbb02` (included in Task 4 GREEN commit)

**2. [Rule 2 - Missing type assertion] TimelineEditForm.spec.ts 中的 emit 数据类型**
- **Found during:** Task 4 — typecheck 阶段
- **Issue:** `wrapper.emitted('submit')?.[0]?.[0].notes` 的 TypeScript 类型为 `unknown`，无法访问 `.notes` 属性
- **Fix:** 使用 `as Record<string, unknown>` 类型断言处理 emit payload 访问
- **Files modified:** `apps/web/src/components/timeline/TimelineEditForm.spec.ts`
- **Commit:** `b7dbb02` (included in Task 4 GREEN commit)

**3. [Rule 1 - Bug] TagInput 超长标签测试用例字符串不足 20 字符**
- **Found during:** Task 3 — GREEN 阶段测试
- **Issue:** 测试字符串"这是一个超过二十个字符的标签名字测试"实际只有 18 个字符，不超过 maxTagLength=20，导致测试失败
- **Fix:** 扩展测试字符串至 21 个字符
- **Files modified:** `apps/web/src/components/timeline/TagInput.spec.ts`
- **Commit:** `7efa3f3 fix(38-ui-01): fix TagInput max-length test string to exceed 20 characters`

**4. [Rule 3 - Test environment] happy-dom 环境下 `toHaveValue` matcher 不可用**
- **Found during:** Task 4 — GREEN 阶段测试
- **Issue:** `@vue/test-utils` 在 happy-dom 环境下不支持 `toHaveValue` 自定义 matcher
- **Fix:** 改用 `(element as HTMLInputElement).value` 直接获取值
- **Files modified:** `apps/web/src/components/timeline/TimelineEditForm.spec.ts`
- **Commit:** `b7dbb02` (included in Task 4 GREEN commit)

## Threat Model Compliance

| Threat ID | Category | Component | Disposition | Status |
|-----------|----------|-----------|-------------|--------|
| T-38-01 | Tampering | notes textarea | mitigate | ✅ textarea `maxlength="1000"`, trim 后提交 |
| T-38-02 | Tampering | tags input | mitigate | ✅ 前端最多 10 标签/20 字符/去重/trim |
| T-38-03 | Info Disclosure | date conflict warning | accept | ✅ 仅显示日期范围，无敏感数据泄露 |
| T-38-04 | Denial of Service | notes length | mitigate | ✅ 前端 maxlength=1000 + 超过时禁用提交 |

## Success Criteria Verification

- ✅ TimelineEntry 接口扩展 notes/tags 字段，toTimelineEntry 正确映射，类型检查通过
- ✅ date-conflict.ts 导出 checkDateConflict 函数，9 个测试通过
- ✅ TagInput.vue 组件实现完成，10 个测试通过，支持回车/逗号/失焦添加标签
- ✅ TimelineEditForm.vue 组件实现完成，8 个测试通过，集成 TagInput
- ✅ 所有组件使用 data-* 属性标识关键元素
- ✅ 无新增 npm 依赖
- ✅ `pnpm --filter @trip-map/web typecheck` 通过
- ✅ `pnpm --filter @trip-map/web test` 全部 360 个测试通过

## Self-Check: PASSED

```
✅ apps/web/src/services/timeline.ts — 包含 notes/tags 字段
✅ apps/web/src/services/date-conflict.ts — 存在且导出 checkDateConflict
✅ apps/web/src/services/date-conflict.spec.ts — 存在且包含 9 个测试
✅ apps/web/src/components/timeline/TagInput.vue — 存在且包含 defineProps/defineEmits
✅ apps/web/src/components/timeline/TagInput.spec.ts — 存在且包含 10 个测试
✅ apps/web/src/components/timeline/TimelineEditForm.vue — 存在且包含 defineProps/defineEmits
✅ apps/web/src/components/timeline/TimelineEditForm.spec.ts — 存在且包含 8 个测试
✅ 806b63c — feat: extend TimelineEntry interface
✅ dd28983 — test: add failing tests for date-conflict
✅ 5ca1833 — feat: implement checkDateConflict
✅ 78a0fa8 — test: add failing tests for TagInput
✅ d70a762 — feat: implement TagInput
✅ 7efa3f3 — fix: TagInput max-length test string
✅ 4d008c0 — test: add failing tests for TimelineEditForm
✅ b7dbb02 — feat: implement TimelineEditForm
```

All commits verified. All files exist. All tests pass. Typecheck clean.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 806b63c | feat | extend TimelineEntry interface with notes and tags fields |
| dd28983 | test | add failing tests for date-conflict checkDateConflict |
| 5ca1833 | feat | implement checkDateConflict pure function |
| 78a0fa8 | test | add failing tests for TagInput component |
| d70a762 | feat | implement TagInput component with v-model support |
| 7efa3f3 | fix | fix TagInput max-length test string to exceed 20 characters |
| 4d008c0 | test | add failing tests for TimelineEditForm component |
| b7dbb02 | feat | implement TimelineEditForm component with date/notes/tag editing |

**Duration:** ~8 minutes
