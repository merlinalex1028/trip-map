<script setup lang="ts">
import UiPrimitiveShowcase from '@/components/showcase/UiPrimitiveShowcase.vue'
import UiIconShowcase from '@/components/showcase/UiIconShowcase.vue'
import UiChartShowcase from '@/components/showcase/UiChartShowcase.vue'
</script>

<template>
  <div class="min-h-screen bg-[var(--color-page)] p-6">
    <h1 class="mb-2 text-2xl font-bold text-[var(--color-ink-strong)]">
      UI Primitives
    </h1>
    <p class="mb-8 text-[var(--color-ink-muted)]">
      Yume Kawaii Theme
    </p>

    <div class="space-y-10">
      <UiPrimitiveShowcase />
      <UiIconShowcase />
      <UiChartShowcase />
    </div>
  </div>
</template>
