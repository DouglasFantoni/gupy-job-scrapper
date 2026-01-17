'use client';

import { useConfig } from '@/hooks/useConfig';
import { getLatestSearchByConfig } from '@/lib/api';
import { Config } from '@/lib/types';
import { useState } from 'react';
import ConfigForm from './ConfigForm';
import ConfirmModal from './ConfirmModal';
import SavedSearchesList from './SavedSearchesList';

interface SearchConfigTabsProps {
  onSearch: (configId?: number) => void;
  isSearchLoading: boolean;
  isSearchDisabled: boolean;
  onConfigSelect: (config: Config | null, searchId?: number) => void;
  selectedConfig: Config | null;
  onConfigSaved?: () => void;
}

export default function SearchConfigTabs({
  onSearch,
  isSearchLoading,
  isSearchDisabled,
  onConfigSelect,
  selectedConfig,
  onConfigSaved,
}: SearchConfigTabsProps) {
  const { isSaving, save: saveConfig, update: updateConfig } = useConfig();
  const [activeTab, setActiveTab] = useState<'saved' | 'search'>('search');
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
  const [pendingUpdateData, setPendingUpdateData] = useState<Omit<Config, 'id' | 'created_at' | 'updated_at'> | null>(null);
  const [configsRefreshTrigger, setConfigsRefreshTrigger] = useState(0);

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

  const handleSaveNew = async (configData: Omit<Config, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const savedConfig = await saveConfig(configData);
      if (savedConfig && savedConfig.id) {
        onConfigSelect(savedConfig, undefined);
        setConfigsRefreshTrigger(prev => prev + 1);
        onSearch(savedConfig.id);
      }
      if (onConfigSaved) {
        onConfigSaved();
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  const handleUpdate = (configData: Omit<Config, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedConfig?.id) {
      return;
    }
    // Armazenar os dados e mostrar o modal de confirmação
    setPendingUpdateData(configData);
    setShowUpdateConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    if (!selectedConfig?.id || !pendingUpdateData) {
      return;
    }
    try {
      const updatedConfig = await updateConfig(selectedConfig.id, pendingUpdateData);
      if (updatedConfig && updatedConfig.id) {
        onConfigSelect(updatedConfig, undefined);
        // Atualizar a lista de configs salvas
        setConfigsRefreshTrigger(prev => prev + 1);
        // Chamar onSearch com o configId diretamente para evitar problemas de timing
        onSearch(updatedConfig.id);
      }
      if (onConfigSaved) {
        onConfigSaved();
      }
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
    } finally {
      setShowUpdateConfirmModal(false);
      setPendingUpdateData(null);
    }
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
            key={configsRefreshTrigger}
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
              onSaveNew={handleSaveNew}
              onUpdate={handleUpdate}
              onSearch={onSearch}
              onClear={() => onConfigSelect(null)}
              selectedConfigId={selectedConfig?.id || null}
              isSaving={isSaving}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showUpdateConfirmModal}
        onClose={() => {
          setShowUpdateConfirmModal(false);
          setPendingUpdateData(null);
        }}
        onConfirm={handleConfirmUpdate}
        title="Atualizar Configuração de Busca"
        message="Ao atualizar a configuração e realizar a busca, as vagas podem ser perdidas devido a alterações nos filtros. Deseja continuar?"
        confirmText="Atualizar e Buscar"
        cancelText="Cancelar"
      />
    </div>
  );
}

