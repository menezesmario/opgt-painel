import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  href?: string;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  href,
  className = '',
  disabled = false,
  icon
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-md
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-medium',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark hover:-translate-y-0.5 hover:shadow-medium',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white',
    ghost: 'text-primary bg-transparent hover:bg-primary/10'
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-body-sm',
    md: 'px-6 py-3 text-body-md',
    lg: 'px-8 py-4 text-body-lg'
  };

  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  const content = (
    <>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </>
  );

  if (href) {
    if (href.startsWith('http')) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {content}
        </a>
      );
    }
    return (
      <Link to={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
};

export default Button;
