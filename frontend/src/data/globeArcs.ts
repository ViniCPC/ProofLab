export interface GlobeArc {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  label: string
  color: [string, string]
}

export const globeArcs: GlobeArc[] = [
  {
    startLat: -23.5505,
    startLng: -46.6333,
    endLat: 42.3601,
    endLng: -71.0589,
    label: 'Research funding flow',
    color: ['rgba(34, 211, 238, 0.95)', 'rgba(74, 222, 128, 0.95)'],
  },
  {
    startLat: 42.3601,
    startLng: -71.0589,
    endLat: 51.5072,
    endLng: -0.1276,
    label: 'Community governance signal',
    color: ['rgba(74, 222, 128, 0.95)', 'rgba(168, 85, 247, 0.95)'],
  },
  {
    startLat: 51.5072,
    startLng: -0.1276,
    endLat: 35.6762,
    endLng: 139.6503,
    label: 'AI milestone review',
    color: ['rgba(168, 85, 247, 0.95)', 'rgba(34, 211, 238, 0.95)'],
  },
  {
    startLat: 35.6762,
    startLng: 139.6503,
    endLat: 52.52,
    endLng: 13.405,
    label: 'On-chain validation',
    color: ['rgba(34, 211, 238, 0.95)', 'rgba(250, 204, 21, 0.9)'],
  },
  {
    startLat: 52.52,
    startLng: 13.405,
    endLat: -23.5505,
    endLng: -46.6333,
    label: 'Escrow release confirmation',
    color: ['rgba(250, 204, 21, 0.9)', 'rgba(74, 222, 128, 0.95)'],
  },
]
