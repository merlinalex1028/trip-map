export interface CityCandidate {
  name: string
  countryCode: string
  lat: number
  lng: number
  highRadiusKm: number
  possibleRadiusKm: number
}

export const cityCandidatesByContext: Record<string, CityCandidate[]> = {
  'JP:country': [
    {
      name: 'Tokyo',
      countryCode: 'JP',
      lat: 35.6762,
      lng: 139.6503,
      highRadiusKm: 45,
      possibleRadiusKm: 120
    },
    {
      name: 'Kyoto',
      countryCode: 'JP',
      lat: 35.0116,
      lng: 135.7681,
      highRadiusKm: 35,
      possibleRadiusKm: 90
    },
    {
      name: 'Osaka',
      countryCode: 'JP',
      lat: 34.6937,
      lng: 135.5023,
      highRadiusKm: 35,
      possibleRadiusKm: 90
    }
  ],
  'PT:country': [
    {
      name: 'Lisbon',
      countryCode: 'PT',
      lat: 38.7223,
      lng: -9.1393,
      highRadiusKm: 30,
      possibleRadiusKm: 80
    }
  ],
  'EG:country': [
    {
      name: 'Cairo',
      countryCode: 'EG',
      lat: 30.0444,
      lng: 31.2357,
      highRadiusKm: 35,
      possibleRadiusKm: 90
    }
  ]
}
