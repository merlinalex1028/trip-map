import type { CanonicalPlaceSummary } from './place'

export interface SmokeRecordCreateRequest extends CanonicalPlaceSummary {
  note?: string
}

export interface SmokeRecordResponse extends SmokeRecordCreateRequest {
  id: string
  createdAt: string
  updatedAt: string
}
