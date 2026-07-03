import { describe, it, expect } from 'vitest'
import { shortenAddress, isValidStellarAddress, formatTokenAmount } from '../utils/wallet'

describe('Wallet Utils', () => {
  it('shortens Stellar addresses correctly', () => {
    const addr = 'GD2ALL3NOT4ADMIN5VALIDKEY1234567890ABCDEFGHIJKLMNOP'
    expect(shortenAddress(addr)).toBe('GD2ALL...KLMNOP')
  })

  it('validates Stellar public key format', () => {
    expect(isValidStellarAddress('GD2ALL3NOT4ADMIN5VALIDKEY1234567890ABCDEFGHIJKLMNOP')).toBe(true)
    expect(isValidStellarAddress('invalid')).toBe(false)
    expect(isValidStellarAddress('')).toBe(false)
  })

  it('formats token amounts with 7 decimals', () => {
    expect(formatTokenAmount(100_0000000)).toBe('100.00')
    expect(formatTokenAmount(50_0000000)).toBe('50.00')
    expect(formatTokenAmount(1_5000000)).toBe('1.50')
    expect(formatTokenAmount(0)).toBe('0.00')
  })
})
