import { useState, useEffect, useCallback } from 'react';

export interface Quest {
  id: number;
  title: string;
  description: string;
  lat_e7: number;
  lng_e7: number;
  radius_m: number;
  reward_amount: number;
  budget_remaining: number;
  budget_total: number;
  active: boolean;
  start_ledger: number;
  end_ledger: number;
  total_claims: number;
}

export function useQuests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const demoQuests: Quest[] = [
        {
          id: 0,
          title: 'Riverside Park Cleanup Zone',
          description: 'Visit Riverside Park and help keep it clean. Check in at any designated cleanup area.',
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
          description: 'Explore Central Park and learn about urban biodiversity. Check in at 5 waypoints.',
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
        {
          id: 2,
          title: 'Brooklyn Bridge Walking Tour',
          description: 'Walk across the iconic Brooklyn Bridge and discover its history.',
          lat_e7: 407061000,
          lng_e7: -739969000,
          radius_m: 200,
          reward_amount: 75_0000000,
          budget_remaining: 250_0000000,
          budget_total: 500_0000000,
          active: true,
          start_ledger: 0,
          end_ledger: 99999999,
          total_claims: 33,
        },
        {
          id: 3,
          title: 'Community Garden Volunteer',
          description: 'Visit the community garden and help with planting or harvesting.',
          lat_e7: 407300000,
          lng_e7: -739500000,
          radius_m: 40,
          reward_amount: 150_0000000,
          budget_remaining: 450_0000000,
          budget_total: 600_0000000,
          active: true,
          start_ledger: 0,
          end_ledger: 99999999,
          total_claims: 10,
        },
        {
          id: 4,
          title: 'Historic Landmark Discovery',
          description: 'Visit the historic landmark and learn about its significance.',
          lat_e7: 407484000,
          lng_e7: -739734000,
          radius_m: 30,
          reward_amount: 200_0000000,
          budget_remaining: 200_0000000,
          budget_total: 400_0000000,
          active: true,
          start_ledger: 0,
          end_ledger: 99999999,
          total_claims: 10,
        },
      ];
      // In production, this would fetch from the contract or API
      setQuests(demoQuests);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch quests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  return { quests, isLoading, error, refresh: fetchQuests };
}
