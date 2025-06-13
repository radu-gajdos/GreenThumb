import { useState, useEffect, useMemo, useCallback } from 'react';
import { PlotApi } from '@/features/plots/api/plot.api';
import { ActionApi } from '@/features/actions/api/action.api';
import { Plot } from '@/features/plots/interfaces/plot';
import { Action } from '@/features/actions/interfaces/action';
import { CalendarEvent, CalendarFilters, CalendarStats, PlotOption, ActionTypeOption } from '../types/calendar';

export const useCalendarData = () => {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<CalendarFilters>({
    actionTypes: [],
    plotIds: [],
    statusTypes: [],
    showOverdue: true,
  });

  const plotApi = useMemo(() => new PlotApi(), []);
  const actionApi = useMemo(() => new ActionApi(), []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const fetchedPlots = await plotApi.findAll();
        setPlots(fetchedPlots);
      } catch (err) {
        console.error('Error loading calendar data:', err);
        setError('Nu s-au putut încărca datele pentru calendar');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [plotApi]);

  // Get action type color
  const getActionTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      planting: '#22c55e',     // green-500
      harvesting: '#eab308',   // yellow-500
      fertilizing: '#f59e0b',  // amber-500
      treatment: '#ef4444',    // red-500
      watering: '#3b82f6',     // blue-500
      soil_reading: '#a855f7', // purple-500
      maintenance: '#6b7280',  // gray-500
      pest_control: '#dc2626', // red-600
      pruning: '#059669',      // emerald-600
      weeding: '#16a34a',      // green-600
    };
    return colorMap[type] || '#6b7280';
  };

  // Process calendar events
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const events: CalendarEvent[] = [];
    
    plots.forEach(plot => {
      if (!plot.actions) return;
      
      plot.actions.forEach(action => {
        // Apply filters
        if (filters.actionTypes.length > 0 && !filters.actionTypes.includes(action.type)) {
          return;
        }
        
        if (filters.plotIds.length > 0 && !filters.plotIds.includes(plot.id)) {
          return;
        }
        
        if (filters.statusTypes.length > 0 && !filters.statusTypes.includes(action.status)) {
          return;
        }
        
        // Check if action has a date
        const actionDate = action.date;
        if (!actionDate) return;
        
        const isOverdue = new Date(actionDate) < new Date() && action.status !== 'completed';
        if (!filters.showOverdue && isOverdue) {
          return;
        }
        
        const color = getActionTypeColor(action.type);
        
        events.push({
          id: action.id,
          title: `${action.type.replace('_', ' ')} - ${plot.name}`,
          start: new Date(actionDate),
          allDay: true,
          color: isOverdue ? '#ef4444' : color,
          borderColor: isOverdue ? '#dc2626' : color,
          textColor: '#ffffff',
          action,
          plotName: plot.name,
          plotId: plot.id,
        });
      });
    });
    
    return events.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [plots, filters]);

  // Calculate stats
  const stats = useMemo<CalendarStats>(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayStart.getDate() + 1);

    let todayEvents = 0;
    let thisWeekEvents = 0;
    let overdueEvents = 0;
    let completedThisMonth = 0;

    calendarEvents.forEach(event => {
      const eventDate = event.start;
      
      // Today events
      if (eventDate >= todayStart && eventDate < todayEnd) {
        todayEvents++;
      }
      
      // This week events
      if (eventDate >= startOfWeek && eventDate <= endOfWeek) {
        thisWeekEvents++;
      }
      
      // Overdue events
      if (eventDate < now && event.action.status !== 'completed') {
        overdueEvents++;
      }
      
      // Completed this month
      if (event.action.status === 'completed' && 
          eventDate >= startOfMonth && eventDate <= endOfMonth) {
        completedThisMonth++;
      }
    });

    return {
      totalEvents: calendarEvents.length,
      todayEvents,
      thisWeekEvents,
      overdueEvents,
      completedThisMonth,
    };
  }, [calendarEvents]);

  // Get plot options for filters
  const plotOptions = useMemo<PlotOption[]>(() => {
    return plots.map((plot, index) => ({
      id: plot.id,
      name: plot.name,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`, // Golden ratio for nice colors
    }));
  }, [plots]);

  // Get action type options for filters
  const actionTypeOptions = useMemo<ActionTypeOption[]>(() => {
    const typeCount: Record<string, number> = {};
    
    plots.forEach(plot => {
      plot.actions?.forEach(action => {
        typeCount[action.type] = (typeCount[action.type] || 0) + 1;
      });
    });

    return Object.entries(typeCount).map(([type, count]) => ({
      type,
      label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      color: getActionTypeColor(type),
      count,
    })).sort((a, b) => b.count - a.count);
  }, [plots]);

  // Update action status
  const updateActionStatus = useCallback(async (actionId: string, status: 'completed' | 'cancelled' | 'in_progress' | 'planned') => {
    try {
      // Update via API
      await actionApi.updateStatus(actionId, status);
      
      // Update local state immediately for optimistic UI
      setPlots(prevPlots => 
        prevPlots.map(plot => ({
          ...plot,
          actions: plot.actions?.map(action => 
            action.id === actionId ? { ...action, status } : action
          ) || []
        }))
      );
      
    } catch (err) {
      console.error('Error updating action status:', err);
      // Revert optimistic update on error by refetching
      await refreshData();
      throw err;
    }
  }, [actionApi]);

  // Refresh data
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedPlots = await plotApi.findAll();
      setPlots(fetchedPlots);
      setError(null);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Nu s-au putut reîncărca datele');
    } finally {
      setLoading(false);
    }
  }, [plotApi]);

  return {
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
  };
};