/**
 * build-geometry-manifest.mjs
 *
 * Phase 13 geometry build pipeline entry point.
 *
 * Reads from geometry-source-catalog.json, normalizes both CN and overseas sources,
 * and generates manifest entries and shard output files for the authoritative fixture
 * boundary set:
 *   CN:       datav-cn-beijing, datav-cn-hong-kong, datav-cn-aba, datav-cn-tianjin, datav-cn-langfang
 *   OVERSEAS: ne-admin1-us-california
 *
 * Flags:
 *   --dry-run                Write output to a temporary directory (or --output-root path)
 *                            instead of the official public/geo path.
 *   --output-root <path>     Override the output root directory (implies dry-run behavior
 *                            when used with --dry-run).
 *
 * Usage:
 *   node ./scripts/geo/build-geometry-manifest.mjs
 *     → writes to apps/web/public/geo/2026-03-31-geo-v1/
 *
 *   node ./scripts/geo/build-geometry-manifest.mjs --dry-run --output-root .tmp/geo-build-check
 *     → writes to .tmp/geo-build-check/ (does NOT touch public/ or packages/contracts/src/generated)
 *
 * Output layout:
 *   {outputRoot}/
 *     manifest.json          — array of GeometryManifestEntry records
 *     cn/
 *       beijing.json         — WGS84 GeoJSON with Beijing feature(s)
 *       hong-kong.json       — WGS84 GeoJSON with Hong Kong feature(s)
 *       sichuan.json         — WGS84 GeoJSON with Aba feature(s)
 *       tianjin.json         — WGS84 GeoJSON with Tianjin feature(s)
 *       hebei.json           — WGS84 GeoJSON with Langfang feature(s)
 *     overseas/
 *       us.json              — WGS84 GeoJSON with California (and other US states)
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { normalizeCnSource } from './normalize-datav-cn.mjs'
import { normalizeOverseasSource } from './normalize-natural-earth.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ---- Configuration --------------------------------------------------------

const GEOMETRY_DATASET_VERSION = '2026-03-31-geo-v1'

const CATALOG_PATH = resolve(__dirname, '..', '..', 'src', 'data', 'geo', 'geometry-source-catalog.json')

const DEFAULT_OUTPUT_ROOT = resolve(
  __dirname,
  '..', '..', 'public', 'geo', GEOMETRY_DATASET_VERSION
)

const CONTRACTS_GENERATED_DIR = resolve(
  __dirname,
  '..', '..', '..', '..', 'packages', 'contracts', 'src', 'generated'
)

// ---- Argument parsing -------------------------------------------------------

function parseArgs(argv) {
  let dryRun = false
  let outputRoot = DEFAULT_OUTPUT_ROOT

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dry-run') {
      dryRun = true
    } else if (argv[i] === '--output-root' && argv[i + 1]) {
      outputRoot = resolve(process.cwd(), argv[i + 1])
      i++
    }
  }

  // If --dry-run is set but outputRoot was not explicitly overridden, use default tmp
  if (dryRun && outputRoot === DEFAULT_OUTPUT_ROOT) {
    outputRoot = resolve(process.cwd(), '.tmp', 'geo-build-check')
  }

  return { dryRun, outputRoot }
}

// ---- CN boundary map --------------------------------------------------------
// Maps DataV adcode -> { boundaryId, assetKey (shard file), shardKey (shard grouping key) }

const CN_BOUNDARY_MAP = [
  {
    adcode: 110000,
    boundaryId: 'datav-cn-beijing',
    renderableId: 'datav-cn-beijing',
    assetKey: 'cn/beijing.json',
    shardKey: 'cn/beijing',
  },
  {
    adcode: 810000,
    boundaryId: 'datav-cn-hong-kong',
    renderableId: 'datav-cn-hong-kong',
    assetKey: 'cn/hong-kong.json',
    shardKey: 'cn/hong-kong',
  },
  {
    adcode: 513200,
    boundaryId: 'datav-cn-aba',
    renderableId: 'datav-cn-aba',
    assetKey: 'cn/sichuan.json',
    shardKey: 'cn/sichuan',
  },
  {
    adcode: 120000,
    boundaryId: 'datav-cn-tianjin',
    renderableId: 'datav-cn-tianjin',
    assetKey: 'cn/tianjin.json',
    shardKey: 'cn/tianjin',
  },
  {
    adcode: 131000,
    boundaryId: 'datav-cn-langfang',
    renderableId: 'datav-cn-langfang',
    assetKey: 'cn/hebei.json',
    shardKey: 'cn/hebei',
  },
]

// ---- Overseas boundary map --------------------------------------------------
// Maps Natural Earth name/code -> { boundaryId, assetKey, shardKey }

const OVERSEAS_BOUNDARY_MAP = [
  {
    name: 'California',
    boundaryId: 'ne-admin1-us-california',
    renderableId: 'ne-admin1-us-california',
    assetKey: 'overseas/us.json',
    shardKey: 'overseas/us',
    adm0_a3: 'USA',
  },
]

// ---- Helpers ----------------------------------------------------------------

function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true })
}

function writeJson(filePath, data) {
  ensureDir(dirname(filePath))
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

function info(message) {
  process.stdout.write(`[build-geometry-manifest] ${message}\n`)
}

// ---- Build pipeline ---------------------------------------------------------

function buildCnShards(cnFeatureCollection, outputRoot, catalog) {
  const manifestEntries = []

  // Group features by adcode -> shardKey
  const shardGroups = new Map()
  for (const mapping of CN_BOUNDARY_MAP) {
    if (!shardGroups.has(mapping.shardKey)) {
      shardGroups.set(mapping.shardKey, { features: [], mappings: [] })
    }
    shardGroups.get(mapping.shardKey).mappings.push(mapping)
  }

  // Assign features to shard groups by adcode, injecting renderableId into properties
  for (const feature of cnFeatureCollection.features) {
    const adcode = feature.properties?.adcode
    const mapping = CN_BOUNDARY_MAP.find((m) => m.adcode === adcode)
    if (mapping) {
      const group = shardGroups.get(mapping.shardKey)
      if (group) {
        // Inject renderableId into feature properties (immutable new object)
        const enrichedFeature = {
          ...feature,
          properties: {
            ...feature.properties,
            boundaryId: mapping.boundaryId,
            renderableId: mapping.renderableId ?? mapping.boundaryId,
            datasetVersion: GEOMETRY_DATASET_VERSION,
          },
        }
        group.features.push(enrichedFeature)
      }
    }
  }

  // Write shard files and build manifest entries
  for (const [shardKey, { features, mappings }] of shardGroups.entries()) {
    const shardPath = join(outputRoot, shardKey + '.json')
    const shardGeoJson = {
      type: 'FeatureCollection',
      features,
    }
    writeJson(shardPath, shardGeoJson)
    info(`  Wrote CN shard: ${shardKey}.json (${features.length} feature(s))`)

    for (const mapping of mappings) {
      manifestEntries.push({
        boundaryId: mapping.boundaryId,
        layer: 'CN',
        geometryDatasetVersion: GEOMETRY_DATASET_VERSION,
        assetKey: mapping.assetKey,
        renderableId: mapping.renderableId,
        sourceDataset: 'DATAV_GEOATLAS_CN',
        sourceVersion: catalog.sources.DATAV_GEOATLAS_CN.sourceVersion,
        sourceFeatureId: String(mapping.adcode),
      })
    }
  }

  return manifestEntries
}

function buildOverseasShards(overseasFeatureCollection, outputRoot, catalog) {
  const manifestEntries = []

  // Group features by shardKey (country code)
  const shardGroups = new Map()
  for (const mapping of OVERSEAS_BOUNDARY_MAP) {
    if (!shardGroups.has(mapping.shardKey)) {
      shardGroups.set(mapping.shardKey, { features: [], mappings: [] })
    }
  }

  // Assign features to shard groups by name and adm0_a3, injecting renderableId into properties
  for (const feature of overseasFeatureCollection.features) {
    const name = feature.properties?.name
    const adm0_a3 = feature.properties?.adm0_a3
    const mapping = OVERSEAS_BOUNDARY_MAP.find(
      (m) => m.name === name && m.adm0_a3 === adm0_a3
    )
    if (mapping) {
      const group = shardGroups.get(mapping.shardKey)
      if (group) {
        // Inject renderableId into feature properties (immutable new object)
        const enrichedFeature = {
          ...feature,
          properties: {
            ...feature.properties,
            boundaryId: mapping.boundaryId,
            renderableId: mapping.renderableId ?? mapping.boundaryId,
            datasetVersion: GEOMETRY_DATASET_VERSION,
          },
        }
        group.features.push(enrichedFeature)
        group.mappings.push(mapping)
      }
    }
  }

  // Write shard files and build manifest entries
  for (const [shardKey, { features, mappings }] of shardGroups.entries()) {
    if (features.length === 0) {
      info(`  WARN: No features found for overseas shard: ${shardKey}`)
      continue
    }
    const shardPath = join(outputRoot, shardKey + '.json')
    const shardGeoJson = {
      type: 'FeatureCollection',
      features,
    }
    writeJson(shardPath, shardGeoJson)
    info(`  Wrote overseas shard: ${shardKey}.json (${features.length} feature(s))`)

    for (const mapping of mappings) {
      manifestEntries.push({
        boundaryId: mapping.boundaryId,
        layer: 'OVERSEAS',
        geometryDatasetVersion: GEOMETRY_DATASET_VERSION,
        assetKey: mapping.assetKey,
        renderableId: mapping.renderableId,
        sourceDataset: 'NATURAL_EARTH_ADMIN1',
        sourceVersion: catalog.sources.NATURAL_EARTH_ADMIN1.sourceVersion,
        sourceFeatureId: `${mapping.adm0_a3}/${mapping.name}`,
      })
    }
  }

  return manifestEntries
}

// ---- TypeScript manifest generator ------------------------------------------

function generateTypescriptManifest(entries) {
  const entriesJson = JSON.stringify(entries, null, 2)
    .replace(/^/gm, '  ')
    .trimStart()

  return `/**
 * geometry-manifest.generated.ts
 *
 * AUTO-GENERATED by apps/web/scripts/geo/build-geometry-manifest.mjs
 * DO NOT EDIT MANUALLY — run \`pnpm --filter @trip-map/web run geo:build\` to regenerate.
 *
 * geometryDatasetVersion: ${GEOMETRY_DATASET_VERSION}
 * Generated: ${new Date().toISOString()}
 */

import type { GeometryManifestEntry } from '../geometry'

export const GEOMETRY_DATASET_VERSION = '${GEOMETRY_DATASET_VERSION}' as const

export const GEOMETRY_MANIFEST: readonly GeometryManifestEntry[] = ${entriesJson} as const
`
}

function run() {
  const args = process.argv.slice(2)
  const { dryRun, outputRoot } = parseArgs(args)

  info(`Starting geometry manifest build`)
  info(`  geometryDatasetVersion: ${GEOMETRY_DATASET_VERSION}`)
  info(`  outputRoot: ${outputRoot}`)
  info(`  dry-run: ${dryRun}`)

  // Load source catalog
  info(`Reading geometry-source-catalog.json`)
  if (!existsSync(CATALOG_PATH)) {
    process.stderr.write(`[build-geometry-manifest] FAIL: geometry-source-catalog.json not found at: ${CATALOG_PATH}\n`)
    process.exit(1)
  }
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf-8'))

  // Normalize sources
  info('Normalizing China source (GCJ02 -> WGS84)')
  const cnFeatureCollection = normalizeCnSource()
  info(`  CN features loaded: ${cnFeatureCollection.features.length}`)

  info('Normalizing overseas source (filter adm0_a3 === CHN)')
  const overseasFeatureCollection = normalizeOverseasSource()
  info(`  Overseas features after filtering: ${overseasFeatureCollection.features.length}`)

  // Build shards
  info('Building CN shards')
  const cnManifestEntries = buildCnShards(cnFeatureCollection, outputRoot, catalog)

  info('Building overseas shards')
  const overseasManifestEntries = buildOverseasShards(overseasFeatureCollection, outputRoot, catalog)

  const allManifestEntries = [...cnManifestEntries, ...overseasManifestEntries]

  // Write manifest
  const manifestPath = join(outputRoot, 'manifest.json')
  writeJson(manifestPath, allManifestEntries)
  info(`Wrote manifest: ${manifestPath} (${allManifestEntries.length} entries)`)

  // Generate TypeScript manifest (only when not dry-run)
  if (!dryRun) {
    const generatedTsPath = join(CONTRACTS_GENERATED_DIR, 'geometry-manifest.generated.ts')
    const tsContent = generateTypescriptManifest(allManifestEntries)
    ensureDir(CONTRACTS_GENERATED_DIR)
    writeFileSync(generatedTsPath, tsContent, 'utf-8')
    info(`Wrote generated TypeScript manifest: ${generatedTsPath}`)
  } else {
    const generatedTsPath = join(outputRoot, 'geometry-manifest.generated.ts')
    const tsContent = generateTypescriptManifest(allManifestEntries)
    writeFileSync(generatedTsPath, tsContent, 'utf-8')
    info(`  [dry-run] Wrote generated TypeScript manifest to temporary path: ${generatedTsPath}`)
  }

  // Summary
  info('Build complete.')
  info(`  CN entries: ${cnManifestEntries.length}`)
  info(`  Overseas entries: ${overseasManifestEntries.length}`)
  info(`  Total entries: ${allManifestEntries.length}`)
  if (dryRun) {
    info(`  [dry-run] Output written to temporary path: ${outputRoot}`)
    info(`  [dry-run] public/geo/ and packages/contracts/src/generated/ were NOT modified.`)
  }
}

run()
