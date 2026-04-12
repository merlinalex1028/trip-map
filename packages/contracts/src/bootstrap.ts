import type { AuthUser } from './auth'
import type { TravelRecord } from './records'

export type AuthBootstrapResponse =
  | { authenticated: false }
  | { authenticated: true; user: AuthUser; records: TravelRecord[] }
