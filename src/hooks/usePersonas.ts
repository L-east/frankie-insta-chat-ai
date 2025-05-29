import { useState, useEffect } from 'react';
import { Persona } from '@/types/persona';

export function usePersonas() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const response = await fetch('/api/personas');
        const data = await response.json();
        setPersonas(data);
      } catch (error) {
        console.error('Error fetching personas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonas();
  }, []);

  return { personas, isLoading };
} 