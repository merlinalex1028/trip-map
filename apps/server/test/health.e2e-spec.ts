import { NestFactory } from '@nestjs/core'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'

import { PHASE11_CONTRACTS_VERSION } from '@trip-map/contracts'

import { AppModule } from '../src/app.module.js'

describe('GET /health', () => {
  let app: Awaited<ReturnType<typeof NestFactory.create>>

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, new FastifyAdapter())
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns the shared health contract payload', async () => {
    const response = await request(app.getHttpServer()).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      status: 'ok',
      service: 'server',
      contractsVersion: PHASE11_CONTRACTS_VERSION,
      database: 'down'
    })
  })
})
