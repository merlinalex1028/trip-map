import type { PlaceKind } from '@trip-map/contracts'

import type { GeoCityCandidate, GeoPrecision } from './geo'

export type MapPointSource = 'seed' | 'saved' | 'detected'

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

export interface PersistedMapPoint extends BaseMapPoint {
  source: 'saved'
  createdAt: string
  updatedAt: string
}

export interface SeedPointOverride {
  id: string
  name: string
  description: string
  isFeatured: boolean
  updatedAt: string
}

export interface EditablePointSnapshot {
  name: string
  description: string
  isFeatured: boolean
}

export type SummaryMode = 'candidate-select' | 'detected-preview' | 'view'

export type DrawerMode = 'view' | 'edit'

export type SummarySurfaceState =
  | {
      mode: 'candidate-select'
      fallbackPoint: DraftMapPoint
      cityCandidates: GeoCityCandidate[]
    }
  | {
      mode: 'detected-preview' | 'view'
      point: MapPointDisplay
      boundarySupportState: 'supported' | 'missing' | 'not-applicable'
    }

export type PointStorageHealth = 'ready' | 'empty' | 'corrupt' | 'incompatible'
