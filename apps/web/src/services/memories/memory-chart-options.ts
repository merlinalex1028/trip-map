import type {
  TravelCountryTripCount,
  TravelMemoriesProfileDimension,
  TravelTrendBucket,
} from '@trip-map/contracts'
import type { YumeChartOption } from '@/components/common/BaseChart.vue'

export function buildMonthlyTrendOption(points: TravelTrendBucket[]): YumeChartOption {
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: points.map(point => point.period) },
    yAxis: { type: 'value' },
    grid: { left: 32, right: 16, top: 24, bottom: 32 },
    series: [
      {
        name: '旅行次数',
        type: 'line',
        smooth: true,
        data: points.map(point => point.tripCount),
      },
    ],
  } as YumeChartOption
}

export function buildCountryDistributionOption(items: TravelCountryTripCount[]): YumeChartOption {
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        name: '旅行次数',
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '44%'],
        data: items.map(item => ({
          name: item.countryLabel,
          value: item.tripCount,
        })),
      },
    ],
  } as YumeChartOption
}

export function buildYearlyTrendOption(points: TravelTrendBucket[]): YumeChartOption {
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: points.map(point => point.period) },
    yAxis: { type: 'value' },
    grid: { left: 32, right: 16, top: 24, bottom: 32 },
    series: [
      {
        name: '旅行次数',
        type: 'bar',
        data: points.map(point => point.tripCount),
      },
    ],
  } as YumeChartOption
}

export function buildMemoriesProfileOption(dimensions: TravelMemoriesProfileDimension[]): YumeChartOption {
  return {
    tooltip: { trigger: 'item' },
    radar: {
      indicator: dimensions.map(dimension => ({
        name: dimension.label,
        max: dimension.max,
      })),
    },
    series: [
      {
        name: '旅行次数',
        type: 'radar',
        data: [
          {
            name: '旅途回忆画像',
            value: dimensions.map(dimension => dimension.value),
          },
        ],
      },
    ],
  } as YumeChartOption
}
