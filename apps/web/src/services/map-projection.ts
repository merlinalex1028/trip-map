import type { GeoCoordinates, NormalizedPoint, ProjectionConfig } from '../types/geo'

export interface ViewBoxPoint {
  x: number
  y: number
}

export const WORLD_PROJECTION_CONFIG: ProjectionConfig = {
  viewBoxWidth: 1600,
  viewBoxHeight: 800,
  plotLeft: 160,
  plotTop: 80,
  plotWidth: 1280,
  plotHeight: 640,
  lngMin: -180,
  lngMax: 180,
  latMin: -90,
  latMax: 90
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function clampNormalizedPoint(point: NormalizedPoint): NormalizedPoint {
  return {
    x: clamp(point.x, 0, 1),
    y: clamp(point.y, 0, 1)
  }
}

export function normalizedPointToViewBoxPoint(
  point: NormalizedPoint,
  config: ProjectionConfig = WORLD_PROJECTION_CONFIG
): ViewBoxPoint {
  const normalizedPoint = clampNormalizedPoint(point)

  return {
    x: normalizedPoint.x * config.viewBoxWidth,
    y: normalizedPoint.y * config.viewBoxHeight
  }
}

export function viewBoxPointToNormalizedPoint(
  point: ViewBoxPoint,
  config: ProjectionConfig = WORLD_PROJECTION_CONFIG
): NormalizedPoint {
  return clampNormalizedPoint({
    x: point.x / config.viewBoxWidth,
    y: point.y / config.viewBoxHeight
  })
}

export function normalizedPointToGeoCoordinates(
  point: NormalizedPoint,
  config: ProjectionConfig = WORLD_PROJECTION_CONFIG
): GeoCoordinates {
  const { x: projectedX, y: projectedY } = normalizedPointToViewBoxPoint(point, config)
  const plotX = clamp((projectedX - config.plotLeft) / config.plotWidth, 0, 1)
  const plotY = clamp((projectedY - config.plotTop) / config.plotHeight, 0, 1)

  return {
    lng: config.lngMin + plotX * (config.lngMax - config.lngMin),
    lat: config.latMax - plotY * (config.latMax - config.latMin)
  }
}

export function geoCoordinatesToNormalizedPoint(
  coordinates: GeoCoordinates,
  config: ProjectionConfig = WORLD_PROJECTION_CONFIG
): NormalizedPoint {
  const lngRatio = clamp(
    (coordinates.lng - config.lngMin) / (config.lngMax - config.lngMin),
    0,
    1
  )
  const latRatio = clamp(
    (config.latMax - coordinates.lat) / (config.latMax - config.latMin),
    0,
    1
  )

  return {
    x: (config.plotLeft + lngRatio * config.plotWidth) / config.viewBoxWidth,
    y: (config.plotTop + latRatio * config.plotHeight) / config.viewBoxHeight
  }
}

export function formatCoordinatesLabel(coordinates: GeoCoordinates) {
  const latLabel = `${Math.abs(coordinates.lat).toFixed(2)}°${coordinates.lat >= 0 ? 'N' : 'S'}`
  const lngLabel = `${Math.abs(coordinates.lng).toFixed(2)}°${coordinates.lng >= 0 ? 'E' : 'W'}`

  return `${latLabel}, ${lngLabel}`
}
