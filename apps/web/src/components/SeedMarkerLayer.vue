<script setup lang="ts">
import { computed, shallowRef } from 'vue'

import { useMapPointsStore } from '../../../../src/stores/map-points'
import type { MapPointDisplay } from '../../../../src/types/map-point'

const props = defineProps<{
  points: MapPointDisplay[]
  selectedPointId: string | null
}>()

const { selectPointById } = useMapPointsStore()
const hoveredPointId = shallowRef<string | null>(null)
const focusedPointId = shallowRef<string | null>(null)
const hasSelection = computed(() => Boolean(props.selectedPointId))

function getMarkerState(point: MapPointDisplay) {
  if (point.id === props.selectedPointId) {
    return 'selected'
  }

  if (point.source === 'detected') {
    return 'draft'
  }

  if (point.source === 'saved') {
    return 'saved'
  }

  return 'neutral'
}

function handlePointSelect(point: MapPointDisplay) {
  selectPointById(point.id)
}

function buildAriaLabel(point: MapPointDisplay) {
  const parts = [point.name, point.countryName, point.coordinatesLabel]

  if (point.source === 'detected') {
    parts.push('未保存地点')
  }

  return parts.join('，')
}

function isLabelVisible(point: MapPointDisplay) {
  return (
    point.isFeatured ||
    point.id === props.selectedPointId ||
    point.id === hoveredPointId.value ||
    point.id === focusedPointId.value
  )
}

function handlePointMouseEnter(pointId: string) {
  hoveredPointId.value = pointId
}

function handlePointMouseLeave(pointId: string) {
  if (hoveredPointId.value === pointId) {
    hoveredPointId.value = null
  }
}

function handlePointFocus(pointId: string) {
  focusedPointId.value = pointId
}

function handlePointBlur(pointId: string) {
  if (focusedPointId.value === pointId) {
    focusedPointId.value = null
  }
}
</script>

<template>
  <div class="seed-marker-layer" aria-label="Preview points">
    <div
      v-for="point in points"
      :key="point.id"
      class="seed-marker"
      :data-marker-state="getMarkerState(point)"
      :class="{
        'seed-marker--selected': point.id === props.selectedPointId,
        'seed-marker--dimmed': hasSelection && point.id !== props.selectedPointId,
        'seed-marker--featured': point.isFeatured,
        'seed-marker--saved': point.source === 'saved',
        'seed-marker--draft': point.source === 'detected'
      }"
      :style="{
        left: `${point.x * 100}%`,
        top: `${point.y * 100}%`
      }"
    >
      <button
        class="seed-marker__button"
        :class="{
          'seed-marker__button--selected': point.id === props.selectedPointId
        }"
        type="button"
        :data-point-id="point.id"
        :aria-pressed="point.id === props.selectedPointId"
        :aria-label="buildAriaLabel(point)"
        @click="handlePointSelect(point)"
        @mouseenter="handlePointMouseEnter(point.id)"
        @mouseleave="handlePointMouseLeave(point.id)"
        @focus="handlePointFocus(point.id)"
        @blur="handlePointBlur(point.id)"
      >
        <span class="seed-marker__dot" aria-hidden="true"></span>
      </button>
      <span
        v-if="isLabelVisible(point)"
        class="seed-marker__label"
      >
        {{ point.name }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.seed-marker-layer {
  position: absolute;
  inset: 0;
}

.seed-marker {
  position: absolute;
  width: 0;
  height: 0;
}

.seed-marker--saved {
  z-index: 1;
}

.seed-marker--selected {
  z-index: 2;
}

.seed-marker__button {
  /* Keep the geographic anchor on the dot itself so labels never shift marker position. */
  position: absolute;
  left: 0;
  top: 0;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform: translate(-50%, -50%);
}

.seed-marker--dimmed .seed-marker__button {
  z-index: 0;
}

.seed-marker__button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 72%, white 28%);
  outline-offset: 4px;
}

.seed-marker__dot {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-state-neutral-outline);
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), var(--color-state-neutral));
  box-shadow:
    0 0 0 5px rgba(216, 200, 188, 0.26),
    0 0 14px rgba(125, 113, 133, 0.14);
  transition:
    transform var(--motion-quick) ease,
    box-shadow var(--motion-quick) ease,
    border-color var(--motion-quick) ease;
}

.seed-marker__button:hover .seed-marker__dot,
.seed-marker__button:focus-visible .seed-marker__dot {
  transform: scale(1.05);
  box-shadow:
    0 0 0 6px rgba(216, 200, 188, 0.34),
    0 0 18px rgba(125, 113, 133, 0.2);
}

.seed-marker--saved .seed-marker__dot {
  border-color: rgba(132, 199, 216, 0.82);
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.96), var(--color-state-saved));
  box-shadow:
    0 0 0 4px rgba(132, 199, 216, 0.14),
    0 0 12px rgba(132, 199, 216, 0.2);
}

.seed-marker--draft .seed-marker__dot {
  border-color: rgba(244, 143, 177, 0.72);
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.98), var(--color-state-selected));
  box-shadow:
    0 0 0 6px rgba(255, 220, 232, 0.42),
    0 0 18px rgba(244, 143, 177, 0.26);
  animation: draft-marker-pulse 1.75s ease-in-out infinite;
}

.seed-marker--dimmed .seed-marker__dot {
  opacity: 0.62;
  box-shadow:
    0 0 0 4px rgba(216, 200, 188, 0.12),
    0 0 8px rgba(125, 113, 133, 0.1);
}

.seed-marker--selected .seed-marker__dot,
.seed-marker__button--selected .seed-marker__dot {
  border-color: rgba(244, 143, 177, 0.96);
  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.9),
    0 0 0 7px rgba(255, 220, 232, 0.58),
    0 0 18px rgba(244, 143, 177, 0.3);
}

.seed-marker__label {
  position: absolute;
  top: 0.9rem;
  left: 0.9rem;
  align-self: start;
  width: max-content;
  max-width: 10rem;
  padding: 0.35rem 0.55rem;
  border: 1px solid var(--color-state-neutral-outline);
  border-radius: var(--radius-pill);
  background: rgba(255, 250, 252, 0.92);
  color: var(--color-ink-strong);
  font-size: var(--font-label-size);
  line-height: 1.2;
  box-shadow: 0 8px 18px rgba(120, 86, 122, 0.12);
  pointer-events: none;
}

.seed-marker--saved .seed-marker__label {
  border-color: rgba(132, 199, 216, 0.72);
  background: rgba(223, 244, 248, 0.92);
}

.seed-marker--selected .seed-marker__label {
  border-color: rgba(244, 143, 177, 0.82);
  background: rgba(255, 220, 232, 0.92);
}

.seed-marker--draft .seed-marker__label {
  border-color: rgba(244, 143, 177, 0.62);
  background: rgba(255, 236, 244, 0.92);
}

@keyframes draft-marker-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow:
      0 0 0 7px rgba(255, 220, 232, 0.34),
      0 0 20px rgba(244, 143, 177, 0.24);
  }

  50% {
    transform: scale(1.08);
    box-shadow:
      0 0 0 9px rgba(255, 220, 232, 0.42),
      0 0 24px rgba(244, 143, 177, 0.32);
  }
}

@media (prefers-reduced-motion: reduce) {
  .seed-marker__dot {
    transition: none;
  }

  .seed-marker--draft .seed-marker__dot {
    animation: none;
  }
}
</style>
