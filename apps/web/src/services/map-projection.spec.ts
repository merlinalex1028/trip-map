import {
  WORLD_PROJECTION_CONFIG,
  clampNormalizedPoint,
  geoCoordinatesToNormalizedPoint,
  normalizedPointToGeoCoordinates,
  normalizedPointToViewBoxPoint,
  viewBoxPointToNormalizedPoint
} from './map-projection'

describe('map projection service', () => {
  it('keeps the geographic render frame aligned with the poster svg', () => {
    expect(WORLD_PROJECTION_CONFIG).toMatchObject({
      plotLeft: 160,
      plotTop: 80,
      plotWidth: 1280,
      plotHeight: 640
    })
  })

  it('maps the center of the surface near null island', () => {
    const result = normalizedPointToGeoCoordinates({ x: 0.5, y: 0.5 })

    expect(result.lng).toBeCloseTo(0, 6)
    expect(result.lat).toBeCloseTo(0, 6)
  })

  it('maps the rendered plot bounds near world limits', () => {
    const left = normalizedPointToGeoCoordinates({
      x: WORLD_PROJECTION_CONFIG.plotLeft / WORLD_PROJECTION_CONFIG.viewBoxWidth,
      y: 0.5
    })
    const right = normalizedPointToGeoCoordinates({
      x: (WORLD_PROJECTION_CONFIG.plotLeft + WORLD_PROJECTION_CONFIG.plotWidth) /
        WORLD_PROJECTION_CONFIG.viewBoxWidth,
      y: 0.5
    })

    expect(left.lng).toBeCloseTo(-180, 6)
    expect(right.lng).toBeCloseTo(180, 6)
  })

  it('clamps out-of-range normalized inputs', () => {
    expect(clampNormalizedPoint({ x: -1.2, y: 1.6 })).toEqual({ x: 0, y: 1 })
  })

  it('keeps viewBox conversions aligned with normalized positions', () => {
    const viewBoxPoint = normalizedPointToViewBoxPoint({ x: 0.625, y: 0.275 })
    const normalizedPoint = viewBoxPointToNormalizedPoint(viewBoxPoint)

    expect(viewBoxPoint.x).toBeCloseTo(1000, 8)
    expect(viewBoxPoint.y).toBeCloseTo(220, 8)
    expect(normalizedPoint.x).toBeCloseTo(0.625, 8)
    expect(normalizedPoint.y).toBeCloseTo(0.275, 8)
  })

  it('round-trips geographic coordinates back into normalized plot space', () => {
    const point = geoCoordinatesToNormalizedPoint({ lng: 31.2357, lat: 30.0444 })
    const result = normalizedPointToGeoCoordinates(point)

    expect(point.x).toBeGreaterThan(WORLD_PROJECTION_CONFIG.plotLeft / WORLD_PROJECTION_CONFIG.viewBoxWidth)
    expect(point.y).toBeGreaterThan(WORLD_PROJECTION_CONFIG.plotTop / WORLD_PROJECTION_CONFIG.viewBoxHeight)
    expect(result.lng).toBeCloseTo(31.2357, 6)
    expect(result.lat).toBeCloseTo(30.0444, 6)
  })
})
