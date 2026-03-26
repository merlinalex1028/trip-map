import { nextTick, ref } from 'vue'

import { mountComposable } from '../test-utils/mountComposable'
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

  it('caps popup maxHeight to 60% of the map surface height', async () => {
    const reference = document.createElement('button')
    const surface = document.createElement('div')
    const floating = document.createElement('div')

    surface.appendChild(floating)
    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({
      width: 720,
      height: 500,
      top: 0,
      bottom: 500,
      left: 0,
      right: 720,
      x: 0,
      y: 0,
      toJSON: () => ({})
    })

    floatingUiMocks.computePosition.mockImplementation(async (_reference, _floating, options) => {
      const sizeMiddleware = options.middleware[3]
      sizeMiddleware.options.apply({
        availableWidth: 540,
        availableHeight: 420,
        elements: {
          floating
        }
      })

      return {
        x: 20,
        y: 24,
        placement: 'top',
        middlewareData: {}
      }
    })
    floatingUiMocks.autoUpdate.mockImplementation((_reference, _floating, update) => {
      void update()
      return vi.fn()
    })

    mountComposable(() =>
      usePopupAnchoring({
        reference: ref(reference),
        floating: ref(floating)
      })
    )

    await nextTick()

    expect(floating.style.maxHeight).toBe('300px')
  })
})
