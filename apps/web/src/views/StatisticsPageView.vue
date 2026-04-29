<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, shallowRef, watch } from 'vue'
import { RouterLink } from 'vue-router'

import StatCard from '../components/statistics/StatCard.vue'
import { useAuthSessionStore } from '../stores/auth-session'
import { useMapPointsStore } from '../stores/map-points'
import { useStatsStore } from '../stores/stats'

const authSessionStore = useAuthSessionStore()
const mapPointsStore = useMapPointsStore()
const statsStore = useStatsStore()

const { boundaryVersion, currentUser, status } = storeToRefs(authSessionStore)
const { travelRecords } = storeToRefs(mapPointsStore)
const { stats, isLoading, error } = storeToRefs(statsStore)
const pendingRefreshAfterLoad = shallowRef(false)

const isRestoring = computed(() => status.value === 'restoring')
const shouldShowRestoringState = computed(() => isRestoring.value || isLoading.value)
const shouldShowAnonymousState = computed(
  () => !isRestoring.value && (status.value !== 'authenticated' || currentUser.value === null),
)
const shouldShowEmptyState = computed(
  () =>
    status.value === 'authenticated'
    && !isLoading.value
    && error.value === null
    && (stats.value?.totalTrips ?? 0) === 0,
)
const shouldShowStats = computed(
  () =>
    status.value === 'authenticated'
    && !isLoading.value
    && error.value === null
    && (stats.value?.totalTrips ?? 0) > 0,
)
const travelRecordRevision = computed(() =>
  travelRecords.value
    .map((record) => [
      record.id,
      record.placeId,
      record.createdAt,
      record.parentLabel,
      record.displayName,
      record.typeLabel,
      record.subtitle,
      record.startDate,
      record.endDate,
      record.notes,
      record.tags.join(','),
    ].join('\u0000'))
    .join('|'),
)

function fetchStatsIfAuthenticated() {
  if (status.value === 'authenticated' && currentUser.value !== null) {
    void statsStore.fetchStatsData()
  }
}

onMounted(() => {
  fetchStatsIfAuthenticated()
})

watch(
  () => boundaryVersion.value,
  () => {
    pendingRefreshAfterLoad.value = false
    statsStore.reset()
    fetchStatsIfAuthenticated()
  },
)

watch(
  () => travelRecordRevision.value,
  (nextRevision, previousRevision) => {
    if (
      previousRevision !== undefined
      && nextRevision !== previousRevision
      && status.value === 'authenticated'
      && currentUser.value !== null
    ) {
      if (isLoading.value) {
        pendingRefreshAfterLoad.value = true
        return
      }

      void statsStore.fetchStatsData()
    }
  },
)

watch(
  () => isLoading.value,
  (nextLoading) => {
    if (
      !nextLoading
      && pendingRefreshAfterLoad.value
      && status.value === 'authenticated'
      && currentUser.value !== null
    ) {
      pendingRefreshAfterLoad.value = false
      void statsStore.fetchStatsData()
    }
  },
)
</script>

<template>
  <section
    class="flex min-h-0 flex-col gap-5 overflow-y-auto rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,248,251,0.94))] p-5 shadow-[var(--shadow-stage)] md:gap-6 md:p-6"
    data-region="statistics-shell"
    data-route-view="statistics"
  >
    <header
      class="grid gap-4 rounded-[28px] border border-white/85 bg-white/70 p-4 shadow-[var(--shadow-float)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-5"
    >
      <div class="space-y-3">
        <p
          class="inline-flex w-fit items-center rounded-full border border-white/85 bg-white/88 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-[var(--color-ink-soft)] uppercase"
        >
          Travel Statistics
        </p>
        <div class="space-y-2">
          <h2 class="text-[clamp(1.7rem,2.8vw,2.4rem)] font-semibold text-[var(--color-ink-strong)]">
            旅行统计
          </h2>
          <p class="max-w-2xl text-sm leading-6 text-[var(--color-ink-muted)] md:text-[0.95rem]">
            这里汇总了你的旅行数据——总旅行次数统计每一次独立去访，已去过地点数和国家/地区数则分别按地点和国家去重。
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-start gap-3 md:justify-end">
        <p
          v-if="status === 'authenticated' && currentUser"
          class="inline-flex min-h-11 items-center rounded-full border border-white/85 bg-white/88 px-4 py-2 text-sm font-semibold text-[var(--color-ink-strong)] shadow-[var(--shadow-button)]"
        >
          {{ currentUser.username }} 的旅行统计
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
      v-if="shouldShowRestoringState"
      class="grid gap-4"
      data-state="restoring"
      aria-live="polite"
    >
      <div
        class="rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-[var(--shadow-float)]"
      >
        <div class="space-y-2">
          <div class="h-4 w-32 rounded-full bg-white/90"></div>
          <div class="h-8 w-56 rounded-full bg-white/80"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        <div
          v-for="index in 3"
          :key="index"
          class="grid gap-3 rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-[var(--shadow-float)]"
        >
          <div class="h-4 w-24 rounded-full bg-white/90"></div>
          <div class="h-12 w-28 rounded-full bg-white/85"></div>
          <div class="h-4 w-20 rounded-full bg-white/80"></div>
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
        <h3 class="text-xl font-semibold text-[var(--color-ink-strong)]">登录后查看你的旅行统计</h3>
        <p class="max-w-2xl text-sm leading-6 text-[var(--color-ink-muted)]">
          统计页面会汇总你的总旅行次数和已去过的地点数。登录后即可在这里查看。
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
      v-else-if="error !== null && !isLoading"
      class="grid gap-4 rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,242,247,0.95))] p-5 shadow-[var(--shadow-float)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
      data-state="error"
    >
      <div class="space-y-2">
        <p
          class="inline-flex w-fit items-center rounded-full border border-white/85 bg-white/88 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-[var(--color-ink-soft)] uppercase"
        >
          载入失败
        </p>
        <h3 class="text-xl font-semibold text-[var(--color-ink-strong)]">统计数据加载失败</h3>
        <p class="max-w-2xl text-sm leading-6 text-[var(--color-ink-muted)]">
          无法获取旅行统计，请稍后重试。
        </p>
      </div>

      <button
        type="button"
        class="inline-flex min-h-11 items-center justify-center rounded-full border border-white/85 bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--color-ink-strong)] shadow-[var(--shadow-button)] transition duration-[var(--motion-quick)] hover:-translate-y-0.5 hover:bg-white"
        @click="statsStore.fetchStatsData()"
      >
        重新加载统计
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
          还没有旅行数据
        </p>
        <h3 class="text-xl font-semibold text-[var(--color-ink-strong)]">还没有旅行数据</h3>
        <p class="max-w-2xl text-sm leading-6 text-[var(--color-ink-muted)]">
          先回到地图点亮一个去过的地点吧。保存后，这里会出现你的第一条统计数据。
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

    <div v-else-if="shouldShowStats" class="grid gap-4" data-state="populated">
      <div
        class="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/80 bg-white/72 px-4 py-3 shadow-[var(--shadow-float)]"
      >
        <div class="space-y-1">
          <p class="text-sm font-semibold text-[var(--color-ink-strong)]">旅行统计概览</p>
          <p class="text-xs leading-5 text-[var(--color-ink-muted)]">
            总旅行次数统计每一次独立去访，已去过地点数和国家/地区数则分别按地点和国家去重。当前支持覆盖
            {{ stats!.totalSupportedCountries }} 个国家/地区。
          </p>
        </div>
        <p
          class="inline-flex items-center rounded-full border border-white/85 bg-white/88 px-3 py-1 text-[0.72rem] font-semibold text-[var(--color-ink-soft)]"
        >
          {{ stats!.totalTrips }} 次旅行 · {{ stats!.uniquePlaces }} 个地点 ·
          {{ stats!.visitedCountries }} 个国家/地区
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        <StatCard
          label="总旅行次数"
          :value="stats!.totalTrips"
          unit="次旅行"
          gradient="linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,246,250,0.94))"
        />
        <StatCard
          label="已去过地点数"
          :value="stats!.uniquePlaces"
          unit="个地点"
          gradient="linear-gradient(180deg,rgba(255,255,255,0.92),rgba(239,250,252,0.94))"
        />
        <StatCard
          label="已去过国家/地区数"
          :value="stats!.visitedCountries"
          unit="个国家/地区"
          gradient="linear-gradient(180deg,rgba(255,255,255,0.93),rgba(241,248,255,0.94))"
        />
      </div>
    </div>
  </section>
</template>
