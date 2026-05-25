<script setup lang="ts">
import { computed } from 'vue'

import {
  getJournalPostcardImage,
  type JournalPostcardVariant,
} from './journal-thumbnails'

const props = defineProps<{
  variant: JournalPostcardVariant
}>()

const postcardSrc = computed(() => getJournalPostcardImage(props.variant))
</script>

<template>
  <div
    class="journal-postcard"
    data-journal-postcard
    :data-variant="props.variant"
    aria-hidden="true"
  >
    <img
      class="journal-postcard__image"
      :src="postcardSrc"
      alt=""
      draggable="false"
      data-journal-postcard-image
    >
  </div>
</template>

<style scoped>
.journal-postcard {
  position: relative;
  aspect-ratio: 230 / 126;
  width: min(230px, 100%);
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.76),
    0 12px 22px rgba(37, 20, 111, 0.12);
  isolation: isolate;
}

.journal-postcard::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.22), transparent 42%),
    radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.34), transparent 28%);
  content: '';
  pointer-events: none;
}

.journal-postcard__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.01);
}

@media (max-width: 767px) {
  .journal-postcard {
    width: 100%;
    max-width: 260px;
  }
}
</style>
