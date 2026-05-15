import { useSyncExternalStore } from 'react'

export type DemoTransactionType =
  | 'create-project'
  | 'fund-project'
  | 'submit-milestone'
  | 'vote'
  | 'finalize-vote'
  | 'release-funds'
  | 'cancel-project'
  | 'claim-refund'

export type DemoTransactionStatus = 'pending' | 'confirmed' | 'failed'

export interface DemoTransaction {
  id: string
  type: DemoTransactionType
  status: DemoTransactionStatus
  title: string
  message?: string
  projectId?: string
  milestoneId?: string
  transaction?: string
  createdAt: string
}

interface DemoState {
  selectedProjectId: string | null
  currentMilestoneId: string | null
  latestTransactions: DemoTransaction[]
}

interface AddTransactionInput
  extends Omit<DemoTransaction, 'id' | 'createdAt'> {
  id?: string
}

const initialDemoState: DemoState = {
  selectedProjectId: null,
  currentMilestoneId: null,
  latestTransactions: [],
}

let demoState = initialDemoState
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function createTransactionId() {
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function setDemoState(nextState: Partial<DemoState>) {
  demoState = {
    ...demoState,
    ...nextState,
  }
  emitChange()
}

export const demoStore = {
  getState: () => demoState,

  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  setSelectedProject: (projectId: string | null) => {
    setDemoState({ selectedProjectId: projectId })
  },

  setCurrentMilestone: (milestoneId: string | null) => {
    setDemoState({ currentMilestoneId: milestoneId })
  },

  addTransaction: (transaction: AddTransactionInput) => {
    const nextTransaction: DemoTransaction = {
      ...transaction,
      id: transaction.id ?? createTransactionId(),
      createdAt: new Date().toISOString(),
    }

    setDemoState({
      latestTransactions: [
        nextTransaction,
        ...demoState.latestTransactions,
      ].slice(0, 8),
    })

    return nextTransaction.id
  },

  updateTransaction: (
    transactionId: string,
    nextTransaction: Partial<Omit<DemoTransaction, 'id' | 'createdAt'>>,
  ) => {
    setDemoState({
      latestTransactions: demoState.latestTransactions.map((transaction) =>
        transaction.id === transactionId
          ? { ...transaction, ...nextTransaction }
          : transaction,
      ),
    })
  },

  clearTransactions: () => {
    setDemoState({ latestTransactions: [] })
  },

  reset: () => {
    demoState = initialDemoState
    emitChange()
  },
}

export function useDemoStore() {
  return useSyncExternalStore(
    demoStore.subscribe,
    demoStore.getState,
    demoStore.getState,
  )
}
