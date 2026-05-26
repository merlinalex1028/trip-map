import type { TravelMemoriesDashboard } from '@trip-map/contracts'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import MemoriesChartGrid from './MemoriesChartGrid.vue'

vi.mock('@/components/common/BaseChart.vue', () => ({
  default: {
    name: 'BaseChart',
    props: ['option', 'empty', 'error', 'loading', 'minHeight'],
    template: '<section data-mocked-base-chart :data-empty="empty"><slot /></section>',
  },
}))

function makeDashboard(overrides: Partial<TravelMemoriesDashboard> = {}): TravelMemoriesDashboard {
  return {
    monthlyTrend: [
      { period: '2026-01', tripCount: 2 },
      { period: '2026-02', tripCount: 4 },
    ],
    yearlyTrend: [
      { period: '2026', tripCount: 6 },
    ],
    countryDistribution: [
      { countryLabel: '中国', tripCount: 3 },
      { countryLabel: '日本', tripCount: 2 },
    ],
    profile: [
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
    ],
    popularFootprints: [],
    postcards: [],
    ...overrides,
  }
}

describe('MemoriesChartGrid', () => {
  it('renders the four memories chart panel titles', () => {
    const wrapper = mount(MemoriesChartGrid, {
      props: { dashboard: makeDashboard() },
    })

    expect(wrapper.find('[data-region="memories-chart-grid"]').exists()).toBe(true)
    expect(wrapper.get('[data-chart-panel="monthly-trend"]').text()).toContain('旅途足迹趋势')
    expect(wrapper.get('[data-chart-panel="country-distribution"]').text()).toContain('足迹国家/地区分布')
    expect(wrapper.get('[data-chart-panel="yearly-trend"]').text()).toContain('年度旅途趋势')
    expect(wrapper.get('[data-chart-panel="memories-profile"]').text()).toContain('旅途回忆画像')
  })

  it('builds BaseChart options from the passed dashboard props', () => {
    const wrapper = mount(MemoriesChartGrid, {
      props: { dashboard: makeDashboard() },
    })

    const monthlyChart = wrapper.get('[data-chart-panel="monthly-trend"]').getComponent({ name: 'BaseChart' })
    const countryChart = wrapper.get('[data-chart-panel="country-distribution"]').getComponent({ name: 'BaseChart' })
    const yearlyChart = wrapper.get('[data-chart-panel="yearly-trend"]').getComponent({ name: 'BaseChart' })
    const profileChart = wrapper.get('[data-chart-panel="memories-profile"]').getComponent({ name: 'BaseChart' })

    expect(monthlyChart.props('option')).toMatchObject({
      xAxis: { data: ['2026-01', '2026-02'] },
      series: [{ data: [2, 4] }],
    })
    expect(countryChart.props('option')).toMatchObject({
      series: [{ data: [{ name: '中国', value: 3 }, { name: '日本', value: 2 }] }],
    })
    expect(yearlyChart.props('option')).toMatchObject({
      xAxis: { data: ['2026'] },
      series: [{ data: [6] }],
    })
    expect(profileChart.props('option')).toMatchObject({
      radar: { indicator: [{ name: '地点探索', max: 100 }, { name: '摘记细节', max: 100 }] },
      series: [{ data: [{ value: [83, 67], name: '旅途回忆画像' }] }],
    })
  })

  it('renders truthful sparse-date copy for empty monthly and yearly trends', () => {
    const wrapper = mount(MemoriesChartGrid, {
      props: {
        dashboard: makeDashboard({
          monthlyTrend: [],
          yearlyTrend: [],
        }),
      },
    })

    expect(wrapper.findAll('[data-chart-sparse="date-trend"]')).toHaveLength(2)
    expect(wrapper.text()).toContain('这些足迹还没有可用于趋势统计的旅行日期。')
    expect(
      wrapper.get('[data-chart-panel="monthly-trend"]').getComponent({ name: 'BaseChart' }).props('empty'),
    ).toBe(true)
    expect(
      wrapper.get('[data-chart-panel="yearly-trend"]').getComponent({ name: 'BaseChart' }).props('empty'),
    ).toBe(true)
  })

  it('renders the initial real-data memories profile copy when profile dimensions exist', () => {
    const wrapper = mount(MemoriesChartGrid, {
      props: { dashboard: makeDashboard() },
    })

    expect(wrapper.get('[data-chart-panel="memories-profile"]').text()).toContain(
      '这是根据现有足迹描出的初始回忆画像。',
    )
  })
})
