import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'

import App from './App.vue'

describe('App shell', () => {
  it('renders the poster shell root', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()]
      }
    })

    expect(wrapper.find('.poster-shell').exists()).toBe(true)
    expect(wrapper.text()).toContain('旅行世界地图')
  })
})
