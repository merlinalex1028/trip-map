import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UiShowcaseView from './UiShowcaseView.vue'

vi.mock('vue-echarts', () => ({
  default: {
    name: 'VChart',
    props: ['option', 'theme', 'autoresize'],
    template: '<div data-mocked-vchart></div>',
  },
}))

describe('UiShowcaseView', () => {
  it('renders all showcase sections', () => {
    const wrapper = mount(UiShowcaseView)
    expect(wrapper.text()).toContain('UI Primitives')
    expect(wrapper.text()).toContain('Yume Kawaii Theme')
    expect(wrapper.text()).toContain('Semantic Icons')
    expect(wrapper.text()).toContain('Chart Foundation')
  })

  it('renders icon examples with data-icon-name', () => {
    const wrapper = mount(UiShowcaseView)
    expect(wrapper.find('[data-icon-name="map"]').exists()).toBe(true)
    expect(wrapper.find('[data-icon-name="journal"]').exists()).toBe(true)
    expect(wrapper.find('[data-icon-name="memories"]').exists()).toBe(true)
  })

  it('renders chart states', () => {
    const wrapper = mount(UiShowcaseView)
    expect(wrapper.findAll('[data-state="loading"]').length).toBeGreaterThan(0)
    expect(wrapper.findAll('[data-state="empty"]').length).toBeGreaterThan(0)
    expect(wrapper.findAll('[data-state="error"]').length).toBeGreaterThan(0)
    expect(wrapper.findAll('[data-mocked-vchart]').length).toBeGreaterThan(0)
  })

  it('clicks dialog and popover triggers from UiPrimitiveShowcase', async () => {
    mount(UiShowcaseView, {
      attachTo: document.body,
    })
    const dialogTrigger = document.querySelector('[data-testid="showcase-dialog-trigger"]') as HTMLElement
    expect(dialogTrigger).not.toBeNull()
    dialogTrigger!.click()
    await new Promise(r => setTimeout(r, 50))
    expect(document.body.textContent).toContain('Dialog Title')
  })
})
