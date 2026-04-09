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
    class="map-context-popup absolute z-[4] flex min-h-0 min-w-[var(--map-context-popup-min-width)] max-w-[var(--map-context-popup-max-width)] flex-col overflow-visible rounded-[32px] border border-white/70 bg-white/75 p-1 shadow-[0_16px_34px_rgba(155,116,160,0.12)] backdrop-blur-xl"
    role="dialog"
    aria-modal="false"
    :aria-labelledby="popupTitleId"
    :data-popup-anchor-source="anchorSource"
    data-kawaii-shell="light"
    :style="popupStyles"
    @click.stop
  >
    <div
      class="map-context-popup__arrow pointer-events-none absolute left-6 top-full h-[1.08rem] w-[1.08rem] -translate-y-1/2 rotate-45 rounded-[0.18rem] border-b border-r border-white/70 bg-white/75 shadow-[4px_8px_16px_rgba(155,116,160,0.1)] backdrop-blur-xl"
      data-kawaii-arrow="light"
      aria-hidden="true"
    ></div>
    <h2
      :id="popupTitleId"
      ref="title"
      class="map-context-popup__title sr-only"
      tabindex="-1"
    >
      {{ popupTitle }}
    </h2>
    <div
      class="map-context-popup__body flex min-h-0 max-h-full flex-1 overflow-hidden rounded-[28px]"
      data-kawaii-body="card-slot"
    >
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
