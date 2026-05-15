import { CheckCircle2, Loader2, X, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export type TransactionStatus = 'idle' | 'pending' | 'confirmed' | 'failed'

export interface TransactionStatusState {
  status: TransactionStatus
  title: string
  message?: string
  transaction?: string
}

interface TransactionStatusToastProps {
  state: TransactionStatusState
  onDismiss?: () => void
  className?: string
}

const statusStyles: Record<Exclude<TransactionStatus, 'idle'>, string> = {
  pending: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100',
  confirmed: 'border-green-300/30 bg-green-300/10 text-green-100',
  failed: 'border-purple-300/30 bg-purple-300/10 text-purple-100',
}

function StatusIcon({ status }: { status: Exclude<TransactionStatus, 'idle'> }) {
  if (status === 'pending') {
    return <Loader2 className="size-4 animate-spin" />
  }

  if (status === 'confirmed') {
    return <CheckCircle2 className="size-4" />
  }

  return <XCircle className="size-4" />
}

function shortenTransaction(transaction: string) {
  return `${transaction.slice(0, 10)}...${transaction.slice(-8)}`
}

export function TransactionStatusToast({
  state,
  onDismiss,
  className,
}: TransactionStatusToastProps) {
  if (state.status === 'idle') return null

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 w-[min(360px,calc(100vw-2rem))] rounded-xl border p-4 shadow-2xl backdrop-blur-xl',
        statusStyles[state.status],
        className,
      )}
      role="status"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <StatusIcon status={state.status} />
          <div>
            <p className="text-sm font-semibold">{state.title}</p>
            {state.message && (
              <p className="mt-1 text-sm leading-5 opacity-80">
                {state.message}
              </p>
            )}
            {state.transaction && (
              <p className="mt-2 break-all font-mono text-xs opacity-70">
                {shortenTransaction(state.transaction)}
              </p>
            )}
          </div>
        </div>
        {onDismiss && state.status !== 'pending' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            aria-label="Fechar status da transação"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
