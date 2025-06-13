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

interface EventDetailsProps {
  event: CalendarEvent;
  onClose: () => void;
  onStatusUpdate?: (actionId: string, status: 'completed' | 'cancelled' | 'in_progress' | 'planned') => Promise<void>;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event, onClose, onStatusUpdate }) => {
  const { action, plotName } = event;
  const [isUpdating, setIsUpdating] = useState(false);
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'planned':
        return {
          label: 'Planificat',
          icon: Clock,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'in_progress':
        return {
          label: 'În progres',
          icon: Activity,
          color: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'completed':
        return {
          label: 'Completat',
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'cancelled':
        return {
          label: 'Anulat',
          icon: X,
          color: 'bg-red-100 text-red-800 border-red-200',
        };
      default:
        return {
          label: 'Necunoscut',
          icon: AlertTriangle,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleStatusUpdate = async (newStatus: 'completed' | 'cancelled' | 'in_progress' | 'planned') => {
    if (!onStatusUpdate) return;
    
    try {
      setIsUpdating(true);
      await onStatusUpdate(action.id, newStatus);
      // Close modal after successful update
      setTimeout(() => {
        onClose();
      }, 1000);
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

  // Get available status transitions
  const getAvailableActions = () => {
    switch (action.status) {
      case 'planned':
        return [
          { status: 'in_progress', label: 'Începe', icon: Play, color: 'bg-amber-600 hover:bg-amber-700' },
          { status: 'completed', label: 'Marchează Completat', icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' },
          { status: 'cancelled', label: 'Anulează', icon: X, color: 'bg-red-600 hover:bg-red-700' },
        ];
      case 'in_progress':
        return [
          { status: 'completed', label: 'Completează', icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' },
          { status: 'planned', label: 'Oprește', icon: Square, color: 'bg-gray-600 hover:bg-gray-700' },
          { status: 'cancelled', label: 'Anulează', icon: X, color: 'bg-red-600 hover:bg-red-700' },
        ];
      case 'completed':
        return [
          { status: 'planned', label: 'Reactivează', icon: Clock, color: 'bg-blue-600 hover:bg-blue-700' },
        ];
      case 'cancelled':
        return [
          { status: 'planned', label: 'Reactivează', icon: Clock, color: 'bg-blue-600 hover:bg-blue-700' },
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
            <p className="text-red-800 font-medium">Acțiune întârziată</p>
            <p className="text-red-600 text-sm">
              Această acțiune a trecut de termenul programat
            </p>
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Date */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-medium text-gray-700">Data Programată</h4>
          </div>
          <p className="text-gray-900 capitalize">
            {formatDate(event.start)}
          </p>
        </div>

        {/* Description */}
        {action.description && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-700">Descriere</h4>
            </div>
            <p className="text-gray-900">{action.description}</p>
          </div>
        )}

        {/* Notes */}
        {action.notes && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-700">Notițe</h4>
            </div>
            <p className="text-gray-900">{action.notes}</p>
          </div>
        )}

        {/* Specific Action Fields */}
        {action.type === 'fertilizing' && (action as any).fertilizerType && (
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-medium text-amber-700">Detalii Fertilizare</h4>
            </div>
            <div className="space-y-1 text-sm">
              {(action as any).fertilizerType && (
                <p><span className="font-medium">Tip:</span> {(action as any).fertilizerType}</p>
              )}
              {(action as any).applicationRate && (
                <p><span className="font-medium">Rată aplicare:</span> {(action as any).applicationRate} kg/ha</p>
              )}
              {(action as any).method && (
                <p><span className="font-medium">Metodă:</span> {(action as any).method}</p>
              )}
            </div>
          </div>
        )}

        {action.type === 'harvesting' && (action as any).cropYield && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-yellow-600" />
              <h4 className="text-sm font-medium text-yellow-700">Detalii Recoltare</h4>
            </div>
            <div className="space-y-1 text-sm">
              {(action as any).cropYield && (
                <p><span className="font-medium">Randament:</span> {(action as any).cropYield} tone/ha</p>
              )}
              {(action as any).comments && (
                <p><span className="font-medium">Comentarii:</span> {(action as any).comments}</p>
              )}
            </div>
          </div>
        )}

        {/* Created Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-medium text-gray-700">Informații</h4>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              Creat: {formatTime(new Date(action.createdAt))}
            </p>
            {action.updatedAt && action.updatedAt !== action.createdAt && (
              <p>
                Actualizat: {formatTime(new Date(action.updatedAt))}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>
          Închide
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

      {/* Success Message */}
      {isUpdating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-blue-800 text-sm">Se actualizează statusul...</p>
        </div>
      )}
    </div>
  );
};

export default EventDetails;