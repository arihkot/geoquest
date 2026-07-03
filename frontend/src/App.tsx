import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'
import { useWallet } from './hooks/useWallet'
import { ADMIN_WALLETS } from './utils/constants'

function App() {
  const { publicKey } = useWallet()
  const isAdmin = publicKey && ADMIN_WALLETS.includes(publicKey)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <span>GeoQuest - Visit-to-Earn Eco-Tourism on Stellar</span>
            <span className="flex items-center gap-4">
              <a href="#" className="hover:text-geo-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-geo-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-geo-600 transition-colors">Docs</a>
            </span>
          </div>
          <div className="mt-2 text-center">
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
              Testnet Demo
            </span>
            <p className="text-xs text-gray-400 mt-1">
              This is a testnet deployment with demo data for evaluation purposes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
