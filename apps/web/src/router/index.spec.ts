import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import router from './index'
import { useAuthSessionStore } from '../stores/auth-session'

describe('router auth guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // 每次测试前重置 router 到首页，避免前一个测试污染
    router.push('/')
  })

  it('redirects anonymous user from /timeline to /', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'anonymous'
    authSessionStore.currentUser = null
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

    await router.push('/timeline')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('redirects anonymous user from /statistics to /', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'anonymous'
    authSessionStore.currentUser = null
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

    await router.push('/statistics')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('allows authenticated user to stay on /timeline', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = {
      id: 'user-1',
      username: 'Alice',
      email: 'alice@example.com',
      createdAt: '2026-04-12T00:00:00.000Z',
    }
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

    await router.push('/timeline')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/timeline')
  })

  it('allows authenticated user to stay on /statistics', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = {
      id: 'user-1',
      username: 'Alice',
      email: 'alice@example.com',
      createdAt: '2026-04-12T00:00:00.000Z',
    }
    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

    await router.push('/statistics')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/statistics')
  })

  it('redirects to / after restoring session resolves to anonymous', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'restoring'
    authSessionStore.currentUser = null
    vi.spyOn(authSessionStore, 'restoreSession').mockImplementation(async () => {
      authSessionStore.status = 'anonymous'
    })

    await router.push('/timeline')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('stays on /timeline after restoring session resolves to authenticated', async () => {
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

    await router.push('/timeline')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/timeline')
  })
})
