import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
  type Placement
} from '@floating-ui/dom'
import {
  computed,
  onBeforeUnmount,
  shallowRef,
  watch,
  type CSSProperties,
  type Ref
} from 'vue'

export type PopupCollisionState = 'idle' | 'stable' | 'collision-aware'

interface UsePopupAnchoringOptions {
  reference: Ref<HTMLElement | SVGElement | null>
  floating: Ref<HTMLElement | null>
  placement?: Placement
}

function hasCollision(middlewareData: Record<string, unknown> | undefined) {
  if (!middlewareData) {
    return false
  }

  return Object.keys(middlewareData).some((key) => key === 'flip' || key === 'shift')
}

export function usePopupAnchoring(options: UsePopupAnchoringOptions) {
  const placement = shallowRef<Placement>(options.placement ?? 'top')
  const collisionState = shallowRef<PopupCollisionState>('idle')
  const availableHeight = shallowRef(0)
  const x = shallowRef(0)
  const y = shallowRef(0)
  let stopAutoUpdate: (() => void) | null = null

  const floatingStyles = computed<CSSProperties>(() => ({
    position: 'absolute',
    left: `${x.value}px`,
    top: `${y.value}px`
  }))

  async function updatePosition() {
    if (!options.reference.value || !options.floating.value) {
      return
    }

    const result = await computePosition(options.reference.value, options.floating.value, {
      placement: options.placement ?? 'top',
      strategy: 'absolute',
      middleware: [
        offset(12),
        flip({
          padding: 16,
          fallbackAxisSideDirection: 'end'
        }),
        shift({
          padding: 16
        }),
        size({
          padding: 16,
          apply({ availableWidth, availableHeight: nextAvailableHeight, elements }) {
            availableHeight.value = nextAvailableHeight
            Object.assign(elements.floating.style, {
              maxWidth: `${Math.max(280, Math.min(360, availableWidth))}px`,
              maxHeight: `${Math.max(0, nextAvailableHeight)}px`
            })
          }
        })
      ]
    })

    x.value = result.x
    y.value = result.y
    placement.value = result.placement
    collisionState.value = hasCollision(result.middlewareData) ? 'collision-aware' : 'stable'
  }

  function cleanup() {
    stopAutoUpdate?.()
    stopAutoUpdate = null
  }

  watch(
    [options.reference, options.floating],
    ([reference, floating]) => {
      cleanup()

      if (!reference || !floating) {
        collisionState.value = 'idle'
        availableHeight.value = 0
        return
      }

      stopAutoUpdate = autoUpdate(reference, floating, () => {
        void updatePosition()
      })
    },
    {
      immediate: true
    }
  )

  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    floatingStyles,
    placement,
    collisionState,
    availableHeight,
    updatePosition,
    cleanup
  }
}
