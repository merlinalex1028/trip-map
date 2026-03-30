export type PlaceKind = 'CN_CITY' | 'OVERSEAS_ADMIN1'

export interface CanonicalPlaceRef {
  placeId: string
  boundaryId: string
  placeKind: PlaceKind
  datasetVersion: string
}

export interface CanonicalPlaceSummary extends CanonicalPlaceRef {
  displayName: string
}
