'use client';

import { JOB_TYPE_OPTIONS, STATE_OPTIONS, WORKPLACE_TYPE_OPTIONS } from '@/lib/constants';
import { Config } from '@/lib/types';
import { arraysEqual, joinArray, normalizeKeywords, parseKeywords, toggleArrayItem } from '@/lib/utils';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';

interface ConfigFormProps {
  initialConfig?: Config | null;
  onSaveNew?: (config: Omit<Config, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdate?: (config: Omit<Config, 'id' | 'created_at' | 'updated_at'>) => void;
  onSearch?: () => void;
  onClear?: () => void;
  selectedConfigId?: number | null;
  isSaving: boolean;
}

export default function ConfigForm({ initialConfig, onSaveNew, onUpdate, onSearch, onClear, selectedConfigId, isSaving }: ConfigFormProps) {
  const [searchName, setSearchName] = useState('');
  const [titleKeywords, setTitleKeywords] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [descriptionKeywords, setDescriptionKeywords] = useState('');
  const [workplaceTypes, setWorkplaceTypes] = useState<string[]>([]);
  const [excludeKeywords, setExcludeKeywords] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [jobTypes, setJobTypes] = useState<string[]>([]);


  // Verificar se o formulário foi modificado em relação à configuração inicial
  const hasChanges = useMemo(() => {
    if (!initialConfig) {
      // Se não há configuração inicial, considerar como modificado se houver nome ou título (obrigatórios)
      return !!searchName.trim() || !!titleKeywords.trim();
    }

    // Normalizar valores para comparação
    const currentName = searchName.trim();
    const initialName = (initialConfig.name || '').trim();
    
    const currentTitleKeywords = titleKeywords.trim();
    const initialTitleKeywords = (initialConfig.title_keywords || '').trim();
    
    const currentDescriptionKeywords = descriptionKeywords.trim();
    const initialDescriptionKeywords = (initialConfig.description_required_keywords || '').trim();
    
    const currentExcludeKeywords = normalizeKeywords(excludeKeywords);
    const initialExcludeKeywords = normalizeKeywords(initialConfig.exclude_keywords);

    const currentState = state.trim();
    const initialState = (initialConfig.state || '').trim();
    const currentCountry = country.trim();
    const initialCountry = (initialConfig.country || '').trim();
    const currentJobTypes = jobTypes;
    const initialJobTypes = initialConfig.job_types || [];

    return (
      currentName !== initialName ||
      currentTitleKeywords !== initialTitleKeywords ||
      dateStart !== (initialConfig.date_start || '') ||
      currentDescriptionKeywords !== initialDescriptionKeywords ||
      !arraysEqual(workplaceTypes, initialConfig.workplace_types || []) ||
      !arraysEqual(currentExcludeKeywords, initialExcludeKeywords) ||
      currentState !== initialState ||
      currentCountry !== initialCountry ||
      !arraysEqual(currentJobTypes, initialJobTypes)
    );
  }, [searchName, titleKeywords, dateStart, descriptionKeywords, workplaceTypes, excludeKeywords, state, country, jobTypes, initialConfig]);

  // Função para limpar o formulário
  const clearForm = () => {
    setSearchName('');
    setTitleKeywords('');
    setDateStart('');
    setDescriptionKeywords('');
    setWorkplaceTypes([]);
    setExcludeKeywords('');
    setState('');
    setCountry('');
    setJobTypes([]);
    // Resetar a configuração selecionada no componente pai
    if (onClear) {
      onClear();
    }
  };

  useEffect(() => {
    // Sempre preencher quando initialConfig mudar ou quando for carregado
    if (initialConfig) {
      setSearchName(initialConfig.name || '');
      setTitleKeywords(initialConfig.title_keywords || '');
      setDateStart(initialConfig.date_start || '');
      setDescriptionKeywords(initialConfig.description_required_keywords || '');
      setWorkplaceTypes(initialConfig.workplace_types || []);
      setExcludeKeywords(joinArray(initialConfig.exclude_keywords));
      setState(initialConfig.state || '');
      setCountry(initialConfig.country || '');
      setJobTypes(initialConfig.job_types || []);
    }
    // Não limpar automaticamente quando initialConfig é null/undefined
    // para permitir que o usuário edite sem perder dados enquanto carrega
  }, [initialConfig]);

  const handleWorkplaceTypeChange = (type: string) => {
    setWorkplaceTypes((prev: string[]) => toggleArrayItem(prev, type));
  };

  const handleJobTypeChange = (type: string) => {
    setJobTypes((prev: string[]) => toggleArrayItem(prev, type));
  };

  const handleSaveNew = async () => {
    // Validar que nome e título são obrigatórios
    if (!searchName.trim() || !titleKeywords.trim()) {
      return;
    }
    
    const config: Omit<Config, 'id' | 'created_at' | 'updated_at'> = {
      name: searchName.trim(),
      title_keywords: titleKeywords.trim(),
      date_start: dateStart && dateStart.trim() ? dateStart : null,
      description_required_keywords: descriptionKeywords.trim() || '',
      workplace_types: workplaceTypes,
      exclude_keywords: parseKeywords(excludeKeywords),
      state: state.trim() || '',
      country: country.trim() || '',
      job_types: jobTypes,
    };

    if (onSaveNew) {
      await onSaveNew(config);
    }
  };

  const handleUpdate = () => {
    // Validar que nome e título são obrigatórios
    if (!searchName.trim() || !titleKeywords.trim() || !selectedConfigId) {
      return;
    }
    
    const config: Omit<Config, 'id' | 'created_at' | 'updated_at'> = {
      name: searchName.trim(),
      title_keywords: titleKeywords.trim(),
      date_start: dateStart && dateStart.trim() ? dateStart : null,
      description_required_keywords: descriptionKeywords.trim() || '',
      workplace_types: workplaceTypes,
      exclude_keywords: parseKeywords(excludeKeywords),
      state: state.trim() || '',
      country: country.trim() || '',
      job_types: jobTypes,
    };

    if (onUpdate) {
      onUpdate(config);
    }
  };

  return (
    <form className="space-y-2 sm:space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={clearForm}
          disabled={isSaving}
          className="flex items-center gap-1 bg-gray-200 text-gray-700 py-1 px-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          title="Limpar formulário"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Limpar</span>
        </button>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Nome da Busca
        </label>
        <input
          type="text"
          value={searchName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchName(e.target.value)}
          required
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Ex: Busca Frontend React"
        />
      </div>
      
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Palavras-chave no Título (separadas por vírgula)
        </label>
        <textarea
          value={titleKeywords}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTitleKeywords(e.target.value)}
          required
          rows={3}
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Ex: front end, frontend, desenvolvedor react"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Data Mínima de Publicação (opcional)
        </label>
        <input
          type="date"
          value={dateStart}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDateStart(e.target.value)}
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Palavras-chave na Descrição (opcional, separadas por vírgula)
        </label>
        <textarea
          value={descriptionKeywords}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescriptionKeywords(e.target.value)}
          rows={2}
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Ex: react, javascript"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          Modelo de Trabalho (opcional)
        </label>
        <div className="space-y-2">
          {WORKPLACE_TYPE_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex items-center">
              <input
                type="checkbox"
                checked={workplaceTypes.includes(value)}
                onChange={() => handleWorkplaceTypeChange(value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Termos de Exclusão (opcional, separados por vírgula)
        </label>
        <textarea
          value={excludeKeywords}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setExcludeKeywords(e.target.value)}
          rows={2}
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Ex: Inglês avançado, inglês fluente"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Estado (opcional)
        </label>
        <select
          value={state}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setState(e.target.value)}
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
        >
          {STATE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          País (opcional)
        </label>
        <input
          type="text"
          value={country}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCountry(e.target.value)}
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Ex: Brasil"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          Tipo de Vaga (opcional)
        </label>
        <div className="space-y-2">
          {JOB_TYPE_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex items-center">
              <input
                type="checkbox"
                checked={jobTypes.includes(value)}
                onChange={() => handleJobTypeChange(value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={handleUpdate}
          disabled={isSaving || !selectedConfigId || !searchName.trim() || !titleKeywords.trim()}
          className="w-full bg-green-600 text-white py-1.5 sm:py-2 px-2 sm:px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
        >
          {isSaving ? 'Atualizando...' : 'Atualizar Configuração de Busca'}
        </button>
        <button
          type="button"
          onClick={handleSaveNew}
          disabled={isSaving || !searchName.trim() || !titleKeywords.trim()}
          className="w-full bg-blue-600 text-white py-1.5 sm:py-2 px-2 sm:px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
        >
          {isSaving ? 'Salvando...' : 'Salvar Novo'}
        </button>
      </div>
    </form>
  );
}

