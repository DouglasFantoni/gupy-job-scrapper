'use client';

import { useConfig } from '@/hooks/useConfig';
import { Config } from '@/lib/types';
import { getLatestSearchByConfig } from '@/lib/api';
import { useState } from 'react';
import ConfigForm from './ConfigForm';
import SavedSearchesList from './SavedSearchesList';
import SearchButton from './SearchButton';
import ConfirmModal from './ConfirmModal';

interface SearchConfigTabsProps {
  onSearch: () => void;
  isSearchLoading: boolean;
  isSearchDisabled: boolean;
  onConfigSelect: (config: Config | null, searchId?: number) => void;
  selectedConfig: Config | null;
  currentSearchId?: number | null;
  onConfigSaved?: () => void;
}

export default function SearchConfigTabs({
  onSearch,
  isSearchLoading,
  isSearchDisabled,
  onConfigSelect,
  selectedConfig,
  currentSearchId,
  onConfigSaved,
}: SearchConfigTabsProps) {
  const { isSaving, save: saveConfig, refresh: refreshConfig } = useConfig();
  const [activeTab, setActiveTab] = useState<'saved' | 'search'>('search');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfigSelect = async (config: Config) => {
    setActiveTab('search');
    
    if (config.id) {
      try {
        const latestSearch = await getLatestSearchByConfig(config.id);
        onConfigSelect(config, latestSearch?.id);
      } catch (error) {
        console.error('Erro ao buscar última busca:', error);
        onConfigSelect(config);
      }
    } else {
      onConfigSelect(config);
    }
  };

  const handleSave = async (configData: Omit<Config, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const savedConfig = await saveConfig(configData);
      await refreshConfig();
      if (savedConfig) {
        onConfigSelect(savedConfig, undefined);
      }
      if (onConfigSaved) {
        onConfigSaved();
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  const handleSearchClick = () => {
    if (currentSearchId) {
      setShowConfirmModal(true);
    } else {
      onSearch();
    }
  };

  const handleConfirmRefetch = () => {
    onSearch();
  };


  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
      <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 px-2 sm:px-3 lg:px-4 pt-2 sm:pt-3 pb-1 sm:pb-2 flex-shrink-0">Configuração de Busca</h2>
      
      <div className="border-b border-gray-200 px-2 sm:px-3 lg:px-5 flex-shrink-0">
        <nav className="flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'saved'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Buscas Salvas
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Buscar
          </button>
        </nav>
      </div>

      <div className="p-2 sm:p-3 lg:p-4 overflow-y-auto flex-1 min-h-0 max-h-full">
        {activeTab === 'saved' && (
          <SavedSearchesList
            onUseSearch={handleConfigSelect}
            currentConfigId={selectedConfig?.id || undefined}
            onConfigDeleted={() => {
              if (selectedConfig) {
                onConfigSelect(null);
              }
            }}
          />  
        )}

        {activeTab === 'search' && (
          <div className="space-y-3">
            <ConfigForm
              key={selectedConfig?.id || 'new'}
              initialConfig={selectedConfig}
              onSave={handleSave}
              isSaving={isSaving}
            />
            
            <div className="mt-3">
              <SearchButton
                onClick={handleSearchClick}
                isLoading={isSearchLoading}
                disabled={isSearchDisabled}
                configId={selectedConfig?.id}
                hasActiveSearch={!!currentSearchId}
              />
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmRefetch}
        title="Refazer Busca"
        message="Ao refazer a busca, os dados da busca anterior serão perdidos. Deseja continuar?"
        confirmText="Refazer Busca"
        cancelText="Cancelar"
      />
    </div>
  );
}

