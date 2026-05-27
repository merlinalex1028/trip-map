import type { TravelPopularFootprint } from '@trip-map/contracts'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PopularFootprintsList from './PopularFootprintsList.vue'

function makeItem(overrides: Partial<TravelPopularFootprint> = {}): TravelPopularFootprint {
  return {
    placeId: 'cn-admin-beijing',
    displayName: '北京市',
    parentLabel: '中国',
    visitCount: 3,
    latestVisitDate: '2026-01-02',
    ...overrides,
  }
}

describe('PopularFootprintsList', () => {
  it('renders visual Top 5 ranking rows from ordered props', () => {
    const wrapper = mount(PopularFootprintsList, {
      props: {
        items: [
          makeItem({ placeId: 'beijing', displayName: '北京市', visitCount: 4, latestVisitDate: '2026-02-01' }),
          makeItem({ placeId: 'tokyo', displayName: '东京都', parentLabel: '日本', visitCount: 2, latestVisitDate: '2026-01-01' }),
        ],
      },
    })

    expect(wrapper.get('[data-region="popular-footprints"]').text()).toContain('热门足迹排行')
    expect(wrapper.findAll('[data-rank-row]')).toHaveLength(2)
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('北京市')
    expect(wrapper.text()).toContain('4 次')
    expect(wrapper.text()).toContain('东京都')
    expect(wrapper.text()).toContain('2 次')
  })

  it('renders only the first five supplied items', () => {
    const wrapper = mount(PopularFootprintsList, {
      props: {
        items: Array.from({ length: 6 }, (_, index) =>
          makeItem({
            placeId: `place-${index + 1}`,
            displayName: `地点 ${index + 1}`,
            visitCount: 6 - index,
          }),
        ),
      },
    })

    expect(wrapper.findAll('[data-rank-row]')).toHaveLength(5)
    expect(wrapper.text()).toContain('地点 5')
    expect(wrapper.text()).not.toContain('地点 6')
  })

  it('renders honest date-pending copy for missing latest dates', () => {
    const wrapper = mount(PopularFootprintsList, {
      props: {
        items: [
          makeItem({ latestVisitDate: null }),
        ],
      },
    })

    expect(wrapper.get('[data-rank-row]').attributes('aria-label')).toContain('旅行日期待补充')
  })
})
