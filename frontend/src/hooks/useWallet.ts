import { useState, useEffect, useCallback } from 'react';

export function useWallet() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).freighterApi) {
        const freighter = (window as any).freighterApi;
        const pubKey = await freighter.getPublicKey();
        if (pubKey) {
          setPublicKey(pubKey);
        }
      }
    } catch {
      // Freighter not available
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (typeof window === 'undefined' || !(window as any).freighterApi) {
        throw new Error(
          'Freighter wallet is not installed. Please install the Freighter browser extension.'
        );
      }
      const freighter = (window as any).freighterApi;
      const pubKey = await freighter.getPublicKey();
      if (!pubKey) {
        throw new Error('Failed to get public key from Freighter');
      }
      setPublicKey(pubKey);
      return pubKey;
    } catch (e: any) {
      setError(e.message || 'Failed to connect wallet');
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setError(null);
  }, []);

  return {
    publicKey,
    isConnecting,
    error,
    connect,
    disconnect,
    isConnected: !!publicKey,
  };
}
