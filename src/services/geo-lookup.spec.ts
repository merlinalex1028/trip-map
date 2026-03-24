import { isLowConfidenceBoundaryHit, lookupCountryRegionByCoordinates } from './geo-lookup'
import { normalizedPointToGeoCoordinates } from './map-projection'

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

describe('geo lookup service', () => {
  it('detects Lisbon as Portugal', () => {
    const result = lookupCountryRegionByCoordinates({
      lat: 38.7223,
      lng: -9.1393
    })

    expect(result?.countryCode).toBe('PT')
    expect(result?.countryName).toBe('Portugal')
  })

  it('detects Cairo as Egypt without low-confidence rejection', () => {
    const result = lookupCountryRegionByCoordinates({
      lat: 30.0444,
      lng: 31.2357
    })

    expect(result?.countryCode).toBe('EG')
    expect(result?.countryName).toBe('Egypt')
    expect(isLowConfidenceBoundaryHit({ lat: 30.0444, lng: 31.2357 }, result ?? null)).toBe(false)
  })

  it('detects Hong Kong as a region-first display', () => {
    const result = lookupCountryRegionByCoordinates({
      lat: 22.3193,
      lng: 114.1694
    })

    expect(result?.countryCode).toBe('HK')
    expect(result?.displayName).toBe('Hong Kong')
    expect(result?.kind).toBe('region')
  })

  it('keeps an obvious Japan click aligned with Japan instead of inland Asia', () => {
    const normalizedPoint = renderedGeoPointToNormalizedPoint(35.6762, 139.6503)
    const geo = normalizedPointToGeoCoordinates(normalizedPoint)
    const result = lookupCountryRegionByCoordinates(geo)

    expect(result?.countryCode).toBe('JP')
    expect(result?.displayName).toBe('Japan')
  })

  it('keeps an obvious Hong Kong click aligned with Hong Kong instead of Myanmar', () => {
    const normalizedPoint = renderedGeoPointToNormalizedPoint(22.3193, 114.1694)
    const geo = normalizedPointToGeoCoordinates(normalizedPoint)
    const result = lookupCountryRegionByCoordinates(geo)

    expect(result?.countryCode).toBe('HK')
    expect(result?.displayName).toBe('Hong Kong')
  })

  it('detects Greenland with the expected display name', () => {
    const result = lookupCountryRegionByCoordinates({
      lat: 72,
      lng: -42
    })

    expect(result?.countryCode).toBe('GL')
    expect(result?.displayName).toBe('Greenland')
  })

  it('returns null for an Atlantic Ocean sample', () => {
    const result = lookupCountryRegionByCoordinates({
      lat: 25,
      lng: -30
    })

    expect(result).toBeNull()
  })
})
