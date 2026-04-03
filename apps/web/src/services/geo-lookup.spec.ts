import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  CITY_FALLBACK_NOTICE,
  isLowConfidenceBoundaryHit,
  lookupCountryRegionByCoordinates
} from './geo-lookup'
import { normalizedPointToGeoCoordinates } from './map-projection'

const geoJsonPayload = readFileSync(
  resolve(__dirname, '../../public/geo/country-regions.geo.json'),
  'utf-8'
)

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: async () => JSON.parse(geoJsonPayload)
}))

const RENDER_FRAME = {
  left: 160,
  top: 80,
  width: 1280,
  height: 640,
  viewBoxWidth: 1600,
  viewBoxHeight: 800
}

function renderedGeoPointToNormalizedPoint(lat: number, lng: number) {
  return {
    x: (RENDER_FRAME.left + ((lng + 180) / 360) * RENDER_FRAME.width) / RENDER_FRAME.viewBoxWidth,
    y: (RENDER_FRAME.top + ((90 - lat) / 180) * RENDER_FRAME.height) / RENDER_FRAME.viewBoxHeight
  }
}

function renderedGeoPointOffsetByPixels(lat: number, lng: number, offsetX: number, offsetY: number) {
  const point = renderedGeoPointToNormalizedPoint(lat, lng)

  return {
    x: point.x + offsetX / RENDER_FRAME.viewBoxWidth,
    y: point.y + offsetY / RENDER_FRAME.viewBoxHeight
  }
}

describe('geo lookup service', () => {
  it('detects Lisbon as Portugal', async () => {
    const result = await lookupCountryRegionByCoordinates({
      lat: 38.7223,
      lng: -9.1393
    })

    expect(result?.countryCode).toBe('PT')
    expect(result?.countryName).toBe('Portugal')
  })

  it('returns ranked city candidates for a realistic Paris click', async () => {
    const result = await lookupCountryRegionByCoordinates({
      lat: 48.8566,
      lng: 2.3522
    })

    expect(result?.countryCode).toBe('FR')
    expect(result?.precision).toBe('city-high')
    expect(result?.cityCandidates[0]).toEqual(
      expect.objectContaining({
        cityId: 'fr-paris',
        cityName: 'Paris',
        statusHint: '更接近点击位置'
      })
    )
    expect(result?.cityCandidates.length).toBeGreaterThanOrEqual(2)
  })

  it('returns ranked city candidates for a realistic New York click', async () => {
    const result = await lookupCountryRegionByCoordinates({
      lat: 40.7128,
      lng: -74.006
    })

    expect(result?.countryCode).toBe('US')
    expect(result?.cityCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          cityId: 'us-new-york',
          cityName: 'New York'
        })
      ])
    )
  })

  it('returns ranked city candidates for a realistic Budapest click', async () => {
    const result = await lookupCountryRegionByCoordinates({
      lat: 47.4979,
      lng: 19.0402
    })

    expect(result?.countryCode).toBe('HU')
    expect(result?.cityCandidates[0]).toEqual(
      expect.objectContaining({
        cityId: 'hu-budapest',
        cityName: 'Budapest',
        statusHint: '更接近点击位置'
      })
    )
  })

  it('returns ranked city candidates for a realistic Nairobi click', async () => {
    const result = await lookupCountryRegionByCoordinates({
      lat: -1.2921,
      lng: 36.8219
    })

    expect(result?.countryCode).toBe('KE')
    expect(result?.cityCandidates[0]).toEqual(
      expect.objectContaining({
        cityId: 'ke-nairobi',
        cityName: 'Nairobi',
        statusHint: '更接近点击位置'
      })
    )
  })

  it('enriches Kyoto with high-confidence city metadata', async () => {
    const result = await lookupCountryRegionByCoordinates({
      lat: 35.0116,
      lng: 135.7681
    })

    expect(result?.precision).toBe('city-high')
    expect(result?.cityName).toBe('Kyoto')
    expect(result?.displayName).toBe('Kyoto')
    expect(result?.fallbackNotice).toBeNull()
    expect(result?.cityId).toBe('jp-kyoto')
    expect(result?.cityCandidates).toEqual([
      expect.objectContaining({
        cityId: 'jp-kyoto',
        cityName: 'Kyoto',
        matchLevel: 'high',
        statusHint: '更接近点击位置'
      }),
      expect.objectContaining({
        cityId: 'jp-osaka'
      }),
      expect.objectContaining({
        cityId: 'jp-tokyo'
      })
    ])
  })

  it('detects Cairo as Egypt without low-confidence rejection', async () => {
    const result = await lookupCountryRegionByCoordinates({
      lat: 30.0444,
      lng: 31.2357
    })

    expect(result?.countryCode).toBe('EG')
    expect(result?.countryName).toBe('Egypt')
    expect(await isLowConfidenceBoundaryHit({ lat: 30.0444, lng: 31.2357 }, result ?? null)).toBe(false)
  })

  it('detects Hong Kong as a region-first display', async () => {
    const result = await lookupCountryRegionByCoordinates({
      lat: 22.3193,
      lng: 114.1694
    })

    expect(result?.countryCode).toBe('HK')
    expect(result?.displayName).toBe('Hong Kong')
    expect(result?.kind).toBe('region')
  })

  it('keeps an obvious Japan click aligned with Japan instead of inland Asia', async () => {
    const normalizedPoint = renderedGeoPointToNormalizedPoint(35.6762, 139.6503)
    const geo = normalizedPointToGeoCoordinates(normalizedPoint)
    const result = await lookupCountryRegionByCoordinates(geo)

    expect(result?.countryCode).toBe('JP')
    expect(result?.displayName).toBe('Tokyo')
  })

  it('keeps a realistic near-city click within high-confidence enrichment range', async () => {
    const normalizedPoint = renderedGeoPointOffsetByPixels(35.0116, 135.7681, 3, -2)
    const geo = normalizedPointToGeoCoordinates(normalizedPoint)
    const result = await lookupCountryRegionByCoordinates(geo)

    expect(result?.countryCode).toBe('JP')
    expect(result?.precision).toBe('city-high')
    expect(result?.cityName).toBe('Kyoto')
  })

  it('includes disambiguation context on ranked nearby city candidates', async () => {
    const result = await lookupCountryRegionByCoordinates({
      lat: 34.9,
      lng: 135.65
    })

    expect(result?.countryCode).toBe('JP')
    expect(result?.cityCandidates).toHaveLength(3)
    expect(result?.cityCandidates[0]?.distanceKm).toBeLessThanOrEqual(
      result?.cityCandidates[1]?.distanceKm ?? Number.POSITIVE_INFINITY
    )
    expect(result?.cityCandidates.map((candidate) => candidate.contextLabel)).toEqual(
      expect.arrayContaining([
        expect.any(String),
        expect.any(String),
        expect.any(String)
      ])
    )
    expect(result?.cityCandidates.every((candidate) => candidate.contextLabel !== candidate.cityName)).toBe(true)
  })

  it('keeps an obvious Hong Kong click aligned with Hong Kong instead of Myanmar', async () => {
    const normalizedPoint = renderedGeoPointToNormalizedPoint(22.3193, 114.1694)
    const geo = normalizedPointToGeoCoordinates(normalizedPoint)
    const result = await lookupCountryRegionByCoordinates(geo)

    expect(result?.countryCode).toBe('HK')
    expect(result?.displayName).toBe('Hong Kong')
  })

  it('detects Greenland with the expected display name', async () => {
    const result = await lookupCountryRegionByCoordinates({
      lat: 72,
      lng: -42
    })

    expect(result?.countryCode).toBe('GL')
    expect(result?.displayName).toBe('Greenland')
  })

  it('returns null for an Atlantic Ocean sample', async () => {
    const result = await lookupCountryRegionByCoordinates({
      lat: 25,
      lng: -30
    })

    expect(result).toBeNull()
  })

  it('falls back to the country/region copy when no reliable city candidate exists', async () => {
    const result = await lookupCountryRegionByCoordinates({
      lat: 72,
      lng: -42
    })

    expect(result?.countryCode).toBe('GL')
    expect(['country', 'region']).toContain(result?.precision)
    expect(result?.fallbackNotice).toBe(CITY_FALLBACK_NOTICE)
  })

  it('keeps a near-but-not-on city click in the country fallback path', async () => {
    const normalizedPoint = renderedGeoPointOffsetByPixels(35.0116, 135.7681, -12, 0)
    const geo = normalizedPointToGeoCoordinates(normalizedPoint)
    const result = await lookupCountryRegionByCoordinates(geo)

    expect(result?.countryCode).toBe('JP')
    expect(result?.cityId).toBeNull()
    expect(result?.precision).toBe('city-possible')
    expect(result?.fallbackNotice).toBe('未能可靠确认城市，已提供国家/地区继续记录')
    expect(result?.cityCandidates).toContainEqual(
      expect.objectContaining({
        cityId: 'jp-kyoto',
        cityName: 'Kyoto',
        matchLevel: 'possible',
        statusHint: '可能位置，需要确认'
      })
    )
  })
})
