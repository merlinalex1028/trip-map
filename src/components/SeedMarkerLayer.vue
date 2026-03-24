<script setup lang="ts">
import { useMapPointsStore } from '../stores/map-points'
import type { MapPointDisplay } from '../types/map-point'

const props = defineProps<{
  points: MapPointDisplay[]
  selectedPointId: string | null
}>()

const { selectPointById } = useMapPointsStore()

function handlePointSelect(point: MapPointDisplay) {
  selectPointById(point.id)
}
</script>

<template>
  <div class="seed-marker-layer" aria-label="Preview points">
    <div
      v-for="point in points"
      :key="point.id"
      class="seed-marker"
      :class="{
        'seed-marker--selected': point.id === props.selectedPointId,
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
        :aria-pressed="point.id === props.selectedPointId"
        :aria-label="`查看 ${point.name}`"
        @click="handlePointSelect(point)"
      >
        <span class="seed-marker__dot" aria-hidden="true"></span>
      </button>
      <span
        v-if="point.isFeatured || point.id === props.selectedPointId"
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

.seed-marker__button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 72%, white 28%);
  outline-offset: 4px;
}

.seed-marker__dot {
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(63, 47, 36, 0.35);
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 246, 221, 0.95), rgba(200, 100, 59, 0.9));
  box-shadow:
    0 0 0 7px rgba(200, 100, 59, 0.11),
    0 0 18px rgba(200, 100, 59, 0.18);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease;
}

.seed-marker__button:hover .seed-marker__dot,
.seed-marker__button:focus-visible .seed-marker__dot {
  transform: scale(1.08);
  box-shadow:
    0 0 0 8px rgba(200, 100, 59, 0.16),
    0 0 20px rgba(200, 100, 59, 0.26);
}

.seed-marker--saved .seed-marker__dot {
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 246, 221, 0.98), rgba(111, 122, 91, 0.95));
  box-shadow:
    0 0 0 6px rgba(111, 122, 91, 0.11),
    0 0 16px rgba(111, 122, 91, 0.16);
}

.seed-marker--draft .seed-marker__dot {
  border-color: rgba(200, 100, 59, 0.6);
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 249, 232, 0.98), rgba(200, 100, 59, 0.98));
  box-shadow:
    0 0 0 7px rgba(200, 100, 59, 0.18),
    0 0 20px rgba(200, 100, 59, 0.28);
}

.seed-marker--selected .seed-marker__dot,
.seed-marker__button--selected .seed-marker__dot {
  border-color: rgba(200, 100, 59, 0.9);
  box-shadow:
    0 0 0 4px rgba(252, 247, 236, 0.92),
    0 0 0 10px rgba(200, 100, 59, 0.36),
    0 0 24px rgba(200, 100, 59, 0.42);
}

.seed-marker__label {
  position: absolute;
  top: 0.9rem;
  left: 0.9rem;
  align-self: start;
  width: max-content;
  max-width: 10rem;
  padding: 0.35rem 0.55rem;
  border: 1px solid rgba(200, 100, 59, 0.45);
  background: rgba(252, 247, 236, 0.92);
  color: var(--color-ink-strong);
  font-size: var(--font-label-size);
  line-height: 1.2;
  box-shadow: 0 8px 18px rgba(73, 49, 31, 0.08);
  pointer-events: none;
}

.seed-marker--selected .seed-marker__label {
  border-color: rgba(200, 100, 59, 0.72);
}
</style>
