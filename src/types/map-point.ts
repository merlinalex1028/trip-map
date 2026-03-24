export type MapPointSource = 'seed' | 'saved' | 'detected'

export interface MapPointDisplay {
  id: string
  name: string
  countryName: string
  countryCode: string
  x: number
  y: number
  lat: number
  lng: number
  source: MapPointSource
  isFeatured: boolean
  description: string
  coordinatesLabel: string
}
