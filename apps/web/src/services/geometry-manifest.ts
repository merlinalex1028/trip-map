/**
 * geometry-manifest.ts
 *
 * Manifest query service for Phase 13 versioned geometry assets.
 * Reads directly from the generated manifest constant in @trip-map/contracts
 * so the manifest is the single authoritative source of truth.
 */

import type { GeometryManifestEntry } from '@trip-map/contracts'
import {
  GEOMETRY_DATASET_VERSION as _CONTRACTS_GEOMETRY_DATASET_VERSION,
  GEOMETRY_MANIFEST,
} from '@trip-map/contracts'

export const GEOMETRY_DATASET_VERSION = '2026-03-31-geo-v1' as const

/**
 * Look up a manifest entry by its canonical boundaryId.
 * Returns null if the boundaryId is not in the current manifest.
 */
export function getGeometryManifestEntry(boundaryId: string): GeometryManifestEntry | null {
  const entry = GEOMETRY_MANIFEST.find((e) => e.boundaryId === boundaryId)
  return entry ?? null
}

/**
 * List all manifest entries for a given geometry layer.
 */
export function listGeometryManifestEntriesByLayer(
  layer: 'CN' | 'OVERSEAS',
): GeometryManifestEntry[] {
  return GEOMETRY_MANIFEST.filter((e) => e.layer === layer)
}
