import argon2 from 'argon2'
import { ConflictException } from '@nestjs/common'
import type { AuthSession, User, UserTravelRecord } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { describe, expect, it, vi } from 'vitest'

import { AuthService, SESSION_MAX_AGE_SECONDS } from './auth.service.js'

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    username: 'traveler',
    email: 'traveler@example.com',
    passwordHash: 'hashed-password',
    createdAt: new Date('2026-04-12T00:00:00.000Z'),
    updatedAt: new Date('2026-04-12T00:00:00.000Z'),
    ...overrides,
  }
}

function createSession(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    id: 'session-1',
    userId: 'user-1',
    expiresAt: new Date('2026-05-12T00:00:00.000Z'),
    createdAt: new Date('2026-04-12T00:00:00.000Z'),
    ...overrides,
  }
}

function createTravelRecord(overrides: Partial<UserTravelRecord> = {}): UserTravelRecord {
  return {
    id: 'rec-1',
    userId: 'user-1',
    placeId: 'cn-admin-beijing',
    boundaryId: 'cn-admin-beijing-boundary',
    placeKind: 'CN_ADMIN',
    datasetVersion: 'cn-admin-2024-r1',
    displayName: '北京市',
    regionSystem: 'CN',
    adminType: 'MUNICIPALITY',
    typeLabel: '直辖市',
    parentLabel: '中国',
    subtitle: '直辖市 · 中国',
    startDate: null,
    endDate: null,
    notes: null,
    tags: [],
    createdAt: new Date('2026-04-20T00:00:00.000Z'),
    updatedAt: new Date('2026-04-20T00:00:00.000Z'),
    ...overrides,
  }
}

function createRepositoryMock() {
  return {
    createUserWithSession: vi.fn(),
    createUser: vi.fn(),
    createSession: vi.fn(),
    findUserByEmail: vi.fn(),
    findActiveSessionById: vi.fn(),
    findActiveSessionWithUserById: vi.fn(),
    findUserTravelRecordsByUserId: vi.fn(),
    deleteSessionById: vi.fn(),
  }
}

describe('AuthService.register', () => {
  it('uses createUserWithSession as the single persistence path', async () => {
    const user = createUser()
    const session = createSession()
    const authRepository = createRepositoryMock()
    const service = new AuthService(authRepository as never)

    authRepository.createUserWithSession.mockResolvedValueOnce({ user, session })

    const hashSpy = vi.spyOn(argon2, 'hash').mockResolvedValueOnce('hashed-password' as never)

    const response = await service.register({
      username: user.username,
      email: ' Traveler@Example.com ',
      password: 'Passw0rd!123',
    })

    expect(hashSpy).toHaveBeenCalledWith('Passw0rd!123')
    expect(authRepository.createUserWithSession).toHaveBeenCalledTimes(1)
    expect(authRepository.createUserWithSession).toHaveBeenCalledWith({
      username: user.username,
      email: 'traveler@example.com',
      passwordHash: 'hashed-password',
      expiresAt: expect.any(Date),
    })

    const expiresAt = authRepository.createUserWithSession.mock.calls[0]?.[0]?.expiresAt as Date
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now())
    expect(expiresAt.getTime()).toBeLessThanOrEqual(
      Date.now() + SESSION_MAX_AGE_SECONDS * 1000 + 1_000,
    )

    expect(authRepository.createUser).not.toHaveBeenCalled()
    expect(authRepository.createSession).not.toHaveBeenCalled()
    expect(response).toEqual({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
      sessionId: session.id,
    })
  })

  it('surfaces transactional session creation failures without returning success data', async () => {
    const authRepository = createRepositoryMock()
    const service = new AuthService(authRepository as never)
    const failure = new Error('session create failure')

    authRepository.createUserWithSession.mockRejectedValueOnce(failure)
    vi.spyOn(argon2, 'hash').mockResolvedValueOnce('hashed-password' as never)

    await expect(
      service.register({
        username: 'traveler',
        email: 'traveler@example.com',
        password: 'Passw0rd!123',
      }),
    ).rejects.toThrow('session create failure')

    expect(authRepository.createUser).not.toHaveBeenCalled()
    expect(authRepository.createSession).not.toHaveBeenCalled()
  })

  it('maps unique constraint failures to ConflictException', async () => {
    const authRepository = createRepositoryMock()
    const service = new AuthService(authRepository as never)
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`email`)',
      {
        code: 'P2002',
        clientVersion: 'test',
      },
    )

    authRepository.createUserWithSession.mockRejectedValueOnce(prismaError)
    vi.spyOn(argon2, 'hash').mockResolvedValueOnce('hashed-password' as never)

    await expect(
      service.register({
        username: 'traveler',
        email: 'traveler@example.com',
        password: 'Passw0rd!123',
      }),
    ).rejects.toBeInstanceOf(ConflictException)
  })
})

describe('AuthService.bootstrap', () => {
  it('returns records with startDate/endDate on the authenticated path', async () => {
    const user = createUser()
    const session = createSession()
    const authRepository = createRepositoryMock()
    const service = new AuthService(authRepository as never)

    authRepository.findActiveSessionWithUserById.mockResolvedValueOnce({ ...session, user })
    authRepository.findUserTravelRecordsByUserId.mockResolvedValueOnce([
      createTravelRecord({
        startDate: '2025-10-01',
        endDate: '2025-10-07',
      }),
    ])

    const response = await service.bootstrap('session-1')

    expect(response.clearSessionCookie).toBe(false)
    expect(response.response.authenticated).toBe(true)
    if (response.response.authenticated) {
      expect(response.response.records[0]).toMatchObject({
        startDate: '2025-10-01',
        endDate: '2025-10-07',
      })
    }
  })

  it('maps legacy records with null dates to explicit null fields', async () => {
    const user = createUser()
    const session = createSession()
    const authRepository = createRepositoryMock()
    const service = new AuthService(authRepository as never)

    authRepository.findActiveSessionWithUserById.mockResolvedValueOnce({ ...session, user })
    authRepository.findUserTravelRecordsByUserId.mockResolvedValueOnce([
      createTravelRecord({
        startDate: null,
        endDate: null,
      }),
    ])

    const response = await service.bootstrap('session-1')

    expect(response.clearSessionCookie).toBe(false)
    expect(response.response.authenticated).toBe(true)
    if (response.response.authenticated) {
      expect(response.response.records[0]).toMatchObject({
        startDate: null,
        endDate: null,
      })
    }
  })
})
