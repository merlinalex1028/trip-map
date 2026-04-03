import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import type {
  ChinaAdminType,
  CreateTravelRecordRequest,
  PlaceKind,
} from '@trip-map/contracts'

export class CreateTravelRecordDto implements CreateTravelRecordRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  placeId!: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  boundaryId!: string

  @ApiProperty({ enum: ['CN_ADMIN', 'OVERSEAS_ADMIN1'] })
  @IsEnum(['CN_ADMIN', 'OVERSEAS_ADMIN1'])
  @IsNotEmpty()
  placeKind!: PlaceKind

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  datasetVersion!: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  displayName!: string

  @ApiProperty({ enum: ['CN', 'OVERSEAS'] })
  @IsEnum(['CN', 'OVERSEAS'])
  @IsNotEmpty()
  regionSystem!: 'CN' | 'OVERSEAS'

  @ApiProperty({
    enum: ['MUNICIPALITY', 'SAR', 'PREFECTURE_LEVEL_CITY', 'AUTONOMOUS_PREFECTURE', 'LEAGUE', 'AREA', 'ADMIN1'],
  })
  @IsEnum(['MUNICIPALITY', 'SAR', 'PREFECTURE_LEVEL_CITY', 'AUTONOMOUS_PREFECTURE', 'LEAGUE', 'AREA', 'ADMIN1'])
  @IsNotEmpty()
  adminType!: ChinaAdminType | 'ADMIN1'

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  typeLabel!: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  parentLabel!: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subtitle!: string
}
