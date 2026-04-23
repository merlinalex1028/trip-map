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
    fetchStatsMock.mockResolvedValueOnce({ totalTrips: 4, uniquePlaces: 3 })

    await statsStore.fetchStatsData()

    expect(statsStore.stats).toEqual({ totalTrips: 4, uniquePlaces: 3 })
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
      return { totalTrips: 8, uniquePlaces: 5 }
    })

    await statsStore.fetchStatsData()

    expect(statsStore.stats).toBeNull()
    expect(statsStore.error).toBeNull()
    expect(statsStore.isLoading).toBe(false)
  })

  it('reset clears any cached statistics state', () => {
    const statsStore = useStatsStore()

    statsStore.stats = { totalTrips: 2, uniquePlaces: 1 }
    statsStore.error = 'fetch-failed'
    statsStore.isLoading = true

    statsStore.reset()

    expect(statsStore.stats).toBeNull()
    expect(statsStore.error).toBeNull()
    expect(statsStore.isLoading).toBe(false)
  })
})
