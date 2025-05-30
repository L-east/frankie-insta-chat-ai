
import { useState, useEffect } from 'react';
import { getPersonas, Persona } from '@/services/personaService';

export function usePersonas() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setIsLoading(true);
        const data = await getPersonas();
        setPersonas(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching personas:', err);
        setError(err.message || 'Failed to fetch personas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonas();
  }, []);

  const refreshPersonas = async () => {
    try {
      const data = await getPersonas();
      setPersonas(data);
      setError(null);
    } catch (err: any) {
      console.error('Error refreshing personas:', err);
      setError(err.message || 'Failed to refresh personas');
    }
  };

  return { personas, isLoading, error, refreshPersonas };
}
