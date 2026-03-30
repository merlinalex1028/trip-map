import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'

import { PHASE11_SMOKE_RECORD_REQUEST } from '@trip-map/contracts'

import { createApp } from '../src/main.js'

describe('POST /records/smoke', () => {
  let app: NestFastifyApplication

  beforeAll(async () => {
    app = await createApp()
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('accepts the shared canonical place fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/records/smoke',
      payload: {
        ...PHASE11_SMOKE_RECORD_REQUEST,
        note: 'Smoke test note'
      }
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      ...PHASE11_SMOKE_RECORD_REQUEST,
      note: 'Smoke test note'
    })
    expect(response.json().id).toEqual(expect.any(String))
    expect(response.json().createdAt).toEqual(expect.any(String))
    expect(response.json().updatedAt).toEqual(expect.any(String))
  })

  it('rejects unknown fields via forbidNonWhitelisted validation', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/records/smoke',
      payload: {
        ...PHASE11_SMOKE_RECORD_REQUEST,
        unknownField: true
      }
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toContain('property unknownField should not exist')
  })
})
