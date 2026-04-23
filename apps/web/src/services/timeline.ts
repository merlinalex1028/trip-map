import type { TravelRecord } from '@trip-map/contracts'

export interface TimelineEntry {
  recordId: string
  placeId: string
  displayName: string
  parentLabel: string
  subtitle: string
  typeLabel: string
  startDate: string | null
  endDate: string | null
  createdAt: string
  hasKnownDate: boolean
  sortDate: string | null
  visitOrdinal: number
  visitCount: number
}

function toTimelineEntry(record: TravelRecord): Omit<TimelineEntry, 'visitOrdinal' | 'visitCount'> {
  const hasKnownDate = record.startDate !== null

  return {
    recordId: record.id,
    placeId: record.placeId,
    displayName: record.displayName,
    parentLabel: record.parentLabel,
    subtitle: record.subtitle,
    typeLabel: record.typeLabel,
    startDate: record.startDate,
    endDate: record.endDate,
    createdAt: record.createdAt,
    hasKnownDate,
    sortDate: hasKnownDate ? (record.endDate ?? record.startDate) : null,
  }
}

function compareTimelineEntries(
  left: Omit<TimelineEntry, 'visitOrdinal' | 'visitCount'>,
  right: Omit<TimelineEntry, 'visitOrdinal' | 'visitCount'>,
) {
  if (left.hasKnownDate !== right.hasKnownDate) {
    return left.hasKnownDate ? -1 : 1
  }

  if (left.hasKnownDate && right.hasKnownDate) {
    const sortDateCompare = (left.sortDate ?? '').localeCompare(right.sortDate ?? '')
    if (sortDateCompare !== 0) {
      return sortDateCompare
    }

    const startDateCompare = (left.startDate ?? '').localeCompare(right.startDate ?? '')
    if (startDateCompare !== 0) {
      return startDateCompare
    }
  }

  const createdAtCompare = left.createdAt.localeCompare(right.createdAt)
  if (createdAtCompare !== 0) {
    return createdAtCompare
  }

  return left.recordId.localeCompare(right.recordId)
}

export function buildTimelineEntries(records: TravelRecord[]): TimelineEntry[] {
  const sortedEntries = records.map(toTimelineEntry).sort(compareTimelineEntries)
  const visitCounts = new Map<string, number>()

  for (const entry of sortedEntries) {
    visitCounts.set(entry.placeId, (visitCounts.get(entry.placeId) ?? 0) + 1)
  }

  const visitOrdinals = new Map<string, number>()

  return sortedEntries.map((entry) => {
    const visitOrdinal = (visitOrdinals.get(entry.placeId) ?? 0) + 1
    visitOrdinals.set(entry.placeId, visitOrdinal)

    return {
      ...entry,
      visitOrdinal,
      visitCount: visitCounts.get(entry.placeId) ?? 1,
    }
  })
}
