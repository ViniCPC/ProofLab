import { AIAnalysisCard } from '@/components/ai/AIAnalysisCard'
import { OnChainActionsPanel } from '@/components/blockchain/OnChainActionsPanel'
import { TransactionStatusToast } from '@/components/blockchain/TransactionStatusToast'
import { ContributorsList } from '@/components/funding/ContributorsList'
import { FundingPanel } from '@/components/funding/FundingPanel'
import { RefundPanel } from '@/components/funding/RefundPanel'
import { ReleaseFundsPanel } from '@/components/funding/ReleaseFundsPanel'
import { MilestoneTimeline } from '@/components/milestones/MilestoneTimeline'
import { ResearchHeader } from '@/components/research/ResearchHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { VotingPanel } from '@/components/voting/VotingPanel'
import { useCancelProjectOnChain } from '@/hooks/useCancelProjectOnChain'
import { useClaimRefund } from '@/hooks/useClaimRefund'
import { useCreateProjectOnChain } from '@/hooks/useCreateProjectOnChain'
import { useFundOnChain } from '@/hooks/useFundOnChain'
import { useReanalyzeMilestone } from '@/hooks/useReanalyzeMilestone'
import { useReanalyzeResearch } from '@/hooks/useReanalyzeResearch'
import { useReleaseFunds } from '@/hooks/useReleaseFunds'
import { useResearchDetails } from '@/hooks/useResearchDetails'
import { useSubmitMilestoneOnChain } from '@/hooks/useSubmitMilestoneOnChain'
import { useWalletStore } from '@/store/walletStore'

export default function ResearchDetailsPage() {
  const {
    project,
    funding,
    milestones,
    loading,
    fundingLoading,
    reviewLoading,
    error,
    actionMessage,
    contribute,
    submitMilestoneReview,
    refetch,
  } = useResearchDetails()
  const {
    loading: createProjectOnChainLoading,
    message: createProjectOnChainMessage,
    error: createProjectOnChainError,
    createOnChain,
  } = useCreateProjectOnChain({ projectId: project?.id, onPrepared: refetch })
  const {
    loadingMilestoneId: submitMilestoneOnChainLoadingId,
    message: submitMilestoneOnChainMessage,
    error: submitMilestoneOnChainError,
    submitMilestoneOnChain,
  } = useSubmitMilestoneOnChain({
    projectId: project?.id,
    onPrepared: refetch,
  })
  const {
    loading: fundOnChainLoading,
    error: fundOnChainError,
    transactionStatus: fundTransactionStatus,
    fundOnChain,
    dismissTransactionStatus: dismissFundTransactionStatus,
  } = useFundOnChain({ projectId: project?.id, onFunded: refetch })
  const {
    loadingMilestoneId: releaseLoadingMilestoneId,
    transactionStatus: releaseTransactionStatus,
    releaseFunds,
    dismissTransactionStatus: dismissReleaseTransactionStatus,
  } = useReleaseFunds({ projectId: project?.id, onReleased: refetch })
  const {
    loading: refundLoading,
    transactionStatus: refundTransactionStatus,
    claimRefund,
    dismissTransactionStatus: dismissRefundTransactionStatus,
  } = useClaimRefund({ projectId: project?.id, onClaimed: refetch })
  const {
    loading: cancelProjectOnChainLoading,
    error: cancelProjectOnChainError,
    transactionStatus: cancelTransactionStatus,
    cancelProjectOnChain,
    dismissTransactionStatus: dismissCancelTransactionStatus,
  } = useCancelProjectOnChain({ projectId: project?.id, onCancelled: refetch })
  const {
    loading: reanalyzeResearchLoading,
    error: reanalyzeResearchError,
    reanalyze: reanalyzeResearch,
  } = useReanalyzeResearch({ projectId: project?.id, onReanalyzed: refetch })
  const {
    loadingMilestoneId: reanalyzeMilestoneLoadingId,
    error: reanalyzeMilestoneError,
    reanalyze: reanalyzeMilestone,
  } = useReanalyzeMilestone({ projectId: project?.id, onReanalyzed: refetch })
  const { walletAddress } = useWalletStore()
  const isCreator = Boolean(
    walletAddress && project?.creator?.walletAddress === walletAddress,
  )
  const fundToastIsActive = fundTransactionStatus.status !== 'idle'
  const releaseToastIsActive = releaseTransactionStatus.status !== 'idle'
  const cancelToastIsActive = cancelTransactionStatus.status !== 'idle'
  const pageError =
    error ??
    createProjectOnChainError ??
    submitMilestoneOnChainError ??
    fundOnChainError ??
    cancelProjectOnChainError ??
    reanalyzeResearchError ??
    reanalyzeMilestoneError
  const pageActionMessage =
    actionMessage ?? createProjectOnChainMessage ?? submitMilestoneOnChainMessage
  const onChainLoading =
    createProjectOnChainLoading || Boolean(submitMilestoneOnChainLoadingId)

  if (loading) {
    return (
      <Card glow="cyan">
        <p className="text-sm text-slate-400">Carregando pesquisa...</p>
      </Card>
    )
  }

  if (error && !project) {
    return (
      <Card glow="purple" className="space-y-4">
        <p className="text-sm text-slate-300">{error}</p>
        <Button variant="secondary" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </Card>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="animate-[fade-in_0.4s_ease-out] space-y-6">
      <ResearchHeader project={project} />

      {pageError && (
        <Card glow="purple">
          <p className="text-sm text-purple-100">{pageError}</p>
        </Card>
      )}

      {pageActionMessage && (
        <Card glow="green">
          <p className="text-sm text-green-100">{pageActionMessage}</p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <AIAnalysisCard
            project={project}
            onReanalyze={
              isCreator ? () => void reanalyzeResearch() : undefined
            }
            reanalyzing={reanalyzeResearchLoading}
          />
          <MilestoneTimeline
            milestones={milestones}
            loading={reviewLoading || onChainLoading}
            onSubmitReview={submitMilestoneReview}
            onPrepareOnChain={submitMilestoneOnChain}
            onReanalyze={
              isCreator
                ? (milestoneId) => void reanalyzeMilestone(milestoneId)
                : undefined
            }
            reanalyzingMilestoneId={reanalyzeMilestoneLoadingId}
          />
          <VotingPanel
            project={project}
            milestones={milestones}
            funding={funding}
            onFinalized={refetch}
          />
        </div>

        <aside className="space-y-6">
          <FundingPanel
            funding={funding}
            totalAmount={project.totalAmount}
            loading={fundingLoading}
            onChainLoading={fundOnChainLoading}
            onFund={contribute}
            onFundOnChain={fundOnChain}
          />
          <ContributorsList contributors={funding?.investors ?? []} />
          <ReleaseFundsPanel
            milestones={milestones}
            loadingMilestoneId={releaseLoadingMilestoneId}
            onRelease={releaseFunds}
          />
          <RefundPanel
            project={project}
            funding={funding}
            loading={refundLoading}
            onClaimRefund={claimRefund}
          />
          <OnChainActionsPanel
            loading={onChainLoading}
            cancelLoading={cancelProjectOnChainLoading}
            onCreateProject={createOnChain}
            onCancelProject={cancelProjectOnChain}
          />
        </aside>
      </div>

      <TransactionStatusToast
        state={
          fundToastIsActive
            ? fundTransactionStatus
            : releaseToastIsActive
            ? releaseTransactionStatus
            : cancelToastIsActive
            ? cancelTransactionStatus
            : refundTransactionStatus
        }
        onDismiss={
          fundToastIsActive
            ? dismissFundTransactionStatus
            : releaseToastIsActive
            ? dismissReleaseTransactionStatus
            : cancelToastIsActive
            ? dismissCancelTransactionStatus
            : dismissRefundTransactionStatus
        }
      />
    </div>
  )
}
