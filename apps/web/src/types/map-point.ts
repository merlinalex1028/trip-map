import type { CanonicalPlaceCandidate, PlaceKind } from '@trip-map/contracts'

import type { GeoCityCandidate, GeoPrecision } from './geo'

export type MapPointSource = 'saved' | 'detected'

interface BaseMapPoint {
  id: string
  name: string
  countryName: string
  countryCode: string
  precision: GeoPrecision
  cityId: string | null
  cityName: string | null
  cityContextLabel: string | null
  placeId?: string | null
  placeKind?: PlaceKind | null
  datasetVersion?: string | null
  typeLabel?: string | null
  parentLabel?: string | null
  subtitle?: string | null
  boundaryId: string | null
  boundaryDatasetVersion: string | null
  fallbackNotice: string | null
  x: number
  y: number
  lat: number
  lng: number
  clickLat?: number
  clickLng?: number
  source: MapPointSource
  isFeatured: boolean
  description: string
  coordinatesLabel: string
}

export interface MapPointDisplay extends BaseMapPoint {
  source: MapPointSource
}

export interface DraftMapPoint extends BaseMapPoint {
  source: 'detected'
}

export type SummaryMode = 'candidate-select' | 'detected-preview' | 'view'

export type SummarySurfaceState =
  | {
      mode: 'candidate-select'
      fallbackPoint: DraftMapPoint
      cityCandidates: GeoCityCandidate[]
      canonicalCandidates: CanonicalPlaceCandidate[]
      recommendedPlaceId: string | null
    }
  | {
      mode: 'detected-preview' | 'view'
      point: MapPointDisplay
      boundarySupportState: 'supported' | 'missing' | 'not-applicable'
    }
