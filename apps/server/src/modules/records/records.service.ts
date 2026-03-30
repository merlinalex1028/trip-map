import { Inject, Injectable } from '@nestjs/common'

import type {
  SmokeRecordCreateRequest,
  SmokeRecordResponse,
} from '@trip-map/contracts'

import { RecordsRepository } from './records.repository.js'

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
      note: record.note ?? undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    }
  }
}
