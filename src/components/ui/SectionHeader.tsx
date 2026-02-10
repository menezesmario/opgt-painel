import React from 'react';
import Tag from './Tag';

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  label,
  title,
  description,
  centered = false,
  className = ''
}) => {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''} ${className}`}>
      {label && (
        <div className={`mb-4 ${centered ? 'flex justify-center' : ''}`}>
          <Tag variant="subtle">{label}</Tag>
        </div>
      )}

      <h2 className="text-display-lg text-text mb-4">
        {title}
      </h2>

      {description && (
        <p className={`text-body-lg text-text-secondary leading-relaxed ${centered ? 'mx-auto' : ''} max-w-3xl`}>
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
