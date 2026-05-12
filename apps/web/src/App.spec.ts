import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from './App.vue'
import { useAuthSessionStore } from './stores/auth-session'
import { useMapUiStore } from './stores/map-ui'

const mountedWrappers: Array<{ unmount: () => void }> = []

function makeUser() {
  return {
    id: 'user-1',
    username: 'Alice',
    email: 'alice@example.com',
    createdAt: '2026-04-12T00:00:00.000Z',
  }
}

async function mountApp(
  setup?: (authSessionStore: ReturnType<typeof useAuthSessionStore>) => void,
  route = '/',
) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const appRouter = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        name: 'landing',
        component: defineComponent({
          template: '<div data-route-view="landing">Landing</div>',
        }),
      },
      {
        path: '/map',
        name: 'map',
        meta: { requiresAuth: true },
        component: defineComponent({
          template: '<section data-region="map-shell" data-route-view="map"><div data-region="map-stage">Map Stage</div></section>',
        }),
      },
      {
        path: '/journal',
        name: 'journal',
        meta: { requiresAuth: true },
        component: defineComponent({
          template: '<div data-route-view="journal">Journal</div>',
        }),
      },
      {
        path: '/memories',
        name: 'memories',
        meta: { requiresAuth: true },
        component: defineComponent({
          template: '<div data-route-view="memories">Memories</div>',
        }),
      },
      {
        path: '/:pathMatch(.*)*',
        redirect: '/',
      },
    ],
  })

  const authSessionStore = useAuthSessionStore()
  setup?.(authSessionStore)

  const wrapper = mount(App, {
    global: {
      plugins: [pinia, appRouter],
    },
  })
  mountedWrappers.push(wrapper)

  await appRouter.push(route)
  await appRouter.isReady()
  await flushPromises()

  return {
    authSessionStore,
    router: appRouter,
    wrapper,
  }
}

describe('App auth shell', () => {
  afterEach(() => {
    while (mountedWrappers.length > 0) {
      mountedWrappers.pop()?.unmount()
    }
  })

  it('calls restoreSession exactly once on the first app mount', async () => {
    let restoreSessionSpy: ReturnType<typeof vi.spyOn>
    await mountApp((authSessionStore) => {
      authSessionStore.status = 'anonymous'
      restoreSessionSpy = vi
        .spyOn(authSessionStore, 'restoreSession')
        .mockResolvedValue(undefined)
    })

    expect(restoreSessionSpy!).toHaveBeenCalledTimes(1)
  })

  it('renders landing without the authenticated shell on the public route', async () => {
    const { wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'anonymous'
      authSessionStore.currentUser = null
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    })

    expect(wrapper.find('[data-route-view="landing"]').exists()).toBe(true)
    expect(wrapper.find('[data-app-shell]').exists()).toBe(false)
  })

  it.each(['/map', '/journal', '/memories'])(
    'wraps authenticated routes in the app shell for %s',
    async (route) => {
      const { wrapper } = await mountApp((authSessionStore) => {
        authSessionStore.status = 'authenticated'
        authSessionStore.currentUser = makeUser()
        vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
      }, route)

      expect(wrapper.find('[data-app-shell]').exists()).toBe(true)
      expect(wrapper.find('[data-shell-sidebar]').exists()).toBe(true)
      expect(wrapper.find(`[data-route-view="${route === '/map' ? 'map' : route === '/journal' ? 'journal' : 'memories'}"]`).exists()).toBe(true)
    },
  )

  it('renders the restore state before route content while auth status is restoring', async () => {
    const { wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'restoring'
      authSessionStore.currentUser = null
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    }, '/map')

    expect(wrapper.get('[data-auth-restore-state]').text()).toBe('正在恢复你的旅途...')
    expect(wrapper.find('[data-app-shell]').exists()).toBe(false)
    expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(false)
  })

  it('mounts the local import decision dialog when pendingLocalImportDecision exists', async () => {
    const { wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
      authSessionStore.pendingLocalImportDecision = {
        legacyRecordCount: 2,
        records: [],
      }
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    }, '/map')

    expect(wrapper.get('[data-local-import-dialog]').text()).toContain('导入本地记录到当前账号')
    expect(wrapper.get('[data-local-import-dialog]').text()).toContain('以当前账号云端记录为准')
  })

  it('closes the import decision dialog after choosing cloud records while keeping the app shell mounted', async () => {
    const { wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
      authSessionStore.pendingLocalImportDecision = {
        legacyRecordCount: 1,
        records: [],
      }
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
      vi.spyOn(authSessionStore, 'keepCloudRecordsAsSourceOfTruth').mockImplementation(() => {
        authSessionStore.pendingLocalImportDecision = null
      })
    }, '/map')

    await wrapper.get('[data-local-import-action="keep-cloud"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-local-import-dialog]').exists()).toBe(false)
    expect(wrapper.find('[data-app-shell]').exists()).toBe(true)
    expect(wrapper.find('[data-region="map-shell"]').exists()).toBe(true)
  })

  it('renders the global interaction notice with text interpolation', async () => {
    const { wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'anonymous'
      authSessionStore.currentUser = null
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
      useMapUiStore().setInteractionNotice({
        tone: 'info',
        message: '已退出当前账号',
      })
    })

    expect(wrapper.get('[role="status"]').text()).toContain('已退出当前账号')
  })

  it('renders map stage only on the map route', async () => {
    const { router, wrapper } = await mountApp((authSessionStore) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
    }, '/map')

    expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(true)
    expect(wrapper.find('[data-app-shell]').exists()).toBe(true)

    await router.push('/journal')
    await flushPromises()

    expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(false)
    expect(wrapper.find('[data-route-view="journal"]').exists()).toBe(true)

    await router.push('/memories')
    await flushPromises()

    expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(false)
    expect(wrapper.find('[data-route-view="memories"]').exists()).toBe(true)
  })

  it('triggers foreground refresh on window focus only when authenticated', async () => {
    let refreshSpy: ReturnType<typeof vi.spyOn>
    await mountApp((authSessionStore) => {
      authSessionStore.status = 'authenticated'
      authSessionStore.currentUser = makeUser()
      vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)
      refreshSpy = vi
        .spyOn(authSessionStore, 'refreshAuthenticatedSnapshot')
        .mockResolvedValue(undefined)
    }, '/map')

    window.dispatchEvent(new Event('focus'))
    await flushPromises()

    expect(refreshSpy!).toHaveBeenCalledTimes(1)
  })
})
