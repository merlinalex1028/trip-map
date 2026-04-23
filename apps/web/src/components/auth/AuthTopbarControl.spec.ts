import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

import AuthTopbarControl from './AuthTopbarControl.vue'
import { useAuthSessionStore } from '../../stores/auth-session'

const { routerPushMock } = vi.hoisted(() => ({
  routerPushMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: routerPushMock,
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

function mountControl(options?: {
  authenticated?: boolean
}) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authSessionStore = useAuthSessionStore()
  authSessionStore.status = options?.authenticated ? 'authenticated' : 'anonymous'
  authSessionStore.currentUser = options?.authenticated ? makeUser() : null

  const wrapper = mount(AuthTopbarControl, {
    global: {
      plugins: [pinia],
    },
  })

  return {
    authSessionStore,
    wrapper,
  }
}

describe('AuthTopbarControl', () => {
  beforeEach(() => {
    routerPushMock.mockReset()
    routerPushMock.mockResolvedValue(undefined)
  })

  it('shows the timeline entry only for authenticated users', async () => {
    const anonymous = mountControl()

    expect(anonymous.wrapper.find('[data-auth-menu-item="timeline"]').exists()).toBe(false)
    expect(anonymous.wrapper.find('[data-auth-menu-item="statistics"]').exists()).toBe(false)

    anonymous.wrapper.unmount()

    const authenticated = mountControl({ authenticated: true })

    await authenticated.wrapper.get('[data-auth-trigger="authenticated"]').trigger('click')
    await nextTick()

    expect(authenticated.wrapper.find('[data-auth-menu-item="timeline"]').exists()).toBe(true)
    expect(authenticated.wrapper.find('[data-auth-menu-item="statistics"]').exists()).toBe(true)
    expect(authenticated.wrapper.get('[data-auth-menu-item="timeline"]').text()).toContain('时间轴')
    expect(authenticated.wrapper.get('[data-auth-menu-item="statistics"]').text()).toContain('查看统计')
  })

  it('navigates to timeline from the authenticated menu', async () => {
    const { wrapper } = mountControl({ authenticated: true })

    await wrapper.get('[data-auth-trigger="authenticated"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-auth-menu]').exists()).toBe(true)

    await wrapper.get('[data-auth-menu-item="timeline"]').trigger('click')
    await nextTick()

    expect(routerPushMock).toHaveBeenCalledWith('/timeline')
    expect(wrapper.find('[data-auth-menu]').exists()).toBe(false)
  })

  it('keeps the logout action after the timeline entry', async () => {
    const { wrapper } = mountControl({ authenticated: true })

    await wrapper.get('[data-auth-trigger="authenticated"]').trigger('click')
    await nextTick()

    const menuItems = wrapper.findAll('[data-auth-menu-item]').map((item) =>
      item.attributes('data-auth-menu-item'),
    )

    expect(menuItems).toContain('timeline')
    expect(menuItems).toContain('statistics')
    expect(menuItems).toContain('logout')
    expect(menuItems.indexOf('timeline')).toBeLessThan(menuItems.indexOf('logout'))
    expect(menuItems.indexOf('timeline')).toBeLessThan(menuItems.indexOf('statistics'))
    expect(menuItems.indexOf('statistics')).toBeLessThan(menuItems.indexOf('logout'))
  })

  it('navigates to statistics from the authenticated menu', async () => {
    const { wrapper } = mountControl({ authenticated: true })

    await wrapper.get('[data-auth-trigger="authenticated"]').trigger('click')
    await nextTick()

    await wrapper.get('[data-auth-menu-item="statistics"]').trigger('click')
    await nextTick()

    expect(routerPushMock).toHaveBeenCalledWith('/statistics')
    expect(wrapper.find('[data-auth-menu]').exists()).toBe(false)
  })
})
