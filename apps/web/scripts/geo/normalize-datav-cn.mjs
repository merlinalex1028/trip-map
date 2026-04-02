/**
 * normalize-datav-cn.mjs
 *
 * Reads the China DataV.GeoAtlas source snapshot (GCJ-02) and converts all
 * coordinates to WGS84 using gcoord.transform.
 *
 * The DataV.GeoAtlas source uses GCJ-02 (Mars Coordinate System) as documented
 * at https://www.alibabacloud.com/help/en/datav/datav-7-0/user-guide/map-data-format-1
 *
 * Output is a WGS84 GeoJSON FeatureCollection suitable for Leaflet consumption.
 *
 * Usage: called by build-geometry-manifest.mjs
 * Returns: GeoJSON.FeatureCollection (WGS84 normalized)
 */

import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const require = createRequire(import.meta.url)
const gcoord = require('gcoord')

const CITY_SOURCE_PATH = resolve(
  __dirname,
  '..', '..', 'src', 'data', 'geo', 'sources', 'datav-cn-full-city.json',
)

const PROVINCE_SOURCE_PATH = resolve(
  __dirname,
  '..', '..', 'src', 'data', 'geo', 'sources', 'datav-cn-full-province.json',
)

/**
 * Load and normalize the DataV China source snapshot.
 * Converts GCJ02 coordinates to WGS84 using gcoord.transform.
 *
 * @returns {object} GeoJSON FeatureCollection with WGS84 coordinates
 */
export function normalizeDatavSource(sourcePath) {
  const raw = readFileSync(sourcePath, 'utf-8')
  const featureCollection = JSON.parse(raw)

  // Convert GCJ-02 coordinates to WGS84 in-place via gcoord
  const normalized = gcoord.transform(featureCollection, gcoord.GCJ02, gcoord.WGS84)

  return normalized
}

/**
 * Load and normalize the China city-level source snapshot.
 */
export function normalizeCnCitySource() {
  return normalizeDatavSource(CITY_SOURCE_PATH)
}

/**
 * Load and normalize the China province-level source snapshot.
 */
export function normalizeCnProvinceSource() {
  return normalizeDatavSource(PROVINCE_SOURCE_PATH)
}

/**
 * Backward-compatible alias for the city-level source.
 */
export function normalizeCnSource() {
  return normalizeCnCitySource()
}

export function getCnCitySourcePath() {
  return CITY_SOURCE_PATH
}

export function getCnProvinceSourcePath() {
  return PROVINCE_SOURCE_PATH
}

/**
 * Backward-compatible alias for the city-level source path.
 */
export function getCnSourcePath() {
  return getCnCitySourcePath()
}
