<script setup lang="ts">
import type { TravelMemoryPostcardSeed } from '@trip-map/contracts'
import { computed } from 'vue'

import JournalPostcardThumb from '@/components/timeline/JournalPostcardThumb.vue'

type MemoryPostcardVariant = 'river' | 'kyoto' | 'paris' | 'shanghai'

const POSTCARD_VARIANTS: readonly MemoryPostcardVariant[] = [
  'river',
  'kyoto',
  'paris',
  'shanghai',
]

const props = defineProps<{
  items: TravelMemoryPostcardSeed[]
}>()

function getStableVariant(item: TravelMemoryPostcardSeed): MemoryPostcardVariant {
  const source = `${item.placeId}|${item.displayName}|${item.parentLabel ?? ''}`
  let hash = 0

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0
  }

  return POSTCARD_VARIANTS[hash % POSTCARD_VARIANTS.length]
}

const postcardItems = computed(() =>
  props.items.map(item => ({
    ...item,
    variant: getStableVariant(item),
  })),
)
const hasPostcards = computed(() => postcardItems.value.length > 0)
const helperCopy = computed(() =>
  hasPostcards.value
    ? '最近带日期的足迹被整理成一排可以慢慢翻看的回忆卡。'
    : '补充旅行日期后，这里会出现最近的回忆卡。',
)
</script>

<template>
  <section
    data-region="memory-postcard-strip"
    class="grid gap-3 rounded-[24px] border border-white/80 bg-white/74 p-4 shadow-[var(--shadow-float)] md:p-5"
  >
    <div class="space-y-1">
      <h3 class="text-2xl font-semibold leading-tight text-[var(--color-ink-strong)]">
        珍藏回忆瞬间
      </h3>
      <p class="text-sm leading-5 text-[var(--color-ink-muted)]">
        {{ helperCopy }}
      </p>
    </div>

    <div
      v-if="hasPostcards"
      data-postcard-strip
      aria-label="珍藏回忆瞬间"
      tabindex="0"
      class="flex gap-4 overflow-x-auto pb-2"
    >
      <article
        v-for="item in postcardItems"
        :key="item.recordId"
        class="grid w-[220px] shrink-0 gap-3 rounded-[22px] border border-white/80 bg-white/72 p-3"
      >
        <JournalPostcardThumb :variant="item.variant" />
        <div class="grid gap-1">
          <p class="truncate text-base font-semibold text-[var(--color-ink-strong)]">
            {{ item.displayName }}
          </p>
          <p
            v-if="item.parentLabel"
            class="truncate text-sm text-[var(--color-ink-muted)]"
          >
            {{ item.parentLabel }}
          </p>
          <p class="text-sm font-semibold text-[var(--color-ink-muted)]">
            {{ item.startDate }}
          </p>
        </div>
      </article>
    </div>
    <p
      v-else
      data-postcard-empty
      class="rounded-[18px] border border-white/80 bg-white/72 px-3 py-2 text-sm leading-5 text-[var(--color-ink-muted)]"
    >
      给足迹补充旅行日期后，最近的回忆卡会出现在这里。
    </p>
  </section>
</template>
