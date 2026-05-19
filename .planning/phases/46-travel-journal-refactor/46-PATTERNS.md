# Phase 46: 旅途手账重构 - Pattern Map

**Mapped:** 2026-05-19  
**Files analyzed:** 12  
**Analogs found:** 12 / 12

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `apps/web/src/views/TimelinePageView.vue` | component/view | request-response | `apps/web/src/views/TimelinePageView.vue` | exact |
| `apps/web/src/components/timeline/TimelineVisitCard.vue` | component | CRUD | `apps/web/src/components/timeline/TimelineVisitCard.vue` | exact |
| `apps/web/src/components/timeline/TimelineEditForm.vue` | component | CRUD | `apps/web/src/components/timeline/TimelineEditForm.vue` | exact |
| `apps/web/src/components/timeline/ConfirmDialog.vue` | component | event-driven | `apps/web/src/components/timeline/ConfirmDialog.vue` | exact |
| `apps/web/src/components/timeline/JournalPostcardThumb.vue` | component | transform | `apps/web/src/components/common/KawaiiIcon.vue` | role-match |
| `apps/web/src/components/timeline/journal-thumbnails.ts` | utility | transform | `apps/web/src/services/timeline.ts` | data-flow-match |
| `apps/web/src/components/timeline/journal-thumbnails.spec.ts` | test | transform | `apps/web/src/services/timeline.spec.ts` | data-flow-match |
| `apps/web/src/views/TimelinePageView.spec.ts` | test | request-response | `apps/web/src/views/TimelinePageView.spec.ts` | exact |
| `apps/web/src/components/timeline/TimelineVisitCard.spec.ts` | test | CRUD | `apps/web/src/components/timeline/TimelineVisitCard.spec.ts` | exact |
| `apps/web/src/components/shell/ShellSidebar.vue` | component | request-response | `apps/web/src/components/shell/ShellSidebar.vue` | exact |
| `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` | test | request-response | `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` | role-match |
| `apps/web/src/router/index.spec.ts` | test | request-response | `apps/web/src/router/index.spec.ts` | exact |

## Pattern Assignments

### `apps/web/src/views/TimelinePageView.vue` (component/view, request-response)

**Analog:** `apps/web/src/views/TimelinePageView.vue`

**Imports and store pattern** (lines 1-18):
```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { useAuthSessionStore } from '../stores/auth-session'
import { useMapPointsStore } from '../stores/map-points'

const authSessionStore = useAuthSessionStore()
const mapPointsStore = useMapPointsStore()

const { currentUser, status } = storeToRefs(authSessionStore)
const { timelineEntries } = storeToRefs(mapPointsStore)
```

**State-branching pattern** (lines 20-29):
```typescript
const isRestoring = computed(() => status.value === 'restoring')
const shouldShowAnonymousState = computed(
  () => status.value !== 'authenticated' || currentUser.value === null,
)
const shouldShowEmptyState = computed(
  () => status.value === 'authenticated' && timelineEntries.value.length === 0,
)
const shouldShowTimeline = computed(
  () => status.value === 'authenticated' && timelineEntries.value.length > 0,
)
```

**Route shell and state marker pattern** (lines 33-37, 73-78, 97-101, 123-127, 149-171):
```vue
<section
  class="flex min-h-0 flex-col gap-5 overflow-y-auto ..."
  data-region="journal-shell"
  data-route-view="journal"
>
  <div v-if="isRestoring" data-state="restoring" aria-live="polite">...</div>
  <div v-else-if="shouldShowAnonymousState" data-state="anonymous">...</div>
  <div v-else-if="shouldShowEmptyState" data-state="empty">...</div>

  <div v-else-if="shouldShowTimeline" class="grid gap-4" data-state="populated">
    <TimelineVisitCard
      v-for="entry in timelineEntries"
      :key="entry.recordId"
      :entry="entry"
    />
  </div>
</section>
```

**Empty-state navigation pattern** (lines 135-145):
```vue
<p class="max-w-2xl text-sm leading-6 text-[var(--color-ink-muted)]">
  去世界足迹选择真实地点，记录第一段旅途。
</p>
<RouterLink
  class="inline-flex min-h-11 items-center justify-center ..."
  to="/map"
>
  去世界足迹留下足迹
</RouterLink>
```

**Apply:** Keep the view as the route composition surface. Replace the populated grid with the glowing journal stream, but keep `data-route-view`, `data-state`, store refs, auth branches, and empty-state `/map` navigation.

---

### `apps/web/src/components/timeline/TimelineVisitCard.vue` (component, CRUD)

**Analog:** `apps/web/src/components/timeline/TimelineVisitCard.vue`

**Imports and props pattern** (lines 1-17):
```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import type { UpdateTravelRecordRequest } from '@trip-map/contracts'
import type { TimelineEntry } from '../../services/timeline'
import { useMapPointsStore } from '../../stores/map-points'
import { checkDateConflict } from '../../services/date-conflict'
import ConfirmDialog from './ConfirmDialog.vue'
import TimelineEditForm from './TimelineEditForm.vue'

const props = defineProps<{
  entry: TimelineEntry
}>()

const mapPointsStore = useMapPointsStore()
const { tripsByPlaceId } = storeToRefs(mapPointsStore)
```

**Local UI state and display derivation** (lines 19-35):
```typescript
const isEditing = ref(false)
const isSubmitting = ref(false)
const isDeleteDialogOpen = ref(false)

const secondaryLabel = computed(() => props.entry.subtitle || props.entry.parentLabel)

const dateLabel = computed(() => {
  if (props.entry.startDate === null) {
    return '日期未知'
  }

  if (props.entry.endDate !== null) {
    return `${props.entry.startDate} - ${props.entry.endDate}`
  }

  return props.entry.startDate
})
```

**Validation integration and CRUD handlers** (lines 37-46, 71-92):
```typescript
const conflictingDates = computed(() => {
  if (!isEditing.value) return []
  return checkDateConflict(
    props.entry.placeId,
    props.entry.recordId,
    props.entry.startDate,
    props.entry.endDate,
    tripsByPlaceId.value,
  )
})

async function handleEditSubmit(payload: UpdateTravelRecordRequest) {
  isSubmitting.value = true
  try {
    await mapPointsStore.updateRecord(props.entry.recordId, payload)
    isEditing.value = false
  } finally {
    isSubmitting.value = false
  }
}

async function handleDeleteConfirm() {
  await mapPointsStore.deleteSingleRecord(props.entry.recordId)
  isDeleteDialogOpen.value = false
}
```

**Inline edit and confirm dialog integration** (lines 100-108, 206-216):
```vue
<TimelineEditForm
  v-if="isEditing"
  :record="entry"
  :conflicting-dates="conflictingDates"
  :is-submitting="isSubmitting"
  @submit="handleEditSubmit"
  @cancel="handleEditCancel"
/>

<ConfirmDialog
  :is-open="isDeleteDialogOpen"
  :title="deleteDialogConfig.title"
  :message="deleteDialogConfig.message"
  :tone="deleteDialogConfig.tone"
  confirm-label="确认删除"
  cancel-label="取消"
  @confirm="handleDeleteConfirm"
  @cancel="handleDeleteCancel"
/>
```

**Current action bar to refactor into quiet management area** (lines 184-201):
```vue
<div class="flex gap-3 border-t border-white/80 pt-4">
  <button type="button" data-card-edit @click="handleEditClick">编辑</button>
  <button type="button" data-card-delete @click="handleDeleteClick">删除</button>
</div>
```

**Apply:** Preserve handlers, store calls, `TimelineEditForm`, `ConfirmDialog`, repeated visit badge, and `data-card-edit` / `data-card-delete` test hooks. Move the triggers into a low-noise menu/reveal; do not remove edit/delete behavior.

---

### `apps/web/src/components/timeline/TimelineEditForm.vue` (component, CRUD)

**Analog:** `apps/web/src/components/timeline/TimelineEditForm.vue`

**Typed props/emits pattern** (lines 9-23):
```typescript
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

**Form state and validation pattern** (lines 25-42):
```typescript
const startDate = ref(props.record.startDate ?? '')
const endDate = ref(props.record.endDate ?? '')
const notes = ref(props.record.notes ?? '')
const tags = ref<string[]>([...props.record.tags])

const hasStartDate = computed(() => startDate.value !== '')
const hasRangeError = computed(
  () => hasStartDate.value && endDate.value !== '' && endDate.value < startDate.value,
)
const notesTooLong = computed(() => notes.value.length > 1000)
const isValid = computed(() => hasStartDate.value && !hasRangeError.value && !notesTooLong.value)
```

**Submit payload pattern** (lines 44-56):
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

**Accessible field/test-hook pattern** (lines 73-81, 120-127, 149-164):
```vue
<input
  v-model="startDate"
  type="date"
  required
  data-edit-input="start-date"
  aria-label="选择旅行开始日期"
/>

<textarea
  v-model="notes"
  maxlength="1000"
  data-edit-input="notes"
  aria-label="旅行备注"
/>

<button type="submit" :disabled="!isValid || isSubmitting" data-edit-submit="true">
  保存修改
</button>
<button type="button" data-edit-cancel="true" @click="emit('cancel')">
  取消
</button>
```

**Apply:** Restyle only the container if needed. Keep validation, `TagInput`, submit/cancel event contract, and existing `data-edit-*` selectors.

---

### `apps/web/src/components/timeline/ConfirmDialog.vue` (component, event-driven)

**Analog:** `apps/web/src/components/timeline/ConfirmDialog.vue`

**Typed props/emits pattern** (lines 2-20):
```typescript
interface Props {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
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

**Dismissal and dialog semantics** (lines 22-32, 36-43):
```typescript
function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('cancel')
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('cancel')
  }
}
```

```vue
<div
  v-if="isOpen"
  data-confirm-dialog-backdrop
  role="dialog"
  aria-modal="true"
  @click="handleBackdropClick"
  @keydown="handleKeydown"
>
```

**Destructive button pattern** (lines 61-70):
```vue
<button
  type="button"
  :class="[
    'inline-flex min-h-11 w-full items-center justify-center ...',
    tone === 'destructive'
      ? 'border border-[#e8c4c4] bg-[#fef2f2] text-[var(--color-destructive)] hover:bg-[#fde8e8]'
      : 'border border-[color:color-mix(in_srgb,var(--color-accent)_22%,white_78%)] ...',
  ]"
  data-confirm-dialog-confirm
  @click="emit('confirm')"
>
```

**Apply:** Reuse for delete confirmation. If moving to local Dialog primitives later, preserve all `data-confirm-dialog-*` behavior and tests.

---

### `apps/web/src/components/timeline/JournalPostcardThumb.vue` (component, transform)

**Analog:** `apps/web/src/components/common/KawaiiIcon.vue`

**Decorative media accessibility pattern** (lines 7-15, 27-33):
```vue
const props = withDefaults(defineProps<{
  name: KawaiiIconName
  label?: string
  decorative?: boolean
  size?: number
}>(), {
  decorative: true,
  size: 24,
})

<img
  :src="entry.src"
  :alt="decorative ? '' : label"
  :aria-hidden="decorative ? 'true' : undefined"
  :width="size"
  :height="size"
>
```

**CSS/DOM decorative analogue:** `ShellSidebar.vue` uses decorative assets with empty alt and `aria-hidden` (lines 68-73, 187-192):
```vue
<img
  :src="logoCat"
  alt=""
  aria-hidden="true"
  class="h-11 w-11 object-contain"
  data-shell-logo
>

<img
  :src="sidebarCameraGirl"
  alt=""
  aria-hidden="true"
  class="sidebar-illustration__image object-contain ..."
  data-shell-illustration
>
```

**Apply:** The postcard thumbnail should be a presentational component with typed props such as `variant` and optional `class`. Use `aria-hidden="true"` or `alt=""`; do not expose photo/upload language and do not make it focusable.

---

### `apps/web/src/components/timeline/journal-thumbnails.ts` (utility, transform)

**Analog:** `apps/web/src/services/timeline.ts`

**Pure transform interface pattern** (lines 1-19):
```typescript
import type { TravelRecord } from '@trip-map/contracts'

export interface TimelineEntry {
  recordId: string
  placeId: string
  displayName: string
  parentLabel: string
  subtitle: string
  typeLabel: string
  startDate: string | null
  endDate: string | null
  createdAt: string
  hasKnownDate: boolean
  sortDate: string | null
  visitOrdinal: number
  visitCount: number
  notes: string | null
  tags: string[]
}
```

**Deterministic transform pattern** (lines 69-89):
```typescript
export function buildTimelineEntries(records: TravelRecord[]): TimelineEntry[] {
  const sortedEntries = records.map(toTimelineEntry).sort(compareTimelineEntries)
  const visitCounts = new Map<string, number>()

  for (const entry of sortedEntries) {
    visitCounts.set(entry.placeId, (visitCounts.get(entry.placeId) ?? 0) + 1)
  }

  const visitOrdinals = new Map<string, number>()

  return sortedEntries.map((entry) => {
    const visitOrdinal = (visitOrdinals.get(entry.placeId) ?? 0) + 1
    visitOrdinals.set(entry.placeId, visitOrdinal)

    return {
      ...entry,
      visitOrdinal,
      visitCount: visitCounts.get(entry.placeId) ?? 1,
    }
  })
}
```

**Apply:** Implement thumbnail variant and summary helpers as pure exported functions with no Vue refs, no random/index/date dependency. Inputs should use stable fields from `TimelineEntry` such as `placeId`, `parentLabel`, `subtitle`, `typeLabel`, and possibly `recordId`.

---

### `apps/web/src/components/timeline/journal-thumbnails.spec.ts` (test, transform)

**Analog:** `apps/web/src/services/timeline.spec.ts`

**Fixture factory pattern** (lines 1-34):
```typescript
import type { ResolvedCanonicalPlace, TravelRecord } from '@trip-map/contracts'
import {
  PHASE12_RESOLVED_BEIJING,
  PHASE28_RESOLVED_CALIFORNIA,
  PHASE28_RESOLVED_TOKYO,
} from '@trip-map/contracts'

function makeRecord(
  place: ResolvedCanonicalPlace,
  overrides: Partial<TravelRecord> = {},
): TravelRecord {
  return {
    id: `record-${place.placeId}`,
    placeId: place.placeId,
    boundaryId: place.boundaryId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    displayName: place.displayName,
    regionSystem: place.regionSystem,
    adminType: place.adminType,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
    startDate: null,
    endDate: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    notes: null,
    tags: [],
    ...overrides,
  }
}
```

**Black-box deterministic assertions** (lines 60-92, 154-193):
```typescript
it('orders dated entries from earliest to latest', () => {
  const entries = buildTimelineEntries([...])

  expect(entries.map((entry) => entry.recordId)).toEqual([
    'beijing-early',
    'california-middle',
    'tokyo-late',
  ])
})

it('assigns visitOrdinal and visitCount per place', () => {
  const entries = buildTimelineEntries([...])

  expect(entries).toEqual([
    expect.objectContaining({
      recordId: 'beijing-visit-1',
      visitOrdinal: 1,
      visitCount: 1,
    }),
  ])
})
```

**Apply:** Assert stable mapping by calling the helper multiple times with equivalent entries and different ordering. Assert summary picks the first meaningful note line and fallback copy for empty notes.

---

### `apps/web/src/views/TimelinePageView.spec.ts` (test, request-response)

**Analog:** `apps/web/src/views/TimelinePageView.spec.ts`

**Mount helper with Pinia and RouterLinkStub** (lines 56-89):
```typescript
function mountTimelinePage(
  setup?: (context: {
    authSessionStore: ReturnType<typeof useAuthSessionStore>
    mapPointsStore: ReturnType<typeof useMapPointsStore>
  }) => void,
) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authSessionStore = useAuthSessionStore()
  const mapPointsStore = useMapPointsStore()

  authSessionStore.status = 'anonymous'
  authSessionStore.currentUser = null
  setup?.({ authSessionStore, mapPointsStore })

  const wrapper = mount(TimelinePageView, {
    global: {
      plugins: [pinia],
      stubs: { RouterLink: RouterLinkStub },
    },
  })

  return { authSessionStore, mapPointsStore, wrapper }
}
```

**State assertions pattern** (lines 97-120):
```typescript
it('renders login CTA for anonymous visitors', async () => {
  const { authSessionStore, wrapper } = mountTimelinePage()
  const openAuthModalSpy = vi.spyOn(authSessionStore, 'openAuthModal')

  await wrapper.get('button').trigger('click')
  await nextTick()

  expect(wrapper.get('[data-route-view="journal"]').attributes('data-region')).toBe('journal-shell')
  expect(wrapper.get('[data-state="anonymous"]').text()).toContain('立即登录')
  expect(openAuthModalSpy).toHaveBeenCalledWith('login')
})

it('renders empty state for authenticated users without records', () => {
  const { wrapper } = mountTimelinePage(({ authSessionStore }) => {
    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = makeUser()
  })

  expect(wrapper.get('[data-state="empty"]').text()).toContain('还没有留下足迹')
})
```

**Repeated visit assertions** (lines 123-153):
```typescript
const cards = wrapper.findAll('[data-region="timeline-entry"]')

expect(wrapper.get('[data-state="populated"]').text()).toContain('共 2 条旅行记录')
expect(cards).toHaveLength(2)
expect(cards[0].text()).toContain('第 1 次 / 共 2 次')
expect(cards[1].text()).toContain('第 2 次 / 共 2 次')
```

**Apply:** Add absence tests for `添加新旅行`, `收藏`, `我的收藏`, and any `[data-card-favorite]`; assert empty state has exactly `/map` guidance, not a local add flow.

---

### `apps/web/src/components/timeline/TimelineVisitCard.spec.ts` (test, CRUD)

**Analog:** `apps/web/src/components/timeline/TimelineVisitCard.spec.ts`

**Fixture and mount helper pattern** (lines 9-40):
```typescript
function makeTimelineEntry(overrides: Partial<TimelineEntry> = {}): TimelineEntry {
  return {
    recordId: 'record-1',
    placeId: 'place-1',
    displayName: '北京',
    parentLabel: '中国',
    subtitle: '北京市',
    typeLabel: '市',
    startDate: '2025-01-15',
    endDate: null,
    createdAt: '2025-01-16T00:00:00.000Z',
    hasKnownDate: true,
    sortDate: '2025-01-15',
    visitOrdinal: 1,
    visitCount: 1,
    notes: null,
    tags: [],
    ...overrides,
  }
}

function mountCard(entry: TimelineEntry) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const mapPointsStore = useMapPointsStore()
  const wrapper = mount(TimelineVisitCard, {
    props: { entry },
    global: { plugins: [pinia] },
  })
  return { mapPointsStore, wrapper }
}
```

**CRUD behavior assertions** (lines 71-83, 102-123, 125-152):
```typescript
it('enters edit mode when edit button is clicked', async () => {
  const { wrapper } = mountCard(makeTimelineEntry())

  expect(wrapper.find('[data-region="timeline-edit-form"]').exists()).toBe(false)
  await wrapper.get('[data-card-edit]').trigger('click')
  expect(wrapper.find('[data-region="timeline-edit-form"]').exists()).toBe(true)
})

it('submits edit and calls store.updateRecord', async () => {
  const { mapPointsStore, wrapper } = mountCard(entry)
  const updateRecordSpy = vi.spyOn(mapPointsStore, 'updateRecord').mockResolvedValue(undefined)

  await wrapper.get('[data-card-edit]').trigger('click')
  await wrapper.get('form').trigger('submit')

  expect(updateRecordSpy).toHaveBeenCalledWith('record-1', {
    startDate: '2025-01-15',
    endDate: null,
    notes: '旅行备注',
    tags: ['美食'],
  })
})

it('calls store.deleteSingleRecord when delete is confirmed', async () => {
  const deleteSpy = vi.spyOn(mapPointsStore, 'deleteSingleRecord').mockResolvedValue(undefined)
  await wrapper.get('[data-card-delete]').trigger('click')
  await wrapper.get('[data-confirm-dialog-confirm]').trigger('click')
  expect(deleteSpy).toHaveBeenCalledWith('record-1')
})
```

**Content assertions to extend** (lines 188-207):
```typescript
it('renders notes section when entry has notes', () => {
  const { wrapper } = mountCard(makeTimelineEntry({ notes: '和家人一起去的' }))

  expect(wrapper.text()).toContain('和家人一起去的')
  expect(wrapper.text()).toContain('备注')
})

it('renders tags when entry has tags', () => {
  const { wrapper } = mountCard(makeTimelineEntry({ tags: ['美食', '文化', '历史'] }))

  expect(wrapper.text()).toContain('美食')
  expect(wrapper.text()).toContain('文化')
  expect(wrapper.text()).toContain('历史')
})
```

**Apply:** Keep selectors stable while changing visual hierarchy. Add tests for single-line `旅行摘记`, tag sticker limit, natural location path, decorative thumbnail accessibility, no favorite/add controls, and low-noise management trigger.

---

### `apps/web/src/components/shell/ShellSidebar.vue` (component, request-response)

**Analog:** `apps/web/src/components/shell/ShellSidebar.vue`

**Imports and nav model pattern** (lines 1-18, 20-35):
```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import KawaiiIcon from '@/components/common/KawaiiIcon.vue'
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { KawaiiIconName } from '@/lib/icons/semantic-icons'
import { useAuthSessionStore } from '@/stores/auth-session'

interface NavItem {
  key: string
  to?: string
  label: string
  icon: KawaiiIconName
  disabled?: boolean
}

const navItems = [
  { key: 'map', to: '/map', label: '世界足迹', icon: 'map' as const },
  { key: 'journal', to: '/journal', label: '旅途手账', icon: 'journal' as const },
  { key: 'atlas', to: '/memories', label: '旅行图鉴', icon: 'memories' as const },
  { key: 'collections', label: '我的收藏', icon: 'star' as const, disabled: true },
] satisfies NavItem[]
```

**Route-active and disabled item pattern** (lines 44-57, 136-178):
```typescript
function isActiveRoute(item: NavItem) {
  return item.to ? route.path === item.to : false
}

function getNavButtonClass(item: NavItem) {
  return [
    'sidebar-nav-button h-11 rounded-[16px] px-3.5 ...',
    isActiveRoute(item)
      ? 'bg-[linear-gradient(135deg,rgba(255,224,241,0.98),rgba(255,241,249,0.98))] ...'
      : item.disabled
        ? 'bg-transparent opacity-80 hover:bg-white/46'
        : 'bg-transparent hover:-translate-y-0.5 hover:bg-white/64',
  ]
}
```

```vue
<RouterLink v-if="item.to" v-slot="{ href, navigate }" custom :to="item.to">
  <SidebarMenuButton
    :aria-current="isActiveRoute(item) ? 'page' : undefined"
    :data-shell-nav-item="item.key"
  >
    <a :href="href" @click="navigate">...</a>
  </SidebarMenuButton>
</RouterLink>
<SidebarMenuButton
  v-else
  :data-shell-nav-item="item.key"
  aria-disabled="true"
  disabled
>
```

**Apply:** If Phase 46 cleans shell exclusions, update `navItems` rather than hiding labels with CSS. Remove or gate `collections` so `/journal` does not expose `我的收藏`; update tests to match.

---

### `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` (test, request-response)

**Analog:** `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts`

**Router + Pinia shell mount pattern** (lines 17-56):
```typescript
async function mountShell(
  route = '/map',
  setup?: (authSessionStore: ReturnType<typeof useAuthSessionStore>) => void,
) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Landing</div>' } },
      { path: '/map', component: { template: '<div data-route-view="map">Map</div>' } },
      { path: '/journal', component: { template: '<div data-route-view="journal">Journal</div>' } },
      { path: '/memories', component: { template: '<div data-route-view="memories">Memories</div>' } },
    ],
  })

  const authSessionStore = useAuthSessionStore()
  authSessionStore.status = 'authenticated'
  authSessionStore.currentUser = makeUser()
  setup?.(authSessionStore)

  const wrapper = mount(AuthenticatedAppShell, {
    slots: { default: '<div data-shell-content>content</div>' },
    global: { plugins: [pinia, router] },
  })

  await router.push(route)
  await router.isReady()
  await flushPromises()

  return { authSessionStore, router, wrapper }
}
```

**Current nav expectations to change if shell cleanup is accepted** (lines 72-84, 106-110):
```typescript
const navItems = wrapper.findAll('[data-shell-nav-item]').map((item) =>
  item.attributes('data-shell-nav-item'),
)

expect(navItems).toEqual(['map', 'journal', 'atlas', 'collections', 'illuminate', 'settings'])
expect(wrapper.text()).toContain('我的收藏')
expect(wrapper.findAll('[data-shell-nav-item] [data-kawaii-icon] img')).toHaveLength(6)
```

**Apply:** Convert these assertions to the new accepted menu set. For JOURNAL-05, add `expect(wrapper.text()).not.toContain('我的收藏')` at least for `/journal`.

---

### `apps/web/src/router/index.spec.ts` (test, request-response)

**Analog:** `apps/web/src/router/index.spec.ts`

**Authenticated `/journal` route expectation** (lines 125-141):
```typescript
it('allows authenticated user to stay on /journal', async () => {
  const authSessionStore = useAuthSessionStore()
  authSessionStore.status = 'authenticated'
  authSessionStore.currentUser = {
    id: 'user-1',
    username: 'Alice',
    email: 'alice@example.com',
    createdAt: '2026-04-12T00:00:00.000Z',
  }
  vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

  await router.push('/journal')
  await router.isReady()

  expect(router.currentRoute.value.fullPath).toBe('/journal')
  expect(router.currentRoute.value.name).toBe('travel-journal')
})
```

**Legacy route fallthrough pattern** (lines 196-211):
```typescript
it('lets legacy timeline path fall through the catch-all instead of resolving to a named route', async () => {
  const resolvedRoute = router.resolve(legacyTimelinePath)

  expect(resolvedRoute.name).toBeUndefined()
  expect(resolvedRoute.matched[resolvedRoute.matched.length - 1]?.path).toBe('/:pathMatch(.*)*')

  await router.push(legacyTimelinePath)
  await router.isReady()

  expect(router.currentRoute.value.fullPath).toBe('/')
})
```

**Apply:** Preserve these tests. Do not add `/timeline` redirects or route aliases during the journal refactor.

## Shared Patterns

### Vue Component Structure

**Source:** `apps/web/src/components/timeline/TimelineVisitCard.vue`, `apps/web/src/components/timeline/TimelineEditForm.vue`  
**Apply to:** All Vue SFC changes and new `JournalPostcardThumb.vue`

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  entry: TimelineEntry
}>()

const emit = defineEmits<{
  submit: [payload: UpdateTravelRecordRequest]
  cancel: []
}>()
</script>

<template>
  ...
</template>
```

Keep `<script setup lang="ts">`, typed props/emits, computed derivations in script, and declarative templates.

### Store and Data Source

**Source:** `apps/web/src/stores/map-points.ts`  
**Apply to:** `TimelinePageView.vue`, `TimelineVisitCard.vue`, tests

```typescript
const tripsByPlaceId = computed(() => {
  const map = new Map<string, TravelRecord[]>()
  for (const record of travelRecords.value) {
    const existing = map.get(record.placeId) ?? []
    map.set(record.placeId, [...existing, record])
  }
  return map
})

const timelineEntries = computed(() => buildTimelineEntries(travelRecords.value))
```

```typescript
async function updateRecord(recordId: string, request: UpdateTravelRecordRequest) {
  const previousRecords = [...travelRecords.value]
  const targetRecord = previousRecords.find((r) => r.id === recordId)
  if (!targetRecord) return

  const optimisticRecord: TravelRecord = {
    ...targetRecord,
    ...request,
    updatedAt: new Date().toISOString(),
  }
  travelRecords.value = previousRecords.map((r) =>
    r.id === recordId ? optimisticRecord : r,
  )
}
```

Journal UI should consume `timelineEntries`; cards should continue to call `updateRecord` / `deleteSingleRecord`.

### Dropdown / Management Menu

**Source:** `apps/web/src/components/ui/dropdown-menu/index.ts`, `DropdownMenuItem.vue`, `DropdownMenuContent.vue`  
**Apply to:** Quiet edit/delete menu in `TimelineVisitCard.vue`

```typescript
export { default as DropdownMenu } from "./DropdownMenu.vue"
export { default as DropdownMenuContent } from "./DropdownMenuContent.vue"
export { default as DropdownMenuItem } from "./DropdownMenuItem.vue"
export { default as DropdownMenuTrigger } from "./DropdownMenuTrigger.vue"
```

```vue
<DropdownMenuItem
  data-slot="dropdown-menu-item"
  :data-variant="variant"
  v-bind="forwardedProps"
  :class="cn('... data-[variant=destructive]:text-destructive ...', props.class)"
>
  <slot />
</DropdownMenuItem>
```

Use local primitives for any keyboard/focus menu behavior. If implementation chooses a simpler always-visible compact reveal, it must still keep icon-only buttons labeled and preserve edit/delete hooks.

### Decorative Accessibility

**Source:** `apps/web/src/components/common/KawaiiIcon.vue`, `apps/web/src/components/shell/ShellSidebar.vue`  
**Apply to:** `JournalPostcardThumb.vue`, star nodes, glowing timeline ornaments

```vue
<img
  :src="entry.src"
  :alt="decorative ? '' : label"
  :aria-hidden="decorative ? 'true' : undefined"
>
```

```vue
<img
  :src="sidebarCameraGirl"
  alt=""
  aria-hidden="true"
  data-shell-illustration
>
```

Decorative thumbnails and star nodes should not become buttons and should not expose misleading "照片"/upload semantics.

### Test Style

**Source:** `TimelinePageView.spec.ts`, `TimelineVisitCard.spec.ts`, `AuthenticatedAppShell.spec.ts`  
**Apply to:** All Phase 46 tests

```typescript
const pinia = createPinia()
setActivePinia(pinia)

const wrapper = mount(Component, {
  props: { entry },
  global: { plugins: [pinia] },
})

expect(wrapper.get('[data-state="populated"]').text()).toContain('共 2 条旅行记录')
expect(wrapper.find('[data-card-favorite]').exists()).toBe(false)
```

Favor black-box DOM, text, accessibility attributes, emitted events, and store action calls. Avoid snapshot-only tests.

### Router Guard and Route Vocabulary

**Source:** `apps/web/src/router/index.ts`, `apps/web/src/router/index.spec.ts`  
**Apply to:** Route-related validation

```typescript
{
  path: '/journal',
  name: 'travel-journal',
  component: TimelinePageView,
  meta: { requiresAuth: true },
}
```

```typescript
expect(router.resolve('/journal').name).toBe('travel-journal')
expect(resolvedRoute.name).toBeUndefined()
expect(resolvedRoute.matched[resolvedRoute.matched.length - 1]?.path).toBe('/:pathMatch(.*)*')
```

Do not revive `/timeline`. Keep user-facing vocabulary as `旅途手账`.

## No Analog Found

No file is completely without an analog. The weakest match is `JournalPostcardThumb.vue`: no existing timeline postcard component exists, so use `KawaiiIcon.vue` and `ShellSidebar.vue` for decorative accessibility, and `timeline.ts` for deterministic transform helpers.

## Metadata

**Analog search scope:** `apps/web/src/views`, `apps/web/src/components/timeline`, `apps/web/src/components/shell`, `apps/web/src/components/common`, `apps/web/src/components/ui/dropdown-menu`, `apps/web/src/services`, `apps/web/src/stores`, `apps/web/src/router`  
**Files scanned:** 120+ source files from `apps/web/src` file list; 14 strong analog files read with line numbers  
**Project instructions:** `AGENTS.md` read; response/output coordination in Chinese  
**Project skills:** No repo-local `.codex/skills` or `.agents/skills` directories found. Session skills applied for Vue component structure, Vue testing, and UI baseline constraints.  
**Pattern extraction date:** 2026-05-19
