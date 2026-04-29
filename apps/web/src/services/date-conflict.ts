import type { TravelRecord } from '@trip-map/contracts'

/**
 * 检查编辑日期时是否与同地点其他记录存在日期冲突。
 * 返回冲突记录的日期范围字符串数组（仅用于前端 UX 提示，不阻塞提交）。
 */
export function checkDateConflict(
  placeId: string,
  currentRecordId: string,
  newStart: string | null,
  newEnd: string | null,
  tripsByPlaceId: Map<string, TravelRecord[]>,
): string[] {
  if (!newStart) {
    return []
  }

  const siblings = tripsByPlaceId.get(placeId) ?? []
  const others = siblings.filter((r) => r.id !== currentRecordId)
  const conflicts: string[] = []

  for (const other of others) {
    if (!other.startDate) {
      continue
    }

    const otherEnd = other.endDate ?? other.startDate
    const effectiveNewEnd = newEnd ?? newStart

    if (newStart <= otherEnd && effectiveNewEnd >= other.startDate) {
      conflicts.push(`${other.startDate} ~ ${otherEnd}`)
    }
  }

  return conflicts
}
