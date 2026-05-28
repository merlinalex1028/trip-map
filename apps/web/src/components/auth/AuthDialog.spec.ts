import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { replaceSpy } = vi.hoisted(() => ({
  replaceSpy: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    replace: replaceSpy,
  }),
}))

import AuthDialog from './AuthDialog.vue'
import { ApiClientError } from '../../services/api/client'
import { useAuthSessionStore } from '../../stores/auth-session'

function mountDialog(
  setup?: (authSessionStore: ReturnType<typeof useAuthSessionStore>) => void,
  options: { open?: boolean } = {},
) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authSessionStore = useAuthSessionStore()
  authSessionStore.isAuthModalOpen = options.open ?? true
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
  beforeEach(() => {
    replaceSpy.mockReset()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

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

  it('moves focus into the selected auth mode and restores it to the auth trigger when closed', async () => {
    const trigger = document.createElement('button')
    trigger.dataset.authTrigger = 'true'
    trigger.textContent = '登录'
    document.body.append(trigger)
    trigger.focus()

    const { wrapper } = mountDialog((authSessionStore) => {
      vi.spyOn(authSessionStore, 'closeAuthModal').mockImplementation(() => {
        authSessionStore.isAuthModalOpen = false
      })
    })

    await nextTick()

    expect(document.activeElement).toBe(wrapper.get('input[name="email"]').element)
    expect(wrapper.get('[data-auth-dialog]').attributes('role')).toBe('dialog')
    expect(wrapper.get('[data-auth-dialog]').attributes('aria-modal')).toBe('true')

    const tabs = wrapper.findAll('[role="tab"]')
    expect(wrapper.get('[role="tablist"]').attributes('aria-label')).toBe('认证方式')
    expect(tabs.map(tab => tab.attributes('aria-selected'))).toEqual(['true', 'false'])
    expect(tabs.map(tab => tab.attributes('aria-controls'))).toEqual([
      'auth-panel-login',
      'auth-panel-register',
    ])

    await wrapper.get('button[aria-label="关闭认证弹层"]').trigger('click')
    await flushPromises()

    expect(document.activeElement).toBe(trigger)
  })

  it('does not move focus to an auth trigger when mounted closed', async () => {
    const trigger = document.createElement('button')
    trigger.dataset.authTrigger = 'true'
    trigger.textContent = '登录'
    document.body.append(trigger)

    const stableFocus = document.createElement('button')
    stableFocus.textContent = '保持焦点'
    document.body.append(stableFocus)
    stableFocus.focus()

    mountDialog(undefined, { open: false })
    await flushPromises()

    expect(document.activeElement).toBe(stableFocus)
  })

  it('clears login credentials after explicit close before the next open', async () => {
    const { authSessionStore, wrapper } = mountDialog((store) => {
      vi.spyOn(store, 'closeAuthModal').mockImplementation(() => {
        store.isAuthModalOpen = false
      })
    })

    await wrapper.get('input[name="email"]').setValue('alice@example.com')
    await wrapper.get('input[name="password"]').setValue('super-secret')
    await wrapper.get('button[aria-label="关闭认证弹层"]').trigger('click')
    await flushPromises()

    authSessionStore.isAuthModalOpen = true
    await flushPromises()

    expect(wrapper.get<HTMLInputElement>('input[name="email"]').element.value).toBe('')
    expect(wrapper.get<HTMLInputElement>('input[name="password"]').element.value).toBe('')
  })

  it('calls login, closes the dialog, and navigates to /map after a successful 登录 submit', async () => {
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
    expect(replaceSpy).toHaveBeenCalledWith('/map')

    authSessionStore.isAuthModalOpen = true
    await flushPromises()

    expect(wrapper.get<HTMLInputElement>('input[name="email"]').element.value).toBe('')
    expect(wrapper.get<HTMLInputElement>('input[name="password"]').element.value).toBe('')
  })

  it('calls register, closes the dialog, and navigates to /map after a successful 注册 submit', async () => {
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
    expect(replaceSpy).toHaveBeenCalledWith('/map')

    authSessionStore.isAuthModalOpen = true
    authSessionStore.authMode = 'register'
    await flushPromises()

    expect(wrapper.get<HTMLInputElement>('input[name="username"]').element.value).toBe('')
    expect(wrapper.get<HTMLInputElement>('input[name="email"]').element.value).toBe('')
    expect(wrapper.get<HTMLInputElement>('input[name="password"]').element.value).toBe('')
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
    expect(replaceSpy).not.toHaveBeenCalled()
    expect(authSessionStore.isAuthModalOpen).toBe(true)
    const alert = wrapper.get('[role="alert"]')
    const dialog = wrapper.get('[data-auth-dialog]')

    expect(alert.text()).toContain('登录失败')
    expect(alert.attributes('id')).toBe('auth-submit-error')
    expect(dialog.attributes('aria-describedby')).toBe('auth-submit-error')
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
