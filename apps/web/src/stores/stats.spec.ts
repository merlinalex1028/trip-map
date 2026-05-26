import type { TravelStatsResponse } from '@trip-map/contracts'
import { createPinia, setActivePinia } from 'pinia'

import { ApiClientError } from '../services/api/client'
import { useAuthSessionStore } from './auth-session'
import { useStatsStore } from './stats'

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

function makeStatsResponse(overrides: Partial<TravelStatsResponse> = {}): TravelStatsResponse {
  return {
    totalTrips: 4,
    uniquePlaces: 3,
    visitedAdministrativeAreas: 3,
    visitedCountries: 2,
    totalSupportedCountries: 21,
    memories: {
      monthlyTrend: [],
      yearlyTrend: [],
      countryDistribution: [],
      profile: [],
      popularFootprints: [],
      postcards: [],
    },
    ...overrides,
  }
}

describe('stats store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchStatsMock.mockReset()
  })

  it('stores statistics after a successful fetch', async () => {
    const authSessionStore = useAuthSessionStore()
    const statsStore = useStatsStore()

    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = makeUser()
    fetchStatsMock.mockResolvedValueOnce(makeStatsResponse({
      totalTrips: 4,
      uniquePlaces: 3,
      visitedAdministrativeAreas: 3,
      visitedCountries: 2,
      totalSupportedCountries: 21,
    }))

    await statsStore.fetchStatsData()

    expect(statsStore.stats).toEqual(makeStatsResponse({
      totalTrips: 4,
      uniquePlaces: 3,
      visitedAdministrativeAreas: 3,
      visitedCountries: 2,
      totalSupportedCountries: 21,
    }))
    expect(statsStore.error).toBeNull()
    expect(statsStore.isLoading).toBe(false)
  })

  it('delegates session 401 responses to authSessionStore.handleUnauthorized', async () => {
    const authSessionStore = useAuthSessionStore()
    const statsStore = useStatsStore()
    const handleUnauthorizedSpy = vi.spyOn(authSessionStore, 'handleUnauthorized')

    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = makeUser()
    fetchStatsMock.mockRejectedValueOnce(new ApiClientError({
      status: 401,
      code: 'session-unauthorized',
      message: 'Unauthorized',
    }))

    await statsStore.fetchStatsData()

    expect(handleUnauthorizedSpy).toHaveBeenCalledTimes(1)
    expect(statsStore.error).toBeNull()
    expect(statsStore.stats).toBeNull()
    expect(statsStore.isLoading).toBe(false)
  })

  it('ignores stale responses after the auth boundary changes', async () => {
    const authSessionStore = useAuthSessionStore()
    const statsStore = useStatsStore()

    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = makeUser()

    fetchStatsMock.mockImplementationOnce(async () => {
      authSessionStore.boundaryVersion += 1
      return makeStatsResponse({
        totalTrips: 8,
        uniquePlaces: 5,
        visitedAdministrativeAreas: 5,
        visitedCountries: 3,
        totalSupportedCountries: 21,
      })
    })

    await statsStore.fetchStatsData()

    expect(statsStore.stats).toBeNull()
    expect(statsStore.error).toBeNull()
    expect(statsStore.isLoading).toBe(false)
  })

  it('reset clears any cached statistics state', () => {
    const statsStore = useStatsStore()

    statsStore.stats = makeStatsResponse({
      totalTrips: 2,
      uniquePlaces: 1,
      visitedAdministrativeAreas: 1,
      visitedCountries: 1,
      totalSupportedCountries: 21,
    })
    statsStore.error = 'fetch-failed'
    statsStore.isLoading = true

    statsStore.reset()

    expect(statsStore.stats).toBeNull()
    expect(statsStore.error).toBeNull()
    expect(statsStore.isLoading).toBe(false)
  })

  it('keeps loading active for a newer request when an older request resolves late', async () => {
    const authSessionStore = useAuthSessionStore()
    const statsStore = useStatsStore()

    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = makeUser()

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

    const firstRequest = statsStore.fetchStatsData()
    statsStore.reset()
    const secondRequest = statsStore.fetchStatsData()

    resolveFirst(makeStatsResponse({
      totalTrips: 3,
      uniquePlaces: 2,
      visitedAdministrativeAreas: 2,
      visitedCountries: 1,
      totalSupportedCountries: 21,
    }))
    await firstRequest

    expect(statsStore.isLoading).toBe(true)
    expect(statsStore.stats).toBeNull()

    resolveSecond(makeStatsResponse({
      totalTrips: 5,
      uniquePlaces: 4,
      visitedAdministrativeAreas: 4,
      visitedCountries: 2,
      totalSupportedCountries: 21,
    }))
    await secondRequest

    expect(statsStore.stats).toEqual(makeStatsResponse({
      totalTrips: 5,
      uniquePlaces: 4,
      visitedAdministrativeAreas: 4,
      visitedCountries: 2,
      totalSupportedCountries: 21,
    }))
    expect(statsStore.isLoading).toBe(false)
  })
})
