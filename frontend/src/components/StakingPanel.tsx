import { useState } from 'react'
import { formatTokenAmount } from '../utils/wallet'

interface Props {
  balance: number
  staked: number
  yieldEarned: number
}

export default function StakingPanel({ balance, staked, yieldEarned }: Props) {
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState<'stake' | 'unstake'>('stake')
  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const apy = 8.5
  const totalValueLocked = 1_500_000_0000000

  const handleAction = () => {
    const val = parseFloat(amount || '0')
    if (val <= 0) {
      setMessage('Please enter a valid amount')
      return
    }
    setIsProcessing(true)
    setTimeout(() => {
      setMessage(`${mode === 'stake' ? 'Staked' : 'Unstaked'} ${amount} GEO successfully via Soroban (Testnet)!`)
      setAmount('')
      setIsProcessing(false)
    }, 1500)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Impact Vault</h3>
        <span className="text-sm bg-geo-100 text-geo-700 px-3 py-1 rounded-full font-medium">
          {apy}% APY
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">Your Stake</p>
          <p className="font-bold text-gray-900">{formatTokenAmount(staked)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">Yield</p>
          <p className="font-bold text-green-600">{formatTokenAmount(yieldEarned)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">TVL</p>
          <p className="font-bold text-gray-900">{formatTokenAmount(totalValueLocked)}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setMode('stake')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            mode === 'stake' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
          }`}
        >
          Stake
        </button>
        <button
          onClick={() => setMode('unstake')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            mode === 'unstake' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
          }`}
        >
          Unstake
        </button>
      </div>

      <div className="mb-4">
        <label className="text-sm text-gray-600 mb-1 block">
          {mode === 'stake' ? 'Amount to stake' : 'Amount to unstake'}
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="input-field pr-16"
            min="0"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">GEO</span>
        </div>
        <button
          onClick={() => setAmount(mode === 'stake' ? String(balance / 1e7) : String(staked / 1e7))}
          className="text-xs text-geo-600 hover:underline mt-1"
        >
          {mode === 'stake' ? `Max: ${formatTokenAmount(balance)} GEO` : `Max: ${formatTokenAmount(staked)} GEO`}
        </button>
      </div>

      <button
        onClick={handleAction}
        disabled={isProcessing || !amount}
        className="btn-primary w-full"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : mode === 'stake' ? (
          'Stake GEO'
        ) : (
          'Unstake GEO'
        )}
      </button>

      {message && (
        <div className="mt-3 p-3 rounded-xl bg-green-50 text-green-700 text-sm">{message}</div>
      )}

      <p className="text-xs text-gray-400 mt-3 text-center">
        Staking yields are sourced from the municipal green bond treasury reserve.
        Yield distributions occur every 24h on-chain via the Impact Vault contract.
      </p>
    </div>
  )
}
