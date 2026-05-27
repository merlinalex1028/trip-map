import type {
  TravelCountryTripCount,
  TravelMemoriesProfileDimension,
  TravelTrendBucket,
} from '@trip-map/contracts'
import type { YumeChartOption } from '@/components/common/BaseChart.vue'

const memoriesPalette = {
  ink: '#17106b',
  muted: '#7772a5',
  grid: 'rgba(137, 125, 185, 0.13)',
  pink: '#ff5d91',
  pinkSoft: 'rgba(255, 93, 145, 0.17)',
  purple: '#9f75ee',
  blue: '#4f8dff',
  cyan: '#65c7d8',
  orange: '#ffb241',
} as const

const countryColors = [
  '#ff5d91',
  '#a875ed',
  '#4f8dff',
  '#ffb241',
  '#62c7d8',
  '#ff8fb3',
]

function formatMonthPeriod(period: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(period)

  if (match === null) {
    return period
  }

  return `${Number(match[2])}月`
}

export function buildMonthlyTrendOption(points: TravelTrendBucket[]): YumeChartOption {
  return {
    color: [memoriesPalette.pink],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: 'rgba(235,224,247,0.9)',
      textStyle: { color: memoriesPalette.ink, fontWeight: 700 },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: points.map(point => formatMonthPeriod(point.period)),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: memoriesPalette.muted,
        fontSize: 13,
        fontWeight: 700,
        margin: 16,
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        color: memoriesPalette.muted,
        fontSize: 13,
        fontWeight: 700,
      },
      splitLine: {
        lineStyle: {
          color: memoriesPalette.grid,
          type: 'solid',
        },
      },
    },
    grid: { left: 40, right: 22, top: 24, bottom: 42 },
    series: [
      {
        name: '旅行次数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: memoriesPalette.pink,
        },
        itemStyle: {
          color: '#fff',
          borderColor: memoriesPalette.pink,
          borderWidth: 3,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 93, 145, 0.23)' },
              { offset: 1, color: 'rgba(255, 93, 145, 0.02)' },
            ],
          },
        },
        data: points.map(point => point.tripCount),
      },
    ],
  } as YumeChartOption
}

export function buildCountryDistributionOption(items: TravelCountryTripCount[]): YumeChartOption {
  return {
    color: countryColors,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: 'rgba(235,224,247,0.9)',
      textStyle: { color: memoriesPalette.ink, fontWeight: 700 },
    },
    legend: { show: false },
    series: [
      {
        name: '旅行次数',
        type: 'pie',
        radius: ['43%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderColor: 'rgba(255,255,255,0.86)',
          borderWidth: 2,
          borderRadius: 6,
        },
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
    color: [memoriesPalette.purple],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: 'rgba(235,224,247,0.9)',
      textStyle: { color: memoriesPalette.ink, fontWeight: 700 },
    },
    xAxis: {
      type: 'category',
      data: points.map(point => point.period),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: memoriesPalette.muted,
        fontSize: 13,
        fontWeight: 700,
        margin: 16,
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        color: memoriesPalette.muted,
        fontSize: 13,
        fontWeight: 700,
      },
      splitLine: {
        lineStyle: {
          color: memoriesPalette.grid,
        },
      },
    },
    grid: { left: 38, right: 20, top: 24, bottom: 42 },
    series: [
      {
        name: '旅行次数',
        type: 'bar',
        barWidth: 32,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#ad87f5' },
              { offset: 1, color: '#8e63e8' },
            ],
          },
          borderRadius: [10, 10, 4, 4],
        },
        data: points.map(point => point.tripCount),
      },
    ],
  } as YumeChartOption
}

export function buildMemoriesProfileOption(dimensions: TravelMemoriesProfileDimension[]): YumeChartOption {
  return {
    color: [memoriesPalette.pink],
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: 'rgba(235,224,247,0.9)',
      textStyle: { color: memoriesPalette.ink, fontWeight: 700 },
    },
    radar: {
      radius: '66%',
      center: ['50%', '54%'],
      indicator: dimensions.map(dimension => ({
        name: dimension.label,
        max: dimension.max,
      })),
      axisName: {
        color: memoriesPalette.muted,
        fontSize: 12,
        fontWeight: 800,
      },
      axisLine: {
        lineStyle: { color: 'rgba(151, 138, 197, 0.18)' },
      },
      splitLine: {
        lineStyle: { color: 'rgba(151, 138, 197, 0.18)' },
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(255,255,255,0.28)', 'rgba(248,244,255,0.32)'],
        },
      },
    },
    series: [
      {
        name: '旅途风格分析',
        type: 'radar',
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: {
          width: 3,
          color: memoriesPalette.pink,
        },
        itemStyle: {
          color: '#fff',
          borderColor: memoriesPalette.pink,
          borderWidth: 3,
        },
        areaStyle: {
          color: memoriesPalette.pinkSoft,
        },
        data: [
          {
            name: '旅途风格分析',
            value: dimensions.map(dimension => dimension.value),
          },
        ],
      },
    ],
  } as YumeChartOption
}
