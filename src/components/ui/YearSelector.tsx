import React from 'react';

interface YearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears?: number[];
  className?: string;
}

/**
 * Componente para seleção de ano de referência dos dados
 */
const YearSelector: React.FC<YearSelectorProps> = ({
  selectedYear,
  onYearChange,
  availableYears = [2025, 2026],
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-body-sm text-text-muted">Ano:</span>
      <div className="flex rounded-lg border border-border overflow-hidden">
        {availableYears.map((year) => (
          <button
            key={year}
            onClick={() => onYearChange(year)}
            disabled={year === 2026} // 2026 ainda não disponível
            className={`
              px-4 py-2 text-body-sm font-medium transition-all
              ${selectedYear === year
                ? 'bg-primary text-white'
                : year === 2026
                  ? 'bg-bg-alt text-text-muted cursor-not-allowed'
                  : 'bg-white text-text-secondary hover:bg-primary/5 hover:text-primary'
              }
            `}
            title={year === 2026 ? 'Dados de 2026 em breve' : `Dados de ${year}`}
          >
            {year}
            {year === 2026 && (
              <span className="ml-1 text-body-xs opacity-70">(em breve)</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default YearSelector;
