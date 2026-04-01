import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import { ResolveCanonicalPlaceDto } from './resolve-canonical-place.dto.js'

export class ConfirmCanonicalPlaceDto extends ResolveCanonicalPlaceDto {
  @ApiProperty({ description: '候选地点 ID' })
  @IsString()
  @IsNotEmpty()
  candidatePlaceId!: string
}
