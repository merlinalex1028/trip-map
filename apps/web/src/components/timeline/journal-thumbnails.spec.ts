import type { TimelineEntry } from '../../services/timeline'

import {
  getJournalPostcardImage,
  getJournalLocationPath,
  getJournalPostcardVariant,
  getJournalSummary,
  getVisibleJournalTags,
} from './journal-thumbnails'

function makeEntry(overrides: Partial<TimelineEntry> = {}): TimelineEntry {
  return {
    recordId: 'record-kyoto-1',
    placeId: 'jp-kyoto',
    displayName: '京都',
    parentLabel: '日本',
    subtitle: '京都府',
    typeLabel: '府',
    startDate: '2025-04-01',
    endDate: null,
    createdAt: '2025-04-02T00:00:00.000Z',
    hasKnownDate: true,
    sortDate: '2025-04-01',
    visitOrdinal: 1,
    visitCount: 1,
    notes: null,
    tags: [],
    ...overrides,
  }
}

describe('journal thumbnail helpers', () => {
  describe('getJournalSummary', () => {
    it('uses the first meaningful note line', () => {
      expect(getJournalSummary('  \n 京都清晨散步\n第二行')).toBe('京都清晨散步')
    })

    it('returns exact fallback copy for missing notes', () => {
      expect(getJournalSummary(null)).toBe('这段旅途还没有写下摘记')
      expect(getJournalSummary(' \n\t ')).toBe('这段旅途还没有写下摘记')
    })
  })

  describe('getJournalLocationPath', () => {
    it('returns a natural path line and skips duplicate parts', () => {
      expect(getJournalLocationPath(makeEntry())).toBe('日本 · 京都府 · 府')
      expect(
        getJournalLocationPath(
          makeEntry({
            parentLabel: '中国',
            subtitle: '中国',
            typeLabel: '地级市',
          }),
        ),
      ).toBe('中国 · 地级市')
      expect(
        getJournalLocationPath(
          makeEntry({
            parentLabel: 'Japan',
            subtitle: 'Japan · Prefecture',
            typeLabel: 'Prefecture',
          }),
        ),
      ).toBe('Japan · Prefecture')
    })
  })

  describe('getVisibleJournalTags', () => {
    it('limits visible tags and returns hiddenCount', () => {
      expect(getVisibleJournalTags(['美食', '文化', '历史', '海边'])).toEqual({
        visible: ['美食', '文化', '历史'],
        hiddenCount: 1,
      })
    })
  })

  describe('getJournalPostcardVariant', () => {
    it('is stable across refresh and sorting changes', () => {
      const original = makeEntry()
      const resorted = makeEntry({
        recordId: 'record-kyoto-2',
        startDate: '2025-05-01',
        endDate: '2025-05-05',
        createdAt: '2025-05-06T00:00:00.000Z',
        sortDate: '2025-05-05',
        visitOrdinal: 2,
        visitCount: 2,
      })

      expect(getJournalPostcardVariant(resorted)).toBe(getJournalPostcardVariant(original))
    })

    it('derives the variant from stable place context fields', () => {
      const variants = new Set([
        getJournalPostcardVariant(makeEntry({ placeId: 'jp-kyoto' })),
        getJournalPostcardVariant(makeEntry({ displayName: '河源', parentLabel: '中国' })),
        getJournalPostcardVariant(makeEntry({ displayName: '巴黎', parentLabel: '法国' })),
        getJournalPostcardVariant(makeEntry({ displayName: '上海', parentLabel: '中国' })),
      ])

      expect(variants).toEqual(new Set(['kyoto', 'river', 'paris', 'shanghai']))
    })

    it('returns a bundled image for each variant', () => {
      for (const variant of ['kyoto', 'river', 'paris', 'shanghai'] as const) {
        expect(getJournalPostcardImage(variant)).toBeTruthy()
      }
    })
  })
})
