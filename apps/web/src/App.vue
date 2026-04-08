<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onUnmounted, watch } from 'vue'

import LeafletMapStage from './components/LeafletMapStage.vue'
import { useMapUiStore } from './stores/map-ui'

const mapUiStore = useMapUiStore()
const { clearInteractionNotice } = mapUiStore
const { interactionNotice } = storeToRefs(mapUiStore)

let noticeTimer: number | null = null

watch(
  () => interactionNotice.value?.message,
  (message) => {
    if (noticeTimer) {
      window.clearTimeout(noticeTimer)
      noticeTimer = null
    }

    if (!message) {
      return
    }

    noticeTimer = window.setTimeout(() => {
      clearInteractionNotice()
      noticeTimer = null
    }, 2600)
  }
)

onUnmounted(() => {
  if (!noticeTimer) {
    return
  }

  window.clearTimeout(noticeTimer)
})
</script>

<template>
  <div class="app-shell">
    <div class="app-shell__grain" aria-hidden="true"></div>
    <main class="poster-shell">
      <header class="poster-shell__topbar" data-region="topbar">
        <div class="poster-shell__brand">
          <span class="poster-shell__brand-badge" aria-hidden="true">TM</span>
          <h1 class="poster-shell__brand-title">旅记</h1>
        </div>
        <div class="poster-shell__topbar-slot" aria-hidden="true"></div>
      </header>
      <div
        v-if="interactionNotice"
        class="app-shell__notice"
        :class="{
          'app-shell__notice--warning': interactionNotice.tone === 'warning'
        }"
        role="status"
        aria-live="polite"
      >
        {{ interactionNotice.message }}
      </div>
      <section class="poster-shell__experience" data-region="map-shell">
        <LeafletMapStage class="poster-shell__stage" />
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  isolation: isolate;
}

.app-shell__grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 18% 20%, rgba(244, 143, 177, 0.14), transparent 28%),
    radial-gradient(circle at 84% 14%, rgba(132, 199, 216, 0.14), transparent 24%),
    radial-gradient(circle at 28% 84%, rgba(199, 171, 200, 0.16), transparent 30%);
  mix-blend-mode: screen;
  opacity: 0.95;
}

.app-shell__notice {
  position: fixed;
  top: calc(var(--space-xl) + 3.75rem);
  left: 50%;
  z-index: 5;
  width: 28rem;
  max-width: calc(100% - var(--space-3xl));
  padding: 0.8rem 1rem;
  border: 1px solid color-mix(in srgb, var(--color-frame) 62%, white 38%);
  border-radius: var(--radius-surface);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(232, 244, 251, 0.78));
  color: var(--color-ink-strong);
  font-size: var(--font-label-size);
  line-height: 1.4;
  text-align: center;
  box-shadow: var(--shadow-surface);
  backdrop-filter: blur(10px);
  transform: translateX(-50%);
}

.app-shell__notice--warning {
  border-color: color-mix(in srgb, var(--color-state-fallback) 74%, var(--color-frame) 26%);
  background:
    linear-gradient(180deg, rgba(238, 243, 248, 0.94), rgba(255, 255, 255, 0.84));
}

.poster-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-height: 100svh;
  box-sizing: border-box;
  display: grid;
  align-items: stretch;
  gap: var(--space-lg);
  padding: var(--space-xl);
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
}

.poster-shell__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  min-height: 3.75rem;
  padding: 0.85rem 1.1rem;
  border: 1px solid color-mix(in srgb, var(--color-frame) 58%, white 42%);
  border-radius: var(--radius-surface);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(232, 244, 251, 0.42)),
    color-mix(in srgb, var(--color-surface) 84%, white 16%);
  box-shadow: var(--shadow-surface);
  backdrop-filter: blur(12px);
}

.poster-shell__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.poster-shell__brand-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  background:
    linear-gradient(135deg, var(--color-state-selected), color-mix(in srgb, white 70%, var(--color-accent) 30%));
  color: white;
  font-size: 0.72rem;
  font-weight: var(--font-weight-label);
  letter-spacing: 0.12em;
  box-shadow: 0 12px 24px rgba(244, 143, 177, 0.24);
}

.poster-shell__brand-title {
  margin: 0;
  color: var(--color-ink-strong);
  font-size: clamp(1.1rem, 2.1vw, 1.4rem);
  line-height: 1.1;
  font-weight: var(--font-weight-heading);
  letter-spacing: 0.08em;
}

.poster-shell__topbar-slot {
  flex: 0 0 clamp(4rem, 16vw, 8rem);
  min-height: 1px;
}

.poster-shell__stage {
  flex: 1 1 0;
  min-height: 0;
  position: relative;
  z-index: 1;
}

.poster-shell__experience {
  position: relative;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 18px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-frame) 58%, white 42%);
  border-radius: var(--radius-surface);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.48), rgba(232, 244, 251, 0.22)),
    color-mix(in srgb, var(--color-surface) 82%, white 18%);
  box-shadow: var(--shadow-stage);
  isolation: isolate;
}

.poster-shell__experience::before,
.poster-shell__experience::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

.poster-shell__experience::before {
  inset: 0;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.58), transparent 34%),
    radial-gradient(circle at bottom right, rgba(244, 143, 177, 0.12), transparent 28%);
}

.poster-shell__experience::after {
  inset: 18px;
  border: 1px dashed rgba(199, 171, 200, 0.45);
  border-radius: 28px;
}

@media (max-width: 640px) {
  .app-shell__notice {
    top: calc(var(--space-lg) + 3.4rem);
    max-width: calc(100% - var(--space-xl));
  }

  .poster-shell {
    gap: var(--space-md);
    padding: var(--space-md);
  }

  .poster-shell__topbar {
    min-height: 3.4rem;
    padding: 0.7rem 0.9rem;
  }

  .poster-shell__brand {
    gap: 0.7rem;
  }

  .poster-shell__brand-badge {
    width: 2rem;
    height: 2rem;
  }

  .poster-shell__topbar-slot {
    flex-basis: 2.5rem;
  }

  .poster-shell__experience {
    padding: 12px;
  }

  .poster-shell__experience::after {
    inset: 12px;
  }
}
</style>
