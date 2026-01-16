'use client';

import { Vacancy } from '@/lib/types';
import { formatDate, joinFiltered, joinArray } from '@/lib/utils';

interface VacancyDetailsModalProps {
  vacancy: Vacancy | null;
  isOpen: boolean;
  onClose: () => void;
  keywords?: string[];
}

export default function VacancyDetailsModal({ vacancy, isOpen, onClose, keywords = [] }: VacancyDetailsModalProps) {
  if (!isOpen || !vacancy) return null;

  const highlightKeywords = (html: string, keywords: string[]): string => {
    if (!keywords || keywords.length === 0) return html;
    
    const escapedKeywords = keywords
      .map(k => k.trim())
      .filter(k => k.length > 0)
      .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    if (escapedKeywords.length === 0) return html;
    
    const parts: Array<{ type: 'tag' | 'text'; content: string }> = [];
    let currentIndex = 0;
    const tagRegex = /<[^>]+>/g;
    let match;
    
    while ((match = tagRegex.exec(html)) !== null) {
      if (match.index > currentIndex) {
        const textContent = html.substring(currentIndex, match.index);
        if (textContent) {
          parts.push({ type: 'text', content: textContent });
        }
      }
      parts.push({ type: 'tag', content: match[0] });
      currentIndex = match.index + match[0].length;
    }
    
    if (currentIndex < html.length) {
      const textContent = html.substring(currentIndex);
      if (textContent) {
        parts.push({ type: 'text', content: textContent });
      }
    }
    
    const highlightedParts = parts.map(part => {
      if (part.type === 'tag') {
        return part.content;
      }
      
      const regex = new RegExp(
        `\\b(${escapedKeywords.join('|')})\\b`,
        'gi'
      );
      
      return part.content.replace(regex, (match) => {
        return `<mark class="bg-yellow-200 text-yellow-900 font-semibold px-1 rounded">${match}</mark>`;
      });
    });
    
    return highlightedParts.join('');
  };

  const formatDescription = (description: string) => {
    if (!description) return '<p>Sem descrição disponível.</p>';
    
    let processed = description;
    
    processed = processed
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
    
    processed = processed
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/div>/gi, '\n')
      .replace(/<div[^>]*>/gi, '')
      .replace(/<[^>]+>/g, '');
    
    processed = processed
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'");
    
    processed = processed
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    let paragraphs = processed.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    if (paragraphs.length === 1) {
      const text = paragraphs[0];
      const sectionKeywords = [
        'Responsabilidades e atribuições',
        'Requisitos e qualificações',
        'Informações adicionais',
        'Diferenciais',
        'Benefícios',
        'Responsabilidades',
        'Requisitos',
        'Informações'
      ];
      
      const sectionPattern = new RegExp(
        `(${sectionKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})[^:]*:`,
        'gi'
      );
      
      const matches = [...text.matchAll(sectionPattern)];
      
      if (matches.length > 0) {
        paragraphs = [];
        let lastIndex = 0;
        
        matches.forEach((match, index) => {
          const matchIndex = match.index || 0;
          
          if (matchIndex > lastIndex) {
            const beforeText = text.substring(lastIndex, matchIndex).trim();
            if (beforeText) {
              const initialParagraphs = beforeText.split(/([.!?])\s+(?=[A-Z])/).filter(p => p.trim().length > 0);
              const regrouped: string[] = [];
              
              for (let i = 0; i < initialParagraphs.length; i++) {
                const part = initialParagraphs[i]?.trim();
                if (!part || part.length === 0) continue;
                
                if (/^[.!?]$/.test(part)) {
                  if (regrouped.length > 0) {
                    regrouped[regrouped.length - 1] += part;
                  }
                } else {
                  regrouped.push(part);
                }
              }
              
              regrouped.forEach(para => {
                if (para.length > 300) {
                  const subParas = para.split(/([.!?])\s+/).filter(p => p.trim().length > 0);
                  const subRegrouped: string[] = [];
                  
                  for (let j = 0; j < subParas.length; j++) {
                    const subPart = subParas[j]?.trim();
                    if (!subPart || subPart.length === 0) continue;
                    
                    if (/^[.!?]$/.test(subPart)) {
                      if (subRegrouped.length > 0) {
                        subRegrouped[subRegrouped.length - 1] += subPart;
                      }
                    } else {
                      subRegrouped.push(subPart);
                    }
                  }
                  
                  paragraphs.push(...subRegrouped.filter(p => p.trim().length > 0));
                } else {
                  paragraphs.push(para);
                }
              });
            }
          }
          
          const nextMatchIndex = index < matches.length - 1 
            ? (matches[index + 1].index || text.length)
            : text.length;
          const sectionText = text.substring(matchIndex, nextMatchIndex).trim();
          if (sectionText) paragraphs.push(sectionText);
          
          lastIndex = nextMatchIndex;
        });
        
        if (lastIndex < text.length) {
          const remainingText = text.substring(lastIndex).trim();
          if (remainingText) paragraphs.push(remainingText);
        }
      } else {
        const sentences = text.split(/([.!?])\s+(?=[A-Z])/).filter(p => p.trim().length > 0);
        const regrouped: string[] = [];
        
        for (let i = 0; i < sentences.length; i++) {
          const part = sentences[i]?.trim();
          if (!part || part.length === 0) continue;
          
          if (/^[.!?]$/.test(part)) {
            if (regrouped.length > 0) {
              regrouped[regrouped.length - 1] += part;
            }
          } else {
            regrouped.push(part);
          }
        }
        
        paragraphs = regrouped.filter(p => p.trim().length > 0);
      }
    }
    
    const formatted = paragraphs
      .map((para: string) => para.trim())
      .filter((para: string) => para.length > 0)
      .map((para: string) => {
        let withBreaks = para;
        
        withBreaks = withBreaks.replace(/\n/g, '<br>');
        
        withBreaks = withBreaks.replace(/;\s+([A-Z])/g, ';<br>$1');
        withBreaks = withBreaks.replace(/;\s*([🎯💡🏥🔐🍽️🚌💰💪🎉🎁💻🤩✨🧡🚀])/g, ';<br>$1');
        withBreaks = withBreaks.replace(/;([A-Z🎯💡🏥🔐🍽️🚌💰💪🎉🎁💻🤩✨🧡🚀])/g, ';<br>$1');
        
        withBreaks = withBreaks.replace(/([.!?])\s*([🎯💡🏥🔐🍽️🚌💰💪🎉🎁💻🤩✨🧡🚀])/g, '$1<br>$2');
        withBreaks = withBreaks.replace(/([a-z])([🎯💡🏥🔐🍽️🚌💰💪🎉🎁💻🤩✨🧡🚀])/g, '$1<br>$2');
        
        withBreaks = withBreaks.replace(/([.!?])\s*(#[A-Za-z]+)/g, '$1<br>$2');
        
        withBreaks = withBreaks.replace(/([!?])\s+([A-Z][a-z])/g, '$1<br>$2');
        
        withBreaks = withBreaks.replace(/([.!?])\s+([A-Z][A-Z\s]{2,}[!?:]?)([a-z])/g, '$1<br><strong>$2</strong>$3');
        
        if (withBreaks.length > 500 && !withBreaks.includes('<br>')) {
          withBreaks = withBreaks.replace(/([.!?])\s+([A-Z][a-z])/g, '$1<br><br>$2');
        }
        
        return `<p>${withBreaks}</p>`;
      })
      .join('');
    
    const finalFormatted = formatted || '<p>Sem descrição disponível.</p>';
    
    return highlightKeywords(finalFormatted, keywords);
  };


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
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                {vacancy.name}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <span className="font-medium">Empresa:</span> {vacancy.career_page_name || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Localização:</span> {joinFiltered([vacancy.city, vacancy.state, vacancy.country])}
                </div>
                <div>
                  <span className="font-medium">Publicado em:</span> {formatDate(vacancy.published_date, true)}
                </div>
                {vacancy.workplace_types && vacancy.workplace_types.length > 0 && (
                  <div>
                    <span className="font-medium">Modelo de Trabalho:</span> {vacancy.workplace_types_display || joinArray(vacancy.workplace_types)}
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
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Descrição da Vaga</h4>
              <div
                className="text-sm text-gray-700 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: formatDescription(vacancy.description) }}
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

