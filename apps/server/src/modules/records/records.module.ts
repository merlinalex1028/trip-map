import { Module } from '@nestjs/common'

import { PrismaModule } from '../../prisma/prisma.module.js'
import { RecordsController } from './records.controller.js'
import { RecordsRepository } from './records.repository.js'
import { RecordsService } from './records.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [RecordsController],
  providers: [RecordsRepository, RecordsService],
})
export class RecordsModule {}
