import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import AuthenticatedAppShell from './AuthenticatedAppShell.vue'
import { useAuthSessionStore } from '@/stores/auth-session'

function makeUser() {
  return {
    id: 'user-1',
    username: 'Alice',
    email: 'alice@example.com',
    createdAt: '2026-04-12T00:00:00.000Z',
  }
}

async function mountShell(
  route = '/map',
  setup?: (authSessionStore: ReturnType<typeof useAuthSessionStore>) => void,
) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Landing</div>' } },
      { path: '/map', component: { template: '<div data-route-view="map">Map</div>' } },
      { path: '/journal', component: { template: '<div data-route-view="journal">Journal</div>' } },
      { path: '/memories', component: { template: '<div data-route-view="memories">Memories</div>' } },
    ],
  })

  const authSessionStore = useAuthSessionStore()
  authSessionStore.status = 'authenticated'
  authSessionStore.currentUser = makeUser()
  setup?.(authSessionStore)

  const wrapper = mount(AuthenticatedAppShell, {
    slots: {
      default: '<div data-shell-content>content</div>',
    },
    global: {
      plugins: [pinia, router],
    },
  })

  await router.push(route)
  await router.isReady()
  await flushPromises()

  return {
    authSessionStore,
    router,
    wrapper,
  }
}

describe('AuthenticatedAppShell', () => {
  it('renders only the real v8 authenticated navigation entries', async () => {
    const { wrapper } = await mountShell('/map')
    const appShell = wrapper.get('[data-app-shell]')

    expect(appShell.attributes('style')).toContain('--sidebar-width: 260px')
    expect(appShell.attributes('class')).toContain('bg-white')
    expect(wrapper.find('[data-shell-logo]').exists()).toBe(true)
    expect(wrapper.find('[data-shell-sidebar]').exists()).toBe(true)
    expect(wrapper.find('[data-shell-sidebar-frame]').exists()).toBe(true)
    expect(wrapper.find('[data-shell-mobile-trigger]').exists()).toBe(true)
    expect(wrapper.get('[data-shell-mobile-trigger]').attributes('aria-label')).toBe('打开导航')
    expect(wrapper.find('[data-shell-avatar]').exists()).toBe(true)
    expect(wrapper.find('[data-shell-illustration]').exists()).toBe(true)

    const navItems = wrapper.findAll('[data-shell-nav-item]').map((item) =>
      item.attributes('data-shell-nav-item'),
    )

    expect(navItems).toEqual(['map', 'journal', 'memories'])
    expect(wrapper.text()).toContain('世界足迹')
    expect(wrapper.text()).toContain('旅途手账')
    expect(wrapper.text()).toContain('旅途回忆')
    expect(wrapper.text()).not.toContain('我的收藏')
    expect(wrapper.text()).not.toContain('收藏')
    expect(wrapper.text()).not.toContain('点亮足迹')
    expect(wrapper.text()).not.toContain('设置')
    expect(navItems).toHaveLength(3)
    expect(wrapper.findAll('[data-shell-nav-item] [data-kawaii-icon] img')).toHaveLength(3)
    expect(wrapper.get('[data-shell-nav-item="map"] [data-kawaii-icon] img').attributes('src')).toContain(
      'nav-world-footprints',
    )
  })

  it('marks the active route with aria-current="page"', async () => {
    const { wrapper } = await mountShell('/journal')

    expect(wrapper.get('[data-shell-nav-item="journal"]').attributes('aria-current')).toBe('page')
    expect(wrapper.get('[data-shell-nav-item="map"]').attributes('aria-current')).toBeUndefined()
  })

  it('uses world-footprints visual mode on map route with the real navigation set', async () => {
    const { wrapper } = await mountShell('/map')

    expect(wrapper.get('[data-shell-sidebar]').attributes('data-shell-visual-mode')).toBe(
      'world-footprints',
    )
    expect(wrapper.get('[data-shell-illustration]').attributes('src')).toContain(
      'sidebar-camera-girl.webp',
    )
    expect(wrapper.findAll('[data-shell-nav-item]').map((item) =>
      item.attributes('data-shell-nav-item'),
    )).toEqual(['map', 'journal', 'memories'])
    expect(wrapper.text()).not.toContain('我的收藏')
  })

  it('uses the same high-fidelity sidebar on non-map authenticated routes', async () => {
    const { wrapper } = await mountShell('/journal')

    expect(wrapper.get('[data-shell-sidebar]').attributes('data-shell-visual-mode')).toBe(
      'world-footprints',
    )
    expect(wrapper.get('[data-shell-illustration]').attributes('src')).toContain(
      'sidebar-camera-girl.webp',
    )
  })

  it('logs out and routes back to landing', async () => {
    let logoutSpy: ReturnType<typeof vi.spyOn>
    const { router, wrapper } = await mountShell('/memories', (authSessionStore) => {
      logoutSpy = vi.spyOn(authSessionStore, 'logout').mockResolvedValue(undefined)
    })
    const replaceSpy = vi.spyOn(router, 'replace')

    await wrapper.get('[data-shell-logout]').trigger('click')
    await flushPromises()

    expect(logoutSpy).toHaveBeenCalledTimes(1)
    expect(replaceSpy).toHaveBeenCalledWith('/')
  })

  it('shows the inline logout failure alert when logout throws', async () => {
    const { wrapper } = await mountShell('/map', (authSessionStore) => {
      vi.spyOn(authSessionStore, 'logout').mockRejectedValue(new Error('network'))
    })

    await wrapper.get('[data-shell-logout]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('退出登录失败，请稍后重试。')
  })
})
