import React from 'react';
import {
  BIOMA_COLORS,
  CATEGORIA_FUNDIARIA_LABELS,
  CATEGORIA_FUNDIARIA_COLORS,
} from '../../config/geoserver';

interface ActiveFilterChipsProps {
  selectedBiomas: string[];
  selectedCategoria: string;
  onRemoveBioma: (bioma: string) => void;
  onRemoveCategoria: () => void;
}

const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  selectedBiomas,
  selectedCategoria,
  onRemoveBioma,
  onRemoveCategoria,
}) => {
  if (selectedBiomas.length === 0 && !selectedCategoria) return null;

  return (
    <div className="absolute top-3 left-3 z-[500] flex flex-wrap gap-1.5 max-w-[60%] pointer-events-auto">
      {selectedBiomas.map((bioma) => (
        <span
          key={bioma}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm
            border border-border rounded-full text-[0.72rem] font-semibold text-text-secondary
            shadow-soft"
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: BIOMA_COLORS[bioma] || '#999' }}
          />
          {bioma}
          <button
            onClick={() => onRemoveBioma(bioma)}
            className="opacity-50 hover:opacity-100 text-sm leading-none ml-0.5 transition-opacity"
            aria-label={`Remover filtro ${bioma}`}
          >
            ×
          </button>
        </span>
      ))}

      {selectedCategoria && (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm
            border border-border rounded-full text-[0.72rem] font-semibold text-text-secondary
            shadow-soft"
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: CATEGORIA_FUNDIARIA_COLORS[selectedCategoria] || '#999' }}
          />
          {selectedCategoria}
          {CATEGORIA_FUNDIARIA_LABELS[selectedCategoria]
            ? ` — ${CATEGORIA_FUNDIARIA_LABELS[selectedCategoria]}`
            : ''}
          <button
            onClick={onRemoveCategoria}
            className="opacity-50 hover:opacity-100 text-sm leading-none ml-0.5 transition-opacity"
            aria-label={`Remover filtro ${selectedCategoria}`}
          >
            ×
          </button>
        </span>
      )}
    </div>
  );
};

export default ActiveFilterChips;
