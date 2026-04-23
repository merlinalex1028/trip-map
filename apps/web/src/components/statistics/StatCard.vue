<script setup lang="ts">
interface Props {
  label: string
  value: number
  unit: string
  gradient: string
}

defineProps<Props>()
</script>

<template>
  <article
    class="grid gap-3 rounded-[28px] border border-white/80 p-5 shadow-[var(--shadow-float)]"
    :style="{ background: gradient }"
    data-region="stat-card"
  >
    <p
      class="text-[0.72rem] font-semibold tracking-[0.10em] text-[var(--color-ink-soft)] uppercase"
      data-stat="label"
    >
      {{ label }}
    </p>
    <div class="space-y-1">
      <p
        class="text-[clamp(2rem,3.5vw,3rem)] font-bold leading-[1.2] text-[var(--color-ink-strong)]"
        data-stat="value"
      >
        {{ value }}
      </p>
      <p
        class="text-[length:var(--font-label-size)] font-semibold text-[var(--color-ink-muted)]"
        data-stat="unit"
      >
        {{ unit }}
      </p>
    </div>
  </article>
</template>
