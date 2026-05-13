import { getLocalTimeZone, today } from '@internationalized/date'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import type { FootprintPlaceSnapshot } from '@/types/map-point'

vi.mock('@/components/ui/dialog', () => {
  const Dialog = defineComponent({
    name: 'DialogStub',
    props: {
      open: {
        type: Boolean,
        default: false,
      },
    },
    setup(props, { slots }) {
      return () => (props.open ? h('div', { 'data-dialog-root': 'true' }, slots.default?.()) : null)
    },
  })

  const DialogContent = defineComponent({
    name: 'DialogContentStub',
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => h('div', { role: 'dialog', ...attrs }, slots.default?.())
    },
  })

  const passthrough = (name: string, tag: string) =>
    defineComponent({
      name,
      setup(_, { attrs, slots }) {
        return () => h(tag, attrs, slots.default?.())
      },
    })

  return {
    Dialog,
    DialogContent,
    DialogDescription: passthrough('DialogDescriptionStub', 'p'),
    DialogHeader: passthrough('DialogHeaderStub', 'div'),
    DialogTitle: passthrough('DialogTitleStub', 'h1'),
  }
})

vi.mock('@/components/ui/calendar', () => ({
  Calendar: defineComponent({
    name: 'CalendarStub',
    inheritAttrs: false,
    setup(_, { attrs }) {
      return () => h('div', attrs)
    },
  }),
}))

import FootprintDateDialog from './FootprintDateDialog.vue'

const failureMessage = '足迹暂时没有保存成功，请检查网络后重试。'

const placeSnapshot: FootprintPlaceSnapshot = {
  placeId: 'cn-beijing',
  boundaryId: 'cn-beijing-boundary',
  placeKind: 'CN_ADMIN' as const,
  datasetVersion: 'phase-44-test',
  displayName: '北京',
  regionSystem: 'CN',
  adminType: 'ADMIN1',
  typeLabel: '直辖市',
  parentLabel: '中国',
  subtitle: '中国 · 直辖市',
}

function currentDateString() {
  return today(getLocalTimeZone()).toString()
}

function getElement<T extends Element>(selector: string) {
  const element = document.body.querySelector(selector)

  if (!element) {
    throw new Error(`Unable to find ${selector}`)
  }

  return element as T
}

function getAllElements(selector: string) {
  return Array.from(document.body.querySelectorAll(selector))
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
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-13T08:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('renders snapshot place details with Dialog and Calendar hooks', () => {
    mountDialog()

    expect(getElement<HTMLElement>('[data-region="footprint-date-dialog"]').getAttribute('role')).toBe(
      'dialog',
    )
    expect(getElement<HTMLElement>('[data-footprint-place-name]').textContent).toContain('北京')
    expect(document.body.textContent).toContain('直辖市')
    expect(document.body.textContent).toContain('中国 · 直辖市')
    expect(getElement<HTMLElement>('[data-footprint-calendar="true"]')).toBeTruthy()
    expect(getElement<HTMLButtonElement>('[data-footprint-submit="true"]').textContent).toContain(
      '保存足迹',
    )
  })

  it('renders exactly four shortcut buttons today tomorrow weekend custom', () => {
    mountDialog()

    const shortcuts = getAllElements('[data-footprint-shortcut]')

    expect(shortcuts.map((shortcut) => shortcut.getAttribute('data-footprint-shortcut'))).toEqual([
      'today',
      'tomorrow',
      'weekend',
      'custom',
    ])
    expect(shortcuts.map((shortcut) => shortcut.textContent?.trim())).toEqual([
      '今天',
      '明天',
      '本周末',
      '其他日期',
    ])
  })

  it('emits YYYY-MM-DD single-day payload from the selected shortcut', async () => {
    const wrapper = mountDialog()

    getElement<HTMLButtonElement>('[data-footprint-shortcut="today"]').click()
    await wrapper.vm.$nextTick()
    getElement<HTMLButtonElement>('[data-footprint-submit="true"]').click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
      startDate: currentDateString(),
      endDate: null,
    })
  })

  it('keeps the dialog open with selected date when save fails', async () => {
    const wrapper = mountDialog()

    getElement<HTMLButtonElement>('[data-footprint-shortcut="tomorrow"]').click()
    await wrapper.vm.$nextTick()
    getElement<HTMLButtonElement>('[data-footprint-submit="true"]').click()
    await wrapper.vm.$nextTick()
    await wrapper.setProps({ errorMessage: failureMessage })

    expect(getElement<HTMLElement>('[data-region="footprint-date-dialog"]')).toBeTruthy()
    expect(getElement<HTMLElement>('[data-footprint-error="true"]').textContent).toContain(
      failureMessage,
    )
    expect(
      getElement<HTMLButtonElement>('[data-footprint-shortcut="tomorrow"]').getAttribute(
        'aria-pressed',
      ),
    ).toBe('true')
  })

  it('shows a range error and disables submit when end date is earlier than start date', async () => {
    const wrapper = mountDialog()

    getElement<HTMLButtonElement>('[data-footprint-shortcut="tomorrow"]').click()
    await wrapper.vm.$nextTick()

    const dateInput = getElement<HTMLInputElement>('input[type="date"]')
    dateInput.value = '2026-05-13'
    dateInput.dispatchEvent(new Event('input'))
    dateInput.dispatchEvent(new Event('change'))
    await wrapper.vm.$nextTick()

    expect(getElement<HTMLElement>('[data-footprint-range-error="true"]').textContent).toContain(
      '结束日期不能早于开始日期。',
    )
    expect(getElement<HTMLButtonElement>('[data-footprint-submit="true"]').disabled).toBe(true)
  })

  it('emits cancel and exposes labelled close/cancel controls', async () => {
    const wrapper = mountDialog()

    const closeButton = getElement<HTMLButtonElement>('button[aria-label="关闭留下足迹弹窗"]')
    const cancelButton = getElement<HTMLButtonElement>('[data-footprint-cancel="true"]')

    expect(closeButton).toBeTruthy()
    expect(cancelButton.textContent).toContain('取消')

    cancelButton.click()
    await wrapper.vm.$nextTick()
    closeButton.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('cancel')).toHaveLength(2)
  })

  it('locks close and submit affordances while submitting', async () => {
    const wrapper = mountDialog({
      isSubmitting: true,
    })

    expect(getElement<HTMLButtonElement>('[data-footprint-submit="true"]').textContent).toContain(
      '正在保存...',
    )
    expect(getElement<HTMLButtonElement>('[data-footprint-submit="true"]').disabled).toBe(true)
    expect(getElement<HTMLButtonElement>('[data-footprint-cancel="true"]').disabled).toBe(true)

    getElement<HTMLButtonElement>('[data-footprint-cancel="true"]').click()
    getElement<HTMLButtonElement>('button[aria-label="关闭留下足迹弹窗"]').click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('cancel')).toBeFalsy()
  })
})
