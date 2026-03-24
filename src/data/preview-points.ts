import { seedPoints } from './seed-points'
import type { MapPointDisplay } from '../types/map-point'

const STORAGE_KEY = 'trip-map:preview-points'

function isValidPoint(value: unknown): value is MapPointDisplay {
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
    typeof point.source === 'string' &&
    typeof point.isFeatured === 'boolean' &&
    typeof point.description === 'string' &&
    typeof point.coordinatesLabel === 'string'
  )
}

function loadSavedPreviewPoints(): MapPointDisplay[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isValidPoint).map((point) => ({
      ...point,
      source: 'saved'
    }))
  } catch {
    return []
  }
}

export function loadPreviewPoints(): MapPointDisplay[] {
  const savedPoints = loadSavedPreviewPoints()
  const merged = new Map(seedPoints.map((point) => [point.id, point] as const))

  for (const point of savedPoints) {
    merged.set(point.id, point)
  }

  return [...merged.values()]
}

export { STORAGE_KEY as PREVIEW_POINTS_STORAGE_KEY }
