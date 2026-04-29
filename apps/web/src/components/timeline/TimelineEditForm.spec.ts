import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import TimelineEditForm from './TimelineEditForm.vue'
import type { TimelineEntry } from '../../services/timeline'

function makeTimelineEntry(overrides: Partial<TimelineEntry> = {}): TimelineEntry {
  return {
    recordId: 'record-1',
    placeId: 'place-1',
    displayName: '北京',
    parentLabel: '中国',
    subtitle: '北京市',
    typeLabel: '市',
    startDate: '2025-01-15',
    endDate: null,
    createdAt: '2025-01-16T00:00:00.000Z',
    hasKnownDate: true,
    sortDate: '2025-01-15',
    visitOrdinal: 1,
    visitCount: 1,
    notes: null,
    tags: [],
    ...overrides,
  }
}

describe('TimelineEditForm', () => {
  it('renders initial date, notes and tags from the record', () => {
    const entry = makeTimelineEntry({
      startDate: '2025-01-15',
      endDate: '2025-01-20',
      notes: '旅行备注',
      tags: ['美食', '文化'],
    })
    const wrapper = mount(TimelineEditForm, {
      props: { record: entry },
    })

    expect((wrapper.get('[data-edit-input="start-date"]').element as HTMLInputElement).value).toBe('2025-01-15')
    expect((wrapper.get('[data-edit-input="end-date"]').element as HTMLInputElement).value).toBe('2025-01-20')
    expect((wrapper.get('[data-edit-input="notes"]').element as HTMLTextAreaElement).value).toBe('旅行备注')
    expect(wrapper.findAll('[data-tag-chip]')).toHaveLength(2)
  })

  it('shows range error when endDate is earlier than startDate', async () => {
    const entry = makeTimelineEntry({ startDate: '2025-01-15', endDate: null })
    const wrapper = mount(TimelineEditForm, {
      props: { record: entry },
    })

    await wrapper.get('[data-edit-input="end-date"]').setValue('2025-01-10')

    expect(wrapper.get('[data-edit-error="range"]').text()).toContain('结束日期不能早于开始日期')
    expect(wrapper.get('[data-edit-submit="true"]').attributes('disabled')).toBeDefined()
  })

  it('shows notes length error when notes exceed 1000 characters', async () => {
    const entry = makeTimelineEntry({ notes: null })
    const wrapper = mount(TimelineEditForm, {
      props: { record: entry },
    })

    const longNotes = 'あ'.repeat(1001)
    const textarea = wrapper.get('[data-edit-input="notes"]')
    await textarea.setValue(longNotes)

    expect(wrapper.get('[data-edit-error="notes"]').text()).toContain('备注不能超过 1000 字符')
    expect(wrapper.get('[data-edit-submit="true"]').attributes('disabled')).toBeDefined()
  })

  it('shows date conflict warning when conflictingDates is non-empty', () => {
    const entry = makeTimelineEntry()
    const wrapper = mount(TimelineEditForm, {
      props: {
        record: entry,
        conflictingDates: ['2025-01-03 ~ 2025-01-07'],
      },
    })

    expect(wrapper.get('[data-edit-warning="date-conflict"]').text()).toContain('2025-01-03 ~ 2025-01-07')
  })

  it('emits submit with correct payload on form submission', async () => {
    const entry = makeTimelineEntry({
      startDate: '2025-01-15',
      endDate: null,
      notes: null,
      tags: [],
    })
    const wrapper = mount(TimelineEditForm, {
      props: { record: entry },
    })

    await wrapper.get('[data-edit-input="start-date"]').setValue('2025-01-20')
    await wrapper.get('[data-edit-input="end-date"]').setValue('2025-01-25')
    await wrapper.get('[data-edit-input="notes"]').setValue('更新后的备注')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
      startDate: '2025-01-20',
      endDate: '2025-01-25',
      notes: '更新后的备注',
      tags: [],
    })
  })

  it('emits cancel when cancel button is clicked', async () => {
    const entry = makeTimelineEntry()
    const wrapper = mount(TimelineEditForm, {
      props: { record: entry },
    })

    await wrapper.get('[data-edit-cancel="true"]').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('disables submit button when isSubmitting is true', () => {
    const entry = makeTimelineEntry()
    const wrapper = mount(TimelineEditForm, {
      props: { record: entry, isSubmitting: true },
    })

    expect(wrapper.get('[data-edit-submit="true"]').attributes('disabled')).toBeDefined()
  })

  it('emits notes as null when notes field is empty', async () => {
    const entry = makeTimelineEntry({
      startDate: '2025-01-15',
      notes: '一些备注',
    })
    const wrapper = mount(TimelineEditForm, {
      props: { record: entry },
    })

    // 清空备注
    const textarea = wrapper.get('[data-edit-input="notes"]')
    await textarea.setValue('')
    await wrapper.get('form').trigger('submit')

    const emitted = wrapper.emitted('submit')
    expect(emitted).toBeDefined()
    const payload = emitted![0][0] as Record<string, unknown>
    expect(payload.notes).toBeNull()
  })
})
