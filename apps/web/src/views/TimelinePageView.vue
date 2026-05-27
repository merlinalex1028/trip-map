<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { CalendarIcon } from '@radix-icons/vue'

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
  () =>
    status.value === 'authenticated' &&
    timelineEntries.value.length === 0 &&
    !shouldShowWarningNotice.value,
)
const shouldShowWarningRecoveryState = computed(
  () =>
    status.value === 'authenticated' &&
    timelineEntries.value.length === 0 &&
    shouldShowWarningNotice.value,
)
const shouldShowTimeline = computed(
  () => status.value === 'authenticated' && timelineEntries.value.length > 0,
)

const restoringSkeletonRows = 3
</script>

<template>
  <section
    class="journal-shell flex min-h-0 flex-col gap-7 overflow-y-auto rounded-[30px] border border-[#eee6fb] bg-[rgba(255,255,255,0.72)] px-5 py-6 shadow-[0_24px_54px_rgba(139,111,239,0.12)] backdrop-blur-[3px] md:gap-8 md:px-10 md:py-8 lg:px-12"
    data-region="journal-shell"
    data-route-view="journal"
  >
    <header class="journal-page-header flex items-start gap-4 px-1 md:px-0">
      <span
        class="journal-title-icon flex h-11 w-11 shrink-0 items-center justify-center text-[var(--color-accent)]"
        aria-hidden="true"
        data-journal-title-icon
      >
        <CalendarIcon class="h-9 w-9" />
      </span>
      <div class="min-w-0 space-y-2">
        <h2 class="text-[32px] font-extrabold leading-[1.12] text-[var(--color-ink-strong)] md:text-[36px]">
          旅途手账
        </h2>
        <p class="max-w-2xl text-[18px] font-bold leading-7 text-[var(--color-ink-muted)]">
          按时间顺序记录每一次与世界的相遇
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
        class="journal-stream journal-stream--skeleton relative grid gap-4 md:gap-5"
        data-journal-stream
      >
        <span
          class="journal-line absolute bottom-4 top-3 hidden md:block"
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
      v-else-if="shouldShowWarningRecoveryState"
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

    <div v-else-if="shouldShowTimeline" class="grid gap-6 md:gap-7" data-state="populated">
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
        class="journal-stream relative grid gap-5 md:gap-6"
        data-journal-stream
      >
        <span
          class="journal-line absolute bottom-10 top-5 hidden md:block"
          data-journal-line
          aria-hidden="true"
        ></span>
        <div
          v-for="(entry, index) in timelineEntries"
          :key="entry.recordId"
          class="journal-timeline-row grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[72px_minmax(0,1fr)] md:items-start md:gap-4"
        >
          <div class="journal-axis-marker hidden md:grid">
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

      <p
        class="journal-footer-copy flex items-center justify-center gap-5 pb-1 pt-1 text-center text-[16px] font-extrabold leading-6 text-[#a982ef]"
        data-journal-footer-copy
      >
        <span
          class="journal-footer-spark"
          aria-hidden="true"
        ></span>
        <span>每一次旅行，都是回忆的珍藏</span>
        <span
          class="journal-footer-spark journal-footer-spark--pink"
          aria-hidden="true"
        ></span>
      </p>
    </div>
  </section>
</template>

<style scoped>
.journal-shell {
  background-image:
    linear-gradient(135deg, rgba(255, 255, 255, 0.82), rgba(255, 248, 253, 0.9) 46%, rgba(250, 250, 255, 0.92)),
    linear-gradient(180deg, rgba(255, 248, 253, 0.98), rgba(250, 250, 255, 0.98));
}

.journal-page-header {
  position: relative;
}

.journal-title-icon {
  color: var(--color-accent);
  filter: drop-shadow(0 10px 16px rgba(247, 90, 155, 0.16));
  stroke-width: 1.7;
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
  --journal-axis-size: 72px;
  --journal-axis-center: calc(var(--journal-axis-size) / 2);
  --journal-axis-row-min-height: 170px;
  isolation: isolate;
}

.journal-stream--skeleton {
  --journal-axis-size: 56px;
}

.journal-line {
  left: calc(var(--journal-axis-center) - 1px);
  z-index: 0;
  width: 2px;
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(247, 90, 155, 0.78), rgba(139, 111, 239, 0.8), rgba(94, 167, 242, 0.78), rgba(247, 90, 155, 0.66));
  box-shadow:
    0 0 0 5px rgba(255, 255, 255, 0.54),
    0 0 20px rgba(139, 111, 239, 0.18);
}

[data-state='populated'] .journal-line {
  top: calc(var(--journal-axis-row-min-height) / 2);
  bottom: calc(var(--journal-axis-row-min-height) / 2);
}

.journal-axis-marker {
  position: relative;
  z-index: 1;
  align-self: stretch;
  min-height: var(--journal-axis-row-min-height);
  place-items: center;
}

.journal-node {
  position: relative;
  z-index: 1;
  display: block;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 129, 177, 0.96), rgba(238, 65, 137, 0.9));
  box-shadow:
    0 0 0 7px rgba(255, 255, 255, 0.66),
    0 14px 24px rgba(247, 90, 155, 0.2);
  animation: journal-node-float 4.2s ease-in-out infinite;
}

.journal-node::before {
  position: absolute;
  inset: 10px;
  background: rgba(255, 255, 255, 0.96);
  clip-path: polygon(50% 0%, 62% 34%, 100% 35%, 70% 57%, 82% 100%, 50% 74%, 18% 100%, 30% 57%, 0% 35%, 38% 34%);
  content: '';
}

.journal-node::after {
  position: absolute;
  inset: -9px;
  z-index: -1;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.76), transparent 72%);
  content: '';
}

.journal-node--pink {
  background: linear-gradient(180deg, rgba(255, 129, 177, 0.96), rgba(238, 65, 137, 0.9));
}

.journal-node--purple {
  background: linear-gradient(180deg, rgba(164, 129, 245, 0.96), rgba(126, 91, 232, 0.9));
  box-shadow:
    0 0 0 7px rgba(255, 255, 255, 0.66),
    0 14px 28px rgba(139, 111, 239, 0.22);
}

.journal-node--blue {
  background: linear-gradient(180deg, rgba(112, 178, 247, 0.96), rgba(78, 146, 235, 0.9));
  box-shadow:
    0 0 0 7px rgba(255, 255, 255, 0.66),
    0 14px 28px rgba(94, 167, 242, 0.2);
}

.journal-footer-spark {
  display: block;
  width: 18px;
  height: 18px;
  border: 2px solid #a982ef;
  clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
}

.journal-footer-spark--pink {
  border-color: #f27dbb;
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

  .journal-state-panel button,
  .journal-state-panel a {
    transition: none !important;
    transform: none !important;
  }

  .journal-state-panel button:hover,
  .journal-state-panel a:hover {
    transform: none !important;
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
