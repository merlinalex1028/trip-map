<script setup lang="ts">
import type { TravelPopularFootprint } from '@trip-map/contracts'
import { computed } from 'vue'

const props = defineProps<{
  items: TravelPopularFootprint[]
}>()

const visibleItems = computed(() => props.items.slice(0, 5))
</script>

<template>
  <section
    data-region="popular-footprints"
    class="grid gap-3 rounded-[24px] border border-white/80 bg-white/74 p-4 shadow-[var(--shadow-float)] md:p-5"
  >
    <div class="space-y-1">
      <h3 class="text-2xl font-semibold leading-tight text-[var(--color-ink-strong)]">
        热门足迹排行
      </h3>
      <p class="text-sm leading-5 text-[var(--color-ink-muted)]">
        按真实重访次数排列，保留最近一次旅行日期作为回忆锚点。
      </p>
    </div>

    <ol class="grid gap-3">
      <li
        v-for="(item, index) in visibleItems"
        :key="item.placeId"
        data-rank-row
        class="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-[22px] border border-white/80 bg-white/72 p-3"
      >
        <span
          class="inline-flex h-11 min-w-11 items-center justify-center rounded-[18px] bg-[var(--color-accent)]/12 px-2 text-sm font-semibold text-[var(--color-accent-strong)]"
        >
          No.{{ index + 1 }}
        </span>
        <span class="grid min-w-0 gap-1">
          <span class="truncate text-base font-semibold text-[var(--color-ink-strong)]">
            {{ item.displayName }}
          </span>
          <span
            v-if="item.parentLabel"
            class="truncate text-sm text-[var(--color-ink-muted)]"
          >
            {{ item.parentLabel }}
          </span>
          <span class="flex flex-wrap gap-2 text-sm font-semibold text-[var(--color-ink-muted)]">
            <span>{{ item.visitCount }} 次足迹</span>
            <span>{{ item.latestVisitDate ?? '旅行日期待补充' }}</span>
          </span>
        </span>
      </li>
    </ol>
  </section>
</template>
