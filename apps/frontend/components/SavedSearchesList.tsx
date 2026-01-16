'use client';

import { deleteConfig, getConfigs } from '@/lib/api';
import { Config } from '@/lib/types';
import { formatDate, formatJobTypes, formatWorkplaceTypes, joinArray } from '@/lib/utils';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface SavedSearchesListProps {
  onUseSearch: (config: Config) => void;
  currentConfigId?: number | null;
  onConfigDeleted?: () => void;
}

export default function SavedSearchesList({ onUseSearch, currentConfigId, onConfigDeleted }: SavedSearchesListProps) {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleUseSearch = (config: Config) => {
    onUseSearch(config);
  };

  const handleDelete = async (config: Config, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!config.id) return;

    try {
      setDeletingIds((prev: Set<number>) => new Set(prev).add(config.id!));
      await deleteConfig(config.id);
      setConfigs((prev: Config[]) => prev.filter((c: Config) => c.id !== config.id));
      toast.success('Busca excluída com sucesso!');
      if (onConfigDeleted) {
        onConfigDeleted();
      }
    } catch (error) {
      console.error('Erro ao excluir busca:', error);
      toast.error('Erro ao excluir busca. Tente novamente.');
    } finally {
      setDeletingIds((prev: Set<number>) => {
        const newSet = new Set(prev);
        newSet.delete(config.id!);
        return newSet;
      });
    }
  };

  const fetchConfigs = async () => {
    try {
      setIsLoading(true);
      const data = await getConfigs();
      setConfigs(data);
    } catch (error) {
      console.error('Erro ao carregar buscas salvas:', error);
      let errorMessage = 'Erro ao carregar buscas salvas';
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED' || error.code === 'ERR_CONNECTION_RESET') {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
        } else if (error.response) {
          errorMessage = `Erro ao carregar buscas salvas: ${error.response.status} ${error.response.statusText}`;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">Carregando buscas salvas...</div>
    );
  }

  if (configs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma busca salva encontrada. Salve uma configuração na aba "Buscar" para começar.
      </div>
    );
  }

  return (
    <div className="space-y-3">
        {configs.map((config: Config) => (
          <div
            key={config.id}
            className={`border rounded-lg p-4 ${
              currentConfigId === config.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-2">
                  {config.title_keywords || 'Sem palavras-chave'}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  {config.date_start && (
                    <div>
                      <span className="font-medium">Data mínima:</span> {formatDate(config.date_start)}
                    </div>
                  )}
                  {config.description_required_keywords && (
                    <div>
                      <span className="font-medium">Descrição:</span> {config.description_required_keywords}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Modelo de trabalho:</span> {formatWorkplaceTypes(config.workplace_types)}
                  </div>
                  {config.exclude_keywords && config.exclude_keywords.length > 0 && (
                    <div>
                      <span className="font-medium">Excluir:</span> {joinArray(config.exclude_keywords)}
                    </div>
                  )}
                  {config.state && (
                    <div>
                      <span className="font-medium">Estado:</span> {config.state}
                    </div>
                  )}
                  {config.country && (
                    <div>
                      <span className="font-medium">País:</span> {config.country}
                    </div>
                  )}
                  {config.job_types && config.job_types.length > 0 && (
                    <div>
                      <span className="font-medium">Tipo de vaga:</span> {formatJobTypes(config.job_types)}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Criado em: {formatDate(config.created_at)}
                  </div>
                </div>
              </div>
              <div className="ml-4 flex flex-col gap-2">
                <button
                  onClick={() => handleUseSearch(config)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium whitespace-nowrap"
                >
                  Carregar Busca
                </button>
                <button
                  onClick={(e: React.MouseEvent) => handleDelete(config, e)}
                  disabled={deletingIds.has(config.id!)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingIds.has(config.id!) ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

