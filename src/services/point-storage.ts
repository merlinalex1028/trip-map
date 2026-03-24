import type {
  MapPointDisplay,
  PersistedMapPoint,
  SeedPointOverride
} from '../types/map-point'

export const POINT_STORAGE_KEY = 'trip-map:point-state:v1'

export interface PointStorageSnapshot {
  version: 1
  userPoints: PersistedMapPoint[]
  seedOverrides: SeedPointOverride[]
  deletedSeedIds: string[]
}

export type PointStorageLoadResult =
  | {
      status: 'ready'
      snapshot: PointStorageSnapshot
    }
  | {
      status: 'empty' | 'corrupt'
      snapshot: null
    }

function isValidPersistedPoint(value: unknown): value is PersistedMapPoint {
  if (!value || typeof value !== 'object') {
    return false
  }

  const point = value as Record<string, unknown>

  return (
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
  )
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

    if (
      !parsed ||
      parsed.version !== 1 ||
      !Array.isArray(parsed.userPoints) ||
      !Array.isArray(parsed.seedOverrides) ||
      !isValidDeletedSeedIds(parsed.deletedSeedIds) ||
      !parsed.userPoints.every(isValidPersistedPoint) ||
      !parsed.seedOverrides.every(isValidSeedPointOverride)
    ) {
      return {
        status: 'corrupt',
        snapshot: null
      }
    }

    return {
      status: 'ready',
      snapshot: {
        version: 1,
        userPoints: parsed.userPoints,
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

  window.localStorage.setItem(POINT_STORAGE_KEY, JSON.stringify(snapshot))
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
