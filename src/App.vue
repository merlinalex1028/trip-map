<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onUnmounted, watch } from 'vue'

import PointPreviewDrawer from './components/PointPreviewDrawer.vue'
import PosterTitleBlock from './components/PosterTitleBlock.vue'
import WorldMapStage from './components/WorldMapStage.vue'
import { useMapPointsStore } from './stores/map-points'
import { useMapUiStore } from './stores/map-ui'

const mapUiStore = useMapUiStore()
const { clearInteractionNotice } = mapUiStore
const mapPointsStore = useMapPointsStore()
const { interactionNotice } = storeToRefs(mapUiStore)
const { activePoint, storageHealth } = storeToRefs(mapPointsStore)
const { clearCorruptStorageState } = mapPointsStore

mapPointsStore.bootstrapPoints()

let noticeTimer: ReturnType<typeof window.setTimeout> | null = null

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
      <div
        v-if="storageHealth === 'corrupt'"
        class="app-shell__storage-warning"
        role="alert"
      >
        <span>检测到本地存档异常，请清空本地存档后继续使用。</span>
        <button class="app-shell__storage-action" type="button" @click="clearCorruptStorageState">
          清空本地存档
        </button>
      </div>
      <section
        class="poster-shell__experience"
        :class="{
          'poster-shell__experience--drawer-open': Boolean(activePoint)
        }"
      >
        <WorldMapStage class="poster-shell__stage" />
        <PointPreviewDrawer class="poster-shell__drawer" />
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
}

.app-shell__grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(122, 78, 52, 0.08), transparent 28%),
    radial-gradient(circle at 80% 12%, rgba(92, 57, 39, 0.05), transparent 24%),
    radial-gradient(circle at 30% 80%, rgba(146, 112, 74, 0.06), transparent 30%);
  mix-blend-mode: multiply;
  opacity: 0.85;
}

.app-shell__notice {
  position: fixed;
  top: max(var(--space-lg), env(safe-area-inset-top, 0px) + var(--space-sm));
  left: 50%;
  z-index: 5;
  min-width: min(18rem, calc(100vw - var(--space-2xl)));
  max-width: min(28rem, calc(100vw - var(--space-2xl)));
  padding: 0.8rem 1rem;
  border: 1px solid rgba(143, 117, 80, 0.52);
  background: rgba(251, 246, 236, 0.92);
  color: var(--color-ink-strong);
  font-size: var(--font-label-size);
  line-height: 1.4;
  text-align: center;
  box-shadow: 0 16px 28px rgba(73, 49, 31, 0.12);
  backdrop-filter: blur(6px);
  transform: translateX(-50%);
}

.app-shell__notice--warning {
  border-color: rgba(200, 100, 59, 0.48);
}

.app-shell__storage-warning {
  position: fixed;
  top: max(calc(var(--space-lg) + 4.25rem), env(safe-area-inset-top, 0px) + var(--space-sm));
  left: 50%;
  z-index: 5;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  min-width: min(18rem, calc(100vw - var(--space-2xl)));
  max-width: min(34rem, calc(100vw - var(--space-2xl)));
  padding: 0.9rem 1rem;
  border: 1px solid rgba(141, 62, 47, 0.4);
  background: rgba(251, 246, 236, 0.96);
  color: var(--color-ink-strong);
  font-size: var(--font-label-size);
  line-height: 1.45;
  text-align: center;
  box-shadow: 0 16px 28px rgba(73, 49, 31, 0.12);
  backdrop-filter: blur(6px);
  transform: translateX(-50%);
}

.app-shell__storage-action {
  min-width: 44px;
  min-height: 44px;
  padding: 0.65rem 0.95rem;
  border: 1px solid rgba(141, 62, 47, 0.45);
  background: rgba(252, 247, 236, 0.92);
  color: #8d3e2f;
  cursor: pointer;
}

.poster-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: grid;
  gap: var(--space-xl);
  padding: var(--space-2xl);
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
}

.poster-shell__stage {
  min-height: 60vh;
}

.poster-shell__experience {
  position: relative;
}

.poster-shell__experience--drawer-open {
  padding-bottom: min(16rem, 42vh);
}

@media (min-width: 960px) {
  .poster-shell {
    align-items: start;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'title'
      'stage';
  }

  .poster-shell__title {
    grid-area: title;
    padding-inline-end: var(--space-xl);
  }

  .poster-shell__stage {
    grid-area: stage;
    min-height: 68vh;
  }

  .poster-shell__experience--drawer-open {
    padding-right: min(24rem, 32vw);
    padding-bottom: 0;
  }
}
</style>
