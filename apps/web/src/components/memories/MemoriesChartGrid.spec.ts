import type { TravelMemoriesDashboard } from '@trip-map/contracts'
import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

import MemoriesChartGrid from './MemoriesChartGrid.vue'

vi.mock('@/components/common/BaseChart.vue', () => ({
  default: {
    name: 'BaseChart',
    props: ['option', 'empty', 'error', 'label', 'loading', 'minHeight'],
    template: '<section data-mocked-base-chart :aria-label="label" :data-empty="empty"><slot /></section>',
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
    expect(wrapper.get('[data-chart-panel="memories-profile"]').text()).toContain('旅途风格分析')
    expect(wrapper.get('[data-chart-panel="monthly-trend"]').attributes('aria-labelledby')).toBe(
      'memories-chart-monthly-trend-title',
    )
    expect(wrapper.get('[data-chart-panel="country-distribution"]').attributes('aria-labelledby')).toBe(
      'memories-chart-country-distribution-title',
    )
    expect(wrapper.get('[data-chart-panel="yearly-trend"]').attributes('aria-labelledby')).toBe(
      'memories-chart-yearly-trend-title',
    )
    expect(wrapper.get('[data-chart-panel="memories-profile"]').attributes('aria-labelledby')).toBe(
      'memories-chart-profile-title',
    )
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
      xAxis: { data: ['1月', '2月'] },
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
      series: [{ data: [{ value: [83, 67], name: '旅途风格分析' }] }],
    })
    expect(monthlyChart.props('label')).toBe('旅途足迹趋势图表')
    expect(countryChart.props('label')).toBe('足迹国家/地区分布图表')
    expect(yearlyChart.props('label')).toBe('年度旅途趋势图表')
    expect(profileChart.props('label')).toBe('旅途风格分析雷达图')
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
      wrapper.get('[data-chart-panel="monthly-trend"]').findComponent({ name: 'BaseChart' }).exists(),
    ).toBe(false)
    expect(
      wrapper.get('[data-chart-panel="yearly-trend"]').findComponent({ name: 'BaseChart' }).exists(),
    ).toBe(false)
  })

  it('renders the high-fidelity memories profile subtitle when profile dimensions exist', () => {
    const wrapper = mount(MemoriesChartGrid, {
      props: { dashboard: makeDashboard() },
    })

    expect(wrapper.get('[data-chart-panel="memories-profile"]').text()).toContain(
      '你的旅行偏好雷达图',
    )
  })

  it('keeps long country legend labels contained inside the chart panel source rules', () => {
    const source = readFileSync('src/components/memories/MemoriesChartGrid.vue', 'utf8')

    expect(source).toContain('.memories-country-legend__name')
    expect(source).toContain('overflow-wrap: anywhere')
  })
})
