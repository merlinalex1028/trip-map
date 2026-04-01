import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  PHASE11_CONTRACTS_VERSION,
  type HealthStatusResponse,
} from '@trip-map/contracts'

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: '健康检查' })
  @ApiOkResponse({ description: 'OK' })
  getStatus(): HealthStatusResponse {
    return {
      status: 'ok',
      service: 'server',
      contractsVersion: PHASE11_CONTRACTS_VERSION,
      database: 'down',
    }
  }
}
