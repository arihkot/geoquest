import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminConsole from '../components/AdminConsole'

vi.mock('../hooks/useWallet', () => ({
  useWallet: vi.fn(() => ({
    publicKey: 'GD2ALL3NOT4ADMIN5VALIDKEY1234567890ABCDEF',
    isConnected: true,
    isConnecting: false,
    error: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
}))

vi.mock('../utils/constants', () => ({
  ADMIN_WALLETS: ['GADMIN1234567890123456789012345678901234567890'],
  STELLAR_EXPERT_TX_URL: (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`,
}))

describe('Admin Console', () => {
  it('shows admin access required for non-admin wallets', () => {
    render(<AdminConsole />)
    expect(screen.getByText('Admin Access Required')).toBeInTheDocument()
  })
})
