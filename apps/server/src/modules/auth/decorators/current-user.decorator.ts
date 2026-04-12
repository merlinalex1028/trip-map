import { createParamDecorator } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import type { AuthUser } from '@trip-map/contracts'
import type { FastifyRequest } from 'fastify'

type AuthenticatedRequest = FastifyRequest & {
  authUser?: AuthUser
}

export function getCurrentUserFromRequest(request: AuthenticatedRequest): AuthUser | undefined {
  return request.authUser
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser | undefined => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()

    return getCurrentUserFromRequest(request)
  },
)
