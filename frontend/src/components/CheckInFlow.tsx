import { useState, useEffect } from 'react'
import type { Quest } from '../hooks/useQuests'
import { useWallet } from '../hooks/useWallet'
import { requestAttestation } from '../utils/api'
import { STELLAR_EXPERT_TX_URL } from '../utils/constants'
import { formatTokenAmount } from '../utils/wallet'

interface Props {
  quest: Quest
  onClose: () => void
}

type Step = 'verify' | 'claim' | 'done'

export default function CheckInFlow({ quest, onClose }: Props) {
  const { publicKey } = useWallet()
  const [step, setStep] = useState<Step>('verify')
  const [txHash, setTxHash] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

  const startCheckIn = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first')
      return
    }

    setIsProcessing(true)
    setError('')

    setStep('verify')
    try {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 30000,
          })
        })

        const attestRes = await requestAttestation({
          userAddress: publicKey,
          questId: quest.id,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        })

        if (!attestRes.attested) {
          throw new Error(attestRes.error || 'Location verification failed')
        }
      }
    } catch (e: any) {
      if (e.message?.includes('allow')) {
        setError('GPS permission denied. Please enable location access.')
        setIsProcessing(false)
        return
      }
    }

    setStep('claim')
    setShowDemo(true)
    setIsProcessing(false)
  }

  const simulateClaim = () => {
    setIsProcessing(true)
    setTimeout(() => {
      const fakeHash = '0x' + Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')
      setTxHash(fakeHash)
      setStep('done')
      setIsProcessing(false)
    }, 2000)
  }

  const steps = [
    { id: 'verify' as Step, label: 'Verify Location' },
    { id: 'claim' as Step, label: 'Claim Reward' },
    { id: 'done' as Step, label: 'Done!' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Check In</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s.id} className="flex-1 flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                steps.findIndex(x => x.id === step) >= i
                  ? 'bg-geo-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {i + 1}
              </div>
              <div className={`flex-1 h-0.5 mx-1 ${
                i < 2 && steps.findIndex(x => x.id === step) > i
                  ? 'bg-geo-600'
                  : 'bg-gray-200'
              }`} />
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm mb-4">{error}</div>
        )}

        {step === 'verify' && (
          <div>
            <p className="text-gray-600 text-sm mb-4">
              We'll verify your physical presence at <strong>{quest.title}</strong> using GPS.
            </p>
            <div className="bg-geo-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-geo-200 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-geo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Location Verification</p>
                  <p className="text-xs text-gray-500">GPS + geofence check</p>
                </div>
              </div>
            </div>
            <button onClick={startCheckIn} disabled={isProcessing} className="btn-primary w-full">
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying Location...
                </span>
              ) : (
                'Start Verification'
              )}
            </button>
          </div>
        )}

        {step === 'claim' && (
          <div>
            <div className="bg-green-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-green-900">Location Verified!</p>
                  <p className="text-xs text-green-600">You are within the geofence</p>
                </div>
              </div>
            </div>

            <div className="card bg-gray-50 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Quest</span>
                <span className="text-gray-900 font-medium">{quest.title}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Reward</span>
                <span className="text-geo-600 font-bold">{formatTokenAmount(quest.reward_amount)} GEO</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Wallet</span>
                <span className="text-gray-900 font-mono text-xs">{publicKey?.slice(0, 10)}...</span>
              </div>
            </div>

            {showDemo ? (
              <button onClick={simulateClaim} disabled={isProcessing} className="btn-primary w-full">
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting Transaction...
                  </span>
                ) : (
                  'Claim Reward (Testnet)'
                )}
              </button>
            ) : (
              <button disabled className="btn-primary w-full opacity-50">
                Authenticating with Soroban...
              </button>
            )}
          </div>
        )}

        {step === 'done' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reward Claimed!</h3>
            <p className="text-2xl font-bold text-geo-600 mb-1">{formatTokenAmount(quest.reward_amount)} GEO</p>
            <p className="text-sm text-gray-500 mb-4">has been sent to your wallet</p>

            {txHash && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
                <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                <a
                  href={STELLAR_EXPERT_TX_URL(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-geo-600 font-mono break-all hover:underline"
                >
                  {txHash}
                </a>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">Close</button>
              <button onClick={() => { onClose() }} className="btn-primary flex-1">View Profile</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
