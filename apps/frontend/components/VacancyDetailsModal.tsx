'use client';

import { formatDescription } from '@/lib/textHelpers';
import { Vacancy } from '@/lib/types';
import { formatDate, joinArray } from '@/lib/utils';
import CopyButton from './CopyButton';

interface VacancyDetailsModalProps {
  vacancy: Vacancy | null;
  isOpen: boolean;
  onClose: () => void;
  keywords?: string[];
}

export default function VacancyDetailsModal({ vacancy, isOpen, onClose, keywords = [] }: VacancyDetailsModalProps) {
  if (!isOpen || !vacancy) return null;


  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pb-4 sm:pb-8" style={{ pointerEvents: 'none' }}>
        <div
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          style={{ pointerEvents: 'auto' }}
        >
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-start flex-shrink-0">
            <div className="flex-1 pr-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 text-center">
                {vacancy.name}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <span className="font-medium">Empresa:</span> {vacancy.career_page_name || 'N/A'}
                </div>
                {vacancy.city && (
                  <div>
                    <span className="font-medium">Cidade:</span> {vacancy.city}
                  </div>
                )}
                {vacancy.state && (
                  <div>
                    <span className="font-medium">Estado:</span> {vacancy.state}
                  </div>
                )}
                {vacancy.country && (
                  <div>
                    <span className="font-medium">País:</span> {vacancy.country}
                  </div>
                )}
                <div>
                  <span className="font-medium">Publicado em:</span> {formatDate(vacancy.published_date, true)}
                </div>
                {vacancy.workplace_types && vacancy.workplace_types.length > 0 && (
                  <div>
                    <span className="font-medium">Modelo de Trabalho:</span> {vacancy.workplace_types_display || joinArray(vacancy.workplace_types)}
                  </div>
                )}
                {vacancy.type && (
                  <div>
                    <span className="font-medium">Tipo de Vaga:</span> {vacancy.type}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded p-1 flex-shrink-0"
              aria-label="Fechar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Descrição da Vaga</h4>
                <CopyButton 
                  text={vacancy.description || ''}
                  label="Copiar descrição"
                  successMessage="Descrição copiada para a área de transferência!"
                />
              </div>
              <div
                className="text-sm text-gray-700 prose prose-sm max-w-none bg-gray-50 p-4 rounded-md"
                dangerouslySetInnerHTML={{ __html: formatDescription(vacancy.description, keywords) }}
              />
            </div>
            
            {vacancy.job_url && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <a
                  href={vacancy.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Ver vaga completa no site
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          <div className="px-4 sm:px-6 py-3 border-t border-gray-200 flex justify-end flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

