import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer component - OPGT branded
 * With brand colors and proper structure
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections: Array<{
    title: string;
    links: Array<{ label: string; href: string; external?: boolean }>;
  }> = [
    {
      title: 'Institucional',
      links: [
        { label: 'Quem somos', href: '/sobre' },
        { label: 'Metodologia', href: '/metodologia' },
        { label: 'Glossário', href: '/glossario' },
        { label: 'Imprensa', href: '/imprensa' }
      ]
    },
    {
      title: 'Recursos',
      links: [
        { label: 'Dashboard de Dados', href: '/dashboard' },
        { label: 'Relatórios', href: '/relatorios' },
        { label: 'Contato', href: '/contato' }
      ]
    },
    {
      title: 'Parceiros',
      links: [
        { label: 'Imazon', href: 'https://imazon.org.br', external: true },
        { label: 'Observatório do Código Florestal', href: '#', external: true },
        { label: 'IGPP', href: '#', external: true }
      ]
    }
  ];

  return (
    <footer className="bg-bg-dark text-text-light mt-auto">
      {/* Main Footer Content */}
      <div className="container-opgt py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <img
                src="/logo_opgt.svg"
                alt="OPGT"
                className="h-10 w-auto brightness-0 invert opacity-90"
              />
            </Link>
            <p className="text-body-sm text-text-light/70 leading-relaxed">
              Transparência, dados públicos e monitoramento qualificado da governança fundiária no Brasil.
            </p>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-body-md font-semibold text-text-light mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body-sm text-text-light/60 hover:text-terra transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-body-sm text-text-light/60 hover:text-terra transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-text-light/10">
        <div className="container-opgt py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-body-sm text-text-light/50">
              © {currentYear} OPGT. Todos os direitos reservados.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-body-sm text-text-light/50">
              <span className="flex items-center gap-2">
                Coordenação:
                <a
                  href="#"
                  className="text-text-light/70 hover:text-terra transition-colors font-medium"
                >
                  IGT
                </a>
              </span>
              <span className="hidden md:inline text-text-light/30">|</span>
              <span className="flex items-center gap-2">
                Financiamento:
                <a
                  href="https://landesa.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-light/70 hover:text-terra transition-colors font-medium"
                >
                  Land Facility
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
