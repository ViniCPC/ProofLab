export interface LandingStat {
  id: string
  value: string
  label: string
}

export const landingStats: LandingStat[] = [
  {
    id: 'research-projects',
    value: '12',
    label: 'Research Projects',
  },
  {
    id: 'scientific-daos',
    value: '5',
    label: 'Scientific DAOs',
  },
  {
    id: 'funded-usdc',
    value: '$82k',
    label: 'Simulated USDC Funded',
  },
  {
    id: 'milestones-reviewed',
    value: '34',
    label: 'Milestones Reviewed',
  },
]
