import { useWallet } from '../hooks/useWallet'
import WalletProfile from '../components/WalletProfile'
import WalletConnectPrompt from '../components/WalletConnectPrompt'

export default function ProfilePage() {
  const { isConnected } = useWallet()

  if (!isConnected) {
    return <WalletConnectPrompt />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
        <p className="text-sm text-gray-500 mt-1">
          View your balance, claim history, staked GEO, and yield earnings.
        </p>
      </div>
      <WalletProfile />
    </div>
  )
}
