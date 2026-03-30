import {
  PHASE11_SMOKE_RECORD_REQUEST,
  type HealthStatusResponse,
  type SmokeRecordResponse,
} from '@trip-map/contracts'

import { createApiUrl } from './client'

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function fetchHealthStatus(): Promise<HealthStatusResponse> {
  const response = await fetch(createApiUrl('/health'), {
    method: 'GET',
  })

  return parseJsonResponse<HealthStatusResponse>(response)
}

export async function createSmokeRecord(): Promise<SmokeRecordResponse> {
  const response = await fetch(createApiUrl('/records/smoke'), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(PHASE11_SMOKE_RECORD_REQUEST),
  })

  return parseJsonResponse<SmokeRecordResponse>(response)
}
