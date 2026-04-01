import { Type } from 'class-transformer'
import { IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ResolveCanonicalPlaceDto {
  @ApiProperty({ description: '纬度' })
  @Type(() => Number)
  @IsNumber({
    allowInfinity: false,
    allowNaN: false,
  })
  lat!: number

  @ApiProperty({ description: '经度' })
  @Type(() => Number)
  @IsNumber({
    allowInfinity: false,
    allowNaN: false,
  })
  lng!: number
}
