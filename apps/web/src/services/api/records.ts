import type {
  CreateTravelRecordRequest,
  ImportTravelRecordsRequest,
  ImportTravelRecordsResponse,
  TravelRecord,
  UpdateTravelRecordRequest,
} from '@trip-map/contracts'
import { apiFetchJson } from './client'

export async function createTravelRecord(
  request: CreateTravelRecordRequest,
): Promise<TravelRecord> {
  return apiFetchJson<TravelRecord>('/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
}

export async function deleteTravelRecord(placeId: string): Promise<void> {
  return apiFetchJson<void>(
    `/records/${encodeURIComponent(placeId)}`,
    {
      method: 'DELETE',
    },
    {
      responseType: 'none',
    },
  )
}

export async function updateTravelRecord(
  id: string,
  request: UpdateTravelRecordRequest,
): Promise<TravelRecord> {
  return apiFetchJson<TravelRecord>(`/records/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
}

export async function deleteSingleRecord(id: string): Promise<void> {
  return apiFetchJson<void>(
    `/records/record/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    { responseType: 'none' },
  )
}

export async function importTravelRecords(
  request: ImportTravelRecordsRequest,
): Promise<ImportTravelRecordsResponse> {
  return apiFetchJson<ImportTravelRecordsResponse>('/records/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
}
