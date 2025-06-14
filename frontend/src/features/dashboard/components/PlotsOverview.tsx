import React from 'react';
import {
  MapPin,
  Activity,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PlotSummary } from '../types/dashboard';

interface PlotsOverviewProps {
  plots: PlotSummary[];
  onNavigate: (path: string) => void;
  onPlotClick?: (plotId: string) => void;
}

const PlotsOverview: React.FC<PlotsOverviewProps> = ({ plots, onNavigate, onPlotClick }) => {
  const { t } = useTranslation();

  const getStatusInfo = (status: PlotSummary['status']) => {
    switch (status) {
      case 'active':
        return {
          label: t('plotsOverview.status.active'),
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Activity,
        };
      case 'planning':
        return {
          label: t('plotsOverview.status.planning'),
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
        };
      case 'harvested':
        return {
          label: t('plotsOverview.status.harvested'),
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: CheckCircle,
        };
      case 'fallow':
        return {
          label: t('plotsOverview.status.fallow'),
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
        };
      default:
        return {
          label: t('plotsOverview.status.unknown'),
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
        };
    }
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return t('calendarIndex.today');
    if (diffInDays === 1) return t('calendarIndex.yesterday');
    if (diffInDays < 7) return t('plotsOverview.days', { count: diffInDays });
    if (diffInDays < 30) return t('plotsOverview.weeks', { count: Math.floor(diffInDays / 7) });

    return date.toLocaleDateString('ro-RO', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (plots.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 h-full flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-gray-600" />
          {t('plotsOverview.emptyTitle')}
        </h3>

        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">{t('plotsOverview.emptyMessage')}</p>
          <button
            onClick={() => onNavigate('/app/plots')}
            className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg font-medium"
          >
            {t('plotsOverview.createFirst')}
          </button>
        </div>
      </div>
    );
  }

  const sortedPlots = [...plots].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (b.status === 'active' && a.status !== 'active') return 1;
    return (b.lastActivity?.getTime() || 0) - (a.lastActivity?.getTime() || 0);
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-gray-600" />
          {t('plotsOverview.title')}
        </h3>
        <button
          onClick={() => onNavigate('/app/plots')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {t('plotsOverview.viewAll')}
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {sortedPlots.slice(0, 6).map((plot) => {
          const statusInfo = getStatusInfo(plot.status);
          const StatusIcon = statusInfo.icon;

          return (
            <div
              key={plot.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
              onClick={() =>
                onPlotClick ? onPlotClick(plot.id) : onNavigate(`/app/plots/${plot.id}`)
              }
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 group-hover:text-gray-900 mb-1">
                    {plot.name}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {t('plotsOverview.sizeUnit', { size: plot.size.toFixed(2) })}
                    </span>
                    <span>{plot.soilType}</span>
                  </div>
                </div>

                <div className={`px-2 py-1 rounded border text-xs font-medium ${statusInfo.color} flex items-center`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4 text-gray-500">
                  <span className="flex items-center">
                    <Activity className="w-3 h-3 mr-1 text-blue-500" />
                    {t('plotsOverview.activeActions', { count: plot.activeActionsCount })}
                  </span>
                  <span className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                    {t('plotsOverview.completedActions', { count: plot.completedActionsCount })}
                  </span>
                </div>

                {plot.lastActivity && (
                  <span className="text-gray-400 text-xs">
                    {formatLastActivity(plot.lastActivity)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {plots.length > 6 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onNavigate('/plots')}
            className="w-full text-center text-gray-600 hover:text-gray-800 text-sm font-medium py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {t('plotsOverview.viewAllWithCount', { count: plots.length })}
          </button>
        </div>
      )}
    </div>
  );
};

export default PlotsOverview;
