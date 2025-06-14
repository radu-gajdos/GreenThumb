import React from 'react';
import EventCard from './EventCard';
import { CalendarEvent } from '../../types/calendar';

interface WeekViewProps {
  days: Date[];
  getEventsForDate: (date: Date) => CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ days, getEventsForDate, onEventClick }) => {
  const weekDays = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'];

  return (
    <div className="grid grid-cols-7 gap-4">
      {days.map((day, index) => {
        const events = getEventsForDate(day);
        const isToday = day.toDateString() === new Date().toDateString();

        return (
          <div key={index} className="space-y-3">
            {/* Day Header */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                {day.getDate()}
              </div>
              <div className="text-sm text-gray-500">{weekDays[index]}</div>
            </div>

            {/* Events */}
            <div className="space-y-2 min-h-32">
              {events.map((event) => (
                <EventCard key={event.id} event={event} onClick={() => onEventClick(event)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekView;
