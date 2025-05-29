import { useState, useEffect } from 'react';

interface AgentUsage {
  remaining_messages: number;
  total_messages: number;
  free_messages_used: number;
  free_messages_quota: number;
}

export function useAgentUsage() {
  const [data, setData] = useState<AgentUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/agent-usage');
        const usageData = await response.json();
        setData(usageData);
      } catch (error) {
        console.error('Error fetching agent usage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();
  }, []);

  return { data, isLoading };
} 