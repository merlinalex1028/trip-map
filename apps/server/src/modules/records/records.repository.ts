import { Inject, Injectable } from '@nestjs/common'
import type { SmokeRecordCreateRequest } from '@trip-map/contracts'
import type { TravelStatsResponse } from '@trip-map/contracts'
import type { SmokeRecord, UserTravelRecord } from '@prisma/client'

import { PrismaService } from '../../prisma/prisma.service.js'
import { TOTAL_SUPPORTED_TRAVEL_COUNTRIES } from '../canonical-places/place-metadata-catalog.js'
import type { CreateTravelRecordDto } from './dto/create-travel-record.dto.js'

interface ImportTravelRecordsResult {
  importedCount: number
  mergedDuplicateCount: number
  finalCount: number
  records: UserTravelRecord[]
}

function keyOf(input: Pick<CreateTravelRecordDto, 'placeId' | 'startDate' | 'endDate'>) {
  return `${input.placeId}\u0000${input.startDate ?? ''}\u0000${input.endDate ?? ''}`
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
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
  }
}

function toCountryLabel(parentLabel: string | null) {
  const label = parentLabel ?? '未知'
  const separatorIndex = label.indexOf(' · ')
  return separatorIndex === -1 ? label : label.slice(0, separatorIndex)
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
    return this.prisma.userTravelRecord.create({
      data: toTravelRecordData(userId, input),
    })
  }

  async importTravelRecords(userId: string, inputs: CreateTravelRecordDto[]): Promise<ImportTravelRecordsResult> {
    const uniqueByKey = new Map<string, CreateTravelRecordDto>()

    for (const input of inputs) {
      const key = keyOf(input)
      if (!uniqueByKey.has(key)) {
        uniqueByKey.set(key, input)
      }
    }

    const uniqueInputs = [...uniqueByKey.values()]

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
      select: { placeId: true, startDate: true, endDate: true },
    })
    const existingKeys = new Set(existingRecords.map(record => keyOf({
      placeId: record.placeId,
      startDate: record.startDate,
      endDate: record.endDate,
    })))
    const recordsToCreate = uniqueInputs.filter(input => !existingKeys.has(keyOf(input)))

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

  async getTravelStats(userId: string): Promise<TravelStatsResponse> {
    const [totalTrips, uniquePlaceRecords, parentLabelRecords] = await Promise.all([
      this.prisma.userTravelRecord.count({ where: { userId } }),
      this.prisma.userTravelRecord.findMany({
        where: { userId },
        select: { placeId: true },
        distinct: ['placeId'],
      }),
      this.prisma.userTravelRecord.findMany({
        where: { userId },
        select: { parentLabel: true },
        distinct: ['parentLabel'],
      }),
    ])

    const visitedCountries = new Set(parentLabelRecords.map(record => toCountryLabel(record.parentLabel))).size

    return {
      totalTrips,
      uniquePlaces: uniquePlaceRecords.length,
      visitedCountries,
      totalSupportedCountries: TOTAL_SUPPORTED_TRAVEL_COUNTRIES,
    }
  }
}
