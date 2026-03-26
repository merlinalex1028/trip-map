<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from 'vue'

import type { GeoCityCandidate } from '../../types/geo'
import type { MapPointDisplay, SummarySurfaceState } from '../../types/map-point'
import PointSummaryCard from './PointSummaryCard.vue'

const props = withDefaults(
  defineProps<{
    surface: SummarySurfaceState
    anchorSource: 'marker' | 'pending' | 'boundary'
    floatingStyles?: Record<string, string> | null
    findSavedPointByCityId?: (cityId: string) => MapPointDisplay | null
  }>(),
  {
    floatingStyles: null,
    findSavedPointByCityId: undefined
  }
)

const emit = defineEmits<{
  confirmCandidate: [candidate: GeoCityCandidate]
  continueFallback: []
  savePoint: []
  openDetail: []
  editPoint: []
  toggleFeatured: []
  confirmDestructive: [action: 'delete' | 'hide']
}>()

const titleRef = useTemplateRef<HTMLElement>('title')
const popupTitleId = 'map-context-popup-title'

const popupTitle = computed(() => {
  if (props.surface.mode === 'candidate-select') {
    return props.surface.fallbackPoint.name
  }

  return props.surface.point.name
})

const popupStyles = computed(() => ({
  '--map-context-popup-min-width': '280px',
  '--map-context-popup-max-width': '360px',
  ...(props.floatingStyles ?? {})
}))

async function focusEntryPoint() {
  await nextTick()
  titleRef.value?.focus()
}

watch(
  () => [
    props.surface.mode,
    props.surface.mode === 'candidate-select'
      ? props.surface.fallbackPoint.id
      : props.surface.point.id
  ],
  () => {
    void focusEntryPoint()
  },
  {
    immediate: true
  }
)
</script>

<template>
  <aside
    class="map-context-popup"
    role="dialog"
    aria-modal="false"
    :aria-labelledby="popupTitleId"
    :data-popup-anchor-source="anchorSource"
    :style="popupStyles"
  >
    <div class="map-context-popup__arrow" aria-hidden="true"></div>
    <h2
      :id="popupTitleId"
      ref="title"
      class="map-context-popup__title"
      tabindex="-1"
    >
      {{ popupTitle }}
    </h2>
    <PointSummaryCard
      :surface="surface"
      :find-saved-point-by-city-id="findSavedPointByCityId"
      @confirm-candidate="emit('confirmCandidate', $event)"
      @continue-with-fallback="emit('continueFallback')"
      @save-draft="emit('savePoint')"
      @open-drawer="emit('openDetail')"
      @enter-edit="emit('editPoint')"
      @toggle-featured="emit('toggleFeatured')"
      @delete-point="emit('confirmDestructive', 'delete')"
      @hide-point="emit('confirmDestructive', 'hide')"
    />
  </aside>
</template>

<style scoped>
.map-context-popup {
  position: absolute;
  z-index: 4;
  min-width: var(--map-context-popup-min-width);
  max-width: var(--map-context-popup-max-width);
  filter: drop-shadow(0 18px 28px rgba(73, 49, 31, 0.16));
}

.map-context-popup__arrow {
  position: absolute;
  left: 1.5rem;
  top: 100%;
  width: 1rem;
  height: 1rem;
  border-right: 1px solid rgba(200, 100, 59, 0.4);
  border-bottom: 1px solid rgba(200, 100, 59, 0.4);
  background: color-mix(in srgb, var(--color-surface) 90%, white 10%);
  transform: translateY(-50%) rotate(45deg);
}

.map-context-popup__title {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
