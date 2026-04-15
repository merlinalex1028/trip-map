import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import LocalImportDecisionDialog from './LocalImportDecisionDialog.vue'

describe('LocalImportDecisionDialog', () => {
  it('renders exactly two primary decision CTAs with the required labels', () => {
    const wrapper = mount(LocalImportDecisionDialog, {
      props: {
        decision: {
          legacyRecordCount: 2,
          records: [],
        },
      },
    })

    const buttons = wrapper.findAll('button')

    expect(buttons).toHaveLength(2)
    expect(buttons[0]?.text()).toBe('导入本地记录到当前账号')
    expect(buttons[1]?.text()).toBe('以当前账号云端记录为准')
    expect(wrapper.text()).not.toContain('稍后再说')
  })

  it('disables repeated clicks while importing', () => {
    const wrapper = mount(LocalImportDecisionDialog, {
      props: {
        decision: {
          legacyRecordCount: 1,
          records: [],
        },
        submitting: true,
      },
    })

    expect(wrapper.get('[data-local-import-action="import"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-local-import-action="keep-cloud"]').attributes('disabled')).toBeDefined()
  })

  it('shows authoritative import summary counts after import succeeds', () => {
    const wrapper = mount(LocalImportDecisionDialog, {
      props: {
        summary: {
          importedCount: 3,
          mergedDuplicateCount: 1,
          finalCount: 8,
        },
      },
    })

    expect(wrapper.text()).toContain('importedCount')
    expect(wrapper.text()).toContain('mergedDuplicateCount')
    expect(wrapper.text()).toContain('finalCount')
    expect(wrapper.text()).toContain('3')
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('8')
  })
})
