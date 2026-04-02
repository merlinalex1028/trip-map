import type { CanonicalPlaceSummary, ChinaAdminType, PlaceKind } from './place'

export interface SmokeRecordCreateRequest extends CanonicalPlaceSummary {
  note?: string
}

export interface SmokeRecordResponse extends SmokeRecordCreateRequest {
  id: string
  createdAt: string
  updatedAt: string
}

export interface TravelRecord {
  id: string
  placeId: string
  boundaryId: string
  placeKind: PlaceKind
  datasetVersion: string
  displayName: string
  regionSystem: 'CN' | 'OVERSEAS'
  adminType: ChinaAdminType | 'ADMIN1'
  typeLabel: string
  parentLabel: string
  subtitle: string
  createdAt: string
}

export interface CreateTravelRecordRequest extends CanonicalPlaceSummary {}
