<script setup lang="ts">
import type { TravelPopularFootprint } from '@trip-map/contracts'
import { computed } from 'vue'

import kyotoThumbnail from '@/assets/v8/journal-thumbnails/kyoto.png'
import parisThumbnail from '@/assets/v8/journal-thumbnails/paris.png'
import riverThumbnail from '@/assets/v8/journal-thumbnails/river.png'
import shanghaiThumbnail from '@/assets/v8/journal-thumbnails/shanghai.png'

const props = defineProps<{
  items: TravelPopularFootprint[]
}>()

const rankThumbnails = [
  shanghaiThumbnail,
  kyotoThumbnail,
  parisThumbnail,
  riverThumbnail,
  kyotoThumbnail,
]

const visibleItems = computed(() =>
  props.items.slice(0, 5).map((item, index) => ({
    ...item,
    thumbnail: rankThumbnails[index % rankThumbnails.length],
  })),
)
</script>

<template>
  <section
    data-region="popular-footprints"
    class="popular-footprints"
  >
    <span
      class="popular-footprints__spark"
      aria-hidden="true"
    ></span>

    <div class="popular-footprints__heading">
      <h3>
        热门足迹排行
      </h3>
      <p>
        你最常去的城市 TOP5
      </p>
    </div>

    <ol
      v-if="visibleItems.length > 0"
      class="popular-footprints__list"
    >
      <li
        v-for="(item, index) in visibleItems"
        :key="item.placeId"
        data-rank-row
        class="popular-footprints__row"
        :aria-label="`${item.displayName}，${item.visitCount} 次，${item.latestVisitDate ?? '旅行日期待补充'}`"
      >
        <span class="popular-footprints__rank">
          {{ index + 1 }}
        </span>

        <img
          class="popular-footprints__thumb"
          :src="item.thumbnail"
          alt=""
          width="36"
          height="36"
          aria-hidden="true"
        >

        <span class="popular-footprints__name">
          {{ item.displayName }}
        </span>

        <span class="popular-footprints__count">
          {{ item.visitCount }} 次
        </span>
      </li>
    </ol>

    <p
      v-else
      class="popular-footprints__empty"
    >
      还没有可用于排行的足迹。
    </p>
  </section>
</template>

<style scoped>
.popular-footprints {
  position: relative;
  display: grid;
  align-content: start;
  gap: 18px;
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(235, 224, 247, 0.86);
  border-radius: 24px;
  background:
    radial-gradient(circle at 86% 13%, rgba(255, 215, 230, 0.32), transparent 18%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(255, 252, 254, 0.91));
  box-shadow:
    0 20px 48px rgba(75, 51, 118, 0.065),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
  padding: 30px 32px 27px;
}

.popular-footprints__heading {
  display: grid;
  gap: 8px;
}

.popular-footprints__heading h3 {
  margin: 0;
  color: #16135d;
  font-size: 23px;
  font-weight: 850;
  line-height: 1.05;
  letter-spacing: 0;
}

.popular-footprints__heading p {
  margin: 0;
  color: #746fa4;
  font-size: 15px;
  font-weight: 750;
  line-height: 1.35;
}

.popular-footprints__spark {
  position: absolute;
  top: 35px;
  right: 38px;
  width: 10px;
  height: 10px;
  background: #ffd7e5;
  clip-path: polygon(50% 0, 63% 37%, 100% 50%, 63% 63%, 50% 100%, 37% 63%, 0 50%, 37% 37%);
}

.popular-footprints__list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.popular-footprints__row {
  display: grid;
  grid-template-columns: 24px 36px minmax(0, 1fr) auto;
  align-items: center;
  gap: 13px;
  min-height: 46px;
  border-bottom: 1px solid rgba(219, 211, 236, 0.66);
  color: #16135d;
  font-size: 16px;
  font-weight: 830;
}

.popular-footprints__row:last-child {
  border-bottom: 0;
}

.popular-footprints__rank {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 999px;
  background: linear-gradient(180deg, #fff1e6, #ffd9c0);
  box-shadow: inset 0 0 0 1px rgba(255, 177, 120, 0.45);
  color: #ff914d;
  font-size: 13px;
  font-weight: 850;
}

.popular-footprints__thumb {
  width: 36px;
  height: 36px;
  border: 2px solid rgba(255, 255, 255, 0.86);
  border-radius: 10px;
  box-shadow: 0 8px 18px rgba(70, 54, 128, 0.12);
  object-fit: cover;
}

.popular-footprints__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.popular-footprints__count {
  color: #746fa4;
  font-size: 16px;
  font-weight: 850;
  white-space: nowrap;
}

.popular-footprints__empty {
  margin: 0;
  border: 1px solid rgba(235, 224, 247, 0.78);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  color: #746fa4;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.6;
  padding: 14px 16px;
}

@media (max-width: 640px) {
  .popular-footprints {
    border-radius: 20px;
    padding: 22px 18px;
  }

  .popular-footprints__heading h3 {
    font-size: 20px;
  }
}
</style>
