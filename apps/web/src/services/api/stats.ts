import type { TravelStatsResponse } from '@trip-map/contracts'

import { apiFetchJson } from './client'

export async function fetchStats(): Promise<TravelStatsResponse> {
  return apiFetchJson<TravelStatsResponse>('/records/stats')
}
