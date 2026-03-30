export const PHASE11_CONTRACTS_VERSION = 'phase11-v1'

export interface HealthStatusResponse {
  status: 'ok'
  service: 'server'
  contractsVersion: string
  database: 'up' | 'down'
}
