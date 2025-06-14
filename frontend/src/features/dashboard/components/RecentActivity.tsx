import React from 'react';
import {
  Plus,
  CheckCircle,
  MapPin,
  MessageSquare,
  BarChart3,
  Clock,
  Activity,
} from 'lucide-react';
import { RecentActivityItem } from '../types/dashboard';

interface RecentActivityProps {
  activities: RecentActivityItem[];
  onNavigate: (path: string) => void;
  onViewAllActivities?: () => void;
  onActivityClick?: (plotId: string) => void;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, onNavigate, onViewAllActivities, onActivityClick}) => {
  const getActivityIcon = (type: RecentActivityItem['type']) => {
    switch (type) {
      case 'action_created':
        return { icon: Plus, color: 'text-blue-600 bg-blue-100' };
      case 'action_completed':
        return { icon: CheckCircle, color: 'text-green-600 bg-green-100' };
      case 'plot_created':
        return { icon: MapPin, color: 'text-purple-600 bg-purple-100' };
      case 'ai_conversation':
        return { icon: MessageSquare, color: 'text-indigo-600 bg-indigo-100' };
      case 'yield_prediction':
        return { icon: BarChart3, color: 'text-amber-600 bg-amber-100' };
      default:
        return { icon: Activity, color: 'text-gray-600 bg-gray-100' };
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'acum';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ore`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} zile`;

    return date.toLocaleDateString('ro-RO', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 h-full flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-gray-600" />
          Activitate Recentă
        </h3>

        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">Nu există activitate recentă</p>
          <button
            onClick={() => onNavigate('/plots')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Începe prin a crea un teren →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-gray-600" />
          Activitate Recentă
        </h3>
        <button
          onClick={() => onViewAllActivities ? onViewAllActivities() : onNavigate('/app/plots')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Vezi toate →
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {activities.map((activity) => {
          const { icon: IconComponent, color } = getActivityIcon(activity.type);

          return (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
              onClick={() => onActivityClick && activity.plotId && onActivityClick(activity.plotId)}
            >
              <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
                <IconComponent className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                    {activity.title}
                  </p>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-1 group-hover:text-gray-700">
                  {activity.description}
                </p>

                {activity.plotName && (
                  <div className="flex items-center mt-2">
                    <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">{activity.plotName}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;