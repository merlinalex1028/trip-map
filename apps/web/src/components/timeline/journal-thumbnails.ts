import type { TimelineEntry } from '../../services/timeline'

export type JournalPostcardVariant =
  | 'clouds'
  | 'starlight'
  | 'city'
  | 'mountain'
  | 'sea'
  | 'skyline'
  | 'temple'
  | 'river'

const JOURNAL_POSTCARD_VARIANTS: readonly JournalPostcardVariant[] = [
  'clouds',
  'starlight',
  'city',
  'mountain',
  'sea',
  'skyline',
  'temple',
  'river',
]

const JOURNAL_SUMMARY_FALLBACK = '这段旅途还没有写下摘记'
const DEFAULT_VISIBLE_TAG_LIMIT = 3

export function getJournalPostcardVariant(entry: TimelineEntry): JournalPostcardVariant {
  const source = `${entry.placeId}|${entry.parentLabel}|${entry.subtitle}|${entry.typeLabel}`
  let hash = 0

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0
  }

  return JOURNAL_POSTCARD_VARIANTS[hash % JOURNAL_POSTCARD_VARIANTS.length]
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
