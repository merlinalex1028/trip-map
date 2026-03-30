import { Module } from '@nestjs/common'

import { CanonicalPlacesController } from './canonical-places.controller.js'
import { CanonicalPlacesService } from './canonical-places.service.js'

@Module({
  controllers: [CanonicalPlacesController],
  providers: [CanonicalPlacesService],
})
export class CanonicalPlacesModule {}
