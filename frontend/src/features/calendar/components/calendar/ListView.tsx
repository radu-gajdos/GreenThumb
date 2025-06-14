import React from 'react';
import { Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { CalendarEvent } from '../../types/calendar';
import { useTranslation } from 'react-i18next';

interface ListViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const ListView: React.FC<ListViewProps> = ({
  events,
  selectedDate,
  onDateChange,
  onEventClick,
}) => {
  const { t } = useTranslation();

  const isSameDay = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const eventsForSelectedDate = events.filter((event) =>
    isSameDay(event.start, selectedDate)
  );

  const sortedEvents = [...eventsForSelectedDate].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  return (
    <div className="space-y-4">
      {/* Subtitle with selected date */}
      <div className="text-center pb-4 border-b border-gray-100">
        <p className="text-sm text-gray-600">
          {selectedDate.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Events List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {t('calendarListView.noEvents')}
            </p>
          </div>
        ) : (
          sortedEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => onEventClick(event)}
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
            >
              {/* Color Dot */}
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: event.color }}
              />

              {/* Time Column */}
              <div className="text-center min-w-[60px]">
                <div className="text-lg font-bold text-gray-900">
                  {event.start.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="text-xs text-gray-500">
                  {event.start.toLocaleDateString('en-GB', {
                    weekday: 'short',
                  })}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate capitalize">
                  {event.action.type.replace('_', ' ')}
                </h4>
                <p className="text-sm text-gray-600 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {event.plotName}
                </p>
                {event.action.description && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {event.action.description}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${event.action.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                  ${event.action.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''}
                  ${event.action.status === 'planned' ? 'bg-gray-100 text-gray-800' : ''}
                  ${event.action.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                `}
                >
                  {t(`calendarListView.status.${event.action.status}`)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListView;
