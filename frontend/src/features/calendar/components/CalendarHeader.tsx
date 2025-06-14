import React from 'react';
import { CalendarStats } from '../types/calendar';
import { Calendar, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface CalendarHeaderProps {
  stats: CalendarStats;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Astăzi',
      value: stats.todayEvents,
      description: 'evenimente programate',
      icon: Calendar,
      color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-900',
      iconColor: 'bg-blue-200 text-blue-700',
    },
    {
      title: 'Această Săptămână',
      value: stats.thisWeekEvents,
      description: 'evenimente planificate',
      icon: Clock,
      color: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-900',
      iconColor: 'bg-purple-200 text-purple-700',
    },
    {
      title: 'Întârziate',
      value: stats.overdueEvents,
      description: 'acțiuni overdue',
      icon: AlertTriangle,
      color: stats.overdueEvents > 0
        ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-900'
        : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 text-gray-900',
      iconColor: stats.overdueEvents > 0
        ? 'bg-red-200 text-red-700'
        : 'bg-gray-200 text-gray-700',
    },
    {
      title: 'Completate',
      value: stats.completedThisMonth,
      description: 'în această lună',
      icon: CheckCircle,
      color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-900',
      iconColor: 'bg-green-200 text-green-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}


      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const IconComponent = stat.icon;

          return (
            <div
              key={stat.title}
              className={`${stat.color} border rounded-xl p-4 transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.iconColor}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                {stat.title === 'Întârziate' && stat.value > 0 && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>

              <div>
                <p className="text-2xl font-bold mb-1">
                  {stat.value}
                </p>
                <p className="text-sm opacity-75">
                  {stat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarHeader;