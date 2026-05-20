import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { TravelRecord } from '@trip-map/contracts'
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

function makeTravelRecord(overrides: Partial<TravelRecord> = {}): TravelRecord {
  return {
    id: 'record-1',
    placeId: 'place-1',
    boundaryId: 'boundary-1',
    placeKind: 'CN_ADMIN',
    datasetVersion: 'test',
    displayName: '北京',
    regionSystem: 'CN',
    adminType: 'MUNICIPALITY',
    typeLabel: '市',
    parentLabel: '中国',
    subtitle: '北京市',
    startDate: '2025-01-15',
    endDate: null,
    createdAt: '2025-01-16T00:00:00.000Z',
    updatedAt: '2025-01-16T00:00:00.000Z',
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
    attachTo: document.body,
  })

  return { mapPointsStore, wrapper }
}

async function openManagementMenu(wrapper: VueWrapper) {
  await wrapper.get('[data-card-management]').trigger('click')
}

function getManagementActions() {
  return Array.from(
    document.body.querySelectorAll<HTMLElement>('[data-card-edit], [data-card-delete]'),
  )
}

describe('TimelineVisitCard', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders the readonly journal card hierarchy with summary fallback, limited tags, repeat badge, and postcard', () => {
    const entry = makeTimelineEntry({
      displayName: '京都',
      parentLabel: '日本',
      subtitle: '京都府',
      typeLabel: '府',
      startDate: '2025-04-12',
      visitOrdinal: 2,
      visitCount: 3,
      notes: null,
      tags: ['樱花', '寺院', '散步', '抹茶'],
    })
    const { wrapper } = mountCard(entry)

    expect(wrapper.text()).toContain('2025-04-12')
    expect(wrapper.text()).toContain('京都')
    expect(wrapper.text()).toContain('日本 · 京都府 · 府')
    expect(wrapper.text()).toContain('旅行摘记')
    expect(wrapper.text()).toContain('这段旅途还没有写下摘记')
    expect(wrapper.text()).toContain('第 2 次 / 共 3 次')
    expect(wrapper.findAll('[data-journal-tag]')).toHaveLength(3)
    expect(wrapper.get('[data-journal-tags-more]').text()).toBe('+1')
    expect(wrapper.find('[data-journal-postcard]').exists()).toBe(true)
  })

  it('renders the decorative postcard as hidden from assistive technology with a stable variant', () => {
    const entry = makeTimelineEntry()
    const { wrapper } = mountCard(entry)

    const postcard = wrapper.get('[data-journal-postcard]')
    expect(postcard.attributes('aria-hidden')).toBe('true')
    expect(postcard.attributes('data-variant')).toBeTruthy()
  })

  it('does not render excluded management-record, creation, collection, upload, or photo copy', () => {
    const entry = makeTimelineEntry({
      notes: '第一行手账',
      tags: ['城市'],
    })
    const { wrapper } = mountCard(entry)

    for (const forbiddenCopy of [
      '备注',
      '国家 / 地区',
      '添加新旅行',
      '收藏',
      '我的收藏',
      '上传',
      '照片',
      '旅行照片',
    ]) {
      expect(wrapper.text()).not.toContain(forbiddenCopy)
    }
  })

  it('does not use v-html in the card source', () => {
    const source = readFileSync('src/components/timeline/TimelineVisitCard.vue', 'utf8')

    expect(source).not.toContain('v-html')
  })

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

  it('shows a quiet management menu with only edit and delete actions', async () => {
    const entry = makeTimelineEntry()
    const { wrapper } = mountCard(entry)

    const trigger = wrapper.get('[data-card-management]')
    expect(trigger.attributes('aria-label')).toBe('管理这条旅行记录')

    await openManagementMenu(wrapper)

    const actions = getManagementActions()
    expect(actions).toHaveLength(2)
    expect(actions.map((action) => action.textContent?.trim())).toEqual(['编辑', '删除'])
  })

  it('enters edit mode when edit button is clicked', async () => {
    const entry = makeTimelineEntry()
    const { wrapper } = mountCard(entry)

    // Initially in readonly mode — no edit form
    expect(wrapper.find('[data-region="timeline-edit-form"]').exists()).toBe(false)

    await openManagementMenu(wrapper)
    getManagementActions()[0]?.click()
    await wrapper.vm.$nextTick()

    // Edit form should appear
    expect(wrapper.find('[data-region="timeline-edit-form"]').exists()).toBe(true)
  })

  it('exits edit mode when cancel is clicked', async () => {
    const entry = makeTimelineEntry()
    const { wrapper } = mountCard(entry)

    // Enter edit mode
    await openManagementMenu(wrapper)
    getManagementActions()[0]?.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-region="timeline-edit-form"]').exists()).toBe(true)

    // Click cancel in edit form
    await wrapper.get('[data-edit-cancel="true"]').trigger('click')

    // Should return to readonly mode
    expect(wrapper.find('[data-region="timeline-edit-form"]').exists()).toBe(false)
    // Readonly content should be visible again
    expect(wrapper.find('[data-card-management]').exists()).toBe(true)
  })

  it('updates date conflict warning when edited dates change', async () => {
    const entry = makeTimelineEntry({
      recordId: 'record-1',
      placeId: 'place-1',
      startDate: '2025-01-15',
      endDate: null,
    })
    const { mapPointsStore, wrapper } = mountCard(entry)
    mapPointsStore.replaceTravelRecords([
      makeTravelRecord({
        id: 'record-1',
        placeId: 'place-1',
        startDate: '2025-01-15',
        endDate: null,
      }),
      makeTravelRecord({
        id: 'record-2',
        placeId: 'place-1',
        startDate: '2025-02-01',
        endDate: '2025-02-03',
      }),
    ])

    await openManagementMenu(wrapper)
    getManagementActions()[0]?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-edit-warning="date-conflict"]').exists()).toBe(false)

    await wrapper.get('[data-edit-input="start-date"]').setValue('2025-02-02')

    expect(wrapper.get('[data-edit-warning="date-conflict"]').text()).toContain(
      '2025-02-01 ~ 2025-02-03',
    )
  })

  it('submits edit and calls store.updateRecord', async () => {
    const entry = makeTimelineEntry({
      notes: '旅行备注',
      tags: ['美食'],
    })
    const { mapPointsStore, wrapper } = mountCard(entry)

    const updateRecordSpy = vi.spyOn(mapPointsStore, 'updateRecord').mockResolvedValue(true)

    await openManagementMenu(wrapper)
    getManagementActions()[0]?.click()
    await wrapper.vm.$nextTick()

    // Submit the form
    await wrapper.get('form').trigger('submit')

    expect(updateRecordSpy).toHaveBeenCalledWith('record-1', {
      startDate: '2025-01-15',
      endDate: null,
      notes: '旅行备注',
      tags: ['美食'],
    })
  })

  it('keeps edit form open with draft values when update fails', async () => {
    const entry = makeTimelineEntry({
      notes: '旅行备注',
      tags: ['美食'],
    })
    const { mapPointsStore, wrapper } = mountCard(entry)

    vi.spyOn(mapPointsStore, 'updateRecord').mockResolvedValue(false)

    await openManagementMenu(wrapper)
    getManagementActions()[0]?.click()
    await wrapper.vm.$nextTick()
    await wrapper.get('[data-edit-input="notes"]').setValue('尚未保存的草稿')

    await wrapper.get('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-region="timeline-edit-form"]').exists()).toBe(true)
    expect((wrapper.get('[data-edit-input="notes"]').element as HTMLTextAreaElement).value).toBe(
      '尚未保存的草稿',
    )
  })

  it('shows ConfirmDialog when delete button is clicked', async () => {
    const entry = makeTimelineEntry()
    const { wrapper } = mountCard(entry)

    // No dialog initially
    expect(wrapper.find('[data-confirm-dialog-backdrop]').exists()).toBe(false)

    await openManagementMenu(wrapper)
    getManagementActions()[1]?.click()
    await wrapper.vm.$nextTick()

    // Dialog should appear
    expect(wrapper.find('[data-confirm-dialog-backdrop]').exists()).toBe(true)
  })

  it('calls store.deleteSingleRecord when delete is confirmed', async () => {
    const entry = makeTimelineEntry()
    const { mapPointsStore, wrapper } = mountCard(entry)

    const deleteSpy = vi.spyOn(mapPointsStore, 'deleteSingleRecord').mockResolvedValue(true)

    await openManagementMenu(wrapper)
    getManagementActions()[1]?.click()
    await wrapper.vm.$nextTick()

    // Confirm deletion
    await wrapper.get('[data-confirm-dialog-confirm]').trigger('click')

    expect(deleteSpy).toHaveBeenCalledWith('record-1')
  })

  it('keeps ConfirmDialog open when delete fails', async () => {
    const entry = makeTimelineEntry()
    const { mapPointsStore, wrapper } = mountCard(entry)

    vi.spyOn(mapPointsStore, 'deleteSingleRecord').mockResolvedValue(false)

    await openManagementMenu(wrapper)
    getManagementActions()[1]?.click()
    await wrapper.vm.$nextTick()

    await wrapper.get('[data-confirm-dialog-confirm]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-confirm-dialog-backdrop]').exists()).toBe(true)
  })

  it('closes ConfirmDialog when cancel is clicked', async () => {
    const entry = makeTimelineEntry()
    const { wrapper } = mountCard(entry)

    await openManagementMenu(wrapper)
    getManagementActions()[1]?.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-confirm-dialog-backdrop]').exists()).toBe(true)

    // Cancel deletion
    await wrapper.get('[data-confirm-dialog-cancel]').trigger('click')

    // Dialog should close
    expect(wrapper.find('[data-confirm-dialog-backdrop]').exists()).toBe(false)
  })

  it('shows last-record warning with destructive tone when visitCount is 1', async () => {
    const entry = makeTimelineEntry({ visitCount: 1 })
    const { wrapper } = mountCard(entry)

    await openManagementMenu(wrapper)
    getManagementActions()[1]?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-confirm-dialog-title]').text()).toBe('删除该地点最后一条记录')
    expect(wrapper.get('[data-confirm-dialog-confirm]').classes()).toContain('text-[var(--color-destructive)]')
  })

  it('shows normal delete message when visitCount > 1', async () => {
    const entry = makeTimelineEntry({ visitCount: 3, visitOrdinal: 2 })
    const { wrapper } = mountCard(entry)

    await openManagementMenu(wrapper)
    getManagementActions()[1]?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-confirm-dialog-title]').text()).toBe('删除旅行记录')
  })

  it('renders the first meaningful note line as the journal summary', () => {
    const entry = makeTimelineEntry({
      notes: '\n  和家人一起去的\n第二行',
    })
    const { wrapper } = mountCard(entry)

    expect(wrapper.text()).toContain('和家人一起去的')
    expect(wrapper.text()).toContain('旅行摘记')
    expect(wrapper.text()).not.toContain('第二行')
  })

  it('renders visible journal tag stickers when entry has tags', () => {
    const entry = makeTimelineEntry({
      tags: ['美食', '文化', '历史'],
    })
    const { wrapper } = mountCard(entry)

    expect(wrapper.findAll('[data-journal-tag]')).toHaveLength(3)
    expect(wrapper.text()).toContain('美食')
    expect(wrapper.text()).toContain('文化')
    expect(wrapper.text()).toContain('历史')
  })
})
