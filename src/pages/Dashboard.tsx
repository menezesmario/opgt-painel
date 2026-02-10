import React, { useMemo, useState, lazy, Suspense } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Tag from '../components/ui/Tag';
import SectionHeader from '../components/ui/SectionHeader';
import Disclaimer from '../components/ui/Disclaimer';
import Skeleton from '../components/ui/Skeleton';
import ErrorBoundary from '../components/ErrorBoundary';
import { MapLegend } from '../components/map/BrasilMap';
import dashboardDataJson from '../data/dashboardData.json';
import { 
  DashboardData, 
  UF_NAMES, 
  CAMADAS, 
  CamadaId,
  AMAZONIA_LEGAL_UFS,
  BRASIL_AREA_HA
} from '../types/dashboard';

// Lazy loading do mapa (componente pesado que carrega GeoJSON externo)
const BrasilMap = lazy(() => import('../components/map/BrasilMap'));

type TabId = 'landing' | 'sigef-snci' | 'car' | 'outras-camadas' | 'sobreposicoes' | 'indicadores';
type RegionalView = 'estado' | 'regiao' | 'amazonia-legal';

/**
 * Dashboard Page - Based on architecture document
 * Function: utilidade pública direta (most important page)
 */
const Dashboard: React.FC = () => {
  const data = dashboardDataJson as DashboardData;
  const [activeTab, setActiveTab] = useState<TabId>('landing');
  const [selectedLayer, setSelectedLayer] = useState<CamadaId | null>(null);
  const [regionalView, setRegionalView] = useState<RegionalView>('estado');
  const [selectedStateUf, setSelectedStateUf] = useState<string | null>(null);

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'landing', label: 'Visão Geral' },
    { id: 'sigef-snci', label: 'SIGEF/SNCI' },
    { id: 'car', label: 'CAR' },
    { id: 'outras-camadas', label: 'Outras Camadas' },
    { id: 'sobreposicoes', label: 'Operações Compostas' },
    { id: 'indicadores', label: 'Indicadores' }
  ];

  const formatHa = (v: number) =>
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v) + ' ha';
  const formatNum = (v: number) =>
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v);
  const formatPct = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 }).format(v);

  const COLORS = {
    verdeCadastro: '#3D5A45',
    terraAmbar: '#96694A',
    verde2: '#5A7A63',
    ambar2: '#B0825D'
  } as const;

  // Get layer data for Brasil
  const getLayerBrasilData = (layerId: CamadaId) => {
    switch (layerId) {
      case 'sigef':
        return { area_ha: data.brasil.sigef.area_ha, quantidade: data.brasil.sigef.num_parcelas };
      case 'snci':
        return { area_ha: data.brasil.snci.area_ha, quantidade: data.brasil.snci.num_poligonos };
      case 'car':
        return { area_ha: data.brasil.car.area_cadastrada_ha, quantidade: data.brasil.car.num_imoveis };
      case 'ti_homologada':
        return data.brasil.areas_protegidas.ti_homologada;
      case 'uc_protecao_integral':
        return data.brasil.areas_protegidas.uc_protecao_integral;
      case 'glebas_publicas':
        return data.brasil.terras_publicas.glebas_publicas;
      case 'fpnd':
        return data.brasil.terras_publicas.fpnd;
      case 'urbanas':
        return { area_ha: data.brasil.outras_areas.urbanas.area_ha };
      case 'militares':
        return data.brasil.outras_areas.militares;
      default:
        return { area_ha: 0 };
    }
  };

  // Get layer data for a state
  const getLayerEstadoData = (layerId: CamadaId, uf: string) => {
    const estado = data.estados.find(e => e.uf === uf);
    if (!estado) return null;
    
    switch (layerId) {
      case 'sigef':
        return { area_ha: estado.sigef.area_ha, quantidade: estado.sigef.num_parcelas };
      case 'snci':
        return { area_ha: estado.snci.area_ha, quantidade: estado.snci.num_poligonos };
      case 'car':
        return { area_ha: estado.car.area_cadastrada_ha, quantidade: estado.car.num_imoveis };
      case 'ti_homologada':
        return estado.areas_protegidas.ti_homologada;
      case 'uc_protecao_integral':
        return estado.areas_protegidas.uc_protecao_integral;
      case 'glebas_publicas':
        return estado.terras_publicas.glebas_publicas;
      case 'fpnd':
        return estado.terras_publicas.fpnd;
      case 'urbanas':
        return { area_ha: estado.outras_areas?.urbanas?.area_ha ?? 0 };
      default:
        return null;
    }
  };

  // Charts data for regional view
  const regionalChartData = useMemo(() => {
    if (!selectedLayer) return [];
    
    if (regionalView === 'estado') {
      return data.estados
        .map(e => ({
          name: e.uf,
          fullName: UF_NAMES[e.uf] ?? e.uf,
          value: getLayerEstadoData(selectedLayer, e.uf)?.area_ha ?? 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    } else if (regionalView === 'regiao') {
      return data.regioes_oficiais.map(r => {
        let area = 0;
        switch (selectedLayer) {
          case 'sigef':
            area = r.sigef.area_ha;
            break;
          case 'snci':
            area = r.snci.area_ha;
            break;
          case 'car':
            area = r.car.area_cadastrada_ha;
            break;
          case 'ti_homologada':
            area = r.areas_protegidas.ti_homologada.area_ha;
            break;
          case 'uc_protecao_integral':
            area = r.areas_protegidas.uc_protecao_integral.area_ha;
            break;
          case 'glebas_publicas':
            area = r.terras_publicas.glebas_publicas.area_ha;
            break;
          case 'fpnd':
            area = r.terras_publicas.fpnd.area_ha;
            break;
          case 'urbanas':
            area = r.outras_areas.urbanas.area_ha;
            break;
        }
        return { name: r.nome, fullName: r.nome, value: area };
      }).sort((a, b) => b.value - a.value);
    } else {
      // Show per state in Amazônia Legal
      return AMAZONIA_LEGAL_UFS.map(uf => ({
        name: uf,
        fullName: UF_NAMES[uf] ?? uf,
        value: getLayerEstadoData(selectedLayer, uf)?.area_ha ?? 0
      })).sort((a, b) => b.value - a.value);
    }
  }, [selectedLayer, regionalView, data]);

  const tooltipHaFormatter = (value: unknown) => {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? formatHa(n) : '—';
  };

  // Overlaps data in hectares
  const sobreposicoesHaData = useMemo(() => {
    const sh = data.brasil.sobreposicoes_ha;
    if (!sh) return [];
    return [
      { name: 'SIGEF × CAR', value: sh.sigef_x_car_ha },
      { name: 'CAR × TIs', value: sh.car_x_ti_ha ?? 0 },
      { name: 'CAR × FPND', value: sh.car_x_fpnd_ha ?? 0 },
      { name: 'CAR × UCs', value: sh.car_x_uc_ha ?? 0 },
      { name: 'CAR × Glebas', value: sh.car_x_glebas_ha ?? 0 }
    ].filter(d => d.value > 0);
  }, [data.brasil.sobreposicoes_ha]);

  const handleLayerClick = (layerId: CamadaId) => {
    setSelectedLayer(layerId);
    setActiveTab('landing');
  };

  const handleBackToLanding = () => {
    setSelectedLayer(null);
  };

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-subtle py-20 lg:py-24">
        <Container>
          <div className="max-w-4xl">
            <Tag variant="secondary" className="mb-4">Dashboard de Dados</Tag>
            <h1 className="text-display-xl text-text mb-6">
              Dashboard OPGT
            </h1>
            <p className="text-body-lg text-text-secondary leading-relaxed">
              Indicadores fundiários selecionados e tratados para apoiar a compreensão da governança territorial.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-white rounded text-body-sm text-text-secondary border border-border">
                <strong className="text-primary">Fonte:</strong> {data.metadata.fonte}
              </span>
              <span className="px-3 py-1.5 bg-white rounded text-body-sm text-text-secondary border border-border">
                <strong className="text-primary">Ano:</strong> {data.metadata.ano_ref}
              </span>
              <span className="px-3 py-1.5 bg-white rounded text-body-sm text-text-secondary border border-border">
                <strong className="text-primary">Atualização:</strong> {data.metadata.atualizacao}
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Dashboard Content */}
      <section className="section-padding bg-bg-alt">
        <Container>
          <SectionHeader
            label="Explorar"
            title="Dashboard Interativo"
            description={data.metadata.nota}
          />

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'landing') setSelectedLayer(null);
                }}
                className={`
                  px-6 py-3 rounded-lg text-body-md font-medium
                  transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-text-secondary hover:bg-primary/5 hover:text-primary'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl border border-border p-6 md:p-8 min-h-[400px]">
            
            {/* LANDING - Cards Brasil por camada */}
            {activeTab === 'landing' && !selectedLayer && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-display-sm text-text mb-2">Camadas Disponíveis</h3>
                  <p className="text-body-md text-text-secondary mb-6">
                    Clique em uma camada para ver a regionalização (por estado, região ou Amazônia Legal).
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CAMADAS.map((camada) => {
                    const layerData = getLayerBrasilData(camada.id);
                    const coberturaPct = layerData.area_ha / BRASIL_AREA_HA;
                    
                    return (
                      <Card 
                        key={camada.id}
                        variant="bordered" 
                        hoverable
                        className="cursor-pointer border-l-4 transition-all hover:shadow-md"
                        style={{ borderLeftColor: camada.cor }}
                        onClick={() => handleLayerClick(camada.id)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <div className="text-body-sm text-text-muted uppercase tracking-wider">{camada.nome}</div>
                            <div className="text-body-xs text-text-secondary mt-0.5">{camada.descricao}</div>
                          </div>
                          {camada.status === 'a_confirmar' && (
                            <Tag variant="subtle" className="text-xs">A confirmar</Tag>
                          )}
                        </div>
                        <div className="mt-3">
                          <div className="text-display-sm text-text font-semibold">{formatHa(layerData.area_ha)}</div>
                          {'quantidade' in layerData && layerData.quantidade && (
                            <div className="text-body-sm text-text-secondary mt-1">
                              {formatNum(layerData.quantidade)} {camada.temPoligonos ? 'polígonos' : 'registros'}
                            </div>
                          )}
                          <div className="text-body-xs text-text-muted mt-2">
                            Cobertura Brasil: {formatPct(coberturaPct)}
                          </div>
                        </div>
                        <div className="mt-3 h-1 bg-bg-alt rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(coberturaPct * 100, 100)}%`, backgroundColor: camada.cor }}
                          />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LANDING - Layer Detail View (when a layer is selected) */}
            {activeTab === 'landing' && selectedLayer && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBackToLanding}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Voltar
                  </button>
                  <div>
                    <h3 className="text-display-sm text-text">
                      {CAMADAS.find(c => c.id === selectedLayer)?.nome}
                    </h3>
                    <p className="text-body-sm text-text-secondary">
                      {CAMADAS.find(c => c.id === selectedLayer)?.descricao}
                    </p>
                  </div>
                </div>

                {/* Regional View Selector */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'estado' as RegionalView, label: 'Por Estado' },
                    { id: 'regiao' as RegionalView, label: 'Por Região' },
                    { id: 'amazonia-legal' as RegionalView, label: 'Amazônia Legal' }
                  ].map((view) => (
                    <button
                      key={view.id}
                      onClick={() => setRegionalView(view.id)}
                      className={`
                        px-4 py-2 rounded-md text-body-sm font-medium transition-all
                        ${regionalView === view.id
                          ? 'bg-primary text-white'
                          : 'bg-bg-alt text-text-secondary hover:bg-primary/10'
                        }
                      `}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart */}
                  <Card variant="elevated" className="h-[400px]">
                    <div className="mb-4">
                      <h4 className="text-display-sm text-text">
                        {regionalView === 'estado' ? 'Top 10 Estados' : 
                         regionalView === 'regiao' ? 'Por Região' : 'Estados da Amazônia Legal'}
                      </h4>
                      <p className="text-body-sm text-text-secondary">Área em hectares</p>
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                      <BarChart 
                        data={regionalChartData} 
                        layout="vertical" 
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(v) => `${Math.round(v / 1_000_000)}M`} />
                        <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={tooltipHaFormatter} />
                        <Bar 
                          dataKey="value" 
                          fill={CAMADAS.find(c => c.id === selectedLayer)?.cor ?? COLORS.verdeCadastro}
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Map */}
                  <Card variant="elevated">
                    <div className="mb-4">
                      <h4 className="text-display-sm text-text">Mapa</h4>
                      <p className="text-body-sm text-text-secondary">Distribuição por estado</p>
                    </div>
                    <div className="h-[450px]">
                      <ErrorBoundary fallback={<div className="h-full flex items-center justify-center text-text-muted">Erro ao carregar mapa</div>}>
                        <Suspense fallback={<Skeleton variant="map" className="h-full" />}>
                          <BrasilMap
                            estados={data.estados}
                            selectedUf={selectedStateUf}
                            onStateClick={setSelectedStateUf}
                            layerId={selectedLayer ?? 'sigef'}
                          />
                        </Suspense>
                      </ErrorBoundary>
                    </div>
                    {/* Legenda do Mapa */}
                    <div className="mt-4">
                      <MapLegend layerId={selectedLayer ?? 'sigef'} mode="hectares" />
                    </div>
                  </Card>
                </div>

                {/* Selected State Details */}
                {selectedStateUf && (
                  <Card variant="bordered" className="mt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-display-sm text-text">{UF_NAMES[selectedStateUf] ?? selectedStateUf}</h4>
                        <p className="text-body-sm text-text-secondary">Dados do estado selecionado</p>
                      </div>
                      <button 
                        onClick={() => setSelectedStateUf(null)}
                        className="text-text-muted hover:text-text"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(() => {
                        const layerData = getLayerEstadoData(selectedLayer, selectedStateUf);
                        if (!layerData) return null;
                        return (
                          <>
                            <div>
                              <div className="text-body-sm text-text-muted">Área</div>
                              <div className="text-display-sm text-text font-semibold">{formatHa(layerData.area_ha)}</div>
                            </div>
                            {'quantidade' in layerData && layerData.quantidade && (
                              <div>
                                <div className="text-body-sm text-text-muted">Quantidade</div>
                                <div className="text-display-sm text-text font-semibold">{formatNum(layerData.quantidade)}</div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* SIGEF/SNCI Tab */}
            {activeTab === 'sigef-snci' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <Card variant="bordered" className="border-primary/30">
                    <div className="text-body-sm text-text-muted uppercase tracking-wider">SIGEF - Brasil</div>
                    <div className="mt-2 text-display-sm text-text">{formatHa(data.brasil.sigef.area_ha)}</div>
                    <div className="mt-1 text-body-sm text-text-secondary">{formatNum(data.brasil.sigef.num_parcelas)} parcelas</div>
                  </Card>
                  <Card variant="bordered" className="border-secondary/30">
                    <div className="text-body-sm text-text-muted uppercase tracking-wider">SNCI - Brasil</div>
                    <div className="mt-2 text-display-sm text-text">{formatHa(data.brasil.snci.area_ha)}</div>
                    <div className="mt-1 text-body-sm text-text-secondary">{formatNum(data.brasil.snci.num_poligonos)} polígonos</div>
                  </Card>
                  <Card variant="bordered">
                    <div className="text-body-sm text-text-muted uppercase tracking-wider">Tamanho Médio SIGEF</div>
                    <div className="mt-2 text-display-sm text-text">
                      {data.brasil.indicadores?.tamanho_medio_sigef_ha ? formatHa(data.brasil.indicadores.tamanho_medio_sigef_ha) : 'A definir'}
                    </div>
                    <div className="mt-1 text-body-sm text-text-secondary">por parcela</div>
                  </Card>
                  <Card variant="bordered">
                    <div className="text-body-sm text-text-muted uppercase tracking-wider">Concentração SIGEF</div>
                    <div className="mt-2 text-display-sm text-text">
                      {data.brasil.indicadores?.indice_concentracao_sigef?.toFixed(2) ?? 'A definir'}
                    </div>
                    <div className="mt-1 text-body-sm text-text-secondary">índice (a confirmar iGPP)</div>
                  </Card>
                </div>

                {/* Regions */}
                <div>
                  <h4 className="text-display-sm text-text mb-4">Por Região</h4>
                  <div className="overflow-auto border border-border rounded-lg">
                    <table className="w-full min-w-[700px] text-left">
                      <thead className="bg-bg-alt">
                        <tr>
                          <th className="p-4 border-b border-border text-body-sm text-text-muted">Região</th>
                          <th className="p-4 border-b border-border text-body-sm text-text-muted">SIGEF (ha)</th>
                          <th className="p-4 border-b border-border text-body-sm text-text-muted">SIGEF (parcelas)</th>
                          <th className="p-4 border-b border-border text-body-sm text-text-muted">SNCI (ha)</th>
                          <th className="p-4 border-b border-border text-body-sm text-text-muted">SNCI (polígonos)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.regioes_oficiais.map((r) => (
                          <tr key={r.nome} className="hover:bg-bg-alt/60">
                            <td className="p-4 border-b border-border font-medium text-text">{r.nome}</td>
                            <td className="p-4 border-b border-border text-text-secondary">{formatHa(r.sigef.area_ha)}</td>
                            <td className="p-4 border-b border-border text-text-secondary">{formatNum(r.sigef.num_parcelas)}</td>
                            <td className="p-4 border-b border-border text-text-secondary">{formatHa(r.snci.area_ha)}</td>
                            <td className="p-4 border-b border-border text-text-secondary">{formatNum(r.snci.num_poligonos)}</td>
                          </tr>
                        ))}
                        <tr className="bg-primary/5 font-semibold">
                          <td className="p-4 border-b border-border text-text">Amazônia Legal</td>
                          <td className="p-4 border-b border-border text-text">{formatHa(data.amazonia_legal.sigef.area_ha)}</td>
                          <td className="p-4 border-b border-border text-text">{formatNum(data.amazonia_legal.sigef.num_parcelas)}</td>
                          <td className="p-4 border-b border-border text-text">{formatHa(data.amazonia_legal.snci.area_ha)}</td>
                          <td className="p-4 border-b border-border text-text">{formatNum(data.amazonia_legal.snci.num_poligonos)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* CAR Tab */}
            {activeTab === 'car' && (
              <div className="space-y-8">
                <Card variant="ghost" className="border border-secondary/25 bg-secondary/5">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-display-sm text-text">Nota sobre o CAR</h3>
                      <p className="text-body-md text-text-secondary">
                        Não é possível ter análise de número de parcelas para o CAR, por motivos técnicos. 
                        Os dados de área são apresentados sem sobreposições entre polígonos do CAR.
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <Card variant="bordered" className="border-primary/30">
                    <div className="text-body-sm text-text-muted uppercase tracking-wider">Área Cadastrada</div>
                    <div className="mt-2 text-display-sm text-text">{formatHa(data.brasil.car.area_cadastrada_ha)}</div>
                    <div className="mt-1 text-body-sm text-text-secondary">{formatNum(data.brasil.car.num_imoveis)} imóveis</div>
                  </Card>
                  <Card variant="bordered">
                    <div className="text-body-sm text-text-muted uppercase tracking-wider">Área sem Sobreposição</div>
                    <div className="mt-2 text-display-sm text-text">
                      {data.brasil.car.area_sem_sobreposicao_ha ? formatHa(data.brasil.car.area_sem_sobreposicao_ha) : 'Dado iGPP'}
                    </div>
                    <div className="mt-1 text-body-sm text-text-secondary">entre polígonos CAR</div>
                  </Card>
                  <Card variant="bordered">
                    <div className="text-body-sm text-text-muted uppercase tracking-wider">Área com Sobreposição</div>
                    <div className="mt-2 text-display-sm text-text">
                      {data.brasil.car.area_com_sobreposicao_ha ? formatHa(data.brasil.car.area_com_sobreposicao_ha) : 'A confirmar iGPP'}
                    </div>
                    <div className="mt-1 text-body-sm text-text-secondary">a confirmar disponibilidade</div>
                  </Card>
                  <Card variant="bordered">
                    <div className="text-body-sm text-text-muted uppercase tracking-wider">% Sobreposição</div>
                    <div className="mt-2 text-display-sm text-text">{formatPct(data.brasil.car.perc_sobreposicao ?? 0)}</div>
                    <div className="mt-1 text-body-sm text-text-secondary">densidade: {data.brasil.car.ind_densidade_sobreposicao?.toFixed(2) ?? '—'}</div>
                  </Card>
                </div>

                {/* CAR by Region */}
                <div>
                  <h4 className="text-display-sm text-text mb-4">CAR por Região</h4>
                  <div className="overflow-auto border border-border rounded-lg">
                    <table className="w-full min-w-[600px] text-left">
                      <thead className="bg-bg-alt">
                        <tr>
                          <th className="p-4 border-b border-border text-body-sm text-text-muted">Região</th>
                          <th className="p-4 border-b border-border text-body-sm text-text-muted">Área Cadastrada (ha)</th>
                          <th className="p-4 border-b border-border text-body-sm text-text-muted">Área sem Sobreposição (ha)</th>
                          <th className="p-4 border-b border-border text-body-sm text-text-muted">Imóveis</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.regioes_oficiais.map((r) => (
                          <tr key={r.nome} className="hover:bg-bg-alt/60">
                            <td className="p-4 border-b border-border font-medium text-text">{r.nome}</td>
                            <td className="p-4 border-b border-border text-text-secondary">{formatHa(r.car.area_cadastrada_ha)}</td>
                            <td className="p-4 border-b border-border text-text-secondary">
                              {r.car.area_sem_sobreposicao_ha ? formatHa(r.car.area_sem_sobreposicao_ha) : '—'}
                            </td>
                            <td className="p-4 border-b border-border text-text-secondary">{formatNum(r.car.num_imoveis)}</td>
                          </tr>
                        ))}
                        <tr className="bg-primary/5 font-semibold">
                          <td className="p-4 border-b border-border text-text">Amazônia Legal</td>
                          <td className="p-4 border-b border-border text-text">{formatHa(data.amazonia_legal.car.area_cadastrada_ha)}</td>
                          <td className="p-4 border-b border-border text-text">
                            {data.amazonia_legal.car.area_sem_sobreposicao_ha ? formatHa(data.amazonia_legal.car.area_sem_sobreposicao_ha) : '—'}
                          </td>
                          <td className="p-4 border-b border-border text-text">{formatNum(data.amazonia_legal.car.num_imoveis)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Outras Camadas Tab */}
            {activeTab === 'outras-camadas' && (
              <div className="space-y-8">
                {/* Áreas Protegidas */}
                <div>
                  <h4 className="text-display-sm text-text mb-4">Áreas Protegidas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card variant="bordered" className="border-l-4" style={{ borderLeftColor: '#8B4513' }}>
                      <div className="text-body-sm text-text-muted uppercase tracking-wider">TIs Homologadas</div>
                      <div className="mt-2 text-display-sm text-text">{formatHa(data.brasil.areas_protegidas.ti_homologada.area_ha)}</div>
                      <div className="mt-1 text-body-sm text-text-secondary">{formatNum(data.brasil.areas_protegidas.ti_homologada.quantidade ?? 0)} polígonos</div>
                    </Card>
                    <Card variant="bordered" className="border-l-4" style={{ borderLeftColor: '#1B5E20' }}>
                      <div className="text-body-sm text-text-muted uppercase tracking-wider">UCs Proteção Integral</div>
                      <div className="mt-2 text-display-sm text-text">{formatHa(data.brasil.areas_protegidas.uc_protecao_integral.area_ha)}</div>
                      <div className="mt-1 text-body-sm text-text-secondary">{formatNum(data.brasil.areas_protegidas.uc_protecao_integral.quantidade ?? 0)} polígonos</div>
                    </Card>
                    <Card variant="bordered">
                      <div className="text-body-sm text-text-muted uppercase tracking-wider">TIs Não Homologadas</div>
                      <div className="mt-2 text-display-sm text-text">{formatHa(data.brasil.areas_protegidas.ti_nao_homologada?.area_ha ?? 0)}</div>
                      <div className="mt-1 text-body-sm text-text-secondary">{formatNum(data.brasil.areas_protegidas.ti_nao_homologada?.quantidade ?? 0)} polígonos</div>
                    </Card>
                    <Card variant="bordered">
                      <div className="text-body-sm text-text-muted uppercase tracking-wider">UCs Uso Sustentável</div>
                      <div className="mt-2 text-display-sm text-text">{formatHa(data.brasil.areas_protegidas.uc_uso_sustentavel?.area_ha ?? 0)}</div>
                      <div className="mt-1 text-body-sm text-text-secondary">{formatNum(data.brasil.areas_protegidas.uc_uso_sustentavel?.quantidade ?? 0)} polígonos</div>
                    </Card>
                  </div>
                </div>

                {/* Terras Públicas */}
                <div>
                  <h4 className="text-display-sm text-text mb-4">Terras Públicas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card variant="bordered" className="border-l-4" style={{ borderLeftColor: '#6B8E23' }}>
                      <div className="text-body-sm text-text-muted uppercase tracking-wider">Glebas Públicas</div>
                      <div className="mt-2 text-display-sm text-text">{formatHa(data.brasil.terras_publicas.glebas_publicas.area_ha)}</div>
                      <div className="mt-1 text-body-sm text-text-secondary">{formatNum(data.brasil.terras_publicas.glebas_publicas.quantidade ?? 0)} polígonos</div>
                      <Tag variant="subtle" className="mt-2 text-xs">A confirmar com iGPP</Tag>
                    </Card>
                    <Card variant="bordered" className="border-l-4" style={{ borderLeftColor: '#228B22' }}>
                      <div className="text-body-sm text-text-muted uppercase tracking-wider">FPND</div>
                      <div className="mt-2 text-display-sm text-text">{formatHa(data.brasil.terras_publicas.fpnd.area_ha)}</div>
                      <div className="mt-1 text-body-sm text-text-secondary">{formatNum(data.brasil.terras_publicas.fpnd.quantidade ?? 0)} polígonos</div>
                    </Card>
                    <Card variant="bordered">
                      <div className="text-body-sm text-text-muted uppercase tracking-wider">Assentamentos A</div>
                      <div className="mt-2 text-display-sm text-text">{formatHa(data.brasil.terras_publicas.assentamentos_a?.area_ha ?? 0)}</div>
                      <div className="mt-1 text-body-sm text-text-secondary">{formatNum(data.brasil.terras_publicas.assentamentos_a?.quantidade ?? 0)} polígonos</div>
                    </Card>
                    <Card variant="bordered">
                      <div className="text-body-sm text-text-muted uppercase tracking-wider">Assentamentos B</div>
                      <div className="mt-2 text-display-sm text-text">{formatHa(data.brasil.terras_publicas.assentamentos_b?.area_ha ?? 0)}</div>
                      <div className="mt-1 text-body-sm text-text-secondary">{formatNum(data.brasil.terras_publicas.assentamentos_b?.quantidade ?? 0)} polígonos</div>
                    </Card>
                  </div>
                </div>

                {/* Outras Áreas */}
                <div>
                  <h4 className="text-display-sm text-text mb-4">Outras Áreas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card variant="bordered" className="border-l-4" style={{ borderLeftColor: '#808080' }}>
                      <div className="text-body-sm text-text-muted uppercase tracking-wider">Malha Urbana</div>
                      <div className="mt-2 text-display-sm text-text">{formatHa(data.brasil.outras_areas.urbanas.area_ha)}</div>
                      <div className="mt-1 text-body-sm text-text-secondary">apenas área</div>
                    </Card>
                    <Card variant="bordered" className="border-l-4" style={{ borderLeftColor: '#4A4A4A' }}>
                      <div className="text-body-sm text-text-muted uppercase tracking-wider">Áreas Militares</div>
                      <div className="mt-2 text-display-sm text-text">{formatHa(data.brasil.outras_areas.militares.area_ha)}</div>
                      <div className="mt-1 text-body-sm text-text-secondary">{formatNum(data.brasil.outras_areas.militares.quantidade ?? 0)} polígonos</div>
                      <Tag variant="subtle" className="mt-2 text-xs">A confirmar SPU</Tag>
                    </Card>
                    <Card variant="bordered">
                      <div className="text-body-sm text-text-muted uppercase tracking-wider">Corpos d'Água</div>
                      <div className="mt-2 text-display-sm text-text-muted">Conforme base iGPP</div>
                      <Tag variant="subtle" className="mt-2 text-xs">Placeholder</Tag>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Operações Compostas (Sobreposições) Tab */}
            {activeTab === 'sobreposicoes' && (
              <div className="space-y-8">
                <Card variant="ghost" className="border border-primary/25 bg-primary/5">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-display-sm text-text">Operações Compostas</h3>
                      <p className="text-body-md text-text-secondary">
                        Valores calculados a partir de operações de computação geoespacial entre bases. 
                        Apenas valores em hectares. Dados de sobreposição provêm de análise espacial do iGPP.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Overlaps in hectares */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <Card variant="bordered" className="border-primary/30">
                    <div className="text-body-sm text-text-muted uppercase tracking-wider">SIGEF × CAR</div>
                    <div className="mt-2 text-display-sm text-text">
                      {data.brasil.sobreposicoes_ha?.sigef_x_car_ha ? formatHa(data.brasil.sobreposicoes_ha.sigef_x_car_ha) : 'Dado iGPP'}
                    </div>
                    <div className="mt-1 text-body-sm text-text-secondary">Brasil</div>
                  </Card>
                  <Card variant="bordered">
                    <div className="text-body-sm text-text-muted uppercase tracking-wider">CAR × Terras Indígenas</div>
                    <div className="mt-2 text-display-sm text-text">
                      {data.brasil.sobreposicoes_ha?.car_x_ti_ha ? formatHa(data.brasil.sobreposicoes_ha.car_x_ti_ha) : 'Dado iGPP'}
                    </div>
                    <div className="mt-1 text-body-sm text-text-secondary">Brasil</div>
                  </Card>
                  <Card variant="bordered">
                    <div className="text-body-sm text-text-muted uppercase tracking-wider">CAR × FPND</div>
                    <div className="mt-2 text-display-sm text-text">
                      {data.brasil.sobreposicoes_ha?.car_x_fpnd_ha ? formatHa(data.brasil.sobreposicoes_ha.car_x_fpnd_ha) : 'Dado iGPP'}
                    </div>
                    <div className="mt-1 text-body-sm text-text-secondary">Brasil</div>
                  </Card>
                  <Card variant="bordered">
                    <div className="text-body-sm text-text-muted uppercase tracking-wider">CAR × UCs</div>
                    <div className="mt-2 text-display-sm text-text">
                      {data.brasil.sobreposicoes_ha?.car_x_uc_ha ? formatHa(data.brasil.sobreposicoes_ha.car_x_uc_ha) : 'Dado iGPP'}
                    </div>
                    <div className="mt-1 text-body-sm text-text-secondary">Brasil</div>
                  </Card>
                  <Card variant="bordered">
                    <div className="text-body-sm text-text-muted uppercase tracking-wider">CAR × Glebas Públicas</div>
                    <div className="mt-2 text-display-sm text-text">
                      {data.brasil.sobreposicoes_ha?.car_x_glebas_ha ? formatHa(data.brasil.sobreposicoes_ha.car_x_glebas_ha) : 'Dado iGPP'}
                    </div>
                    <div className="mt-1 text-body-sm text-text-secondary">Brasil</div>
                  </Card>
                </div>

                {/* Chart */}
                {sobreposicoesHaData.length > 0 && (
                  <Card variant="elevated" className="h-[400px]">
                    <div className="mb-4">
                      <h4 className="text-display-sm text-text">Sobreposições por Tipo</h4>
                      <p className="text-body-sm text-text-secondary">Valores em hectares - Brasil</p>
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={sobreposicoesHaData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(v) => `${Math.round(v / 1_000_000)}M`} />
                        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={tooltipHaFormatter} />
                        <Bar dataKey="value" fill={COLORS.terraAmbar} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                )}
              </div>
            )}

            {/* Indicadores Tab */}
            {activeTab === 'indicadores' && (
              <div className="space-y-8">
                <Card variant="ghost" className="border border-secondary/25 bg-secondary/5">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-display-sm text-text">Indicadores Adicionais</h3>
                      <p className="text-body-md text-text-secondary">
                        Indicadores derivados das bases de dados. Alguns valores estão pendentes de definição/cálculo pelo iGPP.
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card variant="bordered">
                    <div className="text-body-sm text-text-muted uppercase tracking-wider">Tamanho Médio SIGEF</div>
                    <div className="mt-2 text-display-sm text-text">
                      {data.brasil.indicadores?.tamanho_medio_sigef_ha ? formatHa(data.brasil.indicadores.tamanho_medio_sigef_ha) : 'A definir'}
                    </div>
                    <div className="mt-1 text-body-sm text-text-secondary">por parcela - Brasil</div>
                  </Card>
                  <Card variant="bordered">
                    <div className="text-body-sm text-text-muted uppercase tracking-wider">Tamanho Médio SNCI</div>
                    <div className="mt-2 text-display-sm text-text">
                      {data.brasil.indicadores?.tamanho_medio_snci_ha ? formatHa(data.brasil.indicadores.tamanho_medio_snci_ha) : 'A definir'}
                    </div>
                    <div className="mt-1 text-body-sm text-text-secondary">por polígono - Brasil</div>
                  </Card>
                  <Card variant="bordered">
                    <div className="text-body-sm text-text-muted uppercase tracking-wider">Índice Concentração SIGEF</div>
                    <div className="mt-2 text-display-sm text-text">
                      {data.brasil.indicadores?.indice_concentracao_sigef?.toFixed(2) ?? 'A definir iGPP'}
                    </div>
                    <div className="mt-1 text-body-sm text-text-secondary">nível Brasil</div>
                  </Card>
                </div>

                {/* Por Região */}
                <div>
                  <h4 className="text-display-sm text-text mb-4">Indicadores por Região</h4>
                  <div className="overflow-auto border border-border rounded-lg">
                    <table className="w-full min-w-[600px] text-left">
                      <thead className="bg-bg-alt">
                        <tr>
                          <th className="p-4 border-b border-border text-body-sm text-text-muted">Região</th>
                          <th className="p-4 border-b border-border text-body-sm text-text-muted">Tam. Médio SIGEF (ha)</th>
                          <th className="p-4 border-b border-border text-body-sm text-text-muted">Tam. Médio SNCI (ha)</th>
                          <th className="p-4 border-b border-border text-body-sm text-text-muted">Índ. Concentração</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.regioes_oficiais.map((r) => (
                          <tr key={r.nome} className="hover:bg-bg-alt/60">
                            <td className="p-4 border-b border-border font-medium text-text">{r.nome}</td>
                            <td className="p-4 border-b border-border text-text-secondary">
                              {r.indicadores?.tamanho_medio_sigef_ha ? formatHa(r.indicadores.tamanho_medio_sigef_ha) : '—'}
                            </td>
                            <td className="p-4 border-b border-border text-text-secondary">
                              {r.indicadores?.tamanho_medio_snci_ha ? formatHa(r.indicadores.tamanho_medio_snci_ha) : '—'}
                            </td>
                            <td className="p-4 border-b border-border text-text-secondary">
                              {r.indicadores?.indice_concentracao_sigef?.toFixed(2) ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <Disclaimer 
            text={data.metadata.disclaimer}
            className="mt-8"
          />
        </Container>
      </section>
    </main>
  );
};

export default Dashboard;
