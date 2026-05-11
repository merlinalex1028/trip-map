export type KawaiiIconName =
  | 'map'
  | 'journal'
  | 'memories'
  | 'calendar'
  | 'star'
  | 'camera'
  | 'badge'
  | 'pin'

export type SemanticIconEntry =
  | { kind: 'iconify'; icon: string }
  | { kind: 'asset'; src: string }

export const semanticIconMap: Record<KawaiiIconName, SemanticIconEntry> = {
  map: { kind: 'iconify', icon: 'kawaii:map' },
  journal: { kind: 'iconify', icon: 'kawaii:journal' },
  memories: { kind: 'iconify', icon: 'kawaii:memories' },
  calendar: { kind: 'iconify', icon: 'kawaii:calendar' },
  star: { kind: 'iconify', icon: 'kawaii:star' },
  camera: { kind: 'iconify', icon: 'kawaii:camera' },
  badge: { kind: 'iconify', icon: 'kawaii:badge' },
  pin: { kind: 'iconify', icon: 'kawaii:pin' },
} as const
