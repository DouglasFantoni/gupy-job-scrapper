'use client';

import { useState, useEffect, useRef } from 'react';
import { getSearchStatus } from '@/lib/api';
import { Search } from '@/lib/types';

export function useSearchStatus(searchId: number | null, enabled: boolean = true) {
  const [search, setSearch] = useState<Search | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!searchId || !enabled) {
      return;
    }

    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const data = await getSearchStatus(searchId);
        setSearch(data);

        if (data.status === 'completed' || data.status === 'error') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (error) {
        console.error('Erro ao buscar status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    fetchStatus();

    intervalRef.current = setInterval(fetchStatus, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [searchId, enabled]);

  return { search, isLoading, isRunning: search?.status === 'running', isCompleted: search?.status === 'completed' };
}

