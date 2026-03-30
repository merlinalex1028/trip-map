import { IsIn, IsOptional, IsString } from 'class-validator'

import type { SmokeRecordCreateRequest } from '@trip-map/contracts'

export class CreateSmokeRecordDto implements SmokeRecordCreateRequest {
  @IsString()
  placeId!: string

  @IsString()
  boundaryId!: string

  @IsIn(['CN_CITY', 'OVERSEAS_ADMIN1'])
  placeKind!: SmokeRecordCreateRequest['placeKind']

  @IsString()
  datasetVersion!: string

  @IsString()
  displayName!: string

  @IsOptional()
  @IsString()
  note?: string
}
