import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useCalendarData } from '../hooks/useCalendarData';
import CalendarHeader from './CalendarHeader';
import CalendarFilters from './calendar/CalendarFilters';
import CalendarToolbar from '../components/calendar/CalendarToolbar';
import MonthView from '../components/calendar/MonthView';
import WeekView from '../components/calendar/WeekView';
import ListView from '../components/calendar/ListView';
import { CalendarEvent } from '../types/calendar';
import EventDetails from './EventDetails';

type ViewType = 'month' | 'week' | 'list';

const CalendarIndex: React.FC = () => {
  const { t } = useTranslation();

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

  const startOfWeek = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.getFullYear(), date.getMonth(), diff);
  };

  const endOfWeek = (date: Date) => {
    const start = startOfWeek(date);
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  };

  const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const addMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, 1);
  const addWeeks = (date: Date, weeks: number) => new Date(date.getFullYear(), date.getDate() + weeks * 7);
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const navigatePrevious = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, -1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, -1));
    else {
      const prev = new Date(selectedListDate);
      prev.setDate(prev.getDate() - 1);
      setSelectedListDate(prev);
    }
  };

  const navigateNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else {
      const next = new Date(selectedListDate);
      next.setDate(next.getDate() + 1);
      setSelectedListDate(next);
    }
  };

  const navigateToday = () => {
    if (view === 'list') setSelectedListDate(new Date());
    else setCurrentDate(new Date());
  };

  const getVisibleRange = () => {
    if (view === 'month') {
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));
      return { start, end };
    } else if (view === 'week') {
      return { start: startOfWeek(currentDate), end: endOfWeek(currentDate) };
    }
    return { start: selectedListDate, end: selectedListDate };
  };

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

  const generateWeekGrid = () => {
    const { start } = getVisibleRange();
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => isSameDay(event.start, date));
  };

  const formatDateTitle = () => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      const { start, end } = getVisibleRange();
      return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('ro-RO', {
        month: 'long',
        year: 'numeric',
      })}`;
    } else {
      const today = new Date();
      if (isSameDay(selectedListDate, today)) return t('calendarIndex.today');
      const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
      if (isSameDay(selectedListDate, yesterday)) return t('calendarIndex.yesterday');
      const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
      if (isSameDay(selectedListDate, tomorrow)) return t('calendarIndex.tomorrow');
      return selectedListDate.toLocaleDateString('ro-RO', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleStatusUpdate = async (
    actionId: string,
    status: 'completed' | 'cancelled' | 'in_progress' | 'planned'
  ) => {
    try {
      await updateActionStatus(actionId, status);
      await refreshData();
      setIsEventDialogOpen(false);
    } catch (err) {
      console.error('Failed to update action status:', err);
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('calendarIndex.errorFallbackTitle')}</h3>
        <p className="text-gray-500 max-w-md mb-4">{t('calendarIndex.errorFallbackDescription')}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary hover:bg-primary/80 text-white font-bold py-2 px-4 rounded"
        >
          {t('calendarIndex.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CalendarHeader stats={stats} />
      <CalendarFilters
        filters={filters}
        onFiltersChange={setFilters}
        plotOptions={plotOptions}
        actionTypeOptions={actionTypeOptions}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <CalendarToolbar
          view={view}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onNavigatePrevious={navigatePrevious}
          onNavigateNext={navigateNext}
          onNavigateToday={navigateToday}
          onViewChange={setView}
          title={formatDateTitle()}
        />

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

      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5" />
              <span>{t('calendarIndex.dialogActionDetails')}</span>
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

export default CalendarIndex;
