import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Quest } from '../hooks/useQuests'
import { formatTokenAmount } from '../utils/wallet'

interface Props {
  quests: Quest[]
  onSelectQuest: (quest: Quest) => void
  selectedQuest: Quest | null
}

const DEFAULT_CENTER: [number, number] = [40.7484, -73.9857]
const DEFAULT_ZOOM = 13

export default function QuestMap({ quests, onSelectQuest, selectedQuest }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<number, L.Marker>>(new Map())
  const [isExpanded, setIsExpanded] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map
    setMapReady(true)

    setTimeout(() => {
      map.invalidateSize()
    }, 100)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return
    mapInstanceRef.current.invalidateSize()
  }, [isExpanded])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    quests.forEach((quest) => {
      const lat = quest.lat_e7 / 1e7
      const lng = quest.lng_e7 / 1e7
      const isSelected = selectedQuest?.id === quest.id

      const color = isSelected ? '#16a34a' : quest.active ? '#3E63DD' : '#9CA3AF'

      const icon = L.divIcon({
        className: 'custom-quest-marker',
        html: `<div style="
          width: 24px; height: 24px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ${isSelected ? 'transform: scale(1.3);' : ''}
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 180px;">
            <strong style="font-size: 14px;">${quest.title}</strong>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">${quest.description.slice(0, 80)}...</p>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 6px;">
              <span style="color: #16a34a; font-weight: 600;">${formatTokenAmount(quest.reward_amount)} GEO</span>
              <span style="color: #999;">${quest.total_claims} claims</span>
            </div>
          </div>
        `)

      marker.on('click', () => {
        onSelectQuest(quest)
      })

      markersRef.current.set(quest.id, marker)
    })
  }, [quests, selectedQuest, onSelectQuest])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedQuest) return

    const lat = selectedQuest.lat_e7 / 1e7
    const lng = selectedQuest.lng_e7 / 1e7
    map.setView([lat, lng], map.getZoom() < 15 ? 15 : map.getZoom(), {
      animate: true,
    })
  }, [selectedQuest])

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className={`rounded-xl overflow-hidden transition-all duration-300 bg-gray-200 ${
          isExpanded ? 'h-[70vh]' : 'h-[40vh] sm:h-[50vh]'
        }`}
        style={{ minHeight: 300 }}
      />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-geo-50 rounded-xl">
          <svg className="animate-spin h-8 w-8 text-geo-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}
      <div className="absolute top-3 right-3 flex gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-white rounded-lg shadow px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
        >
          {isExpanded ? 'Shrink' : 'Expand'}
        </button>
      </div>
      <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg shadow px-3 py-1.5 text-xs text-gray-500">
        {quests.length} quests on map
      </div>
    </div>
  )
}
