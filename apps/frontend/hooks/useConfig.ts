'use client';

import { getLatestConfig, saveConfig, updateConfig } from '@/lib/api';
import { Config } from '@/lib/types';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const data = await getLatestConfig();
        setConfig(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erro ao buscar configuração');
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const save = async (configData: Omit<Config, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSaving(true);
      setError(null);
      const saved = await saveConfig(configData);
      setConfig(saved);
      toast.success('Configuração salva com sucesso!');
      return saved;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao salvar configuração');
      setError(error);
      toast.error('Erro ao salvar configuração. Tente novamente.');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const update = async (configId: number, configData: Omit<Config, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSaving(true);
      setError(null);
      const updated = await updateConfig(configId, configData);
      setConfig(updated);
      toast.success('Configuração atualizada com sucesso!');
      return updated;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar configuração');
      setError(error);
      toast.error('Erro ao atualizar configuração. Tente novamente.');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    config,
    isLoading,
    isSaving,
    error,
    save,
    update,
  };
}

