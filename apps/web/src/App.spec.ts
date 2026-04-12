import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick } from 'vue'

import App from './App.vue'
import { useAuthSessionStore } from './stores/auth-session'

vi.mock('./components/LeafletMapStage.vue', () => ({
  default: defineComponent({
    name: 'LeafletMapStageStub',
    template: '<div class="min-h-0 flex-1" data-region="map-stage">Map Stage</div>',
  }),
}))

function mountApp() {
  const pinia = createPinia()
  setActivePinia(pinia)

  return mount(App, {
    global: {
      plugins: [pinia],
    },
  })
}

describe('App auth shell', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('calls restoreSession exactly once on the first app mount', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'anonymous'

    const restoreSessionSpy = vi
      .spyOn(authSessionStore, 'restoreSession')
      .mockResolvedValue(undefined)

    mount(App, {
      global: {
        plugins: [authSessionStore.$pinia],
      },
    })

    await nextTick()

    expect(restoreSessionSpy).toHaveBeenCalledTimes(1)
  })

  it('shows a single 登录 / 注册 chip in the topbar when anonymous', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'anonymous'
    authSessionStore.currentUser = null

    const restoreSessionSpy = vi
      .spyOn(authSessionStore, 'restoreSession')
      .mockResolvedValue(undefined)

    const wrapper = mount(App, {
      global: {
        plugins: [authSessionStore.$pinia],
      },
    })

    await nextTick()

    expect(restoreSessionSpy).toHaveBeenCalledTimes(1)

    const topbar = wrapper.get('[data-region="topbar"]')
    const loginRegisterChips = wrapper
      .findAll('button')
      .filter(button => button.text().trim() === '登录 / 注册')

    expect(topbar.text()).toContain('登录 / 注册')
    expect(loginRegisterChips).toHaveLength(1)
    expect(topbar.text()).not.toContain('退出登录')
    expect(topbar.text()).not.toContain('账号设置')
  })

  it('shows only username, email, and 退出登录 in the authenticated dropdown', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'authenticated'
    authSessionStore.currentUser = {
      id: 'user-1',
      username: 'Alice',
      email: 'alice@example.com',
      createdAt: '2026-04-12T00:00:00.000Z',
    }

    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

    const wrapper = mount(App, {
      global: {
        plugins: [authSessionStore.$pinia],
      },
    })

    await nextTick()

    await wrapper.get('button').trigger('click')

    expect(wrapper.get('[data-region="topbar"]').text()).toContain('Alice')
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('alice@example.com')
    expect(wrapper.text()).toContain('退出登录')
    expect(wrapper.text()).not.toContain('账号设置')
    expect(wrapper.text()).not.toContain('设备列表')
    expect(wrapper.text()).not.toContain('forgot-password')
  })

  it('keeps LeafletMapStage mounted and renders the restoring overlay inside data-region="map-shell"', async () => {
    const authSessionStore = useAuthSessionStore()
    authSessionStore.status = 'restoring'
    authSessionStore.currentUser = null

    vi.spyOn(authSessionStore, 'restoreSession').mockResolvedValue(undefined)

    const wrapper = mount(App, {
      global: {
        plugins: [authSessionStore.$pinia],
      },
    })

    await nextTick()

    const mapShell = wrapper.get('[data-region="map-shell"]')

    expect(wrapper.find('[data-region="topbar"]').exists()).toBe(true)
    expect(wrapper.find('[data-region="map-stage"]').exists()).toBe(true)
    expect(mapShell.text()).toContain('正在恢复账号会话')
    expect(mapShell.text()).toContain('正在载入你的云端旅行记录。')
    expect(wrapper.text()).toContain('旅记')
  })
})
