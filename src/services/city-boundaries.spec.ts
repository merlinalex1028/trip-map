import {
  CITY_BOUNDARY_DATASET_VERSION,
  getBoundaryById,
  getBoundaryByCityId
} from './city-boundaries'

describe('city-boundaries service', () => {
  it('loads an offline boundary by exact boundaryId', () => {
    const boundary = getBoundaryById('eg-cairo-governorate')

    expect(boundary).toEqual(
      expect.objectContaining({
        boundaryId: 'eg-cairo-governorate',
        cityId: 'eg-cairo',
        cityName: 'Cairo',
        datasetVersion: CITY_BOUNDARY_DATASET_VERSION
      })
    )
  })

  it('resolves a boundary by exact cityId when boundaryId is unavailable', () => {
    const boundary = getBoundaryByCityId('jp-kyoto')

    expect(boundary).toEqual(
      expect.objectContaining({
        boundaryId: 'jp-kyoto-city',
        cityId: 'jp-kyoto',
        cityName: 'Kyoto'
      })
    )
  })

  it('normalizes Polygon and MultiPolygon geometries into grouped render rings', () => {
    const polygonBoundary = getBoundaryById('pt-lisbon-municipality')
    const multiPolygonBoundary = getBoundaryById('jp-tokyo-metropolis')

    expect(polygonBoundary?.polygons).toHaveLength(1)
    expect(multiPolygonBoundary?.polygons.length).toBeGreaterThan(1)
    expect(multiPolygonBoundary).toEqual(
      expect.objectContaining({
        boundaryId: 'jp-tokyo-metropolis',
        cityId: 'jp-tokyo',
        datasetVersion: CITY_BOUNDARY_DATASET_VERSION
      })
    )
  })
})
