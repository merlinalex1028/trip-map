import { IsNotEmpty, IsString } from 'class-validator'

export class CreateTravelRecordDto {
  @IsString()
  @IsNotEmpty()
  placeId!: string

  @IsString()
  @IsNotEmpty()
  boundaryId!: string

  @IsString()
  @IsNotEmpty()
  placeKind!: string

  @IsString()
  @IsNotEmpty()
  datasetVersion!: string

  @IsString()
  @IsNotEmpty()
  displayName!: string

  @IsString()
  @IsNotEmpty()
  subtitle!: string
}
