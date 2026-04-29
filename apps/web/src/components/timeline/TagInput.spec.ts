import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import TagInput from './TagInput.vue'

describe('TagInput', () => {
  it('renders existing tags as chips with delete buttons', () => {
    const wrapper = mount(TagInput, {
      props: { tags: ['美食', '文化'] },
    })

    const chips = wrapper.findAll('[data-tag-chip]')
    expect(chips).toHaveLength(2)
    expect(chips[0].text()).toContain('美食')
    expect(chips[1].text()).toContain('文化')
    expect(chips[0].find('[data-tag-remove]').exists()).toBe(true)
    expect(chips[1].find('[data-tag-remove]').exists()).toBe(true)
  })

  it('adds a tag on Enter key and emits update:tags', async () => {
    const wrapper = mount(TagInput, {
      props: { tags: ['美食', '文化'] },
    })

    const input = wrapper.get('[data-tag-input-field]')
    await input.setValue('历史')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:tags')?.[0]?.[0]).toEqual(['美食', '文化', '历史'])
  })

  it('adds a tag on comma key and emits update:tags', async () => {
    const wrapper = mount(TagInput, {
      props: { tags: ['美食'] },
    })

    const input = wrapper.get('[data-tag-input-field]')
    await input.setValue('文化')
    await input.trigger('keydown', { key: ',' })

    expect(wrapper.emitted('update:tags')?.[0]?.[0]).toEqual(['美食', '文化'])
  })

  it('auto-adds non-empty content on blur', async () => {
    const wrapper = mount(TagInput, {
      props: { tags: [] },
    })

    const input = wrapper.get('[data-tag-input-field]')
    await input.setValue('美食')
    await input.trigger('blur')

    expect(wrapper.emitted('update:tags')?.[0]?.[0]).toEqual(['美食'])
  })

  it('removes a tag when its delete button is clicked', async () => {
    const wrapper = mount(TagInput, {
      props: { tags: ['美食', '文化'] },
    })

    const removeButtons = wrapper.findAll('[data-tag-remove]')
    await removeButtons[0].trigger('click')

    expect(wrapper.emitted('update:tags')?.[0]?.[0]).toEqual(['文化'])
  })

  it('does not add duplicate tags', async () => {
    const wrapper = mount(TagInput, {
      props: { tags: ['美食', '文化'] },
    })

    const input = wrapper.get('[data-tag-input-field]')
    await input.setValue('美食')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:tags')).toBeFalsy()
  })

  it('does not add whitespace-only tags', async () => {
    const wrapper = mount(TagInput, {
      props: { tags: [] },
    })

    const input = wrapper.get('[data-tag-input-field]')
    await input.setValue('   ')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:tags')).toBeFalsy()
  })

  it('does not add tags exceeding maxTagLength', async () => {
    const wrapper = mount(TagInput, {
      props: { tags: [], maxTagLength: 20 },
    })

    const input = wrapper.get('[data-tag-input-field]')
    await input.setValue('这是一个超过二十个字符的标签名字测试')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:tags')).toBeFalsy()
  })

  it('disables input when tag limit is reached', () => {
    const tags = Array.from({ length: 10 }, (_, i) => `tag-${i + 1}`)
    const wrapper = mount(TagInput, {
      props: { tags, maxTags: 10 },
    })

    const input = wrapper.get('[data-tag-input-field]')
    expect(input.attributes('disabled')).toBeDefined()
  })

  it('removes the last tag on Backspace when input is empty', async () => {
    const wrapper = mount(TagInput, {
      props: { tags: ['美食', '文化'] },
    })

    const input = wrapper.get('[data-tag-input-field]')
    await input.trigger('keydown', { key: 'Backspace' })

    expect(wrapper.emitted('update:tags')?.[0]?.[0]).toEqual(['美食'])
  })
})
