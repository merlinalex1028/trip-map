import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateTravelRecordDto {
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
  subtitle!: string
}
