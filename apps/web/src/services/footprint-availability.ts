import type { FootprintPlaceSnapshot, SummarySurfaceState } from '../types/map-point'
import { getGeometryManifestEntry } from './geometry-manifest'

export type FootprintBlockingReason =
  | 'missing_boundary_id'
  | 'missing_geometry_manifest'
  | 'missing_metadata_catalog'
  | 'frontend_guard_blocked'
  | 'missing_canonical_identity'
  | 'fallback_explanatory_only'
  | 'record_authoritative_rejected'

export type FootprintUnavailableCategory =
  | 'map_data_unavailable'
  | 'place_not_precise_enough'
  | 'outside_supported_map'
  | 'temporarily_unavailable'

export const FOOTPRINT_UNAVAILABLE_CATEGORY_COPY = {
  map_data_unavailable: '已识别到这个地点，但地图数据还不够完整，暂时不能保存足迹。',
  place_not_precise_enough: '已识别到这个地点，但还需要更稳定的地点信息才能保存足迹。',
  outside_supported_map: '这里暂时只能用于查看位置，还不能留下足迹。',
  temporarily_unavailable: '这个地点暂时还不能保存足迹，请稍后再试。',
} as const satisfies Record<FootprintUnavailableCategory, string>

export const FORBIDDEN_FOOTPRINT_COPY_TERMS = [
  'boundaryId',
  'metadata',
  'manifest',
  'geometry',
  'canonical',
  'datasetVersion',
  'authoritative',
  'frontend_guard',
  'record_authoritative_rejected',
  '点亮',
  '再留一枚足迹',
  '再留一次足迹',
  '再记一次',
] as const

export interface FootprintAvailabilityOptions {
  metadataCatalogStatus?: 'available' | 'missing'
  recordAuthoritativeRejected?: boolean
}

export type FootprintAvailability =
  | {
      saveable: true
      reason: null
      category: null
      copy: null
      snapshot: FootprintPlaceSnapshot
    }
  | {
      saveable: false
      reason: FootprintBlockingReason
      category: FootprintUnavailableCategory
      copy: string
      snapshot: null
    }

export function mapFootprintBlockingReasonToCategory(
  reason: FootprintBlockingReason,
): FootprintUnavailableCategory {
  switch (reason) {
    case 'missing_boundary_id':
    case 'missing_geometry_manifest':
    case 'missing_metadata_catalog':
      return 'map_data_unavailable'
    case 'frontend_guard_blocked':
    case 'missing_canonical_identity':
      return 'place_not_precise_enough'
    case 'fallback_explanatory_only':
      return 'outside_supported_map'
    case 'record_authoritative_rejected':
      return 'temporarily_unavailable'
  }
}

export function getFootprintUnavailableCopy(category: FootprintUnavailableCategory): string {
  return FOOTPRINT_UNAVAILABLE_CATEGORY_COPY[category]
}

function blocked(reason: FootprintBlockingReason): FootprintAvailability {
  const category = mapFootprintBlockingReasonToCategory(reason)

  return {
    saveable: false,
    reason,
    category,
    copy: getFootprintUnavailableCopy(category),
    snapshot: null,
  }
}

export function getFootprintAvailability(
  surface: SummarySurfaceState | null,
  options: FootprintAvailabilityOptions = {},
): FootprintAvailability {
  if (options.recordAuthoritativeRejected === true) {
    return blocked('record_authoritative_rejected')
  }

  if (surface === null || surface.mode === 'candidate-select') {
    return blocked('missing_canonical_identity')
  }

  const { point } = surface

  if (point.fallbackNotice && (!point.placeId || !point.placeKind)) {
    return blocked('fallback_explanatory_only')
  }

  if (!point.placeId || !point.placeKind || !point.datasetVersion) {
    return blocked('missing_canonical_identity')
  }

  if (!point.boundaryId) {
    return blocked('missing_boundary_id')
  }

  if (options.metadataCatalogStatus === 'missing') {
    return blocked('missing_metadata_catalog')
  }

  if (!getGeometryManifestEntry(point.boundaryId) && surface.boundarySupportState !== 'supported') {
    return blocked('missing_geometry_manifest')
  }

  if (!point.regionSystem || !point.adminType || !point.typeLabel || !point.parentLabel) {
    return blocked('frontend_guard_blocked')
  }

  return {
    saveable: true,
    reason: null,
    category: null,
    copy: null,
    snapshot: {
      placeId: point.placeId,
      boundaryId: point.boundaryId,
      placeKind: point.placeKind,
      datasetVersion: point.datasetVersion,
      displayName: point.name,
      regionSystem: point.regionSystem,
      adminType: point.adminType,
      typeLabel: point.typeLabel,
      parentLabel: point.parentLabel,
      subtitle: point.subtitle ?? point.cityContextLabel ?? null,
    },
  }
}
