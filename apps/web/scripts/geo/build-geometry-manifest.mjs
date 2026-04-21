/**
 * build-geometry-manifest.mjs
 *
 * Builds the authoritative geometry manifest from the production-layered inputs:
 * - China city-level boundaries: Alibaba Cloud DataV `100000_full_city.json`
 * - China direct-controlled municipalities / SAR supplement: DataV `100000_full.json`
 * - Overseas admin1 boundaries with China removed: Natural Earth GeoJSON
 *
 * Output layout:
 *   {outputRoot}/
 *     manifest.json
 *     cn/layer.json
 *     overseas/layer.json
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  getCnCitySourcePath,
  getCnProvinceSourcePath,
  normalizeCnCitySource,
  normalizeCnProvinceSource,
} from './normalize-datav-cn.mjs'
import {
  getOverseasSourcePath,
  normalizeOverseasSource,
} from './normalize-natural-earth.mjs'
import {
  getOverseasAdmin1CountryDefinition,
  getOverseasAdmin1SourceFeatureId,
  isSupportedOverseasAdmin1Feature,
  supportedCountrySummaries,
} from './overseas-admin1-support.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const GEOMETRY_DATASET_VERSION = '2026-04-21-geo-v3'

const CATALOG_PATH = resolve(__dirname, '..', '..', 'src', 'data', 'geo', 'geometry-source-catalog.json')

const DEFAULT_OUTPUT_ROOT = resolve(
  __dirname,
  '..', '..', 'public', 'geo', GEOMETRY_DATASET_VERSION,
)

const CONTRACTS_GENERATED_DIR = resolve(
  __dirname,
  '..', '..', '..', '..', 'packages', 'contracts', 'src', 'generated',
)

const CN_LAYER_ASSET_KEY = 'cn/layer.json'
const OVERSEAS_LAYER_ASSET_KEY = 'overseas/layer.json'
const CANONICAL_DATASET_VERSION = 'canonical-authoritative-2026-04-21'

const CN_DIRECT_CONTROLLED_CODES = new Set([110000, 120000, 310000, 500000])
const CN_SAR_CODES = new Set([810000, 820000])
const CN_SUPPLEMENT_CODES = new Set([...CN_DIRECT_CONTROLLED_CODES, ...CN_SAR_CODES])
const CN_EXCLUDED_CODES = new Set([710000])

const CN_SPECIAL_IDENTITIES = new Map([
  [110000, { placeId: 'cn-beijing', boundaryId: 'datav-cn-beijing' }],
  [120000, { placeId: 'cn-tianjin', boundaryId: 'datav-cn-tianjin' }],
  [131000, { placeId: 'cn-langfang', boundaryId: 'datav-cn-langfang' }],
  [310000, { placeId: 'cn-shanghai', boundaryId: 'datav-cn-shanghai' }],
  [500000, { placeId: 'cn-chongqing', boundaryId: 'datav-cn-chongqing' }],
  [513200, { placeId: 'cn-aba', boundaryId: 'datav-cn-aba' }],
  [810000, { placeId: 'cn-hong-kong', boundaryId: 'datav-cn-hong-kong' }],
  [820000, { placeId: 'cn-macau', boundaryId: 'datav-cn-macau' }],
])

const OVERSEAS_SPECIAL_IDENTITIES = new Map([
  ['US:California', { placeId: 'us-california', boundaryId: 'ne-admin1-us-california' }],
])

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

  if (dryRun && outputRoot === DEFAULT_OUTPUT_ROOT) {
    outputRoot = resolve(process.cwd(), '.tmp', 'geo-build-check')
  }

  return { dryRun, outputRoot }
}

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

function slugify(input) {
  return String(input)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .toLowerCase()
}

function buildCnProvinceNameMap(provinceFeatureCollection) {
  return new Map(
    provinceFeatureCollection.features
      .map(feature => [feature.properties?.adcode, feature.properties?.name])
      .filter(([adcode, name]) => Boolean(adcode) && Boolean(name)),
  )
}

function normalizeCnProvinceLabel(name) {
  return String(name)
    .replace(/特别行政区$/, '')
    .replace(/维吾尔自治区$/, '')
    .replace(/壮族自治区$/, '')
    .replace(/回族自治区$/, '')
    .replace(/自治区$/, '')
    .replace(/省$/, '')
    .replace(/市$/, '')
}

function normalizeCnDisplayName(name, adminType) {
  if (adminType === 'MUNICIPALITY' || adminType === 'PREFECTURE_LEVEL_CITY') {
    return String(name).replace(/市$/, '')
  }

  if (adminType === 'SAR') {
    return String(name).replace(/特别行政区$/, '')
  }

  return String(name)
}

function deriveCnAdminMetadata(name, adcode) {
  if (CN_DIRECT_CONTROLLED_CODES.has(adcode)) {
    return {
      adminType: 'MUNICIPALITY',
      typeLabel: '直辖市',
      displayName: normalizeCnDisplayName(name, 'MUNICIPALITY'),
      parentLabel: '中国',
    }
  }

  if (CN_SAR_CODES.has(adcode)) {
    return {
      adminType: 'SAR',
      typeLabel: '特别行政区',
      displayName: normalizeCnDisplayName(name, 'SAR'),
      parentLabel: '中国',
    }
  }

  if (String(name).endsWith('自治州')) {
    return {
      adminType: 'AUTONOMOUS_PREFECTURE',
      typeLabel: '自治州',
      displayName: normalizeCnDisplayName(name, 'AUTONOMOUS_PREFECTURE'),
    }
  }

  if (String(name).endsWith('盟')) {
    return {
      adminType: 'LEAGUE',
      typeLabel: '盟',
      displayName: normalizeCnDisplayName(name, 'LEAGUE'),
    }
  }

  if (String(name).endsWith('地区')) {
    return {
      adminType: 'AREA',
      typeLabel: '地区',
      displayName: normalizeCnDisplayName(name, 'AREA'),
    }
  }

  return {
    adminType: 'PREFECTURE_LEVEL_CITY',
    typeLabel: '地级市',
    displayName: normalizeCnDisplayName(name, 'PREFECTURE_LEVEL_CITY'),
  }
}

function buildCnIdentity(adcode) {
  const special = CN_SPECIAL_IDENTITIES.get(adcode)
  if (special) {
    return special
  }

  return {
    placeId: `cn-${adcode}`,
    boundaryId: `datav-cn-${adcode}`,
  }
}

function buildOverseasIdentity(featureProperties) {
  const iso2 = String(featureProperties.iso_a2 ?? featureProperties.adm0_a3 ?? 'xx').toLowerCase()
  const admin1Name = featureProperties.name_en ?? featureProperties.name
  const specialKey = `${featureProperties.iso_a2 ?? featureProperties.adm0_a3}:${admin1Name}`
  const special = OVERSEAS_SPECIAL_IDENTITIES.get(specialKey)

  if (special) {
    return special
  }

  const slug = slugify(admin1Name)
  return {
    placeId: `${iso2}-${slug}`,
    boundaryId: `ne-admin1-${iso2}-${slug}`,
  }
}

function createCnFeatureMetadata(featureProperties, provinceNameMap) {
  const adcode = Number(featureProperties.adcode)
  const identity = buildCnIdentity(adcode)
  const adminMeta = deriveCnAdminMetadata(featureProperties.name, adcode)
  const parentAdcode = Number(featureProperties.parent?.adcode ?? 0)
  const provinceName = parentAdcode ? provinceNameMap.get(parentAdcode) : null
  const parentLabel = adminMeta.parentLabel
    ?? `中国 · ${normalizeCnProvinceLabel(provinceName ?? '')}`

  return {
    ...identity,
    displayName: adminMeta.displayName,
    placeKind: 'CN_ADMIN',
    datasetVersion: CANONICAL_DATASET_VERSION,
    regionSystem: 'CN',
    adminType: adminMeta.adminType,
    typeLabel: adminMeta.typeLabel,
    parentLabel,
    subtitle: `${parentLabel} · ${adminMeta.typeLabel}`,
    cityId: identity.placeId,
    cityName: adminMeta.displayName,
  }
}

function createOverseasFeatureMetadata(featureProperties) {
  const countryDefinition = getOverseasAdmin1CountryDefinition(featureProperties)
  if (!countryDefinition) {
    throw new Error(`Missing overseas country definition for ${featureProperties.adm0_a3 ?? 'unknown'}`)
  }

  const identity = buildOverseasIdentity(featureProperties)
  const displayName = featureProperties.name_en ?? featureProperties.name
  const parentLabel = countryDefinition.labelEn
  const typeLabel = countryDefinition.defaultTypeLabel

  return {
    ...identity,
    displayName,
    placeKind: 'OVERSEAS_ADMIN1',
    datasetVersion: CANONICAL_DATASET_VERSION,
    regionSystem: 'OVERSEAS',
    adminType: 'ADMIN1',
    typeLabel,
    parentLabel,
    subtitle: `${parentLabel} · ${typeLabel}`,
    cityId: identity.placeId,
    cityName: displayName,
  }
}

function enrichFeature(feature, metadata) {
  return {
    ...feature,
    properties: {
      ...feature.properties,
      ...metadata,
      boundaryId: metadata.boundaryId,
      renderableId: metadata.boundaryId,
      datasetVersion: GEOMETRY_DATASET_VERSION,
    },
  }
}

function createManifestEntry({
  boundaryId,
  layer,
  assetKey,
  sourceDataset,
  sourceVersion,
  sourceFeatureId,
}) {
  return {
    boundaryId,
    layer,
    geometryDatasetVersion: GEOMETRY_DATASET_VERSION,
    assetKey,
    renderableId: boundaryId,
    sourceDataset,
    sourceVersion,
    sourceFeatureId,
  }
}

function buildCnLayer(cityFeatureCollection, provinceFeatureCollection, outputRoot, catalog) {
  const provinceNameMap = buildCnProvinceNameMap(provinceFeatureCollection)
  const layerFeatures = []
  const manifestEntries = []

  for (const feature of cityFeatureCollection.features) {
    const props = feature.properties ?? {}
    const adcode = Number(props.adcode)

    if (props.level !== 'city' || !Number.isFinite(adcode) || CN_EXCLUDED_CODES.has(adcode)) {
      continue
    }

    const metadata = createCnFeatureMetadata(props, provinceNameMap)
    layerFeatures.push(enrichFeature(feature, metadata))
    manifestEntries.push(createManifestEntry({
      boundaryId: metadata.boundaryId,
      layer: 'CN',
      assetKey: CN_LAYER_ASSET_KEY,
      sourceDataset: 'DATAV_GEOATLAS_CN_CITY',
      sourceVersion: catalog.sources.DATAV_GEOATLAS_CN_CITY.sourceVersion,
      sourceFeatureId: String(adcode),
    }))
  }

  for (const feature of provinceFeatureCollection.features) {
    const props = feature.properties ?? {}
    const adcode = Number(props.adcode)

    if (!CN_SUPPLEMENT_CODES.has(adcode)) {
      continue
    }

    const metadata = createCnFeatureMetadata(props, provinceNameMap)
    layerFeatures.push(enrichFeature(feature, metadata))
    manifestEntries.push(createManifestEntry({
      boundaryId: metadata.boundaryId,
      layer: 'CN',
      assetKey: CN_LAYER_ASSET_KEY,
      sourceDataset: 'DATAV_GEOATLAS_CN_PROVINCE',
      sourceVersion: catalog.sources.DATAV_GEOATLAS_CN_PROVINCE.sourceVersion,
      sourceFeatureId: String(adcode),
    }))
  }

  const layerPath = join(outputRoot, CN_LAYER_ASSET_KEY)
  writeJson(layerPath, {
    type: 'FeatureCollection',
    features: layerFeatures,
  })
  info(`  Wrote CN layer: ${CN_LAYER_ASSET_KEY} (${layerFeatures.length} feature(s))`)

  return manifestEntries
}

function buildOverseasLayer(featureCollection, outputRoot, catalog) {
  const layerFeatures = []
  const manifestEntries = []

  for (const feature of featureCollection.features) {
    const props = feature.properties ?? {}
    const admin1Name = props.name_en ?? props.name

    if (!props.adm0_a3 || !admin1Name || !isSupportedOverseasAdmin1Feature(props)) {
      continue
    }

    const metadata = createOverseasFeatureMetadata(props)
    layerFeatures.push(enrichFeature(feature, metadata))
    manifestEntries.push(createManifestEntry({
      boundaryId: metadata.boundaryId,
      layer: 'OVERSEAS',
      assetKey: OVERSEAS_LAYER_ASSET_KEY,
      sourceDataset: 'NATURAL_EARTH_ADMIN1',
      sourceVersion: catalog.sources.NATURAL_EARTH_ADMIN1.sourceVersion,
      sourceFeatureId: getOverseasAdmin1SourceFeatureId(props),
    }))
  }

  const layerPath = join(outputRoot, OVERSEAS_LAYER_ASSET_KEY)
  writeJson(layerPath, {
    type: 'FeatureCollection',
    features: layerFeatures,
  })
  info(`  Wrote overseas layer: ${OVERSEAS_LAYER_ASSET_KEY} (${layerFeatures.length} feature(s))`)

  return manifestEntries
}

function generateTypescriptManifest(entries) {
  const entriesJson = JSON.stringify(entries, null, 2)
    .replace(/^/gm, '  ')
    .trimStart()
  const supportedCountrySummariesJson = JSON.stringify(supportedCountrySummaries, null, 2)
    .replace(/^/gm, '  ')
    .trimStart()
  const supportedCountryLabelZh = JSON.stringify(
    supportedCountrySummaries.map(country => country.labelZh).join('、'),
  )

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

export const SUPPORTED_OVERSEAS_COUNTRY_SUMMARIES = ${supportedCountrySummariesJson} as const

export const SUPPORTED_OVERSEAS_COUNTRY_LABEL_ZH = ${supportedCountryLabelZh} as const
`
}

function run() {
  const args = process.argv.slice(2)
  const { dryRun, outputRoot } = parseArgs(args)

  info('Starting geometry manifest build')
  info(`  geometryDatasetVersion: ${GEOMETRY_DATASET_VERSION}`)
  info(`  outputRoot: ${outputRoot}`)
  info(`  dry-run: ${dryRun}`)
  info(`  CN city source: ${getCnCitySourcePath()}`)
  info(`  CN province source: ${getCnProvinceSourcePath()}`)
  info(`  overseas source: ${getOverseasSourcePath()}`)

  if (!existsSync(CATALOG_PATH)) {
    process.stderr.write(`[build-geometry-manifest] FAIL: geometry-source-catalog.json not found at: ${CATALOG_PATH}\n`)
    process.exit(1)
  }

  const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf-8'))

  const cnCityFeatureCollection = normalizeCnCitySource()
  const cnProvinceFeatureCollection = normalizeCnProvinceSource()
  const overseasFeatureCollection = normalizeOverseasSource()

  info(`  CN city features loaded: ${cnCityFeatureCollection.features.length}`)
  info(`  CN province features loaded: ${cnProvinceFeatureCollection.features.length}`)
  info(`  overseas features loaded: ${overseasFeatureCollection.features.length}`)

  const cnManifestEntries = buildCnLayer(
    cnCityFeatureCollection,
    cnProvinceFeatureCollection,
    outputRoot,
    catalog,
  )

  const overseasManifestEntries = buildOverseasLayer(
    overseasFeatureCollection,
    outputRoot,
    catalog,
  )

  const allManifestEntries = [...cnManifestEntries, ...overseasManifestEntries]

  writeJson(join(outputRoot, 'manifest.json'), allManifestEntries)
  info(`Wrote manifest: ${join(outputRoot, 'manifest.json')} (${allManifestEntries.length} entries)`)

  const generatedTsPath = dryRun
    ? join(outputRoot, 'geometry-manifest.generated.ts')
    : join(CONTRACTS_GENERATED_DIR, 'geometry-manifest.generated.ts')
  const tsContent = generateTypescriptManifest(allManifestEntries)
  ensureDir(dirname(generatedTsPath))
  writeFileSync(generatedTsPath, tsContent, 'utf-8')
  info(`Wrote generated TypeScript manifest: ${generatedTsPath}`)

  info('Build complete.')
  info(`  CN entries: ${cnManifestEntries.length}`)
  info(`  overseas entries: ${overseasManifestEntries.length}`)
  info(`  total entries: ${allManifestEntries.length}`)
}

run()
