export interface GeoCoordinates {
  lat: number
  lng: number
}

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

export interface GeoDetectionResult {
  kind: 'country' | 'region'
  countryCode: string
  countryName: string
  regionName: string | null
  displayName: string
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
