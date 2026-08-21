import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`spinner ${size === 'sm' ? 'spinner-sm' : ''} ${className}`}
    />
  );
};
