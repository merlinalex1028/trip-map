import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { readFileSync } from 'node:fs'
import { nextTick } from 'vue'

import LandingPageView from './LandingPageView.vue'
import { useAuthSessionStore } from '../stores/auth-session'

function mountLandingPageView() {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authSessionStore = useAuthSessionStore()
  authSessionStore.status = 'anonymous'
  authSessionStore.currentUser = null

  const wrapper = mount(LandingPageView, {
    global: {
      plugins: [pinia],
    },
  })

  return {
    authSessionStore,
    wrapper,
  }
}

describe('LandingPageView', () => {
  it('renders the public landing route view with the hero register trigger', async () => {
    const { authSessionStore, wrapper } = mountLandingPageView()
    const openAuthModalSpy = vi.spyOn(authSessionStore, 'openAuthModal')

    const registerTriggers = wrapper.findAll('[data-auth-trigger="landing-register"]')

    await registerTriggers[0].trigger('click')
    await nextTick()

    expect(wrapper.find('[data-route-view="landing"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('每一次出发，都是与世界的温柔相遇')
    expect(wrapper.text()).toContain('开始记录旅途 ✨')
    expect(registerTriggers).toHaveLength(1)
    expect(openAuthModalSpy).toHaveBeenNthCalledWith(1, 'register')
  })

  it('opens login mode from the hero login trigger', async () => {
    const { authSessionStore, wrapper } = mountLandingPageView()
    const openAuthModalSpy = vi.spyOn(authSessionStore, 'openAuthModal')

    await wrapper.get('[data-auth-trigger="landing-hero-login"]').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('探索世界地图 📖')
    expect(wrapper.find('[data-auth-trigger="landing-login"]').exists()).toBe(false)
    expect(openAuthModalSpy).toHaveBeenNthCalledWith(1, 'login')
  })

  it('keeps landing CTA hover motion disabled under reduced motion', () => {
    const source = readFileSync('src/components/landing/LandingHero.vue', 'utf8')

    expect(source).toContain('@media (prefers-reduced-motion: reduce)')
    expect(source).toContain('.landing-hero__action:hover')
    expect(source).toContain('transform: none')
  })
})
