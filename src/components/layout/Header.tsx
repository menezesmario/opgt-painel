import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Header component - OPGT branded navigation
 * With scroll effect and mobile menu
 */
const Header: React.FC = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Início', href: '/' },
    { label: 'Quem somos', href: '/sobre' },
    { label: 'Visualização Geo', href: '/visualizacao-geo' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Relatórios', href: '/relatorios' },
    { label: 'Metodologia', href: '/metodologia' },
    { label: 'Glossário', href: '/glossario' },
    { label: 'Imprensa', href: '/imprensa' },
    { label: 'Contato', href: '/contato' }
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-soft'
            : 'bg-white'
          }
        `}
      >
        <div className="container-opgt py-2">
          <div className="flex items-center justify-between h-[4.5rem]">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/logo_opgt.svg"
                alt="OPGT - Observatório de Políticas de Governança de Terras"
                className="h-16 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    px-4 py-2 rounded-md text-body-sm font-medium
                    transition-all duration-200
                    ${isActive(item.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-text-secondary hover:text-primary hover:bg-primary/5'
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-md text-text hover:bg-bg-alt transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`
            xl:hidden overflow-hidden transition-all duration-300
            ${isMobileMenuOpen ? 'max-h-[500px] border-t border-border' : 'max-h-0'}
          `}
        >
          <nav className="container-opgt py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  block px-4 py-3 rounded-md text-body-md font-medium
                  transition-all duration-200
                  ${isActive(item.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-text-secondary hover:text-primary hover:bg-primary/5'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[4.5rem]" />
    </>
  );
};

export default Header;
