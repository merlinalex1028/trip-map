<script setup lang="ts">
import { computed, shallowRef } from 'vue'

import { useMapPointsStore } from '../stores/map-points'
import type { MapPointDisplay } from '../types/map-point'

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

.seed-marker__button::before,
.seed-marker__button::after {
  content: '';
  position: absolute;
  inset: 50% auto auto 50%;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition:
    transform var(--motion-quick) ease,
    opacity var(--motion-quick) ease,
    box-shadow var(--motion-quick) ease;
}

.seed-marker__button::before {
  width: 1.5rem;
  height: 1.5rem;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.92) 0 28%, rgba(255, 215, 234, 0.14) 58%, transparent 72%);
  opacity: 0.86;
}

.seed-marker__button::after {
  width: 2rem;
  height: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow: 0 0 0 1px rgba(216, 189, 217, 0.18);
  opacity: 0.44;
}

.seed-marker--dimmed .seed-marker__button {
  z-index: 0;
}

.seed-marker__button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 72%, white 28%);
  outline-offset: 4px;
}

.seed-marker__dot {
  position: relative;
  width: 0.92rem;
  height: 0.92rem;
  border-radius: var(--radius-pill);
  border: 1px solid color-mix(in srgb, var(--color-state-neutral-outline) 78%, white 22%);
  background: var(--gradient-neutral);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    0 0 0 6px rgba(255, 248, 238, 0.76),
    0 12px 16px rgba(125, 113, 133, 0.16);
  transition:
    transform var(--motion-quick) ease,
    box-shadow var(--motion-quick) ease,
    border-color var(--motion-quick) ease,
    background var(--motion-quick) ease;
}

.seed-marker__button:hover .seed-marker__dot,
.seed-marker__button:focus-visible .seed-marker__dot {
  transform: scale(1.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 0 0 8px rgba(255, 248, 238, 0.84),
    0 14px 18px rgba(125, 113, 133, 0.2);
}

.seed-marker__button:hover::before,
.seed-marker__button:focus-visible::before {
  transform: translate(-50%, -50%) scale(1.08);
}

.seed-marker__button:hover::after,
.seed-marker__button:focus-visible::after {
  opacity: 0.62;
  transform: translate(-50%, -50%) scale(1.04);
}

.seed-marker--saved .seed-marker__dot {
  border-color: color-mix(in srgb, var(--color-secondary) 72%, white 28%);
  background: var(--gradient-saved);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    0 0 0 6px rgba(223, 244, 248, 0.8),
    0 14px 20px rgba(98, 185, 211, 0.24);
}

.seed-marker--saved .seed-marker__button::before {
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.9) 0 28%, rgba(164, 231, 248, 0.24) 58%, transparent 72%);
}

.seed-marker--saved .seed-marker__button::after {
  box-shadow: 0 0 0 1px rgba(98, 185, 211, 0.18);
}

.seed-marker--draft .seed-marker__dot {
  border-color: color-mix(in srgb, var(--color-accent) 72%, white 28%);
  background: var(--gradient-selected);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 0 0 7px rgba(255, 220, 232, 0.7),
    0 14px 20px rgba(244, 143, 177, 0.28);
  animation: draft-marker-pulse 1.75s ease-in-out infinite;
}

.seed-marker--draft .seed-marker__button::before {
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.92) 0 28%, rgba(255, 171, 204, 0.28) 58%, transparent 72%);
}

.seed-marker--draft .seed-marker__button::after {
  box-shadow: 0 0 0 1px rgba(255, 120, 173, 0.2);
}

.seed-marker--dimmed .seed-marker__dot {
  opacity: 0.62;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.66),
    0 0 0 5px rgba(255, 248, 238, 0.42),
    0 8px 10px rgba(125, 113, 133, 0.1);
}

.seed-marker--dimmed .seed-marker__button::before,
.seed-marker--dimmed .seed-marker__button::after {
  opacity: 0.28;
}

.seed-marker--selected .seed-marker__dot,
.seed-marker__button--selected .seed-marker__dot {
  border-color: color-mix(in srgb, var(--color-accent-strong) 74%, white 26%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 0 0 4px rgba(255, 255, 255, 0.9),
    0 0 0 9px rgba(255, 220, 232, 0.76),
    0 18px 24px rgba(244, 143, 177, 0.32);
}

.seed-marker--selected .seed-marker__button::before,
.seed-marker__button--selected::before {
  transform: translate(-50%, -50%) scale(1.08);
  opacity: 1;
}

.seed-marker--selected .seed-marker__button::after,
.seed-marker__button--selected::after {
  opacity: 0.72;
  transform: translate(-50%, -50%) scale(1.08);
  box-shadow: 0 0 0 1px rgba(255, 120, 173, 0.22);
}

.seed-marker__label {
  position: absolute;
  top: 1rem;
  left: 0.95rem;
  align-self: start;
  width: max-content;
  max-width: 10rem;
  padding: 0.42rem 0.7rem;
  border: var(--border-soft);
  border-radius: var(--radius-pill);
  background:
    var(--texture-ribbon),
    linear-gradient(180deg, rgba(255, 252, 255, 0.96), rgba(255, 248, 250, 0.92));
  color: var(--color-ink-strong);
  font-size: 0.78rem;
  line-height: 1.2;
  box-shadow: var(--shadow-button);
  pointer-events: none;
  letter-spacing: 0.02em;
}

.seed-marker--saved .seed-marker__label {
  border-color: color-mix(in srgb, var(--color-secondary) 68%, white 32%);
  background: linear-gradient(180deg, rgba(240, 252, 255, 0.96), rgba(223, 244, 248, 0.94));
}

.seed-marker--selected .seed-marker__label {
  border-color: color-mix(in srgb, var(--color-accent) 68%, white 32%);
  background: linear-gradient(180deg, rgba(255, 241, 247, 0.98), rgba(255, 220, 232, 0.94));
}

.seed-marker--draft .seed-marker__label {
  border-color: color-mix(in srgb, var(--color-accent) 64%, white 36%);
  background: linear-gradient(180deg, rgba(255, 244, 248, 0.98), rgba(255, 236, 244, 0.94));
}

@keyframes draft-marker-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.88),
      0 0 0 8px rgba(255, 220, 232, 0.56),
      0 18px 22px rgba(244, 143, 177, 0.24);
  }

  50% {
    transform: scale(1.1);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.88),
      0 0 0 11px rgba(255, 220, 232, 0.72),
      0 20px 26px rgba(244, 143, 177, 0.32);
  }
}

@media (prefers-reduced-motion: reduce) {
  .seed-marker__dot,
  .seed-marker__button::before,
  .seed-marker__button::after {
    transition: none;
  }

  .seed-marker--draft .seed-marker__dot {
    animation: none;
  }
}
</style>
