import { useState, useEffect, useCallback } from 'react'
import { isConnected, getAddress, requestAccess } from '@stellar/freighter-api'

export function useWallet() {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = useCallback(async () => {
    try {
      const connected = await isConnected()
      if (connected) {
        const addressResult = await getAddress()
        if (addressResult && addressResult.address) {
          setPublicKey(addressResult.address)
        }
      }
    } catch {
      // Freighter not available
    }
  }, [])

  const connect = useCallback(async () => {
    setIsConnecting(true)
    setError(null)
    try {
      const connected = await isConnected()
      if (!connected) {
        throw new Error(
          'Freighter wallet is not installed. Please install the Freighter browser extension from https://www.freighter.app/'
        )
      }

      await requestAccess()
      const addressResult = await getAddress()
      if (!addressResult || !addressResult.address) {
        throw new Error('Failed to get address from Freighter. Please ensure your wallet is unlocked.')
      }
      setPublicKey(addressResult.address)
      return addressResult.address
    } catch (e: any) {
      setError(e.message || 'Failed to connect wallet')
      return null
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setPublicKey(null)
    setError(null)
  }, [])

  return {
    publicKey,
    isConnecting,
    error,
    connect,
    disconnect,
    isConnected: !!publicKey,
  }
}
