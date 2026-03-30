export type PlaceKind = 'CN_ADMIN' | 'OVERSEAS_ADMIN1'

export type ChinaAdminType =
  | 'MUNICIPALITY'
  | 'SAR'
  | 'PREFECTURE_LEVEL_CITY'
  | 'AUTONOMOUS_PREFECTURE'
  | 'LEAGUE'
  | 'AREA'

export interface CanonicalPlaceRef {
  placeId: string
  boundaryId: string
  placeKind: PlaceKind
  datasetVersion: string
}

export interface CanonicalPlaceSummary extends CanonicalPlaceRef {
  displayName: string
  regionSystem: 'CN' | 'OVERSEAS'
  adminType: ChinaAdminType | 'ADMIN1'
  typeLabel: string
  parentLabel: string
  subtitle: string
}
