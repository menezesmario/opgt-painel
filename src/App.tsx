import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PageTransition from './components/layout/PageTransition';
import PageLoader from './components/ui/PageLoader';
import ErrorBoundary from './components/ErrorBoundary';

// Páginas carregadas imediatamente (necessárias no first paint)
import Home from './pages/Home';

// Lazy loading de páginas pesadas (Dashboard e VisualizacaoGeo têm mapas)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const VisualizacaoGeo = lazy(() => import('./pages/VisualizacaoGeo'));

// Lazy loading de páginas de conteúdo (menos prioritárias)
const QuemSomos = lazy(() => import('./pages/QuemSomos'));
const Relatorios = lazy(() => import('./pages/Relatorios'));
const Metodologia = lazy(() => import('./pages/Metodologia'));
const Glossario = lazy(() => import('./pages/Glossario'));
const Imprensa = lazy(() => import('./pages/Imprensa'));
const Contato = lazy(() => import('./pages/Contato'));

/**
 * App Component - OPGT Website
 * Navigation: Home | Quem somos | Visualização Geo | Dashboard | Relatórios | Metodologia | Glossário | Imprensa | Contato
 * 
 * Performance optimizations:
 * - Lazy loading de páginas com React.lazy()
 * - Error Boundary para prevenir crashes
 * - Suspense com PageLoader para feedback visual
 */
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-bg">
        <Header />
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <PageTransition>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sobre" element={<QuemSomos />} />
                <Route path="/visualizacao-geo" element={<VisualizacaoGeo />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/metodologia" element={<Metodologia />} />
                <Route path="/glossario" element={<Glossario />} />
                <Route path="/imprensa" element={<Imprensa />} />
                <Route path="/contato" element={<Contato />} />
              </Routes>
            </PageTransition>
          </Suspense>
        </ErrorBoundary>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
