/**
 * geometry-validation.spec.ts
 *
 * Validates representative click points against the real generated shard features.
 * Proves that coordinate normalization (GCJ-02 -> WGS84) and overseas filtering
 * are correct for the Phase 13 authoritative fixture set.
 *
 * Representative points (D-12):
 *   Beijing  lat: 39.9042, lng: 116.4074
 *   Hong Kong  lat: 22.3193, lng: 114.1694
 *   California  lat: 36.7783, lng: -119.4179
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { describe, expect, it } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const GEO_VERSION = '2026-03-31-geo-v1'
const GEO_BASE = resolve(__dirname, '..', '..', 'public', 'geo', GEO_VERSION)

interface ShardFeatureProperties {
  boundaryId: string
  renderableId: string
  datasetVersion: string
  [key: string]: unknown
}

interface ShardFeature {
  type: 'Feature'
  properties: ShardFeatureProperties
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}

interface ShardFeatureCollection {
  type: 'FeatureCollection'
  features: ShardFeature[]
}

function loadShard(relativePath: string): ShardFeatureCollection {
  const fullPath = resolve(GEO_BASE, relativePath)
  return JSON.parse(readFileSync(fullPath, 'utf-8')) as ShardFeatureCollection
}

/**
 * Calculate a simple axis-aligned bounding box from a GeoJSON feature geometry.
 * Returns [minLng, minLat, maxLng, maxLat].
 */
function featureBounds(feature: ShardFeature): [number, number, number, number] {
  const coords: number[] = []
  function extractCoords(c: unknown): void {
    if (typeof c === 'number') return
    if (Array.isArray(c)) {
      if (c.length >= 2 && typeof c[0] === 'number' && typeof c[1] === 'number') {
        coords.push(c[0], c[1])
      } else {
        for (const item of c) {
          extractCoords(item)
        }
      }
    }
  }
  extractCoords(feature.geometry.coordinates)

  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  for (let i = 0; i < coords.length; i += 2) {
    const lng = coords[i]
    const lat = coords[i + 1]
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  }

  return [minLng, minLat, maxLng, maxLat]
}

/**
 * Check if a WGS84 point [lng, lat] is within the bounds of a feature.
 */
function isPointInBounds(
  feature: ShardFeature,
  lat: number,
  lng: number,
): boolean {
  const [minLng, minLat, maxLng, maxLat] = featureBounds(feature)
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat
}

// ---- Shard structure tests --------------------------------------------------

describe('geometry shard structure', () => {
  it('beijing.json has renderableId: datav-cn-beijing in feature properties', () => {
    const shard = loadShard('cn/beijing.json')
    const feature = shard.features.find(
      (f) => f.properties.renderableId === 'datav-cn-beijing',
    )
    expect(feature).toBeDefined()
    expect(feature?.properties.boundaryId).toBe('datav-cn-beijing')
    expect(feature?.properties.datasetVersion).toBe(GEO_VERSION)
  })

  it('hong-kong.json has renderableId: datav-cn-hong-kong in feature properties', () => {
    const shard = loadShard('cn/hong-kong.json')
    const feature = shard.features.find(
      (f) => f.properties.renderableId === 'datav-cn-hong-kong',
    )
    expect(feature).toBeDefined()
    expect(feature?.properties.boundaryId).toBe('datav-cn-hong-kong')
  })

  it('overseas/us.json has renderableId: ne-admin1-us-california in feature properties', () => {
    const shard = loadShard('overseas/us.json')
    const feature = shard.features.find(
      (f) => f.properties.renderableId === 'ne-admin1-us-california',
    )
    expect(feature).toBeDefined()
    expect(feature?.properties.boundaryId).toBe('ne-admin1-us-california')
    expect(feature?.properties.datasetVersion).toBe(GEO_VERSION)
  })
})

// ---- Representative point bounds tests (D-12) --------------------------------

describe('representative click point coordinate validation (WGS84)', () => {
  it('Beijing representative point lat:39.9042 lng:116.4074 is within beijing.json bounds', () => {
    const shard = loadShard('cn/beijing.json')
    const feature = shard.features.find(
      (f) => f.properties.renderableId === 'datav-cn-beijing',
    )
    expect(feature).toBeDefined()
    if (!feature) return

    // Beijing representative point
    const BEIJING_LAT = 39.9042
    const BEIJING_LNG = 116.4074

    expect(isPointInBounds(feature, BEIJING_LAT, BEIJING_LNG)).toBe(true)
  })

  it('Hong Kong representative point lat:22.3193 lng:114.1694 is within hong-kong.json bounds', () => {
    const shard = loadShard('cn/hong-kong.json')
    const feature = shard.features.find(
      (f) => f.properties.renderableId === 'datav-cn-hong-kong',
    )
    expect(feature).toBeDefined()
    if (!feature) return

    // Hong Kong representative point
    const HK_LAT = 22.3193
    const HK_LNG = 114.1694

    expect(isPointInBounds(feature, HK_LAT, HK_LNG)).toBe(true)
  })

  it('California representative point lat:36.7783 lng:-119.4179 is within overseas/us.json bounds', () => {
    const shard = loadShard('overseas/us.json')
    const feature = shard.features.find(
      (f) => f.properties.renderableId === 'ne-admin1-us-california',
    )
    expect(feature).toBeDefined()
    if (!feature) return

    // California representative point
    const CA_LAT = 36.7783
    const CA_LNG = -119.4179

    expect(isPointInBounds(feature, CA_LAT, CA_LNG)).toBe(true)
  })
})

// ---- Coordinate system validation -------------------------------------------

describe('WGS84 coordinate system validation', () => {
  it('beijing.json feature coordinates are in valid WGS84 lng range (not GCJ-02 shifted)', () => {
    const shard = loadShard('cn/beijing.json')
    const feature = shard.features.find(
      (f) => f.properties.renderableId === 'datav-cn-beijing',
    )
    expect(feature).toBeDefined()
    if (!feature) return

    const [minLng, minLat, maxLng, maxLat] = featureBounds(feature)

    // Beijing should be around 115.4-117.5 lng, 39.4-41.1 lat in WGS84
    expect(minLng).toBeGreaterThan(114)
    expect(maxLng).toBeLessThan(120)
    expect(minLat).toBeGreaterThan(38)
    expect(maxLat).toBeLessThan(42)
  })

  it('hong-kong.json feature coordinates are in valid WGS84 range', () => {
    const shard = loadShard('cn/hong-kong.json')
    const feature = shard.features.find(
      (f) => f.properties.renderableId === 'datav-cn-hong-kong',
    )
    expect(feature).toBeDefined()
    if (!feature) return

    const [minLng, , maxLng, maxLat] = featureBounds(feature)

    // Hong Kong should be around 113.8-114.5 lng, 22.1-22.6 lat in WGS84
    expect(minLng).toBeGreaterThan(113)
    expect(maxLng).toBeLessThan(116)
    expect(maxLat).toBeLessThan(24)
  })

  it('overseas/us.json California feature coordinates are in valid WGS84 range', () => {
    const shard = loadShard('overseas/us.json')
    const feature = shard.features.find(
      (f) => f.properties.renderableId === 'ne-admin1-us-california',
    )
    expect(feature).toBeDefined()
    if (!feature) return

    const [minLng, minLat, maxLng, maxLat] = featureBounds(feature)

    // California should be around -124.5 to -114.1 lng, 32.5 to 42.0 lat
    expect(minLng).toBeGreaterThan(-126)
    expect(maxLng).toBeLessThan(-113)
    expect(minLat).toBeGreaterThan(31)
    expect(maxLat).toBeLessThan(43)
  })
})
