import { UnauthorizedException } from '@nestjs/common'
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants'
import { RouteParamtypes } from '@nestjs/common/enums/route-paramtypes.enum'
import type { ExecutionContext } from '@nestjs/common'
import type { AuthUser } from '@trip-map/contracts'
import { describe, expect, it, vi } from 'vitest'

import { CurrentUser } from '../decorators/current-user.decorator.js'
import { SessionAuthGuard } from './session-auth.guard.js'

type RequestWithAuthContext = {
  cookies?: Record<string, string | undefined>
  body?: Record<string, unknown>
  query?: Record<string, unknown>
  headers?: Record<string, unknown>
  authUser?: AuthUser
}

function createExecutionContext(request: RequestWithAuthContext): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext
}

function readCurrentUserFactory() {
  class TestController {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handler(@CurrentUser() _user: AuthUser) {}
  }

  const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestController, 'handler') as Record<
    string,
    { factory: (data: unknown, context: ExecutionContext) => AuthUser | undefined }
  >

  const entry = metadata[`${RouteParamtypes.CUSTOM}:0`]

  return entry.factory
}

describe('SessionAuthGuard', () => {
  it('throws UnauthorizedException when request.cookies.sid is missing', async () => {
    const authService = {
      resolveAuthenticatedUserFromSession: vi.fn(),
    }
    const guard = new SessionAuthGuard(authService as never)

    await expect(guard.canActivate(createExecutionContext({}))).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
    expect(authService.resolveAuthenticatedUserFromSession).not.toHaveBeenCalled()
  })

  it('returns true and writes request.authUser when sid resolves to the current user', async () => {
    const authUser: AuthUser = {
      id: 'user-123',
      username: 'traveler',
      email: 'traveler@example.com',
      createdAt: '2026-04-12T00:00:00.000Z',
    }
    const authService = {
      resolveAuthenticatedUserFromSession: vi.fn().mockResolvedValue(authUser),
    }
    const guard = new SessionAuthGuard(authService as never)
    const request: RequestWithAuthContext = {
      cookies: {
        sid: 'valid-session-id',
      },
    }

    await expect(guard.canActivate(createExecutionContext(request))).resolves.toBe(true)
    expect(authService.resolveAuthenticatedUserFromSession).toHaveBeenCalledWith('valid-session-id')
    expect(request.authUser).toEqual(authUser)
  })

  it('throws UnauthorizedException when sid does not resolve to an authenticated user', async () => {
    const authService = {
      resolveAuthenticatedUserFromSession: vi.fn().mockResolvedValue(null),
    }
    const guard = new SessionAuthGuard(authService as never)

    await expect(
      guard.canActivate(createExecutionContext({
        cookies: {
          sid: 'invalid-session-id',
        },
      })),
    ).rejects.toBeInstanceOf(UnauthorizedException)
    expect(authService.resolveAuthenticatedUserFromSession).toHaveBeenCalledWith('invalid-session-id')
  })

  it('ignores forged owner hints from body, query, and headers and only trusts cookies.sid', async () => {
    const authUser: AuthUser = {
      id: 'user-cookie',
      username: 'cookie-user',
      email: 'cookie@example.com',
      createdAt: '2026-04-12T00:00:00.000Z',
    }
    const authService = {
      resolveAuthenticatedUserFromSession: vi.fn().mockResolvedValue(authUser),
    }
    const guard = new SessionAuthGuard(authService as never)
    const request: RequestWithAuthContext = {
      cookies: {
        sid: 'cookie-session-id',
      },
      body: {
        userId: 'body-user-id',
        ownerId: 'body-owner-id',
      },
      query: {
        userId: 'query-user-id',
        owner: 'query-owner-id',
      },
      headers: {
        'x-user-id': 'header-user-id',
        'x-owner-id': 'header-owner-id',
      },
    }

    await expect(guard.canActivate(createExecutionContext(request))).resolves.toBe(true)
    expect(authService.resolveAuthenticatedUserFromSession).toHaveBeenCalledWith('cookie-session-id')
    expect(request.authUser).toEqual(authUser)
  })
})

describe('CurrentUser decorator', () => {
  it('reads the authenticated user from request.authUser', () => {
    const authUser: AuthUser = {
      id: 'user-456',
      username: 'decorator-user',
      email: 'decorator@example.com',
      createdAt: '2026-04-12T00:00:00.000Z',
    }
    const request: RequestWithAuthContext = {
      authUser,
    }
    const factory = readCurrentUserFactory()

    expect(factory(undefined, createExecutionContext(request))).toEqual(authUser)
  })
})
