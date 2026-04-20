import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, ValidateNested } from 'class-validator'

import { CreateTravelRecordDto } from './create-travel-record.dto.js'

export class ImportTravelRecordsDto {
  @ApiProperty({ type: () => [CreateTravelRecordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTravelRecordDto)
  records!: CreateTravelRecordDto[]
}
