'use client';

interface SearchButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  configId?: number | null;
  hasActiveSearch?: boolean;
}

export default function SearchButton({ onClick, isLoading, disabled, configId, hasActiveSearch = false }: SearchButtonProps) {
  const isDisabled = disabled || !configId || isLoading;
  const buttonText = hasActiveSearch ? 'Refazer Busca' : 'Pesquisar Vagas';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Pesquisando...
        </span>
      ) : (
        buttonText
      )}
    </button>
  );
}

