import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { shortenAddress, formatTokenAmount } from '../utils/wallet'
import StakingPanel from './StakingPanel'

interface ClaimHistory {
  questId: number
  questTitle: string
  amount: number
  txHash: string
  timestamp: number
}

const DEMO_CLAIMS: ClaimHistory[] = [
  { questId: 0, questTitle: 'Riverside Park Cleanup Zone', amount: 100_0000000, txHash: '0xabc123...def456', timestamp: Date.now() - 86400000 * 3 },
  { questId: 1, questTitle: 'Central Park Eco Walk', amount: 50_0000000, txHash: '0xdef789...ghi012', timestamp: Date.now() - 86400000 * 1 },
  { questId: 2, questTitle: 'Brooklyn Bridge Walking Tour', amount: 75_0000000, txHash: '0xjkl345...mno678', timestamp: Date.now() - 86400000 * 7 },
]

export default function WalletProfile() {
  const { publicKey } = useWallet()
  const [showStaking, setShowStaking] = useState(false)

  const balance = 225_0000000
  const staked = 50_0000000
  const yieldAccrued = 2_5000000
  const totalClaims = 3

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-geo-100 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-geo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Your Wallet</h3>
            <p className="text-sm text-gray-500 font-mono">{publicKey ? shortenAddress(publicKey) : 'Not connected'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-geo-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-geo-700">{formatTokenAmount(balance)}</p>
            <p className="text-xs text-geo-600">GEO Balance</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-blue-700">{formatTokenAmount(staked)}</p>
            <p className="text-xs text-blue-600">Staked</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-purple-700">{formatTokenAmount(yieldAccrued)}</p>
            <p className="text-xs text-purple-600">Yield Earned</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-amber-700">{totalClaims}</p>
            <p className="text-xs text-amber-600">Quests Done</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setShowStaking(!showStaking)}
          className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
            showStaking ? 'bg-geo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {showStaking ? 'Hide Staking' : 'Stake / Yield'}
        </button>
      </div>

      {showStaking && <StakingPanel balance={balance} staked={staked} yieldEarned={yieldAccrued} />}

      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Claim History</h3>
        {DEMO_CLAIMS.length > 0 ? (
          <div className="space-y-3">
            {DEMO_CLAIMS.map((claim, i) => (
              <div key={i} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{claim.questTitle}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{claim.txHash}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(claim.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm font-bold text-geo-600 shrink-0 ml-3">
                  +{formatTokenAmount(claim.amount)} GEO
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No claims yet. Start exploring quests!</p>
          </div>
        )}
      </div>
    </div>
  )
}
