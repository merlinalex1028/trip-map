import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Injectable } from '@nestjs/common'
import type {
  CanonicalPlaceCandidate,
  CanonicalResolveFailedReason,
  CanonicalPlaceSummary,
  CanonicalResolveResponse,
  ConfirmCanonicalPlaceRequest,
  ResolvedCanonicalPlace,
  ResolveCanonicalPlaceRequest,
} from '@trip-map/contracts'
import { GEOMETRY_MANIFEST } from '@trip-map/contracts'

import {
  CANONICAL_RESOLVE_FIXTURES,
  MAX_CANONICAL_CANDIDATES,
  type CanonicalPlaceId,
  type CanonicalResolveFixture,
} from './fixtures/canonical-place-fixtures.js'
import { getCanonicalPlaceSummaryByBoundaryId } from './place-metadata-catalog.js'

type GeoJsonPosition = [number, number]

interface GeoJsonPolygonGeometry {
  type: 'Polygon'
  coordinates: GeoJsonPosition[][]
}

interface GeoJsonMultiPolygonGeometry {
  type: 'MultiPolygon'
  coordinates: GeoJsonPosition[][][]
}

interface CanonicalFeatureProperties {
  boundaryId?: string
  renderableId?: string
}

interface GeometryFeature {
  type: 'Feature'
  properties: CanonicalFeatureProperties
  geometry: GeoJsonPolygonGeometry | GeoJsonMultiPolygonGeometry
}

interface GeometryFeatureCollection {
  type: 'FeatureCollection'
  features: GeometryFeature[]
}

interface SupportedResolvedGeometry {
  placeId: CanonicalPlaceId
  place: ResolvedCanonicalPlace
  feature: GeometryFeature
  layer: 'CN' | 'OVERSEAS'
}

const OUTSIDE_SUPPORTED_DATA_MESSAGE = '当前点击位置暂未命中已接入的正式行政区数据。'
const DYNAMIC_AMBIGUOUS_PROMPT = '该点位靠近多个正式行政区，请确认正确地点。'
const DYNAMIC_AMBIGUOUS_HINT = '点击点位落在多个边界上，请确认正确地点。'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..', '..')
const GEOMETRY_ROOT = resolve(REPO_ROOT, 'apps', 'web', 'public', 'geo')

const supportedResolvedGeometries = loadSupportedResolvedGeometries()
const placeCatalog = new Map<CanonicalPlaceId, ResolvedCanonicalPlace>(
  supportedResolvedGeometries.map(candidate => [candidate.placeId, candidate.place]),
)

function loadSupportedResolvedGeometries(): SupportedResolvedGeometry[] {
  const shardCache = new Map<string, GeometryFeatureCollection>()

  return GEOMETRY_MANIFEST.flatMap((entry) => {
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

    const summary = getCanonicalPlaceSummaryByBoundaryId(entry.boundaryId)

    if (!summary) {
      throw new Error(
        `No canonical place metadata found for boundaryId "${entry.boundaryId}". ` +
        'Ensure geometry shards were rebuilt from the latest authoritative sources.',
      )
    }

    const place = createResolvedPlace(summary, entry)

    return [{
      placeId: place.placeId,
      place,
      feature,
      layer: entry.layer,
    }]
  })
}

function loadGeometryShardFile(shardPath: string): GeometryFeatureCollection {
  return JSON.parse(readFileSync(shardPath, 'utf-8')) as GeometryFeatureCollection
}

function createResolvedPlace(
  summary: CanonicalPlaceSummary,
  entry: typeof GEOMETRY_MANIFEST[number],
): ResolvedCanonicalPlace {
  return {
    ...summary,
    geometryRef: {
      boundaryId: entry.boundaryId,
      layer: entry.layer,
      geometryDatasetVersion: entry.geometryDatasetVersion,
      assetKey: entry.assetKey,
      renderableId: entry.renderableId,
    },
  }
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

function dedupePlaces(places: ResolvedCanonicalPlace[]): ResolvedCanonicalPlace[] {
  const seen = new Set<string>()
  const result = []

  for (const place of places) {
    if (seen.has(place.placeId)) {
      continue
    }

    seen.add(place.placeId)
    result.push(place)
  }

  return result
}

@Injectable()
export class CanonicalPlacesService {
  resolve(input: ResolveCanonicalPlaceRequest): CanonicalResolveResponse {
    const exactFixture = this.findExactFixture(input)

    if (exactFixture && exactFixture.kind !== 'resolved') {
      return this.buildResponse(input, exactFixture)
    }

    const resolvedPlaces = this.findResolvedPlacesByGeometry(input)

    if (resolvedPlaces.length === 1) {
      return {
        status: 'resolved',
        click: {
          lat: input.lat,
          lng: input.lng,
        },
        place: resolvedPlaces[0],
      }
    }

    if (resolvedPlaces.length > 1) {
      return this.createDynamicAmbiguousResponse(input, resolvedPlaces)
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
    const resolvedPlaces = this.findResolvedPlacesByGeometry(input)

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

    if (resolvedPlaces.length === 0 && !exactFixture) {
      return this.createFailedResponse(
        input,
        'OUTSIDE_SUPPORTED_DATA',
        OUTSIDE_SUPPORTED_DATA_MESSAGE,
      )
    }

    const matchedPlace = resolvedPlaces.find(place => place.placeId === input.candidatePlaceId)

    if (matchedPlace) {
      return {
        status: 'resolved',
        click: {
          lat: input.lat,
          lng: input.lng,
        },
        place: matchedPlace,
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
        .map(candidatePlaceId => this.getCandidate(
          candidatePlaceId,
          fixture.candidateHints[candidatePlaceId] ?? DYNAMIC_AMBIGUOUS_HINT,
        ))

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

  private createDynamicAmbiguousResponse(
    input: ResolveCanonicalPlaceRequest,
    places: ResolvedCanonicalPlace[],
  ): CanonicalResolveResponse {
    const candidates = places
      .slice(0, MAX_CANONICAL_CANDIDATES)
      .map(place => ({
        ...place,
        candidateHint: DYNAMIC_AMBIGUOUS_HINT,
      }))

    return {
      status: 'ambiguous',
      click: {
        lat: input.lat,
        lng: input.lng,
      },
      prompt: DYNAMIC_AMBIGUOUS_PROMPT,
      recommendedPlaceId: candidates[0]?.placeId ?? null,
      candidates,
    }
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

  private findResolvedPlacesByGeometry(
    input: ResolveCanonicalPlaceRequest,
  ): ResolvedCanonicalPlace[] {
    const point: GeoJsonPosition = [input.lng, input.lat]
    const matches = supportedResolvedGeometries
      .filter(candidate => isPointInGeometry(point, candidate.feature.geometry))

    const cnMatches = matches.filter(candidate => candidate.layer === 'CN')
    const filtered = cnMatches.length > 0 ? cnMatches : matches

    return dedupePlaces(filtered.map(candidate => candidate.place))
  }

  private getPlace(placeId: CanonicalPlaceId): ResolvedCanonicalPlace {
    const place = placeCatalog.get(placeId)

    if (!place) {
      throw new Error(
        `No canonical place metadata found for placeId "${placeId}". ` +
        'Ensure geometry shards were rebuilt from the latest authoritative sources.',
      )
    }

    return place
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
