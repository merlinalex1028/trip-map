/**
 * geometry-loader.ts
 *
 * Shard-aware loader and in-memory cache for Phase 13 versioned geometry assets.
 *
 * Geometry assets are served from /geo/{geometryDatasetVersion}/{assetKey}
 * (under apps/web/public/geo/). The loader uses `geometryRef` fields from the
 * API response to construct the exact URL — it does NOT guess paths from
 * boundaryId, and does NOT request combined/all shards.
 *
 * Cache key: `${geometryDatasetVersion}:${assetKey}`
 * Cache value: the in-flight Promise, so concurrent callers for the same shard
 * wait on the same request rather than firing duplicates.
 */

import type { GeometryRef } from '@trip-map/contracts'
import type { CityBoundaryFeature, CityBoundaryFeatureCollection } from '../types/geo'

const shardCache = new Map<string, Promise<CityBoundaryFeatureCollection>>()

/**
 * Load a geometry shard by its versioned coordinates.
 * Fetches `/geo/${geometryDatasetVersion}/${assetKey}` and caches the result.
 * Throws an error containing the assetKey when fetch returns a non-2xx status.
 */
export async function loadGeometryShard(
  geometryDatasetVersion: string,
  assetKey: string,
): Promise<CityBoundaryFeatureCollection> {
  const cacheKey = `${geometryDatasetVersion}:${assetKey}`

  const cached = shardCache.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  const fetchPromise = (async (): Promise<CityBoundaryFeatureCollection> => {
    const url = `/geo/${geometryDatasetVersion}/${assetKey}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `Failed to load geometry shard "${assetKey}" (status ${response.status}). ` +
        `URL: ${url}`,
      )
    }

    return response.json() as Promise<CityBoundaryFeatureCollection>
  })()

  shardCache.set(cacheKey, fetchPromise)
  return fetchPromise
}

/**
 * Load the specific GeoJSON feature identified by a `GeometryRef`.
 *
 * Resolution order:
 * 1. Load the shard using `geometryRef.geometryDatasetVersion` and `geometryRef.assetKey`
 * 2. Find the feature whose `properties.renderableId` (or `properties.boundaryId`) matches
 *    `geometryRef.renderableId ?? geometryRef.boundaryId`
 * 3. Return the feature, or `null` if not found in the shard.
 */
export async function loadGeometryFeatureByRef(
  geometryRef: GeometryRef,
): Promise<CityBoundaryFeature | null> {
  const shard = await loadGeometryShard(
    geometryRef.geometryDatasetVersion,
    geometryRef.assetKey,
  )

  const lookupId = geometryRef.renderableId ?? geometryRef.boundaryId

  const feature = shard.features.find(
    (f) => f.properties.renderableId === lookupId || f.properties.boundaryId === lookupId,
  )

  return feature ?? null
}

/**
 * Clear the in-memory shard cache.
 * For use in tests only — do not call in production code.
 */
export function clearGeometryShardCacheForTest(): void {
  shardCache.clear()
}
