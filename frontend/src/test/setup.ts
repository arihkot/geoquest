import '@testing-library/jest-dom'

const mockGeolocation = {
  getCurrentPosition: vi.fn().mockImplementation((success) =>
    success({
      coords: {
        latitude: 40.7483,
        longitude: -73.985,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    })
  ),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
}

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  configurable: true,
})
