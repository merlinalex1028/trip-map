import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'
import type { LoginRequest } from '@trip-map/contracts'

export class LoginDto implements LoginRequest {
  @IsEmail()
  @MaxLength(320)
  email!: string

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string
}
