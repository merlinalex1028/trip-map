import { Inject, Injectable } from '@nestjs/common'
import type { SmokeRecordCreateRequest } from '@trip-map/contracts'
import type { SmokeRecord } from '@prisma/client'

import { PrismaService } from '../../prisma/prisma.service.js'

@Injectable()
export class RecordsRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async createSmokeRecord(input: SmokeRecordCreateRequest): Promise<SmokeRecord> {
    return this.prisma.smokeRecord.create({
      data: {
        placeId: input.placeId,
        boundaryId: input.boundaryId,
        placeKind: input.placeKind,
        datasetVersion: input.datasetVersion,
        displayName: input.displayName,
        note: input.note,
      },
    })
  }
}
