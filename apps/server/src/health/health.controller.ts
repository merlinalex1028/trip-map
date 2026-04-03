import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  PHASE11_CONTRACTS_VERSION,
  type HealthStatusResponse,
} from '@trip-map/contracts'
import { PrismaService } from '../prisma/prisma.service.js'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: '健康检查' })
  @ApiOkResponse({ description: 'OK' })
  async getStatus(): Promise<HealthStatusResponse> {
    let database: 'up' | 'down' = 'down'

    try {
      await this.prisma.$queryRaw`SELECT 1`
      database = 'up'
    }
    catch {
      database = 'down'
    }

    return {
      status: 'ok',
      service: 'server',
      contractsVersion: PHASE11_CONTRACTS_VERSION,
      database,
    }
  }
}
