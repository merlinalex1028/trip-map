<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import TimelineVisitCard from '../components/timeline/TimelineVisitCard.vue'
import { useAuthSessionStore } from '../stores/auth-session'
import { useMapPointsStore } from '../stores/map-points'
import { useMapUiStore } from '../stores/map-ui'

const authSessionStore = useAuthSessionStore()
const mapPointsStore = useMapPointsStore()
const mapUiStore = useMapUiStore()

const { currentUser, status } = storeToRefs(authSessionStore)
const { timelineEntries } = storeToRefs(mapPointsStore)
const { interactionNotice } = storeToRefs(mapUiStore)

const JOURNAL_REFRESH_WARNING =
  '云端记录刷新失败，当前仍显示上次同步结果，请稍后重试。'

const isRestoring = computed(() => status.value === 'restoring')
const shouldShowWarningNotice = computed(
  () =>
    status.value === 'authenticated' &&
    interactionNotice.value?.tone === 'warning' &&
    interactionNotice.value.message === JOURNAL_REFRESH_WARNING,
)
const shouldShowAnonymousState = computed(
  () => status.value !== 'authenticated' || currentUser.value === null,
)
const shouldShowEmptyState = computed(
  () => status.value === 'authenticated' && timelineEntries.value.length === 0,
)
const shouldShowTimeline = computed(
  () => status.value === 'authenticated' && timelineEntries.value.length > 0,
)

const restoringSkeletonRows = 3
</script>

<template>
  <section
    class="journal-shell flex min-h-0 flex-col gap-6 overflow-y-auto rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,248,253,0.98),rgba(250,250,255,0.98))] p-5 shadow-[var(--shadow-stage)] md:gap-8 md:p-6"
    data-region="journal-shell"
    data-route-view="journal"
  >
    <header
      class="grid gap-4 rounded-[28px] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,243,250,0.9))] p-4 shadow-[var(--shadow-float)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-6 md:py-5"
    >
      <div class="space-y-3">
        <p
          class="inline-flex w-fit items-center rounded-full border border-white/85 bg-white/88 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-[var(--color-ink-soft)] uppercase"
        >
          Personal travel history
        </p>
        <div class="space-y-2">
          <h2 class="text-[clamp(1.7rem,2.8vw,2.4rem)] font-semibold text-[var(--color-ink-strong)]">
            旅途手账
          </h2>
          <p class="max-w-2xl text-sm leading-6 text-[var(--color-ink-muted)] md:text-[0.95rem]">
            沿着发光的时间线翻阅每一段旅程，从最早的出发到最近一次留下的足迹，按阅读节奏安静回看。
          </p>
        </div>
      </div>

      <div class="flex min-h-11 flex-wrap items-center justify-start gap-3 md:justify-end">
        <p
          v-if="status === 'authenticated' && currentUser"
          class="inline-flex min-h-11 items-center rounded-full border border-white/85 bg-white/88 px-4 py-2 text-sm font-semibold text-[var(--color-ink-strong)] shadow-[var(--shadow-button)]"
        >
          {{ currentUser.username }} 的旅途手账
        </p>
      </div>
    </header>

    <div
      v-if="isRestoring"
      class="journal-state-panel grid gap-5 rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,242,248,0.9))] p-5 shadow-[var(--shadow-float)]"
      data-state="restoring"
      aria-live="polite"
    >
      <div class="space-y-2">
        <div class="journal-skeleton-shimmer h-4 w-28 rounded-full bg-white/90"></div>
        <div class="journal-skeleton-shimmer h-8 w-52 rounded-full bg-white/80"></div>
      </div>
      <div
        class="journal-stream relative grid gap-4 md:gap-5"
        data-journal-stream
      >
        <span
          class="journal-line absolute bottom-4 left-6 top-3 hidden md:left-7"
          data-journal-line
          aria-hidden="true"
        ></span>
        <div
          v-for="index in restoringSkeletonRows"
          :key="index"
          class="grid grid-cols-[48px_minmax(0,1fr)] items-start gap-3 md:grid-cols-[56px_minmax(0,1fr)] md:gap-4"
        >
          <div class="flex justify-center pt-3">
            <span
              class="journal-node journal-node--pink"
              data-journal-node
              aria-hidden="true"
            ></span>
          </div>
          <div
            class="grid gap-3 rounded-[24px] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,247,251,0.92))] p-4 shadow-[var(--shadow-float)]"
          >
            <div class="journal-skeleton-shimmer h-5 w-20 rounded-full bg-white/90"></div>
            <div class="journal-skeleton-shimmer h-7 w-2/3 rounded-full bg-white/85"></div>
            <div class="journal-skeleton-shimmer h-4 w-1/2 rounded-full bg-white/80"></div>
            <div class="journal-skeleton-shimmer h-24 rounded-[20px] bg-white/75"></div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="shouldShowAnonymousState"
      class="journal-state-panel grid gap-4 rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,242,247,0.95))] p-5 shadow-[var(--shadow-float)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
      data-state="anonymous"
    >
      <div class="space-y-2">
        <p
          class="inline-flex w-fit items-center rounded-full border border-white/85 bg-white/88 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-[var(--color-ink-soft)] uppercase"
        >
          登录后可查看
        </p>
        <h3 class="text-xl font-semibold text-[var(--color-ink-strong)]">登录后查看你的完整旅行历史</h3>
        <p class="max-w-2xl text-sm leading-6 text-[var(--color-ink-muted)]">
          旅途手账会按时间顺序展示你保存过的每一次旅行记录。登录后即可在这里浏览日期、地点和同地点的多次去访。
        </p>
      </div>

      <button
        type="button"
        class="inline-flex min-h-11 items-center justify-center rounded-full border border-[#f4d7e4] bg-[linear-gradient(135deg,rgba(255,232,242,0.96),rgba(255,246,250,0.96))] px-5 py-2 text-sm font-semibold text-[var(--color-accent-strong)] shadow-[0_14px_28px_rgba(244,143,177,0.28)] transition duration-[var(--motion-quick)] hover:-translate-y-0.5"
        @click="authSessionStore.openAuthModal('login')"
      >
        立即登录
      </button>
    </div>

    <div
      v-else-if="shouldShowEmptyState"
      class="journal-state-panel grid gap-4 rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(246,252,255,0.95))] p-5 shadow-[var(--shadow-float)]"
      data-state="empty"
    >
      <div class="space-y-2">
        <p
          class="inline-flex w-fit items-center rounded-full border border-white/85 bg-white/88 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-[var(--color-ink-soft)] uppercase"
        >
          还没有留下足迹
        </p>
        <h3 class="text-xl font-semibold text-[var(--color-ink-strong)]">还没有留下足迹</h3>
        <p class="max-w-2xl text-sm leading-6 text-[var(--color-ink-muted)]">
          去世界足迹选择真实地点，记录第一段旅途。
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <RouterLink
          class="inline-flex min-h-11 items-center justify-center rounded-full border border-white/85 bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--color-ink-strong)] shadow-[var(--shadow-button)] transition duration-[var(--motion-quick)] hover:-translate-y-0.5 hover:bg-white"
          to="/map"
        >
          去世界足迹留下足迹
        </RouterLink>
      </div>
    </div>

    <div v-else-if="shouldShowTimeline" class="grid gap-4 md:gap-5" data-state="populated">
      <div
        v-if="shouldShowWarningNotice"
        class="journal-state-panel grid gap-3 rounded-[28px] border border-[#f7d8e9] bg-[linear-gradient(180deg,rgba(255,248,251,0.94),rgba(255,240,246,0.98))] p-5 shadow-[var(--shadow-float)]"
        data-state="error"
        role="status"
      >
        <div class="space-y-2">
          <p
            class="inline-flex w-fit items-center rounded-full border border-white/85 bg-white/88 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-[var(--color-accent-strong)] uppercase"
          >
            Sync notice
          </p>
          <h3 class="text-xl font-semibold text-[var(--color-ink-strong)]">同步提醒</h3>
          <p class="max-w-3xl text-sm leading-6 text-[var(--color-ink-muted)]">
            {{ interactionNotice?.message }}
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <RouterLink
            class="inline-flex min-h-11 items-center justify-center rounded-full border border-white/85 bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--color-ink-strong)] shadow-[var(--shadow-button)] transition duration-[var(--motion-quick)] hover:-translate-y-0.5 hover:bg-white"
            to="/map"
          >
            返回世界足迹
          </RouterLink>
        </div>
      </div>

      <div
        class="journal-stream relative grid gap-4 md:gap-5"
        data-journal-stream
      >
        <span
          class="journal-line absolute bottom-6 left-6 top-4 hidden md:left-7"
          data-journal-line
          aria-hidden="true"
        ></span>
        <div
          v-for="(entry, index) in timelineEntries"
          :key="entry.recordId"
          class="grid grid-cols-[48px_minmax(0,1fr)] items-start gap-3 md:grid-cols-[56px_minmax(0,1fr)] md:gap-4"
        >
          <div class="flex justify-center pt-6">
            <span
              class="journal-node"
              :class="index % 3 === 1 ? 'journal-node--purple' : index % 3 === 2 ? 'journal-node--blue' : 'journal-node--pink'"
              data-journal-node
              aria-hidden="true"
            ></span>
          </div>
          <TimelineVisitCard :entry="entry" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.journal-shell {
  background-image:
    radial-gradient(circle at top left, rgba(247, 90, 155, 0.12), transparent 24%),
    radial-gradient(circle at top right, rgba(94, 167, 242, 0.12), transparent 22%),
    linear-gradient(180deg, rgba(255, 248, 253, 0.98), rgba(250, 250, 255, 0.98));
}

.journal-state-panel {
  position: relative;
  overflow: hidden;
}

.journal-state-panel::after {
  position: absolute;
  inset: auto 16px 10px auto;
  width: 96px;
  height: 96px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(247, 90, 155, 0.12), transparent 68%);
  content: '';
  pointer-events: none;
}

.journal-stream {
  isolation: isolate;
}

.journal-line {
  z-index: 0;
  width: 2px;
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(247, 90, 155, 0.92), rgba(139, 111, 239, 0.9), rgba(94, 167, 242, 0.92));
  box-shadow:
    0 0 0 8px rgba(247, 90, 155, 0.07),
    0 0 26px rgba(139, 111, 239, 0.2);
}

.journal-node {
  position: relative;
  z-index: 1;
  display: block;
  width: 20px;
  height: 20px;
  clip-path: polygon(50% 0%, 62% 34%, 100% 35%, 70% 57%, 82% 100%, 50% 74%, 18% 100%, 30% 57%, 0% 35%, 38% 34%);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 90, 155, 0.88));
  box-shadow:
    0 0 0 8px rgba(255, 255, 255, 0.72),
    0 14px 28px rgba(247, 90, 155, 0.22);
  animation: journal-node-float 4.2s ease-in-out infinite;
}

.journal-node::after {
  position: absolute;
  inset: -6px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.72), transparent 70%);
  content: '';
  z-index: -1;
}

.journal-node--pink {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 90, 155, 0.88));
}

.journal-node--purple {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(139, 111, 239, 0.88));
  box-shadow:
    0 0 0 8px rgba(255, 255, 255, 0.72),
    0 14px 28px rgba(139, 111, 239, 0.22);
}

.journal-node--blue {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(94, 167, 242, 0.88));
  box-shadow:
    0 0 0 8px rgba(255, 255, 255, 0.72),
    0 14px 28px rgba(94, 167, 242, 0.2);
}

.journal-skeleton-shimmer {
  position: relative;
  overflow: hidden;
}

.journal-skeleton-shimmer::after {
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.58), transparent);
  animation: journal-shimmer 1.8s ease-in-out infinite;
  content: '';
}

@keyframes journal-node-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-2px);
  }
}

@keyframes journal-shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .journal-node,
  .journal-skeleton-shimmer::after {
    animation: none;
  }

  :deep([data-region='timeline-entry']) {
    transition: none !important;
    transform: none !important;
  }

  :deep([data-region='timeline-entry']:hover) {
    transform: none !important;
  }
}
</style>
