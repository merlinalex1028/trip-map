import { mount } from '@vue/test-utils'
import { defineComponent, shallowRef, type Ref } from 'vue'

export function mountComposable<T>(factory: () => T) {
  const result = shallowRef<T | null>(null) as Ref<T | null>

  const wrapper = mount(
    defineComponent({
      setup() {
        result.value = factory()

        return () => null
      }
    })
  )

  return {
    result: result as Ref<T>,
    wrapper,
    unmount: () => wrapper.unmount()
  }
}
