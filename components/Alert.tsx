
import React from 'react';
import { InformationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon as SolidXCircleIcon } from '@heroicons/react/24/solid'; 
import { XMarkIcon } from '@heroicons/react/24/outline'; 

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  type: AlertType;
  message: string | React.ReactNode; 
  title?: string;
  onClose?: () => void;
  className?: string; 
}

const Alert: React.FC<AlertProps> = ({ type, message, title, onClose, className = '' }) => {
  const IconComponent = { 
    info: InformationCircleIcon,
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    error: SolidXCircleIcon, 
  }[type];

  const colorClasses = {
    info: 'bg-blue-50 dark:bg-dark_bg_blue_50 border-blue-500 dark:border-dark_border_blue_500 text-blue-700 dark:text-dark_text_blue_700',
    success: 'bg-green-50 dark:bg-dark_bg_green_50 border-green-500 dark:border-dark_border_green_500 text-green-700 dark:text-dark_text_green_700',
    warning: 'bg-yellow-50 dark:bg-dark_bg_yellow_50 border-yellow-500 dark:border-dark_border_yellow_500 text-yellow-700 dark:text-dark_text_yellow_700',
    error: 'bg-red-50 dark:bg-dark_bg_red_50 border-red-500 dark:border-dark_border_red_500 text-red-700 dark:text-dark_text_red_700',
  };
  
  const iconColorClasses = {
    info: 'text-blue-500 dark:text-dark_border_blue_500', // Use border color for icon in dark for consistency
    success: 'text-green-500 dark:text-dark_border_green_500',
    warning: 'text-yellow-500 dark:text-dark_border_yellow_500',
    error: 'text-red-500 dark:text-dark_border_red_500',
  }

  const closeButtonHoverClasses = {
    info: 'hover:bg-blue-100 dark:hover:bg-blue-800/60 focus:ring-blue-400 dark:focus:ring-blue-500',
    success: 'hover:bg-green-100 dark:hover:bg-green-800/60 focus:ring-green-400 dark:focus:ring-green-500',
    warning: 'hover:bg-yellow-100 dark:hover:bg-yellow-800/60 focus:ring-yellow-400 dark:focus:ring-yellow-500',
    error: 'hover:bg-red-100 dark:hover:bg-red-800/60 focus:ring-red-400 dark:focus:ring-red-500',
  }

  return (
    <div 
      className={`p-4 border-l-4 rounded-md shadow-md flex items-start space-x-3 animate-fadeIn ${colorClasses[type]} ${className}`} 
      role="alert"
    >
      <IconComponent className={`h-6 w-6 flex-shrink-0 mt-0.5 ${iconColorClasses[type]}`} aria-hidden="true" />
      <div className="flex-grow">
        {title && <h3 className="text-lg font-medium mb-1">{title}</h3>}
        <div className="text-sm">{message}</div>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg focus:ring-2 inline-flex items-center justify-center h-8 w-8 ${closeButtonHoverClasses[type]}`}
          aria-label="Dismiss"
        >
          <span className="sr-only">Dismiss</span>
          {/* Ensure close button XMarkIcon color contrasts with its hover background in both modes */}
          <XMarkIcon className="h-5 w-5" aria-hidden="true" /> 
        </button>
      )}
    </div>
  );
};

export default Alert;