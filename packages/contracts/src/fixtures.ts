import type {
  CanonicalPlaceCandidate,
  CanonicalResolveResponse,
  ResolvedCanonicalPlace,
} from './resolve'
import type { SmokeRecordCreateRequest } from './records'

export const PHASE11_SMOKE_RECORD_REQUEST: SmokeRecordCreateRequest = {
  placeId: 'phase11-demo-place',
  boundaryId: 'phase11-demo-boundary',
  placeKind: 'OVERSEAS_ADMIN1',
  datasetVersion: 'phase11-smoke-v1',
  displayName: 'Phase 11 Demo Place',
  regionSystem: 'OVERSEAS',
  adminType: 'ADMIN1',
  typeLabel: '一级行政区',
  parentLabel: 'Phase 11 Demo Country',
  subtitle: 'Phase 11 Demo Country · 一级行政区',
}

export const PHASE12_RESOLVED_BEIJING: ResolvedCanonicalPlace = {
  placeId: 'cn-beijing',
  boundaryId: 'datav-cn-beijing',
  placeKind: 'CN_ADMIN',
  datasetVersion: 'phase12-canonical-fixture-v1',
  displayName: '北京',
  regionSystem: 'CN',
  adminType: 'MUNICIPALITY',
  typeLabel: '直辖市',
  parentLabel: '中国',
  subtitle: '中国 · 直辖市',
  geometryRef: {
    boundaryId: 'datav-cn-beijing',
    layer: 'CN',
    geometryDatasetVersion: '2026-03-31-geo-v1',
    assetKey: 'cn/beijing.json',
    renderableId: 'datav-cn-beijing',
  },
}

export const PHASE12_RESOLVED_HONG_KONG: ResolvedCanonicalPlace = {
  placeId: 'cn-hong-kong',
  boundaryId: 'datav-cn-hong-kong',
  placeKind: 'CN_ADMIN',
  datasetVersion: 'phase12-canonical-fixture-v1',
  displayName: '香港',
  regionSystem: 'CN',
  adminType: 'SAR',
  typeLabel: '特别行政区',
  parentLabel: '中国',
  subtitle: '中国 · 特别行政区',
  geometryRef: {
    boundaryId: 'datav-cn-hong-kong',
    layer: 'CN',
    geometryDatasetVersion: '2026-03-31-geo-v1',
    assetKey: 'cn/hong-kong.json',
    renderableId: 'datav-cn-hong-kong',
  },
}

export const PHASE12_RESOLVED_CALIFORNIA: ResolvedCanonicalPlace = {
  placeId: 'us-california',
  boundaryId: 'ne-admin1-us-california',
  placeKind: 'OVERSEAS_ADMIN1',
  datasetVersion: 'phase12-canonical-fixture-v1',
  displayName: 'California',
  regionSystem: 'OVERSEAS',
  adminType: 'ADMIN1',
  typeLabel: '一级行政区',
  parentLabel: 'United States',
  subtitle: 'United States · 一级行政区',
  geometryRef: {
    boundaryId: 'ne-admin1-us-california',
    layer: 'OVERSEAS',
    geometryDatasetVersion: '2026-03-31-geo-v1',
    assetKey: 'overseas/us.json',
    renderableId: 'ne-admin1-us-california',
  },
}

export const PHASE12_RESOLVED_ABA: ResolvedCanonicalPlace = {
  placeId: 'cn-aba',
  boundaryId: 'datav-cn-aba',
  placeKind: 'CN_ADMIN',
  datasetVersion: 'phase12-canonical-fixture-v1',
  displayName: '阿坝',
  regionSystem: 'CN',
  adminType: 'AUTONOMOUS_PREFECTURE',
  typeLabel: '自治州',
  parentLabel: '中国 · 四川',
  subtitle: '中国 · 四川 · 自治州',
  geometryRef: {
    boundaryId: 'datav-cn-aba',
    layer: 'CN',
    geometryDatasetVersion: '2026-03-31-geo-v1',
    assetKey: 'cn/sichuan.json',
    renderableId: 'datav-cn-aba',
  },
}

const PHASE12_AMBIGUOUS_CANDIDATES: CanonicalPlaceCandidate[] = [
  {
    ...PHASE12_RESOLVED_BEIJING,
    candidateHint: '点击点位接近北京市中心',
  },
  {
    placeId: 'cn-tianjin',
    boundaryId: 'datav-cn-tianjin',
    placeKind: 'CN_ADMIN',
    datasetVersion: 'phase12-canonical-fixture-v1',
    displayName: '天津',
    regionSystem: 'CN',
    adminType: 'MUNICIPALITY',
    typeLabel: '直辖市',
    parentLabel: '中国',
    subtitle: '中国 · 直辖市',
    candidateHint: '点击点位位于北京与天津边界附近',
    geometryRef: {
      boundaryId: 'datav-cn-tianjin',
      layer: 'CN',
      geometryDatasetVersion: '2026-03-31-geo-v1',
      assetKey: 'cn/tianjin.json',
      renderableId: 'datav-cn-tianjin',
    },
  },
  {
    placeId: 'cn-langfang',
    boundaryId: 'datav-cn-langfang',
    placeKind: 'CN_ADMIN',
    datasetVersion: 'phase12-canonical-fixture-v1',
    displayName: '廊坊',
    regionSystem: 'CN',
    adminType: 'PREFECTURE_LEVEL_CITY',
    typeLabel: '地级市',
    parentLabel: '中国 · 河北',
    subtitle: '中国 · 地级市',
    candidateHint: '点击点位也可能落在廊坊交界区域',
    geometryRef: {
      boundaryId: 'datav-cn-langfang',
      layer: 'CN',
      geometryDatasetVersion: '2026-03-31-geo-v1',
      assetKey: 'cn/hebei.json',
      renderableId: 'datav-cn-langfang',
    },
  },
]

export const PHASE12_AMBIGUOUS_RESOLVE: CanonicalResolveResponse = {
  status: 'ambiguous',
  click: { lat: 39.5432, lng: 116.7921 },
  prompt: '该点位靠近多个正式行政区，请确认正确地点。',
  recommendedPlaceId: PHASE12_RESOLVED_BEIJING.placeId,
  candidates: PHASE12_AMBIGUOUS_CANDIDATES,
}

export const PHASE12_FAILED_RESOLVE: CanonicalResolveResponse = {
  status: 'failed',
  click: { lat: 35.1234, lng: 119.5678 },
  reason: 'NO_CANONICAL_MATCH',
  message: '当前点击位置无法可靠映射到中国正式行政区或海外一级行政区。',
}
