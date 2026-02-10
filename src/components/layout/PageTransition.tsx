import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * PageTransition Component
 * Adds smooth fadeInUp animation when navigating between pages
 * Similar to the hero section animation
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Quando a rota muda, apenas faz fade in sutil
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      className={`min-h-screen transition-all duration-250 ease-out ${
        isTransitioning
          ? 'opacity-0 translate-y-1'
          : 'opacity-100 translate-y-0'
      }`}
      key={location.pathname}
    >
      {children}
    </div>
  );
};

export default PageTransition;
