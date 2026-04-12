import type { CreateTravelRecordRequest, TravelRecord } from '@trip-map/contracts'
import { apiFetchJson } from './client'

export async function fetchTravelRecords(): Promise<TravelRecord[]> {
  return apiFetchJson<TravelRecord[]>('/records', {
    method: 'GET',
  })
}

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
