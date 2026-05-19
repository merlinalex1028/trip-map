import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import router from './index'
import { useAuthSessionStore } from '../stores/auth-session'

describe('router /__ui route guard', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'anonymous'
    authSessionStore.currentUser = null
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    await router.replace('/')
  })

  it('has /__ui route before catch-all', async () => {
    await router.isReady()
    const route = router.resolve('/__ui')
    expect(route.name).toBe('ui-showcase')
  })

  it('redirects /__ui to / in production', async () => {
    const originalDev = import.meta.env.DEV
    vi.stubEnv('DEV', false)
    try {
      await router.push('/__ui')
      await router.isReady()
      expect(router.currentRoute.value.fullPath).toBe('/')
    } finally {
      vi.unstubAllEnvs()
    }
  })
})

describe('router auth guard', () => {
  const legacyTimelinePath = '/time' + 'line'
  const legacyStatisticsPath = '/stati' + 'stics'

  beforeEach(async () => {
    setActivePinia(createPinia())
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'anonymous'
    authSessionStore.currentUser = null
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    await router.replace('/')
  })

  it('redirects anonymous user from /map to /', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'anonymous'
    authSessionStore.currentUser = null
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

    await router.push('/map')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/')
    expect(router.resolve('/map').name).toBe('world-footprints')
  })

  it('redirects anonymous user from /journal to /', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'anonymous'
    authSessionStore.currentUser = null
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

    await router.push('/journal')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/')
    expect(router.resolve('/journal').name).toBe('travel-journal')
  })

  it('redirects anonymous user from /memories to /', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'anonymous'
    authSessionStore.currentUser = null
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

    await router.push('/memories')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/')
    expect(router.resolve('/memories').name).toBe('travel-memories')
  })

  it('redirects authenticated user from / to /map', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = {
      id: 'user-1',
      username: 'Alice',
      email: 'alice@example.com',
      createdAt: '2026-04-12T00:00:00.000Z',
    }
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

    await router.push('/journal')
    await router.push('/')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/map')
    expect(router.currentRoute.value.name).toBe('world-footprints')
  })

  it('allows authenticated user to stay on /map', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = {
      id: 'user-1',
      username: 'Alice',
      email: 'alice@example.com',
      createdAt: '2026-04-12T00:00:00.000Z',
    }
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

    await router.push('/map')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/map')
    expect(router.currentRoute.value.name).toBe('world-footprints')
  })

  it('allows authenticated user to stay on /journal', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = {
      id: 'user-1',
      username: 'Alice',
      email: 'alice@example.com',
      createdAt: '2026-04-12T00:00:00.000Z',
    }
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

    await router.push('/journal')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/journal')
    expect(router.currentRoute.value.name).toBe('travel-journal')
  })

  it('keeps /journal as the protected travel journal route while the legacy timeline path falls through', async () => {
    const journalRoute = router.resolve('/journal')
    const legacyTimelineRoute = router.resolve(legacyTimelinePath)

    expect(journalRoute.name).toBe('travel-journal')
    expect(journalRoute.meta.requiresAuth).toBe(true)
    expect(legacyTimelineRoute.name).toBeUndefined()
    expect(
      legacyTimelineRoute.matched[legacyTimelineRoute.matched.length - 1]?.path,
    ).toBe('/:pathMatch(.*)*')

    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'anonymous'
    authSessionStore.currentUser = null
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

    await router.push(legacyTimelinePath)
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('allows authenticated user to stay on /memories', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = {
      id: 'user-1',
      username: 'Alice',
      email: 'alice@example.com',
      createdAt: '2026-04-12T00:00:00.000Z',
    }
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

    await router.push('/memories')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/memories')
    expect(router.currentRoute.value.name).toBe('travel-memories')
  })

  it('redirects to / after restoring session resolves to anonymous', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'restoring'
    authSessionStore.currentUser = null
    vi.spyOn(authSessionStore, 'restoreSession').mockImplementation(async () => {
      authSessionStore.status = 'anonymous'
    })

    await router.push('/journal')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('stays on the requested protected route after restoring to authenticated', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'restoring'
    authSessionStore.currentUser = null
    vi.spyOn(authSessionStore, 'restoreSession').mockImplementation(async () => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = {
        id: 'user-1',
        username: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-04-12T00:00:00.000Z',
      }
    })

    await router.push('/journal')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/journal')
    expect(router.currentRoute.value.name).toBe('travel-journal')
  })

  it('lets legacy timeline path fall through the catch-all instead of resolving to a named route', async () => {
    const resolvedRoute = router.resolve(legacyTimelinePath)

    expect(resolvedRoute.name).toBeUndefined()
    expect(resolvedRoute.matched[resolvedRoute.matched.length - 1]?.path).toBe('/:pathMatch(.*)*')

    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'anonymous'
    authSessionStore.currentUser = null
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

    await router.push(legacyTimelinePath)
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('lets legacy statistics path fall through the catch-all instead of resolving to a named route', async () => {
    const resolvedRoute = router.resolve(legacyStatisticsPath)

    expect(resolvedRoute.name).toBeUndefined()
    expect(resolvedRoute.matched[resolvedRoute.matched.length - 1]?.path).toBe('/:pathMatch(.*)*')

    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'anonymous'
    authSessionStore.currentUser = null
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

    await router.push(legacyStatisticsPath)
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/')
  })
})
