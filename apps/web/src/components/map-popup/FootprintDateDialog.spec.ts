import { getLocalTimeZone, today } from '@internationalized/date'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import FootprintDateDialog from './FootprintDateDialog.vue'

const failureMessage = '足迹暂时没有保存成功，请检查网络后重试。'

const placeSnapshot = {
  placeId: 'cn-beijing',
  boundaryId: 'cn-beijing-boundary',
  placeKind: 'CN_ADMIN' as const,
  datasetVersion: 'phase-44-test',
  displayName: '北京',
  typeLabel: '直辖市',
  parentLabel: '中国',
  subtitle: '中国 · 直辖市',
}

function currentDateString() {
  return today(getLocalTimeZone()).toString()
}

function mountDialog(props: Partial<InstanceType<typeof FootprintDateDialog>['$props']> = {}) {
  return mount(FootprintDateDialog, {
    attachTo: document.body,
    props: {
      open: true,
      place: placeSnapshot,
      isSubmitting: false,
      errorMessage: null,
      ...props,
    },
  })
}

describe('FootprintDateDialog', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-05-13T08:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('renders snapshot place details with Dialog and Calendar hooks', () => {
    const wrapper = mountDialog()

    expect(wrapper.get('[data-region="footprint-date-dialog"]').attributes('role')).toBe('dialog')
    expect(wrapper.get('[data-footprint-place-name]').text()).toContain('北京')
    expect(wrapper.text()).toContain('直辖市')
    expect(wrapper.text()).toContain('中国 · 直辖市')
    expect(wrapper.get('[data-footprint-calendar="true"]').exists()).toBe(true)
    expect(wrapper.get('[data-footprint-submit="true"]').text()).toContain('保存足迹')
  })

  it('renders exactly four shortcut buttons today tomorrow weekend custom', () => {
    const wrapper = mountDialog()

    const shortcuts = wrapper.findAll('[data-footprint-shortcut]')

    expect(shortcuts.map((shortcut) => shortcut.attributes('data-footprint-shortcut'))).toEqual([
      'today',
      'tomorrow',
      'weekend',
      'custom',
    ])
    expect(shortcuts.map((shortcut) => shortcut.text())).toEqual([
      '今天',
      '明天',
      '本周末',
      '其他日期',
    ])
  })

  it('emits YYYY-MM-DD single-day payload from the selected shortcut', async () => {
    const wrapper = mountDialog()

    await wrapper.get('[data-footprint-shortcut="today"]').trigger('click')
    await wrapper.get('[data-footprint-submit="true"]').trigger('click')

    expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
      startDate: currentDateString(),
      endDate: null,
    })
  })

  it('keeps the dialog open with selected date when save fails', async () => {
    const wrapper = mountDialog()

    await wrapper.get('[data-footprint-shortcut="tomorrow"]').trigger('click')
    await wrapper.get('[data-footprint-submit="true"]').trigger('click')
    await wrapper.setProps({ errorMessage: failureMessage })

    expect(wrapper.get('[data-region="footprint-date-dialog"]').exists()).toBe(true)
    expect(wrapper.get('[data-footprint-error="true"]').text()).toContain(failureMessage)
    expect(wrapper.get('[data-footprint-shortcut="tomorrow"]').attributes('aria-pressed')).toBe(
      'true',
    )
  })

  it('emits cancel and exposes labelled close/cancel controls', async () => {
    const wrapper = mountDialog()

    const closeButton = wrapper.get('button[aria-label="关闭留下足迹弹窗"]')
    const cancelButton = wrapper.get('[data-footprint-cancel="true"]')

    expect(closeButton.exists()).toBe(true)
    expect(cancelButton.text()).toContain('取消')

    await cancelButton.trigger('click')
    await closeButton.trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(2)
  })
})
