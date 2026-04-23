import type { ResolvedCanonicalPlace, TravelRecord } from '@trip-map/contracts'
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

    expect(wrapper.get('[data-state="anonymous"]').text()).toContain('登录后查看你的旅行统计')
    expect(wrapper.text()).toContain('立即登录')
  })

  it('re-fetches statistics after travel records change during an in-flight request', async () => {
    let resolveFirst!: (value: {
      totalTrips: number
      uniquePlaces: number
      visitedCountries: number
      totalSupportedCountries: number
    }) => void
    let resolveSecond!: (value: {
      totalTrips: number
      uniquePlaces: number
      visitedCountries: number
      totalSupportedCountries: number
    }) => void

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

    resolveFirst({ totalTrips: 1, uniquePlaces: 1, visitedCountries: 1, totalSupportedCountries: 21 })
    await flushPromises()
    await nextTick()

    expect(fetchStatsMock).toHaveBeenCalledTimes(2)

    resolveSecond({ totalTrips: 2, uniquePlaces: 2, visitedCountries: 2, totalSupportedCountries: 21 })
    await flushPromises()
    await nextTick()

    expect(wrapper.get('[data-state="populated"]').text()).toContain(
      '2 次旅行 · 2 个地点 · 2 个国家/地区',
    )
  })

  it('shows visitedCountries in populated state without inflating for multi-visit same place', async () => {
    let resolveStats!: (value: {
      totalTrips: number
      uniquePlaces: number
      visitedCountries: number
      totalSupportedCountries: number
    }) => void

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

    resolveStats({
      totalTrips: 3,
      uniquePlaces: 1,
      visitedCountries: 1,
      totalSupportedCountries: 21,
    })
    await flushPromises()
    await nextTick()

    const populated = wrapper.get('[data-state="populated"]')
    expect(populated.text()).toContain('3 次旅行 · 1 个地点 · 1 个国家/地区')
    expect(populated.text()).toContain('已去过国家/地区数')
  })

  it('shows visitedCountries correctly for multi-country statistics', async () => {
    let resolveStats!: (value: {
      totalTrips: number
      uniquePlaces: number
      visitedCountries: number
      totalSupportedCountries: number
    }) => void

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

    resolveStats({
      totalTrips: 3,
      uniquePlaces: 2,
      visitedCountries: 2,
      totalSupportedCountries: 21,
    })
    await flushPromises()
    await nextTick()

    const populated = wrapper.get('[data-state="populated"]')
    expect(populated.text()).toContain('3 次旅行 · 2 个地点 · 2 个国家/地区')
    expect(populated.text()).toContain('当前支持覆盖 21 个国家/地区。')
  })
})
