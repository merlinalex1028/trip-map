import type {
  CanonicalResolveResponse,
  ConfirmCanonicalPlaceRequest,
  ResolveCanonicalPlaceRequest,
} from '@trip-map/contracts'

import { createApiUrl } from './client'

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function resolveCanonicalPlace(
  payload: ResolveCanonicalPlaceRequest,
): Promise<CanonicalResolveResponse> {
  const response = await fetch(createApiUrl('/places/resolve'), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseJsonResponse<CanonicalResolveResponse>(response)
}

export async function confirmCanonicalPlace(
  payload: ConfirmCanonicalPlaceRequest,
): Promise<CanonicalResolveResponse> {
  const response = await fetch(createApiUrl('/places/confirm'), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseJsonResponse<CanonicalResolveResponse>(response)
}
