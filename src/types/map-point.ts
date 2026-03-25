import type { GeoPrecision } from './geo'

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
  fallbackNotice: string | null
  x: number
  y: number
  lat: number
  lng: number
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

export type DrawerMode = 'candidate-select' | 'detected-preview' | 'view' | 'edit'

export type PointStorageHealth = 'ready' | 'empty' | 'corrupt' | 'incompatible'
