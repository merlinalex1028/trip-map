import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { SmokeRecord } from '@prisma/client'
import { Prisma } from '@prisma/client'

import type {
  ImportTravelRecordsResponse,
  SmokeRecordCreateRequest,
  SmokeRecordResponse,
  TravelRecord as ContractTravelRecord,
  TravelStatsResponse,
} from '@trip-map/contracts'

import {
  getCanonicalPlaceSummaryByBoundaryId,
  getCanonicalPlaceSummaryById,
} from '../canonical-places/place-metadata-catalog.js'
import { RecordsRepository } from './records.repository.js'
import type { CreateTravelRecordDto } from './dto/create-travel-record.dto.js'
import type { UpdateTravelRecordDto } from './dto/update-travel-record.dto.js'
import type { ImportTravelRecordsDto } from './dto/import-travel-records.dto.js'
import { toContractTravelRecord } from './travel-record.mapper.js'

function toSmokeRecordResponse(record: SmokeRecord): SmokeRecordResponse {
  return {
    id: record.id,
    placeId: record.placeId,
    boundaryId: record.boundaryId,
    placeKind: record.placeKind as SmokeRecordResponse['placeKind'],
    datasetVersion: record.datasetVersion,
    displayName: record.displayName,
    regionSystem: record.regionSystem as SmokeRecordResponse['regionSystem'],
    adminType: record.adminType as SmokeRecordResponse['adminType'],
    typeLabel: record.typeLabel as SmokeRecordResponse['typeLabel'],
    parentLabel: record.parentLabel as SmokeRecordResponse['parentLabel'],
    subtitle: record.subtitle as SmokeRecordResponse['subtitle'],
    note: record.note ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }
}

@Injectable()
export class RecordsService {
  constructor(
    @Inject(RecordsRepository)
    private readonly recordsRepository: RecordsRepository,
  ) {}

  async createSmoke(input: SmokeRecordCreateRequest): Promise<SmokeRecordResponse> {
    const record = await this.recordsRepository.createSmokeRecord(input)
    return toSmokeRecordResponse(record)
  }

  async findAllTravel(userId: string): Promise<ContractTravelRecord[]> {
    const records = await this.recordsRepository.findAllTravelRecords(userId)
    return records.map(toContractTravelRecord)
  }

  async createTravel(userId: string, input: CreateTravelRecordDto): Promise<ContractTravelRecord> {
    this.assertAuthoritativeOverseasRecord(input)
    this.assertValidDateRange(input)
    const record = await this.recordsRepository.createTravelRecord(userId, input)
    return toContractTravelRecord(record)
  }

  async importTravel(userId: string, input: ImportTravelRecordsDto): Promise<ImportTravelRecordsResponse> {
    input.records.forEach(record => {
      this.assertAuthoritativeOverseasRecord(record)
      this.assertValidDateRange(record)
    })
    const result = await this.recordsRepository.importTravelRecords(userId, input.records)

    return {
      importedCount: result.importedCount,
      mergedDuplicateCount: result.mergedDuplicateCount,
      finalCount: result.finalCount,
      records: result.records.map(toContractTravelRecord),
    }
  }

  async deleteTravel(userId: string, placeId: string): Promise<void> {
    await this.recordsRepository.deleteTravelRecordByPlaceId(userId, placeId)
  }

  async updateTravelRecord(userId: string, id: string, input: UpdateTravelRecordDto): Promise<ContractTravelRecord> {
    // 日期变更时做范围校验
    if (input.startDate !== undefined || input.endDate !== undefined) {
      const existing = await this.recordsRepository.findTravelRecordById(userId, id)
      if (!existing) {
        throw new NotFoundException(`Record ${id} not found`)
      }
      const effectiveStart = input.startDate !== undefined ? input.startDate : existing.startDate
      const effectiveEnd = input.endDate !== undefined ? input.endDate : existing.endDate
      this.assertValidDateRange({ startDate: effectiveStart, endDate: effectiveEnd })
    }

    // 标签清洗 — trim + 去重 + 过滤空字符串
    const cleanData = { ...input }
    if (cleanData.tags) {
      cleanData.tags = [...new Set(cleanData.tags.map(t => t.trim()).filter(t => t.length > 0))]
    }

    try {
      const record = await this.recordsRepository.updateTravelRecord(userId, id, cleanData)
      return toContractTravelRecord(record)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('与已有记录冲突: 相同日期范围内已存在同地点旅行记录')
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Record ${id} not found`)
      }
      throw error
    }
  }

  async deleteTravelRecord(userId: string, id: string): Promise<void> {
    try {
      await this.recordsRepository.deleteTravelRecordById(userId, id)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Record ${id} not found`)
      }
      throw error
    }
  }

  async getStats(userId: string): Promise<TravelStatsResponse> {
    return this.recordsRepository.getTravelStats(userId)
  }

  private assertValidDateRange(
    input: Pick<CreateTravelRecordDto, 'startDate' | 'endDate'>,
  ): void {
    if (input.startDate && input.endDate && input.endDate < input.startDate) {
      throw new BadRequestException('endDate must be >= startDate')
    }
  }

  private assertAuthoritativeOverseasRecord(input: CreateTravelRecordDto): void {
    const isOverseasPayload = input.placeKind === 'OVERSEAS_ADMIN1' || input.regionSystem === 'OVERSEAS'

    if (!isOverseasPayload) {
      return
    }

    if (input.placeKind !== 'OVERSEAS_ADMIN1') {
      throw new BadRequestException(
        'Overseas travel records must use authoritative OVERSEAS_ADMIN1 payloads.',
      )
    }

    const placeSummary = getCanonicalPlaceSummaryById(input.placeId)
    const boundarySummary = getCanonicalPlaceSummaryByBoundaryId(input.boundaryId)

    if (!placeSummary || !boundarySummary || placeSummary.placeId !== boundarySummary.placeId) {
      throw new BadRequestException(
        'Overseas travel record is outside the current authoritative overseas support catalog.',
      )
    }

    const mismatchedFields = [
      ['datasetVersion', input.datasetVersion, placeSummary.datasetVersion],
      ['displayName', input.displayName, placeSummary.displayName],
      ['regionSystem', input.regionSystem, placeSummary.regionSystem],
      ['adminType', input.adminType, placeSummary.adminType],
      ['typeLabel', input.typeLabel, placeSummary.typeLabel],
      ['parentLabel', input.parentLabel, placeSummary.parentLabel],
      ['subtitle', input.subtitle, placeSummary.subtitle],
    ]
      .filter(([, actual, expected]) => actual !== expected)
      .map(([field]) => field)

    if (mismatchedFields.length > 0) {
      throw new BadRequestException(
        `Overseas travel record metadata must match authoritative catalog: ${mismatchedFields.join(', ')}.`,
      )
    }
  }
}
