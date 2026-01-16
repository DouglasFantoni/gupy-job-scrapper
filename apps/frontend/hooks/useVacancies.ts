'use client';

import { deleteVacancy, getVacancies, markVacancyViewed } from '@/lib/api';
import { Vacancy } from '@/lib/types';
import { ensureArray } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export function useVacancies(searchId: number | null) {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchVacancies = useCallback(async () => {
    if (!searchId) {
      setVacancies([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getVacancies(searchId, true);
      setVacancies(ensureArray(data));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao buscar vagas');
      setError(error);
      setVacancies([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchId]);

  useEffect(() => {
    fetchVacancies();
  }, [fetchVacancies]);

  const handleMarkViewed = useCallback(async (vacancyId: number) => {
    try {
      await markVacancyViewed(vacancyId);
      setVacancies((prev: Vacancy[]) => prev.map((v: Vacancy) => 
        v.id === vacancyId 
          ? { ...v, is_viewed: true, viewed_at: new Date().toISOString() }
          : v
      ));
      toast.success('Vaga marcada como visualizada');
    } catch (err) {
      console.error('Erro ao marcar vaga como vista:', err);
      toast.error('Erro ao marcar vaga como visualizada');
    }
  }, []);

  const handleDelete = useCallback(async (vacancyId: number) => {
    try {
      await deleteVacancy(vacancyId);
      setVacancies((prev: Vacancy[]) => prev.filter((v: Vacancy) => v.id !== vacancyId));
      toast.success('Vaga excluída com sucesso');
    } catch (err) {
      console.error('Erro ao excluir vaga:', err);
      toast.error('Erro ao excluir vaga');
    }
  }, []);

  const refresh = useCallback(() => {
    fetchVacancies();
  }, [fetchVacancies]);

  return {
    vacancies,
    isLoading,
    error,
    markViewed: handleMarkViewed,
    deleteVacancy: handleDelete,
    refresh,
  };
}

