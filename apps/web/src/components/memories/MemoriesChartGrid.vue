<script setup lang="ts">
import type { TravelMemoriesDashboard } from '@trip-map/contracts'
import { computed } from 'vue'

import BaseChart from '@/components/common/BaseChart.vue'
import {
  buildCountryDistributionOption,
  buildMemoriesProfileOption,
  buildMonthlyTrendOption,
  buildYearlyTrendOption,
} from '@/services/memories/memory-chart-options'

const props = defineProps<{
  dashboard: TravelMemoriesDashboard
}>()

const monthlyOption = computed(() => buildMonthlyTrendOption(props.dashboard.monthlyTrend))
const countryOption = computed(() => buildCountryDistributionOption(props.dashboard.countryDistribution))
const yearlyOption = computed(() => buildYearlyTrendOption(props.dashboard.yearlyTrend))
const profileOption = computed(() => buildMemoriesProfileOption(props.dashboard.profile))

const hasMonthlyTrend = computed(() => props.dashboard.monthlyTrend.length > 0)
const hasYearlyTrend = computed(() => props.dashboard.yearlyTrend.length > 0)
const hasProfile = computed(() => props.dashboard.profile.length > 0)
</script>

<template>
  <section
    data-region="memories-chart-grid"
    class="grid gap-4 xl:grid-cols-2"
  >
    <article
      data-chart-panel="monthly-trend"
      class="grid gap-3 rounded-[24px] border border-white/80 bg-white/74 p-4 shadow-[var(--shadow-float)] md:p-5 xl:col-span-2"
    >
      <div class="space-y-1">
        <h3 class="text-2xl font-semibold leading-tight text-[var(--color-ink-strong)]">
          旅途足迹趋势
        </h3>
        <p class="text-sm leading-5 text-[var(--color-ink-muted)]">
          按月份汇总带有旅行日期的足迹次数。
        </p>
      </div>
      <p
        v-if="!hasMonthlyTrend"
        data-chart-sparse="date-trend"
        class="rounded-[18px] border border-white/80 bg-white/72 px-3 py-2 text-sm leading-5 text-[var(--color-ink-muted)]"
      >
        这些足迹还没有可用于趋势统计的旅行日期。
      </p>
      <BaseChart
        :option="monthlyOption"
        :empty="!hasMonthlyTrend"
        :min-height="320"
      />
    </article>

    <article
      data-chart-panel="country-distribution"
      class="grid gap-3 rounded-[24px] border border-white/80 bg-white/74 p-4 shadow-[var(--shadow-float)] md:p-5"
    >
      <div class="space-y-1">
        <h3 class="text-2xl font-semibold leading-tight text-[var(--color-ink-strong)]">
          足迹国家/地区分布
        </h3>
        <p class="text-sm leading-5 text-[var(--color-ink-muted)]">
          重复到访会作为真实旅行次数进入分布。
        </p>
      </div>
      <BaseChart
        :option="countryOption"
        :empty="dashboard.countryDistribution.length === 0"
        :min-height="300"
      />
    </article>

    <article
      data-chart-panel="yearly-trend"
      class="grid gap-3 rounded-[24px] border border-white/80 bg-white/74 p-4 shadow-[var(--shadow-float)] md:p-5"
    >
      <div class="space-y-1">
        <h3 class="text-2xl font-semibold leading-tight text-[var(--color-ink-strong)]">
          年度旅途趋势
        </h3>
        <p class="text-sm leading-5 text-[var(--color-ink-muted)]">
          按年份查看有日期足迹的累计节奏。
        </p>
      </div>
      <p
        v-if="!hasYearlyTrend"
        data-chart-sparse="date-trend"
        class="rounded-[18px] border border-white/80 bg-white/72 px-3 py-2 text-sm leading-5 text-[var(--color-ink-muted)]"
      >
        这些足迹还没有可用于趋势统计的旅行日期。
      </p>
      <BaseChart
        :option="yearlyOption"
        :empty="!hasYearlyTrend"
        :min-height="300"
      />
    </article>

    <article
      data-chart-panel="memories-profile"
      class="grid gap-3 rounded-[24px] border border-white/80 bg-white/74 p-4 shadow-[var(--shadow-float)] md:p-5 xl:col-span-2"
    >
      <div class="space-y-1">
        <h3 class="text-2xl font-semibold leading-tight text-[var(--color-ink-strong)]">
          旅途回忆画像
        </h3>
        <p class="text-sm leading-5 text-[var(--color-ink-muted)]">
          由地点、国家跨度、重访、日期和摘记信息描出的温柔轮廓。
        </p>
      </div>
      <p
        v-if="hasProfile"
        class="rounded-[18px] border border-white/80 bg-white/72 px-3 py-2 text-sm leading-5 text-[var(--color-ink-muted)]"
      >
        这是根据现有足迹描出的初始回忆画像。
      </p>
      <BaseChart
        :option="profileOption"
        :empty="!hasProfile"
        :min-height="320"
      />
    </article>
  </section>
</template>
