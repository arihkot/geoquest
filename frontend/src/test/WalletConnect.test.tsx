import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'
import WalletConnectPrompt from '../components/WalletConnectPrompt'
import QuestList from '../components/QuestList'

vi.mock('../hooks/useWallet', () => ({
  useWallet: vi.fn(() => ({
    publicKey: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
}))

describe('Wallet Connect', () => {
  it('renders wallet connect prompt when not connected', () => {
    render(
      <BrowserRouter>
        <WalletConnectPrompt />
      </BrowserRouter>
    )
    expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument()
    expect(screen.getByText('Connect Freighter')).toBeInTheDocument()
  })
})
