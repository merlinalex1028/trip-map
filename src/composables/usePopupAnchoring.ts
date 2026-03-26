import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
  type Placement,
  type VirtualElement
} from '@floating-ui/dom'
import {
  computed,
  onBeforeUnmount,
  shallowRef,
  toValue,
  watch,
  type CSSProperties,
  type MaybeRefOrGetter
} from 'vue'

export type PopupCollisionState = 'idle' | 'stable' | 'collision-aware' | 'unsafe'

interface UsePopupAnchoringOptions {
  reference: MaybeRefOrGetter<Element | VirtualElement | null>
  floating: MaybeRefOrGetter<HTMLElement | null>
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
    const reference = toValue(options.reference)
    const floating = toValue(options.floating)

    if (!reference || !floating) {
      return
    }

    const result = await computePosition(reference, floating, {
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
    collisionState.value =
      availableHeight.value <= 0
        ? 'unsafe'
        : hasCollision(result.middlewareData)
          ? 'collision-aware'
          : 'stable'
  }

  function cleanup() {
    stopAutoUpdate?.()
    stopAutoUpdate = null
  }

  watch(
    [() => toValue(options.reference), () => toValue(options.floating)],
    ([reference, floating]) => {
      cleanup()

      if (!reference || !floating) {
        collisionState.value = 'idle'
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
