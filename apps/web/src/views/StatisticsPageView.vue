<script setup lang="ts">
import { ChevronDownIcon } from '@radix-icons/vue'
import { storeToRefs } from 'pinia'
import { computed, onMounted, shallowRef, watch } from 'vue'
import { RouterLink } from 'vue-router'

import MemoriesChartGrid from '@/components/memories/MemoriesChartGrid.vue'
import MemoriesOverviewGrid from '@/components/memories/MemoriesOverviewGrid.vue'
import MemoryPostcardStrip from '@/components/memories/MemoryPostcardStrip.vue'
import PopularFootprintsList from '@/components/memories/PopularFootprintsList.vue'
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
      record.boundaryId,
      record.datasetVersion,
      record.regionSystem,
      record.adminType,
      record.createdAt,
      record.updatedAt,
      record.parentLabel,
      record.displayName,
      record.typeLabel,
      record.subtitle,
      record.startDate,
      record.endDate,
      record.notes,
      record.tags.join('\u0000'),
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
    class="memories-dashboard-shell"
    data-region="memories-shell"
    data-route-view="memories"
  >
    <header class="memories-dashboard-header">
      <div class="memories-dashboard-header__copy">
        <h2>
          旅途回忆
          <span
            class="memories-sparkle memories-sparkle--title"
            aria-hidden="true"
          ></span>
        </h2>
        <p>
          汇总你的旅行数据，发现更多美好回忆
          <span
            class="memories-sparkle memories-sparkle--subtitle"
            aria-hidden="true"
          ></span>
        </p>
      </div>

      <span
        class="memories-time-pill"
        aria-label="当前时间范围：全部时间"
      >
        全部时间
        <ChevronDownIcon aria-hidden="true" />
      </span>
    </header>

    <div
      v-if="shouldShowRestoringState"
      class="grid gap-4"
      data-state="restoring"
      aria-live="polite"
      aria-busy="true"
    >
      <p
        class="sr-only"
        role="status"
      >
        旅途回忆正在加载
      </p>
      <div
        data-region="memories-skeleton-overview"
        class="rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-[var(--shadow-float)]"
      >
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="index in 4"
            :key="`overview-${index}`"
            class="grid gap-3 rounded-[24px] border border-white/80 bg-white/72 p-4"
          >
            <div class="h-4 w-24 rounded-full bg-white/90"></div>
            <div class="h-10 w-20 rounded-full bg-white/85"></div>
            <div class="h-4 w-28 rounded-full bg-white/80"></div>
          </div>
        </div>
      </div>

      <div
        data-region="memories-skeleton-charts"
        class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5"
      >
        <div
          v-for="index in 4"
          :key="`chart-${index}`"
          class="grid gap-3 rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-[var(--shadow-float)]"
        >
          <div class="h-4 w-24 rounded-full bg-white/90"></div>
          <div class="h-36 rounded-[22px] bg-white/85"></div>
          <div class="h-4 w-32 rounded-full bg-white/80"></div>
        </div>
      </div>

      <div
        data-region="memories-skeleton-ranking"
        class="grid gap-3 rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-[var(--shadow-float)]"
      >
        <div class="h-4 w-32 rounded-full bg-white/90"></div>
        <div class="grid gap-2">
          <div
            v-for="index in 5"
            :key="`ranking-${index}`"
            class="h-10 rounded-[18px] bg-white/80"
          ></div>
        </div>
      </div>

      <div
        data-region="memories-skeleton-postcards"
        class="grid gap-3 rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-[var(--shadow-float)]"
      >
        <div class="h-4 w-32 rounded-full bg-white/90"></div>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div
            v-for="index in 4"
            :key="`postcard-${index}`"
            class="aspect-[4/3] rounded-[22px] bg-white/82"
          ></div>
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
        <h3 class="text-xl font-semibold text-[var(--color-ink-strong)]">登录后查看你的旅途回忆</h3>
        <p class="max-w-2xl text-sm leading-6 text-[var(--color-ink-muted)]">
          旅途回忆会汇总你的总旅行次数和已去过的地点数。登录后即可在这里查看。
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
      role="alert"
    >
      <div class="space-y-2">
        <p
          class="inline-flex w-fit items-center rounded-full border border-white/85 bg-white/88 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-[var(--color-ink-soft)] uppercase"
        >
          载入失败
        </p>
        <h3 class="text-xl font-semibold text-[var(--color-ink-strong)]">旅途回忆加载失败</h3>
        <p class="max-w-2xl text-sm leading-6 text-[var(--color-ink-muted)]">
          旅途回忆暂时加载失败，请稍后重试。
        </p>
      </div>

      <button
        type="button"
        class="inline-flex min-h-11 items-center justify-center rounded-full border border-white/85 bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--color-ink-strong)] shadow-[var(--shadow-button)] transition duration-[var(--motion-quick)] hover:-translate-y-0.5 hover:bg-white"
        @click="statsStore.fetchStatsData()"
      >
        重新加载回忆
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

    <div
      v-else-if="shouldShowStats"
      class="memories-dashboard-content"
      data-state="populated"
    >
      <p
        class="sr-only"
        data-region="memories-accessible-summary"
      >
        旅途回忆概览。总旅行次数记录每一次独立去访，地点、城市或行政区、国家/地区都来自当前账号真实足迹。当前支持覆盖
        {{ stats!.totalSupportedCountries }} 个国家/地区。{{ stats!.totalTrips }} 次旅行 ·
        {{ stats!.uniquePlaces }} 个地点 · {{ stats!.visitedCountries }} 个国家/地区
      </p>
      <MemoriesOverviewGrid :stats="stats!" />
      <div
        class="memories-analytics-grid"
        data-region="memories-analytics-grid"
      >
        <MemoriesChartGrid :dashboard="stats!.memories" />
        <PopularFootprintsList :items="stats!.memories.popularFootprints" />
      </div>
      <MemoryPostcardStrip :items="stats!.memories.postcards" />
    </div>
  </section>
</template>

<style scoped>
.memories-dashboard-shell {
  display: flex;
  flex-direction: column;
  gap: 26px;
  min-height: 0;
  overflow-y: auto;
  border: 1px solid rgba(237, 229, 248, 0.86);
  border-radius: 30px;
  background:
    radial-gradient(circle at 10% 5%, rgba(255, 244, 249, 0.86), transparent 28%),
    radial-gradient(circle at 91% 0%, rgba(248, 244, 255, 0.78), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 251, 254, 0.93));
  box-shadow:
    0 18px 62px rgba(74, 52, 112, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.96);
  padding: 38px;
  scrollbar-color: rgba(151, 138, 197, 0.26) transparent;
  scrollbar-width: thin;
}

.memories-dashboard-shell::-webkit-scrollbar {
  width: 8px;
}

.memories-dashboard-shell::-webkit-scrollbar-track {
  background: transparent;
}

.memories-dashboard-shell::-webkit-scrollbar-thumb {
  border: 2px solid rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  background: rgba(151, 138, 197, 0.22);
}

.memories-dashboard-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 22px;
}

.memories-dashboard-header__copy {
  display: grid;
  gap: 13px;
}

.memories-dashboard-header h2 {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: fit-content;
  margin: 0;
  color: #15106b;
  font-size: 32px;
  font-weight: 880;
  line-height: 1;
  letter-spacing: 0;
  text-shadow: 0 2px 0 rgba(123, 100, 207, 0.12);
}

.memories-dashboard-header p {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: fit-content;
  margin: 0;
  color: #756fa4;
  font-size: 17px;
  font-weight: 760;
  line-height: 1.45;
}

.memories-sparkle {
  display: inline-block;
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
  margin-left: 16px;
  background: #ffcda4;
  clip-path: polygon(50% 0, 63% 37%, 100% 50%, 63% 63%, 50% 100%, 37% 63%, 0 50%, 37% 37%);
}

.memories-sparkle--subtitle {
  width: 13px;
  height: 13px;
  margin-left: 18px;
  opacity: 0.76;
}

.memories-time-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 154px;
  min-height: 52px;
  gap: 10px;
  border: 1px solid rgba(235, 224, 247, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow:
    0 12px 28px rgba(117, 78, 171, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  color: #8c5fd8;
  font-size: 16px;
  font-weight: 850;
  line-height: 1;
}

.memories-time-pill svg {
  width: 18px;
  height: 18px;
}

.memories-dashboard-content {
  display: grid;
  gap: 26px;
}

.memories-analytics-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 24px;
}

.memories-analytics-grid :deep([data-chart-panel="monthly-trend"]) {
  grid-column: span 7;
}

.memories-analytics-grid :deep([data-chart-panel="country-distribution"]) {
  grid-column: span 5;
}

.memories-analytics-grid :deep([data-chart-panel="yearly-trend"]),
.memories-analytics-grid :deep([data-chart-panel="memories-profile"]),
.memories-analytics-grid :deep([data-region="popular-footprints"]) {
  grid-column: span 4;
}

@media (max-width: 1180px) {
  .memories-dashboard-shell {
    padding: 28px;
  }

  .memories-analytics-grid :deep([data-chart-panel="monthly-trend"]),
  .memories-analytics-grid :deep([data-chart-panel="country-distribution"]) {
    grid-column: span 12;
  }

  .memories-analytics-grid :deep([data-chart-panel="yearly-trend"]),
  .memories-analytics-grid :deep([data-chart-panel="memories-profile"]),
  .memories-analytics-grid :deep([data-region="popular-footprints"]) {
    grid-column: span 6;
  }
}

@media (max-width: 760px) {
  .memories-dashboard-shell {
    border-radius: 24px;
    padding: 20px;
  }

  .memories-dashboard-header {
    grid-template-columns: minmax(0, 1fr);
  }

  .memories-dashboard-header h2 {
    font-size: 28px;
  }

  .memories-dashboard-header p {
    font-size: 15px;
  }

  .memories-time-pill {
    justify-self: start;
    min-width: 132px;
    min-height: 44px;
  }

  .memories-analytics-grid :deep([data-chart-panel="yearly-trend"]),
  .memories-analytics-grid :deep([data-chart-panel="memories-profile"]),
  .memories-analytics-grid :deep([data-region="popular-footprints"]) {
    grid-column: span 12;
  }
}
</style>
