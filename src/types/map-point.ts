export type MapPointSource = 'seed' | 'saved'

export interface MapPointDisplay {
  id: string
  name: string
  countryName: string
  x: number
  y: number
  source: MapPointSource
  isFeatured: boolean
  description: string
  coordinatesLabel: string
}
