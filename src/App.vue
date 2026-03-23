<script setup lang="ts">
import { storeToRefs } from 'pinia'

import PointPreviewDrawer from './components/PointPreviewDrawer.vue'
import PosterTitleBlock from './components/PosterTitleBlock.vue'
import WorldMapStage from './components/WorldMapStage.vue'
import { useMapUiStore } from './stores/map-ui'

const mapUiStore = useMapUiStore()
const { selectedPoint } = storeToRefs(mapUiStore)
</script>

<template>
  <div class="app-shell">
    <div class="app-shell__grain" aria-hidden="true"></div>
    <main class="poster-shell">
      <PosterTitleBlock class="poster-shell__title" />
      <section
        class="poster-shell__experience"
        :class="{
          'poster-shell__experience--drawer-open': Boolean(selectedPoint)
        }"
      >
        <WorldMapStage class="poster-shell__stage" />
        <PointPreviewDrawer class="poster-shell__drawer" />
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
}

.app-shell__grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(122, 78, 52, 0.08), transparent 28%),
    radial-gradient(circle at 80% 12%, rgba(92, 57, 39, 0.05), transparent 24%),
    radial-gradient(circle at 30% 80%, rgba(146, 112, 74, 0.06), transparent 30%);
  mix-blend-mode: multiply;
  opacity: 0.85;
}

.poster-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: grid;
  gap: var(--space-xl);
  padding: var(--space-2xl);
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
}

.poster-shell__stage {
  min-height: 60vh;
}

.poster-shell__experience {
  position: relative;
}

.poster-shell__experience--drawer-open {
  padding-bottom: min(16rem, 42vh);
}

@media (min-width: 960px) {
  .poster-shell {
    align-items: start;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'title'
      'stage';
  }

  .poster-shell__title {
    grid-area: title;
    padding-inline-end: var(--space-xl);
  }

  .poster-shell__stage {
    grid-area: stage;
    min-height: 68vh;
  }

  .poster-shell__experience--drawer-open {
    padding-right: min(24rem, 32vw);
    padding-bottom: 0;
  }
}
</style>
