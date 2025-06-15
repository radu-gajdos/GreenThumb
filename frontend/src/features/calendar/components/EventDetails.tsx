import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  User,
  FileText,
  Play,
  Square,
  X,
} from 'lucide-react';
import { CalendarEvent } from '../types/calendar';
import { ActionType, getActionIcon } from '@/features/actions/constants/formSchema';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { formatDate, formatTime } from '@/lib/formatDateTime';

interface EventDetailsProps {
  event: CalendarEvent;
  onClose: () => void;
  onStatusUpdate?: (actionId: string, status: 'completed' | 'cancelled' | 'in_progress' | 'planned') => Promise<void>;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event, onClose, onStatusUpdate }) => {
  const { t } = useTranslation();
  const { action, plotName } = event;
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'planned':
        return {
          label: t('calendarEventDetails.status.planned'),
          icon: Clock,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'in_progress':
        return {
          label: t('calendarEventDetails.status.in_progress'),
          icon: Activity,
          color: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'completed':
        return {
          label: t('calendarEventDetails.status.completed'),
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'cancelled':
        return {
          label: t('calendarEventDetails.status.cancelled'),
          icon: X,
          color: 'bg-red-100 text-red-800 border-red-200',
        };
      default:
        return {
          label: t('calendarEventDetails.status.unknown'),
          icon: AlertTriangle,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const handleStatusUpdate = async (newStatus: 'completed' | 'cancelled' | 'in_progress' | 'planned') => {
    if (!onStatusUpdate) return;
    try {
      setIsUpdating(true);
      await onStatusUpdate(action.id, newStatus);
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const isOverdue = event.start < new Date() && action.status !== 'completed';
  const statusInfo = getStatusInfo(action.status);
  const StatusIcon = statusInfo.icon;
  const ActionIconComponent = getActionIcon(action.type as ActionType);

  const getAvailableActions = () => {
    switch (action.status) {
      case 'planned':
        return [
          { status: 'in_progress', label: t('calendarEventDetails.buttons.start'), icon: Play, color: 'bg-amber-600 hover:bg-amber-700' },
          { status: 'completed', label: t('calendarEventDetails.buttons.complete'), icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' },
          { status: 'cancelled', label: t('calendarEventDetails.buttons.cancel'), icon: X, color: 'bg-red-600 hover:bg-red-700' },
        ];
      case 'in_progress':
        return [
          { status: 'completed', label: t('calendarEventDetails.buttons.complete'), icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' },
          { status: 'planned', label: t('calendarEventDetails.buttons.stop'), icon: Square, color: 'bg-gray-600 hover:bg-gray-700' },
          { status: 'cancelled', label: t('calendarEventDetails.buttons.cancel'), icon: X, color: 'bg-red-600 hover:bg-red-700' },
        ];
      case 'completed':
      case 'cancelled':
        return [
          { status: 'planned', label: t('calendarEventDetails.buttons.reopen'), icon: Clock, color: 'bg-blue-600 hover:bg-blue-700' },
        ];
      default:
        return [];
    }
  };

  const availableActions = getAvailableActions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start space-x-4">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: event.color + '20', color: event.color }}
        >
          {React.cloneElement(ActionIconComponent as React.ReactElement, {
            size: 24,
            className: "text-current"
          })}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 capitalize">
            {action.type.replace('_', ' ')}
          </h3>
          <p className="text-gray-600 flex items-center mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            {plotName}
          </p>
        </div>

        <div className={`px-3 py-1 rounded border text-sm font-medium ${statusInfo.color} flex items-center`}>
          <StatusIcon className="w-4 h-4 mr-1" />
          {statusInfo.label}
        </div>
      </div>

      {/* Overdue Warning */}
      {isOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-red-800 font-medium">{t('calendarEventDetails.overdue.title')}</p>
            <p className="text-red-600 text-sm">{t('calendarEventDetails.overdue.subtitle')}</p>
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Date */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-medium text-gray-700">{t('calendarEventDetails.sections.scheduledDate')}</h4>
          </div>
          <p className="text-gray-900 capitalize">{formatDate(event.start)}</p>
        </div>

        {/* Description */}
        {action.description && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-700">{t('calendarEventDetails.sections.description')}</h4>
            </div>
            <p className="text-gray-900">{action.description}</p>
          </div>
        )}

        {/* Notes */}
        {action.notes && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-700">{t('calendarEventDetails.sections.notes')}</h4>
            </div>
            <p className="text-gray-900">{action.notes}</p>
          </div>
        )}

        {/* Fertilizing Fields */}
        {action.type === 'fertilizing' && (action as any).fertilizerType && (
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-medium text-amber-700">{t('calendarEventDetails.sections.fertilizing')}</h4>
            </div>
            <div className="space-y-1 text-sm">
              {(action as any).fertilizerType && (
                <p><span className="font-medium">{t('calendarEventDetails.fields.type')}:</span> {(action as any).fertilizerType}</p>
              )}
              {(action as any).applicationRate && (
                <p><span className="font-medium">{t('calendarEventDetails.fields.rate')}:</span> {(action as any).applicationRate} kg/ha</p>
              )}
              {(action as any).method && (
                <p><span className="font-medium">{t('calendarEventDetails.fields.method')}:</span> {(action as any).method}</p>
              )}
            </div>
          </div>
        )}

        {/* Harvesting Fields */}
        {action.type === 'harvesting' && (action as any).cropYield && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-yellow-600" />
              <h4 className="text-sm font-medium text-yellow-700">{t('calendarEventDetails.sections.harvesting')}</h4>
            </div>
            <div className="space-y-1 text-sm">
              {(action as any).cropYield && (
                <p><span className="font-medium">{t('calendarEventDetails.fields.yield')}:</span> {(action as any).cropYield} t/ha</p>
              )}
              {(action as any).comments && (
                <p><span className="font-medium">{t('calendarEventDetails.fields.comments')}:</span> {(action as any).comments}</p>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-medium text-gray-700">{t('calendarEventDetails.sections.info')}</h4>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>{t('calendarEventDetails.fields.created')}: {formatTime(new Date(action.createdAt))}</p>
            {action.updatedAt && action.updatedAt !== action.createdAt && (
              <p>{t('calendarEventDetails.fields.updated')}: {formatTime(new Date(action.updatedAt))}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>
          {t('calendarEventDetails.buttons.close')}
        </Button>

        <div className="flex items-center space-x-2">
          {availableActions.map((statusAction) => {
            const IconComponent = statusAction.icon;
            return (
              <Button
                key={statusAction.status}
                className={statusAction.color}
                onClick={() => handleStatusUpdate(statusAction.status as any)}
                disabled={isUpdating}
                size="sm"
              >
                <IconComponent className="w-4 h-4 mr-1" />
                {statusAction.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Loading Message */}
      {isUpdating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-blue-800 text-sm">{t('calendarEventDetails.loading')}</p>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
