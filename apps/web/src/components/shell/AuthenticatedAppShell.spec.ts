import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { vi } from 'vitest'

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

function makeLongUsernameUser() {
  return {
    ...makeUser(),
    username: '视觉 QA 长用户名用于验证侧栏文本不会溢出',
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
  it('renders the high-fidelity world footprint sidebar contract', async () => {
    const { wrapper } = await mountShell('/map')
    const appShell = wrapper.get('[data-app-shell]')

    expect(appShell.attributes('style')).toContain('--sidebar-width: 280px')
    expect(appShell.attributes('class')).toContain('bg-white')
    expect(wrapper.find('[data-shell-logo]').exists()).toBe(true)
    expect(wrapper.find('[data-shell-sidebar]').exists()).toBe(true)
    expect(wrapper.find('[data-shell-sidebar-frame]').exists()).toBe(true)
    expect(wrapper.find('[data-shell-avatar]').exists()).toBe(true)
    expect(wrapper.find('[data-shell-illustration]').exists()).toBe(true)

    const navItems = wrapper.findAll('[data-nav-key]').map((item) =>
      item.attributes('data-nav-key'),
    )

    expect(navItems).toEqual(['map', 'journal', 'memories'])
    expect(wrapper.text()).toContain('世界足迹')
    expect(wrapper.text()).toContain('旅途手账')
    expect(wrapper.text()).toContain('旅途回忆')
    expect(wrapper.text()).not.toContain('旅行图鉴')
    expect(wrapper.text()).not.toContain('我的收藏')
    expect(wrapper.text()).not.toContain('点亮足迹')
    expect(wrapper.text()).not.toContain('设置')
    expect(navItems).toHaveLength(3)
    expect(wrapper.findAll('[data-nav-key] [data-kawaii-icon] img')).toHaveLength(3)
    expect(wrapper.get('[data-nav-key="map"] [data-kawaii-icon] img').attributes('src')).toContain(
      'nav-world-footprints',
    )
  })

  it('marks the active route with aria-current="page"', async () => {
    const { wrapper } = await mountShell('/journal')

    expect(wrapper.get('a[data-nav-key="journal"]').attributes('aria-current')).toBe('page')
    expect(wrapper.get('a[data-nav-key="map"]').attributes('aria-current')).toBeUndefined()
  })

  it('uses world-footprints visual mode on map route with the high-fidelity menu set', async () => {
    const { wrapper } = await mountShell('/map')

    expect(wrapper.get('[data-shell-sidebar]').attributes('data-shell-visual-mode')).toBe(
      'world-footprints',
    )
    expect(wrapper.get('[data-shell-illustration]').attributes('src')).toContain(
      'sidebar-camera-girl.webp',
    )
    expect(wrapper.findAll('[data-nav-key]').map((item) =>
      item.attributes('data-nav-key'),
    )).toEqual(['map', 'journal', 'memories'])
    expect(wrapper.text()).toContain('旅途回忆')
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

  it('constrains the long QA username without adding extra navigation destinations', async () => {
    const { wrapper } = await mountShell('/memories', (authSessionStore) => {
      authSessionStore.currentUser = makeLongUsernameUser()
    })

    const username = wrapper.get('[data-shell-username]')

    expect(username.text()).toBe('视觉 QA 长用户名用于验证侧栏文本不会溢出')
    expect(username.classes()).toEqual(expect.arrayContaining(['max-w-full', 'truncate']))
    expect(wrapper.findAll('a[data-nav-key]').map(item => item.text().trim())).toEqual([
      '世界足迹',
      '旅途手账',
      '旅途回忆',
    ])
    expect(wrapper.get('a[data-nav-key="memories"]').attributes('aria-current')).toBe('page')
  })

  it('logs out and routes back to landing', async () => {
    let logoutSpy!: ReturnType<typeof vi.spyOn>
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
