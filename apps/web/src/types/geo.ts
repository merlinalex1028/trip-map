export interface GeoCoordinates {
  lat: number
  lng: number
}

export type GeoBoundaryCoordinate = [number, number]
export type GeoBoundaryLinearRing = GeoBoundaryCoordinate[]
export type GeoBoundaryPolygon = GeoBoundaryLinearRing[]
export type GeoBoundaryPolygons = GeoBoundaryPolygon[]

export interface NormalizedPoint {
  x: number
  y: number
}

export interface ProjectionConfig {
  viewBoxWidth: number
  viewBoxHeight: number
  plotLeft: number
  plotTop: number
  plotWidth: number
  plotHeight: number
  lngMin: number
  lngMax: number
  latMin: number
  latMax: number
}

export type GeoLookupStatus = 'idle' | 'resolving' | 'resolved' | 'invalid'
export type GeoPrecision = 'country' | 'region' | 'city-high' | 'city-possible'
export type GeoCityMatchLevel = 'high' | 'possible'

export interface GeoCityCandidate {
  cityId: string
  cityName: string
  contextLabel: string
  matchLevel: GeoCityMatchLevel
  distanceKm: number
  statusHint: string
}

export interface GeoDetectionResult {
  kind: 'country' | 'region'
  countryCode: string
  countryName: string
  regionName: string | null
  displayName: string
  precision: GeoPrecision
  cityId: string | null
  cityName: string | null
  cityCandidates: GeoCityCandidate[]
  fallbackNotice: string | null
  lat: number
  lng: number
  confidence: number
}

export interface GeoFeatureProperties {
  countryCode: string
  countryName: string
  regionName: string | null
  displayName: string
  bbox: [number, number, number, number]
}

export interface CityBoundaryFeatureProperties {
  boundaryId: string
  cityId: string
  cityName: string
  datasetVersion: string
}

export interface CityBoundaryPolygonGeometry {
  type: 'Polygon'
  coordinates: GeoBoundaryPolygon
}

export interface CityBoundaryMultiPolygonGeometry {
  type: 'MultiPolygon'
  coordinates: GeoBoundaryPolygons
}

export type CityBoundaryGeometry = CityBoundaryPolygonGeometry | CityBoundaryMultiPolygonGeometry

export interface CityBoundaryFeature {
  type: 'Feature'
  properties: CityBoundaryFeatureProperties
  geometry: CityBoundaryGeometry
}

export interface CityBoundaryFeatureCollection {
  type: 'FeatureCollection'
  features: CityBoundaryFeature[]
}

export interface NormalizedCityBoundary {
  boundaryId: string
  cityId: string
  cityName: string
  datasetVersion: string
  polygons: GeoBoundaryPolygons
}
