import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseChart from './BaseChart.vue'

vi.mock('vue-echarts', () => ({
  default: {
    name: 'VChart',
    props: ['option', 'theme', 'autoresize', 'loading'],
    template: '<div data-mocked-vchart :data-theme="theme" :data-autoresize="JSON.stringify(autoresize)"></div>',
  },
}))

describe('BaseChart', () => {
  it('renders loading state with aria-busy', () => {
    const wrapper = mount(BaseChart, { props: { loading: true, label: '旅途足迹趋势图表' } })
    expect(wrapper.find('[data-state="loading"]').exists()).toBe(true)
    expect(wrapper.find('[data-base-chart]').attributes('aria-busy')).toBe('true')
    expect(wrapper.find('[data-base-chart]').attributes('role')).toBeUndefined()
    expect(wrapper.find('[data-base-chart]').attributes('aria-label')).toBeUndefined()
    expect(wrapper.find('[data-state="loading"]').attributes('role')).toBe('status')
    expect(wrapper.find('[data-state="loading"]').attributes('aria-live')).toBe('polite')
  })

  it('renders empty state with correct text', () => {
    const wrapper = mount(BaseChart, { props: { empty: true } })
    expect(wrapper.find('[data-state="empty"]').exists()).toBe(true)
    expect(wrapper.find('[data-base-chart]').attributes('role')).toBeUndefined()
    expect(wrapper.find('[data-state="empty"]').attributes('role')).toBe('status')
    expect(wrapper.find('[data-state="empty"]').attributes('aria-live')).toBe('polite')
    expect(wrapper.text()).toContain('还没有旅行记录')
    expect(wrapper.text()).toContain('先回到地图，选择一个真实地点留下第一枚足迹。')
  })

  it('renders error state with role alert', () => {
    const wrapper = mount(BaseChart, {
      props: { error: '暂时没有加载成功，请稍后重试。' },
    })
    expect(wrapper.find('[data-state="error"]').exists()).toBe(true)
    expect(wrapper.find('[data-base-chart]').attributes('role')).toBeUndefined()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('暂时没有加载成功，请稍后重试。')
  })

  it('renders VChart with yume-kawaii theme and autoresize', () => {
    const wrapper = mount(BaseChart, {
      props: {
        option: {
          xAxis: { type: 'category' },
          yAxis: { type: 'value' },
          series: [{ type: 'line', data: [1, 2, 3] }],
        },
      },
    })
    const chart = wrapper.find('[data-mocked-vchart]')
    expect(chart.exists()).toBe(true)
    expect(wrapper.find('[data-base-chart]').attributes('role')).toBe('img')
    expect(wrapper.find('[data-base-chart]').attributes('aria-label')).toBe('旅行数据图表')
    expect(chart.attributes('data-theme')).toBe('yume-kawaii')
    expect(chart.attributes('data-autoresize')).toContain('100')
  })
})
