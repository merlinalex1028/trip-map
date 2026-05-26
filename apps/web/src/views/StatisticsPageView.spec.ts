import type { ResolvedCanonicalPlace, TravelRecord, TravelStatsResponse } from '@trip-map/contracts'
import {
  PHASE12_RESOLVED_BEIJING,
  PHASE28_RESOLVED_CALIFORNIA,
} from '@trip-map/contracts'
import { RouterLinkStub, flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

import StatisticsPageView from './StatisticsPageView.vue'
import { useAuthSessionStore } from '../stores/auth-session'
import { useMapPointsStore } from '../stores/map-points'

const { fetchStatsMock } = vi.hoisted(() => ({
  fetchStatsMock: vi.fn(),
}))

vi.mock('../services/api/stats', () => ({
  fetchStats: fetchStatsMock,
}))

vi.mock('vue-echarts', () => ({
  default: {
    name: 'VChart',
    props: ['option', 'theme', 'autoresize'],
    template: '<div data-mocked-vchart></div>',
  },
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

function makeStatsResponse(overrides: Partial<TravelStatsResponse> = {}): TravelStatsResponse {
  return {
    totalTrips: 2,
    uniquePlaces: 2,
    visitedAdministrativeAreas: 2,
    visitedCountries: 2,
    totalSupportedCountries: 21,
    memories: {
      monthlyTrend: [
        { period: '2026-01', tripCount: 2 },
      ],
      yearlyTrend: [
        { period: '2026', tripCount: 2 },
      ],
      countryDistribution: [
        { countryLabel: '中国', tripCount: 1 },
        { countryLabel: '美国', tripCount: 1 },
      ],
      profile: [
        {
          key: 'place-exploration',
          label: '地点探索',
          value: 100,
          max: 100,
          explanation: '不同地点比例',
        },
      ],
      popularFootprints: [
        {
          placeId: 'cn-admin-beijing',
          displayName: '北京市',
          parentLabel: '中国',
          visitCount: 3,
          latestVisitDate: '2026-02-01',
        },
      ],
      postcards: [
        {
          recordId: 'record-beijing',
          placeId: 'cn-admin-beijing',
          displayName: '北京市',
          parentLabel: '中国',
          startDate: '2026-02-01',
        },
      ],
    },
    ...overrides,
  }
}

function mountStatisticsPage(
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

  const wrapper = mount(StatisticsPageView, {
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

describe('StatisticsPageView', () => {
  beforeEach(() => {
    fetchStatsMock.mockReset()
  })

  it('renders anonymous state for visitors without a session', () => {
    const { wrapper } = mountStatisticsPage()

    expect(wrapper.get('[data-route-view="memories"]').attributes('data-region')).toBe('memories-shell')
    expect(wrapper.text()).toContain('旅途回忆')
    expect(wrapper.get('[data-state="anonymous"]').text()).toContain('登录后查看你的旅途回忆')
    expect(wrapper.text()).toContain('立即登录')
  })

  it('renders the updated empty and error copy contracts', async () => {
    fetchStatsMock.mockResolvedValue(makeStatsResponse({
      totalTrips: 0,
      uniquePlaces: 0,
      visitedAdministrativeAreas: 0,
      visitedCountries: 0,
      totalSupportedCountries: 21,
    }))

    const { wrapper } = mountStatisticsPage(({ authSessionStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
    })

    await flushPromises()
    await nextTick()

    expect(wrapper.get('[data-state="empty"]').text()).toContain('还没有留下足迹')
    expect(wrapper.get('[data-state="empty"]').text()).toContain('去世界足迹留下足迹')
    expect(wrapper.find('[data-region="memories-overview"]').exists()).toBe(false)
    expect(wrapper.find('[data-region="memories-chart-grid"]').exists()).toBe(false)
    expect(wrapper.find('[data-region="popular-footprints"]').exists()).toBe(false)
    expect(wrapper.find('[data-region="memory-postcard-strip"]').exists()).toBe(false)

    fetchStatsMock.mockReset()
    fetchStatsMock.mockRejectedValueOnce(new Error('network'))

    const mountedErrorPage = mountStatisticsPage(({ authSessionStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
    })

    await flushPromises()
    await nextTick()

    expect(mountedErrorPage.wrapper.get('[data-state="error"]').text()).toContain(
      '旅途回忆暂时加载失败，请稍后重试。',
    )
    expect(mountedErrorPage.wrapper.get('[data-state="error"]').text()).toContain('重新加载回忆')
  })

  it('renders dashboard-shaped skeletons while restoring or loading', () => {
    const { wrapper } = mountStatisticsPage(({ authSessionStore }) => {
      authSessionStore.status = 'restoring'
    })

    expect(wrapper.get('[data-state="restoring"]').exists()).toBe(true)
    expect(wrapper.get('[data-region="memories-skeleton-overview"]').exists()).toBe(true)
    expect(wrapper.get('[data-region="memories-skeleton-charts"]').exists()).toBe(true)
    expect(wrapper.get('[data-region="memories-skeleton-ranking"]').exists()).toBe(true)
    expect(wrapper.get('[data-region="memories-skeleton-postcards"]').exists()).toBe(true)
  })

  it('renders overview and chart grid from an expanded stats payload', async () => {
    fetchStatsMock.mockResolvedValueOnce(makeStatsResponse({
      totalTrips: 5,
      uniquePlaces: 3,
      visitedAdministrativeAreas: 3,
      visitedCountries: 2,
    }))

    const { wrapper } = mountStatisticsPage(({ authSessionStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
    })

    await flushPromises()
    await nextTick()

    expect(wrapper.get('[data-state="populated"]').text()).toContain('旅途回忆')
    expect(wrapper.get('[data-region="memories-overview"]').text()).toContain('去过城市或行政区')
    expect(wrapper.get('[data-region="memories-chart-grid"]').text()).toContain('旅途回忆画像')
    expect(wrapper.get('[data-region="popular-footprints"]').text()).toContain('热门足迹排行')
    expect(wrapper.get('[data-region="memory-postcard-strip"]').text()).toContain('珍藏回忆瞬间')
    expect(wrapper.text()).not.toContain('Travel Statistics')
    expect(wrapper.text()).not.toContain('/statistics')
  })

  it('re-fetches statistics after travel records change during an in-flight request', async () => {
    let resolveFirst!: (value: TravelStatsResponse) => void
    let resolveSecond!: (value: TravelStatsResponse) => void

    fetchStatsMock
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve
          }),
      )

    const beijingRecord = makeRecord(PHASE12_RESOLVED_BEIJING, {
      id: 'beijing-1',
      createdAt: '2025-01-01T00:00:00.000Z',
    })
    const californiaRecord = makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
      id: 'california-1',
      createdAt: '2025-02-01T00:00:00.000Z',
    })

    const { mapPointsStore, wrapper } = mountStatisticsPage(({ authSessionStore, mapPointsStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
      mapPointsStore.replaceTravelRecords([beijingRecord])
    })

    await flushPromises()
    expect(fetchStatsMock).toHaveBeenCalledTimes(1)

    mapPointsStore.replaceTravelRecords([beijingRecord, californiaRecord])
    await nextTick()
    expect(fetchStatsMock).toHaveBeenCalledTimes(1)

    resolveFirst(makeStatsResponse({
      totalTrips: 1,
      uniquePlaces: 1,
      visitedAdministrativeAreas: 1,
      visitedCountries: 1,
      totalSupportedCountries: 21,
    }))
    await flushPromises()
    await nextTick()

    expect(fetchStatsMock).toHaveBeenCalledTimes(2)

    resolveSecond(makeStatsResponse({
      totalTrips: 2,
      uniquePlaces: 2,
      visitedAdministrativeAreas: 2,
      visitedCountries: 2,
      totalSupportedCountries: 21,
    }))
    await flushPromises()
    await nextTick()

    expect(wrapper.get('[data-state="populated"]').text()).toContain(
      '2 次旅行 · 2 个地点 · 2 个国家/地区',
    )
  })

  it('re-fetches statistics after metadata-only authoritative refresh changes country metadata', async () => {
    fetchStatsMock
      .mockResolvedValueOnce(makeStatsResponse({
        totalTrips: 1,
        uniquePlaces: 1,
        visitedAdministrativeAreas: 1,
        visitedCountries: 1,
        totalSupportedCountries: 21,
      }))
      .mockResolvedValueOnce(makeStatsResponse({
        totalTrips: 1,
        uniquePlaces: 1,
        visitedAdministrativeAreas: 1,
        visitedCountries: 2,
        totalSupportedCountries: 21,
      }))

    const baseRecord = makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
      id: 'california-1',
      createdAt: '2025-02-01T00:00:00.000Z',
    })
    const refreshedRecord = {
      ...baseRecord,
      parentLabel: 'Canada',
      displayName: 'Ontario',
      typeLabel: 'Province',
      subtitle: 'Canada · Province',
    }

    const { mapPointsStore, wrapper } = mountStatisticsPage(({ authSessionStore, mapPointsStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
      mapPointsStore.replaceTravelRecords([baseRecord])
    })

    await flushPromises()
    expect(fetchStatsMock).toHaveBeenCalledTimes(1)

    mapPointsStore.replaceTravelRecords([refreshedRecord])
    await nextTick()
    expect(fetchStatsMock).toHaveBeenCalledTimes(2)

    await flushPromises()
    await nextTick()

    expect(wrapper.get('[data-state="populated"]').text()).toContain(
      '1 次旅行 · 1 个地点 · 2 个国家/地区',
    )
  })

  it('refreshes memories when Phase 45 canonical grouping fields change', async () => {
    fetchStatsMock
      .mockResolvedValueOnce(makeStatsResponse({
        totalTrips: 1,
        uniquePlaces: 1,
        visitedAdministrativeAreas: 1,
        visitedCountries: 1,
        totalSupportedCountries: 21,
      }))
      .mockResolvedValueOnce(makeStatsResponse({
        totalTrips: 1,
        uniquePlaces: 1,
        visitedAdministrativeAreas: 1,
        visitedCountries: 2,
        totalSupportedCountries: 21,
      }))

    const baseRecord = makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
      id: 'phase45-memories-record',
      createdAt: '2025-10-01T00:00:00.000Z',
    })
    const refreshedRecord = {
      ...baseRecord,
      parentLabel: 'Canada',
      displayName: 'British Columbia',
      typeLabel: 'Province',
      subtitle: 'Canada · Province',
    }

    const { mapPointsStore, wrapper } = mountStatisticsPage(({ authSessionStore, mapPointsStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
      mapPointsStore.replaceTravelRecords([baseRecord])
    })

    await flushPromises()
    await nextTick()
    expect(fetchStatsMock).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[data-state="populated"]').text()).toContain('旅途回忆概览')

    mapPointsStore.replaceTravelRecords([refreshedRecord])
    await nextTick()
    expect(fetchStatsMock).toHaveBeenCalledTimes(2)

    await flushPromises()
    await nextTick()

    const populatedText = wrapper.get('[data-state="populated"]').text()
    expect(populatedText).toContain('1 次旅行 · 1 个地点 · 2 个国家/地区')
    expect(populatedText).toContain('当前支持覆盖 21 个国家/地区。')
    expect(populatedText).not.toContain('这里暂时只能用于查看位置，还不能留下足迹。')
  })

  it('queues one follow-up refresh for in-flight metadata-only authoritative updates', async () => {
    let resolveFirst!: (value: TravelStatsResponse) => void
    let resolveSecond!: (value: TravelStatsResponse) => void

    fetchStatsMock
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve
          }),
      )

    const baseRecord = makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
      id: 'california-1',
      createdAt: '2025-02-01T00:00:00.000Z',
    })
    const refreshedRecord = {
      ...baseRecord,
      parentLabel: 'Canada',
      displayName: 'Ontario',
      typeLabel: 'Province',
      subtitle: 'Canada · Province',
    }

    const { mapPointsStore, wrapper } = mountStatisticsPage(({ authSessionStore, mapPointsStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
      mapPointsStore.replaceTravelRecords([baseRecord])
    })

    await flushPromises()
    expect(fetchStatsMock).toHaveBeenCalledTimes(1)

    mapPointsStore.replaceTravelRecords([refreshedRecord])
    await nextTick()
    expect(fetchStatsMock).toHaveBeenCalledTimes(1)

    resolveFirst(makeStatsResponse({
      totalTrips: 1,
      uniquePlaces: 1,
      visitedAdministrativeAreas: 1,
      visitedCountries: 1,
      totalSupportedCountries: 21,
    }))
    await flushPromises()
    await nextTick()

    expect(fetchStatsMock).toHaveBeenCalledTimes(2)

    resolveSecond(makeStatsResponse({
      totalTrips: 1,
      uniquePlaces: 1,
      visitedAdministrativeAreas: 1,
      visitedCountries: 2,
      totalSupportedCountries: 21,
    }))
    await flushPromises()
    await nextTick()

    expect(wrapper.get('[data-state="populated"]').text()).toContain(
      '1 次旅行 · 1 个地点 · 2 个国家/地区',
    )
  })

  it('shows visitedCountries in populated state without inflating for multi-visit same place', async () => {
    let resolveStats!: (value: TravelStatsResponse) => void

    fetchStatsMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveStats = resolve
        }),
    )

    const beijingVisits = [
      makeRecord(PHASE12_RESOLVED_BEIJING, {
        id: 'beijing-1',
        createdAt: '2025-01-01T00:00:00.000Z',
      }),
      makeRecord(PHASE12_RESOLVED_BEIJING, {
        id: 'beijing-2',
        createdAt: '2025-02-01T00:00:00.000Z',
      }),
      makeRecord(PHASE12_RESOLVED_BEIJING, {
        id: 'beijing-3',
        createdAt: '2025-03-01T00:00:00.000Z',
      }),
    ]

    const { wrapper } = mountStatisticsPage(({ authSessionStore, mapPointsStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
      mapPointsStore.replaceTravelRecords(beijingVisits)
    })

    resolveStats(makeStatsResponse({
      totalTrips: 3,
      uniquePlaces: 1,
      visitedAdministrativeAreas: 1,
      visitedCountries: 1,
      totalSupportedCountries: 21,
    }))
    await flushPromises()
    await nextTick()

    const populated = wrapper.get('[data-state="populated"]')
    expect(populated.text()).toContain('3 次旅行 · 1 个地点 · 1 个国家/地区')
    expect(populated.text()).toContain('去过国家/地区')
  })

  it('shows visitedCountries correctly for multi-country statistics', async () => {
    let resolveStats!: (value: TravelStatsResponse) => void

    fetchStatsMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveStats = resolve
        }),
    )

    const { wrapper } = mountStatisticsPage(({ authSessionStore, mapPointsStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
      mapPointsStore.replaceTravelRecords([
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'beijing-1',
          createdAt: '2025-01-01T00:00:00.000Z',
        }),
        makeRecord(PHASE12_RESOLVED_BEIJING, {
          id: 'beijing-2',
          createdAt: '2025-02-01T00:00:00.000Z',
        }),
        makeRecord(PHASE28_RESOLVED_CALIFORNIA, {
          id: 'california-1',
          createdAt: '2025-03-01T00:00:00.000Z',
        }),
      ])
    })

    resolveStats(makeStatsResponse({
      totalTrips: 3,
      uniquePlaces: 2,
      visitedAdministrativeAreas: 2,
      visitedCountries: 2,
      totalSupportedCountries: 21,
    }))
    await flushPromises()
    await nextTick()

    const populated = wrapper.get('[data-state="populated"]')
    expect(populated.text()).toContain('3 次旅行 · 2 个地点 · 2 个国家/地区')
    expect(populated.text()).toContain('当前支持覆盖 21 个国家/地区。')
  })

  it('re-fetches statistics after editing notes', async () => {
    fetchStatsMock
      .mockResolvedValueOnce(makeStatsResponse({
        totalTrips: 1,
        uniquePlaces: 1,
        visitedAdministrativeAreas: 1,
        visitedCountries: 1,
        totalSupportedCountries: 21,
      }))
      .mockResolvedValueOnce(makeStatsResponse({
        totalTrips: 1,
        uniquePlaces: 1,
        visitedAdministrativeAreas: 1,
        visitedCountries: 1,
        totalSupportedCountries: 21,
      }))

    const recordWithNotes = makeRecord(PHASE12_RESOLVED_BEIJING, {
      id: 'beijing-1',
      createdAt: '2025-01-01T00:00:00.000Z',
      notes: 'great trip',
    })

    const { mapPointsStore } = mountStatisticsPage(({ authSessionStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
    })

    await flushPromises()
    expect(fetchStatsMock).toHaveBeenCalledTimes(1)

    mapPointsStore.replaceTravelRecords([recordWithNotes])
    await nextTick()
    await flushPromises()

    expect(fetchStatsMock).toHaveBeenCalledTimes(2)
  })

  it('re-fetches statistics after editing tags', async () => {
    fetchStatsMock
      .mockResolvedValueOnce(makeStatsResponse({
        totalTrips: 1,
        uniquePlaces: 1,
        visitedAdministrativeAreas: 1,
        visitedCountries: 1,
        totalSupportedCountries: 21,
      }))
      .mockResolvedValueOnce(makeStatsResponse({
        totalTrips: 1,
        uniquePlaces: 1,
        visitedAdministrativeAreas: 1,
        visitedCountries: 1,
        totalSupportedCountries: 21,
      }))

    const recordWithTags = makeRecord(PHASE12_RESOLVED_BEIJING, {
      id: 'beijing-1',
      createdAt: '2025-01-01T00:00:00.000Z',
      tags: ['summer', 'family'],
    })

    const { mapPointsStore } = mountStatisticsPage(({ authSessionStore }) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
    })

    await flushPromises()
    expect(fetchStatsMock).toHaveBeenCalledTimes(1)

    mapPointsStore.replaceTravelRecords([recordWithTags])
    await nextTick()
    await flushPromises()

    expect(fetchStatsMock).toHaveBeenCalledTimes(2)
  })
})
