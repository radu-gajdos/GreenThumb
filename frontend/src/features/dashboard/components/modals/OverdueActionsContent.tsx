import React, { useState } from 'react';
import {
  MapPin, Clock, AlertCircle, CheckCircle2, Play,
  Calendar, Filter, Search, MoreVertical, X, AlertTriangle
} from 'lucide-react';

import { useActiveActions } from '../../hooks/useActiveActions';
import { ActiveActionsFilter, Action } from '../../types/active-actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchSelect from '@/components/ui/searchSelect';

interface OverdueActionsContentProps {
  initialFilter?: ActiveActionsFilter;
}

const statusOptions = [
  { label: 'Toate', value: '' },
  // Removed status options since we only show overdue actions
];

const OverdueActionsContent: React.FC<OverdueActionsContentProps> = ({ initialFilter }) => {
  const [filter, setFilter] = useState<ActiveActionsFilter>(initialFilter || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const { actions, summary, loading, error, updateActionStatus } = useActiveActions(filter);

  // Filtrăm doar acțiunile întârziate (overdue)
  const isOverdue = (date: Date, status: Action['status']) => {
    const today = new Date();
    const actionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return actionDate < todayDate && status !== 'completed' && status !== 'cancelled';
  };

  const overdueActions = actions.filter(action => isOverdue(action.date, action.status));

  const filteredActions = overdueActions.filter(action =>
    action.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.plot?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Action['status']) => {
    switch (status) {
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'planned': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: Action['status']) => {
    switch (status) {
      case 'in_progress': return 'În progres';
      case 'planned': return 'Planificat';
      default: return status;
    }
  };

  const formatOverdueDays = (date: Date) => {
    const today = new Date();
    const actionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffInDays = Math.floor((todayDate.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 1) return '1 zi întârziere';
    return `${diffInDays} zile întârziere`;
  };

  const getUrgencyLevel = (date: Date) => {
    const today = new Date();
    const actionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffInDays = Math.floor((todayDate.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays > 30) return { level: 'critical', color: 'text-red-700 bg-red-100 border-red-200' };
    if (diffInDays >= 8) return { level: 'high', color: 'text-orange-700 bg-orange-100 border-orange-200' };
    return { level: 'medium', color: 'text-yellow-700 bg-yellow-100 border-yellow-200' };
  };

  const handleStatusChange = async (actionId: string, newStatus: Action['status']) => {
    try {
      await updateActionStatus(actionId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Calculez statisticile pentru acțiunile întârziate
  const overdueStats = {
    total: overdueActions.length,
    lastWeek: overdueActions.filter(a => {
      const today = new Date();
      const actionDate = new Date(a.date.getFullYear(), a.date.getMonth(), a.date.getDate());
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diffInDays = Math.floor((todayDate.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffInDays >= 1 && diffInDays <= 7;
    }).length,
    lastMonth: overdueActions.filter(a => {
      const today = new Date();
      const actionDate = new Date(a.date.getFullYear(), a.date.getMonth(), a.date.getDate());
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diffInDays = Math.floor((todayDate.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffInDays >= 8 && diffInDays <= 30;
    }).length,
    critical: overdueActions.filter(a => {
      const today = new Date();
      const actionDate = new Date(a.date.getFullYear(), a.date.getMonth(), a.date.getDate());
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diffInDays = Math.floor((todayDate.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffInDays > 30;
    }).length,
  };

  if (loading) return (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500" />
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
      {/* Summary pentru acțiunile întârziate */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Întârziate', 
            count: overdueStats.total, 
            icon: <AlertTriangle className="text-red-400" />, 
            color: 'bg-red-50 border-red-200' 
          },
          { 
            label: '1-7 Zile', 
            count: overdueStats.lastWeek, 
            icon: <Clock className="text-yellow-500" />, 
            color: 'bg-yellow-50 border-yellow-200' 
          },
          { 
            label: '8-30 Zile', 
            count: overdueStats.lastMonth, 
            icon: <AlertCircle className="text-orange-500" />, 
            color: 'bg-orange-50 border-orange-200' 
          },
          { 
            label: 'Peste 30 Zile', 
            count: overdueStats.critical, 
            icon: <AlertCircle className="text-red-600" />, 
            color: 'bg-red-50 border-red-300' 
          },
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
              placeholder="Caută activități întârziate..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchSelect
                options={[
                  { label: 'Toate', value: '' },
                  ...Object.keys(summary.byType).map(type => ({
                    label: type.replace('_', ' '),
                    value: type
                  }))
                ]}
                placeholder="Tip activitate"
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
                className='h-10'
                size="sm"
                onClick={() => setFilter({})}
              >
                Resetează filtrele
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Overdue Actions List */}
      <div className="space-y-4">
        {filteredActions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {overdueActions.length === 0 
                ? "Felicitări! Nu există activități întârziate" 
                : "Nu s-au găsit activități întârziate pentru filtrele selectate"
              }
            </p>
          </div>
        ) : (
          filteredActions
            .sort((a, b) => a.date.getTime() - b.date.getTime()) // Sortează după data cea mai veche
            .map((action) => {
              const urgency = getUrgencyLevel(action.date);
              
              return (
                <div
                  key={action.id}
                  className="bg-white border-l-4 border-l-red-400 border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                >
                  {/* Header */}
                  <div className="flex justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold capitalize">{action.type.replace('_', ' ')}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(action.status)}`}>
                          {getStatusLabel(action.status)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${urgency.color}`}>
                          {formatOverdueDays(action.date)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 flex gap-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {action.plot?.name || 'Necunoscut'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-red-600 font-medium">
                            {action.date.toLocaleDateString('ro-RO')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {action.status === 'planned' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleStatusChange(action.id, 'in_progress')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Play className="w-4 h-4" />
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
                        <div><strong>Creat:</strong> {action.createdAt.toLocaleDateString('ro-RO')}</div>
                        <div><strong>Actualizat:</strong> {action.updatedAt.toLocaleDateString('ro-RO')}</div>
                        <div><strong>Programat:</strong> {action.date.toLocaleDateString('ro-RO')}</div>
                      </div>
                      {action.notes && (
                        <div>
                          <strong>Note:</strong>
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
                          Finalizează Acum
                        </Button>
                        {action.status === 'planned' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(action.id, 'in_progress')}
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Pornește Acum
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-700 border-red-200 hover:bg-red-50"
                          onClick={() => handleStatusChange(action.id, 'cancelled')}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Anulează
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default OverdueActionsContent;