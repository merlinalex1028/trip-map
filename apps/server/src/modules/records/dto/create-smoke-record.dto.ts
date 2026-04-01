import { IsIn, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import type { SmokeRecordCreateRequest } from '@trip-map/contracts'

export class CreateSmokeRecordDto implements SmokeRecordCreateRequest {
  @ApiProperty()
  @IsString()
  placeId!: string

  @ApiProperty()
  @IsString()
  boundaryId!: string

  @ApiProperty({ enum: ['CN_ADMIN', 'OVERSEAS_ADMIN1'] })
  @IsIn(['CN_ADMIN', 'OVERSEAS_ADMIN1'])
  placeKind!: SmokeRecordCreateRequest['placeKind']

  @ApiProperty()
  @IsString()
  datasetVersion!: string

  @ApiProperty()
  @IsString()
  displayName!: string

  @ApiProperty({ enum: ['CN', 'OVERSEAS'] })
  @IsIn(['CN', 'OVERSEAS'])
  regionSystem!: SmokeRecordCreateRequest['regionSystem']

  @ApiProperty({ enum: ['MUNICIPALITY', 'SAR', 'PREFECTURE_LEVEL_CITY', 'AUTONOMOUS_PREFECTURE', 'LEAGUE', 'AREA', 'ADMIN1'] })
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

  @ApiProperty()
  @IsString()
  typeLabel!: string

  @ApiProperty()
  @IsString()
  parentLabel!: string

  @ApiProperty()
  @IsString()
  subtitle!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string
}
