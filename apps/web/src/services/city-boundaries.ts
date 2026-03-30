import boundaryDataset from '../data/geo/city-boundaries.geo.json'
import { curatedCityIds } from '../data/geo/city-candidates'
import type {
  CityBoundaryFeature,
  CityBoundaryFeatureCollection,
  CityBoundaryGeometry,
  NormalizedCityBoundary
} from '../types/geo'

const cityBoundaryFeatures = (boundaryDataset as CityBoundaryFeatureCollection).features
const datasetVersions = new Set(cityBoundaryFeatures.map((feature) => feature.properties.datasetVersion))

if (datasetVersions.size !== 1) {
  throw new Error('City boundary dataset must use a single datasetVersion')
}

export const CITY_BOUNDARY_DATASET_VERSION = cityBoundaryFeatures[0]?.properties.datasetVersion ?? 'unknown'

const boundaryFeatureById = cityBoundaryFeatures.reduce<Map<string, CityBoundaryFeature>>((map, feature) => {
  map.set(feature.properties.boundaryId, feature)
  return map
}, new Map())

const boundaryIdByCityId = cityBoundaryFeatures.reduce<Map<string, string>>((map, feature) => {
  if (!map.has(feature.properties.cityId)) {
    map.set(feature.properties.cityId, feature.properties.boundaryId)
  }

  return map
}, new Map())

export function hasBoundaryCoverageForCityId(cityId: string): boolean {
  return boundaryIdByCityId.has(cityId)
}

export const curatedCitiesMissingBoundaryCoverage = curatedCityIds.filter(
  (cityId) => !hasBoundaryCoverageForCityId(cityId)
)

export const boundaryCoverageStats = {
  totalBoundaryFeatureCount: cityBoundaryFeatures.length,
  totalCuratedCityCount: curatedCityIds.length,
  coveredCuratedCityCount: curatedCityIds.length - curatedCitiesMissingBoundaryCoverage.length,
  missingCuratedCityCount: curatedCitiesMissingBoundaryCoverage.length
}

export function normalizeBoundaryGeometry(
  geometry: CityBoundaryGeometry,
  feature: Pick<CityBoundaryFeature['properties'], 'boundaryId' | 'cityId' | 'cityName' | 'datasetVersion'>
): NormalizedCityBoundary {
  return {
    boundaryId: feature.boundaryId,
    cityId: feature.cityId,
    cityName: feature.cityName,
    datasetVersion: feature.datasetVersion,
    polygons: geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  }
}

export function getBoundaryById(boundaryId: string): NormalizedCityBoundary | null {
  const feature = boundaryFeatureById.get(boundaryId)

  if (!feature) {
    return null
  }

  return normalizeBoundaryGeometry(feature.geometry, feature.properties)
}

export function getBoundaryByCityId(cityId: string): NormalizedCityBoundary | null {
  const boundaryId = boundaryIdByCityId.get(cityId)

  return boundaryId ? getBoundaryById(boundaryId) : null
}
