
import { useState, useEffect } from 'react';
import { getUserStats } from '@/services/personaService';
import { useAuth } from '@/contexts/AuthContext';

interface AgentUsage {
  free_messages_remaining: number;
  total_messages_remaining: number;
  free_agents_remaining: number;
  is_pro: boolean;
}

export function useAgentUsage() {
  const [data, setData] = useState<AgentUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUsage = async () => {
    if (!user) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const stats = await getUserStats();
      setData(stats);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching agent usage:', err);
      setError(err.message || 'Failed to fetch usage data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [user]);

  const refreshUsage = () => {
    fetchUsage();
  };

  return { data, isLoading, error, refreshUsage };
}
