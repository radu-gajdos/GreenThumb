import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarEvent } from '@/features/calendar/types/calendar';
import { AlertTriangle, MapPin, Calendar, Clock } from 'lucide-react';
import { getActionIcon, ActionType } from '@/features/actions/constants/formSchema';

interface TodayActionsProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const TodayActions: React.FC<TodayActionsProps> = ({ events, onEventClick }) => {
  const { t } = useTranslation();
  const now = new Date();

  const isSameDay = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const todayEvents = events.filter(e => isSameDay(e.start, now));
  const upcomingEvents = todayEvents.filter(e => e.start >= now && e.action.status !== 'completed');
  const currentEvents = todayEvents.filter(e => {
    const start = new Date(e.start);
    const end = new Date(e.start.getTime() + 2 * 60 * 60 * 1000);
    return start <= now && end >= now && e.action.status === 'in_progress';
  });
  const overdueEvents = todayEvents.filter(e => e.start < now && e.action.status !== 'completed' && e.action.status !== 'cancelled');
  const completedEvents = todayEvents.filter(e => e.action.status === 'completed');

  const sortedTodayEvents = [
    ...currentEvents.sort((a, b) => a.start.getTime() - b.start.getTime()),
    ...upcomingEvents.sort((a, b) => a.start.getTime() - b.start.getTime()),
    ...overdueEvents.sort((a, b) => a.start.getTime() - b.start.getTime()),
    ...completedEvents.sort((a, b) => b.start.getTime() - a.start.getTime()),
  ];

  const getTimeBasedStatus = (event: CalendarEvent) => {
    if (event.action.status === 'completed') return 'completed';
    if (event.action.status === 'cancelled') return 'cancelled';
    const start = new Date(event.start);
    const end = new Date(event.start.getTime() + 2 * 60 * 60 * 1000);
    if (start <= now && end >= now) return 'current';
    if (start > now) return 'upcoming';
    if (start < now) return 'overdue';
    return event.action.status;
  };

  const getTimeRelative = (event: CalendarEvent) => {
    const diff = Math.floor((event.start.getTime() - now.getTime()) / (1000 * 60));
    if (diff > 0) {
      return diff < 60
        ? t('todayActions.inMinutes', { count: diff })
        : t('todayActions.inHours', { hours: Math.floor(diff / 60), minutes: diff % 60 });
    } else {
      const past = Math.abs(diff);
      return past < 60
        ? t('todayActions.minutesAgo', { count: past })
        : t('todayActions.hoursAgo', { hours: Math.floor(past / 60), minutes: past % 60 });
    }
  };

  if (sortedTodayEvents.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 h-full flex flex-col">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{t('todayActions.title')}</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('todayActions.noEvents')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{t('todayActions.title')}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {currentEvents.length > 0 && (
            <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded-full animate-pulse">
              {t('todayActions.currentCount', { count: currentEvents.length })}
            </span>
          )}
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {sortedTodayEvents.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {sortedTodayEvents.map(event => {
            const status = getTimeBasedStatus(event);
            const Icon = getActionIcon(event.action.type as ActionType);
            return (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className={`
                  flex items-center space-x-4 p-3 border rounded-lg hover:shadow-sm transition-all cursor-pointer group
                  ${status === 'current' ? 'border-blue-300 bg-blue-50' :
                    status === 'overdue' ? 'border-red-300 bg-red-50' :
                    status === 'completed' ? 'border-green-300 bg-green-50 opacity-75' :
                    'border-gray-200 hover:border-gray-300'}
                `}
              >
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {React.cloneElement(Icon as React.ReactElement, {
                      size: 14,
                      className: 'text-gray-600 flex-shrink-0',
                    })}
                    <h4 className="font-medium text-gray-900 truncate capitalize group-hover:text-gray-700">
                      {event.action.type.replace('_', ' ')}
                    </h4>
                    {status === 'current' && (
                      <div className="flex items-center text-blue-600">
                        <Clock className="w-4 h-4 mr-1 animate-pulse" />
                        <span className="text-xs font-medium">{t('todayActions.now')}</span>
                      </div>
                    )}
                    {status === 'overdue' && (
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{event.plotName}</span>
                  </p>
                </div>
                <div className="text-right text-sm flex-shrink-0">
                  <p className={`font-medium ${status === 'current' ? 'text-blue-600' : status === 'overdue' ? 'text-red-600' : 'text-gray-500'}`}>
                    {event.start.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-500">{getTimeRelative(event)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TodayActions;
