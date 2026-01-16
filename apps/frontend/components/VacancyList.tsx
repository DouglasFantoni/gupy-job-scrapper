'use client';

import { Vacancy } from '@/lib/types';
import { ensureArray } from '@/lib/utils';
import { useCallback, useMemo, useState } from 'react';
import VacancyDetailsModal from './VacancyDetailsModal';
import VacancyTable from './VacancyTable';

interface VacancyListProps {
  vacancies: Vacancy[];
  onView: (vacancyId: number) => void;
  onDelete: (vacancyId: number) => void;
  onOpenNextUnviewed: (vacancy: Vacancy) => void;
  onOpenSelected: (vacancyIds: number[]) => void;
  onDeleteSelected: (vacancyIds: number[]) => void;
  keywords?: string[];
  isLoading?: boolean;
}

export default function VacancyList({ 
  vacancies, 
  onView, 
  onDelete, 
  onOpenNextUnviewed,
  onOpenSelected,
  onDeleteSelected,
  keywords = [],
  isLoading 
}: VacancyListProps) {
  const safeVacancies = ensureArray(vacancies);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVacancyIds, setSelectedVacancyIds] = useState<Set<number>>(new Set());
  
  const filteredVacancies = useMemo(() => {
    if (!searchTerm.trim()) {
      return safeVacancies;
    }
    
    const term = searchTerm.toLowerCase().trim();
    return safeVacancies.filter((vacancy: Vacancy) => {
      const name = (vacancy.name || '').toLowerCase();
      const company = (vacancy.career_page_name || '').toLowerCase();
      const city = (vacancy.city || '').toLowerCase();
      
      return name.includes(term) || 
             company.includes(term) || 
             city.includes(term)
    });
  }, [safeVacancies, searchTerm]);
  
  const unviewedVacancies = useMemo(() => {
    return filteredVacancies.filter((v: Vacancy) => !v.is_viewed);
  }, [filteredVacancies]);
  
  const nextUnviewedVacancy = useMemo(() => {
    return unviewedVacancies.length > 0 ? unviewedVacancies[0] : null;
  }, [unviewedVacancies]);
  
  const unviewedCount = unviewedVacancies.length;
  const selectedCount = selectedVacancyIds.size;
  
  const allVisibleSelected = useMemo(() => {
    if (filteredVacancies.length === 0) return false;
    return filteredVacancies.every((v: Vacancy) => selectedVacancyIds.has(v.id));
  }, [filteredVacancies, selectedVacancyIds]);
  
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShowDetails = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVacancy(null);
  };

  const handleToggleSelection = useCallback((vacancyId: number) => {
    setSelectedVacancyIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(vacancyId)) {
        newSet.delete(vacancyId);
      } else {
        newSet.add(vacancyId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (allVisibleSelected) {
      setSelectedVacancyIds((prev) => {
        const newSet = new Set(prev);
        filteredVacancies.forEach((v: Vacancy) => {
          newSet.delete(v.id);
        });
        return newSet;
      });
    } else {
      setSelectedVacancyIds((prev) => {
        const newSet = new Set(prev);
        filteredVacancies.forEach((v: Vacancy) => {
          newSet.add(v.id);
        });
        return newSet;
      });
    }
  }, [allVisibleSelected, filteredVacancies]);

  const handleOpenSelectedVacancies = useCallback(() => {
    const ids = Array.from(selectedVacancyIds);
    if (ids.length === 0) {
      return;
    }
    onOpenSelected(ids);
  }, [selectedVacancyIds, onOpenSelected]);

  const handleDeleteSelectedVacancies = useCallback(() => {
    const ids = Array.from(selectedVacancyIds);
    if (ids.length === 0) {
      return;
    }
    onDeleteSelected(ids);
    setSelectedVacancyIds(new Set());
  }, [selectedVacancyIds, onDeleteSelected]);

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Carregando vagas...</div>;
  }

  if (safeVacancies.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        Nenhuma vaga encontrada. Execute uma busca para começar.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
      <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 border-b border-gray-200 flex flex-col gap-2 flex-shrink-0">
        <div className="w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título ou empresa..."
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
              Vagas Encontradas ({filteredVacancies.length}{searchTerm.trim() && ` de ${safeVacancies.length}`}){safeVacancies.length === 500 && ' - Limitado'}
            </h2>
            {selectedCount > 0 && (
              <span className="text-xs sm:text-sm text-gray-600">
                ({selectedCount} selecionada{selectedCount !== 1 ? 's' : ''})
              </span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleSelectAll}
              className="bg-blue-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-xs sm:text-sm whitespace-nowrap"
            >
              {allVisibleSelected ? 'Desselecionar Tudo' : 'Selecionar Tudo'}
            </button>
            {selectedCount > 0 ? (
              <>
                <button
                  onClick={handleOpenSelectedVacancies}
                  className="bg-green-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  Abrir Vagas Selecionadas ({selectedCount})
                </button>
                <button
                  onClick={handleDeleteSelectedVacancies}
                  className="bg-red-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  Excluir Selecionadas ({selectedCount})
                </button>
              </>
            ) : (
              nextUnviewedVacancy && (
                <button
                  onClick={() => onOpenNextUnviewed(nextUnviewedVacancy)}
                  className="bg-green-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  Abrir Próxima Vaga
                </button>
              )
            )}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto overflow-y-auto flex-1">
        {filteredVacancies.length === 0 && searchTerm.trim() ? (
          <div className="p-8 text-center text-gray-500">
            Nenhuma vaga encontrada com o termo "{searchTerm}".
          </div>
        ) : (
          <VacancyTable
            vacancies={filteredVacancies}
            selectedVacancyIds={selectedVacancyIds}
            allVisibleSelected={allVisibleSelected}
            onToggleSelection={handleToggleSelection}
            onSelectAll={handleSelectAll}
            onView={onView}
            onDelete={onDelete}
            onShowDetails={handleShowDetails}
          />
        )}
      </div>
      
      <VacancyDetailsModal
        vacancy={selectedVacancy}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        keywords={keywords}
      />
    </div>
  );
}
