import { Inject, Injectable } from '@nestjs/common'
import type { AuthSession, Prisma, User, UserTravelRecord } from '@prisma/client'

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

  async createUserWithSession(input: {
    username: string
    email: string
    passwordHash: string
    expiresAt: Date
  }): Promise<{ user: User, session: AuthSession }> {
    return this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          username: input.username,
          email: input.email,
          passwordHash: input.passwordHash,
        },
      })

      const session = await transaction.authSession.create({
        data: {
          userId: user.id,
          expiresAt: input.expiresAt,
        },
      })

      return { user, session }
    })
  }

  async findActiveSessionWithUserById(
    sessionId: string,
    now: Date,
  ): Promise<(AuthSession & { user: User }) | null> {
    return this.prisma.authSession.findFirst({
      where: {
        id: sessionId,
        expiresAt: {
          gt: now,
        },
      },
      include: {
        user: true,
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

  async findUserTravelRecordsByUserId(userId: string): Promise<UserTravelRecord[]> {
    return this.prisma.userTravelRecord.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'asc',
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
