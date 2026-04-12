import { Transform } from 'class-transformer'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'
import type { RegisterRequest } from '@trip-map/contracts'

export class RegisterDto implements RegisterRequest {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  username!: string

  @IsEmail()
  @MaxLength(320)
  email!: string

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string
}
