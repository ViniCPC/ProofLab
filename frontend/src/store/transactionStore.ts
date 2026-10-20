import { useSyncExternalStore } from 'react'

export type TransactionType =
  | 'create-project'
  | 'fund-project'
  | 'submit-milestone'
  | 'vote'
  | 'finalize-vote'
  | 'release-funds'
  | 'cancel-project'
  | 'claim-refund'

export type TransactionStatus = 'pending' | 'confirmed' | 'failed'

export interface TransactionRecord {
  id: string
  type: TransactionType
  status: TransactionStatus
  title: string
  message?: string
  projectId?: string
  milestoneId?: string
  transaction?: string
  createdAt: string
}

interface TransactionState {
  selectedProjectId: string | null
  currentMilestoneId: string | null
  latestTransactions: TransactionRecord[]
}

interface AddTransactionInput extends Omit<TransactionRecord, 'id' | 'createdAt'> {
  id?: string
}

const initialTransactionState: TransactionState = {
  selectedProjectId: null,
  currentMilestoneId: null,
  latestTransactions: [],
}

let transactionState = initialTransactionState
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function createTransactionId() {
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function setTransactionState(nextState: Partial<TransactionState>) {
  transactionState = {
    ...transactionState,
    ...nextState,
  }
  emitChange()
}

export const transactionStore = {
  getState: () => transactionState,

  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  setSelectedProject: (projectId: string | null) => {
    setTransactionState({ selectedProjectId: projectId })
  },

  setCurrentMilestone: (milestoneId: string | null) => {
    setTransactionState({ currentMilestoneId: milestoneId })
  },

  addTransaction: (transaction: AddTransactionInput) => {
    const nextTransaction: TransactionRecord = {
      ...transaction,
      id: transaction.id ?? createTransactionId(),
      createdAt: new Date().toISOString(),
    }

    setTransactionState({
      latestTransactions: [
        nextTransaction,
        ...transactionState.latestTransactions,
      ].slice(0, 8),
    })

    return nextTransaction.id
  },

  updateTransaction: (
    transactionId: string,
    nextTransaction: Partial<Omit<TransactionRecord, 'id' | 'createdAt'>>,
  ) => {
    setTransactionState({
      latestTransactions: transactionState.latestTransactions.map((transaction) =>
        transaction.id === transactionId
          ? { ...transaction, ...nextTransaction }
          : transaction,
      ),
    })
  },

  clearTransactions: () => {
    setTransactionState({ latestTransactions: [] })
  },

  reset: () => {
    transactionState = initialTransactionState
    emitChange()
  },
}

export function useTransactionStore() {
  return useSyncExternalStore(
    transactionStore.subscribe,
    transactionStore.getState,
    transactionStore.getState,
  )
}
