<script setup lang="ts">
import type { YumeChartOption } from '@/components/common/BaseChart.vue'
import BaseChart from '@/components/common/BaseChart.vue'

const demoOption: YumeChartOption = {
  title: { text: '月度旅行趋势', left: 'center' },
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
  yAxis: { type: 'value' },
  series: [{ type: 'line', data: [2, 4, 3, 5, 7, 6], smooth: true }],
}
</script>

<template>
  <section class="space-y-3">
    <h2 class="text-lg font-semibold text-[var(--color-ink-strong)]">
      Chart Foundation
    </h2>
    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <p class="mb-1 text-sm text-[var(--color-ink-muted)]">
          Demo Line Chart
        </p>
        <BaseChart :option="demoOption" />
      </div>
      <div>
        <p class="mb-1 text-sm text-[var(--color-ink-muted)]">
          Loading
        </p>
        <BaseChart loading />
      </div>
      <div>
        <p class="mb-1 text-sm text-[var(--color-ink-muted)]">
          Empty
        </p>
        <BaseChart empty />
      </div>
      <div>
        <p class="mb-1 text-sm text-[var(--color-ink-muted)]">
          Error
        </p>
        <BaseChart error="暂时没有加载成功，请稍后重试。" />
      </div>
    </div>
  </section>
</template>
