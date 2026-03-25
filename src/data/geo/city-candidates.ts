export interface CityCandidate {
  id: string
  name: string
  countryCode: string
  contextLabel: string
  lat: number
  lng: number
  highRadiusKm: number
  possibleRadiusKm: number
}

export const cityCandidatesByContext: Record<string, CityCandidate[]> = {
  'JP:country': [
    {
      id: 'jp-tokyo',
      name: 'Tokyo',
      countryCode: 'JP',
      contextLabel: 'Japan · Kanto',
      lat: 35.6762,
      lng: 139.6503,
      highRadiusKm: 45,
      possibleRadiusKm: 120
    },
    {
      id: 'jp-kyoto',
      name: 'Kyoto',
      countryCode: 'JP',
      contextLabel: 'Japan · Kansai',
      lat: 35.0116,
      lng: 135.7681,
      highRadiusKm: 35,
      possibleRadiusKm: 90
    },
    {
      id: 'jp-osaka',
      name: 'Osaka',
      countryCode: 'JP',
      contextLabel: 'Japan · Kansai',
      lat: 34.6937,
      lng: 135.5023,
      highRadiusKm: 35,
      possibleRadiusKm: 90
    }
  ],
  'PT:country': [
    {
      id: 'pt-lisbon',
      name: 'Lisbon',
      countryCode: 'PT',
      contextLabel: 'Portugal · Lisbon District',
      lat: 38.7223,
      lng: -9.1393,
      highRadiusKm: 30,
      possibleRadiusKm: 80
    }
  ],
  'EG:country': [
    {
      id: 'eg-cairo',
      name: 'Cairo',
      countryCode: 'EG',
      contextLabel: 'Egypt · Cairo Governorate',
      lat: 30.0444,
      lng: 31.2357,
      highRadiusKm: 35,
      possibleRadiusKm: 90
    }
  ]
}
