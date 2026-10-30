import type { ApiError } from '@/types/api'

// Anchor numbers custom errors from 6000, in the order of
// solana/programs/research-escrow/src/error.rs.
const contractErrors = [
  'O título do projeto é longo demais para a Solana (máximo de 64 caracteres).',
  'O valor precisa ser maior que zero.',
  'O prazo da etapa é inválido.',
  'As etapas precisam ser registradas em ordem.',
  'O valor da etapa é maior que o total do projeto.',
  'A soma das etapas precisa ser igual ao total antes de receber contribuições.',
  'Essa contribuição passa da meta do projeto. Contribua com um valor menor.',
  'Este projeto não está mais recebendo contribuições.',
  'O projeto ainda não está ativo: o financiamento precisa chegar a 100%.',
  'Esta contribuição não pertence a este projeto.',
  'Esta contribuição pertence a outra wallet.',
  'Esta contribuição já foi reembolsada.',
  'Conta de USDC inválida para esta operação.',
  'Esta etapa não pertence a este projeto.',
  'Esta não é a etapa atual do projeto.',
  'Esta etapa não pode abrir votação agora.',
  'Esta etapa não está em votação.',
  'O prazo de votação já terminou.',
  'A votação ainda está aberta. Aguarde o prazo terminar para encerrar.',
  'A duração da votação é inválida.',
  'Só quem contribuiu com o projeto pode votar.',
  'Quem criou o projeto não pode votar nas próprias etapas.',
  'Esta etapa não foi aprovada.',
  'O escrow não tem saldo suficiente para esta etapa.',
  'O projeto não está cancelado.',
  'O projeto já foi concluído.',
  'O projeto já foi cancelado.',
  'Cofre do escrow inválido.',
  'Não há reembolso disponível para esta wallet.',
  'Erro de cálculo no contrato.',
]

const CONTRACT_ERROR_OFFSET = 6000
const ANCHOR_ACCOUNT_NOT_INITIALIZED = 3012
const TOKEN_INSUFFICIENT_FUNDS = 1

function getProgramErrorCode(message: string) {
  const anchorCode = message.match(/Error Number: (\d+)/)
  if (anchorCode) return Number(anchorCode[1])

  const hexCode = message.match(/custom program error: 0x([0-9a-f]+)/i)
  return hexCode ? Number.parseInt(hexCode[1], 16) : null
}

/** Translates wallet and Solana errors, which arrive in English, to Portuguese. */
function translateChainError(message: string): string | null {
  if (/user rejected|rejected the request|declined/i.test(message)) {
    return 'Assinatura cancelada na wallet.'
  }

  if (/wallet ?not ?connected/i.test(message)) {
    return 'Conecte sua wallet para continuar.'
  }

  if (/no record of a prior credit|insufficient lamports|insufficient funds for rent/i.test(message)) {
    return 'Saldo de SOL insuficiente para a taxa. Pegue SOL de teste no faucet da devnet.'
  }

  if (/blockhash not found|block height exceeded|has expired/i.test(message)) {
    return 'A transação expirou antes de ser confirmada. Tente novamente.'
  }

  if (/already in use/i.test(message)) {
    return 'Esta wallet já votou nesta etapa.'
  }

  const code = getProgramErrorCode(message)
  if (code === null) {
    return /^unexpected error$/i.test(message.trim())
      ? 'A wallet retornou um erro inesperado. Tente novamente.'
      : null
  }

  const contractError = contractErrors[code - CONTRACT_ERROR_OFFSET]
  if (contractError) return contractError

  if (code === ANCHOR_ACCOUNT_NOT_INITIALIZED) {
    return 'Uma conta necessária ainda não existe na Solana. Se for a sua conta de USDC, pegue USDC de teste no faucet da Circle.'
  }

  if (code === TOKEN_INSUFFICIENT_FUNDS) {
    return 'Saldo de USDC insuficiente nesta wallet.'
  }

  return 'A transação foi recusada pela Solana.'
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as Partial<ApiError>
  const message =
    typeof apiError?.message === 'string'
      ? apiError.message
      : error instanceof Error
        ? error.message
        : null

  if (!message) return fallback

  return translateChainError(message) ?? message
}
