# Phase 43: Landing、登录门禁与应用壳 - Pattern Map

**Mapped:** 2026-05-12  
**Files analyzed:** 22 source/test files + 4 asset copies  
**Analogs found:** 26 / 26

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `apps/web/src/assets/v8/landing/landing-upper-bg.png` | asset | file-I/O | `prd/v8.0/切图/落地页上半背景.png` + `prd/v8.0/ASSET-MANIFEST.md` | exact-source |
| `apps/web/src/assets/v8/landing/landing-lower-bg.png` | asset | file-I/O | `prd/v8.0/切图/落地页下半背景.png` + `prd/v8.0/ASSET-MANIFEST.md` | exact-source |
| `apps/web/src/assets/v8/shell/default-avatar.png` | asset | file-I/O | `prd/v8.0/ASSET-MANIFEST.md` user avatar guidance | role-match |
| `apps/web/src/assets/v8/shell/sidebar-illustration.png` | asset | file-I/O | `prd/v8.0/ASSET-MANIFEST.md` sidebar character guidance | role-match |
| `apps/web/src/views/LandingPageView.vue` | component/view | event-driven, file-I/O | `apps/web/src/views/TimelinePageView.vue` | role-match |
| `apps/web/src/components/landing/LandingPage.vue` | component | event-driven, file-I/O | `apps/web/src/views/TimelinePageView.vue` + `apps/web/src/components/auth/AuthDialog.vue` | role-match |
| `apps/web/src/components/landing/LandingHero.vue` | component | event-driven, file-I/O | `apps/web/src/components/showcase/UiPrimitiveShowcase.vue` + asset guide | partial |
| `apps/web/src/components/landing/LandingTreasurePanel.vue` | component | transform/render | `apps/web/src/views/TimelinePageView.vue` | partial |
| `apps/web/src/components/shell/AuthenticatedAppShell.vue` | component/layout | request-response, slot-render | `apps/web/src/components/ui/sidebar/SidebarProvider.vue` + `Sidebar.vue` | role-match |
| `apps/web/src/components/shell/ShellSidebar.vue` | component/navigation | event-driven, request-response | `apps/web/src/components/auth/AuthTopbarControl.vue` + `KawaiiIcon.vue` | role-match |
| `apps/web/src/router/index.ts` | route/config | request-response | `apps/web/src/router/index.ts` | exact |
| `apps/web/src/App.vue` | component/root provider | event-driven, request-response | `apps/web/src/App.vue` | exact |
| `apps/web/src/components/auth/AuthDialog.vue` | component/form | request-response, event-driven | `apps/web/src/components/auth/AuthDialog.vue` + `AuthTopbarControl.vue` | exact |
| `apps/web/src/components/auth/AuthTopbarControl.vue` | component/cleanup | event-driven | `apps/web/src/components/auth/AuthTopbarControl.vue` | exact |
| `apps/web/src/views/MapHomeView.vue` | component/view | request-response | `apps/web/src/views/MapHomeView.vue` | exact |
| `apps/web/src/views/TimelinePageView.vue` | component/view | transform/render | `apps/web/src/views/TimelinePageView.vue` | exact |
| `apps/web/src/views/StatisticsPageView.vue` | component/view | CRUD/read, transform/render | `apps/web/src/views/StatisticsPageView.vue` | exact |
| `apps/web/src/views/LandingPageView.spec.ts` | test | event-driven | `apps/web/src/views/TimelinePageView.spec.ts` | role-match |
| `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` | test | event-driven, request-response | `apps/web/src/components/auth/AuthTopbarControl.spec.ts` + `App.spec.ts` | role-match |
| `apps/web/src/router/index.spec.ts` | test | request-response | `apps/web/src/router/index.spec.ts` | exact |
| `apps/web/src/App.spec.ts` | test | request-response, event-driven | `apps/web/src/App.spec.ts` | exact |
| `apps/web/src/App.kawaii.spec.ts` | test | transform/render | `apps/web/src/App.kawaii.spec.ts` | exact |
| `apps/web/src/components/auth/AuthDialog.spec.ts` | test | request-response | `apps/web/src/components/auth/AuthDialog.spec.ts` | exact |
| `apps/web/src/components/auth/AuthTopbarControl.spec.ts` | test/cleanup | event-driven | `apps/web/src/components/auth/AuthTopbarControl.spec.ts` | exact |
| `apps/web/src/views/TimelinePageView.spec.ts` | test | transform/render | `apps/web/src/views/TimelinePageView.spec.ts` | exact |
| `apps/web/src/views/StatisticsPageView.spec.ts` | test | CRUD/read, transform/render | `apps/web/src/views/StatisticsPageView.spec.ts` | exact |

## Pattern Assignments

### `apps/web/src/assets/v8/landing/landing-upper-bg.png` (asset, file-I/O)

**Analog:** `prd/v8.0/切图/落地页上半背景.png`

**Asset handling pattern** (`prd/v8.0/ASSET-MANIFEST.md` lines 15-28):
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

**Do not bake UI/text into images** (`prd/v8.0/ASSET-MANIFEST.md` lines 85-95):
```markdown
| 按钮、卡片、弹窗背景 | 需要响应式、状态、焦点和真实文本 | CSS + shadcn-vue |
| 文字、数字、日期 | 需要真实数据、可访问性和国际化 | HTML 文本 |
| 整张页面截图 | 不能适配数据和屏幕尺寸 | 只作为视觉参考 |
```

**Apply to:** copy the upper landing background into an English kebab-case path and import it from Vue/CSS; landing CTA/title text remains DOM.

---

### `apps/web/src/assets/v8/landing/landing-lower-bg.png` (asset, file-I/O)

**Analog:** `prd/v8.0/切图/落地页下半背景.png`

**Same pattern as:** `landing-upper-bg.png`.

**Cutting rule** (`prd/v8.0/CUTTING-GUIDE.md` lines 8-9):
```markdown
不要直接把完整页面截图塞进前端当背景。那样看起来接近，但页面会失去真实交互、响应式和数据绑定。
```

**Apply to:** use the required lower landing background slice as decorative scene art, not as a replacement for real route content.

---

### `apps/web/src/assets/v8/shell/default-avatar.png` (asset, file-I/O)

**Analog:** `prd/v8.0/ASSET-MANIFEST.md`

**Avatar source pattern** (lines 36-43):
```markdown
| `char-sidebar-camera` | `characters/sidebar-camera-girl.webp` | `世界足迹.png` | P0 | 高 320-430px，透明 WebP/PNG | 世界足迹侧边栏底部坐姿少女，适合地图页。 |
| `char-sidebar-journal` | `characters/sidebar-journal-girl.webp` | `旅途手帐.png` 或 `旅途回忆.png` | P0 | 高 320-430px，透明 WebP/PNG | 手账/回忆页侧边栏底部拿手账少女。 |
| `char-user-avatar` | `characters/user-avatar.webp` | `世界足迹.png` / `旅途手帐.png` | P1 | 256 x 256，圆形友好 | 用户卡片头像，可保留圆形底。 |
```

**Quality checklist** (`prd/v8.0/CUTTING-GUIDE.md` lines 222-232):
```markdown
- [ ] 透明背景干净，没有白色矩形底。
- [ ] 发丝、猫耳、花草边缘没有明显锯齿。
- [ ] 没有把页面文字、按钮、图表误切进来。
- [ ] 画布四周有足够留白，hover 放大不会裁边。
- [ ] 文件名符合 `ASSET-MANIFEST.md`。
```

**Apply to:** `ShellSidebar.vue` should import this as the default avatar, while keeping the data shape ready for a future user avatar URL.

---

### `apps/web/src/assets/v8/shell/sidebar-illustration.png` (asset, file-I/O)

**Analog:** `prd/v8.0/ASSET-MANIFEST.md`

**Sidebar illustration guidance** (lines 41-43):
```markdown
| `char-sidebar-camera` | `characters/sidebar-camera-girl.webp` | `世界足迹.png` | P0 | 高 320-430px，透明 WebP/PNG | 世界足迹侧边栏底部坐姿少女，适合地图页。 |
| `char-sidebar-journal` | `characters/sidebar-journal-girl.webp` | `旅途手帐.png` 或 `旅途回忆.png` | P0 | 高 320-430px，透明 WebP/PNG | 手账/回忆页侧边栏底部拿手账少女。 |
```

**Apply to:** use one reliable illustration across all authenticated routes; do not switch per route and do not add collection/future placeholders.

---

### `apps/web/src/views/LandingPageView.vue` (component/view, event-driven + file-I/O)

**Analog:** `apps/web/src/views/TimelinePageView.vue`

**Imports pattern** (lines 1-8):
```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import TimelineVisitCard from '../components/timeline/TimelineVisitCard.vue'
import { useAuthSessionStore } from '../stores/auth-session'
import { useMapPointsStore } from '../stores/map-points'
```

**View state pattern** (lines 16-25):
```ts
const isRestoring = computed(() => status.value === 'restoring')
const shouldShowAnonymousState = computed(
  () => status.value !== 'authenticated' || currentUser.value === null,
)
const shouldShowEmptyState = computed(
  () => status.value === 'authenticated' && timelineEntries.value.length === 0,
)
```

**Landing CTA auth trigger pattern** (lines 110-116):
```vue
<button
  type="button"
  class="inline-flex min-h-11 items-center justify-center rounded-full border border-[#f4d7e4] bg-[linear-gradient(135deg,rgba(255,232,242,0.96),rgba(255,246,250,0.96))] px-5 py-2 text-sm font-semibold text-[var(--color-accent-strong)] shadow-[0_14px_28px_rgba(244,143,177,0.28)] transition duration-[var(--motion-quick)] hover:-translate-y-0.5"
  @click="authSessionStore.openAuthModal('login')"
>
  立即登录
</button>
```

**Apply to:** keep the route view thin. It should compose `LandingPage` and wire `openAuthModal('register' | 'login')`; major scene markup belongs under `components/landing`.

---

### `apps/web/src/components/landing/LandingPage.vue` (component, event-driven + file-I/O)

**Analog:** `apps/web/src/components/auth/AuthDialog.vue` + `TimelinePageView.vue`

**Store action import pattern** (`AuthDialog.vue` lines 1-13):
```vue
<script setup lang="ts">
import type { LoginRequest, RegisterRequest } from '@trip-map/contracts'
import { storeToRefs } from 'pinia'
import { computed, nextTick, reactive, shallowRef, useTemplateRef, watch } from 'vue'

import { ApiClientError } from '../../services/api/client'
import { useAuthSessionStore } from '../../stores/auth-session'

const authSessionStore = useAuthSessionStore()
const { authMode, isAuthModalOpen, isSubmitting } = storeToRefs(authSessionStore)
const { closeAuthModal, login, openAuthModal, register } = authSessionStore
```

**Accessible DOM controls pattern** (`AuthDialog.vue` lines 182-213):
```vue
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
<button
  id="auth-tab-register"
  type="button"
  role="tab"
  :aria-selected="activeMode === 'register'"
  aria-controls="auth-panel-register"
  @click="switchMode('register')"
>
  注册
</button>
```

**Apply to:** CTA buttons use real `<button type="button">` with `data-auth-trigger="landing-register"` / `landing-login`; images are decorative with empty alt unless they convey content.

---

### `apps/web/src/components/landing/LandingHero.vue` (component, event-driven + file-I/O)

**Analog:** `apps/web/src/components/showcase/UiPrimitiveShowcase.vue`

**Alias/import pattern** (lines 1-11):
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
```

**As-child primitive pattern** (lines 57-72):
```vue
<Dialog>
  <DialogTrigger as-child>
    <Button data-testid="showcase-dialog-trigger">
      Open Dialog
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>This is a dialog for the showcase.</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

**Apply to:** use `@/...` aliases for copied assets/components where practical. Avoid image-only headings/buttons; keep hero title, supporting copy, and CTA as DOM.

---

### `apps/web/src/components/landing/LandingTreasurePanel.vue` (component, transform/render)

**Analog:** `apps/web/src/views/TimelinePageView.vue`

**Repeated render pattern** (lines 145-168):
```vue
<div v-else-if="shouldShowTimeline" class="grid gap-4" data-state="populated">
  <div
    class="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/80 bg-white/72 px-4 py-3 shadow-[var(--shadow-float)]"
  >
    <div class="space-y-1">
      <p class="text-sm font-semibold text-[var(--color-ink-strong)]">共 {{ timelineEntries.length }} 条旅行记录</p>
    </div>
  </div>

  <div class="grid gap-4 md:gap-5">
    <TimelineVisitCard
      v-for="entry in timelineEntries"
      :key="entry.recordId"
      :entry="entry"
    />
  </div>
</div>
```

**Apply to:** render landing panels from small arrays or props when repeated. Keep static product-copy panels DOM-based and testable.

---

### `apps/web/src/components/shell/AuthenticatedAppShell.vue` (component/layout, request-response + slot-render)

**Analog:** `apps/web/src/components/ui/sidebar/SidebarProvider.vue`, `Sidebar.vue`, `index.ts`

**Sidebar exports pattern** (`index.ts` lines 12-31):
```ts
export { default as Sidebar } from "./Sidebar.vue"
export { default as SidebarContent } from "./SidebarContent.vue"
export { default as SidebarFooter } from "./SidebarFooter.vue"
export { default as SidebarHeader } from "./SidebarHeader.vue"
export { default as SidebarInset } from "./SidebarInset.vue"
export { default as SidebarMenu } from "./SidebarMenu.vue"
export { default as SidebarMenuButton } from "./SidebarMenuButton.vue"
export { default as SidebarMenuItem } from "./SidebarMenuItem.vue"
export { default as SidebarProvider } from "./SidebarProvider.vue"
```

**Provider pattern** (`SidebarProvider.vue` lines 68-81):
```vue
<template>
  <TooltipProvider :delay-duration="0">
    <div
      data-slot="sidebar-wrapper"
      :style="{
        '--sidebar-width': SIDEBAR_WIDTH,
        '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
      }"
      :class="cn('group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full', props.class)"
      v-bind="$attrs"
    >
      <slot />
    </div>
  </TooltipProvider>
</template>
```

**No-collapse sidebar pattern** (`Sidebar.vue` lines 23-31):
```vue
<div
  v-if="collapsible === 'none'"
  data-slot="sidebar"
  :class="cn('bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col', props.class)"
  v-bind="$attrs"
>
  <slot />
</div>
```

**Apply to:** authenticated routes only. Compose:
```vue
<SidebarProvider class="bg-transparent" style="--sidebar-width: 18rem;">
  <Sidebar collapsible="none" class="border-r border-white/70 bg-white/84">
    <ShellSidebar />
  </Sidebar>
  <SidebarInset class="min-w-0 bg-transparent">
    <slot />
  </SidebarInset>
</SidebarProvider>
```

---

### `apps/web/src/components/shell/ShellSidebar.vue` (component/navigation, event-driven + request-response)

**Analog:** `apps/web/src/components/auth/AuthTopbarControl.vue`, `KawaiiIcon.vue`, `UiIconShowcase.vue`

**Auth/user/logout imports pattern** (`AuthTopbarControl.vue` lines 1-11):
```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, shallowRef, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthSessionStore } from '../../stores/auth-session'

const authSessionStore = useAuthSessionStore()
const { currentUser, isSubmitting, status } = storeToRefs(authSessionStore)
const { logout, openAuthModal } = authSessionStore
const router = useRouter()
```

**Logout handler pattern** (`AuthTopbarControl.vue` lines 46-49):
```ts
async function handleLogout() {
  closeMenu()
  await logout()
}
```

**Semantic nav icons pattern** (`UiIconShowcase.vue` lines 4-13):
```ts
const icons = [
  { name: 'map' as const, label: '世界足迹' },
  { name: 'journal' as const, label: '旅途手账' },
  { name: 'memories' as const, label: '旅途回忆' },
  { name: 'calendar' as const, label: '日历' },
]
```

**KawaiiIcon render pattern** (`KawaiiIcon.vue` lines 20-44):
```vue
<span
  data-kawaii-icon
  :data-icon-name="name"
  :style="{ width: `${size}px`, height: `${size}px`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }"
>
  <Icon
    :icon="entry.icon"
    :width="size"
    :height="size"
    :aria-hidden="decorative ? 'true' : undefined"
    :aria-label="!decorative && label ? label : undefined"
  />
</span>
```

**Sidebar menu button active pattern** (`SidebarMenuButtonChild.vue` lines 23-35):
```vue
<Primitive
  data-slot="sidebar-menu-button"
  data-sidebar="menu-button"
  :data-size="size"
  :data-active="isActive"
  :class="cn(sidebarMenuButtonVariants({ variant, size }), props.class)"
  :as="as"
  :as-child="asChild"
  v-bind="$attrs"
>
  <slot />
</Primitive>
```

**Apply to:** nav entries are exactly:
```ts
const navItems = [
  { to: '/map', label: '世界足迹', icon: 'map' as const },
  { to: '/journal', label: '旅途手账', icon: 'journal' as const },
  { to: '/memories', label: '旅途回忆', icon: 'memories' as const },
]
```
Use `RouterLink`, `SidebarMenuButton as-child`, and `:is-active`/`:data-active` from current route. After `await logout()`, route to `/`.

---

### `apps/web/src/router/index.ts` (route/config, request-response)

**Analog:** `apps/web/src/router/index.ts`

**Imports pattern** (lines 1-6):
```ts
import { createRouter, createWebHistory } from 'vue-router'

import MapHomeView from '../views/MapHomeView.vue'
import StatisticsPageView from '../views/StatisticsPageView.vue'
import TimelinePageView from '../views/TimelinePageView.vue'
import { useAuthSessionStore } from '../stores/auth-session'
```

**Current route definition pattern to replace** (lines 8-38):
```ts
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'map-home',
      component: MapHomeView,
    },
    {
      path: '/timeline',
      name: 'timeline',
      component: TimelinePageView,
      meta: { requiresAuth: true },
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: StatisticsPageView,
      meta: { requiresAuth: true },
    },
  ],
})
```

**Async auth guard pattern** (lines 41-52):
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

**Apply to:** define `/` as `LandingPageView`, `/map` as protected `MapHomeView`, `/journal` as protected `TimelinePageView`, `/memories` as protected `StatisticsPageView`, keep `/__ui`, catch-all to `/`. Add root authenticated redirect after restore:
```ts
if (to.path === '/' && authSessionStore.status === 'authenticated') {
  return { path: '/map', replace: true }
}
```

---

### `apps/web/src/App.vue` (component/root provider, event-driven + request-response)

**Analog:** `apps/web/src/App.vue`

**Root imports/setup pattern** (lines 1-29):
```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, watch } from 'vue'
import { RouterView } from 'vue-router'

import AuthDialog from './components/auth/AuthDialog.vue'
import LocalImportDecisionDialog from './components/auth/LocalImportDecisionDialog.vue'
import AuthTopbarControl from './components/auth/AuthTopbarControl.vue'
import { useAuthSessionStore } from './stores/auth-session'
import { useMapUiStore } from './stores/map-ui'

const authSessionStore = useAuthSessionStore()
const mapUiStore = useMapUiStore()
const { interactionNotice } = storeToRefs(mapUiStore)
```

**Restore and foreground refresh pattern** (lines 48-61, 75-93):
```ts
onMounted(() => {
  void restoreSession()
  window.addEventListener('focus', handleWindowFocus)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

function triggerForegroundRefresh() {
  if (status.value !== 'authenticated') {
    return
  }

  void refreshAuthenticatedSnapshot()
}
```

**Overlay/dialog composition pattern** (lines 131-154):
```vue
<div
  v-if="interactionNotice"
  class="fixed left-1/2 top-[4.25rem] z-[5] w-[28rem] max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full border border-white/80 bg-white/82 px-4 py-3 text-center text-sm text-[var(--color-ink-strong)] shadow-[var(--shadow-float)] backdrop-blur-xl md:top-[4.75rem]"
  role="status"
  aria-live="polite"
>
  {{ interactionNotice.message }}
</div>
<RouterView />
<LocalImportDecisionDialog
  :decision="pendingLocalImportDecision"
  :summary="localImportSummary"
  :submitting="isSubmitting"
  @import="handleImportLocalRecords"
  @keep-cloud="handleKeepCloudRecords"
  @dismiss-summary="handleDismissLocalImportSummary"
/>
<AuthDialog />
```

**Apply to:** branch app shell by current route/auth boundary. Landing `/` must not be inside `AuthenticatedAppShell`; protected routes should render inside it. Keep `AuthDialog`, `LocalImportDecisionDialog`, and global notices outside the sidebar slot.

---

### `apps/web/src/components/auth/AuthDialog.vue` (component/form, request-response + event-driven)

**Analog:** `apps/web/src/components/auth/AuthDialog.vue`

**Form state and validation pattern** (lines 19-31, 78-94):
```ts
const REGISTER_USERNAME_MIN_LENGTH = 2
const REGISTER_USERNAME_MAX_LENGTH = 32

const loginForm = reactive<LoginRequest>({
  email: '',
  password: '',
})

const registerForm = reactive<RegisterRequest>({
  username: '',
  email: '',
  password: '',
})

const normalizedUsername = registerForm.username.trim()

if (normalizedUsername.length < REGISTER_USERNAME_MIN_LENGTH) {
  submitError.value = '用户名至少需要 2 个字符。'
  return
}
```

**Submit and error handling pattern** (lines 68-108):
```ts
async function handleSubmit() {
  resetSubmitError()

  try {
    if (activeMode.value === 'login') {
      await login({
        email: loginForm.email,
        password: loginForm.password,
      })
    } else {
      await register({
        username: normalizedUsername,
        email: registerForm.email,
        password: registerForm.password,
      })
    }

    closeAuthModal()
  } catch (error) {
    if (error instanceof ApiClientError) {
      submitError.value =
        activeMode.value === 'login'
          ? '登录失败，请检查邮箱和密码后重试。'
          : '创建账号失败，请稍后重试。'
      return
    }

    submitError.value = '请求暂时没有成功，请稍后再试。'
  }
}
```

**Router navigation source pattern** (`AuthTopbarControl.vue` lines 4-11):
```ts
import { useRouter } from 'vue-router'

const router = useRouter()
```

**Apply to:** after successful `login()` or `register()`, close modal and `await router.replace('/map')`. Do not preserve redirect intent.

---

### `apps/web/src/components/auth/AuthTopbarControl.vue` (component/cleanup, event-driven)

**Analog:** `apps/web/src/components/auth/AuthTopbarControl.vue`

**Old authenticated nav to remove/narrow** (lines 36-44, 137-174):
```ts
function handleNavigateToTimeline() {
  closeMenu()
  void router.push('/timeline')
}

function handleNavigateToStatistics() {
  closeMenu()
  void router.push('/statistics')
}
```

```vue
<button
  data-auth-menu-item="timeline"
  role="menuitem"
  @click="handleNavigateToTimeline"
>
  <span>时间轴</span>
</button>
<button
  data-auth-menu-item="statistics"
  role="menuitem"
  @click="handleNavigateToStatistics"
>
  <span>查看统计</span>
</button>
```

**Apply to:** do not keep this as the primary logged-in navigation. Planner can remove it from `App.vue`, delete/ignore its old route-menu assertions, or narrow it to an anonymous-only/auth utility if still referenced.

---

### `apps/web/src/views/MapHomeView.vue` (component/view, request-response)

**Analog:** `apps/web/src/views/MapHomeView.vue`

**Thin map view pattern** (lines 1-20):
```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'

import AuthRestoreOverlay from '../components/auth/AuthRestoreOverlay.vue'
import LeafletMapStage from '../components/LeafletMapStage.vue'
import { useAuthSessionStore } from '../stores/auth-session'

const authSessionStore = useAuthSessionStore()
const { status } = storeToRefs(authSessionStore)
</script>

<template>
  <section
    class="relative flex min-h-0 flex-col gap-4 overflow-hidden rounded-[32px] border border-white/80 bg-white/65 p-4 shadow-[var(--shadow-stage)] md:p-6"
    data-region="map-shell"
  >
    <LeafletMapStage class="min-h-0 flex-1" />
    <AuthRestoreOverlay :visible="status === 'restoring'" />
  </section>
</template>
```

**Apply to:** keep Leaflet behavior intact. Route migration should move this view to `/map` and update links/tests; avoid map feature rewrites in Phase 43.

---

### `apps/web/src/views/TimelinePageView.vue` (component/view, transform/render)

**Analog:** `apps/web/src/views/TimelinePageView.vue`

**State derivation pattern** (lines 13-25):
```ts
const { currentUser, status } = storeToRefs(authSessionStore)
const { timelineEntries } = storeToRefs(mapPointsStore)

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

**Route-facing copy/data attributes to migrate** (lines 29-46):
```vue
<section
  class="flex min-h-0 flex-col gap-5 overflow-y-auto rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,248,251,0.94))] p-5 shadow-[var(--shadow-stage)] md:gap-6 md:p-6"
  data-region="timeline-shell"
  data-route-view="timeline"
>
  <h2 class="text-[clamp(1.7rem,2.8vw,2.4rem)] font-semibold text-[var(--color-ink-strong)]">
    时间轴
  </h2>
</section>
```

**Apply to:** preserve timeline data behavior but migrate route-facing semantics to `journal`, visible title to `旅途手账`, and map links to `/map`.

---

### `apps/web/src/views/StatisticsPageView.vue` (component/view, CRUD/read + transform/render)

**Analog:** `apps/web/src/views/StatisticsPageView.vue`

**Imports/state pattern** (lines 1-18):
```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, shallowRef, watch } from 'vue'
import { RouterLink } from 'vue-router'

import StatCard from '../components/statistics/StatCard.vue'
import { useAuthSessionStore } from '../stores/auth-session'
import { useMapPointsStore } from '../stores/map-points'
import { useStatsStore } from '../stores/stats'

const authSessionStore = useAuthSessionStore()
const mapPointsStore = useMapPointsStore()
const statsStore = useStatsStore()

const { boundaryVersion, currentUser, status } = storeToRefs(authSessionStore)
const { travelRecords } = storeToRefs(mapPointsStore)
const { stats, isLoading, error } = storeToRefs(statsStore)
```

**Fetch/watch pattern** (lines 57-74):
```ts
function fetchStatsIfAuthenticated() {
  if (status.value === 'authenticated' && currentUser.value !== null) {
    void statsStore.fetchStatsData()
  }
}

onMounted(() => {
  fetchStatsIfAuthenticated()
})

watch(
  () => boundaryVersion.value,
  () => {
    pendingRefreshAfterLoad.value = false
    statsStore.reset()
    fetchStatsIfAuthenticated()
  },
)
```

**Route-facing copy/data attributes to migrate** (lines 111-129):
```vue
<section
  class="flex min-h-0 flex-col gap-5 overflow-y-auto rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,248,251,0.94))] p-5 shadow-[var(--shadow-stage)] md:gap-6 md:p-6"
  data-region="statistics-shell"
  data-route-view="statistics"
>
  <h2 class="text-[clamp(1.7rem,2.8vw,2.4rem)] font-semibold text-[var(--color-ink-strong)]">
    旅行统计
  </h2>
</section>
```

**Apply to:** preserve stats fetch/refetch behavior but migrate route-facing semantics to `memories`, visible title to `旅途回忆`, and map links to `/map`.

---

### `apps/web/src/views/LandingPageView.spec.ts` (test, event-driven)

**Analog:** `apps/web/src/views/TimelinePageView.spec.ts`

**Mount helper pattern** (lines 56-89):
```ts
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
  setup?.({
    authSessionStore,
    mapPointsStore,
  })

  const wrapper = mount(TimelinePageView, {
    global: {
      plugins: [pinia],
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  })

  return {
    authSessionStore,
    mapPointsStore,
    wrapper,
  }
}
```

**CTA test pattern** (lines 97-106):
```ts
it('renders login CTA for anonymous visitors', async () => {
  const { authSessionStore, wrapper } = mountTimelinePage()
  const openAuthModalSpy = vi.spyOn(authSessionStore, 'openAuthModal')

  await wrapper.get('button').trigger('click')
  await nextTick()

  expect(wrapper.get('[data-state="anonymous"]').text()).toContain('立即登录')
  expect(openAuthModalSpy).toHaveBeenCalledWith('login')
})
```

**Apply to:** assert anonymous `/` landing renders real DOM title/CTAs, register CTA calls `openAuthModal('register')`, login CTA calls `openAuthModal('login')`, and no authenticated shell/sidebar is rendered.

---

### `apps/web/src/components/shell/AuthenticatedAppShell.spec.ts` (test, event-driven + request-response)

**Analog:** `apps/web/src/components/auth/AuthTopbarControl.spec.ts` + `App.spec.ts`

**Auth component mount pattern** (`AuthTopbarControl.spec.ts` lines 27-47):
```ts
function mountControl(options?: {
  authenticated?: boolean
}) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authSessionStore = useAuthSessionStore()
  authSessionStore.status = options?.authenticated ? 'authenticated' : 'anonymous'
  authSessionStore.currentUser = options?.authenticated ? makeUser() : null

  const wrapper = mount(AuthTopbarControl, {
    global: {
      plugins: [pinia],
    },
  })

  return {
    authSessionStore,
    wrapper,
  }
}
```

**Menu/nav order assertion pattern** (`AuthTopbarControl.spec.ts` lines 89-104):
```ts
const menuItems = wrapper.findAll('[data-auth-menu-item]').map((item) =>
  item.attributes('data-auth-menu-item'),
)

expect(menuItems).toContain('timeline')
expect(menuItems).toContain('statistics')
expect(menuItems).toContain('logout')
expect(menuItems.indexOf('timeline')).toBeLessThan(menuItems.indexOf('logout'))
```

**App route shell assertion pattern** (`App.spec.ts` lines 354-376):
```ts
expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(true)
expect(wrapper.find('[data-region="map-shell"]').exists()).toBe(true)

await router.push('/timeline')
await flushPromises()

expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(false)
expect(wrapper.find('[data-region="map-shell"]').exists()).toBe(false)
expect(wrapper.find('[data-route-view="timeline"]').exists()).toBe(true)
```

**Apply to:** assert exactly three shell nav entries (`map`, `journal`, `memories`), correct labels, current-route active state, username/default avatar/illustration, no collection/stats/summary entries, and logout routes to `/`.

---

### `apps/web/src/router/index.spec.ts` (test, request-response)

**Analog:** `apps/web/src/router/index.spec.ts`

**Pinia/router reset pattern** (lines 32-37):
```ts
describe('router auth guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // 每次测试前重置 router 到首页，避免前一个测试污染
    router.push('/')
  })
```

**Anonymous protected redirect pattern** (lines 39-49):
```ts
it('redirects anonymous user from /timeline to /', async () => {
  const authSessionStore = useAuthSessionStore()
  authSessionStore.status = 'anonymous'
  authSessionStore.currentUser = null
  vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

  await router.push('/timeline')
  await router.isReady()

  expect(router.currentRoute.value.fullPath).toBe('/')
})
```

**Restoring guard test pattern** (lines 97-128):
```ts
authSessionStore.status = 'restoring'
authSessionStore.currentUser = null
vi.spyOn(authSessionStore, 'restoreSession').mockImplementation(async () => {
  authSessionStore.status = 'authenticated'
  authSessionStore.currentUser = {
    id: 'user-1',
    username: 'Alice',
    email: 'alice@example.com',
    createdAt: '2026-04-12T00:00:00.000Z',
  }
})

await router.push('/timeline')
await router.isReady()

expect(router.currentRoute.value.fullPath).toBe('/timeline')
```

**Apply to:** replace old `/timeline` and `/statistics` assertions with `/map`, `/journal`, `/memories`; add authenticated `/` -> `/map`; assert old paths fall through to `/` with no compatibility route names.

---

### `apps/web/src/App.spec.ts` (test, request-response + event-driven)

**Analog:** `apps/web/src/App.spec.ts`

**Memory router mount pattern** (lines 59-109):
```ts
async function mountApp(
  setup?: (authSessionStore: ReturnType<typeof useAuthSessionStore>) => void,
  route = '/',
) {
  const pinia = createPinia()
  const appRouter = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        name: 'map-home',
        component: MapHomeView,
      },
      {
        path: '/timeline',
        name: 'timeline',
        component: TimelinePageView,
      },
    ],
  })
  setActivePinia(pinia)

  const authSessionStore = useAuthSessionStore()
  setup?.(authSessionStore)

  const wrapper = mount(App, {
    global: {
      plugins: [pinia, appRouter],
    },
  })

  await appRouter.push(route)
  await appRouter.isReady()
  await flushPromises()

  return {
    authSessionStore,
    router: appRouter,
    wrapper,
  }
}
```

**Restore test pattern** (lines 127-137):
```ts
it('calls restoreSession exactly once on the first app mount', async () => {
  let restoreSessionSpy: ReturnType<typeof vi.spyOn>
  await mountApp((authSessionStore) => {
    authSessionStore.status = 'anonymous'
    restoreSessionSpy = vi
      .spyOn(authSessionStore, 'restoreSession')
      .mockResolvedValue(undefined)
  })

  expect(restoreSessionSpy!).toHaveBeenCalledTimes(1)
})
```

**Global notice timer pattern** (lines 394-432):
```ts
vi.useFakeTimers()
try {
  const mapUiStore = useMapUiStore()
  mapUiStore.setInteractionNotice({
    tone: 'info',
    message: '已同步到当前账号。',
  })
  await nextTick()

  vi.advanceTimersByTime(2600)
  await nextTick()

  expect(wrapper.text()).not.toContain('已同步到当前账号。')
} finally {
  vi.useRealTimers()
}
```

**Apply to:** update helper routes to `/`, `/map`, `/journal`, `/memories`; assert `/` landing is outside authenticated shell, app routes are inside `AuthenticatedAppShell`, `AuthDialog`/local import dialog remain mounted globally, and foreground refresh stays authenticated-only.

---

### `apps/web/src/App.kawaii.spec.ts` (test, transform/render)

**Analog:** `apps/web/src/App.kawaii.spec.ts`

**Source inspection pattern** (lines 160-181):
```ts
it('renders the interaction notice as a pill capsule with text interpolation only', async () => {
  const wrapper = await mountApp()
  const mapUiStore = useMapUiStore()

  mapUiStore.setInteractionNotice({
    tone: 'info',
    message: 'notice contract',
  })
  await nextTick()

  const notice = wrapper.get('[role="status"]')
  const source = readFileSync(resolve(process.cwd(), 'src/App.vue'), 'utf8')

  expect(notice.attributes('data-kawaii-notice')).toBe('pill')
  expect(notice.text()).toContain('notice contract')
  expect(source).toContain('{{ interactionNotice.message }}')
  expect(source).not.toContain('v-html')
})
```

**Apply to:** update visual contract tests to check landing uses DOM copy, not `v-html`, and authenticated shell uses sidebar data attributes instead of the old thin topbar contract.

---

### `apps/web/src/components/auth/AuthDialog.spec.ts` (test, request-response)

**Analog:** `apps/web/src/components/auth/AuthDialog.spec.ts`

**Mount pattern** (lines 9-31):
```ts
function mountDialog(
  setup?: (authSessionStore: ReturnType<typeof useAuthSessionStore>) => void,
) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authSessionStore = useAuthSessionStore()
  authSessionStore.isAuthModalOpen = true
  authSessionStore.authMode = 'login'
  setup?.(authSessionStore)

  const wrapper = mount(AuthDialog, {
    attachTo: document.body,
    global: {
      plugins: [pinia],
    },
  })

  return {
    authSessionStore,
    wrapper,
  }
}
```

**Successful login submit assertion** (lines 72-93):
```ts
it('calls login and closeAuthModal after a successful 登录 submit', async () => {
  const { wrapper } = mountDialog((authSessionStore) => {
    vi.spyOn(authSessionStore, 'login').mockResolvedValue(undefined)
    vi.spyOn(authSessionStore, 'closeAuthModal').mockImplementation(() => {
      authSessionStore.isAuthModalOpen = false
    })
  })
  const authSessionStore = useAuthSessionStore()
  const loginSpy = vi.mocked(authSessionStore.login)
  const closeAuthModalSpy = vi.mocked(authSessionStore.closeAuthModal)

  await wrapper.get('input[name="email"]').setValue('alice@example.com')
  await wrapper.get('input[name="password"]').setValue('super-secret')
  await wrapper.get('form').trigger('submit')
  await flushPromises()

  expect(loginSpy).toHaveBeenCalledWith({
    email: 'alice@example.com',
    password: 'super-secret',
  })
  expect(closeAuthModalSpy).toHaveBeenCalled()
})
```

**Failure stays open pattern** (lines 123-147):
```ts
await wrapper.get('form').trigger('submit')
await flushPromises()

expect(closeAuthModalSpy).not.toHaveBeenCalled()
expect(authSessionStore.isAuthModalOpen).toBe(true)
expect(wrapper.get('[role="alert"]').text()).toContain('登录失败')
```

**Apply to:** mock `useRouter` or mount with a router, then assert successful login/register calls `router.replace('/map')`; failure path must not navigate.

---

### `apps/web/src/components/auth/AuthTopbarControl.spec.ts` (test/cleanup, event-driven)

**Analog:** `apps/web/src/components/auth/AuthTopbarControl.spec.ts`

**Router mock pattern** (lines 8-16):
```ts
const { routerPushMock } = vi.hoisted(() => ({
  routerPushMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: routerPushMock,
  }),
}))
```

**Old assertions to replace/remove** (lines 55-72):
```ts
expect(anonymous.wrapper.find('[data-auth-menu-item="timeline"]').exists()).toBe(false)
expect(anonymous.wrapper.find('[data-auth-menu-item="statistics"]').exists()).toBe(false)

expect(authenticated.wrapper.find('[data-auth-menu-item="timeline"]').exists()).toBe(true)
expect(authenticated.wrapper.find('[data-auth-menu-item="statistics"]').exists()).toBe(true)
expect(authenticated.wrapper.get('[data-auth-menu-item="timeline"]').text()).toContain('时间轴')
expect(authenticated.wrapper.get('[data-auth-menu-item="statistics"]').text()).toContain('查看统计')
```

**Apply to:** if `AuthTopbarControl` remains, tests should assert it no longer exposes logged-in route navigation. If removed from App, planner can delete or rewrite these specs around new shell tests.

---

### `apps/web/src/views/TimelinePageView.spec.ts` (test, transform/render)

**Analog:** `apps/web/src/views/TimelinePageView.spec.ts`

**Current copy assertions to migrate** (lines 109-118):
```ts
it('renders empty state for authenticated users without records', () => {
  const { wrapper } = mountTimelinePage(({ authSessionStore }) => {
    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = makeUser()
  })

  expect(wrapper.get('[data-state="empty"]').text()).toContain('你的时间轴还是空白的')
  expect(wrapper.text()).toContain('去地图添加旅行')
  expectNoMapStage(wrapper)
})
```

**Populated data assertion pattern** (lines 134-150):
```ts
const cards = wrapper.findAll('[data-region="timeline-entry"]')
const beijingCards = cards.filter((card) =>
  card.text().includes(PHASE12_RESOLVED_BEIJING.displayName),
)

expect(wrapper.get('[data-state="populated"]').text()).toContain('共 2 条旅行记录')
expect(cards).toHaveLength(2)
expect(beijingCards).toHaveLength(2)
expect(cards[0].text()).toContain('第 1 次 / 共 2 次')
```

**Apply to:** preserve behavior assertions but update visible copy and route-facing data attributes to `旅途手账` / `journal`.

---

### `apps/web/src/views/StatisticsPageView.spec.ts` (test, CRUD/read + transform/render)

**Analog:** `apps/web/src/views/StatisticsPageView.spec.ts`

**API mock pattern** (lines 14-20):
```ts
const { fetchStatsMock } = vi.hoisted(() => ({
  fetchStatsMock: vi.fn(),
}))

vi.mock('../services/api/stats', () => ({
  fetchStats: fetchStatsMock,
}))
```

**Mount helper pattern** (lines 57-90):
```ts
function mountStatisticsPage(
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
  setup?.({
    authSessionStore,
    mapPointsStore,
  })

  const wrapper = mount(StatisticsPageView, {
    global: {
      plugins: [pinia],
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  })
}
```

**Current copy assertion to migrate** (lines 97-102):
```ts
it('renders anonymous state for visitors without a session', () => {
  const { wrapper } = mountStatisticsPage()

  expect(wrapper.get('[data-state="anonymous"]').text()).toContain('登录后查看你的旅行统计')
  expect(wrapper.text()).toContain('立即登录')
})
```

**Apply to:** keep stats refetch tests intact; migrate visible copy and data attributes to `旅途回忆` / `memories`.

## Shared Patterns

### Vue SFC Structure
**Source:** `apps/web/src/views/TimelinePageView.vue`  
**Apply to:** all new Vue components and route views.
```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <section data-route-view="...">
    ...
  </section>
</template>
```

Use `<script setup lang="ts">`, derive state with `computed`, and keep route views as composition surfaces.

### Auth Store Usage
**Source:** `apps/web/src/stores/auth-session.ts` lines 47-67, 257-290  
**Apply to:** landing CTAs, AuthDialog, ShellSidebar, App.
```ts
export const useAuthSessionStore = defineStore('auth-session', () => {
  const status = shallowRef<AuthStatus>('restoring')
  const currentUser = shallowRef<AuthUser | null>(null)
  const isAuthModalOpen = shallowRef(false)
  const authMode = shallowRef<AuthMode>('login')
  const isSubmitting = shallowRef(false)

  function openAuthModal(mode: AuthMode = 'login') {
    authMode.value = mode
    isAuthModalOpen.value = true
  }

  async function register(request: RegisterRequest) {
    await runAuthRequest(async () => {
      await registerWithPassword(request)
    })
  }

  async function login(request: LoginRequest) {
    await runAuthRequest(async () => {
      await loginWithPassword(request)
    })
  }

  async function logout() {
    isSubmitting.value = true
    try {
      await logoutCurrentSession()
      applyAnonymousSnapshot({
        notice: {
          tone: 'info',
          message: '已退出当前账号',
        },
      })
    } finally {
      isSubmitting.value = false
    }
  }
})
```

### Async Auth Guard
**Source:** `apps/web/src/router/index.ts` lines 41-52  
**Apply to:** all protected application routes.
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

Add authenticated root redirect before protected anonymous redirect. Return route objects rather than using deprecated `next()`.

### Error Handling
**Source:** `apps/web/src/components/auth/AuthDialog.vue` lines 97-108 and `apps/web/src/stores/auth-session.ts` lines 150-166  
**Apply to:** auth form submit and store-backed request flows.
```ts
try {
  await request()
  await hydrateAuthenticatedSnapshot()
} catch (error) {
  if (isSessionUnauthorizedApiClientError(error)) {
    handleUnauthorized()
    return
  }

  throw error
} finally {
  isSubmitting.value = false
}
```

```ts
if (error instanceof ApiClientError) {
  submitError.value =
    activeMode.value === 'login'
      ? '登录失败，请检查邮箱和密码后重试。'
      : '创建账号失败，请稍后重试。'
  return
}

submitError.value = '请求暂时没有成功，请稍后再试。'
```

### Sidebar Primitives
**Source:** `apps/web/src/components/ui/sidebar/index.ts` lines 12-31 and `SidebarMenuButtonChild.vue` lines 23-35  
**Apply to:** `AuthenticatedAppShell.vue`, `ShellSidebar.vue`.
```ts
export { default as Sidebar } from "./Sidebar.vue"
export { default as SidebarContent } from "./SidebarContent.vue"
export { default as SidebarFooter } from "./SidebarFooter.vue"
export { default as SidebarHeader } from "./SidebarHeader.vue"
export { default as SidebarInset } from "./SidebarInset.vue"
export { default as SidebarMenu } from "./SidebarMenu.vue"
export { default as SidebarMenuButton } from "./SidebarMenuButton.vue"
export { default as SidebarMenuItem } from "./SidebarMenuItem.vue"
export { default as SidebarProvider } from "./SidebarProvider.vue"
```

```vue
<Primitive
  data-slot="sidebar-menu-button"
  data-sidebar="menu-button"
  :data-active="isActive"
  :as-child="asChild"
>
  <slot />
</Primitive>
```

### Semantic Icons
**Source:** `apps/web/src/lib/icons/semantic-icons.ts` lines 1-24  
**Apply to:** shell nav.
```ts
export type KawaiiIconName =
  | 'map'
  | 'journal'
  | 'memories'
  | 'calendar'
  | 'star'
  | 'camera'
  | 'badge'
  | 'pin'

export const semanticIconMap: Record<KawaiiIconName, SemanticIconEntry> = {
  map: { kind: 'iconify', icon: 'kawaii:map' },
  journal: { kind: 'iconify', icon: 'kawaii:journal' },
  memories: { kind: 'iconify', icon: 'kawaii:memories' },
}
```

### Test Setup
**Source:** `apps/web/vitest.config.ts` lines 7-19 and `apps/web/src/App.spec.ts` lines 59-109  
**Apply to:** all new/updated specs.
```ts
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

```ts
const pinia = createPinia()
const appRouter = createRouter({
  history: createMemoryHistory(),
  routes: [...]
})
setActivePinia(pinia)

const wrapper = mount(App, {
  global: {
    plugins: [pinia, appRouter],
  },
})
```

### Path Alias and Asset Imports
**Source:** `apps/web/vite.config.ts` lines 8-19  
**Apply to:** new landing/shell components and copied v8 assets.
```ts
export default defineConfig({
  plugins: [tailwindcss(), vue()],
  resolve: {
    alias: {
      vue: fromWebRoot('./node_modules/vue'),
      pinia: fromWebRoot('./node_modules/pinia'),
      '@': fromWebRoot('./src')
    }
  },
})
```

Prefer imports such as:
```ts
import landingUpperBgUrl from '@/assets/v8/landing/landing-upper-bg.png'
import defaultAvatarUrl from '@/assets/v8/shell/default-avatar.png'
```

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| None | — | — | Every planned source/test/asset file has an exact source, exact existing file, or close role-match analog. |

## Metadata

**Analog search scope:** `apps/web/src`, `apps/web/vite.config.ts`, `apps/web/package.json`, `prd/v8.0`  
**Files scanned:** 100+ frontend files via `rg --files`, targeted reads for 24 analog/reference files  
**Strong analogs used:** `router/index.ts`, `App.vue`, `AuthDialog.vue`, `AuthTopbarControl.vue`, `auth-session.ts`, `MapHomeView.vue`, `TimelinePageView.vue`, `StatisticsPageView.vue`, `components/ui/sidebar/*`, `KawaiiIcon.vue`, `App.spec.ts`, `router/index.spec.ts`, `AuthDialog.spec.ts`, view specs, v8 asset docs  
**Pattern extraction date:** 2026-05-12
