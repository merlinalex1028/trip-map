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
    <div class="app-shell__spark app-shell__spark--left" aria-hidden="true"></div>
    <div class="app-shell__spark app-shell__spark--right" aria-hidden="true"></div>
    <main class="poster-shell">
      <header class="poster-shell__topbar" data-region="topbar">
        <div class="poster-shell__brand">
          <p class="poster-shell__brand-kicker">Travel Diary</p>
          <h1 class="poster-shell__brand-title" data-display="true">旅记</h1>
          <p class="poster-shell__brand-subtitle">收集每次落点的心动坐标</p>
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
  --topbar-height: 3.9rem;
  --topbar-height-mobile: 3.35rem;
}

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
  top: calc(var(--topbar-height) + 0.75rem);
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

.app-shell__notice {
  position: fixed;
  top: calc(var(--topbar-height) + var(--space-sm));
  left: 50%;
  z-index: 5;
  width: 28rem;
  max-width: calc(100% - var(--space-3xl));
  padding: 0.85rem 1rem;
  border: var(--border-soft);
  border-radius: var(--radius-bubble);
  background:
    var(--texture-ribbon),
    var(--gradient-panel);
  color: var(--color-ink-strong);
  font-size: var(--font-label-size);
  line-height: 1.4;
  text-align: center;
  box-shadow: var(--shadow-float);
  backdrop-filter: blur(14px);
  transform: translateX(-50%);
}

.app-shell__notice--warning {
  border-color: color-mix(in srgb, var(--color-state-fallback) 74%, var(--color-frame-strong) 26%);
  background:
    var(--texture-ribbon),
    linear-gradient(180deg, rgba(245, 247, 252, 0.96), rgba(255, 252, 246, 0.9));
}

.poster-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-height: 100svh;
  box-sizing: border-box;
  display: grid;
  align-items: stretch;
  gap: var(--space-md);
  padding: calc(var(--topbar-height) + var(--space-md)) var(--space-xl) var(--space-xl);
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
}

.poster-shell__topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 4;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  height: var(--topbar-height);
  padding: 0.5rem var(--space-xl);
  border-bottom: var(--border-soft);
  background:
    var(--texture-ribbon),
    linear-gradient(180deg, rgba(255, 252, 255, 0.94), rgba(237, 247, 255, 0.84)),
    color-mix(in srgb, var(--color-surface) 88%, white 12%);
  box-shadow: 0 16px 30px rgba(155, 116, 160, 0.1);
  backdrop-filter: blur(18px);
}

.poster-shell__brand {
  display: grid;
  gap: 0.08rem;
  min-width: 0;
}

.poster-shell__brand-kicker,
.poster-shell__brand-subtitle {
  margin: 0;
}

.poster-shell__brand-kicker {
  width: fit-content;
  padding: 0.1rem 0.44rem;
  border: 1px solid color-mix(in srgb, var(--color-frame-strong) 58%, white 42%);
  border-radius: var(--radius-pill);
  background: rgba(255, 253, 255, 0.78);
  color: var(--color-ink-soft);
  font-size: 0.62rem;
  line-height: 1.05;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.poster-shell__brand-title {
  margin: 0;
  color: var(--color-ink-strong);
  font-size: clamp(1.12rem, 2vw, 1.5rem);
  line-height: 1;
  font-weight: var(--font-weight-display);
  letter-spacing: 0.05em;
  text-shadow: 0 2px 0 rgba(255, 255, 255, 0.7);
}

.poster-shell__brand-subtitle {
  color: var(--color-ink-muted);
  font-size: 0.72rem;
  line-height: 1.1;
}

.poster-shell__topbar-slot {
  flex: 0 0 clamp(2.5rem, 10vw, 5rem);
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
  border: var(--border-soft);
  border-radius: calc(var(--radius-card) + 4px);
  background:
    var(--texture-ribbon),
    linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(232, 244, 251, 0.22)),
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
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.62), transparent 34%),
    radial-gradient(circle at 88% 12%, rgba(255, 241, 168, 0.2), transparent 24%),
    radial-gradient(circle at bottom right, rgba(244, 143, 177, 0.12), transparent 28%);
}

.poster-shell__experience::after {
  inset: 18px;
  border: 1px dashed rgba(207, 163, 214, 0.58);
  border-radius: var(--radius-card);
}

@media (max-width: 640px) {
  .app-shell__notice {
    top: calc(var(--topbar-height-mobile) + var(--space-sm));
    max-width: calc(100% - var(--space-xl));
  }

  .poster-shell {
    gap: 10px;
    padding:
      calc(var(--topbar-height-mobile) + 10px)
      var(--space-md)
      var(--space-md);
  }

  .poster-shell__topbar {
    height: var(--topbar-height-mobile);
    padding: 0.42rem var(--space-md);
  }

  .poster-shell__brand-kicker {
    font-size: 0.58rem;
  }

  .poster-shell__brand-title {
    font-size: 1rem;
  }

  .poster-shell__brand-subtitle {
    display: none;
  }

  .poster-shell__topbar-slot {
    flex-basis: 1.5rem;
  }

  .poster-shell__experience {
    padding: 12px;
  }

  .poster-shell__experience::after {
    inset: 12px;
  }
}
</style>
