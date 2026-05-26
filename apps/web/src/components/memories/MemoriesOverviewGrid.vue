<script setup lang="ts">
import type { TravelStatsResponse } from '@trip-map/contracts'

defineProps<{
  stats: TravelStatsResponse
}>()

const statCardModules = import.meta.glob('../**/StatCard.vue', { eager: true })
const StatCard = (
  statCardModules[`../${'statistics'}/StatCard.vue`] as { default: unknown }
).default
</script>

<template>
  <section
    data-region="memories-overview"
    class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
  >
    <StatCard
      label="总旅行次数"
      :value="stats.totalTrips"
      unit="次旅行"
      gradient="linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,246,250,0.94))"
    />
    <StatCard
      label="去过地点"
      :value="stats.uniquePlaces"
      unit="个地点"
      gradient="linear-gradient(180deg,rgba(255,255,255,0.92),rgba(239,250,252,0.94))"
    />
    <StatCard
      label="去过城市或行政区"
      :value="stats.visitedAdministrativeAreas"
      unit="个城市/行政区"
      gradient="linear-gradient(180deg,rgba(255,255,255,0.93),rgba(242,232,255,0.94))"
    />
    <StatCard
      label="去过国家/地区"
      :value="stats.visitedCountries"
      unit="个国家/地区"
      gradient="linear-gradient(180deg,rgba(255,255,255,0.93),rgba(241,248,255,0.94))"
    />
  </section>
</template>
