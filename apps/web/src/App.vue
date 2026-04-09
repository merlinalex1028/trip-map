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
  <div class="relative min-h-screen isolate overflow-hidden bg-cream-100 font-sans">
    <div class="app-shell__grain" aria-hidden="true"></div>
    <div class="app-shell__spark app-shell__spark--left" aria-hidden="true"></div>
    <div class="app-shell__spark app-shell__spark--right" aria-hidden="true"></div>
    <main
      class="relative z-[1] grid min-h-screen grid-rows-[1fr] gap-4 px-4 pb-4 pt-[4.5rem] md:px-8 md:pb-8 md:pt-[5rem]"
    >
      <header
        class="fixed inset-x-0 top-0 z-[4] flex h-14 items-center justify-between gap-2 border-b border-white/70 bg-cream-200/90 px-4 shadow-[0_16px_30px_rgba(155,116,160,0.10)] backdrop-blur-xl md:h-16 md:px-8"
        data-region="topbar"
      >
        <div class="grid min-w-0 gap-[0.08rem]">
          <p
            class="w-fit rounded-full border border-white/80 bg-white/78 px-[0.44rem] py-[0.1rem] text-[0.62rem] leading-[1.05] tracking-[0.12em] text-[var(--color-ink-soft)] uppercase"
          >
            Travel Diary
          </p>
          <h1
            class="m-0 text-[clamp(1.12rem,2vw,1.5rem)] leading-none font-semibold tracking-[0.05em] text-[var(--color-ink-strong)]"
            data-display="true"
          >
            旅记
          </h1>
          <p class="hidden text-[0.72rem] leading-[1.1] text-[var(--color-ink-muted)] sm:block">
            收集每次落点的心动坐标
          </p>
        </div>
        <div class="min-h-px basis-10 md:basis-20" aria-hidden="true"></div>
      </header>
      <div
        v-if="interactionNotice"
        class="fixed left-1/2 top-[4.25rem] z-[5] w-[28rem] max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full border border-white/80 bg-white/80 px-4 py-3 text-center text-sm text-[var(--color-ink-strong)] shadow-[var(--shadow-float)] backdrop-blur-xl md:top-[4.75rem]"
        :class="{
          'app-shell__notice--warning': interactionNotice.tone === 'warning',
        }"
        role="status"
        aria-live="polite"
      >
        {{ interactionNotice.message }}
      </div>
      <section
        class="relative flex min-h-0 flex-col overflow-hidden rounded-[32px] border border-white/80 bg-white/60 p-3 shadow-[var(--shadow-stage)] md:p-[18px]"
        data-region="map-shell"
      >
        <LeafletMapStage class="min-h-0 flex-1" />
      </section>
    </main>
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
