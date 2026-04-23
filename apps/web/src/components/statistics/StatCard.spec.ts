import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import StatCard from './StatCard.vue'

describe('StatCard', () => {
  it('renders label correctly', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: '总旅行次数',
        value: 42,
        unit: '次旅行',
        gradient: 'linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,246,250,0.94))',
      },
    })

    expect(wrapper.find('[data-stat="label"]').text()).toBe('总旅行次数')
  })

  it('renders value correctly', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: '已去过地点数',
        value: 7,
        unit: '个地点',
        gradient: 'linear-gradient(180deg,rgba(255,255,255,0.92),rgba(239,250,252,0.94))',
      },
    })

    expect(wrapper.find('[data-stat="value"]').text()).toBe('7')
  })

  it('renders unit correctly', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: '总旅行次数',
        value: 10,
        unit: '次旅行',
        gradient: 'linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,246,250,0.94))',
      },
    })

    expect(wrapper.find('[data-stat="unit"]').text()).toBe('次旅行')
  })
})
