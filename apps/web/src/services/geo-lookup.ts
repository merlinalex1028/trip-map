import { geoContains } from 'd3-geo'

import { cityCandidatesByContext, cityCandidatesByCountry, type CityCandidate } from '../data/geo/city-candidates'
import { WORLD_PROJECTION_CONFIG } from './map-projection'
import type {
  GeoCityCandidate,
  GeoCoordinates,
  GeoDetectionResult,
  GeoFeatureProperties
} from '../types/geo'

interface GeoPolygonGeometry {
  type: 'Polygon'
  coordinates: number[][][]
}

interface GeoMultiPolygonGeometry {
  type: 'MultiPolygon'
  coordinates: number[][][][]
}

interface CountryRegionFeature {
  type: 'Feature'
  properties: GeoFeatureProperties
  geometry: GeoPolygonGeometry | GeoMultiPolygonGeometry
}

interface CountryRegionFeatureCollection {
  type: 'FeatureCollection'
  features: CountryRegionFeature[]
}

let countryRegionFeatures: CountryRegionFeature[] = []
let countryRegionFeatureMap = new Map<string, CountryRegionFeature>()
let loadPromise: Promise<void> | null = null

async function loadCountryRegions(): Promise<void> {
  if (countryRegionFeatures.length > 0) return
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const response = await fetch('/geo/country-regions.geo.json')
    if (!response.ok) {
      throw new Error(`Failed to load country regions (status ${response.status})`)
    }
    const data = (await response.json()) as CountryRegionFeatureCollection
    countryRegionFeatures = data.features
    countryRegionFeatureMap = new Map(
      countryRegionFeatures.map((feature) => [feature.properties.countryCode, feature] as const)
    )
  })()

  return loadPromise
}

export function prefetchCountryRegions(): void {
  void loadCountryRegions()
}

export const CITY_FALLBACK_NOTICE = '未能可靠确认城市，已提供国家/地区继续记录'
const KM_PER_DEGREE = 111
const MIN_CITY_HIGH_HIT_PIXELS = 6
const CITY_RELIABLE_STATUS_HINT = '更接近点击位置'
const CITY_POSSIBLE_STATUS_HINT = '可能位置，需要确认'

interface RankedCityCandidate extends GeoCityCandidate {
  canResolveHighConfidence: boolean
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function normalizeLng(lng: number) {
  if (lng < -180) {
    return lng + 360
  }

  if (lng > 180) {
    return lng - 360
  }

  return lng
}

function isWithinBBox(bbox: [number, number, number, number], geo: GeoCoordinates) {
  return geo.lng >= bbox[0] && geo.lng <= bbox[2] && geo.lat >= bbox[1] && geo.lat <= bbox[3]
}

function toDetectionResult(
  feature: CountryRegionFeature,
  geo: GeoCoordinates,
  confidence = feature.properties.regionName ? 0.93 : 0.96
): GeoDetectionResult {
  return {
    kind: feature.properties.regionName ? 'region' : 'country',
    countryCode: feature.properties.countryCode,
    countryName: feature.properties.countryName,
    regionName: feature.properties.regionName,
    displayName: feature.properties.displayName,
    precision: feature.properties.regionName ? 'region' : 'country',
    cityId: null,
    cityName: null,
    cityCandidates: [],
    fallbackNotice: null,
    lat: geo.lat,
    lng: geo.lng,
    confidence
  }
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function calculateDistanceKm(origin: GeoCoordinates, target: GeoCoordinates) {
  const earthRadiusKm = 6371
  const latDelta = toRadians(target.lat - origin.lat)
  const lngDelta = toRadians(target.lng - origin.lng)
  const lat1 = toRadians(origin.lat)
  const lat2 = toRadians(target.lat)
  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2)

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getMaxKmPerInteractionPixel(lat: number) {
  const latKmPerPixel =
    ((WORLD_PROJECTION_CONFIG.latMax - WORLD_PROJECTION_CONFIG.latMin) /
      WORLD_PROJECTION_CONFIG.plotHeight) *
    KM_PER_DEGREE
  const lngKmPerPixel =
    ((WORLD_PROJECTION_CONFIG.lngMax - WORLD_PROJECTION_CONFIG.lngMin) /
      WORLD_PROJECTION_CONFIG.plotWidth) *
    KM_PER_DEGREE *
    Math.cos(toRadians(lat))

  return Math.max(latKmPerPixel, lngKmPerPixel)
}

function getInteractionAdjustedRadiusKm(lat: number, configuredRadiusKm: number, minPixels: number) {
  return Math.max(configuredRadiusKm, getMaxKmPerInteractionPixel(lat) * minPixels)
}

function getCityCandidateKeys(result: GeoDetectionResult) {
  return [
    result.regionName ? `${result.countryCode}:${result.regionName}` : null,
    `${result.countryCode}:country`
  ].filter((key): key is string => Boolean(key))
}

function collectCandidatePool(detectionResult: GeoDetectionResult) {
  const candidateMap = new Map<string, CityCandidate>()

  for (const key of getCityCandidateKeys(detectionResult)) {
    for (const candidate of cityCandidatesByContext[key] ?? []) {
      candidateMap.set(candidate.id, candidate)
    }
  }

  for (const candidate of cityCandidatesByCountry[detectionResult.countryCode] ?? []) {
    candidateMap.set(candidate.id, candidate)
  }

  return [...candidateMap.values()]
}

function buildRankedCityCandidates(
  detectionResult: GeoDetectionResult,
  geo: GeoCoordinates
): RankedCityCandidate[] {
  const candidatePool = collectCandidatePool(detectionResult)

  return candidatePool
    .map((candidate) => {
      const distanceKm = calculateDistanceKm(geo, {
        lat: candidate.lat,
        lng: candidate.lng
      })
      const canResolveHighConfidence = candidate.highRadiusKm > 0
      const highRadiusKm = canResolveHighConfidence
        ? getInteractionAdjustedRadiusKm(candidate.lat, candidate.highRadiusKm, MIN_CITY_HIGH_HIT_PIXELS)
        : Number.NEGATIVE_INFINITY
      const matchLevel = canResolveHighConfidence && distanceKm <= highRadiusKm ? 'high' : 'possible'

      return {
        cityId: candidate.id,
        cityName: candidate.name,
        contextLabel: candidate.contextLabel,
        matchLevel,
        distanceKm,
        statusHint: matchLevel === 'high' ? CITY_RELIABLE_STATUS_HINT : CITY_POSSIBLE_STATUS_HINT,
        canResolveHighConfidence
      } satisfies RankedCityCandidate
    })
    .sort((left, right) => {
      if (left.distanceKm !== right.distanceKm) {
        return left.distanceKm - right.distanceKm
      }

      return left.cityId.localeCompare(right.cityId)
    })
    .slice(0, 3)
}

function enrichWithCityContext(
  detectionResult: GeoDetectionResult,
  geo: GeoCoordinates
): GeoDetectionResult {
  const cityCandidates = buildRankedCityCandidates(detectionResult, geo)
  const publicCandidates = cityCandidates.map(({ canResolveHighConfidence: _ignored, ...candidate }) => candidate)

  if (!cityCandidates.length) {
    return {
      ...detectionResult,
      fallbackNotice: CITY_FALLBACK_NOTICE
    }
  }

  const bestMatch = cityCandidates[0]

  if (!bestMatch) {
    return {
      ...detectionResult,
      fallbackNotice: CITY_FALLBACK_NOTICE
    }
  }

  const reliableCandidate = cityCandidates.find((candidate) => candidate.matchLevel === 'high') ?? null

  if (reliableCandidate) {
    return {
      ...detectionResult,
      displayName: reliableCandidate.cityName,
      precision: 'city-high',
      cityId: reliableCandidate.cityId,
      cityName: reliableCandidate.cityName,
      cityCandidates: publicCandidates,
      fallbackNotice: null
    }
  }

  const hasPreciseCandidate = cityCandidates.some((candidate) => candidate.canResolveHighConfidence)

  return {
    ...detectionResult,
    precision: hasPreciseCandidate ? 'city-possible' : detectionResult.precision,
    cityCandidates: publicCandidates,
    fallbackNotice: CITY_FALLBACK_NOTICE
  }
}

export async function lookupCountryRegionByCoordinates(
  geo: GeoCoordinates
): Promise<GeoDetectionResult | null> {
  await loadCountryRegions()

  if (countryRegionFeatures.length === 0) return null

  const feature = countryRegionFeatures.find((candidate) => {
    return (
      isWithinBBox(candidate.properties.bbox, geo) &&
      geoContains(candidate as never, [geo.lng, geo.lat])
    )
  })

  if (!feature) {
    return null
  }

  return enrichWithCityContext(toDetectionResult(feature, geo), geo)
}

export async function isLowConfidenceBoundaryHit(
  geo: GeoCoordinates,
  result: GeoDetectionResult | null
): Promise<boolean> {
  if (!result) {
    return false
  }

  await loadCountryRegions()

  const feature = countryRegionFeatureMap.get(result.countryCode)

  if (!feature) {
    return true
  }

  const [minLng, minLat, maxLng, maxLat] = feature.properties.bbox
  const lngStep = clamp((maxLng - minLng) * 0.01, 0.02, 0.12)
  const latStep = clamp((maxLat - minLat) * 0.01, 0.02, 0.12)
  const samples: GeoCoordinates[] = [
    { lat: geo.lat, lng: normalizeLng(geo.lng + lngStep) },
    { lat: geo.lat, lng: normalizeLng(geo.lng - lngStep) },
    { lat: clamp(geo.lat + latStep, -90, 90), lng: geo.lng },
    { lat: clamp(geo.lat - latStep, -90, 90), lng: geo.lng },
    { lat: clamp(geo.lat + latStep, -90, 90), lng: normalizeLng(geo.lng + lngStep) },
    { lat: clamp(geo.lat + latStep, -90, 90), lng: normalizeLng(geo.lng - lngStep) },
    { lat: clamp(geo.lat - latStep, -90, 90), lng: normalizeLng(geo.lng + lngStep) },
    { lat: clamp(geo.lat - latStep, -90, 90), lng: normalizeLng(geo.lng - lngStep) }
  ]

  let nullHits = 0

  for (const sample of samples) {
    const sampleResult = await lookupCountryRegionByCoordinates(sample)

    if (!sampleResult) {
      nullHits += 1
      continue
    }

    if (sampleResult.countryCode !== result.countryCode) {
      return true
    }
  }

  return nullHits >= 2
}
