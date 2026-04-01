import type { CreateTravelRecordRequest, TravelRecord } from '@trip-map/contracts'
import { createApiUrl } from './client'

export async function fetchTravelRecords(): Promise<TravelRecord[]> {
  const response = await fetch(createApiUrl('/records'))
  if (!response.ok) {
    throw new Error(`Failed to fetch records: ${response.status}`)
  }
  return response.json() as Promise<TravelRecord[]>
}

export async function createTravelRecord(
  request: CreateTravelRecordRequest,
): Promise<TravelRecord> {
  const response = await fetch(createApiUrl('/records'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (response.status === 409) {
    // Record already exists — treat as success (idempotent)
    return response.json() as Promise<TravelRecord>
  }
  if (!response.ok) {
    throw new Error(`Failed to create record: ${response.status}`)
  }
  return response.json() as Promise<TravelRecord>
}

export async function deleteTravelRecord(placeId: string): Promise<void> {
  const response = await fetch(createApiUrl(`/records/${encodeURIComponent(placeId)}`), {
    method: 'DELETE',
  })
  if (response.status === 404) {
    // Already deleted — treat as success (idempotent)
    return
  }
  if (!response.ok) {
    throw new Error(`Failed to delete record: ${response.status}`)
  }
}
