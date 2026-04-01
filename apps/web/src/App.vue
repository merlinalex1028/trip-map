<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onUnmounted, watch } from 'vue'

import PosterTitleBlock from './components/PosterTitleBlock.vue'
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
      <PosterTitleBlock class="poster-shell__title" />
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
      <section class="poster-shell__experience">
        <LeafletMapStage class="poster-shell__stage" />
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
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
  top: var(--space-lg);
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
  display: grid;
  align-items: start;
  gap: var(--space-xl);
  padding: var(--space-2xl);
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-areas:
    'title'
    'stage';
}

.poster-shell__title {
  grid-area: title;
  padding-inline-end: var(--space-xl);
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
</style>
