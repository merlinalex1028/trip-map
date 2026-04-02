import L from 'leaflet'
import { onBeforeUnmount, watch, type Ref, type ShallowRef } from 'vue'
import type { CityBoundaryFeature, CityBoundaryFeatureCollection } from '../types/geo'

interface StyleOptions {
  color?: string
  weight?: number
  fillColor?: string
  fillOpacity?: number
  opacity?: number
}

function buildStyleFunction(
  savedBoundaryIds: Ref<string[]>,
  selectedBoundaryId: Ref<string | null>,
) {
  return function styleFeature(feature: CityBoundaryFeature | undefined): StyleOptions {
    const boundaryId = feature?.properties?.boundaryId

    if (!boundaryId) {
      return { opacity: 0, fillOpacity: 0 }
    }

    if (boundaryId === selectedBoundaryId.value) {
      return {
        color: 'rgba(244, 143, 177, 0.96)',
        weight: 3.2,
        fillColor: 'rgba(244, 143, 177, 0.28)',
        fillOpacity: 0.28,
        opacity: 1,
      }
    }

    if (savedBoundaryIds.value.includes(boundaryId)) {
      return {
        color: 'rgba(132, 199, 216, 0.82)',
        weight: 2.4,
        fillColor: 'rgba(132, 199, 216, 0.24)',
        fillOpacity: 0.24,
        opacity: 1,
      }
    }

    return {
      color: 'rgba(94, 125, 145, 0.34)',
      weight: 1,
      fillColor: 'rgba(190, 216, 228, 0.12)',
      fillOpacity: 0.12,
      opacity: 0.7,
    }
  }
}

interface UseGeoJsonLayersOptions {
  map: ShallowRef<L.Map | null>
  savedBoundaryIds: Ref<string[]>
  selectedBoundaryId: Ref<string | null>
  onBoundaryClick: (boundaryId: string, latlng: L.LatLng) => void
}

interface UseGeoJsonLayersReturn {
  cnLayer: L.GeoJSON
  overseasLayer: L.GeoJSON
  addFeatures: (target: 'CN' | 'OVERSEAS', fc: CityBoundaryFeatureCollection) => void
  refreshStyles: () => void
}

export function useGeoJsonLayers(options: UseGeoJsonLayersOptions): UseGeoJsonLayersReturn {
  const { map, savedBoundaryIds, selectedBoundaryId, onBoundaryClick } = options

  const styleFunction = buildStyleFunction(savedBoundaryIds, selectedBoundaryId)

  function onEachFeature(feature: CityBoundaryFeature, layer: L.Layer): void {
    layer.on('click', (e: L.LeafletMouseEvent) => {
      if (!savedBoundaryIds.value.includes(feature.properties.boundaryId)) {
        return
      }

      L.DomEvent.stopPropagation(e)
      onBoundaryClick(feature.properties.boundaryId, e.latlng)
    })
  }

  const cnLayer = L.geoJSON(undefined, {
    style: styleFunction as (feature?: GeoJSON.Feature) => L.PathOptions,
    onEachFeature: onEachFeature as (feature: GeoJSON.Feature, layer: L.Layer) => void,
  })

  const overseasLayer = L.geoJSON(undefined, {
    style: styleFunction as (feature?: GeoJSON.Feature) => L.PathOptions,
    onEachFeature: onEachFeature as (feature: GeoJSON.Feature, layer: L.Layer) => void,
  })

  function addFeatures(target: 'CN' | 'OVERSEAS', fc: CityBoundaryFeatureCollection): void {
    if (target === 'CN') {
      cnLayer.addData(fc as unknown as GeoJSON.GeoJsonObject)
    } else {
      overseasLayer.addData(fc as unknown as GeoJSON.GeoJsonObject)
    }
  }

  function refreshStyles(): void {
    cnLayer.setStyle(styleFunction as (feature?: GeoJSON.Feature) => L.PathOptions)
    overseasLayer.setStyle(styleFunction as (feature?: GeoJSON.Feature) => L.PathOptions)
  }

  // When map becomes available, add layers to map
  watch(map, (mapInstance) => {
    if (mapInstance) {
      cnLayer.addTo(mapInstance)
      overseasLayer.addTo(mapInstance)
    }
  }, { immediate: true })

  // Watch for state changes and refresh styles
  watch(savedBoundaryIds, () => {
    refreshStyles()
  })

  watch(selectedBoundaryId, () => {
    refreshStyles()
  })

  onBeforeUnmount(() => {
    if (map.value) {
      map.value.removeLayer(cnLayer)
      map.value.removeLayer(overseasLayer)
    }
  })

  return { cnLayer, overseasLayer, addFeatures, refreshStyles }
}
