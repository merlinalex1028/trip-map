import { Controller, Get } from '@nestjs/common'
import {
  PHASE11_CONTRACTS_VERSION,
  type HealthStatusResponse,
} from '@trip-map/contracts'

@Controller('health')
export class HealthController {
  @Get()
  getStatus(): HealthStatusResponse {
    return {
      status: 'ok',
      service: 'server',
      contractsVersion: PHASE11_CONTRACTS_VERSION,
      database: 'down',
    }
  }
}
