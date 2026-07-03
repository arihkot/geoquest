import { Link, useLocation } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { shortenAddress } from '../utils/wallet'

export default function Header() {
  const { publicKey, isConnected, connect, disconnect, isConnecting } = useWallet()
  const location = useLocation()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/geoquest-icon.svg" alt="GeoQuest" className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold text-stellar-dark">GeoQuest</h1>
            <span className="text-xs text-geo-600 font-medium">Visit-to-Earn</span>
          </div>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/' ? 'text-geo-600' : 'text-gray-600 hover:text-geo-600'
            }`}
          >
            Explore
          </Link>
          {isConnected && (
            <Link
              to="/profile"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/profile' ? 'text-geo-600' : 'text-gray-600 hover:text-geo-600'
              }`}
            >
              Profile
            </Link>
          )}
          {isConnected && (
            <Link
              to="/admin"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/admin' ? 'text-geo-600' : 'text-gray-600 hover:text-geo-600'
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div>
          {isConnected ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-gray-600 font-mono">
                {shortenAddress(publicKey!)}
              </span>
              <button onClick={disconnect} className="btn-secondary text-sm py-2 px-4">
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="btn-primary text-sm py-2 px-5"
            >
              {isConnecting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connecting...
                </span>
              ) : (
                'Connect Freighter'
              )}
            </button>
          )}
        </div>
      </div>

      {!isConnected && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
          Connect your Freighter wallet to start earning rewards. Make sure you're on Stellar Testnet.
        </div>
      )}
    </header>
  )
}
