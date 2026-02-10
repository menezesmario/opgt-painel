import React from 'react';

type SkeletonVariant = 'stat' | 'chart' | 'map' | 'table' | 'text';

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  /** Número de linhas para variante 'text' */
  lines?: number;
}

/**
 * Componente Skeleton para loading states
 * Usa apenas Tailwind CSS (sem dependências adicionais)
 */
const Skeleton: React.FC<SkeletonProps> = ({ 
  variant = 'text', 
  className = '',
  lines = 3 
}) => {
  // Variante: Card de estatística
  if (variant === 'stat') {
    return (
      <div className={`bg-white border border-border rounded-lg p-6 ${className}`}>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-2/3 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  // Variante: Mapa
  if (variant === 'map') {
    return (
      <div className={`bg-white border border-border rounded-lg overflow-hidden ${className}`}>
        <div className="h-[450px] bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-text-muted text-sm">Carregando mapa...</p>
          </div>
        </div>
      </div>
    );
  }

  // Variante: Gráfico
  if (variant === 'chart') {
    return (
      <div className={`bg-white border border-border rounded-lg p-6 ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse" />
        <div className="h-64 bg-gray-100 rounded animate-pulse flex items-end justify-around px-4 pb-4">
          {/* Barras simuladas */}
          <div className="w-8 bg-gray-200 rounded-t animate-pulse" style={{ height: '40%' }} />
          <div className="w-8 bg-gray-200 rounded-t animate-pulse" style={{ height: '70%' }} />
          <div className="w-8 bg-gray-200 rounded-t animate-pulse" style={{ height: '50%' }} />
          <div className="w-8 bg-gray-200 rounded-t animate-pulse" style={{ height: '85%' }} />
          <div className="w-8 bg-gray-200 rounded-t animate-pulse" style={{ height: '60%' }} />
          <div className="w-8 bg-gray-200 rounded-t animate-pulse" style={{ height: '45%' }} />
        </div>
      </div>
    );
  }

  // Variante: Tabela
  if (variant === 'table') {
    return (
      <div className={`bg-white border border-border rounded-lg overflow-hidden ${className}`}>
        {/* Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-border">
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          </div>
        </div>
        {/* Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-6 py-4 border-b border-border last:border-b-0">
            <div className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Variante: Texto (default)
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
};

export default Skeleton;
