import type { CanonicalPlaceSummary } from './place'

export interface ResolveCanonicalPlaceRequest {
  lat: number
  lng: number
}

export interface ConfirmCanonicalPlaceRequest {
  lat: number
  lng: number
  candidatePlaceId: string
}

export interface CanonicalPlaceCandidate extends CanonicalPlaceSummary {
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
      place: CanonicalPlaceSummary
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
