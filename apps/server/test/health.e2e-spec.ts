import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'

import { PHASE11_CONTRACTS_VERSION } from '@trip-map/contracts'

import { createApp } from '../src/main.js'

describe('GET /health', () => {
  let app: NestFastifyApplication

  beforeAll(async () => {
    app = await createApp()
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns the shared health contract payload', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      status: 'ok',
      service: 'server',
      contractsVersion: PHASE11_CONTRACTS_VERSION,
    })
    expect(['up', 'down']).toContain(response.json().database)
  })
})
