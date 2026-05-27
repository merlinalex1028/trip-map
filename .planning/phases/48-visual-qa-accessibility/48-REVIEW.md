---
phase: 48-visual-qa-accessibility
reviewed: 2026-05-27T13:23:52Z
depth: standard
files_reviewed: 22
files_reviewed_list:
  - apps/server/scripts/seed-visual-qa.mjs
  - apps/web/src/App.kawaii.spec.ts
  - apps/web/src/components/LeafletMapStage.vue
  - apps/web/src/components/LeafletMapStage.spec.ts
  - apps/web/src/components/auth/AuthDialog.vue
  - apps/web/src/components/auth/AuthDialog.spec.ts
  - apps/web/src/components/common/BaseChart.vue
  - apps/web/src/components/common/BaseChart.spec.ts
  - apps/web/src/components/map-popup/FootprintDateDialog.vue
  - apps/web/src/components/map-popup/FootprintDateDialog.spec.ts
  - apps/web/src/components/memories/MemoriesChartGrid.vue
  - apps/web/src/components/memories/MemoriesChartGrid.spec.ts
  - apps/web/src/components/shell/AuthenticatedAppShell.vue
  - apps/web/src/components/shell/AuthenticatedAppShell.spec.ts
  - apps/web/src/components/shell/ShellSidebar.vue
  - apps/web/src/components/timeline/TimelineVisitCard.vue
  - apps/web/src/components/timeline/TimelineVisitCard.spec.ts
  - apps/web/src/views/LandingPageView.spec.ts
  - apps/web/src/views/StatisticsPageView.vue
  - apps/web/src/views/StatisticsPageView.spec.ts
  - apps/web/src/views/TimelinePageView.vue
  - apps/web/src/views/TimelinePageView.spec.ts
findings:
  critical: 3
  warning: 6
  info: 0
  total: 9
status: issues_found
---

# Phase 48: Code Review Report

**Reviewed:** 2026-05-27T13:23:52Z
**Depth:** standard
**Files Reviewed:** 22
**Status:** issues_found

## Summary

Reviewed the listed Phase 48 server script, Vue components, views, and tests at standard depth. The main risks are a committed QA account password, auth modal credential/focus bugs, stale date defaults that can save the wrong trip date, and accessibility semantics that can hide live/error states from assistive technology.

## Critical Issues

### CR-01 [BLOCKER]: Visual QA seed creates a known-password account

**File:** `apps/server/scripts/seed-visual-qa.mjs:1`

**Issue:** The script commits `VISUAL_QA_PASSWORD = 'VisualQa2026!'` and then upserts the account while also resetting `passwordHash` on every run (`lines 198-209`). If this script is run against any shared or production-like database, it creates a publicly known login credential for `visual-qa@example.test`.

**Fix:**
```js
const VISUAL_QA_PASSWORD = process.env.VISUAL_QA_PASSWORD

if (!VISUAL_QA_PASSWORD) {
  throw new Error('VISUAL_QA_PASSWORD must be set before seeding visual QA data')
}

if (process.env.NODE_ENV === 'production') {
  throw new Error('Refusing to seed the visual QA account in production')
}
```

Also avoid resetting `passwordHash` in the `update` branch unless an explicit `--reset-password` flag is provided.

### CR-02 [BLOCKER]: Auth dialog keeps submitted passwords in component state after close

**File:** `apps/web/src/components/auth/AuthDialog.vue:24`

**Issue:** `loginForm` and `registerForm` are long-lived reactive objects, but successful submit only closes the modal and routes to `/map` (`lines 102-103`). Because the component is mounted globally by `App.vue`, reopening the auth modal in the same session can repopulate previous email/password values, including the password.

**Fix:**
```ts
function resetAuthForms() {
  loginForm.email = ''
  loginForm.password = ''
  registerForm.username = ''
  registerForm.email = ''
  registerForm.password = ''
}

// after successful login/register
closeAuthModal()
resetAuthForms()
await router.replace('/map')
```

At minimum, clear both password fields on every successful submit and on explicit close.

### CR-03 [BLOCKER]: Footprint date shortcuts can save yesterday's date after midnight

**File:** `apps/web/src/components/map-popup/FootprintDateDialog.vue:59`

**Issue:** `todayValue` is calculated once when the component is created (`lines 59-62`). `FootprintDateDialog` stays mounted under `LeafletMapStage`, so if the app remains open across midnight, the default date and "今天/明天/本周末" shortcuts continue using the stale day and can persist the wrong trip date.

**Fix:**
```ts
function getTodayValue() {
  return today(getLocalTimeZone())
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    selectedDate.value = getTodayValue()
    selectedShortcut.value = 'today'
    await nextTick()
    dialogSurfaceRef.value?.focus({ preventScroll: true })
  },
)

function handleShortcutClick(shortcut: ShortcutKey) {
  const currentToday = getTodayValue()
  // use currentToday for today/tomorrow/weekend
}
```

## Warnings

### WR-01 [WARNING]: Closed auth modal steals focus during initial app mount

**File:** `apps/web/src/components/auth/AuthDialog.vue:117`

**Issue:** The `isAuthModalOpen` watcher uses `{ immediate: true }`. On the initial render where the modal is closed, it runs the close branch and calls `restoreTriggerFocus()` (`lines 129-130`), which focuses the first `[data-auth-trigger]` even though no dialog was opened or closed. This can move keyboard/screen-reader focus unexpectedly on page load.

**Fix:** Remove `immediate: true`, or track the previous open state and restore focus only for a real `true -> false` transition.

```ts
watch(isAuthModalOpen, async (open, wasOpen) => {
  if (open) {
    lastFocusedElement.value =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    resetSubmitError()
    await nextTick()
    focusFirstField(activeMode.value)
    return
  }

  if (wasOpen) {
    await nextTick()
    restoreTriggerFocus()
  }
})
```

### WR-02 [WARNING]: Leaflet click listener is never removed or guarded

**File:** `apps/web/src/components/LeafletMapStage.vue:940`

**Issue:** The component registers `map.value.on('click', handleMapClick)` in both an `isReady` watcher and an `onMounted` fallback (`lines 940-952`) but never calls `off()` on unmount. Remounting the map, HMR, or a readiness transition can leave stale handlers attached and cause duplicate recognition requests.

**Fix:** Keep a registered map reference, avoid duplicate registration, and clean it up in `onUnmounted`.

```ts
let registeredClickMap: L.Map | null = null

function registerMapClickHandler() {
  if (!map.value || registeredClickMap === map.value) return
  registeredClickMap?.off('click', handleMapClick)
  map.value.on('click', handleMapClick)
  registeredClickMap = map.value
}

onUnmounted(() => {
  registeredClickMap?.off('click', handleMapClick)
  registeredClickMap = null
})
```

### WR-03 [WARNING]: `role="img"` on `BaseChart` can hide alert/status children

**File:** `apps/web/src/components/common/BaseChart.vue:47`

**Issue:** The wrapper always has `role="img"` (`lines 47-52`), even when it renders `role="alert"` or `role="status"` children for error, empty, and loading states (`lines 55-90`). Assistive technologies can treat descendants of an image role as part of the image alternative, so the live/error states may not be announced.

**Fix:** Apply `role="img"` only to the actual chart state, or remove it from the outer wrapper when rendering status content.

```vue
<section
  data-base-chart
  :role="error || empty || loading ? undefined : 'img'"
  :aria-label="label"
  :aria-busy="loading"
>
```

### WR-04 [WARNING]: Footprint date dialog creates nested dialog roles

**File:** `apps/web/src/components/map-popup/FootprintDateDialog.vue:147`

**Issue:** `DialogContent` from the UI dialog layer already renders the actual accessible dialog. The inner `div` also sets `role="dialog"` (`lines 153-158`), creating a nested unlabeled dialog surface inside the real modal. This can confuse screen-reader navigation and dialog naming.

**Fix:** Keep the inner element as a focus target/surface but remove `role="dialog"` from it. If it needs an accessible name, let `DialogTitle`/`DialogDescription` name the single `DialogContent` dialog instead.

### WR-05 [WARNING]: LeafletMapStage specs include tests with no effective assertions

**File:** `apps/web/src/components/LeafletMapStage.spec.ts:343`

**Issue:** The test at `lines 343-370` sets up mocks but never asserts behavior, and the anonymous records bootstrap test at `lines 750-758` also has no assertion. These tests pass even if the intended behavior is broken, which weakens the regression suite for the map startup paths Phase 48 relies on.

**Fix:** Add assertions for the intended side effects, or remove the empty tests. For example, assert that unexpected record fetch mocks were not called and that expected shard/addFeatures calls happen after the simulated click.

### WR-06 [WARNING]: Authenticated shell has no logout path

**File:** `apps/web/src/components/shell/ShellSidebar.vue:181`

**Issue:** The authenticated sidebar explicitly removes logout UI (`line 181`), and the only logout tests are skipped in `AuthenticatedAppShell.spec.ts` (`lines 148-172`). Users who share a device cannot sign out from the authenticated shell, which is both a functional gap and a session-safety risk.

**Fix:** Restore an accessible logout control in the shell, wire it to `authSessionStore.logout()`, and re-enable the skipped success/failure tests.

---

_Reviewed: 2026-05-27T13:23:52Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
