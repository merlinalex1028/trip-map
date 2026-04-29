---
phase: 38
slug: ui
status: draft
shadcn_initialized: false
preset: not applicable
created: "2026-04-29"
---

# Phase 38 — UI Design Contract

> 时间轴编辑/删除 UI 的视觉与交互契约。由 gsd-ui-researcher 生成，经 gsd-ui-checker 验证。

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none（Tailwind CSS + CSS 自定义属性） |
| Preset | not applicable |
| Component library | none（项目自建组件） |
| Icon library | none（当前无图标库，使用 emoji 或文字） |
| Font | Nunito Variable + Noto Sans SC（项目全局字体） |

---

## Spacing Scale

声明值（均为 4 的倍数）：

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | 图标间距、标签内间距 |
| sm | 8px | 表单字段间距、标签 gap |
| md | 16px | 表单 section 间距、弹窗内边距 |
| lg | 24px | 卡片内 section 分隔、弹窗 padding |
| xl | 32px | 弹窗最大宽度、按钮间距 |
| 2xl | 48px | 弹窗底部 padding |
| 3xl | 64px | 未使用 |

**例外：**
- 弹窗圆角使用 32px（`rounded-[32px]`），沿用 LocalImportDecisionDialog 模式
- 按钮使用 `rounded-full`（pill 样式）
- 卡片圆角使用 28px（`rounded-[28px]`），沿用 TimelineVisitCard 模式

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px (`--font-body-size`) | 400 (`--font-weight-body`) | 1.5 |
| Label | 14px (`--font-label-size`) | 600 (`--font-weight-label`) | 1.4 |
| Heading | 24px (`--font-heading-size`) | 700 (`--font-weight-heading`) | 1.2 |
| Display | 40px (`--font-display-size`) | 800 (`--font-weight-display`) | 1.1 |

**本阶段使用场景：**
- 编辑表单标题：Label（14px / 600）
- 表单字段标签：Label（14px / 600）
- 输入文本：Body（16px / 400）
- 弹窗标题：Heading（24px / 700）
- 弹窗正文：Body（16px / 400）
- 日期冲突警告：Label（14px / 600），使用 `--color-destructive`
- 标签 chip 文字：14px / 600

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `--color-surface` (#fdf5ff) | 编辑表单背景、弹窗背景 |
| Secondary (30%) | `--color-surface-soft` (#fffaf2) | 表单内部 card 背景 |
| Accent (10%) | `--color-accent` (#f48fb1) | 编辑按钮 hover、保存按钮渐变、标签 chip 边框 |
| Destructive | `--color-destructive` (#c86464) | 删除按钮、日期冲突警告、确认弹窗 destructive 模式 |

**Accent 保留用途（不可泛用）：**
- 编辑按钮的 hover/active 状态
- 保存按钮的渐变背景与文字颜色
- 标签 chip 的边框高亮
- 弹窗关闭按钮 hover

**Destructive 用途：**
- 删除按钮图标/文字
- 日期冲突警告文字
- 确认删除弹窗的确认按钮（`tone="destructive"` 时）

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | `保存修改` |
| Empty state heading | `暂无旅行记录` |
| Empty state body | `点击地图添加你的第一个旅行记录吧！` |
| Error state | `保存失败，请稍后重试` + 操作指引 |
| Destructive confirmation | `删除旅行记录`：`确认删除这条旅行记录？` |
| Last record warning | `删除该地点最后一条记录`：`这是该地点的唯一一条记录，删除后将取消该地点的点亮状态。确认删除？` |
| Date conflict warning | `日期冲突`：`与已有记录 {startDate} ~ {endDate} 存在日期重叠` |
| Edit button label | `编辑` |
| Delete button label | `删除` |
| Cancel button label | `取消` |
| Tag input placeholder | `输入标签，按回车添加` |
| Tag limit reached | `最多添加 {maxTags} 个标签` |
| Tag duplicate warning | `标签 "{tag}" 已存在` |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable |
| 第三方 | none | not applicable |

---

## Component Interaction Contract

### 1. TimelineVisitCard.vue（修改）

**新增 Props：**

```typescript
interface TimelineVisitCardProps {
  entry: TimelineEntry
  isEditing: boolean        // 是否处于编辑模式
  isDeleting: boolean       // 是否正在删除（禁用按钮）
}
```

**新增 Emits：**

```typescript
const emit = defineEmits<{
  edit: [recordId: string]          // 点击编辑按钮
  delete: [recordId: string]        // 点击删除按钮
  cancelEdit: []                    // 取消编辑
  submitEdit: [payload: UpdateTravelRecordRequest]  // 提交编辑
}>()
```

**交互流程：**

1. **只读模式**：卡片展示只读内容 + 底部操作栏（编辑/删除按钮）
2. **编辑模式**：`isEditing=true` 时，只读内容区域替换为 TimelineEditForm
3. **编辑成功**：store.updateRecord 完成 → 退出编辑模式 → 卡片自动排序到新位置
4. **编辑失败**：store.updateRecord 回滚 → 保持编辑模式 → 显示错误 notice

**操作栏设计：**

```
┌─────────────────────────────────────────────┐
│  [卡片只读内容]                              │
│                                             │
│  ─────────────────────────────────────────  │
│  [编辑按钮]  [删除按钮]                      │
└─────────────────────────────────────────────┘
```

- 操作栏位于卡片底部，使用 `border-t border-white/80` 分隔
- 按钮样式：pill 按钮，`min-h-9 px-4 text-xs font-semibold`
- 编辑按钮：`border-[#d6ebf2] bg-[#effafc] text-[var(--color-ink-strong)]`
- 删除按钮：`border-[#e8c4c4] bg-[#fef2f2] text-[var(--color-destructive)]`

---

### 2. TimelineEditForm.vue（新建）

**Props：**

```typescript
interface TimelineEditFormProps {
  record: TravelRecord
  isSubmitting?: boolean       // 是否正在提交（禁用按钮）
  conflictingDates?: string[]  // 日期冲突列表（来自日期冲突检查）
}
```

**Emits：**

```typescript
const emit = defineEmits<{
  submit: [payload: UpdateTravelRecordRequest]
  cancel: []
}>()
```

**表单布局：**

```
┌─────────────────────────────────────────────┐
│  编辑旅行记录                                │
│                                             │
│  开始日期                                    │
│  ┌───────────────────────────────────────┐  │
│  │ [date input]                          │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  结束日期（可选）                             │
│  ┌───────────────────────────────────────┐  │
│  │ [date input]                          │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ⚠ 与已有记录 2024-03-01 ~ 2024-03-05      │
│    存在日期重叠                              │
│                                             │
│  备注                                        │
│  ┌───────────────────────────────────────┐  │
│  │ [textarea, max 1000 chars]            │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  标签                                        │
│  ┌───────────────────────────────────────┐  │
│  │ [TagInput component]                  │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  [保存修改]  [取消]                           │
└─────────────────────────────────────────────┘
```

**样式约束：**

- 表单容器：`rounded-[22px] border border-[#e6d9ec] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(253,245,255,0.94))] p-4`（复用 TripDateForm 样式）
- 输入框：`min-h-11 rounded-xl border border-[#d7dcea] bg-white px-3 py-2 text-[var(--font-label-size)] text-[var(--color-ink-strong)]`（复用 TripDateForm 样式）
- Textarea：同输入框样式，`min-h-24 resize-none`
- 按钮样式：复用 TripDateForm 按钮模式
  - 保存：`rounded-full border border-[#f4d7e4] bg-[linear-gradient(135deg,rgba(255,232,242,0.96),rgba(255,246,250,0.96))] px-4 py-2 text-[var(--font-label-size)] font-bold text-[var(--color-accent-strong)] shadow-[0_14px_28px_rgba(244,143,177,0.34)] transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 active:scale-95 disabled:cursor-not-allowed disabled:opacity-55`
  - 取消：`rounded-full border border-[#d7dcea] bg-white/80 px-4 py-2 text-[var(--font-label-size)] font-bold text-[var(--color-ink-muted)] transition-all duration-300 ease-out hover:scale-105 active:scale-95`
- 日期冲突警告：`text-[var(--font-label-size)] font-bold text-[var(--color-destructive)]` + `role="alert"`

**验证规则：**

| 字段 | 规则 | 错误提示 |
|------|------|---------|
| 开始日期 | 必填 | `请选择开始日期` |
| 结束日期 | 可选，不能早于开始日期 | `结束日期不能早于开始日期` |
| 备注 | 可选，最长 1000 字符 | `备注不能超过 1000 字符` |
| 标签 | 最多 10 个，每个最长 20 字符 | 由 TagInput 组件内部处理 |

---

### 3. TagInput.vue（新建）

**Props：**

```typescript
interface TagInputProps {
  tags: string[]
  maxTags?: number       // 默认 10
  maxTagLength?: number  // 默认 20
}
```

**Emits：**

```typescript
const emit = defineEmits<{
  'update:tags': [tags: string[]]
}>()
```

**交互流程：**

1. 输入框输入文字 → 回车或逗号添加标签
2. 输入框失焦时自动添加当前内容（非空时）
3. 点击标签 chip 的 × 按钮删除标签
4. 达到 maxTags 上限时禁用输入

**布局：**

```
┌───────────────────────────────────────────────┐
│  [美食 ×] [文化 ×] [历史 ×]  [输入框...]       │
└───────────────────────────────────────────────┘
```

**样式：**

- 容器：`flex flex-wrap gap-2 items-center min-h-11 rounded-xl border border-[#d7dcea] bg-white p-2`
- Tag chip：`inline-flex items-center gap-1 rounded-full border border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)]/30 px-3 py-1 text-xs font-semibold text-[var(--color-ink-strong)]`
- 删除按钮：`ml-1 text-[var(--color-ink-soft)] hover:text-[var(--color-destructive)]`
- 输入框：`flex-1 min-w-[80px] outline-none bg-transparent text-[var(--font-label-size)] text-[var(--color-ink-strong)]`
- 提示文字：`text-xs text-[var(--color-ink-soft)]`

**边界情况：**

- 重复标签：自动忽略，短暂高亮已有 chip
- 超长标签：输入超过 maxTagLength 时截断输入
- 空标签：trim 后为空则不添加
- 去重：trim + 去重后存储

---

### 4. ConfirmDialog.vue（新建）

**Props：**

```typescript
interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string      // 默认 "确认"
  cancelLabel?: string       // 默认 "取消"
  tone?: 'default' | 'destructive'  // destructive 时确认按钮用红色
}
```

**Emits：**

```typescript
const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
```

**交互流程：**

1. `isOpen=true` 时显示弹窗 + backdrop
2. 点击确认按钮 → `emit('confirm')`
3. 点击取消按钮 / backdrop → `emit('cancel')`
4. 按 ESC 键 → `emit('cancel')`
5. 弹窗打开时自动聚焦到第一个可交互元素

**布局：**

```
┌─────────────────────────────────────────────┐
│  ⚠ 删除旅行记录                              │
│                                             │
│  确认删除这条旅行记录？                        │
│                                             │
│  [确认删除]  [取消]                           │
└─────────────────────────────────────────────┘
```

**样式（复用 LocalImportDecisionDialog）：**

- Backdrop：`fixed inset-0 z-[6] flex items-center justify-center bg-[rgba(87,66,95,0.16)] px-4 py-6 backdrop-blur-sm`
- 弹窗容器：`w-full max-w-[28rem] overflow-hidden rounded-[32px] border border-white/85 bg-[var(--color-surface)]/96 text-[var(--color-ink-strong)] shadow-[var(--shadow-stage)] backdrop-blur-xl`
- 标题区域：`border-b border-white/80 px-6 pb-5 pt-6`
- 内容区域：`space-y-5 px-6 pb-6 pt-5`
- 确认按钮（default）：复用 LocalImportDecisionDialog 的主按钮样式
- 确认按钮（destructive）：`border-[#e8c4c4] bg-[#fef2f2] text-[var(--color-destructive)] hover:bg-[#fde8e8]`
- 取消按钮：复用 LocalImportDecisionDialog 的次按钮样式
- ARIA：`role="dialog"`, `aria-modal="true"`, `aria-labelledby`

**动画：**

- 进入：`transition-all duration-[var(--motion-emphasis)]`，backdrop 渐入
- 退出：backdrop 渐出
- `prefers-reduced-motion` 时禁用动画

---

### 5. 日期冲突检查（EDIT-04）

**检查时机：** 开始日期或结束日期变化时触发

**数据源：** `store.tripsByPlaceId`（`Map<string, TravelRecord[]>`）

**检查逻辑：**

```typescript
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

**展示方式：**

- 冲突时在日期字段下方显示警告文字（不阻塞提交）
- 警告样式：`text-[var(--font-label-size)] font-bold text-[var(--color-destructive)]`
- 警告内容：`与已有记录 {dateRange} 存在日期重叠`
- 多个冲突时合并显示，用逗号分隔

**重要：** 前端冲突检查仅作为 UX 优化（提前提示），不阻塞提交。后端 409 错误仍需正确处理（store.updateRecord 的 catch 已处理回滚+notice）。

---

### 6. 删除最后一条检测（DEL-03）

**检测时机：** 用户点击删除按钮时

**数据源：** `TimelineEntry.visitCount`

**逻辑：**

```typescript
function getDeleteConfirmMessage(entry: TimelineEntry): {
  title: string
  message: string
  tone: 'default' | 'destructive'
} {
  if (entry.visitCount === 1) {
    return {
      title: '删除该地点最后一条记录',
      message: '这是该地点的唯一一条记录，删除后将取消该地点的点亮状态。确认删除？',
      tone: 'destructive',
    }
  }
  return {
    title: '删除旅行记录',
    message: '确认删除这条旅行记录？',
    tone: 'default',
  }
}
```

**交互流程：**

1. 用户点击删除按钮
2. 根据 visitCount 判断是否为最后一条
3. 显示对应的 ConfirmDialog
4. 用户确认 → 调用 `store.deleteSingleRecord(recordId)`
5. 用户取消 → 关闭弹窗

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Focus management | 弹窗打开时聚焦到第一个可交互元素，关闭时恢复焦点到触发按钮 |
| Keyboard navigation | ESC 关闭弹窗，Tab 在弹窗内循环 |
| ARIA roles | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Error announcements | 日期冲突警告使用 `role="alert"` |
| Reduced motion | `prefers-reduced-motion: reduce` 时禁用按钮 hover 动画和弹窗动画 |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

---

*Phase: 38-ui*
*Created: 2026-04-29*
*Based on: 38-RESEARCH.md, tokens.css, TimelineVisitCard.vue, TripDateForm.vue, LocalImportDecisionDialog.vue*
