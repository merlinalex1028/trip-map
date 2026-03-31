import type { VirtualElement } from '@floating-ui/dom'
import L from 'leaflet'
import { computed, onBeforeUnmount, watch, type ComputedRef, type Ref, type ShallowRef } from 'vue'

interface UseLeafletPopupAnchorOptions {
  map: ShallowRef<L.Map | null>
  latlng: Ref<L.LatLng | null>
  onPositionUpdate: () => void
}

interface UseLeafletPopupAnchorReturn {
  virtualElement: ComputedRef<VirtualElement | null>
}

export function useLeafletPopupAnchor(
  options: UseLeafletPopupAnchorOptions,
): UseLeafletPopupAnchorReturn {
  const { map, latlng, onPositionUpdate } = options

  const virtualElement = computed<VirtualElement | null>(() => {
    const mapInstance = map.value
    const latLngValue = latlng.value

    if (!mapInstance || !latLngValue) {
      return null
    }

    return {
      getBoundingClientRect(): DOMRect {
        const point = mapInstance.latLngToContainerPoint(latLngValue)
        const containerRect = mapInstance.getContainer().getBoundingClientRect()
        const x = containerRect.left + point.x
        const y = containerRect.top + point.y

        return {
          width: 0,
          height: 0,
          x,
          y,
          left: x,
          right: x,
          top: y,
          bottom: y,
          toJSON: () => ({}),
        } as DOMRect
      },
    }
  })

  // Track current map instance to clean up old listeners
  let currentMapInstance: L.Map | null = null

  function cleanupMapListeners(): void {
    if (currentMapInstance) {
      currentMapInstance.off('move', onPositionUpdate)
      currentMapInstance.off('zoom', onPositionUpdate)
      currentMapInstance = null
    }
  }

  watch(map, (mapInstance) => {
    cleanupMapListeners()

    if (mapInstance) {
      currentMapInstance = mapInstance
      mapInstance.on('move', onPositionUpdate)
      mapInstance.on('zoom', onPositionUpdate)
    }
  }, { immediate: true })

  onBeforeUnmount(() => {
    cleanupMapListeners()
  })

  return { virtualElement }
}
