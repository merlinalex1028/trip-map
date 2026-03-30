import type {
  MapPointDisplay,
  PersistedMapPoint,
  SeedPointOverride
} from '../types/map-point'

export const POINT_STORAGE_KEY = 'trip-map:point-state:v2'

export interface PointStorageSnapshot {
  version: 2
  userPoints: PersistedMapPoint[]
  seedOverrides: SeedPointOverride[]
  deletedSeedIds: string[]
}

export type StoredMapPoint = PersistedMapPoint

export type PointStorageLoadResult =
  | {
      status: 'ready'
      snapshot: PointStorageSnapshot
    }
  | {
      status: 'empty' | 'corrupt' | 'incompatible'
      snapshot: null
    }

function isValidPrecision(value: unknown): value is PersistedMapPoint['precision'] {
  return value === 'country' || value === 'region' || value === 'city-high' || value === 'city-possible'
}

function isValidPlaceKind(value: unknown): value is NonNullable<PersistedMapPoint['placeKind']> {
  return value === 'CN_ADMIN' || value === 'OVERSEAS_ADMIN1'
}

function normalizeNullableString(value: unknown) {
  return typeof value === 'string' ? value : null
}

function normalizePersistedPoint(value: unknown): PersistedMapPoint | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const point = value as Record<string, unknown>

  if (
    typeof point.id === 'string' &&
    typeof point.name === 'string' &&
    typeof point.countryName === 'string' &&
    typeof point.countryCode === 'string' &&
    typeof point.x === 'number' &&
    typeof point.y === 'number' &&
    typeof point.lat === 'number' &&
    typeof point.lng === 'number' &&
    point.source === 'saved' &&
    typeof point.isFeatured === 'boolean' &&
    typeof point.description === 'string' &&
    typeof point.coordinatesLabel === 'string' &&
    typeof point.createdAt === 'string' &&
    typeof point.updatedAt === 'string'
  ) {
    return {
      id: point.id,
      name: point.name,
      countryName: point.countryName,
      countryCode: point.countryCode,
      precision: isValidPrecision(point.precision) ? point.precision : 'country',
      cityId: normalizeNullableString(point.cityId),
      cityName: normalizeNullableString(point.cityName),
      cityContextLabel: normalizeNullableString(point.cityContextLabel),
      placeId: normalizeNullableString(point.placeId),
      placeKind: isValidPlaceKind(point.placeKind) ? point.placeKind : null,
      datasetVersion:
        normalizeNullableString(point.datasetVersion) ??
        normalizeNullableString(point.boundaryDatasetVersion),
      typeLabel: normalizeNullableString(point.typeLabel),
      parentLabel: normalizeNullableString(point.parentLabel),
      subtitle: normalizeNullableString(point.subtitle),
      boundaryId: normalizeNullableString(point.boundaryId),
      boundaryDatasetVersion:
        normalizeNullableString(point.boundaryDatasetVersion) ??
        normalizeNullableString(point.datasetVersion),
      fallbackNotice: normalizeNullableString(point.fallbackNotice),
      x: point.x,
      y: point.y,
      lat: point.lat,
      lng: point.lng,
      clickLat: typeof point.clickLat === 'number' ? point.clickLat : point.lat,
      clickLng: typeof point.clickLng === 'number' ? point.clickLng : point.lng,
      source: 'saved',
      isFeatured: point.isFeatured,
      description: point.description,
      coordinatesLabel: point.coordinatesLabel,
      createdAt: point.createdAt,
      updatedAt: point.updatedAt
    }
  }

  return null
}

function isValidSeedPointOverride(value: unknown): value is SeedPointOverride {
  if (!value || typeof value !== 'object') {
    return false
  }

  const override = value as Record<string, unknown>

  return (
    typeof override.id === 'string' &&
    typeof override.name === 'string' &&
    typeof override.description === 'string' &&
    typeof override.isFeatured === 'boolean' &&
    typeof override.updatedAt === 'string'
  )
}

function isValidDeletedSeedIds(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

export function loadPointStorageSnapshot(): PointStorageLoadResult {
  if (typeof window === 'undefined') {
    return {
      status: 'empty',
      snapshot: null
    }
  }

  const rawSnapshot = window.localStorage.getItem(POINT_STORAGE_KEY)

  if (!rawSnapshot) {
    return {
      status: 'empty',
      snapshot: null
    }
  }

  try {
    const parsed = JSON.parse(rawSnapshot) as Partial<PointStorageSnapshot> | null

    if (!parsed) {
      return {
        status: 'corrupt',
        snapshot: null
      }
    }

    if (parsed.version !== 2) {
      return {
        status: 'incompatible',
        snapshot: null
      }
    }

    if (
      !Array.isArray(parsed.userPoints) ||
      !Array.isArray(parsed.seedOverrides) ||
      !isValidDeletedSeedIds(parsed.deletedSeedIds) ||
      !parsed.seedOverrides.every(isValidSeedPointOverride)
    ) {
      return {
        status: 'corrupt',
        snapshot: null
      }
    }

    const normalizedUserPoints = parsed.userPoints
      .map((point) => normalizePersistedPoint(point))
      .filter((point): point is PersistedMapPoint => point !== null)

    if (normalizedUserPoints.length !== parsed.userPoints.length) {
      return {
        status: 'corrupt',
        snapshot: null
      }
    }

    return {
      status: 'ready',
      snapshot: {
        version: 2,
        userPoints: normalizedUserPoints,
        seedOverrides: parsed.seedOverrides,
        deletedSeedIds: parsed.deletedSeedIds
      }
    }
  } catch {
    return {
      status: 'corrupt',
      snapshot: null
    }
  }
}

export function savePointStorageSnapshot(snapshot: PointStorageSnapshot) {
  if (typeof window === 'undefined') {
    return
  }

  const normalizedSnapshot: PointStorageSnapshot = {
    ...snapshot,
    version: 2,
    userPoints: snapshot.userPoints.map((point) => ({
      ...point,
      cityId: normalizeNullableString(point.cityId),
      cityName: normalizeNullableString(point.cityName),
      cityContextLabel: normalizeNullableString(point.cityContextLabel),
      placeId: normalizeNullableString(point.placeId),
      placeKind: isValidPlaceKind(point.placeKind) ? point.placeKind : null,
      datasetVersion:
        normalizeNullableString(point.datasetVersion) ??
        normalizeNullableString(point.boundaryDatasetVersion),
      typeLabel: normalizeNullableString(point.typeLabel),
      parentLabel: normalizeNullableString(point.parentLabel),
      subtitle: normalizeNullableString(point.subtitle),
      boundaryId: normalizeNullableString(point.boundaryId),
      boundaryDatasetVersion:
        normalizeNullableString(point.boundaryDatasetVersion) ??
        normalizeNullableString(point.datasetVersion),
      fallbackNotice: normalizeNullableString(point.fallbackNotice),
      clickLat: typeof point.clickLat === 'number' ? point.clickLat : point.lat,
      clickLng: typeof point.clickLng === 'number' ? point.clickLng : point.lng
    }))
  }

  window.localStorage.setItem(POINT_STORAGE_KEY, JSON.stringify(normalizedSnapshot))
}

export function clearPointStorageSnapshot() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(POINT_STORAGE_KEY)
}

export function mergeSeedAndLocalPoints(
  baseSeedPoints: MapPointDisplay[],
  userPoints: PersistedMapPoint[],
  seedOverrides: SeedPointOverride[],
  deletedSeedIds: string[]
): MapPointDisplay[] {
  const overrideMap = new Map(seedOverrides.map((override) => [override.id, override] as const))
  const deletedSeedIdSet = new Set(deletedSeedIds)

  const mergedSeedPoints = baseSeedPoints
    .filter((point) => !deletedSeedIdSet.has(point.id))
    .map((point) => {
      const override = overrideMap.get(point.id)

      if (!override) {
        return point
      }

      return {
        ...point,
        name: override.name,
        description: override.description,
        isFeatured: override.isFeatured
      }
    })

  return [...mergedSeedPoints, ...userPoints]
}

export function loadStoredPoints(): StoredMapPoint[] {
  const result = loadPointStorageSnapshot()

  return result.status === 'ready' ? result.snapshot.userPoints : []
}
