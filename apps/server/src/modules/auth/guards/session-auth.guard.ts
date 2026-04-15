import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import type { AuthUser } from '@trip-map/contracts'
import type { FastifyRequest } from 'fastify'

import { AuthService } from '../auth.service.js'

type AuthenticatedRequest = FastifyRequest & {
  authUser?: AuthUser
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const sessionId = request.cookies?.sid

    if (!sessionId) {
      throw new UnauthorizedException('Authentication required')
    }

    const authUser = await this.authService.resolveAuthenticatedUserFromSession(sessionId)

    if (!authUser) {
      throw new UnauthorizedException('Authentication required')
    }

    request.authUser = authUser

    return true
  }
}
