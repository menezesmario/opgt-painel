import React, { useState, useEffect, useCallback } from 'react';
import Tag from '../ui/Tag';
import {
  MALHA_STATS,
  BIOMA_COLORS,
  CATEGORIA_FUNDIARIA_LABELS,
} from '../../config/geoserver';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (biomas: string[], categoria: string) => void;
  initialBiomas: string[];
  initialCategoria: string;
}

const formatArea = (ha: number) => {
  if (ha >= 1_000_000) return `${(ha / 1_000_000).toFixed(0)} M ha`;
  if (ha >= 1_000) return `${(ha / 1_000).toFixed(0)} mil ha`;
  return `${ha.toLocaleString('pt-BR')} ha`;
};

const SOBREPOSICOES_PLACEHOLDER = [
  { id: 'car_tih', label: 'CAR × TI Homologadas' },
  { id: 'car_ucs', label: 'CAR × Unidades de Conservação' },
  { id: 'car_fpnd', label: 'CAR × FPND' },
  { id: 'car_sigef', label: 'CAR × SIGEF' },
];

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  onApply,
  initialBiomas,
  initialCategoria,
}) => {
  const [draftBiomas, setDraftBiomas] = useState<string[]>(initialBiomas);
  const [draftCategoria, setDraftCategoria] = useState<string>(initialCategoria);

  // Sincroniza draft com valores reais quando o drawer abre
  useEffect(() => {
    if (isOpen) {
      setDraftBiomas(initialBiomas);
      setDraftCategoria(initialCategoria);
    }
  }, [isOpen, initialBiomas, initialCategoria]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Escape fecha drawer
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const toggleBioma = useCallback((bioma: string) => {
    setDraftBiomas((prev) =>
      prev.includes(bioma) ? prev.filter((b) => b !== bioma) : [...prev, bioma]
    );
  }, []);

  const toggleCategoria = useCallback((cat: string) => {
    setDraftCategoria((prev) => (prev === cat ? '' : cat));
  }, []);

  const clearAll = () => {
    setDraftBiomas([]);
    setDraftCategoria('');
  };

  const handleApply = () => {
    onApply(draftBiomas, draftCategoria);
  };

  const draftCount = draftBiomas.length + (draftCategoria ? 1 : 0);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-250 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[360px] max-w-[90vw] z-50 bg-white shadow-strong
          flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros e Camadas"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h3 className="text-base font-bold text-text">Filtros & Camadas</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-bg-alt rounded-md flex items-center justify-center text-text-secondary
              hover:bg-primary/10 hover:text-primary transition-all duration-200"
            aria-label="Fechar filtros"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
          {/* ── Bioma ── */}
          <div className="mb-7">
            <div className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-text-muted mb-3">
              Filtrar por Bioma
            </div>
            {MALHA_STATS.por_bioma.map((item) => {
              const active = draftBiomas.includes(item.bioma);
              return (
                <div
                  key={item.bioma}
                  onClick={() => toggleBioma(item.bioma)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 mb-1
                    ${active ? 'bg-primary/5' : 'hover:bg-bg-alt'}`}
                >
                  <div
                    className={`w-[18px] h-[18px] border-2 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200
                      ${active ? 'bg-primary border-primary' : 'border-border-dark'}`}
                  >
                    {active && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: BIOMA_COLORS[item.bioma] || '#999' }}
                  />
                  <span className="flex-1 text-[0.85rem] font-medium text-text">{item.bioma}</span>
                  <span className="text-[0.78rem] text-text-muted font-medium">{formatArea(item.area_ha)}</span>
                </div>
              );
            })}
          </div>

          {/* ── Categoria Fundiária ── */}
          <div className="mb-7">
            <div className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-text-muted mb-3">
              Categoria Fundiária
            </div>
            {MALHA_STATS.por_categoria.map((cat) => {
              const active = draftCategoria === cat.sigla;
              return (
                <div
                  key={cat.sigla}
                  onClick={() => toggleCategoria(cat.sigla)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 mb-1
                    ${active ? 'bg-primary/5' : 'hover:bg-bg-alt'}`}
                >
                  <div
                    className={`w-[18px] h-[18px] border-2 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200
                      ${active ? 'bg-primary border-primary' : 'border-border-dark'}`}
                  >
                    {active && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="flex-1 text-[0.85rem] font-medium text-text">
                    {cat.sigla}
                    <span className="text-text-secondary font-normal"> — {CATEGORIA_FUNDIARIA_LABELS[cat.sigla] || cat.nome}</span>
                  </span>
                  <span className="text-[0.78rem] text-text-muted font-medium">{formatArea(cat.area_ha)}</span>
                </div>
              );
            })}
          </div>

          {/* ── Sobreposições (placeholder) ── */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-text-muted">
                Sobreposições
              </span>
              <Tag variant="subtle" size="sm">Em breve</Tag>
            </div>
            {SOBREPOSICOES_PLACEHOLDER.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-md mb-1 opacity-50 cursor-not-allowed"
              >
                <div className="w-[18px] h-[18px] border-2 border-border rounded flex-shrink-0" />
                <span className="flex-1 text-[0.85rem] font-medium text-text">{item.label}</span>
                <span className="text-[0.78rem] text-red-500 font-medium">—</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-2.5">
          <button
            onClick={clearAll}
            className="px-4 py-2.5 text-[0.85rem] font-medium text-text-muted border-[1.5px] border-border rounded-md
              hover:border-red-500 hover:text-red-500 transition-all duration-200"
          >
            Limpar tudo
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 text-[0.85rem] font-semibold text-white bg-primary rounded-md
              hover:bg-primary-dark transition-all duration-200"
          >
            Aplicar filtros{draftCount > 0 ? ` (${draftCount})` : ''}
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterDrawer;
