import { Inject, Injectable } from '@nestjs/common'
import type { SmokeRecordCreateRequest } from '@trip-map/contracts'
import type { SmokeRecord, UserTravelRecord } from '@prisma/client'

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
        regionSystem: input.regionSystem,
        adminType: input.adminType,
        typeLabel: input.typeLabel,
        parentLabel: input.parentLabel,
        subtitle: input.subtitle,
        note: input.note,
      },
    })
  }

  async findAllTravelRecords(userId: string): Promise<UserTravelRecord[]> {
    return this.prisma.userTravelRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createTravelRecord(userId: string, input: CreateTravelRecordDto): Promise<UserTravelRecord> {
    return this.prisma.userTravelRecord.upsert({
      where: {
        userId_placeId: {
          userId,
          placeId: input.placeId,
        },
      },
      update: {
        boundaryId: input.boundaryId,
        placeKind: input.placeKind,
        datasetVersion: input.datasetVersion,
        displayName: input.displayName,
        regionSystem: input.regionSystem,
        adminType: input.adminType,
        typeLabel: input.typeLabel,
        parentLabel: input.parentLabel,
        subtitle: input.subtitle,
      },
      create: {
        userId,
        placeId: input.placeId,
        boundaryId: input.boundaryId,
        placeKind: input.placeKind,
        datasetVersion: input.datasetVersion,
        displayName: input.displayName,
        regionSystem: input.regionSystem,
        adminType: input.adminType,
        typeLabel: input.typeLabel,
        parentLabel: input.parentLabel,
        subtitle: input.subtitle,
      },
    })
  }

  async deleteTravelRecordByPlaceId(userId: string, placeId: string): Promise<UserTravelRecord | null> {
    const record = await this.prisma.userTravelRecord.findUnique({
      where: {
        userId_placeId: {
          userId,
          placeId,
        },
      },
    })

    if (!record) {
      return null
    }

    await this.prisma.userTravelRecord.delete({
      where: {
        userId_placeId: {
          userId,
          placeId,
        },
      },
    })

    return record
  }
}
