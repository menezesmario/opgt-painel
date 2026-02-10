import React from 'react';

interface PageLoaderProps {
  message?: string;
}

/**
 * Componente de loading para páginas inteiras
 * Usado como fallback em Suspense de rotas lazy-loaded
 */
const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = 'Carregando...' 
}) => {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        
        {/* Mensagem */}
        <p className="text-text-secondary text-body-md">{message}</p>
      </div>
    </div>
  );
};

export default PageLoader;
