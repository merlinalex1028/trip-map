import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GeometryRef } from '@trip-map/contracts'
import type { CityBoundaryFeatureCollection } from '../types/geo'
import {
  clearGeometryShardCacheForTest,
  loadGeometryFeatureByRef,
  loadGeometryShard,
} from './geometry-loader'

const BEIJING_GEOMETRY_REF: GeometryRef = {
  boundaryId: 'datav-cn-beijing',
  layer: 'CN',
  geometryDatasetVersion: '2026-03-31-geo-v1',
  assetKey: 'cn/beijing.json',
  renderableId: 'datav-cn-beijing',
}

const CALIFORNIA_GEOMETRY_REF: GeometryRef = {
  boundaryId: 'ne-admin1-us-california',
  layer: 'OVERSEAS',
  geometryDatasetVersion: '2026-03-31-geo-v1',
  assetKey: 'overseas/us.json',
  renderableId: 'ne-admin1-us-california',
}

function makeFeatureCollection(renderableId: string): CityBoundaryFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          boundaryId: renderableId,
          renderableId,
          cityId: renderableId,
          cityName: renderableId,
          datasetVersion: '2026-03-31-geo-v1',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[[116.0, 39.0], [117.0, 39.0], [117.0, 40.0], [116.0, 39.0]]],
        },
      },
    ],
  }
}

describe('geometry-loader', () => {
  beforeEach(() => {
    clearGeometryShardCacheForTest()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    clearGeometryShardCacheForTest()
  })

  describe('loadGeometryShard', () => {
    it('requests /geo/2026-03-31-geo-v1/cn/beijing.json for Beijing geometryRef', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(makeFeatureCollection('datav-cn-beijing')),
      })
      vi.stubGlobal('fetch', mockFetch)

      await loadGeometryShard('2026-03-31-geo-v1', 'cn/beijing.json')

      expect(mockFetch).toHaveBeenCalledWith('/geo/2026-03-31-geo-v1/cn/beijing.json')
    })

    it('requests /geo/2026-03-31-geo-v1/overseas/us.json for California geometryRef', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(makeFeatureCollection('ne-admin1-us-california')),
      })
      vi.stubGlobal('fetch', mockFetch)

      await loadGeometryShard('2026-03-31-geo-v1', 'overseas/us.json')

      expect(mockFetch).toHaveBeenCalledWith('/geo/2026-03-31-geo-v1/overseas/us.json')
    })

    it('only fetches once for the same assetKey on repeated requests', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(makeFeatureCollection('datav-cn-beijing')),
      })
      vi.stubGlobal('fetch', mockFetch)

      await loadGeometryShard('2026-03-31-geo-v1', 'cn/beijing.json')
      await loadGeometryShard('2026-03-31-geo-v1', 'cn/beijing.json')

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('uses separate cache entries for different assetKeys in the same version', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(makeFeatureCollection('datav-cn-beijing')),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(makeFeatureCollection('ne-admin1-us-california')),
        })
      vi.stubGlobal('fetch', mockFetch)

      await loadGeometryShard('2026-03-31-geo-v1', 'cn/beijing.json')
      await loadGeometryShard('2026-03-31-geo-v1', 'overseas/us.json')

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('throws an error containing the assetKey when fetch returns non-2xx', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      })
      vi.stubGlobal('fetch', mockFetch)

      await expect(loadGeometryShard('2026-03-31-geo-v1', 'cn/beijing.json')).rejects.toThrow(
        'cn/beijing.json',
      )
    })
  })

  describe('loadGeometryFeatureByRef', () => {
    it('returns the matching feature using renderableId for Beijing', async () => {
      const fc = makeFeatureCollection('datav-cn-beijing')
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(fc),
      })
      vi.stubGlobal('fetch', mockFetch)

      const feature = await loadGeometryFeatureByRef(BEIJING_GEOMETRY_REF)

      expect(feature).not.toBeNull()
      expect(feature?.properties.renderableId).toBe('datav-cn-beijing')
    })

    it('returns the matching feature using renderableId for California', async () => {
      const fc = makeFeatureCollection('ne-admin1-us-california')
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(fc),
      })
      vi.stubGlobal('fetch', mockFetch)

      const feature = await loadGeometryFeatureByRef(CALIFORNIA_GEOMETRY_REF)

      expect(feature).not.toBeNull()
      expect(feature?.properties.renderableId).toBe('ne-admin1-us-california')
    })

    it('returns null when the shard loads but the renderableId is not found', async () => {
      const fc = makeFeatureCollection('some-other-id')
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(fc),
      })
      vi.stubGlobal('fetch', mockFetch)

      const feature = await loadGeometryFeatureByRef(BEIJING_GEOMETRY_REF)

      expect(feature).toBeNull()
    })

    it('falls back to boundaryId lookup when renderableId is null', async () => {
      const refWithNullRenderableId: GeometryRef = {
        ...BEIJING_GEOMETRY_REF,
        renderableId: null,
      }
      const fc = makeFeatureCollection('datav-cn-beijing')
      // Make the feature have boundaryId matching
      fc.features[0].properties.renderableId = 'datav-cn-beijing'
      fc.features[0].properties.boundaryId = 'datav-cn-beijing'

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(fc),
      })
      vi.stubGlobal('fetch', mockFetch)

      const feature = await loadGeometryFeatureByRef(refWithNullRenderableId)

      expect(feature).not.toBeNull()
    })
  })
})
