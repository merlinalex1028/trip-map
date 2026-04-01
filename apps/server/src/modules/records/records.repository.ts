import { Inject, Injectable } from '@nestjs/common'
import type { SmokeRecordCreateRequest } from '@trip-map/contracts'
import type { SmokeRecord, TravelRecord } from '@prisma/client'

import { PrismaService } from '../../prisma/prisma.service.js'
import type { CreateTravelRecordDto } from './dto/create-travel-record.dto.js'

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

  async findAllTravelRecords(): Promise<TravelRecord[]> {
    return this.prisma.travelRecord.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async createTravelRecord(input: CreateTravelRecordDto): Promise<TravelRecord> {
    return this.prisma.travelRecord.create({
      data: {
        placeId: input.placeId,
        boundaryId: input.boundaryId,
        placeKind: input.placeKind,
        datasetVersion: input.datasetVersion,
        displayName: input.displayName,
        subtitle: input.subtitle,
      },
    })
  }

  async deleteTravelRecordByPlaceId(placeId: string): Promise<TravelRecord | null> {
    const record = await this.prisma.travelRecord.findUnique({ where: { placeId } })
    if (!record) return null
    await this.prisma.travelRecord.delete({ where: { placeId } })
    return record
  }
}
