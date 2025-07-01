
import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid'; // Using a solid icon for consistency

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string; // Tailwind color class e.g., 'text-primary'
  text?: string;
  className?: string; // Allow custom classes for positioning etc.
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'text-primary', 
  text,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <ArrowPathIcon className={`animate-spin ${sizeClasses[size]} ${color}`} />
      {text && <p className={`mt-3 text-sm font-medium ${color}`}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
