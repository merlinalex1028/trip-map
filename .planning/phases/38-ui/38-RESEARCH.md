# Phase 38: 时间轴编辑/删除 UI - Research

**Researched:** 2026-04-29
**Domain:** Vue 3 + Pinia 前端 UI 交互层
**Confidence:** HIGH

## Summary

Phase 38 需要在现有 TimelineVisitCard 上添加编辑和删除功能。Phase 37 已完成 store 层的 `updateRecord` 和 `deleteSingleRecord` 方法（含乐观更新+回滚），本阶段聚焦 UI 层：编辑表单、标签输入、日期冲突本地检查、确认弹窗、删除最后一条提示。

**核心发现：** 项目中已有两个可复用的 UI 模式——TripDateForm（日期表单）和 AuthDialog/LocalImportDecisionDialog（模态弹窗）。TimelineVisitCard 当前是纯展示组件，需要扩展为支持编辑/删除交互的复合组件。

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 编辑表单 UI | Browser / Client | — | 纯前端交互，不涉及 SSR |
| 日期冲突检查 | Browser / Client | — | 前端本地检查 tripsByPlaceId，无需后端调用 |
| 标签输入 | Browser / Client | — | 纯前端输入控件 |
| 确认弹窗 | Browser / Client | — | 纯前端 UI，确认后调用 store 方法 |
| 删除最后一条检测 | Browser / Client | — | 利用 TimelineEntry.visitCount 判断 |

## Standard Stack

### Core（已有，无需新增依赖）

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 Composition API | 项目现有 | 组件开发 | 项目规范 |
| Pinia | 项目现有 | 状态管理 | store.updateRecord / deleteSingleRecord 已就绪 |
| TypeScript strict | 项目现有 | 类型安全 | 项目规范 |
| Tailwind CSS | 项目现有 | 样式 | 所有现有组件使用 Tailwind utility classes |

### 无新增依赖

本阶段所有功能使用项目已有技术栈实现，无需引入新库。

## Architecture Patterns

### 组件结构规划

```
apps/web/src/components/timeline/
├── TimelineVisitCard.vue          # 修改：添加编辑/删除按钮 + 编辑模式切换
├── TimelineEditForm.vue           # 新建：编辑表单（日期 + 备注 + 标签）
├── TagInput.vue                   # 新建：标签输入控件
├── ConfirmDialog.vue              # 新建：通用确认弹窗
└── TimelineVisitCard.spec.ts      # 新建：卡片测试
```

### Pattern 1: 编辑模式切换（参考 TripDateForm 的表单交互模式）

**What:** TimelineVisitCard 增加 `isEditing` 状态，编辑模式下展示 TimelineEditForm 替代只读内容
**When to use:** 用户点击编辑按钮时切换
**参考来源:** `apps/web/src/components/map-popup/TripDateForm.vue`

现有 TripDateForm 模式：
- Props: `isSubmitting`
- Emits: `submit(payload)`, `cancel()`
- 内部管理 startDate/endDate ref
- 验证：日期范围检查、必填检查

TimelineEditForm 扩展此模式：
- Props: `record` (TravelRecord), `conflictingDates` (string[])
- Emits: `submit(UpdateTravelRecordRequest)`, `cancel()`
- 内部管理 startDate, endDate, notes, tags ref
- 验证：日期范围 + 日期冲突 + notes 长度 + tags 数量/长度

### Pattern 2: 确认弹窗（参考 AuthDialog 和 LocalImportDecisionDialog）

**What:** 通用确认弹窗组件，支持自定义标题、内容、确认/取消按钮文案
**参考来源:** `apps/web/src/components/auth/LocalImportDecisionDialog.vue`（更简洁的模式）

LocalImportDecisionDialog 模式：
- 固定定位 + backdrop blur（`fixed inset-0 z-[6]`）
- `role="dialog"` + `aria-modal="true"`
- 圆角卡片 + 标题 + 内容 + 操作按钮
- ESC 键关闭（AuthDialog 有此功能）

ConfirmDialog 设计：
```typescript
interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string  // 默认 "确认"
  cancelLabel?: string   // 默认 "取消"
  tone?: 'default' | 'destructive'  // destructive 时确认按钮用红色
}
```

### Pattern 3: 标签输入控件

**What:** 自定义标签输入，支持添加/删除标签，显示已有标签列表
**约束（来自 Phase 36 contracts）：**
- 最多 10 个标签
- 每个标签最长 20 字符
- 标签内容 trim + 去重 + 过滤空字符串（后端也会清洗，前端预处理减少无效请求）

TagInput 设计：
```typescript
interface TagInputProps {
  tags: string[]
  maxTags?: number       // 默认 10
  maxTagLength?: number  // 默认 20
}
// Emits: update:tags(string[])
```

UI：标签以 pill 样式展示，每个有删除按钮；输入框回车或逗号添加新标签。

### Pattern 4: 日期冲突本地检查（EDIT-04）

**What:** 编辑日期时，检查同地点其他记录的日期是否重叠
**数据源:** `store.tripsByPlaceId` 已有按 placeId 分组的记录列表
**逻辑：**
```
1. 获取当前 record 的 placeId
2. 从 tripsByPlaceId 中取同地点其他记录（排除当前 recordId）
3. 检查新日期范围是否与任何其他记录重叠
4. 重叠则在表单中显示警告（不阻塞提交，仅提示）
```

日期重叠判断：`(newStart <= otherEnd) && (newEnd >= otherStart)`

### Pattern 5: 删除最后一条检测（DEL-03）

**What:** 删除前检查是否为该地点的最后一条记录
**数据源:** `TimelineEntry.visitCount`（已在 timeline service 中计算）
**逻辑：**
```
if (entry.visitCount === 1) {
  // 显示额外警告：删除后将取消该地点的点亮状态
  confirmMessage = '这是该地点的唯一一条记录，删除后将取消该地点的点亮状态。确认删除？'
} else {
  confirmMessage = '确认删除这条旅行记录？'
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 日期范围验证 | 自定义日期比较逻辑 | 复用 TripDateForm 的 hasRangeError 模式 | 已有成熟模式，含 endDate < startDate 检查 |
| 乐观更新/回滚 | 新的 fetch + 状态管理逻辑 | store.updateRecord / deleteSingleRecord | Phase 37 已实现完整的乐观更新+回滚+统计刷新 |
| 模态弹窗焦点管理 | 自定义焦点捕获 | 参考 AuthDialog 的 focusFirstField / restoreTriggerFocus 模式 | 已有 accessibility 模式 |
| 标签清洗 | 前端去重/trim | 前端预处理 + 后端兜底 | 后端 service 层已有 trim + 去重 + 过滤空字符串 |

## Common Pitfalls

### Pitfall 1: 编辑后 timelineEntries 自动重排序导致组件闪烁
**What goes wrong:** store.updateRecord 触发 travelRecords 更新 → timelineEntries 重排序 → DOM 重新排列
**Why it happens:** Vue 的 v-for key 使用 recordId，重排序后 DOM 元素会移动
**How to avoid:** 编辑成功后退出编辑模式，让用户看到新排序结果。不需要额外处理，Vue 会正确移动 DOM 元素。
**Warning signs:** 编辑后卡片跳到新位置，但用户可能在编辑旧位置的卡片

### Pitfall 2: 日期冲突检查与后端 409 冲突
**What goes wrong:** 前端检查通过但后端返回 409（边界情况不一致）
**Why it happens:** 前端检查基于乐观数据，后端基于数据库权威数据；或者日期范围判断边界条件不同
**How to avoid:** 前端冲突检查仅作为 UX 优化（提前提示），不阻塞提交。后端 409 错误仍需正确处理（store.updateRecord 的 catch 已处理回滚+notice）。
**Warning signs:** 用户看到"无冲突"但提交后显示错误

### Pitfall 3: 删除最后一条后地点从地图消失
**What goes wrong:** 删除操作成功后，displayPoints 不再包含该 placeId，地图上该地点的 marker 消失
**Why it happens:** store.deleteSingleRecord 更新 travelRecords → displayPoints 重新计算 → 该 placeId 无记录 → 不再生成 marker
**How to avoid:** 这是预期行为（DEL-03 的提示就是要告知用户这一点）。确认弹窗中明确说明即可。
**Warning signs:** 用户未注意到确认弹窗中的警告，惊讶于地点消失

### Pitfall 4: 标签输入的用户体验
**What goes wrong:** 用户输入标签后忘记按回车/逗号，标签未被添加
**Why it happens:** 标签输入需要明确的"添加"动作
**How to avoid:** 输入框失焦时自动添加当前内容（如果非空）；或在输入框旁显示"+"按钮
**Warning signs:** 用户输入标签后直接点保存，标签丢失

## Code Examples

### 确认弹窗结构（参考 LocalImportDecisionDialog）

```vue
<!-- Source: apps/web/src/components/auth/LocalImportDecisionDialog.vue -->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[6] flex items-center justify-center bg-[rgba(87,66,95,0.16)] px-4 py-6 backdrop-blur-sm"
    data-confirm-dialog-backdrop
    @keydown.esc.prevent="handleCancel"
  >
    <section
      class="w-full max-w-[28rem] overflow-hidden rounded-[32px] border border-white/85 bg-[var(--color-surface)]/96 text-[var(--color-ink-strong)] shadow-[var(--shadow-stage)] backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
    >
      <!-- 标题 + 内容 + 操作按钮 -->
    </section>
  </div>
</template>
```

### 编辑表单日期输入（参考 TripDateForm）

```vue
<!-- Source: apps/web/src/components/map-popup/TripDateForm.vue -->
<label class="grid gap-1">
  <span class="text-[var(--font-label-size)] font-bold text-[var(--color-ink-strong)]">
    开始日期
  </span>
  <input
    v-model="startDate"
    type="date"
    required
    :max="endDate || undefined"
    class="min-h-11 rounded-xl border border-[#d7dcea] bg-white px-3 py-2 text-[var(--font-label-size)] text-[var(--color-ink-strong)]"
  />
</label>
```

### store.updateRecord 调用模式

```typescript
// Source: apps/web/src/stores/map-points.ts (lines 526-582)
// 调用方式：
const mapPointsStore = useMapPointsStore()
await mapPointsStore.updateRecord(recordId, {
  startDate: '2025-03-01',
  endDate: '2025-03-05',
  notes: '旅行备注',
  tags: ['美食', '文化'],
})
// store 内部处理乐观更新 + 回滚 + notice
```

### 日期冲突检查逻辑

```typescript
// 数据源：store.tripsByPlaceId
function checkDateConflict(
  placeId: string,
  currentRecordId: string,
  newStart: string | null,
  newEnd: string | null,
  tripsByPlaceId: Map<string, TravelRecord[]>,
): string[] {
  const siblings = tripsByPlaceId.get(placeId) ?? []
  const others = siblings.filter((r) => r.id !== currentRecordId)
  const conflicts: string[] = []

  for (const other of others) {
    if (!other.startDate || !newStart) continue
    const otherEnd = other.endDate ?? other.startDate
    const effectiveNewEnd = newEnd ?? newStart
    if (newStart <= otherEnd && effectiveNewEnd >= other.startDate) {
      conflicts.push(`${other.startDate} ~ ${otherEnd}`)
    }
  }
  return conflicts
}
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (项目现有) |
| Config file | apps/web/vitest.config.ts |
| Quick run command | `pnpm --filter @trip-map/web test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EDIT-01 | 修改日期 | unit | `vitest run TimelineVisitCard` | Wave 0 |
| EDIT-02 | 添加/修改备注 | unit | `vitest run TimelineEditForm` | Wave 0 |
| EDIT-03 | 添加/修改标签 | unit | `vitest run TagInput` | Wave 0 |
| EDIT-04 | 日期冲突检查 | unit | `vitest run date-conflict` | Wave 0 |
| DEL-01 | 删除单条记录 | unit | `vitest run TimelineVisitCard` | Wave 0 |
| DEL-02 | 删除确认弹窗 | unit | `vitest run ConfirmDialog` | Wave 0 |
| DEL-03 | 最后一条提示 | unit | `vitest run ConfirmDialog` | Wave 0 |

### Wave 0 Gaps
- [ ] `apps/web/src/components/timeline/TimelineEditForm.spec.ts` — 编辑表单测试
- [ ] `apps/web/src/components/timeline/TagInput.spec.ts` — 标签输入测试
- [ ] `apps/web/src/components/timeline/ConfirmDialog.spec.ts` — 确认弹窗测试
- [ ] `apps/web/src/components/timeline/TimelineVisitCard.spec.ts` — 卡片编辑/删除测试
- [ ] `apps/web/src/services/date-conflict.spec.ts` — 日期冲突检查逻辑测试

## Decisions（来自 STATE.md）

| Decision | Rationale | Impact on Phase 38 |
|----------|-----------|---------------------|
| v7.0 编辑不含地点修改 | 避免 placeId/boundaryId 级联更新复杂度 | 编辑表单不包含地点选择，仅日期/备注/标签 |
| v7.0 无编辑历史/撤销 | 仅确认弹窗，不做 undo 栈 | 删除使用确认弹窗，不做撤销功能 |
| PATCH 语义而非 PUT | 部分更新场景更灵活 | 编辑表单只提交用户修改的字段 |
| store 方法名 deleteSingleRecord 与 API 同名 | import 时重命名 API 为 deleteSingleRecordApi | 组件直接调用 store.deleteSingleRecord |
| Phase 37 不做 pendingRecordIds | Phase 38 UI 管理自己的 loading 状态 | TimelineEditForm 需要自己的 isSubmitting ref |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 编辑模式为卡片内联展开，而非跳转新页面 | Architecture | 如果改为独立页面，需重新设计路由和组件结构 |
| A2 | 日期冲突检查仅提示不阻塞 | Pattern 4 | 如果改为阻塞提交，需调整表单验证逻辑 |
| A3 | 确认弹窗为通用组件，可复用于 Phase 39 | Pattern 2 | 如果 Phase 39 需要不同样式的弹窗，需额外适配 |

## Sources

### Primary (HIGH confidence)
- `apps/web/src/components/timeline/TimelineVisitCard.vue` — 现有卡片结构
- `apps/web/src/components/map-popup/TripDateForm.vue` — 日期表单模式
- `apps/web/src/components/auth/AuthDialog.vue` — 模态弹窗模式
- `apps/web/src/components/auth/LocalImportDecisionDialog.vue` — 确认弹窗模式
- `apps/web/src/stores/map-points.ts` — updateRecord / deleteSingleRecord 方法
- `apps/web/src/services/timeline.ts` — TimelineEntry 类型 + visitCount
- `packages/contracts/src/records.ts` — UpdateTravelRecordRequest 类型
- `.planning/phases/37-store-api/37-01-SUMMARY.md` — Phase 37 完成情况

### Secondary (MEDIUM confidence)
- `.planning/phases/36-data-layer-extension/36-PATTERNS.md` — 后端验证规则参考

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 全部使用项目现有技术栈
- Architecture: HIGH — 已有明确的组件模式可参考
- Pitfalls: HIGH — 基于现有代码模式分析

**Research date:** 2026-04-29
**Valid until:** 2026-05-13（项目活跃开发中，2 周内有效）

---
*Phase: 38-ui*
*Created: 2026-04-29*
