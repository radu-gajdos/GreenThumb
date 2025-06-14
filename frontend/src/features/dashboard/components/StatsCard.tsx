import React from 'react';
import { LucideIcon, MousePointerClick } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'indigo';
  onClick?: () => void;
  actionIndicator?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'blue',
  onClick,
  actionIndicator,
}) => {
  const colorClasses = {
    blue: {
      background: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-200',
      icon: 'bg-blue-200 text-blue-700',
      text: 'text-blue-900',
      trend: 'text-blue-600',
    },
    green: {
      background: 'bg-gradient-to-br from-green-50 to-green-100',
      border: 'border-green-200',
      icon: 'bg-green-200 text-green-700',
      text: 'text-green-900',
      trend: 'text-green-600',
    },
    amber: {
      background: 'bg-gradient-to-br from-amber-50 to-amber-100',
      border: 'border-amber-200',
      icon: 'bg-amber-200 text-amber-700',
      text: 'text-amber-900',
      trend: 'text-amber-600',
    },
    red: {
      background: 'bg-gradient-to-br from-red-50 to-red-100',
      border: 'border-red-200',
      icon: 'bg-red-200 text-red-700',
      text: 'text-red-900',
      trend: 'text-red-600',
    },
    purple: {
      background: 'bg-gradient-to-br from-purple-50 to-purple-100',
      border: 'border-purple-200',
      icon: 'bg-purple-200 text-purple-700',
      text: 'text-purple-900',
      trend: 'text-purple-600',
    },
    indigo: {
      background: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      border: 'border-indigo-200',
      icon: 'bg-indigo-200 text-indigo-700',
      text: 'text-indigo-900',
      trend: 'text-indigo-600',
    },
  };

  const classes = colorClasses[color];

  return (
    <div
      className={`
        ${classes.background} ${classes.border} border rounded-xl p-6 
        transition-all duration-200 hover:shadow-md
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        relative
      `}
      onClick={onClick}
    >
      {actionIndicator && (
        <MousePointerClick className="w-4 h-4 absolute top-3 right-3 text-gray-400" />
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-2 rounded-lg ${classes.icon}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className={`text-sm font-medium ${classes.text}`}>{title}</h3>
          </div>

          <div className="space-y-1">
            <p className={`text-2xl font-bold ${classes.text}`}>
              {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(2) : value}
            </p>

            {description && (
              <p className={`text-sm opacity-75 ${classes.text}`}>{description}</p>
            )}
          </div>
        </div>

        {trend && (
          <div className={`text-right ${classes.trend}`}>
            <div className="flex items-center space-x-1">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <svg
                className={`w-4 h-4 ${
                  trend.isPositive ? 'text-green-600 rotate-0' : 'text-red-600 rotate-180'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 14l5-5 5 5"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;