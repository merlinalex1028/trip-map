<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted } from 'vue'

import { useMapUiStore } from '../stores/map-ui'

const mapUiStore = useMapUiStore()
const { selectedPoint } = storeToRefs(mapUiStore)
const { clearSelection } = mapUiStore
const drawerBadge = computed(() => {
  return selectedPoint.value?.source === 'detected' ? '识别结果' : '查看地点'
})

function handleWindowKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    clearSelection()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleWindowKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleWindowKeydown)
})
</script>

<template>
  <aside
    v-if="selectedPoint"
    class="point-preview-drawer"
    aria-label="Point preview drawer"
    data-region="point-preview-drawer"
  >
    <button class="point-preview-drawer__close" type="button" @click="clearSelection">
      关闭
    </button>

    <div class="point-preview-drawer__body">
      <p class="point-preview-drawer__badge">{{ drawerBadge }}</p>
      <h2 class="point-preview-drawer__name">{{ selectedPoint.name }}</h2>
      <p class="point-preview-drawer__country">{{ selectedPoint.countryName }}</p>
      <p class="point-preview-drawer__coordinate">{{ selectedPoint.coordinatesLabel }}</p>
      <p class="point-preview-drawer__description">{{ selectedPoint.description }}</p>
    </div>
  </aside>
</template>

<style scoped>
.point-preview-drawer {
  position: absolute;
  inset-inline: var(--space-md);
  bottom: var(--space-md);
  z-index: 3;
  display: grid;
  gap: var(--space-lg);
  padding: var(--space-lg);
  border: 1px solid rgba(143, 117, 80, 0.62);
  background:
    linear-gradient(180deg, rgba(241, 230, 204, 0.96), rgba(230, 210, 176, 0.98)),
    var(--color-surface);
  box-shadow: 0 22px 36px rgba(73, 49, 31, 0.18);
  backdrop-filter: blur(2px);
}

.point-preview-drawer__close {
  justify-self: end;
  min-width: 44px;
  min-height: 44px;
  padding: 0 var(--space-sm);
  border: 0;
  background: transparent;
  color: var(--color-ink-muted);
  cursor: pointer;
}

.point-preview-drawer__close:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 72%, white 28%);
  outline-offset: 3px;
}

.point-preview-drawer__body {
  display: grid;
  gap: var(--space-sm);
}

.point-preview-drawer__badge {
  width: fit-content;
  margin: 0;
  padding: 0.3rem 0.6rem;
  border: 1px solid rgba(200, 100, 59, 0.55);
  color: var(--color-accent);
  font-size: var(--font-label-size);
  font-weight: var(--font-weight-label);
  line-height: var(--font-label-line-height);
}

.point-preview-drawer__name,
.point-preview-drawer__country,
.point-preview-drawer__coordinate,
.point-preview-drawer__description {
  margin: 0;
}

.point-preview-drawer__name {
  color: var(--color-ink-strong);
  font-size: var(--font-heading-size);
  font-weight: var(--font-weight-heading);
  line-height: var(--font-heading-line-height);
}

.point-preview-drawer__country,
.point-preview-drawer__coordinate {
  color: var(--color-ink-muted);
  font-size: var(--font-label-size);
  line-height: var(--font-label-line-height);
}

.point-preview-drawer__description {
  max-width: 30rem;
}

@media (min-width: 960px) {
  .point-preview-drawer {
    inset-inline: auto var(--space-lg);
    top: var(--space-lg);
    bottom: auto;
    width: min(23rem, calc(100% - var(--space-3xl)));
    min-height: 20rem;
  }
}
</style>
