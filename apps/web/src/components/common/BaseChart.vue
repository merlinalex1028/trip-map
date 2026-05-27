<script setup lang="ts">
import type {
  LineSeriesOption,
  PieSeriesOption,
  BarSeriesOption,
  RadarSeriesOption,
} from 'echarts/charts'
import type {
  GridComponentOption,
  LegendComponentOption,
  TitleComponentOption,
  TooltipComponentOption,
} from 'echarts/components'
import type { ComposeOption } from 'echarts/core'
import VChart from 'vue-echarts'
import { YUME_KAWAII_CHART_THEME } from '@/lib/charts/theme'
import '@/lib/charts/register'

export type YumeChartOption = ComposeOption<
  | LineSeriesOption
  | PieSeriesOption
  | BarSeriesOption
  | RadarSeriesOption
  | GridComponentOption
  | LegendComponentOption
  | TitleComponentOption
  | TooltipComponentOption
>

const props = withDefaults(defineProps<{
  option?: YumeChartOption
  loading?: boolean
  empty?: boolean
  error?: string | null
  label?: string
  minHeight?: number
}>(), {
  loading: false,
  empty: false,
  error: null,
  label: '旅行数据图表',
  minHeight: 280,
})
</script>

<template>
  <section
    data-base-chart
    role="img"
    :aria-label="label"
    :aria-busy="loading"
    :style="{ minHeight: `${minHeight}px`, height: `${minHeight}px` }"
    class="relative w-full"
  >
    <div
      v-if="error"
      role="alert"
      data-state="error"
      class="flex h-full min-h-[inherit] flex-col items-center justify-center gap-2 p-4 text-center"
    >
      <p class="text-sm font-medium text-[var(--color-ink-strong)]">
        {{ error }}
      </p>
    </div>

    <div
      v-else-if="empty"
      role="status"
      aria-live="polite"
      data-state="empty"
      class="flex h-full min-h-[inherit] flex-col items-center justify-center gap-2 p-4 text-center"
    >
      <h3 class="text-base font-semibold text-[var(--color-ink-strong)]">
        还没有旅行记录
      </h3>
      <p class="text-sm text-[var(--color-ink-muted)]">
        先回到地图，选择一个真实地点留下第一枚足迹。
      </p>
    </div>

    <div
      v-else-if="loading"
      role="status"
      aria-live="polite"
      data-state="loading"
      class="flex h-full min-h-[inherit] flex-col items-center justify-center gap-3 p-4"
    >
      <div class="h-32 w-full animate-pulse rounded-[var(--radius-card)] bg-[var(--color-accent)]/10" />
      <div class="h-4 w-2/3 animate-pulse rounded bg-[var(--color-accent)]/10" />
    </div>

    <VChart
      v-else
      class="base-chart__canvas"
      :option="option"
      :theme="YUME_KAWAII_CHART_THEME"
      :autoresize="{ throttle: 100 }"
      style="width: 100%; height: 100%;"
    />
  </section>
</template>
