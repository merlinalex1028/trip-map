import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, ValidateNested } from 'class-validator'

import type { ImportTravelRecordsRequest } from '@trip-map/contracts'

import { CreateTravelRecordDto } from './create-travel-record.dto.js'

export class ImportTravelRecordsDto implements ImportTravelRecordsRequest {
  @ApiProperty({ type: () => [CreateTravelRecordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTravelRecordDto)
  records!: CreateTravelRecordDto[]
}
