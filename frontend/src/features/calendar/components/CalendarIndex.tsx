import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Grid3X3,
  List,
  MapPin,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCalendarData } from '../hooks/useCalendarData';
import CalendarHeader from './CalendarHeader';
import CalendarFilters from './CalendarFilters';
import EventDetails from './EventDetails';
import { CalendarEvent } from '../types/calendar';
import { ActionType, getActionIcon } from '@/features/actions/constants/formSchema';

type ViewType = 'month' | 'week' | 'list';

const CalendarIndex: React.FC = () => {
  const {
    calendarEvents,
    stats,
    plotOptions,
    actionTypeOptions,
    filters,
    setFilters,
    loading,
    error,
    updateActionStatus,
    refreshData,
  } = useCalendarData();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedListDate, setSelectedListDate] = useState(new Date());

  // Helper functions for date manipulation
  const startOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const endOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const startOfWeek = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    return new Date(date.getFullYear(), date.getMonth(), diff);
  };

  const endOfWeek = (date: Date) => {
    const start = startOfWeek(date);
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  };

  const addMonths = (date: Date, months: number) => {
    return new Date(date.getFullYear(), date.getMonth() + months, 1);
  };

  const addWeeks = (date: Date, weeks: number) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (weeks * 7));
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  };

  // Navigation functions
  const navigatePrevious = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, -1));
    } else if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, -1));
    } else if (view === 'list') {
      const previousDay = new Date(selectedListDate);
      previousDay.setDate(selectedListDate.getDate() - 1);
      setSelectedListDate(previousDay);
    }
  };

  const navigateNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (view === 'list') {
      const nextDay = new Date(selectedListDate);
      nextDay.setDate(selectedListDate.getDate() + 1);
      setSelectedListDate(nextDay);
    }
  };

  const navigateToday = () => {
    if (view === 'list') {
      setSelectedListDate(new Date());
    } else {
      setCurrentDate(new Date());
    }
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => isSameDay(event.start, date));
  };

  // Get visible date range based on view
  const getVisibleRange = () => {
    if (view === 'month') {
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));
      return { start, end };
    } else if (view === 'week') {
      return { start: startOfWeek(currentDate), end: endOfWeek(currentDate) };
    }
    return { start: currentDate, end: currentDate };
  };

  // Generate calendar grid for month view
  const generateMonthGrid = () => {
    const { start, end } = getVisibleRange();
    const days = [];
    const current = new Date(start);

    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // Generate week grid
  const generateWeekGrid = () => {
    const { start } = getVisibleRange();
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const formatDateTitle = () => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('ro-RO', {
        month: 'long',
        year: 'numeric'
      });
    } else if (view === 'week') {
      const { start, end } = getVisibleRange();
      return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('ro-RO', {
        month: 'long',
        year: 'numeric'
      })}`;
    } else if (view === 'list') {
      const today = new Date();
      if (isSameDay(selectedListDate, today)) {
        return 'Astăzi';
      }

      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (isSameDay(selectedListDate, yesterday)) {
        return 'Ieri';
      }

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      if (isSameDay(selectedListDate, tomorrow)) {
        return 'Mâine';
      }

      return selectedListDate.toLocaleDateString('ro-RO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    return '';
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleStatusUpdate = async (actionId: string, status: 'completed' | 'cancelled' | 'in_progress' | 'planned') => {
    try {
      await updateActionStatus(actionId, status);
      await refreshData();
      // Închide dialogul imediat după actualizare cu succes
      setIsEventDialogOpen(false);
    } catch (error) {
      console.error('Failed to update action status:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-center">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Eroare la încărcarea calendarului
        </h3>
        <p className="text-gray-500 max-w-md mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Încearcă din nou
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <CalendarHeader stats={stats} />

      {/* Filters */}
      <CalendarFilters
        filters={filters}
        onFiltersChange={setFilters}
        plotOptions={plotOptions}
        actionTypeOptions={actionTypeOptions}
      />

      {/* Calendar Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Calendar Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {/* Navigation */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={navigatePrevious}
                className="p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={navigateToday}
              >
                Astăzi
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={navigateNext}
                className="p-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <h2 className="text-lg font-semibold text-gray-800 capitalize ml-4">
                {formatDateTitle()}
              </h2>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="ml-4"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* View Switcher */}
            <div className="flex items-center space-x-2">
              <Button
                variant={view === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('month')}
                className="flex items-center space-x-1"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Lună</span>
              </Button>

              <Button
                variant={view === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('week')}
                className="flex items-center space-x-1"
              >
                <CalendarIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Săptămână</span>
              </Button>

              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
                className="flex items-center space-x-1"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Listă</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="p-4">
          {view === 'month' && (
            <MonthView
              days={generateMonthGrid()}
              currentDate={currentDate}
              getEventsForDate={getEventsForDate}
              onEventClick={handleEventClick}
            />
          )}

          {view === 'week' && (
            <WeekView
              days={generateWeekGrid()}
              getEventsForDate={getEventsForDate}
              onEventClick={handleEventClick}
            />
          )}

          {view === 'list' && (
            <ListView
              events={calendarEvents}
              selectedDate={selectedListDate}
              onDateChange={setSelectedListDate}
              onEventClick={handleEventClick}
            />
          )}
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5" />
              <span>Detalii Acțiune</span>
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventDetails
              event={selectedEvent}
              onClose={() => setIsEventDialogOpen(false)}
              onStatusUpdate={handleStatusUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Month View Component
const MonthView: React.FC<{
  days: Date[];
  currentDate: Date;
  getEventsForDate: (date: Date) => CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}> = ({ days, currentDate, getEventsForDate, onEventClick }) => {
  const weekDays = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];

  return (
    <div className="space-y-4">
      {/* Week Headers */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center font-medium text-gray-600 bg-gray-50 rounded-lg">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const events = getEventsForDate(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`
                min-h-24 p-2 border rounded-lg transition-colors
                ${isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}
                ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                hover:bg-gray-50
              `}
            >
              <div className={`
                text-sm font-medium mb-1
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${isToday ? 'text-blue-600' : ''}
              `}>
                {day.getDate()}
              </div>

              <div className="space-y-1">
                {events.slice(0, 2).map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick(event)}
                    compact
                  />
                ))}
                {events.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{events.length - 2} mai multe
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Week View Component
const WeekView: React.FC<{
  days: Date[];
  getEventsForDate: (date: Date) => CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}> = ({ days, getEventsForDate, onEventClick }) => {
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
              <div className={`
                text-2xl font-bold
                ${isToday ? 'text-blue-600' : 'text-gray-900'}
              `}>
                {day.getDate()}
              </div>
            </div>

            {/* Events */}
            <div className="space-y-2 min-h-32">
              {events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => onEventClick(event)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// List View Component
// List View Component
// List View Component
const ListView: React.FC<{
  events: CalendarEvent[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}> = ({ events, selectedDate, onDateChange, onEventClick }) => {

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  };

  // Filtrează evenimentele pentru ziua selectată
  const eventsForSelectedDate = events.filter(event =>
    isSameDay(event.start, selectedDate)
  );

  // Sortează evenimentele după oră
  const sortedEvents = [...eventsForSelectedDate].sort((a, b) =>
    a.start.getTime() - b.start.getTime()
  );

  return (
    <div className="space-y-4">
      {/* Subtitle cu data completă sub header-ul principal */}
      <div className="text-center pb-4 border-b border-gray-100">
        <p className="text-sm text-gray-600">
          {selectedDate.toLocaleDateString('ro-RO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </div>

      {/* Events List for Selected Date */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              Nu există acțiuni programate pentru această zi
            </p>
          </div>
        ) : (
          sortedEvents.map(event => (
            <div
              key={event.id}
              onClick={() => onEventClick(event)}
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: event.color }}
              />

              {/* Time Column */}
              <div className="text-center min-w-[60px]">
                <div className="text-lg font-bold text-gray-900">
                  {event.start.toLocaleTimeString('ro-RO', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="text-xs text-gray-500">
                  {event.start.toLocaleDateString('ro-RO', { weekday: 'short' })}
                </div>
              </div>

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
                <span className={`
                  inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${event.action.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                  ${event.action.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''}
                  ${event.action.status === 'planned' ? 'bg-gray-100 text-gray-800' : ''}
                  ${event.action.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {event.action.status === 'completed' && 'Completat'}
                  {event.action.status === 'in_progress' && 'În progres'}
                  {event.action.status === 'planned' && 'Planificat'}
                  {event.action.status === 'cancelled' && 'Anulat'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Event Card Component
const EventCard: React.FC<{
  event: CalendarEvent;
  onClick: () => void;
  compact?: boolean;
}> = ({ event, onClick, compact = false }) => {
  const isOverdue = event.start < new Date() && event.action.status !== 'completed';
  const ActionIcon = getActionIcon(event.action.type as ActionType);

  return (
    <div
      onClick={onClick}
      className={`
        p-2 rounded-md cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-sm
        ${compact ? 'text-xs' : 'text-sm'}
        ${isOverdue ? 'animate-pulse' : ''}
      `}
      style={{
        backgroundColor: event.color,
        color: 'white'
      }}
    >
      <div className="flex items-center space-x-1">
        {React.cloneElement(ActionIcon as React.ReactElement, {
          size: compact ? 12 : 14,
          className: "text-white flex-shrink-0"
        })}
        <span className="font-medium truncate">
          {event.action.type.replace('_', ' ')}
        </span>
        {isOverdue && <AlertTriangle className="w-3 h-3 text-white flex-shrink-0" />}
      </div>
      {!compact && (
        <div className="text-white/80 text-xs mt-1 truncate">
          {event.plotName}
        </div>
      )}
    </div>
  );
};

export default CalendarIndex;