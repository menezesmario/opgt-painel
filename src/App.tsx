import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PageTransition from './components/layout/PageTransition';
import PageLoader from './components/ui/PageLoader';
import ErrorBoundary from './components/ErrorBoundary';

// Páginas carregadas imediatamente (necessárias no first paint)
import Home from './pages/Home';

// Lazy loading de páginas pesadas (Dashboard inclui mapa WMS)
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Lazy loading de páginas de conteúdo (menos prioritárias)
const QuemSomos = lazy(() => import('./pages/QuemSomos'));
const Relatorios = lazy(() => import('./pages/Relatorios'));
const Metodologia = lazy(() => import('./pages/Metodologia'));
const Glossario = lazy(() => import('./pages/Glossario'));
const Imprensa = lazy(() => import('./pages/Imprensa'));
const Contato = lazy(() => import('./pages/Contato'));
const TesteDesempenhoMapa = lazy(() => import('./pages/TesteDesempenhoMapa'));

/** Layout padrão (Header + conteúdo + Footer). Rota /teste-desempenho-mapa não usa este layout. */
function LayoutPadrao() {
  return (
    <>
      <Header />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </Suspense>
      </ErrorBoundary>
      <Footer />
    </>
  );
}

/**
 * App Component - OPGT Website
 * Navigation: Home | Quem somos | Dashboard | Relatórios | Metodologia | Glossário | Imprensa | Contato
 *
 * A Visualização Geo agora é uma aba do Dashboard (Mapa Fundiário).
 * /visualizacao-geo redireciona para /dashboard para manter links antigos.
 * /teste-desempenho-mapa — só pela URL, sem link no menu; para testar desempenho do WMS.
 */
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-bg">
        <Routes>
          <Route path="/teste-desempenho-mapa" element={<TesteDesempenhoMapa />} />
          <Route element={<LayoutPadrao />}>
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<QuemSomos />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/visualizacao-geo" element={<Navigate to="/dashboard" replace />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/metodologia" element={<Metodologia />} />
            <Route path="/glossario" element={<Glossario />} />
            <Route path="/imprensa" element={<Imprensa />} />
            <Route path="/contato" element={<Contato />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
