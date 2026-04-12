import argon2 from 'argon2'
import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import type { AuthUser, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@trip-map/contracts'
import { Prisma, type User } from '@prisma/client'

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
}
