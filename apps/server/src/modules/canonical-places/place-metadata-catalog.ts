import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { CanonicalPlaceSummary, GeometryManifestEntry } from '@trip-map/contracts'
import { GEOMETRY_MANIFEST } from '@trip-map/contracts'

type GeoJsonPosition = [number, number]

interface GeoJsonPolygonGeometry {
  type: 'Polygon'
  coordinates: GeoJsonPosition[][]
}

interface GeoJsonMultiPolygonGeometry {
  type: 'MultiPolygon'
  coordinates: GeoJsonPosition[][][]
}

interface CanonicalFeatureProperties {
  boundaryId?: string
  renderableId?: string
  placeId?: string
  displayName?: string
  placeKind?: CanonicalPlaceSummary['placeKind']
  datasetVersion?: string
  regionSystem?: CanonicalPlaceSummary['regionSystem']
  adminType?: CanonicalPlaceSummary['adminType']
  typeLabel?: string
  parentLabel?: string
  subtitle?: string
}

interface GeometryFeature {
  type: 'Feature'
  properties: CanonicalFeatureProperties
  geometry: GeoJsonPolygonGeometry | GeoJsonMultiPolygonGeometry
}

interface GeometryFeatureCollection {
  type: 'FeatureCollection'
  features: GeometryFeature[]
}

interface CachedGeometryShard {
  lookupById: ReadonlyMap<string, GeometryFeature>
}

export interface CanonicalMetadataLookup {
  byPlaceId: ReadonlyMap<string, CanonicalPlaceSummary>
  byBoundaryId: ReadonlyMap<string, CanonicalPlaceSummary>
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..', '..')
const GEOMETRY_ROOT = resolve(REPO_ROOT, 'apps', 'web', 'public', 'geo')

function loadGeometryShardFile(shardPath: string): GeometryFeatureCollection {
  return JSON.parse(readFileSync(shardPath, 'utf-8')) as GeometryFeatureCollection
}

function buildGeometryShardLookup(
  shardPath: string,
  featureCollection: GeometryFeatureCollection,
): ReadonlyMap<string, GeometryFeature> {
  const lookupById = new Map<string, GeometryFeature>()

  for (const feature of featureCollection.features) {
    const lookupIds = new Set(
      [feature.properties.renderableId, feature.properties.boundaryId]
        .filter((value): value is string => Boolean(value)),
    )

    for (const lookupId of lookupIds) {
      const existingFeature = lookupById.get(lookupId)

      if (existingFeature && existingFeature !== feature) {
        throw new Error(`Duplicate canonical lookupId "${lookupId}" in shard "${shardPath}".`)
      }

      lookupById.set(lookupId, feature)
    }
  }

  return lookupById
}

function isSameCanonicalPlaceSummary(
  left: CanonicalPlaceSummary,
  right: CanonicalPlaceSummary,
): boolean {
  return left.placeId === right.placeId
    && left.boundaryId === right.boundaryId
    && left.placeKind === right.placeKind
    && left.datasetVersion === right.datasetVersion
    && left.displayName === right.displayName
    && left.regionSystem === right.regionSystem
    && left.adminType === right.adminType
    && left.typeLabel === right.typeLabel
    && left.parentLabel === right.parentLabel
    && left.subtitle === right.subtitle
}

function setCanonicalSummary(
  targetMap: Map<string, CanonicalPlaceSummary>,
  identityType: 'placeId' | 'boundaryId',
  identityValue: string,
  summary: CanonicalPlaceSummary,
): void {
  const existingSummary = targetMap.get(identityValue)

  if (existingSummary && !isSameCanonicalPlaceSummary(existingSummary, summary)) {
    if (identityType === 'placeId') {
      throw new Error(`Duplicate canonical placeId "${identityValue}".`)
    }

    throw new Error(`Duplicate canonical boundaryId "${identityValue}".`)
  }

  if (!existingSummary) {
    targetMap.set(identityValue, summary)
  }
}

function createCanonicalPlaceSummary(
  entry: GeometryManifestEntry,
  feature: GeometryFeature,
): CanonicalPlaceSummary {
  const props = feature.properties

  if (
    !props.placeId
    || !props.displayName
    || !props.placeKind
    || !props.datasetVersion
    || !props.regionSystem
    || !props.adminType
    || !props.typeLabel
    || !props.parentLabel
    || !props.subtitle
  ) {
    throw new Error(
      `Feature "${entry.boundaryId}" is missing canonical place metadata in geometry shard "${entry.assetKey}".`,
    )
  }

  return {
    placeId: props.placeId,
    boundaryId: entry.boundaryId,
    placeKind: props.placeKind,
    datasetVersion: props.datasetVersion,
    displayName: props.displayName,
    regionSystem: props.regionSystem,
    adminType: props.adminType,
    typeLabel: props.typeLabel,
    parentLabel: props.parentLabel,
    subtitle: props.subtitle,
  }
}

export function buildCanonicalMetadataLookup(): CanonicalMetadataLookup {
  const byPlaceId = new Map<string, CanonicalPlaceSummary>()
  const byBoundaryId = new Map<string, CanonicalPlaceSummary>()
  const shardCache = new Map<string, CachedGeometryShard>()

  for (const entry of GEOMETRY_MANIFEST) {
    const shardPath = resolve(
      GEOMETRY_ROOT,
      entry.geometryDatasetVersion,
      entry.assetKey,
    )
    let cachedShard = shardCache.get(shardPath)

    if (!cachedShard) {
      const featureCollection = loadGeometryShardFile(shardPath)
      cachedShard = {
        lookupById: buildGeometryShardLookup(shardPath, featureCollection),
      }
      shardCache.set(shardPath, cachedShard)
    }

    const lookupId = entry.renderableId ?? entry.boundaryId
    const feature = cachedShard.lookupById.get(lookupId)

    if (!feature) {
      throw new Error(
        `No geometry feature found for lookupId "${lookupId}" in shard "${shardPath}".`,
      )
    }

    const summary = createCanonicalPlaceSummary(entry, feature)
    setCanonicalSummary(byPlaceId, 'placeId', summary.placeId, summary)
    setCanonicalSummary(byBoundaryId, 'boundaryId', summary.boundaryId, summary)
  }

  return {
    byPlaceId,
    byBoundaryId,
  }
}

const canonicalMetadataLookup = buildCanonicalMetadataLookup()

export function getCanonicalPlaceSummaryById(placeId: string): CanonicalPlaceSummary | null {
  return canonicalMetadataLookup.byPlaceId.get(placeId) ?? null
}

export function getCanonicalPlaceSummaryByBoundaryId(boundaryId: string): CanonicalPlaceSummary | null {
  return canonicalMetadataLookup.byBoundaryId.get(boundaryId) ?? null
}
