import React from 'react';
import Container from '../ui/Container';
import { REGIOES, ESTADOS, getEstadosByRegiao } from '../../data/estados';

interface ScopeBarProps {
  selectedRegiao: string;
  selectedEstado: string;
  onRegiaoChange: (regiao: string) => void;
  onEstadoChange: (estado: string) => void;
  onResetToBrasil: () => void;
  onOpenDrawer: () => void;
  activeFilterCount: number;
}

const ScopeBar: React.FC<ScopeBarProps> = ({
  selectedRegiao,
  selectedEstado,
  onRegiaoChange,
  onEstadoChange,
  onResetToBrasil,
  onOpenDrawer,
  activeFilterCount,
}) => {
  const isBrasilActive = !selectedRegiao && !selectedEstado;
  const estadosDisponiveis = selectedRegiao ? getEstadosByRegiao(selectedRegiao) : ESTADOS;

  const selectBase =
    'appearance-none pl-3 pr-8 py-[7px] text-[0.85rem] font-medium font-sans border-[1.5px] rounded-md cursor-pointer transition-all duration-200 focus:outline-none min-w-[160px] bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2710%27%20height%3D%276%27%20viewBox%3D%270%200%2010%206%27%3E%3Cpath%20d%3D%27M0%200l5%206%205-6z%27%20fill%3D%27%238a8a82%27%2F%3E%3C%2Fsvg%3E")] bg-[length:10px_6px] bg-[right_10px_center] bg-no-repeat';

  const selectInactive = `${selectBase} border-border text-text-secondary bg-white hover:border-primary hover:bg-primary/5`;
  const selectActive = `${selectBase} bg-primary text-white border-primary font-semibold bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2710%27%20height%3D%276%27%20viewBox%3D%270%200%2010%206%27%3E%3Cpath%20d%3D%27M0%200l5%206%205-6z%27%20fill%3D%27white%27%2F%3E%3C%2Fsvg%3E")]`;

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border">
      <Container>
        <div className="flex items-center gap-3 py-3 flex-wrap">
          {/* Label */}
          <span className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-text-muted pr-1 hidden sm:inline">
            Escopo
          </span>

          {/* Breadcrumb: Brasil > Região > Estado */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={onResetToBrasil}
              className={`
                inline-flex items-center gap-1.5 px-3.5 py-[7px] text-[0.85rem] font-medium font-sans
                border-[1.5px] rounded-md cursor-pointer transition-all duration-200 whitespace-nowrap
                ${isBrasilActive
                  ? 'bg-primary text-white border-primary font-semibold'
                  : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary hover:bg-primary/5'
                }
              `}
            >
              <span className="text-[0.9rem] leading-none">{isBrasilActive ? '◉' : '○'}</span>
              Brasil
            </button>

            <span className="text-border-dark text-xs select-none">›</span>

            <select
              value={selectedRegiao}
              onChange={(e) => onRegiaoChange(e.target.value)}
              className={selectedRegiao ? selectActive : selectInactive}
            >
              <option value="">Região</option>
              {REGIOES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <span className="text-border-dark text-xs select-none">›</span>

            <select
              value={selectedEstado}
              onChange={(e) => onEstadoChange(e.target.value)}
              className={selectedEstado ? selectActive : selectInactive}
            >
              <option value="">Estado</option>
              {estadosDisponiveis.map((e) => (
                <option key={e.uf} value={e.codigoIBGE}>
                  {e.uf} – {e.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Divider + Botão Filtros */}
          <div className="hidden md:block w-px h-7 bg-border mx-1" />

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onOpenDrawer}
              className="inline-flex items-center gap-1.5 px-3.5 py-[7px] text-[0.85rem] font-medium font-sans
                bg-secondary/10 border-[1.5px] border-secondary text-secondary rounded-md cursor-pointer
                transition-all duration-200 hover:bg-secondary hover:text-white whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="hidden sm:inline">Filtros & Camadas</span>
              <span className="sm:hidden">Filtros</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-[18px] h-[18px] bg-secondary text-white text-[0.65rem] font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ScopeBar;
