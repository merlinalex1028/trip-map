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
    ...overrides,
  }
}

function mountTimelinePage(
  setup?: (context: {
    authSessionStore: ReturnType<typeof useAuthSessionStore>
    mapPointsStore: ReturnType<typeof useMapPointsStore>
  }) => void,
) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authSessionStore = useAuthSessionStore()
  const mapPointsStore = useMapPointsStore()

  authSessionStore.status = 'anonymous'
  authSessionStore.currentUser = null
  setup?.({
    authSessionStore,
    mapPointsStore,
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

    expect(wrapper.get('[data-state="anonymous"]').text()).toContain('立即登录')
    expect(openAuthModalSpy).toHaveBeenCalledWith('login')
    expectNoMapStage(wrapper)
  })

  it('renders empty state for authenticated users without records', () => {
    const { wrapper } = mountTimelinePage(({ authSessionStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
    })

    expect(wrapper.get('[data-state="empty"]').text()).toContain('你的时间轴还是空白的')
    expect(wrapper.text()).toContain('去地图添加旅行')
    expectNoMapStage(wrapper)
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

    expect(wrapper.get('[data-state="populated"]').text()).toContain('共 2 条旅行记录')
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
