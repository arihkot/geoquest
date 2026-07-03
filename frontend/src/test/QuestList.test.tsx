import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import QuestList from '../components/QuestList'
import type { Quest } from '../hooks/useQuests'

const mockQuests: Quest[] = [
  {
    id: 0,
    title: 'Riverside Park Cleanup Zone',
    description: 'Visit Riverside Park and help keep it clean.',
    lat_e7: 407483000,
    lng_e7: -739850000,
    radius_m: 50,
    reward_amount: 100_0000000,
    budget_remaining: 800_0000000,
    budget_total: 1000_0000000,
    active: true,
    start_ledger: 0,
    end_ledger: 99999999,
    total_claims: 20,
  },
  {
    id: 1,
    title: 'Central Park Eco Walk',
    description: 'Explore Central Park and learn about urban biodiversity.',
    lat_e7: 407827000,
    lng_e7: -739662000,
    radius_m: 100,
    reward_amount: 50_0000000,
    budget_remaining: 300_0000000,
    budget_total: 500_0000000,
    active: true,
    start_ledger: 0,
    end_ledger: 99999999,
    total_claims: 40,
  },
]

describe('Quest List', () => {
  it('renders quest list with quests', () => {
    render(
      <QuestList
        quests={mockQuests}
        selectedQuest={null}
        onSelect={() => {}}
      />
    )
    expect(screen.getByText('Riverside Park Cleanup Zone')).toBeInTheDocument()
    expect(screen.getByText('Central Park Eco Walk')).toBeInTheDocument()
  })

  it('renders reward amounts formatted correctly', () => {
    render(
      <QuestList
        quests={mockQuests}
        selectedQuest={null}
        onSelect={() => {}}
      />
    )
    expect(screen.getByText('100.00', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('50.00', { exact: false })).toBeInTheDocument()
  })

  it('shows empty state when no quests', () => {
    render(
      <QuestList
        quests={[]}
        selectedQuest={null}
        onSelect={() => {}}
      />
    )
    expect(screen.getByText('No quests available in your area.')).toBeInTheDocument()
  })
})
