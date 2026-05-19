import type { ResolvedCanonicalPlace, TravelRecord } from '@trip-map/contracts'
import {
  PHASE12_RESOLVED_BEIJING,
  PHASE28_RESOLVED_CALIFORNIA,
} from '@trip-map/contracts'
import { RouterLinkStub, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick } from 'vue'

import TimelinePageView from './TimelinePageView.vue'
import { useAuthSessionStore } from '../stores/auth-session'
import { useMapPointsStore } from '../stores/map-points'
import { useMapUiStore } from '../stores/map-ui'

vi.mock('../components/LeafletMapStage.vue', () => ({
  default: defineComponent({
    name: 'LeafletMapStageStub',
    template: '<div data-region="map-stage">Map Stage</div>',
  }),
}))

function makeUser() {
  return {
    id: 'user-1',
    username: 'Alice',
    email: 'alice@example.com',
    createdAt: '2026-04-12T00:00:00.000Z',
  }
}

function makeRecord(
  place: ResolvedCanonicalPlace,
  overrides: Partial<TravelRecord> = {},
): TravelRecord {
  return {
    id: `record-${place.placeId}`,
    placeId: place.placeId,
    boundaryId: place.boundaryId,
    placeKind: place.placeKind,
    datasetVersion: place.datasetVersion,
    displayName: place.displayName,
    regionSystem: place.regionSystem,
    adminType: place.adminType,
    typeLabel: place.typeLabel,
    parentLabel: place.parentLabel,
    subtitle: place.subtitle,
    startDate: null,
    endDate: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    notes: null,
    tags: [],
    ...overrides,
  }
}

function mountTimelinePage(
  setup?: (context: {
    authSessionStore: ReturnType<typeof useAuthSessionStore>
    mapPointsStore: ReturnType<typeof useMapPointsStore>
    mapUiStore: ReturnType<typeof useMapUiStore>
  }) => void,
) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authSessionStore = useAuthSessionStore()
  const mapPointsStore = useMapPointsStore()
  const mapUiStore = useMapUiStore()

  authSessionStore.status = 'anonymous'
  authSessionStore.currentUser = null
  setup?.({
    authSessionStore,
    mapPointsStore,
    mapUiStore,
  })

  const wrapper = mount(TimelinePageView, {
    global: {
      plugins: [pinia],
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  })

  return {
    authSessionStore,
    mapPointsStore,
    mapUiStore,
    wrapper,
  }
}

function expectNoMapStage(wrapper: ReturnType<typeof mount>) {
  expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(false)
  expect(wrapper.text()).not.toContain('Map Stage')
}

describe('TimelinePageView', () => {
  it('renders login CTA for anonymous visitors', async () => {
    const { authSessionStore, wrapper } = mountTimelinePage()
    const openAuthModalSpy = vi.spyOn(authSessionStore, 'openAuthModal')

    await wrapper.get('button').trigger('click')
    await nextTick()

    expect(wrapper.get('[data-route-view="journal"]').attributes('data-region')).toBe('journal-shell')
    expect(wrapper.text()).toContain('旅途手账')
    expect(wrapper.get('[data-state="anonymous"]').text()).toContain('立即登录')
    expect(openAuthModalSpy).toHaveBeenCalledWith('login')
    expectNoMapStage(wrapper)
  })

  it('renders empty state for authenticated users without records', () => {
    const { wrapper } = mountTimelinePage(({ authSessionStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
    })

    expect(wrapper.get('[data-route-view="journal"]').attributes('data-region')).toBe('journal-shell')
    expect(wrapper.get('[data-state="empty"]').text()).toContain('还没有留下足迹')
    expect(wrapper.text()).toContain('去世界足迹留下足迹')
    expectNoMapStage(wrapper)
  })

  it('links empty journal state only back to world footprints', () => {
    const { wrapper } = mountTimelinePage(({ authSessionStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
    })

    const links = wrapper.findAllComponents(RouterLinkStub)
    const mapLinks = links.filter((link) => {
      const props = link.props() as { to?: string }
      return props.to === '/map'
    })
    expect(mapLinks[0]).toBeDefined()
    const props = mapLinks[0].props() as { to?: string }

    expect(links).toHaveLength(1)
    expect(mapLinks).toHaveLength(1)
    expect(props.to).toBe('/map')
    expect(mapLinks[0].text()).toBe('去世界足迹留下足迹')
  })

  it('does not expose add, collection, favorite, upload, or photo affordances when populated', () => {
    const { wrapper } = mountTimelinePage(({ authSessionStore, mapPointsStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
      mapPointsStore.replaceTravelRecords([
        makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
          id: 'california-journal-contract',
          startDate: '2025-04-20',
          endDate: null,
          createdAt: '2025-04-20T00:00:00.000Z',
          notes: '沿着海岸线散步',
          tags: ['海边'],
        }),
      ])
    })
    const text = wrapper.text()

    expect(text).not.toContain('添加新旅行')
    expect(text).not.toContain('我的收藏')
    expect(text).not.toContain('收藏')
    expect(text).not.toContain('上传')
    expect(text).not.toContain('照片')
    expect(text).not.toContain('旅行照片')
    expect(wrapper.find('[data-card-favorite]').exists()).toBe(false)
    expect(wrapper.find('[data-journal-add-trip]').exists()).toBe(false)
    expect(wrapper.find('[data-journal-create]').exists()).toBe(false)
    expect(wrapper.find('[data-journal-favorite]').exists()).toBe(false)
    expectNoMapStage(wrapper)
  })

  it('renders the glowing journal stream structure for populated entries', () => {
    const { wrapper } = mountTimelinePage(({ authSessionStore, mapPointsStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
      mapPointsStore.replaceTravelRecords([
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'beijing-stream-1',
          startDate: '2025-01-15',
          createdAt: '2025-01-16T00:00:00.000Z',
        }),
        makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
          id: 'california-stream-1',
          startDate: '2025-04-20',
          createdAt: '2025-04-20T00:00:00.000Z',
          notes: '沿着海岸线散步',
          tags: ['海边'],
        }),
      ])
    })

    expect(wrapper.get('[data-state="populated"]').find('[data-journal-stream]').exists()).toBe(true)
    expect(wrapper.findAll('[data-journal-line]')).toHaveLength(1)
    expect(wrapper.findAll('[data-journal-node]')).toHaveLength(2)
    expect(wrapper.findAll('[data-journal-node]')).toHaveLength(
      wrapper.findAll('[data-region="timeline-entry"]').length,
    )
  })

  it('renders restoring state as journal-aligned skeletons with polite live region', () => {
    const { wrapper } = mountTimelinePage(({ authSessionStore }) => {
      authSessionStore.status = 'restoring'
    })

    const restoringState = wrapper.get('[data-state="restoring"]')

    expect(restoringState.attributes('aria-live')).toBe('polite')
    expect(restoringState.find('[data-journal-stream]').exists()).toBe(true)
    expect(restoringState.findAll('[data-journal-node]')).toHaveLength(3)
  })

  it('renders the contracted warning panel with recovery link when sync notice exists', () => {
    const { wrapper } = mountTimelinePage(({ authSessionStore, mapPointsStore, mapUiStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
      mapPointsStore.replaceTravelRecords([
        makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
          id: 'california-warning-panel',
          startDate: '2025-04-20',
          createdAt: '2025-04-20T00:00:00.000Z',
        }),
      ])
      mapUiStore.setInteractionNotice({
        tone: 'warning',
        message: '云端记录刷新失败，当前仍显示上次同步结果，请稍后重试。',
      })
    })

    const warningPanel = wrapper.get('[data-state="error"]')
    const mapLinks = wrapper
      .findAllComponents(RouterLinkStub)
      .filter((link) => (link.props() as { to?: string }).to === '/map')

    expect(warningPanel.text()).toContain(
      '旅途手账暂时加载失败，请稍后重试，或返回世界足迹确认旅行记录是否已同步。',
    )
    expect(warningPanel.attributes('role')).toBe('status')
    expect(mapLinks.some((link) => link.text() === '返回世界足迹')).toBe(true)
  })

  it('keeps the populated header free of return, add, favorite, and postcard pills', () => {
    const { wrapper } = mountTimelinePage(({ authSessionStore, mapPointsStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
      mapPointsStore.replaceTravelRecords([
        makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
          id: 'california-header-contract',
          startDate: '2025-04-20',
          createdAt: '2025-04-20T00:00:00.000Z',
        }),
      ])
    })

    const text = wrapper.get('[data-route-view="journal"]').text()

    expect(text).toContain('旅途手账')
    expect(text).not.toContain('返回世界足迹')
    expect(text).not.toContain('添加新旅行')
    expect(text).not.toContain('收藏')
    expect(text).not.toContain('我的收藏')
    expect(text).not.toContain('一次旅行一张卡片')
  })

  it('renders multiple visits for the same place as separate cards', () => {
    const beijingFirstVisit = makeRecord(PHASE12_RESOLVED_BEIJING, {
      id: 'beijing-visit-1',
      startDate: '2025-01-15',
      endDate: null,
      createdAt: '2025-01-16T00:00:00.000Z',
    })
    const beijingSecondVisit = makeRecord(PHASE12_RESOLVED_BEIJING, {
      id: 'beijing-visit-2',
      startDate: '2025-03-20',
      endDate: null,
      createdAt: '2025-03-21T00:00:00.000Z',
    })

    const { wrapper } = mountTimelinePage(({ authSessionStore, mapPointsStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
      mapPointsStore.replaceTravelRecords([beijingSecondVisit, beijingFirstVisit])
    })

    const cards = wrapper.findAll('[data-region="timeline-entry"]')
    const beijingCards = cards.filter((card) =>
      card.text().includes(PHASE12_RESOLVED_BEIJING.displayName),
    )

    expect(wrapper.get('[data-state="populated"]').find('[data-journal-stream]').exists()).toBe(true)
    expect(cards).toHaveLength(2)
    expect(beijingCards).toHaveLength(2)
    expect(cards[0].text()).toContain('第 1 次 / 共 2 次')
    expect(cards[1].text()).toContain('第 2 次 / 共 2 次')
    expectNoMapStage(wrapper)
  })

  it('renders unknown-date label for records without trip dates', () => {
    const { wrapper } = mountTimelinePage(({ authSessionStore, mapPointsStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
      mapPointsStore.replaceTravelRecords([
        makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
          id: 'california-unknown-date',
          startDate: null,
          endDate: null,
          createdAt: '2025-04-20T00:00:00.000Z',
        }),
      ])
    })

    expect(wrapper.text()).toContain('日期未知')
    expect(wrapper.findAll('[data-region="timeline-entry"]')).toHaveLength(1)
    expectNoMapStage(wrapper)
  })
})
