'use client';

import SearchConfigTabs from '@/components/SearchConfigTabs';
import SkeletonLoader from '@/components/SkeletonLoader';
import VacancyList from '@/components/VacancyList';
import { useConfig } from '@/hooks/useConfig';
import { useSearchStatus } from '@/hooks/useSearchStatus';
import { useVacancies } from '@/hooks/useVacancies';
import { getLatestSearchByConfig, startSearch } from '@/lib/api';
import { Config, Vacancy } from '@/lib/types';
import { ensureArray, parseKeywords } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function Home() {
  const [currentSearchId, setCurrentSearchId] = useState<number | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<Config | null>(null);
  const { config: latestConfig } = useConfig();

  const { search, isLoading: searchLoading, isRunning, isCompleted } = useSearchStatus(
    currentSearchId,
    currentSearchId !== null
  );
  const { vacancies, isLoading: vacanciesLoading, markViewed, deleteVacancy, refresh } = useVacancies(
    currentSearchId
  );
  
  const lastToastStatusRef = useRef<string | null>(null);
  const hasFetchedOnCompleteRef = useRef<number | null>(null);
  const hasLoadedInitialSearchRef = useRef<boolean>(false);

  const handleLoadSearch = (config: Config | null, searchId?: number) => {
    setSelectedConfig(config);
    setCurrentSearchId(searchId || null);
  };

  const handleSearch = async () => {
    const configToUse = selectedConfig;
    
    if (!configToUse?.id) {
      toast.error('Por favor, salve uma configuração primeiro');
      return;
    }

    try {
      const newSearch = await startSearch(configToUse.id);
      setCurrentSearchId(newSearch.id);
      refresh();
    } catch (error) {
      console.error('Erro ao iniciar busca:', error);
      toast.error('Erro ao iniciar busca. Tente novamente.');
    }
  };

  const handleConfigSaved = () => {
    setCurrentSearchId(null);
  };

  const handleViewVacancy = (vacancyId: number) => {
    markViewed(vacancyId);
  };

  const handleDeleteVacancy = (vacancyId: number) => {
    deleteVacancy(vacancyId);
  };

  const handleDeleteSelected = async (vacancyIds: number[]) => {
    if (vacancyIds.length === 0) {
      toast.info('Nenhuma vaga selecionada');
      return;
    }

    try {
      const deletePromises = vacancyIds.map(id => deleteVacancy(id));
      await Promise.all(deletePromises);
      
      toast.success(`${vacancyIds.length} vaga(s) excluída(s) com sucesso`);
    } catch (error) {
      console.error('Erro ao excluir vagas selecionadas:', error);
      toast.error('Erro ao excluir algumas vagas. Tente novamente.');
    }
  };

  const handleOpenNextUnviewed = async (vacancy: Vacancy) => {
    if (!vacancy || !vacancy.job_url) {
      toast.error('Vaga inválida');
      return;
    }

    try {
      window.open(vacancy.job_url, '_blank', 'noopener,noreferrer');
      
      if (!vacancy.is_viewed) {
        markViewed(vacancy.id);
      }
    } catch (error) {
      console.error('Erro ao abrir vaga:', error);
      toast.error('Erro ao abrir vaga');
    }
  };

  const handleOpenSelected = async (vacancyIds: number[]) => {
    if (vacancyIds.length === 0) {
      toast.info('Nenhuma vaga selecionada');
      return;
    }

    try {
      const selectedVacancies = ensureArray(vacancies).filter((v: Vacancy) => 
        vacancyIds.includes(v.id)
      );

      if (selectedVacancies.length === 0) {
        toast.error('Nenhuma vaga encontrada com os IDs selecionados');
        return;
      }

      let openedCount = 0;
      selectedVacancies.forEach((vacancy: Vacancy, index) => {
        if (vacancy.job_url) {
          setTimeout(() => {
            const newWindow = window.open(vacancy.job_url, '_blank', 'noopener,noreferrer');
            if (newWindow) {
              openedCount++;
            }
            if (index === selectedVacancies.length - 1) {
              setTimeout(() => {
                if (openedCount < selectedVacancies.length) {
                  toast.info(
                    `Apenas ${openedCount} de ${selectedVacancies.length} vaga(s) foram abertas. ` +
                    `O navegador pode estar bloqueando pop-ups. Verifique as configurações do navegador.`,
                    { duration: 6000 }
                  );
                }
              }, 1000);
            }
          }, index * 1);
        }
      });

      setTimeout(() => {
        selectedVacancies.forEach((vacancy: Vacancy) => {
          if (!vacancy.is_viewed) {
            markViewed(vacancy.id);
          }
        });
      }, 1000);
    } catch (error) {
      console.error('Erro ao abrir vagas selecionadas:', error);
      toast.error('Erro ao abrir vagas selecionadas');
    }
  };

  const showSkeleton = isRunning || (searchLoading && currentSearchId !== null);

  const keywords = useMemo(() => {
    const keywordsList: string[] = [];
    
    if (search?.config_snapshot) {
      const snapshot = search.config_snapshot;
      if (snapshot.title_keywords) {
        keywordsList.push(...parseKeywords(snapshot.title_keywords));
      }
      if (snapshot.description_required_keywords) {
        keywordsList.push(...parseKeywords(snapshot.description_required_keywords));
      }
    } else {
      const configToUse = selectedConfig;
      if (configToUse) {
        if (configToUse.title_keywords) {
          keywordsList.push(...parseKeywords(configToUse.title_keywords));
        }
        if (configToUse.description_required_keywords) {
          keywordsList.push(...parseKeywords(configToUse.description_required_keywords));
        }
      }
    }
    
    const uniqueKeywords = Array.from(new Set(keywordsList.map(k => k.toLowerCase())))
      .map(lowerKey => {
        return keywordsList.find(k => k.toLowerCase() === lowerKey) || lowerKey;
      });
    
    return uniqueKeywords;
  }, [search?.config_snapshot, selectedConfig]);

  useEffect(() => {
    if (isCompleted && currentSearchId && hasFetchedOnCompleteRef.current !== currentSearchId) {
      hasFetchedOnCompleteRef.current = currentSearchId;
      refresh();
    }
  }, [isCompleted, currentSearchId, refresh]);

  useEffect(() => {
    if (!search || !currentSearchId) return;

    const statusKey = `${currentSearchId}-${search.status}`;
    
    if (lastToastStatusRef.current === statusKey) return;

    if (search.status === 'error' && search.error_message) {
      toast.error(
        `Erro na busca: ${search.error_message}`,
        { duration: 6000 }
      );
      lastToastStatusRef.current = statusKey;
    }
  }, [search, currentSearchId]);

  useEffect(() => {
    lastToastStatusRef.current = null;
    hasFetchedOnCompleteRef.current = null;
  }, [currentSearchId]);

  useEffect(() => {
    if (hasLoadedInitialSearchRef.current || !latestConfig?.id) {
      return;
    }

    const loadInitialSearch = async () => {
      try {
        hasLoadedInitialSearchRef.current = true;
        const latestSearch = await getLatestSearchByConfig(latestConfig.id!);
        if (latestSearch) {
          setSelectedConfig(latestConfig);
          setCurrentSearchId(latestSearch.id);
        } else {
          setSelectedConfig(latestConfig);
        }
      } catch (error) {
        console.error('Erro ao carregar última busca:', error);
        setSelectedConfig(latestConfig);
      }
    };

    loadInitialSearch();
  }, [latestConfig]);

  return (
    <div className="h-full flex flex-col py-2 px-2 sm:py-4 sm:px-4 lg:py-4 lg:px-6">
      <div className="max-w-[1850px] w-full mx-auto flex flex-col flex-1 overflow-hidden">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4 text-center flex-shrink-0">
          Gupy Job Scraper
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[500px_1fr] gap-2 sm:gap-4 lg:gap-6 flex-1 overflow-hidden min-h-0">
          <div className="flex flex-col overflow-hidden min-h-0">
            <div className="flex-1 overflow-hidden min-h-0">
              <SearchConfigTabs
                onSearch={handleSearch}
                isSearchLoading={isRunning}
                isSearchDisabled={!selectedConfig?.id}
                onConfigSelect={handleLoadSearch}
                selectedConfig={selectedConfig}
                currentSearchId={currentSearchId}
                onConfigSaved={handleConfigSaved}
              />
            </div>
          </div>

          <div className="flex flex-col overflow-hidden min-h-0">
            <div className="flex-1 overflow-hidden">
              {showSkeleton ? (
                <SkeletonLoader />
              ) : (
                <VacancyList
                  vacancies={vacancies}
                  onView={handleViewVacancy}
                  onDelete={handleDeleteVacancy}
                  onOpenNextUnviewed={handleOpenNextUnviewed}
                  onOpenSelected={handleOpenSelected}
                  onDeleteSelected={handleDeleteSelected}
                  keywords={keywords}
                  isLoading={vacanciesLoading && !isCompleted}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

