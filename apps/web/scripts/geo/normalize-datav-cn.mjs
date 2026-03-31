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

const SOURCE_PATH = resolve(__dirname, '..', '..', 'src', 'data', 'geo', 'sources', 'datav-cn-2026-03-31.geo.json')

/**
 * Load and normalize the DataV China source snapshot.
 * Converts GCJ02 coordinates to WGS84 using gcoord.transform.
 *
 * @returns {object} GeoJSON FeatureCollection with WGS84 coordinates
 */
export function normalizeCnSource() {
  const raw = readFileSync(SOURCE_PATH, 'utf-8')
  const featureCollection = JSON.parse(raw)

  // Convert GCJ-02 coordinates to WGS84 in-place via gcoord
  const normalized = gcoord.transform(featureCollection, gcoord.GCJ02, gcoord.WGS84)

  return normalized
}

/**
 * Returns the source path for reference in build metadata.
 */
export function getCnSourcePath() {
  return SOURCE_PATH
}
