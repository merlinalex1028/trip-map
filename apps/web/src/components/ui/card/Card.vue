<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-white/80 backdrop-blur-xl text-[var(--color-ink-strong)] flex flex-col gap-6 rounded-[var(--radius-card)] border border-white/60 py-6 shadow-[var(--shadow-surface)]',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
