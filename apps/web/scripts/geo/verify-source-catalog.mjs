/**
 * verify-source-catalog.mjs
 *
 * Verifies that the geometry-source-catalog.json is valid and that the vendored
 * source snapshots on disk match their recorded checksums.
 *
 * Validates:
 * - DATAV_GEOATLAS_CN and NATURAL_EARTH_ADMIN1 entries both exist
 * - Each entry has non-empty checksum, coordinateSystem, sourcePath
 * - Each sourcePath points to an existing vendored file
 * - Recomputes SHA-256 for each file and compares exactly against catalog checksum
 *
 * Usage: node ./scripts/geo/verify-source-catalog.mjs
 */

import { createHash } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Resolve the catalog path relative to the repo root (apps/web)
const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..')
const CATALOG_PATH = resolve(__dirname, '..', '..', 'src', 'data', 'geo', 'geometry-source-catalog.json')

const REQUIRED_SOURCES = ['DATAV_GEOATLAS_CN', 'NATURAL_EARTH_ADMIN1']
const REQUIRED_FIELDS = ['checksum', 'coordinateSystem', 'sourcePath', 'sourceVersion', 'snapshotDate']

function fail(message) {
  process.stderr.write(`[verify-source-catalog] FAIL: ${message}\n`)
  process.exit(1)
}

function info(message) {
  process.stdout.write(`[verify-source-catalog] ${message}\n`)
}

function computeFileSha256(filePath) {
  const data = readFileSync(filePath)
  return 'sha256:' + createHash('sha256').update(data).digest('hex')
}

function run() {
  info(`Reading catalog: ${CATALOG_PATH}`)

  if (!existsSync(CATALOG_PATH)) {
    fail(`geometry-source-catalog.json not found at: ${CATALOG_PATH}`)
  }

  const catalogRaw = readFileSync(CATALOG_PATH, 'utf-8')
  const catalog = JSON.parse(catalogRaw)

  const sources = catalog.sources
  if (!sources || typeof sources !== 'object') {
    fail('geometry-source-catalog.json missing "sources" object')
  }

  for (const sourceKey of REQUIRED_SOURCES) {
    info(`Checking source entry: ${sourceKey}`)

    const entry = sources[sourceKey]
    if (!entry) {
      fail(`Missing required source entry: ${sourceKey}`)
    }

    // Validate required fields are non-empty
    for (const field of REQUIRED_FIELDS) {
      if (!entry[field] || String(entry[field]).trim() === '') {
        fail(`Source "${sourceKey}" has empty or missing field: "${field}"`)
      }
    }

    // Validate checksum format starts with sha256:
    if (!String(entry.checksum).startsWith('sha256:')) {
      fail(`Source "${sourceKey}" checksum does not start with "sha256:": ${entry.checksum}`)
    }

    // Resolve sourcePath relative to repo root
    const snapshotPath = resolve(REPO_ROOT, entry.sourcePath)
    info(`  sourcePath resolves to: ${snapshotPath}`)

    if (!existsSync(snapshotPath)) {
      fail(`Vendored snapshot not found for "${sourceKey}": ${snapshotPath}`)
    }

    // Recompute SHA-256 and compare exactly
    const actualChecksum = computeFileSha256(snapshotPath)
    if (actualChecksum !== entry.checksum) {
      fail(
        `Checksum mismatch for "${sourceKey}":\n` +
        `  catalog:  ${entry.checksum}\n` +
        `  computed: ${actualChecksum}`
      )
    }

    info(`  checksum OK: ${actualChecksum}`)
    info(`  coordinateSystem: ${entry.coordinateSystem}`)
  }

  info('All source catalog entries verified successfully.')
  info(`DATAV_GEOATLAS_CN: ${sources['DATAV_GEOATLAS_CN'].sourceVersion} (${sources['DATAV_GEOATLAS_CN'].coordinateSystem})`)
  info(`NATURAL_EARTH_ADMIN1: ${sources['NATURAL_EARTH_ADMIN1'].sourceVersion} (${sources['NATURAL_EARTH_ADMIN1'].coordinateSystem})`)
}

run()
