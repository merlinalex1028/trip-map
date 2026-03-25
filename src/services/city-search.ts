import { cityCandidates, type CityCandidate } from '../data/geo/city-candidates'
import type { GeoCityCandidate, GeoCoordinates } from '../types/geo'

const CITY_RELIABLE_STATUS_HINT = '更接近点击位置'
const CITY_POSSIBLE_STATUS_HINT = '可能位置，需要确认'

interface CitySearchOptions {
  query: string
  origin: GeoCoordinates
  countryCode?: string | null
  limit?: number
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function calculateDistanceKm(origin: GeoCoordinates, target: GeoCoordinates) {
  const earthRadiusKm = 6371
  const latDelta = toRadians(target.lat - origin.lat)
  const lngDelta = toRadians(target.lng - origin.lng)
  const lat1 = toRadians(origin.lat)
  const lat2 = toRadians(target.lat)
  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2)

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function normalizeSearchText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
}

function getSearchTerms(candidate: CityCandidate) {
  return [candidate.name, candidate.contextLabel, ...candidate.aliases].map(normalizeSearchText)
}

function getMatchPriority(query: string, candidate: CityCandidate) {
  const searchTerms = getSearchTerms(candidate)

  if (searchTerms.some((term) => term === query)) {
    return 0
  }

  if (searchTerms.some((term) => term.startsWith(query))) {
    return 1
  }

  return 2
}

function toGeoCityCandidate(candidate: CityCandidate, origin: GeoCoordinates): GeoCityCandidate {
  const distanceKm = calculateDistanceKm(origin, {
    lat: candidate.lat,
    lng: candidate.lng
  })
  const matchLevel = distanceKm <= candidate.highRadiusKm ? 'high' : 'possible'

  return {
    cityId: candidate.id,
    cityName: candidate.name,
    contextLabel: candidate.contextLabel,
    matchLevel,
    distanceKm,
    statusHint: matchLevel === 'high' ? CITY_RELIABLE_STATUS_HINT : CITY_POSSIBLE_STATUS_HINT
  }
}

export function searchOfflineCities({
  query,
  origin,
  countryCode,
  limit = 3
}: CitySearchOptions): GeoCityCandidate[] {
  const normalizedQuery = normalizeSearchText(query)

  if (!normalizedQuery) {
    return []
  }

  return cityCandidates
    .filter((candidate) => {
      return getSearchTerms(candidate).some((term) => term.includes(normalizedQuery))
    })
    .sort((left, right) => {
      const leftCountryPriority = left.countryCode === countryCode ? 0 : 1
      const rightCountryPriority = right.countryCode === countryCode ? 0 : 1

      if (leftCountryPriority !== rightCountryPriority) {
        return leftCountryPriority - rightCountryPriority
      }

      const leftMatchPriority = getMatchPriority(normalizedQuery, left)
      const rightMatchPriority = getMatchPriority(normalizedQuery, right)

      if (leftMatchPriority !== rightMatchPriority) {
        return leftMatchPriority - rightMatchPriority
      }

      const leftDistance = calculateDistanceKm(origin, {
        lat: left.lat,
        lng: left.lng
      })
      const rightDistance = calculateDistanceKm(origin, {
        lat: right.lat,
        lng: right.lng
      })

      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance
      }

      return left.id.localeCompare(right.id)
    })
    .slice(0, limit)
    .map((candidate) => toGeoCityCandidate(candidate, origin))
}
