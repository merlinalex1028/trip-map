import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'

import TimelineVisitCard from './TimelineVisitCard.vue'
import type { TimelineEntry } from '../../services/timeline'
import { useMapPointsStore } from '../../stores/map-points'

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

function mountCard(entry: TimelineEntry) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const mapPointsStore = useMapPointsStore()

  const wrapper = mount(TimelineVisitCard, {
    props: { entry },
    global: { plugins: [pinia] },
  })

  return { mapPointsStore, wrapper }
}

describe('TimelineVisitCard', () => {
  it('renders readonly mode: display name, date, and type label', () => {
    const entry = makeTimelineEntry({
      displayName: '洛杉矶',
      typeLabel: '州',
      parentLabel: '美国',
      startDate: '2025-03-01',
      endDate: '2025-03-10',
    })
    const { wrapper } = mountCard(entry)

    expect(wrapper.text()).toContain('洛杉矶')
    expect(wrapper.text()).toContain('市')
    expect(wrapper.text()).toContain('州')
    expect(wrapper.text()).toContain('2025-03-01')
    expect(wrapper.text()).toContain('美国')
  })

  it('shows action bar with edit and delete buttons', () => {
    const entry = makeTimelineEntry()
    const { wrapper } = mountCard(entry)

    expect(wrapper.find('[data-card-edit]').exists()).toBe(true)
    expect(wrapper.find('[data-card-delete]').exists()).toBe(true)
    expect(wrapper.get('[data-card-edit]').text()).toBe('编辑')
    expect(wrapper.get('[data-card-delete]').text()).toBe('删除')
  })

  it('enters edit mode when edit button is clicked', async () => {
    const entry = makeTimelineEntry()
    const { wrapper } = mountCard(entry)

    // Initially in readonly mode — no edit form
    expect(wrapper.find('[data-region="timeline-edit-form"]').exists()).toBe(false)

    // Click edit button
    await wrapper.get('[data-card-edit]').trigger('click')

    // Edit form should appear
    expect(wrapper.find('[data-region="timeline-edit-form"]').exists()).toBe(true)
  })

  it('exits edit mode when cancel is clicked', async () => {
    const entry = makeTimelineEntry()
    const { wrapper } = mountCard(entry)

    // Enter edit mode
    await wrapper.get('[data-card-edit]').trigger('click')
    expect(wrapper.find('[data-region="timeline-edit-form"]').exists()).toBe(true)

    // Click cancel in edit form
    await wrapper.get('[data-edit-cancel="true"]').trigger('click')

    // Should return to readonly mode
    expect(wrapper.find('[data-region="timeline-edit-form"]').exists()).toBe(false)
    // Readonly content should be visible again
    expect(wrapper.find('[data-card-edit]').exists()).toBe(true)
  })

  it('submits edit and calls store.updateRecord', async () => {
    const entry = makeTimelineEntry({
      notes: '旅行备注',
      tags: ['美食'],
    })
    const { mapPointsStore, wrapper } = mountCard(entry)

    const updateRecordSpy = vi.spyOn(mapPointsStore, 'updateRecord').mockResolvedValue(undefined)

    // Enter edit mode
    await wrapper.get('[data-card-edit]').trigger('click')

    // Submit the form
    await wrapper.get('form').trigger('submit')

    expect(updateRecordSpy).toHaveBeenCalledWith('record-1', {
      startDate: '2025-01-15',
      endDate: null,
      notes: '旅行备注',
      tags: ['美食'],
    })
  })

  it('shows ConfirmDialog when delete button is clicked', async () => {
    const entry = makeTimelineEntry()
    const { wrapper } = mountCard(entry)

    // No dialog initially
    expect(wrapper.find('[data-confirm-dialog-backdrop]').exists()).toBe(false)

    // Click delete button
    await wrapper.get('[data-card-delete]').trigger('click')

    // Dialog should appear
    expect(wrapper.find('[data-confirm-dialog-backdrop]').exists()).toBe(true)
  })

  it('calls store.deleteSingleRecord when delete is confirmed', async () => {
    const entry = makeTimelineEntry()
    const { mapPointsStore, wrapper } = mountCard(entry)

    const deleteSpy = vi.spyOn(mapPointsStore, 'deleteSingleRecord').mockResolvedValue(undefined)

    // Click delete
    await wrapper.get('[data-card-delete]').trigger('click')

    // Confirm deletion
    await wrapper.get('[data-confirm-dialog-confirm]').trigger('click')

    expect(deleteSpy).toHaveBeenCalledWith('record-1')
  })

  it('closes ConfirmDialog when cancel is clicked', async () => {
    const entry = makeTimelineEntry()
    const { wrapper } = mountCard(entry)

    // Click delete
    await wrapper.get('[data-card-delete]').trigger('click')
    expect(wrapper.find('[data-confirm-dialog-backdrop]').exists()).toBe(true)

    // Cancel deletion
    await wrapper.get('[data-confirm-dialog-cancel]').trigger('click')

    // Dialog should close
    expect(wrapper.find('[data-confirm-dialog-backdrop]').exists()).toBe(false)
  })

  it('shows last-record warning with destructive tone when visitCount is 1', async () => {
    const entry = makeTimelineEntry({ visitCount: 1 })
    const { wrapper } = mountCard(entry)

    await wrapper.get('[data-card-delete]').trigger('click')

    expect(wrapper.get('[data-confirm-dialog-title]').text()).toBe('删除该地点最后一条记录')
    expect(wrapper.get('[data-confirm-dialog-confirm]').classes()).toContain('text-[var(--color-destructive)]')
  })

  it('shows normal delete message when visitCount > 1', async () => {
    const entry = makeTimelineEntry({ visitCount: 3, visitOrdinal: 2 })
    const { wrapper } = mountCard(entry)

    await wrapper.get('[data-card-delete]').trigger('click')

    expect(wrapper.get('[data-confirm-dialog-title]').text()).toBe('删除旅行记录')
  })

  it('renders notes section when entry has notes', () => {
    const entry = makeTimelineEntry({
      notes: '和家人一起去的',
    })
    const { wrapper } = mountCard(entry)

    expect(wrapper.text()).toContain('和家人一起去的')
    expect(wrapper.text()).toContain('备注')
  })

  it('renders tags when entry has tags', () => {
    const entry = makeTimelineEntry({
      tags: ['美食', '文化', '历史'],
    })
    const { wrapper } = mountCard(entry)

    expect(wrapper.text()).toContain('美食')
    expect(wrapper.text()).toContain('文化')
    expect(wrapper.text()).toContain('历史')
  })
})
