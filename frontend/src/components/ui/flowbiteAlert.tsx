import React from 'react';
import { CheckCircle, Info, XCircle, AlertTriangle } from 'lucide-react';

const variants = {
  info: {
    icon: Info,
    styles: 'text-blue-800 border-blue-300 bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800'
  },
  success: {
    icon: CheckCircle,
    styles: 'text-green-800 border-green-300 bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800'
  },
  warning: {
    icon: AlertTriangle,
    styles: 'text-yellow-800 border-yellow-300 bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 dark:border-yellow-800'
  },
  danger: {
    icon: XCircle,
    styles: 'text-red-800 border-red-300 bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800'
  },
  dark: {
    icon: Info,
    styles: 'text-gray-800 border-gray-300 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
  }
};

interface AlertProps {
  type: keyof typeof variants;
  title?: string;
  children: React.ReactNode;
}

const Alert = ({ type = 'info', title, children }: AlertProps) => {
  const variant = variants[type];
  const Icon = variant.icon;
  
  return (
    <div className={`flex items-center p-4 text-sm border rounded-lg ${variant.styles}`} role="alert">
      <Icon className="shrink-0 inline w-4 h-4 me-3" aria-hidden="true" />
      <span className="sr-only">{type}</span>
      <div>
        {title && <span className="font-medium">{title} </span>}
        {children}
      </div>
    </div>
  );
};

export default Alert;