import { NestFactory } from '@nestjs/core'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'

import { PHASE11_SMOKE_RECORD_REQUEST } from '@trip-map/contracts'

import { AppModule } from '../src/app.module.js'

describe('POST /records/smoke', () => {
  let app: Awaited<ReturnType<typeof NestFactory.create>>

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, new FastifyAdapter())
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('accepts the shared canonical place fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/records/smoke')
      .send({
        ...PHASE11_SMOKE_RECORD_REQUEST,
        note: 'Smoke test note'
      })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      ...PHASE11_SMOKE_RECORD_REQUEST,
      note: 'Smoke test note'
    })
    expect(response.body.id).toEqual(expect.any(String))
    expect(response.body.createdAt).toEqual(expect.any(String))
    expect(response.body.updatedAt).toEqual(expect.any(String))
  })

  it('rejects unknown fields via forbidNonWhitelisted validation', async () => {
    const response = await request(app.getHttpServer())
      .post('/records/smoke')
      .send({
        ...PHASE11_SMOKE_RECORD_REQUEST,
        unknownField: true
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('property unknownField should not exist')
  })
})
