import { describe, it, expect } from 'vitest'
import { isWithinGeofence, calculateDistance, formatDistance } from '../utils/geolocation'

describe('Geolocation Utils', () => {
  it('calculates correct distance between two points', () => {
    // NYC Central Park coordinates
    const dist = calculateDistance(
      40.7827, -73.9662,  // Central Park North
      40.7483, -73.9850   // Riverside Park
    )
    // Roughly 4km between these points
    expect(dist).toBeGreaterThan(3000)
    expect(dist).toBeLessThan(5000)
  })

  it('detects user is within geofence', () => {
    const within = isWithinGeofence(
      40.7483, -73.9850,  // user
      40.7483, -73.9850,  // target (same point)
      100                  // 100m radius
    )
    expect(within).toBe(true)
  })

  it('detects user is outside geofence', () => {
    const within = isWithinGeofence(
      40.7483, -73.9850,  // user
      40.8000, -74.0000,  // target (far away)
      100                  // 100m radius
    )
    expect(within).toBe(false)
  })

  it('formats distance in meters and kilometers', () => {
    expect(formatDistance(500)).toBe('500m')
    expect(formatDistance(1500)).toBe('1.5km')
    expect(formatDistance(10000)).toBe('10.0km')
  })
})
