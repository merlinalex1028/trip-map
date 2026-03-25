import countryRegions from './country-regions.geo.json'
import {
  cityCandidates,
  cityCandidatesByCountry,
  cityCoverageStats,
  countriesMissingCityCoverage
} from './city-candidates'

interface GeoFeatureProperties {
  countryCode: string
}

interface CountryRegionFeature {
  type: 'Feature'
  properties: GeoFeatureProperties
}

interface CountryRegionFeatureCollection {
  type: 'FeatureCollection'
  features: CountryRegionFeature[]
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function calculateDistanceKm(
  left: { lat: number; lng: number },
  right: { lat: number; lng: number }
) {
  const earthRadiusKm = 6371
  const latDelta = toRadians(right.lat - left.lat)
  const lngDelta = toRadians(right.lng - left.lng)
  const lat1 = toRadians(left.lat)
  const lat2 = toRadians(right.lat)
  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2)

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getMaxPairwiseDistanceKm(countryCode: string) {
  const candidates = cityCandidatesByCountry[countryCode] ?? []
  let maxDistanceKm = 0

  for (let index = 0; index < candidates.length; index += 1) {
    for (let innerIndex = index + 1; innerIndex < candidates.length; innerIndex += 1) {
      const left = candidates[index]
      const right = candidates[innerIndex]

      if (!left || !right) {
        continue
      }

      maxDistanceKm = Math.max(
        maxDistanceKm,
        calculateDistanceKm(
          { lat: left.lat, lng: left.lng },
          { lat: right.lat, lng: right.lng }
        )
      )
    }
  }

  return maxDistanceKm
}

describe('city candidate catalog', () => {
  const validCountryCodes = new Set(
    (countryRegions as CountryRegionFeatureCollection).features.map(
      (feature) => feature.properties.countryCode
    )
  )

  it('tracks audited coverage stats above the new baseline', () => {
    expect(cityCoverageStats.coveredCountryCount).toBeGreaterThanOrEqual(180)
    expect(cityCoverageStats.totalCities).toBeGreaterThanOrEqual(280)
    expect(cityCoverageStats.totalCountryCount).toBe(238)
    expect(countriesMissingCityCoverage.length).toBe(cityCoverageStats.countriesMissingCoverageCount)
  })

  it('keeps ids unique and country mapping valid', () => {
    const uniqueIds = new Set(cityCandidates.map((candidate) => candidate.id))

    expect(uniqueIds.size).toBe(cityCandidates.length)
    expect(cityCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'jp-kyoto' }),
        expect.objectContaining({ id: 'fr-paris' }),
        expect.objectContaining({ id: 'us-new-york' })
      ])
    )

    for (const candidate of cityCandidates) {
      expect(validCountryCodes.has(candidate.countryCode)).toBe(true)
      expect(candidate.name.trim()).not.toBe('')
      expect(candidate.contextLabel.trim()).not.toBe('')
      expect(candidate.aliases).toEqual(expect.any(Array))
      expect(candidate.contextKeys.length).toBeGreaterThan(0)
    }
  })

  it('keeps key countries multi-city and geographically distributed', () => {
    const requiredCoverage: Array<[string, number]> = [
      ['JP', 4],
      ['US', 4],
      ['FR', 4],
      ['GB', 4],
      ['CN', 4],
      ['IN', 4],
      ['AU', 4],
      ['CA', 4]
    ]

    for (const [countryCode, minimumCount] of requiredCoverage) {
      expect(cityCandidatesByCountry[countryCode]?.length ?? 0).toBeGreaterThanOrEqual(minimumCount)
      expect(getMaxPairwiseDistanceKm(countryCode)).toBeGreaterThan(300)
    }
  })
})
