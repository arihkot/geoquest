import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useQuests, Quest } from '../hooks/useQuests'
import { useGeolocation } from '../hooks/useGeolocation'
import QuestMap from '../components/QuestMap'
import QuestList from '../components/QuestList'
import QuestDetail from '../components/QuestDetail'
import WalletConnectPrompt from '../components/WalletConnectPrompt'

export default function HomePage() {
  const { isConnected, publicKey } = useWallet()
  const { quests, isLoading, error } = useQuests()
  const { position, getPosition } = useGeolocation()
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [view, setView] = useState<'map' | 'list'>('map')

  if (!isConnected) {
    return <WalletConnectPrompt />
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Explore Quests</h2>
          <p className="text-sm text-gray-500 mt-1">
            Discover eco-friendly locations nearby and earn GEO rewards
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!position && (
            <button onClick={getPosition} className="btn-secondary text-sm py-2 px-4">
              Enable GPS
            </button>
          )}
          <div className="flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setView('map')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                view === 'map' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                view === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-geo-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6">{error}</div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${selectedQuest ? 'lg:col-span-1' : 'lg:col-span-2'} order-2 lg:order-1`}>
            {selectedQuest ? (
              <QuestDetail quest={selectedQuest} onBack={() => setSelectedQuest(null)} />
            ) : (
              <>
                {view === 'map' && (
                  <QuestMap
                    quests={quests}
                    onSelectQuest={setSelectedQuest}
                    selectedQuest={selectedQuest}
                  />
                )}
                <div className={view === 'map' ? 'mt-4' : ''}>
                  <QuestList
                    quests={quests}
                    selectedQuest={selectedQuest}
                    onSelect={setSelectedQuest}
                    userLat={position?.latitude}
                    userLng={position?.longitude}
                  />
                </div>
              </>
            )}
          </div>

          {!selectedQuest && (
            <div className="order-1 lg:order-2 lg:col-span-1">
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-3">How It Works</h3>
                <div className="space-y-3">
                  {[
                    { step: 1, title: 'Explore', desc: 'Browse quests on the map' },
                    { step: 2, title: 'Travel', desc: 'Go to the location in person' },
                    { step: 3, title: 'Check In', desc: 'Verify GPS and claim reward' },
                    { step: 4, title: 'Earn & Stake', desc: 'Hold or stake GEO for yield' },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-geo-100 text-geo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {s.step}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{s.title}</p>
                        <p className="text-xs text-gray-500">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
