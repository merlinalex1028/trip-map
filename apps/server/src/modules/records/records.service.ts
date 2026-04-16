import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import type { SmokeRecord, UserTravelRecord } from '@prisma/client'

import type {
  ImportTravelRecordsResponse,
  SmokeRecordCreateRequest,
  SmokeRecordResponse,
  TravelRecord as ContractTravelRecord,
} from '@trip-map/contracts'
import type { PlaceKind } from '@trip-map/contracts'

import {
  getCanonicalPlaceSummaryByBoundaryId,
  getCanonicalPlaceSummaryById,
} from '../canonical-places/place-metadata-catalog.js'
import { RecordsRepository } from './records.repository.js'
import type { CreateTravelRecordDto } from './dto/create-travel-record.dto.js'
import type { ImportTravelRecordsDto } from './dto/import-travel-records.dto.js'

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

function toContractTravelRecord(record: UserTravelRecord): ContractTravelRecord {
  return {
    id: record.id,
    placeId: record.placeId,
    boundaryId: record.boundaryId,
    placeKind: record.placeKind as PlaceKind,
    datasetVersion: record.datasetVersion,
    displayName: record.displayName,
    regionSystem: record.regionSystem as ContractTravelRecord['regionSystem'],
    adminType: record.adminType as ContractTravelRecord['adminType'],
    typeLabel: record.typeLabel as ContractTravelRecord['typeLabel'],
    parentLabel: record.parentLabel as ContractTravelRecord['parentLabel'],
    subtitle: record.subtitle,
    createdAt: record.createdAt.toISOString(),
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
    const record = await this.recordsRepository.createTravelRecord(userId, input)
    return toContractTravelRecord(record)
  }

  async importTravel(userId: string, input: ImportTravelRecordsDto): Promise<ImportTravelRecordsResponse> {
    input.records.forEach(record => this.assertAuthoritativeOverseasRecord(record))
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
        'Overseas travel record is outside the Phase 26 authoritative support catalog.',
      )
    }

    const mismatchedFields = [
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
