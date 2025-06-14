import React, { useState } from 'react';
import {
  MapPin, Clock, AlertCircle, CheckCircle2, Play, Pause,
  Calendar, Filter, Search, MoreVertical, X, Activity
} from 'lucide-react';

import { useActiveActions } from '../../hooks/useActiveActions';
import { ActiveActionsFilter, Action } from '../../types/active-actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchSelect from '@/components/ui/searchSelect';
import { useTranslation } from 'react-i18next';

interface ActiveActionsContentProps {
  initialFilter?: ActiveActionsFilter;
}

const ActiveActionsContent: React.FC<ActiveActionsContentProps> = ({ initialFilter }) => {
  const { t } = useTranslation();

  const [filter, setFilter] = useState<ActiveActionsFilter>(initialFilter || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const { actions, summary, loading, error, updateActionStatus } = useActiveActions(filter);

  const filteredActions = actions.filter(action =>
    action.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.plot?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Action['status']) => {
    switch (status) {
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'planned': return 'text-purple-600 bg-purple-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: Action['status']) => {
    return t(`activeActions.status.${status}`);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diff = Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return t('activeActions.summary.today');
    if (diff === 1) return t('calendarIndex.tomorrow');
    if (diff === -1) return t('calendarIndex.yesterday');
    if (diff < -1) return `${Math.abs(diff)} ${t('calendarIndex.daysLate')}`;
    if (diff > 1) return `${t('calendarIndex.in')} ${diff} ${t('calendarIndex.days')}`;
    return date.toLocaleDateString('en-GB');
  };

  const isOverdue = (date: Date, status: Action['status']) => {
    const today = new Date();
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < t && status !== 'completed';
  };

  const handleStatusChange = async (actionId: string, newStatus: Action['status']) => {
    try {
      await updateActionStatus(actionId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
    </div>
  );

  if (error) return (
    <div className="text-center py-8">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-gray-600">{error}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('activeActions.summary.in_progress'), count: summary.byStatus.in_progress, icon: <Play className="text-blue-400" />, color: 'bg-blue-50' },
          { label: t('activeActions.summary.planned'), count: summary.byStatus.planned, icon: <Calendar className="text-purple-400" />, color: 'bg-purple-50' },
          { label: t('activeActions.summary.overdue'), count: summary.overdueCount, icon: <AlertCircle className="text-red-400" />, color: 'bg-red-50' },
          { label: t('activeActions.summary.today'), count: summary.todayCount, icon: <Clock className="text-green-400" />, color: 'bg-green-50' },
        ].map(({ label, count, icon, color }) => (
          <div key={label} className={`${color} p-4 rounded-lg border`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
              {icon}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4 px-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t('activeActions.filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="p-4 bg-gray-50 border rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SearchSelect
                options={[
                  { label: t('activeActions.status.planned'), value: 'planned' },
                  { label: t('activeActions.status.in_progress'), value: 'in_progress' },
                  { label: t('activeActions.status.cancelled'), value: 'cancelled' }
                ]}
                placeholder={t('activeActions.filters.statusPlaceholder')}
                value={filter.status?.[0] ?? ''}
                onValueChange={(value) =>
                  setFilter(prev => ({
                    ...prev,
                    status: value ? [value as Action['status']] : undefined,
                  }))
                }
              />
              <SearchSelect
                options={[
                  { label: t('activeActions.filters.typePlaceholder'), value: '' },
                  ...Object.keys(summary.byType).map(type => ({
                    label: type.replace('_', ' '),
                    value: type
                  }))
                ]}
                placeholder={t('activeActions.filters.typePlaceholder')}
                value={filter.type?.[0] ?? ''}
                onValueChange={(value) =>
                  setFilter(prev => ({
                    ...prev,
                    type: value ? [value as string] : undefined,
                  }))
                }
              />
              <Button
                variant="outline"
                className="h-10"
                size="sm"
                onClick={() => setFilter({})}
              >
                {t('activeActions.filters.reset')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {filteredActions.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('activeActions.empty.title')}</p>
          </div>
        ) : (
          filteredActions.map((action) => (
            <div
              key={action.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
            >
              <div className="flex justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold capitalize">{action.type.replace('_', ' ')}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(action.status)}`}>
                      {getStatusLabel(action.status)}
                    </span>
                    {isOverdue(action.date, action.status) && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full text-red-600 bg-red-100">
                        {t('activeActions.status.overdue')}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 flex gap-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {action.plot?.name || t('activeActions.labels.unknown')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span className={isOverdue(action.date, action.status) ? 'text-red-600 font-medium' : ''}>
                        {formatDate(action.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {action.status === 'in_progress' && (
                    <Button variant="ghost" size="sm" onClick={() => handleStatusChange(action.id, 'planned')}>
                      <Pause className="w-4 h-4" />
                    </Button>
                  )}
                  {action.status === 'planned' && (
                    <Button variant="ghost" size="sm" onClick={() => handleStatusChange(action.id, 'in_progress')}>
                      <Play className="w-4 h-4 text-green-600" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAction(selectedAction === action.id ? null : action.id)}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {action.description && (
                <p className="text-sm text-gray-600 mb-3">{action.description}</p>
              )}

              {selectedAction === action.id && (
                <div className="pt-4 mt-4 border-t text-sm space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>{t('activeActions.labels.created')}:</strong> {action.createdAt.toLocaleDateString('en-GB')}</div>
                    <div><strong>{t('activeActions.labels.updated')}:</strong> {action.updatedAt.toLocaleDateString('en-GB')}</div>
                    <div><strong>{t('activeActions.labels.scheduled')}:</strong> {action.date.toLocaleDateString('en-GB')}</div>
                  </div>
                  {action.notes && (
                    <div>
                      <strong>{t('activeActions.labels.notes')}:</strong>
                      <p className="mt-1 text-gray-600">{action.notes}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(action.id, 'completed')}
                      className="bg-green-100 text-green-700 hover:bg-green-200"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      {t('activeActions.buttons.finish')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-700 border-red-200 hover:bg-red-50"
                      onClick={() => handleStatusChange(action.id, 'cancelled')}
                    >
                      <X className="w-4 h-4 mr-1" />
                      {t('activeActions.buttons.cancel')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveActionsContent;
