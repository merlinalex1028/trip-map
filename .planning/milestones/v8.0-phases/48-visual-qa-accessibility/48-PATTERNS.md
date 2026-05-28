# Phase 48: Visual QA、Accessibility 与回归验证 - Pattern Map

**Mapped:** 2026-05-27
**Files analyzed:** 22
**Analogs found:** 20 / 22

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `.planning/phases/48-visual-qa-accessibility/evidence/desktop-checklist.md` | test | file-I/O + batch | `.planning/phases/48-visual-qa-accessibility/48-VALIDATION.md` | exact |
| `.planning/phases/48-visual-qa-accessibility/evidence/desktop-landing.png` | test | file-I/O | `.planning/phases/43-landing/43-UAT.md` | role-match |
| `.planning/phases/48-visual-qa-accessibility/evidence/desktop-map.png` | test | file-I/O | `.planning/phases/48-visual-qa-accessibility/48-VALIDATION.md` | exact |
| `.planning/phases/48-visual-qa-accessibility/evidence/desktop-footprint-dialog.png` | test | file-I/O | `.planning/phases/48-visual-qa-accessibility/48-VALIDATION.md` | exact |
| `.planning/phases/48-visual-qa-accessibility/evidence/desktop-journal.png` | test | file-I/O | `.planning/phases/48-visual-qa-accessibility/48-VALIDATION.md` | exact |
| `.planning/phases/48-visual-qa-accessibility/evidence/desktop-memories.png` | test | file-I/O | `.planning/phases/48-visual-qa-accessibility/48-VALIDATION.md` | exact |
| `.planning/phases/48-visual-qa-accessibility/evidence/seed-data.md` or equivalent procedure | config | batch | none | no-analog |
| `apps/web/src/views/LandingPageView.vue` | component | request-response | `apps/web/src/components/auth/AuthDialog.vue` | partial |
| `apps/web/src/components/auth/AuthDialog.vue` | component | request-response + event-driven | `apps/web/src/components/auth/AuthDialog.vue` | exact |
| `apps/web/src/components/shell/ShellSidebar.vue` | component | request-response | `apps/web/src/components/shell/ShellSidebar.vue` | exact |
| `apps/web/src/components/LeafletMapStage.vue` | component | event-driven + CRUD | `apps/web/src/components/LeafletMapStage.vue` | exact |
| `apps/web/src/components/map-popup/MapContextPopup.vue` | component | event-driven | `apps/web/src/components/map-popup/MapContextPopup.vue` | exact |
| `apps/web/src/components/map-popup/FootprintDateDialog.vue` | component | event-driven + CRUD | `apps/web/src/components/map-popup/FootprintDateDialog.vue` | exact |
| `apps/web/src/views/TimelinePageView.vue` | component | CRUD + transform | `apps/web/src/components/timeline/TimelineVisitCard.vue` | role-match |
| `apps/web/src/components/timeline/TimelineVisitCard.vue` | component | CRUD + event-driven | `apps/web/src/components/timeline/TimelineVisitCard.vue` | exact |
| `apps/web/src/views/StatisticsPageView.vue` | component | request-response + transform | `apps/web/src/components/memories/MemoriesChartGrid.vue` | role-match |
| `apps/web/src/components/memories/MemoriesChartGrid.vue` | component | transform | `apps/web/src/components/memories/MemoriesChartGrid.vue` | exact |
| `apps/web/src/components/common/BaseChart.vue` | component | transform | `apps/web/src/components/common/BaseChart.vue` | exact |
| `apps/web/src/components/**/*.spec.ts` touched by fixes | test | request-response + event-driven | existing colocated specs | exact |
| `apps/server/test/*.e2e-spec.ts` | test | request-response + CRUD | `apps/server/scripts/vitest-run.mjs` | role-match |
| `packages/contracts/src/contracts.spec.ts` | test | transform | `packages/contracts/package.json` | role-match |
| `.planning/phases/48-visual-qa-accessibility/48-VERIFICATION.md` if created | test | batch | `.planning/phases/47-dashboard/47-VERIFICATION.md` | role-match |

Phase 48 is desktop-only. Do not add non-desktop screenshot/checklist rows, viewport criteria, or QA gates.

## Pattern Assignments

### `.planning/phases/48-visual-qa-accessibility/evidence/desktop-checklist.md` (test, file-I/O + batch)

**Analog:** `.planning/phases/48-visual-qa-accessibility/48-VALIDATION.md`

**Evidence artifact pattern** (lines 51-59):
```markdown
- [ ] `.planning/phases/48-visual-qa-accessibility/evidence/desktop-checklist.md` — screenshot and manual QA checklist for landing, `/map`, `/journal`, `/memories`, and the opened footprint date dialog.
- [ ] `.planning/phases/48-visual-qa-accessibility/evidence/desktop-landing.png` — populated desktop landing/auth entry evidence.
- [ ] `.planning/phases/48-visual-qa-accessibility/evidence/desktop-map.png` — populated desktop map with Leaflet surface and star markers.
- [ ] `.planning/phases/48-visual-qa-accessibility/evidence/desktop-footprint-dialog.png` — opened `留下足迹` date dialog evidence.
- [ ] `.planning/phases/48-visual-qa-accessibility/evidence/desktop-journal.png` — populated journal evidence including long-text risk scan.
- [ ] `.planning/phases/48-visual-qa-accessibility/evidence/desktop-memories.png` — memories evidence showing all four ECharts charts.
- [ ] Fixed account or seed-data procedure — reproducible map markers and chart data for QA-02.
```

**Manual checklist pattern** (lines 65-69):
```markdown
| Desktop screenshot matrix has no overlap, truncation, unreadable text, or missing core visuals | QA-01 | Phase context explicitly chooses screenshot files plus checklist rather than browser visual automation | Capture desktop-only populated states and fill `evidence/desktop-checklist.md` with pass/fail notes and repair links |
| Leaflet map, star markers, and ECharts charts are visibly non-empty | QA-02 | Context chooses local manual run plus screenshot review instead of adding browser smoke tooling | Use fixed populated account/seed data, capture `/map` and `/memories`, confirm all four chart panels render visible graphics |
| Reduced-motion operation remains usable | QA-04 | Motion perception is partly visual and distributed across CSS utilities/components | Enable `prefers-reduced-motion: reduce`, verify core route decorations/hover/pulse effects downgrade and core controls still work |
```

**Desktop visual wording analog** (from `.planning/phases/43-landing/43-UAT.md`, lines 19-31):
```markdown
### 13. Desktop 截图视觉检查
expected: |
  `/` 在 1366x768 / 1440x900 / 1536x1024 / 1920x1080 视口下：
  - 完整背景按宽度铺满
  - Hero 区域左对齐、标题清晰可读
  - 下半区标题/统计/拍立得相对底边协调
  - 无底部 CTA 条
  `/map` 在相同视口下：
  - 280px 左侧 sidebar 可见
  - 三项固定导航正常
  - 无旧 topbar/drawer/bottom nav
  - 主内容不与 sidebar 重叠
result: pass
```

Apply this as a compact checklist structure, but keep Phase 48 states limited to landing, populated `/map`, populated `/journal`, populated `/memories`, and opened footprint dialog.

---

### `apps/web/src/components/auth/AuthDialog.vue` (component, request-response + event-driven)

**Analog:** `apps/web/src/components/auth/AuthDialog.vue`

**Imports pattern** (lines 1-8):
```vue
<script setup lang="ts">
import type { LoginRequest, RegisterRequest } from '@trip-map/contracts'
import { storeToRefs } from 'pinia'
import { computed, nextTick, reactive, shallowRef, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'

import { ApiClientError } from '../../services/api/client'
import { useAuthSessionStore } from '../../stores/auth-session'
```

**Focus management pattern** (lines 47-58, 114-128):
```ts
function focusFirstField(mode: AuthMode) {
  if (mode === 'login') {
    loginEmailInput.value?.focus()
    return
  }

  registerUsernameInput.value?.focus()
}

function restoreTriggerFocus() {
  const fallbackTrigger = document.querySelector<HTMLElement>('[data-auth-trigger]')
  ;(lastFocusedElement.value ?? fallbackTrigger)?.focus()
}

watch(
  isAuthModalOpen,
  async (open) => {
    if (open) {
      lastFocusedElement.value =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      resetSubmitError()
      await nextTick()
      focusFirstField(activeMode.value)
      return
    }

    await nextTick()
    restoreTriggerFocus()
  },
```

**Dialog and form semantics pattern** (lines 152-158, 181-197, 297-307):
```vue
<div
  role="dialog"
  aria-modal="true"
  data-auth-dialog
  aria-labelledby="auth-dialog-title"
  @keydown.esc.prevent="handleDialogClose"
>
  <div role="tablist" aria-label="认证方式">
    <button role="tab" :aria-selected="activeMode === 'login'" aria-controls="auth-panel-login">
      登录
    </button>
  </div>

  <p v-if="submitError" role="alert">
    {{ submitError }}
  </p>

  <button type="submit" :disabled="isSubmitting">
    {{ submitLabel }}
  </button>
```

**Error handling pattern** (lines 70-111):
```ts
async function handleSubmit() {
  resetSubmitError()

  try {
    if (activeMode.value === 'login') {
      await login({ email: loginForm.email, password: loginForm.password })
    } else {
      const normalizedUsername = registerForm.username.trim()
      if (normalizedUsername.length < REGISTER_USERNAME_MIN_LENGTH) {
        submitError.value = '用户名至少需要 2 个字符。'
        return
      }
      await register({ username: normalizedUsername, email: registerForm.email, password: registerForm.password })
    }

    closeAuthModal()
    await router.replace('/map')
  } catch (error) {
    if (error instanceof ApiClientError) {
      submitError.value = activeMode.value === 'login'
        ? '登录失败，请检查邮箱和密码后重试。'
        : '创建账号失败，请稍后重试。'
      return
    }
    submitError.value = '请求暂时没有成功，请稍后再试。'
  }
}
```

**Testing pattern** (from `AuthDialog.spec.ts`, lines 140-198):
```ts
it('keeps the dialog open and shows a form error when 登录 fails with auth-submit 401', async () => {
  const { wrapper } = mountDialog((authSessionStore) => {
    vi.spyOn(authSessionStore, 'login').mockRejectedValue(
      new ApiClientError({
        status: 401,
        code: 'auth-submit-unauthorized',
        message: 'Invalid email or password',
      }),
    )
  })

  await wrapper.get('input[name="email"]').setValue('alice@example.com')
  await wrapper.get('input[name="password"]').setValue('wrong-password')
  await wrapper.get('form').trigger('submit')
  await flushPromises()

  expect(wrapper.get('[role="alert"]').text()).toContain('登录失败')
  expect(wrapper.get('[data-auth-dialog]').attributes('role')).toBe('dialog')
  expect(wrapper.get('[data-auth-dialog]').attributes('aria-modal')).toBe('true')
})
```

---

### `apps/web/src/components/LeafletMapStage.vue` (component, event-driven + CRUD)

**Analog:** `apps/web/src/components/LeafletMapStage.vue`

**Imports pattern** (lines 1-32):
```vue
<script setup lang="ts">
import type { VirtualElement } from '@floating-ui/dom'
import L from 'leaflet'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, shallowRef, useTemplateRef, watch } from 'vue'

import pinStarPink from '@/assets/v8/pins/pin-star-pink.png'
import { useGeoJsonLayers } from '../composables/useGeoJsonLayers'
import { useLeafletMap } from '../composables/useLeafletMap'
import { useLeafletPopupAnchor } from '../composables/useLeafletPopupAnchor'
import { usePopupAnchoring } from '../composables/usePopupAnchoring'
import FootprintDateDialog from './map-popup/FootprintDateDialog.vue'
import MapContextPopup from './map-popup/MapContextPopup.vue'
```

**Focus-return pattern** (lines 532-549):
```ts
async function focusFootprintReturnTarget() {
  await nextTick()
  await nextAnimationFrame()
  const popupElement = popupRef.value?.getPopupElement()

  const trigger =
    popupElement?.querySelector<HTMLElement>('[data-footprint-cta="true"]:not([disabled])') ??
    document.querySelector<HTMLElement>('[data-footprint-cta="true"]:not([disabled])')
  if (trigger) {
    trigger.focus()
    return
  }

  const title =
    popupElement?.querySelector<HTMLElement>('.map-context-popup__title') ??
    document.querySelector<HTMLElement>('.map-context-popup__title')
  title?.focus()
}
```

**Submit/save pattern** (lines 577-650):
```ts
async function submitFootprintDate(payload: { startDate: string | null; endDate: string | null }) {
  const snapshot = footprintPlaceSnapshot.value
  if (!snapshot) {
    return
  }

  if (authStatus.value !== 'authenticated' || !currentUser.value) {
    authSessionStore.openAuthModal('login')
    return
  }

  footprintDialogError.value = null
  isFootprintSubmitting.value = true

  try {
    const result = await mapPointsStore.illuminate(snapshotPayload)

    if (result.status === 'saved') {
      isFootprintDialogOpen.value = false
      resetFootprintDialogState()
      setInteractionNotice({ tone: 'info', message: FOOTPRINT_SAVE_SUCCESS_NOTICE })
      await focusFootprintReturnTarget()
      return
    }

    if (result.status === 'failed') {
      footprintDialogError.value = FOOTPRINT_SAVE_FAILED_NOTICE
      return
    }
  } finally {
    isFootprintSubmitting.value = false
  }
}
```

**Map/dialog template pattern** (lines 960-996):
```vue
<section data-region="map-stage" aria-label="旅行世界地图">
  <div ref="mapContainer" class="leaflet-map-stage__map"></div>
  <MapContextPopup
    v-if="isDesktopPopupVisible && summarySurfaceState && popupAnchor"
    @leave-footprint="openFootprintDateDialog"
  />
  <FootprintDateDialog
    v-model:open="isFootprintDialogOpen"
    :place="footprintPlaceSnapshot"
    :is-submitting="isFootprintSubmitting"
    :error-message="footprintDialogError"
    @submit="submitFootprintDate"
    @cancel="closeFootprintDateDialog"
  />
  <div v-if="pendingGeoHit" role="status" aria-live="polite" :aria-label="`正在识别…`"></div>
</section>
```

**Reduced-motion pattern** (lines 1099-1107):
```css
@media (prefers-reduced-motion: reduce) {
  .pending-marker--recognizing {
    animation: none;
  }

  .leaflet-interactive {
    transition: none;
  }
}
```

**Testing pattern** (from `LeafletMapStage.spec.ts`, lines 1096-1133):
```ts
it('closes the dialog, clears the frozen place snapshot, and restores focus after save succeeds', async () => {
  const wrapper = mount(LeafletMapStage, {
    attachTo: document.body,
    global: { plugins: [pinia] },
  })

  wrapper.getComponent(MapContextPopup).vm.$emit('leaveFootprint')
  await nextTick()

  const dialog = wrapper.getComponent({ name: 'FootprintDateDialog' })
  dialog.vm.$emit('submit', { startDate: '2025-10-01', endDate: null })
  await flushPromises()
  await nextTick()

  expect(dialog.props('open')).toBe(false)
  expect(dialog.props('place')).toBeNull()
  expect(document.activeElement?.getAttribute('data-footprint-cta')).toBe('true')
})
```

---

### `apps/web/src/components/map-popup/MapContextPopup.vue` (component, event-driven)

**Analog:** `apps/web/src/components/map-popup/MapContextPopup.vue`

**Imports and expose pattern** (lines 1-8, 61-85):
```vue
<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch, type CSSProperties } from 'vue'

import type { FootprintUnavailableCategory } from '../../services/footprint-availability'
import type { GeoCityCandidate } from '../../types/geo'
import type { MapPointDisplay, SummarySurfaceState } from '../../types/map-point'
import PointSummaryCard from './PointSummaryCard.vue'

async function focusEntryPoint() {
  await nextTick()
  titleRef.value?.focus()
}

function getPopupElement() {
  return popupRef.value
}

watch(
  () => [props.surface.mode, props.surface.mode === 'candidate-select' ? props.surface.fallbackPoint.id : props.surface.point.id],
  () => { void focusEntryPoint() },
  { immediate: true }
)

defineExpose({ getPopupElement })
```

**Non-modal popup semantics pattern** (lines 88-133):
```vue
<aside
  ref="popup"
  role="dialog"
  aria-modal="false"
  :aria-labelledby="popupTitleId"
  :data-popup-anchor-source="anchorSource"
  @click.stop
>
  <h2 :id="popupTitleId" ref="title" class="map-context-popup__title sr-only" tabindex="-1">
    {{ popupTitle }}
  </h2>
  <PointSummaryCard
    :surface="surface"
    @dismiss="emit('dismiss')"
    @leave-footprint="emit('leaveFootprint')"
  />
</aside>
```

---

### `apps/web/src/components/map-popup/FootprintDateDialog.vue` (component, event-driven + CRUD)

**Analog:** `apps/web/src/components/map-popup/FootprintDateDialog.vue`

**Imports and props/emits pattern** (lines 1-32, 38-55):
```vue
<script setup lang="ts">
import type { FootprintPlaceSnapshot } from '@/types/map-point'
import type { DateValue } from '@internationalized/date'
import { CalendarDate, getDayOfWeek, getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { computed, shallowRef } from 'vue'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const props = withDefaults(defineProps<{
  open: boolean
  place: FootprintPlaceSnapshot | null
  isSubmitting?: boolean
  errorMessage?: string | null
}>(), {
  isSubmitting: false,
  errorMessage: null,
})

const emit = defineEmits<{
  'update:open': [open: boolean]
  submit: [payload: { startDate: string | null; endDate: string | null }]
  cancel: []
}>()
```

**Validation and submit pattern** (lines 83-129):
```ts
function handleOpenChange(nextOpen: boolean) {
  if (!nextOpen && props.isSubmitting) {
    return
  }
  emit('update:open', nextOpen)
}

function handleCancel() {
  if (props.isSubmitting) {
    return
  }
  emit('cancel')
  emit('update:open', false)
}

function handleCalendarChange(value: DateValue | undefined) {
  selectedDate.value = value ? parseDate(value.toString()) : undefined
  selectedShortcut.value = null
}

function handleSubmit() {
  if (isSubmitDisabled.value || !selectedDate.value) {
    return
  }

  emit('submit', {
    startDate: selectedDate.value.toString(),
    endDate: null,
  })
}
```

**Dialog semantics and long-name pattern** (lines 132-168, 171-207):
```vue
<Dialog :open="open" @update:open="handleOpenChange">
  <DialogContent
    :show-close-button="false"
    class="footprint-date-dialog ..."
    @close-auto-focus.prevent
  >
    <div data-region="footprint-date-dialog" role="dialog">
      <button aria-label="关闭留下足迹弹窗" :disabled="isSubmitting" @click="handleCancel">
        <span aria-hidden="true">×</span>
      </button>
      <DialogTitle class="footprint-date-dialog__title">
        留下足迹
      </DialogTitle>
      <DialogDescription class="sr-only">
        {{ dialogDescription }}
      </DialogDescription>
      <TooltipProvider :delay-duration="120">
        <Tooltip>
          <TooltipTrigger as-child>
            <h2 class="footprint-date-dialog__place-title" data-footprint-place-name tabindex="-1">
              {{ place?.displayName ?? '未选择地点' }}
            </h2>
          </TooltipTrigger>
          <TooltipContent class="footprint-date-dialog__place-tooltip">
            {{ place?.displayName ?? '未选择地点' }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
```

**Calendar/actions/feedback pattern** (lines 228-280, 283-306):
```vue
<Calendar
  :model-value="selectedDate"
  locale="zh-CN"
  class="footprint-date-dialog__calendar"
  @update:model-value="handleCalendarChange"
/>

<Button
  v-for="shortcut in [{ key: 'today', label: '今天' }, { key: 'tomorrow', label: '明天' }, { key: 'weekend', label: '本周末' }]"
  :aria-pressed="selectedShortcut === shortcut.key"
  :data-footprint-shortcut="shortcut.key"
  @click="handleShortcutClick(shortcut.key as ShortcutKey)"
>
  {{ shortcut.label }}
</Button>

<div class="footprint-date-dialog__feedback" aria-live="polite">
  <p v-if="errorMessage" data-footprint-error="true" role="alert">
    {{ failureMessage }}
  </p>
</div>

<Button data-footprint-cancel="true" :disabled="isSubmitting" @click="handleCancel">取消</Button>
<Button data-footprint-submit="true" :disabled="isSubmitDisabled" @click="handleSubmit">
  {{ isSubmitting ? '正在保存...' : '留下足迹' }}
</Button>
```

**Reduced-motion pattern** (lines 822-829):
```css
@media (prefers-reduced-motion: reduce) {
  .footprint-date-dialog__close,
  .footprint-date-dialog__shortcut,
  .footprint-date-dialog :deep([data-slot='calendar-cell-trigger']) {
    transition: none;
    transform: none;
  }
}
```

**Testing pattern** (from `FootprintDateDialog.spec.ts`, lines 137-153, 186-202, 308-340):
```ts
it('renders snapshot place details with Dialog and Calendar hooks', () => {
  mountDialog()
  expect(getElement<HTMLElement>('[data-region="footprint-date-dialog"]').getAttribute('role')).toBe('dialog')
  expect(getElement<HTMLElement>('[data-footprint-place-name]').textContent).toContain('北京')
  expect(getElement<HTMLElement>('[data-footprint-calendar="true"]')).toBeTruthy()
})

it('truncates long place names and exposes the full name in a styled tooltip', () => {
  mountDialog({ place: { ...placeSnapshot, displayName: '巴音郭楞蒙古自治州' } })
  expect(footprintDateDialogSource).toMatch(
    /\.footprint-date-dialog__place-title \{\n[\s\S]*overflow: hidden;\n[\s\S]*text-overflow: ellipsis;\n[\s\S]*white-space: nowrap;/,
  )
})

it('locks close and submit affordances while submitting', async () => {
  const wrapper = mountDialog({ isSubmitting: true })
  expect(getElement<HTMLButtonElement>('[data-footprint-submit="true"]').disabled).toBe(true)
  expect(getElement<HTMLButtonElement>('[data-footprint-cancel="true"]').disabled).toBe(true)
  getElement<HTMLButtonElement>('[data-footprint-cancel="true"]').click()
  getElement<HTMLButtonElement>('button[aria-label="关闭留下足迹弹窗"]').click()
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted('cancel')).toBeFalsy()
})
```

---

### `apps/web/src/components/memories/MemoriesChartGrid.vue` and `apps/web/src/components/common/BaseChart.vue` (component, transform)

**Analog:** `apps/web/src/components/memories/MemoriesChartGrid.vue` + `apps/web/src/components/common/BaseChart.vue`

**Chart option imports and derived state pattern** (from `MemoriesChartGrid.vue`, lines 1-20):
```vue
<script setup lang="ts">
import type { TravelMemoriesDashboard } from '@trip-map/contracts'
import { computed } from 'vue'

import BaseChart from '@/components/common/BaseChart.vue'
import {
  buildCountryDistributionOption,
  buildMemoriesProfileOption,
  buildMonthlyTrendOption,
  buildYearlyTrendOption,
} from '@/services/memories/memory-chart-options'

const props = defineProps<{ dashboard: TravelMemoriesDashboard }>()

const monthlyOption = computed(() => buildMonthlyTrendOption(props.dashboard.monthlyTrend))
const countryOption = computed(() => buildCountryDistributionOption(props.dashboard.countryDistribution))
const yearlyOption = computed(() => buildYearlyTrendOption(props.dashboard.yearlyTrend))
const profileOption = computed(() => buildMemoriesProfileOption(props.dashboard.profile))
```

**Four-chart panel pattern** (from `MemoriesChartGrid.vue`, lines 40-68, 71-88, 132-155):
```vue
<section data-region="memories-chart-grid" class="memories-chart-grid">
  <article data-chart-panel="monthly-trend" class="memories-panel memories-panel--trend">
    <h3>旅途足迹趋势</h3>
    <p v-if="!hasMonthlyTrend" data-chart-sparse="date-trend" class="memories-panel__empty">
      这些足迹还没有可用于趋势统计的旅行日期。
    </p>
    <BaseChart v-if="hasMonthlyTrend" :option="monthlyOption" :min-height="314" />
  </article>

  <article data-chart-panel="country-distribution" class="memories-panel memories-panel--country">
    <BaseChart :option="countryOption" :empty="dashboard.countryDistribution.length === 0" :min-height="264" />
    <ul v-if="countryLegendItems.length > 0" class="memories-country-legend" aria-label="足迹国家或地区占比">
      <li v-for="item in countryLegendItems" :key="item.label">
        <span class="memories-country-legend__name">{{ item.label }}</span>
        <strong>{{ item.percentage }}%</strong>
      </li>
    </ul>
  </article>

  <article data-chart-panel="memories-profile" class="memories-panel memories-panel--profile">
    <BaseChart v-if="hasProfile" :option="profileOption" :min-height="285" />
  </article>
</section>
```

**Reusable chart wrapper pattern** (from `BaseChart.vue`, lines 45-91):
```vue
<section
  data-base-chart
  :aria-busy="loading"
  :style="{ minHeight: `${minHeight}px`, height: `${minHeight}px` }"
  class="relative w-full"
>
  <div v-if="error" role="alert" data-state="error">
    <p>{{ error }}</p>
  </div>

  <div v-else-if="empty" data-state="empty">
    <h3>还没有旅行记录</h3>
    <p>先回到地图，选择一个真实地点留下第一枚足迹。</p>
  </div>

  <div v-else-if="loading" data-state="loading">
    <div class="h-32 w-full animate-pulse rounded-[var(--radius-card)] bg-[var(--color-accent)]/10" />
  </div>

  <VChart
    v-else
    class="base-chart__canvas"
    :option="option"
    :theme="YUME_KAWAII_CHART_THEME"
    :autoresize="{ throttle: 100 }"
    style="width: 100%; height: 100%;"
  />
</section>
```

**Testing pattern** (from `MemoriesChartGrid.spec.ts`, lines 51-87; `BaseChart.spec.ts`, lines 14-49):
```ts
it('renders the four memories chart panel titles', () => {
  const wrapper = mount(MemoriesChartGrid, { props: { dashboard: makeDashboard() } })

  expect(wrapper.find('[data-region="memories-chart-grid"]').exists()).toBe(true)
  expect(wrapper.get('[data-chart-panel="monthly-trend"]').text()).toContain('旅途足迹趋势')
  expect(wrapper.get('[data-chart-panel="country-distribution"]').text()).toContain('足迹国家/地区分布')
  expect(wrapper.get('[data-chart-panel="yearly-trend"]').text()).toContain('年度旅途趋势')
  expect(wrapper.get('[data-chart-panel="memories-profile"]').text()).toContain('旅途风格分析')
})

it('renders VChart with yume-kawaii theme and autoresize', () => {
  const wrapper = mount(BaseChart, { props: { option: { series: [{ type: 'line', data: [1, 2, 3] }] } } })
  const chart = wrapper.find('[data-mocked-vchart]')
  expect(chart.exists()).toBe(true)
  expect(chart.attributes('data-theme')).toBe('yume-kawaii')
  expect(chart.attributes('data-autoresize')).toContain('100')
})
```

---

### `apps/web/src/components/timeline/TimelineVisitCard.vue` and `apps/web/src/components/shell/ShellSidebar.vue` (component, CRUD + request-response)

**Analog:** `apps/web/src/components/timeline/TimelineVisitCard.vue` + `apps/web/src/components/shell/ShellSidebar.vue`

**Journal card imports/state pattern** (from `TimelineVisitCard.vue`, lines 1-29, 38-56):
```vue
<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { storeToRefs } from 'pinia'
import { DotsHorizontalIcon } from '@radix-icons/vue'

import type { UpdateTravelRecordRequest } from '@trip-map/contracts'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { TimelineEntry } from '../../services/timeline'
import { useMapPointsStore } from '../../stores/map-points'
import ConfirmDialog from './ConfirmDialog.vue'
import JournalPostcardThumb from './JournalPostcardThumb.vue'
import TimelineEditForm from './TimelineEditForm.vue'
import { getJournalLocationPath, getJournalPostcardVariant, getJournalSummary } from './journal-thumbnails'

const isEditDialogOpen = shallowRef(false)
const isSubmitting = shallowRef(false)
const isDeleteDialogOpen = shallowRef(false)
const journalSummary = computed(() => getJournalSummary(props.entry.notes))
const journalLocationPath = computed(() => getJournalLocationPath(props.entry))
```

**Long text and icon-only control pattern** (from `TimelineVisitCard.vue`, lines 141-185):
```vue
<DropdownMenu>
  <DropdownMenuTrigger as-child>
    <button
      type="button"
      data-card-management
      aria-label="管理这条旅行记录"
    >
      <DotsHorizontalIcon aria-hidden="true" />
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem data-card-edit @click="handleEditClick">编辑</DropdownMenuItem>
    <DropdownMenuItem data-card-delete variant="destructive" @click="handleDeleteClick">删除</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

<h3 class="mt-2 text-[26px] font-extrabold leading-[1.18] text-[var(--color-ink-strong)]">
  {{ entry.displayName }}
</h3>
<p class="mt-2 line-clamp-2 text-[16px] font-semibold leading-6 text-[var(--color-ink-muted)]">
  {{ journalSummary }}
</p>
```

**Sidebar nav/long username pattern** (from `ShellSidebar.vue`, lines 28-56, 94-109, 127-178):
```vue
const navItems = [
  { key: 'map', to: '/map', label: '世界足迹', icon: 'map' as const },
  { key: 'journal', to: '/journal', label: '旅途手账', icon: 'journal' as const },
  { key: 'atlas', to: '/memories', label: '旅行图鉴', icon: 'memories' as const },
] satisfies NavItem[]

function getNavButtonClass(item: NavItem) {
  return [
    'sidebar-nav-button h-11 rounded-[16px] px-3.5 text-[#8a77cc] transition duration-[var(--motion-quick)] focus-visible:ring-2 focus-visible:ring-[rgba(247,90,155,0.32)]',
    isActiveRoute(item)
      ? 'bg-[linear-gradient(135deg,rgba(255,224,241,0.98),rgba(255,241,249,0.98))] text-[#2f1d72] shadow-[0_12px_24px_rgba(244,143,177,0.18)]'
      : 'bg-transparent hover:-translate-y-0.5 hover:bg-white/64',
  ]
}

<p class="max-w-full truncate text-[18px] font-extrabold leading-6 text-[#2f1d72]">
  {{ displayUsername }}
</p>

<nav class="sidebar-menu-frame" aria-label="已登录导航">
  <SidebarMenuButton
    :aria-current="isActiveRoute(item) ? 'page' : undefined"
    :data-shell-nav-item="item.key"
  >
    <KawaiiIcon :label="item.label" :decorative="false" />
    <span class="text-sm font-semibold">{{ item.label }}</span>
  </SidebarMenuButton>
</nav>
```

**Testing pattern** (from `TimelineVisitCard.spec.ts`, lines 150-158, 204-215; `AuthenticatedAppShell.spec.ts`, lines 90-95):
```ts
it('renders the decorative postcard as hidden from assistive technology with a stable variant', () => {
  const { wrapper } = mountCard(makeTimelineEntry())
  const postcard = wrapper.get('[data-journal-postcard]')
  expect(postcard.attributes('aria-hidden')).toBe('true')
  expect(wrapper.get('[data-journal-postcard-image]').attributes('alt')).toBe('')
})

it('shows a quiet management menu with only edit and delete actions', async () => {
  const { wrapper } = mountCard(makeTimelineEntry())
  const trigger = wrapper.get('[data-card-management]')
  expect(trigger.attributes('aria-label')).toBe('管理这条旅行记录')
  await openManagementMenu(wrapper)
  expect(getManagementActions().map((action) => action.textContent?.trim())).toEqual(['编辑', '删除'])
})

it('marks the active route with aria-current="page"', async () => {
  const { wrapper } = await mountShell('/journal')
  expect(wrapper.get('[data-shell-nav-item="journal"]').attributes('aria-current')).toBe('page')
  expect(wrapper.get('[data-shell-nav-item="map"]').attributes('aria-current')).toBeUndefined()
})
```

---

### Regression Gate Files (test, request-response + CRUD + transform)

**Analogs:** `package.json`, `apps/web/package.json`, `apps/server/package.json`, `packages/contracts/package.json`, `apps/server/scripts/vitest-run.mjs`

**Workspace command pattern** (from root `package.json`, lines 7-14):
```json
"scripts": {
  "dev": "turbo run dev --filter=@trip-map/web",
  "dev:web": "pnpm --filter @trip-map/web dev",
  "dev:server": "pnpm --filter @trip-map/server dev",
  "build": "turbo run build",
  "test": "turbo run test",
  "typecheck": "turbo run typecheck"
}
```

**Package test scripts** (from `apps/web/package.json`, lines 6-10; `apps/server/package.json`, lines 6-10; `packages/contracts/package.json`, lines 11-14):
```json
// apps/web/package.json
"test": "NODE_OPTIONS='--localstorage-file=/tmp/trip-map-localstorage' vitest run"

// apps/server/package.json
"test": "node ./scripts/vitest-run.mjs"

// packages/contracts/package.json
"test": "vitest run"
```

**Server DB-unavailable handling pattern** (from `apps/server/scripts/vitest-run.mjs`, lines 17-26, 65-115, 145-160):
```js
const dbRequiredTests = new Set([
  'test/auth-bootstrap.e2e-spec.ts',
  'test/auth-session.e2e-spec.ts',
  'test/records-contract.e2e-spec.ts',
  'test/records-import.e2e-spec.ts',
  'test/records-ownership.e2e-spec.ts',
  'test/records-smoke.e2e-spec.ts',
  'test/records-sync.e2e-spec.ts',
  'test/records-travel.e2e-spec.ts',
])

async function isDatabaseReachable() {
  const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL)
  if (!databaseUrl) {
    return false
  }
  // socket probe with timeout, returns false on connect/error/timeout failure
}

if (!hasExplicitTestSelection && !(await isDatabaseReachable())) {
  const runnableTests = listE2eTests(testRoot).filter(testFile => !dbRequiredTests.has(testFile))
  console.warn('[server:test] DATABASE_URL is not reachable; skipping DB-backed e2e specs.')
  console.warn(`[server:test] Skipped: ${[...dbRequiredTests].join(', ')}`)
  vitestArgs.push(...runnableTests)
}

if (
  firstRun.code !== 0
  && !hasExplicitTestSelection
  && transientDatabaseErrorPattern.test(firstRun.output)
) {
  console.warn('[server:test] Detected transient database connectivity failure; retrying full server suite once.')
  const retryRun = await runVitestOnce()
  process.exit(retryRun.code)
}
```

## Shared Patterns

### Vue Component Structure

**Source:** `apps/web/src/components/map-popup/FootprintDateDialog.vue`, `apps/web/src/components/memories/MemoriesChartGrid.vue`
**Apply to:** Any Phase 48 component fix

Use Vue 3 `<script setup lang="ts">`, typed `defineProps`/`defineEmits`, `computed` for derived display state, `shallowRef` for primitive local state, and colocated scoped styles. Keep fixes in the owning component rather than creating global visual-system refactors.

### Accessibility

**Source:** `AuthDialog.vue`, `MapContextPopup.vue`, `FootprintDateDialog.vue`, `ShellSidebar.vue`
**Apply to:** Auth entry, sidebar nav, popup, date dialog, chart/status regions

Concrete patterns to preserve:
- Dialogs use `role="dialog"`, `aria-modal`, `aria-labelledby`, and labeled close buttons.
- Popup entry focuses a hidden title with `tabindex="-1"` and exposes `getPopupElement()` for focus return.
- Icon-only controls use `aria-label`; decorative icons/images use `aria-hidden="true"` or `alt=""`.
- Status/error output uses `role="status"`, `aria-live="polite"`, `role="alert"`, or `aria-busy` depending on severity.
- Current route uses `aria-current="page"`.

### Focus Return

**Source:** `LeafletMapStage.vue` lines 532-549; `AuthDialog.vue` lines 114-128
**Apply to:** Dialog open/close, auth entry, footprint submit/cancel

Copy the pattern of storing or deriving a return target, waiting for `nextTick`, and focusing a stable enabled trigger first, then a reasonable fallback title/control.

### Reduced Motion

**Source:** `LeafletMapStage.vue` lines 1099-1107; `FootprintDateDialog.vue` lines 822-829
**Apply to:** Landing decoration, shell/sidebar hover displacement, map marker pulse, popup/dialog motion, journal cards, memories cards/charts

Use local `@media (prefers-reduced-motion: reduce)` overrides that remove `animation`, `transition`, and decorative `transform` only on the affected component selectors. If the fix touches only Tailwind utility motion, add a colocated class/selector override or `motion-reduce:*` in the owning component.

### Long Text

**Source:** `ShellSidebar.vue` lines 105-107; `TimelineVisitCard.vue` lines 176-185; `FootprintDateDialog.vue` lines 171-207
**Apply to:** long usernames, long place names, long note/tag summaries

Use `min-width: 0` on grid/flex containers, `truncate` for single-line constrained labels, `line-clamp-2` for summaries, and tooltip/full text only where a visible truncated title needs a readable fallback.

### Chart Non-Empty Verification

**Source:** `MemoriesChartGrid.vue` lines 40-155; `BaseChart.vue` lines 45-91
**Apply to:** `/memories` screenshot and any chart accessibility fix

All four chart panels should mount `BaseChart` in populated state. Sparse monthly/yearly trends intentionally show `data-chart-sparse="date-trend"` and should not be accepted for Phase 48 populated screenshot evidence.

### Test Placement

**Source:** colocated specs under `apps/web/src/**`
**Apply to:** Any Phase 48 code fix

Add or extend the colocated spec for the component that owns the changed behavior:
- `AuthDialog.spec.ts` for auth entry, form errors, modal semantics.
- `AuthenticatedAppShell.spec.ts` / `ShellSidebar` coverage for nav/current route/user text.
- `LeafletMapStage.spec.ts` for map popup, footprint dialog orchestration, focus return.
- `MapContextPopup.spec.ts` for popup semantics and CTA.
- `FootprintDateDialog.spec.ts` for Calendar, close/submit, long place names, disabled state, reduced-motion source assertions.
- `TimelinePageView.spec.ts` / `TimelineVisitCard.spec.ts` for journal state, long text, edit/delete controls.
- `StatisticsPageView.spec.ts`, `MemoriesChartGrid.spec.ts`, `BaseChart.spec.ts` for memories state and chart rendering/status.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `.planning/phases/48-visual-qa-accessibility/evidence/seed-data.md` or equivalent fixed-account procedure | config | batch | Research found no existing dedicated QA seed script. Planner should define a minimal phase-local procedure or fixed account notes before screenshots. |
| Browser-level automated visual smoke test files | test | request-response | Locked context says not to add browser automation solely for map/chart non-empty verification. Do not create these unless a later code fix introduces a separate need. |

## Metadata

**Analog search scope:** `.planning/phases`, `apps/web/src`, `apps/server/scripts`, `apps/server/test`, `packages/contracts`, workspace package scripts
**Files scanned:** 150+ via `rg --files` and targeted `rg`
**Pattern extraction date:** 2026-05-27
**Desktop-only constraint:** Applied. Mobile QA patterns intentionally excluded.
