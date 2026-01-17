'use client';

import toast from 'react-hot-toast';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  successMessage?: string;
}

export default function CopyButton({ 
  text, 
  label = 'Copiar', 
  className = '',
  successMessage = 'Texto copiado para a área de transferência!'
}: CopyButtonProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch (error) {
      console.error('Erro ao copiar texto:', error);
      toast.error('Erro ao copiar texto. Tente novamente.');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      aria-label={label}
    >
      <svg 
        className="w-4 h-4 mr-1.5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
        />
      </svg>
      {label}
    </button>
  );
}
