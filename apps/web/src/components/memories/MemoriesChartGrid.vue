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
const countryLegendColors = ['#ff5d91', '#a875ed', '#4f8dff', '#ffb241', '#62c7d8']
const countryTripTotal = computed(() =>
  props.dashboard.countryDistribution.reduce((total, item) => total + item.tripCount, 0),
)
const countryLegendItems = computed(() =>
  props.dashboard.countryDistribution.slice(0, 5).map((item, index) => ({
    label: item.countryLabel,
    percentage: countryTripTotal.value === 0
      ? 0
      : Math.round((item.tripCount / countryTripTotal.value) * 100),
    color: countryLegendColors[index % countryLegendColors.length],
  })),
)
</script>

<template>
  <section
    data-region="memories-chart-grid"
    class="memories-chart-grid"
  >
    <article
      data-chart-panel="monthly-trend"
      class="memories-panel memories-panel--trend"
      aria-labelledby="memories-chart-monthly-trend-title"
    >
      <div class="memories-panel__heading">
        <h3 id="memories-chart-monthly-trend-title">
          旅途足迹趋势
        </h3>
        <p>
          按月份记录你的旅行次数
        </p>
      </div>
      <p
        v-if="!hasMonthlyTrend"
        data-chart-sparse="date-trend"
        class="memories-panel__empty"
      >
        这些足迹还没有可用于趋势统计的旅行日期。
      </p>
      <BaseChart
        v-if="hasMonthlyTrend"
        label="旅途足迹趋势图表"
        :option="monthlyOption"
        :min-height="314"
      />
    </article>

    <article
      data-chart-panel="country-distribution"
      class="memories-panel memories-panel--country"
      aria-labelledby="memories-chart-country-distribution-title"
    >
      <div class="memories-panel__heading">
        <h3 id="memories-chart-country-distribution-title">
          足迹国家/地区分布
        </h3>
        <p>
          你踩亮过的世界
        </p>
      </div>
      <div class="memories-country-layout">
        <BaseChart
          label="足迹国家/地区分布图表"
          :option="countryOption"
          :empty="dashboard.countryDistribution.length === 0"
          :min-height="264"
        />
        <ul
          v-if="countryLegendItems.length > 0"
          class="memories-country-legend"
          aria-label="足迹国家或地区占比"
        >
          <li
            v-for="item in countryLegendItems"
            :key="item.label"
            :style="{ '--legend-color': item.color }"
          >
            <span class="memories-country-legend__name">{{ item.label }}</span>
            <strong>{{ item.percentage }}%</strong>
          </li>
        </ul>
      </div>
    </article>

    <article
      data-chart-panel="yearly-trend"
      class="memories-panel memories-panel--yearly"
      aria-labelledby="memories-chart-yearly-trend-title"
    >
      <div class="memories-panel__heading">
        <h3 id="memories-chart-yearly-trend-title">
          年度旅途趋势
        </h3>
        <p>
          每年旅行次数变化
        </p>
      </div>
      <p
        v-if="!hasYearlyTrend"
        data-chart-sparse="date-trend"
        class="memories-panel__empty"
      >
        这些足迹还没有可用于趋势统计的旅行日期。
      </p>
      <BaseChart
        v-if="hasYearlyTrend"
        label="年度旅途趋势图表"
        :option="yearlyOption"
        :min-height="285"
      />
    </article>

    <article
      data-chart-panel="memories-profile"
      class="memories-panel memories-panel--profile"
      aria-labelledby="memories-chart-profile-title"
    >
      <div class="memories-panel__heading">
        <h3 id="memories-chart-profile-title">
          旅途风格分析
        </h3>
        <p>
          你的旅行偏好雷达图
        </p>
      </div>
      <p
        v-if="!hasProfile"
        class="memories-panel__empty"
      >
        还没有足够的足迹生成旅行偏好雷达图。
      </p>
      <BaseChart
        v-if="hasProfile"
        label="旅途风格分析雷达图"
        :option="profileOption"
        :min-height="285"
      />
    </article>
  </section>
</template>

<style scoped>
.memories-chart-grid {
  display: contents;
}

.memories-panel {
  position: relative;
  display: grid;
  align-content: start;
  gap: 20px;
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(235, 224, 247, 0.86);
  border-radius: 24px;
  background:
    radial-gradient(circle at 88% 10%, rgba(255, 215, 230, 0.34), transparent 18%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(255, 252, 254, 0.91));
  box-shadow:
    0 20px 48px rgba(75, 51, 118, 0.065),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
  padding: 30px 34px 27px;
}

.memories-panel__heading {
  display: grid;
  gap: 8px;
}

.memories-panel__heading h3 {
  margin: 0;
  color: #16135d;
  font-size: 23px;
  font-weight: 850;
  line-height: 1.05;
  letter-spacing: 0;
}

.memories-panel__heading p {
  margin: 0;
  color: #746fa4;
  font-size: 15px;
  font-weight: 750;
  line-height: 1.35;
}

.memories-panel__empty {
  margin: 0;
  border: 1px solid rgba(235, 224, 247, 0.78);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  color: #746fa4;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.6;
  padding: 14px 16px;
}

.memories-country-layout {
  display: grid;
  grid-template-columns: minmax(210px, 0.92fr) minmax(150px, 0.72fr);
  align-items: center;
  gap: 22px;
  min-width: 0;
}

.memories-country-layout :deep([data-base-chart]) {
  min-width: 0;
}

.memories-country-legend {
  display: grid;
  gap: 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.memories-country-legend li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  color: #6b659c;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.1;
}

.memories-country-legend__name {
  position: relative;
  min-width: 0;
  overflow: hidden;
  overflow-wrap: anywhere;
  padding-left: 28px;
}

.memories-country-legend__name::before {
  position: absolute;
  top: 50%;
  left: 0;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--legend-color);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--legend-color), transparent 58%);
  content: "";
  transform: translateY(-50%);
}

.memories-country-legend strong {
  color: #625c97;
  font-size: 18px;
  font-weight: 850;
}

@media (max-width: 1180px) {
  .memories-panel {
    padding: 26px;
  }

  .memories-country-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .memories-country-legend {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 20px;
  }
}

@media (max-width: 640px) {
  .memories-panel {
    border-radius: 20px;
    padding: 22px 18px;
  }

  .memories-panel__heading h3 {
    font-size: 20px;
  }

  .memories-country-legend {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
