import { Inject, Injectable } from '@nestjs/common'
import type { SmokeRecordCreateRequest } from '@trip-map/contracts'
import type {
  TravelCountryTripCount,
  TravelMemoriesProfileDimension,
  TravelMemoryPostcardSeed,
  TravelPopularFootprint,
  TravelStatsResponse,
  TravelTrendBucket,
} from '@trip-map/contracts'
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

interface TravelStatsRecord {
  id: string
  placeId: string
  boundaryId: string
  displayName: string
  parentLabel: string | null
  startDate: string | null
  notes: string | null
  tags: string[]
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

function isUsableTravelDate(date: string | null): date is string {
  return date !== null && /^\d{4}-\d{2}-\d{2}$/.test(date)
}

function incrementCount(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1)
}

function toSortedBuckets(map: Map<string, number>): TravelTrendBucket[] {
  return [...map.entries()]
    .sort(([periodA], [periodB]) => periodA.localeCompare(periodB))
    .map(([period, tripCount]) => ({ period, tripCount }))
}

function percentage(part: number, total: number) {
  if (total <= 0) {
    return 0
  }
  return Math.min(100, Math.round((part / total) * 100))
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

  async findTravelRecordById(userId: string, id: string): Promise<UserTravelRecord | null> {
    return this.prisma.userTravelRecord.findFirst({
      where: { id, userId },
    })
  }

  async updateTravelRecord(
    userId: string,
    id: string,
    data: {
      startDate?: string | null
      endDate?: string | null
      notes?: string | null
      tags?: string[]
    },
  ): Promise<UserTravelRecord> {
    return this.prisma.userTravelRecord.update({
      where: { id, userId },
      data,
    })
  }

  async deleteTravelRecordById(userId: string, id: string): Promise<void> {
    await this.prisma.userTravelRecord.delete({
      where: { id, userId },
    })
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
    const records: TravelStatsRecord[] = await this.prisma.userTravelRecord.findMany({
      where: { userId },
      select: {
        id: true,
        placeId: true,
        boundaryId: true,
        displayName: true,
        parentLabel: true,
        startDate: true,
        notes: true,
        tags: true,
      },
    })

    const totalTrips = records.length
    const uniquePlaces = new Set(records.map(record => record.placeId).filter(Boolean)).size
    const visitedAdministrativeAreas = new Set(records.map(record => record.boundaryId).filter(Boolean)).size
    const countryCounts = new Map<string, number>()
    const monthlyCounts = new Map<string, number>()
    const yearlyCounts = new Map<string, number>()
    const placeVisitCounts = new Map<string, number>()
    const popularByPlace = new Map<string, TravelPopularFootprint>()

    let datedRecordCount = 0
    let storyDetailCount = 0

    for (const record of records) {
      incrementCount(countryCounts, toCountryLabel(record.parentLabel))
      incrementCount(placeVisitCounts, record.placeId)

      if (isUsableTravelDate(record.startDate)) {
        datedRecordCount += 1
        incrementCount(monthlyCounts, record.startDate.slice(0, 7))
        incrementCount(yearlyCounts, record.startDate.slice(0, 4))
      }

      if ((record.notes?.trim().length ?? 0) > 0 || record.tags.length > 0) {
        storyDetailCount += 1
      }

      const existing = popularByPlace.get(record.placeId)
      const latestVisitDate = isUsableTravelDate(record.startDate) ? record.startDate : null

      if (!existing) {
        popularByPlace.set(record.placeId, {
          placeId: record.placeId,
          displayName: record.displayName,
          parentLabel: record.parentLabel,
          visitCount: 1,
          latestVisitDate,
        })
        continue
      }

      existing.visitCount += 1
      if (latestVisitDate !== null && (existing.latestVisitDate === null || latestVisitDate > existing.latestVisitDate)) {
        existing.latestVisitDate = latestVisitDate
        existing.displayName = record.displayName
        existing.parentLabel = record.parentLabel
      }
    }

    const visitedCountries = totalTrips === 0 ? 0 : countryCounts.size
    const monthlyTrend = toSortedBuckets(monthlyCounts)
    const yearlyTrend = toSortedBuckets(yearlyCounts)
    const countryDistribution: TravelCountryTripCount[] = [...countryCounts.entries()]
      .map(([countryLabel, tripCount]) => ({ countryLabel, tripCount }))
      .sort((a, b) => b.tripCount - a.tripCount || a.countryLabel.localeCompare(b.countryLabel, 'zh-Hans-CN'))
    const popularFootprints = [...popularByPlace.values()]
      .sort((a, b) => {
        const latestA = a.latestVisitDate ?? ''
        const latestB = b.latestVisitDate ?? ''

        return b.visitCount - a.visitCount
          || latestB.localeCompare(latestA)
          || a.displayName.localeCompare(b.displayName, 'zh-Hans-CN')
          || a.placeId.localeCompare(b.placeId)
      })
      .slice(0, 5)
    const postcards: TravelMemoryPostcardSeed[] = records
      .filter((record): record is TravelStatsRecord & { startDate: string } => isUsableTravelDate(record.startDate))
      .sort((a, b) => b.startDate.localeCompare(a.startDate)
        || a.displayName.localeCompare(b.displayName, 'zh-Hans-CN')
        || a.id.localeCompare(b.id))
      .slice(0, 8)
      .map(record => ({
        recordId: record.id,
        placeId: record.placeId,
        displayName: record.displayName,
        parentLabel: record.parentLabel,
        startDate: record.startDate,
      }))
    const repeatedRecordCount = records.filter(record => (placeVisitCounts.get(record.placeId) ?? 0) > 1).length
    const profile: TravelMemoriesProfileDimension[] = totalTrips === 0
      ? []
      : [
          {
            key: 'place-exploration',
            label: '地点探索',
            value: percentage(uniquePlaces, totalTrips),
            max: 100,
            explanation: '去过的不同地点占全部足迹的比例。',
          },
          {
            key: 'country-range',
            label: '国家跨度',
            value: percentage(visitedCountries, TOTAL_SUPPORTED_TRAVEL_COUNTRIES),
            max: 100,
            explanation: '已覆盖国家在当前支持国家中的比例。',
          },
          {
            key: 'repeat-visits',
            label: '重访温度',
            value: percentage(repeatedRecordCount, totalTrips),
            max: 100,
            explanation: '落在重访地点上的足迹比例。',
          },
          {
            key: 'dated-memories',
            label: '日期完整度',
            value: percentage(datedRecordCount, totalTrips),
            max: 100,
            explanation: '带有可用出行日期的足迹比例。',
          },
          {
            key: 'story-detail',
            label: '摘记细节',
            value: percentage(storyDetailCount, totalTrips),
            max: 100,
            explanation: '写下摘记或标签的足迹比例。',
          },
        ]

    return {
      totalTrips,
      uniquePlaces,
      visitedAdministrativeAreas,
      visitedCountries,
      totalSupportedCountries: TOTAL_SUPPORTED_TRAVEL_COUNTRIES,
      memories: {
        monthlyTrend,
        yearlyTrend,
        countryDistribution,
        profile,
        popularFootprints,
        postcards,
      },
    }
  }
}
