import { Info, LockKeyhole, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VotingEligibilityNoticeProps {
  connected: boolean
  isContributor: boolean
  isCreator: boolean
  canVote: boolean
  className?: string
}

function getNotice({
  connected,
  isContributor,
  isCreator,
  canVote,
}: Omit<VotingEligibilityNoticeProps, 'className'>) {
  if (canVote) {
    return {
      icon: UserCheck,
      text: 'Você contribuiu com este projeto e pode votar.',
      className: 'border-green-300/20 bg-green-300/10 text-green-100',
    }
  }

  if (!connected) {
    return {
      icon: LockKeyhole,
      text: 'Conecte sua wallet para verificar elegibilidade.',
      className: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100',
    }
  }

  if (isCreator) {
    return {
      icon: LockKeyhole,
      text: 'Pesquisadores não votam na própria entrega.',
      className: 'border-purple-300/20 bg-purple-300/10 text-purple-100',
    }
  }

  if (!isContributor) {
    return {
      icon: LockKeyhole,
      text: 'Apenas doadores podem votar.',
      className: 'border-purple-300/20 bg-purple-300/10 text-purple-100',
    }
  }

  return {
    icon: Info,
    text: 'Votação indisponível para esta milestone.',
    className: 'border-slate-700 bg-slate-900/80 text-slate-400',
  }
}

export function VotingEligibilityNotice({
  connected,
  isContributor,
  isCreator,
  canVote,
  className,
}: VotingEligibilityNoticeProps) {
  const notice = getNotice({ connected, isContributor, isCreator, canVote })
  const Icon = notice.icon

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
        notice.className,
        className,
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span>{notice.text}</span>
    </div>
  )
}
