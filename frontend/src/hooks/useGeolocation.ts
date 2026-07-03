import { useState, useCallback } from 'react';
import { GeolocationState, getCurrentPosition } from '../utils/geolocation';

export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPosition = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pos = await getCurrentPosition();
      setPosition(pos);
      return pos;
    } catch (e: any) {
      const msg =
        e.code === 1
          ? 'Location access denied. Please enable GPS.'
          : e.code === 2
          ? 'Location unavailable. Please try again.'
          : e.code === 3
          ? 'Location request timed out.'
          : e.message || 'Failed to get location';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { position, isLoading, error, getPosition };
}
