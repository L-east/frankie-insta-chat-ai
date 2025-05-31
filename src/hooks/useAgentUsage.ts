
import { useState, useEffect } from 'react';
import { getMessageCredits } from '@/services/personaService';
import { useAuth } from '@/contexts/AuthContext';

interface MessageUsage {
  freeMessagesRemaining: number;
  paidMessagesRemaining: number;
  totalAvailable: number;
  totalUsed: number;
  freeExpired: boolean;
  profile?: any;
}

export function useAgentUsage() {
  const [data, setData] = useState<MessageUsage | null>(null);
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
      const credits = await getMessageCredits();
      setData(credits);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching message usage:', err);
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
