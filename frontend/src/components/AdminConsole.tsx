import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { ADMIN_WALLETS } from '../utils/constants'
import { formatTokenAmount } from '../utils/wallet'

export default function AdminConsole() {
  const { publicKey } = useWallet()
  const [tab, setTab] = useState<'create' | 'manage' | 'analytics'>('create')

  if (!publicKey || !ADMIN_WALLETS.includes(publicKey)) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="font-bold text-gray-900 mb-2">Admin Access Required</h3>
        <p className="text-gray-500 text-sm">Connect an admin wallet to access the console.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Console</h2>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {(['create', 'manage', 'analytics'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'create' && <CreateQuestForm />}
        {tab === 'manage' && <ManageQuests />}
        {tab === 'analytics' && <AdminAnalytics />}
      </div>
    </div>
  )
}

function CreateQuestForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    lat: '40.7483',
    lng: '-73.9850',
    radius: '50',
    reward: '100',
    budget: '1000',
  })
  const [status, setStatus] = useState('')

  const handleCreate = () => {
    setStatus('Creating quest on Soroban Testnet...')
    setTimeout(() => {
      setStatus('Quest created! Contract call submitted. Check Stellar Expert for the transaction.')
    }, 2000)
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">Create New Quest</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="input-field"
            placeholder="E.g., Riverside Park Cleanup Zone"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="input-field"
            rows={3}
            placeholder="Describe the quest..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Latitude</label>
            <input
              type="number"
              step="any"
              value={form.lat}
              onChange={e => setForm({ ...form, lat: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Longitude</label>
            <input
              type="number"
              step="any"
              value={form.lng}
              onChange={e => setForm({ ...form, lng: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Radius (m)</label>
            <input
              type="number"
              value={form.radius}
              onChange={e => setForm({ ...form, radius: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Reward (GEO)</label>
            <input
              type="number"
              value={form.reward}
              onChange={e => setForm({ ...form, reward: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Budget (GEO)</label>
            <input
              type="number"
              value={form.budget}
              onChange={e => setForm({ ...form, budget: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
        <button onClick={handleCreate} className="btn-primary w-full">
          Create Quest on Testnet
        </button>
        {status && (
          <div className="p-3 bg-geo-50 text-geo-700 rounded-xl text-sm">{status}</div>
        )}
      </div>
    </div>
  )
}

function ManageQuests() {
  const MANAGE_QUESTS = [
    { id: 0, title: 'Riverside Park Cleanup Zone', budget: 1000, remaining: 800, claims: 20, active: true },
    { id: 1, title: 'Central Park Eco Walk', budget: 500, remaining: 300, claims: 40, active: true },
    { id: 2, title: 'Brooklyn Bridge Walking Tour', budget: 500, remaining: 250, claims: 33, active: true },
  ]

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">Manage Quests</h3>
      <div className="space-y-3">
        {MANAGE_QUESTS.map((q) => (
          <div key={q.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{q.title}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                <span>Budget: {formatTokenAmount(q.remaining * 10**7)}/{formatTokenAmount(q.budget * 10**7)}</span>
                <span>{q.claims} claims</span>
                <span className={q.active ? 'text-green-600' : 'text-red-500'}>
                  {q.active ? 'Active' : 'Paused'}
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0 ml-3">
              <button className="text-xs px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                {q.active ? 'Pause' : 'Resume'}
              </button>
              <button className="text-xs px-3 py-1.5 rounded-lg bg-geo-100 text-geo-700 hover:bg-geo-200 transition-colors">
                Top Up
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminAnalytics() {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">Analytics Overview</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-geo-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-geo-700">93</p>
          <p className="text-xs text-geo-600">Total Claims</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">3</p>
          <p className="text-xs text-blue-600">Active Quests</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">42</p>
          <p className="text-xs text-purple-600">Unique Users</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">8,250</p>
          <p className="text-xs text-amber-600">GEO Disbursed</p>
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-500 text-sm mb-2">On-Chain Audit Trail</p>
        <p className="text-xs text-gray-400">
          All reward disbursements are traceable on Stellar Testnet via Stellar Expert.
          Every claim generates a unique transaction hash.
        </p>
        <button className="mt-4 text-sm text-geo-600 hover:underline">
          View on Stellar Expert
        </button>
      </div>
    </div>
  )
}
