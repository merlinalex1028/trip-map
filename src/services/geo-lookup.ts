import { geoContains } from 'd3-geo'

import countryRegions from '../data/geo/country-regions.geo.json'
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
    lat: geo.lat,
    lng: geo.lng,
    confidence
  }
}

export function lookupCountryRegionByCoordinates(geo: GeoCoordinates): GeoDetectionResult | null {
  const feature = countryRegionFeatures.find((candidate) => {
    return (
      isWithinBBox(candidate.properties.bbox, geo) &&
      geoContains(candidate as never, [geo.lng, geo.lat])
    )
  })

  return feature ? toDetectionResult(feature, geo) : null
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
