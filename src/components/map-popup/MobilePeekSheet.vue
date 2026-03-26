<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from 'vue'

import type { GeoCityCandidate } from '../../types/geo'
import type { MapPointDisplay, SummarySurfaceState } from '../../types/map-point'
import PointSummaryCard from './PointSummaryCard.vue'

const props = defineProps<{
  surface: SummarySurfaceState
  findSavedPointByCityId?: (cityId: string) => MapPointDisplay | null
}>()

const emit = defineEmits<{
  close: []
  confirmCandidate: [candidate: GeoCityCandidate]
  continueFallback: []
  savePoint: []
  openDetail: []
  editPoint: []
  toggleFeatured: []
  confirmDestructive: [action: 'delete' | 'hide']
}>()

const titleRef = useTemplateRef<HTMLElement>('title')
const peekTitleId = 'mobile-peek-sheet-title'

const peekTitle = computed(() => {
  if (props.surface.mode === 'candidate-select') {
    return props.surface.fallbackPoint.name
  }

  return props.surface.point.name
})

const peekStyles = computed(() => ({
  '--mobile-peek-safe-bottom': 'max(16px, env(safe-area-inset-bottom))',
  '--mobile-peek-max-height': 'min(32rem, calc(100vh - 8.5rem))'
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
    class="mobile-peek-sheet"
    role="dialog"
    aria-modal="false"
    :aria-labelledby="peekTitleId"
    :style="peekStyles"
  >
    <div class="mobile-peek-sheet__chrome">
      <h2
        :id="peekTitleId"
        ref="title"
        class="mobile-peek-sheet__title"
        tabindex="-1"
      >
        {{ peekTitle }}
      </h2>
      <button class="mobile-peek-sheet__close" type="button" @click="emit('close')">
        关闭
      </button>
    </div>
    <div class="mobile-peek-sheet__body">
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
    </div>
  </aside>
</template>

<style scoped>
.mobile-peek-sheet {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: var(--mobile-peek-max-height);
  min-height: 0;
  overflow: hidden;
  pointer-events: auto;
}

.mobile-peek-sheet__chrome {
  display: flex;
  justify-content: flex-end;
}

.mobile-peek-sheet__body {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  padding-bottom: var(--mobile-peek-safe-bottom);
}

.mobile-peek-sheet__close {
  min-width: 44px;
  min-height: 44px;
  padding: 0.65rem 0.95rem;
  border: 1px solid rgba(143, 117, 80, 0.42);
  background: rgba(252, 247, 236, 0.94);
  color: var(--color-ink-strong);
  cursor: pointer;
}

.mobile-peek-sheet__close:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 72%, white 28%);
  outline-offset: 3px;
}

.mobile-peek-sheet__title {
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
