import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

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
    emits: ['update:modelValue'],
    setup(_, { attrs, emit }) {
      return () =>
        h('div', {
          ...attrs,
          onClick: () => emit('update:modelValue', { toString: () => '2026-05-20' }),
        })
    },
  }),
}))

import FootprintDateDialog from './FootprintDateDialog.vue'

const failureMessage = '足迹暂时没有保存成功，请检查网络后重试。'
const footprintDateDialogSource = readFileSync(
  resolve(process.cwd(), 'src/components/map-popup/FootprintDateDialog.vue'),
  'utf8',
)
const calendarSource = readFileSync(resolve(process.cwd(), 'src/components/ui/calendar/Calendar.vue'), 'utf8')
const calendarPrevButtonSource = readFileSync(
  resolve(process.cwd(), 'src/components/ui/calendar/CalendarPrevButton.vue'),
  'utf8',
)
const calendarNextButtonSource = readFileSync(
  resolve(process.cwd(), 'src/components/ui/calendar/CalendarNextButton.vue'),
  'utf8',
)

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
    expect(getElement<HTMLButtonElement>('[data-footprint-cancel="true"]').textContent).toContain(
      '取消',
    )
    expect(getElement<HTMLButtonElement>('[data-footprint-submit="true"]').textContent).toContain(
      '留下足迹',
    )
  })

  it('uses viewport-safe responsive layout contracts for the date dialog', () => {
    mountDialog()

    const dialogShell = getElement<HTMLElement>('.footprint-date-dialog')

    expect(dialogShell.getAttribute('class')).toContain(
      'w-[min(1120px,calc(100vw_-_40px))]',
    )
    expect(dialogShell.getAttribute('class')).toContain('overflow-visible')
    expect(dialogShell.getAttribute('class')).toContain('max-w-[calc(100vw_-_40px)]')
    expect(dialogShell.getAttribute('class')).toContain('sm:max-w-[calc(100vw_-_40px)]')
    expect(dialogShell.getAttribute('class')).toContain('xl:max-w-[1120px]')
    expect(footprintDateDialogSource).toContain(
      'grid-template-columns: minmax(0, 0.84fr) minmax(0, 1.16fr);',
    )
    expect(footprintDateDialogSource).toContain('padding: 34px 34px 46px;')
    expect(footprintDateDialogSource).toContain('width: 100%;')
    expect(footprintDateDialogSource).toMatch(
      /\.footprint-date-dialog__surface \{\n[\s\S]*overflow: visible;/,
    )
    expect(footprintDateDialogSource).toContain('@media (max-width: 1180px)')
    expect(footprintDateDialogSource).toContain('grid-template-columns: 1fr;')
    expect(footprintDateDialogSource).toContain('column-gap: 18px;')
    expect(footprintDateDialogSource).toMatch(
      /\.footprint-date-dialog__place-pane,\n\.footprint-date-dialog__date-pane \{\n[\s\S]*min-width: 0;/,
    )
    expect(footprintDateDialogSource).toMatch(
      /\.footprint-date-dialog__actions \{\n[\s\S]*min-width: 0;/,
    )
  })

  it('truncates long place names and exposes the full name in a styled tooltip', () => {
    mountDialog({
      place: {
        ...placeSnapshot,
        displayName: '巴音郭楞蒙古自治州',
      },
    })

    expect(getElement<HTMLElement>('[data-footprint-place-name]').textContent).toContain(
      '巴音郭楞蒙古自治州',
    )
    expect(footprintDateDialogSource).toContain('TooltipContent')
    expect(footprintDateDialogSource).toContain('hide-arrow')
    expect(footprintDateDialogSource).toContain('class="footprint-date-dialog__place-tooltip"')
    expect(footprintDateDialogSource).toMatch(
      /\.footprint-date-dialog__place-title \{\n[\s\S]*overflow: hidden;\n[\s\S]*text-overflow: ellipsis;\n[\s\S]*white-space: nowrap;/,
    )
  })

  it('renders exactly three shortcut buttons and no custom date input', () => {
    mountDialog()

    const shortcuts = getAllElements('[data-footprint-shortcut]')

    expect(shortcuts.map((shortcut) => shortcut.getAttribute('data-footprint-shortcut'))).toEqual([
      'today',
      'tomorrow',
      'weekend',
    ])
    expect(shortcuts.map((shortcut) => shortcut.textContent?.trim())).toEqual([
      '今天',
      '明天',
      '本周末',
    ])
    expect(document.body.querySelector('[data-footprint-shortcut="custom"]')).toBeNull()
    expect(document.body.querySelector('input[type="date"]')).toBeNull()
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

  it('clears shortcut pressed state after manual calendar selection', async () => {
    const wrapper = mountDialog()

    getElement<HTMLButtonElement>('[data-footprint-shortcut="tomorrow"]').click()
    await wrapper.vm.$nextTick()

    getElement<HTMLElement>('.footprint-date-dialog__calendar').click()
    await wrapper.vm.$nextTick()

    expect(
      getAllElements('[data-footprint-shortcut]').map((shortcut) =>
        shortcut.getAttribute('aria-pressed'),
      ),
    ).toEqual(['false', 'false', 'false'])
  })

  it('keeps Phase44 visual contracts in source', () => {
    expect(footprintDateDialogSource).toContain(
      "import arrivalDateIcon from '@/assets/v8/map-popup/arrival-date-icon.png'",
    )
    expect(footprintDateDialogSource).toContain(':src="arrivalDateIcon"')
    expect(footprintDateDialogSource).toMatch(
      /\.footprint-date-dialog__surface \{\n[\s\S]*border-radius: 32px;\n[\s\S]*overflow: visible;/,
    )
    expect(footprintDateDialogSource).not.toContain('足迹会记录在你的旅行时间轴中')
    expect(footprintDateDialogSource).not.toContain('data-footprint-shortcut="custom"')
    expect(footprintDateDialogSource).not.toContain('type="date"')
    expect(footprintDateDialogSource).toMatch(
      /\.footprint-date-dialog__place-pane \{\n[\s\S]*overflow: visible;/,
    )
    expect(footprintDateDialogSource).toMatch(
      /\.footprint-date-dialog__visual \{\n[\s\S]*overflow: visible;/,
    )
    expect(footprintDateDialogSource).toMatch(
      /\.footprint-date-dialog__visual \{\n[\s\S]*width: min\(366px, calc\(100% \+ 88px\)\);/,
    )
    expect(footprintDateDialogSource).not.toContain('footprint-date-dialog__speech')
    expect(footprintDateDialogSource).not.toContain('每一次抵达，都是与世界的温柔相遇')
    expect(calendarSource).toContain('v-if="$slots[\'calendar-prev-icon\']"')
    expect(calendarSource).toContain('v-if="$slots[\'calendar-next-icon\']"')
    expect(calendarPrevButtonSource).toContain('&lsaquo;')
    expect(calendarNextButtonSource).toContain('&rsaquo;')
    expect(footprintDateDialogSource).toMatch(
      /data-slot='calendar-prev-button'\]\),\n\.footprint-date-dialog :deep\(\[data-slot='calendar-next-button'\]\) \{\n[\s\S]*opacity: 1;/,
    )
    expect(footprintDateDialogSource).toMatch(
      /data-slot='calendar-prev-button'\]\)::before,\n\.footprint-date-dialog :deep\(\[data-slot='calendar-next-button'\]\)::before \{\n[\s\S]*width: 11px;\n[\s\S]*height: 11px;\n[\s\S]*border-style: solid;/,
    )
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
