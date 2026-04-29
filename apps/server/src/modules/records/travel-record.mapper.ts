import type { UserTravelRecord } from '@prisma/client'
import type { TravelRecord as ContractTravelRecord } from '@trip-map/contracts'
import type { PlaceKind } from '@trip-map/contracts'

export function toContractTravelRecord(record: UserTravelRecord): ContractTravelRecord {
  return {
    id: record.id,
    placeId: record.placeId,
    boundaryId: record.boundaryId,
    placeKind: record.placeKind as PlaceKind,
    datasetVersion: record.datasetVersion,
    displayName: record.displayName,
    regionSystem: record.regionSystem as ContractTravelRecord['regionSystem'],
    adminType: record.adminType as ContractTravelRecord['adminType'],
    typeLabel: record.typeLabel ?? '',
    parentLabel: record.parentLabel ?? '',
    subtitle: record.subtitle,
    startDate: record.startDate ?? null,
    endDate: record.endDate ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    notes: record.notes ?? null,
    tags: record.tags,
  }
}
