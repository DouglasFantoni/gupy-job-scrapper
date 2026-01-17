'use client';

import { Vacancy } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface VacancyTableProps {
  vacancies: Vacancy[];
  selectedVacancyIds: Set<number>;
  allVisibleSelected: boolean;
  onToggleSelection: (vacancyId: number) => void;
  onSelectAll: () => void;
  onView: (vacancyId: number) => void;
  onDelete: (vacancyId: number) => void;
  onShowDetails: (vacancy: Vacancy) => void;
}

export default function VacancyTable({ 
  vacancies,
  selectedVacancyIds,
  allVisibleSelected,
  onToggleSelection,
  onSelectAll,
  onView,
  onDelete,
  onShowDetails
}: VacancyTableProps) {
  return (
    <table className="divide-y divide-gray-200 w-full" style={{ minWidth: '600px' }}>
      <thead className="bg-gray-50">
        <tr>
          <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={onSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              aria-label="Selecionar todas as vagas"
            />
          </th>
          <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Título da Vaga
          </th>
          <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Empresa
          </th>
          <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
            Modelo de Trabalho
          </th>
          <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
            Tipo de Vaga
          </th>
          <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
            Data de Publicação
          </th>
          <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Ações
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {vacancies.map((vacancy: Vacancy) => {
          const isSelected = selectedVacancyIds.has(vacancy.id);
          return (
            <tr 
              key={vacancy.id} 
              className={`${vacancy.is_viewed ? 'opacity-60' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
            >
              <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelection(vacancy.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  aria-label={`Selecionar vaga ${vacancy.name}`}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                />
              </td>
              <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                <a
                  href={vacancy.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => !vacancy.is_viewed && onView(vacancy.id)}
                  className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline max-w-full sm:max-w-[400px] lg:max-w-[550px] break-words whitespace-normal cursor-pointer block"
                >
                  {vacancy.name}
                </a>
              </td>
              <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                <div className="text-xs sm:text-sm text-gray-500">
                  {vacancy.career_page_name || 'N/A'}
                </div>
              </td>
              <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap hidden sm:table-cell">
                <div className="text-xs sm:text-sm text-gray-500">
                  {vacancy.workplace_types_display || 'N/A'}
                </div>
              </td>
              <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap hidden sm:table-cell">
                <div className="text-xs sm:text-sm text-gray-500">
                  {vacancy.type || 'N/A'}
                </div>
              </td>
              <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap hidden lg:table-cell">
                <div className="text-xs sm:text-sm text-gray-500">
                  {formatDate(vacancy.published_date)}
                </div>
              </td>
              <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => onShowDetails(vacancy)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Detalhes
                  </button>
                  <button
                    onClick={() => onDelete(vacancy.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
