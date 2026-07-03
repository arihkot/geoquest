import { useState } from 'react'
import type { Quest } from '../hooks/useQuests'
import { useGeolocation } from '../hooks/useGeolocation'
import { isWithinGeofence, formatDistance, calculateDistance } from '../utils/geolocation'
import { formatTokenAmount } from '../utils/wallet'
import CheckInFlow from './CheckInFlow'

interface Props {
  quest: Quest
  onBack: () => void
}

export default function QuestDetail({ quest, onBack }: Props) {
  const { position, getPosition, isLoading: isGettingLocation } = useGeolocation()
  const [showCheckIn, setShowCheckIn] = useState(false)

  const inRange =
    position
      ? isWithinGeofence(
          position.latitude,
          position.longitude,
          quest.lat_e7 / 1e7,
          quest.lng_e7 / 1e7,
          quest.radius_m
        )
      : false

  const distance =
    position
      ? calculateDistance(
          position.latitude,
          position.longitude,
          quest.lat_e7 / 1e7,
          quest.lng_e7 / 1e7
        )
      : null

  const progressPct = quest.budget_total > 0
    ? Math.round(((quest.budget_total - quest.budget_remaining) / quest.budget_total) * 100)
    : 0

  return (
    <div className="card">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to list
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">{quest.title}</h2>
      <p className="text-gray-600 mb-6">{quest.description}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-geo-50 rounded-xl p-4">
          <p className="text-xs text-geo-600 font-medium mb-1">Reward</p>
          <p className="text-lg font-bold text-geo-700">{formatTokenAmount(quest.reward_amount)} GEO</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-medium mb-1">Geofence</p>
          <p className="text-lg font-bold text-blue-700">{quest.radius_m}m</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-xs text-purple-600 font-medium mb-1">Claims</p>
          <p className="text-lg font-bold text-purple-700">{quest.total_claims}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">Budget Used</span>
          <span className="text-gray-700 font-medium">{progressPct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-geo-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(progressPct, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {formatTokenAmount(quest.budget_remaining)} GEO remaining of {formatTokenAmount(quest.budget_total)} GEO
        </p>
      </div>

      {!position && (
        <button onClick={getPosition} disabled={isGettingLocation} className="btn-secondary w-full mb-3">
          {isGettingLocation ? 'Getting location...' : 'Check My Location'}
        </button>
      )}

      {position && (
        <div className={`p-3 rounded-xl text-sm mb-3 ${inRange ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
          {inRange ? (
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              You are within range! ({distance !== null ? formatDistance(distance) : '?'} away)
            </p>
          ) : (
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              You are {distance !== null ? formatDistance(distance) : '?'} away. Get closer to check in.
            </p>
          )}
        </div>
      )}

      <button
        onClick={() => setShowCheckIn(true)}
        disabled={!inRange || !quest.active}
        className="btn-primary w-full"
      >
        {!quest.active ? 'Quest Paused' : inRange ? 'Check In Now' : 'Get Closer to Check In'}
      </button>

      {showCheckIn && <CheckInFlow quest={quest} onClose={() => setShowCheckIn(false)} />}
    </div>
  )
}
