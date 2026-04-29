import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'

import type { TravelRecord } from '@trip-map/contracts'
import PopupTripRecord from './PopupTripRecord.vue'
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

function makeTravelRecord(overrides: Partial<TravelRecord> = {}): TravelRecord {
  return {
    id: 'record-other',
    placeId: 'place-1',
    boundaryId: '',
    placeKind: 'CN_ADMIN',
    datasetVersion: 'v1',
    displayName: '北京',
    regionSystem: 'CN',
    adminType: 'MUNICIPALITY',
    typeLabel: '市',
    parentLabel: '中国',
    subtitle: '北京市',
    startDate: null,
    endDate: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    notes: null,
    tags: [],
    ...overrides,
  }
}

function mountCard(entry: TimelineEntry) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const mapPointsStore = useMapPointsStore()

  const wrapper = mount(PopupTripRecord, {
    props: { entry },
    global: { plugins: [pinia] },
  })

  return { mapPointsStore, wrapper }
}

describe('PopupTripRecord', () => {
  it('renders record date display in read mode', () => {
    const entry = makeTimelineEntry({
      startDate: '2025-03-01',
      endDate: '2025-03-10',
    })
    const { wrapper } = mountCard(entry)

    expect(wrapper.find('[data-region="popup-trip-record"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('2025-03-01')
    expect(wrapper.text()).toContain('2025-03-10')
  })

  it('renders notes preview when record has notes', () => {
    const entry = makeTimelineEntry({
      notes: '和家人一起去的，非常开心',
    })
    const { wrapper } = mountCard(entry)

    expect(wrapper.text()).toContain('和家人一起去的')
  })

  it('renders tags as pill chips when record has tags', () => {
    const entry = makeTimelineEntry({
      tags: ['美食', '文化', '历史'],
    })
    const { wrapper } = mountCard(entry)

    expect(wrapper.text()).toContain('美食')
    expect(wrapper.text()).toContain('文化')
    expect(wrapper.text()).toContain('历史')
  })

  it('shows edit and delete buttons in read mode', () => {
    const entry = makeTimelineEntry()
    const { wrapper } = mountCard(entry)

    expect(wrapper.find('[data-popup-edit]').exists()).toBe(true)
    expect(wrapper.find('[data-popup-delete]').exists()).toBe(true)
    expect(wrapper.get('[data-popup-edit]').text()).toBe('编辑')
    expect(wrapper.get('[data-popup-delete]').text()).toBe('删除')
  })

  it('clicking edit button switches to edit mode showing TimelineEditForm', async () => {
    const entry = makeTimelineEntry()
    const { wrapper } = mountCard(entry)

    // Initially in read mode — no edit form
    expect(wrapper.find('[data-region="timeline-edit-form"]').exists()).toBe(false)

    // Click edit
    await wrapper.get('[data-popup-edit]').trigger('click')

    // Edit form should appear
    expect(wrapper.find('[data-region="timeline-edit-form"]').exists()).toBe(true)
  })

  it('clicking cancel in edit mode returns to read mode', async () => {
    const entry = makeTimelineEntry()
    const { wrapper } = mountCard(entry)

    // Enter edit mode
    await wrapper.get('[data-popup-edit]').trigger('click')
    expect(wrapper.find('[data-region="timeline-edit-form"]').exists()).toBe(true)

    // Click cancel
    await wrapper.get('[data-edit-cancel="true"]').trigger('click')

    // Should return to read mode
    expect(wrapper.find('[data-region="timeline-edit-form"]').exists()).toBe(false)
    expect(wrapper.find('[data-popup-edit]').exists()).toBe(true)
  })

  it('clicking delete button opens ConfirmDialog', async () => {
    const entry = makeTimelineEntry()
    const { wrapper } = mountCard(entry)

    // No dialog initially
    expect(wrapper.find('[data-confirm-dialog-backdrop]').exists()).toBe(false)

    // Click delete
    await wrapper.get('[data-popup-delete]').trigger('click')

    // Dialog should appear
    expect(wrapper.find('[data-confirm-dialog-backdrop]').exists()).toBe(true)
  })

  it('clicking cancel in ConfirmDialog closes it without deleting', async () => {
    const entry = makeTimelineEntry()
    const { wrapper } = mountCard(entry)

    // Click delete
    await wrapper.get('[data-popup-delete]').trigger('click')
    expect(wrapper.find('[data-confirm-dialog-backdrop]').exists()).toBe(true)

    // Click cancel in dialog
    await wrapper.get('[data-confirm-dialog-cancel]').trigger('click')

    // Dialog should close
    expect(wrapper.find('[data-confirm-dialog-backdrop]').exists()).toBe(false)
  })

  it('clicking confirm in delete dialog calls mapPointsStore.deleteSingleRecord', async () => {
    const entry = makeTimelineEntry()
    const { mapPointsStore, wrapper } = mountCard(entry)

    const deleteSpy = vi.spyOn(mapPointsStore, 'deleteSingleRecord').mockResolvedValue(undefined)

    // Click delete
    await wrapper.get('[data-popup-delete]').trigger('click')

    // Confirm deletion
    await wrapper.get('[data-confirm-dialog-confirm]').trigger('click')

    expect(deleteSpy).toHaveBeenCalledWith('record-1')
  })

  it('when visitCount=1, delete dialog uses destructive tone with last-record warning', async () => {
    const entry = makeTimelineEntry({ visitCount: 1 })
    const { wrapper } = mountCard(entry)

    // Click delete
    await wrapper.get('[data-popup-delete]').trigger('click')

    expect(wrapper.get('[data-confirm-dialog-title]').text()).toBe('删除该地点最后一条记录')
    expect(wrapper.get('[data-confirm-dialog-message]').text()).toContain('唯一一条记录')
    expect(wrapper.get('[data-confirm-dialog-confirm]').classes()).toContain('text-[var(--color-destructive)]')
  })

  it('edit submit calls mapPointsStore.updateRecord with correct payload and exits edit mode', async () => {
    const entry = makeTimelineEntry({
      notes: '旅行备注',
      tags: ['美食'],
    })
    const { mapPointsStore, wrapper } = mountCard(entry)

    const updateSpy = vi.spyOn(mapPointsStore, 'updateRecord').mockResolvedValue(undefined)

    // Enter edit mode
    await wrapper.get('[data-popup-edit]').trigger('click')

    // Submit the form
    await wrapper.get('form').trigger('submit')

    expect(updateSpy).toHaveBeenCalledWith('record-1', {
      startDate: '2025-01-15',
      endDate: null,
      notes: '旅行备注',
      tags: ['美食'],
    })

    // Should exit edit mode after successful submit
    expect(wrapper.find('[data-region="timeline-edit-form"]').exists()).toBe(false)
    expect(wrapper.find('[data-popup-edit]').exists()).toBe(true)
  })

  it('date conflict warning displays when checkDateConflict returns conflicts', async () => {
    const entry = makeTimelineEntry({
      startDate: '2025-01-15',
      endDate: null,
    })

    const pinia = createPinia()
    setActivePinia(pinia)
    const mapPointsStore = useMapPointsStore()

    // Add a conflicting record for the same placeId with overlapping dates
    const conflictRecord = makeTravelRecord({
      id: 'record-conflict',
      startDate: '2025-01-10',
      endDate: '2025-01-20',
    })
    mapPointsStore.travelRecords = [conflictRecord]

    const wrapper = mount(PopupTripRecord, {
      props: { entry },
      global: { plugins: [pinia] },
    })

    // Enter edit mode
    await wrapper.get('[data-popup-edit]').trigger('click')

    // Date conflict warning should appear
    expect(wrapper.find('[data-edit-warning="date-conflict"]').exists()).toBe(true)
    expect(wrapper.get('[data-edit-warning="date-conflict"]').text()).toContain('2025-01-10')
  })
})
