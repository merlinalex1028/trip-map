import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { SmokeRecord, UserTravelRecord } from '@prisma/client'

import type {
  SmokeRecordCreateRequest,
  SmokeRecordResponse,
  TravelRecord as ContractTravelRecord,
} from '@trip-map/contracts'
import type { PlaceKind } from '@trip-map/contracts'

import { RecordsRepository } from './records.repository.js'
import type { CreateTravelRecordDto } from './dto/create-travel-record.dto.js'

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
    const record = await this.recordsRepository.createTravelRecord(userId, input)
    return toContractTravelRecord(record)
  }

  async deleteTravel(userId: string, placeId: string): Promise<void> {
    const deleted = await this.recordsRepository.deleteTravelRecordByPlaceId(userId, placeId)
    if (!deleted) {
      throw new NotFoundException(`No record found for placeId "${placeId}"`)
    }
  }
}
