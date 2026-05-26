export interface TravelTrendBucket {
  period: string
  tripCount: number
}

export interface TravelCountryTripCount {
  countryLabel: string
  tripCount: number
}

export type TravelMemoriesProfileDimensionKey =
  | 'place-exploration'
  | 'country-range'
  | 'repeat-visits'
  | 'dated-memories'
  | 'story-detail'

export interface TravelMemoriesProfileDimension {
  key: TravelMemoriesProfileDimensionKey
  label: string
  value: number
  max: number
  explanation: string
}

export interface TravelPopularFootprint {
  placeId: string
  displayName: string
  parentLabel: string | null
  visitCount: number
  latestVisitDate: string | null
}

export interface TravelMemoryPostcardSeed {
  recordId: string
  placeId: string
  displayName: string
  parentLabel: string | null
  startDate: string
}

export interface TravelMemoriesDashboard {
  monthlyTrend: TravelTrendBucket[]
  yearlyTrend: TravelTrendBucket[]
  countryDistribution: TravelCountryTripCount[]
  profile: TravelMemoriesProfileDimension[]
  popularFootprints: TravelPopularFootprint[]
  postcards: TravelMemoryPostcardSeed[]
}

export interface TravelStatsResponse {
  totalTrips: number
  uniquePlaces: number
  visitedAdministrativeAreas: number
  visitedCountries: number
  totalSupportedCountries: number
  memories: TravelMemoriesDashboard
}
