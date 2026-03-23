<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { shallowRef } from 'vue'

import worldMapUrl from '../assets/world-map.svg'
import { loadPreviewPoints } from '../data/preview-points'
import { useMapUiStore } from '../stores/map-ui'
import type { MapPointDisplay } from '../types/map-point'
import SeedMarkerLayer from './SeedMarkerLayer.vue'

const previewPoints = shallowRef<MapPointDisplay[]>(loadPreviewPoints())
const mapUiStore = useMapUiStore()
const { selectedPointId } = storeToRefs(mapUiStore)
</script>

<template>
  <section
    class="world-map-stage"
    :class="{
      'world-map-stage--selected': Boolean(selectedPointId)
    }"
    data-region="map-stage"
    aria-label="World map stage"
  >
    <div class="world-map-stage__frame">
      <div class="world-map-stage__surface">
        <img class="world-map-stage__map" :src="worldMapUrl" alt="Vintage world map poster" />
        <SeedMarkerLayer :points="previewPoints" :selected-point-id="selectedPointId" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.world-map-stage {
  min-height: 60vh;
}

.world-map-stage__frame {
  min-height: 100%;
  padding: var(--space-lg);
  border: 1px solid var(--color-frame);
  background: color-mix(in srgb, var(--color-surface) 86%, white 14%);
  box-shadow: var(--shadow-dusty);
}

.world-map-stage__surface {
  position: relative;
  min-height: 100%;
  overflow: hidden;
  border: 1px solid rgba(143, 117, 80, 0.45);
  background:
    radial-gradient(circle at 50% 35%, rgba(255, 251, 243, 0.58), transparent 44%),
    linear-gradient(180deg, rgba(244, 230, 201, 0.76), rgba(232, 212, 177, 0.88));
}

.world-map-stage--selected .world-map-stage__surface {
  border-color: rgba(200, 100, 59, 0.42);
}

.world-map-stage__map {
  width: 100%;
  height: 100%;
  min-height: 28rem;
  object-fit: cover;
  filter: saturate(0.78) sepia(0.14) contrast(0.96);
}

@media (min-width: 960px) {
  .world-map-stage {
    min-height: 68vh;
  }
}
</style>
