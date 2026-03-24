import { isLowConfidenceBoundaryHit, lookupCountryRegionByCoordinates } from './geo-lookup'

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
