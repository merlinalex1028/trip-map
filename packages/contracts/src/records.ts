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
  startDate: string | null
  endDate: string | null
  createdAt: string
}

export interface CreateTravelRecordRequest extends CanonicalPlaceSummary {
  startDate: string | null
  endDate: string | null
}

export interface ImportTravelRecordsRequest {
  records: CreateTravelRecordRequest[]
}

export interface ImportTravelRecordsResponse {
  importedCount: number
  mergedDuplicateCount: number
  finalCount: number
  records: TravelRecord[]
}
