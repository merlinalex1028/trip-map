/**
 * normalize-natural-earth.mjs
 *
 * Reads the Natural Earth admin-1 source snapshot (WGS84) and filters out
 * all features where properties.adm0_a3 === 'CHN' to exclude China boundaries.
 * China admin boundaries are handled exclusively by the DataV CN pipeline.
 *
 * Natural Earth admin-1 v5.1.1 already uses WGS84 coordinates, so no
 * coordinate transformation is needed.
 *
 * Usage: called by build-geometry-manifest.mjs
 * Returns: GeoJSON.FeatureCollection (WGS84, China excluded)
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SOURCE_PATH = resolve(__dirname, '..', '..', '..', '..', 'ne_50m_admin_1_states_provinces.json')

/**
 * Load and normalize the Natural Earth admin-1 source snapshot.
 * Excludes all features with adm0_a3 === 'CHN' to prevent China geometry
 * from appearing in the overseas layer during shard generation.
 *
 * @returns {object} GeoJSON FeatureCollection with China features removed
 */
export function normalizeOverseasSource(sourcePath = SOURCE_PATH) {
  const raw = readFileSync(sourcePath, 'utf-8')
  const featureCollection = JSON.parse(raw)

  const filteredFeatures = featureCollection.features.filter(
    (feature) => feature.properties?.adm0_a3 !== 'CHN'
  )

  return {
    ...featureCollection,
    features: filteredFeatures,
  }
}

/**
 * Returns the source path for reference in build metadata.
 */
export function getOverseasSourcePath() {
  return SOURCE_PATH
}
