import type { Quest } from '../hooks/useQuests'
import { formatDistance, calculateDistance } from '../utils/geolocation'
import { formatTokenAmount } from '../utils/wallet'

interface Props {
  quests: Quest[]
  selectedQuest: Quest | null
  onSelect: (quest: Quest) => void
  userLat?: number
  userLng?: number
}

export default function QuestList({ quests, selectedQuest, onSelect, userLat, userLng }: Props) {
  const sorted = [...quests].sort((a, b) => {
    if (!userLat || !userLng) return 0
    const distA = calculateDistance(userLat, userLng, a.lat_e7 / 1e7, a.lng_e7 / 1e7)
    const distB = calculateDistance(userLat, userLng, b.lat_e7 / 1e7, b.lng_e7 / 1e7)
    return distA - distB
  })

  return (
    <div className="space-y-3">
      {sorted.map((quest) => {
        const distance =
          userLat && userLng
            ? calculateDistance(userLat, userLng, quest.lat_e7 / 1e7, quest.lng_e7 / 1e7)
            : null
        const isSelected = selectedQuest?.id === quest.id

        return (
          <button
            key={quest.id}
            onClick={() => onSelect(quest)}
            className={`w-full text-left card transition-all ${
              isSelected
                ? 'ring-2 ring-geo-500 border-geo-200'
                : 'hover:border-gray-200'
            } ${!quest.active ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{quest.title}</h3>
                  {!quest.active && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                      Paused
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{quest.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="text-geo-600 font-semibold">
                      {formatTokenAmount(quest.reward_amount)} GEO
                    </span>{' '}
                    reward
                  </span>
                  {distance !== null && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {formatDistance(distance)}
                    </span>
                  )}
                  <span>{quest.total_claims} claims</span>
                </div>
              </div>
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                isSelected ? 'bg-geo-600' : 'bg-gray-100'
              }`}>
                <svg className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        )
      })}

      {sorted.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No quests available in your area.</p>
        </div>
      )}
    </div>
  )
}
