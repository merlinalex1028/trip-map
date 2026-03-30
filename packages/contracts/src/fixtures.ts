import type { CanonicalPlaceSummary } from './place'
import type {
  CanonicalPlaceCandidate,
  CanonicalResolveResponse,
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

export const PHASE12_RESOLVED_BEIJING: CanonicalPlaceSummary = {
  placeId: 'cn-admin-beijing',
  boundaryId: 'datav-cn-beijing',
  placeKind: 'CN_ADMIN',
  datasetVersion: 'phase12-canonical-v1',
  displayName: '北京',
  regionSystem: 'CN',
  adminType: 'MUNICIPALITY',
  typeLabel: '直辖市',
  parentLabel: '中国',
  subtitle: '中国 · 直辖市',
}

export const PHASE12_RESOLVED_HONG_KONG: CanonicalPlaceSummary = {
  placeId: 'cn-admin-hong-kong',
  boundaryId: 'datav-cn-hong-kong',
  placeKind: 'CN_ADMIN',
  datasetVersion: 'phase12-canonical-v1',
  displayName: '香港',
  regionSystem: 'CN',
  adminType: 'SAR',
  typeLabel: '特别行政区',
  parentLabel: '中国',
  subtitle: '中国 · 特别行政区',
}

export const PHASE12_RESOLVED_CALIFORNIA: CanonicalPlaceSummary = {
  placeId: 'overseas-admin1-california',
  boundaryId: 'ne-admin1-us-ca',
  placeKind: 'OVERSEAS_ADMIN1',
  datasetVersion: 'phase12-canonical-v1',
  displayName: 'California',
  regionSystem: 'OVERSEAS',
  adminType: 'ADMIN1',
  typeLabel: '一级行政区',
  parentLabel: 'United States',
  subtitle: 'United States · 一级行政区',
}

const PHASE12_AMBIGUOUS_CANDIDATES: CanonicalPlaceCandidate[] = [
  {
    ...PHASE12_RESOLVED_BEIJING,
    candidateHint: '点击点位接近北京市中心',
  },
  {
    placeId: 'cn-admin-tianjin',
    boundaryId: 'datav-cn-tianjin',
    placeKind: 'CN_ADMIN',
    datasetVersion: 'phase12-canonical-v1',
    displayName: '天津',
    regionSystem: 'CN',
    adminType: 'MUNICIPALITY',
    typeLabel: '直辖市',
    parentLabel: '中国',
    subtitle: '中国 · 直辖市',
    candidateHint: '点击点位位于北京与天津边界附近',
  },
  {
    placeId: 'cn-admin-langfang',
    boundaryId: 'datav-cn-langfang',
    placeKind: 'CN_ADMIN',
    datasetVersion: 'phase12-canonical-v1',
    displayName: '廊坊',
    regionSystem: 'CN',
    adminType: 'PREFECTURE_LEVEL_CITY',
    typeLabel: '地级市',
    parentLabel: '中国 · 河北',
    subtitle: '中国 · 地级市',
    candidateHint: '点击点位也可能落在廊坊交界区域',
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
