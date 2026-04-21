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

export const PHASE28_CANONICAL_DATASET_VERSION = 'canonical-authoritative-2026-04-21' as const
export const PHASE28_GEOMETRY_DATASET_VERSION = '2026-04-21-geo-v3' as const
export const PHASE28_OVERSEAS_GEOMETRY_ASSET_KEY = 'overseas/layer.json' as const

type Phase28OverseasFixtureDefinition = {
  placeId: string
  boundaryId: string
  displayName: string
  parentLabel: string
  typeLabel: string
}

function createPhase28ResolvedOverseasPlace(
  definition: Phase28OverseasFixtureDefinition,
): ResolvedCanonicalPlace {
  return {
    placeId: definition.placeId,
    boundaryId: definition.boundaryId,
    placeKind: 'OVERSEAS_ADMIN1',
    datasetVersion: PHASE28_CANONICAL_DATASET_VERSION,
    displayName: definition.displayName,
    regionSystem: 'OVERSEAS',
    adminType: 'ADMIN1',
    typeLabel: definition.typeLabel,
    parentLabel: definition.parentLabel,
    subtitle: `${definition.parentLabel} · ${definition.typeLabel}`,
    geometryRef: {
      boundaryId: definition.boundaryId,
      layer: 'OVERSEAS',
      geometryDatasetVersion: PHASE28_GEOMETRY_DATASET_VERSION,
      assetKey: PHASE28_OVERSEAS_GEOMETRY_ASSET_KEY,
      renderableId: definition.boundaryId,
    },
  }
}

export const PHASE28_RESOLVED_TOKYO = createPhase28ResolvedOverseasPlace({
  placeId: 'jp-tokyo',
  boundaryId: 'ne-admin1-jp-tokyo',
  displayName: 'Tokyo',
  parentLabel: 'Japan',
  typeLabel: 'Prefecture',
})

export const PHASE28_RESOLVED_CALIFORNIA = createPhase28ResolvedOverseasPlace({
  placeId: 'us-california',
  boundaryId: 'ne-admin1-us-california',
  displayName: 'California',
  parentLabel: 'United States',
  typeLabel: 'State',
})

export const PHASE28_NEW_OVERSEAS_RECORD_FIXTURES: readonly ResolvedCanonicalPlace[] = [
  createPhase28ResolvedOverseasPlace({
    placeId: 'in-ladakh',
    boundaryId: 'ne-admin1-in-ladakh',
    displayName: 'Ladakh',
    parentLabel: 'India',
    typeLabel: 'State',
  }),
  createPhase28ResolvedOverseasPlace({
    placeId: 'id-east-kalimantan',
    boundaryId: 'ne-admin1-id-east-kalimantan',
    displayName: 'East Kalimantan',
    parentLabel: 'Indonesia',
    typeLabel: 'Province',
  }),
  createPhase28ResolvedOverseasPlace({
    placeId: 'sa-eastern',
    boundaryId: 'ne-admin1-sa-eastern',
    displayName: 'Eastern',
    parentLabel: 'Saudi Arabia',
    typeLabel: 'Region',
  }),
  createPhase28ResolvedOverseasPlace({
    placeId: 'pg-sandaun',
    boundaryId: 'ne-admin1-pg-sandaun',
    displayName: 'Sandaun',
    parentLabel: 'Papua New Guinea',
    typeLabel: 'Province',
  }),
  createPhase28ResolvedOverseasPlace({
    placeId: 'ca-british-columbia',
    boundaryId: 'ne-admin1-ca-british-columbia',
    displayName: 'British Columbia',
    parentLabel: 'Canada',
    typeLabel: 'Province',
  }),
  createPhase28ResolvedOverseasPlace({
    placeId: 'br-rio-grande-do-sul',
    boundaryId: 'ne-admin1-br-rio-grande-do-sul',
    displayName: 'Rio Grande do Sul',
    parentLabel: 'Brazil',
    typeLabel: 'State',
  }),
  createPhase28ResolvedOverseasPlace({
    placeId: 'ar-entre-rios',
    boundaryId: 'ne-admin1-ar-entre-rios',
    displayName: 'Entre Ríos',
    parentLabel: 'Argentina',
    typeLabel: 'Province',
  }),
  createPhase28ResolvedOverseasPlace({
    placeId: 'de-saxony',
    boundaryId: 'ne-admin1-de-saxony',
    displayName: 'Saxony',
    parentLabel: 'Germany',
    typeLabel: 'State',
  }),
  createPhase28ResolvedOverseasPlace({
    placeId: 'pl-silesian-voivodeship',
    boundaryId: 'ne-admin1-pl-silesian-voivodeship',
    displayName: 'Silesian Voivodeship',
    parentLabel: 'Poland',
    typeLabel: 'Province',
  }),
  createPhase28ResolvedOverseasPlace({
    placeId: 'cz-usti-nad-labem',
    boundaryId: 'ne-admin1-cz-usti-nad-labem',
    displayName: 'Ústí nad Labem',
    parentLabel: 'Czech Republic',
    typeLabel: 'Region',
  }),
  createPhase28ResolvedOverseasPlace({
    placeId: 'eg-north-sinai',
    boundaryId: 'ne-admin1-eg-north-sinai',
    displayName: 'North Sinai',
    parentLabel: 'Egypt',
    typeLabel: 'Governorate',
  }),
  createPhase28ResolvedOverseasPlace({
    placeId: 'ma-guelmim-es-semara',
    boundaryId: 'ne-admin1-ma-guelmim-es-semara',
    displayName: 'Guelmim-Es Semara',
    parentLabel: 'Morocco',
    typeLabel: 'Region',
  }),
  createPhase28ResolvedOverseasPlace({
    placeId: 'za-northern-cape',
    boundaryId: 'ne-admin1-za-northern-cape',
    displayName: 'Northern Cape',
    parentLabel: 'South Africa',
    typeLabel: 'Province',
  }),
]

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
  message: '当前点击位置无法可靠映射到中国正式行政区或海外 admin1 边界。',
}
