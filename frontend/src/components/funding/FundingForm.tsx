import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface FundingFormProps {
  loading?: boolean
  onChainLoading?: boolean
  onFund: (amount: string) => Promise<void>
  onFundOnChain?: (amount: string) => Promise<void>
}

export function FundingForm({
  loading,
  onChainLoading,
  onFund,
  onFundOnChain,
}: FundingFormProps) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  function validateAmount() {
    if (!/^(?!0+(\.0{1,6})?$)\d+(\.\d{1,6})?$/.test(amount.trim())) {
      setError('Informe um valor maior que zero com até 6 casas decimais.')
      return false
    }

    setError(null)
    return true
  }

  async function submitFunding(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validateAmount()) return

    await onFund(amount)
    setAmount('')
  }

  async function submitOnChainFunding() {
    if (!onFundOnChain || !validateAmount()) return

    await onFundOnChain(amount)
    setAmount('')
  }

  return (
    <form onSubmit={submitFunding} className="space-y-3">
      <label className="block space-y-2">
        <span className="text-xs font-medium text-slate-400">
          Valor da contribuição
        </span>
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-300/50"
          inputMode="decimal"
          placeholder="100.000000"
          required
        />
      </label>
      <div className="grid gap-2">
        <Button type="submit" className="w-full" loading={loading}>
          Contribuir mockado
        </Button>
        {onFundOnChain && (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            loading={onChainLoading}
            onClick={() => void submitOnChainFunding()}
          >
            Preparar on-chain
          </Button>
        )}
      </div>
      {error && <p className="text-xs leading-5 text-red-200">{error}</p>}
    </form>
  )
}
