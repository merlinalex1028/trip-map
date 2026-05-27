import type { TravelStatsResponse } from '@trip-map/contracts'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import MemoriesOverviewGrid from './MemoriesOverviewGrid.vue'

function makeStats(overrides: Partial<TravelStatsResponse> = {}): TravelStatsResponse {
  return {
    totalTrips: 12,
    uniquePlaces: 7,
    visitedAdministrativeAreas: 6,
    visitedCountries: 4,
    totalSupportedCountries: 21,
    memories: {
      monthlyTrend: [],
      yearlyTrend: [],
      countryDistribution: [],
      profile: [],
      popularFootprints: [],
      postcards: [],
    },
    ...overrides,
  }
}

describe('MemoriesOverviewGrid', () => {
  it('renders exactly four overview cards in the required order', () => {
    const wrapper = mount(MemoriesOverviewGrid, {
      props: { stats: makeStats() },
    })

    expect(wrapper.find('[data-region="memories-overview"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-region="stat-card"]')).toHaveLength(4)
    expect(wrapper.findAll('[data-stat="label"]').map(label => label.text())).toEqual([
      '总旅行次数',
      '去过地点',
      '去过城市',
      '去过国家/地区',
    ])
  })

  it('renders overview values from the typed stats payload', () => {
    const wrapper = mount(MemoriesOverviewGrid, {
      props: {
        stats: makeStats({
          totalTrips: 18,
          uniquePlaces: 9,
          visitedAdministrativeAreas: 8,
          visitedCountries: 5,
        }),
      },
    })

    expect(wrapper.findAll('[data-stat="value"]').map(value => value.text())).toEqual([
      '18',
      '9',
      '8',
      '5',
    ])
    expect(wrapper.findAll('[data-stat="unit"]').map(unit => unit.text())).toEqual([
      '次',
      '个',
      '个',
      '个',
    ])
  })

  it('does not render fake deltas or achievement badges', () => {
    const wrapper = mount(MemoriesOverviewGrid, {
      props: { stats: makeStats() },
    })

    expect(wrapper.text()).not.toContain('环比')
    expect(wrapper.text()).not.toContain('同比')
    expect(wrapper.text()).not.toContain('徽章')
  })
})
