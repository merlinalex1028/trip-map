import { Inject, Injectable } from '@nestjs/common'
import type { SmokeRecordCreateRequest } from '@trip-map/contracts'
import type { SmokeRecord, UserTravelRecord } from '@prisma/client'

import { PrismaService } from '../../prisma/prisma.service.js'
import type { CreateTravelRecordDto } from './dto/create-travel-record.dto.js'

interface ImportTravelRecordsResult {
  importedCount: number
  mergedDuplicateCount: number
  finalCount: number
  records: UserTravelRecord[]
}

function toTravelRecordData(userId: string, input: CreateTravelRecordDto) {
  return {
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
  }
}

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
      } as never,
      update: toTravelRecordData(userId, input),
      create: toTravelRecordData(userId, input),
    })
  }

  async importTravelRecords(userId: string, inputs: CreateTravelRecordDto[]): Promise<ImportTravelRecordsResult> {
    const uniqueByPlaceId = new Map<string, CreateTravelRecordDto>()

    for (const input of inputs) {
      if (!uniqueByPlaceId.has(input.placeId)) {
        uniqueByPlaceId.set(input.placeId, input)
      }
    }

    const uniqueInputs = [...uniqueByPlaceId.values()]

    if (uniqueInputs.length === 0) {
      const records = await this.findAllTravelRecords(userId)
      return {
        importedCount: 0,
        mergedDuplicateCount: 0,
        finalCount: records.length,
        records,
      }
    }

    const existingRecords = await this.prisma.userTravelRecord.findMany({
      where: {
        userId,
        placeId: {
          in: uniqueInputs.map((input) => input.placeId),
        },
      },
      select: {
        placeId: true,
      },
    })
    const existingPlaceIds = new Set(existingRecords.map((record) => record.placeId))
    const recordsToCreate = uniqueInputs.filter((input) => !existingPlaceIds.has(input.placeId))

    let importedCount = 0

    if (recordsToCreate.length > 0) {
      const result = await this.prisma.userTravelRecord.createMany({
        data: recordsToCreate.map((input) => toTravelRecordData(userId, input)),
        skipDuplicates: true,
      })
      importedCount = result.count
    }

    const records = await this.findAllTravelRecords(userId)

    return {
      importedCount,
      mergedDuplicateCount: inputs.length - importedCount,
      finalCount: records.length,
      records,
    }
  }

  async deleteTravelRecordByPlaceId(userId: string, placeId: string): Promise<void> {
    await this.prisma.userTravelRecord.deleteMany({
      where: {
        userId,
        placeId,
      },
    })
  }
}
