export type GlobeNodeType =
  | 'research'
  | 'donor'
  | 'dao'
  | 'ai'
  | 'validator'

export interface GlobeNode {
  id: string
  name: string
  lat: number
  lng: number
  type: GlobeNodeType
}

export const globeNodes: GlobeNode[] = [
  {
    id: 'sao-paulo',
    name: 'São Paulo Research Lab',
    lat: -23.5505,
    lng: -46.6333,
    type: 'research',
  },
  {
    id: 'boston',
    name: 'Boston Donor Network',
    lat: 42.3601,
    lng: -71.0589,
    type: 'donor',
  },
  {
    id: 'london',
    name: 'London Scientific DAO',
    lat: 51.5072,
    lng: -0.1276,
    type: 'dao',
  },
  {
    id: 'tokyo',
    name: 'Tokyo AI Review Node',
    lat: 35.6762,
    lng: 139.6503,
    type: 'ai',
  },
  {
    id: 'berlin',
    name: 'Berlin Blockchain Validator',
    lat: 52.52,
    lng: 13.405,
    type: 'validator',
  },
]
