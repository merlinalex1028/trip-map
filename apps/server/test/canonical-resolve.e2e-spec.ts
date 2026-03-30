import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'

import { createApp } from '../src/main.js'

describe('POST /places canonical resolve', () => {
  let app: NestFastifyApplication

  beforeAll(async () => {
    app = await createApp()
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns resolved for the Beijing fixture', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 39.9042,
        lng: 116.4074,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'resolved',
      place: {
        placeId: 'cn-beijing',
      },
    })
  })

  it('returns ambiguous candidates capped at 3', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 39.5432,
        lng: 116.7921,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().status).toBe('ambiguous')
    expect(response.json().candidates.length).toBeLessThanOrEqual(3)
  })

  it('rejects unknown confirmation candidates with CANDIDATE_MISMATCH', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/confirm',
      payload: {
        lat: 39.5432,
        lng: 116.7921,
        candidatePlaceId: 'cn-beijing-not-in-set',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'failed',
      reason: 'CANDIDATE_MISMATCH',
    })
    expect(response.json()).not.toHaveProperty('place')
  })
})
