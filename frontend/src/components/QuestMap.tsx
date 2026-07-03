import { useEffect, useRef, useState } from 'react'
import type { Quest } from '../hooks/useQuests'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../utils/constants'

interface Props {
  quests: Quest[]
  onSelectQuest: (quest: Quest) => void
  selectedQuest: Quest | null
}

export default function QuestMap({ quests, onSelectQuest, selectedQuest }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className={`bg-gray-200 rounded-xl overflow-hidden transition-all duration-300 ${
          isExpanded ? 'h-[60vh]' : 'h-[40vh] sm:h-[50vh]'
        }`}
      >
        <div className="w-full h-full flex items-center justify-center bg-geo-50">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-geo-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-geo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-2">Quest Map</p>
            <p className="text-sm text-gray-500 mb-4">
              {quests.length} active quests in your area
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quests.slice(0, 5).map((q) => (
                <button
                  key={q.id}
                  onClick={() => onSelectQuest(q)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedQuest?.id === q.id
                      ? 'bg-geo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-geo-300'
                  }`}
                >
                  {q.title.length > 20 ? q.title.slice(0, 20) + '...' : q.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-3 right-3 bg-white rounded-lg shadow px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
      >
        {isExpanded ? 'Shrink' : 'Expand'}
      </button>
    </div>
  )
}
