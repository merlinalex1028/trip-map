import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import AuthTopbarControl from './AuthTopbarControl.vue'
import { useAuthSessionStore } from '../../stores/auth-session'

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
  setup?: (authSessionStore: ReturnType<typeof useAuthSessionStore>) => void
}) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authSessionStore = useAuthSessionStore()
  authSessionStore.status = options?.authenticated ? 'authenticated' : 'anonymous'
  authSessionStore.currentUser = options?.authenticated ? makeUser() : null
  options?.setup?.(authSessionStore)

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
  it('renders only the anonymous auth trigger when not authenticated', () => {
    const { wrapper } = mountControl()

    expect(wrapper.get('[data-auth-trigger="anonymous"]').text()).toContain('登录 / 注册')
    expect(wrapper.findAll('button')).toHaveLength(1)
  })

  it('does not expose authenticated route navigation surfaces anymore', () => {
    const { wrapper } = mountControl({ authenticated: true })

    expect(wrapper.find('[data-auth-trigger="anonymous"]').exists()).toBe(false)
    expect(wrapper.find('[data-auth-trigger="authenticated"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-auth-menu-item]').length).toBe(0)
    expect(wrapper.findAll('button').length).toBe(0)
  })

  it('opens login mode from the anonymous trigger', async () => {
    let openAuthModalSpy: ReturnType<typeof vi.spyOn>
    const { wrapper } = mountControl({
      setup: (authSessionStore) => {
        openAuthModalSpy = vi.spyOn(authSessionStore, 'openAuthModal')
      },
    })

    await wrapper.get('[data-auth-trigger="anonymous"]').trigger('click')

    expect(openAuthModalSpy).toHaveBeenCalledWith('login')
  })
})
