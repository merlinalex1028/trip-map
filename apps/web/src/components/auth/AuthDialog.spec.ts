import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

import AuthDialog from './AuthDialog.vue'
import { ApiClientError } from '../../services/api/client'
import { useAuthSessionStore } from '../../stores/auth-session'

function mountDialog(
  setup?: (authSessionStore: ReturnType<typeof useAuthSessionStore>) => void,
) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authSessionStore = useAuthSessionStore()
  authSessionStore.isAuthModalOpen = true
  authSessionStore.authMode = 'login'
  setup?.(authSessionStore)

  const wrapper = mount(AuthDialog, {
    attachTo: document.body,
    global: {
      plugins: [pinia],
    },
  })

  return {
    authSessionStore,
    wrapper,
  }
}

describe('AuthDialog', () => {
  it('renders only 登录 and 注册 tabs', () => {
    const { wrapper } = mountDialog()

    const tabs = wrapper.findAll('[role="tab"]').map(tab => tab.text().trim())

    expect(tabs).toEqual(['登录', '注册'])
    expect(wrapper.text()).not.toContain('忘记密码')
    expect(wrapper.text()).not.toContain('账号设置')
    expect(wrapper.text()).not.toContain('OAuth')
  })

  it('shows only 邮箱 + 密码 fields in the 登录 tab', () => {
    const { wrapper } = mountDialog()

    expect(wrapper.text()).toContain('邮箱')
    expect(wrapper.text()).toContain('密码')
    expect(wrapper.text()).not.toContain('用户名')
    expect(wrapper.find('input[name="email"]').exists()).toBe(true)
    expect(wrapper.find('input[name="password"]').exists()).toBe(true)
    expect(wrapper.find('input[name="username"]').exists()).toBe(false)
  })

  it('switches tabs without page navigation and shows only 用户名 + 邮箱 + 密码 in 注册', async () => {
    const { wrapper } = mountDialog()
    const currentPath = window.location.pathname

    await wrapper.get('[role="tab"][aria-controls="auth-panel-register"]').trigger('click')
    await nextTick()

    expect(window.location.pathname).toBe(currentPath)
    expect(wrapper.text()).toContain('用户名')
    expect(wrapper.text()).toContain('邮箱')
    expect(wrapper.text()).toContain('密码')
    expect(wrapper.find('input[name="username"]').exists()).toBe(true)
    expect(wrapper.find('input[name="email"]').exists()).toBe(true)
    expect(wrapper.find('input[name="password"]').exists()).toBe(true)
  })

  it('calls login and closeAuthModal after a successful 登录 submit', async () => {
    const { wrapper } = mountDialog((authSessionStore) => {
      vi.spyOn(authSessionStore, 'login').mockResolvedValue(undefined)
      vi.spyOn(authSessionStore, 'closeAuthModal').mockImplementation(() => {
        authSessionStore.isAuthModalOpen = false
      })
    })
    const authSessionStore = useAuthSessionStore()
    const loginSpy = vi.mocked(authSessionStore.login)
    const closeAuthModalSpy = vi.mocked(authSessionStore.closeAuthModal)

    await wrapper.get('input[name="email"]').setValue('alice@example.com')
    await wrapper.get('input[name="password"]').setValue('super-secret')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(loginSpy).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'super-secret',
    })
    expect(closeAuthModalSpy).toHaveBeenCalled()
  })

  it('calls register and closeAuthModal after a successful 注册 submit', async () => {
    const { wrapper } = mountDialog((authSessionStore) => {
      vi.spyOn(authSessionStore, 'register').mockResolvedValue(undefined)
      vi.spyOn(authSessionStore, 'closeAuthModal').mockImplementation(() => {
        authSessionStore.isAuthModalOpen = false
      })
    })
    const authSessionStore = useAuthSessionStore()
    const registerSpy = vi.mocked(authSessionStore.register)
    const closeAuthModalSpy = vi.mocked(authSessionStore.closeAuthModal)

    await wrapper.get('[role="tab"][aria-controls="auth-panel-register"]').trigger('click')
    await nextTick()

    await wrapper.get('input[name="username"]').setValue('  Alice  ')
    await wrapper.get('input[name="email"]').setValue('alice@example.com')
    await wrapper.get('input[name="password"]').setValue('super-secret')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(registerSpy).toHaveBeenCalledWith({
      username: 'Alice',
      email: 'alice@example.com',
      password: 'super-secret',
    })
    expect(closeAuthModalSpy).toHaveBeenCalled()
  })

  it('keeps the dialog open and shows a form error when 登录 fails with auth-submit 401', async () => {
    const { wrapper } = mountDialog((authSessionStore) => {
      vi.spyOn(authSessionStore, 'login').mockRejectedValue(
        new ApiClientError({
          status: 401,
          code: 'auth-submit-unauthorized',
          message: 'Invalid email or password',
        }),
      )
      vi.spyOn(authSessionStore, 'closeAuthModal').mockImplementation(() => {
        authSessionStore.isAuthModalOpen = false
      })
    })
    const authSessionStore = useAuthSessionStore()
    const closeAuthModalSpy = vi.mocked(authSessionStore.closeAuthModal)

    await wrapper.get('input[name="email"]').setValue('alice@example.com')
    await wrapper.get('input[name="password"]').setValue('wrong-password')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(closeAuthModalSpy).not.toHaveBeenCalled()
    expect(authSessionStore.isAuthModalOpen).toBe(true)
    expect(wrapper.get('[role="alert"]').text()).toContain('登录失败')
  })

  it('preserves the centered dialog layout contract after 登录 fails', async () => {
    const { wrapper } = mountDialog((authSessionStore) => {
      vi.spyOn(authSessionStore, 'login').mockRejectedValue(
        new ApiClientError({
          status: 401,
          code: 'auth-submit-unauthorized',
          message: 'Invalid email or password',
        }),
      )
    })
    const authSessionStore = useAuthSessionStore()

    await wrapper.get('input[name="email"]').setValue('alice@example.com')
    await wrapper.get('input[name="password"]').setValue('wrong-password')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const backdrop = wrapper.get('[data-auth-dialog-backdrop]')
    const dialog = wrapper.get('[data-auth-dialog]')

    expect(authSessionStore.isAuthModalOpen).toBe(true)
    expect(wrapper.get('[role="alert"]').text()).toContain('登录失败')
    expect(backdrop.classes()).toEqual(
      expect.arrayContaining(['fixed', 'inset-0', 'flex', 'items-center', 'justify-center']),
    )
    expect(dialog.classes()).toEqual(
      expect.arrayContaining(['mx-auto', 'w-full', 'max-w-[30rem]']),
    )
    expect(dialog.attributes('role')).toBe('dialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.element.tagName).toBe('DIV')
  })

  it('limits 注册用户名到 32 characters in the rendered input contract', async () => {
    const { wrapper } = mountDialog()

    await wrapper.get('[role="tab"][aria-controls="auth-panel-register"]').trigger('click')
    await nextTick()

    expect(wrapper.get('input[name="username"]').attributes('maxlength')).toBe('32')
    expect(wrapper.get('input[name="username"]').attributes('minlength')).toBe('2')
  })

  it('blocks blank usernames after trim before sending 注册请求', async () => {
    const { wrapper } = mountDialog((authSessionStore) => {
      vi.spyOn(authSessionStore, 'register').mockResolvedValue(undefined)
    })
    const authSessionStore = useAuthSessionStore()
    const registerSpy = vi.mocked(authSessionStore.register)

    await wrapper.get('[role="tab"][aria-controls="auth-panel-register"]').trigger('click')
    await nextTick()

    await wrapper.get('input[name="username"]').setValue('   ')
    await wrapper.get('input[name="email"]').setValue('alice@example.com')
    await wrapper.get('input[name="password"]').setValue('super-secret')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(registerSpy).not.toHaveBeenCalled()
    expect(wrapper.get('[role="alert"]').text()).toContain('用户名至少需要 2 个字符')
  })
})
