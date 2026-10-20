const EXPLORER_BASE = 'https://explorer.solana.com'

export function explorerUrl(kind: 'tx' | 'address', value: string) {
  return `${EXPLORER_BASE}/${kind}/${value}?cluster=devnet`
}

export const PROGRAM_ID = '5q7tMMX6j5M4m6JQ2R4kGPZZ8sJ5bxFcxwJkmxfW4AcJ'
