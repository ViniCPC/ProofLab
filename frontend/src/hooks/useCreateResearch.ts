import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import type { ResearchFormValues } from '@/components/research/ResearchForm'
import { researchService } from '@/services/research.service'
import { demoStore } from '@/store/demoStore'
import { useWalletStore } from '@/store/walletStore'
import type { ResearchProject } from '@/types'
import { getApiErrorMessage } from '@/utils/errors'
import { normalizeDecimal } from '@/utils/format'
import { ensureWalletSession } from '@/utils/wallet'

interface CreateResearchState {
  loading: boolean
  error: string | null
  success: boolean
  createdResearch: ResearchProject | null
}

const decimalPattern = /^(?!0+(\.0{1,6})?$)\d+(\.\d{1,6})?$/

function isValidAmount(value: string) {
  return decimalPattern.test(value.trim())
}

function toBaseUnits(value: string) {
  const [whole, fraction = ''] = value.trim().split('.')
  return (
    BigInt(whole) * 1_000_000n +
    BigInt(fraction.padEnd(6, '0').slice(0, 6))
  )
}

function formatBaseUnits(value: bigint) {
  const absolute = value < 0n ? -value : value
  const whole = absolute / 1_000_000n
  const fraction = (absolute % 1_000_000n)
    .toString()
    .padStart(6, '0')
    .replace(/0+$/, '')

  return `${value < 0n ? '-' : ''}${whole}${fraction ? `.${fraction}` : ''}`
}

function validateResearch(values: ResearchFormValues) {
  if (!isValidAmount(values.totalAmount)) {
    return 'Informe um valor total maior que zero com até 6 casas decimais.'
  }

  const invalidMilestone = values.milestones.find(
    (milestone) => !isValidAmount(milestone.amount),
  )

  if (invalidMilestone) {
    return 'Todas as milestones precisam ter valor maior que zero com até 6 casas decimais.'
  }

  const totalAmount = toBaseUnits(values.totalAmount)
  const milestoneTotal = values.milestones.reduce(
    (sum, milestone) => sum + toBaseUnits(milestone.amount),
    0n,
  )

  if (milestoneTotal !== totalAmount) {
    const difference = totalAmount - milestoneTotal
    return difference > 0n
      ? `Faltam ${formatBaseUnits(difference)} USDC para fechar o total.`
      : `As milestones excedem o total em ${formatBaseUnits(-difference)} USDC.`
  }

  return null
}

export function useCreateResearch() {
  const { walletAddress } = useWalletStore()
  const { signMessage } = useWallet()
  const [state, setState] = useState<CreateResearchState>({
    loading: false,
    error: null,
    success: false,
    createdResearch: null,
  })

  async function createResearch(values: ResearchFormValues) {
    const validationError = validateResearch(values)

    if (validationError) {
      setState((currentState) => ({
        ...currentState,
        loading: false,
        error: validationError,
        success: false,
      }))
      return
    }

    setState((currentState) => ({
      ...currentState,
      loading: true,
      error: null,
      success: false,
    }))

    try {
      await ensureWalletSession(
        walletAddress,
        signMessage,
        'Conecte sua wallet para criar uma pesquisa.',
      )

      const createdResearch = await researchService.create({
        title: values.title.trim(),
        description: values.description.trim(),
        totalAmount: normalizeDecimal(values.totalAmount),
        milestones: values.milestones.map((milestone) => ({
          title: milestone.title.trim(),
          description: milestone.description.trim(),
          amount: normalizeDecimal(milestone.amount),
          order: milestone.order,
        })),
      })

      demoStore.setSelectedProject(createdResearch.id)
      demoStore.setCurrentMilestone(createdResearch.milestones?.[0]?.id ?? null)

      setState({
        loading: false,
        error: null,
        success: true,
        createdResearch,
      })
    } catch (error) {
      setState({
        loading: false,
        error: getApiErrorMessage(
          error,
          'Não foi possível criar a pesquisa agora.',
        ),
        success: false,
        createdResearch: null,
      })
    }
  }

  return {
    ...state,
    createResearch,
  }
}
