import { describe, expect, it } from 'vitest'

import {
  GEOMETRY_DATASET_VERSION,
  getGeometryManifestEntry,
  listGeometryManifestEntriesByLayer,
} from './geometry-manifest'

describe('geometry-manifest service', () => {
  it('exports GEOMETRY_DATASET_VERSION from the generated contracts manifest', () => {
    expect(GEOMETRY_DATASET_VERSION).toBe('2026-04-02-geo-v2')
  })

  it('can look up datav-cn-beijing entry', () => {
    const entry = getGeometryManifestEntry('datav-cn-beijing')
    expect(entry).not.toBeNull()
    expect(entry?.boundaryId).toBe('datav-cn-beijing')
    expect(entry?.layer).toBe('CN')
    expect(entry?.assetKey).toBe('cn/layer.json')
    expect(entry?.geometryDatasetVersion).toBe('2026-04-02-geo-v2')
    expect(entry?.renderableId).toBe('datav-cn-beijing')
  })

  it('can look up datav-cn-shanghai entry from the municipality supplement layer', () => {
    const entry = getGeometryManifestEntry('datav-cn-shanghai')
    expect(entry).not.toBeNull()
    expect(entry?.boundaryId).toBe('datav-cn-shanghai')
    expect(entry?.assetKey).toBe('cn/layer.json')
  })

  it('can look up ne-admin1-us-california entry', () => {
    const entry = getGeometryManifestEntry('ne-admin1-us-california')
    expect(entry).not.toBeNull()
    expect(entry?.boundaryId).toBe('ne-admin1-us-california')
    expect(entry?.layer).toBe('OVERSEAS')
    expect(entry?.assetKey).toBe('overseas/layer.json')
    expect(entry?.renderableId).toBe('ne-admin1-us-california')
  })

  it('returns null for unknown boundaryId', () => {
    expect(getGeometryManifestEntry('unknown-boundary')).toBeNull()
  })

  it('no entry has assetKey equal to all.json, combined.json, or geo.json', () => {
    const cnEntries = listGeometryManifestEntriesByLayer('CN')
    const overseasEntries = listGeometryManifestEntriesByLayer('OVERSEAS')
    const allEntries = [...cnEntries, ...overseasEntries]

    const forbiddenKeys = ['all.json', 'combined.json', 'geo.json']
    for (const entry of allEntries) {
      expect(forbiddenKeys).not.toContain(entry.assetKey)
    }
  })

  it('CN entries all have layer === CN', () => {
    const cnEntries = listGeometryManifestEntriesByLayer('CN')
    expect(cnEntries.length).toBeGreaterThan(0)
    for (const entry of cnEntries) {
      expect(entry.layer).toBe('CN')
    }
  })

  it('OVERSEAS entries all have layer === OVERSEAS', () => {
    const overseasEntries = listGeometryManifestEntriesByLayer('OVERSEAS')
    expect(overseasEntries.length).toBeGreaterThan(0)
    for (const entry of overseasEntries) {
      expect(entry.layer).toBe('OVERSEAS')
    }
  })

  it('entries with renderableId all have non-null renderableId', () => {
    const cnEntries = listGeometryManifestEntriesByLayer('CN')
    const overseasEntries = listGeometryManifestEntriesByLayer('OVERSEAS')
    const allEntries = [...cnEntries, ...overseasEntries]

    for (const entry of allEntries) {
      // renderableId must be present in every manifest entry
      expect(entry.renderableId).not.toBeNull()
      expect(typeof entry.renderableId).toBe('string')
    }
  })
})
