import { describe, expect, it } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import UiPrimitiveShowcase from './UiPrimitiveShowcase.vue'

describe('UiPrimitiveShowcase', () => {
  it('renders UI Primitives and Yume Kawaii Theme text', () => {
    const wrapper = mount(UiPrimitiveShowcase)
    expect(wrapper.text()).toContain('UI Primitives')
    expect(wrapper.text()).toContain('Yume Kawaii Theme')
  })

  it('opens dialog when trigger is clicked', async () => {
    mount(UiPrimitiveShowcase, {
      attachTo: document.body,
    })
    const trigger = document.querySelector('[data-testid="showcase-dialog-trigger"]') as HTMLElement
    expect(trigger).not.toBeNull()
    trigger!.click()
    await flushPromises()
    expect(document.body.textContent).toContain('Dialog Title')
    expect(document.body.textContent).toContain('This is a dialog for the showcase.')
  })

  it('has popover trigger', () => {
    const wrapper = mount(UiPrimitiveShowcase)
    expect(wrapper.find('[data-testid="showcase-popover-trigger"]').exists()).toBe(true)
  })

  it('shows skeleton loading and disabled states', () => {
    const wrapper = mount(UiPrimitiveShowcase)
    expect(wrapper.findAll('[data-state="loading"]').length).toBeGreaterThan(0)
    expect(wrapper.find('button[disabled]').exists()).toBe(true)
  })
})
