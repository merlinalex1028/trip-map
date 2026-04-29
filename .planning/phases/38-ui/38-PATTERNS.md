# Phase 38: 时间轴编辑/删除 UI - Pattern Map

**Mapped:** 2026-04-29
**Files analyzed:** 7（3 新建 + 1 修改 + 3 测试）
**Analogs found:** 5 / 7

## File Classification

| File | Action | Role | Data Flow | Closest Analog | Match Quality |
|------|--------|------|-----------|----------------|---------------|
| `apps/web/src/components/timeline/TimelineVisitCard.vue` | 修改 | 展示+交互组件 | 事件驱动（emit） | 自身现有代码 | exact |
| `apps/web/src/components/timeline/TimelineEditForm.vue` | 新建 | 表单组件 | emit → store | `map-popup/TripDateForm.vue` | exact |
| `apps/web/src/components/timeline/TagInput.vue` | 新建 | 输入控件 | v-model emit | 无直接 analog | — |
| `apps/web/src/components/timeline/ConfirmDialog.vue` | 新建 | 弹窗组件 | emit | `auth/LocalImportDecisionDialog.vue` | high |
| `apps/web/src/components/timeline/TimelineVisitCard.spec.ts` | 新建 | 单元测试 | — | `views/TimelinePageView.spec.ts` | high |
| `apps/web/src/components/timeline/TimelineEditForm.spec.ts` | 新建 | 单元测试 | — | `views/TimelinePageView.spec.ts` | high |
| `apps/web/src/services/date-conflict.ts` | 新建 | 纯函数工具 | 数据转换 | `services/timeline.ts` | medium |

## Pattern Assignments

### 1. `TimelineVisitCard.vue`（修改：添加编辑/删除交互）

**Analog:** 自身现有代码 + `TripDateForm.vue` 的 emit 模式

**现有结构（保持不变）：**
```vue
<!-- apps/web/src/components/timeline/TimelineVisitCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { TimelineEntry } from '../../services/timeline'

const props = defineProps<{
  entry: TimelineEntry
}>()
</script>
```

**扩展方向：**
- 新增 `isEditing` ref 控制编辑模式切换
- 新增 emits: `edit(payload)`, `delete(entry)`
- 编辑模式下渲染 `<TimelineEditForm>` 替代只读内容
- 删除按钮触发 `<ConfirmDialog>`
- 卡片 `data-region="timeline-entry"` 属性保持不变（测试依赖）

**Props 扩展：**
```typescript
// 新增 props（不影响现有 entry prop）
const props = defineProps<{
  entry: TimelineEntry
  conflictingDates?: string[]  // 来自 date-conflict 检查结果
}>()

const emit = defineEmits<{
  edit: [payload: UpdateTravelRecordRequest]
  delete: [recordId: string]
}>()
```

**编辑模式切换模式（参考 TripDateForm 的 submit/cancel emit）：**
```typescript
const isEditing = ref(false)
const isDeleting = ref(false) // 控制 ConfirmDialog 显示

function handleEditClick() {
  isEditing.value = true
}

function handleEditCancel() {
  isEditing.value = false
}

async function handleEditSubmit(payload: UpdateTravelRecordRequest) {
  emit('edit', payload)
  // 注意：成功后由父组件或 store 更新触发退出编辑模式
  // 因为 store.updateRecord 是异步的，父组件监听完成后设 isEditing = false
}

function handleDeleteClick() {
  isDeleting.value = true
}

function handleDeleteConfirm() {
  emit('delete', props.entry.recordId)
  isDeleting.value = false
}
```

---

### 2. `TimelineEditForm.vue`（新建：编辑表单）

**Analog:** `apps/web/src/components/map-popup/TripDateForm.vue`（exact match）

**Props/Emits 模式（直接参考 TripDateForm）：**
```typescript
// TripDateForm 模式：
// Props: { isSubmitting?: boolean }
// Emits: submit(payload), cancel()

// TimelineEditForm 扩展为：
interface Props {
  record: TimelineEntry
  conflictingDates?: string[]
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  conflictingDates: () => [],
  isSubmitting: false,
})

const emit = defineEmits<{
  submit: [payload: UpdateTravelRecordRequest]
  cancel: []
}>()
```

**内部状态管理（参考 TripDateForm 的 ref 模式）：**
```typescript
// TripDateForm: const startDate = ref(''); const endDate = ref('')
// TimelineEditForm 扩展：
const startDate = ref(props.record.startDate ?? '')
const endDate = ref(props.record.endDate ?? '')
const notes = ref(props.record.notes ?? '')
const tags = ref<string[]>([...props.record.tags])
```

**日期验证（复用 TripDateForm 的 hasRangeError 模式）：**
```typescript
// 直接复制 TripDateForm 的验证逻辑：
const hasStartDate = computed(() => startDate.value !== '')
const hasRangeError = computed(
  () => hasStartDate.value && endDate.value !== '' && endDate.value < startDate.value,
)
const isValid = computed(() => hasStartDate.value && !hasRangeError.value)
const rangeErrorMessage = computed(() =>
  hasRangeError.value ? '结束日期不能早于开始日期' : null,
)
```

**日期输入样式（直接复用 TripDateForm 的 Tailwind classes）：**
```vue
<!-- 从 TripDateForm 复制的输入样式 -->
<input
  v-model="startDate"
  type="date"
  required
  :max="endDate || undefined"
  class="min-h-11 rounded-xl border border-[#d7dcea] bg-white px-3 py-2 text-[var(--font-label-size)] text-[var(--color-ink-strong)]"
/>
```

**日期冲突警告（新增，参考 TripDateForm 的 rangeErrorMessage 模式）：**
```vue
<p
  v-if="conflictingDates.length > 0"
  class="text-[var(--font-label-size)] font-bold text-[var(--color-warning)]"
  role="alert"
>
  ⚠ 与以下记录日期重叠：{{ conflictingDates.join('、') }}
</p>
```

**提交逻辑（参考 TripDateForm 的 handleSubmit）：**
```typescript
function handleSubmit() {
  if (!isValid.value || props.isSubmitting) {
    return
  }

  const trimmedNotes = notes.value.trim()
  emit('submit', {
    startDate: startDate.value || null,
    endDate: endDate.value || null,
    notes: trimmedNotes || null,
    tags: tags.value,
  })
}
```

**按钮样式（复用 TripDateForm 的 submit/cancel 按钮 classes）：**
```vue
<!-- submit 按钮 - 直接从 TripDateForm 复制 -->
<button
  type="submit"
  class="min-h-11 rounded-full border border-[#f4d7e4] bg-[linear-gradient(135deg,rgba(255,232,242,0.96),rgba(255,246,250,0.96))] px-4 py-2 text-[var(--font-label-size)] font-bold text-[var(--color-accent-strong)] shadow-[0_14px_28px_rgba(244,143,177,0.34)] transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 active:scale-95 disabled:cursor-not-allowed disabled:opacity-55"
  :disabled="!isValid || isSubmitting"
>
  保存修改
</button>

<!-- cancel 按钮 - 直接从 TripDateForm 复制 -->
<button
  type="button"
  class="min-h-11 rounded-full border border-[#d7dcea] bg-white/80 px-4 py-2 text-[var(--font-label-size)] font-bold text-[var(--color-ink-muted)] transition-all duration-300 ease-out hover:scale-105 active:scale-95"
  @click="emit('cancel')"
>
  取消
</button>
```

**Reduced motion 支持（复用 TripDateForm 的 scoped style）：**
```vue
<style scoped>
@media (prefers-reduced-motion: reduce) {
  /* 同 TripDateForm 的处理 */
}
</style>
```

---

### 3. `TagInput.vue`（新建：标签输入控件）

**Analog:** 无直接 analog，但遵循项目 Vue 组件模式

**Props/Emits 设计：**
```typescript
interface Props {
  tags: string[]
  maxTags?: number       // 默认 10
  maxTagLength?: number  // 默认 20
}

const props = withDefaults(defineProps<Props>(), {
  maxTags: 10,
  maxTagLength: 20,
})

const emit = defineEmits<{
  'update:tags': [tags: string[]]
}>()
```

**标签操作（不可变模式）：**
```typescript
function addTag(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) return
  if (props.tags.includes(trimmed)) return
  if (props.tags.length >= props.maxTags) return
  if (trimmed.length > props.maxTagLength) return

  emit('update:tags', [...props.tags, trimmed])
  inputValue.value = ''
}

function removeTag(index: number) {
  const next = props.tags.filter((_, i) => i !== index)
  emit('update:tags', next)
}
```

**输入交互：**
```typescript
const inputValue = ref('')

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addTag(inputValue.value)
  }
  if (event.key === 'Backspace' && inputValue.value === '' && props.tags.length > 0) {
    removeTag(props.tags.length - 1)
  }
}

// Pitfall 4 解决：失焦时自动添加
function handleBlur() {
  if (inputValue.value.trim()) {
    addTag(inputValue.value)
  }
}
```

**UI 样式（参考项目 pill/badge 模式，如 TimelineVisitCard 的 typeLabel pill）：**
```vue
<span
  class="inline-flex items-center rounded-full border border-[#d6ebf2] bg-[#effafc] px-3 py-1 text-xs font-semibold text-[var(--color-ink-strong)]"
>
  {{ tag }}
  <button type="button" class="ml-1" @click="removeTag(index)">×</button>
</span>
```

---

### 4. `ConfirmDialog.vue`（新建：通用确认弹窗）

**Analog:** `apps/web/src/components/auth/LocalImportDecisionDialog.vue`（high match）

**弹窗结构（直接参考 LocalImportDecisionDialog）：**
```vue
<!-- LocalImportDecisionDialog 的弹窗骨架 -->
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

**ESC 键关闭（参考 AuthDialog 的 @keydown.esc.prevent）：**
```vue
<!-- AuthDialog 模式：@keydown.esc.prevent="handleDialogClose" -->
<div @keydown.esc.prevent="handleCancel">
```

**Props 设计：**
```typescript
interface Props {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string   // 默认 "确认"
  cancelLabel?: string    // 默认 "取消"
  tone?: 'default' | 'destructive'
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: '确认',
  cancelLabel: '取消',
  tone: 'default',
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
```

**确认按钮样式（destructive 时用红色）：**
```vue
<button
  type="button"
  :class="[
    'min-h-11 rounded-full px-5 py-3 text-sm font-semibold transition',
    tone === 'destructive'
      ? 'border border-[color:color-mix(in_srgb,var(--color-destructive)_22%,white_78%)] bg-[var(--color-destructive)] text-white'
      : 'border border-[color:color-mix(in_srgb,var(--color-accent)_22%,white_78%)] bg-[linear-gradient(135deg,rgba(255,232,242,0.96),rgba(255,246,250,0.96))] text-[var(--color-accent-strong)]',
  ]"
  @click="emit('confirm')"
>
  {{ confirmLabel }}
</button>
```

---

### 5. `date-conflict.ts`（新建：日期冲突检查纯函数）

**Analog:** `apps/web/src/services/timeline.ts`（纯函数 + 数据转换模式）

**函数签名（参考 timeline.ts 的 buildTimelineEntries 纯函数模式）：**
```typescript
// timeline.ts: export function buildTimelineEntries(records: TravelRecord[]): TimelineEntry[]
// date-conflict.ts:
import type { TravelRecord } from '@trip-map/contracts'

export function checkDateConflict(
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

---

### 6. 测试文件模式

**Analog:** `apps/web/src/views/TimelinePageView.spec.ts`（high match）

**测试基础设施（直接复用 TimelinePageView.spec.ts 模式）：**
```typescript
// Pinia 初始化模式
import { createPinia, setActivePinia } from 'pinia'

function mountComponent(setup?: (context: {
  mapPointsStore: ReturnType<typeof useMapPointsStore>
}) => void) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const mapPointsStore = useMapPointsStore()
  setup?.({ mapPointsStore })

  const wrapper = mount(TargetComponent, {
    global: { plugins: [pinia] },
  })
  return { mapPointsStore, wrapper }
}
```

**测试数据工厂（复用 makeRecord 模式）：**
```typescript
function makeRecord(overrides: Partial<TravelRecord> = {}): TravelRecord {
  return {
    id: 'record-1',
    placeId: 'place-1',
    boundaryId: 'boundary-1',
    placeKind: 'CITY',
    datasetVersion: 'v1',
    displayName: '北京',
    regionSystem: 'CN',
    adminType: 'DIRECT_ADMINISTERED',
    typeLabel: '市',
    parentLabel: '中国',
    subtitle: '',
    startDate: '2025-01-15',
    endDate: null,
    createdAt: '2025-01-16T00:00:00.000Z',
    updatedAt: '2025-01-16T00:00:00.000Z',
    notes: null,
    tags: [],
    ...overrides,
  }
}
```

**data 属性查询模式（复用 TimelinePageView.spec.ts 的 find 模式）：**
```typescript
// 现有：wrapper.find('[data-region="timeline-entry"]')
// 新增：wrapper.find('[data-confirm-dialog-backdrop"]')
// 新增：wrapper.find('[data-edit-form]')
```

---

### 7. Store 调用模式

**Source:** `apps/web/src/stores/map-points.ts`（lines 526-582, 584-620）

**updateRecord 调用（组件中直接调用 store 方法）：**
```typescript
import { useMapPointsStore } from '../../stores/map-points'

const mapPointsStore = useMapPointsStore()

async function handleEditSubmit(payload: UpdateTravelRecordRequest) {
  isSubmitting.value = true
  try {
    await mapPointsStore.updateRecord(props.entry.recordId, payload)
    isEditing.value = false
  } finally {
    isSubmitting.value = false
  }
}
```

**deleteSingleRecord 调用：**
```typescript
async function handleDeleteConfirm() {
  await mapPointsStore.deleteSingleRecord(props.entry.recordId)
  isDeleting.value = false
}
```

**tripsByPlaceId 数据源（用于日期冲突检查）：**
```typescript
import { storeToRefs } from 'pinia'

const { tripsByPlaceId } = storeToRefs(mapPointsStore)

const conflictingDates = computed(() =>
  checkDateConflict(
    props.entry.placeId,
    props.entry.recordId,
    startDate.value || null,
    endDate.value || null,
    tripsByPlaceId.value,
  ),
)
```

---

## Shared Patterns

### 表单按钮样式
**Source:** `apps/web/src/components/map-popup/TripDateForm.vue`（lines 94-113）
**Apply to:** `TimelineEditForm.vue`

```vue
<!-- submit 按钮 -->
<button
  type="submit"
  class="min-h-11 rounded-full border border-[#f4d7e4] bg-[linear-gradient(135deg,rgba(255,232,242,0.96),rgba(255,246,250,0.96))] px-4 py-2 text-[var(--font-label-size)] font-bold text-[var(--color-accent-strong)] shadow-[0_14px_28px_rgba(244,143,177,0.34)] transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 active:scale-95 disabled:cursor-not-allowed disabled:opacity-55"
>
  保存修改
</button>

<!-- cancel 按钮 -->
<button
  type="button"
  class="min-h-11 rounded-full border border-[#d7dcea] bg-white/80 px-4 py-2 text-[var(--font-label-size)] font-bold text-[var(--color-ink-muted)] transition-all duration-300 ease-out hover:scale-105 active:scale-95"
>
  取消
</button>
```

### 模态弹窗骨架
**Source:** `apps/web/src/components/auth/LocalImportDecisionDialog.vue`（lines 41-48）
**Apply to:** `ConfirmDialog.vue`

```vue
<div
  v-if="isOpen"
  class="fixed inset-0 z-[6] flex items-center justify-center bg-[rgba(87,66,95,0.16)] px-4 py-6 backdrop-blur-sm"
  @keydown.esc.prevent="handleCancel"
>
  <section
    class="w-full max-w-[28rem] overflow-hidden rounded-[32px] border border-white/85 bg-[var(--color-surface)]/96 text-[var(--color-ink-strong)] shadow-[var(--shadow-stage)] backdrop-blur-xl"
    role="dialog"
    aria-modal="true"
  >
    <!-- content -->
  </section>
</div>
```

### 日期输入样式
**Source:** `apps/web/src/components/map-popup/TripDateForm.vue`（lines 56-68）
**Apply to:** `TimelineEditForm.vue`

```vue
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

### Pill/Tag 样式
**Source:** `apps/web/src/components/timeline/TimelineVisitCard.vue`（lines 36-41）
**Apply to:** `TagInput.vue`

```vue
<span
  class="inline-flex items-center rounded-full border border-[#d6ebf2] bg-[#effafc] px-3 py-1 text-xs font-semibold text-[var(--color-ink-strong)]"
>
  {{ label }}
</span>
```

### 错误/警告提示样式
**Source:** `apps/web/src/components/map-popup/TripDateForm.vue`（lines 85-92）
**Apply to:** `TimelineEditForm.vue`

```vue
<p
  v-if="errorMessage"
  class="text-[var(--font-label-size)] font-bold text-[var(--color-destructive)]"
  role="alert"
>
  {{ errorMessage }}
</p>
```

## No Analog Found

| File | Why |
|------|-----|
| `TagInput.vue` | 项目中无类似的标签输入控件，需全新设计但遵循项目 Vue + Tailwind 模式 |
| `date-conflict.spec.ts` | 日期冲突逻辑为新功能，无现有测试可参考 |

## Metadata

**Analog search scope:** `apps/web/src/components/`, `apps/web/src/stores/`, `apps/web/src/services/`, `apps/web/src/views/`
**Files scanned:** 12
**Pattern extraction date:** 2026-04-29
