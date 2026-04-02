<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch, type CSSProperties } from 'vue'

import type { GeoCityCandidate } from '../../types/geo'
import type { MapPointDisplay, SummarySurfaceState } from '../../types/map-point'
import PointSummaryCard from './PointSummaryCard.vue'

const props = withDefaults(
  defineProps<{
    surface: SummarySurfaceState
    anchorSource: 'marker' | 'pending' | 'boundary'
    floatingStyles?: CSSProperties | null
    findSavedPointByCityId?: (cityId: string) => MapPointDisplay | null
    isSaved?: boolean
    isPending?: boolean
    isIlluminatable?: boolean
  }>(),
  {
    floatingStyles: null,
    findSavedPointByCityId: undefined,
    isSaved: false,
    isPending: false,
    isIlluminatable: true,
  }
)

const emit = defineEmits<{
  confirmCandidate: [candidate: GeoCityCandidate]
  continueFallback: []
  illuminate: []
  unilluminate: []
}>()

const popupRef = useTemplateRef<HTMLElement>('popup')
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

function getPopupElement() {
  return popupRef.value
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

defineExpose({
  getPopupElement
})
</script>

<template>
  <aside
    ref="popup"
    class="map-context-popup"
    role="dialog"
    aria-modal="false"
    :aria-labelledby="popupTitleId"
    :data-popup-anchor-source="anchorSource"
    :style="popupStyles"
    @click.stop
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
    <div class="map-context-popup__body">
      <PointSummaryCard
        :surface="surface"
        :find-saved-point-by-city-id="findSavedPointByCityId"
        :is-saved="isSaved"
        :is-pending="isPending"
        :is-illuminatable="isIlluminatable"
        @confirm-candidate="emit('confirmCandidate', $event)"
        @continue-with-fallback="emit('continueFallback')"
        @illuminate="emit('illuminate')"
        @unilluminate="emit('unilluminate')"
      />
    </div>
  </aside>
</template>

<style scoped>
.map-context-popup {
  position: absolute;
  z-index: 4;
  display: flex;
  flex-direction: column;
  min-width: var(--map-context-popup-min-width);
  max-width: var(--map-context-popup-max-width);
  min-height: 0;
  padding: 0.3rem;
  border: 1px solid rgba(199, 171, 200, 0.52);
  border-radius: calc(var(--radius-surface) + 4px);
  background: linear-gradient(180deg, rgba(255, 250, 252, 0.96), rgba(232, 244, 251, 0.92));
  overflow: hidden;
  box-shadow: var(--shadow-stage);
}

.map-context-popup__body {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
  overflow: hidden;
  border-radius: var(--radius-surface);
}

.map-context-popup__arrow {
  position: absolute;
  left: 1.5rem;
  top: 100%;
  width: 1rem;
  height: 1rem;
  border-right: 1px solid rgba(199, 171, 200, 0.52);
  border-bottom: 1px solid rgba(199, 171, 200, 0.52);
  background: linear-gradient(180deg, rgba(255, 250, 252, 0.96), rgba(232, 244, 251, 0.92));
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
