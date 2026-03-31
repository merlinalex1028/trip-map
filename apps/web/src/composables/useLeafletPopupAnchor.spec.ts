import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowRef } from 'vue'

vi.mock('leaflet', () => ({
  default: {},
}))

describe('useLeafletPopupAnchor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports useLeafletPopupAnchor function', async () => {
    const { useLeafletPopupAnchor } = await import('./useLeafletPopupAnchor')
    expect(useLeafletPopupAnchor).toBeTypeOf('function')
  })

  it('returns virtualElement', async () => {
    const { useLeafletPopupAnchor } = await import('./useLeafletPopupAnchor')

    const mapRef = shallowRef(null)
    const latlng = shallowRef(null)
    const onPositionUpdate = vi.fn()

    const result = useLeafletPopupAnchor({ map: mapRef, latlng, onPositionUpdate })
    expect(result).toHaveProperty('virtualElement')
  })

  it('virtualElement is null when map is null', async () => {
    const { useLeafletPopupAnchor } = await import('./useLeafletPopupAnchor')

    const mapRef = shallowRef(null)
    const latlng = shallowRef(null)
    const onPositionUpdate = vi.fn()

    const { virtualElement } = useLeafletPopupAnchor({ map: mapRef, latlng, onPositionUpdate })
    expect(virtualElement.value).toBeNull()
  })

  it('virtualElement.getBoundingClientRect uses latLngToContainerPoint when map and latlng are set', async () => {
    const { useLeafletPopupAnchor } = await import('./useLeafletPopupAnchor')

    const mockContainerRect = { left: 10, top: 20, width: 800, height: 600 }
    const mockPoint = { x: 100, y: 200 }

    const mockMap = {
      latLngToContainerPoint: vi.fn(() => mockPoint),
      getContainer: vi.fn(() => ({
        getBoundingClientRect: vi.fn(() => mockContainerRect),
      })),
      on: vi.fn(),
      off: vi.fn(),
    }

    const mockLatLng = { lat: 35.0, lng: 105.0 }

    const mapRef = shallowRef(mockMap as unknown as Parameters<typeof useLeafletPopupAnchor>[0]['map']['value'])
    const latlng = shallowRef(mockLatLng as unknown as Parameters<typeof useLeafletPopupAnchor>[0]['latlng']['value'])
    const onPositionUpdate = vi.fn()

    const { virtualElement } = useLeafletPopupAnchor({ map: mapRef, latlng, onPositionUpdate })

    expect(virtualElement.value).not.toBeNull()
    expect(virtualElement.value?.getBoundingClientRect).toBeTypeOf('function')

    const rect = virtualElement.value?.getBoundingClientRect()
    expect(mockMap.latLngToContainerPoint).toHaveBeenCalledWith(mockLatLng)

    // x = containerRect.left + point.x = 10 + 100 = 110
    expect(rect?.left).toBe(110)
    // y = containerRect.top + point.y = 20 + 200 = 220
    expect(rect?.top).toBe(220)
    expect(rect?.width).toBe(0)
    expect(rect?.height).toBe(0)
  })

  it('registers map move and zoom event listeners when map becomes available', async () => {
    const { useLeafletPopupAnchor } = await import('./useLeafletPopupAnchor')

    const mockMap = {
      latLngToContainerPoint: vi.fn(),
      getContainer: vi.fn(() => ({ getBoundingClientRect: vi.fn() })),
      on: vi.fn(),
      off: vi.fn(),
    }

    const mapRef = shallowRef(mockMap as unknown as Parameters<typeof useLeafletPopupAnchor>[0]['map']['value'])
    const latlng = shallowRef(null)
    const onPositionUpdate = vi.fn()

    useLeafletPopupAnchor({ map: mapRef, latlng, onPositionUpdate })

    // map.on should have been called with 'move' and 'zoom'
    expect(mockMap.on).toHaveBeenCalledWith('move', onPositionUpdate)
    expect(mockMap.on).toHaveBeenCalledWith('zoom', onPositionUpdate)
  })
})
