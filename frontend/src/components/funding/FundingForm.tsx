import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface FundingFormProps {
  loading?: boolean
  onFund: (amount: string) => Promise<void>
}

export function FundingForm({ loading, onFund }: FundingFormProps) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function submitFunding(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!/^(?!0+(\.0{1,6})?$)\d+(\.\d{1,6})?$/.test(amount.trim())) {
      setError('Informe um valor maior que zero com até 6 casas decimais.')
      return
    }

    setError(null)
    await onFund(amount.trim())
    setAmount('')
  }

  return (
    <form onSubmit={submitFunding} className="space-y-3">
      <label className="block space-y-2">
        <span className="text-xs font-medium text-slate-400">
          Valor da contribuição (USDC)
        </span>
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-300/50"
          inputMode="decimal"
          placeholder="10.00"
          required
        />
      </label>
      <Button type="submit" className="w-full" loading={loading}>
        Contribuir
      </Button>
      {error && <p className="text-xs leading-5 text-red-200">{error}</p>}
    </form>
  )
}
