import type {
  ChinaAdminType,
  ResolvedCanonicalPlace,
} from '@trip-map/contracts'

export type CanonicalPlaceId =
  | 'cn-beijing'
  | 'cn-hong-kong'
  | 'cn-aba'
  | 'us-california'
  | 'cn-tianjin'
  | 'cn-langfang'

type CanonicalResolveFixture =
  | {
      kind: 'resolved'
      click: { lat: number; lng: number }
      placeId: CanonicalPlaceId
    }
  | {
      kind: 'ambiguous'
      click: { lat: number; lng: number }
      prompt: string
      recommendedPlaceId: CanonicalPlaceId | null
      candidatePlaceIds: CanonicalPlaceId[]
      candidateHints: Record<CanonicalPlaceId, string>
    }
  | {
      kind: 'failed'
      click: { lat: number; lng: number }
      reason: 'NO_CANONICAL_MATCH' | 'LOW_CONFIDENCE_BORDER' | 'OUTSIDE_SUPPORTED_DATA'
      message: string
    }

const DATASET_VERSION = 'phase12-canonical-fixture-v1'

/**
 * A canonical place summary without geometryRef.
 * The service layer injects geometryRef by looking up the generated manifest
 * using boundaryId as the key, so fixtures must not hand-code assetKey.
 */
type CanonicalPlaceSummaryWithoutGeometryRef = Omit<ResolvedCanonicalPlace, 'geometryRef'>

function createChinaPlace(
  placeId: CanonicalPlaceId,
  boundaryId: string,
  displayName: string,
  adminType: ChinaAdminType,
  typeLabel: string,
  parentLabel: string,
): CanonicalPlaceSummaryWithoutGeometryRef {
  return {
    placeId,
    boundaryId,
    placeKind: 'CN_ADMIN',
    datasetVersion: DATASET_VERSION,
    displayName,
    regionSystem: 'CN',
    adminType,
    typeLabel,
    parentLabel,
    subtitle: `${parentLabel} · ${typeLabel}`,
  }
}

export const canonicalPlaceCatalogBase: Record<CanonicalPlaceId, CanonicalPlaceSummaryWithoutGeometryRef> = {
  'cn-beijing': createChinaPlace(
    'cn-beijing',
    'datav-cn-beijing',
    '北京',
    'MUNICIPALITY',
    '直辖市',
    '中国',
  ),
  'cn-hong-kong': createChinaPlace(
    'cn-hong-kong',
    'datav-cn-hong-kong',
    '香港',
    'SAR',
    '特别行政区',
    '中国',
  ),
  'cn-aba': createChinaPlace(
    'cn-aba',
    'datav-cn-aba',
    '阿坝藏族羌族自治州',
    'AUTONOMOUS_PREFECTURE',
    '自治州',
    '中国 · 四川',
  ),
  'us-california': {
    placeId: 'us-california',
    boundaryId: 'ne-admin1-us-california',
    placeKind: 'OVERSEAS_ADMIN1',
    datasetVersion: DATASET_VERSION,
    displayName: 'California',
    regionSystem: 'OVERSEAS',
    adminType: 'ADMIN1',
    typeLabel: '一级行政区',
    parentLabel: 'United States',
    subtitle: 'United States · 一级行政区',
  },
  'cn-tianjin': createChinaPlace(
    'cn-tianjin',
    'datav-cn-tianjin',
    '天津',
    'MUNICIPALITY',
    '直辖市',
    '中国',
  ),
  'cn-langfang': createChinaPlace(
    'cn-langfang',
    'datav-cn-langfang',
    '廊坊',
    'PREFECTURE_LEVEL_CITY',
    '地级市',
    '中国 · 河北',
  ),
}

export const MAX_CANONICAL_CANDIDATES = 3

export const CANONICAL_RESOLVE_FIXTURES: CanonicalResolveFixture[] = [
  {
    kind: 'resolved',
    click: {
      lat: 39.9042,
      lng: 116.4074,
    },
    placeId: 'cn-beijing',
  },
  {
    kind: 'resolved',
    click: {
      lat: 22.3193,
      lng: 114.1694,
    },
    placeId: 'cn-hong-kong',
  },
  {
    kind: 'resolved',
    click: {
      lat: 31.9019,
      lng: 102.2214,
    },
    placeId: 'cn-aba',
  },
  {
    kind: 'resolved',
    click: {
      lat: 36.7783,
      lng: -119.4179,
    },
    placeId: 'us-california',
  },
  {
    kind: 'ambiguous',
    click: {
      lat: 39.5432,
      lng: 116.7921,
    },
    prompt: '该点位靠近多个正式行政区，请确认正确地点。',
    recommendedPlaceId: 'cn-beijing',
    candidatePlaceIds: ['cn-beijing', 'cn-tianjin', 'cn-langfang'],
    candidateHints: {
      'cn-beijing': '点击点位接近北京市边界。',
      'cn-hong-kong': '当前点位不在香港范围内。',
      'cn-aba': '当前点位不在阿坝范围内。',
      'us-california': '当前点位不在 California 范围内。',
      'cn-tianjin': '点击点位也可能落在天津方向的边界附近。',
      'cn-langfang': '点击点位位于京津冀交界过渡区域。',
    },
  },
  {
    kind: 'failed',
    click: {
      lat: 0,
      lng: 0,
    },
    reason: 'NO_CANONICAL_MATCH',
    message: '当前点击位置无法可靠映射到中国正式行政区或海外一级行政区。',
  },
]

export type { CanonicalResolveFixture }
