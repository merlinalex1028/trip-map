import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref, shallowRef } from 'vue'

import { usePopupAnchoring } from './usePopupAnchoring'

const computePosition = vi.fn()
const autoUpdate = vi.fn()
const offset = vi.fn((value: number) => ({ name: 'offset', options: value }))
const flip = vi.fn((options: Record<string, unknown>) => ({ name: 'flip', options }))
const shift = vi.fn((options: Record<string, unknown>) => ({ name: 'shift', options }))
const size = vi.fn((options: Record<string, unknown>) => ({ name: 'size', options }))

vi.mock('@floating-ui/dom', () => ({
  computePosition,
  autoUpdate,
  offset,
  flip,
  shift,
  size
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
    result: result.value as T,
    unmount: () => wrapper.unmount()
  }
}

describe('usePopupAnchoring', () => {
  beforeEach(() => {
    computePosition.mockReset()
    autoUpdate.mockReset()
    offset.mockClear()
    flip.mockClear()
    shift.mockClear()
    size.mockClear()
  })

  it('uses Floating UI with offset, flip, shift, and size middleware', async () => {
    const reference = document.createElement('button')
    const floating = document.createElement('div')

    computePosition.mockImplementation(async (_reference, _floating, options) => {
      expect(options.middleware).toHaveLength(4)
      expect(offset).toHaveBeenCalledWith(12)
      expect(flip).toHaveBeenCalledWith({
        padding: 16,
        fallbackAxisSideDirection: 'end'
      })
      expect(shift).toHaveBeenCalledWith({
        padding: 16
      })
      expect(size).toHaveBeenCalledTimes(1)

      return {
        x: 112,
        y: 68,
        placement: 'top-start',
        middlewareData: {}
      }
    })
    autoUpdate.mockImplementation((_reference, _floating, update) => {
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

    expect(result.placement.value).toBe('top-start')
    expect(result.floatingStyles.value).toMatchObject({
      left: '112px',
      top: '68px'
    })
    expect(autoUpdate).toHaveBeenCalledWith(reference, floating, expect.any(Function))
  })

  it('exposes availableHeight from size middleware and cleans up autoUpdate on stop', async () => {
    const reference = document.createElement('button')
    const floating = document.createElement('div')
    const cleanup = vi.fn()

    computePosition.mockImplementation(async (_reference, _floating, options) => {
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
    autoUpdate.mockImplementation((_reference, _floating, update) => {
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

    expect(result.availableHeight.value).toBe(248)
    expect(floating.style.maxWidth).toBe('360px')
    expect(floating.style.maxHeight).toBe('248px')
    expect(result.collisionState.value).toBe('collision-aware')

    unmount()

    expect(cleanup).toHaveBeenCalledTimes(1)
  })
})
