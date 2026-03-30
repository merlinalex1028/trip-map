import { Type } from 'class-transformer'
import { IsNumber } from 'class-validator'

export class ResolveCanonicalPlaceDto {
  @Type(() => Number)
  @IsNumber({
    allowInfinity: false,
    allowNaN: false,
  })
  lat!: number

  @Type(() => Number)
  @IsNumber({
    allowInfinity: false,
    allowNaN: false,
  })
  lng!: number
}
