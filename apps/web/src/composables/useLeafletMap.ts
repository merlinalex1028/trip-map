import L from 'leaflet'
import { onBeforeUnmount, onMounted, shallowRef, type Ref, type ShallowRef } from 'vue'

async function createBingTileLayer(apiKey: string): Promise<L.TileLayer> {
  const metaUrl =
    `https://dev.virtualearth.net/REST/V1/Imagery/Metadata/CanvasLight?output=json&uriScheme=https&culture=zh-CN&key=${apiKey}`
  const resp = await fetch(metaUrl)

  if (!resp.ok) {
    throw new Error(`Bing Maps metadata request failed with status ${resp.status}`)
  }

  const data = await resp.json() as {
    resourceSets: Array<{
      resources: Array<{
        imageUrl: string
        imageUrlSubdomains: string[]
      }>
    }>
  }

  const resource = data.resourceSets[0]?.resources[0]
  if (!resource) {
    throw new Error('Bing Maps metadata response missing resource data')
  }

  const urlTemplate = resource.imageUrl
    .replace('{subdomain}', '{s}')
    .replace('{zoom}', '{z}')
    .replace('{x}', '{x}')
    .replace('{y}', '{y}')

  return L.tileLayer(urlTemplate, {
    subdomains: resource.imageUrlSubdomains,
    attribution: '\u00a9 Microsoft Bing Maps',
    maxZoom: 19,
  })
}

function createFallbackTileLayer(): L.TileLayer {
  return L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution: '\u00a9 OpenStreetMap contributors \u00a9 CARTO',
      maxZoom: 19,
      subdomains: 'abcd',
    },
  )
}

async function addTileLayer(map: L.Map): Promise<void> {
  const bingKey = import.meta.env.VITE_BING_MAPS_KEY as string | undefined

  if (bingKey) {
    try {
      const tileLayer = await createBingTileLayer(bingKey)
      tileLayer.addTo(map)
      return
    } catch {
      // Fall through to CartoDB fallback
    }
  }

  createFallbackTileLayer().addTo(map)
}

interface UseLeafletMapReturn {
  map: ShallowRef<L.Map | null>
  isReady: ShallowRef<boolean>
}

export function useLeafletMap(containerRef: Ref<HTMLElement | null>): UseLeafletMapReturn {
  const map = shallowRef<L.Map | null>(null)
  const isReady = shallowRef(false)
  let resizeObserver: ResizeObserver | null = null

  onMounted(async () => {
    if (!containerRef.value) return

    const instance = L.map(containerRef.value, {
      center: [35.0, 105.0],
      zoom: 4,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: true,
    })

    map.value = instance

    await addTileLayer(instance)
    isReady.value = true

    resizeObserver = new ResizeObserver(() => {
      map.value?.invalidateSize()
    })

    resizeObserver.observe(containerRef.value)
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
    map.value?.remove()
    map.value = null
    isReady.value = false
  })

  return { map, isReady }
}
