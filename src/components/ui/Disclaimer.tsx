import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface DisclaimerProps {
  /** Texto do disclaimer (do iGPP) */
  text?: string;
  /** Título do disclaimer */
  title?: string;
  /** Variante de estilo */
  variant?: 'inline' | 'modal' | 'banner';
  /** Se deve mostrar link para metodologia */
  showMethodologyLink?: boolean;
  className?: string;
}

/**
 * Componente de Disclaimer sobre os dados
 * Texto a ser fornecido pelo iGPP com base na nota técnica
 */
const Disclaimer: React.FC<DisclaimerProps> = ({
  text = 'Os dados desta plataforma são de responsabilidade do iGPP/ESALQ e seguem a metodologia descrita na nota técnica. Os valores apresentados são estimativas baseadas em análises geoespaciais e podem divergir de outras fontes oficiais. Para mais informações sobre a metodologia utilizada, consulte a seção Metodologia.',
  title = 'Sobre os Dados',
  variant = 'inline',
  showMethodologyLink = true,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (variant === 'modal') {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-body-sm text-primary hover:text-primary/80 underline transition-colors"
        >
          {title}
        </button>

        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setIsModalOpen(false)}
          >
            <div 
              className="bg-white rounded-xl max-w-lg mx-4 p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-display-sm text-text">{title}</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-text-muted hover:text-text transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-body-md text-text-secondary leading-relaxed">
                {text}
              </p>
              {showMethodologyLink && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Link
                    to="/metodologia"
                    className="inline-flex items-center gap-2 text-body-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Ver Metodologia
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-secondary/5 border border-secondary/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-body-md font-semibold text-text mb-1">{title}</h4>
            <p className="text-body-sm text-text-secondary">{text}</p>
            {showMethodologyLink && (
              <Link
                to="/metodologia"
                className="inline-flex items-center gap-1 mt-2 text-body-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Saiba mais
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Variante inline (default)
  return (
    <div className={`p-4 bg-bg-alt rounded-lg border border-border ${className}`}>
      <h4 className="text-body-md font-semibold text-text mb-2">{title}</h4>
      <p className="text-body-sm text-text-secondary">
        {text}
      </p>
      {showMethodologyLink && (
        <Link
          to="/metodologia"
          className="inline-flex items-center gap-1 mt-3 text-body-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Consultar Metodologia
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
};

export default Disclaimer;
