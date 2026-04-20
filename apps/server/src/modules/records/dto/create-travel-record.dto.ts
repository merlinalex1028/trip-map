import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import type {
  ChinaAdminType,
  PlaceKind,
} from '@trip-map/contracts'

export class CreateTravelRecordDto {
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

  @ApiProperty({ nullable: true, example: '2025-10-01', required: false })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be YYYY-MM-DD' })
  startDate?: string | null

  @ApiProperty({ nullable: true, example: '2025-10-07', required: false })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be YYYY-MM-DD' })
  endDate?: string | null
}
