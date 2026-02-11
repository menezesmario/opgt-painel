import React from 'react';
import Container from '../ui/Container';

interface SummaryStripProps {
  scopeLabel: string;
  scopeSublabel: string;
  registros: number;
  area_ha: number;
  biomaCount: number;
  categoriaCount: number;
}

const formatNum = (v: number) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v);

const formatArea = (ha: number) => {
  if (ha >= 1_000_000) return `${(ha / 1_000_000).toFixed(0)} M ha`;
  if (ha >= 1_000) return `${(ha / 1_000).toFixed(0)} mil ha`;
  return `${formatNum(ha)} ha`;
};

const ScopeIcon: React.FC<{ label: string }> = ({ label }) => {
  if (label === 'Brasil') return <span className="text-lg">🇧🇷</span>;
  if (['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'].includes(label))
    return <span className="text-lg">🗺️</span>;
  return <span className="text-lg">📍</span>;
};

const SummaryStrip: React.FC<SummaryStripProps> = ({
  scopeLabel,
  scopeSublabel,
  registros,
  area_ha,
  biomaCount,
  categoriaCount,
}) => {
  return (
    <div className="flex-shrink-0 bg-white border-b border-border py-4 min-h-[4.5rem]">
      <Container>
        <div className="flex items-center gap-0 overflow-x-auto">
          {/* Context */}
          <div className="flex items-center gap-2.5 pr-5 border-r border-border mr-5 min-w-fit">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <ScopeIcon label={scopeLabel} />
            </div>
            <div>
              <h3 key={`title-${scopeLabel}`} className="animate-metric text-[0.95rem] font-bold text-text leading-tight">
                {scopeLabel === 'Brasil' ? 'Resumo Brasil' : scopeLabel}
              </h3>
              <span className="text-[0.72rem] text-text-muted font-medium">{scopeSublabel}</span>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex gap-0 flex-1">
            <Metric key={`reg-${scopeLabel}`} value={formatNum(registros)} label="Polígonos" />
            <Metric key={`area-${scopeLabel}`} value={formatArea(area_ha)} label="Área Total" />
            <Metric key={`bio-${scopeLabel}`} value={String(biomaCount)} label="Biomas" />
            <Metric key={`cat-${scopeLabel}`} value={String(categoriaCount)} label="Categorias" />
          </div>
        </div>
      </Container>
    </div>
  );
};

interface MetricProps {
  value: string;
  label: string;
  danger?: boolean;
}

const Metric: React.FC<MetricProps> = ({ value, label, danger }) => (
  <div className="animate-metric px-5 border-r border-border last:border-r-0 min-w-fit">
    <div className={`text-xl font-bold leading-tight tracking-tight ${danger ? 'text-red-600' : 'text-primary'}`}>
      {value}
    </div>
    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.04em] text-text-muted mt-0.5">
      {label}
    </div>
  </div>
);

export default SummaryStrip;
