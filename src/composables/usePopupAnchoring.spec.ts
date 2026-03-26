import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref, shallowRef } from 'vue'

import { usePopupAnchoring } from './usePopupAnchoring'

const floatingUiMocks = vi.hoisted(() => ({
  computePosition: vi.fn(),
  autoUpdate: vi.fn(),
  offset: vi.fn((value: number) => ({ name: 'offset', options: value })),
  flip: vi.fn((options: Record<string, unknown>) => ({ name: 'flip', options })),
  shift: vi.fn((options: Record<string, unknown>) => ({ name: 'shift', options })),
  size: vi.fn((options: Record<string, unknown>) => ({ name: 'size', options }))
}))

vi.mock('@floating-ui/dom', () => ({
  computePosition: floatingUiMocks.computePosition,
  autoUpdate: floatingUiMocks.autoUpdate,
  offset: floatingUiMocks.offset,
  flip: floatingUiMocks.flip,
  shift: floatingUiMocks.shift,
  size: floatingUiMocks.size
}))

function mountComposable<T>(useComposable: () => T) {
  const result = shallowRef<T | null>(null)
  const wrapper = mount(
    defineComponent({
      setup() {
        result.value = useComposable()

        return () => null
      }
    })
  )

  return {
    result,
    unmount: () => wrapper.unmount()
  }
}

describe('usePopupAnchoring', () => {
  beforeEach(() => {
    floatingUiMocks.computePosition.mockReset()
    floatingUiMocks.autoUpdate.mockReset()
    floatingUiMocks.offset.mockClear()
    floatingUiMocks.flip.mockClear()
    floatingUiMocks.shift.mockClear()
    floatingUiMocks.size.mockClear()
  })

  it('uses Floating UI with offset, flip, shift, and size middleware', async () => {
    const reference = document.createElement('button')
    const floating = document.createElement('div')

    floatingUiMocks.computePosition.mockImplementation(async (_reference, _floating, options) => {
      expect(options.middleware).toHaveLength(4)
      expect(floatingUiMocks.offset).toHaveBeenCalledWith(12)
      expect(floatingUiMocks.flip).toHaveBeenCalledWith({
        padding: 16,
        fallbackAxisSideDirection: 'end'
      })
      expect(floatingUiMocks.shift).toHaveBeenCalledWith({
        padding: 16
      })
      expect(floatingUiMocks.size).toHaveBeenCalledTimes(1)

      return {
        x: 112,
        y: 68,
        placement: 'top-start',
        middlewareData: {}
      }
    })
    floatingUiMocks.autoUpdate.mockImplementation((_reference, _floating, update) => {
      void update()
      return vi.fn()
    })

    const { result } = mountComposable(() =>
      usePopupAnchoring({
        reference: ref(reference),
        floating: ref(floating)
      })
    )

    await nextTick()

    expect(result.value?.placement.value).toBe('top-start')
    expect(result.value?.floatingStyles.value).toMatchObject({
      left: '112px',
      top: '68px'
    })
    expect(floatingUiMocks.autoUpdate).toHaveBeenCalledWith(reference, floating, expect.any(Function))
  })

  it('exposes availableHeight from size middleware and cleans up autoUpdate on stop', async () => {
    const reference = document.createElement('button')
    const floating = document.createElement('div')
    const cleanup = vi.fn()

    floatingUiMocks.computePosition.mockImplementation(async (_reference, _floating, options) => {
      const sizeMiddleware = options.middleware[3]
      sizeMiddleware.options.apply({
        availableWidth: 540,
        availableHeight: 248,
        elements: {
          floating
        }
      })

      return {
        x: 28,
        y: 34,
        placement: 'bottom',
        middlewareData: {
          flip: {
            index: 1,
            overflows: [{ placement: 'top' }]
          },
          shift: {
            x: -14,
            y: 6
          }
        }
      }
    })
    floatingUiMocks.autoUpdate.mockImplementation((_reference, _floating, update) => {
      void update()
      return cleanup
    })

    const { result, unmount } = mountComposable(() =>
      usePopupAnchoring({
        reference: ref(reference),
        floating: ref(floating)
      })
    )

    await nextTick()

    expect(result.value?.availableHeight.value).toBe(248)
    expect(floating.style.maxWidth).toBe('360px')
    expect(floating.style.maxHeight).toBe('248px')
    expect(result.value?.collisionState.value).toBe('collision-aware')

    unmount()

    expect(cleanup).toHaveBeenCalledTimes(1)
  })
})
