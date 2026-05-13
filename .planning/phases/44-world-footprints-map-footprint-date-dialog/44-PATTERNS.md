# Phase 44: 世界足迹地图与留下足迹日期弹窗 - Pattern Map

**Mapped:** 2026-05-13
**Files analyzed:** 16
**Analogs found:** 15 / 16

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `apps/web/src/components/LeafletMapStage.vue` | component/controller | event-driven + request-response | `apps/web/src/components/LeafletMapStage.vue` | exact |
| `apps/web/src/components/map-popup/MapContextPopup.vue` | component | event-driven + request-response | `apps/web/src/components/map-popup/MapContextPopup.vue` | exact |
| `apps/web/src/components/map-popup/PointSummaryCard.vue` | component | event-driven | `apps/web/src/components/map-popup/PointSummaryCard.vue` | exact |
| `apps/web/src/components/map-popup/FootprintDateDialog.vue` | component | request-response form | `apps/web/src/components/map-popup/TripDateForm.vue` + `apps/web/src/components/showcase/UiPrimitiveShowcase.vue` | role-match |
| `apps/web/src/components/SeedMarkerLayer.vue` | component | event-driven visual state | `apps/web/src/components/SeedMarkerLayer.vue` | exact |
| `apps/web/src/components/shell/ShellSidebar.vue` | component | route-state rendering | `apps/web/src/components/shell/ShellSidebar.vue` | exact |
| `apps/web/src/stores/map-points.ts` | store | CRUD + optimistic writes | `apps/web/src/stores/map-points.ts` | exact |
| `apps/web/src/types/map-point.ts` | model | transform | `apps/web/src/types/map-point.ts` | exact |
| `apps/web/src/components/LeafletMapStage.spec.ts` | test | event-driven + request-response | `apps/web/src/components/LeafletMapStage.spec.ts` | exact |
| `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` | test | event-driven component | `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` | exact |
| `apps/web/src/components/map-popup/FootprintDateDialog.spec.ts` | test | request-response form | `apps/web/src/components/map-popup/TripDateForm.spec.ts` | role-match |
| `apps/web/src/components/map-popup/MapContextPopup.spec.ts` | test | accessibility/focus | `apps/web/src/components/map-popup/MapContextPopup.spec.ts` | exact |
| `apps/web/src/components/SeedMarkerLayer.spec.ts` | test | visual state contract | `apps/web/src/components/SeedMarkerLayer.spec.ts` | exact |
| `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` | test | shell contract | `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` | role-match |
| `apps/web/src/assets/v8/characters/*.webp`, `apps/web/src/assets/v8/pins/*.png` | asset | file-I/O/static import | `apps/web/src/assets/v8/shell/sidebar-illustration.png` + `prd/v8.0/ASSET-MANIFEST.md` | role-match |
| `apps/web/src/assets/v8/raw-crops/*` | temporary asset | file-I/O | none | no analog |

## Pattern Assignments

### `apps/web/src/components/LeafletMapStage.vue` (component/controller, event-driven + request-response)

**Analog:** `apps/web/src/components/LeafletMapStage.vue`

**Imports and orchestration pattern** (lines 1-30):
```typescript
import type { VirtualElement } from '@floating-ui/dom'
import L from 'leaflet'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, shallowRef, useTemplateRef, watch } from 'vue'

import { useGeoJsonLayers } from '../composables/useGeoJsonLayers'
import { useLeafletMap } from '../composables/useLeafletMap'
import { useLeafletPopupAnchor } from '../composables/useLeafletPopupAnchor'
import { usePopupAnchoring } from '../composables/usePopupAnchoring'
import { useMapPointsStore } from '../stores/map-points'
import { useAuthSessionStore } from '../stores/auth-session'
import { useMapUiStore } from '../stores/map-ui'
import MapContextPopup from './map-popup/MapContextPopup.vue'
```

**Popup anchoring pattern** (lines 99-121):
```typescript
const popupLatLng = shallowRef<L.LatLng | null>(null)
const popupAnchor = shallowRef<PopupAnchor | null>(null)
const popupFloatingElement = computed(() => popupRef.value?.getPopupElement() ?? null)

const { floatingStyles: popupFloatingStyles, updatePosition } = usePopupAnchoring({
  reference: () => popupAnchor.value?.reference ?? null,
  floating: popupFloatingElement,
  placement: 'top-start',
})

const { virtualElement } = useLeafletPopupAnchor({
  map,
  latlng: popupLatLng,
  onPositionUpdate: () => {
    void updatePosition()
  },
})
```

**Current save handler to replace with snapshot-open + snapshot-submit** (lines 516-553):
```typescript
async function handleIlluminate(payload: { startDate: string | null; endDate: string | null }) {
  const surface = summarySurfaceState.value
  if (!surface || surface.mode === 'candidate-select') return
  const point = surface.point

  if (authStatus.value !== 'authenticated' || !currentUser.value) {
    authSessionStore.openAuthModal('login')
    return
  }

  await mapPointsStore.illuminate({
    placeId: point.placeId,
    boundaryId: point.boundaryId,
    placeKind: point.placeKind,
    datasetVersion: point.datasetVersion,
    displayName: point.name,
    startDate: payload.startDate,
    endDate: payload.endDate,
  })
}
```

**Required Phase 44 adaptation:** do not let the dialog submit read `summarySurfaceState` again. Add a `shallowRef<FootprintPlaceSnapshot | null>` and create that immutable snapshot before opening `FootprintDateDialog`; submit from the snapshot into `mapPointsStore.illuminate`.

**Map recognition and layered feedback pattern** (lines 681-805):
```typescript
async function recognizeMapLocation(latlng: L.LatLng) {
  const activeSequence = ++recognitionSequence
  removePendingMarker()
  setPendingGeoHit({ lat, lng, x: containerPoint?.x ?? 0, y: containerPoint?.y ?? 0 })
  startRecognition()

  try {
    const response = await resolveCanonicalPlace({ lat, lng })
    removePendingMarker()

    if (response.status === 'resolved') {
      applyResolvedPlace(response.place, response.click)
      popupLatLng.value = L.latLng(response.click.lat, response.click.lng)
      finishRecognition()
      clearPendingGeoHit()
      return
    }

    setInteractionNotice({ tone: 'info', message: response.message })
  } catch {
    removePendingMarker()
    clearPendingGeoHit()
    finishRecognition()
    setInteractionNotice({ tone: 'warning', message: '识别请求失败，请稍后重试' })
  }
}
```

**Template integration pattern** (lines 836-850):
```vue
<MapContextPopup
  v-if="isDesktopPopupVisible && summarySurfaceState && popupAnchor"
  ref="popup"
  :surface="summarySurfaceState"
  :anchor-source="popupAnchor.source"
  :floating-styles="popupFloatingStyles"
  :is-saved="isActivePointSaved"
  :is-pending="isActivePointPending"
  :is-illuminatable="isActivePointIlluminatable"
  @confirm-candidate="handleConfirmCandidate"
  @illuminate="handleIlluminate"
  @unilluminate="handleUnilluminate"
/>
```

For Phase 44, change the popup event to `leaveFootprint` or keep `illuminate` as an open-dialog event with no date payload. Mount `FootprintDateDialog` as a controlled sibling of `MapContextPopup`.

---

### `apps/web/src/components/map-popup/MapContextPopup.vue` (component, event-driven + request-response)

**Analog:** `apps/web/src/components/map-popup/MapContextPopup.vue`

**Props/emits pattern** (lines 8-36):
```typescript
const props = withDefaults(
  defineProps<{
    surface: SummarySurfaceState
    anchorSource: 'marker' | 'pending' | 'boundary'
    floatingStyles?: CSSProperties | null
    isSaved?: boolean
    isPending?: boolean
    isIlluminatable?: boolean
  }>(),
  {
    floatingStyles: null,
    isSaved: false,
    isPending: false,
    isIlluminatable: true,
  }
)

const emit = defineEmits<{
  confirmCandidate: [candidate: GeoCityCandidate]
  continueFallback: []
  illuminate: [payload: { startDate: string | null; endDate: string | null }]
  unilluminate: []
}>()
```

**Focus and expose pattern** (lines 38-82):
```typescript
const popupRef = useTemplateRef<HTMLElement>('popup')
const titleRef = useTemplateRef<HTMLElement>('title')

async function focusEntryPoint() {
  await nextTick()
  titleRef.value?.focus()
}

function getPopupElement() {
  return popupRef.value
}

watch(() => [props.surface.mode, props.surface.mode === 'candidate-select'
  ? props.surface.fallbackPoint.id
  : props.surface.point.id], () => {
  void focusEntryPoint()
}, { immediate: true })

defineExpose({ getPopupElement })
```

**Accessible anchored shell pattern** (lines 86-126):
```vue
<aside
  ref="popup"
  class="map-context-popup absolute z-[4] flex min-h-0 ..."
  role="dialog"
  aria-modal="false"
  :aria-labelledby="popupTitleId"
  :data-popup-anchor-source="anchorSource"
  data-kawaii-shell="light"
  :style="popupStyles"
  @click.stop
>
  <h2 :id="popupTitleId" ref="title" class="map-context-popup__title sr-only" tabindex="-1">
    {{ popupTitle }}
  </h2>
  <PointSummaryCard
    :surface="surface"
    :is-saved="isSaved"
    :is-pending="isPending"
    :is-illuminatable="isIlluminatable"
    @confirm-candidate="emit('confirmCandidate', $event)"
    @illuminate="emit('illuminate', $event)"
  />
</aside>
```

For Phase 44, keep this as the non-modal place card shell. Do not put the new calendar inside this component.

---

### `apps/web/src/components/map-popup/PointSummaryCard.vue` (component, event-driven)

**Analog:** `apps/web/src/components/map-popup/PointSummaryCard.vue`

**Computed place identity pattern** (lines 52-86):
```typescript
const isCandidateMode = computed(() => props.surface.mode === 'candidate-select')
const detailSurface = computed(() =>
  props.surface.mode === 'candidate-select' ? null : props.surface,
)
const summaryTitle = computed(() => {
  if (props.surface.mode === 'candidate-select') {
    return props.surface.fallbackPoint.name
  }

  return props.surface.point.name
})
const summaryTypeLabel = computed(() => {
  if (props.surface.mode === 'candidate-select') {
    return props.surface.fallbackPoint.typeLabel ?? null
  }

  return props.surface.point.typeLabel ?? null
})
```

**Unavailable/local notice pattern** (lines 119-139):
```typescript
const boundarySupportNotice = computed(() => {
  if (!detailSurface.value || detailSurface.value.boundarySupportState !== 'missing') {
    return null
  }

  return '当前地点暂不支持边界高亮，将仅保存 canonical 地点身份与文本信息'
})

const detailNotices = computed(() =>
  [summaryFallbackNotice.value, boundarySupportNotice.value].filter(
    (notice): notice is string => Boolean(notice),
  ),
)
```

**Current inline form anti-pattern to remove** (lines 179-233, 372-408):
```typescript
const isFormExpanded = ref(false)

function openTripDateForm() {
  if (props.isPending || !props.isIlluminatable) return

  isFormExpanded.value = true
}

function handleTripFormSubmit(payload: { startDate: string | null; endDate: string | null }) {
  isFormExpanded.value = false
  emit('illuminate', payload)
}
```

```vue
<div
  v-if="!isCandidateMode && isFormExpanded"
  class="point-summary-card__trip-form"
  data-region="trip-date-form-wrapper"
>
  <TripDateForm
    :is-submitting="isPending"
    @submit="handleTripFormSubmit"
    @cancel="handleTripFormCancel"
  />
</div>
```

**Phase 44 replacement:** remove `TripDateForm`, `PopupTripRecord`, `buildTimelineEntries`, and `useMapPointsStore` from this popup card. Emit a single CTA event (`leaveFootprint`) when `留下足迹` is clicked, including no mutable store reads.

**High-fidelity card and CTA style pattern** (lines 152-178, 545-564):
```typescript
const cloudCardClass =
  'point-summary-card grid flex-1 min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden relative rounded-3xl border-4 border-white p-6 gap-4 ...'
const primaryCtaBaseClass =
  'point-summary-card__illuminate-btn min-h-11 rounded-full px-4 py-2 text-[var(--font-label-size)] font-bold whitespace-nowrap transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 active:scale-95'

const illuminateButtonClass = computed(() => [
  primaryCtaBaseClass,
  props.isSaved ? primaryCtaOnClass : primaryCtaOffClass,
])
```

```css
.point-summary-card__illuminate-btn:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 72%, white 28%);
  outline-offset: 3px;
}
```

---

### `apps/web/src/components/map-popup/FootprintDateDialog.vue` (component, request-response form)

**Analogs:** `apps/web/src/components/map-popup/TripDateForm.vue`, `apps/web/src/components/showcase/UiPrimitiveShowcase.vue`, `apps/web/src/components/ui/dialog/DialogContent.vue`, `apps/web/src/components/ui/calendar/Calendar.vue`

**Payload contract and validation pattern** (TripDateForm lines 16-41):
```typescript
const emit = defineEmits<{
  submit: [payload: { startDate: string | null; endDate: string | null }]
  cancel: []
}>()

const hasRangeError = computed(
  () => hasStartDate.value && endDate.value !== '' && endDate.value < startDate.value,
)
const isValid = computed(() => hasStartDate.value && !hasRangeError.value)

function handleSubmit() {
  if (!isValid.value || props.isSubmitting) {
    return
  }

  emit('submit', {
    startDate: startDate.value || null,
    endDate: endDate.value || null,
  })
}
```

**Dialog + Calendar primitive imports** (UiPrimitiveShowcase lines 2-13):
```typescript
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'

const calendarValue = ref()
```

**Dialog usage pattern** (UiPrimitiveShowcase lines 59-72):
```vue
<Dialog>
  <DialogTrigger as-child>
    <Button data-testid="showcase-dialog-trigger">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>This is a dialog for the showcase.</DialogDescription>
    </DialogHeader>
    <p>Dialog body content.</p>
  </DialogContent>
</Dialog>
```

**Calendar primitive model pattern** (Calendar lines 14-25, 92-161):
```typescript
const props = withDefaults(defineProps<CalendarRootProps & { class?: HTMLAttributes["class"], layout?: LayoutTypes, yearRange?: DateValue[] }>(), {
  modelValue: undefined,
  layout: undefined,
})
const emits = defineEmits<CalendarRootEmits>()

const placeholder = useVModel(props, "placeholder", emits, {
  passive: true,
  defaultValue: props.defaultPlaceholder ?? today(getLocalTimeZone()),
}) as Ref<DateValue>
```

```vue
<CalendarRoot
  v-slot="{ grid, weekDays, date }"
  v-bind="forwarded"
  v-model:placeholder="placeholder"
  data-slot="calendar"
  :class="cn('p-3', props.class)"
>
  <CalendarGrid v-for="month in grid" :key="month.value.toString()">
    <CalendarCell v-for="weekDate in weekDates" :key="weekDate.toString()" :date="weekDate">
      <CalendarCellTrigger :day="weekDate" :month="month.value" />
    </CalendarCell>
  </CalendarGrid>
</CalendarRoot>
```

**Dialog content accessibility/close pattern** (DialogContent lines 29-50):
```vue
<DialogPortal>
  <DialogOverlay />
  <DialogContent data-slot="dialog-content" v-bind="{ ...$attrs, ...forwarded }">
    <slot />

    <DialogClose v-if="showCloseButton" data-slot="dialog-close" class="...">
      <Cross2Icon />
      <span class="sr-only">Close</span>
    </DialogClose>
  </DialogContent>
</DialogPortal>
```

**Phase 44 contract:** use `v-model:open`, `DialogTitle`, `DialogDescription`, a visible cancel button, submit disabled while `isSubmitting`, `DateValue.toString()` for `YYYY-MM-DD`, shortcuts `今天 / 明天 / 本周末 / 其他日期`, and a required `place` snapshot prop.

---

### `apps/web/src/components/SeedMarkerLayer.vue` (component, event-driven visual state)

**Analog:** `apps/web/src/components/SeedMarkerLayer.vue`

**Props, local hover/focus state, and state classifier** (lines 7-31):
```typescript
const props = defineProps<{
  points: MapPointDisplay[]
  selectedPointId: string | null
}>()

const hoveredPointId = shallowRef<string | null>(null)
const focusedPointId = shallowRef<string | null>(null)
const hasSelection = computed(() => Boolean(props.selectedPointId))

function getMarkerState(point: MapPointDisplay) {
  if (point.id === props.selectedPointId) return 'selected'
  if (point.source === 'detected') return 'draft'
  if (point.source === 'saved') return 'saved'
  return 'neutral'
}
```

**Accessible hit target pattern** (lines 77-112):
```vue
<button
  class="seed-marker__button"
  type="button"
  :data-point-id="point.id"
  :aria-pressed="point.id === props.selectedPointId"
  :aria-label="buildAriaLabel(point)"
  @click="handlePointSelect(point)"
  @mouseenter="handlePointMouseEnter(point.id)"
  @focus="handlePointFocus(point.id)"
>
  <span class="seed-marker__dot" aria-hidden="true"></span>
</button>
```

**Motion and reduced-motion guard pattern** (lines 143-170, 345-374):
```css
.seed-marker__button {
  width: 44px;
  height: 44px;
  transform: translate(-50%, -50%);
}

.seed-marker__button::before,
.seed-marker__button::after {
  transition:
    transform var(--motion-quick) ease,
    opacity var(--motion-quick) ease,
    box-shadow var(--motion-quick) ease;
}

@media (prefers-reduced-motion: reduce) {
  .seed-marker__dot,
  .seed-marker__button::before,
  .seed-marker__button::after {
    transition: none;
  }
}
```

For Phase 44 star/footprint markers, preserve the 44px hit target, `aria-label`, `data-marker-state`, and reduced-motion tests even if the inner visual changes from dot to image/CSS star.

---

### `apps/web/src/components/shell/ShellSidebar.vue` (component, route-state rendering)

**Analog:** `apps/web/src/components/shell/ShellSidebar.vue`

**Static nav contract and asset imports** (lines 1-23):
```typescript
import defaultAvatar from '@/assets/v8/shell/user-avatar.png'
import sidebarIllustration from '@/assets/v8/shell/sidebar-illustration.png'
import KawaiiIcon from '@/components/common/KawaiiIcon.vue'
import { useAuthSessionStore } from '@/stores/auth-session'

const navItems = [
  { key: 'map', to: '/map', label: '世界足迹', icon: 'map' as const },
  { key: 'journal', to: '/journal', label: '旅途手账', icon: 'journal' as const },
  { key: 'memories', to: '/memories', label: '旅途回忆', icon: 'memories' as const },
]
```

**Route-active button pattern** (lines 71-100):
```vue
<RouterLink v-slot="{ href, navigate }" custom :to="item.to">
  <SidebarMenuButton
    :aria-current="isActiveRoute(item.to) ? 'page' : undefined"
    :class="[
      'h-12 rounded-[18px] px-4 text-[var(--color-ink-strong)] transition duration-[var(--motion-quick)]',
      isActiveRoute(item.to)
        ? 'bg-[linear-gradient(135deg,rgba(255,232,242,0.96),rgba(255,246,250,0.96))] text-[var(--color-accent-strong)] shadow-[0_14px_28px_rgba(244,143,177,0.18)]'
        : 'bg-white/70 hover:bg-white/88',
    ]"
    :is-active="isActiveRoute(item.to)"
    as-child
    :data-shell-nav-item="item.key"
  >
    <a :href="href" @click="navigate">
      <KawaiiIcon :label="item.label" :name="item.icon" :decorative="false" :size="22" />
      <span class="text-sm font-semibold">{{ item.label }}</span>
    </a>
  </SidebarMenuButton>
</RouterLink>
```

**Visual restoration constraint:** keep exactly these three `navItems`; only change visual treatment and map-route assets. Do not add shell navigation capabilities.

---

### `apps/web/src/stores/map-points.ts` (store, CRUD + optimistic writes)

**Analog:** `apps/web/src/stores/map-points.ts`

**Store imports and state shape pattern** (lines 1-20, 87-95):
```typescript
import type { CanonicalPlaceCandidate, TravelRecord } from '@trip-map/contracts'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'

import { createTravelRecord, deleteTravelRecord } from '../services/api/records'
import { useAuthSessionStore } from './auth-session'
import { useMapUiStore } from './map-ui'

export const useMapPointsStore = defineStore('map-points', () => {
  const travelRecords = shallowRef<TravelRecord[]>([])
  const pendingPlaceIds = shallowRef<Set<string>>(new Set())
  const draftPoint = shallowRef<DraftMapPoint | null>(null)
  const pendingCanonicalSelection = shallowRef<PendingCanonicalSelection | null>(null)
  const selectedPointId = shallowRef<string | null>(null)
  const summaryMode = shallowRef<SummaryMode | null>(null)
```

**Summary surface derivation pattern** (lines 161-186):
```typescript
const summarySurfaceState = computed<SummarySurfaceState | null>(() => {
  if (summaryMode.value === 'candidate-select' && pendingCanonicalSelection.value) {
    return {
      mode: 'candidate-select',
      fallbackPoint: pendingCanonicalSelection.value.draftPoint,
      cityCandidates: pendingCanonicalSelection.value.candidates.map((candidate) =>
        toCandidateProjection(candidate),
      ),
      canonicalCandidates: pendingCanonicalSelection.value.candidates,
      recommendedPlaceId: pendingCanonicalSelection.value.recommendedPlaceId,
    }
  }

  if ((summaryMode.value === 'detected-preview' || summaryMode.value === 'view') && activePoint.value) {
    return {
      mode: summaryMode.value,
      point: activePoint.value,
      boundarySupportState: activeBoundaryCoverageState.value,
    }
  }

  return null
})
```

**Optimistic create + rollback/error pattern** (lines 354-471):
```typescript
async function illuminate(summary: {
  placeId: string
  boundaryId: string | null
  placeKind: TravelRecord['placeKind']
  datasetVersion: string
  displayName: string
  regionSystem: TravelRecord['regionSystem']
  adminType: TravelRecord['adminType']
  typeLabel: TravelRecord['typeLabel']
  parentLabel: TravelRecord['parentLabel']
  subtitle: string | null
  startDate: string | null
  endDate: string | null
}) {
  const authSessionStore = useAuthSessionStore()
  const boundaryVersionAtStart = authSessionStore.boundaryVersion
  const optimisticId = `pending-${placeId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  travelRecords.value = [...travelRecords.value, optimisticRecord]
  pendingPlaceIds.value = new Set([...pendingPlaceIds.value, placeId])
  selectedPointId.value = placeId
  summaryMode.value = 'view'

  try {
    const record = await createTravelRecord({ placeId, boundaryId: boundaryId ?? '', startDate, endDate })
    if (hasSessionBoundaryChanged(boundaryVersionAtStart)) return
    travelRecords.value = travelRecords.value.map((r) => (r.id === optimisticId ? record : r))
    useMapUiStore().setInteractionNotice({ tone: 'info', message: RECORD_WRITE_SUCCESS_NOTICE })
  } catch (error) {
    if (hasSessionBoundaryChanged(boundaryVersionAtStart)) return
    travelRecords.value = travelRecords.value.filter((r) => !(r.id === optimisticId))
    if (isUnauthorizedApiClientError(error)) {
      if (authSessionStore.currentUser) authSessionStore.handleUnauthorized()
    } else {
      useMapUiStore().setInteractionNotice({ tone: 'warning', message: RECORD_WRITE_FAILED_NOTICE })
    }
  } finally {
    if (hasSessionBoundaryChanged(boundaryVersionAtStart)) return
    const next = new Set(pendingPlaceIds.value)
    next.delete(placeId)
    pendingPlaceIds.value = next
  }
}
```

Do not create a new record-write path for Phase 44. The new dialog should call this existing store action.

---

### `apps/web/src/types/map-point.ts` (model, transform)

**Analog:** `apps/web/src/types/map-point.ts`

**Canonical place fields already available for snapshot** (lines 7-37):
```typescript
interface BaseMapPoint {
  id: string
  name: string
  countryName: string
  cityContextLabel: string | null
  placeId?: string | null
  placeKind?: PlaceKind | null
  datasetVersion?: string | null
  regionSystem?: 'CN' | 'OVERSEAS' | null
  adminType?: ChinaAdminType | 'ADMIN1' | null
  typeLabel?: string | null
  parentLabel?: string | null
  subtitle?: string | null
  boundaryId: string | null
  boundaryDatasetVersion: string | null
  fallbackNotice: string | null
}
```

**Summary surface union pattern** (lines 47-61):
```typescript
export type SummaryMode = 'candidate-select' | 'detected-preview' | 'view'

export type SummarySurfaceState =
  | {
      mode: 'candidate-select'
      fallbackPoint: DraftMapPoint
      cityCandidates: GeoCityCandidate[]
      canonicalCandidates: CanonicalPlaceCandidate[]
      recommendedPlaceId: string | null
    }
  | {
      mode: 'detected-preview' | 'view'
      point: MapPointDisplay
      boundarySupportState: 'supported' | 'missing' | 'not-applicable'
    }
```

If adding `FootprintPlaceSnapshot`, keep it close to this file or local to `LeafletMapStage.vue`. It should require non-null canonical fields needed by `mapPointsStore.illuminate`.

---

## Test Pattern Assignments

### `apps/web/src/components/map-popup/FootprintDateDialog.spec.ts`

**Analog:** `apps/web/src/components/map-popup/TripDateForm.spec.ts`

**Form validation and emitted payload pattern** (lines 20-53):
```typescript
it('shows a range error and disables save when endDate is earlier than startDate', async () => {
  const wrapper = mount(TripDateForm)

  await wrapper.get('[data-trip-date-input="start"]').setValue('2025-10-07')
  await wrapper.get('[data-trip-date-input="end"]').setValue('2025-10-01')

  expect(wrapper.get('[data-trip-date-error="range"]').text()).toContain('结束日期不能早于开始日期')
  expect(wrapper.get('[data-trip-date-submit]').attributes('disabled')).toBeDefined()
})

it('normalizes an empty endDate to null on submit', async () => {
  const wrapper = mount(TripDateForm)

  await wrapper.get('[data-trip-date-input="start"]').setValue('2025-10-05')
  await wrapper.get('form').trigger('submit')

  expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
    startDate: '2025-10-05',
    endDate: null,
  })
})
```

Adapt this to Calendar buttons/shortcuts by asserting emitted `{ startDate, endDate }`, disabled submit while invalid/submitting, cancel emit, title/description presence, and focusable close/cancel controls.

### `apps/web/src/components/LeafletMapStage.spec.ts`

**Analog:** `apps/web/src/components/LeafletMapStage.spec.ts`

**Mocking pattern** (lines 24-137):
```typescript
const canonicalPlacesMock = vi.hoisted(() => ({
  resolveCanonicalPlace: vi.fn(),
  confirmCanonicalPlace: vi.fn(),
}))

vi.mock('../composables/useLeafletMap', async () => {
  const { shallowRef } = await import('vue')
  const map = shallowRef(null)
  const isReady = shallowRef(false)
  leafletMapContainer.mapRef = map
  leafletMapContainer.isReadyRef = isReady
  return {
    useLeafletMap: () => ({ map, isReady }),
  }
})

vi.mock('../services/api/records', () => ({
  createTravelRecord: recordsApiMock.createTravelRecord,
  deleteTravelRecord: recordsApiMock.deleteTravelRecord,
}))
```

**Auth gating test pattern** (lines 766-792):
```typescript
it('opens the login modal instead of writing records when the user is anonymous', async () => {
  const authSessionStore = useAuthSessionStore()
  const mapPointsStore = useMapPointsStore()
  const openAuthModalSpy = vi.spyOn(authSessionStore, 'openAuthModal')
  authSessionStore.status = 'anonymous'
  authSessionStore.currentUser = null

  const wrapper = mount(LeafletMapStage, { global: { plugins: [pinia] } })
  mapPointsStore.startDraftFromDetection(makeDraftPoint())

  await wrapper.get('[data-illuminate-state="off"]').trigger('click')
  const tripForm = wrapper.findComponent(TripDateForm)
  await tripForm.vm.$emit('submit', { startDate: '2025-10-01', endDate: null })

  expect(recordsApiMock.createTravelRecord).not.toHaveBeenCalled()
  expect(openAuthModalSpy).toHaveBeenCalledWith('login')
})
```

Phase 44 should update this to click `留下足迹`, open `FootprintDateDialog`, submit through the dialog, and assert auth modal/no record write.

**Unsupported-place test pattern** (lines 1021-1044):
```typescript
const button = wrapper.get('[data-illuminate-state="off"]')
expect(button.attributes('disabled')).toBeDefined()
expect(button.attributes('data-illuminatable')).toBe('false')
expect(wrapper.text()).toContain(buildUnsupportedOverseasNotice('British Columbia'))
expect(mapUiStore.interactionNotice).toBeNull()

wrapper.getComponent(MapContextPopup).vm.$emit('illuminate', {
  startDate: '2025-10-01',
  endDate: null,
})
await nextTick()

expect(mapUiStore.interactionNotice).toBeNull()
```

Keep this behavior, but assert the disabled CTA does not open `FootprintDateDialog`.

### `apps/web/src/components/map-popup/PointSummaryCard.spec.ts`

**Analog:** `apps/web/src/components/map-popup/PointSummaryCard.spec.ts`

**Fixture pattern** (lines 35-121):
```typescript
function createDraftPoint(place: ResolvedCanonicalPlace = PHASE12_RESOLVED_BEIJING): DraftMapPoint {
  return {
    id: `detected-${place.placeId}`,
    name: place.displayName,
    cityContextLabel: place.subtitle,
    placeId: place.placeId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
    boundaryId: place.boundaryId,
    source: 'detected',
  }
}

function makeDetectedPreviewSurface(): SummarySurfaceState {
  return {
    mode: 'detected-preview',
    point: createDraftPoint(PHASE12_RESOLVED_BEIJING),
    boundarySupportState: 'supported',
  }
}
```

**Deprecated expectations to delete/replace** (lines 266-345):
```typescript
it('renders per-record PopupTripRecord list when isSaved=true and records exist', () => {
  expect(wrapper.find('[data-region="popup-records"]').exists()).toBe(true)
  const records = wrapper.findAllComponents(PopupTripRecord)
  expect(records.length).toBe(2)
})

it('expands TripDateForm from the re-record CTA on saved points', async () => {
  await wrapper.get('[data-record-again]').trigger('click')
  expect(wrapper.find('[data-region="trip-date-form-wrapper"]').exists()).toBe(true)
})
```

Phase 44 tests should instead assert saved places show identity + saved-footprint status, no `PopupTripRecord`, no `data-record-again`, no inline `TripDateForm`, and emit one `leaveFootprint` event.

### `apps/web/src/components/map-popup/MapContextPopup.spec.ts`

**Analog:** `apps/web/src/components/map-popup/MapContextPopup.spec.ts`

**Accessibility/focus pattern** (lines 52-88):
```typescript
it('renders desktop popup shell with dialog semantics and arrow affordance', () => {
  const wrapper = mount(MapContextPopup, { attachTo: document.body, props: { ... } })

  expect(wrapper.get('.map-context-popup').attributes('role')).toBe('dialog')
  expect(wrapper.get('.map-context-popup').attributes('aria-modal')).toBe('false')
  expect(wrapper.get('.map-context-popup').attributes('data-popup-anchor-source')).toBe('marker')
  expect(wrapper.find('.map-context-popup__arrow').exists()).toBe(true)
})

it('moves focus to the popup title when opened', async () => {
  await nextTick()
  expect(document.activeElement).toBe(wrapper.get('.map-context-popup__title').element)
})
```

### `apps/web/src/components/SeedMarkerLayer.spec.ts`

**Analog:** `apps/web/src/components/SeedMarkerLayer.spec.ts`

**Visual contract source-read pattern** (lines 1-6, 80-84):
```typescript
import SeedMarkerLayer from './SeedMarkerLayer.vue'
import seedMarkerLayerSource from './SeedMarkerLayer.vue?raw'

it('keeps the marker hit target and reduced-motion guardrails in component styles', () => {
  expect(seedMarkerLayerSource).toContain('width: 44px;')
  expect(seedMarkerLayerSource).toContain('height: 44px;')
  expect(seedMarkerLayerSource).toContain('@media (prefers-reduced-motion: reduce)')
})
```

Use this exact style for star/pin CSS contracts.

### `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts`

**Analog:** `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts`

**Locked nav contract pattern** (lines 59-77):
```typescript
it('renders the locked authenticated sidebar contract with exactly three nav entries', async () => {
  const { wrapper } = await mountShell('/map')

  expect(wrapper.find('[data-shell-sidebar]').exists()).toBe(true)
  expect(wrapper.find('[data-shell-avatar]').exists()).toBe(true)
  expect(wrapper.find('[data-shell-illustration]').exists()).toBe(true)

  const navItems = wrapper.findAll('[data-shell-nav-item]').map((item) =>
    item.attributes('data-shell-nav-item'),
  )

  expect(navItems).toEqual(['map', 'journal', 'memories'])
  expect(navItems).toHaveLength(3)
})
```

Use this to guard that sidebar visual restoration does not add navigation.

## Shared Patterns

### Vue SFC and Data Flow

**Source:** `apps/web/src/components/map-popup/MapContextPopup.vue` lines 8-36 and Vue skill guidance.
**Apply to:** all Vue components.

Use `<script setup lang="ts">`, typed `defineProps` / `defineEmits`, `withDefaults` for optional props, props down/events up, and `computed` for derived display state. Keep `LeafletMapStage.vue` as orchestration owner; keep `PointSummaryCard.vue` and `FootprintDateDialog.vue` presentational/controlled.

### Authentication

**Source:** `apps/web/src/components/LeafletMapStage.vue` lines 521-524.
**Apply to:** footprint dialog submit path.

```typescript
if (authStatus.value !== 'authenticated' || !currentUser.value) {
  authSessionStore.openAuthModal('login')
  return
}
```

Keep login gating in the controller submit handler so anonymous users get explicit modal feedback and no record write.

### Date Payload Contract

**Source:** `apps/web/src/components/map-popup/TripDateForm.vue` lines 16-41 and `apps/web/src/stores/map-points.ts` lines 354-367.
**Apply to:** `FootprintDateDialog.vue`, `LeafletMapStage.vue`, tests.

```typescript
submit: [payload: { startDate: string | null; endDate: string | null }]
```

```typescript
startDate: string | null
endDate: string | null
```

The new dialog may use `DateValue` internally, but emitted values must remain `YYYY-MM-DD` strings or `null`.

### Error Handling and Notices

**Source:** `apps/web/src/stores/map-points.ts` lines 411-471.
**Apply to:** record writes and global success/failure messages.

Do not duplicate API error handling in the dialog. Let the store perform optimistic replacement, rollback, unauthorized handling, and `map-ui` notice updates. Dialog-local state should cover submitting/field errors only.

### Accessibility

**Source:** `apps/web/src/components/map-popup/MapContextPopup.vue` lines 86-108, `apps/web/src/components/ui/dialog/DialogContent.vue` lines 29-50.
**Apply to:** popup and date dialog.

Use real `DialogTitle` / `DialogDescription` in the modal. For the anchored popup, preserve `role="dialog"`, `aria-modal="false"`, `aria-labelledby`, and title focus.

### Visual Contract Tests

**Source:** `apps/web/src/components/map-popup/PointSummaryCard.kawaii.spec.ts` lines 136-177 and 256-321.
**Apply to:** popup, dialog, marker, sidebar visual restoration tests.

Use `data-kawaii-*`, `data-region`, source `?raw` assertions, reduced-motion assertions, and specific class-token contracts for high-fidelity surfaces.

### Asset Handling

**Source:** `prd/v8.0/ASSET-MANIFEST.md` lines 20-43 and 53-60; `prd/v8.0/CUTTING-GUIDE.md` lines 57-66, 94-110, 140-151, 157-162.
**Apply to:** new character/pin assets.

```text
apps/web/src/assets/v8/
  characters/
  mascots/
  stickers/
  pins/
  postcards/
  scenic/
  raw-crops/
```

Required P0 assets include `characters/map-popup-girl.webp`, `characters/footprint-dialog-girl.webp`, `characters/sidebar-camera-girl.webp`, and `pins/pin-star-*.png`. Do not reference `raw-crops/` in product UI. Keep text/buttons/calendar as DOM, not baked into images.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `apps/web/src/assets/v8/raw-crops/*` | temporary asset | file-I/O | No stable product-code analog. Use `prd/v8.0/CUTTING-GUIDE.md`; do not import raw crops from Vue components. |

## Metadata

**Analog search scope:** `apps/web/src/components`, `apps/web/src/stores`, `apps/web/src/types`, `apps/web/src/assets/v8`, `prd/v8.0`, phase context/research files.
**Files scanned:** 60+ source/spec/assets/doc paths via `rg --files`, targeted `rg`, and line-numbered reads.
**Pattern extraction date:** 2026-05-13

