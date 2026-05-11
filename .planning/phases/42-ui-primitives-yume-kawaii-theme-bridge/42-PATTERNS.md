# Phase 42: UI Primitives 与 Yume Kawaii Theme Bridge - Pattern Map

**Mapped:** 2026-05-11
**Files analyzed:** 28 file groups
**Analogs found:** 28 / 28

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `apps/web/package.json` | config | batch | `apps/web/package.json` | exact |
| `pnpm-lock.yaml` | config | batch | `pnpm-lock.yaml` via `apps/web/src/tailwind-token.spec.ts` | role-match |
| `apps/web/components.json` | config | batch | `apps/web/vite.config.ts`, `apps/web/tsconfig.json` | partial |
| `apps/web/vite.config.ts` | config | transform | `apps/web/vite.config.ts` | exact |
| `apps/web/tsconfig.json` | config | transform | `apps/web/tsconfig.json` | exact |
| `apps/web/src/style.css` | config | transform | `apps/web/src/style.css` | exact |
| `apps/web/src/styles/tokens.css` | config | transform | `apps/web/src/styles/tokens.css` | exact |
| `apps/web/src/lib/utils.ts` | utility | transform | `apps/web/src/services/timeline.ts` | role-match |
| `apps/web/src/components/ui/button/*` | component | event-driven | `apps/web/src/components/map-popup/PointSummaryCard.vue` | role-match |
| `apps/web/src/components/ui/card/*` | component | transform | `apps/web/src/components/statistics/StatCard.vue` | role-match |
| `apps/web/src/components/ui/dialog/*` | component | event-driven | `apps/web/src/components/auth/AuthDialog.vue`, `apps/web/src/components/timeline/ConfirmDialog.vue` | role-match |
| `apps/web/src/components/ui/popover/*` | component | event-driven | `apps/web/src/components/map-popup/MapContextPopup.vue` | partial |
| `apps/web/src/components/ui/calendar/*` | component | event-driven | `apps/web/src/components/map-popup/TripDateForm.vue` | partial |
| `apps/web/src/components/ui/tabs/*` | component | event-driven | `apps/web/src/components/auth/AuthDialog.vue` | role-match |
| `apps/web/src/components/ui/sidebar/*` | component | event-driven | `apps/web/src/views/TimelinePageView.vue` | partial |
| `apps/web/src/components/ui/dropdown-menu/*` | component | event-driven | `apps/web/src/components/timeline/ConfirmDialog.vue` | partial |
| `apps/web/src/components/ui/skeleton/*` | component | transform | `apps/web/src/views/StatisticsPageView.vue` | role-match |
| `apps/web/src/components/ui/scroll-area/*` | component | transform | `apps/web/src/components/map-popup/PointSummaryCard.vue` | role-match |
| `apps/web/src/components/common/KawaiiIcon.vue` | component | transform | `apps/web/src/components/map-popup/PointSummaryCard.vue` | partial |
| `apps/web/src/lib/icons/registry.ts` | utility | transform | `apps/web/src/services/api/client.ts` | partial |
| `apps/web/src/lib/icons/semantic-icons.ts` | utility | transform | `apps/web/src/services/timeline.ts` | role-match |
| `apps/web/src/components/common/BaseChart.vue` | component | transform | `apps/web/src/views/StatisticsPageView.vue`, `apps/web/src/components/statistics/StatCard.vue` | partial |
| `apps/web/src/lib/charts/register.ts` | config | transform | `apps/web/src/main.ts` | partial |
| `apps/web/src/lib/charts/theme.ts` | utility | transform | `apps/web/src/styles/tokens.css` | partial |
| `apps/web/src/views/UiShowcaseView.vue` | component | request-response | `apps/web/src/views/TimelinePageView.vue` | exact role |
| `apps/web/src/components/showcase/*` | component | event-driven | `apps/web/src/views/StatisticsPageView.vue` | role-match |
| `apps/web/src/router/index.ts` | route | request-response | `apps/web/src/router/index.ts` | exact |
| `apps/web/src/**/*.{spec.ts}` for Phase 42 smoke tests | test | event-driven | `AuthDialog.spec.ts`, `ConfirmDialog.spec.ts`, `router/index.spec.ts`, `tailwind-token.spec.ts` | exact role |

## Pattern Assignments

### `apps/web/package.json` and `pnpm-lock.yaml` (config, batch)

**Analog:** `apps/web/package.json`

**Package structure pattern** (`apps/web/package.json` lines 1-14):

```json
{
  "name": "@trip-map/web",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "test": "vitest run",
    "typecheck": "vue-tsc --noEmit"
  }
}
```

**Dependency placement pattern** (`apps/web/package.json` lines 15-42):

```json
"dependencies": {
  "pinia": "^3.0.4",
  "vue": "^3.5.32",
  "vue-router": "^4"
},
"devDependencies": {
  "@tailwindcss/vite": "^4.2.2",
  "@vue/test-utils": "^2.4.6",
  "happy-dom": "^20.9.0",
  "vite": "^8.0.8",
  "vitest": "^4.1.4",
  "vue-tsc": "^3.2.6"
}
```

**Apply to Phase 42:** add runtime UI/chart/icon packages under `dependencies`; add dev-time icon JSON/utils only under `devDependencies`. Let install update `pnpm-lock.yaml`; do not hand-edit lockfile.

---

### `apps/web/components.json` (config, batch)

**Analog:** no existing shadcn config; use Vite/TS alias config as local config style.

**Vite alias style to preserve** (`apps/web/vite.config.ts` lines 5-18):

```ts
const fromWebRoot = (path: string) => new URL(path, import.meta.url).pathname
const repoRoot = fromWebRoot('../..')

export default defineConfig({
  plugins: [tailwindcss(), vue()],
  resolve: {
    alias: {
      vue: fromWebRoot('./node_modules/vue'),
      pinia: fromWebRoot('./node_modules/pinia'),
    }
  },
})
```

**TypeScript path style to preserve** (`apps/web/tsconfig.json` lines 3-13):

```json
"compilerOptions": {
  "baseUrl": ".",
  "types": ["vite/client", "vitest/globals"],
  "paths": {
    "vue": ["./node_modules/vue"],
    "pinia": ["./node_modules/pinia"]
  }
}
```

**Apply to Phase 42:** create `components.json` in `apps/web` with Tailwind v4 CSS entry `src/style.css`, source alias `@`, TypeScript enabled, and generated primitive aliases pointing to `@/components/ui` and `@/lib/utils`. Keep generated primitives under `apps/web/src/components/ui/*`.

---

### `apps/web/vite.config.ts` (config, transform)

**Analog:** `apps/web/vite.config.ts`

**Imports and plugin order** (lines 1-9):

```ts
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const fromWebRoot = (path: string) => new URL(path, import.meta.url).pathname

export default defineConfig({
  plugins: [tailwindcss(), vue()],
})
```

**Alias pattern** (lines 10-18):

```ts
resolve: {
  alias: {
    vue: fromWebRoot('./node_modules/vue'),
    pinia: fromWebRoot('./node_modules/pinia'),
    nanoid: fromWebRoot('./node_modules/nanoid'),
    '@floating-ui/dom': fromWebRoot('./node_modules/@floating-ui/dom'),
  }
}
```

**Apply to Phase 42:** add only `@`: `fromWebRoot('./src')` to this existing alias map. Preserve dependency aliases and `plugins: [tailwindcss(), vue()]`.

---

### `apps/web/tsconfig.json` (config, transform)

**Analog:** `apps/web/tsconfig.json`

**Path alias pattern** (lines 3-13):

```json
"compilerOptions": {
  "baseUrl": ".",
  "types": ["vite/client", "vitest/globals"],
  "paths": {
    "vue": ["./node_modules/vue"],
    "pinia": ["./node_modules/pinia"],
    "@vue/test-utils": ["./node_modules/@vue/test-utils"]
  }
}
```

**Include pattern** (lines 15-21):

```json
"include": [
  "src/**/*.ts",
  "src/**/*.vue",
  "src/**/*.d.ts",
  "vite.config.ts",
  "vitest.config.ts"
]
```

**Apply to Phase 42:** add `"@/*": ["./src/*"]` under `paths`; preserve `baseUrl`, existing package paths, and includes.

---

### `apps/web/src/style.css` and `apps/web/src/styles/tokens.css` (config, transform)

**Analogs:** `apps/web/src/style.css`, `apps/web/src/styles/tokens.css`, `apps/web/src/tailwind-token.spec.ts`

**Global import order** (`apps/web/src/style.css` lines 1-4):

```css
@import "tailwindcss";
@import 'leaflet/dist/leaflet.css';
@import './styles/tokens.css';
@import './styles/global.css';
```

**Tailwind v4 theme block pattern** (`apps/web/src/style.css` lines 6-20):

```css
@theme {
  --color-sakura-100: #FFD7EA;
  --color-mint-500: #7ED9B6;
  --color-lavender-500: #B79BEA;
  --font-sans: 'Nunito Variable', 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', sans-serif;
}
```

**Token layer pattern** (`apps/web/src/styles/tokens.css` lines 1-8, 33-69, 71-112):

```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;

  --color-page: #FAFAFA;
  --color-surface: #fdf5ff;
  --color-accent: #f48fb1;
  --color-frame: #d8bdd9;
  --color-ink-strong: #57425f;
  --color-ink-muted: #7f6a86;

  --radius-surface: 24px;
  --radius-control: 18px;
  --radius-card: 28px;
  --radius-bubble: 32px;
  --radius-pill: 999px;

  --shadow-surface:
    0 20px 40px rgba(168, 121, 165, 0.16),
    0 6px 14px rgba(114, 152, 180, 0.08);
  --shadow-button:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 10px 18px rgba(168, 121, 165, 0.12);

  --motion-quick: 140ms;
  --motion-emphasis: 180ms;
}
```

**CSS contract test pattern** (`apps/web/src/tailwind-token.spec.ts` lines 41-88, 90-106):

```ts
const styleSource = readWebFile('src/style.css')
const mainSource = readWebFile('src/main.ts')

expect(styleSource).toContain('@import "tailwindcss";')
expect(styleSource).toContain("@import './styles/tokens.css';")
expect(mainSource).toContain("import '@fontsource-variable/nunito'")
expect(mainSource).toContain("import './style.css'")

const tokensSource = readWebFile('src/styles/tokens.css')
expect(tokensSource).toContain('--font-family-body:')
expect(tokensSource).toContain('--color-state-selected:')
```

**Apply to Phase 42:** recalibrate existing `tokens.css` in place to UI-SPEC values. Keep `style.css` as the Tailwind v4 entry and update `@theme` names/values to match the same baseline. Update `tailwind-token.spec.ts` assertions when token values change.

---

### `apps/web/src/lib/utils.ts` (utility, transform)

**Analog:** `apps/web/src/services/timeline.ts`

**Typed utility export pattern** (lines 1-19, 69-89):

```ts
import type { TravelRecord } from '@trip-map/contracts'

export interface TimelineEntry {
  recordId: string
  placeId: string
  displayName: string
}

export function buildTimelineEntries(records: TravelRecord[]): TimelineEntry[] {
  const sortedEntries = records.map(toTimelineEntry).sort(compareTimelineEntries)

  return sortedEntries.map((entry) => ({
    ...entry,
    visitCount: visitCounts.get(entry.placeId) ?? 1,
  }))
}
```

**Apply to Phase 42:** create a small named utility module. For shadcn-vue, the expected shape is:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Keep it dependency-free beyond `clsx` and `tailwind-merge`; do not put component logic here.

---

### `apps/web/src/components/ui/button/*` (component, event-driven)

**Analog:** `apps/web/src/components/map-popup/PointSummaryCard.vue`

**Props/emits and state-derived class pattern** (lines 23-50, 168-178):

```ts
const props = withDefaults(
  defineProps<{
    isSaved?: boolean
    isPending?: boolean
    isIlluminatable?: boolean
  }>(),
  {
    isSaved: false,
    isPending: false,
    isIlluminatable: true,
  },
)

const emit = defineEmits<{
  illuminate: [payload: { startDate: string | null; endDate: string | null }]
  unilluminate: []
}>()

const primaryCtaBaseClass =
  'point-summary-card__illuminate-btn min-h-11 rounded-full px-4 py-2 text-[var(--font-label-size)] font-bold whitespace-nowrap transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 active:scale-95'
const primaryCtaOffClass =
  'border border-[#f4d7e4] bg-[linear-gradient(135deg,rgba(255,232,242,0.96),rgba(255,246,250,0.96))] text-[var(--color-accent-strong)] shadow-[0_14px_28px_rgba(244,143,177,0.34)]'
const illuminateButtonClass = computed(() => [
  primaryCtaBaseClass,
  props.isSaved ? primaryCtaOnClass : primaryCtaOffClass,
])
```

**Template interaction pattern** (lines 279-292):

```vue
<button
  :class="illuminateButtonClass"
  :disabled="isPending || !isIlluminatable"
  :aria-label="illuminateAriaLabel"
  type="button"
  @click="handleIlluminateToggle"
>
  {{ illuminateLabel }}
</button>
```

**Focus/reduced motion pattern** (lines 540-564, 567-579):

```css
.point-summary-card__candidate-action:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 72%, white 28%);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  [data-kawaii-role="primary-cta"] {
    transform: none !important;
  }
}
```

**Apply to Phase 42:** generated Button defaults should use Yume Kawaii tokenized pill styling, disabled states, visible focus, and modest transform/opacity-only interaction. Icon-only button examples in `/__ui` need `aria-label`.

---

### `apps/web/src/components/ui/card/*` (component, transform)

**Analog:** `apps/web/src/components/statistics/StatCard.vue`

**Focused SFC pattern** (lines 1-10):

```vue
<script setup lang="ts">
interface Props {
  label: string
  value: number
  unit: string
  gradient: string
}

defineProps<Props>()
</script>
```

**Surface pattern** (lines 12-38):

```vue
<article
  class="grid gap-3 rounded-[28px] border border-white/80 p-5 shadow-[var(--shadow-float)]"
  :style="{ background: gradient }"
  data-region="stat-card"
>
  <p class="text-[0.72rem] font-semibold tracking-[0.10em] text-[var(--color-ink-soft)] uppercase">
    {{ label }}
  </p>
  <p class="text-[clamp(2rem,3.5vw,3rem)] font-bold leading-[1.2] text-[var(--color-ink-strong)]">
    {{ value }}
  </p>
</article>
```

**Apply to Phase 42:** generated Card primitives should use the same glass surface baseline: 24-32px radii, soft white/lavender border, token shadows, deep indigo text, and no gray chrome.

---

### `apps/web/src/components/ui/dialog/*` (component, event-driven)

**Analogs:** `apps/web/src/components/auth/AuthDialog.vue`, `apps/web/src/components/timeline/ConfirmDialog.vue`

**Dialog state and focus pattern** (`AuthDialog.vue` lines 11-18, 41-57, 111-127):

```ts
const { authMode, isAuthModalOpen, isSubmitting } = storeToRefs(authSessionStore)
const loginEmailInput = useTemplateRef<HTMLInputElement>('loginEmailInput')
const submitError = shallowRef('')
const lastFocusedElement = shallowRef<HTMLElement | null>(null)

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
  { immediate: true },
)
```

**Error handling pattern** (`AuthDialog.vue` lines 68-108):

```ts
async function handleSubmit() {
  resetSubmitError()

  try {
    await login({ email: loginForm.email, password: loginForm.password })
    closeAuthModal()
  } catch (error) {
    if (error instanceof ApiClientError) {
      submitError.value = '登录失败，请检查邮箱和密码后重试。'
      return
    }

    submitError.value = '请求暂时没有成功，请稍后再试。'
  }
}
```

**Dialog surface pattern** (`AuthDialog.vue` lines 143-155, 294-308):

```vue
<div
  v-if="isAuthModalOpen"
  class="fixed inset-0 z-[8] flex items-center justify-center bg-[rgba(87,66,95,0.18)] px-4 py-6 backdrop-blur-sm"
>
  <div
    role="dialog"
    aria-modal="true"
    class="mx-auto w-full max-w-[30rem] shrink-0 overflow-hidden rounded-[32px] border border-white/85 bg-[var(--color-surface)]/96 text-[var(--color-ink-strong)] shadow-[var(--shadow-stage)] backdrop-blur-xl"
  >
    <p v-if="submitError" role="alert">{{ submitError }}</p>
    <button type="submit" :disabled="isSubmitting">{{ submitLabel }}</button>
  </div>
</div>
```

**Simpler controlled dialog pattern** (`ConfirmDialog.vue` lines 1-32, 35-47, 60-82):

```ts
const props = withDefaults(defineProps<Props>(), {
  confirmLabel: '确认',
  cancelLabel: '取消',
  tone: 'default',
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('cancel')
  }
}
```

```vue
<div
  v-if="isOpen"
  role="dialog"
  aria-modal="true"
  @keydown="handleKeydown"
>
  <button type="button" @click="emit('confirm')">{{ confirmLabel }}</button>
  <button type="button" @click="emit('cancel')">{{ cancelLabel }}</button>
</div>
```

**Apply to Phase 42:** generated shadcn/Reka Dialog should own focus/escape/outside click behavior. Local theme edits should copy visual tokens only, not reimplement focus traps.

---

### `apps/web/src/components/ui/popover/*` and `apps/web/src/components/ui/dropdown-menu/*` (component, event-driven)

**Analog:** `apps/web/src/components/map-popup/MapContextPopup.vue`

**Overlay placement and accessible label pattern** (lines 38-54, 85-96, 102-114):

```ts
const popupRef = useTemplateRef<HTMLElement>('popup')
const titleRef = useTemplateRef<HTMLElement>('title')
const popupTitleId = 'map-context-popup-title'

const popupStyles = computed(() => ({
  '--map-context-popup-min-width': '280px',
  '--map-context-popup-max-width': '360px',
  ...(props.floatingStyles ?? {})
}))
```

```vue
<aside
  ref="popup"
  class="absolute z-[4] flex min-h-0 min-w-[var(--map-context-popup-min-width)] max-w-[var(--map-context-popup-max-width)] flex-col overflow-visible rounded-[32px] border border-white/70 bg-white/75 p-1 shadow-[0_16px_34px_rgba(155,116,160,0.12)] backdrop-blur-xl"
  role="dialog"
  aria-modal="false"
  :aria-labelledby="popupTitleId"
  :style="popupStyles"
>
  <h2 :id="popupTitleId" ref="title" class="sr-only" tabindex="-1">
    {{ popupTitle }}
  </h2>
</aside>
```

**Apply to Phase 42:** shadcn Popover/Dropdown should keep Reka behavior and use this glass shell language: rounded 28-32px, white/pastel translucent surface, soft shadow, hidden semantic title where needed, no heavy transform on anchored shells.

---

### `apps/web/src/components/ui/calendar/*` (component, event-driven)

**Analog:** `apps/web/src/components/map-popup/TripDateForm.vue`

**Date validation pattern** (lines 21-42):

```ts
const startDate = ref('')
const endDate = ref('')

const hasStartDate = computed(() => startDate.value !== '')
const hasRangeError = computed(
  () => hasStartDate.value && endDate.value !== '' && endDate.value < startDate.value,
)
const isValid = computed(() => hasStartDate.value && !hasRangeError.value)
const rangeErrorMessage = computed(() =>
  hasRangeError.value ? '结束日期不能早于开始日期' : null,
)

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

**Date input accessibility and error pattern** (lines 50-92):

```vue
<form @submit.prevent="handleSubmit">
  <label class="grid gap-1">
    <span class="text-[var(--font-label-size)] font-bold text-[var(--color-ink-strong)]">
      开始日期
    </span>
    <input
      v-model="startDate"
      type="date"
      required
      :max="endDate || undefined"
      aria-label="选择旅行开始日期"
    />
  </label>

  <p v-if="rangeErrorMessage" role="alert">
    {{ rangeErrorMessage }}
  </p>
</form>
```

**Apply to Phase 42:** Calendar examples in `/__ui` must have selected/focus states that are visible beyond color. Use `@internationalized/date` if the generated primitive expects it; do not connect Calendar to real trip data in this phase.

---

### `apps/web/src/components/ui/tabs/*` and `apps/web/src/components/ui/sidebar/*` (component, event-driven)

**Analogs:** `apps/web/src/components/auth/AuthDialog.vue`, `apps/web/src/views/TimelinePageView.vue`

**Tab semantics pattern** (`AuthDialog.vue` lines 176-214, 216-253):

```vue
<div
  class="grid min-h-11 grid-cols-2 gap-2 rounded-full border border-white/85 bg-white/72 p-1"
  role="tablist"
  aria-label="认证方式"
>
  <button
    id="auth-tab-login"
    type="button"
    role="tab"
    :aria-selected="activeMode === 'login'"
    aria-controls="auth-panel-login"
    @click="switchMode('login')"
  >
    登录
  </button>
</div>

<div
  id="auth-panel-login"
  role="tabpanel"
  aria-labelledby="auth-tab-login"
>
  ...
</div>
```

**Sidebar/list shell pattern** (`TimelinePageView.vue` lines 28-67, 145-168):

```vue
<section
  class="flex min-h-0 flex-col gap-5 overflow-y-auto rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,248,251,0.94))] p-5 shadow-[var(--shadow-stage)] md:gap-6 md:p-6"
  data-route-view="timeline"
>
  <header class="grid gap-4 rounded-[28px] border border-white/85 bg-white/70 p-4 shadow-[var(--shadow-float)] md:grid-cols-[minmax(0,1fr)_auto]">
    ...
  </header>

  <div v-else-if="shouldShowTimeline" class="grid gap-4" data-state="populated">
    <TimelineVisitCard v-for="entry in timelineEntries" :key="entry.recordId" :entry="entry" />
  </div>
</section>
```

**Apply to Phase 42:** Tabs need real `role="tablist"`, `role="tab"`, `role="tabpanel"` semantics from the primitive. Sidebar should follow soft active item washes and stable min dimensions; do not add it to product navigation in Phase 42 except inside `/__ui`.

---

### `apps/web/src/components/ui/skeleton/*` and `apps/web/src/components/ui/scroll-area/*` (component, transform)

**Analogs:** `apps/web/src/views/StatisticsPageView.vue`, `apps/web/src/components/map-popup/PointSummaryCard.vue`

**Skeleton/loading state pattern** (`StatisticsPageView.vue` lines 152-178):

```vue
<div
  v-if="shouldShowRestoringState"
  class="grid gap-4"
  data-state="restoring"
  aria-live="polite"
>
  <div class="rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-[var(--shadow-float)]">
    <div class="space-y-2">
      <div class="h-4 w-32 rounded-full bg-white/90"></div>
      <div class="h-8 w-56 rounded-full bg-white/80"></div>
    </div>
  </div>
</div>
```

**Scroll area pattern** (`PointSummaryCard.vue` lines 303-305, 470-492):

```vue
<div class="point-summary-card__content flex min-h-0 overflow-hidden">
  <div class="point-summary-card__scroll-region grid flex-1 min-h-0 gap-4 overflow-y-auto pr-1.5">
    ...
  </div>
</div>
```

```css
.point-summary-card__scroll-region {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-inline-end: 0.35rem;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--color-frame) 64%, white 36%) transparent;
}
```

**Apply to Phase 42:** Skeleton should preserve layout dimensions and `aria-live` where it represents loading. Scroll Area should solve overflow without layout shift; avoid custom JS scroll behavior.

---

### `apps/web/src/components/common/KawaiiIcon.vue` (component, transform)

**Analog:** no icon wrapper exists; use component contract style from `PointSummaryCard.vue`.

**Semantic props and computed state pattern** (`PointSummaryCard.vue` lines 23-52, 145-151):

```ts
const props = withDefaults(
  defineProps<{
    isSaved?: boolean
    isPending?: boolean
    isIlluminatable?: boolean
  }>(),
  {
    isSaved: false,
    isPending: false,
    isIlluminatable: true,
  },
)

const illuminateLabel = computed(() => (props.isSaved ? '已点亮' : '点亮'))
const illuminateState = computed(() => (props.isSaved ? 'on' : 'off'))
const illuminateAriaLabel = computed(() => illuminateHint.value ?? illuminateLabel.value)
```

**Stable box and accessible label pattern** (`TripDateForm.vue` lines 60-68, `PointSummaryCard.vue` lines 279-288):

```vue
<input
  v-model="startDate"
  type="date"
  required
  aria-label="选择旅行开始日期"
/>

<button
  type="button"
  :aria-label="illuminateAriaLabel"
  :title="illuminateHint ?? undefined"
>
  {{ illuminateLabel }}
</button>
```

**Apply to Phase 42:** expose a typed semantic API such as `name: 'map' | 'journal' | 'memories' | 'calendar' | 'star' | 'camera' | 'badge' | 'pin'`. Internally map to copied assets or locally registered Iconify names. Render inside a stable square inline box; if decorative, use empty `alt` or `aria-hidden`; if meaningful, require `label`.

---

### `apps/web/src/lib/icons/registry.ts` and `semantic-icons.ts` (utility, transform)

**Analogs:** `apps/web/src/services/api/client.ts`, `apps/web/src/services/timeline.ts`

**Small typed module pattern** (`api/client.ts` lines 1-8, 10-18, 30-39):

```ts
const DEFAULT_API_BASE_URL = '/api'

export function createApiUrl(path: string) {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${baseUrl}${normalizedPath}`
}

type ApiClientUnauthorizedCode = 'session-unauthorized' | 'auth-submit-unauthorized'

export function isUnauthorizedApiClientError(error: unknown): error is ApiClientError {
  return (
    error instanceof ApiClientError
    && (error.code === 'session-unauthorized' || error.code === 'auth-submit-unauthorized')
  )
}
```

**Typed interface/export pattern** (`timeline.ts` lines 3-19, 69-89):

```ts
export interface TimelineEntry {
  recordId: string
  placeId: string
  displayName: string
  tags: string[]
}

export function buildTimelineEntries(records: TravelRecord[]): TimelineEntry[] {
  const sortedEntries = records.map(toTimelineEntry).sort(compareTimelineEntries)
  return sortedEntries.map((entry) => ({ ...entry, visitOrdinal, visitCount }))
}
```

**Apply to Phase 42:** `semantic-icons.ts` should export a union type and readonly mapping. `registry.ts` should import `addIcon`/`addCollection` and register only the icons used by the semantic map. No component or page should pass raw Iconify ids.

---

### `apps/web/src/components/common/BaseChart.vue` (component, transform)

**Analogs:** `apps/web/src/views/StatisticsPageView.vue`, `apps/web/src/components/statistics/StatCard.vue`

**State derivation pattern** (`StatisticsPageView.vue` lines 15-38):

```ts
const { stats, isLoading, error } = storeToRefs(statsStore)

const shouldShowRestoringState = computed(() => isRestoring.value || isLoading.value)
const shouldShowEmptyState = computed(
  () =>
    status.value === 'authenticated'
    && !isLoading.value
    && error.value === null
    && (stats.value?.totalTrips ?? 0) === 0,
)
const shouldShowStats = computed(
  () =>
    status.value === 'authenticated'
    && !isLoading.value
    && error.value === null
    && (stats.value?.totalTrips ?? 0) > 0,
)
```

**Loading/empty/error surface pattern** (`StatisticsPageView.vue` lines 152-178, 206-256):

```vue
<div v-if="shouldShowRestoringState" data-state="restoring" aria-live="polite">
  <div class="h-4 w-32 rounded-full bg-white/90"></div>
</div>

<div v-else-if="error !== null && !isLoading" data-state="error">
  <h3 class="text-xl font-semibold text-[var(--color-ink-strong)]">统计数据加载失败</h3>
  <p class="text-sm leading-6 text-[var(--color-ink-muted)]">
    无法获取旅行统计，请稍后重试。
  </p>
</div>

<div v-else-if="shouldShowEmptyState" data-state="empty">
  <h3 class="text-xl font-semibold text-[var(--color-ink-strong)]">还没有旅行数据</h3>
</div>
```

**Card container pattern** (`StatCard.vue` lines 12-17):

```vue
<article
  class="grid gap-3 rounded-[28px] border border-white/80 p-5 shadow-[var(--shadow-float)]"
  :style="{ background: gradient }"
  data-region="stat-card"
>
```

**Apply to Phase 42:** `BaseChart` should accept `option`, `loading`, `empty`, `error`, and sizing props. It should render passed ECharts options only, import `@/lib/charts/register`, use `theme="yume-kawaii"`, enable `autoresize`, and enforce a nonzero min height so ECharts does not render blank.

---

### `apps/web/src/lib/charts/register.ts` and `theme.ts` (config/utility, transform)

**Analogs:** `apps/web/src/main.ts`, `apps/web/src/styles/tokens.css`

**Central one-time import/init pattern** (`apps/web/src/main.ts` lines 1-9):

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@fontsource-variable/nunito'
import App from './App.vue'
import router from './router'
import './style.css'

createApp(App).use(createPinia()).use(router).mount('#app')
```

**Theme token source pattern** (`tokens.css` lines 39-48, 52-54, 71-82):

```css
--color-accent: #f48fb1;
--color-accent-strong: #ff78ad;
--color-secondary: #84c7d8;
--color-lilac: #dbc4ff;
--color-mint: #d8f6e8;
--color-destructive: #c86464;
--color-ink-strong: #57425f;
--color-ink-muted: #7f6a86;
--shadow-surface:
  0 20px 40px rgba(168, 121, 165, 0.16),
  0 6px 14px rgba(114, 152, 180, 0.08);
```

**Apply to Phase 42:** `register.ts` should be a side-effect module that registers ECharts modules and `registerTheme('yume-kawaii', theme)`. `theme.ts` should export the chart palette derived from UI-SPEC and `tokens.css`; keep chart registration centralized and avoid full `echarts` imports unless justified.

---

### `apps/web/src/views/UiShowcaseView.vue` (component, request-response)

**Analog:** `apps/web/src/views/TimelinePageView.vue`

**Thin route-level view imports and computed state pattern** (lines 1-25):

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import TimelineVisitCard from '../components/timeline/TimelineVisitCard.vue'
import { useAuthSessionStore } from '../stores/auth-session'
import { useMapPointsStore } from '../stores/map-points'

const authSessionStore = useAuthSessionStore()
const mapPointsStore = useMapPointsStore()

const { currentUser, status } = storeToRefs(authSessionStore)
const { timelineEntries } = storeToRefs(mapPointsStore)

const shouldShowTimeline = computed(
  () => status.value === 'authenticated' && timelineEntries.value.length > 0,
)
</script>
```

**Route shell pattern** (lines 28-67):

```vue
<template>
  <section
    class="flex min-h-0 flex-col gap-5 overflow-y-auto rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,248,251,0.94))] p-5 shadow-[var(--shadow-stage)] md:gap-6 md:p-6"
    data-route-view="timeline"
  >
    <header
      class="grid gap-4 rounded-[28px] border border-white/85 bg-white/70 p-4 shadow-[var(--shadow-float)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-5"
    >
      ...
    </header>
  </section>
</template>
```

**Apply to Phase 42:** `UiShowcaseView` should stay a thin route composition surface. Move large matrices into `apps/web/src/components/showcase/*`. It must not use real travel data; chart examples must be labeled demo-only.

---

### `apps/web/src/components/showcase/*` (component, event-driven)

**Analog:** `apps/web/src/views/StatisticsPageView.vue`

**State matrix pattern** (lines 152-178, 180-256, 258-296):

```vue
<div v-if="shouldShowRestoringState" data-state="restoring" aria-live="polite">
  ...
</div>

<div v-else-if="shouldShowAnonymousState" data-state="anonymous">
  ...
</div>

<div v-else-if="error !== null && !isLoading" data-state="error">
  ...
</div>

<div v-else-if="shouldShowEmptyState" data-state="empty">
  ...
</div>

<div v-else-if="shouldShowStats" class="grid gap-4" data-state="populated">
  ...
</div>
```

**Interactive examples pattern** (`AuthDialog.vue` lines 176-214, `ConfirmDialog.vue` lines 60-82):

```vue
<button
  type="button"
  role="tab"
  :aria-selected="activeMode === 'login'"
  @click="switchMode('login')"
>
  登录
</button>

<button type="button" data-confirm-dialog-confirm @click="emit('confirm')">
  {{ confirmLabel }}
</button>
```

**Apply to Phase 42:** showcase sections should cover default, disabled, loading/skeleton, focus-visible, destructive/error, and open states. Dialog, Popover, Dropdown, and Calendar examples must be operable and test-addressable through `data-testid` or existing `data-*` conventions.

---

### `apps/web/src/router/index.ts` (route, request-response)

**Analog:** `apps/web/src/router/index.ts`

**Route table pattern** (lines 1-7, 8-32):

```ts
import { createRouter, createWebHistory } from 'vue-router'

import MapHomeView from '../views/MapHomeView.vue'
import StatisticsPageView from '../views/StatisticsPageView.vue'
import TimelinePageView from '../views/TimelinePageView.vue'
import { useAuthSessionStore } from '../stores/auth-session'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'map-home',
      component: MapHomeView,
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: StatisticsPageView,
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})
```

**Guard pattern** (lines 35-47):

```ts
router.beforeEach(async (to) => {
  const authSessionStore = useAuthSessionStore()

  if (authSessionStore.status === 'restoring') {
    await authSessionStore.restoreSession()
  }

  if (to.meta.requiresAuth && authSessionStore.status !== 'authenticated') {
    return { path: '/' }
  }

  return true
})
```

**Apply to Phase 42:** add `/__ui` before the catch-all route. Use a route-level guard like `beforeEnter: () => (import.meta.env.DEV ? true : { path: '/' })`. Do not add it to product navigation and do not require auth.

---

### Phase 42 smoke tests (test, event-driven)

**Analogs:** `AuthDialog.spec.ts`, `ConfirmDialog.spec.ts`, `router/index.spec.ts`, `tailwind-token.spec.ts`, `StatCard.spec.ts`

**Component mount with Pinia pattern** (`AuthDialog.spec.ts` lines 9-31):

```ts
function mountDialog(
  setup?: (authSessionStore: ReturnType<typeof useAuthSessionStore>) => void,
) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authSessionStore = useAuthSessionStore()
  authSessionStore.isAuthModalOpen = true
  setup?.(authSessionStore)

  const wrapper = mount(AuthDialog, {
    attachTo: document.body,
    global: {
      plugins: [pinia],
    },
  })

  return { authSessionStore, wrapper }
}
```

**Interaction smoke pattern** (`ConfirmDialog.spec.ts` lines 33-58, 61-75):

```ts
it('emits confirm when confirm button is clicked', async () => {
  const wrapper = mount(ConfirmDialog, {
    props: {
      isOpen: true,
      title: '确认操作',
      message: '确认执行此操作？',
    },
  })

  await wrapper.get('[data-confirm-dialog-confirm]').trigger('click')

  expect(wrapper.emitted('confirm')).toHaveLength(1)
})
```

**Router guard test pattern** (`router/index.spec.ts` lines 7-24, 55-70):

```ts
describe('router auth guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    router.push('/')
  })

  it('redirects anonymous user from /timeline to /', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'anonymous'
    authSessionStore.currentUser = null

    await router.push('/timeline')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/')
  })
})
```

**CSS/source contract test pattern** (`tailwind-token.spec.ts` lines 41-88, 90-106):

```ts
const styleSource = readWebFile('src/style.css')
const mainSource = readWebFile('src/main.ts')

expect(styleSource).toContain('@import "tailwindcss";')
expect(styleSource).toContain("@import './styles/tokens.css';")
expect(mainSource).toContain("import './style.css'")

const tokensSource = readWebFile('src/styles/tokens.css')
expect(tokensSource).toContain('--font-family-body:')
expect(globalSource).toContain('font-family: var(--font-family-body);')
```

**Simple presentational component test pattern** (`StatCard.spec.ts` lines 6-18, 20-31):

```ts
describe('StatCard', () => {
  it('renders label correctly', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: '总旅行次数',
        value: 42,
        unit: '次旅行',
        gradient: 'linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,246,250,0.94))',
      },
    })

    expect(wrapper.find('[data-stat="label"]').text()).toBe('总旅行次数')
  })
})
```

**Apply to Phase 42:** add focused smoke specs for `UiShowcaseView`, `UiPrimitiveShowcase`, `KawaiiIcon`, and `BaseChart`. Use `global.stubs: { Teleport: true }` or `attachTo: document.body` for generated overlay primitives. Avoid snapshots-only tests; assert behavior and `data-*` states.

## Shared Patterns

### Vue SFC Structure

**Source:** `apps/web/src/components/statistics/StatCard.vue`, `apps/web/src/views/TimelinePageView.vue`

**Apply to:** all new `.vue` files.

```vue
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
}

defineProps<Props>()
</script>

<template>
  <section data-region="...">
    ...
  </section>
</template>
```

Keep `<script setup lang="ts">` first, then `<template>`, then optional `<style scoped>`.

### Props, Emits, and Typed Contracts

**Source:** `apps/web/src/components/timeline/ConfirmDialog.vue` lines 1-20 and `apps/web/src/components/map-popup/TripDateForm.vue` lines 8-19.

```ts
interface Props {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: '确认',
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
```

Use typed unions for semantic icon names and explicit state props for `BaseChart`.

### Yume Kawaii Surface Language

**Source:** `apps/web/src/styles/tokens.css` lines 33-112, `PointSummaryCard.vue` lines 152-173, `AuthDialog.vue` lines 143-155.

```css
--color-surface-raised: rgba(255, 253, 255, 0.86);
--color-accent: #f48fb1;
--color-frame: #d8bdd9;
--color-ink-strong: #57425f;
--radius-card: 28px;
--radius-bubble: 32px;
--shadow-stage:
  0 30px 60px rgba(166, 116, 159, 0.18),
  0 14px 30px rgba(104, 159, 192, 0.12);
```

```vue
class="rounded-[32px] border border-white/85 bg-[var(--color-surface)]/96 text-[var(--color-ink-strong)] shadow-[var(--shadow-stage)] backdrop-blur-xl"
```

Generated primitive defaults should be edited to this token language.

### Loading, Empty, and Error States

**Source:** `apps/web/src/views/StatisticsPageView.vue` lines 20-38 and 152-256.

```ts
const shouldShowRestoringState = computed(() => isRestoring.value || isLoading.value)
const shouldShowEmptyState = computed(
  () => status.value === 'authenticated' && !isLoading.value && error.value === null,
)
const shouldShowStats = computed(
  () => status.value === 'authenticated' && !isLoading.value && error.value === null,
)
```

```vue
<div v-if="shouldShowRestoringState" data-state="restoring" aria-live="polite">...</div>
<div v-else-if="error !== null && !isLoading" data-state="error">...</div>
<div v-else-if="shouldShowEmptyState" data-state="empty">...</div>
```

Apply to `BaseChart` and `/__ui` state matrices.

### Accessibility and Focus

**Source:** `AuthDialog.vue` lines 111-127, `PointSummaryCard.vue` lines 540-564, `MapContextPopup.vue` lines 86-108.

```ts
watch(
  isAuthModalOpen,
  async (open) => {
    if (open) {
      lastFocusedElement.value =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      await nextTick()
      focusFirstField(activeMode.value)
      return
    }

    await nextTick()
    restoreTriggerFocus()
  },
)
```

```css
.point-summary-card__illuminate-btn:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 72%, white 28%);
  outline-offset: 3px;
}
```

```vue
<aside role="dialog" aria-modal="false" :aria-labelledby="popupTitleId">
  <h2 :id="popupTitleId" class="sr-only" tabindex="-1">{{ popupTitle }}</h2>
</aside>
```

### Test Conventions

**Source:** `apps/web/vitest.config.ts` lines 5-19 and existing specs.

```ts
const cliSpecFilters = process.argv.filter((argument) => argument.endsWith('.spec.ts'))

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: cliSpecFilters.length > 0
      ? cliSpecFilters
      : ['src/**/*.spec.ts'],
  }
}))
```

Use `mount`, `trigger`, `setValue`, `flushPromises`, Pinia setup helpers, and `data-*` selectors. Keep smoke tests black-box and behavior-focused.

## No Analog Found

No file group is completely unmapped. The rows below have no exact same-purpose implementation in the current codebase, so planner should combine the partial local patterns above with `42-RESEARCH.md` implementation examples.

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `apps/web/components.json` | config | batch | No existing shadcn-vue config exists. |
| `apps/web/src/components/ui/*` | component | event-driven / transform | No generated primitive layer exists yet. Existing business components provide visual and test patterns only. |
| `apps/web/src/lib/icons/registry.ts` | utility | transform | No local Iconify registry or icon whitelist exists. |
| `apps/web/src/components/common/KawaiiIcon.vue` | component | transform | No unified icon wrapper exists; use semantic props + accessibility patterns from existing components. |
| `apps/web/src/lib/charts/register.ts` | config | transform | No ECharts/vue-echarts integration exists. |
| `apps/web/src/lib/charts/theme.ts` | utility | transform | No chart theme module exists; derive from UI-SPEC and `tokens.css`. |
| `apps/web/src/components/common/BaseChart.vue` | component | transform | No chart component exists; reuse Statistics state handling and StatCard surface pattern. |

## Metadata

**Analog search scope:** `apps/web/package.json`, `apps/web/vite.config.ts`, `apps/web/tsconfig.json`, `apps/web/vitest.config.ts`, `apps/web/src/router`, `apps/web/src/views`, `apps/web/src/components`, `apps/web/src/services`, `apps/web/src/styles`, `apps/web/src/**/*.spec.ts`.

**Files scanned:** 100+ `apps/web` tracked source/config files via `rg --files`, plus targeted reads of 28 source/config/test files.

**Pattern extraction date:** 2026-05-11.
