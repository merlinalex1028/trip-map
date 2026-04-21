import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'

import { createApp } from '../src/main.js'
import { PHASE28_NEW_COUNTRY_CASES } from './phase28-overseas-cases.ts'

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
    expect(response.json().place.geometryRef.geometryDatasetVersion).toBe('2026-04-21-geo-v3')
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
        typeLabel: 'State',
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
    expect(response.json().place.geometryRef.geometryDatasetVersion).toBe('2026-04-21-geo-v3')
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
        datasetVersion: '2026-04-21-geo-v3',
        typeLabel: 'State',
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
        datasetVersion: '2026-04-21-geo-v3',
        typeLabel: 'State',
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
        typeLabel: 'State',
      },
    })
  })

  it('resolves Tokyo to the authoritative Japan admin1 entry', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 35.6762,
        lng: 139.6503,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'resolved',
      place: {
        placeId: 'jp-tokyo',
        displayName: 'Tokyo',
        typeLabel: 'Prefecture',
        subtitle: 'Japan · Prefecture',
      },
    })
  })

  it('resolves Gangwon to the authoritative Korea admin1 entry', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 37.8228,
        lng: 128.1555,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'resolved',
      place: {
        placeId: 'kr-gangwon',
        displayName: 'Gangwon',
        typeLabel: 'Province',
        subtitle: 'South Korea · Province',
      },
    })
    expect(response.json().place.placeId).toMatch(/^kr-/)
  })

  it('resolves Dubai without exposing filtered AE noise identities', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 25.2048,
        lng: 55.2708,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'resolved',
      place: {
        placeId: 'ae-emirate-of-dubai',
        boundaryId: 'ne-admin1-ae-emirate-of-dubai',
        displayName: 'Emirate of Dubai',
        typeLabel: 'Emirate',
      },
    })
    expect(response.json().place.placeId).not.toMatch(/ae-x|au-x/i)
    expect(response.json().place.boundaryId).not.toMatch(/ae-x|au-x/i)
    expect(response.json().place.geometryRef.boundaryId).toBe('ne-admin1-ae-emirate-of-dubai')
  })

  it('resolves every Phase 28 new-country probe with authoritative metadata from the shared matrix', async () => {
    expect(PHASE28_NEW_COUNTRY_CASES).toHaveLength(13)

    for (const phase28Case of PHASE28_NEW_COUNTRY_CASES) {
      const response = await app.inject({
        method: 'POST',
        url: '/places/resolve',
        payload: {
          lat: phase28Case.lat,
          lng: phase28Case.lng,
        },
      })

      expect(response.statusCode).toBe(201)
      expect(response.json()).toMatchObject({
        status: 'resolved',
        place: {
          placeKind: 'OVERSEAS_ADMIN1',
          datasetVersion: '2026-04-21-geo-v3',
          displayName: phase28Case.displayName,
          typeLabel: phase28Case.expectedTypeLabel,
          parentLabel: phase28Case.countryLabel,
          subtitle: `${phase28Case.countryLabel} · ${phase28Case.expectedTypeLabel}`,
          placeId: phase28Case.expectedPlaceId,
          boundaryId: phase28Case.expectedBoundaryId,
          geometryRef: {
            assetKey: 'overseas/layer.json',
            geometryDatasetVersion: '2026-04-21-geo-v3',
          },
        },
      })

      if (phase28Case.iso2 === 'EG') {
        expect(response.json().place.typeLabel).toBe('Governorate')
      }
    }
  })

  it('rejects filtered AU noise clicks outside the supported admin1 catalog', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: -54.5929,
        lng: 158.898,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'failed',
      reason: 'OUTSIDE_SUPPORTED_DATA',
    })
    expect(response.json()).not.toHaveProperty('place')
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
        lat: 25.0,
        lng: -160.0,
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

  it('returns OUTSIDE_SUPPORTED_DATA for unsupported overseas clicks without a place payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/places/resolve',
      payload: {
        lat: 19.4326,
        lng: -99.1332,
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
