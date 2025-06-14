import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { getActionIcon } from '@/features/actions/constants/formSchema';
import { CalendarEvent } from '../../types/calendar';

interface Props {
  event: CalendarEvent;
  onClick: () => void;
  compact?: boolean;
}

const EventCard: React.FC<Props> = ({ event, onClick, compact = false }) => {
  const isOverdue = event.start < new Date() && event.action.status !== 'completed';
  const ActionIcon = getActionIcon(event.action.type);

  return (
    <div
      onClick={onClick}
      className={`p-2 rounded-md cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-sm
        ${compact ? 'text-xs' : 'text-sm'} ${isOverdue ? 'animate-pulse' : ''}`}
      style={{ backgroundColor: event.color, color: 'white' }}
    >
      <div className="flex items-center space-x-1">
        {React.cloneElement(ActionIcon as React.ReactElement, { size: compact ? 12 : 14, className: "text-white" })}
        <span className="font-medium truncate">{event.action.type.replace('_', ' ')}</span>
        {isOverdue && <AlertTriangle className="w-3 h-3 text-white" />}
      </div>
      {!compact && <div className="text-white/80 text-xs mt-1 truncate">{event.plotName}</div>}
    </div>
  );
};

export default EventCard;
