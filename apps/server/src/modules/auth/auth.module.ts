import { Module } from '@nestjs/common'

import { PrismaModule } from '../../prisma/prisma.module.js'
import { AuthController } from './auth.controller.js'
import { AuthRepository } from './auth.repository.js'
import { AuthService } from './auth.service.js'
import { SessionAuthGuard } from './guards/session-auth.guard.js'

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthRepository, AuthService, SessionAuthGuard],
  exports: [AuthService, AuthRepository, SessionAuthGuard],
})
export class AuthModule {}
