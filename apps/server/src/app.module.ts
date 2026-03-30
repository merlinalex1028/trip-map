import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { HealthModule } from './health/health.module.js'
import { CanonicalPlacesModule } from './modules/canonical-places/canonical-places.module.js'
import { RecordsModule } from './modules/records/records.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    HealthModule,
    CanonicalPlacesModule,
    RecordsModule,
  ],
})
export class AppModule {}
