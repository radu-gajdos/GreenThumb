import React from 'react';
import EventCard from './EventCard';
import { CalendarEvent } from '../../types/calendar';

interface Props {
  days: Date[];
  currentDate: Date;
  getEventsForDate: (date: Date) => CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const MonthView: React.FC<Props> = ({ days, currentDate, getEventsForDate, onEventClick }) => {
  const weekDays = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center font-medium text-gray-600 bg-gray-50 rounded-lg">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const events = getEventsForDate(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div key={index} className={`
              min-h-24 p-2 border rounded-lg transition-colors
              ${isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}
              ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
              hover:bg-gray-50`}>
              <div className={`
                text-sm font-medium mb-1
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${isToday ? 'text-blue-600' : ''}`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {events.slice(0, 2).map(event => (
                  <EventCard key={event.id} event={event} onClick={() => onEventClick(event)} compact />
                ))}
                {events.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">+{events.length - 2} mai multe</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
