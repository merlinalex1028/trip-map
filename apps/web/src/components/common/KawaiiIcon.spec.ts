import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import KawaiiIcon from './KawaiiIcon.vue'

describe('KawaiiIcon', () => {
  it('renders a fixed-size wrapper for map with label semantics', () => {
    const wrapper = mount(KawaiiIcon, {
      props: { name: 'map', label: '世界足迹', decorative: false, size: 32 },
    })
    expect(wrapper.find('[data-kawaii-icon]').exists()).toBe(true)
    expect(wrapper.find('[data-icon-name="map"]').exists()).toBe(true)
    expect(wrapper.attributes('style')).toContain('width: 32px')
    expect(wrapper.attributes('style')).toContain('height: 32px')
  })

  it('renders decorative star with aria-hidden', () => {
    const wrapper = mount(KawaiiIcon, {
      props: { name: 'star' },
    })
    const icon = wrapper.find('[aria-hidden="true"]')
    expect(icon.exists()).toBe(true)
  })
})
