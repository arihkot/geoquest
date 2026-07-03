import { useState } from 'react'

export default function PrivacyNotice() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-40 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-geo-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-geo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 mb-1">Privacy Notice</p>
          <p className="text-xs text-gray-500">
            GeoQuest collects location data only during check-in verification. Raw GPS traces
            are not persisted. Your wallet address is pseudonymous and visible on-chain.
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-400 hover:text-gray-600 shrink-0"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
