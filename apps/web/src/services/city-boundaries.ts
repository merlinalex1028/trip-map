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

export const CANONICAL_BOUNDARY_ID_TO_RENDERABLE_ID: Record<string, string | null> = {
  'datav-cn-beijing': 'cn-beijing-municipality',
  'datav-cn-hong-kong': 'hk-hong-kong-island-cluster',
  'datav-cn-aba': null,
  'datav-cn-tianjin': null,
  'datav-cn-langfang': null,
  'ne-admin1-us-ca': null,
  'ne-admin1-us-california': null,
}

export function hasBoundaryCoverageForCityId(cityId: string): boolean {
  return boundaryIdByCityId.has(cityId)
}

export function resolveRenderableBoundaryId(boundaryId: string): string | null {
  if (boundaryId in CANONICAL_BOUNDARY_ID_TO_RENDERABLE_ID) {
    return CANONICAL_BOUNDARY_ID_TO_RENDERABLE_ID[boundaryId]
  }

  return boundaryId
}

export function hasBoundaryCoverageForBoundaryId(boundaryId: string | null | undefined): boolean {
  if (!boundaryId) {
    return false
  }

  const renderableBoundaryId = resolveRenderableBoundaryId(boundaryId)

  return renderableBoundaryId ? boundaryFeatureById.has(renderableBoundaryId) : false
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
  const renderableBoundaryId = resolveRenderableBoundaryId(boundaryId)

  if (!renderableBoundaryId) {
    return null
  }

  const feature = boundaryFeatureById.get(renderableBoundaryId)

  if (!feature) {
    return null
  }

  return normalizeBoundaryGeometry(feature.geometry, feature.properties)
}

export function getBoundaryByCityId(cityId: string): NormalizedCityBoundary | null {
  const boundaryId = boundaryIdByCityId.get(cityId)

  return boundaryId ? getBoundaryById(boundaryId) : null
}
