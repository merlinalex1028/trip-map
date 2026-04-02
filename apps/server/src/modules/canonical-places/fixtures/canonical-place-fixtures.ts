export type CanonicalPlaceId = string

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
      candidateHints: Record<string, string>
    }
  | {
      kind: 'failed'
      click: { lat: number; lng: number }
      reason: 'NO_CANONICAL_MATCH' | 'LOW_CONFIDENCE_BORDER' | 'OUTSIDE_SUPPORTED_DATA'
      message: string
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
