<script setup lang="ts">
import { computed } from 'vue'

import type { TimelineEntry } from '../../services/timeline'

const props = defineProps<{
  entry: TimelineEntry
}>()

const secondaryLabel = computed(() => props.entry.subtitle || props.entry.parentLabel)

const dateLabel = computed(() => {
  if (props.entry.startDate === null) {
    return '日期未知'
  }

  if (props.entry.endDate !== null) {
    return `${props.entry.startDate} - ${props.entry.endDate}`
  }

  return props.entry.startDate
})
</script>

<template>
  <article
    class="grid gap-4 rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,246,250,0.94))] p-5 shadow-[var(--shadow-float)]"
    data-region="timeline-entry"
  >
    <header class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
      <div class="min-w-0 space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-xl font-semibold text-[var(--color-ink-strong)]">
            {{ entry.displayName }}
          </h3>
          <span
            class="inline-flex items-center rounded-full border border-[#d6ebf2] bg-[#effafc] px-3 py-1 text-xs font-semibold text-[var(--color-ink-strong)]"
          >
            {{ entry.typeLabel }}
          </span>
        </div>
        <p class="text-sm leading-6 text-[var(--color-ink-muted)]">
          {{ secondaryLabel }}
        </p>
      </div>

      <p
        class="inline-flex w-fit items-center rounded-full border border-white/85 bg-white/88 px-3 py-1 text-xs font-semibold text-[var(--color-ink-soft)]"
      >
        <template v-if="entry.visitCount > 1">第 {{ entry.visitOrdinal }} 次 / 共 {{ entry.visitCount }} 次</template>
        <template v-else>首次记录</template>
      </p>
    </header>

    <div class="grid gap-3 md:grid-cols-2">
      <div class="rounded-[22px] border border-white/85 bg-white/78 p-4">
        <p class="text-[0.72rem] font-semibold tracking-[0.08em] text-[var(--color-ink-soft)] uppercase">
          旅行日期
        </p>
        <p class="mt-2 text-base font-semibold text-[var(--color-ink-strong)]">
          {{ dateLabel }}
        </p>
      </div>

      <div class="rounded-[22px] border border-white/85 bg-white/78 p-4">
        <p class="text-[0.72rem] font-semibold tracking-[0.08em] text-[var(--color-ink-soft)] uppercase">
          国家 / 地区
        </p>
        <p class="mt-2 text-base font-semibold text-[var(--color-ink-strong)]">
          {{ entry.parentLabel }}
        </p>
      </div>
    </div>
  </article>
</template>
