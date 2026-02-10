import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** Callback quando erro é capturado */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary para capturar erros em componentes filhos
 * Previne que um erro em um componente quebre a aplicação inteira
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log do erro para debugging
    console.error('ErrorBoundary capturou erro:', error);
    console.error('Informações do componente:', errorInfo.componentStack);
    
    // Callback opcional para logging externo
    this.props.onError?.(error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback customizado
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão
      return (
        <div className="p-6 border border-red-200 rounded-lg bg-red-50 m-4">
          <div className="flex items-start gap-4">
            {/* Ícone de erro */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg 
                className="w-5 h-5 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>

            {/* Conteúdo */}
            <div className="flex-1">
              <h3 className="text-red-800 text-lg font-semibold mb-2">
                Erro ao carregar componente
              </h3>
              <p className="text-red-600 text-sm mb-4">
                {this.state.error?.message || 'Ocorreu um erro inesperado.'}
              </p>
              
              {/* Botões de ação */}
              <div className="flex gap-3">
                <button 
                  onClick={this.handleRetry}
                  className="px-4 py-2 bg-white text-red-700 border border-red-300 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  Tentar novamente
                </button>
                <button 
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Recarregar página
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
