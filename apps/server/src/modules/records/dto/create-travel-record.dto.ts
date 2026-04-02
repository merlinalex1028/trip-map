import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import type { CreateTravelRecordRequest } from '@trip-map/contracts'

export class CreateTravelRecordDto implements CreateTravelRecordRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  placeId!: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  boundaryId!: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  placeKind!: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  datasetVersion!: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  displayName!: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  regionSystem!: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  adminType!: string

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
