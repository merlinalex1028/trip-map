import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'

import type {
  SmokeRecordCreateRequest,
  SmokeRecordResponse,
} from '@trip-map/contracts'

@Injectable()
export class RecordsService {
  createSmoke(input: SmokeRecordCreateRequest): SmokeRecordResponse {
    const now = new Date().toISOString()

    return {
      id: randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
    }
  }
}
