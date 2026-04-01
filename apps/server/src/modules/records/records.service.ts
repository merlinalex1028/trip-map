import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'

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

@Injectable()
export class RecordsService {
  constructor(
    @Inject(RecordsRepository)
    private readonly recordsRepository: RecordsRepository,
  ) {}

  async createSmoke(input: SmokeRecordCreateRequest): Promise<SmokeRecordResponse> {
    const record = await this.recordsRepository.createSmokeRecord(input)

    return {
      id: record.id,
      placeId: record.placeId,
      boundaryId: record.boundaryId,
      placeKind: input.placeKind,
      datasetVersion: record.datasetVersion,
      displayName: record.displayName,
      regionSystem: input.regionSystem,
      adminType: input.adminType,
      typeLabel: input.typeLabel,
      parentLabel: input.parentLabel,
      subtitle: input.subtitle,
      note: record.note ?? undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    }
  }

  async findAllTravel(): Promise<ContractTravelRecord[]> {
    const records = await this.recordsRepository.findAllTravelRecords()
    return records.map((r) => ({
      id: r.id,
      placeId: r.placeId,
      boundaryId: r.boundaryId,
      placeKind: r.placeKind as PlaceKind,
      datasetVersion: r.datasetVersion,
      displayName: r.displayName,
      subtitle: r.subtitle,
      createdAt: r.createdAt.toISOString(),
    }))
  }

  async createTravel(input: CreateTravelRecordDto): Promise<ContractTravelRecord> {
    try {
      const record = await this.recordsRepository.createTravelRecord(input)
      return {
        id: record.id,
        placeId: record.placeId,
        boundaryId: record.boundaryId,
        placeKind: record.placeKind as PlaceKind,
        datasetVersion: record.datasetVersion,
        displayName: record.displayName,
        subtitle: record.subtitle,
        createdAt: record.createdAt.toISOString(),
      }
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
