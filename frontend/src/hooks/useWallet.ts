import { useState, useEffect, useCallback } from 'react'
import {
  isConnected,
  getAddress,
  setAllowed,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api'
import { NETWORK_PASSPHRASE } from '../utils/constants'

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

      // Request permission for the site to access the wallet.
      const allowed = await setAllowed()
      if (!allowed.isAllowed) {
        throw new Error('Wallet access was denied. Please allow GeoQuest in Freighter.')
      }

      // Retrieve the user's public address.
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

  /**
   * Signs a Stellar/Soroban transaction XDR with Freighter.
   * Returns the signed transaction XDR, or null if the user rejects.
   */
  const signTransaction = useCallback(
    async (transactionXdr: string) => {
      if (!publicKey) {
        throw new Error('Wallet is not connected')
      }
      const result = await freighterSignTransaction(transactionXdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      })
      if (result.error) {
        throw new Error(result.error.message || 'Transaction signing failed')
      }
      return result.signedTxXdr
    },
    [publicKey]
  )

  return {
    publicKey,
    isConnecting,
    error,
    connect,
    disconnect,
    signTransaction,
    isConnected: !!publicKey,
  }
}
