import type { CanonicalPlaceSummary } from './place'
import type { GeometryRef } from './geometry'

export interface ResolveCanonicalPlaceRequest {
  lat: number
  lng: number
}

export interface ConfirmCanonicalPlaceRequest {
  lat: number
  lng: number
  candidatePlaceId: string
}

export interface ResolvedCanonicalPlace extends CanonicalPlaceSummary {
  geometryRef: GeometryRef
}

export interface CanonicalPlaceCandidate extends ResolvedCanonicalPlace {
  candidateHint: string
}

export type CanonicalResolveFailedReason =
  | 'NO_CANONICAL_MATCH'
  | 'LOW_CONFIDENCE_BORDER'
  | 'OUTSIDE_SUPPORTED_DATA'
  | 'CANDIDATE_MISMATCH'

export type CanonicalResolveResponse =
  | {
      status: 'resolved'
      click: { lat: number; lng: number }
      place: ResolvedCanonicalPlace
    }
  | {
      status: 'ambiguous'
      click: { lat: number; lng: number }
      prompt: string
      recommendedPlaceId: string | null
      candidates: CanonicalPlaceCandidate[]
    }
  | {
      status: 'failed'
      click: { lat: number; lng: number }
      reason: CanonicalResolveFailedReason
      message: string
    }
