import { IsOptional, IsString, Matches, MaxLength, ArrayMaxSize } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import type { UpdateTravelRecordRequest } from '@trip-map/contracts'

export class UpdateTravelRecordDto implements UpdateTravelRecordRequest {
  @ApiProperty({ nullable: true, example: '2025-10-01', required: false })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be YYYY-MM-DD' })
  startDate?: string | null

  @ApiProperty({ nullable: true, example: '2025-10-07', required: false })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be YYYY-MM-DD' })
  endDate?: string | null

  @ApiProperty({ nullable: true, example: '这是一条备注', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'notes must be at most 1000 characters' })
  notes?: string | null

  @ApiProperty({ type: [String], required: false, example: ['美食', '文化'] })
  @IsOptional()
  @IsString({ each: true, message: 'each tag must be a string' })
  @MaxLength(20, { each: true, message: 'each tag must be at most 20 characters' })
  @ArrayMaxSize(10, { message: 'tags must contain at most 10 items' })
  tags?: string[]
}
