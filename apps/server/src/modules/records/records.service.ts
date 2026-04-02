import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { SmokeRecord, TravelRecord } from '@prisma/client'

import type {
  SmokeRecordCreateRequest,
  SmokeRecordResponse,
  TravelRecord as ContractTravelRecord,
} from '@trip-map/contracts'
import type { PlaceKind } from '@trip-map/contracts'

import { RecordsRepository } from './records.repository.js'
import type { CreateTravelRecordDto } from './dto/create-travel-record.dto.js'

function isPrismaUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  )
}

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

function toContractTravelRecord(record: TravelRecord): ContractTravelRecord {
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

  async findAllTravel(): Promise<ContractTravelRecord[]> {
    const records = await this.recordsRepository.findAllTravelRecords()
    return records.map(toContractTravelRecord)
  }

  async createTravel(input: CreateTravelRecordDto): Promise<ContractTravelRecord> {
    try {
      const record = await this.recordsRepository.createTravelRecord(input)
      return toContractTravelRecord(record)
    } catch (error: unknown) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(`Record for placeId "${input.placeId}" already exists`)
      }
      throw error
    }
  }

  async deleteTravel(placeId: string): Promise<void> {
    const deleted = await this.recordsRepository.deleteTravelRecordByPlaceId(placeId)
    if (!deleted) {
      throw new NotFoundException(`No record found for placeId "${placeId}"`)
    }
  }
}
