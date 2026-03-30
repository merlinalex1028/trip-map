import { Module } from '@nestjs/common'

import { HealthModule } from './health/health.module.js'
import { RecordsModule } from './modules/records/records.module.js'

@Module({
  imports: [HealthModule, RecordsModule],
})
export class AppModule {}
