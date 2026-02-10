import React, { memo } from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Card component with memoization to prevent unnecessary re-renders
 */
const Card: React.FC<CardProps> = memo(({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  onClick,
  className = '',
  style
}) => {
  const baseStyles = 'rounded-lg transition-all duration-300';

  const variantStyles = {
    default: 'bg-white border border-border',
    elevated: 'bg-white shadow-card',
    bordered: 'bg-transparent border-2 border-border',
    ghost: 'bg-bg-alt'
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverStyles = hoverable || onClick
    ? 'cursor-pointer hover:shadow-card-hover hover:border-primary hover:-translate-y-1'
    : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
