import type { TravelMemoryPostcardSeed } from '@trip-map/contracts'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import MemoryPostcardStrip from './MemoryPostcardStrip.vue'

function makeSeed(overrides: Partial<TravelMemoryPostcardSeed> = {}): TravelMemoryPostcardSeed {
  return {
    recordId: 'record-1',
    placeId: 'jp-pref-kyoto',
    displayName: '京都府',
    parentLabel: '日本',
    startDate: '2026-02-03',
    ...overrides,
  }
}

describe('MemoryPostcardStrip', () => {
  it('renders real displayName and startDate copy for every postcard seed', () => {
    const wrapper = mount(MemoryPostcardStrip, {
      props: {
        items: [
          makeSeed({ recordId: 'record-1', displayName: '京都府', startDate: '2026-02-03' }),
          makeSeed({ recordId: 'record-2', placeId: 'fr-paris', displayName: '巴黎', parentLabel: '法国', startDate: '2026-01-01' }),
        ],
      },
    })

    expect(wrapper.get('[data-region="memory-postcard-strip"]').text()).toContain('珍藏回忆瞬间')
    expect(wrapper.text()).toContain('京都府')
    expect(wrapper.text()).toContain('2026-02-03')
    expect(wrapper.text()).toContain('巴黎')
    expect(wrapper.text()).toContain('2026-01-01')
  })

  it('exposes browse-only horizontal strip semantics', () => {
    const wrapper = mount(MemoryPostcardStrip, {
      props: { items: [makeSeed()] },
    })

    const strip = wrapper.get('[data-postcard-strip]')
    expect(strip.attributes('aria-label')).toBe('珍藏回忆瞬间')
    expect(strip.attributes('tabindex')).toBe('0')
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('uses stable decorative variants for the same record context', () => {
    const items = [
      makeSeed({ recordId: 'record-1', placeId: 'cn-shanghai', displayName: '上海市', parentLabel: '中国' }),
      makeSeed({ recordId: 'record-2', placeId: 'us-california', displayName: '加利福尼亚州', parentLabel: '美国' }),
    ]
    const first = mount(MemoryPostcardStrip, { props: { items } })
    const second = mount(MemoryPostcardStrip, { props: { items } })

    const firstVariants = first.findAll('[data-journal-postcard]').map(card => card.attributes('data-variant'))
    const secondVariants = second.findAll('[data-journal-postcard]').map(card => card.attributes('data-variant'))

    expect(firstVariants).toEqual(secondVariants)
    expect(new Set(firstVariants).size).toBeGreaterThan(0)
    for (const variant of firstVariants) {
      expect(['river', 'kyoto', 'paris', 'shanghai']).toContain(variant)
    }
  })
})
