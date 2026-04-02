import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowRef } from 'vue'
import type { CityBoundaryFeatureCollection } from '../types/geo'

const mockGeoJsonLayer = {
  addTo: vi.fn().mockReturnThis(),
  addData: vi.fn(),
  setStyle: vi.fn(),
  eachLayer: vi.fn(),
  remove: vi.fn(),
  on: vi.fn(),
}

const mockGeoJsonLayer2 = {
  addTo: vi.fn().mockReturnThis(),
  addData: vi.fn(),
  setStyle: vi.fn(),
  eachLayer: vi.fn(),
  remove: vi.fn(),
  on: vi.fn(),
}

let geoJsonCallCount = 0

vi.mock('leaflet', () => ({
  default: {
    geoJSON: vi.fn(() => {
      geoJsonCallCount++
      return geoJsonCallCount === 1 ? mockGeoJsonLayer : mockGeoJsonLayer2
    }),
    DomEvent: {
      stopPropagation: vi.fn(),
    },
  },
}))

const mockFeatureCollection: CityBoundaryFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        boundaryId: 'CN-test-001',
        renderableId: 'CN-test-001',
        cityId: 'city-001',
        cityName: 'Test City',
        datasetVersion: '2026-03-31-geo-v1',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[100, 30], [101, 30], [101, 31], [100, 31], [100, 30]]],
      },
    },
  ],
}

describe('useGeoJsonLayers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    geoJsonCallCount = 0
    mockGeoJsonLayer.addTo.mockReturnThis()
    mockGeoJsonLayer2.addTo.mockReturnThis()
  })

  it('exports useGeoJsonLayers function', async () => {
    const { useGeoJsonLayers } = await import('./useGeoJsonLayers')
    expect(useGeoJsonLayers).toBeTypeOf('function')
  })

  it('creates two separate L.geoJSON calls (CN and OVERSEAS layers — GEOX-05)', async () => {
    const L = (await import('leaflet')).default
    const { useGeoJsonLayers } = await import('./useGeoJsonLayers')

    const mapRef = shallowRef(null)
    const savedBoundaryIds = shallowRef<string[]>([])
    const selectedBoundaryId = shallowRef<string | null>(null)
    const onBoundaryClick = vi.fn()

    useGeoJsonLayers({ map: mapRef, savedBoundaryIds, selectedBoundaryId, onBoundaryClick })

    // Two separate L.geoJSON calls — one for CN, one for OVERSEAS
    expect(L.geoJSON).toHaveBeenCalledTimes(2)
  })

  it('returns addFeatures function', async () => {
    const { useGeoJsonLayers } = await import('./useGeoJsonLayers')

    const mapRef = shallowRef(null)
    const savedBoundaryIds = shallowRef<string[]>([])
    const selectedBoundaryId = shallowRef<string | null>(null)
    const onBoundaryClick = vi.fn()

    const result = useGeoJsonLayers({ map: mapRef, savedBoundaryIds, selectedBoundaryId, onBoundaryClick })
    expect(result.addFeatures).toBeTypeOf('function')
  })

  it('addFeatures CN adds data to cnLayer', async () => {
    const { useGeoJsonLayers } = await import('./useGeoJsonLayers')

    const mapRef = shallowRef(null)
    const savedBoundaryIds = shallowRef<string[]>([])
    const selectedBoundaryId = shallowRef<string | null>(null)
    const onBoundaryClick = vi.fn()

    const { addFeatures } = useGeoJsonLayers({ map: mapRef, savedBoundaryIds, selectedBoundaryId, onBoundaryClick })
    addFeatures('CN', mockFeatureCollection)

    expect(mockGeoJsonLayer.addData).toHaveBeenCalledWith(mockFeatureCollection)
  })

  it('addFeatures OVERSEAS adds data to overseasLayer', async () => {
    const { useGeoJsonLayers } = await import('./useGeoJsonLayers')

    const mapRef = shallowRef(null)
    const savedBoundaryIds = shallowRef<string[]>([])
    const selectedBoundaryId = shallowRef<string | null>(null)
    const onBoundaryClick = vi.fn()

    const { addFeatures } = useGeoJsonLayers({ map: mapRef, savedBoundaryIds, selectedBoundaryId, onBoundaryClick })
    addFeatures('OVERSEAS', mockFeatureCollection)

    expect(mockGeoJsonLayer2.addData).toHaveBeenCalledWith(mockFeatureCollection)
  })

  it('style function returns selected state for selectedBoundaryId match', async () => {
    // Test style function colors by verifying the composable contains proper color values
    // by checking L.geoJSON was called with a style option
    const L = (await import('leaflet')).default
    const { useGeoJsonLayers } = await import('./useGeoJsonLayers')

    const mapRef = shallowRef(null)
    const savedBoundaryIds = shallowRef<string[]>([])
    const selectedBoundaryId = shallowRef<string | null>('CN-test-001')
    const onBoundaryClick = vi.fn()

    useGeoJsonLayers({ map: mapRef, savedBoundaryIds, selectedBoundaryId, onBoundaryClick })

    // geoJSON should have been called with style option
    const [firstCallArgs] = (L.geoJSON as ReturnType<typeof vi.fn>).mock.calls
    expect(firstCallArgs[1]).toHaveProperty('style')
    expect(firstCallArgs[1]).toHaveProperty('onEachFeature')

    // Test the style function with a selected feature
    const styleFunc = firstCallArgs[1].style
    const styleResult = styleFunc({ properties: { boundaryId: 'CN-test-001' } })
    expect(styleResult.color).toBe('rgba(244, 143, 177, 0.96)')
    expect(styleResult.weight).toBe(3.2)
  })

  it('style function returns saved state for savedBoundaryIds match', async () => {
    const L = (await import('leaflet')).default
    const { useGeoJsonLayers } = await import('./useGeoJsonLayers')

    const mapRef = shallowRef(null)
    const savedBoundaryIds = shallowRef<string[]>(['CN-saved-001'])
    const selectedBoundaryId = shallowRef<string | null>(null)
    const onBoundaryClick = vi.fn()

    useGeoJsonLayers({ map: mapRef, savedBoundaryIds, selectedBoundaryId, onBoundaryClick })

    const [firstCallArgs] = (L.geoJSON as ReturnType<typeof vi.fn>).mock.calls
    const styleFunc = firstCallArgs[1].style
    const styleResult = styleFunc({ properties: { boundaryId: 'CN-saved-001' } })
    expect(styleResult.color).toBe('rgba(132, 199, 216, 0.82)')
    expect(styleResult.weight).toBe(2.4)
  })

  it('style function returns baseline layer styling for unknown boundaryId', async () => {
    const L = (await import('leaflet')).default
    const { useGeoJsonLayers } = await import('./useGeoJsonLayers')

    const mapRef = shallowRef(null)
    const savedBoundaryIds = shallowRef<string[]>([])
    const selectedBoundaryId = shallowRef<string | null>(null)
    const onBoundaryClick = vi.fn()

    useGeoJsonLayers({ map: mapRef, savedBoundaryIds, selectedBoundaryId, onBoundaryClick })

    const [firstCallArgs] = (L.geoJSON as ReturnType<typeof vi.fn>).mock.calls
    const styleFunc = firstCallArgs[1].style
    const styleResult = styleFunc({ properties: { boundaryId: 'CN-unknown' } })
    expect(styleResult.opacity).toBe(0.7)
    expect(styleResult.fillOpacity).toBe(0.12)
    expect(styleResult.weight).toBe(1)
  })
})
