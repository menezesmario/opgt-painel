import { useReducer, useMemo } from 'react';
import { ESTADOS, getEstadosByRegiao, buildEstadoCqlFilter } from '../data/estados';
import { getBoundsForScope, type LatLngBounds } from '../data/regioes-bounds';

// ─── State ───────────────────────────────────────────────────
export interface GeoFilterState {
  selectedRegiao: string;
  selectedEstado: string;
  selectedBiomas: string[];
  selectedCategoria: string;
  isDrawerOpen: boolean;
  clickedFeature: Record<string, unknown> | null;
}

/** Região padrão na abertura do mapa: primeiro carregamento fica limitado a uma região (mais leve que Brasil inteiro). */
const DEFAULT_REGIAO = 'Sudeste';

const initialState: GeoFilterState = {
  selectedRegiao: DEFAULT_REGIAO,
  selectedEstado: '',
  selectedBiomas: [],
  selectedCategoria: '',
  isDrawerOpen: false,
  clickedFeature: null,
};

// ─── Actions ─────────────────────────────────────────────────
type GeoFilterAction =
  | { type: 'SET_REGIAO'; regiao: string }
  | { type: 'SET_ESTADO'; estado: string }
  | { type: 'APPLY_DRAWER_FILTERS'; biomas: string[]; categoria: string }
  | { type: 'REMOVE_BIOMA'; bioma: string }
  | { type: 'REMOVE_CATEGORIA' }
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'SET_FEATURE'; feature: Record<string, unknown> | null }
  | { type: 'CLEAR_ALL' }
  | { type: 'RESET_TO_BRASIL' };

// ─── Reducer ─────────────────────────────────────────────────
function geoFilterReducer(state: GeoFilterState, action: GeoFilterAction): GeoFilterState {
  switch (action.type) {
    case 'SET_REGIAO':
      return {
        ...state,
        selectedRegiao: action.regiao,
        selectedEstado: '',
      };

    case 'SET_ESTADO': {
      // Inferir região se vazia
      let regiao = state.selectedRegiao;
      if (!regiao && action.estado) {
        const est = ESTADOS.find((e) => e.codigoIBGE === action.estado);
        if (est) regiao = est.regiao;
      }
      return {
        ...state,
        selectedEstado: action.estado,
        selectedRegiao: regiao,
      };
    }

    case 'APPLY_DRAWER_FILTERS':
      return {
        ...state,
        selectedBiomas: action.biomas,
        selectedCategoria: action.categoria,
        isDrawerOpen: false,
      };

    case 'REMOVE_BIOMA':
      return {
        ...state,
        selectedBiomas: state.selectedBiomas.filter((b) => b !== action.bioma),
      };

    case 'REMOVE_CATEGORIA':
      return { ...state, selectedCategoria: '' };

    case 'TOGGLE_DRAWER':
      return { ...state, isDrawerOpen: !state.isDrawerOpen };

    case 'CLOSE_DRAWER':
      return { ...state, isDrawerOpen: false };

    case 'SET_FEATURE':
      return { ...state, clickedFeature: action.feature };

    case 'CLEAR_ALL':
      return { ...initialState };

    case 'RESET_TO_BRASIL':
      return { ...state, selectedRegiao: '', selectedEstado: '' };

    default:
      return state;
  }
}

// ─── Hook ────────────────────────────────────────────────────
export function useGeoFilters() {
  const [state, dispatch] = useReducer(geoFilterReducer, initialState);

  // CQL filter combinando todos os filtros ativos
  const cqlFilter = useMemo((): string | null => {
    const parts: string[] = [];

    if (state.selectedBiomas.length > 0) {
      const list = state.selectedBiomas.map((b) => `'${b}'`).join(',');
      parts.push(`bioma IN (${list})`);
    }

    if (state.selectedCategoria) {
      parts.push(`categoria_fundiaria_v2025 = '${state.selectedCategoria}'`);
    }

    if (state.selectedEstado) {
      const f = buildEstadoCqlFilter([state.selectedEstado]);
      if (f) parts.push(f);
    } else if (state.selectedRegiao) {
      const codigos = getEstadosByRegiao(state.selectedRegiao).map((e) => e.codigoIBGE);
      const f = buildEstadoCqlFilter(codigos);
      if (f) parts.push(f);
    }

    return parts.length > 0 ? parts.join(' AND ') : null;
  }, [state.selectedBiomas, state.selectedCategoria, state.selectedEstado, state.selectedRegiao]);

  // CQL só escopo + biomas (sem categoria) — usado para carregamento gradual por categoria
  const scopeOnlyCql = useMemo((): string | null => {
    const parts: string[] = [];
    if (state.selectedBiomas.length > 0) {
      const list = state.selectedBiomas.map((b) => `'${b}'`).join(',');
      parts.push(`bioma IN (${list})`);
    }
    if (state.selectedEstado) {
      const f = buildEstadoCqlFilter([state.selectedEstado]);
      if (f) parts.push(f);
    } else if (state.selectedRegiao) {
      const codigos = getEstadosByRegiao(state.selectedRegiao).map((e) => e.codigoIBGE);
      const f = buildEstadoCqlFilter(codigos);
      if (f) parts.push(f);
    }
    return parts.length > 0 ? parts.join(' AND ') : null;
  }, [state.selectedBiomas, state.selectedEstado, state.selectedRegiao]);

  /** Quando true, carregar uma categoria por vez (em vez de todas de uma vez). Vale para Brasil ou para escopo (região/estado). */
  const useGradualLoad = !state.selectedCategoria;

  // Contagem de filtros de conteúdo ativos (biomas + categoria)
  const activeFilterCount = state.selectedBiomas.length + (state.selectedCategoria ? 1 : 0);

  // Label do escopo atual
  const scopeLabel = useMemo((): string => {
    if (state.selectedEstado) {
      const est = ESTADOS.find((e) => e.codigoIBGE === state.selectedEstado);
      return est ? `${est.nome} (${est.uf})` : 'Brasil';
    }
    if (state.selectedRegiao) return state.selectedRegiao;
    return 'Brasil';
  }, [state.selectedEstado, state.selectedRegiao]);

  // Sublabel para o summary strip
  const scopeSublabel = useMemo((): string => {
    if (state.selectedEstado) {
      const est = ESTADOS.find((e) => e.codigoIBGE === state.selectedEstado);
      return est ? `${est.regiao} · Malha Fundiária 2025` : 'Malha Fundiária 2025';
    }
    if (state.selectedRegiao) return `Região ${state.selectedRegiao} · Malha Fundiária 2025`;
    return 'Malha Fundiária 2025 · iGPP/OPGT';
  }, [state.selectedEstado, state.selectedRegiao]);

  // Bounding box para flyToBounds
  const bounds = useMemo(
    (): LatLngBounds | null => getBoundsForScope(state.selectedRegiao, state.selectedEstado),
    [state.selectedRegiao, state.selectedEstado]
  );

  const hasContentFilters = state.selectedBiomas.length > 0 || !!state.selectedCategoria;
  const hasScope = !!state.selectedRegiao || !!state.selectedEstado;

  return {
    state,
    dispatch,
    cqlFilter,
    scopeOnlyCql,
    useGradualLoad,
    activeFilterCount,
    scopeLabel,
    scopeSublabel,
    bounds,
    hasContentFilters,
    hasScope,
  };
}
