import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ConfirmDialog from './ConfirmDialog.vue'

describe('ConfirmDialog', () => {
  it('renders dialog when isOpen is true', () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        isOpen: true,
        title: '确认操作',
        message: '确认执行此操作？',
      },
    })

    expect(wrapper.find('[data-confirm-dialog-backdrop]').exists()).toBe(true)
    expect(wrapper.find('[data-confirm-dialog-title]').text()).toBe('确认操作')
    expect(wrapper.find('[data-confirm-dialog-message]').text()).toBe('确认执行此操作？')
  })

  it('does not render dialog when isOpen is false', () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        isOpen: false,
        title: '确认操作',
        message: '确认执行此操作？',
      },
    })

    expect(wrapper.find('[data-confirm-dialog-backdrop]').exists()).toBe(false)
  })

  it('emits confirm when confirm button is clicked', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        isOpen: true,
        title: '确认操作',
        message: '确认执行此操作？',
      },
    })

    await wrapper.get('[data-confirm-dialog-confirm]').trigger('click')

    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('emits cancel when cancel button is clicked', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        isOpen: true,
        title: '确认操作',
        message: '确认执行此操作？',
      },
    })

    await wrapper.get('[data-confirm-dialog-cancel]').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('emits cancel when Escape key is pressed', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        isOpen: true,
        title: '确认操作',
        message: '确认执行此操作？',
      },
    })

    await wrapper.get('[data-confirm-dialog-backdrop]').trigger('keydown', {
      key: 'Escape',
    })

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('emits cancel when backdrop is clicked', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        isOpen: true,
        title: '确认操作',
        message: '确认执行此操作？',
      },
    })

    await wrapper.get('[data-confirm-dialog-backdrop]').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('renders destructive confirm button style when tone is destructive', () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        isOpen: true,
        title: '删除记录',
        message: '确认删除？',
        tone: 'destructive',
      },
    })

    const confirmBtn = wrapper.get('[data-confirm-dialog-confirm]')
    expect(confirmBtn.classes()).toContain('text-[var(--color-destructive)]')
  })

  it('renders custom confirmLabel and cancelLabel', () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        isOpen: true,
        title: '确认操作',
        message: '确认执行此操作？',
        confirmLabel: '确认删除',
        cancelLabel: '返回',
      },
    })

    expect(wrapper.get('[data-confirm-dialog-confirm]').text()).toBe('确认删除')
    expect(wrapper.get('[data-confirm-dialog-cancel]').text()).toBe('返回')
  })

  it('has ARIA attributes role="dialog" and aria-modal="true"', () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        isOpen: true,
        title: '确认操作',
        message: '确认执行此操作？',
      },
    })

    const backdrop = wrapper.get('[data-confirm-dialog-backdrop]')
    expect(backdrop.attributes('role')).toBe('dialog')
    expect(backdrop.attributes('aria-modal')).toBe('true')
  })

  it('does not emit cancel when clicking inside the dialog content', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        isOpen: true,
        title: '确认操作',
        message: '确认执行此操作？',
      },
    })

    // Click on the content section (not backdrop) — should not emit cancel
    await wrapper.get('[data-confirm-dialog-content]').trigger('click')

    expect(wrapper.emitted('cancel')).toBeUndefined()
  })
})
