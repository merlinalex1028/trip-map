import { IsNotEmpty, IsString } from 'class-validator'

import { ResolveCanonicalPlaceDto } from './resolve-canonical-place.dto.js'

export class ConfirmCanonicalPlaceDto extends ResolveCanonicalPlaceDto {
  @IsString()
  @IsNotEmpty()
  candidatePlaceId!: string
}
