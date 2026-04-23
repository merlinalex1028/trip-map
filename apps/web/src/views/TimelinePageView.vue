<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import TimelineVisitCard from '../components/timeline/TimelineVisitCard.vue'
import { useAuthSessionStore } from '../stores/auth-session'
import { useMapPointsStore } from '../stores/map-points'

const authSessionStore = useAuthSessionStore()
const mapPointsStore = useMapPointsStore()

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
</script>

<template>
  <section
    class="flex min-h-0 flex-col gap-5 overflow-y-auto rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,248,251,0.94))] p-5 shadow-[var(--shadow-stage)] md:gap-6 md:p-6"
    data-region="timeline-shell"
    data-route-view="timeline"
  >
    <header
      class="grid gap-4 rounded-[28px] border border-white/85 bg-white/70 p-4 shadow-[var(--shadow-float)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-5"
    >
      <div class="space-y-3">
        <p
          class="inline-flex w-fit items-center rounded-full border border-white/85 bg-white/88 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-[var(--color-ink-soft)] uppercase"
        >
          Personal travel history
        </p>
        <div class="space-y-2">
          <h2 class="text-[clamp(1.7rem,2.8vw,2.4rem)] font-semibold text-[var(--color-ink-strong)]">
            时间轴
          </h2>
          <p class="max-w-2xl text-sm leading-6 text-[var(--color-ink-muted)] md:text-[0.95rem]">
            在这里按时间回看你的旅行历史，每一次去访都会作为独立记录保留下来，方便你从最早的旅程一路浏览到最近的足迹。
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-start gap-3 md:justify-end">
        <p
          v-if="status === 'authenticated' && currentUser"
          class="inline-flex min-h-11 items-center rounded-full border border-white/85 bg-white/88 px-4 py-2 text-sm font-semibold text-[var(--color-ink-strong)] shadow-[var(--shadow-button)]"
        >
          {{ currentUser.username }} 的旅行记录
        </p>
        <RouterLink
          class="inline-flex min-h-11 items-center justify-center rounded-full border border-white/85 bg-white/88 px-4 py-2 text-sm font-semibold text-[var(--color-ink-strong)] shadow-[var(--shadow-button)] transition duration-[var(--motion-quick)] hover:-translate-y-0.5 hover:bg-white"
          to="/"
        >
          返回地图
        </RouterLink>
      </div>
    </header>

    <div
      v-if="isRestoring"
      class="grid gap-4 rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-[var(--shadow-float)]"
      data-state="restoring"
      aria-live="polite"
    >
      <div class="space-y-2">
        <div class="h-4 w-28 rounded-full bg-white/90"></div>
        <div class="h-8 w-52 rounded-full bg-white/80"></div>
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <div
          v-for="index in 4"
          :key="index"
          class="grid gap-3 rounded-[24px] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,245,249,0.92))] p-4"
        >
          <div class="h-5 w-20 rounded-full bg-white/90"></div>
          <div class="h-7 w-2/3 rounded-full bg-white/85"></div>
          <div class="h-4 w-1/2 rounded-full bg-white/80"></div>
          <div class="h-16 rounded-[20px] bg-white/75"></div>
        </div>
      </div>
    </div>

    <div
      v-else-if="shouldShowAnonymousState"
      class="grid gap-4 rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,242,247,0.95))] p-5 shadow-[var(--shadow-float)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
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
          时间轴会按时间顺序展示你保存过的每一次旅行记录。登录后即可在这里浏览日期、地点和同地点的多次去访。
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
      class="grid gap-4 rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(246,252,255,0.95))] p-5 shadow-[var(--shadow-float)]"
      data-state="empty"
    >
      <div class="space-y-2">
        <p
          class="inline-flex w-fit items-center rounded-full border border-white/85 bg-white/88 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-[var(--color-ink-soft)] uppercase"
        >
          还没有旅行记录
        </p>
        <h3 class="text-xl font-semibold text-[var(--color-ink-strong)]">你的时间轴还是空白的</h3>
        <p class="max-w-2xl text-sm leading-6 text-[var(--color-ink-muted)]">
          先回到地图点亮一个去过的地点吧。保存后，这里会按时间顺序出现你的第一条旅行卡片。
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <RouterLink
          class="inline-flex min-h-11 items-center justify-center rounded-full border border-white/85 bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--color-ink-strong)] shadow-[var(--shadow-button)] transition duration-[var(--motion-quick)] hover:-translate-y-0.5 hover:bg-white"
          to="/"
        >
          去地图添加旅行
        </RouterLink>
      </div>
    </div>

    <div v-else-if="shouldShowTimeline" class="grid gap-4" data-state="populated">
      <div
        class="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/80 bg-white/72 px-4 py-3 shadow-[var(--shadow-float)]"
      >
        <div class="space-y-1">
          <p class="text-sm font-semibold text-[var(--color-ink-strong)]">共 {{ timelineEntries.length }} 条旅行记录</p>
          <p class="text-xs leading-5 text-[var(--color-ink-muted)]">
            按最早优先排列，未知日期的旧记录会稳定排在已知日期之后。
          </p>
        </div>
        <p
          class="inline-flex items-center rounded-full border border-white/85 bg-white/88 px-3 py-1 text-[0.72rem] font-semibold text-[var(--color-ink-soft)]"
        >
          一次旅行一张卡片
        </p>
      </div>

      <div class="grid gap-4 md:gap-5">
        <TimelineVisitCard
          v-for="entry in timelineEntries"
          :key="entry.recordId"
          :entry="entry"
        />
      </div>
    </div>
  </section>
</template>
