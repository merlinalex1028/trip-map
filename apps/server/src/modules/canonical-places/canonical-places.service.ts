import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Injectable } from '@nestjs/common'
import type {
  CanonicalPlaceCandidate,
  CanonicalResolveFailedReason,
  CanonicalResolveResponse,
  ConfirmCanonicalPlaceRequest,
  GeometryRef,
  ResolvedCanonicalPlace,
  ResolveCanonicalPlaceRequest,
} from '@trip-map/contracts'
import { GEOMETRY_MANIFEST } from '@trip-map/contracts'

import {
  CANONICAL_RESOLVE_FIXTURES,
  MAX_CANONICAL_CANDIDATES,
  canonicalPlaceCatalogBase,
  type CanonicalPlaceId,
  type CanonicalResolveFixture,
} from './fixtures/canonical-place-fixtures.js'

type GeoJsonPosition = [number, number]

interface GeoJsonPolygonGeometry {
  type: 'Polygon'
  coordinates: GeoJsonPosition[][]
}

interface GeoJsonMultiPolygonGeometry {
  type: 'MultiPolygon'
  coordinates: GeoJsonPosition[][][]
}

interface GeometryFeature {
  type: 'Feature'
  properties: {
    boundaryId?: string
    renderableId?: string
  }
  geometry: GeoJsonPolygonGeometry | GeoJsonMultiPolygonGeometry
}

interface GeometryFeatureCollection {
  type: 'FeatureCollection'
  features: GeometryFeature[]
}

interface SupportedResolvedGeometry {
  placeId: CanonicalPlaceId
  feature: GeometryFeature
}

const OUTSIDE_SUPPORTED_DATA_MESSAGE = '当前点击位置暂未命中已接入的正式行政区数据。'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..', '..')
const GEOMETRY_ROOT = resolve(REPO_ROOT, 'apps', 'web', 'public', 'geo')

const boundaryIdToPlaceId = new Map<ResolvedCanonicalPlace['boundaryId'], CanonicalPlaceId>(
  Object.entries(canonicalPlaceCatalogBase).map(([placeId, place]) => [
    place.boundaryId,
    placeId as CanonicalPlaceId,
  ]),
)

const supportedResolvedGeometries = loadSupportedResolvedGeometries()

/**
 * Look up a manifest entry by boundaryId and extract the GeometryRef fields.
 * Returns null if the boundaryId is not present in the generated manifest.
 */
function lookupGeometryRefByBoundaryId(boundaryId: string): GeometryRef | null {
  const entry = GEOMETRY_MANIFEST.find((e) => e.boundaryId === boundaryId)
  if (!entry) return null
  return {
    boundaryId: entry.boundaryId,
    layer: entry.layer,
    geometryDatasetVersion: entry.geometryDatasetVersion,
    assetKey: entry.assetKey,
    renderableId: entry.renderableId,
  }
}

function loadSupportedResolvedGeometries(): SupportedResolvedGeometry[] {
  const shardCache = new Map<string, GeometryFeatureCollection>()

  return GEOMETRY_MANIFEST.flatMap((entry) => {
    const placeId = boundaryIdToPlaceId.get(entry.boundaryId)

    if (!placeId) {
      return []
    }

    const shardPath = resolve(
      GEOMETRY_ROOT,
      entry.geometryDatasetVersion,
      entry.assetKey,
    )
    const shard = shardCache.get(shardPath) ?? loadGeometryShardFile(shardPath)
    shardCache.set(shardPath, shard)

    const lookupId = entry.renderableId ?? entry.boundaryId
    const feature = shard.features.find(
      candidate =>
        candidate.properties.renderableId === lookupId
        || candidate.properties.boundaryId === lookupId,
    )

    if (!feature) {
      throw new Error(
        `No geometry feature found for lookupId "${lookupId}" in shard "${shardPath}".`,
      )
    }

    return [{ placeId, feature }]
  })
}

function loadGeometryShardFile(shardPath: string): GeometryFeatureCollection {
  return JSON.parse(readFileSync(shardPath, 'utf-8')) as GeometryFeatureCollection
}

function isPointOnSegment(
  [px, py]: GeoJsonPosition,
  [x1, y1]: GeoJsonPosition,
  [x2, y2]: GeoJsonPosition,
): boolean {
  const cross = (px - x1) * (y2 - y1) - (py - y1) * (x2 - x1)

  if (Math.abs(cross) > 1e-9) {
    return false
  }

  const dot = (px - x1) * (px - x2) + (py - y1) * (py - y2)
  return dot <= 1e-9
}

function isPointInRing(point: GeoJsonPosition, ring: GeoJsonPosition[]): boolean {
  if (ring.length < 3) {
    return false
  }

  let inside = false

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const start = ring[i]
    const end = ring[j]

    if (!start || !end) {
      continue
    }

    if (isPointOnSegment(point, start, end)) {
      return true
    }

    const [xi, yi] = start
    const [xj, yj] = end
    const [px, py] = point

    const intersects = ((yi > py) !== (yj > py))
      && (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)

    if (intersects) {
      inside = !inside
    }
  }

  return inside
}

function isPointInPolygon(point: GeoJsonPosition, polygon: GeoJsonPosition[][]): boolean {
  const [outerRing, ...holes] = polygon

  if (!outerRing || !isPointInRing(point, outerRing)) {
    return false
  }

  return !holes.some(hole => isPointInRing(point, hole))
}

function isPointInGeometry(
  point: GeoJsonPosition,
  geometry: GeoJsonPolygonGeometry | GeoJsonMultiPolygonGeometry,
): boolean {
  if (geometry.type === 'Polygon') {
    return isPointInPolygon(point, geometry.coordinates)
  }

  return geometry.coordinates.some(polygon => isPointInPolygon(point, polygon))
}

@Injectable()
export class CanonicalPlacesService {
  resolve(input: ResolveCanonicalPlaceRequest): CanonicalResolveResponse {
    const exactFixture = this.findExactFixture(input)

    if (exactFixture && exactFixture.kind !== 'resolved') {
      return this.buildResponse(input, exactFixture)
    }

    const resolvedPlaceId = this.findResolvedPlaceIdByGeometry(input)
    if (resolvedPlaceId) {
      return {
        status: 'resolved',
        click: {
          lat: input.lat,
          lng: input.lng,
        },
        place: this.getPlace(resolvedPlaceId),
      }
    }

    if (exactFixture?.kind === 'resolved') {
      return this.buildResponse(input, exactFixture)
    }

    return this.createFailedResponse(
      input,
      'OUTSIDE_SUPPORTED_DATA',
      OUTSIDE_SUPPORTED_DATA_MESSAGE,
    )
  }

  confirm(input: ConfirmCanonicalPlaceRequest): CanonicalResolveResponse {
    const exactFixture = this.findExactFixture(input)

    if (!exactFixture && !this.findResolvedPlaceIdByGeometry(input)) {
      return this.createFailedResponse(
        input,
        'OUTSIDE_SUPPORTED_DATA',
        OUTSIDE_SUPPORTED_DATA_MESSAGE,
      )
    }

    if (exactFixture?.kind === 'ambiguous') {
      const candidateIds = exactFixture.candidatePlaceIds.slice(0, MAX_CANONICAL_CANDIDATES)
      const candidatePlaceId = input.candidatePlaceId as CanonicalPlaceId

      if (!candidateIds.includes(candidatePlaceId)) {
        return this.createCandidateMismatchResponse(input)
      }

      return {
        status: 'resolved',
        click: {
          lat: input.lat,
          lng: input.lng,
        },
        place: this.getPlace(candidatePlaceId),
      }
    }

    const resolvedPlaceId = this.findResolvedPlaceIdByGeometry(input)

    if (resolvedPlaceId && resolvedPlaceId === input.candidatePlaceId) {
      return {
        status: 'resolved',
        click: {
          lat: input.lat,
          lng: input.lng,
        },
        place: this.getPlace(resolvedPlaceId),
      }
    }

    if (exactFixture?.kind === 'resolved' && exactFixture.placeId === input.candidatePlaceId) {
      return this.buildResponse(input, exactFixture)
    }

    return this.createCandidateMismatchResponse(input)
  }

  private buildResponse(
    input: ResolveCanonicalPlaceRequest,
    fixture: CanonicalResolveFixture,
  ): CanonicalResolveResponse {
    if (fixture.kind === 'resolved') {
      return {
        status: 'resolved',
        click: {
          lat: input.lat,
          lng: input.lng,
        },
        place: this.getPlace(fixture.placeId),
      }
    }

    if (fixture.kind === 'ambiguous') {
      const candidates = fixture.candidatePlaceIds
        .slice(0, MAX_CANONICAL_CANDIDATES)
        .map(candidatePlaceId => this.getCandidate(candidatePlaceId, fixture.candidateHints[candidatePlaceId]))

      return {
        status: 'ambiguous',
        click: {
          lat: input.lat,
          lng: input.lng,
        },
        prompt: fixture.prompt,
        recommendedPlaceId: fixture.recommendedPlaceId,
        candidates,
      }
    }

    return this.createFailedResponse(input, fixture.reason, fixture.message)
  }

  private createCandidateMismatchResponse(
    input: ResolveCanonicalPlaceRequest,
  ): CanonicalResolveResponse {
    return this.createFailedResponse(
      input,
      'CANDIDATE_MISMATCH',
      'candidatePlaceId 不属于该点击位置的 authoritative 候选集，无法确认。',
    )
  }

  private createFailedResponse(
    input: ResolveCanonicalPlaceRequest,
    reason: CanonicalResolveFailedReason,
    message: string,
  ): CanonicalResolveResponse {
    return {
      status: 'failed',
      click: {
        lat: input.lat,
        lng: input.lng,
      },
      reason,
      message,
    }
  }

  private findExactFixture(input: ResolveCanonicalPlaceRequest): CanonicalResolveFixture | undefined {
    return CANONICAL_RESOLVE_FIXTURES.find(fixture => (
      Math.abs(fixture.click.lat - input.lat) < 0.0001
      && Math.abs(fixture.click.lng - input.lng) < 0.0001
    ))
  }

  private findResolvedPlaceIdByGeometry(
    input: ResolveCanonicalPlaceRequest,
  ): CanonicalPlaceId | null {
    const point: GeoJsonPosition = [input.lng, input.lat]

    for (const candidate of supportedResolvedGeometries) {
      if (isPointInGeometry(point, candidate.feature.geometry)) {
        return candidate.placeId
      }
    }

    return null
  }

  private getPlace(placeId: CanonicalPlaceId): ResolvedCanonicalPlace {
    const base = canonicalPlaceCatalogBase[placeId]
    const geometryRef = lookupGeometryRefByBoundaryId(base.boundaryId)

    if (!geometryRef) {
      throw new Error(
        `No manifest entry found for boundaryId "${base.boundaryId}" (placeId: "${placeId}"). ` +
        'Ensure the generated manifest is up-to-date.',
      )
    }

    return {
      ...base,
      geometryRef: geometryRef,
    }
  }

  private getCandidate(
    candidatePlaceId: CanonicalPlaceId,
    candidateHint: string,
  ): CanonicalPlaceCandidate {
    return {
      ...this.getPlace(candidatePlaceId),
      candidateHint,
    }
  }
}
