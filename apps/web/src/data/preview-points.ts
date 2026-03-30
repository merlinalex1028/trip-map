import { seedPoints } from './seed-points'
import type { MapPointDisplay } from '../types/map-point'
import {
  loadPointStorageSnapshot,
  mergeSeedAndLocalPoints,
  POINT_STORAGE_KEY
} from '../services/point-storage'

export function loadPreviewPoints(): MapPointDisplay[] {
  const result = loadPointStorageSnapshot()

  if (result.status !== 'ready') {
    return seedPoints
  }

  return mergeSeedAndLocalPoints(
    seedPoints,
    result.snapshot.userPoints,
    result.snapshot.seedOverrides,
    result.snapshot.deletedSeedIds
  )
}

export { POINT_STORAGE_KEY as PREVIEW_POINTS_STORAGE_KEY }
