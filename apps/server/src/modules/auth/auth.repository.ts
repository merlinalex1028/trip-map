import { Inject, Injectable } from '@nestjs/common'
import type { AuthSession, Prisma, User } from '@prisma/client'

import { PrismaService } from '../../prisma/prisma.service.js'

@Injectable()
export class AuthRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  async createUser(input: {
    username: string
    email: string
    passwordHash: string
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        passwordHash: input.passwordHash,
      },
    })
  }

  async createSession(input: {
    userId: string
    expiresAt: Date
  }): Promise<AuthSession> {
    return this.prisma.authSession.create({
      data: {
        userId: input.userId,
        expiresAt: input.expiresAt,
      },
    })
  }

  async findActiveSessionById(sessionId: string, now: Date): Promise<AuthSession | null> {
    return this.prisma.authSession.findFirst({
      where: {
        id: sessionId,
        expiresAt: {
          gt: now,
        },
      },
    })
  }

  async deleteSessionById(sessionId: string): Promise<Prisma.BatchPayload> {
    return this.prisma.authSession.deleteMany({
      where: {
        id: sessionId,
      },
    })
  }
}
