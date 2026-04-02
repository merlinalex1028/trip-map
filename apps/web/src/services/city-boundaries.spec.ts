import {
  boundaryCoverageStats,
  CITY_BOUNDARY_DATASET_VERSION,
  curatedCitiesMissingBoundaryCoverage,
  getBoundaryById,
  getBoundaryByCityId,
  hasBoundaryCoverageForBoundaryId,
  hasBoundaryCoverageForCityId
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

  it('audits curated-city boundary coverage so shrinkage is visible in CI', () => {
    expect(boundaryCoverageStats.coveredCuratedCityCount).toBe(43)
    expect(boundaryCoverageStats.missingCuratedCityCount).toBe(0)
    expect(curatedCitiesMissingBoundaryCoverage).toEqual([])
  })

  it('resolves expanded boundary coverage for key curated and sparse-country cities', () => {
    expect(hasBoundaryCoverageForCityId('hu-budapest')).toBe(true)
    expect(hasBoundaryCoverageForCityId('ke-nairobi')).toBe(true)
    expect(hasBoundaryCoverageForCityId('jp-osaka')).toBe(true)
    expect(hasBoundaryCoverageForCityId('pt-porto')).toBe(true)
    expect(hasBoundaryCoverageForCityId('us-new-york')).toBe(true)

    expect(getBoundaryByCityId('hu-budapest')).toEqual(
      expect.objectContaining({
        cityId: 'hu-budapest',
        cityName: 'Budapest',
        datasetVersion: CITY_BOUNDARY_DATASET_VERSION
      })
    )
    expect(getBoundaryByCityId('ke-nairobi')).toEqual(
      expect.objectContaining({
        cityId: 'ke-nairobi',
        cityName: 'Nairobi',
        datasetVersion: CITY_BOUNDARY_DATASET_VERSION
      })
    )
    expect(getBoundaryByCityId('jp-osaka')).toEqual(
      expect.objectContaining({
        cityId: 'jp-osaka',
        cityName: 'Osaka',
        datasetVersion: CITY_BOUNDARY_DATASET_VERSION
      })
    )
    expect(getBoundaryByCityId('pt-porto')).toEqual(
      expect.objectContaining({
        cityId: 'pt-porto',
        cityName: 'Porto',
        datasetVersion: CITY_BOUNDARY_DATASET_VERSION
      })
    )
    expect(getBoundaryByCityId('us-new-york')).toEqual(
      expect.objectContaining({
        cityId: 'us-new-york',
        cityName: 'New York',
        datasetVersion: CITY_BOUNDARY_DATASET_VERSION
      })
    )
  })

  it('keeps shipped boundary ids stable for persisted restore flows', () => {
    expect(getBoundaryByCityId('pt-lisbon')?.boundaryId).toBe('pt-lisbon-municipality')
    expect(getBoundaryByCityId('eg-cairo')?.boundaryId).toBe('eg-cairo-governorate')
    expect(getBoundaryByCityId('jp-kyoto')?.boundaryId).toBe('jp-kyoto-city')
    expect(getBoundaryByCityId('jp-tokyo')?.boundaryId).toBe('jp-tokyo-metropolis')
    expect(getBoundaryByCityId('fr-paris')?.boundaryId).toBe('fr-paris-commune')
    expect(getBoundaryByCityId('ar-buenos-aires')?.boundaryId).toBe('ar-buenos-aires-autonomous-city')
  })

  it('maps canonical boundary ids to renderable web boundary ids when geometry exists', () => {
    expect(getBoundaryById('datav-cn-beijing')).toEqual(
      expect.objectContaining({
        boundaryId: 'cn-beijing-municipality',
        cityId: 'cn-beijing',
      }),
    )
    expect(getBoundaryById('datav-cn-hong-kong')).toEqual(
      expect.objectContaining({
        boundaryId: 'hk-hong-kong-island-cluster',
        cityId: 'hk-hong-kong',
      }),
    )
  })

  it('returns null for canonical boundary ids without renderable geometry coverage', () => {
    expect(getBoundaryById('datav-cn-aba')).toBeNull()
    expect(getBoundaryById('datav-cn-tianjin')).toBeNull()
    expect(getBoundaryById('ne-admin1-us-california')).toBeNull()
  })

  it('treats authoritative geometry manifest entries as boundary coverage even without legacy offline city-boundaries mapping', () => {
    expect(hasBoundaryCoverageForBoundaryId('datav-cn-440100')).toBe(true)
    expect(hasBoundaryCoverageForBoundaryId('ne-admin1-us-california')).toBe(true)
  })
})
