import navAtlasIcon from '@/assets/v8/shell/nav-icons/nav-atlas.png'
import navCollectionsIcon from '@/assets/v8/shell/nav-icons/nav-collections.png'
import navJournalIcon from '@/assets/v8/shell/nav-icons/nav-journal.png'
import navSettingsIcon from '@/assets/v8/shell/nav-icons/nav-settings.png'
import navWorldFootprintsIcon from '@/assets/v8/shell/nav-icons/nav-world-footprints.png'

export type KawaiiIconName =
  | 'map'
  | 'journal'
  | 'memories'
  | 'calendar'
  | 'star'
  | 'camera'
  | 'badge'
  | 'pin'
  | 'suitcase'
  | 'signpost'
  | 'globe'
  | 'settings'

export type SemanticIconEntry =
  | { kind: 'iconify'; icon: string }
  | { kind: 'asset'; src: string }

export const semanticIconMap: Record<KawaiiIconName, SemanticIconEntry> = {
  map: { kind: 'asset', src: navWorldFootprintsIcon },
  journal: { kind: 'asset', src: navJournalIcon },
  memories: { kind: 'asset', src: navAtlasIcon },
  calendar: { kind: 'iconify', icon: 'kawaii:calendar' },
  star: { kind: 'asset', src: navCollectionsIcon },
  camera: { kind: 'iconify', icon: 'kawaii:camera' },
  badge: { kind: 'iconify', icon: 'kawaii:badge' },
  pin: { kind: 'iconify', icon: 'kawaii:pin' },
  suitcase: { kind: 'iconify', icon: 'kawaii:suitcase' },
  signpost: { kind: 'iconify', icon: 'kawaii:signpost' },
  globe: { kind: 'iconify', icon: 'kawaii:globe' },
  settings: { kind: 'asset', src: navSettingsIcon },
} as const
