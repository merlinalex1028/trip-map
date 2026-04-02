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
        typeLabel: '直辖市',
      },
    })
  })

  it('returns resolved Beijing with manifest-backed geometryRef', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 39.9042,
        lng: 116.4074,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().place.geometryRef.assetKey).toBe('cn/layer.json')
    expect(response.json().place.geometryRef.layer).toBe('CN')
    expect(response.json().place.geometryRef.geometryDatasetVersion).toBe('2026-04-02-geo-v2')
  })

  it('resolves a non-representative click inside Beijing via geometry instead of exact fixture hit', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 39.904989,
        lng: 116.405285,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'resolved',
      place: {
        placeId: 'cn-beijing',
        typeLabel: '直辖市',
      },
    })
  })

  it('returns resolved for the Hong Kong fixture with SAR semantics', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 22.3193,
        lng: 114.1694,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'resolved',
      place: {
        placeId: 'cn-hong-kong',
        typeLabel: '特别行政区',
      },
    })
  })

  it('returns resolved Hong Kong with manifest-backed geometryRef', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 22.3193,
        lng: 114.1694,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().place.geometryRef.assetKey).toBe('cn/layer.json')
    expect(response.json().place.geometryRef.layer).toBe('CN')
  })

  it('returns resolved for the California fixture with overseas admin1 semantics', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 36.7783,
        lng: -119.4179,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'resolved',
      place: {
        placeId: 'us-california',
        placeKind: 'OVERSEAS_ADMIN1',
        typeLabel: '一级行政区',
      },
    })
  })

  it('returns resolved California with manifest-backed geometryRef', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 36.7783,
        lng: -119.4179,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().place.geometryRef.assetKey).toBe('overseas/layer.json')
    expect(response.json().place.geometryRef.layer).toBe('OVERSEAS')
    expect(response.json().place.geometryRef.geometryDatasetVersion).toBe('2026-04-02-geo-v2')
  })

  it('resolves Los Angeles to the authoritative California admin1 fixture', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 34.0522,
        lng: -118.2437,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'resolved',
      place: {
        placeId: 'us-california',
        datasetVersion: '2026-04-02-geo-v2',
        typeLabel: '一级行政区',
      },
    })
  })

  it('resolves San Francisco to the authoritative California admin1 fixture', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 37.7749,
        lng: -122.4194,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'resolved',
      place: {
        placeId: 'us-california',
        datasetVersion: '2026-04-02-geo-v2',
        typeLabel: '一级行政区',
      },
    })
  })

  it('resolves Utah clicks to Utah instead of California', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 40.7608,
        lng: -111.891,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'resolved',
      place: {
        placeId: 'us-utah',
        typeLabel: '一级行政区',
      },
    })
  })

  it('returns ambiguous candidates capped at 3 with an explicit recommendation slot', async () => {
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
    expect(response.json().recommendedPlaceId).toBe('cn-beijing')
    expect(response.json().candidates.length).toBeLessThanOrEqual(3)
  })

  it('resolves a non-representative click inside Tianjin via geometry instead of exact fixture hit', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 39.125596,
        lng: 117.190182,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'resolved',
      place: {
        placeId: 'cn-tianjin',
        typeLabel: '直辖市',
      },
    })
  })

  it('resolves Guangzhou to a prefecture-level city from the full DataV city layer', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 23.1291,
        lng: 113.2644,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'resolved',
      place: {
        placeId: 'cn-440100',
        displayName: '广州',
        typeLabel: '地级市',
        parentLabel: '中国 · 广东',
      },
    })
  })

  it('returns ambiguous candidates each with a manifest-backed geometryRef', async () => {
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
    const candidates = response.json().candidates as Array<{ geometryRef?: unknown }>
    expect(candidates[0]).toHaveProperty('geometryRef')
  })

  it('resolves a legal candidate through /places/confirm', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/confirm',
      payload: {
        lat: 39.5432,
        lng: 116.7921,
        candidatePlaceId: 'cn-tianjin',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'resolved',
      place: {
        placeId: 'cn-tianjin',
        typeLabel: '直辖市',
      },
    })
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

  it('returns strict failed without place payload when no canonical match exists', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 0,
        lng: 0,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'failed',
      reason: 'NO_CANONICAL_MATCH',
    })
    expect(response.json()).not.toHaveProperty('place')
    expect(response.json()).not.toHaveProperty('geometry')
    expect(response.json()).not.toHaveProperty('features')
  })

  it('returns product-level OUTSIDE_SUPPORTED_DATA messaging for unsupported clicks', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 35.6764,
        lng: 139.65,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'failed',
      reason: 'OUTSIDE_SUPPORTED_DATA',
      message: '当前点击位置暂未命中已接入的正式行政区数据。',
    })
    expect(response.json()).not.toHaveProperty('place')
  })
})
