<script setup lang="ts">
import KawaiiIcon from '@/components/common/KawaiiIcon.vue'

const icons = [
  { name: 'map' as const, label: '世界足迹' },
  { name: 'journal' as const, label: '旅途手账' },
  { name: 'memories' as const, label: '旅途回忆' },
  { name: 'calendar' as const, label: '日历' },
  { name: 'star' as const, label: '星星' },
  { name: 'camera' as const, label: '相机' },
  { name: 'badge' as const, label: '奖章' },
  { name: 'pin' as const, label: '地点' },
]
</script>

<template>
  <section class="space-y-3">
    <h2 class="text-lg font-semibold text-[var(--color-ink-strong)]">
      Semantic Icons
    </h2>
    <div class="flex flex-wrap gap-4">
      <div
        v-for="item in icons"
        :key="item.name"
        class="flex flex-col items-center gap-1"
      >
        <KawaiiIcon
          :name="item.name"
          :label="item.label"
          :decorative="false"
          :size="32"
        />
        <span class="text-xs text-[var(--color-ink-muted)]">{{ item.label }}</span>
      </div>
    </div>
  </section>
</template>
