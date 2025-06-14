import { CalendarEvent } from '../types/calendar';
import { Action } from '@/features/actions/interfaces/action';
import { Plot } from '@/features/plots/interfaces/plot';

const getActionColor = (type: string): string => {
    switch (type) {
      case 'planting':
        return '#22c55e' // green-500
      case 'harvesting':
        return '#eab308' // yellow-500
      case 'fertilizing':
        return '#f59e0b' // amber-500
      case 'treatment':
        return '#ef4444' // red-500
      case 'watering':
        return '#3b82f6' // blue-500
      case 'soil_reading':
        return '#a855f7' // purple-500
      default:
        return '#6b7280' // gray-500
    }
  }

export function transformActionToCalendarEvent(action: Action, plot: Plot): CalendarEvent {
  return {
    id: action.id,
    title: action.type,
    plotId: plot.id,
    plotName: plot.name,
    action,
    start: new Date(action.date),
    end: new Date(action.date),
    color: getActionColor(action.type) || '#3b82f6', // fallback la albastru
    allDay: true,
    borderColor: getActionColor(action.type) || '#3b82f6',
    textColor: '#ffffff',
  };
}
