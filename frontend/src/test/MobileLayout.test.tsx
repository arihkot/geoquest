import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MobileBottomNav from '../components/MobileBottomNav'
import { MemoryRouter } from 'react-router-dom'

describe('Mobile Responsive Layout', () => {
  it('renders bottom nav in a mobile viewport', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <MobileBottomNav />
      </MemoryRouter>
    )
    expect(screen.getByText('Explore')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('highlights active route in bottom nav', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <MobileBottomNav />
      </MemoryRouter>
    )
    const profileLink = screen.getByText('Profile').closest('a')
    expect(profileLink?.className).toContain('text-geo-600')
  })
})
