export type GeometryLayer = 'CN' | 'OVERSEAS'

export type GeometrySourceDataset =
  | 'DATAV_GEOATLAS_CN_CITY'
  | 'DATAV_GEOATLAS_CN_PROVINCE'
  | 'NATURAL_EARTH_ADMIN1'

export interface GeometryRef {
  boundaryId: string
  layer: GeometryLayer
  geometryDatasetVersion: string
  assetKey: string
  renderableId: string | null
}

export interface GeometryManifestEntry extends GeometryRef {
  sourceDataset: GeometrySourceDataset
  sourceVersion: string
  sourceFeatureId: string
}
