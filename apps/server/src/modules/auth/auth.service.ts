import argon2 from 'argon2'
import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import type {
  AuthBootstrapResponse,
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  TravelRecord,
} from '@trip-map/contracts'
import { Prisma, type User, type UserTravelRecord } from '@prisma/client'

import { AuthRepository } from './auth.repository.js'

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

function isPrismaUniqueConstraintError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  }
}

function toContractTravelRecord(record: UserTravelRecord): TravelRecord {
  return {
    id: record.id,
    placeId: record.placeId,
    boundaryId: record.boundaryId,
    placeKind: record.placeKind as TravelRecord['placeKind'],
    datasetVersion: record.datasetVersion,
    displayName: record.displayName,
    regionSystem: record.regionSystem as TravelRecord['regionSystem'],
    adminType: record.adminType as TravelRecord['adminType'],
    typeLabel: record.typeLabel ?? '',
    parentLabel: record.parentLabel ?? '',
    subtitle: record.subtitle,
    createdAt: record.createdAt.toISOString(),
  }
}

export type SessionRestoreResult
  = | { kind: 'missing' }
    | { kind: 'invalid' }
    | {
      kind: 'authenticated'
      session: {
        sessionId: string
        userId: string
        user: AuthUser
      }
    }

@Injectable()
export class AuthService {
  constructor(
    @Inject(AuthRepository)
    private readonly authRepository: AuthRepository,
  ) {}

  async register(input: RegisterRequest): Promise<RegisterResponse & { sessionId: string }> {
    const email = normalizeEmail(input.email)
    const passwordHash = await argon2.hash(input.password)

    try {
      const user = await this.authRepository.createUser({
        username: input.username.trim(),
        email,
        passwordHash,
      })
      const session = await this.authRepository.createSession({
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
      })

      return {
        user: toAuthUser(user),
        sessionId: session.id,
      }
    }
    catch (error: unknown) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException('Email already exists')
      }

      throw error
    }
  }

  async login(input: LoginRequest): Promise<LoginResponse & { sessionId: string }> {
    const user = await this.authRepository.findUserByEmail(normalizeEmail(input.email))

    if (!user) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const passwordMatches = await argon2.verify(user.passwordHash, input.password)

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const session = await this.authRepository.createSession({
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
    })

    return {
      user: toAuthUser(user),
      sessionId: session.id,
    }
  }

  async logout(sessionId: string | undefined): Promise<void> {
    if (!sessionId) {
      return
    }

    const session = await this.authRepository.findActiveSessionById(sessionId, new Date())

    if (!session) {
      return
    }

    await this.authRepository.deleteSessionById(session.id)
  }

  async restoreSession(sessionId: string | undefined): Promise<SessionRestoreResult> {
    if (!sessionId) {
      return { kind: 'missing' }
    }

    const session = await this.authRepository.findActiveSessionWithUserById(sessionId, new Date())

    if (!session) {
      await this.authRepository.deleteSessionById(sessionId)
      return { kind: 'invalid' }
    }

    return {
      kind: 'authenticated',
      session: {
        sessionId: session.id,
        userId: session.userId,
        user: toAuthUser(session.user),
      },
    }
  }

  async bootstrap(sessionId: string | undefined): Promise<{
    response: AuthBootstrapResponse
    clearSessionCookie: boolean
  }> {
    const restoredSession = await this.restoreSession(sessionId)

    if (restoredSession.kind === 'missing') {
      return {
        response: { authenticated: false },
        clearSessionCookie: false,
      }
    }

    if (restoredSession.kind === 'invalid') {
      return {
        response: { authenticated: false },
        clearSessionCookie: true,
      }
    }

    const records = await this.authRepository.findUserTravelRecordsByUserId(
      restoredSession.session.userId,
    )

    return {
      response: {
        authenticated: true,
        user: restoredSession.session.user,
        records: records.map(toContractTravelRecord),
      },
      clearSessionCookie: false,
    }
  }
}
