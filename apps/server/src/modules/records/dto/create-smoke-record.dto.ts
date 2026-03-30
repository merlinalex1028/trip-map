import { IsIn, IsOptional, IsString } from 'class-validator'

import type { SmokeRecordCreateRequest } from '@trip-map/contracts'

export class CreateSmokeRecordDto implements SmokeRecordCreateRequest {
  @IsString()
  placeId!: string

  @IsString()
  boundaryId!: string

  @IsIn(['CN_ADMIN', 'OVERSEAS_ADMIN1'])
  placeKind!: SmokeRecordCreateRequest['placeKind']

  @IsString()
  datasetVersion!: string

  @IsString()
  displayName!: string

  @IsIn(['CN', 'OVERSEAS'])
  regionSystem!: SmokeRecordCreateRequest['regionSystem']

  @IsIn([
    'MUNICIPALITY',
    'SAR',
    'PREFECTURE_LEVEL_CITY',
    'AUTONOMOUS_PREFECTURE',
    'LEAGUE',
    'AREA',
    'ADMIN1',
  ])
  adminType!: SmokeRecordCreateRequest['adminType']

  @IsString()
  typeLabel!: string

  @IsString()
  parentLabel!: string

  @IsString()
  subtitle!: string

  @IsOptional()
  @IsString()
  note?: string
}
