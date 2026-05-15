import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface VoteButtonsProps {
  loading?: boolean
  disabled?: boolean
  onVote: (approve: boolean) => Promise<void>
}

export function VoteButtons({ loading, disabled, onVote }: VoteButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant="primary"
        loading={loading}
        disabled={disabled}
        onClick={() => void onVote(true)}
      >
        <Check className="size-3.5" />
        Aprovar
      </Button>
      <Button
        type="button"
        size="sm"
        variant="danger"
        loading={loading}
        disabled={disabled}
        onClick={() => void onVote(false)}
      >
        <X className="size-3.5" />
        Rejeitar
      </Button>
    </div>
  )
}
