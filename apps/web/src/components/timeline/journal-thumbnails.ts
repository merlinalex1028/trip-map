import type { TimelineEntry } from '../../services/timeline'

import kyotoThumbnail from '@/assets/v8/journal-thumbnails/kyoto.png'
import parisThumbnail from '@/assets/v8/journal-thumbnails/paris.png'
import riverThumbnail from '@/assets/v8/journal-thumbnails/river.png'
import shanghaiThumbnail from '@/assets/v8/journal-thumbnails/shanghai.png'

export type JournalPostcardVariant =
  | 'river'
  | 'kyoto'
  | 'paris'
  | 'shanghai'

const JOURNAL_POSTCARD_VARIANTS: readonly JournalPostcardVariant[] = [
  'river',
  'kyoto',
  'paris',
  'shanghai',
]

const JOURNAL_SUMMARY_FALLBACK = '这段旅途还没有写下摘记'
const DEFAULT_VISIBLE_TAG_LIMIT = 3
const JOURNAL_POSTCARD_IMAGES: Record<JournalPostcardVariant, string> = {
  river: riverThumbnail,
  kyoto: kyotoThumbnail,
  paris: parisThumbnail,
  shanghai: shanghaiThumbnail,
}

function getSemanticPostcardVariant(source: string): JournalPostcardVariant | null {
  if (source.includes('河源')) {
    return 'river'
  }

  if (source.includes('京都') || source.includes('kyoto')) {
    return 'kyoto'
  }

  if (
    source.includes('巴黎') ||
    source.includes('paris') ||
    source.includes('法国') ||
    source.includes('france')
  ) {
    return 'paris'
  }

  if (source.includes('上海') || source.includes('shanghai')) {
    return 'shanghai'
  }

  return null
}

export function getJournalPostcardVariant(entry: TimelineEntry): JournalPostcardVariant {
  const displayNameVariant = getSemanticPostcardVariant(entry.displayName.toLowerCase())

  if (displayNameVariant !== null) {
    return displayNameVariant
  }

  const semanticVariant = getSemanticPostcardVariant(
    `${entry.parentLabel}|${entry.subtitle}|${entry.typeLabel}`.toLowerCase(),
  )

  if (semanticVariant !== null) {
    return semanticVariant
  }

  const source = `${entry.placeId}|${entry.parentLabel}|${entry.subtitle}|${entry.typeLabel}`
  let hash = 0

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0
  }

  return JOURNAL_POSTCARD_VARIANTS[hash % JOURNAL_POSTCARD_VARIANTS.length]
}

export function getJournalPostcardImage(variant: JournalPostcardVariant): string {
  return JOURNAL_POSTCARD_IMAGES[variant]
}

export function getJournalSummary(notes: string | null): string {
  const firstMeaningfulLine = notes
    ?.split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0)

  return firstMeaningfulLine ?? JOURNAL_SUMMARY_FALLBACK
}

export function getJournalLocationPath(entry: TimelineEntry): string {
  const parts = [entry.parentLabel, entry.subtitle, entry.typeLabel]
    .flatMap((part) => part.split(' · '))
    .map((part) => part.trim())
    .filter((part) => part.length > 0)

  return parts.filter((part, index) => parts.indexOf(part) === index).join(' · ')
}

export function getVisibleJournalTags(
  tags: string[],
  limit = DEFAULT_VISIBLE_TAG_LIMIT,
): { visible: string[]; hiddenCount: number } {
  const safeLimit = Math.max(0, Math.floor(limit))
  const visible = tags.slice(0, safeLimit)

  return {
    visible,
    hiddenCount: Math.max(0, tags.length - visible.length),
  }
}
