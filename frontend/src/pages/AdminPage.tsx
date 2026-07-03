import { useWallet } from '../hooks/useWallet'
import AdminConsole from '../components/AdminConsole'
import WalletConnectPrompt from '../components/WalletConnectPrompt'

export default function AdminPage() {
  const { isConnected } = useWallet()

  if (!isConnected) {
    return <WalletConnectPrompt />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin Console</h2>
        <p className="text-sm text-gray-500 mt-1">
          Create and manage quests, monitor budgets, and view on-chain analytics.
        </p>
      </div>
      <AdminConsole />
    </div>
  )
}
