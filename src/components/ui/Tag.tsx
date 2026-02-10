import React from 'react';

interface TagProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle';
  size?: 'sm' | 'md';
  className?: string;
}

const Tag: React.FC<TagProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const baseStyles = 'inline-block font-semibold uppercase tracking-wider rounded-sm';

  const variantStyles = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    outline: 'border border-primary text-primary bg-transparent',
    subtle: 'bg-primary/10 text-primary'
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-caption'
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Tag;
