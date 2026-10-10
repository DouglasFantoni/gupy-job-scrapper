export function parseKeywords(keywordsStr: string | null | undefined): string[] {
  if (!keywordsStr) return [];
  return keywordsStr
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
}

export function arraysEqual(a: any[], b: any[]): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  const sortedA = [...a].sort();
  const sortedB = [...b].sort();

  for (let i = 0; i < sortedA.length; ++i) {
    if (sortedA[i] !== sortedB[i]) return false;
  }
  return true;
}

export function joinArray(arr: string[] | null | undefined): string {
  if (!arr || arr.length === 0) return '';
  return arr.join(', ');
}

export function normalizeKeywords(keywords: string | string[]): string[] {
  if (Array.isArray(keywords)) {
    return keywords.map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
  }
  return parseKeywords(keywords).map(k => k.toLowerCase());
}

export function toggleArrayItem<T>(array: T[], item: T): T[] {
  const index = array.indexOf(item);
  if (index === -1) {
    return [...array, item];
  } else {
    const newArray = [...array];
    newArray.splice(index, 1);
    return newArray;
  }
}

export function formatDate(dateStr: string | null | undefined, includeTime: boolean = false): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (includeTime) {
    return date.toLocaleString('pt-BR');
  }
  return date.toLocaleDateString('pt-BR');
}

export function formatJobTypes(types: string[]): string {
  const map: Record<string, string> = {
    'vacancy_type_effective': 'Efetivo',
    'vacancy_type_internship': 'Estágio',
    'vacancy_type_temporary': 'Temporário',
    'vacancy_type_talent_pool': 'Banco de Talentos',
    'vacancy_legal_entity': 'PJ',
  };
  return types.map((t) => map[t] || t).join(', ');
}

export function formatWorkplaceTypes(types: string[]): string {
  const map: Record<string, string> = {
    'remote': 'Remoto',
    'hybrid': 'Híbrido',
    'on-site': 'Presencial',
  };
  return types.map((t) => map[t] || t).join(', ');
}

export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as T[];
  return [value as T];
}
