<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, watch } from 'vue'
import { RouterView } from 'vue-router'

import AuthDialog from './components/auth/AuthDialog.vue'
import LocalImportDecisionDialog from './components/auth/LocalImportDecisionDialog.vue'
import AuthenticatedAppShell from './components/shell/AuthenticatedAppShell.vue'
import { useAuthSessionStore } from './stores/auth-session'
import { useMapUiStore } from './stores/map-ui'

const authSessionStore = useAuthSessionStore()
const mapUiStore = useMapUiStore()
const {
  dismissLocalImportSummary,
  importLocalRecordsIntoAccount,
  keepCloudRecordsAsSourceOfTruth,
  refreshAuthenticatedSnapshot,
  restoreSession,
} = authSessionStore
const { clearInteractionNotice } = mapUiStore
const {
  isSubmitting,
  localImportSummary,
  pendingLocalImportDecision,
  status,
} = storeToRefs(authSessionStore)
const { interactionNotice } = storeToRefs(mapUiStore)

let noticeTimer: number | null = null

watch(interactionNotice, (notice) => {
  if (noticeTimer) {
    window.clearTimeout(noticeTimer)
    noticeTimer = null
  }

  if (!notice?.message) {
    return
  }

  noticeTimer = window.setTimeout(() => {
    clearInteractionNotice()
    noticeTimer = null
  }, 2600)
})

onMounted(() => {
  void restoreSession()
  window.addEventListener('focus', handleWindowFocus)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  if (noticeTimer) {
    window.clearTimeout(noticeTimer)
  }

  window.removeEventListener('focus', handleWindowFocus)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

function handleImportLocalRecords() {
  void importLocalRecordsIntoAccount()
}

function handleKeepCloudRecords() {
  keepCloudRecordsAsSourceOfTruth()
}

function handleDismissLocalImportSummary() {
  dismissLocalImportSummary()
}

function triggerForegroundRefresh() {
  if (status.value !== 'authenticated') {
    return
  }

  void refreshAuthenticatedSnapshot()
}

function handleWindowFocus() {
  triggerForegroundRefresh()
}

function handleVisibilityChange() {
  if (document.visibilityState !== 'visible') {
    return
  }

  triggerForegroundRefresh()
}
</script>

<template>
  <div class="relative min-h-screen isolate overflow-hidden bg-cream-100 font-sans">
    <div class="app-shell__grain" aria-hidden="true"></div>
    <div class="app-shell__spark app-shell__spark--left" aria-hidden="true"></div>
    <div class="app-shell__spark app-shell__spark--right" aria-hidden="true"></div>
    <main class="relative z-[1] min-h-screen">
      <div
        v-if="interactionNotice"
        class="fixed left-1/2 top-6 z-[5] w-[28rem] max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full border border-white/80 bg-white/82 px-4 py-3 text-center text-sm text-[var(--color-ink-strong)] shadow-[var(--shadow-float)] backdrop-blur-xl"
        :class="{
          'app-shell__notice--warning': interactionNotice.tone === 'warning',
        }"
        data-kawaii-notice="pill"
        role="status"
        aria-live="polite"
      >
        {{ interactionNotice.message }}
      </div>
      <RouterView v-slot="{ Component, route }">
        <div
          v-if="status === 'restoring'"
          class="flex min-h-screen items-center justify-center px-6 text-center text-lg font-semibold text-[var(--color-ink-strong)]"
          data-auth-restore-state
        >
          正在恢复你的旅途...
        </div>
        <AuthenticatedAppShell v-else-if="route.meta.requiresAuth === true">
          <component :is="Component" />
        </AuthenticatedAppShell>
        <component
          :is="Component"
          v-else
        />
      </RouterView>
    </main>
    <LocalImportDecisionDialog
      :decision="pendingLocalImportDecision"
      :summary="localImportSummary"
      :submitting="isSubmitting"
      @import="handleImportLocalRecords"
      @keep-cloud="handleKeepCloudRecords"
      @dismiss-summary="handleDismissLocalImportSummary"
    />
    <AuthDialog />
  </div>
</template>

<style scoped>
.app-shell__grain {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 18% 20%, rgba(244, 143, 177, 0.14), transparent 28%),
    radial-gradient(circle at 84% 14%, rgba(132, 199, 216, 0.14), transparent 24%),
    radial-gradient(circle at 28% 84%, rgba(199, 171, 200, 0.16), transparent 30%);
  mix-blend-mode: screen;
  opacity: 0.95;
}

.app-shell__spark {
  position: fixed;
  z-index: 0;
  width: clamp(10rem, 20vw, 16rem);
  aspect-ratio: 1;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.9;
  filter: blur(4px);
}

.app-shell__spark--left {
  top: 4.65rem;
  left: clamp(-2rem, 1vw, 1rem);
  background:
    radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.84), transparent 28%),
    radial-gradient(circle at 55% 55%, rgba(255, 214, 235, 0.66), transparent 52%);
}

.app-shell__spark--right {
  right: clamp(-2rem, 2vw, 1rem);
  bottom: 8vh;
  background:
    radial-gradient(circle at 42% 42%, rgba(255, 255, 255, 0.84), transparent 22%),
    radial-gradient(circle at 60% 48%, rgba(223, 245, 251, 0.7), transparent 50%);
}

.app-shell__notice--warning {
  border-color: color-mix(in srgb, var(--color-state-fallback) 74%, var(--color-frame-strong) 26%);
  background:
    var(--texture-ribbon),
    linear-gradient(180deg, rgba(245, 247, 252, 0.96), rgba(255, 252, 246, 0.9));
}

@media (max-width: 640px) {
  .app-shell__spark--left {
    top: 4rem;
  }
}
</style>
