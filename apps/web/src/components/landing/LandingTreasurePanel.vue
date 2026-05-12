<script setup lang="ts">
import statCountries from '@/assets/v8/landing/stat-countries.png'
import statFootprints from '@/assets/v8/landing/stat-footprints.png'
import statRating from '@/assets/v8/landing/stat-rating.png'
import statTravelers from '@/assets/v8/landing/stat-travelers.png'

const props = defineProps<{
  postcardsSrc: string
}>()

const stats = [
  { label: '国家/地区', value: '300+', icon: statCountries },
  { label: '旅行者', value: '10万+', icon: statTravelers },
  { label: '足迹点亮', value: '500万+', icon: statFootprints },
  { label: '用户好评', value: '99%', icon: statRating },
]
</script>

<template>
  <section class="landing-panel">
    <div class="landing-panel__intro">
      <h2 class="landing-panel__title">你的旅行，值得被珍藏 ✨</h2>
      <p class="landing-panel__description">用旅记记录每一个难忘瞬间</p>
    </div>

    <dl class="landing-panel__stats">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="landing-panel__stat"
      >
        <img class="landing-panel__stat-icon" :src="stat.icon" alt="" aria-hidden="true" />
        <div class="landing-panel__stat-copy">
          <dt class="landing-panel__stat-label">{{ stat.label }}</dt>
          <dd class="landing-panel__stat-value">{{ stat.value }}</dd>
        </div>
      </div>
    </dl>

    <img class="landing-panel__postcards" :src="props.postcardsSrc" alt="" aria-hidden="true" />
  </section>
</template>

<style scoped>
.landing-panel {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.landing-panel__intro {
  position: absolute;
  bottom: clamp(138px, 11.8vw, 224px);
  left: clamp(96px, 8.2vw, 158px);
  z-index: 2;
  display: grid;
  gap: 12px;
}

.landing-panel__title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
  color: #2833c4;
}

.landing-panel__description {
  margin: 0;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: #5260cb;
}

.landing-panel__postcards {
  position: absolute;
  right: clamp(96px, 7.8vw, 150px);
  bottom: clamp(34px, 3vw, 58px);
  z-index: 2;
  width: clamp(570px, 42.6vw, 780px);
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 22px 34px rgba(93, 78, 156, 0.16));
}

.landing-panel__stats {
  position: absolute;
  bottom: clamp(82px, 7.4vw, 142px);
  left: clamp(92px, 7.8vw, 150px);
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 22px;
  margin: 0;
}

.landing-panel__stat {
  display: grid;
  grid-template-columns: 44px auto;
  align-items: center;
  gap: 10px;
  min-width: 106px;
}

.landing-panel__stat-icon {
  width: 44px;
  height: 44px;
  object-fit: contain;
  filter: drop-shadow(0 8px 12px rgba(82, 70, 148, 0.12));
}

.landing-panel__stat-copy {
  display: grid;
  gap: 2px;
}

.landing-panel__stat-label {
  font-size: 13px;
  font-weight: 400;
  line-height: 1.35;
  color: #5260cb;
}

.landing-panel__stat-value {
  margin-top: 4px;
  margin-left: 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.15;
  color: #1f2eb8;
}
</style>
