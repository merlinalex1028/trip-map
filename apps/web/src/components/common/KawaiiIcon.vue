<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { semanticIconMap, type KawaiiIconName } from '@/lib/icons/semantic-icons'
import '@/lib/icons/registry'

const props = withDefaults(defineProps<{
  name: KawaiiIconName
  label?: string
  decorative?: boolean
  size?: number
}>(), {
  decorative: true,
  size: 24,
})

const entry = computed(() => semanticIconMap[props.name])
</script>

<template>
  <span
    data-kawaii-icon
    :data-icon-name="name"
    :style="{ width: `${size}px`, height: `${size}px`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }"
  >
    <template v-if="entry.kind === 'asset'">
      <img
        :src="entry.src"
        :alt="decorative ? '' : label"
        :aria-hidden="decorative ? 'true' : undefined"
        :width="size"
        :height="size"
        style="display: block; width: 100%; height: 100%; object-fit: contain;"
      >
    </template>
    <template v-else>
      <Icon
        :icon="entry.icon"
        :width="size"
        :height="size"
        :aria-hidden="decorative ? 'true' : undefined"
        :aria-label="!decorative && label ? label : undefined"
      />
    </template>
  </span>
</template>
