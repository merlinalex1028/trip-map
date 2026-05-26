import { describe, expect, it } from 'vitest'

import {
  buildCountryDistributionOption,
  buildMemoriesProfileOption,
  buildMonthlyTrendOption,
  buildYearlyTrendOption,
} from './memory-chart-options'

describe('memory chart options', () => {
  it('maps monthly trend tripCount buckets without demo values', () => {
    const option = buildMonthlyTrendOption([
      { period: '2026-01', tripCount: 2 },
      { period: '2026-02', tripCount: 5 },
    ])

    expect(option.xAxis).toMatchObject({ type: 'category', data: ['2026-01', '2026-02'] })
    expect(option.series).toEqual([
      expect.objectContaining({
        name: '旅行次数',
        type: 'line',
        data: [2, 5],
      }),
    ])
  })

  it('maps countryLabel trip counts into donut data', () => {
    const option = buildCountryDistributionOption([
      { countryLabel: '中国', tripCount: 3 },
      { countryLabel: '日本', tripCount: 2 },
    ])

    expect(option.series).toEqual([
      expect.objectContaining({
        name: '旅行次数',
        type: 'pie',
        radius: ['48%', '72%'],
        data: [
          { name: '中国', value: 3 },
          { name: '日本', value: 2 },
        ],
      }),
    ])
  })

  it('maps yearly tripCount buckets into bar categories', () => {
    const option = buildYearlyTrendOption([
      { period: '2025', tripCount: 1 },
      { period: '2026', tripCount: 4 },
    ])

    expect(option.xAxis).toMatchObject({ type: 'category', data: ['2025', '2026'] })
    expect(option.series).toEqual([
      expect.objectContaining({
        name: '旅行次数',
        type: 'bar',
        data: [1, 4],
      }),
    ])
  })

  it('maps real memories profile dimensions into radar indicators', () => {
    const option = buildMemoriesProfileOption([
      {
        key: 'place-exploration',
        label: '地点探索',
        value: 83,
        max: 100,
        explanation: '不同地点比例',
      },
      {
        key: 'story-detail',
        label: '摘记细节',
        value: 67,
        max: 100,
        explanation: '摘记或标签比例',
      },
    ])

    expect(option.radar).toMatchObject({
      indicator: [
        { name: '地点探索', max: 100 },
        { name: '摘记细节', max: 100 },
      ],
    })
    expect(option.series).toEqual([
      expect.objectContaining({
        name: '旅途回忆画像',
        type: 'radar',
        data: [{ value: [83, 67], name: '旅途回忆画像' }],
      }),
    ])
  })

  it('keeps empty aggregate inputs empty', () => {
    expect(buildMonthlyTrendOption([]).series).toEqual([
      expect.objectContaining({ data: [] }),
    ])
    expect(buildCountryDistributionOption([]).series).toEqual([
      expect.objectContaining({ data: [] }),
    ])
    expect(buildYearlyTrendOption([]).series).toEqual([
      expect.objectContaining({ data: [] }),
    ])
    expect(buildMemoriesProfileOption([]).radar).toMatchObject({ indicator: [] })
    expect(buildMemoriesProfileOption([]).series).toEqual([
      expect.objectContaining({ data: [{ value: [], name: '旅途回忆画像' }] }),
    ])
  })
})
