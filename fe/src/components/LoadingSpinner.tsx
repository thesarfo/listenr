import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'sm', className = '' }) => {
  const sizes = {
    xs: 'size-3',
    sm: 'size-5',
    md: 'size-8',
    lg: 'size-12',
  };

  return (
    <svg
      className={`hi-fi-spinner text-primary ${sizes[size]} ${className}`}
      viewBox="0 0 50 50"
      aria-hidden="true"
    >
      <circle
        className="path"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default LoadingSpinner;
