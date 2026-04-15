import type {
  ChinaAdminType,
  CreateTravelRecordRequest,
  PlaceKind,
} from '@trip-map/contracts'

export const POINT_STORAGE_KEY = 'trip-map:point-state:v2'

interface LegacyPointStorageSnapshot {
  version: 2
  userPoints: unknown[]
  seedOverrides: unknown[]
  deletedSeedIds: string[]
}

interface ReadyLegacyPointStorageLoadResult {
  status: 'ready'
  snapshot: LegacyPointStorageSnapshot
  records: CreateTravelRecordRequest[]
}

interface NonReadyLegacyPointStorageLoadResult {
  status: 'empty' | 'corrupt' | 'incompatible'
  snapshot: null
  records: []
}

export type LegacyPointStorageLoadResult =
  | ReadyLegacyPointStorageLoadResult
  | NonReadyLegacyPointStorageLoadResult

const CHINA_ADMIN_TYPE_BY_LABEL: Record<string, ChinaAdminType> = {
  直辖市: 'MUNICIPALITY',
  特别行政区: 'SAR',
  地级市: 'PREFECTURE_LEVEL_CITY',
  自治州: 'AUTONOMOUS_PREFECTURE',
  盟: 'LEAGUE',
  地区: 'AREA',
}

function normalizeNullableString(value: unknown) {
  return typeof value === 'string' ? value : null
}

function normalizePlaceKind(value: unknown): PlaceKind | null {
  if (value === 'CN_ADMIN' || value === 'OVERSEAS_ADMIN1') {
    return value
  }

  return null
}

function normalizeRegionSystem(
  value: unknown,
  placeKind: PlaceKind,
): CreateTravelRecordRequest['regionSystem'] | null {
  if (value === 'CN' || value === 'OVERSEAS') {
    return value
  }

  if (placeKind === 'CN_ADMIN') {
    return 'CN'
  }

  if (placeKind === 'OVERSEAS_ADMIN1') {
    return 'OVERSEAS'
  }

  return null
}

function normalizeAdminType(
  value: unknown,
  placeKind: PlaceKind,
  typeLabel: string,
): CreateTravelRecordRequest['adminType'] | null {
  if (
    value === 'MUNICIPALITY'
    || value === 'SAR'
    || value === 'PREFECTURE_LEVEL_CITY'
    || value === 'AUTONOMOUS_PREFECTURE'
    || value === 'LEAGUE'
    || value === 'AREA'
    || value === 'ADMIN1'
  ) {
    return value
  }

  if (placeKind === 'OVERSEAS_ADMIN1') {
    return 'ADMIN1'
  }

  return CHINA_ADMIN_TYPE_BY_LABEL[typeLabel] ?? null
}

function normalizeLegacyTravelRecord(value: unknown): CreateTravelRecordRequest | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const point = value as Record<string, unknown>
  const placeKind = normalizePlaceKind(point.placeKind)
  const displayName = normalizeNullableString(point.displayName) ?? normalizeNullableString(point.name)
  const boundaryId = normalizeNullableString(point.boundaryId)
  const placeId = normalizeNullableString(point.placeId)
  const datasetVersion = normalizeNullableString(point.datasetVersion)
    ?? normalizeNullableString(point.boundaryDatasetVersion)
  const typeLabel = normalizeNullableString(point.typeLabel)
  const parentLabel = normalizeNullableString(point.parentLabel)
  const subtitle = normalizeNullableString(point.subtitle)

  if (
    point.source !== 'saved'
    || !placeKind
    || !placeId
    || !boundaryId
    || !datasetVersion
    || !displayName
    || !typeLabel
    || !parentLabel
    || !subtitle
  ) {
    return null
  }

  const regionSystem = normalizeRegionSystem(point.regionSystem, placeKind)
  const adminType = normalizeAdminType(point.adminType, placeKind, typeLabel)

  if (!regionSystem || !adminType) {
    return null
  }

  return {
    placeId,
    boundaryId,
    placeKind,
    datasetVersion,
    displayName,
    regionSystem,
    adminType,
    typeLabel,
    parentLabel,
    subtitle,
  }
}

function isValidDeletedSeedIds(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

export function loadLegacyPointStorageSnapshot(): LegacyPointStorageLoadResult {
  if (typeof window === 'undefined') {
    return {
      status: 'empty',
      snapshot: null,
      records: [],
    }
  }

  const rawSnapshot = window.localStorage.getItem(POINT_STORAGE_KEY)

  if (!rawSnapshot) {
    return {
      status: 'empty',
      snapshot: null,
      records: [],
    }
  }

  try {
    const parsed = JSON.parse(rawSnapshot) as Partial<LegacyPointStorageSnapshot> | null

    if (!parsed) {
      return {
        status: 'corrupt',
        snapshot: null,
        records: [],
      }
    }

    if (parsed.version !== 2) {
      return {
        status: 'incompatible',
        snapshot: null,
        records: [],
      }
    }

    if (
      !Array.isArray(parsed.userPoints)
      || !Array.isArray(parsed.seedOverrides)
      || !isValidDeletedSeedIds(parsed.deletedSeedIds)
    ) {
      return {
        status: 'corrupt',
        snapshot: null,
        records: [],
      }
    }

    const records = parsed.userPoints
      .map((point) => normalizeLegacyTravelRecord(point))
      .filter((point): point is CreateTravelRecordRequest => point !== null)

    return {
      status: 'ready',
      snapshot: {
        version: 2,
        userPoints: parsed.userPoints,
        seedOverrides: parsed.seedOverrides,
        deletedSeedIds: parsed.deletedSeedIds,
      },
      records,
    }
  } catch {
    return {
      status: 'corrupt',
      snapshot: null,
      records: [],
    }
  }
}

export function clearLegacyPointStorageSnapshot() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(POINT_STORAGE_KEY)
}
