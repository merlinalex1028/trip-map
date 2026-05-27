<script setup lang="ts">
import type { TravelStatsResponse } from '@trip-map/contracts'
import { computed } from 'vue'

import statGlobeIcon from '@/assets/v8/memories/stat-globe.png'
import statMapPinIcon from '@/assets/v8/memories/stat-map-pin.png'
import statSignpostIcon from '@/assets/v8/memories/stat-signpost.png'
import statSuitcaseIcon from '@/assets/v8/memories/stat-suitcase.png'

const props = defineProps<{
  stats: TravelStatsResponse
}>()

type OverviewCard = {
  key: string
  label: string
  value: number
  unit: string
  iconSrc: string
  tone: string
}

const overviewCards = computed<OverviewCard[]>(() => [
  {
    key: 'total-trips',
    label: '总旅行次数',
    value: props.stats.totalTrips,
    unit: '次',
    iconSrc: statSuitcaseIcon,
    tone: 'luggage',
  },
  {
    key: 'unique-places',
    label: '去过地点',
    value: props.stats.uniquePlaces,
    unit: '个',
    iconSrc: statSignpostIcon,
    tone: 'signpost',
  },
  {
    key: 'visited-cities',
    label: '去过城市',
    value: props.stats.visitedAdministrativeAreas,
    unit: '个',
    iconSrc: statMapPinIcon,
    tone: 'pin',
  },
  {
    key: 'visited-countries',
    label: '去过国家/地区',
    value: props.stats.visitedCountries,
    unit: '个',
    iconSrc: statGlobeIcon,
    tone: 'globe',
  },
])
</script>

<template>
  <section
    data-region="memories-overview"
    class="memories-overview-grid"
  >
    <article
      v-for="card in overviewCards"
      :key="card.key"
      class="memories-overview-card"
      data-region="stat-card"
      :data-overview-card="card.key"
      :data-card-tone="card.tone"
    >
      <span
        class="memories-overview-card__spark memories-overview-card__spark--top"
        aria-hidden="true"
      ></span>
      <span
        class="memories-overview-card__spark memories-overview-card__spark--bottom"
        aria-hidden="true"
      ></span>
      <div class="memories-overview-card__copy">
        <p
          class="memories-overview-card__label"
          data-stat="label"
        >
          {{ card.label }}
        </p>
        <p class="memories-overview-card__metric">
          <span data-stat="value">{{ card.value }}</span>
          <small data-stat="unit">{{ card.unit }}</small>
        </p>
      </div>
      <span
        class="memories-overview-card__icon"
        aria-hidden="true"
      >
        <img
          :src="card.iconSrc"
          alt=""
          width="76"
          height="76"
          loading="lazy"
        >
      </span>
    </article>
  </section>
</template>

<style scoped>
.memories-overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
}

.memories-overview-card {
  position: relative;
  min-height: 118px;
  overflow: hidden;
  border: 1px solid rgba(235, 224, 247, 0.86);
  border-radius: 21px;
  background:
    radial-gradient(circle at 86% 28%, rgba(255, 214, 232, 0.42), transparent 25%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 251, 254, 0.9));
  box-shadow:
    0 18px 42px rgba(75, 51, 118, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
  color: #16135d;
  padding: 27px 28px;
}

.memories-overview-card__copy {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 18px;
  max-width: 64%;
}

.memories-overview-card__label {
  margin: 0;
  color: #625c97;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
}

.memories-overview-card__metric {
  display: flex;
  align-items: baseline;
  gap: 9px;
  margin: 0;
  color: #17106b;
  font-weight: 850;
  letter-spacing: 0;
}

.memories-overview-card__metric span {
  font-size: 40px;
  line-height: 0.95;
}

.memories-overview-card__metric small {
  font-size: 18px;
  font-weight: 750;
}

.memories-overview-card__icon {
  position: absolute;
  right: 33px;
  bottom: 20px;
  z-index: 1;
  display: grid;
  width: 78px;
  height: 78px;
  place-items: center;
  filter: drop-shadow(0 14px 18px rgba(126, 93, 230, 0.18));
}

.memories-overview-card__icon::before {
  position: absolute;
  inset: 16px 7px 4px;
  border-radius: 999px;
  background: rgba(161, 128, 241, 0.13);
  content: "";
  filter: blur(10px);
}

.memories-overview-card__icon img {
  position: relative;
  z-index: 2;
  display: block;
  width: 76px;
  height: 76px;
  object-fit: contain;
}

.memories-overview-card__spark {
  position: absolute;
  z-index: 1;
  width: 10px;
  height: 10px;
  background: #ffd7e5;
  clip-path: polygon(50% 0, 63% 37%, 100% 50%, 63% 63%, 50% 100%, 37% 63%, 0 50%, 37% 37%);
  opacity: 0.74;
}

.memories-overview-card__spark--top {
  top: 43px;
  right: 106px;
}

.memories-overview-card__spark--bottom {
  right: 70px;
  bottom: 54px;
  transform: scale(0.68);
}

.memories-overview-card[data-card-tone="pin"] .memories-overview-card__icon {
  right: 30px;
  bottom: 17px;
}

@media (max-width: 1200px) {
  .memories-overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .memories-overview-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
  }

  .memories-overview-card {
    min-height: 108px;
    padding: 22px 23px;
  }

  .memories-overview-card__metric span {
    font-size: 35px;
  }
}
</style>
