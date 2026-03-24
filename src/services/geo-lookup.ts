import { geoContains } from 'd3-geo'

import { cityCandidatesByContext } from '../data/geo/city-candidates'
import countryRegions from '../data/geo/country-regions.geo.json'
import { WORLD_PROJECTION_CONFIG } from './map-projection'
import type { GeoCoordinates, GeoDetectionResult, GeoFeatureProperties } from '../types/geo'

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

const countryRegionFeatures = (countryRegions as CountryRegionFeatureCollection).features
const countryRegionFeatureMap = new Map(
  countryRegionFeatures.map((feature) => [feature.properties.countryCode, feature] as const)
)
export const CITY_FALLBACK_NOTICE = '未识别到更精确城市，已回退到国家/地区'
const KM_PER_DEGREE = 111
const MIN_CITY_HIGH_HIT_PIXELS = 6
const MIN_CITY_POSSIBLE_HIT_PIXELS = 9

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
    cityName: null,
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

function enrichWithCityContext(
  detectionResult: GeoDetectionResult,
  geo: GeoCoordinates
): GeoDetectionResult {
  const candidatePool = getCityCandidateKeys(detectionResult).flatMap((key) => {
    return cityCandidatesByContext[key] ?? []
  })

  if (!candidatePool.length) {
    return {
      ...detectionResult,
      fallbackNotice: CITY_FALLBACK_NOTICE
    }
  }

  const bestMatch = candidatePool
    .map((candidate) => ({
      candidate,
      distanceKm: calculateDistanceKm(geo, {
        lat: candidate.lat,
        lng: candidate.lng
      })
    }))
    .sort((left, right) => left.distanceKm - right.distanceKm)[0]

  if (!bestMatch) {
    return {
      ...detectionResult,
      fallbackNotice: CITY_FALLBACK_NOTICE
    }
  }

  const highRadiusKm = getInteractionAdjustedRadiusKm(
    bestMatch.candidate.lat,
    bestMatch.candidate.highRadiusKm,
    MIN_CITY_HIGH_HIT_PIXELS
  )
  const possibleRadiusKm = getInteractionAdjustedRadiusKm(
    bestMatch.candidate.lat,
    bestMatch.candidate.possibleRadiusKm,
    MIN_CITY_POSSIBLE_HIT_PIXELS
  )

  if (bestMatch.distanceKm <= highRadiusKm) {
    return {
      ...detectionResult,
      displayName: bestMatch.candidate.name,
      precision: 'city-high',
      cityName: bestMatch.candidate.name,
      lat: bestMatch.candidate.lat,
      lng: bestMatch.candidate.lng,
      fallbackNotice: null
    }
  }

  if (bestMatch.distanceKm <= possibleRadiusKm) {
    return {
      ...detectionResult,
      precision: 'city-possible',
      cityName: bestMatch.candidate.name,
      fallbackNotice: CITY_FALLBACK_NOTICE
    }
  }

  return {
    ...detectionResult,
    fallbackNotice: CITY_FALLBACK_NOTICE
  }
}

export function lookupCountryRegionByCoordinates(geo: GeoCoordinates): GeoDetectionResult | null {
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

export function isLowConfidenceBoundaryHit(
  geo: GeoCoordinates,
  result: GeoDetectionResult | null
): boolean {
  if (!result) {
    return false
  }

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
    const sampleResult = lookupCountryRegionByCoordinates(sample)

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
